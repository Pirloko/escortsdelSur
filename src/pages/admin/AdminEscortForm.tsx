import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EscortProfilesRow } from "@/types/database";
import type { CitiesRow } from "@/types/database";

interface AdminEscortFormProps {
  initial?: EscortProfilesRow | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminEscortForm({ initial, onClose, onSuccess }: AdminEscortFormProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [cityId, setCityId] = useState("");
  const [badge, setBadge] = useState("");
  const [image, setImage] = useState("");
  const [available, setAvailable] = useState(true);
  const [description, setDescription] = useState("");
  const [zone, setZone] = useState("");
  const [schedule, setSchedule] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cities, setCities] = useState<CitiesRow[]>([]);

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setAge(String(initial.age));
      setCityId(initial.city_id);
      setBadge(initial.badge ?? "");
      setImage(initial.image ?? "");
      setAvailable(initial.available);
      setDescription(initial.description ?? "");
      setZone(initial.zone ?? "");
      setSchedule(initial.schedule ?? "");
      setWhatsapp(initial.whatsapp ?? "");
    }
  }, [initial]);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("cities")
      .select("id, name, slug")
      .order("name")
      .then(({ data }) => setCities((data as CitiesRow[]) ?? []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setError("");
    setLoading(true);
    const payload = {
      city_id: cityId,
      name: name.trim(),
      age: parseInt(age, 10) || 0,
      badge: badge.trim() || null,
      image: image.trim() || null,
      available,
      description: description.trim() || null,
      zone: zone.trim() || null,
      schedule: schedule.trim() || null,
      whatsapp: whatsapp.trim() || null,
      updated_at: new Date().toISOString(),
    };
    if (initial) {
      const { error: err } = await supabase
        .from("escort_profiles")
        .update(payload)
        .eq("id", initial.id);
      if (err) setError(err.message);
      else onSuccess();
    } else {
      const { error: err } = await supabase.from("escort_profiles").insert({
        ...payload,
        gallery: [],
      });
      if (err) setError(err.message);
      else onSuccess();
    }
    setLoading(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Editar perfil" : "Nuevo perfil (usuario registrado)"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Edad</Label>
              <Input type="number" min={18} value={age} onChange={(e) => setAge(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Ciudad</Label>
            <Select value={cityId} onValueChange={setCityId} required>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar ciudad" />
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Badge (Premium, VIP, etc.)</Label>
              <Input value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="Premium" />
            </div>
            <div className="space-y-2 flex items-end pb-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={available}
                  onChange={(e) => setAvailable(e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-sm">Disponible</span>
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <Label>URL imagen principal</Label>
            <Input type="url" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <Label>Descripción</Label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-surface px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Zona</Label>
              <Input value={zone} onChange={(e) => setZone(e.target.value)} placeholder="Centro" />
            </div>
            <div className="space-y-2">
              <Label>Dirección</Label>
              <Input value={schedule} onChange={(e) => setSchedule(e.target.value)} placeholder="Calle, número" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>WhatsApp</Label>
            <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+569..." />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-gold text-primary-foreground" disabled={loading}>
              {loading ? "Guardando…" : initial ? "Guardar" : "Crear perfil"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
