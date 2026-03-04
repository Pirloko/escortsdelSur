import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getActiveRaffle,
  getTotalTicketsAccumulated,
  createRaffle,
  executeRaffleDraw,
  getRafflesList,
  getPrizeByRaffleId,
  markPrizeDelivered,
} from "@/lib/raffleService";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { RafflesRow } from "@/types/database";
import { Gift, Plus, Trash2 } from "lucide-react";

const MONTHS = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export default function AdminRaffle() {
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("1 hora de servicio exclusivo con el perfil que elijas.");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [message, setMessage] = useState("");
  const [confirmDrawOpen, setConfirmDrawOpen] = useState(false);
  const [raffleToExecute, setRaffleToExecute] = useState<RafflesRow | null>(null);

  const { data: activeRaffle, isLoading: loadingActive } = useQuery({
    queryKey: ["raffle-active"],
    queryFn: getActiveRaffle,
  });

  const { data: totalTickets = 0 } = useQuery({
    queryKey: ["raffle-total-tickets"],
    queryFn: getTotalTicketsAccumulated,
    enabled: !!activeRaffle,
  });

  const { data: rafflesList = [], isLoading: loadingList } = useQuery({
    queryKey: ["raffles-list"],
    queryFn: getRafflesList,
  });

  const createMutation = useMutation({
    mutationFn: () => createRaffle({ title, description, month, year }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["raffle-active"] });
      queryClient.invalidateQueries({ queryKey: ["raffles-list"] });
      setCreating(false);
      setTitle("");
      setDescription("1 hora de servicio exclusivo con el perfil que elijas.");
      setMonth(new Date().getMonth() + 1);
      setYear(new Date().getFullYear());
      setMessage("Rifa creada.");
    },
    onError: (e: Error) => setMessage(e.message || "Error"),
  });

  const executeMutation = useMutation({
    mutationFn: (id: string) => executeRaffleDraw(id),
    onSuccess: () => {
      setConfirmDrawOpen(false);
      setRaffleToExecute(null);
      queryClient.invalidateQueries({ queryKey: ["raffle-active"] });
      queryClient.invalidateQueries({ queryKey: ["raffles-list"] });
      queryClient.invalidateQueries({ queryKey: ["raffle-total-tickets"] });
      setMessage("Sorteo ejecutado. Tickets reiniciados a 0.");
    },
    onError: (e: Error) => {
      setMessage(e.message || "Error al ejecutar sorteo.");
    },
  });

  const deliverMutation = useMutation({
    mutationFn: markPrizeDelivered,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["raffles-list"] });
      setMessage("Premio marcado como entregado.");
    },
    onError: (e: Error) => setMessage(e.message || "Error"),
  });

  const handleOpenConfirmDraw = (r: RafflesRow) => {
    setRaffleToExecute(r);
    setConfirmDrawOpen(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold flex items-center gap-2">
        <Gift className="w-6 h-6 text-copper" />
        Gestión de Rifa
      </h1>
      <p className="text-muted-foreground">
        Rifa mensual con premio físico. Crear rifa, ejecutar sorteo (ponderado por tickets) y marcar premio entregado.
      </p>

      {message && (
        <p className={message.startsWith("Error") ? "text-sm text-destructive" : "text-sm text-green-600 dark:text-green-400"}>
          {message}
        </p>
      )}

      {!creating ? (
        <>
          {!activeRaffle && (
            <Button onClick={() => setCreating(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Crear nueva rifa
            </Button>
          )}

          {activeRaffle && (
            <div className="rounded-2xl border border-copper/30 bg-card p-6 space-y-4">
              <h2 className="font-semibold text-lg">Rifa activa</h2>
              <p><strong>{activeRaffle.title}</strong></p>
              <p className="text-sm text-muted-foreground">{activeRaffle.description}</p>
              <p className="text-sm">
                {MONTHS[activeRaffle.month]} {activeRaffle.year}
              </p>
              <p className="text-copper font-medium">Total tickets acumulados: {totalTickets}</p>
              <Button
                onClick={() => handleOpenConfirmDraw(activeRaffle)}
                disabled={totalTickets === 0 || executeMutation.isPending}
                className="bg-copper text-primary-foreground hover:bg-copper/90"
              >
                {executeMutation.isPending ? "Ejecutando…" : "Realizar sorteo"}
              </Button>
              {totalTickets === 0 && (
                <p className="text-sm text-muted-foreground">No hay tickets acumulados. No se puede ejecutar el sorteo.</p>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-3 font-medium">Título</th>
                  <th className="text-left p-3 font-medium">Mes/Año</th>
                  <th className="text-left p-3 font-medium">Estado</th>
                  <th className="text-left p-3 font-medium">Ganador</th>
                  <th className="p-3 font-medium">Premio</th>
                </tr>
              </thead>
              <tbody>
                {loadingList ? (
                  <tr><td colSpan={5} className="p-4 text-muted-foreground">Cargando…</td></tr>
                ) : rafflesList.length === 0 ? (
                  <tr><td colSpan={5} className="p-4 text-muted-foreground">No hay rifas.</td></tr>
                ) : (
                  rafflesList.map((r) => (
                    <RaffleRow
                      key={r.id}
                      raffle={r}
                      onMarkDelivered={(prizeId) => deliverMutation.mutate(prizeId)}
                      isDelivering={deliverMutation.isPending}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4 max-w-md">
          <h2 className="font-semibold">Nueva rifa</h2>
          <div>
            <Label>Título (ej. Sorteo Marzo 2026)</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sorteo Marzo 2026" className="mt-1" />
          </div>
          <div>
            <Label>Descripción del premio</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="1 hora de servicio exclusivo con el perfil que elijas."
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Mes</Label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {MONTHS.slice(1).map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Año</Label>
              <Input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="mt-1" min={2024} max={2100} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => createMutation.mutate()} disabled={!title.trim() || createMutation.isPending}>
              {createMutation.isPending ? "Creando…" : "Crear rifa"}
            </Button>
            <Button variant="outline" onClick={() => { setCreating(false); setMessage(""); }}>Cancelar</Button>
          </div>
        </div>
      )}

      <AlertDialog open={confirmDrawOpen} onOpenChange={setConfirmDrawOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Realizar sorteo?</AlertDialogTitle>
            <AlertDialogDescription>
              Se elegirá un ganador de forma ponderada (más tickets = más probabilidad). Todos los tickets de todos los usuarios se reiniciarán a 0. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => raffleToExecute && executeMutation.mutate(raffleToExecute.id)}
              className="bg-copper text-primary-foreground hover:bg-copper/90"
            >
              Ejecutar sorteo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function RaffleRow({
  raffle,
  onMarkDelivered,
  isDelivering,
}: {
  raffle: RafflesRow;
  onMarkDelivered: (prizeId: string) => void;
  isDelivering: boolean;
}) {
  const { data: prize } = useQuery({
    queryKey: ["raffle-prize", raffle.id],
    queryFn: () => getPrizeByRaffleId(raffle.id),
    enabled: raffle.status === "closed" && !!raffle.winner_user_id,
  });
  const { data: winnerProfile } = useQuery({
    queryKey: ["profile", prize?.user_id],
    queryFn: async () => {
      if (!supabase || !prize?.user_id) return null;
      const { data } = await supabase.from("profiles").select("display_name").eq("id", prize.user_id).single();
      return data as { display_name: string | null } | null;
    },
    enabled: !!prize?.user_id,
  });

  return (
    <tr className="border-b border-border">
      <td className="p-3">{raffle.title}</td>
      <td className="p-3">{MONTHS[raffle.month]} {raffle.year}</td>
      <td className="p-3">{raffle.status === "active" ? "Activa" : "Cerrada"}</td>
      <td className="p-3">
        {raffle.status === "closed" && (winnerProfile?.display_name ?? `Usuario #${(raffle.winner_user_id ?? "").slice(0, 8)}`)}
      </td>
      <td className="p-3">
        {prize && (
          <>
            <span className="text-muted-foreground">{prize.status}</span>
            {prize.status !== "delivered" && (
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={() => onMarkDelivered(prize.id)}
                disabled={isDelivering}
              >
                Marcar entregado
              </Button>
            )}
          </>
        )}
      </td>
    </tr>
  );
}
