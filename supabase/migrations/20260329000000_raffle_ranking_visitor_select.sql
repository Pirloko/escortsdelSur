-- =============================================================================
-- Ranking de rifa: usuarios visitantes pueden leer display_name y tickets_rifa
-- de otros visitantes (solo para mostrar el ranking en la pantalla Rifa).
-- =============================================================================

CREATE OR REPLACE FUNCTION public.current_user_is_visitor()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'visitor');
$$;

COMMENT ON FUNCTION public.current_user_is_visitor() IS 'Usado en RLS para permitir a visitantes ver ranking de tickets (solo filas con role=visitor).';

DROP POLICY IF EXISTS "profiles_select_visitors_ranking" ON public.profiles;
CREATE POLICY "profiles_select_visitors_ranking"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND public.current_user_is_visitor()
    AND role = 'visitor'
  );
