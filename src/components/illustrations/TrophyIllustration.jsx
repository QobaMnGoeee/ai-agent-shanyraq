export default function TrophyIllustration({ className = "" }) {
  return (
    <svg
      viewBox="0 0 200 170"
      className={className}
      role="img"
      aria-label="Иллюстрация: жүлде кубогы"
    >
      {/* Негіз */}
      <ellipse cx="100" cy="150" rx="60" ry="10" fill="#faf0d8" />
      <rect x="76" y="128" width="48" height="16" rx="4" fill="#e2810a" />
      <rect x="86" y="112" width="28" height="20" fill="#fca311" />

      {/* Кубок тұтқалары */}
      <path
        d="M60 46 Q30 46 32 76 Q34 98 62 98"
        fill="none"
        stroke="#ffbe1f"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M140 46 Q170 46 168 76 Q166 98 138 98"
        fill="none"
        stroke="#ffbe1f"
        strokeWidth="9"
        strokeLinecap="round"
      />

      {/* Кубок денесі */}
      <path
        d="M58 40 H142 L134 96 Q100 118 66 96 Z"
        fill="#ffd24d"
      />
      <path
        d="M58 40 H142 L138 62 H62 Z"
        fill="#ffbe1f"
      />

      {/* Жұлдыз белгісі */}
      <path
        d="M100 62 L106 76 L121 78 L110 88 L113 103 L100 95 L87 103 L90 88 L79 78 L94 76 Z"
        fill="#e2810a"
      />

      {/* Конфетти */}
      <g>
        <rect x="30" y="20" width="6" height="6" rx="1.5" fill="#fe4f1c" transform="rotate(20 33 23)" />
        <rect x="164" y="30" width="6" height="6" rx="1.5" fill="#1aa1fb" transform="rotate(-15 167 33)" />
        <circle cx="50" cy="12" r="4" fill="#22b25c" />
        <circle cx="150" cy="16" r="3.5" fill="#d43fae" />
        <rect x="90" y="6" width="5" height="5" rx="1.5" fill="#fca311" transform="rotate(35 92 8)" />
      </g>
    </svg>
  );
}
