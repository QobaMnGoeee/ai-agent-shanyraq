import { useState } from "react";
import { Users, Plus, Search, Shield } from "lucide-react";
import Sheet from "../ui/Sheet";
import GlassPanel from "../ui/GlassPanel";
import Input3D from "../ui/Input3D";
import Btn3D from "../ui/Btn3D";
import { MOCK_CLAN } from "../../lib/mainMenuData";

export default function ClanSheet({ onBack }) {
  const [mode, setMode] = useState(null); // null | 'create' | 'join'
  const [clanName, setClanName] = useState("");

  if (MOCK_CLAN) {
    return (
      <Sheet title="Клуб" onBack={onBack}>
        <ClanOverview clan={MOCK_CLAN} />
      </Sheet>
    );
  }

  return (
    <Sheet title="Клуб" onBack={onBack}>
      {!mode && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col items-center py-8 text-center">
            <Users className="w-10 h-10 text-gray-500 mb-3" strokeWidth={1.6} />
            <p className="text-gray-300 text-[14px] font-medium">Вы ещё не в клубе</p>
            <p className="text-gray-500 text-[12px] mt-1 max-w-[240px]">
              Создайте свой клуб или вступите в существующий, чтобы соревноваться командой
            </p>
          </div>

          <button onClick={() => setMode("create")} className="w-full">
            <GlassPanel className="rounded-[16px] p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-blue-400/15 flex items-center justify-center shrink-0">
                <Plus className="w-4.5 h-4.5 text-blue-300" strokeWidth={2.2} />
              </div>
              <div className="text-left">
                <p className="text-white text-[13.5px] font-semibold">Создать клуб</p>
                <p className="text-gray-500 text-[11px]">Станьте лидером своей команды</p>
              </div>
            </GlassPanel>
          </button>

          <button onClick={() => setMode("join")} className="w-full">
            <GlassPanel className="rounded-[16px] p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-emerald-400/15 flex items-center justify-center shrink-0">
                <Search className="w-4.5 h-4.5 text-emerald-300" strokeWidth={2.2} />
              </div>
              <div className="text-left">
                <p className="text-white text-[13.5px] font-semibold">Найти клуб</p>
                <p className="text-gray-500 text-[11px]">Вступить в существующую команду</p>
              </div>
            </GlassPanel>
          </button>
        </div>
      )}

      {mode === "create" && (
        <div className="flex flex-col gap-3">
          <Input3D
            icon={Shield}
            placeholder="Название клуба"
            value={clanName}
            onChange={(e) => setClanName(e.target.value)}
          />
          <Btn3D className="h-[46px] rounded-[12px]" disabled={clanName.trim().length < 3}>
            <span className="text-[14px] font-semibold">Создать клуб</span>
          </Btn3D>
          <button
            onClick={() => setMode(null)}
            className="text-gray-400 text-[12.5px] text-center hover:text-white transition-colors"
          >
            Назад
          </button>
        </div>
      )}

      {mode === "join" && (
        <div className="flex flex-col gap-3">
          <Input3D icon={Search} placeholder="Поиск клуба по названию" />
          <div className="flex flex-col items-center py-8 text-center">
            <p className="text-gray-500 text-[12px]">Пока нет доступных клубов для поиска</p>
          </div>
          <button
            onClick={() => setMode(null)}
            className="text-gray-400 text-[12.5px] text-center hover:text-white transition-colors"
          >
            Назад
          </button>
        </div>
      )}
    </Sheet>
  );
}

function ClanOverview({ clan }) {
  return (
    <GlassPanel className="rounded-[16px] p-4">
      <p className="text-white text-[15px] font-semibold">{clan.name}</p>
      <p className="text-gray-400 text-[12px] mt-1">{clan.members} участников</p>
    </GlassPanel>
  );
}
