import type { CorrectOption } from "@/types/quiz";
import { cn } from "@/lib/utils";

const OPTIONS: CorrectOption[] = ["A", "B", "C", "D"];

export interface QuizOptionsProps {
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  selectedOption: CorrectOption | null;
  onSelect: (option: CorrectOption) => void;
  disabled?: boolean;
  correctOption?: CorrectOption | null;
  showResult?: boolean;
}

const optionKey = (o: CorrectOption): keyof Pick<QuizOptionsProps, "optionA" | "optionB" | "optionC" | "optionD"> =>
  `option_${o.toLowerCase()}` as keyof Pick<QuizOptionsProps, "optionA" | "optionB" | "optionC" | "optionD">;

export function QuizOptions({
  optionA,
  optionB,
  optionC,
  optionD,
  selectedOption,
  onSelect,
  disabled,
  correctOption,
  showResult,
}: QuizOptionsProps) {
  const labels: Record<CorrectOption, string> = { A: optionA, B: optionB, C: optionC, D: optionD };

  return (
    <div className="grid grid-cols-1 gap-3">
      {OPTIONS.map((opt) => {
        const isSelected = selectedOption === opt;
        const isCorrect = showResult && correctOption === opt;
        const isWrong = showResult && isSelected && correctOption !== opt;
        return (
          <button
            key={opt}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(opt)}
            className={cn(
              "w-full rounded-xl border-2 px-4 py-3.5 text-left text-sm font-medium transition-colors",
              "border-border bg-card hover:border-copper/50 hover:bg-copper/10",
              isSelected && !showResult && "border-copper bg-copper/20 text-copper",
              isCorrect && "border-green-500 bg-green-500/20 text-green-700 dark:text-green-400",
              isWrong && "border-red-500/70 bg-red-500/10 text-red-600 dark:text-red-400"
            )}
          >
            <span className="mr-2 font-bold text-copper">{opt}.</span>
            {labels[opt]}
          </button>
        );
      })}
    </div>
  );
}
