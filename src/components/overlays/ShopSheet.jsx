import { useState } from "react";
import { Coins, Palette, Crown, Route, Zap, Check } from "lucide-react";
import Sheet from "../ui/Sheet";
import GlassPanel from "../ui/GlassPanel";
import { SHOP_ITEMS } from "../../lib/mainMenuData";

const CATEGORY_ICONS = {
  colors: Palette,
  cosmetic: Crown,
  boost: Zap,
};

export default function ShopSheet({ onBack, balance = 0 }) {
  const [purchased, setPurchased] = useState({});

  function handleBuy(item) {
    if (balance < item.price || purchased[item.id]) return;
    // TODO: Supabase-те purchase транзакциясы, balance азайту логикасы
    // (пайдаланушы деректер базасы жасалғанда) осы жерге қосылады.
    setPurchased((prev) => ({ ...prev, [item.id]: true }));
  }

  return (
    <Sheet title="Магазин" onBack={onBack}>
      <GlassPanel className="rounded-[16px] p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Coins className="w-5 h-5 text-amber-300" strokeWidth={2.2} />
          <span className="text-white text-[14px] font-medium">Баланс</span>
        </div>
        <span className="text-amber-300 text-[16px] font-bold">
          {balance.toLocaleString("ru-RU")}
        </span>
      </GlassPanel>

      <div className="bg-amber-400/10 border border-amber-300/25 rounded-[12px] px-3.5 py-2.5 mb-4">
        <p className="text-amber-200 text-[11.5px] leading-snug">
          Золотая зона — обменивайте очки на эксклюзивные цвета, значки и ускорители
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {SHOP_ITEMS.map((item) => (
          <ShopItemCard
            key={item.id}
            item={item}
            owned={Boolean(purchased[item.id])}
            affordable={balance >= item.price}
            onBuy={() => handleBuy(item)}
          />
        ))}
      </div>
    </Sheet>
  );
}

function ShopItemCard({ item, owned, affordable, onBuy }) {
  const Icon = CATEGORY_ICONS[item.category] || Route;

  return (
    <GlassPanel className="rounded-[14px] p-3.5 flex items-center gap-3">
      <div className="w-11 h-11 rounded-[12px] bg-white/8 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-gray-200" strokeWidth={2} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-white text-[13px] font-semibold truncate">{item.name}</p>
        <p className="text-gray-500 text-[10.5px] truncate">{item.description}</p>
      </div>

      <button
        onClick={onBuy}
        disabled={owned || !affordable}
        className={`shrink-0 h-8 px-3.5 rounded-[10px] text-[12px] font-semibold flex items-center gap-1.5 transition-all ${
          owned
            ? "bg-emerald-400/15 text-emerald-300"
            : affordable
            ? "btn-3d text-white"
            : "bg-white/5 text-gray-500 cursor-not-allowed"
        }`}
      >
        {owned ? (
          <>
            <Check className="w-3.5 h-3.5" strokeWidth={2.4} />
            Куплено
          </>
        ) : (
          `${item.price.toLocaleString("ru-RU")}`
        )}
      </button>
    </GlassPanel>
  );
}
