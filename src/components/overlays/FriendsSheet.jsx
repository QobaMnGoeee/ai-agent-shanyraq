import { useState } from "react";
import { UserPlus, Search, MapPin, Trophy } from "lucide-react";
import Sheet from "../ui/Sheet";
import GlassPanel from "../ui/GlassPanel";
import Input3D from "../ui/Input3D";
import { MOCK_FRIENDS } from "../../lib/mainMenuData";

export default function FriendsSheet({ onBack }) {
  const [query, setQuery] = useState("");

  const sortedFriends = [...MOCK_FRIENDS].sort((a, b) => (b.online ? 1 : 0) - (a.online ? 1 : 0));

  return (
    <Sheet title="Друзья" onBack={onBack}>
      <div className="flex flex-col gap-2.5 mb-4">
        <Input3D
          icon={Search}
          placeholder="Найти по имени пользователя"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button className="w-full">
          <GlassPanel className="rounded-[14px] p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-emerald-400/15 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-emerald-300" strokeWidth={2.2} />
            </div>
            <div className="text-left flex-1">
              <p className="text-white text-[13px] font-medium">Найти рядом</p>
              <p className="text-gray-500 text-[10.5px]">По вашей текущей геолокации</p>
            </div>
          </GlassPanel>
        </button>
      </div>

      {/* Достар таблицасы — score бойынша */}
      <div className="flex items-center gap-2 text-gray-500 text-[11px] font-semibold uppercase tracking-wide mb-2 px-1">
        <Trophy className="w-3.5 h-3.5" strokeWidth={2.2} />
        Таблица друзей
      </div>

      {sortedFriends.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <UserPlus className="w-10 h-10 text-gray-500 mb-3" strokeWidth={1.6} />
          <p className="text-gray-300 text-[14px] font-medium">Пока нет друзей</p>
          <p className="text-gray-500 text-[12px] mt-1 max-w-[220px]">
            Найдите игроков рядом или по имени пользователя
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sortedFriends.map((f, i) => (
            <GlassPanel key={f.id} className="rounded-[14px] p-3 flex items-center gap-3">
              <span className="w-6 text-gray-400 text-[13px] font-semibold text-center shrink-0">
                {i + 1}
              </span>
              <div className="relative shrink-0">
                <div
                  className="w-9 h-9 rounded-full border-2 border-white/10 flex items-center justify-center text-white text-[13px] font-bold"
                  style={{ backgroundColor: f.color }}
                >
                  {f.username.charAt(0).toUpperCase()}
                </div>
                {f.online && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#1a2e38]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-[13px] font-medium truncate">{f.username}</p>
                <p className="text-gray-500 text-[10.5px]">{f.online ? "В сети" : "Не в сети"}</p>
              </div>
            </GlassPanel>
          ))}
        </div>
      )}
    </Sheet>
  );
}
