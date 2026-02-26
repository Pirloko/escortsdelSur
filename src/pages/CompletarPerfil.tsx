import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SeoHead } from "@/components/SeoHead";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { TIME_SLOTS } from "@/lib/franjas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shuffle } from "lucide-react";

type CityRow = { id: string; slug: string; name: string };

const CATEGORIA_OPCIONES = ["Escort Mujer", "Escort Trans", "Escort Hombre"];
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_SIZE_MB = 5;
const MAX_TOTAL_PHOTOS = 6;
const MAX_GALLERY = MAX_TOTAL_PHOTOS - 1;

/** Palabras para el botón "Texto aleatorio" en descripción. */
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
    if (serviciosIncluidos.length > 0) partes.push(`Servicios incluidos: ${serviciosIncluidos.join(", ")}.`);
    if (serviciosAdicionales.length > 0) partes.push(`Adicionales: ${serviciosAdicionales.join(", ")}.`);
    parteServicios = " " + partes.join(" ");
  }
  const cierre = pick(DESC_PALABRAS.cierres);
  return (parte1 + parte2 + parte3 + parteServicios + " " + cierre).replace(/\s+/g, " ").trim();
}

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

export default function CompletarPerfil() {
  const { user, role, isLoading: authLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [cityId, setCityId] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [timeSlot, setTimeSlot] = useState("09-12");
  const [subidasPerDay, setSubidasPerDay] = useState(5);
  const [badge, setBadge] = useState("");
  const [promotion, setPromotion] = useState("");
  const [image, setImage] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [servicesIncluded, setServicesIncluded] = useState<string[]>([]);
  const [servicesExtra, setServicesExtra] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadImageError, setUploadImageError] = useState("");
  const [galleryError, setGalleryError] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const { data: cities = [] } = useQuery({
    queryKey: ["cities-list"],
    queryFn: async (): Promise<CityRow[]> => {
      if (!supabase) return [];
      const { data } = await supabase.from("cities").select("id, slug, name").order("name");
      return (data ?? []) as CityRow[];
    },
    enabled: !!supabase,
  });

  const MAX_PERFILES = 5;
  const { data: profileCount = 0, isLoading: loadingCount } = useQuery({
    queryKey: ["escort_profiles_count", user?.id],
    queryFn: async (): Promise<number> => {
      if (!supabase || !user?.id) return 0;
      const { data } = await supabase.from("escort_profiles").select("id").eq("user_id", user.id);
      return (data ?? []).length;
    },
    enabled: !!user?.id && !!supabase,
  });

  useEffect(() => {
    if (!user?.user_metadata) return;
    const meta = user.user_metadata as Record<string, unknown>;
    if (meta.display_name && !name) setName(String(meta.display_name));
    if (meta.age != null && !age) setAge(String(meta.age));
    if (meta.whatsapp && !whatsapp) setWhatsapp(String(meta.whatsapp));
  }, [user?.user_metadata, name, age, whatsapp]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login", { replace: true, state: { from: { pathname: "/completar-perfil" } } });
      return;
    }
    if (role === "registered_user" && profileCount >= MAX_PERFILES) {
      navigate("/cuenta", { replace: true });
    }
  }, [user, role, profileCount, authLoading, navigate]);

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
    const path = `${user.id}/new/${Date.now()}-main.${ext}`;
    const { error: uploadError } = await supabase.storage.from("escort-images").upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });
    setUploadingImage(false);
    if (uploadError) {
      setUploadImageError(uploadError.message || "Error al subir la imagen");
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
      const path = `${user.id}/new/${Date.now()}-${i}-gal.${ext}`;
      const { error: uploadError } = await supabase.storage.from("escort-images").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (uploadError) {
        setGalleryError(uploadError.message || "Error al subir");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user?.id) return;
    setError("");
    if (!cityId.trim()) {
      setError("Elige una ciudad");
      return;
    }
    const ageNum = parseInt(age, 10);
    if (Number.isNaN(ageNum) || ageNum < 18) {
      setError("Edad debe ser 18 o más");
      return;
    }
    if (!image.trim()) {
      setError("Sube al menos la imagen principal");
      return;
    }
    setSaving(true);
    const activeUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    // @ts-expect-error Supabase generated types can be strict
    const { error: insertErr } = await supabase.from("escort_profiles").insert({
      user_id: user.id,
      city_id: cityId.trim(),
      name: name.trim() || "Usuario",
      age: ageNum,
      badge: badge.trim() || null,
      image: image.trim() || null,
      gallery: gallery,
      description: description.trim() || null,
      services_included: servicesIncluded,
      services_extra: servicesExtra,
      whatsapp: whatsapp.trim() || null,
      available: true,
      active_until: activeUntil,
      time_slot: timeSlot,
      subidas_per_day: subidasPerDay,
      promotion: promotion.trim() === "galeria" ? "galeria" : promotion.trim() === "destacada" ? "destacada" : null,
    });
    if (insertErr) {
      setError(insertErr.message || "Error al crear perfil");
      setSaving(false);
      return;
    }
    // @ts-expect-error Supabase generated types
    const { error: updateErr } = await supabase.from("profiles").update({ role: "registered_user", updated_at: new Date().toISOString() }).eq("id", user.id);
    if (updateErr) {
      setError(updateErr.message || "Error al actualizar");
      setSaving(false);
      return;
    }
    await refreshProfile();
    setSaving(false);
    navigate("/cuenta", { replace: true });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando…</p>
      </div>
    );
  }
  if (!user) return null;
  if (role === "registered_user" && profileCount >= MAX_PERFILES) return null;
  if (loadingCount) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <SeoHead title="Completar perfil | Punto Cachero" description="Completa tu perfil de acompañante." canonicalPath="/completar-perfil" robots="noindex, nofollow" noSocial />
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-foreground">Completar perfil</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Elige tu ciudad, categoría, sube fotos y confirma tus datos. Luego podrás editar la descripción desde tu dashboard.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">{error}</p>
          )}
          <div className="space-y-2">
            <Label htmlFor="city_id">Ciudad (obligatorio)</Label>
            <select
              id="city_id"
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              required
              className="flex h-10 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm"
            >
              <option value="">Selecciona una ciudad</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Nombre para publicar</Label>
            <Input
              id="name"
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-surface border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="age">Edad (mínimo 18)</Label>
            <Input
              id="age"
              type="number"
              min={18}
              max={120}
              placeholder="Ej. 25"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
              className="bg-surface border-border"
            />
            <p className="text-xs text-muted-foreground">Debe ser 18 años o más.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">Número para publicar (WhatsApp)</Label>
            <Input
              id="whatsapp"
              type="tel"
              placeholder="+569 12345678"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="bg-surface border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="badge">Categoría</Label>
            <select
              id="badge"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm"
            >
              <option value="">Selecciona una categoría</option>
              {CATEGORIA_OPCIONES.map((opcion) => (
                <option key={opcion} value={opcion}>
                  {opcion}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="promotion">Promoción</Label>
            <select
              id="promotion"
              value={promotion}
              onChange={(e) => setPromotion(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm"
            >
              <option value="">Selecciona una promoción</option>
              <option value="galeria">Galeria</option>
              <option value="destacada">Destacada</option>
            </select>
            <p className="text-xs text-muted-foreground">Galeria: carrusel en la página de tu ciudad (orden según tus subidas 5 o 10). Destacada: prioridad en el listado.</p>
          </div>
          <div className="space-y-2">
            <Label>Servicios incluidos</Label>
            <p className="text-xs text-muted-foreground">Elige las etiquetas que ofreces incluidos.</p>
            <div className="flex flex-wrap gap-2">
              {SERVICIOS_OPCIONES.incluidos.map((tag) => {
                const selected = servicesIncluded.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setServicesIncluded((prev) => (selected ? prev.filter((t) => t !== tag) : [...prev, tag]))}
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
            <Label>Adicionales</Label>
            <p className="text-xs text-muted-foreground">Elige las etiquetas de servicios adicionales.</p>
            <div className="flex flex-wrap gap-2">
              {SERVICIOS_OPCIONES.adicionales.map((tag) => {
                const selected = servicesExtra.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setServicesExtra((prev) => (selected ? prev.filter((t) => t !== tag) : [...prev, tag]))}
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
              <Label htmlFor="description">Descripción</Label>
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
                      cities.find((c) => c.id === cityId)?.name ?? "",
                      servicesIncluded,
                      servicesExtra
                    )
                  )
                }
              >
                <Shuffle className="h-3.5 w-3.5" />
                Texto aleatorio
              </Button>
            </div>
            <textarea
              id="description"
              placeholder="Escribe o genera un texto para tu perfil..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-surface px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Imagen principal (obligatoria)</Label>
            <div className="flex flex-col gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  disabled={uploadingImage}
                  onChange={handleImageUpload}
                />
                <span className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-gold text-primary-foreground hover:bg-gold/90 h-9 px-4">
                  {uploadingImage ? "Subiendo…" : "Subir foto principal"}
                </span>
              </label>
              <span className="text-xs text-muted-foreground">JPG, PNG, WebP o GIF. Máx. {MAX_IMAGE_SIZE_MB} MB.</span>
              {uploadImageError && <p className="text-sm text-destructive">{uploadImageError}</p>}
              {image && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1">Vista previa:</p>
                  <img src={image} alt="Vista previa de la foto principal" className="rounded-lg border border-border object-cover max-h-40 w-auto" />
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Galería (opcional, máx. {MAX_TOTAL_PHOTOS} fotos en total)</Label>
            <p className="text-xs text-muted-foreground">
              Imagen principal + hasta {MAX_GALLERY} fotos más. Llevas {gallery.length}/{MAX_GALLERY} en galería.
            </p>
            {galleryError && <p className="text-sm text-destructive">{galleryError}</p>}
            <div className="flex flex-wrap gap-2">
              {gallery.map((url, index) => (
                <div key={url} className="relative group">
                  <img src={url} alt="Miniatura de galería" className="h-20 w-20 rounded-lg object-cover border border-border" />
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
                  <span className="text-xs text-muted-foreground">{uploadingGallery ? "…" : "+"}</span>
                </label>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="time_slot">Franja horaria para subidas</Label>
            <select
              id="time_slot"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm"
            >
              {TIME_SLOTS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Tu perfil aparecerá entre los primeros del listado dentro de esta franja (según las subidas que elijas abajo).
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subidas_per_day">Subidas por día</Label>
            <select
              id="subidas_per_day"
              value={subidasPerDay}
              onChange={(e) => setSubidasPerDay(Number(e.target.value))}
              className="flex h-10 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm"
            >
              <option value={5}>5 subidas al día</option>
              <option value={10}>10 subidas al día</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Tu perfil aparecerá entre los primeros del listado {subidasPerDay} veces al día, repartidas al azar en la franja elegida.
            </p>
          </div>
          <Button type="submit" className="w-full bg-gold text-primary-foreground hover:bg-gold/90" disabled={saving}>
            {saving ? "Creando…" : "Crear mi perfil"}
          </Button>
        </form>
        <p className="text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  );
}
