import { useState } from "react";
import { Plus, Search, Shield } from "lucide-react";
import Sheet from "../ui/Sheet";
import GlassPanel from "../ui/GlassPanel";
import Input3D from "../ui/Input3D";
import Btn3D from "../ui/Btn3D";
import { MOCK_CLAN } from "../../lib/mainMenuData";
import { FriendsIllustration } from "../illustrations";

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
          <div className="flex flex-col items-center py-2 text-center">
            <FriendsIllustration className="w-full max-w-[200px] h-auto mb-2" />
            <p className="text-ink-700 text-[14px] font-bold">Вы ещё не в клубе</p>
            <p className="text-ink-400 text-[12px] font-medium mt-1 max-w-[240px]">
              Создайте свой клуб или вступите в существующий, чтобы соревноваться командой
            </p>
          </div>

          <button onClick={() => setMode("create")} className="w-full">
            <GlassPanel className="rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky2-100 flex items-center justify-center shrink-0">
                <Plus className="w-4.5 h-4.5 text-sky2-600" strokeWidth={2.2} />
              </div>
              <div className="text-left">
                <p className="text-ink-800 text-[13.5px] font-bold">Создать клуб</p>
                <p className="text-ink-400 text-[11px] font-medium">Станьте лидером своей команды</p>
              </div>
            </GlassPanel>
          </button>

          <button onClick={() => setMode("join")} className="w-full">
            <GlassPanel className="rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-leaf-100 flex items-center justify-center shrink-0">
                <Search className="w-4.5 h-4.5 text-leaf-600" strokeWidth={2.2} />
              </div>
              <div className="text-left">
                <p className="text-ink-800 text-[13.5px] font-bold">Найти клуб</p>
                <p className="text-ink-400 text-[11px] font-medium">Вступить в существующую команду</p>
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
          <Btn3D className="h-[48px] rounded-2xl" disabled={clanName.trim().length < 3}>
            <span className="text-[14px] font-bold">Создать клуб</span>
          </Btn3D>
          <button
            onClick={() => setMode(null)}
            className="text-ink-400 text-[12.5px] font-semibold text-center hover:text-leaf-600 transition-colors"
          >
            Назад
          </button>
        </div>
      )}

      {mode === "join" && (
        <div className="flex flex-col gap-3">
          <Input3D icon={Search} placeholder="Поиск клуба по названию" />
          <div className="flex flex-col items-center py-8 text-center">
            <p className="text-ink-400 text-[12px] font-medium">Пока нет доступных клубов для поиска</p>
          </div>
          <button
            onClick={() => setMode(null)}
            className="text-ink-400 text-[12.5px] font-semibold text-center hover:text-leaf-600 transition-colors"
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
    <GlassPanel className="rounded-2xl p-4">
      <p className="text-ink-800 text-[15px] font-bold">{clan.name}</p>
      <p className="text-ink-400 text-[12px] font-semibold mt-1">{clan.members} участников</p>
    </GlassPanel>
  );
}
