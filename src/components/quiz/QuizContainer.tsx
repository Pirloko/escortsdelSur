import { useMemo, useCallback } from "react";
import { QuizQuestion } from "./QuizQuestion";
import { useQuizEngine } from "./useQuizEngine";
import type { DailyQuizQuestion } from "@/types/quiz";
import type { CorrectOption } from "@/types/quiz";

export interface QuizContainerProps {
  questions: DailyQuizQuestion[];
  currentQuestionIndex: number;
  isCompleted: boolean;
  isSubmitting: boolean;
  onSubmitAnswer: (selectedOption: CorrectOption, question: DailyQuizQuestion) => Promise<{ correct: boolean }>;
  onAdvance: () => void;
  header?: React.ReactNode;
}

export function QuizContainer({
  questions,
  currentQuestionIndex,
  isCompleted,
  isSubmitting,
  onSubmitAnswer,
  onAdvance,
  header,
}: QuizContainerProps) {
  const currentQuestion = useMemo(
    () => questions.find((q) => q.order_number === currentQuestionIndex) ?? null,
    [questions, currentQuestionIndex]
  );

  const handleSubmit = useCallback(
    async (selectedOption: CorrectOption, question: DailyQuizQuestion) => {
      return onSubmitAnswer(selectedOption, question);
    },
    [onSubmitAnswer]
  );

  const { selectedOption, state, revealed, selectOption, submit, goNext } = useQuizEngine(
    currentQuestion,
    handleSubmit
  );

  const handleNext = useCallback(() => {
    goNext();
    onAdvance();
  }, [goNext, onAdvance]);

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center text-muted-foreground">
        No hay preguntas para hoy.
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="space-y-4">
        {header}
        <div className="rounded-2xl border-2 border-copper/40 bg-card p-6 text-center space-y-3">
          <p className="text-lg font-medium text-foreground">¡Desafío completado!</p>
          <p className="text-sm text-muted-foreground">Has respondido las 10 preguntas de hoy.</p>
          <p className="text-sm font-medium text-copper pt-2 border-t border-copper/20">
            🎉 Has descubierto 10 fotos exclusivas y calientes de nuestros perfiles.
          </p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center text-muted-foreground">
        Cargando pregunta…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {header}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <QuizQuestion
          question={currentQuestion}
          revealed={revealed}
          selectedOption={selectedOption}
          onSelectOption={selectOption}
          onSubmit={submit}
          onNext={handleNext}
          state={state}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
