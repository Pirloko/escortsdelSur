-- =============================================================================
-- Reseñas verificadas de experiencia: tabla, RLS, límite 1 cada 7 días,
-- tickets: +1 por comentario simple, +3 por reseña.
-- =============================================================================

-- Tabla review_experiences
CREATE TABLE IF NOT EXISTS public.review_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escort_profile_id UUID NOT NULL REFERENCES public.escort_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  precio_pagado TEXT,
  duracion_servicio TEXT,
  lugar_encuentro TEXT,

  rating_comunicacion INT CHECK (rating_comunicacion >= 1 AND rating_comunicacion <= 5),
  respuesta_whatsapp TEXT,

  coincidencia_fotos TEXT,
  nivel_photoshop INT CHECK (nivel_photoshop IS NULL OR nivel_photoshop IN (0, 25, 50, 75)),

  estatura_aproximada TEXT,
  contextura TEXT,
  higiene INT CHECK (higiene >= 1 AND higiene <= 5),

  besos INT CHECK (besos >= 1 AND besos <= 10),
  oral INT CHECK (oral >= 1 AND oral <= 10),
  movimiento_corporal INT CHECK (movimiento_corporal >= 1 AND movimiento_corporal <= 10),
  actitud INT CHECK (actitud >= 1 AND actitud <= 10),
  quimica INT CHECK (quimica >= 1 AND quimica <= 10),
  participacion INT CHECK (participacion >= 1 AND participacion <= 10),

  calidad_lugar INT CHECK (calidad_lugar >= 1 AND calidad_lugar <= 5),
  privacidad TEXT,

  atencion_general INT CHECK (atencion_general >= 1 AND atencion_general <= 5),
  cumplio_prometido TEXT,
  volveria_contactar TEXT,

  promedio_final NUMERIC(3,2) NOT NULL,

  comentario_experiencia TEXT NOT NULL CHECK (char_length(comentario_experiencia) >= 50),
  tags TEXT[] DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_review_experiences_escort ON public.review_experiences(escort_profile_id);
CREATE INDEX idx_review_experiences_created ON public.review_experiences(created_at DESC);
CREATE INDEX idx_review_experiences_user_escort ON public.review_experiences(user_id, escort_profile_id);

ALTER TABLE public.review_experiences ENABLE ROW LEVEL SECURITY;

-- Todos pueden leer reseñas
CREATE POLICY "review_experiences_select_all"
  ON public.review_experiences FOR SELECT
  USING (true);

-- Solo autenticados pueden insertar (límite 7 días se aplica por función)
CREATE POLICY "review_experiences_insert_authenticated"
  ON public.review_experiences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Solo el autor puede borrar su reseña
CREATE POLICY "review_experiences_delete_own"
  ON public.review_experiences FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.review_experiences IS 'Reseñas verificadas de experiencia en perfiles escort. 1 por usuario por perfil cada 7 días. +3 tickets.';

-- Para INSERT: comprobar que no exista otra reseña del usuario en este perfil en últimos 7 días
CREATE OR REPLACE FUNCTION public.check_review_7_days_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.review_experiences
    WHERE escort_profile_id = NEW.escort_profile_id
      AND user_id = NEW.user_id
      AND created_at >= (now() AT TIME ZONE 'UTC') - INTERVAL '7 days'
  ) THEN
    RAISE EXCEPTION 'Solo puedes dejar 1 reseña por perfil cada 7 días.'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS review_experiences_7_days ON public.review_experiences;
CREATE TRIGGER review_experiences_7_days
  BEFORE INSERT ON public.review_experiences
  FOR EACH ROW
  EXECUTE FUNCTION public.check_review_7_days_on_insert();

-- Trigger: +1 ticket al insertar un comentario simple (profile_comments)
CREATE OR REPLACE FUNCTION public.add_ticket_on_profile_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET tickets_rifa = COALESCE(tickets_rifa, 0) + 1
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profile_comments_add_ticket ON public.profile_comments;
CREATE TRIGGER profile_comments_add_ticket
  AFTER INSERT ON public.profile_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.add_ticket_on_profile_comment();

-- Trigger: +3 tickets al insertar una reseña (review_experiences)
CREATE OR REPLACE FUNCTION public.add_tickets_on_review_experience()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET tickets_rifa = COALESCE(tickets_rifa, 0) + 3
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS review_experiences_add_tickets ON public.review_experiences;
CREATE TRIGGER review_experiences_add_tickets
  AFTER INSERT ON public.review_experiences
  FOR EACH ROW
  EXECUTE FUNCTION public.add_tickets_on_review_experience();
