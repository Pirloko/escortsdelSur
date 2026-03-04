import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getQuizByDate,
  getQuizQuestions,
  getOrCreateUserProgress,
  submitQuizAnswer,
} from "@/lib/quizService";
import type { CorrectOption } from "@/types/quiz";
import type { DailyQuizQuestion, UserQuizProgress } from "@/types/quiz";

function todayDateString(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function useQuizDay(userId: string | undefined) {
  const date = todayDateString();
  const queryClient = useQueryClient();

  const quizQuery = useQuery({
    queryKey: ["quiz-day", date],
    queryFn: () => getQuizByDate(date),
    enabled: true,
  });

  const quizId = quizQuery.data?.id;

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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quiz-progress", userId, quizId] });
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });

  const quiz = quizQuery.data ?? null;
  const questions = questionsQuery.data ?? [];
  const progress = progressQuery.data ?? null;
  const isCompleted = progress?.completed ?? false;
  const currentQuestionIndex = progress ? Math.min(progress.current_question, 10) : 1;
  const ticketsEarnedToday =
    progress != null ? progress.correct_answers * 1 + (progress.completed ? 10 : 0) : 0;

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
  };
}

export type QuizDayState = {
  quiz: ReturnType<typeof useQuizDay>["quiz"];
  questions: ReturnType<typeof useQuizDay>["questions"];
  progress: UserQuizProgress | null;
  isCompleted: boolean;
  currentQuestionIndex: number;
  ticketsEarnedToday: number;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  submitAnswer: ReturnType<typeof useQuizDay>["submitAnswer"];
  isSubmitting: boolean;
};

export function useQuizDayForUser(userId: string | undefined): QuizDayState {
  return useQuizDay(userId ?? "");
}
