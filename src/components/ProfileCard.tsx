import { useNavigate } from "react-router-dom";
import { MapPin, Phone } from "lucide-react";
import { IconWhatsApp } from "@/components/IconWhatsApp";
import { WatermarkedImage } from "@/components/WatermarkedImage";
import { getWhatsAppProfileUrl } from "@/lib/whatsapp";
import { getProfileUrl } from "@/lib/seo-programmatic";
import { trackWhatsAppClick, trackPhoneClick, trackProfileClickFromList } from "@/lib/analytics";
function toTelUrl(raw: string | null | undefined): string | null {
  if (!raw || !raw.trim()) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 8) return null;
  const num = digits.startsWith("56") ? "+" + digits : "+56" + digits;
  return `tel:${num}`;
}

interface ProfileProps {
  profile: {
    id: string;
    name: string;
    age: number;
    city: string;
    badge: string;
    image: string;
    available: boolean;
    whatsapp?: string | null;
    slug?: string | null;
  };
  citySlug?: string | null;
}

export function ProfileCard({ profile, citySlug }: ProfileProps) {
  const navigate = useNavigate();
  const profilePath = getProfileUrl(profile, citySlug);
  const waUrl = getWhatsAppProfileUrl(profile.whatsapp, profile.id, profile.city);
  const telUrl = toTelUrl(profile.whatsapp);

  return (
    <div className="group block relative">
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) return;
          trackProfileClickFromList({ profile_id: profile.id, profile_name: profile.name, city: profile.city, list_context: "grid" });
          navigate(profilePath);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            if ((e.target as HTMLElement).closest("a")) return;
            e.preventDefault();
            navigate(profilePath);
          }
        }}
        className="block cursor-pointer"
      >
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-surface">
          <WatermarkedImage
            variant="thumbnail"
            src={profile.image}
            alt={profile.name}
            className="absolute inset-0"
            imgClassName="transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 gradient-card" />

          {/* Categoría: fondo sólido para buena lectura en modo claro y oscuro */}
          {profile.badge && profile.badge !== "Perfil" && (
            <div className="absolute top-2.5 left-2.5">
              <span className="px-2.5 py-1 rounded-lg bg-black/80 text-white text-[10px] font-semibold shadow-md border border-white/20">
                {profile.badge}
              </span>
            </div>
          )}

          {/* Disponibilidad: mismo estilo para contraste sobre cualquier foto */}
          {profile.available && (
            <div className="absolute top-2.5 right-2.5">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/80 text-white text-[10px] font-semibold shadow-md border border-white/20">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-sm" />
                Online
              </span>
            </div>
          )}

          {/* Zona inferior: gradiente + info + botones */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/60 to-transparent pt-8 pb-3 px-3 rounded-b-2xl">
            <div className="flex items-center justify-between gap-2 min-h-[2rem]">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-foreground truncate">
                  {profile.name}, {profile.age}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{profile.city}</span>
                </p>
              </div>
            </div>
            {(waUrl || telUrl) && (
              <div className="flex gap-2 mt-2.5">
                {telUrl && (
                  <a
                    href={telUrl}
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-white/25 backdrop-blur-sm text-foreground hover:bg-white/35 transition-colors border border-white/20"
                    onClick={() => trackPhoneClick({ profile_id: profile.id, profile_name: profile.name, city: profile.city })}
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
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-[#25D366] text-white hover:bg-[#20BD5A] transition-colors shadow-sm"
                    onClick={() => trackWhatsAppClick({ profile_id: profile.id, profile_name: profile.name, city: profile.city })}
                    aria-label="WhatsApp"
                  >
                    <IconWhatsApp size={18} className="text-white" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Hover glow */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ring-1 ring-inset ring-gold/20 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
