import { Users, MessageSquare, MapPin } from "lucide-react";

export interface SocialProofSectionProps {
  usuarios?: number | null;
  comentarios?: number | null;
  ciudades?: number | null;
}

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(".", ",") + "k";
  return String(n);
}

export function SocialProofSection({
  usuarios,
  comentarios,
  ciudades,
}: SocialProofSectionProps) {
  const items = [
    { icon: Users, value: usuarios != null ? formatNumber(usuarios) + "+" : "—", label: "usuarios" },
    { icon: MessageSquare, value: comentarios != null ? formatNumber(comentarios) + "+" : "—", label: "comentarios" },
    { icon: MapPin, value: ciudades != null ? String(ciudades) : "—", label: "ciudades" },
  ];

  return (
    <section className="px-4 py-4 max-w-4xl mx-auto" aria-labelledby="social-proof-heading">
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-center">
        <span id="social-proof-heading" className="text-xs font-medium text-muted-foreground w-full sm:w-auto">
          La comunidad <span className="text-copper">crece</span>
        </span>
        {items.map((item) => (
          <span key={item.label} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <item.icon className="w-3.5 h-3.5 text-copper" aria-hidden />
            <strong className="text-foreground tabular-nums">{item.value}</strong> {item.label}
          </span>
        ))}
      </div>
    </section>
  );
}
