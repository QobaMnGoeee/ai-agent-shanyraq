export default function FlagPlantIllustration({ className = "", flagColor = "#fe4f1c" }) {
  return (
    <svg
      viewBox="0 0 320 260"
      className={className}
      role="img"
      aria-label="Иллюстрация: аумаққа ту қадап тұрған адам"
    >
      {/* Аспан аймағы бос — фон сыртта беріледі */}

      {/* Жер / территория торы */}
      <rect x="20" y="196" width="280" height="44" rx="10" fill="#d5f7e0" />
      <g stroke="#a9edc2" strokeWidth="2">
        <line x1="90" y1="196" x2="90" y2="240" />
        <line x1="160" y1="196" x2="160" y2="240" />
        <line x1="230" y1="196" x2="230" y2="240" />
        <line x1="20" y1="216" x2="300" y2="216" />
      </g>
      {/* Жаулап алынған блок */}
      <rect x="160" y="196" width="70" height="44" fill="#71dd9d" opacity="0.7" />

      {/* Кішкентай бұталар */}
      <circle cx="45" cy="196" r="12" fill="#3fc978" />
      <circle cx="270" cy="196" r="10" fill="#22b25c" />

      {/* Адам фигурасы */}
      <g transform="translate(150 96)">
        {/* Аяқтар */}
        <rect x="6" y="72" width="9" height="34" rx="4" fill="#155c35" />
        <rect x="24" y="72" width="9" height="34" rx="4" fill="#17914a" />
        <ellipse cx="10.5" cy="108" rx="9" ry="4.5" fill="#0a5691" />
        <ellipse cx="28.5" cy="108" rx="9" ry="4.5" fill="#0980db" />

        {/* Дене */}
        <path d="M4 30 Q0 56 8 76 L32 76 Q40 54 34 28 Z" fill="#1aa1fb" />

        {/* Ту ұстаған қол (оң жақ, жоғары көтерілген) */}
        <path
          d="M30 36 Q46 24 46 2"
          stroke="#0e5691"
          strokeWidth="9"
          strokeLinecap="round"
          fill="none"
        />
        {/* Сол қол — бел түйіп тұр */}
        <path
          d="M6 40 Q-6 46 -4 60"
          stroke="#114878"
          strokeWidth="9"
          strokeLinecap="round"
          fill="none"
        />

        {/* Мойын + бас */}
        <rect x="12" y="10" width="12" height="14" rx="4" fill="#f2c29a" />
        <circle cx="17" cy="4" r="15" fill="#f7d4ae" />
        <path d="M2 2 Q6 -12 20 -10 Q32 -8 30 4 Q26 -6 16 -6 Q6 -6 2 2 Z" fill="#5a3a24" />
        <path d="M12 8 Q17 12 22 8" stroke="#3f2a1d" strokeWidth="1.6" fill="none" strokeLinecap="round" />

        {/* Ту таяғы */}
        <rect x="44" y="-38" width="4" height="42" rx="2" fill="#7c3f11" />
        {/* Ту өзі */}
        <path
          d={`M48 -38 L92 -30 L48 -20 Z`}
          fill={flagColor}
        />
      </g>
    </svg>
  );
}
