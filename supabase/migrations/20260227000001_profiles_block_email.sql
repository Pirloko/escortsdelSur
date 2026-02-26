-- =============================================================================
-- Gestión de visitantes/clientes: bloquear y contacto.
-- =============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT;

COMMENT ON COLUMN public.profiles.is_blocked IS 'Si true, el usuario (visitante/cliente) está bloqueado y no debe poder usar la app.';
COMMENT ON COLUMN public.profiles.email IS 'Email de contacto (opcional; para visitantes puede usarse para contactar desde admin).';

CREATE INDEX IF NOT EXISTS idx_profiles_is_blocked ON public.profiles(is_blocked) WHERE is_blocked = true;
