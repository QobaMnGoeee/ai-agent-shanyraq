import { useEffect, useState } from "react";
import {
  Sun,
  Moon,
  Globe,
  UserCog,
  ShieldCheck,
  ChevronRight,
  Check,
  Mail,
  Lock,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useLang, LANGUAGES } from "../../context/LangContext";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import Sheet from "../ui/Sheet";
import GlassPanel from "../ui/GlassPanel";
import Input3D from "../ui/Input3D";
import Btn3D from "../ui/Btn3D";

const SECTIONS = {
  MAIN: "main",
  ACCOUNT: "account",
  PRIVACY: "privacy",
};

export default function SettingsSheet({ onBack }) {
  const [section, setSection] = useState(SECTIONS.MAIN);

  if (section === SECTIONS.ACCOUNT) {
    return <AccountSection onBack={() => setSection(SECTIONS.MAIN)} />;
  }
  if (section === SECTIONS.PRIVACY) {
    return <PrivacySection onBack={() => setSection(SECTIONS.MAIN)} />;
  }

  return <MainSection onBack={onBack} onNavigate={setSection} />;
}

/* ===================== ГЛАВНАЯ СЕКЦИЯ ===================== */

function MainSection({ onBack, onNavigate }) {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLang();
  const [langOpen, setLangOpen] = useState(false);

  const currentLangLabel = LANGUAGES.find((l) => l.code === lang)?.label || "Русский";

  return (
    <Sheet title={t("settings_title")} onBack={onBack}>
      <div className="flex flex-col gap-3">
        {/* Тема */}
        <GlassPanel className="rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {theme === "dark" ? (
                <Moon className="w-4 h-4 text-ink-500" strokeWidth={2.2} />
              ) : (
                <Sun className="w-4 h-4 text-sun-500" strokeWidth={2.2} />
              )}
              <span className="text-ink-800 text-[14px] font-bold">{t("theme_label")}</span>
            </div>
            <ThemeSwitch checked={theme === "dark"} onChange={toggleTheme} />
          </div>
        </GlassPanel>

        {/* Язык */}
        <GlassPanel className="rounded-2xl p-4">
          <button className="w-full flex items-center justify-between" onClick={() => setLangOpen((o) => !o)}>
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-sky2-500" strokeWidth={2.2} />
              <span className="text-ink-800 text-[14px] font-bold">{t("language_label")}</span>
            </div>
            <div className="flex items-center gap-1.5 text-ink-400">
              <span className="text-[13px] font-semibold">{currentLangLabel}</span>
              <ChevronRight
                className={`w-4 h-4 transition-transform ${langOpen ? "rotate-90" : ""}`}
                strokeWidth={2.2}
              />
            </div>
          </button>

          {langOpen && (
            <div className="mt-3 pt-3 border-t-2 border-ink-100 flex flex-col gap-1">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLang(l.code);
                    setLangOpen(false);
                  }}
                  className="flex items-center justify-between px-2 py-2 rounded-xl hover:bg-cream-100 transition-colors"
                >
                  <span
                    className={`text-[13.5px] ${
                      lang === l.code ? "text-ink-800 font-bold" : "text-ink-400 font-medium"
                    }`}
                  >
                    {l.label}
                  </span>
                  {lang === l.code && <Check className="w-4 h-4 text-leaf-500" strokeWidth={2.4} />}
                </button>
              ))}
            </div>
          )}
        </GlassPanel>

        <SettingsRow
          icon={UserCog}
          label={t("account_label")}
          sublabel={t("account_sublabel")}
          onClick={() => onNavigate(SECTIONS.ACCOUNT)}
        />

        <SettingsRow
          icon={ShieldCheck}
          label={t("privacy_label")}
          sublabel={t("privacy_sublabel")}
          onClick={() => onNavigate(SECTIONS.PRIVACY)}
        />
      </div>
    </Sheet>
  );
}

function SettingsRow({ icon: Icon, label, sublabel, onClick }) {
  return (
    <button onClick={onClick} className="w-full">
      <GlassPanel className="rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Icon className="w-4 h-4 text-leaf-500" strokeWidth={2.2} />
          <div className="text-left">
            <p className="text-ink-800 text-[14px] font-bold">{label}</p>
            {sublabel && <p className="text-ink-400 text-[11px] font-semibold">{sublabel}</p>}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-ink-300" strokeWidth={2.2} />
      </GlassPanel>
    </button>
  );
}

