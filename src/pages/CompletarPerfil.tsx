import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SeoHead } from "@/components/SeoHead";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WhatsAppChileInput } from "@/components/WhatsAppChileInput";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CitiesRow } from "@/types/database";
import { PAISES_LATINOAMERICANOS } from "@/lib/paises-latinoamericanos";
import { addWatermarkToImageFileAsFile } from "@/lib/watermark";
import { recordPublisherAudit } from "@/lib/publisher-audit";
import { Shuffle } from "lucide-react";

/** Palabras clave para el botón "Texto aleatorio" en Descripción. */
const DESC_PALABRAS = {
  inicios: ["Soy", "Hola, soy", "Mi nombre es", "Encantada,"],
  adjetivos: ["discreta", "una escort", "caliente", "profesional", "amigable", "elegante", "cálida", "reservada", "verificada", "seria"],
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
  frasesSeo: [
    "Perfil verificado en Hola Cachero, escorts en Rancagua.",
    "Acompañante en Rancagua, dama de compañía disponible.",
    "En Hola Cachero encontrarás mi perfil con otras escorts en Rancagua.",
    "Soy una de las acompañantes en Rancagua en Hola Cachero.",
    "Dama de compañía en Rancagua, escort en Rancagua.",
    "Escort en Rancagua verificada en Hola Cachero.",
    "Acompañantes en Rancagua: mi perfil en Hola Cachero.",
  ],
  cierres: [
    "Escríbeme y coordinamos.",
    "Contáctame para más información.",
    "Te espero.",
    "Reserva con confianza.",
    "Hola Cachero – escorts en Rancagua y acompañantes.",
  ],
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
  const fraseSeo = pick(DESC_PALABRAS.frasesSeo);
  const cierre = pick(DESC_PALABRAS.cierres);
  return (parte1 + parte2 + parte3 + " " + fraseSeo + parteServicios + " " + cierre).replace(/\s+/g, " ").trim();
}

const CATEGORIA_NINGUNO = "__ninguno__";
const CATEGORIA_OPCIONES = ["Escort Mujer", "Escort Trans", "Escort Hombre"];

const SERVICIOS_OPCIONES = {
  incluidos: [
    "Americana corporal",
    "Eyaculación facial",
    "Beso negro",
    "Juguetes eróticos",
    "Lenceria",
    "Besos boca",
    "Fantasias y disfraces",
    "Masajes eróticos",
    "Oral con condon",
    "Sexo anal",
    "Trato de polola",
    "Oral sin condon",
    "Fetichismo",
    "Garganta profunda",
    "Lluvia dorada",
    "Trios",
    "Masajes",
    "Sado duro",
    "Sado suave",
    "A domicilio",
    "Apartamento propio",
    "Diferentes posiciones",
  ],
  adicionales: [
    "Atención a parejas",
    "Pago con tarjeta",
    "Atención a hombres",
    "Atención a mujeres",
    "Atención a discapacitado",
    "Piel blanca",
    "Pelinegra",
    "Bajita",
    "Tetona",
    "Culona",
    "Depilada",
    "Atencion en Hoteles",
    "Despedida de Solteros",
    "Viajes",
  ],
};

