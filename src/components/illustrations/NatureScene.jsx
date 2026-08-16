/**
 * Ashyk fon uchin kishkentai tabigi decor — tobeshik, agash, kun.
 * AuthCard / MainMenuPage siyakty ashyk fonda pozitsiya arqyly qoyyladi.
 */
export function HillsDecor({ className = "" }) {
  return (
    <svg
      viewBox="0 0 400 120"
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 60 Q60 20 130 48 Q200 76 260 40 Q330 4 400 36 L400 120 L0 120 Z"
        fill="#d5f7e0"
      />
      <path
        d="M0 84 Q80 56 160 78 Q240 100 320 70 Q360 56 400 68 L400 120 L0 120 Z"
        fill="#a9edc2"
      />
    </svg>
  );
}

export function SunDecor({ className = "" }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden="true">
      <circle cx="40" cy="40" r="18" fill="#ffbe1f" />
      <g stroke="#ffd24d" strokeWidth="4" strokeLinecap="round">
        <line x1="40" y1="6" x2="40" y2="14" />
        <line x1="40" y1="66" x2="40" y2="74" />
        <line x1="6" y1="40" x2="14" y2="40" />
        <line x1="66" y1="40" x2="74" y2="40" />
        <line x1="15" y1="15" x2="21" y2="21" />
        <line x1="59" y1="59" x2="65" y2="65" />
        <line x1="59" y1="21" x2="65" y2="15" />
        <line x1="15" y1="65" x2="21" y2="59" />
      </g>
    </svg>
  );
}

export function TreeDecor({ className = "", tone = "leaf" }) {
  const colors =
    tone === "leaf"
      ? { trunk: "#bc620b", canopy1: "#3fc978", canopy2: "#22b25c" }
      : { trunk: "#7c3f11", canopy1: "#71dd9d", canopy2: "#3fc978" };
  return (
    <svg viewBox="0 0 60 70" className={className} aria-hidden="true">
      <rect x="26" y="46" width="8" height="22" rx="3" fill={colors.trunk} />
      <circle cx="30" cy="34" r="22" fill={colors.canopy1} />
      <circle cx="14" cy="44" r="14" fill={colors.canopy2} />
      <circle cx="46" cy="44" r="14" fill={colors.canopy2} />
    </svg>
  );
}

export function CloudDecor({ className = "" }) {
  return (
    <svg viewBox="0 0 100 50" className={className} aria-hidden="true">
      <ellipse cx="30" cy="30" rx="26" ry="16" fill="#ffffff" />
      <ellipse cx="55" cy="24" rx="20" ry="14" fill="#ffffff" />
      <ellipse cx="72" cy="32" rx="16" ry="11" fill="#ffffff" />
    </svg>
  );
}
