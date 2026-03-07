-- =============================================================================
-- Nombre de usuario (display_name) único: no permitir duplicados (case-insensitive).
-- Múltiples NULL o vacíos sí permitidos.
-- =============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_display_name_unique
  ON public.profiles (LOWER(TRIM(display_name)))
  WHERE display_name IS NOT NULL AND TRIM(display_name) <> '';

COMMENT ON INDEX public.idx_profiles_display_name_unique IS 'display_name único (case-insensitive, sin espacios). Evita nombres de usuario duplicados.';
