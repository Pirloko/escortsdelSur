-- =============================================================================
-- Comentarios en perfiles: visitantes/clientes pueden dejar 1 por día por perfil
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.profile_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escort_profile_id UUID NOT NULL REFERENCES public.escort_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Máximo 1 comentario por usuario por perfil por día
CREATE UNIQUE INDEX idx_profile_comments_one_per_day
  ON public.profile_comments (escort_profile_id, user_id, ((created_at AT TIME ZONE 'UTC')::date));

CREATE INDEX idx_profile_comments_escort ON public.profile_comments(escort_profile_id);
CREATE INDEX idx_profile_comments_created ON public.profile_comments(created_at DESC);

ALTER TABLE public.profile_comments ENABLE ROW LEVEL SECURITY;

-- Todos pueden leer comentarios
CREATE POLICY "profile_comments_select_all"
  ON public.profile_comments FOR SELECT
  USING (true);

-- Solo usuarios autenticados pueden insertar (límite 1/día se aplica por unique index)
CREATE POLICY "profile_comments_insert_authenticated"
  ON public.profile_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Solo el autor puede borrar su comentario
CREATE POLICY "profile_comments_delete_own"
  ON public.profile_comments FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.profile_comments IS 'Comentarios en perfiles escort. Visitantes/clientes: 1 por día por perfil.';
