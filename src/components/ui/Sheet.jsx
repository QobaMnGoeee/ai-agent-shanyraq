import { ArrowLeft } from "lucide-react";

/**
 * Картаның үстінен ашылатын толық экранды панель.
 * Profile, Leaderboard, Settings — барлығы осы қаңқаны қолданады.
 */
export default function Sheet({ title, onBack, children, footer }) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col animate-fade-up">
      {/* Фон — ашық, жылы түсті қабат */}
      <div className="absolute inset-0 bg-cream-100" />
      <div
        className="absolute -top-20 -right-16 w-56 h-56 blob-shape bg-sun-200/50 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 -left-16 w-60 h-60 blob-shape bg-leaf-200/50 pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-5 pb-4 shrink-0">
          <button
            onClick={onBack}
            aria-label="Назад"
            className="btn-3d w-10 h-10 rounded-2xl shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-white" strokeWidth={2.2} />
          </button>
          <h1 className="start-text text-ink-800 text-[20px] font-bold">{title}</h1>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">{children}</div>

        {/* Footer (мыс. Назад/Выйти батырмасы) */}
        {footer && <div className="px-4 pb-6 pt-2 shrink-0">{footer}</div>}
      </div>
    </div>
  );
}
