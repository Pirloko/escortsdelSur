/**
 * Datos SEO por filtro/categoría (título, meta description, H1).
 * Incluye slugs piramidales vía getPyramidalSeo.
 */

import { getPyramidalSeo } from "./seo-pyramidal";
import { getAllPyramidalSlugs } from "./seo-pyramidal";

const CITY_NAMES: Record<string, string> = {
  rancagua: "Rancagua",
  talca: "Talca",
  chillan: "Chillán",
  concepcion: "Concepción",
  temuco: "Temuco",
  curico: "Curicó",
  santiago: "Santiago",
};

export interface FilterSeo {
  title: string;
  description: string;
  h1: string;
  h2Intro?: string;
}

const FILTER_LABELS: Record<string, { short: string; plural: string }> = {
  escorts: { short: "Escorts", plural: "Escorts" },
  acompanantes: { short: "Acompañantes", plural: "Acompañantes" },
  "damas-de-compania": { short: "Damas de compañía", plural: "Damas de compañía" },
  sexo: { short: "Sexo", plural: "Sexo en Rancagua" },
  sexosur: { short: "Sexosur", plural: "Sexosur Rancagua" },
  skokka: { short: "Skokka", plural: "Skokka Rancagua" },
  scort: { short: "Scort", plural: "Scort en Rancagua" },
  pelinegras: { short: "Pelinegra", plural: "Escorts pelinegras" },
  tetonas: { short: "Tetona", plural: "Escorts tetonas" },
  culonas: { short: "Culona", plural: "Escorts culonas" },
  bajitas: { short: "Bajita", plural: "Escorts bajitas" },
  depiladas: { short: "Depilada", plural: "Escorts depiladas" },
  "escort-pelinegra": { short: "Escort pelinegra", plural: "Escort pelinegra" },
  "escort-tetona": { short: "Escort tetona", plural: "Escort tetona" },
  "escort-culona": { short: "Escort culona", plural: "Escort culona" },
  "escort-bajita": { short: "Escort bajita", plural: "Escort bajita" },
  "escort-depilada": { short: "Escort depilada", plural: "Escort depilada" },
  "escort-a-domicilio": { short: "Escort a domicilio", plural: "Escort a domicilio" },
  "escort-masajes-eroticos": { short: "Escort masajes eróticos", plural: "Escort masajes eróticos" },
  "escort-vip": { short: "Escort VIP", plural: "Escort VIP" },
  "escort-independiente": { short: "Escort independiente", plural: "Escort independiente" },
  "a-domicilio": { short: "A domicilio", plural: "Escorts a domicilio" },
  "apartamento-propio": { short: "Apartamento propio", plural: "Escorts con apartamento propio" },
  masajes: { short: "Masajes", plural: "Masajes eróticos" },
  "masajes-eroticos": { short: "Masajes eróticos", plural: "Masajes eróticos" },
  trios: { short: "Tríos", plural: "Tríos" },
  fetichismo: { short: "Fetichismo", plural: "Fetichismo" },
  "atencion-parejas": { short: "Atención a parejas", plural: "Atención a parejas" },
  "oral-con-condon": { short: "Oral con condón", plural: "Oral con condón" },
  "sexo-anal": { short: "Sexo anal", plural: "Sexo anal" },
  "juguetes-eroticos": { short: "Juguetes eróticos", plural: "Juguetes eróticos" },
  "escorts-pelinegras": { short: "Escorts pelinegras", plural: "Escorts pelinegras" },
  "escorts-tetonas": { short: "Escorts tetonas", plural: "Escorts tetonas" },
  "escorts-culonas": { short: "Escorts culonas", plural: "Escorts culonas" },
  "escorts-bajitas": { short: "Escorts bajitas", plural: "Escorts bajitas" },
  "escorts-depiladas": { short: "Escorts depiladas", plural: "Escorts depiladas" },
  "escorts-a-domicilio": { short: "Escorts a domicilio", plural: "Escorts a domicilio" },
  "escorts-apartamento-propio": { short: "Escorts apartamento propio", plural: "Escorts con apartamento propio" },
  "escorts-masajes": { short: "Escorts masajes", plural: "Escorts con masajes" },
  "escorts-trios": { short: "Escorts tríos", plural: "Escorts tríos" },
  "acompanantes-a-domicilio": { short: "Acompañantes a domicilio", plural: "Acompañantes a domicilio" },
  "acompanantes-masajes": { short: "Acompañantes masajes", plural: "Acompañantes con masajes" },
};

function getCityName(citySlug: string): string {
  return CITY_NAMES[citySlug.toLowerCase()] ?? citySlug.charAt(0).toUpperCase() + citySlug.slice(1);
}

/**
 * Devuelve título, meta description (140–160 caracteres) y H1 para una página de filtro.
 * Usa pirámide SEO para categorías/servicios/atributos/zonas.
 */
export function getFilterSeo(citySlug: string, filterSlug: string): FilterSeo {
  const cityName = getCityName(citySlug);
  const key = filterSlug.toLowerCase();

  if (getAllPyramidalSlugs().map((s) => s.toLowerCase()).includes(key)) {
    const pyramidal = getPyramidalSeo(citySlug, key, cityName);
    const descTrim = pyramidal.description.length > 160 ? pyramidal.description.slice(0, 157) + "…" : pyramidal.description;
    return {
      title: pyramidal.title,
      description: descTrim,
      h1: pyramidal.h1,
      h2Intro: `Perfiles en ${cityName}`,
    };
  }

  const label = FILTER_LABELS[key] ?? { short: filterSlug, plural: filterSlug };
  const plural = label.plural;
  const isIntent = ["sexo", "sexosur", "skokka", "scort"].includes(key);
  const title = isIntent
    ? `${plural} | Escorts y acompañantes en ${cityName} | Hola Cachero`
    : `${plural} en ${cityName} | Acompañantes | Hola Cachero`;
  const description = isIntent
    ? `Encuentra escorts y acompañantes en ${cityName}. Perfiles verificados, fotos y contacto. ${plural} en Hola Cachero.`
    : `${plural} en ${cityName}. Perfiles con fotos recientes y contacto. Encuentra acompañantes en ${cityName} en Hola Cachero.`;
  const descTrim = description.length > 160 ? description.slice(0, 157) + "…" : description;

  return {
    title,
    description: descTrim,
    h1: key === "sexo" ? `Sexo en ${cityName}` : key === "sexosur" ? `Sexosur ${cityName}` : `${plural} en ${cityName}`,
    h2Intro: `Perfiles en ${cityName}`,
  };
}
