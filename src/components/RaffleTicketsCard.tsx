import { Ticket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRaffleHighlight } from "@/hooks/useRaffleHighlight";
import { Button } from "@/components/ui/button";

const RAFFLE_MONTHS = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export interface RaffleTicketsCardProps {
  ticketsRifa: number;
}

export function RaffleTicketsCard({ ticketsRifa }: RaffleTicketsCardProps) {
  const navigate = useNavigate();
  const { activeRaffle } = useRaffleHighlight();
  const monthLabel = activeRaffle ? (RAFFLE_MONTHS[activeRaffle.month] ?? String(activeRaffle.month)) : null;

  return (
    <div className="rounded-2xl border border-copper/30 bg-surface-elevated p-5 shadow-lg shadow-black/5">
      <h3 className="text-sm font-display font-semibold text-foreground flex items-center gap-2 mb-3">
        <Ticket className="w-4 h-4 text-copper" />
        🎟 Tus Tickets de Rifa
      </h3>
      <p className="text-3xl font-display font-bold text-copper tabular-nums mb-2">{ticketsRifa}</p>
      <p className="text-xs text-muted-foreground mb-4">
        Cada ticket es una papeleta. Más tickets = más posibilidades de ganar.
      </p>
      {ticketsRifa === 0 ? (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Aún no tienes tickets. Completa el Desafío del Día y empieza a participar.
          </p>
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-xl border-copper/40 text-copper hover:bg-copper/10"
            onClick={() => navigate("/desafio-del-dia")}
          >
            Ir al Desafío
          </Button>
        </>
      ) : (
        <>
          {monthLabel && (
            <p className="text-sm text-foreground mb-4">
              Estás participando en el sorteo de {monthLabel}. ¡Sigue sumando!
            </p>
          )}
          <Button
            type="button"
            className="w-full rounded-xl bg-copper/90 text-primary-foreground hover:bg-copper"
            onClick={() => navigate("/rifa")}
          >
            Ver Rifa
          </Button>
        </>
      )}
    </div>
  );
}
