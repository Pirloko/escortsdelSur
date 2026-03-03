-- =============================================================================
-- Frases de "estados actualizados" que el admin gestiona. Se muestran en la
-- página de ciudad asignadas aleatoriamente a los perfiles.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.status_phrases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_status_phrases_updated_at ON public.status_phrases(updated_at);

ALTER TABLE public.status_phrases ENABLE ROW LEVEL SECURITY;

-- Todos pueden leer (para mostrar en la página de ciudad)
CREATE POLICY "status_phrases_select_all"
  ON public.status_phrases FOR SELECT
  USING (true);

-- Solo admin puede insertar/actualizar/eliminar
CREATE POLICY "status_phrases_insert_admin"
  ON public.status_phrases FOR INSERT
  WITH CHECK (public.current_user_is_admin());

CREATE POLICY "status_phrases_update_admin"
  ON public.status_phrases FOR UPDATE
  USING (public.current_user_is_admin());

CREATE POLICY "status_phrases_delete_admin"
  ON public.status_phrases FOR DELETE
  USING (public.current_user_is_admin());

COMMENT ON TABLE public.status_phrases IS 'Frases para la sección "Estados actualizados" en página de ciudad. El admin las gestiona; se asignan aleatoriamente a los perfiles.';
