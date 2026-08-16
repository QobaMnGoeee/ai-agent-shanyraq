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
      <GlassPanel className="rounded-2xl p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Coins className="w-5 h-5 text-sun-500" strokeWidth={2.2} />
          <span className="text-ink-800 text-[14px] font-bold">Баланс</span>
        </div>
        <span className="text-sun-600 text-[16px] font-extrabold">
          {balance.toLocaleString("ru-RU")}
        </span>
      </GlassPanel>

      <div className="bg-sun-50 border-2 border-sun-200 rounded-2xl px-3.5 py-2.5 mb-4">
        <p className="text-sun-700 text-[11.5px] font-semibold leading-snug">
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
    <GlassPanel className="rounded-2xl p-3.5 flex items-center gap-3">
      <div className="w-11 h-11 rounded-2xl bg-cream-100 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-leaf-600" strokeWidth={2} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-ink-800 text-[13px] font-bold truncate">{item.name}</p>
        <p className="text-ink-400 text-[10.5px] font-medium truncate">{item.description}</p>
      </div>

      <button
        onClick={onBuy}
        disabled={owned || !affordable}
        className={`shrink-0 h-9 px-3.5 rounded-xl text-[12px] font-extrabold flex items-center gap-1.5 transition-all ${
          owned
            ? "bg-leaf-100 text-leaf-700"
            : affordable
            ? "btn-3d text-white"
            : "bg-ink-100 text-ink-300 cursor-not-allowed"
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
