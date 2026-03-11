-- Límite de perfiles por publicador: de 5 a 20 (solo actualiza el comentario en BD).
-- El límite real se aplica en el front (Cuenta.tsx MAX_PERFILES = 20).
COMMENT ON COLUMN public.escort_profiles.user_id IS 'Usuario que puede editar este perfil. Un usuario puede tener hasta 20 perfiles.';
