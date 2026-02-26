import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, CalendarPlus, ExternalLink, Pause } from "lucide-react";
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Escorts registrados</h1>
      </div>
      <p className="text-muted-foreground text-sm">
        Usuarios escort que se registraron a través del formulario de registro y tienen perfil público vinculado a su cuenta.
      </p>
      {isLoading ? (
        <p>Cargando…</p>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre (perfil)</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead>Cuenta</TableHead>
                <TableHead>Badge</TableHead>
                <TableHead>Visible hasta</TableHead>
                <TableHead className="w-[200px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(escorts ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No hay escorts registrados con cuenta vinculada.
                  </TableCell>
                </TableRow>
              ) : (
                (escorts ?? []).map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.name}, {e.age}</TableCell>
                    <TableCell>{e.cities?.name ?? "—"}</TableCell>
                    <TableCell>{e.account_name ?? "—"}</TableCell>
                    <TableCell>{e.badge ?? "—"}</TableCell>
                    <TableCell>
                      {e.active_until
                        ? new Date(e.active_until) < new Date()
                          ? <span className="text-amber-500">Oculto</span>
                          : new Date(e.active_until).toLocaleDateString("es-CL", { dateStyle: "short" })
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap items-center">
                        <Link to={`/perfil/${e.id}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="gap-1 text-gold border-gold/50 hover:bg-gold/10">
                            <ExternalLink className="w-3.5 h-3.5" />
                            Ver perfil
                          </Button>
                        </Link>
                        {(e.active_until == null || new Date(e.active_until) >= new Date()) && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-amber-500 border-amber-500/50 hover:bg-amber-500/10 shrink-0"
                            onClick={() => pauseMutation.mutate(e.id)}
                            disabled={pauseMutation.isPending}
                            title="Pausar / ocultar perfil en listados"
                          >
                            <Pause className="w-3.5 h-3.5 mr-1" />
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
                          <CalendarPlus className="w-3.5 h-3.5 mr-1" />
                          7 días
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setEditing(e)} aria-label="Editar">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleting(e)}
                          aria-label="Eliminar perfil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
