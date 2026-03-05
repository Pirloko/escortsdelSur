-- Añadir título opcional al desafío del día
ALTER TABLE public.daily_quiz
  ADD COLUMN IF NOT EXISTS title TEXT;

COMMENT ON COLUMN public.daily_quiz.title IS 'Título del desafío (ej. "Cultura general", "Música"). Opcional.';
