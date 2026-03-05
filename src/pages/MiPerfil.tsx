import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SeoHead } from "@/components/SeoHead";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProfileCard } from "@/components/ProfileCard";
import {
  LevelProgress,
  UserEconomyCard,
  QuizStatusCard,
  BadgesGrid,
  StreakCard,
} from "@/components/gamification";
import { RaffleTicketsCard } from "@/components/RaffleTicketsCard";
import { useQuizDayForUser } from "@/hooks/useQuizDay";
import { getMyRafflePrize } from "@/lib/raffleService";
import { getRaffleClaimWhatsAppUrl } from "@/lib/raffleConfig";
import { addWatermarkToImageFileAsFile } from "@/lib/watermark";
import type { UserProgress, UserBadge } from "@/types/gamification";
import { LogOut, Trash2, Heart, MessageSquare, Eye, Pencil, Gift, ExternalLink } from "lucide-react";

/** Dado un array de ISO dates (completed_at), devuelve la racha máxima y la fecha en que se alcanzaron 7 días seguidos. */
function computeStreakSeven(completedAts: string[]): { maxStreak: number; firstSevenAt: string | null } {
  const dates = [...new Set(completedAts.map((d) => d.slice(0, 10)))].sort();
  let maxStreak = dates.length > 0 ? 1 : 0;
  let run = 1;
  let firstSevenAt: string | null = null;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1] + "Z");
    prev.setUTCDate(prev.getUTCDate() + 1);
    const nextDay = prev.toISOString().slice(0, 10);
    if (nextDay === dates[i]) {
      run++;
      if (run >= 7 && firstSevenAt == null) firstSevenAt = dates[i];
    } else {
      run = 1;
    }
    if (run > maxStreak) maxStreak = run;
  }
  return { maxStreak, firstSevenAt };
}

/** Niveles 1-5 según puntos (pepitas, tickets, comentarios, quizzes completados). */
const LEVEL_LABELS = ["", "Principiante", "Explorador", "Avanzado", "Experto", "Maestro"] as const;
function computeLevel(
  pepitas: number,
  tickets: number,
  commentsCount: number,
  completedQuizCount: number
): { level: number; levelLabel: string; points: number; pointsInLevel: number; pointsToNextLevel: number } {
  const points = pepitas + tickets * 2 + commentsCount * 5 + completedQuizCount * 20;
  const level = Math.min(5, 1 + Math.floor(points / 50));
  const pointsInLevel = points % 50;
  const pointsToNextLevel = level >= 5 ? 0 : 50 - pointsInLevel;
  return {
    level,
    levelLabel: LEVEL_LABELS[level] ?? "Maestro",
    points,
    pointsInLevel,
    pointsToNextLevel,
  };
}

/** Definiciones base de insignias. El unlocked/unlockedAt se calcula con datos reales. */
const RAFFLE_MONTHS = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const BADGE_DEFINITIONS: Pick<UserBadge, "id" | "key" | "name" | "icon">[] = [
  { id: "1", key: "first_comment", name: "Primer comentario", icon: "message" },
  { id: "2", key: "ten_comments", name: "10 comentarios", icon: "message" },
  { id: "3", key: "quiz_completed", name: "Desafío completado", icon: "puzzle" },
  { id: "4", key: "seven_day_streak", name: "7 días consecutivos", icon: "flame" },
  { id: "5", key: "level_five", name: "Nivel 5", icon: "star" },
];

type FavoriteWithProfile = {
  id: string;
  escort_profile_id: string;
  escort_profiles: {
    id: string;
    name: string;
    age: number;
    badge: string | null;
    image: string | null;
    available: boolean;
    cities: { name: string } | null;
  } | null;
};

type CommentWithProfile = {
  id: string;
  body: string;
  created_at: string;
  escort_profile_id: string;
  escort_profiles: { id: string; name: string; cities: { slug: string; name: string } | null } | null;
};

type ViewWithProfile = {
  id: string;
  viewed_at: string;
  escort_profile_id: string;
  escort_profiles: {
    id: string;
    name: string;
    age: number;
    badge: string | null;
    image: string | null;
    available: boolean;
    cities: { slug: string; name: string } | null;
  } | null;
};

