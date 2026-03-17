import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { SeoHead } from "@/components/SeoHead";
import { FeaturedProfileCard } from "@/components/FeaturedProfileCard";
import { getActiveRaffle, getTotalTicketsAccumulated, getLastClosedRaffle } from "@/lib/raffleService";
import { supabase } from "@/lib/supabase";
import { ACTIVE_CITY_SLUG } from "@/lib/site-config";
import { useAuth } from "@/contexts/AuthContext";
import { Gift, Ticket, Calendar, Trophy, Medal } from "lucide-react";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } } };

const MONTHS = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

/** Anonimizar ganador: Usuario #XXXX (últimos 4 caracteres del id en base36). */
function anonymizeWinnerId(userId: string): string {
  const hex = userId.replace(/-/g, "").slice(-8);
  const num = parseInt(hex, 16) % 10000;
  return `Usuario #${num.toString().padStart(4, "0")}`;
}

type RankingRow = { id: string; display_name: string | null; tickets_rifa: number | null };

export default function RafflePage() {
  const { user, role } = useAuth();

  const { data: activeRaffle } = useQuery({
    queryKey: ["raffle-active-public"],
    queryFn: getActiveRaffle,
  });

  const { data: totalTickets = 0 } = useQuery({
    queryKey: ["raffle-total-tickets-public"],
    queryFn: getTotalTicketsAccumulated,
  });

  const { data: ranking = [] } = useQuery({
    queryKey: ["raffle-ranking", user?.id],
    queryFn: async (): Promise<RankingRow[]> => {
      if (!supabase || !user?.id || role !== "visitor") return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, tickets_rifa")
        .eq("role", "visitor")
        .order("tickets_rifa", { ascending: false });
      if (error) return [];
      return (data ?? []) as RankingRow[];
    },
    enabled: !!supabase && !!user?.id && role === "visitor",
  });

  const myTickets = user?.id && role === "visitor"
    ? (ranking.find((r) => r.id === user.id)?.tickets_rifa ?? 0)
    : null;

  const { data: lastClosed } = useQuery({
    queryKey: ["raffle-last-closed"],
    queryFn: getLastClosedRaffle,
  });

  const { data: activeProfiles = [] } = useQuery({
    queryKey: ["raffle-page-active-profiles"],
    queryFn: async () => {
      if (!supabase) return [];
      const now = new Date().toISOString();
      const { data } = await supabase
        .from("escort_profiles")
        .select("id, name, age, badge, image, available, whatsapp, city_id, description, nationality, gallery, slug, vip_extras, cities(name)")
        .not("promotion", "is", null)
        .gt("active_until", now)
        .order("name");
      const rows = (data ?? []) as { id: string; name: string; age: number; badge: string | null; image: string | null; available: boolean; whatsapp?: string | null; city_id: string | null; description?: string | null; nationality?: string | null; gallery?: string[] | null; slug?: string | null; vip_extras?: string[] | null; cities: { name: string } | null }[];
      return rows.map((p) => ({
        id: p.id,
        name: p.name,
        age: p.age,
        city: p.cities?.name ?? "",
        badge: p.badge ?? "Perfil",
        image: p.image ?? "/marcadeagua.png",
        available: p.available,
        whatsapp: p.whatsapp ?? null,
        description: p.description ?? null,
        nationality: p.nationality ?? null,
        galleryCount: Array.isArray(p.gallery) ? p.gallery.length : 0,
        gallery: Array.isArray(p.gallery) ? p.gallery : [],
        slug: p.slug ?? null,
        vip_extras: Array.isArray(p.vip_extras) ? p.vip_extras : [],
      }));
    },
    enabled: !!supabase,
  });

  return (
    <div className="min-h-screen bg-background px-4 py-8 pb-24">
      <SeoHead
        title="Rifa mensual | Punto Cachero"
        description="Participa con tus tickets en el sorteo mensual. Premio: 1 hora de servicio exclusivo con el perfil que elijas."
        canonicalPath="/rifa"
        robots="index, follow"
      />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero: imagen de fondo con título y texto encima */}
        <div
          className="relative rounded-2xl overflow-hidden min-h-[280px] sm:min-h-[320px] flex flex-col justify-end p-6 -mx-4 sm:mx-0"
          style={{
            backgroundImage: "url(/rifas.png)",
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent pointer-events-none" aria-hidden />
          <div className="relative z-10 space-y-2">
            <Link to="/" className="text-sm text-white/90 hover:text-white inline-block">← Inicio</Link>
            <h1 className="text-2xl sm:text-3xl font-display font-bold flex items-center gap-2 text-white drop-shadow-lg">
              <Gift className="w-7 h-7 text-copper shrink-0" />
              Rifa mensual
            </h1>
            <p className="text-white/95 text-sm sm:text-base max-w-xl drop-shadow-md">
              Acumula tickets con el Desafío del Día y otras actividades. Cada ticket es una papeleta. Más tickets, más probabilidad de ganar.
            </p>
          </div>
        </div>

        {activeRaffle ? (
          <div className="rounded-2xl border border-copper/30 bg-card p-6 space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-copper" />
              Próximo sorteo
            </h2>
            <p className="font-medium">{activeRaffle.title}</p>
            <p className="text-sm text-muted-foreground">{activeRaffle.description}</p>
            <p className="text-sm">
              {MONTHS[activeRaffle.month]} {activeRaffle.year}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <Ticket className="w-5 h-5 text-copper" />
              <span className="font-medium text-copper">
                {myTickets !== null ? `Tus tickets: ${myTickets}` : `Total tickets acumulados: ${totalTickets}`}
              </span>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-muted-foreground">No hay sorteo activo en este momento. Vuelve pronto.</p>
          </div>
        )}

        {lastClosed && lastClosed.winner_user_id && (
          <div className="rounded-2xl border border-border bg-card p-6 space-y-2">
            <h2 className="font-semibold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-copper" />
              Ganador anterior
            </h2>
            <p className="text-muted-foreground">{lastClosed.title}</p>
            <p className="font-medium">{anonymizeWinnerId(lastClosed.winner_user_id)}</p>
          </div>
        )}

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold mb-2">¿Cómo participar?</h2>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Acumula tickets con el Desafío del Día (1 ticket por acierto + 10 al completar).</li>
            <li>Solo participan usuarios con al menos 1 ticket.</li>
            <li>Cada ticket = 1 papeleta. Más tickets = más probabilidad.</li>
            <li>Al ejecutarse el sorteo, todos los tickets se reinician a 0.</li>
          </ul>
          <Link to="/rifa/terminos" className="inline-block mt-4 text-sm text-copper hover:underline">
            Términos del Sorteo →
          </Link>
        </div>

        {role === "visitor" && ranking.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-semibold text-lg flex items-center gap-2 mb-3">
              <Medal className="w-5 h-5 text-copper" />
              Ranking por tickets
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Usuarios ordenados por cantidad de tickets para el sorteo.
            </p>
            <ul className="space-y-2">
              {ranking.map((row, index) => (
                <li
                  key={row.id}
                  className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                    row.id === user?.id ? "bg-copper/15 border border-copper/40" : "bg-muted/50"
                  }`}
                >
                  <span className="font-medium text-foreground truncate">
                    {row.display_name?.trim() || "Sin nombre"}
                  </span>
                  <span className="text-copper font-semibold shrink-0 ml-2">
                    {row.tickets_rifa ?? 0} tickets
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <section className="mt-8 px-0" aria-labelledby="perfiles-activos-heading">
          <div className="mb-4">
            <h2
              id="perfiles-activos-heading"
              className="text-2xl md:text-3xl font-display font-bold text-foreground"
            >
              Todos los perfiles activos
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Perfiles con los que podrías ganar tu hora exclusiva
            </p>
          </div>
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            {activeProfiles.map((profile) => (
              <motion.div key={profile.id} variants={fadeUp}>
                <FeaturedProfileCard
                  profile={profile}
                  citySlug={ACTIVE_CITY_SLUG}
                />
              </motion.div>
            ))}
          </motion.div>
          {activeProfiles.length > 0 && (
            <Link
              to={`/${ACTIVE_CITY_SLUG}`}
              className="inline-block mt-4 text-copper text-sm font-medium hover:underline"
            >
              Ver todos los perfiles en {ACTIVE_CITY_SLUG === "rancagua" ? "Rancagua" : ACTIVE_CITY_SLUG} →
            </Link>
          )}
        </section>
      </div>
    </div>
  );
}