function ThemeSwitch({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${
        checked ? "bg-leaf-500" : "bg-ink-100"
      }`}
    >
      <span
        className={`w-5 h-5 rounded-full bg-white shadow-card transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

/* ===================== АККАУНТ ===================== */

function AccountSection({ onBack }) {
  const { user } = useAuth();
  const { t } = useLang();
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleEmailUpdate() {
    setMessage(null);
    if (!email.trim() || email === user?.email) return;
    setSavingEmail(true);
    const { error } = await supabase.auth.updateUser({ email: email.trim() });
    setSavingEmail(false);
    setMessage(
      error
        ? { type: "error", text: t("email_update_error") }
        : { type: "success", text: t("email_update_success") }
    );
  }

  async function handlePasswordUpdate() {
    setMessage(null);

    if (!currentPassword) {
      setMessage({ type: "error", text: t("current_password_required") });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: t("password_too_short") });
      return;
    }

    setSavingPassword(true);

    // Алдымен ағымдағы парольді растау — қайта авторизация арқылы
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (verifyError) {
      setSavingPassword(false);
      setMessage({ type: "error", text: t("current_password_incorrect") });
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);

    if (error) {
      setMessage({ type: "error", text: t("password_update_error") });
    } else {
      setMessage({ type: "success", text: t("password_update_success") });
      setCurrentPassword("");
      setNewPassword("");
    }
  }

  return (
    <Sheet title={t("account_title")} onBack={onBack}>
      <div className="flex flex-col gap-4">
        <GlassPanel className="rounded-2xl p-4">
          <h3 className="start-text text-ink-800 text-[13.5px] font-bold mb-3">{t("email")}</h3>
          <div className="flex flex-col gap-2.5">
            <Input3D icon={Mail} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Btn3D onClick={handleEmailUpdate} loading={savingEmail} className="h-[44px] rounded-xl">
              <span className="text-[13px] font-bold">{t("save_email")}</span>
            </Btn3D>
          </div>
        </GlassPanel>

        <GlassPanel className="rounded-2xl p-4">
          <h3 className="start-text text-ink-800 text-[13.5px] font-bold mb-3">{t("change_password")}</h3>
          <div className="flex flex-col gap-2.5">
            <Input3D
              icon={Lock}
              type="password"
              placeholder={t("current_password")}
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Input3D
              icon={Lock}
              type="password"
              placeholder={t("new_password")}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Btn3D onClick={handlePasswordUpdate} loading={savingPassword} className="h-[44px] rounded-xl">
              <span className="text-[13px] font-bold">{t("change_password")}</span>
            </Btn3D>
          </div>
        </GlassPanel>

        {message && (
          <div
            className={`rounded-2xl px-3 py-2 border-2 ${
              message.type === "error"
                ? "bg-coral-50 border-coral-200 text-coral-600"
                : "bg-leaf-50 border-leaf-200 text-leaf-700"
            }`}
          >
            <p className="text-[12px] font-semibold">{message.text}</p>
          </div>
        )}
      </div>
    </Sheet>
  );
}

/* ===================== ПРИВАТНОСТЬ ===================== */

function PrivacySection({ onBack }) {
  const { user } = useAuth();
  const { t } = useLang();
  const [prefs, setPrefs] = useState({
    visible_in_leaderboard: true,
    visible_username: true,
    visible_on_map: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    supabase
      .from("profiles")
      .select("visible_in_leaderboard, visible_username, visible_on_map")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled || !data) return;
        setPrefs({
          visible_in_leaderboard: data.visible_in_leaderboard ?? true,
          visible_username: data.visible_username ?? true,
          visible_on_map: data.visible_on_map ?? true,
        });
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function updatePref(key, value) {
    setPrefs((p) => ({ ...p, [key]: value }));
    setSaving(true);
    await supabase.from("profiles").update({ [key]: value }).eq("id", user.id);
    setSaving(false);
  }

  return (
    <Sheet title={t("privacy_title")} onBack={onBack}>
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[68px] rounded-2xl bg-cream-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <PrivacyToggle
              label={t("show_in_leaderboard")}
              sublabel={t("show_in_leaderboard_hint")}
              checked={prefs.visible_in_leaderboard}
              onChange={() => updatePref("visible_in_leaderboard", !prefs.visible_in_leaderboard)}
            />
            <PrivacyToggle
              label={t("show_username")}
              sublabel={t("show_username_hint")}
              checked={prefs.visible_username}
              onChange={() => updatePref("visible_username", !prefs.visible_username)}
            />
            <PrivacyToggle
              label={t("show_on_map")}
              sublabel={t("show_on_map_hint")}
              checked={prefs.visible_on_map}
              onChange={() => updatePref("visible_on_map", !prefs.visible_on_map)}
            />
          </>
        )}
      </div>
    </Sheet>
  );
}

function PrivacyToggle({ label, sublabel, checked, onChange }) {
  return (
    <GlassPanel className="rounded-2xl p-4 flex items-center justify-between gap-3">
      <div>
        <p className="text-ink-800 text-[14px] font-bold">{label}</p>
        <p className="text-ink-400 text-[11px] font-medium mt-0.5 leading-snug">{sublabel}</p>
      </div>
      <ThemeSwitch checked={checked} onChange={onChange} />
    </GlassPanel>
  );
}
