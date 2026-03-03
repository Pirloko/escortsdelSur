-- =============================================================================
-- Historias calientes: una por perfil por día, generadas por la Edge Function
-- diaria (cron). Se muestran en la sección "Historias calientes" de la ciudad.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.hot_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escort_profile_id UUID NOT NULL REFERENCES public.escort_profiles(id) ON DELETE CASCADE,
  story_date DATE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(escort_profile_id, story_date)
);

CREATE INDEX IF NOT EXISTS idx_hot_stories_story_date ON public.hot_stories(story_date);
CREATE INDEX IF NOT EXISTS idx_hot_stories_escort_profile_id ON public.hot_stories(escort_profile_id);

ALTER TABLE public.hot_stories ENABLE ROW LEVEL SECURITY;

-- Todos pueden leer (para mostrar en la página de ciudad)
CREATE POLICY "hot_stories_select_all"
  ON public.hot_stories FOR SELECT
  USING (true);

-- Solo service role (Edge Function) puede insertar/actualizar/eliminar; no exponemos políticas INSERT para anon/auth
COMMENT ON TABLE public.hot_stories IS 'Una historia por perfil por día. Generada por la Edge Function generate-hot-stories (cron diario).';
