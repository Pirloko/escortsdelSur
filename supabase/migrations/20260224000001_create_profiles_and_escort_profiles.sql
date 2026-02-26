-- =============================================================================
-- Perfiles de usuario (extiende auth.users). Un registro por usuario.
-- role: admin | registered_user | visitor
-- Visitor: display_name, avatar_url, age, city_id (perfil básico).
-- Admin y registered_user: solo role (datos extra en escort_profiles para este).
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'registered_user', 'visitor')) DEFAULT 'visitor',
  display_name TEXT,
  avatar_url TEXT,
  age INT,
  city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city_id);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
-- Ver propio perfil; admin puede ver todos
CREATE POLICY "profiles_select_own_or_admin"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
-- Solo el propio usuario puede insertar su fila (signup) o es creado por trigger
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
-- Actualizar propio perfil; admin puede actualizar cualquier perfil (para asignar rol, etc.)
CREATE POLICY "profiles_update_own_or_admin"
  ON public.profiles FOR UPDATE
  USING (
    auth.uid() = id
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Trigger: al crear usuario en auth.users, crear fila en profiles con role de metadata o 'visitor'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, display_name, age, city_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'visitor'),
    NEW.raw_user_meta_data->>'display_name',
    (NEW.raw_user_meta_data->>'age')::int,
    (NEW.raw_user_meta_data->>'city_id')::uuid
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMENT ON TABLE public.profiles IS 'Perfil por usuario: admin, registered_user (escort con acceso) o visitor.';

-- =============================================================================
-- Perfiles públicos de escort (lo que ve el visitante en el sitio).
-- Creado por admin; si user_id está asignado, ese usuario puede editarlo.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.escort_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  age INT NOT NULL,
  badge TEXT,
  image TEXT,
  available BOOLEAN NOT NULL DEFAULT true,
  gallery JSONB NOT NULL DEFAULT '[]',
  description TEXT,
  zone TEXT,
  schedule TEXT,
  whatsapp TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_escort_profiles_city ON public.escort_profiles(city_id);
CREATE INDEX IF NOT EXISTS idx_escort_profiles_user ON public.escort_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_escort_profiles_available ON public.escort_profiles(available);

ALTER TABLE public.escort_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "escort_profiles_select_public" ON public.escort_profiles;
-- Público: cualquiera puede listar perfiles (para el sitio)
CREATE POLICY "escort_profiles_select_public"
  ON public.escort_profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "escort_profiles_insert_admin" ON public.escort_profiles;
-- Solo admin puede insertar
CREATE POLICY "escort_profiles_insert_admin"
  ON public.escort_profiles FOR INSERT
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "escort_profiles_update_admin_or_owner" ON public.escort_profiles;
-- Admin puede actualizar cualquiera; registered_user solo el que tiene user_id = auth.uid()
CREATE POLICY "escort_profiles_update_admin_or_owner"
  ON public.escort_profiles FOR UPDATE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS "escort_profiles_delete_admin" ON public.escort_profiles;
-- Solo admin puede borrar
CREATE POLICY "escort_profiles_delete_admin"
  ON public.escort_profiles FOR DELETE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

COMMENT ON TABLE public.escort_profiles IS 'Perfiles de escort visibles en el marketplace. user_id = usuario que puede editarlo (creado por admin).';
