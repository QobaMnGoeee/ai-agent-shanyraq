export const LEAGUES = [
  { id: "bronze", name: "Бронза", color: "#CD7F32", minScore: 0 },
  { id: "silver", name: "Серебро", color: "#C0C0C0", minScore: 5000 },
  { id: "gold", name: "Золото", color: "#FFD700", minScore: 20000 },
  { id: "platinum", name: "Платина", color: "#A78BDA", minScore: 50000 },
  { id: "diamond", name: "Алмаз", color: "#7DD3FC", minScore: 100000 },
];

export function getLeagueForScore(score) {
  let current = LEAGUES[0];
  for (const league of LEAGUES) {
    if (score >= league.minScore) current = league;
  }
  return current;
}

export const MISSIONS = [
  {
    id: "follow-instagram",
    title: "Подпишись на Instagram",
    description: "Подпишись на официальный Instagram Stepland",
    reward: 1000,
    type: "social",
    url: "https://instagram.com/stepland",
  },
  {
    id: "join-telegram",
    title: "Вступи в Telegram",
    description: "Подпишись на канал Stepland в Telegram",
    reward: 1000,
    type: "social",
    url: "https://t.me/stepland",
  },
];

export const SHOP_ITEMS = [
  {
    id: "color-neon",
    name: "Неоновый набор цветов",
    description: "5 эксклюзивных неоновых цветов территории",
    price: 5000,
    category: "colors",
  },
  {
    id: "marker-crown",
    name: "Значок короны",
    description: "Показывает корону рядом с вашим именем",
    price: 8000,
    category: "cosmetic",
  },
  {
    id: "trail-gold",
    name: "Золотой след",
    description: "Ваш маршрут отображается золотым цветом",
    price: 12000,
    category: "cosmetic",
  },
  {
    id: "boost-2x",
    name: "Ускоритель x2 (24ч)",
    description: "Удвоенные очки за захват на 24 часа",
    price: 15000,
    category: "boost",
  },
];

export const MOCK_FRIENDS = [
  { id: "f1", username: "Alisher_K", color: "#00FF88", online: true },
  { id: "f2", username: "Dana_Runner", color: "#FF5733", online: false },
];

export const MOCK_CLAN = null; // null = пайдаланушы әлі клубқа кірмеген

/**
 * Блок үшін очко есептеу (сағат сайын жаңартылатын деңгей жүйесі):
 * - 10 блокқа дейін: блок үшін 3 очко
 * - 10-50 блок: блок үшін 4 очко
 * - 50+ блок: блок үшін 5 очко
 */
export function pointsPerBlock(totalBlocks) {
  if (totalBlocks > 50) return 5;
  if (totalBlocks > 10) return 4;
  return 3;
}
