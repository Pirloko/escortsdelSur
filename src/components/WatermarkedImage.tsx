import { cn } from "@/lib/utils";

const WATERMARK_SRC = "/marcadeagua.png";

export interface WatermarkedImageProps {
  src: string;
  alt: string;
  /** Clase del contenedor (relative) que envuelve imagen + overlay */
  className?: string;
  /** Clase de la imagen de perfil */
  imgClassName?: string;
  loading?: "lazy" | "eager";
}

/**
 * Muestra una imagen de perfil con la marca de agua HolaCachero.cl superpuesta (solo visual).
 * Usar en todas las fotos de perfiles para consistencia de marca.
 */
export function WatermarkedImage({
  src,
  alt,
  className,
  imgClassName,
  loading = "lazy",
}: WatermarkedImageProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        src={src}
        alt={alt}
        className={cn("w-full h-full object-cover", imgClassName)}
        loading={loading}
      />
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        aria-hidden
      >
        <img
          src={WATERMARK_SRC}
          alt=""
          className="max-w-[50%] max-h-[50%] w-auto h-auto opacity-70 object-contain"
        />
      </div>
    </div>
  );
}
