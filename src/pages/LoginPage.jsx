import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useLang } from "../context/LangContext";
import AuthCard from "../components/ui/AuthCard";
import Input3D from "../components/ui/Input3D";
import Btn3D from "../components/ui/Btn3D";
import GoogleButton from "../components/ui/GoogleButton";

export default function LoginPage() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [shake, setShake] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: null }));
  }

  function validate() {
    const next = {};
    if (!form.email.trim()) next.email = t("email");
    if (!form.password) next.password = t("password");
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) {
      triggerShake();
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    });
    setLoading(false);

    if (error) {
      setErrors({ form: mapAuthError(error) });
      triggerShake();
      return;
    }

    navigate("/map", { replace: true });
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
    // Сәтті болса, браузер Google-ге редирект болады —
    // setGoogleLoading(false) шақырудың қажеті жоқ
  }

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 350);
  }

  return (
    <AuthCard title={t("login_title")} subtitle={t("login_subtitle")}>
      <form
        onSubmit={handleSubmit}
        className={`flex flex-col gap-3.5 ${shake ? "animate-shake" : ""}`}
        noValidate
      >
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
          autoComplete="current-password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          error={errors.password}
        />

        {errors.form && (
          <div className="bg-coral-50 border-2 border-coral-200 rounded-2xl px-3 py-2">
            <p className="text-coral-600 text-[12px] font-semibold">{errors.form}</p>
          </div>
        )}

        <Btn3D
          type="submit"
          loading={loading}
          className="w-full h-[48px] rounded-2xl mt-1"
        >
          <span className="start-text text-[15px] font-bold">{t("login_button")}</span>
        </Btn3D>
      </form>

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-ink-100" />
        <span className="text-ink-300 text-[11px] font-semibold">или</span>
        <div className="flex-1 h-px bg-ink-100" />
      </div>

      <GoogleButton onClick={handleGoogleSignIn} loading={googleLoading} />

      <p className="text-ink-400 text-[12.5px] font-medium text-center mt-5">
        {t("no_account")}{" "}
        <Link to="/register" className="text-leaf-600 font-bold hover:underline">
          {t("signup_link")}
        </Link>
      </p>
    </AuthCard>
  );
}

function mapAuthError(error) {
  const message = error.message || "";
  if (error.status === 429 || message.toLowerCase().includes("rate limit"))
    return "Слишком много попыток. Подождите пару минут";
  if (message.includes("Invalid login credentials"))
    return "Неверный email или пароль";
  if (message.includes("Email not confirmed"))
    return "Email ещё не подтверждён. Проверьте почту";
  return "Ошибка входа. Попробуйте снова";
}
