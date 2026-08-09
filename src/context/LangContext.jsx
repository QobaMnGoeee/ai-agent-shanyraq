import { createContext, useContext, useMemo, useState } from "react";
import { translations } from "../lib/translations";

export const LANGUAGES = [
  { code: "ru", label: "Русский" },
  { code: "kz", label: "Қазақша" },
  { code: "uz", label: "O'zbekcha" },
  { code: "en", label: "English" },
];

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState("ru");

  const t = useMemo(() => {
    const dict = translations[lang] || translations.ru;
    return (key) => dict[key] ?? translations.ru[key] ?? key;
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang LangProvider ішінде қолданылуы керек");
  return ctx;
}
