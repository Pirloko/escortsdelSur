import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const COOKIE_CONSENT_KEY = "holacachero-cookies-accepted";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!accepted) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "1");
    setVisible(false);
    setShowSettings(false);
  };

  const handleSettings = () => {
    setShowSettings(true);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[90] px-4 py-4 bg-background/95 border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.15)] backdrop-blur-sm"
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
    >
      <div className="max-w-4xl mx-auto">
        {!showSettings ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 id="cookie-banner-title" className="text-sm font-semibold text-foreground mb-1">
                Cookies
              </h2>
              <p id="cookie-banner-desc" className="text-sm text-muted-foreground">
                Este sitio utiliza cookies para mejorar la experiencia del usuario.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={handleSettings}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-sm font-medium border border-border bg-transparent text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                Configurar
              </button>
              <button
                type="button"
                onClick={handleAccept}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-sm font-medium bg-copper text-primary-foreground hover:bg-copper/90 transition-colors"
              >
                Aceptar cookies
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 id="cookie-banner-title" className="text-sm font-semibold text-foreground">
              Configuración de cookies
            </h2>
            <p id="cookie-banner-desc" className="text-sm text-muted-foreground">
              Puedes aceptar todas las cookies para una experiencia completa o leer nuestra{" "}
              <Link to="/privacidad" className="text-copper hover:underline" onClick={() => setVisible(false)}>
                Política de privacidad
              </Link>{" "}
              para más información.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium border border-border bg-transparent text-muted-foreground hover:bg-muted/50"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleAccept}
                className="px-4 py-2.5 rounded-lg text-sm font-medium bg-copper text-primary-foreground hover:bg-copper/90"
              >
                Aceptar cookies
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
