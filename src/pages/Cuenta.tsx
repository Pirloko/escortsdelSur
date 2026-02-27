import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { SeoHead } from "@/components/SeoHead";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Pause, Trash2, LogOut, MapPin, Building2, Shield, Star, MessageCircle, Calendar, Shuffle, LayoutDashboard, User, Plus, Eye } from "lucide-react";
import type { EscortProfilesRow, CitiesRow, CreditTransactionsRow } from "@/types/database";
import { TIME_SLOTS, getSubidaScheduleForDay } from "@/lib/franjas";
import { jsPDF } from "jspdf";

/** Palabras clave para el botón "Texto aleatorio" en Descripción. Edita estos arrays manualmente. */
const DESC_PALABRAS = {
  inicios: ["Soy", "Hola, soy", "Mi nombre es", "Encantada,"],
  adjetivos: ["discreta","una escort", "caliente", "profesional", "amigable", "elegante", "cálida", "reservada", "verificada", "seria"],
  frases: [
    "disfruto de buenos momentos",
    "me adapto a lo que buscas",
    "me encanta el sexo",
    "me gusta el sexo en diferentes posiciones",
    "no pierdas tu tiempo y contactame",
    "atendiendo en",
    "disponible para encuentros",
    "verificada y seria",
    "atención personalizada",
    "ambientes cómodos y discretos",
  ],
  cierres: ["Escríbeme y coordinamos.", "Contáctame para más información.", "Te espero.", "Reserva con confianza."],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generarDescripcionAleatoria(
  nombre: string,
  edad: string,
  ciudad: string,
  serviciosIncluidos: string[] = [],
  serviciosAdicionales: string[] = []
): string {
  const n = (nombre || "—").trim();
  const e = (edad || "").trim();
  const c = (ciudad || "").trim();
  const años = e ? `, ${e} años` : "";
  const inicio = pick(DESC_PALABRAS.inicios);
  const parte1 = `${inicio} ${n}${años}.`;
  const adjs = [...DESC_PALABRAS.adjetivos].sort(() => Math.random() - 0.5).slice(0, 2);
  const parte2 = adjs.length ? ` ${adjs.join(", ").replace(/, ([^,]+)$/, " y $1")}.` : "";
  const frase = pick(DESC_PALABRAS.frases);
  const parte3 = c ? ` ${frase} ${c}.` : ` ${frase}.`;

  let parteServicios = "";
  if (serviciosIncluidos.length > 0 || serviciosAdicionales.length > 0) {
    const partes: string[] = [];
    if (serviciosIncluidos.length > 0) {
      partes.push(`Servicios incluidos: ${serviciosIncluidos.join(", ")}.`);
    }
    if (serviciosAdicionales.length > 0) {
      partes.push(`Adicionales: ${serviciosAdicionales.join(", ")}.`);
    }
    parteServicios = " " + partes.join(" ");
  }

  const cierre = pick(DESC_PALABRAS.cierres);
  return (parte1 + parte2 + parte3 + parteServicios + " " + cierre).replace(/\s+/g, " ").trim();
}

/** Opciones para el menú Categoría. Editar manualmente. Radix no permite value="", usamos __ninguno__. */
const CATEGORIA_NINGUNO = "__ninguno__";
const CATEGORIA_OPCIONES = ["Escort Mujer", "Escort Trans", "Escort Hombre"];

/** Opciones de etiquetas para Servicios Incluidos y Adicionales. Editar manualmente. */
const SERVICIOS_OPCIONES = {
  incluidos: [
    "Departamento Propio",
    "Oral con Condon",
    "Servicio a Domicilio",
    "Servicios Normales",
    "Sexo",
  ],
  adicionales: [
    "Atencion en Hoteles",
    "Despedida de Solteros",
    "Oral con Condon",
    "Viajes",
  ],
};

const MAX_PERFILES = 5;

type ProfileWithCity = EscortProfilesRow & { cities: CitiesRow | null };

export default function Cuenta() {
  const { profileId } = useParams<{ profileId?: string }>();
  const { user, role, isLoading, signOut, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [profileData, setProfileData] = useState<ProfileWithCity | null>(null);
  const [profilesList, setProfilesList] = useState<ProfileWithCity[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [renewingProfileId, setRenewingProfileId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [badge, setBadge] = useState("");
  const [promotion, setPromotion] = useState("");
  const [image, setImage] = useState("");
  const [available, setAvailable] = useState(true);
  const [description, setDescription] = useState("");
  const [zone, setZone] = useState("");
  const [schedule, setSchedule] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [timeSlots, setTimeSlots] = useState<string[]>(["09-12"]);
  const [subidasPorFranja, setSubidasPorFranja] = useState<5 | 10>(10);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadImageError, setUploadImageError] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [galleryError, setGalleryError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [servicesIncluded, setServicesIncluded] = useState<string[]>([]);
  const [servicesExtra, setServicesExtra] = useState<string[]>([]);
  const [activeUntil, setActiveUntil] = useState<string | null>(null);
  const [activating, setActivating] = useState(false);
  const [pausing, setPausing] = useState(false);
  const [promoDialogOpen, setPromoDialogOpen] = useState(false);
  const [promoSaving, setPromoSaving] = useState(false);
  const [promoMessage, setPromoMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const [creditTransactions, setCreditTransactions] = useState<CreditTransactionsRow[]>([]);
  const [publisherCredits, setPublisherCredits] = useState(0);
  const [editingAccount, setEditingAccount] = useState(false);
  const [accountNameInput, setAccountNameInput] = useState("");
  const [accountPhoneInput, setAccountPhoneInput] = useState("");
  const [accountSaving, setAccountSaving] = useState(false);
  const [deleteFromListProfile, setDeleteFromListProfile] = useState<ProfileWithCity | null>(null);
  const [deletingFromList, setDeletingFromList] = useState(false);
  const [creditsTotalInEditView, setCreditsTotalInEditView] = useState<number | null>(null);
  const [promoInfoProfile, setPromoInfoProfile] = useState<ProfileWithCity | null>(null);
  const [promoInfoOpen, setPromoInfoOpen] = useState(false);
  const [txProfilesById, setTxProfilesById] = useState<Record<string, { name: string }>>({});

  const handleSaveAccountData = async () => {
    if (!supabase || !user) return;
    setAccountSaving(true);
    try {
      const currentMeta = (user.user_metadata ?? {}) as Record<string, unknown>;
      const nextMeta = {
        ...currentMeta,
        display_name: accountNameInput.trim() || null,
        whatsapp: accountPhoneInput.trim() || null,
      };
      await supabase.auth.updateUser({ data: nextMeta });
      // Sincronizar también con profiles (display_name, email, contact_phone para admin)
      await supabase
        .from("profiles")
        // @ts-expect-error tipos generados pueden estar desfasados
        .update({
          display_name: accountNameInput.trim() || null,
          email: user.email ?? null,
          contact_phone: accountPhoneInput.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      await refreshProfile();
      setEditingAccount(false);
    } finally {
      setAccountSaving(false);
    }
  };

  const handleDeleteFromList = async () => {
    const p = deleteFromListProfile;
    if (!p || !supabase || !user?.id) return;
    setDeletingFromList(true);
    const { error } = await supabase.from("escort_profiles").delete().eq("id", p.id);
    setDeletingFromList(false);
    setDeleteFromListProfile(null);
    if (error) return;
    const { data: remaining } = await supabase
      .from("escort_profiles")
      .select("*, cities(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    const list = (remaining ?? []) as ProfileWithCity[];
    setProfilesList(list);
  };

  useEffect(() => {
    if (!supabase || !user?.id || role !== "registered_user") return;
    if (profileId) {
      supabase
        .from("escort_profiles")
        .select("*, cities(*)")
        .eq("id", profileId)
        .single()
        .then(({ data, error }) => {
          if (error || !data) {
            setProfileData(null);
            return;
          }
          const row = data as ProfileWithCity;
          if (row.user_id !== user.id) {
            setProfileData(null);
            return;
          }
          setProfileData(row);
          const p = row;
          setName(p.name);
          setAge(String(p.age));
          setBadge(p.badge ?? "");
          setPromotion((p as { promotion?: string | null }).promotion ?? "");
          setImage(p.image ?? "");
          setAvailable(p.available);
          setDescription(p.description ?? "");
          setZone(p.zone ?? "");
          setSchedule(p.schedule ?? "");
          setWhatsapp(p.whatsapp ?? "");
          const loadedSlots =
            (p as { time_slots?: string[]; time_slot?: string }).time_slots?.length
              ? (p as { time_slots: string[] }).time_slots
              : [(p as { time_slot?: string }).time_slot ?? "09-12"];
          setTimeSlots(loadedSlots);
          const totalSubidasDb = (p as { subidas_per_day?: number }).subidas_per_day ?? 10;
          const perFranja =
            loadedSlots.length > 0 ? Math.round(totalSubidasDb / loadedSlots.length) : totalSubidasDb;
          setSubidasPorFranja(perFranja === 5 ? 5 : 10);
          setGallery(Array.isArray(p.gallery) ? p.gallery : []);
          setServicesIncluded(Array.isArray((p as { services_included?: string[] }).services_included) ? (p as { services_included: string[] }).services_included : []);
          setServicesExtra(Array.isArray((p as { services_extra?: string[] }).services_extra) ? (p as { services_extra: string[] }).services_extra : []);
          setActiveUntil((p as { active_until?: string | null }).active_until ?? null);
          if (searchParams.get("promo") === "1") {
            setPromoDialogOpen(true);
          }
          // Total de créditos del usuario (para el modal de promoción)
          supabase
            .from("escort_profiles")
            .select("credits")
            .eq("user_id", user.id)
            .then(({ data: list }) => {
              const fromProfiles = (list ?? []).reduce((s, r) => s + ((r as { credits?: number }).credits ?? 0), 0);
              supabase
                ?.from("profiles")
                .select("publisher_credits")
                .eq("id", user.id)
                .single()
                .then(({ data: pr }) => {
                  const fromPublisher = (pr as { publisher_credits?: number } | null)?.publisher_credits ?? 0;
                  setCreditsTotalInEditView(fromProfiles + fromPublisher);
                });
            });
        });
    } else {
      setCreditsTotalInEditView(null);
      setDashboardLoading(true);
      supabase
        .from("escort_profiles")
        .select("*, cities(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .then(async ({ data, error }) => {
          setDashboardLoading(false);
          if (error) return;
          const list = (data ?? []) as ProfileWithCity[];
          setProfilesList(list);
          // Créditos del usuario cuando tiene 0 perfiles (profiles.publisher_credits)
          const { data: profileRow } = await supabase
            .from("profiles")
            .select("publisher_credits")
            .eq("id", user.id)
            .single();
          setPublisherCredits((profileRow as { publisher_credits?: number } | null)?.publisher_credits ?? 0);
          // No redirigir a completar-perfil: si hay 0 perfiles se muestra Mi cuenta con la invitación y el botón Nuevo anuncio
          // Al cargar: perfiles ya vencidos se marcan como pausados (available = false)
          const now = new Date();
          list
            .filter((p) => p.active_until && new Date(p.active_until) < now && p.available)
            .forEach((p) => {
              supabase
                ?.from("escort_profiles")
                // @ts-expect-error Supabase generated types
                .update({ available: false, updated_at: new Date().toISOString() })
                .eq("id", p.id)
                .then(() => {});
            });
          // Cargar historial de créditos
          const { data: txData } = await supabase
            .from("credit_transactions")
            .select("id, amount, type, description, created_at, escort_profile_id")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
          const txList = (txData as CreditTransactionsRow[]) ?? [];
          setCreditTransactions(txList);
          // Nombres de perfiles asociados a las transacciones
          const escortIds = Array.from(
            new Set(
              txList
                .map((tx) => tx.escort_profile_id)
                .filter((id): id is string => !!id)
            )
          );
          if (escortIds.length > 0) {
            const { data: escortRows } = await supabase
              .from("escort_profiles")
              .select("id, name")
              .in("id", escortIds);
            const map: Record<string, { name: string }> = {};
            (escortRows as { id: string; name: string }[] | null)?.forEach((row) => {
              map[row.id] = { name: row.name };
            });
            setTxProfilesById(map);
          } else {
            setTxProfilesById({});
          }
        });
    }
  }, [user?.id, role, profileId, navigate, searchParams]);

  useEffect(() => {
    if (!user) return;
    const meta = (user.user_metadata ?? {}) as { display_name?: string; whatsapp?: string };
    const baseName = profile?.display_name || meta.display_name || user.email || "";
    const basePhone = meta.whatsapp || "";
    setAccountNameInput(baseName);
    setAccountPhoneInput(basePhone);
  }, [user, profile]);

  const handleRenovar7Dias = async (profileIdToRenew: string) => {
    if (!supabase || !user?.id) return;
    setRenewingProfileId(profileIdToRenew);
    const newActiveUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await supabase
      .from("escort_profiles")
      // @ts-expect-error Supabase generated types
      .update({ active_until: newActiveUntil, available: true, updated_at: new Date().toISOString() })
      .eq("id", profileIdToRenew)
      .eq("user_id", user.id);
    setRenewingProfileId(null);
    if (!error) {
      setProfilesList((prev) =>
        prev.map((p) =>
          p.id === profileIdToRenew ? { ...p, active_until: newActiveUntil, available: true } : p
        )
      );
    }
  };

  if (isLoading) return null;
  if (role !== "registered_user") {
    if (!user) return <Link to="/login">Iniciar sesión</Link>;
    return <Link to="/">No tienes un perfil de usuario registrado. Volver al inicio</Link>;
  }

  if (!profileId) {
    if (dashboardLoading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-muted-foreground">Cargando…</p>
        </div>
      );
    }
    const userMeta = (user?.user_metadata ?? {}) as { display_name?: string; whatsapp?: string };
    const accountName = profile?.display_name || userMeta.display_name || user?.email || "—";
    const accountPhone = userMeta.whatsapp || "—";
    const totalCredits = profilesList.reduce(
      (sum, p) => sum + (typeof (p as any).credits === "number" ? (p as any).credits : 0),
      0,
    ) + publisherCredits;
    const initialCredits = profilesList.length * 5000;
    const consumedCredits = Math.max(initialCredits - totalCredits, 0);

    return (
      <div className="min-h-screen bg-background px-4 py-8 pb-28">
        <SeoHead title="Dashboard | Punto Cachero" description="Panel de acompañantes." canonicalPath="/cuenta" robots="noindex, nofollow" noSocial />
        <div className="max-w-2xl mx-auto space-y-8">
          <h1 className="text-2xl font-display font-bold">Mi cuenta</h1>

          <section>
            <h2 className="text-lg font-display font-bold flex items-center gap-2 mb-4">
              <LayoutDashboard className="w-5 h-5 text-gold" />
              Perfiles o anuncios
            </h2>
            {profilesList.length === 0 && (
              <Alert className="mb-4 border-gold/50 bg-gold/10 text-foreground [&>svg]:text-gold">
                <Star className="h-4 w-4" />
                <AlertTitle>¡Crea un anuncio!</AlertTitle>
                <AlertDescription>
                  Aún no tienes anuncios publicados. Usa el botón <strong>Nuevo anuncio</strong> de abajo para crear tu perfil y aparecer en el sitio. Los clientes podrán encontrarte y contactarte.
                </AlertDescription>
              </Alert>
            )}
            <p className="text-sm text-muted-foreground mb-4">
              Tienes {profilesList.length} de {MAX_PERFILES} perfiles. Cada uno puede tener su propia franja y subidas.
            </p>
            <div className="space-y-3">
              {profilesList.map((p) => {
                const isExpired = p.active_until ? new Date(p.active_until) < new Date() : false;
                const thumb =
                  p.image ||
                  (Array.isArray(p.gallery) && p.gallery.length > 0 ? p.gallery[0] : null) ||
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80";
                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl border border-border bg-card flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-14 w-14 rounded-xl overflow-hidden border border-border flex-shrink-0">
                        <img
                          src={thumb}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {p.name}, {p.age}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          {(p as ProfileWithCity).cities?.name ?? "—"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {isExpired ? (
                            <span className="text-amber-500">Oculto (período vencido)</span>
                          ) : p.active_until ? (
                            <>Visible hasta {new Date(p.active_until).toLocaleDateString("es-CL", { dateStyle: "short" })}</>
                          ) : (
                            "Visible"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {isExpired && (
                        <Button
                          size="sm"
                          className="gap-1 bg-gold text-primary-foreground hover:bg-gold/90"
                          disabled={renewingProfileId === p.id}
                          onClick={() => handleRenovar7Dias(p.id)}
                        >
                          {renewingProfileId === p.id ? "Renovando…" : "Renovar 7 días"}
                        </Button>
                      )}
                      <Link to={`/perfil/${p.id}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="gap-1">
                          Ver
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-gold border-gold/50 hover:bg-gold/10"
                        asChild
                      >
                        <Link to={`/cuenta/perfil/${p.id}`}>
                          <Pencil className="w-3.5 h-3.5" />
                          Editar
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-amber-300 border-amber-500/60 hover:bg-amber-500/10"
                        asChild
                      >
                        <Link to={`/cuenta/perfil/${p.id}?promo=1`}>
                          <Star className="w-3.5 h-3.5" />
                          Promocionar
                        </Link>
                      </Button>
                      {p.promotion && p.active_until && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => {
                            setPromoInfoProfile(p as ProfileWithCity);
                            setPromoInfoOpen(true);
                          }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Ver promoción
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-destructive border-destructive/50 hover:bg-destructive/10"
                        onClick={() => setDeleteFromListProfile(p)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            {profilesList.length < MAX_PERFILES && (
              <Button className="mt-4 w-full h-11 rounded-2xl bg-gold text-primary-foreground gap-2" asChild>
                <Link to="/completar-perfil">
                  <Plus className="w-4 h-4" />
                  Nuevo anuncio
                </Link>
              </Button>
            )}
          </section>

          {promoInfoProfile && (
            <Dialog
              open={promoInfoOpen}
              onOpenChange={(open) => {
                setPromoInfoOpen(open);
                if (!open) setPromoInfoProfile(null);
              }}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Promoción activa</DialogTitle>
                  <DialogDescription>
                    Detalles de la promoción actual de tu perfil.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 text-sm">
                  <p>
                    <span className="font-medium">{promoInfoProfile.name}</span>, {promoInfoProfile.age}
                  </p>
                  <p>
                    <span className="font-medium">Tipo:</span>{" "}
                    {promoInfoProfile.promotion === "destacada" ? "Destacada" : "Galería"}
                  </p>
                  <p>
                    <span className="font-medium">Vigente hasta:</span>{" "}
                    {promoInfoProfile.active_until
                      ? new Date(promoInfoProfile.active_until).toLocaleString("es-CL")
                      : "—"}
                  </p>
                  <p>
                    <span className="font-medium">Franjas horarias:</span>{" "}
                    {Array.isArray((promoInfoProfile as { time_slots?: string[] }).time_slots) &&
                    (promoInfoProfile as { time_slots?: string[] }).time_slots!.length > 0
                      ? (promoInfoProfile as { time_slots: string[] }).time_slots
                          .map((slot) => {
                            const found = TIME_SLOTS.find((t) => t.value === slot);
                            return found ? found.label : slot;
                          })
                          .join(", ")
                      : (() => {
                          const slot = (promoInfoProfile as { time_slot?: string | null }).time_slot ?? null;
                          if (!slot) return "Sin franja definida";
                          const found = TIME_SLOTS.find((t) => t.value === slot);
                          return found ? found.label : slot;
                        })()}
                  </p>
                  <p>
                    <span className="font-medium">Subidas diarias totales:</span>{" "}
                    {(promoInfoProfile as { subidas_per_day?: number | null }).subidas_per_day ?? 0}
                  </p>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={async () => {
                      const p = promoInfoProfile;
                      if (!p) return;
                      const slots =
                        ((p as { time_slots?: string[] }).time_slots && (p as { time_slots?: string[] }).time_slots!.length > 0
                          ? (p as { time_slots: string[] }).time_slots
                          : [(p as { time_slot?: string | null }).time_slot ?? "09-12"]) as string[];
                      const totalSubidas = (p as { subidas_per_day?: number | null }).subidas_per_day ?? 0;
                      const subidasPorFranja =
                        slots.length > 0 ? Math.max(1, Math.round(totalSubidas / slots.length)) : 10;

                      // Rango de días de la promoción (7 días terminando en active_until, o a partir de hoy si no hay fecha)
                      const endDate = p.active_until ? new Date(p.active_until) : new Date();
                      const days = 7;
                      const startDate = new Date(endDate);
                      startDate.setDate(endDate.getDate() - (days - 1));

                      // Construir matriz: filas = (franja, índice subida), columnas = días 1..7
                      const daysLabels: string[] = [];
                      type CellKey = { slot: string; index: number };
                      const rowsMatrix: { slot: string; index: number; times: (string | null)[] }[] = [];

                      // Inicializar filas
                      slots.forEach((slot) => {
                        for (let i = 0; i < subidasPorFranja; i++) {
                          rowsMatrix.push({
                            slot,
                            index: i + 1,
                            times: Array(days).fill(null),
                          });
                        }
                      });

                      for (let d = 0; d < days; d++) {
                        const date = new Date(startDate);
                        date.setDate(startDate.getDate() + d);
                        daysLabels[d] = date.toLocaleDateString("es-CL");
                        const schedule = getSubidaScheduleForDay(p.id, date, slots, subidasPorFranja);
                        // Agrupar por franja y ordenar
                        slots.forEach((slot) => {
                          const itemsForSlot = schedule
                            .filter((it) => it.slot === slot)
                            .sort((a, b) => a.minuteOfDay - b.minuteOfDay);
                          itemsForSlot.forEach((it, idx) => {
                            if (idx >= subidasPorFranja) return;
                            const rowIndex = slots.indexOf(slot) * subidasPorFranja + idx;
                            const hour = Math.floor(it.minuteOfDay / 60);
                            const minute = it.minuteOfDay % 60;
                            const horaStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
                            rowsMatrix[rowIndex].times[d] = horaStr;
                          });
                        });
                      }

                      const doc = new jsPDF();

                      // Imagen principal en la cabecera
                      const mainImageUrl =
                        p.image ||
                        ((Array.isArray(p.gallery) && p.gallery.length > 0 ? p.gallery[0] : null) as string | null);
                      if (mainImageUrl) {
                        const loadImageAsDataURL = (url: string): Promise<string> =>
                          new Promise((resolve) => {
                            const img = new Image();
                            img.crossOrigin = "anonymous";
                            img.onload = () => {
                              const canvas = document.createElement("canvas");
                              canvas.width = img.width;
                              canvas.height = img.height;
                              const ctx = canvas.getContext("2d");
                              if (!ctx) {
                                resolve("");
                                return;
                              }
                              ctx.drawImage(img, 0, 0);
                              resolve(canvas.toDataURL("image/jpeg", 0.85));
                            };
                            img.onerror = () => resolve("");
                            img.src = url;
                          });
                        const imgData = await loadImageAsDataURL(mainImageUrl);
                        if (imgData) {
                          doc.addImage(imgData, "JPEG", 150, 10, 40, 40);
                        }
                      }

                      doc.setFontSize(14);
                      doc.text("Plan de subidas por día", 14, 18);
                      doc.setFontSize(11);
                      doc.text(`Perfil: ${p.name}, ${p.age}`, 14, 26);
                      doc.text(
                        `Tipo: ${p.promotion === "destacada" ? "Destacada" : "Galería"}  ·  Días: ${days}  ·  Subidas/día: ${
                          totalSubidas || slots.length * subidasPorFranja
                        }`,
                        14,
                        32
                      );
                      doc.text("Tabla de horarios exactos por franja y día.", 14, 38);

                      let y = 55;
                      doc.setFontSize(10);
                      // Cabecera: fila 1 (títulos) y fila 2 (días 1..7)
                      doc.text("Franja horarios", 14, y);
                      doc.text("N° subida", 60, y);
                      doc.text("Día", 90, y);
                      const headerY = y + 6;
                      daysLabels.forEach((_, idx) => {
                        const x = 90 + idx * 18;
                        doc.text(String(idx + 1), x, headerY);
                      });
                      y = headerY + 4;

                      rowsMatrix.forEach((row) => {
                        if (y > 280) {
                          doc.addPage();
                          y = 20;
                          doc.setFontSize(10);
                          doc.text("Franja horarios", 14, y);
                          doc.text("N° subida", 60, y);
                          doc.text("Día", 90, y);
                          const headerY2 = y + 6;
                          daysLabels.forEach((_, idx) => {
                            const x = 90 + idx * 18;
                            doc.text(String(idx + 1), x, headerY2);
                          });
                          y = headerY2 + 4;
                        }
                        const labelSlot = TIME_SLOTS.find((t) => t.value === row.slot)?.label ?? row.slot;
                        doc.text(labelSlot, 14, y);
                        doc.text(String(row.index), 60, y);
                        row.times.forEach((hora, idx) => {
                          if (!hora) return;
                          const x = 90 + idx * 18;
                          doc.text(hora, x, y);
                        });
                        y += 6;
                      });

                      const safeName = String(p.name || "perfil").replace(/[^a-z0-9_-]+/gi, "_");
                      doc.save(`subidas_${safeName}.pdf`);
                    }}
                  >
                    Descargar PDF de subidas
                  </Button>
                  <Button variant="outline" className="w-full sm:w-auto" onClick={() => setPromoInfoOpen(false)}>
                    Cerrar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          <section>
            <h2 className="text-lg font-display font-bold flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-gold" />
              Datos de la cuenta
            </h2>
            <div className="p-4 rounded-xl border border-border bg-card space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Correo</p>
                  <p className="font-medium break-all">{user?.email ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Nombre de usuario</p>
                  {editingAccount ? (
                    <Input
                      value={accountNameInput}
                      onChange={(e) => setAccountNameInput(e.target.value)}
                      className="h-9"
                    />
                  ) : (
                    <p className="font-medium">{accountName}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Número de contacto</p>
                  {editingAccount ? (
                    <Input
                      value={accountPhoneInput}
                      onChange={(e) => setAccountPhoneInput(e.target.value)}
                      className="h-9"
                      placeholder="+569..."
                    />
                  ) : (
                    <p className="font-medium">{accountPhone}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                {editingAccount ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-lg"
                      onClick={() => {
                        setEditingAccount(false);
                        const meta = (user?.user_metadata ?? {}) as { display_name?: string; whatsapp?: string };
                        setAccountNameInput(profile?.display_name || meta.display_name || user?.email || "");
                        setAccountPhoneInput(meta.whatsapp || "");
                      }}
                      disabled={accountSaving}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 rounded-lg bg-gold text-primary-foreground"
                      onClick={handleSaveAccountData}
                      disabled={accountSaving}
                    >
                      {accountSaving ? "Guardando…" : "Guardar"}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg"
                    onClick={() => setEditingAccount(true)}
                  >
                    Editar datos
                  </Button>
                )}
              </div>
              <div className="border-t border-border pt-4 grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Créditos totales</p>
                  <p className="text-lg font-semibold">{totalCredits}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Consumidos</p>
                  <p className="text-lg font-semibold">{consumedCredits}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Iniciales</p>
                  <p className="text-lg font-semibold">{initialCredits}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                  Historial de compras
                </p>
                {creditTransactions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Aún no hay compras de créditos.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-auto pr-1">
                    {creditTransactions.map((tx) => {
                      const profileInfo = tx.escort_profile_id
                        ? txProfilesById[tx.escort_profile_id] ?? null
                        : null;
                      const fecha = new Date(tx.created_at);
                      return (
                        <div
                          key={tx.id}
                          className="flex items-start justify-between text-xs gap-3"
                        >
                          <div className="space-y-0.5">
                            <p className="font-medium">
                              {tx.amount > 0 ? "+" : ""}
                              {tx.amount} créditos
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {tx.type === "promocion"
                                ? tx.description || "Promoción activada"
                                : tx.description ||
                                  (tx.type === "admin_add"
                                    ? "Créditos añadidos por admin"
                                    : tx.type)}
                            </p>
                            {profileInfo && (
                              <p className="text-[11px] text-muted-foreground">
                                Perfil:{" "}
                                <Link
                                  to={`/perfil/${tx.escort_profile_id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline underline-offset-2"
                                >
                                  {profileInfo.name}
                                </Link>
                              </p>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground whitespace-nowrap text-right">
                            {fecha.toLocaleDateString("es-CL", { dateStyle: "short" })}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="pt-4 border-t border-border">
            <Button variant="outline" className="w-full h-11 rounded-2xl gap-2 border-border" onClick={() => signOut().then(() => navigate("/", { replace: true }))}>
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </Button>
          </div>

          <AlertDialog open={!!deleteFromListProfile} onOpenChange={(open) => !open && setDeleteFromListProfile(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar este anuncio?</AlertDialogTitle>
                <AlertDialogDescription>
                  Se borrará el perfil &quot;{deleteFromListProfile?.name ?? ""}&quot; de forma permanente. No podrás recuperarlo.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={deletingFromList}
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeleteFromList();
                  }}
                >
                  {deletingFromList ? "Eliminando…" : "Eliminar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground">Perfil no encontrado o no tienes acceso.</p>
        <Link to="/cuenta" className="text-gold hover:underline">← Volver al dashboard</Link>
      </div>
    );
  }

  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const MAX_IMAGE_SIZE_MB = 5;
  const MAX_TOTAL_PHOTOS = 6;
  const MAX_GALLERY = MAX_TOTAL_PHOTOS - 1; // 1 main + hasta 5 en galería

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !supabase || !user?.id) return;
    setUploadImageError("");
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setUploadImageError("Formato no permitido. Usa JPG, PNG, WebP o GIF.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setUploadImageError(`La imagen no puede superar ${MAX_IMAGE_SIZE_MB} MB.`);
      return;
    }
    setUploadingImage(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${user.id}/main.${ext}`;
    const { error } = await supabase.storage.from("escort-images").upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });
    setUploadingImage(false);
    if (error) {
      setUploadImageError(error.message || "Error al subir la imagen");
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("escort-images").getPublicUrl(path);
    setImage(publicUrl);
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = "";
    if (!files.length || !supabase || !user?.id) return;
    setGalleryError("");
    const totalAfter = gallery.length + files.length;
    if (totalAfter > MAX_GALLERY) {
      setGalleryError(`Máximo ${MAX_GALLERY} fotos en galería (${MAX_TOTAL_PHOTOS} en total con la imagen principal).`);
      return;
    }
    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setGalleryError("Solo JPG, PNG, WebP o GIF.");
        return;
      }
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        setGalleryError(`Cada imagen máximo ${MAX_IMAGE_SIZE_MB} MB.`);
        return;
      }
    }
    setUploadingGallery(true);
    const newUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/gallery-${Date.now()}-${i}.${ext}`;
      const { error } = await supabase.storage.from("escort-images").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) {
        setGalleryError(error.message || "Error al subir");
        setUploadingGallery(false);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from("escort-images").getPublicUrl(path);
      newUrls.push(publicUrl);
    }
    setGallery((prev) => [...prev, ...newUrls].slice(0, MAX_GALLERY));
    setUploadingGallery(false);
  };

  const removeGalleryImage = (index: number) => {
    setGallery((prev) => prev.filter((_, i) => i !== index));
  };

  // Consideramos "vencido" cuando no hay fecha o cuando ya pasó.
  const isProfileExpired = activeUntil ? new Date(activeUntil) < new Date() : true;
  /** Franja y subidas editables: primera vez (sin promoción activa) o cuando terminó el período de 7 días */
  const tienePromoActiva = promotion.trim() === "galeria" || promotion.trim() === "destacada";
  const canEditSubidas = isProfileExpired || !tienePromoActiva;

  const handleActivar7Dias = async () => {
    if (!supabase || !profile?.id) return;
    setActivating(true);
    const newActiveUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await supabase
      .from("escort_profiles")
      // @ts-expect-error Supabase generated types pueden no incluir active_until todavía
      .update({ active_until: newActiveUntil, available: true, updated_at: new Date().toISOString() })
      .eq("id", profile.id);
    setActivating(false);
    if (!error) {
      setActiveUntil(newActiveUntil);
      setAvailable(true);
      setMessage("Perfil visible 7 días más.");
    } else setMessage(error.message);
  };

  const handlePausarPerfil = async () => {
    if (!supabase || !profile?.id) return;
    setPausing(true);
    const nowIso = new Date().toISOString();
    const { error } = await supabase
      .from("escort_profiles")
      // @ts-expect-error Supabase generated types pueden no incluir active_until todavía
      .update({ active_until: nowIso, available: false, updated_at: nowIso })
      .eq("id", profile.id);
    setPausing(false);
    if (!error) {
      setActiveUntil(nowIso);
      setAvailable(false);
      setMessage("Perfil pausado. Ya no apareces en los listados.");
    } else setMessage(error.message);
  };

  const handleSavePromocion = async () => {
    if (!supabase || !user?.id) return;
    const escortProfile = (profileData as ProfileWithCity | null) ?? (profilesList[0] as ProfileWithCity | undefined);
    if (!escortProfile?.id) {
      setPromoMessage("No se encontró el perfil a promocionar.");
      return;
    }
    setPromoSaving(true);
    setPromoMessage("");

    const tipoPromo = promotion.trim();
    const tienePromo = tipoPromo === "galeria" || tipoPromo === "destacada";
    const totalSubidas = timeSlots.length * subidasPorFranja;
    if (tienePromo && (timeSlots.length === 0 || totalSubidas === 0)) {
      setPromoMessage("Selecciona al menos una franja horaria y el número de subidas.");
      setPromoSaving(false);
      return;
    }

    const coste = calcularCreditosPromocion();

    if (tienePromo && coste != null && coste > 0) {
      // Créditos en el perfil
      const { data: rowCredits } = await supabase
        .from("escort_profiles")
        .select("credits")
        .eq("id", escortProfile.id)
        .maybeSingle();
      const creditsPerfil = (rowCredits as { credits?: number } | null)?.credits ?? 0;
      // Créditos a nivel de usuario (publisher_credits)
      const { data: rowProfile } = await supabase
        .from("profiles")
        .select("publisher_credits")
        .eq("id", user.id)
        .maybeSingle();
      const creditsPublisher = (rowProfile as { publisher_credits?: number } | null)?.publisher_credits ?? 0;
      const totalDisponibles = creditsPerfil + creditsPublisher;
      if (totalDisponibles < coste) {
        setPromoMessage(`Créditos insuficientes. Tienes ${totalDisponibles}, necesitas ${coste}.`);
        setPromoSaving(false);
        return;
      }
      const restarDePerfil = Math.min(creditsPerfil, coste);
      const restarDePublisher = coste - restarDePerfil;
      const nuevosCredits = creditsPerfil - restarDePerfil;
      const descripcion =
        tipoPromo === "galeria"
          ? `Promoción Galería, ${timeSlots.length} franja(s), ${subidasPorFranja} subidas/franja`
          : `Promoción Destacada, ${timeSlots.length} franja(s), ${subidasPorFranja} subidas/franja`;
      // Actualizar créditos del perfil si corresponde
      if (restarDePerfil > 0) {
        const { error: updateCreditsErr } = await supabase
          .from("escort_profiles")
          // @ts-expect-error credits en schema
          .update({ credits: nuevosCredits, updated_at: new Date().toISOString() })
          .eq("id", escortProfile.id);
        if (updateCreditsErr) {
          setPromoMessage(updateCreditsErr.message);
          setPromoSaving(false);
          return;
        }
      }
      // Actualizar publisher_credits si corresponde
      if (restarDePublisher > 0) {
        const { error: updatePublisherErr } = await supabase
          .from("profiles")
          // @ts-expect-error publisher_credits en schema
          .update({ publisher_credits: creditsPublisher - restarDePublisher, updated_at: new Date().toISOString() })
          .eq("id", user.id);
        if (updatePublisherErr) {
          setPromoMessage(updatePublisherErr.message);
          setPromoSaving(false);
          return;
        }
      }
      const { error: txErr } = await supabase
        .from("credit_transactions")
        // @ts-expect-error tipo promocion añadido en migración
        .insert({
          user_id: user.id,
          escort_profile_id: escortProfile.id,
          amount: -coste,
          type: "promocion",
          description,
        });
      if (txErr) {
        setPromoMessage(txErr.message);
        setPromoSaving(false);
        return;
      }
    }

    const { error } = await supabase
      .from("escort_profiles")
      // @ts-expect-error Supabase generated types pueden no incluir time_slot/time_slots/subidas_per_day/promotion/active_until
      .update({
        time_slot: canEditSubidas ? (timeSlots[0]?.trim() || null) : ((escortProfile as { time_slot?: string }).time_slot ?? "09-12"),
        time_slots: canEditSubidas
          ? timeSlots
          : ((escortProfile as { time_slots?: string[] }).time_slots ?? [(escortProfile as { time_slot?: string }).time_slot ?? "09-12"]),
        subidas_per_day: canEditSubidas
          ? timeSlots.length * subidasPorFranja
          : (escortProfile as { subidas_per_day?: number }).subidas_per_day === 5
            ? 5
            : (escortProfile as { subidas_per_day?: number }).subidas_per_day ?? 10,
        promotion:
          promotion.trim() === "galeria"
            ? "galeria"
            : promotion.trim() === "destacada"
              ? "destacada"
              : null,
        ...(tienePromo
          ? {
              active_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              available: true,
            }
          : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", escortProfile.id);
    setPromoSaving(false);
    if (error) setPromoMessage(error.message);
    else {
      setPromoMessage("Promoción guardada.");
      if (tienePromo && coste != null && coste > 0) {
        setCreditsTotalInEditView((prev) => (prev != null ? prev - coste : null));
      }
      if (tienePromo) {
        const newActiveUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        setActiveUntil(newActiveUntil);
        setAvailable(true);
      }
    }
  };

  const calcularCreditosPromocion = (): number | null => {
    const tipo = promotion.trim();
    const totalSubidas = timeSlots.length * subidasPorFranja;
    if (!tipo || (tipo !== "galeria" && tipo !== "destacada")) return null;
    if (totalSubidas === 0) return null;
    // Regla coherente: base + por subida. Galería 30+4×N, Destacada 30+6×N (mantiene 5→50/60, 10→70/90)
    if (tipo === "galeria") return 30 + 4 * totalSubidas;
    if (tipo === "destacada") return 30 + 6 * totalSubidas;
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setSaving(true);
    setMessage("");
    const { error } = await supabase
      .from("escort_profiles")
      // @ts-expect-error Supabase generated types pueden quedarse desfasados frente al schema real
      .update({
        name: name.trim(),
        age: parseInt(age, 10) || 0,
        badge: badge.trim() || null,
        image: image.trim() || null,
        gallery: gallery,
        available,
        description: description.trim() || null,
        zone: zone.trim() || null,
        schedule: schedule.trim() || null,
        whatsapp: whatsapp.trim() || null,
        services_included: servicesIncluded,
        services_extra: servicesExtra,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);
    setSaving(false);
    if (error) setMessage(error.message);
    else {
      setMessage("Guardado.");
      setShowEditForm(false);
    }
  };

  const handlePausar = async () => {
    if (!supabase) return;
    setSaving(true);
    const newAvailable = !available;
    const { error } = await supabase
      .from("escort_profiles")
      // @ts-expect-error Supabase generated types pueden quedarse desfasados frente al schema real
      .update({ available: newAvailable, updated_at: new Date().toISOString() })
      .eq("id", profile.id);
    setSaving(false);
    if (!error) {
      setAvailable(newAvailable);
      setMessage(newAvailable ? "Perfil activado." : "Perfil pausado.");
    } else setMessage(error.message);
  };

  const handleEliminar = async () => {
    if (!supabase || !user?.id) return;
    setDeleting(true);
    const { error } = await supabase.from("escort_profiles").delete().eq("id", profile.id);
    setDeleting(false);
    setDeleteDialogOpen(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    const { data: remaining } = await supabase.from("escort_profiles").select("id").eq("user_id", user.id);
    if (!remaining || remaining.length === 0) {
      // @ts-expect-error Supabase generated types pueden quedarse desfasados frente al schema real
      await supabase.from("profiles").update({ role: "visitor", updated_at: new Date().toISOString() }).eq("id", user.id);
      await supabase.auth.signOut();
      navigate("/", { replace: true });
    } else {
      navigate("/cuenta", { replace: true });
    }
  };

  const previewImage = image || (gallery.length > 0 ? gallery[0] : null);
  const displayImage = previewImage || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80";

  return (
    <div className="min-h-screen bg-background pb-32">
      <SeoHead title="Editar perfil | Punto Cachero" description="Editar perfil de acompañante." canonicalPath="/cuenta" robots="noindex, nofollow" noSocial />
      <div className="max-w-3xl mx-auto">
        <div className="px-4 pt-4 pb-2">
          <Link to="/cuenta" className="text-sm text-gold hover:underline flex items-center gap-1">
            ← Volver al dashboard
          </Link>
        </div>
        {/* Imagen principal como en perfil público */}
        <div className="relative">
          <div className="relative aspect-[3/4] max-h-[70vh] overflow-hidden">
            <img src={displayImage} alt="Vista previa del perfil" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>
          <Link
            to={`/perfil/${profile.id}`}
            className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 text-foreground"
          >
            <span className="text-xs font-medium">Ver</span>
          </Link>
        </div>

        {/* Contenido: nombre, ciudad, badge, tags, SOBRE MÍ, cards */}
        <div className="px-4 -mt-8 relative z-10">
          {isProfileExpired && (
            <div className="mb-6 p-4 rounded-2xl border border-amber-500/50 bg-amber-500/10 space-y-3">
              <p className="text-sm font-medium text-amber-200">
                Tu perfil está oculto. El período de 7 días venció y ya no apareces en los listados.
              </p>
              <Button
                className="w-full h-11 rounded-2xl bg-gold text-primary-foreground font-semibold"
                onClick={handleActivar7Dias}
                disabled={activating}
              >
                {activating ? "Activando…" : "Activar 7 días más"}
              </Button>
            </div>
          )}
          {activeUntil && !isProfileExpired && (
            <div className="mb-6 p-4 rounded-2xl border-2 border-gold/60 bg-gold/15 space-y-3">
              <p className="text-center text-sm font-bold uppercase tracking-wide text-gold">
                Visible tu perfil hasta el {new Date(activeUntil).toLocaleDateString("es-CL", { dateStyle: "long" })}
              </p>
              <Button
                variant="outline"
                className="w-full h-11 rounded-2xl border-amber-500/60 text-amber-200 hover:bg-amber-500/20"
                onClick={handlePausarPerfil}
                disabled={pausing}
              >
                {pausing ? "Pausando…" : "Pausar / Ocultar perfil"}
              </Button>
            </div>
          )}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-bold">
                  {name || "—"}, {age || "—"}
                </h1>
                <p className="text-muted-foreground flex items-center gap-1.5 mt-1">
                  <MapPin className="w-4 h-4" />
                  {(profileData as ProfileWithCity | null)?.cities?.name ?? "—"}
                </p>
              </div>
              {badge && (
                <span className="px-3 py-1 rounded-full bg-gold/90 text-xs font-semibold text-primary-foreground">
                  {badge}
                </span>
              )}
            </div>
            <div className="flex gap-2 mt-4 flex-wrap">
              {available && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass text-xs">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Disponible
                </span>
              )}
              {!available && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass text-xs text-muted-foreground">
                  <Pause className="w-3 h-3" />
                  Perfil pausado
                </span>
              )}
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass text-xs text-muted-foreground">
                <Shield className="w-3 h-3 text-gold" />
                Verificada
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass text-xs text-muted-foreground">
                <Star className="w-3 h-3 text-gold" />
                4.9
              </span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gold uppercase tracking-wider mb-3">Sobre mí</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description || "Perfil verificado. Conecta con acompañantes premium en el sur de Chile."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Building2, label: "Dirección", value: schedule || "—" },
              { icon: MapPin, label: "Zona", value: zone || "—" },
              { icon: Star, label: "Experiencia", value: "Verificada" },
              { icon: Shield, label: "Verificación", value: "Completa" },
              { icon: Calendar, label: "Disponibilidad", value: available ? "Disponible" : "Consultar" },
              { icon: MessageCircle, label: "WhatsApp", value: whatsapp || "—" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="p-4 rounded-2xl glass">
                <Icon className="w-4 h-4 text-gold mb-2" />
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          {/* Servicios Incluidos y Adicionales */}
          {(servicesIncluded.length > 0 || servicesExtra.length > 0) && (
            <div className="space-y-8 mb-12">
              {servicesIncluded.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Servicios Incluidos</p>
                  <div className="flex flex-wrap gap-3">
                    {servicesIncluded.map((tag) => (
                      <span key={tag} className="px-3 py-1.5 rounded-xl bg-red-700/90 text-white text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {servicesExtra.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Adicionales</p>
                  <div className="flex flex-wrap gap-3">
                    {servicesExtra.map((tag) => (
                      <span key={tag} className="px-3 py-1.5 rounded-xl bg-red-700/90 text-white text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Botones llamativos: mismo estilo que Contactar / Cerrar sesión */}
          <div className="space-y-4 mb-12">
            <Button
              className="w-full h-12 rounded-2xl bg-gold text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gold/90 transition-all active:scale-[0.98]"
              onClick={() => {
                setShowEditForm(true);
                setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
              }}
            >
              <Pencil className="h-4 w-4" />
              Editar perfil
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 border-border hover:bg-muted transition-all active:scale-[0.98]"
              onClick={handlePausar}
              disabled={saving}
            >
              <Pause className="h-4 w-4" />
              {available ? "Pausar perfil" : "Activar perfil"}
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 border-destructive text-destructive hover:bg-destructive/10 transition-all active:scale-[0.98]"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Eliminar perfil
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 border-gold text-gold hover:bg-gold/10 transition-all active:scale-[0.98]"
              asChild
            >
              <Link to="/">← Volver al inicio</Link>
            </Button>
          </div>
        </div>

        {/* Formulario de edición: solo visible al hacer clic en "Editar perfil" */}
        {showEditForm && (
        <div className="px-4 pt-6 border-t border-border">
          <h2 className="text-xl font-display font-bold mb-4">Editar datos</h2>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          {message && (
            <p className={`text-sm ${message === "Guardado." ? "text-green-600" : "text-destructive"}`}>
              {message}
            </p>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required className="bg-surface" />
            </div>
            <div className="space-y-2">
              <Label>Edad</Label>
              <Input type="number" min={18} value={age} onChange={(e) => setAge(e.target.value)} required className="bg-surface" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select
              value={badge || CATEGORIA_NINGUNO}
              onValueChange={(v) => setBadge(v === CATEGORIA_NINGUNO ? "" : v)}
              disabled={!!profile?.id}
            >
              <SelectTrigger className="bg-surface rounded-xl" disabled={!!profile?.id}>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CATEGORIA_NINGUNO}>Ninguna</SelectItem>
                {CATEGORIA_OPCIONES.map((opcion) => (
                  <SelectItem key={opcion} value={opcion}>
                    {opcion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {profile?.id && (
              <p className="text-xs text-muted-foreground">La categoría no se puede modificar después de crear el perfil.</p>
            )}
          </div>
          {/* Promoción, franja y subidas se gestionan en el bloque separado de \"Promoción\" */}
          <div className="space-y-2">
            <Label>Imagen principal</Label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    disabled={uploadingImage}
                    onChange={handleImageUpload}
                  />
                  <span className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-gold text-primary-foreground hover:bg-gold/90 h-9 px-4">
                    {uploadingImage ? "Subiendo…" : "Subir desde tu dispositivo"}
                  </span>
                </label>
                <span className="text-xs text-muted-foreground">JPG, PNG, WebP o GIF. Máx. 5 MB.</span>
              </div>
              {uploadImageError && (
                <p className="text-sm text-destructive">{uploadImageError}</p>
              )}
              {image && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1">Vista previa:</p>
                  <img
                    src={image}
                    alt="Vista previa"
                    className="rounded-lg border border-border object-cover max-h-40 w-auto"
                    onError={() => setUploadImageError("No se pudo cargar la imagen. Sube otra desde tu dispositivo.")}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Galería (máx. {MAX_TOTAL_PHOTOS} fotos en total)</Label>
            <p className="text-xs text-muted-foreground">
              Imagen principal + hasta {MAX_GALLERY} fotos más. Llevas {gallery.length}/{MAX_GALLERY} en galería.
            </p>
            {galleryError && <p className="text-sm text-destructive">{galleryError}</p>}
            <div className="flex flex-wrap gap-2">
              {gallery.map((url, index) => (
                <div key={url} className="relative group">
                  <img
                    src={url}
                    alt="Foto de galería"
                    className="h-20 w-20 rounded-lg object-cover border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(index)}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center opacity-90 hover:opacity-100"
                    aria-label="Quitar foto"
                  >
                    ×
                  </button>
                </div>
              ))}
              {gallery.length < MAX_GALLERY && (
                <label className="h-20 w-20 rounded-lg border border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    className="sr-only"
                    disabled={uploadingGallery}
                    onChange={handleGalleryUpload}
                  />
                  <span className="text-xs text-muted-foreground">
                    {uploadingGallery ? "…" : "+"}
                  </span>
                </label>
              )}
            </div>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} className="rounded border-border" />
            <span className="text-sm">Disponible</span>
          </label>

          <div className="space-y-3">
            <Label>Servicios Incluidos</Label>
            <p className="text-xs text-muted-foreground">Elige las etiquetas que ofreces incluidos.</p>
            <div className="flex flex-wrap gap-2">
              {SERVICIOS_OPCIONES.incluidos.map((tag) => {
                const selected = servicesIncluded.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setServicesIncluded((prev) => selected ? prev.filter((t) => t !== tag) : [...prev, tag])}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                      selected ? "bg-red-700/90 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-3">
            <Label>Adicionales</Label>
            <p className="text-xs text-muted-foreground">Elige las etiquetas de servicios adicionales.</p>
            <div className="flex flex-wrap gap-2">
              {SERVICIOS_OPCIONES.adicionales.map((tag) => {
                const selected = servicesExtra.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setServicesExtra((prev) => selected ? prev.filter((t) => t !== tag) : [...prev, tag])}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                      selected ? "bg-red-700/90 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label>Descripción</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-lg text-xs font-medium gap-1.5 border-gold text-gold hover:bg-gold/10"
                onClick={() =>
                  setDescription(
                    generarDescripcionAleatoria(
                      name,
                      age,
                      (profileData as ProfileWithCity | null)?.cities?.name ?? "",
                      servicesIncluded,
                      servicesExtra,
                    ),
                  )
                }
              >
                <Shuffle className="h-3.5 w-3.5" />
                Texto aleatorio
              </Button>
            </div>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-surface px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Zona</Label>
              <Input value={zone} onChange={(e) => setZone(e.target.value)} placeholder="Ej. Centro" className="bg-surface" />
            </div>
            <div className="space-y-2">
              <Label>Dirección</Label>
              <Input value={schedule} onChange={(e) => setSchedule(e.target.value)} placeholder="Ej. Calle, número" className="bg-surface" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>WhatsApp</Label>
            <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+569..." className="bg-surface" />
          </div>
          <div className="flex gap-3">
            <Button type="submit" className="flex-1 h-12 rounded-2xl bg-gold text-primary-foreground font-semibold" disabled={saving}>
              {saving ? "Guardando…" : "Guardar"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-2xl font-semibold px-6 border-border hover:bg-muted"
              onClick={() => setShowEditForm(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
        </div>
        )}

      </div>

      <Dialog open={promoDialogOpen} onOpenChange={setPromoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promoción y subidas</DialogTitle>
            <DialogDescription>
              Gestiona la promoción de tu perfil, la franja horaria y las subidas por día.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Promoción</Label>
              <Select
                value={promotion || "__ninguna__"}
                onValueChange={(v) => setPromotion(v === "__ninguna__" ? "" : v)}
              >
                <SelectTrigger className="bg-surface rounded-xl">
                  <SelectValue placeholder="Selecciona una promoción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__ninguna__">Ninguna</SelectItem>
                  <SelectItem value="galeria">Galería</SelectItem>
                  <SelectItem value="destacada">Destacada</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Galería: carrusel en la página de tu ciudad (orden por subidas 5 o 10). Destacada: prioridad en el listado.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Franjas horarias para subidas</Label>
              <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/20 p-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={TIME_SLOTS.every((t) => timeSlots.includes(t.value))}
                    onCheckedChange={(checked) => {
                      if (checked) setTimeSlots(TIME_SLOTS.map((t) => t.value));
                      else setTimeSlots([]);
                    }}
                    disabled={!canEditSubidas}
                  />
                  <span className="text-sm font-medium">Todas las franjas</span>
                </label>
                {TIME_SLOTS.map((t) => (
                  <label key={t.value} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={timeSlots.includes(t.value)}
                      onCheckedChange={(checked) => {
                        if (checked) setTimeSlots((prev) => [...prev, t.value].sort());
                        else setTimeSlots((prev) => prev.filter((s) => s !== t.value));
                      }}
                      disabled={!canEditSubidas}
                    />
                    <span className="text-sm">{t.label}</span>
                  </label>
                ))}
              </div>
              {!canEditSubidas && (
                <p className="text-xs text-amber-500">
                  Franjas se pueden cambiar solo cuando termine tu período de 7 días (perfil oculto).
                </p>
              )}
              {!canEditSubidas && activeUntil && (
                <p className="text-sm font-medium text-gold">
                  Promoción activa hasta el {new Date(activeUntil).toLocaleDateString("es-CL", { dateStyle: "long" })}. Podrás cambiar cuando termine el período.
                </p>
              )}
              {canEditSubidas && (
                <p className="text-xs text-muted-foreground">
                  Cada franja elegida da {subidasPorFranja} subidas al día en ese horario. Total:{" "}
                  <strong>
                    {timeSlots.length} franja(s) × {subidasPorFranja} = {timeSlots.length * subidasPorFranja} subidas/día
                  </strong>
                  .
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Subidas por franja</Label>
              <Select
                value={String(subidasPorFranja)}
                onValueChange={(v) => setSubidasPorFranja(Number(v) === 5 ? 5 : 10)}
                disabled={!canEditSubidas}
              >
                <SelectTrigger className="bg-surface rounded-xl" disabled={!canEditSubidas}>
                  <SelectValue placeholder="Elige subidas por franja" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 subidas por franja</SelectItem>
                  <SelectItem value="5">5 subidas por franja</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(() => {
              const credits = calcularCreditosPromocion();
              const total = creditsTotalInEditView ?? 0;
              const coste = credits ?? 0;
              const restantes = total - coste;
              return (
                <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-sm font-medium">
                    Tienes <span className="font-semibold text-foreground">{total} créditos</span> en total.
                  </p>
                  <p className="text-sm">
                    {credits != null ? (
                      <>
                        Esta combinación cuesta{" "}
                        <span className="font-semibold text-gold">{credits} créditos</span>{" "}
                        por 7 días.
                      </>
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        Selecciona tipo de promoción y al menos una franja para ver el costo en créditos.
                      </span>
                    )}
                  </p>
                  {credits != null && credits > 0 && (
                    <p className="text-sm">
                      {restantes >= 0 ? (
                        <>
                          Te quedarán{" "}
                          <span className="font-semibold text-foreground">{restantes} créditos</span>.
                        </>
                      ) : (
                        <span className="font-medium text-destructive">
                          No tienes suficientes créditos (te faltan {Math.abs(restantes)}).
                        </span>
                      )}
                    </p>
                  )}
                </div>
              );
            })()}
            {promoMessage && (
              <p className={`text-xs ${promoMessage === "Promoción guardada." ? "text-green-500" : "text-destructive"}`}>
                {promoMessage}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              className="w-full h-10 rounded-xl bg-gold text-primary-foreground text-sm font-semibold"
              onClick={handleSavePromocion}
              disabled={promoSaving || !canEditSubidas || ((promotion.trim() === "galeria" || promotion.trim() === "destacada") && timeSlots.length === 0)}
            >
              {promoSaving ? "Activando promoción…" : "Activar promoción"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tu perfil?</AlertDialogTitle>
            <AlertDialogDescription>
              Se borrará tu perfil público de forma permanente. No podrás recuperarlo. ¿Continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleEliminar(); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
            >
              {deleting ? "Eliminando…" : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
