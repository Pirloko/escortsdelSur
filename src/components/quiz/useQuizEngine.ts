import { useState, useCallback, useEffect } from "react";
import type { DailyQuizQuestion } from "@/types/quiz";
import type { CorrectOption } from "@/types/quiz";

export type QuizEngineState = "idle" | "correct" | "incorrect" | "revealing";

export function useQuizEngine(
  currentQuestion: DailyQuizQuestion | null,
  onSubmit: (selectedOption: CorrectOption, question: DailyQuizQuestion) => Promise<{ correct: boolean }>
) {
  const [selectedOption, setSelectedOption] = useState<CorrectOption | null>(null);
  const [state, setState] = useState<QuizEngineState>("idle");
  const [revealed, setRevealed] = useState(false);

  const questionId = currentQuestion?.id ?? null;
  useEffect(() => {
    setSelectedOption(null);
    setState("idle");
    setRevealed(false);
  }, [questionId]);

  const selectOption = useCallback((option: CorrectOption) => {
    setSelectedOption(option);
  }, []);

  const submit = useCallback(async () => {
    if (!currentQuestion || selectedOption === null) return;
    setState("idle");
    try {
      const { correct } = await onSubmit(selectedOption, currentQuestion);
      if (correct) {
        setState("correct");
        setRevealed(true);
      } else {
        setState("incorrect");
      }
    } catch {
      setState("incorrect");
    }
  }, [currentQuestion, selectedOption, onSubmit]);

  const goNext = useCallback(() => {
    setSelectedOption(null);
    setState("idle");
    setRevealed(false);
  }, []);

  return {
    selectedOption,
    state,
    revealed,
    selectOption,
    submit,
    goNext,
  };
}
