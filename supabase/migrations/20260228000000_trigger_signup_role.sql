-- =============================================================================
-- Asegurar que el trigger use signup_role (clave explícita no reservada por Auth).
-- Así el registro de escorts guarda role = 'registered_user' correctamente.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  meta_role TEXT := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'signup_role'), ''), NEW.raw_user_meta_data->>'role');
BEGIN
  INSERT INTO public.profiles (id, role, display_name, age, city_id)
  VALUES (
    NEW.id,
    CASE WHEN meta_role IN ('admin', 'registered_user', 'visitor') THEN meta_role ELSE 'visitor' END,
    NEW.raw_user_meta_data->>'display_name',
    (NEW.raw_user_meta_data->>'age')::int,
    (NEW.raw_user_meta_data->>'city_id')::uuid
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_new_user() IS 'Crea perfil al insertar en auth.users. role desde signup_role o role en raw_user_meta_data (default visitor).';
