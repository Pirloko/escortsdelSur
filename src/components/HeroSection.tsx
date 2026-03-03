import { motion } from "framer-motion";
import { Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut", delay: 0.2 + delay },
  },
});

export function HeroSection({ firstCitySlug = "rancagua" }: { firstCitySlug?: string }) {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden"
      aria-labelledby="hero-heading"
    >
      <div className="absolute inset-0 gradient-hero" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 40%, hsl(var(--copper) / 0.08) 0%, transparent 60%)",
        }}
      />
      <div
        className="absolute top-0 right-0 w-[280px] h-[280px] rounded-full pointer-events-none blur-[120px] opacity-40"
        style={{ background: "hsl(var(--copper))" }}
      />

      <motion.div
        className="relative z-10 text-center max-w-3xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        <motion.div variants={fadeUp(0)} className="mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-copper/50 bg-white/5 backdrop-blur-md text-foreground text-xs font-medium tracking-[0.2em] uppercase">
            <Star className="w-3.5 h-3.5 text-copper" aria-hidden />
            Comunidad exclusiva
          </span>
        </motion.div>

        <motion.p
          variants={fadeUp(0.1)}
          className="font-display text-copper-light text-2xl md:text-3xl tracking-[0.35em] uppercase mb-6"
        >
          holacachero.cl
        </motion.p>

        <motion.h1
          id="hero-heading"
          variants={fadeUp(0.2)}
          className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight text-foreground mb-6"
        >
          Descubre experiencias exclusivas{" "}
          <span className="italic text-copper">en el Sur de Chile</span>
        </motion.h1>

        <motion.p
          variants={fadeUp(0.3)}
          className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto mb-10"
        >
          Crea tu cuenta, comenta y participa en nuestra rifa mensual exclusiva.
        </motion.p>

        <motion.div
          variants={fadeUp(0.4)}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            to="/registro-cliente"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-300 gradient-copper text-primary-foreground shadow-copper hover:shadow-copper-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-copper focus:ring-offset-2 focus:ring-offset-background"
          >
            Crear cuenta y participar
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to={`/${firstCitySlug}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-medium transition-all duration-300 border border-copper/50 text-copper bg-transparent hover:bg-copper/10 hover:border-copper focus:outline-none focus:ring-2 focus:ring-copper/30 focus:ring-offset-2 focus:ring-offset-background"
          >
            Explorar perfiles
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-6 h-10 rounded-full border border-copper/40 flex items-start justify-center pt-2">
          <div className="w-1.5 h-2.5 rounded-full bg-copper/70" />
        </div>
      </motion.div>
    </section>
  );
}
