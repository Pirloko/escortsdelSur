import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { getActiveRaffle, getTotalTicketsAccumulated } from "@/lib/raffleService";
import type { RafflesRow } from "@/types/database";

export interface UseRaffleHighlightResult {
  activeRaffle: RafflesRow | null;
  totalTickets: number;
  userTickets: number | null;
  isLoading: boolean;
}

/** Rifa activa, total de tickets globales y tickets del usuario (si está logueado). */
export function useRaffleHighlight(): UseRaffleHighlightResult {
  const { user } = useAuth();

  const { data: activeRaffle = null, isLoading: loadingRaffle } = useQuery({
    queryKey: ["raffle-active"],
    queryFn: getActiveRaffle,
  });

  const { data: totalTickets = 0, isLoading: loadingTotal } = useQuery({
    queryKey: ["raffle-total-tickets", activeRaffle?.id],
    queryFn: getTotalTicketsAccumulated,
    enabled: !!activeRaffle?.id,
  });

  const { data: userTicketsRow } = useQuery({
    queryKey: ["raffle-user-tickets", user?.id],
    queryFn: async (): Promise<number> => {
      if (!supabase || !user?.id) return 0;
      const { data } = await supabase
        .from("profiles")
        .select("tickets_rifa")
        .eq("id", user.id)
        .single();
      const row = data as { tickets_rifa: number | null } | null;
      return row ? Math.max(0, row.tickets_rifa ?? 0) : 0;
    },
    enabled: !!user?.id,
  });

  const userTickets = user ? (userTicketsRow ?? 0) : null;

  return {
    activeRaffle,
    totalTickets,
    userTickets,
    isLoading: loadingRaffle || (!!activeRaffle && loadingTotal),
  };
}
