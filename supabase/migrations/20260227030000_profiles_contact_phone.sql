-- =============================================================================
-- Número de contacto del usuario (publicador/visitante) para mostrar en admin.
-- Sincronizado desde user_metadata.whatsapp al guardar en Cuenta.
-- =============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS contact_phone TEXT;

COMMENT ON COLUMN public.profiles.contact_phone IS 'Teléfono/WhatsApp del usuario. Sincronizado desde auth.user_metadata.whatsapp al editar datos de cuenta.';
