import { Link } from "react-router-dom";
import { SeoHead } from "@/components/SeoHead";
import { useAuth } from "@/contexts/AuthContext";
import { useQuizDayForUser } from "@/hooks/useQuizDay";
import { QuizContainer } from "@/components/quiz";
import { ArrowLeft } from "lucide-react";

const MAX_QUESTIONS = 10;

export default function DesafioDelDia() {
  const { user } = useAuth();
  const {
    quiz,
    questions,
    currentQuestionIndex,
    isCompleted,
    isLoading,
    isError,
    refetch,
    submitAnswer,
    isSubmitting,
  } = useQuizDayForUser(user?.id ?? undefined);

  if (isLoading && !quiz) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <span className="text-muted-foreground text-sm">Cargando desafío…</span>
      </div>
    );
  }

  if (isError || !quiz) {
    return (
      <div className="min-h-screen bg-background px-4 py-8">
        <Link to="/mi-perfil" className="inline-flex items-center gap-2 text-sm text-copper mb-4">
          <ArrowLeft className="w-4 h-4" />
          Volver al perfil
        </Link>
        <div className="rounded-2xl border border-border bg-card p-6 text-center text-muted-foreground">
          No hay desafío disponible para hoy. Vuelve mañana.
        </div>
      </div>
    );
  }

  const progressPercent = (currentQuestionIndex / MAX_QUESTIONS) * 100;

  const header = (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Link to="/mi-perfil" className="inline-flex items-center gap-2 text-sm text-copper">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
        <span className="text-sm text-muted-foreground tabular-nums">
          Pregunta {Math.min(currentQuestionIndex, MAX_QUESTIONS)} / {MAX_QUESTIONS}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-copper transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background px-4 py-6 pb-24">
      <SeoHead
        title="Desafío del Día | Punto Cachero"
        description="Responde las preguntas del día y desbloquea la imagen."
        canonicalPath="/desafio-del-dia"
        robots="noindex, nofollow"
        noSocial
      />
      <h1 className="text-xl font-display font-bold text-foreground mb-4">Desafío del Día</h1>
      <QuizContainer
        questions={questions}
        currentQuestionIndex={currentQuestionIndex}
        isCompleted={isCompleted}
        isSubmitting={isSubmitting}
        onSubmitAnswer={async (selectedOption, question) => {
          const result = await submitAnswer({ selectedOption, question });
          return { correct: result.correct };
        }}
        onAdvance={() => refetch()}
        header={header}
      />
    </div>
  );
}
