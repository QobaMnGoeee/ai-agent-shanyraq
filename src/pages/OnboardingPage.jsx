import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { supabase } from "../lib/supabase";
import AuthCard from "../components/ui/AuthCard";
import Input3D from "../components/ui/Input3D";
import Btn3D from "../components/ui/Btn3D";
import CustomColorPicker from "../components/ui/CustomColorPicker";
import { FlagPlantIllustration } from "../components/illustrations";

const COLORS = [
  "#FF5733", "#00FF88", "#3388FF", "#FFD23F",
  "#FF3399", "#9B59B6", "#1ABC9C", "#F39C12",
];

export default function OnboardingPage() {
  const { user, refreshProfile } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (username.trim().length < 3) {
      setError("Минимум 3 символа");
      return;
    }

    setLoading(true);

    // Алдымен өз профилім бұрыннан бар ма — тексеру (double-submit қорғауы)
    const { data: ownProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (ownProfile) {
      // Профиль бұрыннан жасалған (мыс. алдыңғы сәтті submit) —
      // қайта INSERT жасамай, тікелей map-қа өту
      await refreshProfile();
      setLoading(false);
      navigate("/map", { replace: true });
      return;
    }

    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username.trim())
      .maybeSingle();

    if (existing) {
      setLoading(false);
      setError("Это имя уже занято");
      return;
    }

    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id,
      username: username.trim(),
      color,
      total_score: 0,
    });

    if (insertError) {
      // duplicate key = race condition-мен профиль әлдеқашан жасалған —
      // қате емес, жай map-қа өтеміз
      if (insertError.code === "23505") {
        await refreshProfile();
        setLoading(false);
        navigate("/map", { replace: true });
        return;
      }
      setLoading(false);
      setError("Не удалось создать профиль: " + insertError.message);
      return;
    }

    // hasProfile-ды дереу жаңарту — /map route guard кідіріссіз өткізеді
    await refreshProfile();
    setLoading(false);
    navigate("/map", { replace: true });
  }

  return (
    <AuthCard
      title="Почти готово"
      subtitle="Настройте профиль, чтобы начать играть"
      illustration={<FlagPlantIllustration className="w-full h-auto" flagColor={color} />}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5" noValidate>
        <Input3D
          icon={User}
          type="text"
          placeholder={t("username")}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={error && error.includes("имя") ? error : null}
        />

        <div>
          <label className="text-ink-500 text-[12px] font-semibold mb-2 block px-1">
            {t("territory_color")}
          </label>
          <div className="grid grid-cols-9 gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`aspect-square rounded-full border-2 transition-transform ${
                  color === c ? "border-ink-700 scale-110" : "border-transparent opacity-70"
                }`}
                style={{ backgroundColor: c }}
                aria-label={c}
              />
            ))}
            <CustomColorPicker value={color} onChange={setColor} />
          </div>
        </div>

        {error && !error.includes("имя") && (
          <div className="bg-coral-50 border-2 border-coral-200 rounded-2xl px-3 py-2">
            <p className="text-coral-600 text-[12px] font-semibold">{error}</p>
          </div>
        )}

        <Btn3D type="submit" loading={loading} className="w-full h-[48px] rounded-2xl mt-1 gap-2">
          <span className="start-text text-[15px] font-bold">{t("start_button")}</span>
          <ArrowRight className="w-4 h-4" strokeWidth={2.4} />
        </Btn3D>
      </form>
    </AuthCard>
  );
}
