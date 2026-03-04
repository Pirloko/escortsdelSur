-- Permitir que el usuario inserte su propia fila en el leaderboard al completar el puzzle.
DROP POLICY IF EXISTS "puzzle_day_leaderboard_insert_own" ON public.puzzle_day_leaderboard;
CREATE POLICY "puzzle_day_leaderboard_insert_own"
  ON public.puzzle_day_leaderboard FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios no pueden insertar como admin; mantener la política admin para otros casos.
-- La política insert_own permite que el cliente inserte cuando user_id = auth.uid().
-- Nota: Si existe insert_admin, Postgres permite INSERT si alguna política pasa; ambas pueden coexistir.
