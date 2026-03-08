/**
 * SEO piramidal para Rancagua: categorías, servicios, atributos y zonas.
 * 1 ciudad + 8 categorías + 40+ servicios + 40+ atributos + 20 zonas = 109+ páginas.
 */

const CITY_NAME = "Rancagua";
const SITE_NAME = "Hola Cachero";

/** Nivel 2: Categorías principales (las 3 primeras son ranking, el resto filtro por badge/descripción) */
export const PIRAMIDAL_CATEGORY_SLUGS = [
  "mejores-escorts",
  "escorts-nuevas",
  "escorts-recomendadas",
  "escorts-vip",
  "escorts-independientes",
  "escorts-premium",
  "escorts-verificadas",
  "escorts-disponibles",
] as const;

/** Nivel 3: Servicios (slug → términos para services_included / services_extra / description) */
export const PIRAMIDAL_SERVICE_SLUGS = [
  "masajes-eroticos",
  "sexo-anal",
  "oral-sin-condon",
  "sexo-con-condon",
  "trios",
  "lesbico",
  "beso-negro",
  "masaje-tantrico",
  "masaje-prostatico",
  "sexo-virtual",
  "companera-de-cena",
  "acompanante-eventos",
  "escort-a-domicilio",
  "escort-hotel",
  "escort-motel",
  "striptease",
  "fetichismo",
  "bdsm",
  "domina",
  "sumisa",
  "sexo-ducha",
  "juguetes-sexuales",
  "roleplay",
  "cumplir-fantasias",
  "garganta-profunda",
  "facial",
  "masaje-relajante",
  "masaje-sensual",
  "sexo-lento",
  "sexo-intenso",
  "citas-privadas",
  "encuentros-discretos",
  "servicio-nocturno",
  "servicio-24-horas",
  "servicio-express",
  "citas-lujosas",
  "companera-viajes",
  "masaje-con-final-feliz",
  "sexo-romantico",
  "experiencia-girlfriend",
] as const;

/** Nivel 4: Atributos físicos (slug → términos para description / badge) */
export const PIRAMIDAL_ATTRIBUTE_SLUGS = [
  "escort-rubia",
  "escort-pelinegra",
  "escort-castana",
  "escort-pelirroja",
  "escort-alta",
  "escort-bajita",
  "escort-delgada",
  "escort-curvy",
  "escort-tetona",
  "escort-culona",
  "escort-joven",
  "escort-madura",
  "escort-milf",
  "escort-universitaria",
  "escort-modelo",
  "escort-latina",
  "escort-brasilena",
  "escort-colombiana",
  "escort-venezolana",
  "escort-chilena",
  "escort-europea",
  "escort-exotica",
  "escort-de-lujo",
  "escort-premium",
  "escort-natural",
  "escort-siliconada",
  "escort-tatuada",
  "escort-sin-tatuajes",
  "escort-deportista",
  "escort-sensual",
  "escort-elegante",
  "escort-sexy",
  "escort-discreta",
  "escort-divertida",
  "escort-carismatica",
  "escort-apasionada",
  "escort-experta",
  "escort-intensa",
  "escort-romantica",
  "escort-aventurera",
] as const;

/** Nivel 5: Zonas de Rancagua (slug → término para campo zone) */
export const PIRAMIDAL_ZONE_SLUGS = [
  "escorts-centro",
  "escorts-machali",
  "escorts-cachapoal",
  "escorts-poblacion-diego-portales",
  "escorts-poblacion-rene-schneider",
  "escorts-villa-teniente",
  "escorts-villa-el-cobre",
  "escorts-villa-nueva",
  "escorts-baquedano",
  "escorts-la-compania",
  "escorts-san-damian",
  "escorts-los-lirios",
  "escorts-barrio-industrial",
  "escorts-parque-koke",
  "escorts-la-granja",
  "escorts-poblacion-manuel-rodriguez",
  "escorts-santa-julia",
  "escorts-san-joaquin",
  "escorts-las-americas",
  "escorts-el-manantial",
] as const;

