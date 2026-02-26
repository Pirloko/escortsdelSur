-- =============================================================================
-- Franja horaria por perfil: 1 franja elegida, 10 subidas diarias repartidas
-- =============================================================================

ALTER TABLE public.escort_profiles
  ADD COLUMN IF NOT EXISTS time_slot TEXT;

COMMENT ON COLUMN public.escort_profiles.time_slot IS 'Franja horaria para subidas: 09-12, 12-15, 15-18, 18-22, 22-09';
