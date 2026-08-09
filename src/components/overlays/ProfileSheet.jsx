import { useEffect, useState } from "react";
import { Mail, Trophy, Grid3x3, Flame, LogOut, Award } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLang } from "../../context/LangContext";
import { supabase } from "../../lib/supabase";
import { getUserStats } from "../../lib/userStats";
import Sheet from "../ui/Sheet";
import GlassPanel from "../ui/GlassPanel";
import { ACHIEVEMENTS } from "../../lib/mockData";

export default function ProfileSheet({ onBack }) {
  const { user, signOut } = useAuth();
  const { t } = useLang();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ blocks: 0, loops: 0, streakDays: 0 });
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user) return;

      const [{ data: profileData }, statsData, { count: unlockedRes }] = await Promise.all([
        supabase.from("profiles").select("username, color, total_score").eq("id", user.id).maybeSingle(),
        getUserStats(user.id),
        supabase
          .from("achievements_progress")
          .select("achievement_id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("unlocked", true),
      ]);

      if (cancelled) return;
      setProfile(profileData);
      setStats(statsData);
      setUnlockedCount(unlockedRes || 0);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
  }

  return (
    <Sheet
      title={t("profile_title")}
      onBack={onBack}
      footer={
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full h-[46px] rounded-[14px] flex items-center justify-center gap-2 bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" strokeWidth={2.2} />
          <span className="text-[14px] font-semibold">{signingOut ? t("logging_out") : t("logout")}</span>
        </button>
      }
    >
      <div className="flex flex-col items-center py-4">
        <div
          className="w-20 h-20 rounded-full border-4 border-white/10 flex items-center justify-center text-white text-2xl font-bold mb-3"
          style={{ backgroundColor: profile?.color || "#2b5569" }}
        >
          {(profile?.username || user?.email || "?").charAt(0).toUpperCase()}
        </div>
        <h2 className="text-white text-[18px] font-semibold">
          {loading ? "..." : profile?.username || "—"}
        </h2>
        <div className="flex items-center gap-1.5 text-gray-400 text-[12.5px] mt-1">
          <Mail className="w-3.5 h-3.5" strokeWidth={2} />
          <span>{user?.email}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatCard icon={Trophy} label={t("score_label")} value={loading ? "…" : Math.floor(profile?.total_score || 0)} />
        <StatCard icon={Grid3x3} label={t("blocks_label")} value={loading ? "…" : stats.blocks} />
        <StatCard icon={Flame} label={t("streak_label")} value={loading ? "…" : stats.streakDays} />
        <StatCard
          icon={Award}
          label={t("achievements_label")}
          value={loading ? "…" : `${unlockedCount}/${ACHIEVEMENTS.length}`}
        />
      </div>

      <GlassPanel className="rounded-[16px] p-4">
        <h3 className="text-white text-[14px] font-semibold mb-3 flex items-center gap-2">
          <Award className="w-4 h-4" strokeWidth={2.2} />
          {t("achievements_label")}
        </h3>
        <div className="flex flex-col gap-2">
          {ACHIEVEMENTS.slice(0, 3).map((a) => (
            <div key={a.id} className="flex items-center justify-between bg-white/5 rounded-[10px] px-3 py-2">
              <div>
                <p className="text-gray-200 text-[12.5px] font-medium">{a.title}</p>
                <p className="text-gray-400 text-[11px]">{a.description}</p>
              </div>
              <span className="text-emerald-300 text-[11px] font-semibold shrink-0 ml-2">
                +{a.reward.toLocaleString("ru-RU")}
              </span>
            </div>
          ))}
        </div>
        <p className="text-gray-500 text-[11px] mt-3 text-center">{t("full_achievements_hint")}</p>
      </GlassPanel>
    </Sheet>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <GlassPanel className="rounded-[14px] p-3 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-gray-400">
        <Icon className="w-3.5 h-3.5" strokeWidth={2.2} />
        <span className="text-[11px]">{label}</span>
      </div>
      <span className="text-white text-[20px] font-bold">{value}</span>
    </GlassPanel>
  );
}