export default function MiPerfil() {
  const { user, profile, role, isLoading, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const quizState = useQuizDayForUser(user?.id ?? undefined);

  const { data: myRafflePrize } = useQuery({
    queryKey: ["my-raffle-prize", user?.id],
    queryFn: () => (user?.id ? getMyRafflePrize(user.id) : Promise.resolve(null)),
    enabled: !!user?.id && role === "visitor",
  });

  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [favorites, setFavorites] = useState<FavoriteWithProfile[]>([]);
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [views, setViews] = useState<ViewWithProfile[]>([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [profileEconomy, setProfileEconomy] = useState<{ pepitas_cobre: number; tickets_rifa: number } | null>(null);
  const [quizCompletedAt, setQuizCompletedAt] = useState<string | null>(null);
  const [streakSevenUnlockedAt, setStreakSevenUnlockedAt] = useState<string | null>(null);
  const [completedQuizCount, setCompletedQuizCount] = useState(0);
  const [progress] = useState<UserProgress>(() => ({
    stats: {
      level: 2,
      levelLabel: "Explorador",
      currentXp: 80,
      xpToNextLevel: 100,
      pepitas: 0,
      ticketsRifa: 0,
      streakDays: 0,
      lastActivityDate: null,
    },
    badges: BADGE_DEFINITIONS.map((b) => ({ ...b, unlocked: false, unlockedAt: null as string | null })),
    quizLevel: 1,
    quizMaxLevel: 10,
    quizCompletedToday: false,
    quizTicketsEarnedToday: 0,
  }));

  /** Bloque 1: insignias de comentarios (Primer comentario, 10 comentarios) */
  const badgesComputed = ((): UserBadge[] => {
    const byCreatedAsc = [...comments].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const firstAt = byCreatedAsc[0]?.created_at ?? null;
    const tenthAt = byCreatedAsc[9]?.created_at ?? null;
    return BADGE_DEFINITIONS.map((def) => {
      if (def.key === "first_comment") {
        return { ...def, unlocked: comments.length >= 1, unlockedAt: firstAt };
      }
      if (def.key === "ten_comments") {
        return { ...def, unlocked: comments.length >= 10, unlockedAt: tenthAt };
      }
      if (def.key === "quiz_completed") {
        return { ...def, unlocked: quizCompletedAt != null, unlockedAt: quizCompletedAt };
      }
      if (def.key === "seven_day_streak") {
        return { ...def, unlocked: streakSevenUnlockedAt != null, unlockedAt: streakSevenUnlockedAt };
      }
      if (def.key === "level_five") {
        const lvl = computeLevel(
          profileEconomy?.pepitas_cobre ?? 0,
          profileEconomy?.tickets_rifa ?? 0,
          comments.length,
          completedQuizCount
        );
        return { ...def, unlocked: lvl.level >= 5, unlockedAt: null };
      }
      return { ...def, unlocked: false, unlockedAt: null };
    });
  })();

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
      setAge(profile.age != null ? String(profile.age) : "");
      setAvatarUrl(profile.avatar_url ?? "");
    }
  }, [profile]);

  useEffect(() => {
    if (!supabase || !user?.id || role !== "visitor") return;
    supabase
      .from("profiles")
      .select("pepitas_cobre, tickets_rifa")
      .eq("id", user.id)
      .single()
      .then(({ data }) => setProfileEconomy(data as { pepitas_cobre: number; tickets_rifa: number } | null));
  }, [user?.id, role]);

  useEffect(() => {
    if (!supabase || !user?.id || role !== "visitor") return;
    supabase
      .from("user_quiz_progress")
      .select("completed_at")
      .eq("user_id", user.id)
      .eq("completed", true)
      .order("completed_at", { ascending: true })
      .limit(1)
      .then(({ data }) => {
        const row = (data as { completed_at: string }[] | null)?.[0];
        setQuizCompletedAt(row?.completed_at ?? null);
      });
  }, [user?.id, role]);

  useEffect(() => {
    if (!supabase || !user?.id || role !== "visitor") return;
    supabase
      .from("user_quiz_progress")
      .select("completed_at")
      .eq("user_id", user.id)
      .eq("completed", true)
      .then(({ data }) => {
        const list = (data as { completed_at: string }[]) ?? [];
        const { firstSevenAt } = computeStreakSeven(list.map((r) => r.completed_at));
        setStreakSevenUnlockedAt(firstSevenAt);
        setCompletedQuizCount(list.length);
      });
  }, [user?.id, role]);

  useEffect(() => {
    if (!supabase || !user?.id || role !== "visitor") return;
    supabase
      .from("favorites")
      .select("id, escort_profile_id, escort_profiles(id, name, age, badge, image, available, cities(name))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setFavorites((data as FavoriteWithProfile[]) ?? []));
  }, [user?.id, role]);

  useEffect(() => {
    if (!supabase || !user?.id || role !== "visitor") return;
    supabase
      .from("profile_comments")
      .select("id, body, created_at, escort_profile_id, escort_profiles(id, name, cities(slug, name))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setComments((data as CommentWithProfile[]) ?? []));
  }, [user?.id, role]);

  useEffect(() => {
    if (!supabase || !user?.id || role !== "visitor") return;
    supabase
      .from("profile_views")
      .select("id, viewed_at, escort_profile_id, escort_profiles(id, name, age, badge, image, available, cities(slug, name))")
      .eq("user_id", user.id)
      .order("viewed_at", { ascending: false })
      .then(({ data }) => setViews((data as ViewWithProfile[]) ?? []));
  }, [user?.id, role]);

  if (isLoading || !user) return null;
  if (role !== "visitor") {
    if (role === "admin") return <Link to="/admin">Ir al panel admin</Link>;
    if (role === "registered_user") return <Link to="/cuenta">Editar mi perfil público</Link>;
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !supabase || !user?.id) return;
    setAvatarError("");
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setAvatarError("Formato no permitido. Usa JPG, PNG, WebP o GIF.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Máximo 2 MB.");
      return;
    }
    setUploadingAvatar(true);
    try {
      const fileWithWatermark = await addWatermarkToImageFileAsFile(file);
      const ext = fileWithWatermark.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/avatar.${ext}`;
      const { error } = await supabase.storage.from("avatars").upload(path, fileWithWatermark, {
        cacheControl: "3600",
        upsert: true,
      });
      if (error) {
        setAvatarError(error.message || "Error al subir");
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarUrl(publicUrl);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("profiles") as any)
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq("id", user.id);
      refreshProfile();
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Error al aplicar marca de agua");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setSaving(true);
    setMessage("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("profiles") as any)
      .update({
        display_name: displayName.trim() || null,
        age: age.trim() ? parseInt(age, 10) : null,
        avatar_url: avatarUrl.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) setMessage(error.message);
    else {
      setMessage("Guardado.");
      setEditingProfile(false);
      refreshProfile();
    }
  };

  const removeFavorite = async (escortProfileId: string) => {
    if (!supabase || !user?.id) return;
    await supabase.from("favorites").delete().eq("user_id", user.id).eq("escort_profile_id", escortProfileId);
    setFavorites((prev) => prev.filter((f) => f.escort_profile_id !== escortProfileId));
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    setDeleting(true);
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!supabaseUrl || !token) {
      setDeleting(false);
      setDeleteDialogOpen(false);
      return;
    }
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/delete-account`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setDeleting(false);
        setDeleteDialogOpen(false);
        setMessage(data.error || "Error al eliminar la cuenta");
        return;
      }
      await signOut();
      navigate("/", { replace: true });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const pepitas = profileEconomy?.pepitas_cobre ?? progress.stats.pepitas;
  const ticketsRifa = profileEconomy?.tickets_rifa ?? progress.stats.ticketsRifa;
  const levelInfo = computeLevel(pepitas, ticketsRifa, comments.length, completedQuizCount);
  const quizLevel = quizState.progress ? Math.min(quizState.currentQuestionIndex, 10) : 1;
  const quizCompletedToday = quizState.isCompleted ?? false;
  const quizTicketsEarnedToday = quizState.ticketsEarnedToday ?? 0;

  const favoriteProfiles = favorites
    .filter((f) => f.escort_profiles)
    .map((f) => ({
      id: f.escort_profiles!.id,
      name: f.escort_profiles!.name,
      age: f.escort_profiles!.age,
      city: f.escort_profiles!.cities?.name ?? "",
      badge: f.escort_profiles!.badge ?? "Perfil",
      image: f.escort_profiles!.image ?? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
      available: f.escort_profiles!.available,
    }));

  const progressWithEconomy: UserProgress = {
    ...progress,
    stats: {
      ...progress.stats,
      level: levelInfo.level,
      levelLabel: levelInfo.levelLabel,
      currentXp: levelInfo.pointsInLevel,
      xpToNextLevel: levelInfo.pointsToNextLevel || 50,
      pepitas,
      ticketsRifa,
    },
    badges: badgesComputed,
    quizLevel,
    quizMaxLevel: 10,
    quizCompletedToday,
    quizTicketsEarnedToday,
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 pb-28">
      <SeoHead title="Mi perfil | Punto Cachero" description="Perfil de cliente." canonicalPath="/mi-perfil" robots="noindex, nofollow" noSocial />
      <div className="max-w-md mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold">Mi perfil</h1>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => signOut()}>
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Cuenta de cliente. Aquí puedes editar tu nombre, foto, ver favoritos y el desafío del día.
        </p>

        {myRafflePrize && myRafflePrize.prize.status !== "delivered" && (
          <section className="rounded-2xl border-2 border-copper/50 bg-copper/10 p-6 space-y-4">
            <h2 className="text-lg font-display font-bold flex items-center gap-2 text-copper">
              <Gift className="w-5 h-5" />
              ¡Ganaste el sorteo de {RAFFLE_MONTHS[myRafflePrize.raffle.month]} {myRafflePrize.raffle.year}!
            </h2>
            <p className="text-sm text-muted-foreground">{myRafflePrize.raffle.description}</p>
            <a
              href={getRaffleClaimWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              Cobrar premio
            </a>
          </section>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center gap-3">
            <Avatar className="h-28 w-28">
              <AvatarImage src={avatarUrl || undefined} alt={displayName || "Avatar"} />
              <AvatarFallback className="bg-copper/20 text-copper text-3xl">
                {(displayName || user.email)?.[0]?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center gap-1">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  disabled={uploadingAvatar}
                  onChange={handleAvatarUpload}
                />
                <span className="inline-flex items-center justify-center rounded-xl text-sm font-medium bg-copper/90 text-primary-foreground hover:bg-copper h-9 px-4">
                  {uploadingAvatar ? "Subiendo…" : "Subir foto de perfil"}
                </span>
              </label>
              <span className="text-xs text-muted-foreground">JPG, PNG o WebP. Máx. 2 MB.</span>
              {avatarError && <p className="text-sm text-destructive">{avatarError}</p>}
            </div>
          </div>
          {message && (
            <p className={`text-sm ${message === "Guardado." ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
              {message}
            </p>
          )}
          {editingProfile ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="display_name">Nombre de usuario</Label>
                <Input
                  id="display_name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-surface border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Edad</Label>
                <Input
                  id="age"
                  type="number"
                  min={18}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="bg-surface border-border"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 h-11 rounded-2xl bg-copper/90 text-primary-foreground hover:bg-copper" disabled={saving}>
                  {saving ? "Guardando…" : "Guardar"}
                </Button>
                <Button type="button" variant="outline" className="h-11 rounded-2xl" onClick={() => setEditingProfile(false)}>
                  Cancelar
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Nombre de usuario</p>
                <p className="text-base font-medium">{displayName || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Edad</p>
                <p className="text-base font-medium">{age || "—"}</p>
              </div>
              <Button type="button" className="w-full h-11 rounded-2xl bg-copper/90 text-primary-foreground hover:bg-copper gap-2" onClick={() => setEditingProfile(true)}>
                <Pencil className="w-4 h-4" />
                Editar
              </Button>
            </div>
          )}
        </form>

        {/* Panel gamificado */}
        <section className="space-y-4">
          <LevelProgress
            level={progressWithEconomy.stats.level}
            levelLabel={progressWithEconomy.stats.levelLabel}
            currentXp={progressWithEconomy.stats.currentXp}
            xpToNextLevel={progressWithEconomy.stats.xpToNextLevel}
          />
          <UserEconomyCard pepitas={progressWithEconomy.stats.pepitas} ticketsRifa={progressWithEconomy.stats.ticketsRifa} />
          <RaffleTicketsCard ticketsRifa={progressWithEconomy.stats.ticketsRifa} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <QuizStatusCard
              level={progressWithEconomy.quizLevel}
              maxLevel={progressWithEconomy.quizMaxLevel}
              completedToday={progressWithEconomy.quizCompletedToday}
              ticketsEarnedToday={progressWithEconomy.quizTicketsEarnedToday}
              onPlay={() => navigate("/desafio-del-dia")}
            />
            <StreakCard streakDays={progressWithEconomy.stats.streakDays} />
          </div>
          <BadgesGrid badges={progressWithEconomy.badges} />
        </section>

        <section>
          <h2 className="text-lg font-display font-bold flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-copper" />
            Mis favoritos
          </h2>
          {favoriteProfiles.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no tienes favoritos. En un perfil, pulsa &quot;Agregar a favoritos&quot; para guardarlo aquí.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {favoriteProfiles.map((p) => (
                <div key={p.id} className="relative group">
                  <ProfileCard profile={p} />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      removeFavorite(p.id);
                    }}
                    className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center text-destructive hover:bg-destructive/20"
                    aria-label="Quitar de favoritos"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-display font-bold flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5 text-copper" />
            Historial de comentarios
          </h2>
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no has dejado comentarios. Puedes dejar uno por día en cada perfil que visites.
            </p>
          ) : (
            <ul className="space-y-3">
              {comments.map((c) => (
                <li key={c.id} className="p-3 rounded-xl bg-muted/50 border border-border">
                  <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-3">{c.body}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(c.created_at).toLocaleDateString("es-CL", { dateStyle: "medium" })}
                    {c.escort_profiles && (
                      <>
                        {" · "}
                        <Link to={`/perfil/${c.escort_profile_id}`} className="text-copper hover:underline">
                          {c.escort_profiles.name} → Ver perfil
                        </Link>
                      </>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-lg font-display font-bold flex items-center gap-2 mb-3">
            <Eye className="w-5 h-5 text-copper" />
            Escorts que has visualizado
          </h2>
          {views.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Cuando entres a un perfil, aparecerá aquí para que puedas volver a verlo.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {views
                .filter((v) => v.escort_profiles)
                .map((v) => ({
                  id: v.escort_profiles!.id,
                  name: v.escort_profiles!.name,
                  age: v.escort_profiles!.age,
                  city: v.escort_profiles!.cities?.name ?? "",
                  badge: v.escort_profiles!.badge ?? "Perfil",
                  image: v.escort_profiles!.image ?? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
                  available: v.escort_profiles!.available,
                }))
                .map((p) => (
                  <ProfileCard key={p.id} profile={p} />
                ))}
            </div>
          )}
        </section>

        <div className="space-y-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            className="w-full h-11 rounded-2xl border-destructive text-destructive hover:bg-destructive/10 gap-2"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="w-4 h-4" />
            Eliminar mi cuenta
          </Button>
          <p className="text-center">
            <Link to="/" className="text-sm text-copper hover:underline">← Volver al inicio</Link>
          </p>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tu cuenta?</AlertDialogTitle>
            <AlertDialogDescription>
              Se borrarán tus datos y favoritos. No podrás recuperar la cuenta. ¿Continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteAccount();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
            >
              {deleting ? "Eliminando…" : "Eliminar cuenta"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
