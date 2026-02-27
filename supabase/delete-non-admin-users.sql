-- =============================================================================
-- Eliminar todos los usuarios excepto los que tienen role = 'admin' en profiles.
-- Ejecutar en Supabase Dashboard → SQL Editor.
--
-- NOTA: En Supabase Cloud, auth.users suele estar protegido y esta sentencia
-- puede no tener permisos. Si falla, usa el script Node:
--   node scripts/delete-non-admin-users.mjs
-- con SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env
-- =============================================================================

-- Elimina de auth.users a todos los que NO son admin (profiles.role = 'admin').
-- Al borrar en auth.users, por CASCADE se borran sus filas en public.profiles
-- y en tablas que referencian auth.users (favorites, profile_views, etc.).
DELETE FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles WHERE role = 'admin');
