import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { UserCircle, Users, MapPin, KeyRound } from "lucide-react";

export default function AdminDashboard() {
  const { data: escortsCount } = useQuery({
    queryKey: ["escort_profiles_count"],
    queryFn: async () => {
      if (!supabase) return 0;
      const { count } = await supabase.from("escort_profiles").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
    enabled: !!supabase,
  });
  const { data: visitorsCount } = useQuery({
    queryKey: ["profiles_visitors_count"],
    queryFn: async () => {
      if (!supabase) return 0;
      const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "visitor");
      return count ?? 0;
    },
    enabled: !!supabase,
  });
  const { data: citiesCount } = useQuery({
    queryKey: ["cities_count"],
    queryFn: async () => {
      if (!supabase) return 0;
      const { count } = await supabase.from("cities").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
    enabled: !!supabase,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Dashboard</h1>
      <p className="text-muted-foreground">
        Gestiona perfiles de escort, visitantes/clientes, comentarios y ciudades.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/admin/perfiles"
          className="flex items-center gap-4 rounded-2xl border border-border bg-card p-6 hover:bg-surface transition-colors"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/20 text-gold">
            <UserCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold">Perfiles</p>
            <p className="text-2xl font-bold">{escortsCount ?? "—"}</p>
            <p className="text-xs text-muted-foreground">Perfiles escort, dar acceso, editar</p>
          </div>
        </Link>
        <Link
          to="/admin/visitantes"
          className="flex items-center gap-4 rounded-2xl border border-border bg-card p-6 hover:bg-surface transition-colors"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/20 text-gold">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold">Visitantes / Clientes</p>
            <p className="text-2xl font-bold">{visitorsCount ?? "—"}</p>
            <p className="text-xs text-muted-foreground">Bloquear, eliminar, contactar</p>
          </div>
        </Link>
        <Link
          to="/admin/ciudades"
          className="flex items-center gap-4 rounded-2xl border border-border bg-card p-6 hover:bg-surface transition-colors"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/20 text-gold">
            <MapPin className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold">Ciudades</p>
            <p className="text-2xl font-bold">{citiesCount ?? "—"}</p>
            <p className="text-xs text-muted-foreground">CRUD ciudades y contenido SEO</p>
          </div>
        </Link>
        <Link
          to="/admin/cambiar-contrasena"
          className="flex items-center gap-4 rounded-2xl border border-border bg-card p-6 hover:bg-surface transition-colors"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/20 text-gold">
            <KeyRound className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold">Cambiar contraseña</p>
            <p className="text-xs text-muted-foreground">Actualiza la contraseña de tu cuenta admin.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
