import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Pause, Play, Trash2 } from "lucide-react";
import type { ProfilesRow } from "@/types/database";

type PublisherRow = ProfilesRow & {
  escort_profiles: { id: string; credits?: number | null }[];
};

export default function AdminPublicadores() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<PublisherRow | null>(null);
  const [creditsToAdd, setCreditsToAdd] = useState<string>("0");
  const [pauseTarget, setPauseTarget] = useState<PublisherRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PublisherRow | null>(null);

  const { data: publishers, isLoading } = useQuery({
    queryKey: ["admin_publishers"],
    queryFn: async (): Promise<PublisherRow[]> => {
      if (!supabase) return [];
      // 1) Usuarios publicador: perfiles con role = registered_user (sin relación anidada para evitar 400)
      const { data: profileList, error: errProfiles } = await supabase
        .from("profiles")
        .select("id, role, display_name, email, is_blocked, contact_phone")
        .eq("role", "registered_user");
      if (errProfiles) throw errProfiles;
      const ids = (profileList ?? []).map((p) => p.id);
      if (ids.length === 0) return [];

      // 2) Perfiles de escort de esos usuarios (user_id en escort_profiles)
      const { data: escortList, error: errEscorts } = await supabase
        .from("escort_profiles")
        .select("id, user_id, credits")
        .in("user_id", ids);
      if (errEscorts) throw errEscorts;

      const escortRows = escortList ?? [];
      const escortsByUserId: Record<string, { id: string; credits?: number | null }[]> = {};
      for (const e of escortRows) {
        const uid = e.user_id;
        if (!uid || !ids.includes(uid)) continue;
        if (!escortsByUserId[uid]) escortsByUserId[uid] = [];
        const credits = (e as { credits?: number | null }).credits ?? null;
        escortsByUserId[uid].push({ id: e.id, credits });
      }

      return (profileList ?? []).map((p) => ({
        ...p,
        escort_profiles: escortsByUserId[p.id] ?? [],
      })) as PublisherRow[];
    },
    enabled: !!supabase,
  });

  const rows = useMemo(
    () =>
      (publishers ?? []).map((p) => {
        const totalCredits = (p.escort_profiles ?? []).reduce(
          (sum, ep) => sum + (ep.credits ?? 0),
          0,
        );
        return { ...p, totalCredits };
      }),
    [publishers],
  ) as (PublisherRow & { totalCredits: number })[];

  const addCreditsMutation = useMutation({
    mutationFn: async ({ publisher, add }: { publisher: PublisherRow; add: number }) => {
      if (!supabase) throw new Error("Sin Supabase");
      // Tomamos un perfil principal del publicador para almacenar créditos extra
      let primaryProfileId = publisher.escort_profiles[0]?.id ?? null;
      if (!primaryProfileId) {
        // Si aún no tiene perfiles, no podemos asignar créditos a perfiles.
        // Guardamos solo el movimiento en historial.
      } else {
        const { data: current } = await supabase
          .from("escort_profiles")
          .select("credits")
          .eq("id", primaryProfileId)
          .single();
        const currentCredits = (current as { credits?: number | null } | null)?.credits ?? 0;
        const newCredits = currentCredits + add;
        const { error: updateErr } = await supabase
          .from("escort_profiles")
          // @ts-expect-error tipos generados pueden no incluir credits todavía
          .update({ credits: newCredits, updated_at: new Date().toISOString() })
          .eq("id", primaryProfileId);
        if (updateErr) throw updateErr;
      }
      // Registrar movimiento a nivel usuario
      // @ts-expect-error tipos generados pueden no incluir credit_transactions todavía
      const { error: txError } = await supabase.from("credit_transactions").insert({
        user_id: publisher.id,
        escort_profile_id: primaryProfileId,
        amount: add,
        type: "admin_add",
        description: "Créditos añadidos por admin al usuario publicador",
      });
      if (txError) throw txError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_publishers"] });
      queryClient.invalidateQueries({ queryKey: ["escort_profiles"] });
      setSelected(null);
      setCreditsToAdd("0");
    },
  });

  const pauseMutation = useMutation({
    mutationFn: async ({ publisher, paused }: { publisher: PublisherRow; paused: boolean }) => {
      if (!supabase) throw new Error("Sin Supabase");
      const { error } = await supabase
        .from("profiles")
        // @ts-expect-error is_blocked en tipos
        .update({ is_blocked: paused, updated_at: new Date().toISOString() })
        .eq("id", publisher.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_publishers"] });
      setPauseTarget(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (publisher: PublisherRow) => {
      if (!supabase) throw new Error("Sin Supabase");
      const { error } = await supabase
        .from("profiles")
        // @ts-expect-error actualizar role a visitor permitido en DB
        .update({ role: "visitor", updated_at: new Date().toISOString() })
        .eq("id", publisher.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_publishers"] });
      setDeleteTarget(null);
    },
  });

  if (!supabase) {
    return (
      <div>
        <h1 className="text-2xl font-display font-bold mb-4">Usuarios publicador</h1>
        <p className="text-muted-foreground">Configura Supabase para gestionar usuarios.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Usuarios publicador</h1>
        <p className="text-muted-foreground text-sm">
          Usuarios que pueden crear y gestionar perfiles/anuncios. Desde aquí puedes añadir créditos a cada cuenta.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl border border-border bg-card animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="text-muted-foreground text-center py-12 rounded-2xl border border-border bg-card">
          Aún no hay usuarios publicador.
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map((p) => (
            <div
              key={p.id}
              className={`rounded-xl border border-border bg-card overflow-hidden ${p.is_blocked ? "opacity-75" : ""}`}
            >
              <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <div>
                    <p className="font-semibold text-foreground">
                      {p.display_name || "Sin nombre"}
                    </p>
                    {p.is_blocked && (
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">(Pausado)</span>
                    )}
                  </div>
                  <dl className="grid grid-cols-1 gap-1 text-sm text-muted-foreground">
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                      <span className="font-medium text-foreground/80">Email:</span>
                      <span className="truncate" title={p.email || undefined}>
                        {p.email || "—"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                      <span className="font-medium text-foreground/80">Contacto:</span>
                      <span>{p.contact_phone ?? "—"}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                      <span className="font-medium text-foreground/80">Perfiles:</span>
                      <span>{p.escort_profiles.length}</span>
                      <span className="text-foreground/60">·</span>
                      <span className="font-medium text-foreground/80">Créditos totales:</span>
                      <span className="font-semibold text-foreground">{(p as any).totalCredits}</span>
                    </div>
                  </dl>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setPauseTarget(p)}
                    disabled={pauseMutation.isPending}
                    title={p.is_blocked ? "Reanudar usuario" : "Pausar usuario"}
                  >
                    {p.is_blocked ? (
                      <><Play className="w-3.5 h-3.5 mr-1" /> Reanudar</>
                    ) : (
                      <><Pause className="w-3.5 h-3.5 mr-1" /> Pausar</>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(p)}
                    disabled={deleteMutation.isPending}
                    title="Eliminar como publicador (pasará a visitante)"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Eliminar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => {
                      setSelected(p);
                      setCreditsToAdd("0");
                    }}
                  >
                    Añadir créditos
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Añadir créditos al usuario publicador</AlertDialogTitle>
            <AlertDialogDescription>
              Cuenta: {selected?.display_name || selected?.id}
              <br />
              Los créditos se aplican al total de la cuenta (no a un solo perfil).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="publisher-credits">Créditos a añadir</Label>
            <Input
              id="publisher-credits"
              type="number"
              min={1}
              step={10}
              value={creditsToAdd}
              onChange={(e) => setCreditsToAdd(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Introduce la cantidad de créditos que quieres sumar al saldo del usuario publicador.
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={addCreditsMutation.isPending || !selected}
              onClick={(e) => {
                e.preventDefault();
                if (!selected) return;
                const add = Number(creditsToAdd);
                if (!Number.isFinite(add) || add <= 0) return;
                addCreditsMutation.mutate({ publisher: selected, add });
              }}
            >
              Añadir créditos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!pauseTarget} onOpenChange={() => setPauseTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pauseTarget?.is_blocked ? "Reanudar usuario publicador" : "Pausar usuario publicador"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pauseTarget?.is_blocked
                ? `${pauseTarget.display_name || pauseTarget.id} volverá a poder acceder y gestionar sus perfiles.`
                : `Si pausas a ${pauseTarget?.display_name || pauseTarget?.id}, no podrá iniciar sesión ni gestionar sus anuncios hasta que lo reanudes.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={pauseMutation.isPending}
              onClick={() => {
                if (!pauseTarget) return;
                pauseMutation.mutate({ publisher: pauseTarget, paused: !pauseTarget.is_blocked });
              }}
            >
              {pauseTarget?.is_blocked ? "Reanudar" : "Pausar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar como usuario publicador</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.display_name || deleteTarget?.id} dejará de ser publicador y pasará a ser visitante. No podrá crear ni editar perfiles. Sus anuncios existentes pueden seguir visibles según la política del sitio. Esta acción se puede revertir cambiando su rol manualmente en la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
            >
              Eliminar como publicador
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

