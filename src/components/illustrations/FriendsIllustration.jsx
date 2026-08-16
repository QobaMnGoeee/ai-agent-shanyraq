export default function FriendsIllustration({ className = "" }) {
  return (
    <svg
      viewBox="0 0 280 190"
      className={className}
      role="img"
      aria-label="Иллюстрация: екі дос қол алысып тұр"
    >
      <ellipse cx="140" cy="170" rx="120" ry="14" fill="#eef9ff" />

      {/* Сол жақ дос */}
      <g transform="translate(56 60)">
        <path d="M18 66 Q8 84 16 100" stroke="#155c35" strokeWidth="9" strokeLinecap="round" fill="none" />
        <path d="M34 66 Q42 84 34 100" stroke="#17914a" strokeWidth="9" strokeLinecap="round" fill="none" />
        <path d="M10 24 Q6 48 16 68 L36 68 Q44 46 38 22 Z" fill="#22b25c" />
        {/* Жоғары көтерілген қол — high-five */}
        <path d="M32 32 Q54 20 58 2" stroke="#e2810a" strokeWidth="9" strokeLinecap="round" fill="none" />
        <path d="M12 36 Q0 44 2 58" stroke="#bc620b" strokeWidth="9" strokeLinecap="round" fill="none" />
        <rect x="16" y="4" width="12" height="13" rx="4" fill="#f2c29a" />
        <circle cx="22" cy="-2" r="14" fill="#f7d4ae" />
        <path d="M8 -4 Q11 -18 24 -16 Q35 -14 33 -3 Q30 -12 21 -12 Q10 -12 8 -4 Z" fill="#3f2a1d" />
        <path d="M16 2 Q22 6 27 2" stroke="#3f2a1d" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        {/* Алақан */}
        <circle cx="60" cy="-4" r="8" fill="#f7d4ae" />
      </g>

      {/* Оң жақ дос */}
      <g transform="translate(150 60)">
        <path d="M14 66 Q22 84 14 100" stroke="#0e5691" strokeWidth="9" strokeLinecap="round" fill="none" />
        <path d="M30 66 Q40 84 32 100" stroke="#114878" strokeWidth="9" strokeLinecap="round" fill="none" />
        <path d="M6 24 Q2 48 12 68 L32 68 Q40 46 34 22 Z" fill="#1aa1fb" />
        {/* Жоғары көтерілген қол — high-five */}
        <path d="M10 32 Q-6 20 -10 4" stroke="#951b72" strokeWidth="9" strokeLinecap="round" fill="none" />
        <path d="M30 36 Q42 44 40 58" stroke="#7a195e" strokeWidth="9" strokeLinecap="round" fill="none" />
        <rect x="12" y="4" width="12" height="13" rx="4" fill="#e2b48a" />
        <circle cx="18" cy="-2" r="14" fill="#eec292" />
        <path d="M4 -4 Q7 -18 20 -16 Q31 -14 29 -3 Q26 -12 17 -12 Q6 -12 4 -4 Z" fill="#2b2320" />
        <path d="M12 2 Q18 6 23 2" stroke="#3f2a1d" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        {/* Алақан */}
        <circle cx="-12" cy="-2" r="8" fill="#eec292" />
      </g>

      {/* High-five жарық сызықтары */}
      <g stroke="#ffbe1f" strokeWidth="2.5" strokeLinecap="round" opacity="0.9">
        <line x1="130" y1="30" x2="138" y2="24" />
        <line x1="130" y1="46" x2="140" y2="46" />
        <line x1="132" y1="60" x2="140" y2="66" />
      </g>
    </svg>
  );
}
