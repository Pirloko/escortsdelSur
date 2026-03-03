import { motion } from "framer-motion";
import { Lock, MessageCircle, Gift } from "lucide-react";

const benefits = [
  {
    icon: Lock,
    title: "Exclusividad",
    text: "Solo usuarios registrados pueden interactuar con los perfiles.",
  },
  {
    icon: MessageCircle,
    title: "Interacción real",
    text: "Comenta perfiles y comparte tu experiencia con la comunidad.",
  },
  {
    icon: Gift,
    title: "Rifa mensual",
    text: "Cada comentario suma participación automática al sorteo.",
  },
] as const;

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export function BenefitsSection() {
  return (
    <section className="px-4 py-20 max-w-6xl mx-auto" aria-labelledby="beneficios-heading">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger}
      >
        <motion.div variants={fadeUp} className="text-center mb-14">
          <h2
            id="beneficios-heading"
            className="text-2xl md:text-4xl font-display font-bold text-foreground mb-3"
          >
            ¿Por qué unirte a <span className="text-copper">holacachero</span>?
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
            Una plataforma diseñada para ofrecerte la mejor experiencia.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((item) => (
            <motion.article
              key={item.title}
              variants={fadeUp}
              className="rounded-2xl border border-copper/40 bg-card p-8 transition-all duration-300 hover:bg-secondary/60 hover:shadow-xl hover:shadow-black/10"
            >
              <div className="w-14 h-14 rounded-xl gradient-copper flex items-center justify-center mb-6 text-primary-foreground shadow-copper">
                <item.icon className="w-7 h-7" aria-hidden strokeWidth={2} />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-3">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
            </motion.article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
