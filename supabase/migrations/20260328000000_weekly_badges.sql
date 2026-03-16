-- =============================================================================
-- Insignias semanales: completar retos cada semana, recibir tickets 1 vez por semana.
-- Semana = lunes a domingo (week_key = fecha del lunes en UTC, YYYY-MM-DD).
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_weekly_badge_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_key TEXT NOT NULL,
  badge_key TEXT NOT NULL,
  tickets_awarded INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_key, badge_key)
);

CREATE INDEX idx_user_weekly_badge_user_week ON public.user_weekly_badge_completions(user_id, week_key);
COMMENT ON TABLE public.user_weekly_badge_completions IS 'Insignias semanales completadas por usuario. Cada (user, week, badge) solo una vez; tickets_awarded se suma a profiles.tickets_rifa al completar.';

ALTER TABLE public.user_weekly_badge_completions ENABLE ROW LEVEL SECURITY;

-- Usuario ve solo sus propias filas
DROP POLICY IF EXISTS "user_weekly_badge_select_own" ON public.user_weekly_badge_completions;
CREATE POLICY "user_weekly_badge_select_own"
  ON public.user_weekly_badge_completions FOR SELECT
  USING (auth.uid() = user_id);

-- Solo el propio usuario puede insertar (la app inserta al detectar que completó un reto y otorga tickets)
DROP POLICY IF EXISTS "user_weekly_badge_insert_own" ON public.user_weekly_badge_completions;
CREATE POLICY "user_weekly_badge_insert_own"
  ON public.user_weekly_badge_completions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admin puede leer todo (opcional, para estadísticas)
DROP POLICY IF EXISTS "user_weekly_badge_select_admin" ON public.user_weekly_badge_completions;
CREATE POLICY "user_weekly_badge_select_admin"
  ON public.user_weekly_badge_completions FOR SELECT
  USING (public.current_user_is_admin());
