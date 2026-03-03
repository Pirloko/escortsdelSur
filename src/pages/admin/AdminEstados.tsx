import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import type { StatusPhrasesRow } from "@/types/database";

export default function AdminEstados() {
  const [editing, setEditing] = useState<StatusPhrasesRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<StatusPhrasesRow | null>(null);
  const [formText, setFormText] = useState("");
  const queryClient = useQueryClient();

  const { data: phrases, isLoading } = useQuery({
    queryKey: ["status_phrases"],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase.from("status_phrases").select("*").order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as StatusPhrasesRow[];
    },
    enabled: !!supabase,
  });

  const saveMutation = useMutation({
    mutationFn: async ({ id, text }: { id?: string; text: string }) => {
      if (!supabase) throw new Error("Sin Supabase");
      const payload = { text: text.trim(), updated_at: new Date().toISOString() };
      if (id) {
        const { error } = await supabase.from("status_phrases").update(payload).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("status_phrases").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["status_phrases"] });
      setCreating(false);
      setEditing(null);
      setFormText("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error("Sin Supabase");
      const { error } = await supabase.from("status_phrases").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["status_phrases"] });
      setDeleting(null);
    },
  });

  const openCreate = () => {
    setFormText("");
    setCreating(true);
  };
  const openEdit = (row: StatusPhrasesRow) => {
    setFormText(row.text);
    setEditing(row);
  };

  if (!supabase) {
    return (
      <div>
        <h1 className="text-2xl font-display font-bold mb-4">Frases de estados</h1>
        <p className="text-muted-foreground">Configura Supabase para gestionar las frases.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Frases de estados</h1>
        <Button className="bg-gold text-primary-foreground hover:bg-gold/90" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva frase
        </Button>
      </div>
      <p className="text-muted-foreground text-sm">
        Estas frases se muestran en la sección &quot;Estados actualizados&quot; de cada ciudad, asignadas aleatoriamente a los perfiles.
      </p>
      {isLoading ? (
        <p>Cargando…</p>
      ) : (
        <div className="rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Frase</TableHead>
                <TableHead className="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(phrases ?? []).map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.text}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleting(p)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {(phrases ?? []).length === 0 && (
            <p className="text-center text-muted-foreground py-8 text-sm">Aún no hay frases. Añade una para que aparezcan en la página de ciudad.</p>
          )}
        </div>
      )}

      <Dialog open={creating || !!editing} onOpenChange={(open) => { if (!open) { setCreating(false); setEditing(null); setFormText(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar frase" : "Nueva frase"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="phrase-text">Texto del estado</Label>
              <Input
                id="phrase-text"
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
                placeholder="Ej: promocion solo por hoy!!"
                className="bg-surface"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreating(false); setEditing(null); setFormText(""); }}>
              Cancelar
            </Button>
            <Button
              className="bg-gold text-primary-foreground hover:bg-gold/90"
              disabled={!formText.trim() || saveMutation.isPending}
              onClick={() => {
                if (!formText.trim()) return;
                saveMutation.mutate(editing ? { id: editing.id, text: formText } : { text: formText });
              }}
            >
              {saveMutation.isPending ? "Guardando…" : editing ? "Guardar" : "Añadir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar frase?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará la frase: &quot;{deleting?.text}&quot;
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
