import { useState } from "react";
import { Link } from "react-router-dom";
import { SeoHead } from "@/components/SeoHead";
import { useAuth } from "@/contexts/AuthContext";
import { useQuizDayForUser } from "@/hooks/useQuizDay";
import { QuizContainer } from "@/components/quiz";
import { resetQuizProgress } from "@/lib/quizService";
import { ArrowLeft, Heart, Gamepad2, Gift, Ticket, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CorrectOption, DailyQuizQuestion } from "@/types/quiz";

const MAX_QUESTIONS = 10;
const GUEST_MAX_LEVEL = 1;
const LIVES_INITIAL = 3;

export default function DesafioDelDia() {
  const { user } = useAuth();
  const [gameStarted, setGameStarted] = useState(false);
  const [lives, setLives] = useState(LIVES_INITIAL);
  const [guestFinishedFirstLevel, setGuestFinishedFirstLevel] = useState(false);
  const [resetting, setResetting] = useState(false);

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
  const gameOver = lives <= 0;

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

  // Pantalla de bienvenida: explicación + premios + Iniciar juego
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-background px-4 py-8 pb-24">
        <SeoHead
          title="Desafío del Día | Punto Cachero"
          description="Responde las preguntas del día y gana tickets para la rifa."
          canonicalPath="/desafio-del-dia"
          robots="noindex, nofollow"
          noSocial
        />
        <Link
          to={isGuest ? "/" : "/mi-perfil"}
          className="inline-flex items-center gap-2 text-sm text-copper mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-copper/20 flex items-center justify-center text-copper">
              <Gamepad2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Desafío del Día</h1>
              <p className="text-sm text-muted-foreground">¿Listo para jugar?</p>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-semibold text-foreground">¿En qué consiste?</h2>
            <p className="text-sm text-muted-foreground">
              Responde {isGuest ? "1 pregunta" : "10 preguntas"} del día. Cada acierto suma puntos y premios.
              Tienes <strong className="text-foreground">3 vidas</strong>: si respondes mal pierdes una.
              Si pierdes las 3, tendrás que volver a empezar desde el principio.
            </p>
            <div className="rounded-xl border-2 border-copper/50 bg-copper/15 p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-copper/30 flex items-center justify-center shrink-0 text-copper">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">🔥 Tu recompensa</p>
                <p className="text-sm text-foreground mt-0.5">
                  Por cada <span className="font-semibold text-copper">respuesta correcta</span> descubres una foto explícita y caliente de los perfiles publicados. {isGuest ? "1 acierto = 1 foto." : "10 aciertos = 10 fotos. ¡Juega y descúbrelas!"}
                </p>
              </div>
            </div>
            <h2 className="font-semibold text-foreground flex items-center gap-2 pt-2">
              <Gift className="w-5 h-5 text-copper" />
              Premios
            </h2>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-copper shrink-0" />
                1 ticket para la rifa por cada acierto
              </li>
              {!isGuest && (
                <li className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-copper shrink-0" />
                  +10 tickets extra al completar las 10 preguntas
                </li>
              )}
              <li className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-copper shrink-0" />
                3 vidas por partida — fallar resta 1 vida
              </li>
            </ul>
          </div>
          <Button
            className="w-full h-12 rounded-xl text-base font-semibold bg-copper/90 text-primary-foreground hover:bg-copper"
            onClick={() => setGameStarted(true)}
          >
            Iniciar juego
          </Button>
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
          <p className="text-lg font-medium text-foreground">Has completado 1 nivel</p>
          <p className="text-sm text-muted-foreground">
            Para seguir jugando, ganar tickets para la rifa y <span className="font-medium text-copper">descubrir más fotos exclusivas</span> (1 por cada acierto), crea una cuenta gratis.
          </p>
          <Button asChild className="w-full rounded-xl bg-copper/90 text-primary-foreground hover:bg-copper">
            <Link to="/registro-cliente">Crear cuenta y seguir jugando</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Game over: sin vidas — Volver a empezar
  if (gameOver) {
    const handleRestart = async () => {
      setResetting(true);
      try {
        if (user?.id && quiz?.id) {
          await resetQuizProgress(user.id, quiz.id);
          await refetch();
        }
        setLives(LIVES_INITIAL);
      } finally {
        setResetting(false);
      }
    };

    return (
      <div className="min-h-screen bg-background px-4 py-6 pb-24">
        <SeoHead
          title="Desafío del Día | Punto Cachero"
          description="Desafío del Día."
          canonicalPath="/desafio-del-dia"
          robots="noindex, nofollow"
          noSocial
        />
        <Link
          to={isGuest ? "/" : "/mi-perfil"}
          className="inline-flex items-center gap-2 text-sm text-copper mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
        <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-4">
          <p className="text-xl font-display font-bold text-foreground">Sin vidas</p>
          <p className="text-sm text-muted-foreground">
            Has perdido las 3 vidas. Pulsa el botón para volver a empezar desde la primera pregunta.
          </p>
          <Button
            className="w-full rounded-xl bg-copper/90 text-primary-foreground hover:bg-copper"
            onClick={handleRestart}
            disabled={resetting}
          >
            {resetting ? "Reiniciando…" : "Volver a empezar"}
          </Button>
        </div>
      </div>
    );
  }

  const progressPercent = (currentQuestionIndex / MAX_QUESTIONS) * 100;
  const backTo = isGuest ? "/" : "/mi-perfil";

  const header = (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Link to={backTo} className="inline-flex items-center gap-2 text-sm text-copper shrink-0">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm text-muted-foreground tabular-nums shrink-0">
            Pregunta {Math.min(currentQuestionIndex, MAX_QUESTIONS)} / {isGuest ? GUEST_MAX_LEVEL : MAX_QUESTIONS}
          </span>
          <span className="flex items-center gap-0.5 text-copper shrink-0" aria-label={`${lives} vidas`}>
            {Array.from({ length: LIVES_INITIAL }, (_, i) => (
              <Heart
                key={i}
                className={`w-5 h-5 ${i < lives ? "fill-copper text-copper" : "text-muted-foreground/40"}`}
              />
            ))}
          </span>
        </div>
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
    const result = isGuest
      ? { correct: selectedOption === question.correct_option }
      : await submitAnswer({ selectedOption, question });
    if (!result.correct) {
      setLives((prev) => Math.max(0, prev - 1));
    }
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
