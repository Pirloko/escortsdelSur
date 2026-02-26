-- =============================================================================
-- Indexación progresiva: control por ciudad (meta_robots, is_active)
-- =============================================================================

ALTER TABLE public.cities
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.cities
  ADD COLUMN IF NOT EXISTS meta_robots TEXT;

COMMENT ON COLUMN public.cities.is_active IS 'Si false, la ciudad no se muestra en listados públicos ni en sitemap.';
COMMENT ON COLUMN public.cities.meta_robots IS 'Valor para meta robots: index, follow | noindex, nofollow | noindex, follow. NULL = index, follow.';
