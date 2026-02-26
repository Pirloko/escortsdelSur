import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AdminCityForm } from "./AdminCityForm";
import type { CitiesRow } from "@/types/database";

export default function AdminCiudades() {
  const [editing, setEditing] = useState<CitiesRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<CitiesRow | null>(null);
  const queryClient = useQueryClient();

  const { data: cities, isLoading } = useQuery({
    queryKey: ["cities"],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase.from("cities").select("*").order("name");
      if (error) throw error;
      return (data ?? []) as CitiesRow[];
    },
    enabled: !!supabase,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error("Sin Supabase");
      const { error } = await supabase.from("cities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      setDeleting(null);
    },
  });

  if (!supabase) {
    return (
      <div>
        <h1 className="text-2xl font-display font-bold mb-4">Ciudades</h1>
        <p className="text-muted-foreground">Configura Supabase para gestionar ciudades.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Ciudades</h1>
        <Button className="bg-gold text-primary-foreground hover:bg-gold/90" onClick={() => setCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva ciudad
        </Button>
      </div>
      <p className="text-muted-foreground text-sm">
        Slug debe coincidir con la URL (ej: temuco, rancagua). El conteo de perfiles se puede actualizar manualmente o con un trigger.
      </p>
      {isLoading ? (
        <p>Cargando…</p>
      ) : (
        <div className="rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Perfiles</TableHead>
                <TableHead className="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(cities ?? []).map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.slug}</TableCell>
                  <TableCell>{c.profiles}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setEditing(c)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleting(c)}>
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
        <AdminCityForm
          onClose={() => setCreating(false)}
          onSuccess={() => {
            setCreating(false);
            queryClient.invalidateQueries({ queryKey: ["cities"] });
          }}
        />
      )}
      {editing && (
        <AdminCityForm
          initial={editing}
          onClose={() => setEditing(null)}
          onSuccess={() => {
            setEditing(null);
            queryClient.invalidateQueries({ queryKey: ["cities"] });
          }}
        />
      )}

      <AlertDialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar ciudad?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará {deleting?.name}. Si hay perfiles asociados, la FK puede impedirlo.
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
