-- Añadir nacionalidad al perfil (país de origen, selección desplegable).
ALTER TABLE public.escort_profiles
  ADD COLUMN IF NOT EXISTS nationality TEXT;

COMMENT ON COLUMN public.escort_profiles.nationality IS 'Nacionalidad del perfil (país, ej. Chile, Argentina). Listado latinoamericano en el front.';
