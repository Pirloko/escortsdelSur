-- =============================================================================
-- Puzzle del Día: tablas y economía visitante (pepitas, tickets).
-- Un puzzle por día, 10 niveles por puzzle, imagen por nivel desde escort_profiles.
-- =============================================================================

-- Economía para visitantes (gamificación)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pepitas_cobre INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tickets_rifa INT NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.profiles.pepitas_cobre IS 'Pepitas Cobre del usuario (visitante). Recompensas por puzzle, comentarios, etc.';
COMMENT ON COLUMN public.profiles.tickets_rifa IS 'Tickets para la rifa mensual (visitante).';

-- -----------------------------------------------------------------------------
-- puzzle_days: un registro por día (fecha única)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.puzzle_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_puzzle_days_date ON public.puzzle_days(date);
CREATE INDEX IF NOT EXISTS idx_puzzle_days_active ON public.puzzle_days(is_active) WHERE is_active = true;

COMMENT ON TABLE public.puzzle_days IS 'Un puzzle del día por fecha. is_active = true para el día visible.';

-- -----------------------------------------------------------------------------
-- puzzle_levels: 10 niveles por puzzle_day (cada nivel = una imagen de un perfil)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.puzzle_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  puzzle_day_id UUID NOT NULL REFERENCES public.puzzle_days(id) ON DELETE CASCADE,
  level_number INT NOT NULL CHECK (level_number >= 1 AND level_number <= 10),
  escort_profile_id UUID NOT NULL REFERENCES public.escort_profiles(id) ON DELETE RESTRICT,
  image_url TEXT NOT NULL,
  difficulty_pieces INT NOT NULL CHECK (difficulty_pieces >= 9 AND difficulty_pieces <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(puzzle_day_id, level_number)
);

CREATE INDEX IF NOT EXISTS idx_puzzle_levels_puzzle_day ON public.puzzle_levels(puzzle_day_id);
CREATE INDEX IF NOT EXISTS idx_puzzle_levels_escort ON public.puzzle_levels(escort_profile_id);

COMMENT ON TABLE public.puzzle_levels IS 'Niveles 1-10 por puzzle del día. difficulty_pieces = N*N (ej. 9=3x3, 100=10x10).';

-- -----------------------------------------------------------------------------
-- user_puzzle_progress: progreso del usuario por día (una fila por user + día)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_puzzle_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  puzzle_day_id UUID NOT NULL REFERENCES public.puzzle_days(id) ON DELETE CASCADE,
  current_level INT NOT NULL DEFAULT 1 CHECK (current_level >= 1 AND current_level <= 10),
  completed BOOLEAN NOT NULL DEFAULT false,
  total_time_seconds INT NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, puzzle_day_id)
);

CREATE INDEX IF NOT EXISTS idx_user_puzzle_progress_user ON public.user_puzzle_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_puzzle_progress_puzzle_day ON public.user_puzzle_progress(puzzle_day_id);
CREATE INDEX IF NOT EXISTS idx_user_puzzle_progress_completed ON public.user_puzzle_progress(user_id, puzzle_day_id) WHERE completed = true;

COMMENT ON TABLE public.user_puzzle_progress IS 'Progreso del usuario en el puzzle del día. completed=true → no puede volver a jugar ese día.';

-- -----------------------------------------------------------------------------
-- user_puzzle_level_results: tiempo por nivel completado
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_puzzle_level_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  puzzle_day_id UUID NOT NULL REFERENCES public.puzzle_days(id) ON DELETE CASCADE,
  level_number INT NOT NULL CHECK (level_number >= 1 AND level_number <= 10),
  time_seconds INT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, puzzle_day_id, level_number)
);

CREATE INDEX IF NOT EXISTS idx_user_puzzle_level_results_user_day ON public.user_puzzle_level_results(user_id, puzzle_day_id);

COMMENT ON TABLE public.user_puzzle_level_results IS 'Tiempo empleado por el usuario en cada nivel del puzzle del día.';

