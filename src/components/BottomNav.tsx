import { Home, Search, MapPin, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { CITY_SLUGS } from "@/lib/seo";
import { ACTIVE_CITY_SLUG } from "@/lib/site-config";
import { useAuth } from "@/contexts/AuthContext";

const navItems = (profilePath: string) => [
  { icon: Home, label: "Inicio", path: "/" },
  { icon: Search, label: "Buscar", path: "/" },
  { icon: MapPin, label: "Ciudades", path: `/${ACTIVE_CITY_SLUG}` },
  { icon: User, label: "Perfil", path: profilePath },
];

export function BottomNav() {
  const { pathname } = useLocation();
  const { role } = useAuth();
  const profilePath = role === "registered_user" ? "/cuenta" : "/mi-perfil";
  const items = navItems(profilePath);
  const citySlug = pathname.startsWith("/") ? pathname.slice(1).split("/")[0] : "";
  const isCityPage = citySlug.length > 0 && (CITY_SLUGS as readonly string[]).includes(citySlug);
  const hideNav = pathname.startsWith("/admin") || pathname === "/login" || pathname === "/registro";
  if (hideNav) return null;
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass border-t border-white/5 px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16">
          {items.map(({ icon: Icon, label, path }) => {
            const active = pathname === path || (label === "Ciudades" && isCityPage);
            return (
              <Link
                key={label}
                to={path}
                className="flex flex-col items-center gap-1 py-2 px-3 transition-colors"
              >
                <Icon className={`w-5 h-5 transition-colors ${active ? "text-gold" : "text-muted-foreground"}`} />
                <span className={`text-[10px] transition-colors ${active ? "text-gold font-medium" : "text-muted-foreground"}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
