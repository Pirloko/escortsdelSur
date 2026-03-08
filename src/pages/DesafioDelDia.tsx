import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { SeoHead } from "@/components/SeoHead";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveQuizzes, useQuizDayForUser } from "@/hooks/useQuizDay";
import { QuizContainer } from "@/components/quiz";
import { getProgressForQuizzes, resetQuizProgress } from "@/lib/quizService";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle, Heart, Gamepad2, Gift, Ticket, ImageIcon, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CorrectOption, DailyQuizQuestion } from "@/types/quiz";

const MAX_QUESTIONS = 10;
const GUEST_MAX_LEVEL = 1;
const LIVES_INITIAL = 3;

/** Lista de desafíos activos para elegir cuál jugar. */
function DesafioList({
  userId,
  isGuest,
  backTo,
  backLabel,
}: {
  userId: string | undefined;
  isGuest: boolean;
  backTo: string;
  backLabel: string;
}) {
  const navigate = useNavigate();
  const { data: quizzes = [], isLoading } = useActiveQuizzes();
  const quizIds = quizzes.map((q) => q.id);
  const { data: progressMap = {} } = useQuery({
    queryKey: ["quiz-progress-bulk", userId, quizIds],
    queryFn: () => (userId && quizIds.length ? getProgressForQuizzes(userId, quizIds) : Promise.resolve({})),
    enabled: !!userId && quizIds.length > 0,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <span className="text-muted-foreground text-sm">Cargando desafíos…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 pb-24">
      <SeoHead
        title="Desafíos | Punto Cachero"
        description="Elige un desafío y gana tickets para la rifa."
        canonicalPath="/desafio-del-dia"
        robots="noindex, nofollow"
        noSocial
      />
      <Link to={backTo} className="inline-flex items-center gap-2 text-sm text-copper mb-6">
        <ArrowLeft className="w-4 h-4" />
        {backLabel}
      </Link>
      <div className="max-w-md mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-copper/20 flex items-center justify-center text-copper">
            <Gamepad2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Desafíos</h1>
            <p className="text-sm text-muted-foreground">
              Elige un desafío. Cada uno tiene 10 preguntas y premios en tickets.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-copper/40 bg-copper/10 p-4 space-y-3">
          <h2 className="font-semibold text-foreground text-sm flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-copper" />
            ¿De qué va el juego?
          </h2>
          <p className="text-sm text-foreground/90">
            Responde 10 preguntas por desafío. Por cada <strong className="text-copper">acierto</strong> desbloqueas una
            imagen <strong className="text-foreground">exclusiva y caliente</strong> de los perfiles publicados. Más aciertos,
            más fotos para descubrir.
          </p>
          <p className="text-sm text-foreground/90">
            Además, ganas <strong className="text-copper">tickets para la rifa</strong>: 1 por acierto y un bono extra al
            completar el desafío. Cuantos más tickets, más probabilidades de ganar. ¡Juega y participa!
          </p>
          <p className="text-sm font-medium text-foreground pt-1">
            Elige un desafío abajo y empieza a jugar.
          </p>
        </div>

        {quizzes.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-center text-muted-foreground">
            No hay desafíos disponibles ahora.
          </div>
        ) : (
          <ul className="space-y-3">
            {quizzes.map((q) => {
              const progress = progressMap[q.id];
              const completed = progress?.completed ?? false;
              const inProgress = progress && !completed && (progress.current_question > 1 || progress.correct_answers > 0);
              const progressLabel = completed
                ? "Completado"
                : inProgress
                  ? `En progreso · ${Math.min(progress.current_question, 10)}/10`
                  : "No empezado";
              const ticketsBonus = q.tickets_on_complete ?? 10;
              return (
                <li key={q.id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/desafio-del-dia/${q.id}`)}
                    className="w-full rounded-2xl border border-border bg-card p-4 text-left hover:border-copper/50 hover:bg-copper/5 transition-colors flex flex-col sm:flex-row sm:items-center gap-3"
                  >
                    <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-copper/20 flex items-center justify-center text-copper shrink-0">
                        <Gamepad2 className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {q.title?.trim() || `Desafío ${q.date}`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {q.date} · 10 preguntas
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          1 ticket por acierto + {ticketsBonus} al completar
                        </p>
                        <div className="mt-2 flex items-center gap-1.5">
                          {completed ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                              <CheckCircle className="w-3.5 h-3.5" />
                              {progressLabel}
                            </span>
                          ) : inProgress ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-copper">
                              <CircleDot className="w-3.5 h-3.5" />
                              {progressLabel}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">{progressLabel}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="self-end sm:self-center text-sm font-medium text-copper shrink-0">
                      Jugar
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

/** Juego de un desafío concreto (quizId en la URL). */
function DesafioGame({ quizId }: { quizId: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
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
    advanceProgress,
  } = useQuizDayForUser(user?.id ?? undefined, quizId);

  const isGuest = !user;
  const gameOver = lives <= 0;
  const challengeTitle = quiz?.title?.trim() || "Desafío";
  const ticketsOnComplete = quiz?.tickets_on_complete ?? 10;

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
        <Link to="/desafio-del-dia" className="inline-flex items-center gap-2 text-sm text-copper mb-4">
          <ArrowLeft className="w-4 h-4" />
          Volver a los desafíos
        </Link>
        <div className="rounded-2xl border border-border bg-card p-6 text-center text-muted-foreground">
          Este desafío no está disponible.
        </div>
      </div>
    );
  }

  const backToList = (
    <Link to="/desafio-del-dia" className="inline-flex items-center gap-2 text-sm text-copper shrink-0">
      <ArrowLeft className="w-4 h-4" />
      Volver a los desafíos
    </Link>
  );

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-background px-4 py-8 pb-24">
        <SeoHead
          title={`${challengeTitle} | Punto Cachero`}
          description="Responde las preguntas y gana tickets para la rifa."
          canonicalPath={`/desafio-del-dia/${quizId}`}
          robots="noindex, nofollow"
          noSocial
        />
        {backToList}
        <div className="max-w-md mx-auto space-y-6 mt-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-copper/20 flex items-center justify-center text-copper">
              <Gamepad2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">{challengeTitle}</h1>
              <p className="text-sm text-muted-foreground">¿Listo para jugar?</p>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-semibold text-foreground">¿En qué consiste?</h2>
            <p className="text-sm text-muted-foreground">
              Responde {isGuest ? "1 pregunta" : "10 preguntas"}. Cada acierto suma puntos y premios.
              Tienes <strong className="text-foreground">3 vidas</strong>: si respondes mal pierdes una.
            </p>
            <div className="rounded-xl border-2 border-copper/50 bg-copper/15 p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-copper/30 flex items-center justify-center shrink-0 text-copper">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">🔥 Tu recompensa</p>
                <p className="text-sm text-foreground mt-0.5">
                  Por cada <span className="font-semibold text-copper">respuesta correcta</span> descubres una foto. {isGuest ? "1 acierto = 1 foto." : "10 aciertos = 10 fotos."}
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
                1 ticket por cada acierto
              </li>
              {!isGuest && (
                <li className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-copper shrink-0" />
                  +{ticketsOnComplete} tickets al completar las 10 preguntas
                </li>
              )}
              <li className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-copper shrink-0" />
                3 vidas por partida
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

  if (isGuest && guestFinishedFirstLevel) {
    return (
      <div className="min-h-screen bg-background px-4 py-6 pb-24">
        <SeoHead
          title={`${challengeTitle} | Punto Cachero`}
          description="Responde las preguntas y desbloquea la imagen."
          canonicalPath={`/desafio-del-dia/${quizId}`}
          robots="noindex, nofollow"
          noSocial
        />
        {backToList}
        <div className="rounded-2xl border border-copper/30 bg-card p-6 text-center space-y-4 mt-6">
          <p className="text-lg font-medium text-foreground">Has completado 1 nivel</p>
          <p className="text-sm text-muted-foreground">
            Para seguir jugando, ganar tickets y descubrir más fotos, crea una cuenta gratis.
          </p>
          <Button asChild className="w-full rounded-xl bg-copper/90 text-primary-foreground hover:bg-copper">
            <Link to="/registro-cliente">Crear cuenta y seguir jugando</Link>
          </Button>
        </div>
      </div>
    );
  }

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
          title={`${challengeTitle} | Punto Cachero`}
          description={challengeTitle}
          canonicalPath={`/desafio-del-dia/${quizId}`}
          robots="noindex, nofollow"
          noSocial
        />
        {backToList}
        <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-4 mt-6">
          <p className="text-xl font-display font-bold text-foreground">Sin vidas</p>
          <p className="text-sm text-muted-foreground">
            Has perdido las 3 vidas. Pulsa el botón para volver a empezar.
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
        <Link to="/desafio-del-dia" className="inline-flex items-center gap-2 text-sm text-copper shrink-0">
          <ArrowLeft className="w-4 h-4" />
          Volver a los desafíos
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

  const handleAdvance = async () => {
    if (isGuest && currentQuestionIndex === GUEST_MAX_LEVEL) {
      setGuestFinishedFirstLevel(true);
    } else if (!isGuest && advanceProgress) {
      await advanceProgress();
      refetch();
    } else {
      refetch();
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6 pb-24">
      <SeoHead
        title={`${challengeTitle} | Punto Cachero`}
        description="Responde las preguntas y desbloquea la imagen."
        canonicalPath={`/desafio-del-dia/${quizId}`}
        robots="noindex, nofollow"
        noSocial
      />
      <h1 className="text-xl font-display font-bold text-foreground mb-4">{challengeTitle}</h1>
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

export default function DesafioDelDia() {
  const { quizId } = useParams<{ quizId?: string }>();
  const { user } = useAuth();
  const isGuest = !user;
  const backTo = isGuest ? "/" : "/mi-perfil";
  const backLabel = isGuest ? "Volver al inicio" : "Volver al perfil";

  if (quizId) {
    return <DesafioGame quizId={quizId} />;
  }

  return (
    <DesafioList
      userId={user?.id}
      isGuest={isGuest}
      backTo={backTo}
      backLabel={backLabel}
    />
  );
}
