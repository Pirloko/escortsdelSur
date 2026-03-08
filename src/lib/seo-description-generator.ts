/**
 * Generador de descripciones SEO para perfiles (250-400 palabras).
 * Regla: no sobrescribir descripciones manuales; solo usar cuando el campo está vacío
 * o el usuario pulsa explícitamente el botón "Texto aleatorio" / "Generar descripción SEO".
 */

const SITE_NAME = "Hola Cachero";

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export interface SeoDescriptionInput {
  name?: string;
  age?: string;
  city?: string;
  category?: string;
  servicesIncluded?: string[];
  servicesExtra?: string[];
  nationality?: string;
  whatsapp?: string;
}

const INTROS = [
  (n: string, e: string) => (n && e ? `Soy ${n}, tengo ${e} años.` : n ? `Hola, soy ${n}.` : e ? `Tengo ${e} años.` : "Hola."),
  (n: string, e: string) => (n && e ? `Mi nombre es ${n} y tengo ${e} años.` : n ? `Mi nombre es ${n}.` : ""),
  (n: string, e: string) => (n && e ? `Encantada, soy ${n}, ${e} años.` : n ? `Encantada, soy ${n}.` : ""),
];

const CITY_PRESENT = (city: string) => [
  `Atendiendo en ${city}. Mi perfil está verificado en ${SITE_NAME}, donde encontrarás escorts en ${city} y acompañantes en ${city}.`,
  `Disponible en ${city}. Soy una de las acompañantes en ${city} que podrás encontrar en ${SITE_NAME}, junto con otras escorts en ${city}.`,
  `Atiendo en ${city}. En ${SITE_NAME} formo parte del listado de escorts en ${city} y damas de compañía en ${city}.`,
  `Resido en ${city} y atiendo en la zona. Perfil verificado en ${SITE_NAME}, escorts en ${city} y acompañantes en ${city}.`,
];

const ABOUT_ME = [
  "Soy discreta, profesional y me adapto a lo que buscas. Disfruto de encuentros en ambientes cómodos y con total reserva.",
  "Me considero amigable, cálida y seria. La atención personalizada y la discreción son prioritarias para mí.",
  "Soy una escort verificada y seria. Me gusta ofrecer experiencias personalizadas y adaptadas a cada persona.",
  "Profesional, elegante y discreta. Me encanta crear buenos momentos y que te sientas a gusto.",
  "Soy reservada, amigable y me adapto a tus preferencias. Ambientes cómodos y discretos, atención personalizada.",
];

const SERVICES_INTRO = [
  "En mi perfil puedes revisar los servicios que ofrezco.",
  "Ofrezco una amplia gama de servicios que detallo en mi perfil.",
  "Los servicios que incluyo y los adicionales están descritos en mi perfil.",
];

const SEO_BLOCK = (city: string) => [
  `En ${SITE_NAME} encontrarás mi perfil junto con otras escorts en ${city} y acompañantes en ${city}. La plataforma reúne damas de compañía en ${city} con perfiles verificados, fotos recientes y datos de contacto. Si buscas escort en ${city} o acompañante en ${city}, aquí podrás comparar opciones y elegir con tranquilidad.`,
  `Soy una de las escorts en ${city} que forman parte de ${SITE_NAME}. Acompañantes en ${city}, damas de compañía en ${city} y perfiles verificados: en la web tienes toda la información para contactar. Escort en ${city} verificada, con fotos actuales y descripción de servicios.`,
  `Perfil verificado en ${SITE_NAME}, donde se reúnen escorts en ${city} y acompañantes en ${city}. Dama de compañía en ${city} disponible para encuentros discretos. La web te permite ver fotos, leer la descripción y contactar por WhatsApp. Escort en ${city} seria y profesional.`,
];

const CONTACT_CTA = (wa: string) => [
  wa ? `Puedes escribirme por WhatsApp para coordinar. Contáctame y reserva con confianza.` : `Contáctame para más información y para coordinar. Te espero.`,
  wa ? `Escríbeme por WhatsApp y coordinamos. Reserva con confianza.` : `Escríbeme y coordinamos. Te espero.`,
  wa ? `Para reservar o consultar, contáctame por WhatsApp. Te respondo a la brevedad.` : `Contáctame para reservar o consultar. Te espero.`,
];

export function generateSeoDescription(input: SeoDescriptionInput): string {
  const name = (input.name ?? "").trim();
  const age = (input.age ?? "").trim();
  const city = (input.city ?? "Rancagua").trim() || "Rancagua";
  const category = (input.category ?? "").trim();
  const servicesIncluded = input.servicesIncluded ?? [];
  const servicesExtra = input.servicesExtra ?? [];
  const nationality = (input.nationality ?? "").trim();
  const whatsapp = (input.whatsapp ?? "").trim();

  const paragraphs: string[] = [];

  const introFn = pick(INTROS);
  const intro = introFn(name, age);
  if (intro) paragraphs.push(intro);

  const cityPresent = pick(CITY_PRESENT(city));
  paragraphs.push(cityPresent);

  const about = pick(ABOUT_ME);
  paragraphs.push(about);

  if (category) paragraphs.push(`${category}.`);

  if (servicesIncluded.length > 0 || servicesExtra.length > 0) {
    const servIntro = pick(SERVICES_INTRO);
    const parts: string[] = [servIntro];
    if (servicesIncluded.length > 0) parts.push(`Servicios incluidos: ${servicesIncluded.slice(0, 12).join(", ")}.`);
    if (servicesExtra.length > 0) parts.push(`Servicios adicionales: ${servicesExtra.slice(0, 10).join(", ")}.`);
    paragraphs.push(parts.join(" "));
  }

  if (nationality) paragraphs.push(`Nacionalidad: ${nationality}.`);

  const seoBlock = pick(SEO_BLOCK(city));
  paragraphs.push(seoBlock);

  const cta = pick(CONTACT_CTA(whatsapp));
  paragraphs.push(cta);
  if (whatsapp) paragraphs.push(`WhatsApp disponible para contacto directo.`);

  let text = paragraphs.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();

  const FLOOR = 250;
  const CEIL = 400;
  if (wordCount(text) < FLOOR) {
    const extra = [
      `En ${city} hay variedad de opciones; en ${SITE_NAME} puedes comparar perfiles de escorts en ${city} y acompañantes en ${city}.`,
      `La discreción y el respeto son importantes para mí. En ${SITE_NAME} encontrarás mi perfil junto a otras escorts en ${city}.`,
      `Si buscas escort en ${city} o dama de compañía en ${city}, en ${SITE_NAME} tienes perfiles verificados con fotos y contacto.`,
    ];
    const shuffled = [...extra].sort(() => Math.random() - 0.5);
    for (const phrase of shuffled) {
      if (wordCount(text) >= FLOOR) break;
      text = text + " " + phrase;
    }
  }
  if (wordCount(text) > CEIL) {
    const words = text.split(/\s+/);
    text = words.slice(0, CEIL).join(" ");
    const lastPeriod = text.lastIndexOf(".");
    if (lastPeriod > CEIL * 3) text = text.slice(0, lastPeriod + 1);
  }

  return text.replace(/\s+/g, " ").trim();
}
