export default function RunnerIllustration({ className = "" }) {
  return (
    <svg
      viewBox="0 0 320 260"
      className={className}
      role="img"
      aria-label="Иллюстрация: жүгіріп келе жатқан адам"
    >
      {/* Жер / төбешік */}
      <ellipse cx="160" cy="230" rx="140" ry="18" fill="#d5f7e0" />
      <path
        d="M20 232 Q90 200 160 224 Q230 248 300 220 L300 250 L20 250 Z"
        fill="#a9edc2"
      />

      {/* Бұлттар */}
      <g opacity="0.9">
        <ellipse cx="55" cy="42" rx="26" ry="15" fill="#ffffff" />
        <ellipse cx="75" cy="36" rx="20" ry="13" fill="#ffffff" />
        <ellipse cx="255" cy="60" rx="22" ry="13" fill="#ffffff" />
        <ellipse cx="272" cy="54" rx="16" ry="10" fill="#ffffff" />
      </g>

      {/* Кішкентай ағаштар */}
      <g>
        <rect x="46" y="188" width="7" height="26" rx="2" fill="#bc620b" />
        <circle cx="49.5" cy="178" r="20" fill="#3fc978" />
        <circle cx="35" cy="188" r="14" fill="#22b25c" />
        <circle cx="64" cy="188" r="14" fill="#22b25c" />
      </g>
      <g>
        <rect x="262" y="196" width="6" height="22" rx="2" fill="#bc620b" />
        <circle cx="265" cy="188" r="16" fill="#3fc978" />
      </g>

      {/* Күн */}
      <circle cx="270" cy="34" r="16" fill="#ffbe1f" />

      {/* Жүгіріп келе жатқан адам */}
      <g transform="translate(120 92)">
        {/* Артқы аяқ */}
        <path
          d="M32 78 Q42 96 30 118"
          stroke="#155c35"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />
        {/* Алдыңғы аяқ */}
        <path
          d="M18 80 Q4 100 14 122"
          stroke="#17914a"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />
        {/* Дене / көйлек */}
        <path
          d="M14 34 Q10 60 22 82 L40 78 Q46 52 38 30 Z"
          fill="#22b25c"
        />
        {/* Артқы қол */}
        <path
          d="M18 42 Q-2 50 -6 30"
          stroke="#e2810a"
          strokeWidth="9"
          strokeLinecap="round"
          fill="none"
        />
        {/* Алдыңғы қол */}
        <path
          d="M32 40 Q52 46 54 26"
          stroke="#fca311"
          strokeWidth="9"
          strokeLinecap="round"
          fill="none"
        />
        {/* Мойын */}
        <rect x="22" y="14" width="12" height="14" rx="4" fill="#f2c29a" />
        {/* Бас */}
        <circle cx="27" cy="8" r="15" fill="#f7d4ae" />
        {/* Шаш */}
        <path d="M12 6 Q16 -8 30 -6 Q42 -4 40 8 Q36 -2 26 -2 Q16 -2 12 6 Z" fill="#3f2a1d" />
        {/* Бет белгісі — жымиған */}
        <path d="M22 12 Q27 16 32 12" stroke="#3f2a1d" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        {/* Аяқ киім */}
        <ellipse cx="12" cy="124" rx="10" ry="5" fill="#0a5691" />
        <ellipse cx="32" cy="120" rx="10" ry="5" fill="#0980db" />
      </g>
    </svg>
  );
}
