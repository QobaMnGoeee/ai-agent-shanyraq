import { Loader2 } from "lucide-react";

export default function GoogleButton({ onClick, loading = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full h-[46px] rounded-[12px] flex items-center justify-center gap-2.5 bg-white/95 hover:bg-white text-gray-800 font-medium text-[14px] transition-colors disabled:opacity-60"
    >
      {loading ? (
        <Loader2 className="animate-spin shrink-0" style={{ width: 18, height: 18 }} strokeWidth={2.2} />
      ) : (
        <GoogleIcon className="shrink-0" style={{ width: 18, height: 18 }} />
      )}
      <span>Продолжить с Google</span>
    </button>
  );
}

function GoogleIcon({ style, className }) {
  return (
    <svg viewBox="0 0 24 24" style={style} className={className}>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.87-3.01c-1.07.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.95H1.27v3.1A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.27a12 12 0 0 0 0 10.78z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.61l4 3.1C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}
