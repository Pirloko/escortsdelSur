-- =============================================================================
-- Sistema de Rifa Mensual: premio físico, sorteo ponderado por tickets,
-- snapshot de participantes, reinicio de tickets al ejecutar.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- raffles: una rifa por mes, admin la crea y ejecuta manualmente
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.raffles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  month INT NOT NULL CHECK (month >= 1 AND month <= 12),
  year INT NOT NULL CHECK (year >= 2020 AND year <= 2100),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  winner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  total_tickets INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  executed_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_raffles_one_active ON public.raffles (status) WHERE status = 'active';
CREATE INDEX idx_raffles_status ON public.raffles(status);
CREATE INDEX idx_raffles_year_month ON public.raffles(year, month);

COMMENT ON TABLE public.raffles IS 'Rifa mensual. Solo una activa. Al ejecutar: sorteo ponderado, snapshot, tickets a 0, status=closed.';

-- -----------------------------------------------------------------------------
-- raffle_participants_snapshot: snapshot de participantes al momento del sorteo
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.raffle_participants_snapshot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id UUID NOT NULL REFERENCES public.raffles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tickets_used INT NOT NULL CHECK (tickets_used >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_raffle_participants_snapshot_raffle ON public.raffle_participants_snapshot(raffle_id);

COMMENT ON TABLE public.raffle_participants_snapshot IS 'Snapshot de tickets por usuario en el momento de ejecutar el sorteo.';

-- -----------------------------------------------------------------------------
-- raffle_prizes: premio asignado al ganador; estado hasta delivered
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.raffle_prizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id UUID NOT NULL REFERENCES public.raffles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'delivered')),
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_raffle_prizes_one_per_raffle ON public.raffle_prizes(raffle_id);
CREATE INDEX idx_raffle_prizes_user ON public.raffle_prizes(user_id);

COMMENT ON TABLE public.raffle_prizes IS 'Premio del ganador. Cuando status=delivered el botón Cobrar desaparece.';

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
ALTER TABLE public.raffles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raffle_participants_snapshot ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raffle_prizes ENABLE ROW LEVEL SECURITY;

-- raffles: lectura pública para página de rifa; escritura solo admin
DROP POLICY IF EXISTS "raffles_select" ON public.raffles;
CREATE POLICY "raffles_select" ON public.raffles FOR SELECT USING (true);

DROP POLICY IF EXISTS "raffles_insert_admin" ON public.raffles;
CREATE POLICY "raffles_insert_admin" ON public.raffles FOR INSERT WITH CHECK (public.current_user_is_admin());
DROP POLICY IF EXISTS "raffles_update_admin" ON public.raffles;
CREATE POLICY "raffles_update_admin" ON public.raffles FOR UPDATE USING (public.current_user_is_admin());
DROP POLICY IF EXISTS "raffles_delete_admin" ON public.raffles;
CREATE POLICY "raffles_delete_admin" ON public.raffles FOR DELETE USING (public.current_user_is_admin());

-- raffle_participants_snapshot: solo admin lee (transparencia puede exponer agregados)
DROP POLICY IF EXISTS "raffle_participants_snapshot_select_admin" ON public.raffle_participants_snapshot;
CREATE POLICY "raffle_participants_snapshot_select_admin" ON public.raffle_participants_snapshot FOR SELECT USING (public.current_user_is_admin());
DROP POLICY IF EXISTS "raffle_participants_snapshot_insert_admin" ON public.raffle_participants_snapshot;
CREATE POLICY "raffle_participants_snapshot_insert_admin" ON public.raffle_participants_snapshot FOR INSERT WITH CHECK (public.current_user_is_admin());

-- raffle_prizes: ganador ve solo el suyo; admin ve/actualiza todos
DROP POLICY IF EXISTS "raffle_prizes_select_own" ON public.raffle_prizes;
CREATE POLICY "raffle_prizes_select_own" ON public.raffle_prizes FOR SELECT USING (auth.uid() = user_id OR public.current_user_is_admin());
DROP POLICY IF EXISTS "raffle_prizes_insert_admin" ON public.raffle_prizes;
CREATE POLICY "raffle_prizes_insert_admin" ON public.raffle_prizes FOR INSERT WITH CHECK (public.current_user_is_admin());
DROP POLICY IF EXISTS "raffle_prizes_update_admin" ON public.raffle_prizes;
CREATE POLICY "raffle_prizes_update_admin" ON public.raffle_prizes FOR UPDATE USING (public.current_user_is_admin());
