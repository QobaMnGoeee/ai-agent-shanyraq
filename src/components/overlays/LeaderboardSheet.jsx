import { useEffect, useMemo, useState } from "react";
import { Trophy, Grid3x3, Medal, RotateCcw } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useLang } from "../../context/LangContext";
import Sheet from "../ui/Sheet";
import GlassPanel from "../ui/GlassPanel";
import { TrophyIllustration, EmptyStateIllustration } from "../illustrations";

export default function LeaderboardSheet({ onBack }) {
  const { t } = useLang();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);

      // leaderboard_view — тек visible_in_leaderboard=true профильдерді қайтарады
      const { data: profilesData, error: profilesError } = await supabase
        .from("leaderboard_view")
        .select("id, username, color, total_score")
        .limit(50);

      if (cancelled) return;

      if (profilesError) {
        setError(t("load_error"));
        setLoading(false);
        return;
      }

      // Әр ойыншының блок санын паралель сұрау
      const withBlocks = await Promise.all(
        (profilesData || []).map(async (p, i) => {
          const { count } = await supabase
            .from("territories")
            .select("id", { count: "exact", head: true })
            .eq("controller_id", p.id);
          return {
            id: p.id,
            rank: i + 1,
            username: p.username,
            color: p.color,
            score: Math.floor(p.total_score || 0),
            blocks: count || 0,
          };
        })
      );

      if (!cancelled) {
        setPlayers(withBlocks);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const totals = useMemo(
    () => ({
      totalPlayers: players.length,
      totalBlocks: players.reduce((s, p) => s + p.blocks, 0),
    }),
    [players]
  );

  return (
    <Sheet title={t("leaderboard_title")} onBack={onBack}>
      <div className="flex justify-center mb-1 -mt-1">
        <TrophyIllustration className="w-28 h-auto" />
      </div>

      <div className="flex items-center gap-2 bg-cream-100 rounded-2xl px-3 py-2 mb-3">
        <RotateCcw className="w-3.5 h-3.5 text-ink-300 shrink-0" strokeWidth={2.2} />
        <p className="text-ink-400 text-[11px] font-semibold">{t("leaderboard_update_note")}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <GlassPanel className="rounded-2xl p-3 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-ink-400">
            <Trophy className="w-3.5 h-3.5" strokeWidth={2.2} />
            <span className="text-[11px] font-bold">{t("players_in_top")}</span>
          </div>
          <span className="text-ink-800 text-[20px] font-extrabold">{loading ? "…" : totals.totalPlayers}</span>
        </GlassPanel>
        <GlassPanel className="rounded-2xl p-3 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-ink-400">
            <Grid3x3 className="w-3.5 h-3.5" strokeWidth={2.2} />
            <span className="text-[11px] font-bold">{t("blocks_captured_total")}</span>
          </div>
          <span className="text-ink-800 text-[20px] font-extrabold">
            {loading ? "…" : totals.totalBlocks.toLocaleString("ru-RU")}
          </span>
        </GlassPanel>
      </div>

      {error && (
        <div className="bg-coral-50 border-2 border-coral-200 rounded-2xl px-3 py-2 mb-3">
          <p className="text-coral-600 text-[12px] font-semibold">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[62px] rounded-2xl bg-cream-100 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && !error && players.length === 0 && (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <EmptyStateIllustration className="w-40 h-auto mb-3" />
          <p className="text-ink-700 text-[14px] font-bold">{t("leaderboard_empty_title")}</p>
          <p className="text-ink-400 text-[12px] font-medium mt-1 max-w-[220px]">{t("leaderboard_empty_subtitle")}</p>
        </div>
      )}

      {!loading && players.length > 0 && (
        <div className="flex flex-col gap-2">
          {players.map((p) => (
            <PlayerRow key={p.id} player={p} t={t} />
          ))}
        </div>
      )}
    </Sheet>
  );
}

function PlayerRow({ player, t }) {
  const isTopThree = player.rank <= 3;
  const medalColor = player.rank === 1 ? "#ffbe1f" : player.rank === 2 ? "#c7d1cb" : "#e2810a";

  return (
    <GlassPanel className="rounded-2xl p-3 flex items-center gap-3">
      <div className="w-8 flex items-center justify-center shrink-0">
        {isTopThree ? (
          <Medal className="w-5 h-5" style={{ color: medalColor }} strokeWidth={2} />
        ) : (
          <span className="text-ink-400 text-[13px] font-bold">{player.rank}</span>
        )}
      </div>

      <div
        className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white text-[13px] font-extrabold shrink-0 shadow-card"
        style={{ backgroundColor: player.color || "#22b25c" }}
      >
        {(player.username || "?").charAt(0).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-ink-800 text-[13.5px] font-bold truncate">{player.username}</p>
        <p className="text-ink-400 text-[11px] font-semibold">
          {player.blocks} {t("blocks_suffix")}
        </p>
      </div>

      <div className="text-right shrink-0">
        <p className="text-leaf-600 text-[14px] font-extrabold">{player.score.toLocaleString("ru-RU")}</p>
        <p className="text-ink-300 text-[10px] font-semibold">{t("points_suffix")}</p>
      </div>
    </GlassPanel>
  );
}
