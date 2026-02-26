-- =============================================================================
-- Indexación progresiva: solo Rancagua indexable al inicio.
-- Resto de ciudades: noindex hasta activar manualmente (profiles >= 10, seo_content completo, interlinking listo).
-- =============================================================================

UPDATE public.cities
SET is_active = false,
    meta_robots = 'noindex, nofollow'
WHERE slug IS DISTINCT FROM 'rancagua';

UPDATE public.cities
SET is_active = true,
    meta_robots = NULL
WHERE slug = 'rancagua';

COMMENT ON COLUMN public.cities.is_active IS 'Solo ciudades con is_active = true aparecen en sitemap y con index, follow. Activar cuando profiles >= 10 y contenido listo.';
