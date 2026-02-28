-- =============================================================================
-- Eliminar TODOS los usuarios con role = 'registered_user' (publicadores/escorts).
-- Ejecutar en Supabase Dashboard → SQL Editor.
--
-- NOTA: En Supabase Cloud puede que no tengas permisos para borrar en auth.users.
-- Si falla, usa el script Node:
--   node scripts/delete-registered-users.mjs
-- con SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env
-- =============================================================================

-- Borrar de auth.users solo a los que tienen role = 'registered_user' en profiles.
-- Al borrar en auth.users, por CASCADE se borran sus filas en public.profiles
-- y en tablas que referencian auth.users (favorites, profile_views, credit_transactions, etc.).
-- escort_profiles con user_id apuntando a estos usuarios quedarán con user_id = NULL (ON DELETE SET NULL).
DELETE FROM auth.users
WHERE id IN (SELECT id FROM public.profiles WHERE role = 'registered_user');
