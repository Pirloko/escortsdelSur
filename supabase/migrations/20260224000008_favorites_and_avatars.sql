-- =============================================================================
-- Favoritos: relación usuario (visitante) -> perfil escort
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  escort_profile_id UUID NOT NULL REFERENCES public.escort_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, escort_profile_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "favorites_select_own"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "favorites_insert_own"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "favorites_delete_own"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.favorites IS 'Favoritos de usuarios visitantes/clientes.';

-- =============================================================================
-- Bucket avatares para foto de perfil de clientes (1 foto por usuario)
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "avatars_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_own_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars_own_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars_own_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
