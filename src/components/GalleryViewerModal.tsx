/**
 * Visor de galería tipo historias: pantalla completa, sin superposiciones.
 * Navegación con flechas, gestos táctiles, botón cerrar y acciones: Llamada, WhatsApp, Visitar perfil.
 */
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { X, ChevronLeft, ChevronRight, Phone, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { WatermarkedImage } from "@/components/WatermarkedImage";
import { IconWhatsApp } from "@/components/IconWhatsApp";
import { trackWhatsAppClick, trackPhoneClick } from "@/lib/analytics";

export interface GalleryViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileName: string;
  photos: string[];
  /** Ruta del perfil (ej. /rancagua/camila-escort). Si no se pasa, no se muestra "Visitar perfil". */
  profileHref?: string | null;
  /** URL tel: para el botón Llamada. Si no se pasa, no se muestra. */
  telUrl?: string | null;
  /** URL de WhatsApp. Si no se pasa, no se muestra. */
  whatsappUrl?: string | null;
  /** Para eventos GA4 (opcional). */
  profileId?: string | null;
  city?: string | null;
}

const SWIPE_THRESHOLD = 50;

export function GalleryViewerModal({
  open,
  onOpenChange,
  profileName,
  photos,
  profileHref,
  telUrl,
  whatsappUrl,
  profileId,
  city,
}: GalleryViewerModalProps) {
  const [index, setIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    if (open) setIndex(0);
  }, [open]);

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);
  const goNext = useCallback(() => {
    setIndex((i) => Math.min(photos.length - 1, i + 1));
  }, [photos.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(diff) >= SWIPE_THRESHOLD) {
      if (diff > 0) goPrev();
      else goNext();
    }
    setTouchStart(null);
  };

  if (photos.length === 0) return null;

  const currentPhoto = photos[index];
  const hasPrev = index > 0;
  const hasNext = index < photos.length - 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="fixed left-0 top-0 right-0 bottom-0 z-50 w-full h-full max-w-none rounded-none border-0 bg-black p-0 flex flex-col translate-x-0 translate-y-0 shadow-none [&>button:last-child]:hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={() => onOpenChange(false)}
        style={{ minHeight: "100dvh" }}
      >
        <DialogTitle className="sr-only">
          Galería de {profileName} – foto {index + 1} de {photos.length}
        </DialogTitle>

        {/* Barra superior: nombre + cerrar — respeta safe area */}
        <header
          className="flex items-center justify-between shrink-0 px-4 py-3 border-b border-white/10 bg-black"
          style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
        >
          <span className="text-white font-semibold truncate flex-1 min-w-0 mr-2">
            {profileName}
          </span>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="p-2.5 rounded-full text-white/90 hover:bg-white/15 active:bg-white/20 transition-colors touch-manipulation shrink-0"
            aria-label="Cerrar galería"
          >
            <X className="w-6 h-6" />
          </button>
        </header>

        {/* Área de imagen: flex-1 sin desbordar, gestos táctiles */}
        <div
          className="relative flex-1 min-h-0 flex items-center justify-center overflow-hidden bg-black"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="absolute inset-0 flex items-center justify-center p-2">
            <WatermarkedImage
              src={currentPhoto}
              alt={`${profileName} – foto ${index + 1}`}
              className="w-full h-full max-w-full max-h-full"
              imgClassName="w-full h-full object-contain"
              loading="eager"
            />
          </div>

          {/* Zonas táctiles grandes para anterior/siguiente (solo en móvil útiles) */}
          {hasPrev && (
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-0 top-0 bottom-0 w-20 sm:w-24 flex items-center justify-start pl-2 z-10 sm:left-2 sm:w-12 sm:rounded-full sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 sm:bg-black/50 sm:justify-center sm:pl-0 text-white hover:bg-white/5 sm:hover:bg-black/70 transition-colors touch-manipulation"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="w-8 h-8 sm:w-7 sm:h-7" />
            </button>
          )}
          {hasNext && (
            <button
              type="button"
              onClick={goNext}
              className="absolute right-0 top-0 bottom-0 w-20 sm:w-24 flex items-center justify-end pr-2 z-10 sm:right-2 sm:w-12 sm:rounded-full sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 sm:bg-black/50 sm:justify-center sm:pr-0 text-white hover:bg-white/5 sm:hover:bg-black/70 transition-colors touch-manipulation"
              aria-label="Foto siguiente"
            >
              <ChevronRight className="w-8 h-8 sm:w-7 sm:h-7" />
            </button>
          )}
        </div>

        {/* Botones de acción: Llamada, WhatsApp, Visitar perfil */}
        {(profileHref || telUrl || whatsappUrl) && (
          <div className="flex flex-wrap items-stretch justify-center gap-3 px-4 py-3 shrink-0 bg-black border-t border-white/10">
            {telUrl && (
              <a
                href={telUrl}
                className="inline-flex items-center justify-center gap-2 rounded-xl min-h-[48px] px-5 border-2 border-gold/50 bg-white/5 text-gold hover:bg-gold/15 hover:border-gold transition-colors touch-manipulation font-medium text-sm"
                onClick={() => {
                  if (profileId && city) trackPhoneClick({ profile_id: profileId, profile_name: profileName, city });
                }}
                aria-label="Llamar"
              >
                <Phone className="w-5 h-5 shrink-0" />
                Llamada
              </a>
            )}
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl min-h-[48px] px-5 bg-[#25D366] text-white hover:bg-[#20BD5A] transition-colors touch-manipulation font-medium text-sm"
                onClick={() => {
                  if (profileId && city) trackWhatsAppClick({ profile_id: profileId, profile_name: profileName, city });
                }}
                aria-label="WhatsApp"
              >
                <IconWhatsApp size={22} className="shrink-0" />
                WhatsApp
              </a>
            )}
            {profileHref && (
              <Link
                to={profileHref}
                onClick={() => onOpenChange(false)}
                className="inline-flex items-center justify-center gap-2 rounded-xl min-h-[48px] px-5 bg-gold text-black hover:bg-gold/90 transition-colors touch-manipulation font-semibold text-sm"
              >
                Visitar perfil
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            )}
          </div>
        )}

        {/* Indicador de posición — respeta safe area inferior */}
        <div
          className="flex justify-center gap-2 py-3 shrink-0 bg-black"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          {photos.map((_, i) => (
            <span
              key={i}
              className={`block h-1 rounded-full transition-all duration-200 ${
                i === index ? "w-6 bg-white" : "w-1.5 bg-white/40"
              }`}
              aria-hidden
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
