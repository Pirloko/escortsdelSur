import { useState } from "react";
import { Link } from "react-router-dom";
import { SeoHead } from "@/components/SeoHead";
import { useAuth } from "@/contexts/AuthContext";
import { useQuizDayForUser } from "@/hooks/useQuizDay";
import { QuizContainer } from "@/components/quiz";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CorrectOption, DailyQuizQuestion } from "@/types/quiz";

const MAX_QUESTIONS = 10;
const GUEST_MAX_LEVEL = 1;

export default function DesafioDelDia() {
  const { user } = useAuth();
  const [guestFinishedFirstLevel, setGuestFinishedFirstLevel] = useState(false);

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

  const isGuest = !user;

  if (isLoading && !quiz) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <span className="text-muted-foreground text-sm">Cargando desafío…</span>
      </div>
    );
  }

  if (isError || !quiz) {
    const backTo = isGuest ? "/" : "/mi-perfil";
    const backLabel = isGuest ? "Volver al inicio" : "Volver al perfil";
    return (
      <div className="min-h-screen bg-background px-4 py-8">
        <Link to={backTo} className="inline-flex items-center gap-2 text-sm text-copper mb-4">
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </Link>
        <div className="rounded-2xl border border-border bg-card p-6 text-center text-muted-foreground">
          No hay desafío disponible para hoy. Vuelve mañana.
        </div>
      </div>
    );
  }

  // Invitado que completó el primer nivel: pedir registro para seguir
  if (isGuest && guestFinishedFirstLevel) {
    return (
      <div className="min-h-screen bg-background px-4 py-6 pb-24">
        <SeoHead
          title="Desafío del Día | Punto Cachero"
          description="Responde las preguntas del día y desbloquea la imagen."
          canonicalPath="/desafio-del-dia"
          robots="noindex, nofollow"
          noSocial
        />
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-copper mb-6">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
        <div className="rounded-2xl border border-copper/30 bg-card p-6 text-center space-y-4">
          <p className="text-lg font-medium text-foreground">
            Has completado 1 nivel
          </p>
          <p className="text-sm text-muted-foreground">
            Para seguir jugando y ganar tickets para la rifa, crea una cuenta gratis.
          </p>
          <Button asChild className="w-full rounded-xl bg-copper/90 text-primary-foreground hover:bg-copper">
            <Link to="/registro-cliente">Crear cuenta y seguir jugando</Link>
          </Button>
        </div>
      </div>
    );
  }

  const progressPercent = (currentQuestionIndex / MAX_QUESTIONS) * 100;
  const backTo = isGuest ? "/" : "/mi-perfil";
  const backLabel = isGuest ? "Volver" : "Volver";

  const header = (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Link to={backTo} className="inline-flex items-center gap-2 text-sm text-copper">
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </Link>
        <span className="text-sm text-muted-foreground tabular-nums">
          Pregunta {Math.min(currentQuestionIndex, MAX_QUESTIONS)} / {isGuest ? GUEST_MAX_LEVEL : MAX_QUESTIONS}
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

  const handleSubmitAnswer = async (selectedOption: CorrectOption, question: DailyQuizQuestion) => {
    if (isGuest) {
      return { correct: selectedOption === question.correct_option };
    }
    const result = await submitAnswer({ selectedOption, question });
    return { correct: result.correct };
  };

  const handleAdvance = () => {
    if (isGuest && currentQuestionIndex === GUEST_MAX_LEVEL) {
      setGuestFinishedFirstLevel(true);
    } else {
      refetch();
    }
  };

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
        onSubmitAnswer={handleSubmitAnswer}
        onAdvance={handleAdvance}
        header={header}
      />
    </div>
  );
}