export default function CompletarPerfil() {
  const { user, role, isLoading } = useAuth();
  const navigate = useNavigate();
  const [cities, setCities] = useState<CitiesRow[]>([]);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [cityId, setCityId] = useState("");
  const [badge, setBadge] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [nationality, setNationality] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [servicesIncluded, setServicesIncluded] = useState<string[]>([]);
  const [servicesExtra, setServicesExtra] = useState<string[]>([]);
  const [available, setAvailable] = useState(true);
  const [gallery, setGallery] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadImageError, setUploadImageError] = useState("");
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [galleryError, setGalleryError] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const MAX_IMAGE_SIZE_MB = 5;
  const MAX_TOTAL_PHOTOS = 6;
  const MAX_GALLERY = MAX_TOTAL_PHOTOS - 1;

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
    try {
      const fileWithWatermark = await addWatermarkToImageFileAsFile(file);
      const ext = fileWithWatermark.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/new-main-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("escort-images").upload(path, fileWithWatermark, {
        cacheControl: "3600",
        upsert: false,
      });
      if (uploadErr) {
        setUploadImageError(uploadErr.message || "Error al subir la imagen");
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from("escort-images").getPublicUrl(path);
      setImage(publicUrl);
    } catch (err) {
      setUploadImageError(err instanceof Error ? err.message : "Error al aplicar marca de agua");
    } finally {
      setUploadingImage(false);
    }
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
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileWithWatermark = await addWatermarkToImageFileAsFile(file);
        const ext = fileWithWatermark.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${user.id}/new-gallery-${Date.now()}-${i}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("escort-images").upload(path, fileWithWatermark, {
          cacheControl: "3600",
          upsert: false,
        });
        if (uploadErr) {
          setGalleryError(uploadErr.message || "Error al subir");
          return;
        }
        const { data: { publicUrl } } = supabase.storage.from("escort-images").getPublicUrl(path);
        newUrls.push(publicUrl);
      }
      setGallery((prev) => [...prev, ...newUrls].slice(0, MAX_GALLERY));
    } catch (err) {
      setGalleryError(err instanceof Error ? err.message : "Error al aplicar marca de agua");
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGallery((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("cities")
      .select("id, name, slug")
      .order("name")
      .then(({ data }) => setCities((data as CitiesRow[]) ?? []));
  }, []);

  const cityName = cities.find((c) => c.id === cityId)?.name ?? "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user?.id) return;
    if (!name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (!age.trim() || parseInt(age, 10) < 18) {
      setError("La edad es obligatoria (mínimo 18).");
      return;
    }
    if (!cityId.trim()) {
      setError("La ciudad es obligatoria.");
      return;
    }
    if (!badge.trim() || badge === CATEGORIA_NINGUNO) {
      setError("La categoría es obligatoria.");
      return;
    }
    if (!image.trim()) {
      setError("La imagen principal es obligatoria. Sube una foto desde tu dispositivo.");
      return;
    }
    if (servicesIncluded.length < 3) {
      setError("Selecciona al menos 3 etiquetas en Servicios incluidos.");
      return;
    }
    if (servicesExtra.length < 3) {
      setError("Selecciona al menos 3 etiquetas en Adicionales.");
      return;
    }
    if (!description.trim()) {
      setError("La descripción es obligatoria.");
      return;
    }
    if (!whatsapp.trim()) {
      setError("El WhatsApp es obligatorio.");
      return;
    }
    setError("");
    setSaving(true);
    const payload = {
      user_id: user.id,
      city_id: cityId,
      name: name.trim(),
      age: parseInt(age, 10) || 0,
      badge: badge.trim() || null,
      image: image.trim() || null,
      available,
      gallery,
      description: description.trim() || null,
      nationality: nationality.trim() || null,
      zone: null,
      schedule: null,
      whatsapp: whatsapp.trim() || null,
      services_included: servicesIncluded,
      services_extra: servicesExtra,
      time_slot: null,
      time_slots: [] as string[],
      subidas_per_day: null,
      promotion: null,
      active_until: null,
      updated_at: new Date().toISOString(),
    };
    const { data, error: insertError } = await supabase
      .from("escort_profiles")
      // @ts-expect-error Supabase types pueden no incluir todos los campos
      .insert(payload)
      .select("id")
      .single();
    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    const newId = (data as { id: string } | null)?.id;
    if (newId && user?.id) {
      recordPublisherAudit(user.id, "create_profile", { escortProfileId: newId }).catch(() => {});
    }
    if (newId) navigate(`/cuenta/perfil/${newId}`, { replace: true });
    else navigate("/cuenta", { replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando…</p>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <p className="text-muted-foreground">
          <Link to="/login" className="text-gold hover:underline">Inicia sesión</Link> para crear un anuncio.
        </p>
      </div>
    );
  }
  if (role !== "registered_user") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <p className="text-muted-foreground">
          Solo usuarios registrados pueden crear anuncios. <Link to="/cuenta" className="text-gold hover:underline">Ir a Mi cuenta</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 pb-28">
      <SeoHead
        title="Completar perfil | Punto Cachero"
        description="Crea tu anuncio de acompañante."
        canonicalPath="/completar-perfil"
        robots="noindex, nofollow"
        noSocial
      />
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-display font-bold">Nuevo anuncio</h1>
        <p className="text-sm text-muted-foreground">
          Completa todos los datos; todos los campos son obligatorios. Debes elegir al menos 3 servicios incluidos y 3 adicionales.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-destructive rounded-lg bg-destructive/10 p-3">{error}</p>
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
            <Label>Ciudad</Label>
            <Select value={cityId} onValueChange={setCityId} required>
              <SelectTrigger className="bg-surface rounded-xl">
                <SelectValue placeholder="Selecciona ciudad" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select value={badge || CATEGORIA_NINGUNO} onValueChange={(v) => setBadge(v === CATEGORIA_NINGUNO ? "" : v)} required>
              <SelectTrigger className="bg-surface rounded-xl" aria-required="true">
                <SelectValue placeholder="Selecciona categoría (obligatorio)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CATEGORIA_NINGUNO}>Ninguna</SelectItem>
                {CATEGORIA_OPCIONES.map((op) => (
                  <SelectItem key={op} value={op}>{op}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Imagen principal (obligatorio)</Label>
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

          <div className="space-y-3">
            <Label>Servicios Incluidos</Label>
            <p className="text-xs text-muted-foreground">Elige las etiquetas que ofreces incluidos. Mínimo 3.</p>
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
          <div className="space-y-3">
            <Label>Adicionales</Label>
            <p className="text-xs text-muted-foreground">Elige las etiquetas de servicios adicionales. Mínimo 3.</p>
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
            <Label htmlFor="nationality">Nacionalidad</Label>
            <select
              id="nationality"
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm"
            >
              <option value="">Selecciona nacionalidad</option>
              {PAISES_LATINOAMERICANOS.map((pais) => (
                <option key={pais} value={pais}>
                  {pais}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>WhatsApp (obligatorio)</Label>
            <WhatsAppChileInput value={whatsapp} onChange={setWhatsapp} required />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
              className="rounded border-border"
            />
            <span className="text-sm">Disponible</span>
          </label>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label>Descripción</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-lg text-xs font-medium gap-1.5 border-gold text-gold hover:bg-gold/10"
                onClick={() =>
                  setDescription(generarDescripcionAleatoria(name, age, cityName, servicesIncluded, servicesExtra))
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
              required
              placeholder="Escribe una descripción de tu perfil"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1 h-12 rounded-2xl bg-gold text-primary-foreground font-semibold" disabled={saving}>
              {saving ? "Guardando…" : "Crear anuncio"}
            </Button>
            <Button type="button" variant="outline" className="h-12 rounded-2xl font-semibold px-6 border-border hover:bg-muted" asChild>
              <Link to="/cuenta">Cancelar</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
