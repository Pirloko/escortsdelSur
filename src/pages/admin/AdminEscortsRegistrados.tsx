import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, CalendarPlus, ExternalLink, Pause, MapPin } from "lucide-react";
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
import type { EscortProfilesRow } from "@/types/database";

type EscortRow = EscortProfilesRow & {
  cities: { slug: string; name: string } | null;
};

type EscortWithAccount = EscortRow & { account_name: string | null };

export default function AdminEscortsRegistrados() {
  const [editing, setEditing] = useState<EscortProfilesRow | null>(null);
  const [deleting, setDeleting] = useState<EscortWithAccount | null>(null);
  const queryClient = useQueryClient();

  const { data: escorts, isLoading } = useQuery({
    queryKey: ["escort_profiles_registered"],
    queryFn: async (): Promise<EscortWithAccount[]> => {
      if (!supabase) return [];
      const { data: escortData, error: err1 } = await supabase
        .from("escort_profiles")
        .select("*, cities(slug, name)")
        .not("user_id", "is", null)
        .order("created_at", { ascending: false });
      if (err1) throw err1;
      const rows = (escortData ?? []) as EscortRow[];
      const userIds = [...new Set(rows.map((r) => r.user_id).filter(Boolean) as string[])];
      if (userIds.length === 0) return rows.map((r) => ({ ...r, account_name: null }));
      const { data: profilesData } = await supabase.from("profiles").select("id, display_name").in("id", userIds);
      const profiles = (profilesData ?? []) as { id: string; display_name: string | null }[];
      const nameByUserId = Object.fromEntries(profiles.map((p) => [p.id, p.display_name ?? "—"]));
      return rows.map((r) => ({ ...r, account_name: r.user_id ? nameByUserId[r.user_id] ?? "—" : null }));
    },
    enabled: !!supabase,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error("Sin Supabase");
      const { error } = await supabase.from("escort_profiles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escort_profiles_registered"] });
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
      queryClient.invalidateQueries({ queryKey: ["escort_profiles_registered"] });
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
      queryClient.invalidateQueries({ queryKey: ["escort_profiles_registered"] });
      queryClient.invalidateQueries({ queryKey: ["escort_profiles"] });
    },
  });

  if (!supabase) {
    return (
      <div>
        <h1 className="text-2xl font-display font-bold mb-4">Escorts registrados</h1>
        <p className="text-muted-foreground">Configura Supabase para gestionar usuarios escort.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Escorts registrados</h1>
      <p className="text-muted-foreground text-sm">
        Usuarios escort que se registraron a través del formulario de registro y tienen perfil público vinculado a su cuenta.
      </p>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl border border-border overflow-hidden bg-card aspect-[3/4] animate-pulse" />
          ))}
        </div>
      ) : (escorts ?? []).length === 0 ? (
        <p className="text-muted-foreground text-center py-12 rounded-2xl border border-border bg-card">
          No hay escorts registrados con cuenta vinculada.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {(escorts ?? []).map((e) => {
            const cityName = e.cities?.name ?? "—";
            const isHidden = e.active_until != null && new Date(e.active_until) < new Date();
            const canPause = e.active_until == null || new Date(e.active_until) >= new Date();
            return (
              <article
                key={e.id}
                className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col"
              >
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

                <div className="p-3 flex-1 flex flex-col min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{e.name}, {e.age}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    {cityName}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1 truncate" title={e.account_name ?? undefined}>
                    Cuenta: {e.account_name ?? "—"}
                  </p>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Visible: {e.active_until ? (isHidden ? "Oculto" : new Date(e.active_until).toLocaleDateString("es-CL", { dateStyle: "short" })) : "—"}
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

      {editing && (
        <AdminEscortForm
          initial={editing}
          onClose={() => setEditing(null)}
          onSuccess={() => {
            setEditing(null);
            queryClient.invalidateQueries({ queryKey: ["escort_profiles_registered"] });
            queryClient.invalidateQueries({ queryKey: ["escort_profiles"] });
          }}
        />
      )}

      <AlertDialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar perfil?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el perfil público de {deleting?.name}. La cuenta de usuario (login) no se borra; solo se quita el perfil escort.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => deleting && deleteMutation.mutate(deleting.id)}
            >
              Eliminar perfil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
