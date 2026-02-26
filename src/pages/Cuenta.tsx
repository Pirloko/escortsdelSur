import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
import { Pencil, Pause, Trash2, LogOut, MapPin, Building2, Shield, Star, MessageCircle, Calendar, Shuffle, LayoutDashboard, User, Plus } from "lucide-react";
import type { EscortProfilesRow } from "@/types/database";
import type { CitiesRow } from "@/types/database";
import { TIME_SLOTS } from "@/lib/franjas";

/** Palabras clave para el botón "Texto aleatorio" en Descripción. Edita estos arrays manualmente. */
const DESC_PALABRAS = {
  inicios: ["Soy", "Hola, soy", "Mi nombre es", "Encantada,"],
  adjetivos: ["discreta", "profesional", "amigable", "elegante", "cálida", "reservada", "verificada", "seria"],
  frases: [
    "disfruto de buenos momentos",
    "me adapto a lo que buscas",
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
  const { user, role, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileWithCity | null>(null);
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
  const [timeSlot, setTimeSlot] = useState("09-12");
  const [subidasPerDay, setSubidasPerDay] = useState(10);
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
  const formRef = useRef<HTMLFormElement>(null);

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
            setProfile(null);
            return;
          }
          const row = data as ProfileWithCity;
          if (row.user_id !== user.id) {
            setProfile(null);
            return;
          }
          setProfile(row);
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
          setTimeSlot((p as { time_slot?: string }).time_slot ?? "09-12");
          setSubidasPerDay((p as { subidas_per_day?: number }).subidas_per_day === 5 ? 5 : 10);
          setGallery(Array.isArray(p.gallery) ? p.gallery : []);
          setServicesIncluded(Array.isArray((p as { services_included?: string[] }).services_included) ? (p as { services_included: string[] }).services_included : []);
          setServicesExtra(Array.isArray((p as { services_extra?: string[] }).services_extra) ? (p as { services_extra: string[] }).services_extra : []);
          setActiveUntil((p as { active_until?: string | null }).active_until ?? null);
        });
    } else {
      setDashboardLoading(true);
      supabase
        .from("escort_profiles")
        .select("*, cities(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data, error }) => {
          setDashboardLoading(false);
          if (error) return;
          const list = (data ?? []) as ProfileWithCity[];
          setProfilesList(list);
          if (list.length === 0) navigate("/completar-perfil", { replace: true });
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
        });
    }
  }, [user?.id, role, profileId, navigate]);

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
    if (dashboardLoading || profilesList.length === 0) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-muted-foreground">Cargando…</p>
        </div>
      );
    }
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
            <p className="text-sm text-muted-foreground mb-4">
              Tienes {profilesList.length} de {MAX_PERFILES} perfiles. Cada uno puede tener su propia franja y subidas.
            </p>
            <div className="space-y-3">
              {profilesList.map((p) => {
                const isExpired = p.active_until ? new Date(p.active_until) < new Date() : false;
                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl border border-border bg-card flex flex-wrap items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-medium">{p.name}, {p.age}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
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
                        <Button variant="outline" size="sm" className="gap-1">Ver</Button>
                      </Link>
                      <Button variant="outline" size="sm" className="gap-1 text-gold border-gold/50 hover:bg-gold/10" asChild>
                        <Link to={`/cuenta/perfil/${p.id}`}>
                          <Pencil className="w-3.5 h-3.5" />
                          Editar
                        </Link>
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

          <section>
            <h2 className="text-lg font-display font-bold flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-gold" />
              Datos de la cuenta
            </h2>
            <div className="p-4 rounded-xl border border-border bg-card space-y-2">
              <p className="text-sm text-muted-foreground">Correo</p>
              <p className="font-medium">{user?.email ?? "—"}</p>
            </div>
          </section>

          <div className="pt-4 border-t border-border">
            <Button variant="outline" className="w-full h-11 rounded-2xl gap-2 border-border" onClick={() => signOut().then(() => navigate("/", { replace: true }))}>
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </Button>
          </div>
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

  const isProfileExpired = activeUntil ? new Date(activeUntil) < new Date() : false;
  /** Franja y subidas solo se pueden cambiar cuando terminen los 7 días (perfil oculto) */
  const canEditSubidas = isProfileExpired;

  const handleActivar7Dias = async () => {
    if (!supabase || !profile?.id) return;
    setActivating(true);
    const newActiveUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await supabase
      .from("escort_profiles")
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
      .update({ active_until: nowIso, available: false, updated_at: nowIso })
      .eq("id", profile.id);
    setPausing(false);
    if (!error) {
      setActiveUntil(nowIso);
      setAvailable(false);
      setMessage("Perfil pausado. Ya no apareces en los listados.");
    } else setMessage(error.message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setSaving(true);
    setMessage("");
    const { error } = await supabase
      .from("escort_profiles")
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
        time_slot: canEditSubidas ? (timeSlot.trim() || null) : ((profile as { time_slot?: string }).time_slot ?? null),
        subidas_per_day: canEditSubidas ? subidasPerDay : ((profile as { subidas_per_day?: number }).subidas_per_day === 5 ? 5 : 10),
        promotion: promotion.trim() === "galeria" ? "galeria" : promotion.trim() === "destacada" ? "destacada" : null,
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
                  {profile.cities?.name ?? "—"}
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
          <div className="space-y-2">
            <Label>Promoción</Label>
            <Select value={promotion || "__ninguna__"} onValueChange={(v) => setPromotion(v === "__ninguna__" ? "" : v)}>
              <SelectTrigger className="bg-surface rounded-xl">
                <SelectValue placeholder="Selecciona una promoción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__ninguna__">Ninguna</SelectItem>
                <SelectItem value="galeria">Galeria</SelectItem>
                <SelectItem value="destacada">Destacada</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Galeria: carrusel en la página de tu ciudad (orden por subidas 5 o 10). Destacada: prioridad en el listado.</p>
          </div>
          <div className="space-y-2">
            <Label>Franja horaria para subidas</Label>
            <Select value={timeSlot || "09-12"} onValueChange={setTimeSlot} disabled={!canEditSubidas}>
              <SelectTrigger className="bg-surface rounded-xl" disabled={!canEditSubidas}>
                <SelectValue placeholder="Elige tu franja" />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!canEditSubidas && (
              <p className="text-xs text-amber-500">
                Franja y subidas se pueden cambiar solo cuando termine tu período de 7 días (perfil oculto).
              </p>
            )}
            {canEditSubidas && (
              <p className="text-xs text-muted-foreground">
                Tu perfil aparecerá entre los primeros del listado dentro de esta franja.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Subidas por día</Label>
            <Select value={String(subidasPerDay)} onValueChange={(v) => setSubidasPerDay(Number(v))} disabled={!canEditSubidas}>
              <SelectTrigger className="bg-surface rounded-xl" disabled={!canEditSubidas}>
                <SelectValue placeholder="Elige subidas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 subidas al día</SelectItem>
                <SelectItem value="5">5 subidas al día</SelectItem>
              </SelectContent>
            </Select>
            {canEditSubidas && (
              <p className="text-xs text-muted-foreground">
                Número de veces al día que tu perfil aparecerá entre los primeros (repartidas al azar en la franja).
              </p>
            )}
          </div>
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
                onClick={() => setDescription(generarDescripcionAleatoria(name, age, profile.cities?.name ?? "", servicesIncluded, servicesExtra))}
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
