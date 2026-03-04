/**
 * Tipos para el panel gamificado del perfil de usuario (visitante).
 * Preparados para datos dinámicos desde Supabase.
 */

export interface UserStats {
  level: number;
  levelLabel: string;
  currentXp: number;
  xpToNextLevel: number;
  pepitas: number;
  ticketsRifa: number;
  streakDays: number;
  lastActivityDate: string | null;
}

export interface UserBadge {
  id: string;
  key: string;
  name: string;
  icon: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface UserProgress {
  stats: UserStats;
  badges: UserBadge[];
  quizLevel: number;
  quizMaxLevel: number;
  quizCompletedToday: boolean;
  quizTicketsEarnedToday: number;
}
