import { supabase } from "@/lib/supabase";
import type { DailyQuiz, DailyQuizQuestion, UserQuizProgress, CorrectOption } from "@/types/quiz";

const PEPITAS_PER_CORRECT = 5;
const TICKETS_PER_CORRECT = 1;
const TICKETS_BONUS_COMPLETE_DEFAULT = 10;

/** Todos los quizzes activos (varios pueden estar disponibles). Orden: fecha desc, creado desc. */
export async function getActiveQuizzes(): Promise<DailyQuiz[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("daily_quiz")
    .select("*")
    .eq("is_active", true)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DailyQuiz[];
}

/** Un quiz por id (para jugar uno concreto). */
export async function getQuizById(quizId: string): Promise<DailyQuiz | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("daily_quiz")
    .select("*")
    .eq("id", quizId)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return data as DailyQuiz | null;
}

export async function getQuizQuestions(quizId: string): Promise<DailyQuizQuestion[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("daily_quiz_questions")
    .select("*")
    .eq("quiz_id", quizId)
    .order("order_number", { ascending: true });
  if (error) throw error;
  return (data ?? []) as DailyQuizQuestion[];
}

export async function getUserQuizProgress(
  userId: string,
  quizId: string
): Promise<UserQuizProgress | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("user_quiz_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("quiz_id", quizId)
    .maybeSingle();
  if (error) throw error;
  return data as UserQuizProgress | null;
}

/** Progreso del usuario en varios quizzes (para la lista de desafíos). */
export async function getProgressForQuizzes(
  userId: string,
  quizIds: string[]
): Promise<Record<string, UserQuizProgress>> {
  if (!supabase || quizIds.length === 0) return {};
  const { data, error } = await supabase
    .from("user_quiz_progress")
    .select("*")
    .eq("user_id", userId)
    .in("quiz_id", quizIds);
  if (error) throw error;
  const list = (data ?? []) as UserQuizProgress[];
  return Object.fromEntries(list.map((p) => [p.quiz_id, p]));
}

export async function getOrCreateUserProgress(
  userId: string,
  quizId: string
): Promise<UserQuizProgress> {
  const existing = await getUserQuizProgress(userId, quizId);
  if (existing) return existing;
  if (!supabase) throw new Error("Supabase no disponible");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("user_quiz_progress")
    .insert({
      user_id: userId,
      quiz_id: quizId,
      current_question: 1,
      correct_answers: 0,
      completed: false,
    })
    .select()
    .single();
  if (error) throw error;
  return data as UserQuizProgress;
}

/** Reinicia el progreso del usuario en un quiz (vuelve a la pregunta 1, 0 aciertos). */
export async function resetQuizProgress(userId: string, quizId: string): Promise<void> {
  if (!supabase) throw new Error("Supabase no disponible");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("user_quiz_progress")
    .update({
      current_question: 1,
      correct_answers: 0,
      completed: false,
      completed_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("quiz_id", quizId);
  if (error) throw error;
}

export function isCorrectOption(question: DailyQuizQuestion, selected: CorrectOption): boolean {
  return question.correct_option === selected;
}

export async function submitQuizAnswer(
  userId: string,
  quizId: string,
  questionNumber: number,
  selectedOption: CorrectOption,
  question: DailyQuizQuestion
): Promise<{ correct: boolean; newProgress: UserQuizProgress }> {
  if (!supabase) throw new Error("Supabase no disponible");
  const correct = isCorrectOption(question, selectedOption);
  const progress = await getOrCreateUserProgress(userId, quizId);

  if (progress.completed) {
    return { correct: false, newProgress: progress };
  }
  if (progress.current_question !== questionNumber) {
    return { correct, newProgress: progress };
  }

  if (!correct) {
    return { correct: false, newProgress: progress };
  }

  const nextQuestion = Math.min(questionNumber + 1, 11);
  const newCorrectAnswers = progress.correct_answers + 1;
  const completed = questionNumber >= 10;
  const pepitasToAdd = PEPITAS_PER_CORRECT;
  let ticketsToAdd = TICKETS_PER_CORRECT;
  if (completed) {
    const { data: quizRow } = await supabase
      .from("daily_quiz")
      .select("tickets_on_complete")
      .eq("id", quizId)
      .single();
    const bonus = (quizRow as { tickets_on_complete?: number } | null)?.tickets_on_complete;
    ticketsToAdd += typeof bonus === "number" && bonus >= 0 ? bonus : TICKETS_BONUS_COMPLETE_DEFAULT;
  }

  const updatePayload = {
    current_question: completed ? 10 : nextQuestion,
    correct_answers: newCorrectAnswers,
    completed,
    completed_at: completed ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: updatedProgress, error: progressError } = await (supabase as any)
    .from("user_quiz_progress")
    .update(updatePayload)
    .eq("user_id", userId)
    .eq("quiz_id", quizId)
    .select()
    .single();

  if (progressError) throw progressError;

  const { data: profileRow } = await supabase.from("profiles").select("pepitas_cobre, tickets_rifa").eq("id", userId).single();
  const profile = profileRow as { pepitas_cobre?: number | null; tickets_rifa?: number | null } | null;
  const prevPepitas = profile ? Number(profile.pepitas_cobre ?? 0) : 0;
  const prevTickets = profile ? Number(profile.tickets_rifa ?? 0) : 0;
  const currentPepitas = prevPepitas + pepitasToAdd;
  const currentTickets = prevTickets + ticketsToAdd;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("profiles")
    .update({
      pepitas_cobre: currentPepitas,
      tickets_rifa: currentTickets,
    })
    .eq("id", userId);

  return { correct: true, newProgress: updatedProgress as UserQuizProgress };
}
