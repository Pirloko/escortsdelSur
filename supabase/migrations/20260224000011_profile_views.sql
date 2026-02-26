-- =============================================================================
-- Visualizaciones de perfiles: escorts que ha visto cada visitante/cliente
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  escort_profile_id UUID NOT NULL REFERENCES public.escort_profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, escort_profile_id)
);

CREATE INDEX idx_profile_views_user ON public.profile_views(user_id);
CREATE INDEX idx_profile_views_viewed_at ON public.profile_views(viewed_at DESC);

ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- El usuario solo ve sus propias filas
CREATE POLICY "profile_views_select_own"
  ON public.profile_views FOR SELECT
  USING (auth.uid() = user_id);

-- Solo el propio usuario puede insertar/actualizar (upsert al visualizar)
CREATE POLICY "profile_views_insert_own"
  ON public.profile_views FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profile_views_update_own"
  ON public.profile_views FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE public.profile_views IS 'Perfiles escort vistos por cada visitante/cliente (para historial en Mi perfil).';
