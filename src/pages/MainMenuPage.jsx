import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Trophy,
  Award,
  Settings,
  ShoppingBag,
  Users,
  UserPlus,
  Target,
  ChevronRight,
  Star,
  Send,
  Check,
  Lock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { supabase } from "../lib/supabase";
import { getUserStats } from "../lib/userStats";
import GlassPanel from "../components/ui/GlassPanel";
import ProfileSheet from "../components/overlays/ProfileSheet";
import LeaderboardSheet from "../components/overlays/LeaderboardSheet";
import AchievementsSheet from "../components/overlays/AchievementsSheet";
import SettingsSheet from "../components/overlays/SettingsSheet";
import ShopSheet from "../components/overlays/ShopSheet";
import ClanSheet from "../components/overlays/ClanSheet";
import FriendsSheet from "../components/overlays/FriendsSheet";
import { LEAGUES, getLeagueForScore, MISSIONS } from "../lib/mainMenuData";
import { TreeDecor, SunDecor } from "../components/illustrations";

const SHEETS = {
  NONE: null,
  PROFILE: "profile",
  LEADERBOARD: "leaderboard",
  ACHIEVEMENTS: "achievements",
  SETTINGS: "settings",
  SHOP: "shop",
  CLAN: "clan",
  FRIENDS: "friends",
};

const CLAN_UNLOCK_SCORE = 15000;

