import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, ArrowRight } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import AuthCard from "../components/ui/AuthCard";
import Input3D from "../components/ui/Input3D";
import Btn3D from "../components/ui/Btn3D";
import GoogleButton from "../components/ui/GoogleButton";
import CustomColorPicker from "../components/ui/CustomColorPicker";

const COLORS = [
  "#FF5733", "#00FF88", "#3388FF", "#FFD23F",
  "#FF3399", "#9B59B6", "#1ABC9C", "#F39C12",
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const { t } = useLang();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    color: COLORS[0],
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [info, setInfo] = useState(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: null }));
  }

  function validate() {
    const next = {};
    if (form.username.trim().length < 3) next.username = "Минимум 3 символа";
    if (!form.email.trim()) next.email = t("email");
    if (form.password.length < 6) next.password = t("password_too_short");
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 350);
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/map`,
      },
    });
    if (error) {
      setGoogleLoading(false);
      setErrors({ form: "Не удалось войти через Google" });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setInfo(null);
    if (!validate()) {
      triggerShake();
      return;
    }

    setLoading(true);

    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", form.username.trim())
      .maybeSingle();

    if (existing) {
      setLoading(false);
      setErrors({ username: "Это имя уже занято" });
      triggerShake();
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
    });

    if (error) {
      setLoading(false);
      setErrors({ form: mapAuthError(error) });
      triggerShake();
      return;
    }

    if (!data.user) {
      setLoading(false);
      setErrors({ form: "Регистрация не завершена. Попробуйте снова" });
      triggerShake();
      return;
    }

    if (data.session) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        username: form.username.trim(),
        color: form.color,
        total_score: 0,
      });

      if (profileError) {
        setLoading(false);
        setErrors({ form: "Не удалось создать профиль: " + profileError.message });
        triggerShake();
        return;
      }

      await refreshProfile();
      setLoading(false);
      navigate("/map", { replace: true });
    } else {
      setLoading(false);
      setInfo("Регистрация прошла успешно! Подтвердите email по ссылке из письма, затем войдите.");
    }
  }

  return (
    <AuthCard title={t("register_title")} subtitle={t("register_subtitle")}>
      <form
        onSubmit={handleSubmit}
        className={`flex flex-col gap-3.5 ${shake ? "animate-shake" : ""}`}
        noValidate
      >
        <Input3D
          icon={User}
          type="text"
          placeholder={t("username")}
          autoComplete="username"
          value={form.username}
          onChange={(e) => update("username", e.target.value)}
          error={errors.username}
        />
        <Input3D
          icon={Mail}
          type="email"
          placeholder={t("email")}
          autoComplete="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          error={errors.email}
        />
        <Input3D
          icon={Lock}
          type="password"
          placeholder={t("password")}
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          error={errors.password}
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
                onClick={() => update("color", c)}
                className={`aspect-square rounded-full border-2 transition-transform ${
                  form.color === c ? "border-ink-700 scale-110" : "border-transparent opacity-70"
                }`}
                style={{ backgroundColor: c }}
                aria-label={c}
              />
            ))}
            <CustomColorPicker
              value={form.color}
              onChange={(c) => update("color", c)}
            />
          </div>
        </div>

        {errors.form && (
          <div className="bg-coral-50 border-2 border-coral-200 rounded-2xl px-3 py-2">
            <p className="text-coral-600 text-[12px] font-semibold">{errors.form}</p>
          </div>
        )}

        {info && (
          <div className="bg-leaf-50 border-2 border-leaf-200 rounded-2xl px-3 py-2">
            <p className="text-leaf-700 text-[12px] font-semibold">{info}</p>
          </div>
        )}

        <Btn3D
          type="submit"
          loading={loading}
          className="w-full h-[48px] rounded-2xl mt-1 gap-2"
        >
          <span className="start-text text-[15px] font-bold">{t("start_button")}</span>
          <ArrowRight className="w-4 h-4" strokeWidth={2.4} />
        </Btn3D>
      </form>

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-ink-100" />
        <span className="text-ink-300 text-[11px] font-semibold">или</span>
        <div className="flex-1 h-px bg-ink-100" />
      </div>

      <GoogleButton onClick={handleGoogleSignIn} loading={googleLoading} />

      <p className="text-ink-400 text-[12.5px] font-medium text-center mt-5">
        {t("have_account")}{" "}
        <Link to="/login" className="text-leaf-600 font-bold hover:underline">
          {t("login_link")}
        </Link>
      </p>
    </AuthCard>
  );
}

function mapAuthError(error) {
  const message = error.message || "";
  if (error.status === 429 || message.toLowerCase().includes("rate limit"))
    return "Слишком много попыток. Подождите пару минут";
  if (message.includes("already registered"))
    return "Этот email уже зарегистрирован. Попробуйте войти";
  if (message.includes("Password"))
    return "Пароль слишком простой";
  return "Ошибка регистрации. Попробуйте снова";
}
