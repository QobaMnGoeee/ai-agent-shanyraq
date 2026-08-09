import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "stepland_cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    // sessionStorage — тек осы сессияда қайта көрсетпеу үшін (артефакт саясаты
    // бойынша localStorage жоқ, бірақ бұл нақты сайт болғандықтан кәдімгі
    // браузерде sessionStorage/localStorage қауіпсіз қолданылады)
    try {
      const dismissed = window.localStorage.getItem(STORAGE_KEY);
      if (!dismissed) {
        const t = setTimeout(() => setVisible(true), 600);
        return () => clearTimeout(t);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  function dismiss(value) {
    setClosing(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // localStorage қолжетімсіз болса, елемей жалғастыру
    }
    setTimeout(() => setVisible(false), 250);
  }

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-3 left-1/2 -translate-x-1/2 w-[92%] max-w-[420px] z-50 transition-all duration-250 ${
        closing ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
      }`}
    >
      <div className="glass-panel rounded-[16px] px-4 py-3.5 flex items-start gap-3 shadow-lg">
        <div className="shrink-0 w-8 h-8 rounded-[10px] bg-amber-400/15 border border-amber-300/25 flex items-center justify-center">
          <Cookie className="w-4 h-4 text-amber-300" strokeWidth={2.2} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-gray-200 text-[12px] leading-snug">
            Мы используем файлы cookie для обеспечения работы сайта.
          </p>
          <div className="flex gap-2 mt-2.5">
            <button
              onClick={() => dismiss("accepted")}
              className="btn-3d h-[30px] px-3.5 rounded-[8px] text-[12px] font-semibold"
            >
              Понятно
            </button>
            <button
              onClick={() => dismiss("declined")}
              className="h-[30px] px-3.5 rounded-[8px] text-[12px] font-medium bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              Отклонить
            </button>
          </div>
        </div>

        <button
          onClick={() => dismiss("declined")}
          className="shrink-0 text-gray-500 hover:text-gray-300 transition-colors"
          aria-label="Закрыть"
        >
          <X className="w-3.5 h-3.5" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}
