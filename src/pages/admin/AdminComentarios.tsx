import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Trash2, MessageSquare, User } from "lucide-react";
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
      <h1 className="text-2xl font-display font-bold">Comentarios</h1>
      <p className="text-muted-foreground text-sm">
        Comentarios que dejan los usuarios visitantes/clientes en los perfiles. Puedes visualizarlos y eliminarlos.
      </p>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-4 h-40 animate-pulse" />
          ))}
        </div>
      ) : (comments ?? []).length === 0 ? (
        <p className="text-muted-foreground text-center py-12 rounded-2xl border border-border bg-card">
          No hay comentarios.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(comments ?? []).map((c) => (
            <article
              key={c.id}
              className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col"
            >
              <div className="p-4 flex-1 flex flex-col min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-foreground min-w-0">
                    {c.escort_profiles ? (
                      <Link
                        to={`/perfil/${c.escort_profile_id}`}
                        className="text-gold hover:underline truncate block"
                      >
                        {c.escort_profiles.name}
                        {c.escort_profiles.cities?.name ? ` · ${c.escort_profiles.cities.name}` : ""}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground truncate block">{c.escort_profile_id}</span>
                    )}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleting(c)}
                    aria-label="Eliminar comentario"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
                  <User className="w-3.5 h-3.5 flex-shrink-0" />
                  {c.author_name ?? "—"}
                </p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4 flex-1">
                  {c.body}
                </p>
                <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 flex-shrink-0" />
                  {new Date(c.created_at).toLocaleDateString("es-CL", { dateStyle: "short" })}
                </p>
              </div>
            </article>
          ))}
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
