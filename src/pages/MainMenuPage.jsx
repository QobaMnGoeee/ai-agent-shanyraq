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
    <div className="h-[100dvh] w-full overflow-y-auto overscroll-contain">
      <div className="min-h-full px-4 pt-5 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => navigate("/map")}
            aria-label="Назад"
            className="btn-3d w-10 h-10 rounded-[12px] shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-gray-100" strokeWidth={2.2} />
          </button>
          <h1 className="start-text text-gray-800 text-[20px] font-bold">Меню</h1>
        </div>

        {/* Profile card — уровень + лига + описание */}
        <button onClick={() => setActiveSheet(SHEETS.PROFILE)} className="w-full mb-4">
          <GlassPanel className="rounded-[20px] p-4">
            <div className="flex items-center gap-3.5">
              <div
                className="w-16 h-16 rounded-full border-4 border-white/10 flex items-center justify-center text-white text-xl font-bold shrink-0 relative"
                style={{ backgroundColor: profile?.color || "#2b5569" }}
              >
                {(profile?.username || "?").charAt(0).toUpperCase()}
                <div
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-[#1a2e38] flex items-center justify-center"
                  style={{ backgroundColor: league.color }}
                  title={league.name}
                >
                  <Star className="w-3 h-3 text-white" strokeWidth={2.5} fill="white" />
                </div>
              </div>

              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2">
                  <p className="text-white text-[16px] font-semibold truncate">
                    {loading ? "..." : profile?.username || "—"}
                  </p>
                  <span className="text-[10px] font-bold text-gray-900 px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: league.color }}>
                    Ур. {level}
                  </span>
                </div>
                <p className="text-gray-400 text-[11.5px] mt-0.5 leading-snug">
                  {league.name} лига · {score.toLocaleString("ru-RU")} очков
                </p>
                <p className="text-gray-500 text-[10.5px] mt-1 leading-snug line-clamp-1">
                  Захватывает территории с {new Date().getFullYear()} года
                </p>
              </div>

              <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" strokeWidth={2.2} />
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
          <div className="grid grid-cols-2 gap-3">
            <MenuCard
              icon={ShoppingBag}
              label="Магазин"
              sublabel="Золотая зона"
              accent="#FFD700"
              onClick={() => setActiveSheet(SHEETS.SHOP)}
            />
            <MenuCard
              icon={Award}
              label="Достижения"
              accent="#F59E0B"
              onClick={() => setActiveSheet(SHEETS.ACHIEVEMENTS)}
            />
            <MenuCard
              icon={Trophy}
              label="Рейтинг"
              sublabel={`${league.name} лига`}
              accent={league.color}
              onClick={() => setActiveSheet(SHEETS.LEADERBOARD)}
            />
            <MenuCard
              icon={Settings}
              label="Настройки"
              onClick={() => setActiveSheet(SHEETS.SETTINGS)}
            />
          </div>
        </Section>

        {/* Social — Clan/Friends */}
        <Section title="Сообщество">
          <div className="grid grid-cols-2 gap-3">
            <MenuCard
              icon={Users}
              label="Клуб"
              sublabel="Создать/вступить"
              accent="#60A5FA"
              onClick={() => setActiveSheet(SHEETS.CLAN)}
            />
            <MenuCard
              icon={UserPlus}
              label="Друзья"
              sublabel="Найти рядом"
              accent="#34D399"
              onClick={() => setActiveSheet(SHEETS.FRIENDS)}
            />
          </div>
        </Section>

        {/* League ladder preview */}
        <Section title="Система лиг">
          <GlassPanel className="rounded-[16px] p-4">
            <div className="flex items-center justify-between">
              {LEAGUES.map((l) => (
                <div key={l.id} className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                      league.id === l.id ? "border-white scale-110" : "border-transparent opacity-40"
                    }`}
                    style={{ backgroundColor: l.color }}
                  >
                    <Target className="w-4 h-4 text-white" strokeWidth={2.4} />
                  </div>
                  <span
                    className={`text-[9px] font-medium ${
                      league.id === l.id ? "text-white" : "text-gray-500"
                    }`}
                  >
                    {l.name}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-gray-500 text-[10.5px] text-center mt-3 leading-snug">
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
      <h2 className="text-gray-600 text-[12px] font-semibold uppercase tracking-wide mb-2.5 px-1">
        {title}
      </h2>
      {children}
    </div>
  );
}

function MenuCard({ icon: Icon, label, sublabel, accent, onClick }) {
  return (
    <button onClick={onClick} className="w-full">
      <GlassPanel className="rounded-[16px] p-4 flex flex-col items-start gap-2.5">
        <div
          className="w-9 h-9 rounded-[10px] flex items-center justify-center"
          style={{ backgroundColor: accent ? `${accent}25` : "rgba(255,255,255,0.08)" }}
        >
          <Icon className="w-4.5 h-4.5" style={{ color: accent || "#e5e7eb" }} strokeWidth={2.2} />
        </div>
        <div className="text-left">
          <p className="text-white text-[13.5px] font-semibold">{label}</p>
          {sublabel && <p className="text-gray-500 text-[10.5px] mt-0.5">{sublabel}</p>}
        </div>
      </GlassPanel>
    </button>
  );
}

function MissionRow({ mission, completed, onClick }) {
  const Icon = mission.id.includes("instagram") ? InstagramIcon : Send;
  return (
    <button onClick={onClick} disabled={completed} className="w-full">
      <GlassPanel className="rounded-[14px] p-3.5 flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 ${
            completed ? "bg-emerald-400/20" : "bg-white/8"
          }`}
        >
          {completed ? (
            <Check className="w-4 h-4 text-emerald-300" strokeWidth={2.4} />
          ) : (
            <Icon className="w-4 h-4 text-gray-300" strokeWidth={2.2} />
          )}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-white text-[13px] font-medium truncate">{mission.title}</p>
          <p className="text-gray-500 text-[10.5px] truncate">{mission.description}</p>
        </div>
        <span
          className={`text-[11px] font-semibold shrink-0 ${
            completed ? "text-emerald-300" : "text-amber-300"
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
