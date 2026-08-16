export default function EmptyStateIllustration({ className = "" }) {
  return (
    <svg
      viewBox="0 0 280 200"
      className={className}
      role="img"
      aria-label="Иллюстрация: әлі ешнәрсе жоқ"
    >
      {/* Жер */}
      <ellipse cx="140" cy="176" rx="110" ry="14" fill="#faf0d8" />

      {/* Кішкентай өсімдіктер */}
      <path d="M40 176 Q40 158 30 150" stroke="#22b25c" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M40 176 Q40 160 50 152" stroke="#3fc978" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M240 176 Q240 160 250 150" stroke="#22b25c" strokeWidth="4" fill="none" strokeLinecap="round" />

      {/* Отырған адам */}
      <g transform="translate(96 70)">
        {/* Аяқтар — бүктеп отырған */}
        <path d="M18 66 Q6 78 16 92" stroke="#e2810a" strokeWidth="10" strokeLinecap="round" fill="none" />
        <path d="M34 66 Q48 76 42 92" stroke="#fca311" strokeWidth="10" strokeLinecap="round" fill="none" />

        {/* Дене */}
        <path d="M10 26 Q6 50 16 68 L38 68 Q46 48 40 24 Z" fill="#d43fae" />

        {/* Қолдар — иекке тіреп отыр */}
        <path d="M14 34 Q0 40 4 54" stroke="#951b72" strokeWidth="8" strokeLinecap="round" fill="none" />
        <path d="M36 34 Q50 40 44 20" stroke="#b6258c" strokeWidth="8" strokeLinecap="round" fill="none" />

        {/* Мойын + бас */}
        <rect x="18" y="6" width="12" height="12" rx="4" fill="#f2c29a" />
        <circle cx="23" cy="0" r="14" fill="#f7d4ae" />
        <path d="M9 -2 Q12 -16 24 -14 Q35 -12 33 -1 Q30 -10 21 -10 Q11 -10 9 -2 Z" fill="#2b2320" />
        {/* Ойлы бет */}
        <line x1="17" y1="1" x2="21" y2="1" stroke="#3f2a1d" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="26" y1="1" x2="30" y2="1" stroke="#3f2a1d" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M18 6 Q23 4 28 6" stroke="#3f2a1d" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </g>

      {/* Айналасындағы кішкентай жұлдыздар */}
      <g fill="#ffd24d">
        <circle cx="70" cy="50" r="3" />
        <circle cx="210" cy="70" r="4" />
        <circle cx="190" cy="30" r="2.5" />
      </g>
    </svg>
  );
}
