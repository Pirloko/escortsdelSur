-- =============================================================================
-- Créditos del usuario publicador cuando aún no tiene perfiles de escort.
-- Cuando tiene al menos un perfil, los créditos se guardan en escort_profiles.credits.
-- El total mostrado en Mi cuenta = sum(escort_profiles.credits) + publisher_credits.
-- =============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS publisher_credits INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.profiles.publisher_credits IS 'Créditos del publicador cuando tiene 0 perfiles de escort. Al crear el primer perfil se pueden sumar al perfil o seguir mostrándose como saldo del usuario.';
