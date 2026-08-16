import { useEffect, useState } from "react";
import { Award, Lock, Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLang } from "../../context/LangContext";
import { supabase } from "../../lib/supabase";
import { getUserStats } from "../../lib/userStats";
import { ACHIEVEMENTS } from "../../lib/mockData";
import Sheet from "../ui/Sheet";
import GlassPanel from "../ui/GlassPanel";
import { TrophyIllustration } from "../illustrations";

export default function AchievementsSheet({ onBack }) {
  const { user } = useAuth();
  const { t } = useLang();
  const [progress, setProgress] = useState({
    blocks: 0,
    loops: 0,
    distance_km: 0,
    rank: null,
    streak_days: 0,
  });
  const [unlockedIds, setUnlockedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user) return;

      const [stats, { data: unlockedRows }] = await Promise.all([
        getUserStats(user.id),
        supabase
          .from("achievements_progress")
          .select("achievement_id")
          .eq("user_id", user.id)
          .eq("unlocked", true),
      ]);

      if (cancelled) return;

      setProgress({
        blocks: stats.blocks,
        loops: stats.loops,
        distance_km: stats.distanceKm,
        rank: stats.rank,
        streak_days: stats.streakDays,
      });
      setUnlockedIds(new Set((unlockedRows || []).map((r) => r.achievement_id)));
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const unlockedCount = ACHIEVEMENTS.filter((a) => unlockedIds.has(a.id)).length;

  return (
    <Sheet title={t("achievements_title")} onBack={onBack}>
      <div className="flex justify-center mb-1 -mt-1">
        <TrophyIllustration className="w-28 h-auto" />
      </div>

      <GlassPanel className="rounded-2xl p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Award className="w-5 h-5 text-sun-500" strokeWidth={2.2} />
          <span className="text-ink-800 text-[14px] font-bold">{t("progress_label")}</span>
        </div>
        <span className="text-ink-500 text-[13px] font-extrabold">
          {loading ? "…" : `${unlockedCount} / ${ACHIEVEMENTS.length}`}
        </span>
      </GlassPanel>

      <div className="flex flex-col gap-2.5">
        {ACHIEVEMENTS.map((a) => (
          <AchievementCard
            key={a.id}
            achievement={a}
            unlocked={unlockedIds.has(a.id)}
            progressPct={loading ? 0 : getProgressPct(a, progress)}
          />
        ))}
      </div>
    </Sheet>
  );
}

function getProgressPct(achievement, progress) {
  const value = progress[achievement.metric] || 0;
  if (achievement.metric === "rank") return 0;
  return Math.min(100, Math.round((value / achievement.threshold) * 100));
}

function AchievementCard({ achievement, unlocked, progressPct }) {
  return (
    <GlassPanel className={`rounded-2xl p-3.5 ${unlocked ? "" : "opacity-80"}`}>
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
            unlocked ? "bg-sun-100 border-2 border-sun-300" : "bg-cream-100 border-2 border-ink-100"
          }`}
        >
          {unlocked ? (
            <Check className="w-5 h-5 text-sun-600" strokeWidth={2.4} />
          ) : (
            <Lock className="w-4 h-4 text-ink-300" strokeWidth={2.2} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-ink-800 text-[13.5px] font-bold truncate">{achievement.title}</p>
            <span
              className={`text-[11px] font-extrabold shrink-0 ${
                unlocked ? "text-leaf-600" : "text-ink-300"
              }`}
            >
              +{achievement.reward.toLocaleString("ru-RU")}
            </span>
          </div>
          <p className="text-ink-400 text-[11.5px] font-medium mt-0.5 leading-snug">{achievement.description}</p>

          {!unlocked && achievement.metric !== "rank" && (
            <div className="mt-2 h-1.5 rounded-full bg-ink-100 overflow-hidden">
              <div
                className="h-full bg-sun-400 rounded-full transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </GlassPanel>
  );
}
