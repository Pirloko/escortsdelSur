import { useNavigate, Link } from "react-router-dom";
import { MapPin, User, Globe, Images, ArrowRight, TrendingUp, Phone } from "lucide-react";
import { IconWhatsApp } from "@/components/IconWhatsApp";
import { WatermarkedImage } from "@/components/WatermarkedImage";
import { cn } from "@/lib/utils";

function toWhatsAppUrl(raw: string | null | undefined): string | null {
  if (!raw || !raw.trim()) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 8) return null;
  const num = digits.startsWith("56") ? digits : "56" + digits;
  return `https://wa.me/${num}`;
}
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
  };
  className?: string;
}

function getDescriptionSnippet(description: string | null | undefined): string {
  if (!description || !description.trim()) return "";
  const cleaned = description.replace(/\s+/g, " ").trim();
  if (cleaned.length <= DESCRIPTION_PREVIEW_LENGTH) return cleaned;
  return cleaned.slice(0, DESCRIPTION_PREVIEW_LENGTH).trim() + "…";
}

export function FeaturedProfileCard({ profile, className }: FeaturedProfileCardProps) {
  const navigate = useNavigate();
  const waUrl = toWhatsAppUrl(profile.whatsapp);
  const telUrl = toTelUrl(profile.whatsapp);
  const snippet = getDescriptionSnippet(profile.description);
  const galleryCount = profile.galleryCount ?? 0;

  return (
    <article
      className={cn(
        "group flex rounded-2xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-md hover:border-gold/30 transition-all duration-300",
        className
      )}
    >
      {/* Imagen izquierda */}
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) return;
          navigate(`/perfil/${profile.id}`);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            if ((e.target as HTMLElement).closest("a")) return;
            e.preventDefault();
            navigate(`/perfil/${profile.id}`);
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
      <div className="flex flex-1 flex-col min-w-0 p-4">
        <div className="relative flex-1 flex flex-col">
          {/* Badge Destacada */}
          <div className="absolute top-0 right-0 flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-gold">
            <TrendingUp className="w-3.5 h-3.5" />
            Destacada
          </div>

          {/* Nombre del perfil */}
          <h3 className="text-sm font-bold uppercase tracking-wide text-gold pr-16 leading-tight truncate mb-1">
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

          {/* Acciones: Ver perfil + Llamar + WhatsApp */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              to={`/perfil/${profile.id}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gold hover:text-gold/80 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              Ver perfil
              <ArrowRight className="w-4 h-4" />
            </Link>
            {telUrl && (
              <a
                href={telUrl}
                className="inline-flex items-center justify-center rounded-full border border-border bg-muted/50 p-2 text-foreground hover:bg-muted transition-colors"
                onClick={(e) => e.stopPropagation()}
                aria-label="Llamar"
              >
                <Phone className="w-4 h-4" />
              </a>
            )}
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[#25D366] p-2 text-white hover:bg-[#20BD5A] transition-colors"
                onClick={(e) => e.stopPropagation()}
                aria-label="WhatsApp"
              >
                <IconWhatsApp size={18} className="text-white" />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
