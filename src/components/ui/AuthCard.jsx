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
    <div className="h-[100dvh] w-full overflow-y-auto overscroll-contain">
      <div className="min-h-full w-full flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[380px] animate-fade-up">
          {/* Logo / brand */}
          <div className="flex flex-col items-center mb-6">
            <div className="btn-3d w-16 h-16 rounded-[18px] mb-3">
              <Footprints className="w-8 h-8 text-white" strokeWidth={2.2} />
            </div>
            <h1 className="start-text text-gray-800 text-2xl font-bold tracking-wide">
              STEPLAND
            </h1>
            <p className="text-gray-500 text-[13px] mt-1">{t("brand_tagline")}</p>
          </div>

          {/* Card */}
          <GlassPanel className="rounded-[20px] p-6">
            <h2 className="text-white text-[19px] font-semibold mb-1">{title}</h2>
            {subtitle && (
              <p className="text-gray-300 text-[12.5px] mb-5 leading-snug">{subtitle}</p>
            )}
            {!subtitle && <div className="mb-5" />}
            {children}
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
