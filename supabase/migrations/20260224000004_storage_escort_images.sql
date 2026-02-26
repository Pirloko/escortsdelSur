-- =============================================================================
-- Bucket de Storage para imágenes de perfiles (escort). Público para lectura.
-- Usuarios autenticados (registered_user) suben a su carpeta: escort-images/{user_id}/
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'escort-images',
  'escort-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Lectura pública (bucket público; por si acaso)
CREATE POLICY "escort_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'escort-images');

-- Solo usuarios autenticados pueden subir; solo en su carpeta {user_id}/
CREATE POLICY "escort_images_authenticated_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'escort-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Solo el dueño puede actualizar/sobrescribir sus archivos
CREATE POLICY "escort_images_owner_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'escort-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Solo el dueño puede borrar sus archivos
CREATE POLICY "escort_images_owner_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'escort-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
