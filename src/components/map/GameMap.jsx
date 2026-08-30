import { useEffect, useRef, memo } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";

const DEFAULT_CENTER = [69.2401, 41.2995]; // [lng, lat]
const MAPTILER_KEY = "N5HlBjvet6ZuNOIJlSa5";

const TERRITORY_SOURCE_ID = "territories-source";
const TERRITORY_FILL_LAYER_ID = "territories-fill";
const TERRITORY_LINE_LAYER_ID = "territories-line";
const PATH_SOURCE_ID = "path-source";
const PATH_LAYER_ID = "path-layer";

maptilersdk.config.apiKey = MAPTILER_KEY;

/**
 * MapTiler SDK негізіндегі негізгі ойын картасы (dataviz style).
 * MapTiler SDK — @maptiler/sdk-тың dashboard-тың өзінде де қолданатын
 * ресми кітапханасы, MapLibre GL-ды өз ішіне алады, бірақ container
 * resize/layout мәселелерін дұрысырақ өңдейді.
 *
 * Props:
 * - position: { lat, lng } | null — ойыншының ағымдағы GPS позициясы
 * - pathPoints: [{ lat, lng }] — жазылып жатқан жол (recording кезінде)
 * - territories: [{ polygon, color }] — жаулап алынған нақты аумақтар
 *   (polygon — [{lat,lng}, ...] нүктелер тізбегі, grid емес, нақты пішін)
 * - userColor: string — пайдаланушының территория түсі (маркер белгісіне)
 * - username: string
 * - onMapReady: (map) => void — сыртқы zoom controls үшін map instance беру
 */
function GameMap({
  position,
  pathPoints = [],
  territories = [],
  userColor = "#00FF88",
  username = "Вы",
  onMapReady,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const styleLoadedRef = useRef(false);
  const markerRef = useRef(null);
  const markerElRef = useRef(null);
  const hasCenteredRef = useRef(false);
  const pendingRef = useRef({ territories: [], pathPoints: [] });

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = new maptilersdk.Map({
      container: containerRef.current,
      style: maptilersdk.MapStyle.DATAVIZ,
      center: DEFAULT_CENTER,
      zoom: 17,
      navigationControl: false,
      geolocateControl: false,
      attributionControl: false,
    });

    // Заңды түрде міндетті attribution-ды кішкентай, жиналатын
    // (collapsible) түрде қосамыз — MapTiler ережесі бойынша
    // мобильде бір батырма/иконкаға жинақтауға рұқсат етілген.
    map.addControl(
      new maptilersdk.AttributionControl({ compact: true }),
      "bottom-right"
    );

    map.on("load", () => {
      map.resize();

      map.addSource(TERRITORY_SOURCE_ID, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: TERRITORY_FILL_LAYER_ID,
        type: "fill",
        source: TERRITORY_SOURCE_ID,
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": 0.55,
        },
      });
      map.addLayer({
        id: TERRITORY_LINE_LAYER_ID,
        type: "line",
        source: TERRITORY_SOURCE_ID,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": ["get", "color"],
          "line-width": 3,
        },
      });

      map.addSource(PATH_SOURCE_ID, {
        type: "geojson",
        data: { type: "Feature", geometry: { type: "LineString", coordinates: [] } },
      });
      map.addLayer({
        id: PATH_LAYER_ID,
        type: "line",
        source: PATH_SOURCE_ID,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#22b25c",
          "line-width": 4,
          "line-dasharray": [2, 1.5],
          "line-opacity": 0.95,
        },
      });

      styleLoadedRef.current = true;
      updateTerritorySource(map, pendingRef.current.territories);
      updatePathSource(map, pendingRef.current.pathPoints);
      applyNatureTint(map);
    });

    map.on("error", (e) => {
      console.error("Map error:", e?.error || e);
    });

    mapRef.current = map;
    onMapReady?.(map);

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      styleLoadedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !position) return;

    if (!markerRef.current) {
      const el = document.createElement("div");
      markerElRef.current = el;
      markerRef.current = new maptilersdk.Marker({ element: el, anchor: "center" })
        .setLngLat([position.lng, position.lat])
        .addTo(map);
    } else {
      markerRef.current.setLngLat([position.lng, position.lat]);
    }

    renderMarkerHtml(markerElRef.current, userColor, username);

    if (!hasCenteredRef.current) {
      map.jumpTo({ center: [position.lng, position.lat], zoom: 17 });
      hasCenteredRef.current = true;
    }
  }, [position, userColor, username]);

  useEffect(() => {
    const map = mapRef.current;
    pendingRef.current.pathPoints = pathPoints;
    if (!map || !styleLoadedRef.current) return;
    updatePathSource(map, pathPoints);
  }, [pathPoints]);

  useEffect(() => {
    const map = mapRef.current;
    pendingRef.current.territories = territories;
    if (!map || !styleLoadedRef.current) return;
    updateTerritorySource(map, territories);
  }, [territories]);

  return <div ref={containerRef} className="absolute inset-0 z-0" />;
}

