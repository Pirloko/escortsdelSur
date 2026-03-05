-- Permitir al admin eliminar filas de profiles (ej. visitantes desde Admin → Visitantes/Clientes).
-- Sin esta política, RLS bloqueaba el DELETE y el botón Eliminar no funcionaba.
CREATE POLICY "profiles_delete_admin"
  ON public.profiles FOR DELETE
  USING (public.current_user_is_admin());
