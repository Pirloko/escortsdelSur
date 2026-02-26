import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, CalendarPlus, Pause } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Usuarios registrados</h1>
        <Button className="bg-gold text-primary-foreground hover:bg-gold/90" onClick={() => setCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo perfil
        </Button>
      </div>
      <p className="text-muted-foreground text-sm">
        Crea perfiles públicos (escorts). Luego puedes dar acceso de login a cada uno desde &quot;Dar acceso&quot; (requiere Edge Function de Supabase).
      </p>
      {isLoading ? (
        <p>Cargando…</p>
      ) : (
        <div className="rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Edad</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead>Badge</TableHead>
                <TableHead>Disponible</TableHead>
                <TableHead>Visible hasta</TableHead>
                <TableHead>Acceso</TableHead>
                <TableHead className="w-[180px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(escorts ?? []).map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.name}</TableCell>
                  <TableCell>{e.age}</TableCell>
                  <TableCell>{(e as EscortRow).cities?.name ?? "—"}</TableCell>
                  <TableCell>{e.badge ?? "—"}</TableCell>
                  <TableCell>{e.available ? "Sí" : "No"}</TableCell>
                  <TableCell>
                    {e.active_until
                      ? new Date(e.active_until) < new Date()
                        ? <span className="text-amber-500">Oculto</span>
                        : new Date(e.active_until).toLocaleDateString("es-CL", { dateStyle: "short" })
                      : "—"}
                  </TableCell>
                  <TableCell>{e.user_id ? "Sí" : "No"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2 flex-wrap items-center">
                      {(e.active_until == null || new Date(e.active_until) >= new Date()) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-amber-500 border-amber-500/50 hover:bg-amber-500/10 shrink-0"
                          onClick={() => pauseMutation.mutate(e.id)}
                          disabled={pauseMutation.isPending}
                          title="Pausar / ocultar perfil en listados"
                        >
                          <Pause className="w-4 h-4 mr-1" />
                          Pausar
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-gold border-gold/50 hover:bg-gold/10 shrink-0"
                        onClick={() => add7DaysMutation.mutate(e.id)}
                        disabled={add7DaysMutation.isPending}
                        title="Añadir 7 días de visibilidad"
                      >
                        <CalendarPlus className="w-4 h-4 mr-1" />
                        7 días
                      </Button>
                      {!e.user_id && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-gold border-gold/50 hover:bg-gold/10"
                          onClick={() => setDarAcceso(e)}
                        >
                          Dar acceso
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => setEditing(e)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleting(e)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
