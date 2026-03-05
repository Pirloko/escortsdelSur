-- =============================================================================
-- Historial de auditoría para usuarios publicador (login, logout, editar, promocionar, eliminar, pausar).
-- Solo el publicador puede insertar filas con su user_id; solo admin puede leer.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.publisher_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  escort_profile_id UUID REFERENCES public.escort_profiles(id) ON DELETE SET NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_publisher_audit_log_user_id ON public.publisher_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_publisher_audit_log_created_at ON public.publisher_audit_log(created_at DESC);

COMMENT ON TABLE public.publisher_audit_log IS 'Auditoría de acciones de usuarios publicador: login, logout, editar/perfil, promocionar, eliminar, pausar.';
COMMENT ON COLUMN public.publisher_audit_log.event_type IS 'login | logout | edit_account | edit_profile | create_profile | delete_profile | promote_profile | pause_profile | unpause_profile | activate_7d';

ALTER TABLE public.publisher_audit_log ENABLE ROW LEVEL SECURITY;

-- El publicador solo puede insertar filas donde user_id = auth.uid()
CREATE POLICY "publisher_audit_log_insert_own"
  ON public.publisher_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Solo admin puede leer todo el historial
CREATE POLICY "publisher_audit_log_select_admin"
  ON public.publisher_audit_log FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Nadie puede UPDATE ni DELETE (solo insert y select admin)
-- (no se crean políticas para UPDATE/DELETE, por defecto se deniegan)
