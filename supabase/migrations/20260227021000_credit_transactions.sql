-- =============================================================================
-- Historial de créditos (compras / ajustes / consumo)
-- =============================================================================

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  escort_profile_id uuid references public.escort_profiles(id) on delete set null,
  amount integer not null,
  type text not null check (type in ('admin_add')),
  description text,
  created_at timestamptz not null default now()
);

create index if not exists idx_credit_transactions_user_id_created_at
  on public.credit_transactions(user_id, created_at desc);

comment on table public.credit_transactions is 'Movimientos de créditos por usuario/perfil (compras, ajustes, consumo).';
comment on column public.credit_transactions.amount is 'Créditos positivos = entran, negativos = se consumen.';