-- -----------------------------------------------------------------------------
-- puzzle_day_leaderboard: top 10 por día (menor tiempo total)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.puzzle_day_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  puzzle_day_id UUID NOT NULL REFERENCES public.puzzle_days(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_time_seconds INT NOT NULL,
  display_name TEXT,
  rank_position INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(puzzle_day_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_puzzle_day_leaderboard_day ON public.puzzle_day_leaderboard(puzzle_day_id);
CREATE INDEX IF NOT EXISTS idx_puzzle_day_leaderboard_rank ON public.puzzle_day_leaderboard(puzzle_day_id, rank_position);

COMMENT ON TABLE public.puzzle_day_leaderboard IS 'Top 10 por día. display_name = alias del perfil (no datos sensibles).';

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
ALTER TABLE public.puzzle_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.puzzle_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_puzzle_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_puzzle_level_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.puzzle_day_leaderboard ENABLE ROW LEVEL SECURITY;

-- puzzle_days: lectura pública (cualquiera puede ver el puzzle del día activo)
DROP POLICY IF EXISTS "puzzle_days_select" ON public.puzzle_days;
CREATE POLICY "puzzle_days_select"
  ON public.puzzle_days FOR SELECT
  USING (true);

-- puzzle_days: solo admin insert/update/delete
DROP POLICY IF EXISTS "puzzle_days_insert_admin" ON public.puzzle_days;
CREATE POLICY "puzzle_days_insert_admin"
  ON public.puzzle_days FOR INSERT
  WITH CHECK (public.current_user_is_admin());

DROP POLICY IF EXISTS "puzzle_days_update_admin" ON public.puzzle_days;
CREATE POLICY "puzzle_days_update_admin"
  ON public.puzzle_days FOR UPDATE
  USING (public.current_user_is_admin());

DROP POLICY IF EXISTS "puzzle_days_delete_admin" ON public.puzzle_days;
CREATE POLICY "puzzle_days_delete_admin"
  ON public.puzzle_days FOR DELETE
  USING (public.current_user_is_admin());

-- puzzle_levels: lectura pública
DROP POLICY IF EXISTS "puzzle_levels_select" ON public.puzzle_levels;
CREATE POLICY "puzzle_levels_select"
  ON public.puzzle_levels FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "puzzle_levels_insert_admin" ON public.puzzle_levels;
CREATE POLICY "puzzle_levels_insert_admin"
  ON public.puzzle_levels FOR INSERT
  WITH CHECK (public.current_user_is_admin());

DROP POLICY IF EXISTS "puzzle_levels_update_admin" ON public.puzzle_levels;
CREATE POLICY "puzzle_levels_update_admin"
  ON public.puzzle_levels FOR UPDATE
  USING (public.current_user_is_admin());

DROP POLICY IF EXISTS "puzzle_levels_delete_admin" ON public.puzzle_levels;
CREATE POLICY "puzzle_levels_delete_admin"
  ON public.puzzle_levels FOR DELETE
  USING (public.current_user_is_admin());

-- user_puzzle_progress: usuario ve/inserta/actualiza solo el suyo
DROP POLICY IF EXISTS "user_puzzle_progress_select_own" ON public.user_puzzle_progress;
CREATE POLICY "user_puzzle_progress_select_own"
  ON public.user_puzzle_progress FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_puzzle_progress_insert_own" ON public.user_puzzle_progress;
CREATE POLICY "user_puzzle_progress_insert_own"
  ON public.user_puzzle_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_puzzle_progress_update_own" ON public.user_puzzle_progress;
CREATE POLICY "user_puzzle_progress_update_own"
  ON public.user_puzzle_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- user_puzzle_level_results: usuario inserta/lee solo el suyo
DROP POLICY IF EXISTS "user_puzzle_level_results_select_own" ON public.user_puzzle_level_results;
CREATE POLICY "user_puzzle_level_results_select_own"
  ON public.user_puzzle_level_results FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_puzzle_level_results_insert_own" ON public.user_puzzle_level_results;
CREATE POLICY "user_puzzle_level_results_insert_own"
  ON public.user_puzzle_level_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- puzzle_day_leaderboard: lectura pública (solo alias), inserción vía función o admin
DROP POLICY IF EXISTS "puzzle_day_leaderboard_select" ON public.puzzle_day_leaderboard;
CREATE POLICY "puzzle_day_leaderboard_select"
  ON public.puzzle_day_leaderboard FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "puzzle_day_leaderboard_insert_admin" ON public.puzzle_day_leaderboard;
CREATE POLICY "puzzle_day_leaderboard_insert_admin"
  ON public.puzzle_day_leaderboard FOR INSERT
  WITH CHECK (public.current_user_is_admin());

DROP POLICY IF EXISTS "puzzle_day_leaderboard_update_admin" ON public.puzzle_day_leaderboard;
CREATE POLICY "puzzle_day_leaderboard_update_admin"
  ON public.puzzle_day_leaderboard FOR UPDATE
  USING (public.current_user_is_admin());

-- Trigger updated_at para user_puzzle_progress
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_puzzle_progress_updated_at ON public.user_puzzle_progress;
CREATE TRIGGER user_puzzle_progress_updated_at
  BEFORE UPDATE ON public.user_puzzle_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
