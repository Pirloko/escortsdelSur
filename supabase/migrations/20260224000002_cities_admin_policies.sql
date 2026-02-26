-- Admin puede crear, actualizar y borrar ciudades.
-- El público solo puede SELECT (ya existía).

CREATE POLICY "cities_insert_admin"
  ON public.cities FOR INSERT
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "cities_update_admin"
  ON public.cities FOR UPDATE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "cities_delete_admin"
  ON public.cities FOR DELETE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
