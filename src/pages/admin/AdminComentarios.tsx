import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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
import type { ProfileCommentsRow } from "@/types/database";

type CommentRow = ProfileCommentsRow & {
  escort_profiles: { id: string; name: string; cities: { name: string } | null } | null;
};

type CommentWithAuthor = CommentRow & { author_name: string | null };

export default function AdminComentarios() {
  const [deleting, setDeleting] = useState<CommentWithAuthor | null>(null);
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery({
    queryKey: ["admin_profile_comments"],
    queryFn: async (): Promise<CommentWithAuthor[]> => {
      if (!supabase) return [];
      const { data: commentsData, error: err1 } = await supabase
        .from("profile_comments")
        .select("id, body, created_at, user_id, escort_profile_id, escort_profiles(id, name, cities(name))")
        .order("created_at", { ascending: false });
      if (err1) throw err1;
      const rows = (commentsData ?? []) as CommentRow[];
      const userIds = [...new Set(rows.map((r) => r.user_id))];
      if (userIds.length === 0) return rows.map((r) => ({ ...r, author_name: null }));
      const { data: profilesData } = await supabase.from("profiles").select("id, display_name").in("id", userIds);
      const profiles = (profilesData ?? []) as { id: string; display_name: string | null }[];
      const authorByUserId = Object.fromEntries(profiles.map((p) => [p.id, p.display_name ?? "—"]));
      return rows.map((r) => ({ ...r, author_name: authorByUserId[r.user_id] ?? "—" }));
    },
    enabled: !!supabase,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error("Sin Supabase");
      const { error } = await supabase.from("profile_comments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_profile_comments"] });
      setDeleting(null);
    },
  });

  if (!supabase) {
    return (
      <div>
        <h1 className="text-2xl font-display font-bold mb-4">Comentarios</h1>
        <p className="text-muted-foreground">Configura Supabase para gestionar comentarios.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Comentarios</h1>
      </div>
      <p className="text-muted-foreground text-sm">
        Comentarios que dejan los usuarios visitantes/clientes en los perfiles. Puedes visualizarlos y eliminarlos.
      </p>
      {isLoading ? (
        <p>Cargando…</p>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Perfil</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead className="max-w-[280px]">Comentario</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="w-[80px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(comments ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No hay comentarios.
                  </TableCell>
                </TableRow>
              ) : (
                (comments ?? []).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      {c.escort_profiles ? (
                        <Link to={`/perfil/${c.escort_profile_id}`} className="text-gold hover:underline">
                          {c.escort_profiles.name}
                          {c.escort_profiles.cities?.name ? ` (${c.escort_profiles.cities.name})` : ""}
                        </Link>
                      ) : (
                        c.escort_profile_id
                      )}
                    </TableCell>
                    <TableCell>{c.author_name ?? "—"}</TableCell>
                    <TableCell className="max-w-[280px] text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
                      {c.body}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                      {new Date(c.created_at).toLocaleDateString("es-CL", { dateStyle: "short" })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleting(c)}
                        aria-label="Eliminar comentario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar comentario?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting && (
                <>
                  Se eliminará el comentario de &quot;{deleting.body.slice(0, 60)}
                  {deleting.body.length > 60 ? "…" : ""}&quot;. Esta acción no se puede deshacer.
                </>
              )}
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
    </div>
  );
}
