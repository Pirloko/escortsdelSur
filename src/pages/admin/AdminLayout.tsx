import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { SeoHead } from "@/components/SeoHead";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, UserCircle, MapPin, MessageSquare, LogOut, Users, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/publicadores", label: "Usuarios publicador", icon: Users },
  { to: "/admin/perfiles", label: "Perfiles", icon: UserCircle },
  { to: "/admin/visitantes", label: "Visitantes / Clientes", icon: Users },
  { to: "/admin/comentarios", label: "Comentarios", icon: MessageSquare },
  { to: "/admin/ciudades", label: "Ciudades", icon: MapPin },
];

function NavLinks({
  location,
  onNavClick,
}: {
  location: ReturnType<typeof useLocation>;
  onNavClick?: () => void;
}) {
  return (
    <nav className="p-2 space-y-1">
      {nav.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavClick}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
            location.pathname === to ? "bg-gold/20 text-gold" : "text-muted-foreground hover:text-foreground hover:bg-surface"
          }`}
        >
          <Icon className="w-4 h-4 flex-shrink-0" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export default function AdminLayout() {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  const closeSheet = () => setSheetOpen(false);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <SeoHead title="Administración | Punto Cachero" description="Panel de administración." canonicalPath="/admin" robots="noindex, nofollow" noSocial />

      {/* Mobile: header con menú hamburguesa */}
      <header className="md:hidden flex items-center justify-between gap-4 px-4 py-3 border-b border-border bg-background sticky top-0 z-30">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0" aria-label="Abrir menú">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 flex flex-col">
            <div className="p-4 border-b border-border">
              <p className="font-display font-bold text-gold">Admin</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <NavLinks location={location} onNavClick={closeSheet} />
            <div className="mt-auto p-2 border-t border-border">
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </Button>
              <Link to="/" onClick={closeSheet} className="block mt-2 text-center text-xs text-muted-foreground hover:text-foreground">
                Ver sitio
              </Link>
            </div>
          </SheetContent>
        </Sheet>
        <span className="font-display font-bold text-gold truncate">Admin</span>
        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground shrink-0">
          Ver sitio
        </Link>
      </header>

      {/* Desktop: sidebar fijo */}
      <aside className="hidden md:flex w-56 flex-col border-r border-border flex-shrink-0">
        <div className="p-4 border-b border-border">
          <p className="font-display font-bold text-gold">Admin</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
        <NavLinks location={location} />
        <div className="mt-auto p-2">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={handleSignOut}>
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </Button>
          <Link to="/" className="block mt-2 text-center text-xs text-muted-foreground hover:text-foreground">
            Ver sitio
          </Link>
        </div>
      </aside>

      {/* Contenido principal: ancho completo en móvil, tablas con scroll horizontal */}
      <main className="flex-1 overflow-auto p-4 md:p-6 min-w-0">
        <div className="min-w-0 w-full overflow-x-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
