import { Coins, Ticket, HelpCircle } from "lucide-react";

export interface UserEconomyCardProps {
  pepitas: number;
  ticketsRifa: number;
  onHowToEarn?: () => void;
}

export function UserEconomyCard({ pepitas, ticketsRifa, onHowToEarn }: UserEconomyCardProps) {
  return (
    <div className="rounded-2xl border border-copper/30 bg-surface-elevated p-5 shadow-lg shadow-black/5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-display font-semibold text-foreground">Economía</span>
        <button
          type="button"
          onClick={onHowToEarn}
          className="text-xs font-medium text-copper hover:underline inline-flex items-center gap-1"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Cómo ganar más
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-copper/15 flex items-center justify-center text-copper">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Pepitas Cobre</p>
            <p className="text-lg font-display font-bold text-copper tabular-nums">{pepitas}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-copper/15 flex items-center justify-center text-copper">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tickets Rifa</p>
            <p className="text-lg font-display font-bold text-copper tabular-nums">{ticketsRifa}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
