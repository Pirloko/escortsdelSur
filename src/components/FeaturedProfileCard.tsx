import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { MapPin, User, Globe, Images, ArrowRight, TrendingUp, Phone, ChevronLeft, ChevronRight } from "lucide-react";
import { IconWhatsApp } from "@/components/IconWhatsApp";
import { WatermarkedImage } from "@/components/WatermarkedImage";
import { cn } from "@/lib/utils";
import { getWhatsAppProfileUrl } from "@/lib/whatsapp";
import { getProfileUrl } from "@/lib/seo-programmatic";
import { trackWhatsAppClick, trackPhoneClick, trackProfileClickFromList } from "@/lib/analytics";
import { useAuth } from "@/contexts/AuthContext";
import { recordWhatsAppClickForBadge } from "@/lib/recordWhatsAppClick";
function toTelUrl(raw: string | null | undefined): string | null {
  if (!raw || !raw.trim()) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 8) return null;
  const num = digits.startsWith("56") ? "+" + digits : "+56" + digits;
  return `tel:${num}`;
}

const DESCRIPTION_PREVIEW_LENGTH = 100;

export interface FeaturedProfileCardProps {
  profile: {
    id: string;
    name: string;
    age: number;
    city: string;
    badge: string;
    image: string;
    available: boolean;
    whatsapp?: string | null;
    description?: string | null;
    nationality?: string | null;
    galleryCount?: number;
    /** URLs de galería para banner rotatorio (extra foto XL) */
    gallery?: string[];
    slug?: string | null;
    /** Extras VIP: marco_premium, foto_xl, etiqueta_disponible_ahora */
    vip_extras?: string[];
  };
  /** Si se define, el clic en la imagen lleva a esta ruta (ej. página de ciudad) en lugar del perfil. */
  cardHref?: string;
  /** Slug de la ciudad para URL SEO del perfil (ej. /rancagua/camila-escort). */
  citySlug?: string;
  className?: string;
}

function getDescriptionSnippet(description: string | null | undefined): string {
  if (!description || !description.trim()) return "";
  const cleaned = description.replace(/\s+/g, " ").trim();
  if (cleaned.length <= DESCRIPTION_PREVIEW_LENGTH) return cleaned;
  return cleaned.slice(0, DESCRIPTION_PREVIEW_LENGTH).trim() + "…";
}

