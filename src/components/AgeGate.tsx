import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

const STORAGE_KEY = "holacachero-age-verified";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const LOGO_DARK = "/HolaCachero.png";
const LOGO_LIGHT = "/HolaCachero01.png";

export function AgeGate({ children }: { children: React.ReactNode }) {
  const [verified, setVerified] = useState<boolean | null>(null);
  const { theme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark" || theme === "dark";
  const logoSrc = isDark ? LOGO_DARK : LOGO_LIGHT;

  useEffect(() => {
    setVerified(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  const handleConfirm = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVerified(true);
  };

  const handleDeny = () => {
    window.location.href = "https://www.google.cl";
  };

  if (verified === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-muted-foreground text-sm">Cargando…</span>
      </div>
    );
  }

  if (verified) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[100] min-h-screen bg-background flex flex-col items-center justify-center px-4 overflow-hidden">
      <div className="absolute inset-0 gradient-hero" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 40%, hsl(var(--copper) / 0.12) 0%, transparent 60%)",
        }}
      />
      <div
        className="absolute top-1/4 right-0 w-[200px] h-[200px] rounded-full pointer-events-none blur-[100px] opacity-30"
        style={{ background: "hsl(var(--copper))" }}
      />
      <div
        className="absolute bottom-1/4 left-0 w-[180px] h-[180px] rounded-full pointer-events-none blur-[80px] opacity-25"
        style={{ background: "hsl(var(--copper))" }}
      />

      <motion.div
        className="relative z-10 text-center max-w-md mx-auto"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        <motion.div variants={fadeIn} className="flex justify-center mb-4">
          <img
            src={logoSrc}
            alt="Hola Cachero"
            className="h-auto w-full max-w-[200px] sm:max-w-[260px] object-contain drop-shadow-lg"
            width="260"
            height="325"
          />
        </motion.div>
        <motion.h1
          variants={fadeIn}
          className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-foreground mb-2 tracking-tight"
          style={{ textShadow: "0 2px 20px rgba(0,0,0,0.2)" }}
        >
          HOLA CACHERO
        </motion.h1>
        <motion.p variants={fadeIn} className="text-muted-foreground text-sm sm:text-base mb-8">
          Bienvenido a la comunidad
        </motion.p>
        <motion.div
          variants={fadeIn}
          className="rounded-2xl border border-copper/30 bg-card/95 backdrop-blur-sm p-6 shadow-xl"
        >
          <p className="text-lg font-semibold text-foreground mb-2">¿Eres mayor de edad?</p>
          <p className="text-sm text-muted-foreground mb-6">🔞 Contenido solo para mayores de 18 años.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              type="button"
              onClick={handleConfirm}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 min-w-[140px] h-12 rounded-xl font-semibold bg-copper text-primary-foreground hover:bg-copper/90 shadow-copper transition-colors"
            >
              Sí, entrar
            </motion.button>
            <motion.button
              type="button"
              onClick={handleDeny}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 min-w-[140px] h-12 rounded-xl font-medium border-2 border-border bg-transparent text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              No
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
