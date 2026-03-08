import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getActiveQuizzes,
  getQuizById,
  getQuizQuestions,
  getOrCreateUserProgress,
  submitQuizAnswer,
  advanceQuizProgress,
} from "@/lib/quizService";
import type { CorrectOption } from "@/types/quiz";
import type { DailyQuiz, DailyQuizQuestion, UserQuizProgress } from "@/types/quiz";

/** Lista de todos los desafíos activos (para elegir cuál jugar). */
export function useActiveQuizzes() {
  return useQuery({
    queryKey: ["active-quizzes"],
    queryFn: getActiveQuizzes,
    enabled: true,
  });
}

export function useQuizDay(userId: string | undefined, quizId: string | undefined) {
  const queryClient = useQueryClient();

  const quizQuery = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: () => (quizId ? getQuizById(quizId) : Promise.resolve(null)),
    enabled: !!quizId,
  });

  const questionsQuery = useQuery({
    queryKey: ["quiz-questions", quizId],
    queryFn: () => (quizId ? getQuizQuestions(quizId) : Promise.resolve([])),
    enabled: !!quizId,
  });

  const progressQuery = useQuery({
    queryKey: ["quiz-progress", userId, quizId],
    queryFn: () =>
      userId && quizId ? getOrCreateUserProgress(userId, quizId) : Promise.resolve(null),
    enabled: !!userId && !!quizId,
  });

  const submitMutation = useMutation({
    mutationFn: ({
      selectedOption,
      question,
    }: {
      selectedOption: CorrectOption;
      question: DailyQuizQuestion;
    }) => {
      if (!userId || !quizId) throw new Error("Usuario o quiz no disponible");
      return submitQuizAnswer(userId, quizId, question.order_number, selectedOption, question);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-progress", userId, quizId] });
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["active-quizzes"] });
    },
  });

  const quiz = (quizQuery.data ?? null) as DailyQuiz | null;
  const questions = questionsQuery.data ?? [];
  const progress = progressQuery.data ?? null;
  const isCompleted = progress?.completed ?? false;
  const currentQuestionIndex = progress ? Math.min(progress.current_question, 10) : 1;
  const ticketsBonus = quiz?.tickets_on_complete ?? 10;
  const ticketsEarnedToday =
    progress != null
      ? progress.correct_answers * 1 + (progress.completed ? ticketsBonus : 0)
      : 0;

  const advanceProgress = async () => {
    if (!userId || !quizId) return;
    await advanceQuizProgress(userId, quizId);
    queryClient.invalidateQueries({ queryKey: ["quiz-progress", userId, quizId] });
    queryClient.invalidateQueries({ queryKey: ["active-quizzes"] });
  };

  return {
    quiz,
    questions,
    progress,
    isCompleted,
    currentQuestionIndex,
    ticketsEarnedToday,
    isLoading: quizQuery.isLoading || questionsQuery.isLoading || progressQuery.isLoading,
    isError: quizQuery.isError || questionsQuery.isError || progressQuery.isError,
    refetch: () => {
      quizQuery.refetch();
      questionsQuery.refetch();
      progressQuery.refetch();
    },
    submitAnswer: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
    advanceProgress,
  };
}

export type QuizDayState = {
  quiz: DailyQuiz | null;
  questions: DailyQuizQuestion[];
  progress: UserQuizProgress | null;
  isCompleted: boolean;
  currentQuestionIndex: number;
  ticketsEarnedToday: number;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  submitAnswer: (args: {
    selectedOption: CorrectOption;
    question: DailyQuizQuestion;
  }) => Promise<{ correct: boolean; newProgress: UserQuizProgress }>;
  isSubmitting: boolean;
  advanceProgress: () => Promise<void>;
};

export function useQuizDayForUser(
  userId: string | undefined,
  quizId: string | undefined
): QuizDayState {
  return useQuizDay(userId ?? "", quizId);
}