export function FeaturedProfileCard({ profile, cardHref, citySlug, className }: FeaturedProfileCardProps) {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const waUrl = getWhatsAppProfileUrl(profile.whatsapp, profile.id, profile.city);
  const telUrl = toTelUrl(profile.whatsapp);
  const snippet = getDescriptionSnippet(profile.description);
  const galleryCount = profile.galleryCount ?? 0;
  const profilePath = getProfileUrl(profile, citySlug);
  const clickTarget = cardHref ?? profilePath;
  const isCardClickable = !!cardHref;

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isCardClickable) trackProfileClickFromList({ profile_id: profile.id, profile_name: profile.name, city: profile.city, list_context: "vip" });
    navigate(clickTarget);
  };
  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    if (!isCardClickable) trackProfileClickFromList({ profile_id: profile.id, profile_name: profile.name, city: profile.city, list_context: "vip" });
    navigate(clickTarget);
  };

  const extras = profile.vip_extras ?? [];
  const hasMarcoPremium = extras.includes("marco_premium");
  const hasFotoXl = extras.includes("foto_xl");
  const hasEtiquetaDisponibleAhora = extras.includes("etiqueta_disponible_ahora") && profile.available;
  /** Layout amplio solo cuando tiene extra "foto XL"; si no, compacto para eliminar espacio vacío */
  const useSpaciousLayout = hasFotoXl;

  /** Hasta 3 fotos para el banner rotatorio (solo cuando extra foto XL) */
  const bannerImages =
    hasFotoXl && profile.image
      ? [profile.image, ...(Array.isArray(profile.gallery) ? profile.gallery.slice(0, 2) : [])].filter(Boolean).slice(0, 3)
      : [];
  const [bannerIndex, setBannerIndex] = useState(0);
  const bannerSwipedRef = useRef(false);
  const SWIPE_THRESHOLD = 50;

  useEffect(() => {
    if (bannerImages.length <= 1) return;
    const t = setInterval(() => setBannerIndex((i) => (i + 1) % bannerImages.length), 4000);
    return () => clearInterval(t);
  }, [bannerImages.length]);

  const goPrev = () => setBannerIndex((i) => (i - 1 + bannerImages.length) % bannerImages.length);
  const goNext = () => setBannerIndex((i) => (i + 1) % bannerImages.length);

  const handleBannerTouchStart = (e: React.TouchEvent) => {
    (e.currentTarget as HTMLElement).dataset.touchStartX = String(e.targetTouches[0].clientX);
  };
  const handleBannerTouchEnd = (e: React.TouchEvent) => {
    const startX = (e.currentTarget as HTMLElement).dataset.touchStartX;
    if (startX == null) return;
    const diff = e.changedTouches[0].clientX - Number(startX);
    if (Math.abs(diff) >= SWIPE_THRESHOLD) {
      bannerSwipedRef.current = true;
      if (diff > 0) goPrev();
      else goNext();
    }
    delete (e.currentTarget as HTMLElement).dataset.touchStartX;
  };

  return (
    <article
      className={cn(
        "group flex rounded-2xl overflow-hidden border bg-card shadow-sm hover:shadow-md transition-all duration-300",
        hasMarcoPremium ? "border-gold/60 vip-marco-premium" : "border-border hover:border-gold/30",
        isCardClickable && "cursor-pointer",
        className
      )}
      {...(isCardClickable && {
        role: "button",
        tabIndex: 0,
        onClick: handleCardClick,
        onKeyDown: handleCardKeyDown,
      })}
    >
      {/* Imagen izquierda */}
      <div
        role={isCardClickable ? undefined : "button"}
        tabIndex={isCardClickable ? undefined : 0}
        onClick={isCardClickable ? undefined : (e) => {
          if (hasFotoXl && bannerImages.length > 1 && bannerSwipedRef.current) {
            bannerSwipedRef.current = false;
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          if ((e.target as HTMLElement).closest("a")) return;
          if ((e.target as HTMLElement).closest("[data-banner-arrow]")) return;
          trackProfileClickFromList({ profile_id: profile.id, profile_name: profile.name, city: profile.city, list_context: "vip" });
          navigate(clickTarget);
        }}
        onKeyDown={isCardClickable ? undefined : (e) => {
          if (e.key === "Enter" || e.key === " ") {
            if ((e.target as HTMLElement).closest("a")) return;
            e.preventDefault();
            navigate(clickTarget);
          }
        }}
        className={cn(
          "relative aspect-[3/4] shrink-0 cursor-pointer bg-surface overflow-hidden",
          hasFotoXl ? "w-[48%] min-w-[160px] max-w-[280px]" : "w-[42%] min-w-[120px] max-w-[200px]"
        )}
      >
        {hasFotoXl && bannerImages.length > 1 ? (
          <div
            className="absolute inset-0 touch-pan-y"
            onTouchStart={handleBannerTouchStart}
            onTouchEnd={handleBannerTouchEnd}
          >
            {bannerImages.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className={cn(
                  "absolute inset-0 transition-opacity duration-700",
                  bannerIndex === i ? "opacity-100 z-0" : "opacity-0 z-0"
                )}
              >
                <WatermarkedImage
                  src={src}
                  alt={`${profile.name} - foto ${i + 1}`}
                  className="absolute inset-0"
                  imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
                  loading={i === 0 ? "lazy" : "lazy"}
                />
              </div>
            ))}
            <button
              type="button"
              data-banner-arrow
              aria-label="Foto anterior"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); goPrev(); }}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/35 hover:bg-black/55 text-white flex items-center justify-center transition-colors touch-manipulation"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              data-banner-arrow
              aria-label="Foto siguiente"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); goNext(); }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/35 hover:bg-black/55 text-white flex items-center justify-center transition-colors touch-manipulation"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <WatermarkedImage
            src={profile.image}
            alt={profile.name}
            className="absolute inset-0"
            imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        )}
        {galleryCount > 0 && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-lg bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm">
            <Images className="w-3.5 h-3.5" />
            <span>{galleryCount}</span>
          </div>
        )}
      </div>

      {/* Contenido derecho: layout más compacto cuando no hay extras VIP */}
      <div className={cn("flex flex-1 flex-col min-w-0 relative", useSpaciousLayout ? "p-4 pt-4" : "p-3 pt-3")}>
        {/* Badge VIP y opcional "Disponible ahora" (extra) */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          {hasEtiquetaDisponibleAhora && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500 border-2 border-green-600 px-2.5 py-1 text-xs font-bold text-white shadow-md dark:bg-green-500/35 dark:border-green-400 dark:text-green-50 dark:shadow-[0_0_12px_rgba(74,222,128,0.35)]">
              <span className="w-2 h-2 rounded-full bg-white dark:bg-green-300 animate-pulse shadow-sm" />
              Disponible ahora
            </span>
          )}
          <div className="flex items-center gap-1 rounded-full bg-primary/15 border border-gold/30 px-2.5 py-1 text-xs font-medium text-gold shadow-sm">
            <TrendingUp className="w-3.5 h-3.5" />
            VIP
          </div>
        </div>

        <div className={cn("flex flex-col min-h-0", useSpaciousLayout ? "flex-1 pt-8" : "pt-6")}>
          {/* Nombre del perfil: empieza debajo del badge, ancho completo */}
          <h3 className="text-sm font-bold uppercase tracking-wide text-gold leading-tight truncate mb-1">
            {profile.name}
          </h3>

          {/* Descripción corta */}
          {snippet && (
            <p className={cn("text-sm text-muted-foreground line-clamp-3 leading-snug", useSpaciousLayout ? "mt-4" : "mt-2")}>
              {snippet}
            </p>
          )}

          {/* Metadata: edad, ciudad, nacionalidad */}
          <ul className={cn("space-y-1.5 text-xs text-muted-foreground", useSpaciousLayout ? "mt-3" : "mt-2")}>
            <li className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 shrink-0 text-gold/80" />
              <span>{profile.age} años</span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-gold/80" />
              <span className="truncate">{profile.city}</span>
            </li>
            {profile.nationality && profile.nationality.trim() && (
              <li className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 shrink-0 text-gold/80" />
                <span>{profile.nationality}</span>
              </li>
            )}
          </ul>

          {/* Acciones: Ver perfil + Llamar + WhatsApp más arriba cuando no hay extras */}
          <div className={cn(useSpaciousLayout ? "mt-4 space-y-3" : "mt-3 space-y-2")}>
            <div className="flex items-center">
              {isCardClickable ? (
                <span
                  className={cn("inline-flex items-center gap-1.5 text-sm font-medium text-gold hover:text-gold/80 transition-colors items-center cursor-pointer", useSpaciousLayout ? "py-2 min-h-[44px]" : "py-1 min-h-[36px]")}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(clickTarget); }}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(clickTarget); } }}
                  role="button"
                  tabIndex={0}
                >
                  Ver perfil
                  <ArrowRight className="w-4 h-4" />
                </span>
              ) : (
                <Link
                  to={profilePath}
                  className={cn("inline-flex items-center gap-1.5 text-sm font-medium text-gold hover:text-gold/80 transition-colors items-center", useSpaciousLayout ? "py-2 min-h-[44px]" : "py-1 min-h-[36px]")}
                  onClick={() => trackProfileClickFromList({ profile_id: profile.id, profile_name: profile.name, city: profile.city, list_context: "vip" })}
                >
                  Ver perfil
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
            <div className="flex items-stretch gap-3">
              {telUrl && (
                isCardClickable ? (
                  <span
                    className={cn("flex-1 min-w-0 inline-flex items-center justify-center gap-2 rounded-xl px-4 border-2 border-gold/50 bg-muted/50 text-gold hover:bg-gold/10 hover:border-gold transition-colors cursor-pointer touch-manipulation", useSpaciousLayout ? "min-h-[48px]" : "min-h-[42px]")}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(clickTarget); }}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(clickTarget); } }}
                    role="button"
                    tabIndex={0}
                    aria-label="Llamar"
                  >
                    <Phone className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium hidden sm:inline">Llamar</span>
                  </span>
                ) : (
                  <a
                    href={telUrl}
                    className={cn("flex-1 min-w-0 inline-flex items-center justify-center gap-2 rounded-xl px-4 border-2 border-gold/50 bg-muted/50 text-gold hover:bg-gold/10 hover:border-gold transition-colors touch-manipulation", useSpaciousLayout ? "min-h-[48px]" : "min-h-[42px]")}
                    onClick={() => trackPhoneClick({ profile_id: profile.id, profile_name: profile.name, city: profile.city })}
                    aria-label="Llamar"
                  >
                    <Phone className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium hidden sm:inline">Llamar</span>
                  </a>
                )
              )}
              {waUrl && (
                isCardClickable ? (
                  <span
                    className={cn("flex-1 min-w-0 inline-flex items-center justify-center gap-2 rounded-xl px-4 bg-[#25D366] text-white hover:bg-[#20BD5A] transition-colors cursor-pointer touch-manipulation", useSpaciousLayout ? "min-h-[48px]" : "min-h-[42px]")}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(clickTarget); }}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(clickTarget); } }}
                    role="button"
                    tabIndex={0}
                    aria-label="WhatsApp"
                  >
                    <IconWhatsApp size={22} className="shrink-0" />
                    <span className="text-sm font-medium hidden sm:inline">WhatsApp</span>
                  </span>
                ) : (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn("flex-1 min-w-0 inline-flex items-center justify-center gap-2 rounded-xl px-4 bg-[#25D366] text-white hover:bg-[#20BD5A] transition-colors touch-manipulation", useSpaciousLayout ? "min-h-[48px]" : "min-h-[42px]")}
                    onClick={() => {
                      trackWhatsAppClick({ profile_id: profile.id, profile_name: profile.name, city: profile.city });
                      if (user?.id && role === "visitor") recordWhatsAppClickForBadge(user.id, profile.id);
                    }}
                    aria-label="WhatsApp"
                  >
                    <IconWhatsApp size={22} className="shrink-0" />
                    <span className="text-sm font-medium hidden sm:inline">WhatsApp</span>
                  </a>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
