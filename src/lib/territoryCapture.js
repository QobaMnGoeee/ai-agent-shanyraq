import { supabase } from "./supabase";
import { GRID_SIZE } from "./useGeolocation";

// Минималды жарамды territory ауданы — шамамен 2x2 grid ұяшық (~60x60м)
const MIN_AREA_M2 = (GRID_SIZE * 2 * 111320) ** 2;

/**
 * Полигон ауданын шамамен есептейді (shoelace формула, градус бірлігінде,
 * содан кейін метрге түрлендіріледі).
 */
function polygonAreaM2(pathPoints) {
  let area = 0;
  for (let i = 0, j = pathPoints.length - 1; i < pathPoints.length; j = i++) {
    area += pathPoints[j].lat * pathPoints[i].lng;
    area -= pathPoints[i].lat * pathPoints[j].lng;
  }
  area = Math.abs(area / 2);
  // градус² -> метр² (жуық, экватор маңында 1° ≈ 111320м)
  return area * 111320 * 111320;
}

/**
 * Path нүктелерінен тұйықталған полигон ішіндегі барлық grid ұяшықтарын табады
 * (нүктелердегі "iнin polygon" тексеруі — ray casting алгоритмі).
 */
function getCellsInsidePolygon(pathPoints) {
  if (pathPoints.length < 3) return [];

  const lats = pathPoints.map((p) => p.lat);
  const lngs = pathPoints.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const cells = [];

  for (let lat = minLat; lat <= maxLat; lat += GRID_SIZE) {
    for (let lng = minLng; lng <= maxLng; lng += GRID_SIZE) {
      if (isPointInPolygon(lat, lng, pathPoints)) {
        cells.push({
          grid_lat: Math.round(lat / GRID_SIZE) * GRID_SIZE,
          grid_lng: Math.round(lng / GRID_SIZE) * GRID_SIZE,
        });
      }
    }
  }

  return cells;
}

// Ray casting алгоритмі — нүкте полигон ішінде ме, соны тексереді
function isPointInPolygon(lat, lng, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat,
      yi = polygon[i].lng;
    const xj = polygon[j].lat,
      yj = polygon[j].lng;

    const intersect =
      yi > lng !== yj > lng &&
      lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Path ұзындығын шамамен есептейді (Haversine формула, километрмен).
 */
function calculatePathDistanceKm(pathPoints) {
  let total = 0;
  for (let i = 1; i < pathPoints.length; i++) {
    total += haversineKm(pathPoints[i - 1], pathPoints[i]);
  }
  return total;
}

function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/**
 * "Замкнуть петлю" — path-ты жабады, ішіндегі grid ұяшықтарын
 * есептеп, Supabase-тегі territories кестесіне жазады,
 * сонымен қатар capture_events-ке statistics/achievements үшін жазба қосады.
 *
 * Қайтарады: { success, capturedCount, error }
 */
export async function captureLoop(pathPoints, userId) {
  if (!userId) return { success: false, capturedCount: 0, error: "Не авторизован" };
  if (pathPoints.length < 3) {
    return { success: false, capturedCount: 0, error: "Слишком короткий маршрут" };
  }

  const area = polygonAreaM2(pathPoints);
  if (area < MIN_AREA_M2) {
    return {
      success: false,
      capturedCount: 0,
      error: "Маршрут слишком мал. Обойдите большую территорию (минимум ~60×60м)",
    };
  }

  const cells = getCellsInsidePolygon(pathPoints);
  const allCells = dedupeCells(cells);

  if (allCells.length === 0) {
    return {
      success: false,
      capturedCount: 0,
      error: "Маршрут слишком мал — обойдите большую территорию",
    };
  }

  const rows = allCells.map((c) => ({
    grid_lat: c.grid_lat,
    grid_lng: c.grid_lng,
    controller_id: userId,
    captured_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("territories")
    .upsert(rows, { onConflict: "grid_lat,grid_lng" });

  if (error) {
    return { success: false, capturedCount: 0, error: error.message };
  }

  // Statistics/achievements үшін capture_events жазбасы
  const distanceKm = calculatePathDistanceKm(pathPoints);
  await supabase.from("capture_events").insert({
    user_id: userId,
    blocks_captured: allCells.length,
    distance_km: Number(distanceKm.toFixed(3)),
  });

  return { success: true, capturedCount: allCells.length, error: null };
}

function dedupeCells(cells) {
  const seen = new Set();
  const result = [];
  for (const c of cells) {
    const key = `${c.grid_lat.toFixed(6)},${c.grid_lng.toFixed(6)}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(c);
    }
  }
  return result;
}

/**
 * Пайдаланушының жаулап алған блок санын алады.
 */
export async function getBlocksCaptured(userId) {
  if (!userId) return 0;
  const { count, error } = await supabase
    .from("territories")
    .select("id", { count: "exact", head: true })
    .eq("controller_id", userId);
  if (error) return 0;
  return count || 0;
}
