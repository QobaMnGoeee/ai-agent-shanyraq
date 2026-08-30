import { useCallback, useEffect, useState } from "react";
import { Search, Trophy, UserPlus, Check, X, Loader2, Inbox, Clock } from "lucide-react";
import Sheet from "../ui/Sheet";
import GlassPanel from "../ui/GlassPanel";
import Input3D from "../ui/Input3D";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { FriendsIllustration } from "../illustrations";

const TABS = {
  FRIENDS: "friends",
  SEARCH: "search",
  REQUESTS: "requests",
};

export default function FriendsSheet({ onBack }) {
  const { user } = useAuth();
  const [tab, setTab] = useState(TABS.FRIENDS);

  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);

  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [actioningId, setActioningId] = useState(null);

  const loadFriends = useCallback(async () => {
    if (!user) return;
    setLoadingFriends(true);
    const { data } = await supabase
      .from("my_friends_view")
      .select("friend_id, username, color, total_score")
      .order("total_score", { ascending: false });
    setFriends(data || []);
    setLoadingFriends(false);
  }, [user]);

  const loadRequests = useCallback(async () => {
    if (!user) return;
    setLoadingRequests(true);
    const { data } = await supabase
      .from("my_pending_requests_view")
      .select("friendship_id, id, username, color, created_at")
      .order("created_at", { ascending: false });
    setRequests(data || []);
    setLoadingRequests(false);
  }, [user]);

  useEffect(() => {
    loadFriends();
    loadRequests();
  }, [loadFriends, loadRequests]);

  // Достар/сұраныстар кестесіндегі өзгерістерді нақты уақытта көру
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("friendships-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "friendships" },
        () => {
          loadFriends();
          loadRequests();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadFriends, loadRequests]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      const { data, error } = await supabase.rpc("search_users_by_username", {
        search_query: query.trim(),
      });
      setSearching(false);
      if (!error) setResults(data || []);
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  async function handleSendRequest(targetId) {
    if (!user) return;
    setActioningId(targetId);
    const { error } = await supabase
      .from("friendships")
      .insert({ requester_id: user.id, addressee_id: targetId });
    setActioningId(null);
    if (!error) {
      setResults((prev) =>
        prev.map((r) => (r.id === targetId ? { ...r, friendship_status: "pending" } : r))
      );
    }
  }

  async function handleAcceptRequest(friendshipId) {
    setActioningId(friendshipId);
    await supabase.from("friendships").update({ status: "accepted", responded_at: new Date().toISOString() }).eq("id", friendshipId);
    setActioningId(null);
    loadRequests();
    loadFriends();
  }

  async function handleDeclineRequest(friendshipId) {
    setActioningId(friendshipId);
    await supabase.from("friendships").update({ status: "declined", responded_at: new Date().toISOString() }).eq("id", friendshipId);
    setActioningId(null);
    loadRequests();
  }

  async function handleRemoveFriend(friendId) {
    if (!user) return;
    setActioningId(friendId);
    await supabase
      .from("friendships")
      .delete()
      .or(
        `and(requester_id.eq.${user.id},addressee_id.eq.${friendId}),and(requester_id.eq.${friendId},addressee_id.eq.${user.id})`
      );
    setActioningId(null);
    loadFriends();
  }

  return (
    <Sheet title="Друзья" onBack={onBack}>
      {/* Табтар */}
      <div className="flex gap-1.5 bg-cream-100 rounded-2xl p-1 mb-4">
        <TabButton
          active={tab === TABS.FRIENDS}
          onClick={() => setTab(TABS.FRIENDS)}
          icon={Trophy}
          label="Друзья"
        />
        <TabButton
          active={tab === TABS.SEARCH}
          onClick={() => setTab(TABS.SEARCH)}
          icon={Search}
          label="Найти"
        />
        <TabButton
          active={tab === TABS.REQUESTS}
          onClick={() => setTab(TABS.REQUESTS)}
          icon={Inbox}
          label="Заявки"
          badge={requests.length > 0 ? requests.length : null}
        />
      </div>

      {tab === TABS.SEARCH && (
        <div className="flex flex-col gap-2.5">
          <Input3D
            icon={Search}
            placeholder="Найти по имени пользователя"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />

          {searching && (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 text-leaf-400 animate-spin" strokeWidth={2.4} />
            </div>
          )}

          {!searching && query.trim() && results.length === 0 && (
            <p className="text-ink-400 text-[12.5px] font-medium text-center py-6">
              Никого не нашлось
            </p>
          )}

          <div className="flex flex-col gap-2">
            {results.map((r) => (
              <GlassPanel key={r.id} className="rounded-2xl p-3 flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white text-[13px] font-extrabold shrink-0 shadow-card"
                  style={{ backgroundColor: r.color || "#22b25c" }}
                >
                  {(r.username || "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-ink-800 text-[13px] font-bold truncate">{r.username}</p>
                  <p className="text-ink-400 text-[10.5px] font-medium">
                    {Math.floor(r.total_score || 0).toLocaleString("ru-RU")} очков
                  </p>
                </div>

                <RequestActionButton
                  status={r.friendship_status}
                  loading={actioningId === r.id}
                  onSend={() => handleSendRequest(r.id)}
                />
              </GlassPanel>
            ))}
          </div>
        </div>
      )}

      {tab === TABS.REQUESTS && (
        <div className="flex flex-col gap-2">
          {loadingRequests ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-[62px] rounded-2xl bg-cream-100 animate-pulse" />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Clock className="w-9 h-9 text-ink-300 mb-3" strokeWidth={1.6} />
              <p className="text-ink-700 text-[14px] font-bold">Заявок нет</p>
              <p className="text-ink-400 text-[12px] font-medium mt-1 max-w-[220px]">
                Здесь появятся заявки в друзья от других игроков
              </p>
            </div>
          ) : (
            requests.map((req) => (
              <GlassPanel key={req.friendship_id} className="rounded-2xl p-3 flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white text-[13px] font-extrabold shrink-0 shadow-card"
                  style={{ backgroundColor: req.color || "#22b25c" }}
                >
                  {(req.username || "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-ink-800 text-[13px] font-bold truncate">{req.username}</p>
                  <p className="text-ink-400 text-[10.5px] font-medium">Хочет добавить в друзья</p>
                </div>

                {actioningId === req.friendship_id ? (
                  <Loader2 className="w-4 h-4 text-leaf-400 animate-spin shrink-0" strokeWidth={2.4} />
                ) : (
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => handleAcceptRequest(req.friendship_id)}
                      className="w-8 h-8 rounded-xl bg-leaf-500 text-white flex items-center justify-center hover:bg-leaf-600 active:scale-95 transition-all"
                      aria-label="Принять"
                    >
                      <Check className="w-4 h-4" strokeWidth={2.6} />
                    </button>
                    <button
                      onClick={() => handleDeclineRequest(req.friendship_id)}
                      className="w-8 h-8 rounded-xl bg-ink-100 text-ink-500 flex items-center justify-center hover:bg-coral-100 hover:text-coral-600 active:scale-95 transition-all"
                      aria-label="Отклонить"
                    >
                      <X className="w-4 h-4" strokeWidth={2.6} />
                    </button>
                  </div>
                )}
              </GlassPanel>
            ))
          )}
        </div>
      )}

      {tab === TABS.FRIENDS && (
        <div className="flex flex-col gap-2">
          {loadingFriends ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-[62px] rounded-2xl bg-cream-100 animate-pulse" />
              ))}
            </div>
          ) : friends.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <FriendsIllustration className="w-full max-w-[200px] h-auto mb-3" />
              <p className="text-ink-700 text-[14px] font-bold">Пока нет друзей</p>
              <p className="text-ink-400 text-[12px] font-medium mt-1 max-w-[220px]">
                Найдите игроков во вкладке «Найти» по имени пользователя
              </p>
              <button
                onClick={() => setTab(TABS.SEARCH)}
                className="btn-3d h-[40px] px-5 rounded-xl mt-4 flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4 text-white" strokeWidth={2.3} />
                <span className="text-[13px] font-bold text-white">Найти друзей</span>
              </button>
            </div>
          ) : (
            friends.map((f, i) => (
              <GlassPanel key={f.friend_id} className="rounded-2xl p-3 flex items-center gap-3">
                <span className="w-6 text-ink-400 text-[13px] font-bold text-center shrink-0">
                  {i + 1}
                </span>
                <div
                  className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white text-[13px] font-extrabold shrink-0 shadow-card"
                  style={{ backgroundColor: f.color || "#22b25c" }}
                >
                  {(f.username || "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-ink-800 text-[13px] font-bold truncate">{f.username}</p>
                  <p className="text-ink-400 text-[10.5px] font-medium">
                    {Math.floor(f.total_score || 0).toLocaleString("ru-RU")} очков
                  </p>
                </div>
                {actioningId === f.friend_id ? (
                  <Loader2 className="w-4 h-4 text-leaf-400 animate-spin shrink-0" strokeWidth={2.4} />
                ) : (
                  <button
                    onClick={() => handleRemoveFriend(f.friend_id)}
                    className="text-ink-300 hover:text-coral-500 transition-colors shrink-0 p-1.5"
                    aria-label="Удалить из друзей"
                  >
                    <X className="w-4 h-4" strokeWidth={2.2} />
                  </button>
                )}
              </GlassPanel>
            ))
          )}
        </div>
      )}
    </Sheet>
  );
}

