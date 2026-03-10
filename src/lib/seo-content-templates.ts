/**
 * Plantillas SEO con variaciones automáticas por tipo: servicios, atributos, zonas.
 * Objetivo: 400-600 palabras, contenido único por página, evitar duplicados.
 */

import {
  PIRAMIDAL_SERVICE_SLUGS,
  PIRAMIDAL_ATTRIBUTE_SLUGS,
  PIRAMIDAL_ZONE_SLUGS,
} from "./seo-pyramidal";

export type ContentSection = { h2: string; paragraphs: string[] };

const SITE = "Hola Cachero";

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** --- PLANTILLA SERVICIOS (400-600 palabras) --- */

const introServiceTemplates = (
  city: string,
  label: string
): string[] => [
  `Si buscas ${label.toLowerCase()} en ${city}, en ${SITE} reunimos perfiles que ofrecen este servicio. La plataforma permite comparar acompañantes en ${city} con fotos recientes, descripción de servicios y contacto directo por WhatsApp o teléfono.`,
  `En ${city} muchas personas buscan ${label.toLowerCase()}. En ${SITE} encontrarás un listado de escorts en ${city} que incluyen este servicio en su oferta. Cada perfil indica qué incluye y qué es adicional para que coordines con claridad.`,
  `${label} en ${city} es una de las búsquedas más frecuentes. Nuestro directorio muestra acompañantes en ${city} que ofrecen este servicio, con información verificada y datos de contacto para que elijas con tranquilidad.`,
];

const contextServiceTemplates = (city: string, label: string): string[] => [
  `El servicio de ${label.toLowerCase()} puede variar según cada perfil. En ${SITE} cada escort en ${city} describe en su anuncio qué incluye: revisa la descripción y la galería antes de contactar. En ${city} y la Región de O'Higgins hay opciones tanto en apartamento propio como a domicilio.`,
  `En los perfiles de escorts en ${city} publicados en ${SITE} podrás ver si ofrecen ${label.toLowerCase()} y bajo qué condiciones. La transparencia es prioritaria: recomendamos confirmar horarios, tarifas y detalles directamente con la persona del perfil antes de concretar una cita.`,
  `Las acompañantes en ${city} que ofrecen ${label.toLowerCase()} suelen detallar en su perfil el tipo de atención. Utiliza los enlaces a cada perfil para leer la descripción completa, ver fotos y contactar por el canal indicado.`,
];

const securityServiceTemplates = (city: string): string[] => [
  `La discreción y el respeto son valores que promovemos en ${SITE}. Solo mostramos la información que cada perfil autoriza. Te recomendamos siempre confirmar condiciones y disponibilidad directamente con la escort en ${city} antes de reservar. La comunicación clara desde el inicio ayuda a que la experiencia sea satisfactoria para ambas partes.`,
  `En ${SITE} no compartimos datos personales sensibles. Cada perfil de acompañante en ${city} incluye el canal de contacto oficial. Confirma tarifas, horarios y lo que incluye el servicio directamente con la persona antes de concretar. Así evitas malentendidos y disfrutas de un encuentro con tranquilidad.`,
  `Antes de coordinar con una escort en ${city}, revisa su descripción y fotos en ${SITE}. Confirma por WhatsApp o teléfono los detalles del servicio, la zona de atención y las condiciones. La puntualidad y el trato respetuoso son fundamentales para una buena experiencia.`,
];

const closingServiceTemplates = (city: string, label: string): string[] => [
  `Explora los perfiles que ofrecen ${label.toLowerCase()} en ${city} en el listado de esta página. Cada tarjeta enlaza al perfil completo con galería, descripción y botón de contacto. ${SITE} – escorts en ${city} y acompañantes en el sur de Chile.`,
  `Si buscas ${label.toLowerCase()} en ${city}, los perfiles que ves aquí han sido filtrados por este servicio. Entra a cada uno para ver fotos, leer la descripción y contactar directamente. También puedes revisar la página principal de ${city} para ver todas las opciones disponibles.`,
  `En ${SITE} puedes comparar las escorts en ${city} que ofrecen ${label.toLowerCase()}. Utiliza los enlaces de esta página para acceder a cada perfil, ver su galería y coordinar por el canal indicado. Encuentra la opción que mejor se ajuste a lo que buscas.`,
];

/** --- PLANTILLA ATRIBUTOS (400-600 palabras) --- */

const introAttributeTemplates = (city: string, label: string): string[] => [
  `Si buscas ${label.toLowerCase()} en ${city}, en ${SITE} encontrarás un listado de acompañantes que coinciden con esta preferencia. La plataforma reúne perfiles con fotos recientes y datos de contacto para que puedas elegir con tranquilidad.`,
  `Las escorts en ${city} que se describen como ${label.toLowerCase()} suelen ser muy solicitadas. En ${SITE} reunimos perfiles que indican este atributo en su descripción o categoría. Cada perfil incluye galería y forma de contacto.`,
  `En ${city} muchas personas buscan ${label.toLowerCase()}. Nuestro directorio en ${SITE} te permite filtrar y ver acompañantes en ${city} que coinciden con esta preferencia. Revisa las fotos y la descripción de cada perfil antes de contactar.`,
];

