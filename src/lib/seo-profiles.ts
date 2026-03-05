/**
 * Obtiene perfiles de una ciudad filtrados por segmento SEO (servicio, característica, categoría o intención).
 */

import { supabase } from "@/lib/supabase";
import {
  INTENT_SLUGS,
  CATEGORY_SLUGS,
  SERVICE_SLUG_TO_TERMS,
  FEATURE_SLUG_TO_TERMS,
} from "@/lib/seo-programmatic";

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
  time_slot?: string | null;
  time_slots?: string[] | null;
  subidas_per_day?: number | null;
  promotion?: string | null;
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

/**
 * Filtra en cliente la lista de perfiles según el segmento SEO.
 * Para intención (sexo, sexosur, etc.) devuelve todos; para categoría todos;
 * para servicio/feature aplica los términos.
 */
export function filterProfilesBySegment(
  profiles: EscortProfileRow[],
  segmentSlug: string
): EscortProfileRow[] {
  const key = segmentSlug.toLowerCase();
  if (INTENT_SLUGS.includes(key as (typeof INTENT_SLUGS)[number])) {
    return profiles;
  }
  if (CATEGORY_SLUGS.includes(key as (typeof CATEGORY_SLUGS)[number])) {
    return profiles;
  }
  const serviceTerms = SERVICE_SLUG_TO_TERMS[key];
  if (serviceTerms?.length) {
    return profiles.filter((p) =>
      matchesServiceTerms(p.services_included, p.services_extra, serviceTerms)
    );
  }
  const featureTerms = FEATURE_SLUG_TO_TERMS[key];
  if (featureTerms?.length) {
    return profiles.filter((p) => matchesTerms(p.description, featureTerms));
  }
  return profiles;
}

/**
 * Obtiene perfiles activos de una ciudad (con promotion y active_until).
 * Incluye description, services_included, services_extra para filtrar por segmento.
 */
export async function fetchProfilesByCityId(cityId: string): Promise<EscortProfileRow[]> {
  if (!supabase) return [];
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("escort_profiles")
    .select("id, name, age, badge, image, available, whatsapp, description, services_included, services_extra, time_slot, time_slots, subidas_per_day, promotion")
    .eq("city_id", cityId)
    .not("promotion", "is", null)
    .or(`active_until.is.null,active_until.gt.${now}`);
  if (error) return [];
  return (data ?? []) as EscortProfileRow[];
}
