import { supabase } from "@/lib/supabase";
import type { RafflesRow, RafflePrizeStatus } from "@/types/database";

export interface Participant {
  user_id: string;
  tickets: number;
}

/** Rifa activa (solo puede haber una). */
export async function getActiveRaffle(): Promise<RafflesRow | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("raffles")
    .select("*")
    .eq("status", "active")
    .maybeSingle();
  if (error) throw error;
  return data as RafflesRow | null;
}

/** Total de tickets acumulados (solo visitantes con tickets > 0). */
export async function getTotalTicketsAccumulated(): Promise<number> {
  if (!supabase) return 0;
  const { data, error } = await supabase
    .from("profiles")
    .select("tickets_rifa")
    .eq("role", "visitor");
  if (error) throw error;
  const list = (data as { tickets_rifa: number | null }[]) ?? [];
  return list.reduce((sum, p) => sum + Math.max(0, p.tickets_rifa ?? 0), 0);
}

/** Participantes con tickets > 0 (visitantes). Para sorteo ponderado. */
export async function getParticipantsWithTickets(): Promise<Participant[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("profiles")
    .select("id, tickets_rifa")
    .eq("role", "visitor")
    .gt("tickets_rifa", 0);
  if (error) throw error;
  const rows = (data as { id: string; tickets_rifa: number | null }[]) ?? [];
  return rows
    .filter((r) => (r.tickets_rifa ?? 0) > 0)
    .map((r) => ({ user_id: r.id, tickets: r.tickets_rifa ?? 0 }));
}

/** Crear rifa. Falla si ya existe una activa. draw_date en formato YYYY-MM-DD. */
export async function createRaffle(params: {
  title: string;
  description: string;
  month: number;
  year: number;
  draw_date?: string | null;
}): Promise<RafflesRow> {
  if (!supabase) throw new Error("Supabase no disponible");
  const active = await getActiveRaffle();
  if (active) throw new Error("Ya existe una rifa activa. Cierra o ejecuta la actual.");
  const { data, error } = await (supabase as any)
    .from("raffles")
    .insert({
      title: params.title,
      description: params.description,
      month: params.month,
      year: params.year,
      status: "active",
      total_tickets: 0,
      draw_date: params.draw_date || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as RafflesRow;
}

/**
 * Selección ponderada: número aleatorio entre 1 y total,
 * el ganador es el usuario cuyo rango acumulado lo contiene.
 */
function pickWinner(participants: Participant[]): string {
  const total = participants.reduce((s, p) => s + p.tickets, 0);
  if (total <= 0) throw new Error("No hay tickets para sortear");
  let r = Math.random() * total; // [0, total)
  r = Math.floor(r) + 1; // [1, total] entero
  let acc = 0;
  for (const p of participants) {
    acc += p.tickets;
    if (r <= acc) return p.user_id;
  }
  return participants[participants.length - 1].user_id;
}

/**
 * Ejecutar sorteo: snapshot, ganador ponderado, reinicio tickets, premio, cerrar rifa.
 * Solo si hay rifa activa y hay participantes con tickets.
 */
export async function executeRaffleDraw(raffleId: string): Promise<{ winnerUserId: string }> {
  if (!supabase) throw new Error("Supabase no disponible");

  const { data: raffle, error: raffleErr } = await supabase
    .from("raffles")
    .select("*")
    .eq("id", raffleId)
    .eq("status", "active")
    .single();
  if (raffleErr || !raffle) throw new Error("Rifa no encontrada o ya cerrada.");

  const drawDate = (raffle as RafflesRow).draw_date;
  if (drawDate) {
    const today = new Date().toISOString().slice(0, 10);
    if (today < drawDate) {
      throw new Error(`El sorteo está programado para el ${drawDate}. Solo se puede ejecutar en o después de esa fecha.`);
    }
  }

  const participants = await getParticipantsWithTickets();
  if (participants.length === 0) throw new Error("No hay participantes con tickets.");
  const totalTickets = participants.reduce((s, p) => s + p.tickets, 0);
  if (totalTickets <= 0) throw new Error("No hay tickets acumulados.");

  const winnerUserId = pickWinner(participants);

  for (const p of participants) {
    await (supabase as any).from("raffle_participants_snapshot").insert({
      raffle_id: raffleId,
      user_id: p.user_id,
      tickets_used: p.tickets,
    });
  }

  const { error: updateErr } = await (supabase as any)
    .from("profiles")
    .update({ tickets_rifa: 0 })
    .eq("role", "visitor");
  if (updateErr) throw updateErr;

  await (supabase as any).from("raffle_prizes").insert({
    raffle_id: raffleId,
    user_id: winnerUserId,
    status: "pending",
  });

  const { error: closeErr } = await (supabase as any)
    .from("raffles")
    .update({
      winner_user_id: winnerUserId,
      total_tickets: totalTickets,
      status: "closed",
      executed_at: new Date().toISOString(),
    })
    .eq("id", raffleId);
  if (closeErr) throw closeErr;

  return { winnerUserId };
}

/** Última rifa cerrada (para mostrar ganador anterior anonimizado). */
export async function getLastClosedRaffle(): Promise<RafflesRow | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("raffles")
    .select("*")
    .eq("status", "closed")
    .order("executed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as RafflesRow | null;
}

/** Listar rifas para admin (todas o por estado). */
export async function getRafflesList(): Promise<RafflesRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("raffles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as RafflesRow[];
}

/** Premio del usuario (si es ganador de alguna rifa no entregada). */
export async function getMyRafflePrize(userId: string): Promise<{
  raffle: RafflesRow;
  prize: { id: string; status: RafflePrizeStatus };
} | null> {
  if (!supabase) return null;
  const { data: prize, error: prizeErr } = await supabase
    .from("raffle_prizes")
    .select("id, raffle_id, status")
    .eq("user_id", userId)
    .neq("status", "delivered")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (prizeErr || !prize) return null;
  const { data: raffle, error: raffleErr } = await supabase
    .from("raffles")
    .select("*")
    .eq("id", (prize as { raffle_id: string }).raffle_id)
    .single();
  if (raffleErr || !raffle) return null;
  return {
    raffle: raffle as RafflesRow,
    prize: { id: (prize as { id: string }).id, status: (prize as { status: RafflePrizeStatus }).status },
  };
}

/** Marcar premio como entregado (admin). */
export async function markPrizeDelivered(prizeId: string): Promise<void> {
  if (!supabase) throw new Error("Supabase no disponible");
  const { error } = await (supabase as any)
    .from("raffle_prizes")
    .update({ status: "delivered" })
    .eq("id", prizeId);
  if (error) throw error;
}

/** Obtener premio por raffle_id (admin ve ganador y estado). */
export async function getPrizeByRaffleId(raffleId: string): Promise<{ id: string; user_id: string; status: RafflePrizeStatus } | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("raffle_prizes")
    .select("id, user_id, status")
    .eq("raffle_id", raffleId)
    .maybeSingle();
  if (error) throw error;
  return data as { id: string; user_id: string; status: RafflePrizeStatus } | null;
}
