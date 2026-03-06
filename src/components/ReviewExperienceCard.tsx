import { useState } from "react";
import { Star, BadgeCheck, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { getReviewLabels, getTagLabel } from "@/lib/review-experience-options";
import type { ReviewExperiencesRow } from "@/types/database";
import { Button } from "@/components/ui/button";

const sectionTitle = "text-xs font-semibold text-muted-foreground uppercase tracking-wider";

function RowIf({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value == null || value === "") return null;
  return (
    <p className="text-sm text-foreground">
      <span className="text-muted-foreground">{label}:</span>{" "}
      {typeof value === "number" ? value : String(value)}
    </p>
  );
}

export interface ReviewExperienceCardProps {
  review: ReviewExperiencesRow;
  authorDisplayName: string;
  className?: string;
}

const COMENTARIO_PREVIEW_LENGTH = 180;

export function ReviewExperienceCard({ review, authorDisplayName, className }: ReviewExperienceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const L = getReviewLabels(review);
  const r = review;

  const hasBasic = L.precio_pagado || L.duracion_servicio || L.lugar_encuentro;
  const hasComunicacion = r.rating_comunicacion != null || L.respuesta_whatsapp;
  const hasFotos = L.coincidencia_fotos || r.nivel_photoshop != null;
  const hasApariencia = L.estatura_aproximada || L.contextura || r.higiene != null;
  const hasServicio =
    [r.besos, r.oral, r.movimiento_corporal, r.actitud, r.quimica, r.participacion].some((n) => n != null);
  const hasAmbiente = r.calidad_lugar != null || L.privacidad;
  const hasExperiencia = r.atencion_general != null || L.cumplio_prometido || L.volveria_contactar;
  const hasDetail = hasBasic || hasComunicacion || hasFotos || hasApariencia || hasServicio || hasAmbiente || hasExperiencia;
  const commentText = r.comentario_experiencia?.trim() ?? "";
  const commentPreview =
    commentText.length > COMENTARIO_PREVIEW_LENGTH
      ? commentText.slice(0, COMENTARIO_PREVIEW_LENGTH).trim() + "…"
      : commentText;

  return (
    <article
      className={cn(
        "p-4 rounded-xl bg-muted/30 border border-border space-y-5",
        className
      )}
    >
      {/* Cabecera: autor, promedio, fecha */}
      <div className="flex flex-wrap items-center gap-2">
        <BadgeCheck className="w-4 h-4 text-gold shrink-0" aria-hidden />
        <span className="text-sm font-medium text-foreground">{authorDisplayName}</span>
        <span className="flex items-center gap-1 text-sm text-gold">
          <Star className="w-3.5 h-3.5 fill-gold" />
          {r.promedio_final?.toFixed(1) ?? "—"}
        </span>
        <span className="text-xs text-muted-foreground">
          {new Date(r.created_at).toLocaleDateString("es-CL", { dateStyle: "short" })}
        </span>
      </div>

      {/* Comentario: preview cuando colapsado, completo cuando expandido */}
      {commentText && (
        <div className="space-y-1">
          <p className="text-sm text-foreground whitespace-pre-wrap">
            {expanded ? commentText : commentPreview}
          </p>
        </div>
      )}

      {/* Tags siempre visibles */}
      {Array.isArray(r.tags) && r.tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {r.tags.map((t) => (
            <span
              key={String(t)}
              className="px-2.5 py-1 rounded-lg bg-muted text-xs text-foreground border border-border"
            >
              {getTagLabel(t)}
            </span>
          ))}
        </div>
      ) : null}

      {/* 1. Información básica del servicio (solo expandido) */}
      {expanded && hasBasic && (
        <div className="space-y-2">
          <p className={sectionTitle}>Información básica del servicio</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1">
            {L.precio_pagado && <RowIf label="Precio pagado" value={L.precio_pagado} />}
            {L.duracion_servicio && <RowIf label="Duración" value={L.duracion_servicio} />}
            {L.lugar_encuentro && <RowIf label="Lugar" value={L.lugar_encuentro} />}
          </div>
        </div>
      )}

      {/* 2. Comunicación previa */}
      {expanded && hasComunicacion && (
        <div className="space-y-2">
          <p className={sectionTitle}>Comunicación previa</p>
          <div className="flex flex-wrap gap-4">
            {r.rating_comunicacion != null && (
              <p className="text-sm text-foreground">
                <span className="text-muted-foreground">Valoración:</span>{" "}
                <span className="text-gold">{r.rating_comunicacion}/5</span>
              </p>
            )}
            {L.respuesta_whatsapp && (
              <p className="text-sm text-foreground">
                <span className="text-muted-foreground">Respuesta WhatsApp:</span> {L.respuesta_whatsapp}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 3. Coincidencia con fotos */}
      {expanded && hasFotos && (
        <div className="space-y-2">
          <p className={sectionTitle}>Coincidencia con fotos</p>
          <div className="flex flex-wrap gap-4">
            {L.coincidencia_fotos && (
              <p className="text-sm text-foreground">
                <span className="text-muted-foreground">Coincidencia:</span> {L.coincidencia_fotos}
              </p>
            )}
            {r.nivel_photoshop != null && (
              <p className="text-sm text-foreground">
                <span className="text-muted-foreground">Nivel retoque:</span> {r.nivel_photoshop}%
              </p>
            )}
          </div>
        </div>
      )}

      {/* 4. Apariencia física */}
      {expanded && hasApariencia && (
        <div className="space-y-2">
          <p className={sectionTitle}>Apariencia física</p>
          <div className="flex flex-wrap gap-4">
            {L.estatura_aproximada && (
              <p className="text-sm text-foreground">
                <span className="text-muted-foreground">Estatura:</span> {L.estatura_aproximada}
              </p>
            )}
            {L.contextura && (
              <p className="text-sm text-foreground">
                <span className="text-muted-foreground">Contextura:</span> {L.contextura}
              </p>
            )}
            {r.higiene != null && (
              <p className="text-sm text-foreground">
                <span className="text-muted-foreground">Higiene:</span>{" "}
                <span className="text-gold">{r.higiene}/5</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* 5. Calidad del servicio (1-10) */}
      {expanded && hasServicio && (
        <div className="space-y-2">
          <p className={sectionTitle}>Calidad del servicio (1-10)</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
            {r.besos != null && <RowIf label="Besos" value={r.besos} />}
            {r.oral != null && <RowIf label="Oral" value={r.oral} />}
            {r.movimiento_corporal != null && <RowIf label="Movimiento corporal" value={r.movimiento_corporal} />}
            {r.actitud != null && <RowIf label="Actitud" value={r.actitud} />}
            {r.quimica != null && <RowIf label="Química" value={r.quimica} />}
            {r.participacion != null && <RowIf label="Participación" value={r.participacion} />}
          </div>
        </div>
      )}

      {/* 6. Ambiente */}
      {expanded && hasAmbiente && (
        <div className="space-y-2">
          <p className={sectionTitle}>Ambiente</p>
          <div className="flex flex-wrap gap-4">
            {r.calidad_lugar != null && (
              <p className="text-sm text-foreground">
                <span className="text-muted-foreground">Calidad del lugar:</span>{" "}
                <span className="text-gold">{r.calidad_lugar}/5</span>
              </p>
            )}
            {L.privacidad && (
              <p className="text-sm text-foreground">
                <span className="text-muted-foreground">Privacidad:</span> {L.privacidad}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 7. Experiencia general */}
      {expanded && hasExperiencia && (
        <div className="space-y-2">
          <p className={sectionTitle}>Experiencia general</p>
          <div className="flex flex-wrap gap-4">
            {r.atencion_general != null && (
              <p className="text-sm text-foreground">
                <span className="text-muted-foreground">Atención general:</span>{" "}
                <span className="text-gold">{r.atencion_general}/5</span>
              </p>
            )}
            {L.cumplio_prometido && (
              <p className="text-sm text-foreground">
                <span className="text-muted-foreground">Cumplió lo prometido:</span> {L.cumplio_prometido}
              </p>
            )}
            {L.volveria_contactar && (
              <p className="text-sm text-foreground">
                <span className="text-muted-foreground">Volvería a contactar:</span> {L.volveria_contactar}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Botón ver más / ver menos */}
      {hasDetail && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="rounded-xl text-gold hover:text-gold hover:bg-gold/10 -ml-2"
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-1.5" />
              Ver menos
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-1.5" />
              Ver reseña completa
            </>
          )}
        </Button>
      )}
    </article>
  );
}
