import { Puzzle, CheckCircle } from "lucide-react";

export interface QuizStatusCardProps {
  level: number;
  maxLevel: number;
  completedToday: boolean;
  ticketsEarnedToday: number;
  onPlay?: () => void;
}

export function QuizStatusCard({
  level,
  maxLevel,
  completedToday,
  ticketsEarnedToday,
  onPlay,
}: QuizStatusCardProps) {
  return (
    <div className="rounded-2xl border border-copper/30 bg-card/80 p-5">
      <h3 className="text-base font-display font-semibold text-foreground flex items-center gap-2 mb-4">
        <Puzzle className="w-5 h-5 text-copper" />
        Desafío del Día
      </h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Preguntas</span>
          <span className="font-medium text-copper tabular-nums">
            {level}/{maxLevel}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Estado</span>
          {completedToday ? (
            <span className="inline-flex items-center gap-1.5 text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4" />
              Completado hoy
            </span>
          ) : (
            <span className="text-muted-foreground">Pendiente</span>
          )}
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tickets ganados hoy</span>
          <span className="font-medium text-copper tabular-nums">{ticketsEarnedToday}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={onPlay}
        className="mt-4 w-full h-10 rounded-xl text-sm font-medium bg-copper/20 text-copper border border-copper/40 hover:bg-copper/30 transition-colors"
      >
        Jugar ahora
      </button>
    </div>
  );
}
