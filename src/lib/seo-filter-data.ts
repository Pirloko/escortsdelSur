/**
 * Datos SEO por filtro/categoría (título, meta description, H1).
 * Por ciudad se usa el nombre; aquí solo el slug del filtro.
 * Uso: getFilterSeo("rancagua", "pelinegras") → title, description, h1.
 */

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
  pelinegras: { short: "Pelinegra", plural: "Escorts pelinegras" },
  tetonas: { short: "Tetona", plural: "Escorts tetonas" },
  culonas: { short: "Culona", plural: "Escorts culonas" },
  bajitas: { short: "Bajita", plural: "Escorts bajitas" },
  depiladas: { short: "Depilada", plural: "Escorts depiladas" },
  "a-domicilio": { short: "A domicilio", plural: "Escorts a domicilio" },
  "apartamento-propio": { short: "Apartamento propio", plural: "Escorts con apartamento propio" },
  masajes: { short: "Masajes", plural: "Masajes eróticos" },
  trios: { short: "Tríos", plural: "Tríos" },
  fetichismo: { short: "Fetichismo", plural: "Fetichismo" },
  "atencion-parejas": { short: "Atención a parejas", plural: "Atención a parejas" },
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
 * Devuelve título, meta description y H1 para una página de filtro.
 * Ej: getFilterSeo("rancagua", "pelinegras")
 */
export function getFilterSeo(citySlug: string, filterSlug: string): FilterSeo {
  const cityName = getCityName(citySlug);
  const key = filterSlug.toLowerCase();
  const label = FILTER_LABELS[key] ?? { short: filterSlug, plural: filterSlug };
  const plural = label.plural;

  return {
    title: `${plural} en ${cityName} | Acompañantes | Hola Cachero`,
    description: `${plural} en ${cityName}. Perfiles con fotos recientes y contacto. Encuentra acompañantes en ${cityName} en Hola Cachero.`,
    h1: `${plural} en ${cityName}`,
    h2Intro: `Perfiles en ${cityName}`,
  };
}
