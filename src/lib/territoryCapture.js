import { supabase } from "./supabase";

// Минималды жарамды territory ауданы — шамамен 30x30м (900м²)
const MIN_AREA_M2 = 900;

/**
 * Полигон ауданын шамамен есептейді (shoelace формула, градус бірлігінде,
 * содан кейін метрге түрлендіріледі). Жердің қисықтығын ескеру үшін
 * lng осін орташа lat-тың косинусына масштабтаймыз (эквиректангулярлы жуықтау).
 */
function polygonAreaM2(pathPoints) {
  if (pathPoints.length < 3) return 0;

  const avgLat =
    pathPoints.reduce((sum, p) => sum + p.lat, 0) / pathPoints.length;
  const latScale = 111320; // 1° lat ≈ 111.32км
  const lngScale = 111320 * Math.cos((avgLat * Math.PI) / 180);

  let area = 0;
  for (let i = 0, j = pathPoints.length - 1; i < pathPoints.length; j = i++) {
    const xi = pathPoints[i].lng * lngScale;
    const yi = pathPoints[i].lat * latScale;
    const xj = pathPoints[j].lng * lngScale;
    const yj = pathPoints[j].lat * latScale;
    area += xj * yi - xi * yj;
  }
  return Math.abs(area / 2);
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
 * Path нүктелерін жеңілдетеді (қарапайым ара-қашықтық сүзгісі) —
 * GPS "дірілінен" пайда болатын майда тісшелерді алып тастап,
 * тегіс полигон алу үшін.
 */
function simplifyPath(pathPoints, minDistM = 3) {
  if (pathPoints.length <= 2) return pathPoints;
  const result = [pathPoints[0]];
  for (let i = 1; i < pathPoints.length; i++) {
    const last = result[result.length - 1];
    const distKm = haversineKm(last, pathPoints[i]);
    if (distKm * 1000 >= minDistM) {
      result.push(pathPoints[i]);
    }
  }
  return result;
}

/**
 * "Замкнуть петлю" — path-ты жабады, НАҚТЫ жүрген маршрутты
 * (grid-ке айналдырмай) полигон ретінде Supabase-тегі territories
 * кестесіне жазады. Карта осы полигонды дәл сол пішінде салады —
 * INTVL-дегідей органикалық territory формасы шығады.
 *
 * Қайтарады: { success, capturedCount, error }
 * capturedCount — көрнекілік үшін captured аудан (м²/100 ≈ ұпай саны)
 */
export async function captureLoop(pathPoints, userId) {
  if (!userId) return { success: false, capturedCount: 0, error: "Не авторизован" };
  if (pathPoints.length < 3) {
    return { success: false, capturedCount: 0, error: "Слишком короткий маршрут" };
  }

  const simplified = simplifyPath(pathPoints);
  if (simplified.length < 3) {
    return { success: false, capturedCount: 0, error: "Слишком короткий маршрут" };
  }

  const area = polygonAreaM2(simplified);
  if (area < MIN_AREA_M2) {
    return {
      success: false,
      capturedCount: 0,
      error: "Маршрут слишком мал. Обойдите большую территорию (минимум ~30×30м)",
    };
  }

  // Полигонды жабамыз (соңғы нүкте біріншісімен сәйкес болуы керек)
  const closedPolygon = [...simplified];
  const first = closedPolygon[0];
  const last = closedPolygon[closedPolygon.length - 1];
  if (first.lat !== last.lat || first.lng !== last.lng) {
    closedPolygon.push({ lat: first.lat, lng: first.lng });
  }

  const { error } = await supabase.from("territories").insert({
    controller_id: userId,
    polygon: closedPolygon,
    area_m2: Number(area.toFixed(1)),
    captured_at: new Date().toISOString(),
  });

  if (error) {
    return { success: false, capturedCount: 0, error: error.message };
  }

  // Statistics/achievements үшін capture_events жазбасы
  const distanceKm = calculatePathDistanceKm(pathPoints);
  const blocksEquivalent = Math.max(1, Math.round(area / 100));
  await supabase.from("capture_events").insert({
    user_id: userId,
    blocks_captured: blocksEquivalent,
    distance_km: Number(distanceKm.toFixed(3)),
  });

  return { success: true, capturedCount: blocksEquivalent, error: null };
}

/**
 * Пайдаланушының жаулап алған territory (полигон) санын алады.
 */
export async function getBlocksCaptured(userId) {
  if (!userId) return 0;
  const { data, error } = await supabase
    .from("territories")
    .select("area_m2")
    .eq("controller_id", userId);
  if (error || !data) return 0;
  const totalArea = data.reduce((sum, t) => sum + Number(t.area_m2 || 0), 0);
  return Math.round(totalArea / 100);
}
