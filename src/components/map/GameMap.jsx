import { useEffect, useRef, memo } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { GRID_SIZE } from "../../lib/useGeolocation";

const DEFAULT_CENTER = [69.2401, 41.2995]; // [lng, lat] — MapLibre осылай күтеді
const MAP_STYLE = "https://api.maptiler.com/maps/dataviz-v4/style.json?key=N5HlBjvet6ZuNOIJlSa5";
// Диагностика үшін уақытша баламалы (кілтсіз) стиль:
// const MAP_STYLE = "https://demotiles.maplibre.org/style.json";

const TERRITORY_SOURCE_ID = "territories-source";
const TERRITORY_FILL_LAYER_ID = "territories-fill";
const TERRITORY_LINE_LAYER_ID = "territories-line";
const PATH_SOURCE_ID = "path-source";
const PATH_LAYER_ID = "path-layer";

/**
 * MapLibre GL негізіндегі негізгі ойын картасы (MapTiler dataviz style).
 *
 * Props:
 * - position: { lat, lng } | null — ойыншының ағымдағы GPS позициясы
 * - pathPoints: [{ lat, lng }] — жазылып жатқан жол (recording кезінде)
 * - territories: [{ grid_lat, grid_lng, color }] — жаулап алынған ұяшықтар
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

  // Картаны бір рет ғана инициализациялау
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: DEFAULT_CENTER,
      zoom: 17,
      attributionControl: false,
    });

    map.on("error", (e) => {
      console.error("MapLibre error:", e?.error || e);
    });

    map.on("load", () => {
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
          "fill-opacity": 0.35,
        },
      });
      map.addLayer({
        id: TERRITORY_LINE_LAYER_ID,
        type: "line",
        source: TERRITORY_SOURCE_ID,
        paint: {
          "line-color": ["get", "color"],
          "line-width": 1,
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
          "line-color": "#00FF88",
          "line-width": 3,
          "line-dasharray": [2, 1.5],
          "line-opacity": 0.9,
        },
      });

      styleLoadedRef.current = true;

      // Стиль жүктелгенше кешіктірілген жаңартуларды енгізу
      updateTerritorySource(map, pendingRef.current.territories);
      updatePathSource(map, pendingRef.current.pathPoints);
    });

    mapRef.current = map;
    onMapReady?.(map);

    return () => {
      map.remove();
      mapRef.current = null;
      styleLoadedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // GPS позиция өзгергенде маркерді жаңарту + бірінші рет картаны центрлеу
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !position) return;

    if (!markerRef.current) {
      const el = document.createElement("div");
      markerElRef.current = el;
      markerRef.current = new maplibregl.Marker({ element: el, anchor: "center" })
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

  // Path сызығын жаңарту (recording кезінде)
  useEffect(() => {
    const map = mapRef.current;
    pendingRef.current.pathPoints = pathPoints;
    if (!map || !styleLoadedRef.current) return;
    updatePathSource(map, pathPoints);
  }, [pathPoints]);

  // Territory ұяшықтарын жаңарту
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

  const half = GRID_SIZE / 2;
  const features = territories.map((t) => ({
    type: "Feature",
    properties: { color: t.color || "#888888" },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [t.grid_lng - half, t.grid_lat - half],
          [t.grid_lng + half, t.grid_lat - half],
          [t.grid_lng + half, t.grid_lat + half],
          [t.grid_lng - half, t.grid_lat + half],
          [t.grid_lng - half, t.grid_lat - half],
        ],
      ],
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
        width:16px;height:16px;border-radius:50%;
        background:${color};
        border:3px solid white;
        box-shadow:0 2px 6px rgba(0,0,0,0.4);
      "></div>
      <div style="
        margin-top:2px;
        background:rgba(23,50,64,0.9);
        color:white;font-size:10px;font-weight:600;
        padding:2px 7px;border-radius:10px;
        white-space:nowrap;
        border:1px solid rgba(255,255,255,0.15);
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