/** Mapeo slug servicio → términos para filtrar en services_included, services_extra, description */
export const PIRAMIDAL_SERVICE_TERMS: Record<string, string[]> = {
  "masajes-eroticos": ["masajes eroticos", "masaje erótico", "masajes"],
  "sexo-anal": ["sexo anal", "anal"],
  "oral-sin-condon": ["oral sin condon", "oral sin condón"],
  "sexo-con-condon": ["sexo con condon", "con condón", "protección"],
  trios: ["trios", "trío", "trio"],
  lesbico: ["lesbico", "lesbico", "show lésbico"],
  "beso-negro": ["beso negro", "rimming"],
  "masaje-tantrico": ["tantrico", "tantra", "tántrico"],
  "masaje-prostatico": ["prostatico", "masaje prostático"],
  "sexo-virtual": ["virtual", "online", "video llamada"],
  "companera-de-cena": ["cena", "compañera", "cenas", "eventos"],
  "acompanante-eventos": ["eventos", "acompañante", "evento"],
  "escort-a-domicilio": ["domicilio", "a domicilio"],
  "escort-hotel": ["hotel", "hoteles"],
  "escort-motel": ["motel", "moteles"],
  striptease: ["striptease", "strip", "show"],
  fetichismo: ["fetichismo", "fetiche"],
  bdsm: ["bdsm", "dominación", "sumisa"],
  domina: ["domina", "dominación", "dominatrix"],
  sumisa: ["sumisa", "sumisión"],
  "sexo-ducha": ["ducha", "baño", "shower"],
  "juguetes-sexuales": ["juguetes", "juguete erótico", "juguetes eroticos"],
  roleplay: ["roleplay", "role play", "fantasía"],
  "cumplir-fantasias": ["fantasias", "fantasía", "fantasías"],
  "garganta-profunda": ["garganta profunda", "deep throat"],
  facial: ["facial", "finish facial"],
  "masaje-relajante": ["masaje relajante", "relajante"],
  "masaje-sensual": ["masaje sensual", "sensual"],
  "sexo-lento": ["lento", "tranquilo", "pausado"],
  "sexo-intenso": ["intenso", "pasión", "apasionado"],
  "citas-privadas": ["privado", "discreto", "privacidad"],
  "encuentros-discretos": ["discreto", "discreción", "reserva"],
  "servicio-nocturno": ["nocturno", "noche", "nocturno"],
  "servicio-24-horas": ["24 horas", "24h", "disponible 24"],
  "servicio-express": ["express", "rápido", "corto"],
  "citas-lujosas": ["lujo", "lujoso", "premium", "vip"],
  "companera-viajes": ["viajes", "viaje", "companera viajes"],
  "masaje-con-final-feliz": ["final feliz", "masaje con final", "happy ending"],
  "sexo-romantico": ["romántico", "romantico", "romance"],
  "experiencia-girlfriend": ["girlfriend", "novia", "experiencia pareja"],
};

/** Mapeo slug atributo → términos para description / badge */
export const PIRAMIDAL_ATTRIBUTE_TERMS: Record<string, string[]> = {
  "escort-rubia": ["rubia", "rubias", "blondo", "cabello rubio"],
  "escort-pelinegra": ["pelinegra", "pelo negro", "cabello negro"],
  "escort-castana": ["castaña", "castana", "morena", "cabello castaño"],
  "escort-pelirroja": ["pelirroja", "pelirrojo", "rojo", "ginger"],
  "escort-alta": ["alta", "altura", "estatura"],
  "escort-bajita": ["bajita", "petite", "baja estatura"],
  "escort-delgada": ["delgada", "delgada", "slim", "esbelta"],
  "escort-curvy": ["curvy", "curvas", "rellena"],
  "escort-tetona": ["tetona", "busty", "busto", "pechos"],
  "escort-culona": ["culona", "colas", "glúteos", "culo"],
  "escort-joven": ["joven", "juventud", "joven"],
  "escort-madura": ["madura", "mujer madura"],
  "escort-milf": ["milf", "madura"],
  "escort-universitaria": ["universitaria", "estudiante", "universidad"],
  "escort-modelo": ["modelo", "modelos", "foto modelo"],
  "escort-latina": ["latina", "latino"],
  "escort-brasilena": ["brasileña", "brasilena", "brasil"],
  "escort-colombiana": ["colombiana", "colombia"],
  "escort-venezolana": ["venezolana", "venezuela"],
  "escort-chilena": ["chilena", "chile"],
  "escort-europea": ["europea", "europa"],
  "escort-exotica": ["exótica", "exotica"],
  "escort-de-lujo": ["lujo", "lujoso", "premium"],
  "escort-premium": ["premium", "vip", "exclusivo"],
  "escort-natural": ["natural", "naturales", "sin cirugía"],
  "escort-siliconada": ["silicona", "siliconada", "implantes"],
  "escort-tatuada": ["tatuada", "tatuajes", "tattoo"],
  "escort-sin-tatuajes": ["sin tatuajes", "natural"],
  "escort-deportista": ["deportista", "deportiva", "fitness"],
  "escort-sensual": ["sensual", "sensualidad"],
  "escort-elegante": ["elegante", "elegancia"],
  "escort-sexy": ["sexy", "atractiva"],
  "escort-discreta": ["discreta", "discreción"],
  "escort-divertida": ["divertida", "diversión", "alegre"],
  "escort-carismatica": ["carismática", "carismatica"],
  "escort-apasionada": ["apasionada", "pasión"],
  "escort-experta": ["experta", "experiencia"],
  "escort-intensa": ["intensa", "intensidad"],
  "escort-romantica": ["romántica", "romantica"],
  "escort-aventurera": ["aventurera", "aventura"],
};

