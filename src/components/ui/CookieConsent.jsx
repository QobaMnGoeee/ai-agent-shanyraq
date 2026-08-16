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
      <div className="glass-panel rounded-2xl px-4 py-3.5 flex items-start gap-3 shadow-card-lg">
        <div className="shrink-0 w-8 h-8 rounded-xl bg-sun-100 border-2 border-sun-200 flex items-center justify-center">
          <Cookie className="w-4 h-4 text-sun-600" strokeWidth={2.2} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-ink-600 text-[12px] font-medium leading-snug">
            Мы используем файлы cookie для обеспечения работы сайта.
          </p>
          <div className="flex gap-2 mt-2.5">
            <button
              onClick={() => dismiss("accepted")}
              className="btn-3d h-[32px] px-3.5 rounded-xl text-[12px] font-bold"
            >
              Понятно
            </button>
            <button
              onClick={() => dismiss("declined")}
              className="h-[32px] px-3.5 rounded-xl text-[12px] font-bold bg-ink-50 border-2 border-ink-100 text-ink-500 hover:bg-ink-100 hover:text-ink-700 transition-colors"
            >
              Отклонить
            </button>
          </div>
        </div>

        <button
          onClick={() => dismiss("declined")}
          className="shrink-0 text-ink-300 hover:text-coral-500 transition-colors"
          aria-label="Закрыть"
        >
          <X className="w-3.5 h-3.5" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}
