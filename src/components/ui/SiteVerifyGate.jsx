import { useEffect, useRef, useState } from "react";

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";
const SESSION_KEY = "stepland_cf_verified";
let scriptLoadingPromise = null;

function loadTurnstileScript() {
  if (window.turnstile) return Promise.resolve();
  if (scriptLoadingPromise) return scriptLoadingPromise;
  scriptLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return scriptLoadingPromise;
}

/**
 * Сайт ашылғанда БІР РЕТ, фонда жұмыс істейтін Cloudflare Turnstile тексеруі.
 * "Managed" режимде: көп жағдайда пайдаланушы ЕШТЕҢЕ көрмейді, тексеру
 * автоматты өтеді. Тек Cloudflare күдікті трафикті байқаса, кішкентай
 * widget экранның төменгі бұрышында пайда болады.
 *
 * Токен сессия бойы sessionStorage-те сақталады — қайта тексерілмейді,
 * бет жаңартылса да (жаңа таб/сессияда қайта тексеріледі).
 */
export default function SiteVerifyGate() {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [showWidget, setShowWidget] = useState(false);

  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey) return;

    try {
      if (sessionStorage.getItem(SESSION_KEY)) return; // бұл сессияда тексерілген
    } catch {
      // sessionStorage қолжетімсіз болса, тексеруді жалғастыру
    }

    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: "dark",
          size: "normal",
          appearance: "interaction-only", // тек тексеру керек болғанда ғана көрінеді
          callback: (token) => {
            try {
              sessionStorage.setItem(SESSION_KEY, token);
            } catch {
              /* ignore */
            }
            setShowWidget(false);
          },
          "before-interactive-callback": () => setShowWidget(true),
          "error-callback": () => setShowWidget(false),
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (widgetIdRef.current != null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, [siteKey]);

  if (!siteKey) return null;

  return (
    <div
      className={`fixed bottom-3 right-3 z-[200] transition-opacity ${
        showWidget ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div ref={containerRef} />
    </div>
  );
}

export function getVerificationToken() {
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}
