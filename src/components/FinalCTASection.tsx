import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
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

export function FinalCTASection() {
  return (
    <section
      className="px-4 py-24 bg-secondary/40"
      aria-labelledby="cta-final-heading"
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger}
        className="max-w-2xl mx-auto text-center"
      >
        <motion.h2
          id="cta-final-heading"
          variants={fadeUp}
          className="text-2xl md:text-4xl font-display font-bold text-foreground mb-6 leading-tight"
        >
          ¿Listo para formar parte de la{" "}
          <span className="italic text-copper">comunidad</span>?
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="text-muted-foreground text-base md:text-lg mb-10"
        >
          Únete hoy, descubre perfiles exclusivos y participa en sorteos cada mes.
        </motion.p>
        <motion.div variants={fadeUp}>
          <Link
            to="/registro-cliente"
            className="group inline-flex items-center justify-center gap-2 px-12 py-5 rounded-2xl text-lg font-semibold transition-all duration-300 gradient-copper text-primary-foreground shadow-copper hover:shadow-copper-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-copper focus:ring-offset-2 focus:ring-offset-background"
          >
            Crear mi cuenta
            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
