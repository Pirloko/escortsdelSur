-- =============================================================================
-- Promoción: perfiles que aparecen en la galería (carrusel) de la página ciudad
-- =============================================================================

ALTER TABLE public.escort_profiles
  ADD COLUMN IF NOT EXISTS promotion TEXT;

COMMENT ON COLUMN public.escort_profiles.promotion IS 'Promoción del perfil: galeria = aparece en carrusel Galería de la ciudad';
