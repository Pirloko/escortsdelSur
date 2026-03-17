-- =============================================================================
-- Clics en WhatsApp por usuario y perfil (para insignia "El Cachero" / Comunicador).
-- Un registro por (user_id, escort_profile_id); cuenta para ranking semanal.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.profile_whatsapp_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  escort_profile_id UUID NOT NULL REFERENCES public.escort_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, escort_profile_id)
);

CREATE INDEX idx_profile_whatsapp_clicks_user_created ON public.profile_whatsapp_clicks(user_id, created_at DESC);

COMMENT ON TABLE public.profile_whatsapp_clicks IS 'Registro de clics en WhatsApp por visitante y perfil; usado para insignia semanal El Cachero (5 perfiles).';

ALTER TABLE public.profile_whatsapp_clicks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profile_whatsapp_clicks_select_own" ON public.profile_whatsapp_clicks;
CREATE POLICY "profile_whatsapp_clicks_select_own"
  ON public.profile_whatsapp_clicks FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "profile_whatsapp_clicks_insert_own" ON public.profile_whatsapp_clicks;
CREATE POLICY "profile_whatsapp_clicks_insert_own"
  ON public.profile_whatsapp_clicks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