const contextAttributeTemplates = (city: string, label: string): string[] => [
  `Las preferencias de los clientes varían: algunos buscan ${label.toLowerCase()} en ${city} de forma explícita. En ${SITE} cada escort en ${city} describe sus características en su anuncio. Así puedes comparar opciones y elegir el perfil que mejor se ajuste a ti.`,
  `La experiencia de acompañamiento en ${city} depende de cada perfil. Las escorts en ${city} que aparecen en esta página han sido filtradas por el atributo ${label.toLowerCase()}. Revisa la descripción y la galería de cada una para conocer más.`,
  `En ${SITE} los perfiles de acompañantes en ${city} incluyen descripción y fotos. Si buscas ${label.toLowerCase()}, los resultados de esta página coinciden con ese criterio. Utiliza los enlaces para ver el perfil completo y contactar por WhatsApp o teléfono.`,
];

const experienceAttributeTemplates = (city: string): string[] => [
  `En ${city} y la Región de O'Higgins hay una oferta diversa de escorts. Cada una define su estilo y servicios en su perfil. Te recomendamos leer la descripción completa y confirmar disponibilidad y condiciones directamente con la persona antes de concretar una cita.`,
  `La comunicación clara desde el inicio ayuda a que la experiencia sea satisfactoria. En ${SITE} solo mostramos la información que cada perfil autoriza. Confirma horarios, tarifas y lo que incluye cada acompañante en ${city} por el canal oficial indicado.`,
  `Cada escort en ${city} publicada en ${SITE} tiene su propia descripción y galería. Revisa los perfiles que te interesen y contacta directamente para coordinar. La discreción y el respeto son prioritarios en nuestra plataforma.`,
];

const closingAttributeTemplates = (city: string, label: string): string[] => [
  `Explora los perfiles de ${label.toLowerCase()} en ${city} en el listado de esta página. Cada tarjeta enlaza al perfil completo. ${SITE} – escorts en ${city} y acompañantes en el sur de Chile.`,
  `Si buscas ${label.toLowerCase()} en ${city}, los perfiles mostrados aquí coinciden con esa preferencia. Entra a cada uno para ver fotos y contactar. También puedes revisar la página de ${city} para ver todas las opciones.`,
  `En ${SITE} puedes comparar acompañantes en ${city} con el atributo ${label.toLowerCase()}. Usa los enlaces de esta página para acceder a cada perfil y coordinar por el canal indicado.`,
];

/** --- PLANTILLA ZONAS (400-600 palabras) --- */

const introZoneTemplates = (city: string, zoneLabel: string): string[] => [
  `Si buscas escorts en ${zoneLabel}, ${city}, en ${SITE} encontrarás perfiles que atienden en esta zona. La plataforma reúne acompañantes en ${city} con indicación de zona, fotos recientes y datos de contacto.`,
  `En ${zoneLabel} y alrededores de ${city} hay opciones de acompañamiento. En ${SITE} listamos perfiles de escorts en ${city} que atienden en esta zona. Cada perfil incluye información de contacto para que coordines con tranquilidad.`,
  `Las escorts en ${zoneLabel}, ${city}, que aparecen en ${SITE} indican esta zona en su perfil. Así puedes elegir opciones cercanas a ti. Revisa la descripción y la galería de cada una antes de contactar.`,
];

const contextZoneTemplates = (city: string, zoneLabel: string): string[] => [
  `La zona ${zoneLabel} en ${city} cuenta con buena conectividad y opciones de alojamiento. Muchos clientes buscan escorts en ${city} que atiendan en esta zona para facilitar el encuentro. En ${SITE} cada perfil muestra la información que la acompañante autoriza.`,
  `En ${city} las zonas de atención pueden variar según cada perfil. Los perfiles de esta página corresponden a escorts en ${city} que indican ${zoneLabel} como zona. Confirma siempre la dirección o punto de encuentro directamente con la persona antes de concretar.`,
  `La Región de O'Higgins y ${city} ofrecen distintas zonas para encuentros discretos. En ${SITE} puedes filtrar por zona y ver acompañantes en ${city} que atienden en ${zoneLabel}. Revisa cada perfil para ver disponibilidad y condiciones.`,
];

const areaZoneTemplates = (city: string, zoneLabel: string): string[] => [
  `En ${zoneLabel}, ${city}, hay hoteles, apartamentos y zonas residenciales que facilitan encuentros privados. Las escorts en ${city} que atienden en esta zona suelen indicar en su perfil horarios y condiciones. Contacta por el canal oficial para coordinar.`,
  `La disponibilidad de escorts en ${zoneLabel} puede variar según el día y la hora. En ${SITE} cada perfil de acompañante en ${city} incluye datos de contacto para que consultes directamente. Te recomendamos confirmar zona y horario antes de reservar.`,
  `Si buscas acompañantes en ${zoneLabel}, ${city}, el listado de esta página reúne perfiles que atienden en la zona. En ${SITE} solo mostramos la información que cada perfil autoriza. Utiliza los enlaces para ver el perfil completo y contactar.`,
];

