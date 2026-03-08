/**
 * SEO programático: slugs de filtros, categorías y generación de URLs.
 * Arquitectura: ciudad → categoría/filtro → perfil. Incluye pirámide SEO (categorías, servicios, atributos, zonas).
 */

import { getAllPyramidalSlugs } from "./seo-pyramidal";

export const SITE_URL = "https://holacachero.cl";

/** Slugs de categoría (Nivel 2): /rancagua/escorts, /rancagua/acompanantes */
export const CATEGORY_SLUGS = [
  "escorts",
  "acompanantes",
  "damas-de-compania",
] as const;

/** Slugs por intención de búsqueda: sexo, sexosur, skokka, scort */
export const INTENT_SLUGS = [
  "sexo",
  "sexosur",
  "skokka",
  "scort",
] as const;

/** Slugs de filtro por característica (plural): /rancagua/pelinegras, etc. */
export const FEATURE_FILTER_SLUGS = [
  "pelinegras",
  "tetonas",
  "culonas",
  "bajitas",
  "depiladas",
] as const;

/** Slugs long-tail singular: /rancagua/escort-pelinegra, etc. */
export const LONGTAIL_SINGULAR_SLUGS = [
  "escort-pelinegra",
  "escort-tetona",
  "escort-culona",
  "escort-bajita",
  "escort-depilada",
  "escort-a-domicilio",
  "escort-masajes-eroticos",
  "escort-vip",
  "escort-independiente",
] as const;

/** Slugs de filtro por servicio */
export const SERVICE_FILTER_SLUGS = [
  "a-domicilio",
  "apartamento-propio",
  "masajes",
  "masajes-eroticos",
  "trios",
  "fetichismo",
  "atencion-parejas",
  "oral-con-condon",
  "sexo-anal",
  "juguetes-eroticos",
] as const;

/** Todos los slugs que corresponden a página de filtro (no perfil). */
export const ALL_FILTER_SLUGS: readonly string[] = [
  ...CATEGORY_SLUGS,
  ...INTENT_SLUGS,
  ...FEATURE_FILTER_SLUGS,
  ...LONGTAIL_SINGULAR_SLUGS,
  ...SERVICE_FILTER_SLUGS,
];

/** Combinaciones categoría + filtro (opcional): escorts-pelinegras, etc. */
export const CATEGORY_FILTER_COMBO_SLUGS = [
  "escorts-pelinegras",
  "escorts-tetonas",
  "escorts-culonas",
  "escorts-bajitas",
  "escorts-depiladas",
  "escorts-a-domicilio",
  "escorts-apartamento-propio",
  "escorts-masajes",
  "escorts-trios",
  "acompanantes-a-domicilio",
  "acompanantes-masajes",
] as const;

/** Slugs de páginas de ranking: mejores, nuevas, recomendadas. */
export const RANKING_SLUGS = [
  "mejores-escorts",
  "escorts-nuevas",
  "escorts-recomendadas",
] as const;

export type RankingSlug = (typeof RANKING_SLUGS)[number];

const RANKING_SET = new Set<string>(RANKING_SLUGS.map((s) => s.toLowerCase()));

/** Set de todos los segmentos que son filtro/categoría o ranking (no slug de perfil). */
const FILTER_AND_CATEGORY_SET = new Set<string>([
  ...ALL_FILTER_SLUGS,
  ...CATEGORY_FILTER_COMBO_SLUGS,
  ...RANKING_SLUGS,
  ...getAllPyramidalSlugs().map((s) => s.toLowerCase()),
]);

/**
 * Indica si el segmento es una página de ranking (mejores-escorts, escorts-nuevas, escorts-recomendadas).
 */
export function isRankingSegment(segment: string): boolean {
  return RANKING_SET.has(segment.toLowerCase());
}

/**
 * Indica si el segmento de URL es una página de filtro/categoría o ranking conocido.
 * Si no, se trata como slug de perfil.
 */
export function isFilterOrCategorySegment(segment: string): boolean {
  return FILTER_AND_CATEGORY_SET.has(segment.toLowerCase());
}

/** Genera URL canónica de ciudad. */
export function cityUrl(citySlug: string): string {
  return `/${citySlug}`;
}

/** Genera URL canónica de filtro/categoría. */
export function filterUrl(citySlug: string, filterSlug: string): string {
  return `/${citySlug}/${filterSlug}`;
}

/** Genera URL canónica de perfil (SEO). */
export function profileSeoUrl(citySlug: string, profileSlug: string): string {
  return `/${citySlug}/${profileSlug}`;
}

/** URL del perfil: SEO si hay slug y citySlug, si no /perfil/:id */
export function getProfileUrl(
  profile: { id: string; slug?: string | null },
  citySlug: string | null | undefined
): string {
  if (profile.slug && citySlug) return profileSeoUrl(citySlug, profile.slug);
  return `/perfil/${profile.id}`;
}

/** Lista de todas las URLs de filtro programáticas para una ciudad (para sitemap). Incluye pirámide SEO. */
export function getFilterUrlsForCity(citySlug: string): string[] {
  const pyramidal = getAllPyramidalSlugs();
  const all = [
    ...ALL_FILTER_SLUGS,
    ...CATEGORY_FILTER_COMBO_SLUGS,
    ...pyramidal,
  ];
  return [...new Set(all)].map((slug) => filterUrl(citySlug, slug));
}

/** URLs de páginas de ranking para una ciudad (para sitemap). */
export function getRankingUrlsForCity(citySlug: string): string[] {
  return RANKING_SLUGS.map((slug) => filterUrl(citySlug, slug));
}

/** Mapeo slug de servicio → términos a buscar en services_included / services_extra */
export const SERVICE_SLUG_TO_TERMS: Record<string, string[]> = {
  "a-domicilio": ["a domicilio", "domicilio"],
  "apartamento-propio": ["apartamento propio", "apartamento"],
  masajes: ["masajes eroticos", "masajes", "masaje erótico"],
  "masajes-eroticos": ["masajes eroticos", "masajes", "masaje erótico"],
  trios: ["trios", "trío", "trio"],
  fetichismo: ["fetichismo", "fetiche"],
  "atencion-parejas": ["atencion a parejas", "parejas", "atención a parejas"],
  "oral-con-condon": ["oral con condon", "oral con condón"],
  "sexo-anal": ["sexo anal", "anal"],
  "juguetes-eroticos": ["juguetes eroticos", "juguetes", "juguete erótico"],
};

/** Mapeo slug de característica → términos para búsqueda (descripción) */
export const FEATURE_SLUG_TO_TERMS: Record<string, string[]> = {
  pelinegras: ["pelinegra", "pelo negro", "cabello negro"],
  tetonas: ["tetona", "busty", "busto grande"],
  culonas: ["culona", "colas", "glúteos"],
  bajitas: ["bajita", "baja estatura", "petite"],
  depiladas: ["depilada", "depilación", "sin vello"],
  "escort-pelinegra": ["pelinegra", "pelo negro"],
  "escort-tetona": ["tetona", "busty"],
  "escort-culona": ["culona", "colas"],
  "escort-bajita": ["bajita", "petite"],
  "escort-depilada": ["depilada", "depilación"],
};
