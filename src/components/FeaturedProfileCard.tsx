import { useNavigate, Link } from "react-router-dom";
import { MapPin, User, Globe, Images, ArrowRight, TrendingUp, Phone } from "lucide-react";
import { IconWhatsApp } from "@/components/IconWhatsApp";
import { WatermarkedImage } from "@/components/WatermarkedImage";
import { cn } from "@/lib/utils";
import { getWhatsAppProfileUrl } from "@/lib/whatsapp";
import { getProfileUrl } from "@/lib/seo-programmatic";
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
    slug?: string | null;
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
  const waUrl = getWhatsAppProfileUrl(profile.whatsapp, profile.id, profile.city);
  const telUrl = toTelUrl(profile.whatsapp);
  const snippet = getDescriptionSnippet(profile.description);
  const galleryCount = profile.galleryCount ?? 0;
  const profilePath = getProfileUrl(profile, citySlug);
  const clickTarget = cardHref ?? profilePath;
  const isCardClickable = !!cardHref;

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(clickTarget);
  };
  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    navigate(clickTarget);
  };

  return (
    <article
      className={cn(
        "group flex rounded-2xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-md hover:border-gold/30 transition-all duration-300",
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
          if ((e.target as HTMLElement).closest("a")) return;
          navigate(clickTarget);
        }}
        onKeyDown={isCardClickable ? undefined : (e) => {
          if (e.key === "Enter" || e.key === " ") {
            if ((e.target as HTMLElement).closest("a")) return;
            e.preventDefault();
            navigate(clickTarget);
          }
        }}
        className="relative w-[42%] min-w-[120px] max-w-[200px] aspect-[3/4] shrink-0 cursor-pointer bg-surface"
      >
        <WatermarkedImage
          src={profile.image}
          alt={profile.name}
          className="absolute inset-0"
          imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {galleryCount > 0 && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-lg bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm">
            <Images className="w-3.5 h-3.5" />
            <span>{galleryCount}</span>
          </div>
        )}
      </div>

      {/* Contenido derecho */}
      <div className="flex flex-1 flex-col min-w-0 p-4 pt-4 relative">
        {/* Badge Destacada: esquina superior derecha, apartado del nombre (estilo "Top") */}
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-primary/15 border border-gold/30 px-2.5 py-1 text-xs font-medium text-gold shadow-sm">
          <TrendingUp className="w-3.5 h-3.5" />
          Destacada
        </div>

        <div className="flex-1 flex flex-col min-h-0 pt-8">
          {/* Nombre del perfil: empieza debajo del badge, ancho completo */}
          <h3 className="text-sm font-bold uppercase tracking-wide text-gold leading-tight truncate mb-1">
            {profile.name}
          </h3>

          {/* Descripción corta */}
          {snippet && (
            <p className="mt-4 text-sm text-muted-foreground line-clamp-3 leading-snug">
              {snippet}
            </p>
          )}

          {/* Metadata: edad, ciudad, nacionalidad */}
          <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
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

          {/* Acciones: Ver perfil arriba; Llamar + WhatsApp en fila ancha (móvil) */}
          <div className="mt-4 space-y-3">
            {/* Ver perfil: línea propia para no apretar con los botones */}
            <div className="flex items-center">
              {isCardClickable ? (
                <span
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-gold hover:text-gold/80 transition-colors py-2 min-h-[44px] items-center cursor-pointer"
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
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-gold hover:text-gold/80 transition-colors py-2 min-h-[44px] items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  Ver perfil
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
            {/* Llamar + WhatsApp: fila dedicada, botones del mismo tamaño y fáciles de tocar en móvil */}
            <div className="flex items-stretch gap-3">
              {telUrl && (
                isCardClickable ? (
                  <span
                    className="flex-1 min-w-0 inline-flex items-center justify-center gap-2 rounded-xl min-h-[48px] px-4 border-2 border-gold/50 bg-muted/50 text-gold hover:bg-gold/10 hover:border-gold transition-colors cursor-pointer touch-manipulation"
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
                    className="flex-1 min-w-0 inline-flex items-center justify-center gap-2 rounded-xl min-h-[48px] px-4 border-2 border-gold/50 bg-muted/50 text-gold hover:bg-gold/10 hover:border-gold transition-colors touch-manipulation"
                    onClick={(e) => e.stopPropagation()}
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
                    className="flex-1 min-w-0 inline-flex items-center justify-center gap-2 rounded-xl min-h-[48px] px-4 bg-[#25D366] text-white hover:bg-[#20BD5A] transition-colors cursor-pointer touch-manipulation"
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
                    className="flex-1 min-w-0 inline-flex items-center justify-center gap-2 rounded-xl min-h-[48px] px-4 bg-[#25D366] text-white hover:bg-[#20BD5A] transition-colors touch-manipulation"
                    onClick={(e) => e.stopPropagation()}
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
