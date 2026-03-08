-- Slug SEO para perfiles: URLs /:citySlug/:slug (ej. /rancagua/camila-escort)
-- slug único por ciudad; generado desde nombre + "escort"

ALTER TABLE public.escort_profiles
  ADD COLUMN IF NOT EXISTS slug TEXT;

-- Unicidad por ciudad: (city_id, slug)
CREATE UNIQUE INDEX IF NOT EXISTS idx_escort_profiles_city_slug_unique
  ON public.escort_profiles (city_id, slug)
  WHERE slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_escort_profiles_slug
  ON public.escort_profiles (slug)
  WHERE slug IS NOT NULL;

COMMENT ON COLUMN public.escort_profiles.slug IS 'Slug SEO único por ciudad. URL final: /{cities.slug}/{escort_profiles.slug}';

-- Función: normalizar texto a slug (minúsculas, sin acentos, guiones)
CREATE OR REPLACE FUNCTION public.slugify(val TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  result TEXT;
BEGIN
  IF val IS NULL OR trim(val) = '' THEN
    RETURN NULL;
  END IF;
  result := lower(trim(val));
  result := translate(result, 'áàäâãåéèëêíìïîóòöôõúùüûñç', 'aaaaaaeeeeiiiiooooouuuunc');
  result := regexp_replace(result, '[^a-z0-9\s-]', '', 'g');
  result := regexp_replace(result, '[\s_-]+', '-', 'g');
  result := trim(both '-' from result);
  result := regexp_replace(result, '-+', '-', 'g');
  IF length(result) > 200 THEN
    result := left(result, 200);
    result := trim(both '-' from result);
  END IF;
  RETURN NULLIF(result, '');
END;
$$;

-- Función: generar slug base para perfil (nombre + "-escort")
CREATE OR REPLACE FUNCTION public.escort_profile_slug_base(name_val TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN slugify(name_val) || '-escort';
END;
$$;

-- Backfill: asignar slug a perfiles existentes (por city_id, nombre; desempate por id)
DO $$
DECLARE
  r RECORD;
  base_slug TEXT;
  final_slug TEXT;
  counter INT;
  city_slug_val TEXT;
BEGIN
  FOR r IN
    SELECT ep.id, ep.name, ep.city_id, c.slug AS city_slug
    FROM public.escort_profiles ep
    JOIN public.cities c ON c.id = ep.city_id
    WHERE ep.slug IS NULL
    ORDER BY ep.city_id, ep.name, ep.id
  LOOP
    base_slug := escort_profile_slug_base(r.name);
    IF base_slug IS NULL THEN
      base_slug := 'perfil-' || left(r.id::text, 8);
    END IF;
    final_slug := base_slug;
    counter := 1;
    WHILE EXISTS (
      SELECT 1 FROM public.escort_profiles e2
      WHERE e2.city_id = r.city_id AND e2.slug = final_slug AND e2.id != r.id
    ) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    UPDATE public.escort_profiles SET slug = final_slug WHERE id = r.id;
  END LOOP;
END;
$$;

-- Trigger: generar slug al insertar si viene vacío
CREATE OR REPLACE FUNCTION public.escort_profiles_set_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INT;
BEGIN
  IF NEW.slug IS NOT NULL AND trim(NEW.slug) != '' THEN
    RETURN NEW;
  END IF;
  base_slug := escort_profile_slug_base(NEW.name);
  IF base_slug IS NULL THEN
    base_slug := 'perfil-' || left(NEW.id::text, 8);
  END IF;
  final_slug := base_slug;
  counter := 1;
  WHILE EXISTS (
    SELECT 1 FROM public.escort_profiles
    WHERE city_id = NEW.city_id AND slug = final_slug
  ) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  NEW.slug := final_slug;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS escort_profiles_set_slug_trigger ON public.escort_profiles;
CREATE TRIGGER escort_profiles_set_slug_trigger
  BEFORE INSERT ON public.escort_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.escort_profiles_set_slug();

-- Actualizar slug en UPDATE si name cambió y slug estaba vacío o es auto-generado (opcional: no sobrescribir si el usuario puso slug a mano)
-- Por simplicidad no actualizamos slug en UPDATE; se puede regenerar desde la app si se desea.
