import { Lock, MessageCircle, Gift } from "lucide-react";
import { Link } from "react-router-dom";

const benefits = [
  { icon: Lock, title: "Exclusividad", text: "Solo registrados interactúan con perfiles." },
  { icon: MessageCircle, title: "Interacción real", text: "Comenta y comparte con la comunidad." },
  { icon: Gift, title: "Rifa mensual", text: "Cada comentario suma al sorteo." },
] as const;

export function BenefitsSection() {
  return (
    <section className="px-4 py-6 max-w-4xl mx-auto" aria-labelledby="beneficios-heading">
      <h2 id="beneficios-heading" className="text-center text-sm font-medium text-muted-foreground mb-4">
        ¿Por qué unirte a <span className="text-copper">holacachero</span>?
      </h2>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
        {benefits.map((item) => (
          <span key={item.title} className="inline-flex items-center gap-1.5">
            <item.icon className="w-3.5 h-3.5 text-copper shrink-0" aria-hidden />
            {item.text}
          </span>
        ))}
      </div>
      <p className="text-center mt-3">
        <Link to="/registro-cliente" className="text-copper text-xs font-medium hover:underline">
          Crear cuenta →
        </Link>
      </p>
    </section>
  );
}
