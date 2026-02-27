-- =============================================================================
-- Permitir tipo 'promocion' en credit_transactions (descuento al activar promoción).
-- =============================================================================

ALTER TABLE public.credit_transactions
  DROP CONSTRAINT IF EXISTS credit_transactions_type_check;

ALTER TABLE public.credit_transactions
  ADD CONSTRAINT credit_transactions_type_check
  CHECK (type IN ('admin_add', 'promocion'));

COMMENT ON COLUMN public.credit_transactions.amount IS 'Créditos: positivos = entran (ej. admin), negativos = se consumen (ej. promoción).';
