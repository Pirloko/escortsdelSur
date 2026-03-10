import { useEffect } from "react";
import { useTheme } from "next-themes";

const FAVICON_DARK = "/HolaCachero.png";
const FAVICON_LIGHT = "/HolaCachero01.png";

/** Actualiza el favicon del documento según el tema (claro/oscuro). */
export function FaviconTheme() {
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    const isDark = resolvedTheme === "dark" || theme === "dark";
    const href = isDark ? FAVICON_DARK : FAVICON_LIGHT;
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (link) link.href = href;
  }, [theme, resolvedTheme]);

  return null;
}
