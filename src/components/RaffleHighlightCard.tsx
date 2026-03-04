import { motion } from "framer-motion";
import { Gift, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useRaffleHighlight } from "@/hooks/useRaffleHighlight";

const RAFFLE_MONTHS = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export function RaffleHighlightCard() {
  const { activeRaffle, totalTickets, userTickets, isLoading } = useRaffleHighlight();

  if (isLoading || !activeRaffle) return null;

  const monthLabel = RAFFLE_MONTHS[activeRaffle.month] ?? String(activeRaffle.month);
  const title = `Sorteo ${monthLabel} ${activeRaffle.year}`;

  return (
    <section className="px-4 py-6 max-w-4xl mx-auto" aria-labelledby="raffle-highlight-heading">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="rounded-2xl border border-copper/30 bg-surface-elevated/95 shadow-lg shadow-black/10 p-6 md:p-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-copper/20 flex items-center justify-center text-copper">
            <Gift className="w-6 h-6" aria-hidden />
          </div>
          <h2 id="raffle-highlight-heading" className="text-xl md:text-2xl font-display font-bold text-foreground">
            🎁 {title}
          </h2>
        </div>
        <p className="text-muted-foreground text-sm md:text-base mb-4">
          Gana 1 hora exclusiva con el perfil que tú elijas.
        </p>
        <p className="text-2xl md:text-3xl font-display font-bold text-copper tabular-nums mb-1">
          {totalTickets.toLocaleString()} tickets
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          Más tickets = más probabilidad de ganar.
        </p>
        {userTickets !== null && (
          <p className="text-sm text-foreground mb-4">
            Tú tienes <span className="font-semibold text-copper">{userTickets}</span> tickets para este sorteo.
          </p>
        )}
        <Link
          to="/rifa"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-copper/90 text-primary-foreground hover:bg-copper transition-colors"
        >
          Ver Rifa
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </section>
  );
}
