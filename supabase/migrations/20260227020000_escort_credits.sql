-- =============================================================================
-- Créditos para perfiles de escort
-- - Cada perfil nuevo parte con 5000 créditos.
-- - Créditos se almacenan en escort_profiles. Un admin puede modificarlos.
-- =============================================================================

ALTER TABLE public.escort_profiles
  ADD COLUMN IF NOT EXISTS credits INTEGER NOT NULL DEFAULT 5000;

COMMENT ON COLUMN public.escort_profiles.credits IS 'Créditos disponibles para promociones (por perfil). Nuevo perfil comienza con 5000 créditos.';

