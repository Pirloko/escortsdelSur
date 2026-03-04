-- =============================================================================
-- Eliminar sistema Puzzle del Día y crear Desafío del Día (quiz desbloqueo imágenes).
-- Mantenemos pepitas_cobre y tickets_rifa en profiles (reutilizados para quiz).
-- =============================================================================

-- Eliminar tablas puzzle (orden: dependientes primero)
DROP TABLE IF EXISTS public.puzzle_day_leaderboard;
DROP TABLE IF EXISTS public.user_puzzle_level_results;
DROP TABLE IF EXISTS public.user_puzzle_progress;
DROP TABLE IF EXISTS public.puzzle_levels;
DROP TABLE IF EXISTS public.puzzle_days;

-- -----------------------------------------------------------------------------
-- daily_quiz: un quiz por día (fecha única)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_quiz (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_daily_quiz_date ON public.daily_quiz(date);
CREATE INDEX IF NOT EXISTS idx_daily_quiz_active ON public.daily_quiz(is_active) WHERE is_active = true;

COMMENT ON TABLE public.daily_quiz IS 'Desafío del día: un quiz por fecha con 10 preguntas.';

-- -----------------------------------------------------------------------------
-- daily_quiz_questions: 10 preguntas por quiz
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.daily_quiz(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  image_url TEXT NOT NULL,
  order_number INT NOT NULL CHECK (order_number >= 1 AND order_number <= 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(quiz_id, order_number)
);

CREATE INDEX IF NOT EXISTS idx_daily_quiz_questions_quiz ON public.daily_quiz_questions(quiz_id);

COMMENT ON TABLE public.daily_quiz_questions IS 'Preguntas del desafío del día. order_number 1-10.';

-- -----------------------------------------------------------------------------
-- user_quiz_progress: progreso del usuario por quiz (una fila por user + quiz)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_quiz_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.daily_quiz(id) ON DELETE CASCADE,
  current_question INT NOT NULL DEFAULT 1 CHECK (current_question >= 1 AND current_question <= 10),
  correct_answers INT NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, quiz_id)
);

CREATE INDEX IF NOT EXISTS idx_user_quiz_progress_user ON public.user_quiz_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_progress_quiz ON public.user_quiz_progress(quiz_id);

COMMENT ON TABLE public.user_quiz_progress IS 'Progreso del usuario en el desafío del día. completed=true cuando responde las 10.';

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
ALTER TABLE public.daily_quiz ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quiz_progress ENABLE ROW LEVEL SECURITY;

-- daily_quiz: lectura pública
DROP POLICY IF EXISTS "daily_quiz_select" ON public.daily_quiz;
CREATE POLICY "daily_quiz_select" ON public.daily_quiz FOR SELECT USING (true);

DROP POLICY IF EXISTS "daily_quiz_insert_admin" ON public.daily_quiz;
CREATE POLICY "daily_quiz_insert_admin" ON public.daily_quiz FOR INSERT WITH CHECK (public.current_user_is_admin());
DROP POLICY IF EXISTS "daily_quiz_update_admin" ON public.daily_quiz;
CREATE POLICY "daily_quiz_update_admin" ON public.daily_quiz FOR UPDATE USING (public.current_user_is_admin());
DROP POLICY IF EXISTS "daily_quiz_delete_admin" ON public.daily_quiz;
CREATE POLICY "daily_quiz_delete_admin" ON public.daily_quiz FOR DELETE USING (public.current_user_is_admin());

-- daily_quiz_questions: lectura pública
DROP POLICY IF EXISTS "daily_quiz_questions_select" ON public.daily_quiz_questions;
CREATE POLICY "daily_quiz_questions_select" ON public.daily_quiz_questions FOR SELECT USING (true);

DROP POLICY IF EXISTS "daily_quiz_questions_insert_admin" ON public.daily_quiz_questions;
CREATE POLICY "daily_quiz_questions_insert_admin" ON public.daily_quiz_questions FOR INSERT WITH CHECK (public.current_user_is_admin());
DROP POLICY IF EXISTS "daily_quiz_questions_update_admin" ON public.daily_quiz_questions;
CREATE POLICY "daily_quiz_questions_update_admin" ON public.daily_quiz_questions FOR UPDATE USING (public.current_user_is_admin());
DROP POLICY IF EXISTS "daily_quiz_questions_delete_admin" ON public.daily_quiz_questions;
CREATE POLICY "daily_quiz_questions_delete_admin" ON public.daily_quiz_questions FOR DELETE USING (public.current_user_is_admin());

-- user_quiz_progress: usuario solo el suyo
DROP POLICY IF EXISTS "user_quiz_progress_select_own" ON public.user_quiz_progress;
CREATE POLICY "user_quiz_progress_select_own" ON public.user_quiz_progress FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_quiz_progress_insert_own" ON public.user_quiz_progress;
CREATE POLICY "user_quiz_progress_insert_own" ON public.user_quiz_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_quiz_progress_update_own" ON public.user_quiz_progress;
CREATE POLICY "user_quiz_progress_update_own" ON public.user_quiz_progress FOR UPDATE USING (auth.uid() = user_id);

-- Trigger updated_at para user_quiz_progress
DROP TRIGGER IF EXISTS user_quiz_progress_updated_at ON public.user_quiz_progress;
CREATE TRIGGER user_quiz_progress_updated_at
  BEFORE UPDATE ON public.user_quiz_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