export default function MainMenuPage() {
  const { user } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [activeSheet, setActiveSheet] = useState(SHEETS.NONE);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ blocks: 0 });
  const [loading, setLoading] = useState(true);
  const [missionsCompleted, setMissionsCompleted] = useState({});

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    async function load() {
      const [{ data: profileData }, statsData] = await Promise.all([
        supabase.from("profiles").select("username, color, total_score").eq("id", user.id).maybeSingle(),
        getUserStats(user.id),
      ]);
      if (cancelled) return;
      setProfile(profileData);
      setStats(statsData);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (activeSheet === SHEETS.PROFILE) return <ProfileSheet onBack={() => setActiveSheet(SHEETS.NONE)} />;
  if (activeSheet === SHEETS.LEADERBOARD) return <LeaderboardSheet onBack={() => setActiveSheet(SHEETS.NONE)} />;
  if (activeSheet === SHEETS.ACHIEVEMENTS) return <AchievementsSheet onBack={() => setActiveSheet(SHEETS.NONE)} />;
  if (activeSheet === SHEETS.SETTINGS) return <SettingsSheet onBack={() => setActiveSheet(SHEETS.NONE)} />;
  if (activeSheet === SHEETS.SHOP) return <ShopSheet onBack={() => setActiveSheet(SHEETS.NONE)} balance={Math.floor(profile?.total_score || 0)} />;
  if (activeSheet === SHEETS.CLAN) return <ClanSheet onBack={() => setActiveSheet(SHEETS.NONE)} />;
  if (activeSheet === SHEETS.FRIENDS) return <FriendsSheet onBack={() => setActiveSheet(SHEETS.NONE)} />;

  const score = Math.floor(profile?.total_score || 0);
  const league = getLeagueForScore(score);
  const level = Math.floor(score / 1000) + 1;

  function handleMissionClick(mission) {
    window.open(mission.url, "_blank", "noopener,noreferrer");
    setMissionsCompleted((prev) => ({ ...prev, [mission.id]: true }));
    // TODO: серверде подписканы тексеру логикасы (Telegram/Instagram API)
    // қосылғанда, нақты reward сол жерде беріледі. Қазір — тек UI skeleton.
  }

  return (
    <div className="h-[100dvh] w-full overflow-y-auto overscroll-contain relative">
      <div
        className="absolute -top-16 -right-20 w-64 h-64 blob-shape bg-sun-200/40 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-[40%] -left-24 w-56 h-56 blob-shape bg-sky2-200/30 pointer-events-none"
        aria-hidden="true"
      />
      <SunDecor className="absolute top-4 right-4 w-10 opacity-90 pointer-events-none animate-float-slow" />
      <TreeDecor className="absolute top-2 left-2 w-9 opacity-70 pointer-events-none" />
      <div className="relative min-h-full px-4 pt-5 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => navigate("/map")}
            aria-label="Назад"
            className="btn-3d w-11 h-11 rounded-2xl shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-white" strokeWidth={2.2} />
          </button>
          <h1 className="start-text text-ink-800 text-[22px] font-bold">Меню</h1>
        </div>

        {/* Profile card — уровень + лига + описание */}
        <button onClick={() => setActiveSheet(SHEETS.PROFILE)} className="w-full mb-4">
          <GlassPanel className="rounded-3xl p-4">
            <div className="flex items-center gap-3.5">
              <div
                className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center text-white text-xl font-extrabold shrink-0 relative shadow-card"
                style={{ backgroundColor: profile?.color || "#22b25c" }}
              >
                {(profile?.username || "?").charAt(0).toUpperCase()}
                <div
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center"
                  style={{ backgroundColor: league.color }}
                  title={league.name}
                >
                  <Star className="w-3 h-3 text-white" strokeWidth={2.5} fill="white" />
                </div>
              </div>

              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2">
                  <p className="text-ink-800 text-[16px] font-extrabold truncate">
                    {loading ? "..." : profile?.username || "—"}
                  </p>
                  <span className="text-[10px] font-extrabold text-ink-900 px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: league.color }}>
                    Ур. {level}
                  </span>
                </div>
                <p className="text-ink-400 text-[11.5px] font-semibold mt-0.5 leading-snug">
                  {league.name} лига · {score.toLocaleString("ru-RU")} очков
                </p>
                <p className="text-ink-300 text-[10.5px] font-medium mt-1 leading-snug line-clamp-1">
                  Захватывает территории с {new Date().getFullYear()} года
                </p>
              </div>

              <ChevronRight className="w-4 h-4 text-ink-300 shrink-0" strokeWidth={2.2} />
            </div>
          </GlassPanel>
        </button>

        {/* Missions — подписка на соц.сети */}
        <Section title="Задания">
          <div className="flex flex-col gap-2">
            {MISSIONS.map((m) => (
              <MissionRow
                key={m.id}
                mission={m}
                completed={Boolean(missionsCompleted[m.id])}
                onClick={() => handleMissionClick(m)}
              />
            ))}
          </div>
        </Section>

        {/* Main grid — Shop, Achievements, Leaderboard, Settings */}
        <Section title="Игра">
          <div className="flex flex-col gap-2.5">
            <MenuRow
              icon={ShoppingBag}
              label="Магазин"
              sublabel="Золотая зона"
              accent="#fca311"
              onClick={() => setActiveSheet(SHEETS.SHOP)}
            />
            <MenuRow
              icon={Award}
              label="Достижения"
              accent="#e2810a"
              onClick={() => setActiveSheet(SHEETS.ACHIEVEMENTS)}
            />
            <MenuRow
              icon={Trophy}
              label="Рейтинг"
              sublabel={`${league.name} лига`}
              accent={league.color}
              onClick={() => setActiveSheet(SHEETS.LEADERBOARD)}
            />
            <MenuRow
              icon={Settings}
              label="Настройки"
              accent="#1aa1fb"
              onClick={() => setActiveSheet(SHEETS.SETTINGS)}
            />
          </div>
        </Section>

        {/* Social — Clan/Friends */}
        <Section title="Сообщество">
          <div className="flex flex-col gap-2.5">
            <MenuRow
              icon={Users}
              label="Клуб"
              sublabel={
                score >= CLAN_UNLOCK_SCORE
                  ? "Создать/вступить"
                  : `Откроется на ${CLAN_UNLOCK_SCORE.toLocaleString("ru-RU")} очках`
              }
              accent="#1aa1fb"
              locked={score < CLAN_UNLOCK_SCORE}
              progress={Math.min(100, Math.round((score / CLAN_UNLOCK_SCORE) * 100))}
              onClick={() => score >= CLAN_UNLOCK_SCORE && setActiveSheet(SHEETS.CLAN)}
            />
            <MenuRow
              icon={UserPlus}
              label="Друзья"
              sublabel="Найти рядом"
              accent="#22b25c"
              onClick={() => setActiveSheet(SHEETS.FRIENDS)}
            />
          </div>
        </Section>

        {/* League ladder preview */}
        <Section title="Система лиг">
          <GlassPanel className="rounded-3xl p-4">
            <div className="flex items-center justify-between">
              {LEAGUES.map((l) => (
                <div key={l.id} className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                      league.id === l.id ? "border-ink-800 scale-110" : "border-transparent opacity-40"
                    }`}
                    style={{ backgroundColor: l.color }}
                  >
                    <Target className="w-4 h-4 text-white" strokeWidth={2.4} />
                  </div>
                  <span
                    className={`text-[9px] font-bold ${
                      league.id === l.id ? "text-ink-800" : "text-ink-300"
                    }`}
                  >
                    {l.name}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-ink-400 text-[10.5px] font-medium text-center mt-3 leading-snug">
              Каждую неделю самые активные игроки переходят в следующую лигу
            </p>
          </GlassPanel>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <h2 className="text-ink-400 text-[12px] font-extrabold uppercase tracking-wide mb-2.5 px-1">
        {title}
      </h2>
      {children}
    </div>
  );
}

function MenuRow({ icon: Icon, label, sublabel, accent, onClick, locked, progress }) {
  return (
    <button onClick={onClick} disabled={locked} className="w-full">
      <GlassPanel className={`rounded-2xl p-3.5 flex items-center gap-3.5 ${locked ? "opacity-75" : ""}`}>
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: accent ? `${accent}22` : "#f4f6f5" }}
        >
          {locked ? (
            <Lock className="w-4.5 h-4.5 text-ink-300" strokeWidth={2.2} />
          ) : (
            <Icon className="w-4.5 h-4.5" style={{ color: accent || "#54615a" }} strokeWidth={2.2} />
          )}
        </div>

        <div className="flex-1 min-w-0 text-left">
          <p className="text-ink-800 text-[14px] font-bold">{label}</p>
          {sublabel && <p className="text-ink-400 text-[11px] font-semibold">{sublabel}</p>}
          {locked && typeof progress === "number" && (
            <div className="mt-2 h-1.5 rounded-full bg-ink-100 overflow-hidden max-w-[160px]">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progress}%`, backgroundColor: accent }}
              />
            </div>
          )}
        </div>

        {!locked && <ChevronRight className="w-4 h-4 text-ink-300 shrink-0" strokeWidth={2.2} />}
      </GlassPanel>
    </button>
  );
}

function MissionRow({ mission, completed, onClick }) {
  const Icon = mission.id.includes("instagram") ? InstagramIcon : Send;
  return (
    <button onClick={onClick} disabled={completed} className="w-full">
      <GlassPanel className="rounded-2xl p-3.5 flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            completed ? "bg-leaf-100" : "bg-sky2-100"
          }`}
        >
          {completed ? (
            <Check className="w-4 h-4 text-leaf-600" strokeWidth={2.4} />
          ) : (
            <Icon className="w-4 h-4 text-sky2-600" strokeWidth={2.2} />
          )}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-ink-800 text-[13px] font-bold truncate">{mission.title}</p>
          <p className="text-ink-400 text-[10.5px] font-medium truncate">{mission.description}</p>
        </div>
        <span
          className={`text-[11px] font-extrabold shrink-0 ${
            completed ? "text-leaf-600" : "text-sun-600"
          }`}
        >
          +{mission.reward.toLocaleString("ru-RU")}
        </span>
      </GlassPanel>
    </button>
  );
}

function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
