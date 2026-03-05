import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import {
  PRECIO_PAGADO_OPTIONS,
  DURACION_SERVICIO_OPTIONS,
  LUGAR_ENCUENTRO_OPTIONS,
  RESPUESTA_WHATSAPP_OPTIONS,
  COINCIDENCIA_FOTOS_OPTIONS,
  NIVEL_PHOTOSHOP_OPTIONS,
  ESTATURA_APROXIMADA_OPTIONS,
  CONTEXTURA_OPTIONS,
  PRIVACIDAD_OPTIONS,
  CUMPLIO_PROMETIDO_OPTIONS,
  VOLVERIA_CONTACTAR_OPTIONS,
  REVIEW_TAGS_OPTIONS,
  computePromedioFinal,
} from "@/lib/review-experience-options";

const TOTAL_STEPS = 8;
const MIN_COMENTARIO_LENGTH = 50;

export interface ReviewFormData {
  precio_pagado: string;
  duracion_servicio: string;
  lugar_encuentro: string;
  rating_comunicacion: number | null;
  respuesta_whatsapp: string;
  coincidencia_fotos: string;
  nivel_photoshop: number | null;
  estatura_aproximada: string;
  contextura: string;
  higiene: number | null;
  besos: number | null;
  oral: number | null;
  movimiento_corporal: number | null;
  actitud: number | null;
  quimica: number | null;
  participacion: number | null;
  calidad_lugar: number | null;
  privacidad: string;
  atencion_general: number | null;
  cumplio_prometido: string;
  volveria_contactar: string;
  comentario_experiencia: string;
  tags: string[];
}

const initialFormData: ReviewFormData = {
  precio_pagado: "",
  duracion_servicio: "",
  lugar_encuentro: "",
  rating_comunicacion: null,
  respuesta_whatsapp: "",
  coincidencia_fotos: "",
  nivel_photoshop: null,
  estatura_aproximada: "",
  contextura: "",
  higiene: null,
  besos: null,
  oral: null,
  movimiento_corporal: null,
  actitud: null,
  quimica: null,
  participacion: null,
  calidad_lugar: null,
  privacidad: "",
  atencion_general: null,
  cumplio_prometido: "",
  volveria_contactar: "",
  comentario_experiencia: "",
  tags: [],
};

function StarRating({
  value,
  onChange,
  max = 5,
}: {
  value: number | null;
  onChange: (n: number) => void;
  max?: number;
}) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-gold"
          aria-label={`${n} de ${max} estrellas`}
        >
          <Star
            className={cn("h-8 w-8 transition-colors", (value ?? 0) >= n ? "fill-gold text-gold" : "text-muted-foreground")}
          />
        </button>
      ))}
    </div>
  );
}

function Scale1To10({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
        <Button
          key={n}
          type="button"
          variant={value === n ? "default" : "outline"}
          size="sm"
          className="min-w-[2.25rem]"
          onClick={() => onChange(n)}
        >
          {n}
        </Button>
      ))}
    </div>
  );
}

export interface ReviewExperienceFormProps {
  escortProfileId: string;
  userId: string;
  onSuccess: () => void;
  onError: (message: string) => void;
  submitReview: (payload: Record<string, unknown>) => Promise<{ error: Error | null }>;
}

