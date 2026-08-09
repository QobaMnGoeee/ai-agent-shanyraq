import { ArrowLeft } from "lucide-react";

/**
 * Картаның үстінен ашылатын толық экранды панель.
 * Profile, Leaderboard, Settings — барлығы осы қаңқаны қолданады.
 */
export default function Sheet({ title, onBack, children, footer }) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col animate-fade-up">
      {/* Фон — блюрленген қараңғылау қабат */}
      <div className="absolute inset-0 bg-[#1a2e38]/95 backdrop-blur-md" />

      <div className="relative flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-5 pb-4 shrink-0">
          <button
            onClick={onBack}
            aria-label="Назад"
            className="btn-3d w-10 h-10 rounded-[12px] shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-gray-100" strokeWidth={2.2} />
          </button>
          <h1 className="start-text text-white text-[19px] font-bold">{title}</h1>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">{children}</div>

        {/* Footer (мыс. Назад/Выйти батырмасы) */}
        {footer && <div className="px-4 pb-6 pt-2 shrink-0">{footer}</div>}
      </div>
    </div>
  );
}
