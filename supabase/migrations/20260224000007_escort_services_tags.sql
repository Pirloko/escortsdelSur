-- Etiquetas de servicios: Servicios Incluidos y Adicionales
ALTER TABLE public.escort_profiles
  ADD COLUMN IF NOT EXISTS services_included JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS services_extra JSONB NOT NULL DEFAULT '[]';

COMMENT ON COLUMN public.escort_profiles.services_included IS 'Etiquetas de servicios incluidos (array de strings).';
COMMENT ON COLUMN public.escort_profiles.services_extra IS 'Etiquetas de servicios adicionales (array de strings).';
