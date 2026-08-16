import { Footprints } from "lucide-react";
import GlassPanel from "./GlassPanel";
import { useLang } from "../../context/LangContext";
import { HillsDecor, CloudDecor, TreeDecor } from "../illustrations";

/**
 * Login/Register беттерінің ортақ "қаңқасы" — карта + logo + subtitle.
 * Осы карточканың ішіне form-ды салады. illustration prop-ы арқылы
 * логотиптің үстіне тақырыпқа сай flat-vector сурет қосуға болады.
 */
export default function AuthCard({ title, subtitle, children, illustration }) {
  const { t } = useLang();
  return (
    <div className="h-[100dvh] w-full overflow-y-auto overscroll-contain relative">
      {/* Decorative flat-vector blobs */}
      <div
        className="blob-shape w-64 h-64 bg-leaf-200/60 -top-16 -left-20 animate-float-slow"
        aria-hidden="true"
      />
      <div
        className="blob-shape w-56 h-56 bg-sun-200/60 -top-10 -right-16 animate-float-slower"
        aria-hidden="true"
      />
      <div
        className="blob-shape w-48 h-48 bg-sky2-200/50 -bottom-14 -left-10 animate-float-slower"
        aria-hidden="true"
      />
      <div
        className="blob-shape w-40 h-40 bg-berry-200/40 -bottom-8 -right-10 animate-float-slow"
        aria-hidden="true"
      />

      {/* Табиғи decor — төбешіктер + бұлттар + ағаштар */}
      <HillsDecor className="absolute bottom-0 left-0 w-full h-24 sm:h-32 pointer-events-none opacity-90" />
      <CloudDecor className="absolute top-8 left-6 w-20 opacity-80 animate-float-slower pointer-events-none" />
      <CloudDecor className="absolute top-16 right-8 w-14 opacity-70 animate-float-slow pointer-events-none" />
      <TreeDecor className="absolute bottom-2 left-3 w-12 sm:w-16 pointer-events-none" />
      <TreeDecor tone="alt" className="absolute bottom-1 right-4 w-10 sm:w-14 pointer-events-none" />

      <div className="relative min-h-full w-full flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[380px] animate-fade-up">
          {illustration && (
            <div className="flex justify-center mb-2 -mt-2">
              <div className="w-full max-w-[220px]">{illustration}</div>
            </div>
          )}

          {/* Logo / brand */}
          <div className="flex flex-col items-center mb-6">
            <div className="btn-3d w-16 h-16 rounded-3xl mb-3">
              <Footprints className="w-8 h-8 text-white" strokeWidth={2.2} />
            </div>
            <h1 className="start-text text-leaf-700 text-3xl font-extrabold tracking-wide">
              STEPLAND
            </h1>
            <p className="text-ink-400 text-[13px] font-semibold mt-1">{t("brand_tagline")}</p>
          </div>

          {/* Card */}
          <GlassPanel className="rounded-3xl p-6">
            <h2 className="start-text text-ink-800 text-[20px] font-bold mb-1">{title}</h2>
            {subtitle && (
              <p className="text-ink-400 text-[12.5px] font-medium mb-5 leading-snug">{subtitle}</p>
            )}
            {!subtitle && <div className="mb-5" />}
            {children}
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
