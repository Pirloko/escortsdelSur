-- =============================================================================
-- Permitir varios perfiles por usuario (hasta 5). Quitar UNIQUE en user_id.
-- =============================================================================

ALTER TABLE public.escort_profiles
  DROP CONSTRAINT IF EXISTS escort_profiles_user_id_key;

COMMENT ON COLUMN public.escort_profiles.user_id IS 'Usuario que puede editar este perfil. Un usuario puede tener hasta 5 perfiles.';
