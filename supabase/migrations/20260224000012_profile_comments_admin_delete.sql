-- =============================================================================
-- Admin puede eliminar cualquier comentario
-- =============================================================================

CREATE POLICY "profile_comments_delete_admin"
  ON public.profile_comments FOR DELETE
  TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
