import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function FinalCTASection() {
  return (
    <section className="px-4 py-4 max-w-4xl mx-auto" aria-labelledby="cta-final-heading">
      <div className="text-center">
        <h2 id="cta-final-heading" className="text-sm font-medium text-foreground mb-2">
          ¿Listo? Únete y descubre perfiles exclusivos.
        </h2>
        <Link
          to="/registro-cliente"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold gradient-copper text-primary-foreground hover:opacity-90"
        >
          Crear mi cuenta <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
