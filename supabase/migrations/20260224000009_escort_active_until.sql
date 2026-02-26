-- Perfiles de escort visibles 7 días. Tras vencer, quedan ocultos hasta que el usuario "Active 7 días" de nuevo.
ALTER TABLE public.escort_profiles
  ADD COLUMN IF NOT EXISTS active_until TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN public.escort_profiles.active_until IS 'Hasta cuándo el perfil es visible en listados. Si es NULL o > now(), visible. Si < now(), oculto.';

CREATE INDEX IF NOT EXISTS idx_escort_profiles_active_until ON public.escort_profiles(active_until);
