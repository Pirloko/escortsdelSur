-- Tabla cities para SEO escalable por ciudad.
-- Campos base: id, name, slug, profiles, image.
-- Campos SEO: seo_title, seo_description, seo_content, keyword_primary.
-- Permite gestionar títulos, descripciones y contenido único desde Supabase sin redeploy.

CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  profiles INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  -- SEO (escalabilidad futura)
  keyword_primary TEXT NOT NULL,
  seo_title TEXT NOT NULL,
  seo_description TEXT NOT NULL,
  seo_content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índice para rutas por slug
CREATE INDEX IF NOT EXISTS idx_cities_slug ON cities(slug);

-- RLS (opcional: solo lectura pública para listado)
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cities are viewable by everyone" ON cities;
CREATE POLICY "Cities are viewable by everyone"
  ON cities FOR SELECT
  USING (true);

-- Ejemplo de inserción Fase 1 (slug debe coincidir con rutas: /rancagua, /talca, etc.)
-- INSERT INTO cities (slug, name, profiles, image, keyword_primary, seo_title, seo_description, seo_content)
-- VALUES
--   ('rancagua', 'Rancagua', 24, 'https://...', 'escorts en Rancagua', 'Escorts en Rancagua | Perfiles Premium en el Sur de Chile', '...', '...'),
--   ('talca', 'Talca', 18, 'https://...', 'escorts en Talca', '...', '...', '...');

COMMENT ON TABLE cities IS 'Ciudades del marketplace con contenido SEO por URL (/:slug). Escalable ciudad por ciudad.';