function updateTerritorySource(map, territories) {
  const source = map.getSource(TERRITORY_SOURCE_ID);
  if (!source) return;

  const features = territories
    .filter((t) => Array.isArray(t.polygon) && t.polygon.length >= 3)
    .map((t) => ({
      type: "Feature",
      properties: { color: t.color || "#888888" },
      geometry: {
        type: "Polygon",
        // t.polygon — [{lat,lng}, ...] нақты жүрген маршрут нүктелері.
        // GeoJSON [lng, lat] ретін талап етеді.
        coordinates: [t.polygon.map((p) => [p.lng, p.lat])],
      },
    }));

  source.setData({ type: "FeatureCollection", features });
}

function updatePathSource(map, pathPoints) {
  const source = map.getSource(PATH_SOURCE_ID);
  if (!source) return;

  source.setData({
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: pathPoints.map((p) => [p.lng, p.lat]),
    },
  });
}

function renderMarkerHtml(el, color, username) {
  if (!el) return;
  el.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;">
      <div style="
        width:18px;height:18px;border-radius:50%;
        background:${color};
        border:3px solid white;
        box-shadow:0 2px 6px rgba(38,46,42,0.35);
      "></div>
      <div style="
        margin-top:3px;
        background:#ffffff;
        color:#262e2a;font-size:10px;font-weight:800;
        padding:2px 8px;border-radius:10px;
        white-space:nowrap;
        border:2px solid #eef2ee;
        box-shadow:0 2px 6px rgba(38,46,42,0.12);
      ">${escapeHtml(username)}</div>
    </div>
  `;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c]);
}

/**
 * DATAVIZ стиліндегі негізгі қабаттарды (жер, парк, су) жаратылыс/
 * табиғи Stepland палитрасына үйлесімді жасыл-жылы реңкке бояу.
 * Қабат id-лары табылмаса — үнсіз өтеді (стиль нұсқасы өзгерсе де қатесіз).
 */
function applyNatureTint(map) {
  const paintIfExists = (layerId, prop, value) => {
    try {
      if (map.getLayer(layerId)) {
        map.setPaintProperty(layerId, prop, value);
      }
    } catch {
      /* қабат осы стильде жоқ болуы мүмкін — елемей өтеміз */
    }
  };

  // Жалпы фон / жер беті — жылы кремді реңк
  paintIfExists("Background", "background-color", "#fbf6e8");
  paintIfExists("background", "background-color", "#fbf6e8");

  // Парктер мен жасыл аймақтар — палитрадағы leaf түстер
  ["Park", "park", "Landcover", "landcover", "Landuse", "landuse", "Wood", "wood", "Forest"].forEach(
    (id) => paintIfExists(id, "fill-color", "#c9edd4")
  );

  // Су айдындары — sky2 реңкі
  ["Water", "water", "Waterway", "waterway"].forEach((id) =>
    paintIfExists(id, "fill-color", "#bfe8fb")
  );

  // Ғимарат контурлары — жұмсақ, назар аудармайтын
  ["Building", "building"].forEach((id) => {
    paintIfExists(id, "fill-color", "#eee3c8");
    paintIfExists(id, "fill-opacity", 0.6);
  });

  // Жолдар — жұмсақ, жасыл фонмен үйлесімді
  ["Road network", "road", "Road", "highway"].forEach((id) =>
    paintIfExists(id, "line-color", "#f4ead0")
  );
}

export default memo(GameMap);

export function centerOnPosition(map, position) {
  if (map && position) {
    map.easeTo({ center: [position.lng, position.lat] });
  }
}

export function flyToPlace(map, place) {
  if (map && place) {
    map.flyTo({ center: [place.lng, place.lat], zoom: 15, duration: 1200 });
  }
}
