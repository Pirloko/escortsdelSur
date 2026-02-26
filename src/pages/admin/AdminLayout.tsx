import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { SeoHead } from "@/components/SeoHead";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, Users, MapPin, MessageSquare, LogOut, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/usuarios", label: "Usuarios registrados", icon: Users },
  { to: "/admin/escorts-registrados", label: "Escorts registrados", icon: UserCheck },
  { to: "/admin/comentarios", label: "Comentarios", icon: MessageSquare },
  { to: "/admin/ciudades", label: "Ciudades", icon: MapPin },
];

export default function AdminLayout() {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      <SeoHead title="Administración | Punto Cachero" description="Panel de administración." canonicalPath="/admin" robots="noindex, nofollow" noSocial />
      <aside className="w-56 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <p className="font-display font-bold text-gold">Admin</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
        <nav className="p-2 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                location.pathname === to ? "bg-gold/20 text-gold" : "text-muted-foreground hover:text-foreground hover:bg-surface"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>
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
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
