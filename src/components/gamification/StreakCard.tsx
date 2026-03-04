import { Flame } from "lucide-react";

export interface StreakCardProps {
  streakDays: number;
}

export function StreakCard({ streakDays }: StreakCardProps) {
  return (
    <div className="rounded-2xl border border-copper/30 bg-card/80 p-5">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-copper/15 flex items-center justify-center text-copper">
          <Flame className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-display font-semibold text-foreground">
            Racha actual: <span className="text-copper tabular-nums">{streakDays}</span> días
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Vuelve mañana para mantener tu racha.
          </p>
        </div>
      </div>
    </div>
  );
}
