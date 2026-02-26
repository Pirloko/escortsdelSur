/**
 * SEO: slugs válidos para rutas de ciudad (URLs limpias sin /ciudad/)
 * Fase 1 prioritarias: Rancagua, Talca, Chillán, Concepción, Temuco
 */
export const CITY_SLUGS = [
  "rancagua",
  "talca",
  "chillan",
  "concepcion",
  "temuco",
  "valdivia",
  "osorno",
  "puerto-montt",
] as const;

export type CitySlug = (typeof CITY_SLUGS)[number];

/** Nombre de ciudad (display) → slug para URL */
export const cityNameToSlug: Record<string, string> = {
  Rancagua: "rancagua",
  Talca: "talca",
  Chillán: "chillan",
  Concepción: "concepcion",
  Temuco: "temuco",
  Valdivia: "valdivia",
  Osorno: "osorno",
  "Puerto Montt": "puerto-montt",
};

export function getCitySlugFromName(name: string): string {
  return cityNameToSlug[name] ?? name.toLowerCase().replace(/\s+/g, "-").normalize("NFD").replace(/\u0300/g, "");
}

export function isValidCitySlug(slug: string): slug is CitySlug {
  return (CITY_SLUGS as readonly string[]).includes(slug);
}

export interface CitySeo {
  seo_title: string;
  seo_description: string;
  seo_content: string;
  keyword_primary: string;
}

export interface CityWithSeo {
  id: string;
  name: string;
  slug: string;
  profiles: number;
  image: string;
  seo_title: string;
  seo_description: string;
  seo_content: string;
  keyword_primary: string;
}
