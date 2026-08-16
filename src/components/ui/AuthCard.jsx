import { Footprints } from "lucide-react";
import GlassPanel from "./GlassPanel";
import { useLang } from "../../context/LangContext";

/**
 * Login/Register беттерінің ортақ "қаңқасы" — карта + logo + subtitle.
 * Осы карточканың ішіне form-ды салады.
 */
export default function AuthCard({ title, subtitle, children }) {
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

      <div className="relative min-h-full w-full flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[380px] animate-fade-up">
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
