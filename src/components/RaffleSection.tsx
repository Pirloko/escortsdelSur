import { Trophy, CalendarDays, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

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
    <section className="px-4 py-4 max-w-4xl mx-auto" aria-labelledby="rifa-heading">
      <div className="rounded-xl border border-copper/30 bg-card/80 px-4 py-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-copper shrink-0" aria-hidden />
          <h2 id="rifa-heading" className="text-sm font-semibold text-foreground">
            Rifa mensual
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Cada comentario = participación. Más interacción, más oportunidades.
        </p>
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <span className="font-semibold text-copper">{displayCount}</span> participando
        </span>
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5 text-copper" />
          Próximo sorteo <span className="font-medium text-foreground">{proximoSorteo}</span>
        </span>
        <Link
          to="/registro-cliente"
          className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-semibold gradient-copper text-primary-foreground hover:opacity-90"
        >
          Crear cuenta <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </section>
  );
}
