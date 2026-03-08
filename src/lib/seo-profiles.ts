/**
 * Obtiene perfiles de una ciudad filtrados por segmento SEO (servicio, característica, categoría, zona o pirámide).
 */

import { supabase } from "@/lib/supabase";
import {
  INTENT_SLUGS,
  CATEGORY_SLUGS,
  SERVICE_SLUG_TO_TERMS,
  FEATURE_SLUG_TO_TERMS,
} from "@/lib/seo-programmatic";
import {
  PIRAMIDAL_CATEGORY_SLUGS,
  PIRAMIDAL_SERVICE_TERMS,
  PIRAMIDAL_ATTRIBUTE_TERMS,
  PIRAMIDAL_ZONE_MATCH,
} from "@/lib/seo-pyramidal";

export type EscortProfileRow = {
  id: string;
  name: string;
  age: number;
  badge: string | null;
  image: string | null;
  available: boolean;
  whatsapp?: string | null;
  description?: string | null;
  services_included?: string[];
  services_extra?: string[];
  zone?: string | null;
  time_slot?: string | null;
  time_slots?: string[] | null;
  subidas_per_day?: number | null;
  promotion?: string | null;
  slug?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

function matchesTerms(
  text: string | null | undefined,
  terms: string[]
): boolean {
  if (!text || !terms.length) return false;
  const lower = text.toLowerCase();
  return terms.some((t) => lower.includes(t.toLowerCase()));
}

function matchesServiceTerms(
  servicesIncluded: string[] | null | undefined,
  servicesExtra: string[] | null | undefined,
  terms: string[]
): boolean {
  const inc = (servicesIncluded ?? []).map((s) => s.toLowerCase());
  const ext = (servicesExtra ?? []).map((s) => s.toLowerCase());
  const all = [...inc, ...ext];
  return terms.some((t) => all.some((s) => s.includes(t.toLowerCase())));
}

function matchesZone(zone: string | null | undefined, zoneMatches: string[]): boolean {
  if (!zone || !zoneMatches.length) return false;
  const z = zone.toLowerCase().trim();
  return zoneMatches.some((m) => z.includes(m.toLowerCase()));
}

/**
 * Filtra en cliente la lista de perfiles según el segmento SEO.
 * Incluye: intención, categoría, servicio, atributo, zona y slugs piramidales.
 */
export function filterProfilesBySegment(
  profiles: EscortProfileRow[],
  segmentSlug: string
): EscortProfileRow[] {
  const key = segmentSlug.toLowerCase();

  if (INTENT_SLUGS.includes(key as (typeof INTENT_SLUGS)[number])) return profiles;
  if (CATEGORY_SLUGS.includes(key as (typeof CATEGORY_SLUGS)[number])) return profiles;

  // Pirámide: categorías (mejores/nuevas/recomendadas se manejan en ranking; vip, independientes, etc. aquí)
  if (PIRAMIDAL_CATEGORY_SLUGS.includes(key as (typeof PIRAMIDAL_CATEGORY_SLUGS)[number])) {
    if (["mejores-escorts", "escorts-nuevas", "escorts-recomendadas"].includes(key)) return profiles;
    const categoryTerms: Record<string, string[]> = {
      "escorts-vip": ["vip", "premium"],
      "escorts-independientes": ["independiente", "independientes"],
      "escorts-premium": ["premium", "vip", "exclusivo"],
      "escorts-verificadas": ["verificada", "verificado", "premium", "vip"],
      "escorts-disponibles": ["disponible", "disponibilidad"],
    };
    const terms = categoryTerms[key];
    if (terms?.length) {
      return profiles.filter((p) =>
        matchesTerms(p.description, terms) || (p.badge && terms.some((t) => p.badge!.toLowerCase().includes(t)))
      );
    }
    return profiles;
  }

  // Zonas piramidales
  const zoneMatches = PIRAMIDAL_ZONE_MATCH[key];
  if (zoneMatches?.length) {
    return profiles.filter((p) => matchesZone(p.zone, zoneMatches));
  }

  // Servicios: primero términos originales, luego piramidales
  const serviceTerms = SERVICE_SLUG_TO_TERMS[key] ?? PIRAMIDAL_SERVICE_TERMS[key];
  if (serviceTerms?.length) {
    return profiles.filter((p) =>
      matchesServiceTerms(p.services_included, p.services_extra, serviceTerms) ||
      matchesTerms(p.description, serviceTerms)
    );
  }

  // Atributos: primero términos originales (feature), luego piramidales
  const featureTerms = FEATURE_SLUG_TO_TERMS[key] ?? PIRAMIDAL_ATTRIBUTE_TERMS[key];
  if (featureTerms?.length) {
    return profiles.filter((p) =>
      matchesTerms(p.description, featureTerms) ||
      (p.badge && featureTerms.some((t) => p.badge!.toLowerCase().includes(t)))
    );
  }

  return profiles;
}

/**
 * Obtiene perfiles activos de una ciudad (con promotion y active_until).
 * Incluye description, services_included, services_extra, zone para filtrar por segmento.
 */
export async function fetchProfilesByCityId(cityId: string): Promise<EscortProfileRow[]> {
  if (!supabase) return [];
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("escort_profiles")
    .select("id, name, age, badge, image, available, whatsapp, description, services_included, services_extra, zone, time_slot, time_slots, subidas_per_day, promotion, slug")
    .eq("city_id", cityId)
    .not("promotion", "is", null)
    .or(`active_until.is.null,active_until.gt.${now}`);
  if (error) return [];
  return (data ?? []) as EscortProfileRow[];
}

/**
 * Obtiene todos los perfiles activos de una ciudad (para páginas de filtro/piramidal).
 * No exige promotion para que servicios/atributos/zonas muestren todos los que coincidan.
 */
export async function fetchProfilesByCityIdForFilterPage(cityId: string): Promise<EscortProfileRow[]> {
  if (!supabase) return [];
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("escort_profiles")
    .select("id, name, age, badge, image, available, whatsapp, description, services_included, services_extra, zone, time_slot, time_slots, subidas_per_day, promotion, slug")
    .eq("city_id", cityId)
    .or(`active_until.is.null,active_until.gt.${now}`);
  if (error) return [];
  return (data ?? []) as EscortProfileRow[];
}

/**
 * Perfiles para páginas de ranking (incluye created_at, updated_at para ordenar).
 */
export async function fetchProfilesByCityIdForRanking(cityId: string): Promise<EscortProfileRow[]> {
  if (!supabase) return [];
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("escort_profiles")
    .select("id, name, age, badge, image, available, whatsapp, slug, created_at, updated_at")
    .eq("city_id", cityId)
    .not("promotion", "is", null)
    .or(`active_until.is.null,active_until.gt.${now}`);
  if (error) return [];
  return (data ?? []) as EscortProfileRow[];
}

/**
 * Promedio de reseñas por perfil (para ranking mejores-escorts).
 * Devuelve Map<escort_profile_id, { avg, count }>.
 */
export async function fetchReviewAveragesByProfileIds(
  profileIds: string[]
): Promise<Map<string, { avg: number; count: number }>> {
  const map = new Map<string, { avg: number; count: number }>();
  if (!supabase || profileIds.length === 0) return map;
  const { data, error } = await supabase
    .from("review_experiences")
    .select("escort_profile_id, promedio_final")
    .in("escort_profile_id", profileIds);
  if (error) return map;
  const rows = (data ?? []) as { escort_profile_id: string; promedio_final: number }[];
  const byProfile = new Map<string, number[]>();
  for (const r of rows) {
    const list = byProfile.get(r.escort_profile_id) ?? [];
    list.push(r.promedio_final);
    byProfile.set(r.escort_profile_id, list);
  }
  for (const [id, values] of byProfile) {
    const sum = values.reduce((a, b) => a + b, 0);
    map.set(id, { avg: sum / values.length, count: values.length });
  }
  return map;
}
