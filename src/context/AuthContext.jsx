import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = әлі жүктелмеді
  const [hasProfile, setHasProfile] = useState(undefined); // undefined = әлі тексерілмеді
  const [loading, setLoading] = useState(true);

  const checkProfile = useCallback(async (userId) => {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();
    setHasProfile(Boolean(data));
    setLoading(false);
    return Boolean(data);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        checkProfile(session.user.id);
      } else {
        setHasProfile(false);
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        checkProfile(session.user.id);
      } else {
        setHasProfile(false);
        setLoading(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [checkProfile]);

  // Профиль жаңа жасалған соң (мыс. Onboarding-та) hasProfile-ды дереу
  // қайта тексеру үшін — routing race condition-ды болдырмайды
  const refreshProfile = useCallback(() => {
    if (session?.user) return checkProfile(session.user.id);
    return Promise.resolve(false);
  }, [session, checkProfile]);

  const value = {
    session,
    user: session?.user ?? null,
    hasProfile,
    loading,
    refreshProfile,
    signOut: () => supabase.auth.signOut(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth AuthProvider ішінде қолданылуы керек");
  return ctx;
}
