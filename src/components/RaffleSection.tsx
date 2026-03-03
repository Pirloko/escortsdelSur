import { motion } from "framer-motion";
import { Trophy, Users, CalendarDays, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export interface RaffleSectionProps {
  participantesCount?: number | null;
  proximoSorteo?: string;
}

export function RaffleSection({
  participantesCount,
  proximoSorteo = "31 Mar",
}: RaffleSectionProps) {
  const displayCount = participantesCount != null ? `${participantesCount}+` : "—";

  return (
    <section className="px-4 py-20 relative" aria-labelledby="rifa-heading">
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] opacity-30 pointer-events-none"
        style={{ background: "hsl(var(--copper))" }}
      />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger}
        className="max-w-4xl mx-auto relative"
      >
        <motion.div
          variants={fadeUp}
          className="rounded-2xl border-copper-strong border-2 bg-card/90 p-8 md:p-12 text-center relative overflow-hidden shadow-copper-lg glow-copper"
        >
          <div
            className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[80px] opacity-20 pointer-events-none"
            style={{ background: "hsl(var(--copper))" }}
          />

          <motion.div
            variants={fadeUp}
            className="w-16 h-16 rounded-2xl gradient-copper flex items-center justify-center mx-auto mb-6 text-primary-foreground shadow-copper"
          >
            <Trophy className="w-8 h-8" aria-hidden strokeWidth={2} />
          </motion.div>

          <motion.h2
            id="rifa-heading"
            variants={fadeUp}
            className="text-2xl md:text-4xl font-display font-bold text-foreground mb-4"
          >
            Participa en nuestra{" "}
            <span className="italic text-copper">Rifa Mensual</span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="text-muted-foreground max-w-xl mx-auto mb-10 text-sm md:text-base"
          >
            Por cada comentario que dejes, participas automáticamente. Más interacción = más
            oportunidades de ganar.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10"
          >
            <div className="rounded-2xl border border-copper/40 bg-surface-elevated p-6 flex flex-col items-center gap-3">
              <Users className="w-8 h-8 text-copper" aria-hidden />
              <p className="text-3xl md:text-4xl font-display font-bold text-copper">
                {displayCount}
              </p>
              <p className="text-sm text-muted-foreground">Participando</p>
            </div>
            <div className="rounded-2xl border border-copper/40 bg-surface-elevated p-6 flex flex-col items-center gap-3">
              <CalendarDays className="w-8 h-8 text-copper" aria-hidden />
              <p className="text-3xl md:text-4xl font-display font-bold text-copper">
                {proximoSorteo}
              </p>
              <p className="text-sm text-muted-foreground">Próximo sorteo</p>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Link
              to="/registro-cliente"
              className="group inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl text-base font-semibold transition-all duration-300 gradient-copper text-primary-foreground shadow-copper hover:shadow-copper-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-copper focus:ring-offset-2 focus:ring-offset-background"
            >
              Crear cuenta ahora
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
