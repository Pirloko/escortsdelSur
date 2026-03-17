/**
 * Insignias semanales: retos por semana (lunes–domingo).
 * Cada insignia completada da tickets 1 vez por semana y suma al nivel.
 */

import { supabase } from "@/lib/supabase";
import type { UserWeeklyBadgeCompletionsRow } from "@/types/database";

/** Clave de la semana actual (lunes en UTC, YYYY-MM-DD). */
export function getWeekKey(date: Date = new Date()): string {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

export const WEEKLY_BADGE_KEYS = [
  "primera_resena",
  "coleccionista",
  "explorador",
  "desafio_completado",
  "comunidad",
  "el_cachero",
] as const;

export type WeeklyBadgeKey = (typeof WEEKLY_BADGE_KEYS)[number];

export interface WeeklyBadgeDefinition {
  key: WeeklyBadgeKey;
  name: string;
  description: string;
  ticketsAwarded: number;
  /** Requisito numérico si aplica (ej. 5 favoritos, 5 visitas, 3 comentarios en 3 perfiles). */
  requirement?: number;
}

export const WEEKLY_BADGE_DEFINITIONS: WeeklyBadgeDefinition[] = [
  { key: "primera_resena", name: "Primera reseña", description: "Deja una reseña verificada en un perfil", ticketsAwarded: 5, requirement: 1 },
  { key: "coleccionista", name: "Coleccionista", description: "Añade 5 perfiles a favoritos", ticketsAwarded: 3, requirement: 5 },
  { key: "explorador", name: "Explorador", description: "Visita 5 perfiles diferentes", ticketsAwarded: 3, requirement: 5 },
  { key: "desafio_completado", name: "Desafío completado", description: "Completa un desafío del día (10 preguntas)", ticketsAwarded: 5, requirement: 1 },
  { key: "comunidad", name: "Comunidad", description: "Deja 3 comentarios en 3 perfiles distintos", ticketsAwarded: 4, requirement: 3 },
  { key: "el_cachero", name: "El Cachero", description: "Escribe o abre WhatsApp con 5 perfiles diferentes", ticketsAwarded: 4, requirement: 5 },
];

/** Completados por el usuario esta semana (desde BD). */
export async function getWeeklyCompletions(
  userId: string
): Promise<UserWeeklyBadgeCompletionsRow[]> {
  if (!supabase) return [];
  const weekKey = getWeekKey();
  const { data, error } = await supabase
    .from("user_weekly_badge_completions")
    .select("*")
    .eq("user_id", userId)
    .eq("week_key", weekKey);
  if (error) return [];
  return (data ?? []) as UserWeeklyBadgeCompletionsRow[];
}

/** Registrar completado y otorgar tickets (1 vez por semana por badge). */
export async function awardWeeklyBadge(
  userId: string,
  badgeKey: WeeklyBadgeKey
): Promise<{ awarded: boolean; error?: string }> {
  if (!supabase) return { awarded: false, error: "Sin Supabase" };
  const weekKey = getWeekKey();
  const def = WEEKLY_BADGE_DEFINITIONS.find((d) => d.key === badgeKey);
  if (!def) return { awarded: false, error: "Badge desconocido" };

  const { data: existing } = await supabase
    .from("user_weekly_badge_completions")
    .select("id")
    .eq("user_id", userId)
    .eq("week_key", weekKey)
    .eq("badge_key", badgeKey)
    .maybeSingle();

  if (existing) return { awarded: false };

  const { error: insertErr } = await (supabase as any)
    .from("user_weekly_badge_completions")
    .insert({
      user_id: userId,
      week_key: weekKey,
      badge_key: badgeKey,
      tickets_awarded: def.ticketsAwarded,
    });

  if (insertErr) return { awarded: false, error: insertErr.message };

  const { data: profile } = await supabase
    .from("profiles")
    .select("tickets_rifa")
    .eq("id", userId)
    .single();
  const current = (profile as { tickets_rifa?: number } | null)?.tickets_rifa ?? 0;
  const { error: updateErr } = await (supabase as any)
    .from("profiles")
    .update({
      tickets_rifa: current + def.ticketsAwarded,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (updateErr) return { awarded: true, error: updateErr.message };
  return { awarded: true };
}

/** Inicio y fin de la semana actual (UTC). */
function getWeekBounds(): { start: string; end: string } {
  const weekKey = getWeekKey();
  const start = `${weekKey}T00:00:00.000Z`;
  const endDate = new Date(start);
  endDate.setUTCDate(endDate.getUTCDate() + 7);
  const end = endDate.toISOString().slice(0, 19) + "Z";
  return { start, end };
}

/** Comprueba si el usuario cumple cada reto esta semana y otorga badge + tickets si aplica (1 vez por semana). */
export async function checkAndAwardWeeklyBadges(userId: string): Promise<{ awarded: WeeklyBadgeKey[] }> {
  const awarded: WeeklyBadgeKey[] = [];
  if (!supabase) return { awarded };

  const [completions, favoritesCount, viewsCount, reviewsThisWeek, quizCompletedThisWeek, commentsByProfile, whatsappClicksThisWeek] = await Promise.all([
    getWeeklyCompletions(userId),
    supabase.from("favorites").select("id", { count: "exact", head: true }).eq("user_id", userId).then((r) => r.count ?? 0),
    supabase.from("profile_views").select("escort_profile_id").eq("user_id", userId).then((r) => {
      const rows = (r.data ?? []) as { escort_profile_id: string }[];
      return new Set(rows.map((x) => x.escort_profile_id)).size;
    }),
    (() => {
      const { start, end } = getWeekBounds();
      return supabase
        .from("review_experiences")
        .select("id")
        .eq("user_id", userId)
        .gte("created_at", start)
        .lt("created_at", end)
        .then((r) => (r.data ?? []).length);
    })(),
    (() => {
      const { start, end } = getWeekBounds();
      return supabase
        .from("user_quiz_progress")
        .select("id")
        .eq("user_id", userId)
        .not("completed_at", "is", null)
        .gte("completed_at", start)
        .lt("completed_at", end)
        .then((r) => (r.data ?? []).length);
    })(),
    supabase
      .from("profile_comments")
      .select("escort_profile_id")
      .eq("user_id", userId)
      .then((r) => {
        const rows = (r.data ?? []) as { escort_profile_id: string }[];
        return new Set(rows.map((x) => x.escort_profile_id)).size;
      }),
    (() => {
      const { start, end } = getWeekBounds();
      return supabase
        .from("profile_whatsapp_clicks")
        .select("id")
        .eq("user_id", userId)
        .gte("created_at", start)
        .lt("created_at", end)
        .then((r) => (r.data ?? []).length);
    })(),
  ]);

  const completedKeys = new Set(completions.map((c) => c.badge_key as WeeklyBadgeKey));

  if (!completedKeys.has("primera_resena") && reviewsThisWeek >= 1) {
    const r = await awardWeeklyBadge(userId, "primera_resena");
    if (r.awarded) awarded.push("primera_resena");
  }
  if (!completedKeys.has("coleccionista") && favoritesCount >= 5) {
    const r = await awardWeeklyBadge(userId, "coleccionista");
    if (r.awarded) awarded.push("coleccionista");
  }
  if (!completedKeys.has("explorador") && viewsCount >= 5) {
    const r = await awardWeeklyBadge(userId, "explorador");
    if (r.awarded) awarded.push("explorador");
  }
  if (!completedKeys.has("desafio_completado") && quizCompletedThisWeek >= 1) {
    const r = await awardWeeklyBadge(userId, "desafio_completado");
    if (r.awarded) awarded.push("desafio_completado");
  }
  if (!completedKeys.has("comunidad") && commentsByProfile >= 3) {
    const r = await awardWeeklyBadge(userId, "comunidad");
    if (r.awarded) awarded.push("comunidad");
  }
  if (!completedKeys.has("el_cachero") && whatsappClicksThisWeek >= 5) {
    const r = await awardWeeklyBadge(userId, "el_cachero");
    if (r.awarded) awarded.push("el_cachero");
  }

  return { awarded };
}

/** Progreso actual por badge (para la UI). */
export interface WeeklyBadgeProgress {
  key: WeeklyBadgeKey;
  completed: boolean;
  current: number;
  required: number;
  ticketsAwarded: number;
}

export async function getWeeklyBadgeProgress(userId: string): Promise<WeeklyBadgeProgress[]> {
  if (!supabase) return WEEKLY_BADGE_DEFINITIONS.map((d) => ({
    key: d.key,
    completed: false,
    current: 0,
    required: d.requirement ?? 1,
    ticketsAwarded: d.ticketsAwarded,
  }));

  const [completions, favoritesCount, viewsCount, reviewsThisWeek, quizCompletedThisWeek, commentsByProfile, whatsappClicksThisWeek] = await Promise.all([
    getWeeklyCompletions(userId),
    supabase.from("favorites").select("id", { count: "exact", head: true }).eq("user_id", userId).then((r) => r.count ?? 0),
    supabase.from("profile_views").select("escort_profile_id").eq("user_id", userId).then((r) => {
      const rows = (r.data ?? []) as { escort_profile_id: string }[];
      return new Set(rows.map((x) => x.escort_profile_id)).size;
    }),
    (() => {
      const { start, end } = getWeekBounds();
      return supabase.from("review_experiences").select("id").eq("user_id", userId).gte("created_at", start).lt("created_at", end).then((r) => (r.data ?? []).length);
    })(),
    (() => {
      const { start, end } = getWeekBounds();
      return supabase.from("user_quiz_progress").select("id").eq("user_id", userId).not("completed_at", "is", null).gte("completed_at", start).lt("completed_at", end).then((r) => (r.data ?? []).length);
    })(),
    supabase.from("profile_comments").select("escort_profile_id").eq("user_id", userId).then((r) => {
      const rows = (r.data ?? []) as { escort_profile_id: string }[];
      return new Set(rows.map((x) => x.escort_profile_id)).size;
    }),
    (() => {
      const { start, end } = getWeekBounds();
      return supabase
        .from("profile_whatsapp_clicks")
        .select("id")
        .eq("user_id", userId)
        .gte("created_at", start)
        .lt("created_at", end)
        .then((r) => (r.data ?? []).length);
    })(),
  ]);

  const completedSet = new Set(completions.map((c) => c.badge_key));

  const currentByKey: Record<WeeklyBadgeKey, number> = {
    primera_resena: reviewsThisWeek,
    coleccionista: favoritesCount,
    explorador: viewsCount,
    desafio_completado: quizCompletedThisWeek,
    comunidad: commentsByProfile,
    el_cachero: whatsappClicksThisWeek,
  };

  return WEEKLY_BADGE_DEFINITIONS.map((d) => ({
    key: d.key,
    completed: completedSet.has(d.key),
    current: currentByKey[d.key] ?? 0,
    required: d.requirement ?? 1,
    ticketsAwarded: d.ticketsAwarded,
  }));
}
