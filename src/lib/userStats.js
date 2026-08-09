import { supabase } from "./supabase";

/**
 * Пайдаланушының нақты статистикасын жинайды:
 * - blocks: жаулап алған grid ұяшық саны
 * - loops: сәтті "Замкнуть петлю" саны (capture_events кестесінен)
 * - distanceKm: жүрген жалпы қашықтық
 * - streakDays: қатарынан ойнаған күн саны
 * - rank: leaderboard-тағы орны
 */
export async function getUserStats(userId) {
  if (!userId) {
    return { blocks: 0, loops: 0, distanceKm: 0, streakDays: 0, rank: null };
  }

  const [blocksRes, eventsRes, rankRes] = await Promise.all([
    supabase
      .from("territories")
      .select("id", { count: "exact", head: true })
      .eq("controller_id", userId),
    supabase
      .from("capture_events")
      .select("captured_at, distance_km")
      .eq("user_id", userId)
      .order("captured_at", { ascending: false }),
    supabase.rpc("get_user_rank", { target_user_id: userId }),
  ]);

  const blocks = blocksRes.count || 0;
  const events = eventsRes.data || [];
  const loops = events.length;
  const distanceKm = events.reduce((sum, e) => sum + (e.distance_km || 0), 0);
  const streakDays = calculateStreak(events.map((e) => e.captured_at));
  const rank = rankRes.data ?? null;

  return { blocks, loops, distanceKm, streakDays, rank };
}

/**
 * Күндер тізбегінен (ISO timestamp) қатарынан ойналған күн санын есептейді.
 */
function calculateStreak(timestamps) {
  if (timestamps.length === 0) return 0;

  const days = [...new Set(timestamps.map((t) => t.slice(0, 10)))].sort().reverse();

  let streak = 1;
  let cursor = new Date(days[0]);

  for (let i = 1; i < days.length; i++) {
    const prevDay = new Date(cursor);
    prevDay.setDate(prevDay.getDate() - 1);
    const prevDayStr = prevDay.toISOString().slice(0, 10);

    if (days[i] === prevDayStr) {
      streak++;
      cursor = prevDay;
    } else {
      break;
    }
  }

  // Соңғы жазба бүгін немесе кеше болмаса — streak үзілген
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (days[0] !== today && days[0] !== yesterday) return 0;

  return streak;
}
