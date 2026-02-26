import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, CalendarPlus, Pause, UserPlus, ExternalLink, MapPin, Search } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AdminEscortForm } from "./AdminEscortForm";
import { DarAccesoDialog } from "./DarAccesoDialog";
import type { EscortProfilesRow } from "@/types/database";

type EscortRow = EscortProfilesRow & { cities: { slug: string; name: string } | null };

export default function AdminUsuarios() {
  const [editing, setEditing] = useState<EscortProfilesRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<EscortProfilesRow | null>(null);
  const [darAcceso, setDarAcceso] = useState<EscortRow | null>(null);
  const [filterNombre, setFilterNombre] = useState("");
  const [filterCiudad, setFilterCiudad] = useState<string>("all");
  const [filterCelular, setFilterCelular] = useState("");
  const [filterCategoria, setFilterCategoria] = useState<string>("all");
  const queryClient = useQueryClient();

  const { data: escorts, isLoading } = useQuery({
    queryKey: ["escort_profiles"],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from("escort_profiles")
        .select("*, cities(slug, name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as EscortRow[];
    },
    enabled: !!supabase,
  });

  const { citiesOpts, categoriasOpts } = useMemo(() => {
    const list = escorts ?? [];
    const cities = [...new Set(list.map((e) => e.cities?.name).filter(Boolean))] as string[];
    cities.sort((a, b) => a.localeCompare(b));
    const badges = [...new Set(list.map((e) => e.badge).filter(Boolean))] as string[];
    badges.sort((a, b) => (a ?? "").localeCompare(b ?? ""));
    return { citiesOpts: cities, categoriasOpts: badges };
  }, [escorts]);

  const filteredEscorts = useMemo(() => {
    const list = escorts ?? [];
    return list.filter((e) => {
      if (filterNombre.trim()) {
        const q = filterNombre.trim().toLowerCase();
        if (!e.name.toLowerCase().includes(q)) return false;
      }
      if (filterCiudad !== "all") {
        if (e.cities?.name !== filterCiudad) return false;
      }
      if (filterCelular.trim()) {
        const digits = filterCelular.replace(/\D/g, "");
        const whatsapp = (e.whatsapp ?? "").replace(/\D/g, "");
        if (!whatsapp.includes(digits) && !(e.whatsapp ?? "").toLowerCase().includes(filterCelular.trim().toLowerCase()))
          return false;
      }
      if (filterCategoria !== "all") {
        if ((e.badge ?? "") !== filterCategoria) return false;
      }
      return true;
    });
  }, [escorts, filterNombre, filterCiudad, filterCelular, filterCategoria]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error("Sin Supabase");
      const { error } = await supabase.from("escort_profiles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escort_profiles"] });
      setDeleting(null);
    },
  });

  const add7DaysMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error("Sin Supabase");
      const newActiveUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const payload = { active_until: newActiveUntil, available: true, updated_at: new Date().toISOString() };
      // @ts-expect-error - generated Supabase types may not include active_until
      const { error } = await supabase.from("escort_profiles").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escort_profiles"] });
    },
  });

  const pauseMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error("Sin Supabase");
      const nowIso = new Date().toISOString();
      const payload = { active_until: nowIso, available: false, updated_at: nowIso };
      // @ts-expect-error - generated Supabase types may not include active_until
      const { error } = await supabase.from("escort_profiles").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escort_profiles"] });
    },
  });

  if (!supabase) {
    return (
      <div>
        <h1 className="text-2xl font-display font-bold mb-4">Usuarios registrados</h1>
        <p className="text-muted-foreground">Configura Supabase para gestionar perfiles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-display font-bold">Perfiles</h1>
        <Button className="bg-gold text-primary-foreground hover:bg-gold/90 shrink-0 w-full sm:w-auto" onClick={() => setCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo perfil
        </Button>
      </div>
      <p className="text-muted-foreground text-sm">
        Crea perfiles públicos (escorts). Luego puedes dar acceso de login a cada uno desde &quot;Dar acceso&quot; (requiere Edge Function de Supabase).
      </p>

      <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Search className="w-4 h-4" />
          Filtros
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="filter-nombre" className="text-xs text-muted-foreground">Nombre</Label>
            <Input
              id="filter-nombre"
              placeholder="Buscar por nombre..."
              value={filterNombre}
              onChange={(e) => setFilterNombre(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-ciudad" className="text-xs text-muted-foreground">Ciudad</Label>
            <Select value={filterCiudad} onValueChange={setFilterCiudad}>
              <SelectTrigger id="filter-ciudad" className="h-9">
                <SelectValue placeholder="Todas las ciudades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las ciudades</SelectItem>
                {citiesOpts.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-celular" className="text-xs text-muted-foreground">Celular / WhatsApp</Label>
            <Input
              id="filter-celular"
              placeholder="Número o parte..."
              value={filterCelular}
              onChange={(e) => setFilterCelular(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-categoria" className="text-xs text-muted-foreground">Categoría</Label>
            <Select value={filterCategoria} onValueChange={setFilterCategoria}>
              <SelectTrigger id="filter-categoria" className="h-9">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categoriasOpts.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {(filterNombre || filterCiudad !== "all" || filterCelular || filterCategoria !== "all") && (
          <p className="text-xs text-muted-foreground">
            Mostrando {filteredEscorts.length} de {(escorts ?? []).length} perfiles
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl border border-border overflow-hidden bg-card aspect-[3/4] animate-pulse" />
          ))}
        </div>
      ) : (escorts ?? []).length === 0 ? (
        <p className="text-muted-foreground text-center py-12 rounded-2xl border border-border bg-card">Aún no hay perfiles. Crea uno con &quot;Nuevo perfil&quot;.</p>
      ) : filteredEscorts.length === 0 ? (
        <p className="text-muted-foreground text-center py-12 rounded-2xl border border-border bg-card">
          Ningún perfil coincide con los filtros. Prueba a cambiar nombre, ciudad, celular o categoría.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredEscorts.map((e) => {
            const cityName = e.cities?.name ?? "—";
            const isHidden = e.active_until != null && new Date(e.active_until) < new Date();
            const canPause = e.active_until == null || new Date(e.active_until) >= new Date();
            return (
              <article
                key={e.id}
                className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col"
              >
                {/* Imagen tipo perfil */}
                <div className="relative aspect-[3/4] bg-surface">
                  <img
                    src={e.image ?? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80"}
                    alt={e.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute top-2 left-2 right-2 flex flex-wrap gap-1.5">
                    {e.badge && e.badge !== "Perfil" && (
                      <span className="px-2 py-0.5 rounded-lg bg-white/20 text-xs font-medium backdrop-blur-sm">
                        {e.badge}
                      </span>
                    )}
                    {e.available && !isHidden && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-green-500/80 text-xs font-medium backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Disponible
                      </span>
                    )}
                    {isHidden && (
                      <span className="px-2 py-0.5 rounded-lg bg-amber-500/80 text-xs font-medium backdrop-blur-sm">
                        Oculto
                      </span>
                    )}
                  </div>
                </div>

                {/* Info y acciones */}
                <div className="p-3 flex-1 flex flex-col min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{e.name}, {e.age}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    {cityName}
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2 text-[11px] text-muted-foreground">
                    <span>Visible: {e.active_until ? (isHidden ? "Oculto" : new Date(e.active_until).toLocaleDateString("es-CL", { dateStyle: "short" })) : "—"}</span>
                    <span>Acceso: {e.user_id ? "Sí" : "No"}</span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link to={`/perfil/${e.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex">
                      <Button variant="outline" size="sm" className="gap-1 text-gold border-gold/50 hover:bg-gold/10 h-8 text-xs">
                        <ExternalLink className="w-3 h-3" />
                        Ver
                      </Button>
                    </Link>
                    {canPause && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-amber-500 border-amber-500/50 hover:bg-amber-500/10 h-8 text-xs"
                        onClick={() => pauseMutation.mutate(e.id)}
                        disabled={pauseMutation.isPending}
                        title="Pausar perfil"
                      >
                        <Pause className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-gold border-gold/50 hover:bg-gold/10 h-8 text-xs"
                      onClick={() => add7DaysMutation.mutate(e.id)}
                      disabled={add7DaysMutation.isPending}
                      title="+7 días"
                    >
                      <CalendarPlus className="w-3 h-3" />
                    </Button>
                    {!e.user_id && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-gold border-gold/50 hover:bg-gold/10 h-8 text-xs gap-1"
                        onClick={() => setDarAcceso(e)}
                      >
                        <UserPlus className="w-3 h-3" />
                        Acceso
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setEditing(e)} aria-label="Editar">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleting(e)}
                      aria-label="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {creating && (
        <AdminEscortForm
          onClose={() => setCreating(false)}
          onSuccess={() => {
            setCreating(false);
            queryClient.invalidateQueries({ queryKey: ["escort_profiles"] });
          }}
        />
      )}
      {editing && (
        <AdminEscortForm
          initial={editing}
          onClose={() => setEditing(null)}
          onSuccess={() => {
            setEditing(null);
            queryClient.invalidateQueries({ queryKey: ["escort_profiles"] });
          }}
        />
      )}

      <AlertDialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar perfil?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el perfil de {deleting?.name}. El usuario asociado (si tiene acceso) no se borra.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => deleting && deleteMutation.mutate(deleting.id)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {darAcceso && (
        <DarAccesoDialog
          escort={darAcceso}
          onClose={() => setDarAcceso(null)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ["escort_profiles"] })}
        />
      )}
    </div>
  );
}
