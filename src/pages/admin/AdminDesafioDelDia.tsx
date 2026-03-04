import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DailyQuizRow } from "@/types/database";
import type { CorrectOption } from "@/types/quiz";
import { AdminQuizImageSelector, type ProfileForQuiz } from "./AdminQuizImageSelector";
import { Plus, Calendar } from "lucide-react";

const OPTIONS: CorrectOption[] = ["A", "B", "C", "D"];

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminDesafioDelDia() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(todayDateString());
  const [questions, setQuestions] = useState<
    Array<{
      question_text: string;
      option_a: string;
      option_b: string;
      option_c: string;
      option_d: string;
      correct_option: CorrectOption;
      image_url: string;
      order_number: number;
    }>
  >(
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
  const [message, setMessage] = useState("");

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
      const { data, error } = await supabase
        .from("escort_profiles")
        .select("id, name, image, gallery")
        .eq("available", true)
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
      const { data: quiz, error: quizError } = await (supabase as any)
        .from("daily_quiz")
        .insert({ date: selectedDate, is_active: true })
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
            <Button onClick={() => setCreating(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Crear quiz para una fecha
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-3 font-medium">Fecha</th>
                  <th className="text-left p-3 font-medium">Activo</th>
                  <th className="p-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-muted-foreground">
                      Cargando…
                    </td>
                  </tr>
                ) : (quizzes ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-muted-foreground">
                      No hay quizzes. Crea uno con el botón superior.
                    </td>
                  </tr>
                ) : (
                  (quizzes ?? []).map((q) => (
                    <tr key={q.id} className="border-b border-border">
                      <td className="p-3">{q.date}</td>
                      <td className="p-3">{q.is_active ? "Sí" : "No"}</td>
                      <td className="p-3">
                        <Button
                          variant="outline"
                          size="sm"
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
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="space-y-6 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="quiz-date">Fecha del quiz (única)</Label>
              <Input
                id="quiz-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setCreating(false);
                setMessage("");
              }}
            >
              Cancelar
            </Button>
            <Button
              disabled={
                createQuizMutation.isPending ||
                questions.some((q) => !q.question_text.trim() || !q.image_url.trim())
              }
              onClick={() => createQuizMutation.mutate()}
            >
              {createQuizMutation.isPending ? "Creando…" : "Crear quiz"}
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
            {questions.map((q, index) => (
              <div
                key={q.order_number}
                className="rounded-xl border border-border p-4 space-y-3 bg-background/50"
              >
                <p className="text-sm font-medium text-muted-foreground">Pregunta {q.order_number}</p>
                <div>
                  <Label>Texto de la pregunta</Label>
                  <Input
                    value={q.question_text}
                    onChange={(e) => updateQuestion(index, "question_text", e.target.value)}
                    placeholder="¿Cuál es…?"
                    className="mt-1"
                  />
                </div>
                <AdminQuizImageSelector
                  profiles={activeProfiles}
                  value={q.image_url}
                  onChange={(url) => updateQuestion(index, "image_url", url)}
                  label="Imagen de la pregunta"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {OPTIONS.map((opt) => (
                    <div key={opt}>
                      <Label>Opción {opt}</Label>
                  <Input
                    value={String((q as Record<string, string | number>)[`option_${opt.toLowerCase()}`] ?? "")}
                    onChange={(e) =>
                      updateQuestion(index, `option_${opt.toLowerCase()}`, e.target.value)
                    }
                    placeholder={opt}
                    className="mt-1"
                  />
                    </div>
                  ))}
                </div>
                <div>
                  <Label>Respuesta correcta</Label>
                  <select
                    value={q.correct_option}
                    onChange={(e) =>
                      updateQuestion(index, "correct_option", e.target.value as CorrectOption)
                    }
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
