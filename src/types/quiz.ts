/**
 * Tipos para el sistema Desafío del Día (quiz desbloqueo de imágenes).
 */

export type CorrectOption = "A" | "B" | "C" | "D";

export interface DailyQuiz {
  id: string;
  date: string;
  title: string | null;
  tickets_on_complete: number;
  is_active: boolean;
  created_at: string;
}

export interface DailyQuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: CorrectOption;
  image_url: string;
  order_number: number;
  created_at: string;
}

export interface UserQuizProgress {
  id: string;
  user_id: string;
  quiz_id: string;
  current_question: number;
  correct_answers: number;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuizWithQuestions extends DailyQuiz {
  questions: DailyQuizQuestion[];
}
