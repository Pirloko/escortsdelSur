-- =============================================================================
-- Subidas por día: opción 5 o 10 subidas dentro de la franja
-- =============================================================================

ALTER TABLE public.escort_profiles
  ADD COLUMN IF NOT EXISTS subidas_per_day INTEGER DEFAULT 10;

ALTER TABLE public.escort_profiles
  DROP CONSTRAINT IF EXISTS escort_profiles_subidas_per_day_check;

ALTER TABLE public.escort_profiles
  ADD CONSTRAINT escort_profiles_subidas_per_day_check CHECK (subidas_per_day IS NULL OR subidas_per_day IN (5, 10));

COMMENT ON COLUMN public.escort_profiles.subidas_per_day IS 'Número de subidas diarias en la franja: 5 o 10';
