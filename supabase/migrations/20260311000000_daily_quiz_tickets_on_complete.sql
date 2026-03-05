-- Tickets extra que gana el usuario al completar el desafío (las 10 preguntas).
-- Por acierto se siguen dando 1 ticket; este valor se suma al completar.
ALTER TABLE public.daily_quiz
  ADD COLUMN IF NOT EXISTS tickets_on_complete INT NOT NULL DEFAULT 10;

ALTER TABLE public.daily_quiz
  ADD CONSTRAINT daily_quiz_tickets_on_complete_non_negative
  CHECK (tickets_on_complete >= 0);

COMMENT ON COLUMN public.daily_quiz.tickets_on_complete IS 'Tickets extra que gana el usuario al completar las 10 preguntas del desafío.';
