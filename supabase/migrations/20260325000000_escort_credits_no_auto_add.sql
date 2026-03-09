-- =============================================================================
-- Los créditos NO se asignan automáticamente al publicador.
-- Solo el admin puede añadir créditos (AdminPublicadores). Nuevos perfiles
-- empiezan con 0; las promociones solo restan, nunca suman.
-- =============================================================================

ALTER TABLE public.escort_profiles
  ALTER COLUMN credits SET DEFAULT 0;

COMMENT ON COLUMN public.escort_profiles.credits IS 'Créditos para promociones. Por defecto 0. Solo el admin puede añadir créditos; las promociones solo restan.';
