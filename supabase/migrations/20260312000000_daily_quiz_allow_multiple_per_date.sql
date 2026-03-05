-- Permitir varios quizzes activos (misma fecha o distintas).
-- Los usuarios podrán elegir qué desafío jugar.
ALTER TABLE public.daily_quiz
  DROP CONSTRAINT IF EXISTS daily_quiz_date_key;

-- Índice para listar por fecha (sin unicidad)
CREATE INDEX IF NOT EXISTS idx_daily_quiz_date_ordering
  ON public.daily_quiz(date DESC, created_at DESC);

COMMENT ON TABLE public.daily_quiz IS 'Desafíos del día: pueden existir varios activos a la vez; el usuario elige cuál jugar.';
