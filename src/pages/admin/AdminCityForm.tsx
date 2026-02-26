import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { CitiesRow } from "@/types/database";

/** Convierte nombre de ciudad a slug: minúsculas, sin acentos, espacios → guiones */
function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\u0300/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/** Plantilla descripción SEO por ciudad */
function templateSeoDescription(cityName: string): string {
  return `Perfiles y acompañantes en ${cityName}. Servicio premium en la capital del sur de Chile, con opciones verificadas y disponibles.`;
}

/** Plantilla contenido SEO (párrafo base por ciudad) */
function templateSeoContent(cityName: string): string {
  return `${cityName} es una de las ciudades del sur de Chile donde encontrar perfiles premium y acompañantes verificados. En nuestra plataforma puedes filtrar por disponibilidad, ver fotos recientes y datos de contacto. El servicio en ${cityName} prioriza la discreción y el trato profesional. Si buscas opciones en otras ciudades, explora el listado de zonas disponibles en el menú.`;
}

interface AdminCityFormProps {
  initial?: CitiesRow | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminCityForm({ initial, onClose, onSuccess }: AdminCityFormProps) {
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [profiles, setProfiles] = useState("0");
  const [image, setImage] = useState("");
  const [keywordPrimary, setKeywordPrimary] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoContent, setSeoContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initial) {
      setSlug(initial.slug);
      setName(initial.name);
      setProfiles(String(initial.profiles));
      setImage(initial.image ?? "");
      setKeywordPrimary(initial.keyword_primary);
      setSeoTitle(initial.seo_title);
      setSeoDescription(initial.seo_description);
      setSeoContent(initial.seo_content);
    }
  }, [initial]);

  const handleNameChange = useCallback((newName: string) => {
    setName(newName);
    const trimmed = newName.trim();
    if (!trimmed) return;
    setSlug(slugify(trimmed));
    setKeywordPrimary(`escorts en ${trimmed}`);
    setSeoTitle(`Escorts en ${trimmed} | Perfiles Premium en el Sur de Chile`);
    setSeoDescription(templateSeoDescription(trimmed));
    setSeoContent(templateSeoContent(trimmed));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setError("");
    setLoading(true);
    const payload = {
      slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
      name: name.trim(),
      profiles: parseInt(profiles, 10) || 0,
      image: image.trim() || null,
      keyword_primary: keywordPrimary.trim() || `escorts en ${name.trim()}`,
      seo_title: seoTitle.trim() || `Escorts en ${name.trim()} | Perfiles Premium`,
      seo_description: seoDescription.trim(),
      seo_content: seoContent.trim(),
      updated_at: new Date().toISOString(),
    };
    if (initial) {
      const { error: err } = await supabase.from("cities").update(payload).eq("id", initial.id);
      if (err) setError(err.message);
      else onSuccess();
    } else {
      const { error: err } = await supabase.from("cities").insert(payload);
      if (err) setError(err.message);
      else onSuccess();
    }
    setLoading(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Editar ciudad" : "Nueva ciudad"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Slug (URL)</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="temuco"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Temuco"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nº perfiles</Label>
              <Input
                type="number"
                min={0}
                value={profiles}
                onChange={(e) => setProfiles(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>URL imagen</Label>
              <Input type="url" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Keyword principal SEO</Label>
            <Input
              value={keywordPrimary}
              onChange={(e) => setKeywordPrimary(e.target.value)}
              placeholder="escorts en Temuco"
            />
          </div>
          <div className="space-y-2">
            <Label>Título SEO</Label>
            <Input
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="Escorts en Temuco | Perfiles Premium en el Sur de Chile"
            />
          </div>
          <div className="space-y-2">
            <Label>Descripción SEO</Label>
            <textarea
              className="flex min-h-[60px] w-full rounded-md border border-input bg-surface px-3 py-2 text-sm"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Contenido SEO (texto largo)</Label>
            <textarea
              className="flex min-h-[120px] w-full rounded-md border border-input bg-surface px-3 py-2 text-sm"
              value={seoContent}
              onChange={(e) => setSeoContent(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-gold text-primary-foreground" disabled={loading}>
              {loading ? "Guardando…" : initial ? "Guardar" : "Crear ciudad"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
