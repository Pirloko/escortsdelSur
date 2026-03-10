import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

/** Toggle modo claro/oscuro. Solo mostrado donde se use (ej. página Inicio para test). */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="fixed top-20 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border-2 border-border bg-background/90 text-foreground shadow-lg backdrop-blur-sm transition hover:border-primary hover:bg-primary/10 hover:text-primary md:top-24 md:right-6"
      aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
