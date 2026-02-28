-- =============================================================================
-- Múltiples franjas horarias por perfil: time_slots[] y subidas 10 por franja
-- subidas_per_day puede ser 10, 20, 30, 40, 50 (1 a 5 franjas × 10)
-- =============================================================================

ALTER TABLE public.escort_profiles
  ADD COLUMN IF NOT EXISTS time_slots TEXT[] DEFAULT '{}';

COMMENT ON COLUMN public.escort_profiles.time_slots IS 'Franjas horarias seleccionadas: 09-12, 12-15, 15-18, 18-22, 22-09. Cada una tiene 10 subidas/día.';

-- Rellenar desde time_slot existente
UPDATE public.escort_profiles
SET time_slots = ARRAY[time_slot]
WHERE time_slot IS NOT NULL AND (time_slots IS NULL OR time_slots = '{}');

-- Ampliar constraint de subidas_per_day: 5 (legacy), 10, 20, 30, 40, 50
ALTER TABLE public.escort_profiles
  DROP CONSTRAINT IF EXISTS escort_profiles_subidas_per_day_check;

ALTER TABLE public.escort_profiles
  ADD CONSTRAINT escort_profiles_subidas_per_day_check
  CHECK (subidas_per_day IS NULL OR subidas_per_day IN (5, 10, 20, 30, 40, 50));

COMMENT ON COLUMN public.escort_profiles.subidas_per_day IS 'Subidas diarias totales: 5 (legacy), o 10/20/30/40/50 (1 a 5 franjas × 10)';
