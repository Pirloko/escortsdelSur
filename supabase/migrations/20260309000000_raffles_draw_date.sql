-- Fecha exacta en que se realizará (o desde cuando se puede realizar) el sorteo.
-- Hasta esa fecha se cuentan los tickets; el admin puede ejecutar el sorteo en o después de esa fecha.
ALTER TABLE public.raffles
  ADD COLUMN IF NOT EXISTS draw_date DATE;

COMMENT ON COLUMN public.raffles.draw_date IS 'Fecha del sorteo. El admin puede ejecutar el sorteo en o después de esta fecha. Hasta entonces se acumulan tickets.';
