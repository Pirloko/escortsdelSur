/**
 * Supabase Storage Image Transformations (CDN).
 * Convierte URLs de object/public a render/image con width, quality, etc.
 * Ver: https://supabase.com/docs/guides/storage/serving/image-transformations
 */

const OBJECT_PREFIX = "/storage/v1/object/public/";
const RENDER_PREFIX = "/storage/v1/render/image/public/";

export type SupabaseImageVariant = "thumbnail" | "profile" | "full";

const VARIANT_PARAMS: Record<SupabaseImageVariant, { width: number; quality: number }> = {
  thumbnail: { width: 300, quality: 70 },
  profile: { width: 600, quality: 75 },
  full: { width: 1200, quality: 80 },
};

/** Indica si la URL es de Supabase Storage (object/public). */
export function isSupabaseStorageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  return url.includes(".supabase.co") && url.includes(OBJECT_PREFIX);
}

/**
 * Convierte una URL de Supabase Storage (object/public) a la URL de transformación (render/image).
 * Si no es URL de Supabase, devuelve la misma URL sin modificar.
 */
export function getSupabaseImageTransformUrl(
  url: string,
  options: { width?: number; quality?: number; variant?: SupabaseImageVariant } = {}
): string {
  if (!isSupabaseStorageUrl(url)) return url;
  const { width, quality, variant } = options;
  const params = variant ? VARIANT_PARAMS[variant] : { width: width ?? 600, quality: quality ?? 75 };
  const w = width ?? params.width;
  const q = quality ?? params.quality;
  const base = url.replace(OBJECT_PREFIX, RENDER_PREFIX);
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}width=${w}&quality=${q}`;
}

/**
 * Genera srcSet para responsive (300w, 600w, 1200w).
 * Solo aplica a URLs de Supabase Storage.
 */
export function getSupabaseImageSrcSet(
  url: string,
  options: { quality?: number } = {}
): string | null {
  if (!isSupabaseStorageUrl(url)) return null;
  const widths = [300, 600, 1200] as const;
  const quality = options.quality ?? 75;
  const base = url.replace(OBJECT_PREFIX, RENDER_PREFIX);
  const separator = base.includes("?") ? "&" : "?";
  return widths.map((w) => `${base}${separator}width=${w}&quality=${quality} ${w}w`).join(", ");
}

/** Parámetros por variante para uso en WatermarkedImage. */
export { VARIANT_PARAMS };
