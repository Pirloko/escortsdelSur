import { motion } from "framer-motion";
import { Users, MessageSquare, MapPin } from "lucide-react";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export interface SocialProofSectionProps {
  usuarios?: number | null;
  comentarios?: number | null;
  ciudades?: number | null;
}

function formatNumber(n: number): string {
  if (n >= 1000) {
    const s = n.toString();
    return s.slice(0, -3) + "," + s.slice(-3);
  }
  return String(n);
}

export function SocialProofSection({
  usuarios,
  comentarios,
  ciudades,
}: SocialProofSectionProps) {
  const items = [
    {
      icon: Users,
      value: usuarios != null ? formatNumber(usuarios) + "+" : "—",
      label: "Usuarios registrados",
    },
    {
      icon: MessageSquare,
      value: comentarios != null ? formatNumber(comentarios) + "+" : "—",
      label: "Comentarios",
    },
    {
      icon: MapPin,
      value: ciudades != null ? String(ciudades) : "—",
      label: "Ciudades activas",
    },
  ];

  return (
    <section
      className="px-4 py-20 bg-card"
      aria-labelledby="social-proof-heading"
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger}
        className="max-w-5xl mx-auto"
      >
        <motion.h2
          id="social-proof-heading"
          variants={fadeUp}
          className="text-2xl md:text-4xl font-display font-bold text-center mb-14 text-foreground"
        >
          La comunidad <span className="text-copper">crece</span>
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          {items.map((item) => (
            <motion.div
              key={item.label}
              variants={fadeUp}
              className="text-center"
            >
              <item.icon
                className="w-10 h-10 mx-auto mb-4 text-copper"
                aria-hidden
              />
              <p className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-copper">
                {item.value}
              </p>
              <p className="text-sm text-muted-foreground mt-2">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
