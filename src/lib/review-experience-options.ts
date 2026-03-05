/**
 * Opciones para el formulario de reseña verificada de experiencia.
 * Valores guardados en review_experiences (Supabase).
 */

export const PRECIO_PAGADO_OPTIONS = [
  { value: "30000", label: "$30.000" },
  { value: "40000", label: "$40.000" },
  { value: "50000", label: "$50.000" },
  { value: "otro", label: "Otro" },
] as const;

export const DURACION_SERVICIO_OPTIONS = [
  { value: "30_min", label: "30 min" },
  { value: "1_hora", label: "1 hora" },
  { value: "servicio_completo", label: "Servicio completo" },
] as const;

export const LUGAR_ENCUENTRO_OPTIONS = [
  { value: "departamento", label: "Departamento" },
  { value: "hotel", label: "Hotel" },
  { value: "a_domicilio", label: "A domicilio" },
  { value: "otro", label: "Otro" },
] as const;

export const RESPUESTA_WHATSAPP_OPTIONS = [
  { value: "rapida", label: "Rápida" },
  { value: "normal", label: "Normal" },
  { value: "lenta", label: "Lenta" },
  { value: "muy_lenta", label: "Muy lenta" },
] as const;

export const COINCIDENCIA_FOTOS_OPTIONS = [
  { value: "exactamente_igual", label: "Exactamente igual" },
  { value: "muy_parecida", label: "Muy parecida" },
  { value: "algo_diferente", label: "Algo diferente" },
  { value: "muy_diferente", label: "Muy diferente" },
] as const;

export const NIVEL_PHOTOSHOP_OPTIONS = [0, 25, 50, 75] as const;

export const ESTATURA_APROXIMADA_OPTIONS = [
  { value: "menos_155", label: "Menos de 1,55 m" },
  { value: "155_165", label: "1,55 - 1,65 m" },
  { value: "165_175", label: "1,65 - 1,75 m" },
  { value: "mas_175", label: "Más de 1,75 m" },
] as const;

export const CONTEXTURA_OPTIONS = [
  { value: "delgada", label: "Delgada" },
  { value: "normal", label: "Normal" },
  { value: "curvy", label: "Curvy" },
  { value: "rellenita", label: "Rellenita" },
] as const;

export const PRIVACIDAD_OPTIONS = [
  { value: "excelente", label: "Excelente" },
  { value: "buena", label: "Buena" },
  { value: "regular", label: "Regular" },
  { value: "mala", label: "Mala" },
] as const;

export const CUMPLIO_PROMETIDO_OPTIONS = [
  { value: "si_total", label: "Sí, totalmente" },
  { value: "si_parcial", label: "Sí, en parte" },
  { value: "mas_o_menos", label: "Más o menos" },
  { value: "no", label: "No" },
] as const;

export const VOLVERIA_CONTACTAR_OPTIONS = [
  { value: "si", label: "Sí" },
  { value: "tal_vez", label: "Tal vez" },
  { value: "no", label: "No" },
] as const;

export const REVIEW_TAGS_OPTIONS = [
  { value: "fotos_reales", label: "Fotos reales" },
  { value: "muy_recomendable", label: "Muy recomendable" },
  { value: "buen_trato", label: "Buen trato" },
  { value: "excelente_servicio", label: "Excelente servicio" },
  { value: "repetiria", label: "Repetiría" },
] as const;

/** Calcular promedio_final (escala 1-5) a partir de los campos de la reseña */
export function computePromedioFinal(data: {
  rating_comunicacion?: number | null;
  besos?: number | null;
  oral?: number | null;
  movimiento_corporal?: number | null;
  actitud?: number | null;
  quimica?: number | null;
  participacion?: number | null;
  calidad_lugar?: number | null;
  privacidad?: string | null;
  atencion_general?: number | null;
}): number {
  const comunicacion = data.rating_comunicacion ?? 0;
  const servicio =
    [data.besos, data.oral, data.movimiento_corporal, data.actitud, data.quimica, data.participacion].filter(
      (n): n is number => typeof n === "number"
    );
  const avgServicio = servicio.length ? servicio.reduce((a, b) => a + b, 0) / servicio.length : 0;
  const calidadServicioNorm = avgServicio / 2;
  const calidadLugar = data.calidad_lugar ?? 0;
  const privacidadNum = { excelente: 5, buena: 4, regular: 3, mala: 2 }[data.privacidad ?? ""] ?? 0;
  const ambiente = calidadLugar && privacidadNum ? (calidadLugar + privacidadNum) / 2 : (calidadLugar || privacidadNum);
  const atencion = data.atencion_general ?? 0;
  const parts = [comunicacion, calidadServicioNorm, ambiente, atencion].filter((n) => n > 0);
  if (parts.length === 0) return 0;
  const avg = parts.reduce((a, b) => a + b, 0) / parts.length;
  return Math.round(avg * 100) / 100;
}
