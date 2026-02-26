-- =============================================================================
-- FIX: Las políticas de profiles y otras tablas usaban un subquery a profiles
-- dentro de la política de profiles, causando recursión infinita y error 500.
-- Solución: función SECURITY DEFINER que lee profiles sin pasar por RLS.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

-- Quitar políticas que usan el subquery recursivo
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "escort_profiles_insert_admin" ON public.escort_profiles;
DROP POLICY IF EXISTS "escort_profiles_update_admin_or_owner" ON public.escort_profiles;
DROP POLICY IF EXISTS "escort_profiles_delete_admin" ON public.escort_profiles;
DROP POLICY IF EXISTS "cities_insert_admin" ON public.cities;
DROP POLICY IF EXISTS "cities_update_admin" ON public.cities;
DROP POLICY IF EXISTS "cities_delete_admin" ON public.cities;

-- Recrear políticas usando la función (sin recursión)
CREATE POLICY "profiles_select_own_or_admin"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.current_user_is_admin());

CREATE POLICY "profiles_update_own_or_admin"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.current_user_is_admin());

CREATE POLICY "escort_profiles_insert_admin"
  ON public.escort_profiles FOR INSERT
  WITH CHECK (public.current_user_is_admin());

CREATE POLICY "escort_profiles_update_admin_or_owner"
  ON public.escort_profiles FOR UPDATE
  USING (public.current_user_is_admin() OR user_id = auth.uid());

CREATE POLICY "escort_profiles_delete_admin"
  ON public.escort_profiles FOR DELETE
  USING (public.current_user_is_admin());

CREATE POLICY "cities_insert_admin"
  ON public.cities FOR INSERT
  WITH CHECK (public.current_user_is_admin());

CREATE POLICY "cities_update_admin"
  ON public.cities FOR UPDATE
  USING (public.current_user_is_admin());

CREATE POLICY "cities_delete_admin"
  ON public.cities FOR DELETE
  USING (public.current_user_is_admin());

COMMENT ON FUNCTION public.current_user_is_admin() IS 'Usado en RLS para evitar subquery recursivo a profiles.';
