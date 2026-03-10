import { useState } from "react";
import { cn } from "@/lib/utils";

const WATERMARK_SRC = "/marcadeagua.png";

/** Variante de tamaño: thumbnail 300px, profile 600px, full 1200px */
export type WatermarkedImageVariant = "profile" | "thumbnail" | "full";

export interface WatermarkedImageProps {
  src: string;
  alt: string;
  /** URL de la misma imagen en WebP (opcional). Si no se pasa, se intenta derivar de src (.jpg/.png → .webp). */
  webpSrc?: string | null;
  /** Clase del contenedor (relative) que envuelve imagen + overlay */
  className?: string;
  /** Clase de la imagen de perfil */
  imgClassName?: string;
  /** lazy por defecto; usar priority=true para la primera imagen above the fold (LCP) */
  loading?: "lazy" | "eager";
  /** Si true: loading=eager y fetchPriority=high (para hero / primera imagen visible) */
  priority?: boolean;
  /** thumbnail 300px, profile 600px, full 1200px — define sizes y opcionalmente srcSet */
  variant?: WatermarkedImageVariant;
  /** Placeholder borroso (URL o data URL de miniatura ~20px). Muestra blur primero y transición al cargar. */
  placeholder?: string;
  /** srcSet para responsive (ej. "url?w=300 300w, url?w=600 600w"). Si no se pasa, se usa solo src. */
  srcSet?: string;
  width?: number;
  height?: number;
}

const SIZES_MAP: Record<WatermarkedImageVariant, string> = {
  thumbnail: "300px",
  profile: "(max-width: 640px) 100vw, 600px",
  full: "(max-width: 1200px) 100vw, 1200px",
};

/** Intenta derivar URL WebP a partir de src (misma ruta con extensión .webp). */
function getWebpFallbackSrc(src: string): string | null {
  if (!src || typeof src !== "string") return null;
  const replaced = src.replace(/\.(jpe?g|png)(\?.*)?$/i, ".webp$2");
  return replaced !== src ? replaced : null;
}

/**
 * Imagen de perfil con marca de agua. Soporta WebP, placeholder blur y tamaños por variante.
 * Usar priority=true en la primera imagen visible (LCP).
 */
export function WatermarkedImage({
  src,
  alt,
  webpSrc: webpSrcProp,
  className,
  imgClassName,
  loading: loadingProp,
  priority = false,
  variant = "profile",
  placeholder,
  srcSet,
  width,
  height,
}: WatermarkedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const loading = priority ? "eager" : (loadingProp ?? "lazy");
  const fetchPriority = priority ? ("high" as const) : undefined;
  const sizes = SIZES_MAP[variant];
  const webpSrc = webpSrcProp ?? getWebpFallbackSrc(src);
  const usePicture = Boolean(webpSrc);

  const imgCommonProps = {
    alt,
    className: cn(
      "w-full h-full object-cover",
      placeholder && !loaded && "opacity-0",
      placeholder && loaded && "opacity-100 transition-opacity duration-300",
      imgClassName
    ),
    loading,
    decoding: "async" as const,
    fetchPriority,
    sizes: srcSet ? sizes : undefined,
    ...(width != null && { width }),
    ...(height != null && { height }),
    onLoad: placeholder ? () => setLoaded(true) : undefined,
  };

  const imageContent = usePicture ? (
    <picture>
      <source srcSet={webpSrc!} type="image/webp" sizes={sizes} />
      <img src={src} {...imgCommonProps} />
    </picture>
  ) : (
    <img
      src={src}
      srcSet={srcSet || undefined}
      {...imgCommonProps}
    />
  );

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={placeholder ? { background: `url(${placeholder}) center/cover` } : undefined}
    >
      {imageContent}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        aria-hidden
      >
        <img
          src={WATERMARK_SRC}
          alt=""
          loading="lazy"
          decoding="async"
          className="max-w-[50%] max-h-[50%] w-auto h-auto opacity-60 object-contain blur-[1.5px]"
        />
      </div>
    </div>
  );
}

/** Genera srcSet con anchos 300, 600, 1200 para CDN que soporte parámetro width (ej. ?width=300). */
export function buildSrcSetWithWidth(baseUrl: string, paramName = "width"): string {
  const separator = baseUrl.includes("?") ? "&" : "?";
  return [300, 600, 1200].map((w) => `${baseUrl}${separator}${paramName}=${w} ${w}w`).join(", ");
}
