import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Ban, Mail, Trash2, UserCheck, Ticket } from "lucide-react";
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
import type { ProfilesRow } from "@/types/database";

export default function AdminVisitantes() {
  const [deleting, setDeleting] = useState<ProfilesRow | null>(null);
  const queryClient = useQueryClient();

  const { data: visitors, isLoading } = useQuery({
    queryKey: ["admin_profiles_visitors"],
    queryFn: async (): Promise<ProfilesRow[]> => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "visitor")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ProfilesRow[];
    },
    enabled: !!supabase,
  });

  const { data: lifetimeByUser = {} } = useQuery({
    queryKey: ["admin_raffle_snapshot_lifetime"],
    queryFn: async (): Promise<Record<string, number>> => {
      if (!supabase) return {};
      const { data, error } = await supabase
        .from("raffle_participants_snapshot")
        .select("user_id, tickets_used");
      if (error) throw error;
      const rows = (data ?? []) as { user_id: string; tickets_used: number }[];
      const map: Record<string, number> = {};
      for (const r of rows) {
        map[r.user_id] = (map[r.user_id] ?? 0) + (r.tickets_used ?? 0);
      }
      return map;
    },
    enabled: !!supabase,
  });

  const blockMutation = useMutation({
    mutationFn: async ({ id, is_blocked }: { id: string; is_blocked: boolean }) => {
      if (!supabase) throw new Error("Sin Supabase");
      const { error } = await supabase
        .from("profiles")
        // @ts-expect-error is_blocked/email añadidos en migración; tipos DB pendientes de regenerar
        .update({ is_blocked, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_profiles_visitors"] });
      queryClient.invalidateQueries({ queryKey: ["profiles_visitors_count"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error("Sin Supabase");
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_profiles_visitors"] });
      queryClient.invalidateQueries({ queryKey: ["profiles_visitors_count"] });
      setDeleting(null);
    },
  });

  if (!supabase) {
    return (
      <div>
        <h1 className="text-2xl font-display font-bold mb-4">Visitantes / Clientes</h1>
        <p className="text-muted-foreground">Configura Supabase para gestionar visitantes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Visitantes / Clientes</h1>
      <p className="text-muted-foreground text-sm">
        Usuarios que visitan la web (sin perfil de escort). Puedes bloquearlos, eliminarlos del listado o contactarlos por email si lo tienen.
      </p>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-4 h-44 animate-pulse" />
          ))}
        </div>
      ) : (visitors ?? []).length === 0 ? (
        <p className="text-muted-foreground text-center py-12 rounded-2xl border border-border bg-card">
          No hay visitantes registrados.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(visitors ?? []).map((v) => (
            <article
              key={v.id}
              className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col"
            >
              <div className="p-4 flex-1 flex flex-col min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-foreground truncate">
                    {v.display_name || "Sin nombre"}
                  </h3>
                  {v.is_blocked && (
                    <span className="shrink-0 rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-medium text-destructive">
                      Bloqueado
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-2 truncate" title={v.email ?? undefined}>
                  {v.email ? v.email : "Sin email"}
                </p>
                <p className="text-xs text-muted-foreground mb-2">
                  Registro: {v.created_at ? new Date(v.created_at).toLocaleDateString("es-CL") : "—"}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1.5" title="Tickets actuales (se reinician cada sorteo)">
                    <Ticket className="w-3.5 h-3.5 text-copper" />
                    Actuales: <strong className="text-foreground">{v.tickets_rifa ?? 0}</strong>
                  </span>
                  <span className="flex items-center gap-1.5" title="Total de tickets en toda su trayectoria">
                    Histórico: <strong className="text-foreground">{(v.tickets_rifa ?? 0) + (lifetimeByUser[v.id] ?? 0)}</strong>
                  </span>
                </div>
                <div className="mt-auto flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    disabled={blockMutation.isPending}
                    onClick={() => blockMutation.mutate({ id: v.id, is_blocked: !v.is_blocked })}
                  >
                    {v.is_blocked ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        Desbloquear
                      </>
                    ) : (
                      <>
                        <Ban className="w-3.5 h-3.5" />
                        Bloquear
                      </>
                    )}
                  </Button>
                  {v.email ? (
                    <Button variant="outline" size="sm" className="gap-1.5" asChild>
                      <a href={`mailto:${v.email}`}>
                        <Mail className="w-3.5 h-3.5" />
                        Contactar
                      </a>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="gap-1.5" disabled title="Sin email">
                      <Mail className="w-3.5 h-3.5" />
                      Contactar
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    disabled={deleteMutation.isPending}
                    onClick={() => setDeleting(v)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar visitante?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el perfil del listado. El usuario en auth seguirá existiendo pero ya no aparecerá aquí.
              {deleting?.display_name && ` (${deleting.display_name})`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleting && deleteMutation.mutate(deleting.id)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
