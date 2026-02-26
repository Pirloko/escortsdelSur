-- El dueño del perfil (user_id = auth.uid()) puede borrar su propio perfil de escort.
CREATE POLICY "escort_profiles_delete_owner"
  ON public.escort_profiles FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
