import { Home, Gamepad2, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRaffleHighlight } from "@/hooks/useRaffleHighlight";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = (profilePath: string) => [
  { icon: Home, label: "Inicio", path: "/" },
  { icon: Gamepad2, label: "Jugar ahora", path: "/desafio-del-dia" },
  { icon: User, label: "Perfil", path: profilePath },
];

export function BottomNav() {
  const { pathname } = useLocation();
  const { role, user } = useAuth();
  const { userTickets } = useRaffleHighlight();
  const profilePath = role === "registered_user" ? "/cuenta" : "/mi-perfil";
  const items = navItems(profilePath);
  const hideNav = pathname.startsWith("/admin") || pathname === "/login" || pathname === "/registro";
  if (hideNav) return null;

  const showRaffleCount = !!user && userTickets !== null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass border-t border-white/5 px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16">
          {/* Rifa: siempre visible; con número solo si está logueado */}
          {showRaffleCount ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/rifa"
                  className="flex flex-col items-center gap-1 py-2 px-3 transition-colors text-copper hover:text-copper/80"
                  aria-label={`Tienes ${userTickets} tickets para la rifa`}
                >
                  <span className="text-lg leading-none" aria-hidden>🎟</span>
                  <span className="text-[10px] font-medium tabular-nums">{userTickets}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="top">
                Tienes {userTickets} tickets para la rifa.
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              to="/rifa"
              className="flex flex-col items-center gap-1 py-2 px-3 transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Ver rifa"
            >
              <span className="text-lg leading-none" aria-hidden>🎟</span>
              <span className="text-[10px]">Rifa</span>
            </Link>
          )}
          {items.map(({ icon: Icon, label, path }) => {
            const active = pathname === path;
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
