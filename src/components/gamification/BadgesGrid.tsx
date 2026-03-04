import type { UserBadge } from "../../types/gamification";
import { Award, MessageCircle, Puzzle, Flame, Star, Lock } from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  first_comment: MessageCircle,
  ten_comments: MessageCircle,
  puzzle_completed: Puzzle,
  quiz_completed: Puzzle,
  seven_day_streak: Flame,
  level_five: Star,
  default: Award,
};

function BadgeIcon({ iconKey }: { iconKey: string }) {
  const Icon = ICON_MAP[iconKey] ?? ICON_MAP.default;
  return <Icon className="w-6 h-6" />;
}

export interface BadgesGridProps {
  badges: UserBadge[];
}

export function BadgesGrid({ badges }: BadgesGridProps) {
  return (
    <div className="rounded-2xl border border-copper/30 bg-card/80 p-5">
      <h3 className="text-base font-display font-semibold text-foreground mb-4">Insignias</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`rounded-xl border p-3 flex flex-col items-center gap-2 text-center ${
              badge.unlocked
                ? "border-copper/40 bg-copper/10 text-copper"
                : "border-muted bg-muted/30 text-muted-foreground"
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                badge.unlocked ? "bg-copper/20 text-copper" : "bg-muted text-muted-foreground"
              }`}
            >
              {badge.unlocked ? (
                <BadgeIcon iconKey={badge.key} />
              ) : (
                <Lock className="w-5 h-5" />
              )}
            </div>
            <span className="text-xs font-medium line-clamp-2">{badge.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
