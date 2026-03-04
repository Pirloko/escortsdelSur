import { QuizImageReveal } from "./QuizImageReveal";
import { QuizOptions } from "./QuizOptions";
import type { DailyQuizQuestion } from "@/types/quiz";
import type { CorrectOption } from "@/types/quiz";

export interface QuizQuestionProps {
  question: DailyQuizQuestion;
  revealed: boolean;
  selectedOption: CorrectOption | null;
  onSelectOption: (option: CorrectOption) => void;
  onSubmit: () => void;
  onNext: () => void;
  state: "idle" | "correct" | "incorrect" | "revealing";
  isSubmitting: boolean;
}

export function QuizQuestion({
  question,
  revealed,
  selectedOption,
  onSelectOption,
  onSubmit,
  onNext,
  state,
  isSubmitting,
}: QuizQuestionProps) {
  const showResult = state === "correct" || state === "incorrect";
  const canSubmit = selectedOption !== null && !isSubmitting;

  return (
    <div className="space-y-4">
      <div className="relative">
        <QuizImageReveal
          imageUrl={question.image_url}
          revealed={revealed}
          alt=""
          className="aspect-[4/3] w-full max-h-[280px]"
        />
        {revealed && state === "correct" && (
          <p className="absolute bottom-2 left-2 right-2 text-center text-xs font-semibold text-white bg-black/60 rounded-lg py-2 px-3">
            ¡Foto desbloqueada!
          </p>
        )}
      </div>
      <p className="text-base font-medium text-foreground">{question.question_text}</p>
      <QuizOptions
        optionA={question.option_a}
        optionB={question.option_b}
        optionC={question.option_c}
        optionD={question.option_d}
        selectedOption={selectedOption}
        onSelect={onSelectOption}
        disabled={isSubmitting || revealed}
        correctOption={state === "correct" ? question.correct_option : null}
        showResult={showResult}
      />
      {state === "incorrect" && (
        <p className="text-sm text-red-600 dark:text-red-400">Respuesta incorrecta. Intenta de nuevo.</p>
      )}
      <div className="flex gap-2 pt-2">
        {!revealed ? (
          <button
            type="button"
            disabled={!canSubmit}
            onClick={onSubmit}
            className="flex-1 h-12 rounded-xl bg-copper text-primary-foreground font-medium disabled:opacity-50 hover:bg-copper/90 transition-colors"
          >
            {isSubmitting ? "Comprobando…" : "Responder"}
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className="flex-1 h-12 rounded-xl bg-copper text-primary-foreground font-medium hover:bg-copper/90 transition-colors"
          >
            Siguiente
          </button>
        )}
      </div>
    </div>
  );
}
