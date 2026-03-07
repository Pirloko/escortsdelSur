-- Permitir subidas_per_day para todas las combinaciones: 1-5 franjas × 5 o 10 subidas por franja
-- Valores posibles: 5, 10, 15, 20, 25, 30, 35, 40, 45, 50 (y NULL)
ALTER TABLE public.escort_profiles
  DROP CONSTRAINT IF EXISTS escort_profiles_subidas_per_day_check;

ALTER TABLE public.escort_profiles
  ADD CONSTRAINT escort_profiles_subidas_per_day_check
  CHECK (
    subidas_per_day IS NULL
    OR subidas_per_day IN (5, 10, 15, 20, 25, 30, 35, 40, 45, 50)
  );

COMMENT ON COLUMN public.escort_profiles.subidas_per_day IS 'Subidas diarias totales: franjas × (5 o 10) por franja. Valores: 5, 10, 15, 20, 25, 30, 35, 40, 45, 50.';
