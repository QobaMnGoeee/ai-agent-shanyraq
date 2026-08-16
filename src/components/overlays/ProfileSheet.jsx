import { useEffect, useState } from "react";
import { Mail, Trophy, Grid3x3, Flame, LogOut, Award, Star, Pencil } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLang } from "../../context/LangContext";
import { supabase } from "../../lib/supabase";
import { getUserStats } from "../../lib/userStats";
import { getLeagueForScore } from "../../lib/mainMenuData";
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

  const score = Math.floor(profile?.total_score || 0);
  const league = getLeagueForScore(score);
  const level = Math.floor(score / 1000) + 1;

  return (
    <Sheet
      title={t("profile_title")}
      onBack={onBack}
      footer={
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full h-[48px] rounded-2xl flex items-center justify-center gap-2 bg-coral-50 border-2 border-coral-200 text-coral-600 font-bold hover:bg-coral-100 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" strokeWidth={2.2} />
          <span className="text-[14px] font-bold">{signingOut ? t("logging_out") : t("logout")}</span>
        </button>
      }
    >
      <div className="flex flex-col items-center py-4">
        <div
          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center text-white text-2xl font-extrabold mb-3 relative shadow-card"
          style={{ backgroundColor: profile?.color || "#22b25c" }}
        >
          {(profile?.username || user?.email || "?").charAt(0).toUpperCase()}
          <div
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-2 border-white flex items-center justify-center"
            style={{ backgroundColor: league.color }}
          >
            <Star className="w-3.5 h-3.5 text-white" strokeWidth={2.5} fill="white" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <h2 className="start-text text-ink-800 text-[18px] font-bold">
            {loading ? "..." : profile?.username || "—"}
          </h2>
          <span
            className="text-[10px] font-extrabold text-ink-900 px-2 py-0.5 rounded-full"
            style={{ backgroundColor: league.color }}
          >
            Уровень {level}
          </span>
        </div>
        <p className="text-ink-400 text-[12px] font-semibold mt-1">{league.name} лига</p>
        <div className="flex items-center gap-1.5 text-ink-400 text-[12.5px] font-medium mt-2">
          <Mail className="w-3.5 h-3.5" strokeWidth={2} />
          <span>{user?.email}</span>
        </div>

        {/* Описание профиля */}
        <div className="w-full mt-3">
          <button className="w-full flex items-center gap-2 justify-center text-ink-300 text-[11.5px] font-semibold hover:text-leaf-600 transition-colors">
            <Pencil className="w-3 h-3" strokeWidth={2.2} />
            <span>Добавить описание профиля</span>
          </button>
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

      <GlassPanel className="rounded-2xl p-4">
        <h3 className="start-text text-ink-800 text-[14px] font-bold mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-sun-500" strokeWidth={2.2} />
          {t("achievements_label")}
        </h3>
        <div className="flex flex-col gap-2">
          {ACHIEVEMENTS.slice(0, 3).map((a) => (
            <div key={a.id} className="flex items-center justify-between bg-cream-100 rounded-xl px-3 py-2">
              <div>
                <p className="text-ink-700 text-[12.5px] font-bold">{a.title}</p>
                <p className="text-ink-400 text-[11px] font-medium">{a.description}</p>
              </div>
              <span className="text-leaf-600 text-[11px] font-extrabold shrink-0 ml-2">
                +{a.reward.toLocaleString("ru-RU")}
              </span>
            </div>
          ))}
        </div>
        <p className="text-ink-300 text-[11px] font-medium mt-3 text-center">{t("full_achievements_hint")}</p>
      </GlassPanel>
    </Sheet>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <GlassPanel className="rounded-2xl p-3 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-ink-400">
        <Icon className="w-3.5 h-3.5" strokeWidth={2.2} />
        <span className="text-[11px] font-bold">{label}</span>
      </div>
      <span className="text-ink-800 text-[20px] font-extrabold">{value}</span>
    </GlassPanel>
  );
}
