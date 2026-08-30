import { useCallback, useEffect, useState } from "react";
import { Plus, Search, Shield, Users, MapPin, Loader2, LogOut, Crown } from "lucide-react";
import Sheet from "../ui/Sheet";
import GlassPanel from "../ui/GlassPanel";
import Input3D from "../ui/Input3D";
import Btn3D from "../ui/Btn3D";
import { useAuth } from "../../context/AuthContext";
import { useGeolocation } from "../../lib/useGeolocation";
import { supabase } from "../../lib/supabase";
import { FriendsIllustration } from "../illustrations";

export default function ClanSheet({ onBack }) {
  const { user } = useAuth();
  const { position } = useGeolocation();

  const [myClan, setMyClan] = useState(undefined); // undefined = жүктелуде
  const [mode, setMode] = useState(null); // null | 'create' | 'join'

  const [clanName, setClanName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const [nearby, setNearby] = useState([]);
  const [searchingNearby, setSearchingNearby] = useState(false);
  const [joiningId, setJoiningId] = useState(null);

  const [leaving, setLeaving] = useState(false);

  const loadMyClan = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("clan_members")
      .select("clan_id, clans(id, name, owner_id)")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!data) {
      setMyClan(null);
      return;
    }

    const { count } = await supabase
      .from("clan_members")
      .select("user_id", { count: "exact", head: true })
      .eq("clan_id", data.clan_id);

    setMyClan({
      id: data.clans.id,
      name: data.clans.name,
      isOwner: data.clans.owner_id === user.id,
      memberCount: count || 1,
    });
  }, [user]);

  useEffect(() => {
    loadMyClan();
  }, [loadMyClan]);

  async function handleCreateClan() {
    if (!user || clanName.trim().length < 3) return;
    setCreating(true);
    setCreateError(null);

    const { data: clan, error } = await supabase
      .from("clans")
      .insert({
        name: clanName.trim(),
        owner_id: user.id,
        home_lat: position?.lat ?? null,
        home_lng: position?.lng ?? null,
      })
      .select()
      .single();

    if (error) {
      setCreating(false);
      setCreateError(
        error.code === "23505" ? "Клуб с таким названием уже существует" : "Не удалось создать клуб"
      );
      return;
    }

    await supabase.from("clan_members").insert({ clan_id: clan.id, user_id: user.id });
    setCreating(false);
    setMode(null);
    loadMyClan();
  }

  async function handleSearchNearby() {
    if (!position) return;
    setSearchingNearby(true);
    const { data, error } = await supabase.rpc("nearby_clans", {
      user_lat: position.lat,
      user_lng: position.lng,
      radius_km: 25,
    });
    setSearchingNearby(false);
    if (!error) setNearby(data || []);
  }

  useEffect(() => {
    if (mode === "join" && position) {
      handleSearchNearby();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, position]);

  async function handleJoinClan(clanId) {
    if (!user) return;
    setJoiningId(clanId);
    const { error } = await supabase.from("clan_members").insert({ clan_id: clanId, user_id: user.id });
    setJoiningId(null);
    if (!error) {
      setMode(null);
      loadMyClan();
    }
  }

  async function handleLeaveClan() {
    if (!user || !myClan) return;
    setLeaving(true);
    await supabase.from("clan_members").delete().eq("clan_id", myClan.id).eq("user_id", user.id);
    setLeaving(false);
    setMyClan(null);
  }

  if (myClan === undefined) {
    return (
      <Sheet title="Клуб" onBack={onBack}>
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 text-leaf-400 animate-spin" strokeWidth={2.4} />
        </div>
      </Sheet>
    );
  }

  if (myClan) {
    return (
      <Sheet title="Клуб" onBack={onBack}>
        <GlassPanel className="rounded-2xl p-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky2-100 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-sky2-600" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-ink-800 text-[16px] font-extrabold truncate">{myClan.name}</p>
                {myClan.isOwner && <Crown className="w-3.5 h-3.5 text-sun-500 shrink-0" strokeWidth={2.3} />}
              </div>
              <p className="text-ink-400 text-[11.5px] font-semibold">
                {myClan.memberCount} {pluralMembers(myClan.memberCount)}
              </p>
            </div>
          </div>
        </GlassPanel>

        <button
          onClick={handleLeaveClan}
          disabled={leaving}
          className="w-full h-[44px] rounded-2xl flex items-center justify-center gap-2 bg-coral-50 border-2 border-coral-200 text-coral-600 font-bold hover:bg-coral-100 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {leaving ? (
            <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.4} />
          ) : (
            <LogOut className="w-4 h-4" strokeWidth={2.2} />
          )}
          <span className="text-[13px] font-bold">
            {myClan.isOwner ? "Покинуть клуб" : "Выйти из клуба"}
          </span>
        </button>
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
                <MapPin className="w-4.5 h-4.5 text-leaf-600" strokeWidth={2.2} />
              </div>
              <div className="text-left">
                <p className="text-ink-800 text-[13.5px] font-bold">Найти клуб рядом</p>
                <p className="text-ink-400 text-[11px] font-medium">По вашей текущей геолокации</p>
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
            autoFocus
          />
          {createError && (
            <div className="bg-coral-50 border-2 border-coral-200 rounded-2xl px-3 py-2">
              <p className="text-coral-600 text-[12px] font-semibold">{createError}</p>
            </div>
          )}
          {!position && (
            <p className="text-ink-300 text-[11px] font-medium px-1">
              GPS не определён — клуб будет создан без "домашней" точки для поиска рядом
            </p>
          )}
          <Btn3D
            onClick={handleCreateClan}
            loading={creating}
            className="h-[48px] rounded-2xl"
            disabled={clanName.trim().length < 3}
          >
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
          {!position ? (
            <div className="flex flex-col items-center py-10 text-center">
              <MapPin className="w-9 h-9 text-ink-300 mb-3" strokeWidth={1.6} />
              <p className="text-ink-700 text-[14px] font-bold">Нужна геолокация</p>
              <p className="text-ink-400 text-[12px] font-medium mt-1 max-w-[220px]">
                Включите GPS, чтобы найти клубы рядом с вами
              </p>
            </div>
          ) : searchingNearby ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-[62px] rounded-2xl bg-cream-100 animate-pulse" />
              ))}
            </div>
          ) : nearby.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Users className="w-9 h-9 text-ink-300 mb-3" strokeWidth={1.6} />
              <p className="text-ink-700 text-[14px] font-bold">Рядом клубов нет</p>
              <p className="text-ink-400 text-[12px] font-medium mt-1 max-w-[220px]">
                В радиусе 25 км пока никто не создал клуб — станьте первым!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {nearby.map((c) => (
                <GlassPanel key={c.id} className="rounded-2xl p-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-sky2-100 flex items-center justify-center shrink-0">
                    <Shield className="w-4.5 h-4.5 text-sky2-600" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-ink-800 text-[13.5px] font-bold truncate">{c.name}</p>
                    <p className="text-ink-400 text-[11px] font-medium">
                      {c.member_count} {pluralMembers(c.member_count)} · {c.distance_km} км
                    </p>
                  </div>
                  <button
                    onClick={() => handleJoinClan(c.id)}
                    disabled={joiningId === c.id}
                    className="btn-3d h-8 px-3.5 rounded-xl text-[12px] font-extrabold shrink-0 disabled:opacity-50"
                  >
                    {joiningId === c.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2.4} />
                    ) : (
                      "Вступить"
                    )}
                  </button>
                </GlassPanel>
              ))}
            </div>
          )}

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

function pluralMembers(count) {
  const n = count % 10;
  const n2 = count % 100;
  if (n2 >= 11 && n2 <= 14) return "участников";
  if (n === 1) return "участник";
  if (n >= 2 && n <= 4) return "участника";
  return "участников";
}
