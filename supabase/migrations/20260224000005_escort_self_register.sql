-- Permite que un usuario autenticado cree su propio perfil de escort (user_id = auth.uid()).
-- Usado en el flujo "Registrarme" como escort → Completar perfil → crear escort_profile.

CREATE POLICY "escort_profiles_insert_own"
  ON public.escort_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