/** Mapeo slug zona → valor(es) para campo zone (normalizado a minúsculas para comparar) */
export const PIRAMIDAL_ZONE_MATCH: Record<string, string[]> = {
  "escorts-centro": ["centro", "céntrico"],
  "escorts-machali": ["machalí", "machali"],
  "escorts-cachapoal": ["cachapoal"],
  "escorts-poblacion-diego-portales": ["diego portales", "diego portales"],
  "escorts-poblacion-rene-schneider": ["rene schneider", "rené schneider"],
  "escorts-villa-teniente": ["villa teniente", "teniente"],
  "escorts-villa-el-cobre": ["villa el cobre", "el cobre"],
  "escorts-villa-nueva": ["villa nueva"],
  "escorts-baquedano": ["baquedano"],
  "escorts-la-compania": ["la compañía", "la compania"],
  "escorts-san-damian": ["san damián", "san damian"],
  "escorts-los-lirios": ["los lirios", "lirios"],
  "escorts-barrio-industrial": ["industrial", "barrio industrial"],
  "escorts-parque-koke": ["koke", "parque koke"],
  "escorts-la-granja": ["la granja", "granja"],
  "escorts-poblacion-manuel-rodriguez": ["manuel rodriguez", "manuel rodríguez"],
  "escorts-santa-julia": ["santa julia", "santa julia"],
  "escorts-san-joaquin": ["san joaquín", "san joaquin"],
  "escorts-las-americas": ["las américas", "las americas"],
  "escorts-el-manantial": ["el manantial", "manantial"],
};

export interface PyramidalSeo {
  title: string;
  description: string;
  h1: string;
  labelShort: string;
  labelPlural: string;
}

function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Devuelve meta title, description y H1 para una página piramidal.
 */
