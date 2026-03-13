import { useEffect } from "react";
import { useTheme } from "next-themes";

const FAVICON_MAIN = "/HolaCachero.png";

/** Actualiza el favicon del documento según el tema (claro/oscuro). */
export function FaviconTheme() {
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    const isDark = resolvedTheme === "dark" || theme === "dark";
    const href = FAVICON_MAIN;
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (link) link.href = href;
  }, [theme, resolvedTheme]);

  return null;
}