export function ReviewExperienceForm({
  escortProfileId,
  userId,
  onSuccess,
  onError,
  submitReview,
}: ReviewExperienceFormProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<ReviewFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof ReviewFormData>(key: K, value: ReviewFormData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const progress = (step / TOTAL_STEPS) * 100;

  const canSubmit = () => {
    if (data.comentario_experiencia.trim().length < MIN_COMENTARIO_LENGTH) return false;
    const avg = computePromedioFinal({
      rating_comunicacion: data.rating_comunicacion,
      besos: data.besos,
      oral: data.oral,
      movimiento_corporal: data.movimiento_corporal,
      actitud: data.actitud,
      quimica: data.quimica,
      participacion: data.participacion,
      calidad_lugar: data.calidad_lugar,
      privacidad: data.privacidad || undefined,
      atencion_general: data.atencion_general,
    });
    return avg > 0;
  };

  const handleSubmit = async () => {
    if (!canSubmit()) {
      onError("Completa el comentario (mín. 50 caracteres) y las valoraciones necesarias para el promedio.");
      return;
    }
    const promedio_final = computePromedioFinal({
      rating_comunicacion: data.rating_comunicacion,
      besos: data.besos,
      oral: data.oral,
      movimiento_corporal: data.movimiento_corporal,
      actitud: data.actitud,
      quimica: data.quimica,
      participacion: data.participacion,
      calidad_lugar: data.calidad_lugar,
      privacidad: data.privacidad || undefined,
      atencion_general: data.atencion_general,
    });

    const payload = {
      escort_profile_id: escortProfileId,
      user_id: userId,
      precio_pagado: data.precio_pagado || null,
      duracion_servicio: data.duracion_servicio || null,
      lugar_encuentro: data.lugar_encuentro || null,
      rating_comunicacion: data.rating_comunicacion,
      respuesta_whatsapp: data.respuesta_whatsapp || null,
      coincidencia_fotos: data.coincidencia_fotos || null,
      nivel_photoshop: data.nivel_photoshop,
      estatura_aproximada: data.estatura_aproximada || null,
      contextura: data.contextura || null,
      higiene: data.higiene,
      besos: data.besos,
      oral: data.oral,
      movimiento_corporal: data.movimiento_corporal,
      actitud: data.actitud,
      quimica: data.quimica,
      participacion: data.participacion,
      calidad_lugar: data.calidad_lugar,
      privacidad: data.privacidad || null,
      atencion_general: data.atencion_general,
      cumplio_prometido: data.cumplio_prometido || null,
      volveria_contactar: data.volveria_contactar || null,
      promedio_final,
      comentario_experiencia: data.comentario_experiencia.trim(),
      tags: data.tags.length ? data.tags : null,
    };

    setSubmitting(true);
    const { error } = await submitReview(payload);
    setSubmitting(false);
    if (error) {
      onError(error.message);
      return;
    }
    onSuccess();
  };

  const toggleTag = (tag: string) => {
    setData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between text-sm text-muted-foreground mb-1">
          <span>Paso {step} de {TOTAL_STEPS}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Información básica del servicio</h3>
          <div className="space-y-2">
            <Label>Precio pagado</Label>
            <Select value={data.precio_pagado} onValueChange={(v) => update("precio_pagado", v)}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecciona" /></SelectTrigger>
              <SelectContent>
                {PRECIO_PAGADO_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Duración del servicio</Label>
            <Select value={data.duracion_servicio} onValueChange={(v) => update("duracion_servicio", v)}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecciona" /></SelectTrigger>
              <SelectContent>
                {DURACION_SERVICIO_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Lugar del encuentro</Label>
            <Select value={data.lugar_encuentro} onValueChange={(v) => update("lugar_encuentro", v)}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecciona" /></SelectTrigger>
              <SelectContent>
                {LUGAR_ENCUENTRO_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Comunicación previa</h3>
          <div className="space-y-2">
            <Label>Valoración de la comunicación (1-5)</Label>
            <StarRating value={data.rating_comunicacion} onChange={(n) => update("rating_comunicacion", n)} />
          </div>
          <div className="space-y-2">
            <Label>Respuesta por WhatsApp</Label>
            <Select value={data.respuesta_whatsapp} onValueChange={(v) => update("respuesta_whatsapp", v)}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecciona" /></SelectTrigger>
              <SelectContent>
                {RESPUESTA_WHATSAPP_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Coincidencia con fotos</h3>
          <div className="space-y-2">
            <Label>¿Las fotos coinciden con la realidad?</Label>
            <Select value={data.coincidencia_fotos} onValueChange={(v) => update("coincidencia_fotos", v)}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecciona" /></SelectTrigger>
              <SelectContent>
                {COINCIDENCIA_FOTOS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Nivel de retoque (0-75)</Label>
            <div className="flex flex-wrap gap-2">
              {NIVEL_PHOTOSHOP_OPTIONS.map((n) => (
                <Button
                  key={n}
                  type="button"
                  variant={data.nivel_photoshop === n ? "default" : "outline"}
                  size="sm"
                  onClick={() => update("nivel_photoshop", n)}
                >
                  {n}%
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Apariencia física</h3>
          <div className="space-y-2">
            <Label>Estatura aproximada</Label>
            <Select value={data.estatura_aproximada} onValueChange={(v) => update("estatura_aproximada", v)}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecciona" /></SelectTrigger>
              <SelectContent>
                {ESTATURA_APROXIMADA_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Contextura</Label>
            <RadioGroup value={data.contextura} onValueChange={(v) => update("contextura", v)} className="flex flex-wrap gap-4">
              {CONTEXTURA_OPTIONS.map((o) => (
                <div key={o.value} className="flex items-center gap-2">
                  <RadioGroupItem value={o.value} id={`ctx-${o.value}`} />
                  <Label htmlFor={`ctx-${o.value}`} className="cursor-pointer">{o.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label>Higiene (1-5)</Label>
            <StarRating value={data.higiene} onChange={(n) => update("higiene", n)} />
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Calidad del servicio (1-10)</h3>
          {(["besos", "oral", "movimiento_corporal", "actitud", "quimica", "participacion"] as const).map((key) => (
            <div key={key} className="space-y-2">
              <Label className="capitalize">{key.replace("_", " ")}</Label>
              <Scale1To10 value={data[key]} onChange={(n) => update(key, n)} />
            </div>
          ))}
        </div>
      )}

      {step === 6 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Ambiente</h3>
          <div className="space-y-2">
            <Label>Calidad del lugar (1-5)</Label>
            <StarRating value={data.calidad_lugar} onChange={(n) => update("calidad_lugar", n)} />
          </div>
          <div className="space-y-2">
            <Label>Privacidad</Label>
            <Select value={data.privacidad} onValueChange={(v) => update("privacidad", v)}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecciona" /></SelectTrigger>
              <SelectContent>
                {PRIVACIDAD_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {step === 7 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Experiencia general</h3>
          <div className="space-y-2">
            <Label>Atención general (1-5)</Label>
            <StarRating value={data.atencion_general} onChange={(n) => update("atencion_general", n)} />
          </div>
          <div className="space-y-2">
            <Label>¿Cumplió lo prometido?</Label>
            <Select value={data.cumplio_prometido} onValueChange={(v) => update("cumplio_prometido", v)}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecciona" /></SelectTrigger>
              <SelectContent>
                {CUMPLIO_PROMETIDO_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>¿Volverías a contactar?</Label>
            <Select value={data.volveria_contactar} onValueChange={(v) => update("volveria_contactar", v)}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecciona" /></SelectTrigger>
              <SelectContent>
                {VOLVERIA_CONTACTAR_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {step === 8 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Comentario y etiquetas</h3>
          <div className="space-y-2">
            <Label>Tu experiencia (mín. 50 caracteres) *</Label>
            <Textarea
              placeholder="Cuenta tu experiencia con detalle. Ayuda a otros usuarios y mejora el perfil."
              value={data.comentario_experiencia}
              onChange={(e) => update("comentario_experiencia", e.target.value)}
              className="min-h-[120px] rounded-xl resize-y"
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground">
              {data.comentario_experiencia.length} / 50 mínimo · Máx. 2000
            </p>
          </div>
          <div className="space-y-2">
            <Label>Etiquetas (opcional)</Label>
            <div className="flex flex-wrap gap-2">
              {REVIEW_TAGS_OPTIONS.map((o) => (
                <Button
                  key={o.value}
                  type="button"
                  variant={data.tags.includes(o.value) ? "default" : "outline"}
                  size="sm"
                  className="rounded-xl"
                  onClick={() => toggleTag(o.value)}
                >
                  {o.label}
                </Button>
              ))}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Promedio calculado: {computePromedioFinal({
              rating_comunicacion: data.rating_comunicacion,
              besos: data.besos,
              oral: data.oral,
              movimiento_corporal: data.movimiento_corporal,
              actitud: data.actitud,
              quimica: data.quimica,
              participacion: data.participacion,
              calidad_lugar: data.calidad_lugar,
              privacidad: data.privacidad || undefined,
              atencion_general: data.atencion_general,
            }).toFixed(2)} / 5
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        {step > 1 ? (
          <Button type="button" variant="outline" className="rounded-xl" onClick={() => setStep((s) => s - 1)}>
            Atrás
          </Button>
        ) : (
          <span />
        )}
        <div className="flex-1" />
        {step < TOTAL_STEPS ? (
          <Button type="button" className="rounded-xl bg-gold text-primary-foreground hover:bg-gold/90" onClick={() => setStep((s) => s + 1)}>
            Siguiente
          </Button>
        ) : (
          <Button
            type="button"
            className="rounded-xl bg-gold text-primary-foreground hover:bg-gold/90"
            disabled={!canSubmit() || submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Enviando…" : "Enviar reseña (+3 tickets)"}
          </Button>
        )}
      </div>
    </div>
  );
}