export function getPyramidalSeo(
  citySlug: string,
  segmentSlug: string,
  cityName: string = CITY_NAME
): PyramidalSeo {
  const key = segmentSlug.toLowerCase();
  const humanized = humanizeSlug(key);

  if (PIRAMIDAL_CATEGORY_SLUGS.includes(key as (typeof PIRAMIDAL_CATEGORY_SLUGS)[number])) {
    const labels: Record<string, { short: string; plural: string }> = {
      "mejores-escorts": { short: "Mejores escorts", plural: "Mejores escorts" },
      "escorts-nuevas": { short: "Escorts nuevas", plural: "Escorts nuevas" },
      "escorts-recomendadas": { short: "Escorts recomendadas", plural: "Escorts recomendadas" },
      "escorts-vip": { short: "Escorts VIP", plural: "Escorts VIP" },
      "escorts-independientes": { short: "Escorts independientes", plural: "Escorts independientes" },
      "escorts-premium": { short: "Escorts premium", plural: "Escorts premium" },
      "escorts-verificadas": { short: "Escorts verificadas", plural: "Escorts verificadas" },
      "escorts-disponibles": { short: "Escorts disponibles", plural: "Escorts disponibles" },
    };
    const l = labels[key] ?? { short: humanized, plural: humanized };
    return {
      title: `${l.plural} en ${cityName} | ${SITE_NAME}`,
      description: `Descubre ${l.plural.toLowerCase()} en ${cityName}. Perfiles verificados con fotos reales y contacto. Encuentra acompañantes en ${SITE_NAME}.`,
      h1: `${l.plural} en ${cityName}`,
      labelShort: l.short,
      labelPlural: l.plural,
    };
  }

  if (PIRAMIDAL_SERVICE_SLUGS.includes(key as (typeof PIRAMIDAL_SERVICE_SLUGS)[number])) {
    const plural = humanized.endsWith("s") ? humanized : humanized + " en Rancagua";
    return {
      title: `${humanized} en ${cityName} | Escorts y acompañantes | ${SITE_NAME}`,
      description: `${humanized} en ${cityName}. Perfiles que ofrecen este servicio. Fotos, descripción y contacto en ${SITE_NAME}.`,
      h1: `${humanized} en ${cityName}`,
      labelShort: humanized,
      labelPlural: plural,
    };
  }

  if (PIRAMIDAL_ATTRIBUTE_SLUGS.includes(key as (typeof PIRAMIDAL_ATTRIBUTE_SLUGS)[number])) {
    const label = key.startsWith("escort-") ? humanized : `Escort ${humanized}`;
    return {
      title: `${label} en ${cityName} | Escorts | ${SITE_NAME}`,
      description: `Encuentra ${label.toLowerCase()} en ${cityName}. Perfiles con fotos reales y datos de contacto en ${SITE_NAME}.`,
      h1: `${label} en ${cityName}`,
      labelShort: label,
      labelPlural: `${label}s en ${cityName}`,
    };
  }

  if (PIRAMIDAL_ZONE_SLUGS.includes(key as (typeof PIRAMIDAL_ZONE_SLUGS)[number])) {
    const zoneLabel = humanized.replace(/^Escorts /, ""); // "Escorts Centro" → "Centro"
    return {
      title: `Escorts en ${zoneLabel} (${cityName}) | ${SITE_NAME}`,
      description: `Escorts en ${zoneLabel}, ${cityName}. Perfiles disponibles en la zona con fotos y contacto. ${SITE_NAME}.`,
      h1: `Escorts en ${zoneLabel}, ${cityName}`,
      labelShort: zoneLabel,
      labelPlural: `Escorts en ${zoneLabel}`,
    };
  }

  return {
    title: `${humanized} en ${cityName} | ${SITE_NAME}`,
    description: `Perfiles en ${cityName}. ${humanized}. Fotos y contacto en ${SITE_NAME}.`,
    h1: `${humanized} en ${cityName}`,
    labelShort: humanized,
    labelPlural: humanized,
  };
}

/** Todos los slugs piramidales (categorías + servicios + atributos + zonas) para router y sitemap */
export function getAllPyramidalSlugs(): string[] {
  return [
    ...PIRAMIDAL_CATEGORY_SLUGS,
    ...PIRAMIDAL_SERVICE_SLUGS,
    ...PIRAMIDAL_ATTRIBUTE_SLUGS,
    ...PIRAMIDAL_ZONE_SLUGS,
  ];
}

/** URLs de categorías para enlazado interno (hub ciudad) */
export function getCategoryInternalLinks(citySlug: string): { path: string; text: string }[] {
  return [
    { path: `/${citySlug}/mejores-escorts`, text: "Mejores escorts" },
    { path: `/${citySlug}/escorts-nuevas`, text: "Escorts nuevas" },
    { path: `/${citySlug}/escorts-vip`, text: "Escorts VIP" },
    { path: `/${citySlug}/escorts-independientes`, text: "Escorts independientes" },
    { path: `/${citySlug}/escorts-recomendadas`, text: "Escorts recomendadas" },
    { path: `/${citySlug}/escorts-premium`, text: "Escorts premium" },
    { path: `/${citySlug}/escorts-verificadas`, text: "Escorts verificadas" },
    { path: `/${citySlug}/escorts-disponibles`, text: "Escorts disponibles" },
  ];
}

/** Muestra de servicios para enlaces internos en hub */
export function getServiceInternalLinksSample(citySlug: string, count: number = 8): { path: string; text: string }[] {
  const samples = PIRAMIDAL_SERVICE_SLUGS.slice(0, count);
  return samples.map((slug) => ({
    path: `/${citySlug}/${slug}`,
    text: humanizeSlug(slug),
  }));
}

/** Muestra de zonas para enlaces internos en hub */
export function getZoneInternalLinksSample(citySlug: string, count: number = 10): { path: string; text: string }[] {
  const samples = PIRAMIDAL_ZONE_SLUGS.slice(0, count);
  return samples.map((slug) => ({
    path: `/${citySlug}/${slug}`,
    text: humanizeSlug(slug.replace(/^escorts-/, "")),
  }));
}
