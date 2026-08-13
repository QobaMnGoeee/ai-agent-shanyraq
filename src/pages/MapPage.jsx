import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Minus,
  X,
  Satellite,
  RefreshCw,
  Settings,
  Crosshair,
  Play,
  Square,
  Search,
  Link2,
  Loader2,
  Menu as MenuIcon,
  Gauge,
} from "lucide-react";
import Btn3D from "../components/ui/Btn3D";
import GameMap, { centerOnPosition, flyToPlace } from "../components/map/GameMap";
import SearchBar from "../components/map/SearchBar";
import { useGeolocation, snapToGrid } from "../lib/useGeolocation";
import { captureLoop } from "../lib/territoryCapture";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { supabase } from "../lib/supabase";

export default function MapPage() {
  const { user } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const { position, error: gpsErrorCode, speedKmh } = useGeolocation();
  const [profileColor, setProfileColor] = useState("#00FF88");
  const [profileUsername, setProfileUsername] = useState("Вы");
  const [score, setScore] = useState(0);

  const [gpsErrorDismissed, setGpsErrorDismissed] = useState(false);
  const [recording, setRecording] = useState(false);
  const [pathPoints, setPathPoints] = useState([]);
  const [capturing, setCapturing] = useState(false);
  const [captureMessage, setCaptureMessage] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [territories, setTerritories] = useState([]);

  const showGpsError = Boolean(gpsErrorCode) && !gpsErrorDismissed;

  const loadTerritories = useCallback(async () => {
    const { data, error } = await supabase
      .from("territories_public")
      .select("grid_lat, grid_lng, color");
    if (!error && data) {
      setTerritories(
        data.map((t) => ({
          grid_lat: t.grid_lat,
          grid_lng: t.grid_lng,
          color: t.color || "#888888",
        }))
      );
    }
  }, []);

  useEffect(() => {
    loadTerritories();
  }, [loadTerritories]);

  useEffect(() => {
    const channel = supabase
      .channel("territories-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "territories" }, () => {
        loadTerritories();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadTerritories]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    supabase
      .from("profiles")
      .select("username, color, total_score")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled || !data) return;
        setProfileColor(data.color || "#00FF88");
        setProfileUsername(data.username || "—");
        setScore(Math.floor(data.total_score || 0));
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!recording || !position) return;
    const snapped = snapToGrid(position.lat, position.lng);
    setPathPoints((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.lat === snapped.lat && last.lng === snapped.lng) {
        return prev;
      }
      return [...prev, snapped];
    });
  }, [position, recording]);

  useEffect(() => {
    if (!captureMessage) return;
    const timer = setTimeout(() => setCaptureMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [captureMessage]);

  const handleStart = useCallback(() => {
    setPathPoints(position ? [snapToGrid(position.lat, position.lng)] : []);
    setRecording(true);
  }, [position]);

  const handleStop = useCallback(() => {
    setRecording(false);
    setPathPoints([]);
  }, []);

  const handleCloseLoop = useCallback(async () => {
    if (!user || pathPoints.length < 3 || capturing) return;
    setCapturing(true);

    const result = await captureLoop(pathPoints, user.id);

    setCapturing(false);
    setRecording(false);
    setPathPoints([]);

    if (result.success) {
      setCaptureMessage({ type: "success", text: `${t("captured_blocks")}: ${result.capturedCount}` });
      loadTerritories();
      const { data } = await supabase
        .from("profiles")
        .select("total_score")
        .eq("id", user.id)
        .maybeSingle();
      if (data) setScore(Math.floor(data.total_score || 0));
    } else {
      setCaptureMessage({ type: "error", text: result.error || t("capture_error") });
    }
  }, [user, pathPoints, capturing, loadTerritories, t]);

  const handleZoomIn = useCallback(() => mapInstance?.zoomIn(), [mapInstance]);
  const handleZoomOut = useCallback(() => mapInstance?.zoomOut(), [mapInstance]);
  const handleCenterMe = useCallback(
    () => centerOnPosition(mapInstance, position),
    [mapInstance, position]
  );
  const handleSelectPlace = useCallback(
    (place) => {
      flyToPlace(mapInstance, place);
      setSearchOpen(false);
    },
    [mapInstance]
  );

  function handleGpsRefresh() {
    window.location.reload();
  }

  return (
    <div className="h-[100dvh] w-full relative overflow-hidden touch-none">
      <GameMap
        position={position}
        pathPoints={pathPoints}
        territories={territories}
        userColor={profileColor}
        username={profileUsername}
        onMapReady={setMapInstance}
      />

      {/* Top bar — тек ұпай */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-[500px] glass-panel rounded-xl h-11 flex items-center justify-center z-10">
        <span className="text-white text-xl font-bold">{score}</span>
      </div>

      {/* Zoom controls */}
      <div className="absolute top-20 left-4 flex flex-col z-10">
        <button
          onClick={handleZoomIn}
          className="btn-3d w-10 h-10 rounded-t-xl rounded-b-sm mb-[2px]"
          aria-label="Zoom +"
        >
          <Plus className="w-5 h-5 text-gray-200" />
        </button>
        <button
          onClick={handleZoomOut}
          className="btn-3d w-10 h-10 rounded-b-xl rounded-t-sm"
          aria-label="Zoom -"
        >
          <Minus className="w-5 h-5 text-gray-200" />
        </button>
      </div>

      {/* Жылдамдық индикаторы (км/сағ) — жүріп/жүгіріп бара жатқанда көрінеді */}
      {recording && speedKmh != null && (
        <div className="absolute top-20 right-4 z-10 glass-panel rounded-[12px] px-3 py-2 flex items-center gap-1.5">
          <Gauge className="w-3.5 h-3.5 text-emerald-300" strokeWidth={2.2} />
          <span className="text-white text-[13px] font-bold">{speedKmh.toFixed(1)}</span>
          <span className="text-gray-400 text-[10px]">км/ч</span>
        </div>
      )}

      {/* GPS error modal */}
      {showGpsError && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[75%] max-w-[280px] modal-panel p-4 text-center z-20 flex flex-col items-center">
          <button
            onClick={() => setGpsErrorDismissed(true)}
            className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" strokeWidth={2.4} />
          </button>
          <div className="text-white mb-2">
            <Satellite className="w-6 h-6 opacity-90" strokeWidth={1.5} />
          </div>
          <h2 className="text-white text-[17px] font-semibold mb-2">{t("gps_error_title")}</h2>
          <p className="text-gray-200 text-[12px] leading-snug mb-4 px-1">
            {gpsErrorMessage(gpsErrorCode, t)}
          </p>
          <div className="flex justify-between w-[90%] mb-1">
            <button
              onClick={handleGpsRefresh}
              className="flex flex-col items-center text-gray-300 hover:text-white transition-colors group"
            >
              <RefreshCw
                className="w-5 h-5 mb-1 opacity-80 group-hover:opacity-100 transition-opacity"
                strokeWidth={2.2}
              />
              <span className="text-[11px]">{t("refresh")}</span>
            </button>
            <button
              onClick={() => navigate("/menu")}
              className="flex flex-col items-center text-gray-300 hover:text-white transition-colors group"
            >
              <Settings
                className="w-5 h-5 mb-1 opacity-80 group-hover:opacity-100 transition-opacity"
                strokeWidth={2.2}
              />
              <span className="text-[11px]">{t("settings_short")}</span>
            </button>
          </div>
        </div>
      )}

      {/* Capture нәтижесі туралы toast */}
      {captureMessage && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] z-20">
          <div
            className={`rounded-[12px] px-4 py-2.5 backdrop-blur-md border text-center text-[13px] font-medium ${
              captureMessage.type === "success"
                ? "bg-emerald-500/15 border-emerald-400/30 text-emerald-200"
                : "bg-red-500/15 border-red-400/30 text-red-200"
            }`}
          >
            {captureMessage.text}
          </div>
        </div>
      )}

      {/* Bottom — search + Menu батырмасы (START-тың үстінде), содан кейін START/STOP */}
      {searchOpen ? (
        <SearchBar onSelectPlace={handleSelectPlace} onClose={() => setSearchOpen(false)} />
      ) : (
        <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex-1 glass-panel rounded-xl h-11 flex items-center gap-2.5 px-4 text-left"
            >
              <Search className="w-4 h-4 text-gray-300 shrink-0" strokeWidth={2.4} />
              <span className="text-gray-300 text-[13px] truncate">{t("search_placeholder")}</span>
            </button>

            <button
              onClick={() => navigate("/menu")}
              className="w-11 h-11 rounded-full glass-panel flex items-center justify-center shrink-0"
              aria-label="Menu"
            >
              <MenuIcon className="w-4.5 h-4.5 text-gray-100" strokeWidth={2.3} />
            </button>
          </div>

          {!recording ? (
            <Btn3D
              onClick={handleStart}
              className="w-full h-[52px] rounded-[16px] flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 text-white fill-white" strokeWidth={0} />
              <span className="start-text text-white text-[17px] font-bold">{t("start")}</span>
            </Btn3D>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCloseLoop}
                disabled={capturing || pathPoints.length < 3}
                className="flex-1 h-[52px] rounded-[16px] flex items-center justify-center gap-2 bg-amber-400/20 border border-amber-300/40 backdrop-blur-sm text-amber-200 hover:bg-amber-400/25 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {capturing ? (
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.3} />
                ) : (
                  <Link2 className="w-4 h-4" strokeWidth={2.3} />
                )}
                <span className="start-text text-[15px] font-bold">
                  {capturing ? t("capturing") : t("close_loop")}
                </span>
              </button>

              <button
                onClick={handleStop}
                disabled={capturing}
                className="w-[100px] h-[52px] rounded-[16px] flex items-center justify-center gap-1.5 bg-white/10 border border-white/15 backdrop-blur-sm text-gray-200 hover:bg-white/15 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <Square className="w-3.5 h-3.5 fill-current" strokeWidth={0} />
                <span className="start-text text-[14px] font-bold">{t("stop")}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Center-on-me — жеке floating батырма */}
      {position && !searchOpen && (
        <button
          onClick={handleCenterMe}
          className="absolute bottom-[140px] right-4 btn-3d w-10 h-10 rounded-full z-10"
          aria-label="Центрировать на мне"
        >
          <Crosshair className="w-4 h-4 text-gray-200" strokeWidth={2.2} />
        </button>
      )}
    </div>
  );
}

function gpsErrorMessage(code, t) {
  switch (code) {
    case "GPS_PERMISSION_DENIED":
      return t("gps_error_permission");
    case "GPS_TIMEOUT":
      return t("gps_error_timeout");
    case "GPS_UNSUPPORTED":
      return t("gps_error_unsupported");
    case "GPS_WEAK_SIGNAL":
    default:
      return t("gps_error_weak");
  }
}
