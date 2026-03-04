import { motion } from "framer-motion";

export interface LevelProgressProps {
  level: number;
  levelLabel: string;
  currentXp: number;
  xpToNextLevel: number;
}

export function LevelProgress({ level, levelLabel, currentXp, xpToNextLevel }: LevelProgressProps) {
  const percent = xpToNextLevel > 0 ? Math.min(100, Math.round((currentXp / xpToNextLevel) * 100)) : 100;

  return (
    <div className="rounded-2xl border border-copper/30 bg-card/80 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-display font-semibold text-copper">
          Nivel {level} – {levelLabel}
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">{percent}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-copper/90"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