function TabButton({ active, onClick, icon: Icon, label, badge }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 h-9 rounded-xl flex items-center justify-center gap-1.5 text-[11.5px] font-bold transition-all relative ${
        active ? "bg-white text-leaf-700 shadow-card" : "text-ink-400 hover:text-ink-600"
      }`}
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={2.3} />
      <span>{label}</span>
      {badge && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-coral-500 text-white text-[9px] font-extrabold flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}

function RequestActionButton({ status, loading, onSend }) {
  if (loading) {
    return <Loader2 className="w-4 h-4 text-leaf-400 animate-spin shrink-0" strokeWidth={2.4} />;
  }
  if (status === "accepted") {
    return (
      <span className="text-[11px] font-extrabold text-leaf-600 shrink-0 flex items-center gap-1">
        <Check className="w-3.5 h-3.5" strokeWidth={2.6} />
        Друзья
      </span>
    );
  }
  if (status === "pending") {
    return <span className="text-[11px] font-bold text-ink-300 shrink-0">Заявка отправлена</span>;
  }
  return (
    <button
      onClick={onSend}
      className="shrink-0 w-8 h-8 rounded-xl btn-3d flex items-center justify-center"
      aria-label="Добавить в друзья"
    >
      <UserPlus className="w-4 h-4 text-white" strokeWidth={2.3} />
    </button>
  );
}
