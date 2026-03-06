import { useNavigate } from "react-router-dom";
import { MapPin, Phone } from "lucide-react";
import { IconWhatsApp } from "@/components/IconWhatsApp";
import { WatermarkedImage } from "@/components/WatermarkedImage";

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
  };
}

export function ProfileCard({ profile }: ProfileProps) {
  const navigate = useNavigate();
  const waUrl = toWhatsAppUrl(profile.whatsapp);
  const telUrl = toTelUrl(profile.whatsapp);

  return (
    <div className="group block relative">
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
        className="block cursor-pointer"
      >
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-surface">
          <WatermarkedImage
            src={profile.image}
            alt={profile.name}
            className="absolute inset-0"
            imgClassName="transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 gradient-card" />

          {/* Categoría (sutil, esquina superior izquierda) */}
          {profile.badge && profile.badge !== "Perfil" && (
            <div className="absolute top-2.5 left-2.5">
              <span className="px-2 py-0.5 rounded-lg bg-white/15 backdrop-blur-sm text-[10px] font-medium text-foreground/90 border border-white/10">
                {profile.badge}
              </span>
            </div>
          )}

          {/* Disponibilidad (esquina superior derecha) */}
          {profile.available && (
            <div className="absolute top-2.5 right-2.5">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/15 backdrop-blur-sm text-[10px] font-medium text-foreground/90 border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
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
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-[#25D366] text-white hover:bg-[#20BD5A] transition-colors shadow-sm"
                    onClick={(e) => e.stopPropagation()}
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
