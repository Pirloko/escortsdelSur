import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DailyQuizRow } from "@/types/database";
import type { CorrectOption } from "@/types/quiz";
import { AdminQuizImageSelector, type ProfileForQuiz } from "./AdminQuizImageSelector";
import { loadPreguntas, pickRandomQuestions } from "@/lib/preguntas";
import { Plus, Calendar, Trash2 } from "lucide-react";

const OPTIONS: CorrectOption[] = ["A", "B", "C", "D"];

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

type QuestionState = {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: CorrectOption;
  image_url: string;
  order_number: number;
};

export default function AdminDesafioDelDia() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(todayDateString());
  const [questions, setQuestions] = useState<QuestionState[]>(
    Array.from({ length: 10 }, (_, i) => ({
      question_text: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_option: "A" as CorrectOption,
      image_url: "",
      order_number: i + 1,
    }))
  );
  const [creating, setCreating] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [ticketsOnComplete, setTicketsOnComplete] = useState(10);
  const [loadingPreguntas, setLoadingPreguntas] = useState(false);
  const [message, setMessage] = useState("");
  const [quizToDelete, setQuizToDelete] = useState<DailyQuizRow | null>(null);

  const startCreating = useCallback(async () => {
    setMessage("");
    setLoadingPreguntas(true);
    try {
      const all = await loadPreguntas();
      if (all.length < 10) {
        setMessage(`Hay solo ${all.length} preguntas en preguntas.txt. Se necesitan al menos 10.`);
        setLoadingPreguntas(false);
        return;
      }
      const picked = pickRandomQuestions(all, 10);
      setQuestions(
        picked.map((q, i) => ({
          ...q,
          image_url: "",
          order_number: i + 1,
        }))
      );
      setCreating(true);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error al cargar preguntas.");
    } finally {
      setLoadingPreguntas(false);
    }
  }, []);

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ["admin-daily-quiz"],
    queryFn: async (): Promise<DailyQuizRow[]> => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from("daily_quiz")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as DailyQuizRow[];
    },
    enabled: !!supabase,
  });

  const { data: activeProfiles = [] } = useQuery({
    queryKey: ["admin-active-profiles-quiz"],
    queryFn: async (): Promise<ProfileForQuiz[]> => {
      if (!supabase) return [];
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("escort_profiles")
        .select("id, name, image, gallery")
        .eq("available", true)
        .not("promotion", "is", null)
        .gt("active_until", now)
        .order("name");
      if (error) throw error;
      return (data ?? []).map((row: { id: string; name: string; image: string | null; gallery: string[] }) => ({
        id: row.id,
        name: row.name,
        image: row.image ?? null,
        gallery: Array.isArray(row.gallery) ? row.gallery : [],
      }));
    },
    enabled: !!supabase && creating,
  });

  const createQuizMutation = useMutation({
    mutationFn: async () => {
      if (!supabase) throw new Error("Supabase no disponible");
      const tickets = Math.max(0, Math.floor(Number(ticketsOnComplete)) || 0);
      const { data: quiz, error: quizError } = await (supabase as any)
        .from("daily_quiz")
        .insert({
          date: selectedDate,
          title: quizTitle.trim() || null,
          tickets_on_complete: tickets,
          is_active: true,
        })
        .select()
        .single();
      if (quizError) throw quizError;
      for (const q of questions) {
        if (!q.question_text.trim() || !q.image_url.trim()) {
          throw new Error(`Pregunta ${q.order_number}: texto e imagen son obligatorios.`);
        }
        const { error: qError } = await (supabase as any).from("daily_quiz_questions").insert({
          quiz_id: (quiz as DailyQuizRow).id,
          question_text: q.question_text,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          correct_option: q.correct_option,
          image_url: q.image_url,
          order_number: q.order_number,
        });
        if (qError) throw qError;
      }
      return quiz as DailyQuizRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-daily-quiz"] });
      setCreating(false);
      setQuizTitle("");
      setTicketsOnComplete(10);
      setMessage("Quiz creado correctamente.");
      setQuestions(
        Array.from({ length: 10 }, (_, i) => ({
          question_text: "",
          option_a: "",
          option_b: "",
          option_c: "",
          option_d: "",
          correct_option: "A" as CorrectOption,
          image_url: "",
          order_number: i + 1,
        }))
      );
    },
    onError: (err: Error) => {
      setMessage(err.message || "Error al crear quiz.");
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      if (!supabase) throw new Error("Supabase no disponible");
      const { error } = await (supabase as any).from("daily_quiz").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-daily-quiz"] });
    },
  });

  const deleteQuizMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error("Supabase no disponible");
      const { error } = await (supabase as any).from("daily_quiz").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-daily-quiz"] });
      setQuizToDelete(null);
    },
    onError: (err: Error) => {
      setMessage(err.message || "Error al eliminar.");
    },
  });

  const updateQuestion = (index: number, field: string, value: string | number) => {
    setQuestions((prev) => {
      const next = [...prev];
      (next[index] as Record<string, string | number>)[field] = value;
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Gestionar Desafío del Día</h1>
      <p className="text-muted-foreground">
        Crea un quiz por fecha con 10 preguntas. Cada pregunta tiene 4 opciones, una correcta y una imagen. No se puede duplicar la fecha.
      </p>

      {!creating ? (
        <>
          <div className="flex items-center justify-between gap-4">
            <Button onClick={startCreating} className="gap-2" disabled={loadingPreguntas}>
              {loadingPreguntas ? "Cargando preguntas…" : <><Plus className="w-4 h-4" /> Crear quiz para el desafío</>}
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-3 font-medium">Fecha</th>
                  <th className="text-left p-3 font-medium">Título</th>
                  <th className="text-left p-3 font-medium">Tickets al completar</th>
                  <th className="text-left p-3 font-medium">Activo</th>
                  <th className="p-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-muted-foreground">
                      Cargando…
                    </td>
                  </tr>
                ) : (quizzes ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-muted-foreground">
                      No hay quizzes. Crea uno con el botón superior.
                    </td>
                  </tr>
                ) : (
                  (quizzes ?? []).map((q) => (
                    <tr key={q.id} className="border-b border-border">
                      <td className="p-3">{q.date}</td>
                      <td className="p-3 text-muted-foreground">{q.title ?? "—"}</td>
                      <td className="p-3 tabular-nums">{q.tickets_on_complete ?? 10}</td>
                      <td className="p-3">{q.is_active ? "Sí" : "No"}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            variant={q.is_active ? "outline" : "default"}
                            size="sm"
                            className={!q.is_active ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                            onClick={() =>
                              toggleActiveMutation.mutate({
                                id: q.id,
                                is_active: !q.is_active,
                              })
                            }
                            disabled={toggleActiveMutation.isPending}
                          >
                            {q.is_active ? "Desactivar" : "Activar"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setQuizToDelete(q)}
                            disabled={deleteQuizMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <AlertDialog open={!!quizToDelete} onOpenChange={(open) => !open && setQuizToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar desafío</AlertDialogTitle>
                <AlertDialogDescription>
                  ¿Eliminar el desafío del {quizToDelete?.date}
                  {quizToDelete?.title ? ` («${quizToDelete.title}»)` : ""}? Se borrarán también sus 10 preguntas y el progreso de los usuarios. Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => quizToDelete && deleteQuizMutation.mutate(quizToDelete.id)}
                  disabled={deleteQuizMutation.isPending}
                >
                  {deleteQuizMutation.isPending ? "Eliminando…" : "Eliminar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      ) : (
        <div className="space-y-6 rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="quiz-title">Título del desafío (opcional)</Label>
              <Input
                id="quiz-title"
                type="text"
                placeholder="Ej. Cultura general, Música..."
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex-1 min-w-[160px]">
              <Label htmlFor="quiz-date">Fecha del quiz (única)</Label>
              <Input
                id="quiz-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="w-32">
              <Label htmlFor="quiz-tickets">Tickets al completar</Label>
              <Input
                id="quiz-tickets"
                type="number"
                min={0}
                value={ticketsOnComplete}
                onChange={(e) => setTicketsOnComplete(Number(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setCreating(false);
                setQuizTitle("");
                setTicketsOnComplete(10);
                setMessage("");
              }}
            >
              Cancelar
            </Button>
            <Button
              disabled={
                createQuizMutation.isPending ||
                questions.some((q) => !q.image_url.trim())
              }
              onClick={() => createQuizMutation.mutate()}
            >
              {createQuizMutation.isPending ? "Creando…" : "Crear quiz para el desafío"}
            </Button>
          </div>
          {message && (
            <p
              className={
                message.startsWith("Error") ? "text-sm text-destructive" : "text-sm text-green-600 dark:text-green-400"
              }
            >
              {message}
            </p>
          )}
          <div className="space-y-6">
            <h2 className="font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              10 preguntas
            </h2>
            <p className="text-sm text-muted-foreground">
              Las 10 preguntas se eligieron al azar de preguntas.txt. Solo debes elegir la imagen para cada una (subir desde dispositivo o elegir de perfiles con promoción).
            </p>
            {questions.map((q, index) => (
              <div
                key={q.order_number}
                className="rounded-xl border border-border p-4 space-y-3 bg-background/50"
              >
                <p className="text-sm font-medium text-muted-foreground">Pregunta {q.order_number}</p>
                <p className="text-sm font-medium text-foreground">{q.question_text}</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>A) {q.option_a}</li>
                  <li>B) {q.option_b}</li>
                  <li>C) {q.option_c}</li>
                  <li>D) {q.option_d}</li>
                </ul>
                <p className="text-xs text-copper">Correcta: {q.correct_option}</p>
                <AdminQuizImageSelector
                  profiles={activeProfiles}
                  value={q.image_url}
                  onChange={(url) => updateQuestion(index, "image_url", url)}
                  label="Elegir imagen para esta pregunta (subir o perfil)"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
