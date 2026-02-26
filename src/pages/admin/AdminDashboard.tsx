import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Users, MapPin } from "lucide-react";

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
        Gestiona usuarios registrados (perfiles de escort) y ciudades. Solo tú puedes crear cuentas para los usuarios registrados.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <Link
          to="/admin/usuarios"
          className="flex items-center gap-4 rounded-2xl border border-border bg-card p-6 hover:bg-surface transition-colors"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/20 text-gold">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold">Usuarios registrados</p>
            <p className="text-2xl font-bold">{escortsCount ?? "—"}</p>
            <p className="text-xs text-muted-foreground">CRUD perfiles y dar acceso de login</p>
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
      </div>
    </div>
  );
}