const closingZoneTemplates = (city: string, zoneLabel: string): string[] => [
  `Explora los perfiles de escorts en ${zoneLabel}, ${city}, en el listado de esta página. Cada tarjeta enlaza al perfil completo. ${SITE} – escorts en ${city} y acompañantes en el sur de Chile.`,
  `Si buscas escorts en ${zoneLabel}, ${city}, los perfiles mostrados aquí atienden en esta zona. Entra a cada uno para ver fotos y contactar. También puedes revisar la página de ${city} para ver todas las zonas disponibles.`,
  `En ${SITE} puedes comparar acompañantes en ${city} que atienden en ${zoneLabel}. Usa los enlaces de esta página para acceder a cada perfil y coordinar por WhatsApp o teléfono.`,
];

/** Detecta tipo de slug para elegir plantilla */
export function getPyramidalSegmentType(slug: string): "service" | "attribute" | "zone" | "category" | null {
  const key = slug.toLowerCase();
  if (PIRAMIDAL_SERVICE_SLUGS.includes(key as (typeof PIRAMIDAL_SERVICE_SLUGS)[number])) return "service";
  if (PIRAMIDAL_ATTRIBUTE_SLUGS.includes(key as (typeof PIRAMIDAL_ATTRIBUTE_SLUGS)[number])) return "attribute";
  if (PIRAMIDAL_ZONE_SLUGS.includes(key as (typeof PIRAMIDAL_ZONE_SLUGS)[number])) return "zone";
  return "category";
}

/** Genera secciones para página de SERVICIO (400-600 palabras) */
export function getServiceContentSections(
  cityName: string,
  labelPlural: string,
  labelShort: string
): ContentSection[] {
  const intro = pick(introServiceTemplates(cityName, labelShort));
  const context = pick(contextServiceTemplates(cityName, labelShort));
  const security = pick(securityServiceTemplates(cityName));
  const closing = pick(closingServiceTemplates(cityName, labelShort));

  let paragraphs = [intro, context, security, closing];
  if (wordCount(paragraphs.join(" ")) < 400) {
    const extra = pick(contextServiceTemplates(cityName, labelShort));
    paragraphs = [intro, context, extra, security, closing];
  }
  let text = paragraphs.join(" ");
  if (wordCount(text) > 600) {
    const arr = text.split(/\s+/);
    text = arr.slice(0, 600).join(" ");
    const lastPeriod = text.lastIndexOf(".");
    if (lastPeriod > 400) text = text.slice(0, lastPeriod + 1);
    paragraphs = text.split(/(?<=\.)\s+/).map((p) => p.trim()).filter(Boolean);
  }

  return [
    { h2: `${labelPlural} en ${cityName}`, paragraphs: [intro, context] },
    { h2: `Recomendaciones de seguridad y contacto`, paragraphs: [security] },
    { h2: `Explora perfiles con ${labelShort.toLowerCase()} en ${cityName}`, paragraphs: [closing] },
  ];
}

/** Genera secciones para página de ATRIBUTO (400-600 palabras) */
export function getAttributeContentSections(
  cityName: string,
  labelPlural: string,
  labelShort: string
): ContentSection[] {
  const intro = pick(introAttributeTemplates(cityName, labelShort));
  const context = pick(contextAttributeTemplates(cityName, labelShort));
  const experience = pick(experienceAttributeTemplates(cityName));
  const closing = pick(closingAttributeTemplates(cityName, labelShort));

  let paragraphs = [intro, context, experience, closing];
  if (wordCount(paragraphs.join(" ")) < 400) {
    const extra = pick(contextAttributeTemplates(cityName, labelShort));
    paragraphs = [intro, context, extra, experience, closing];
  }

  return [
    { h2: `${labelPlural} en ${cityName}`, paragraphs: [intro, context] },
    { h2: `Preferencias y experiencia de acompañamiento`, paragraphs: [experience] },
    { h2: `Explora perfiles de ${labelShort.toLowerCase()} en ${cityName}`, paragraphs: [closing] },
  ];
}

/** Genera secciones para página de ZONA (400-600 palabras) */
export function getZoneContentSections(
  cityName: string,
  zoneLabel: string,
  _labelPlural: string
): ContentSection[] {
  const intro = pick(introZoneTemplates(cityName, zoneLabel));
  const context = pick(contextZoneTemplates(cityName, zoneLabel));
  const area = pick(areaZoneTemplates(cityName, zoneLabel));
  const closing = pick(closingZoneTemplates(cityName, zoneLabel));

  let paragraphs = [intro, context, area, closing];
  if (wordCount(paragraphs.join(" ")) < 400) {
    const extra = pick(contextZoneTemplates(cityName, zoneLabel));
    paragraphs = [intro, context, extra, area, closing];
  }

  return [
    { h2: `Escorts en ${zoneLabel}, ${cityName}`, paragraphs: [intro, context] },
    { h2: `Zona, facilidad de encuentros y disponibilidad`, paragraphs: [area] },
    { h2: `Explora perfiles en ${zoneLabel}`, paragraphs: [closing] },
  ];
}
