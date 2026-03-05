/**
 * Contenido SEO por ciudad. Escalable: puede migrarse a Supabase (tabla cities con
 * seo_title, seo_description, seo_content, keyword_primary).
 * Fase 1: contenido largo (600–900 palabras) para Rancagua, Talca, Chillán, Concepción, Temuco.
 */

import type { CitySeo } from "./seo";

/** Enlaces internos con anchor natural para interlinking */
function link(path: string, text: string) {
  return { path, text };
}

export const citiesSeoData: Record<string, CitySeo & { nearbyLinks: { path: string; text: string }[] }> = {
  rancagua: {
    keyword_primary: "escorts en Rancagua",
    seo_title: "Escorts en Rancagua | Putas, Damas de Compañía, Acompañantes – Hola Cachero",
    seo_description:
      "Escorts en Rancagua, putas en Rancagua, damas de compañía y acompañantes en Rancagua. Sexo en Rancagua, Sexosur. Hola Cachero: perfiles premium y discretos.",
    nearbyLinks: [
      link("/talca", "Ver más perfiles en Talca"),
      link("/chillan", "Explorar acompañantes en Chillán"),
    ],
    seo_content: `
Rancagua es la puerta sur desde Santiago hacia la zona central y austral de Chile. Si buscas escorts en Rancagua, escort en Rancagua, putas en Rancagua, damas de compañía en Rancagua o acompañantes en Rancagua, en Hola Cachero encontrarás un listado cuidado. También conocen la zona como sexo en Rancagua o Sexosur en Rancagua: aquí reunimos perfiles seleccionados que ofrecen servicio premium, con verificación y claridad. No se trata de listados masivos, sino de un directorio cuidado donde cada perfil incluye fotos recientes, disponibilidad y datos de contacto para que puedas elegir con tranquilidad.

La Región de O'Higgins tiene una oferta hotelera y de alojamiento adecuada para encuentros privados. Rancagua cuenta con buena conectividad por ruta 5 Sur y está a poco más de una hora de la capital, lo que facilita tanto a residentes como a quienes visitan la zona. Si tu interés es conocer acompañantes en la región, aquí puedes filtrar por disponibilidad, tipo de servicio y preferencias.

El servicio premium en Rancagua que promovemos se basa en trato respetuoso, puntualidad y discreción. Todos los perfiles disponibles en nuestra web pasan por una revisión básica para evitar contenido engañoso o duplicado. Recomendamos siempre confirmar horarios y condiciones directamente con cada perfil antes de concretar una cita.

Si te encuentras de paso hacia el sur, puede interesarte ampliar la búsqueda. Hacia el sur por la misma ruta encontrarás más opciones: por ejemplo, perfiles en Talca y más adelante acompañantes en Chillán, ambas ciudades con oferta propia en nuestra plataforma. Así puedes planificar con tiempo si tu ruta incluye varias paradas.

Rancagua también es punto de partida para visitar viñas, termas y la costa de la región. Tener claro dónde encontrar perfiles verificados y disponibles en la zona te permite organizar tu estadía sin perder tiempo en búsquedas poco confiables. Utiliza los filtros por fecha y disponibilidad para ver quiénes están activos en las fechas que te interesan.

Quienes buscan escorts en Rancagua (o escriben scorts en Rancagua) encuentran aquí el mismo listado. En resumen: si buscas acompañantes en Rancagua con estándares de calidad y discreción, esta es una opción pensada para eso. Revisa los perfiles, compara y contacta directamente a quien mejor se ajuste a lo que necesitas. Para más ciudades del sur de Chile, explora nuestro listado de zonas disponibles.
    `.trim(),
  },

  talca: {
    keyword_primary: "escorts en Talca",
    seo_title: "Escorts en Talca | Perfiles Premium en el Sur de Chile",
    seo_description:
      "Perfiles y acompañantes en Talca. Servicio premium en la capital del Maule, con opciones verificadas y disponibles.",
    nearbyLinks: [
      link("/rancagua", "Ver perfiles en Rancagua"),
      link("/chillan", "Explorar escorts en Chillán"),
      link("/concepcion", "Ver más disponibles en Concepción"),
    ],
    seo_content: `
Talca es el corazón de la Región del Maule y uno de los núcleos urbanos más importantes del centro-sur de Chile. Quienes viven o viajan por la zona suelen buscar opciones de acompañamiento serias, con información clara y perfiles reales.

En nuestra web reunimos perfiles en Talca que cumplen con esos criterios: fotos actuales, descripción del servicio y formas de contacto verificables. Puedes filtrar por disponibilidad, rango de edad y tipo de experiencia para encontrar a la persona que mejor se adapte a lo que buscas.

La ciudad tiene buena infraestructura hotelera y de transporte. Está bien conectada por ruta 5 Sur con Rancagua al norte y Chillán al sur, lo que la convierte en una parada habitual para viajes de trabajo o turismo. Tener a mano un directorio de acompañantes en Talca te permite planificar encuentros con anticipación y evitar búsquedas de último momento en sitios poco confiables.

El servicio premium en Talca que destacamos se caracteriza por la discreción y el respeto. No publicamos datos personales sensibles ni contenido que pueda comprometer la seguridad de nadie. Solo mostramos la información que cada perfil autoriza, para que tú puedas decidir con tranquilidad.

Si además de Talca te interesan otras ciudades del Maule o regiones vecinas, puedes usar los enlaces internos de la página. Por ejemplo, ver más perfiles en Rancagua o explorar opciones en Chillán y Concepción. Así amplías la búsqueda sin salir de una misma plataforma.

Talca ofrece entornos tranquilos para encuentros privados: hoteles céntricos, apart hotels y zonas residenciales con buen acceso. Al revisar los perfiles disponibles en la ciudad, podrás ver indicaciones de zona, horarios y condiciones que cada una establece. Te recomendamos siempre confirmar por el canal oficial antes de reservar.

En definitiva, si buscas acompañantes en Talca con un nivel de seriedad y claridad, aquí encontrarás un listado cuidado y actualizado. Navega por los perfiles, usa los filtros y contacta directamente a quien te interese. Para más opciones en el sur de Chile, revisa las demás ciudades en el menú.
    `.trim(),
  },

  chillan: {
    keyword_primary: "escorts en Chillán",
    seo_title: "Escorts en Chillán | Perfiles Premium en el Sur de Chile",
    seo_description:
      "Acompañantes y perfiles premium en Chillán. Opciones verificadas y disponibles en la capital de Ñuble.",
    nearbyLinks: [
      link("/talca", "Ver perfiles en Talca"),
      link("/concepcion", "Explorar escorts en Concepción"),
      link("/temuco", "Ver más disponibles en Temuco"),
    ],
    seo_content: `
Chillán es la capital de la Región de Ñuble y un punto clave entre el Maule y el Biobío. La ciudad combina vida universitaria, comercio y turismo (termas, nieve, naturaleza), y muchas personas buscan aquí opciones de acompañamiento con información clara y trato profesional.

En esta plataforma encontrarás perfiles en Chillán seleccionados: acompañantes que publican sus servicios de forma explícita, con fotos recientes y datos de contacto. Puedes filtrar por disponibilidad y preferencias para ver quiénes están activas en las fechas que te interesan.

La oferta de servicio premium en Chillán que promovemos prioriza la verificación y la transparencia. No permitimos perfiles duplicados ni anuncios engañosos. Cada perfil disponible en la zona ha pasado por una revisión básica para mantener un estándar mínimo de calidad en el listado.

La ciudad está bien comunicada por ruta 5 Sur. Al norte queda Talca y al sur Concepción, ambas con sus propias secciones en nuestra web. Si tu ruta incluye varias ciudades, puedes revisar perfiles en Talca, explorar opciones en Concepción o ver más disponibles en Temuco según tu itinerario. Los enlaces internos te llevan directamente a cada zona.

Chillán cuenta con hoteles, apart y cabañas que facilitan encuentros discretos. Al elegir un perfil, revisa la descripción para ver si indican zona de atención, horarios y condiciones. Siempre es recomendable confirmar por el canal oficial antes de concretar una cita.

Las termas y centros de esquí cercanos atraen visitantes durante todo el año. Tener un directorio de acompañantes en Chillán actualizado te ayuda a planificar con tiempo y evitar búsquedas en sitios poco confiables. Usa los filtros por fecha y disponibilidad para ver solo las opciones activas.

En resumen: si buscas acompañantes en Chillán con seriedad y claridad, esta página está pensada para eso. Navega por los perfiles, compara y contacta directamente. Para más ciudades del sur de Chile, explora el menú de zonas disponibles.
    `.trim(),
  },

  concepcion: {
    keyword_primary: "escorts en Concepción",
    seo_title: "Escorts en Concepción | Perfiles Premium en el Sur de Chile",
    seo_description:
      "Perfiles y acompañantes en Concepción. Servicio premium en la capital del Biobío, con opciones verificadas y disponibles.",
    nearbyLinks: [
      link("/chillan", "Ver perfiles en Chillán"),
      link("/temuco", "Explorar escorts en Temuco"),
      link("/talca", "Ver más disponibles en Talca"),
    ],
    seo_content: `
Concepción es la capital de la Región del Biobío y una de las ciudades más grandes del sur de Chile. Concentra universidades, comercio, cultura y una vida nocturna activa. Muchas personas buscan aquí perfiles de acompañamiento con información clara, fotos reales y opciones verificadas.

En nuestra plataforma reunimos perfiles en Concepción que cumplen con esos criterios. Puedes filtrar por disponibilidad, rango de edad y tipo de servicio para encontrar a la persona que mejor se adapte a lo que buscas. Cada perfil incluye descripción, fotos recientes y forma de contacto para que puedas decidir con tranquilidad.

El servicio premium en Concepción que destacamos se basa en discreción, puntualidad y respeto. No publicamos datos sensibles ni contenido que pueda comprometer la seguridad de nadie. Solo mostramos la información que cada perfil autoriza explícitamente. Además, revisamos los anuncios para evitar duplicados y perfiles engañosos.

La ciudad tiene una oferta amplia de alojamiento: hoteles céntricos, apart hotels y zonas como el Barrio Universitario o el centro, con buena conectividad. Al revisar los perfiles disponibles en la zona podrás ver indicaciones de horario y condiciones. Te recomendamos siempre confirmar por el canal oficial antes de reservar.

Concepción está bien conectada por ruta 5 Sur y por vuelos desde Santiago. Si tu ruta incluye otras ciudades, puedes usar los enlaces internos para explorar más opciones: por ejemplo, ver perfiles en Chillán al norte, explorar escorts en Temuco más al sur o revisar disponibles en Talca. Así amplías la búsqueda sin salir de la misma plataforma.

La región del Biobío atrae visitantes por playas, naturaleza y eventos. Tener un directorio de acompañantes en Concepción actualizado te permite planificar encuentros con anticipación y evitar búsquedas de último momento en sitios poco confiables. Usa los filtros por fecha para ver quiénes están activas en las fechas que te interesan.

En definitiva: si buscas acompañantes en Concepción con estándares de calidad y transparencia, esta es una opción pensada para eso. Revisa los perfiles, usa los filtros y contacta directamente a quien te interese. Para más ciudades del sur de Chile, explora el listado de zonas en el menú.
    `.trim(),
  },

  temuco: {
    keyword_primary: "escorts en Temuco",
    seo_title: "Escorts en Temuco | Perfiles Premium en el Sur de Chile",
    seo_description:
      "Acompañantes y perfiles premium en Temuco. Opciones verificadas y disponibles en la capital de La Araucanía.",
    nearbyLinks: [
      link("/concepcion", "Ver perfiles en Concepción"),
      link("/valdivia", "Explorar escorts en Valdivia"),
      link("/chillan", "Ver más disponibles en Chillán"),
    ],
    seo_content: `
Temuco es la capital de La Araucanía y uno de los núcleos urbanos más importantes del sur de Chile. La ciudad concentra comercio, universidades, salud y turismo hacia lagos, volcanes y comunidades mapuche. Quienes viven o viajan por la zona suelen buscar opciones de acompañamiento serias, con perfiles verificados y información clara.

En esta web encontrarás perfiles en Temuco seleccionados: acompañantes que publican su servicio de forma explícita, con fotos recientes, descripción y datos de contacto. Puedes filtrar por disponibilidad, edad y tipo de experiencia para ver solo las opciones que te interesan.

El servicio premium en Temuco que promovemos prioriza la verificación y la transparencia. No permitimos perfiles duplicados ni anuncios engañosos. Cada perfil disponible en la ciudad ha pasado por una revisión básica para mantener un estándar mínimo de calidad. Recomendamos siempre confirmar horarios y condiciones directamente con cada perfil antes de concretar una cita.

Temuco está bien conectada por ruta 5 Sur y por aeropuerto. Al norte queda Concepción y al sur Valdivia, ambas con sus propias secciones en nuestra plataforma. Si tu ruta incluye varias paradas, puedes ver perfiles en Concepción, explorar escorts en Valdivia o revisar más disponibles en Chillán usando los enlaces internos. Así planificas con tiempo sin cambiar de web.

La ciudad ofrece hoteles, apart y cabañas en la periferia que facilitan encuentros discretos. Al elegir un perfil, revisa la descripción para ver zona de atención, horarios y condiciones. La mayoría indica disponibilidad por día o por franjas horarias para que puedas coordinar con anticipación.

La Araucanía atrae visitantes por termas, esquí, lagos y cultura mapuche. Tener un directorio de acompañantes en Temuco actualizado te ayuda a organizar tu estadía sin depender de búsquedas poco confiables. Usa los filtros por fecha para ver quiénes están activas en las fechas que te interesan.

En resumen: si buscas acompañantes en Temuco con seriedad y claridad, esta página está pensada para eso. Navega por los perfiles, compara y contacta directamente. Para más opciones en el sur de Chile, explora el menú de ciudades disponibles.
    `.trim(),
  },

  valdivia: {
    keyword_primary: "escorts en Valdivia",
    seo_title: "Escorts en Valdivia | Perfiles Premium en el Sur de Chile",
    seo_description:
      "Perfiles y acompañantes en Valdivia. Servicio premium en la capital de Los Ríos, con opciones verificadas y disponibles.",
    nearbyLinks: [
      link("/temuco", "Ver perfiles en Temuco"),
      link("/osorno", "Explorar escorts en Osorno"),
      link("/puerto-montt", "Ver más disponibles en Puerto Montt"),
    ],
    seo_content: `
Valdivia es la capital de Los Ríos y un destino muy visitado por su río, cerveza artesanal, naturaleza y vida universitaria. Quienes buscan acompañantes en la zona valoran la discreción y la calidad de la información.

En nuestra plataforma reunimos perfiles en Valdivia verificados: fotos recientes, descripción del servicio y contacto. Puedes filtrar por disponibilidad y preferencias. La ciudad tiene buena oferta hotelera y de apart para encuentros privados. Si además viajas por la zona, puedes explorar perfiles en Temuco, escorts en Osorno o más opciones en Puerto Montt desde el menú de ciudades.
    `.trim(),
  },

  osorno: {
    keyword_primary: "escorts en Osorno",
    seo_title: "Escorts en Osorno | Perfiles Premium en el Sur de Chile",
    seo_description:
      "Acompañantes y perfiles premium en Osorno. Opciones verificadas en la capital de la provincia, con servicio discreto.",
    nearbyLinks: [
      link("/valdivia", "Ver perfiles en Valdivia"),
      link("/puerto-montt", "Explorar escorts en Puerto Montt"),
      link("/temuco", "Ver más disponibles en Temuco"),
    ],
    seo_content: `
Osorno es un nodo importante en el sur de Chile, con buena conectividad hacia Valdivia, Puerto Montt y la Patagonia. Aquí encontrarás perfiles en Osorno con información clara y verificada. Filtra por disponibilidad y revisa las descripciones. Si tu ruta sigue al sur, puedes ver más perfiles en Valdivia o explorar opciones en Puerto Montt desde nuestra web.
    `.trim(),
  },

  "puerto-montt": {
    keyword_primary: "escorts en Puerto Montt",
    seo_title: "Escorts en Puerto Montt | Perfiles Premium en el Sur de Chile",
    seo_description:
      "Perfiles y acompañantes en Puerto Montt. Servicio premium en la puerta de la Patagonia, con opciones verificadas.",
    nearbyLinks: [
      link("/osorno", "Ver perfiles en Osorno"),
      link("/valdivia", "Explorar escorts en Valdivia"),
      link("/temuco", "Ver más disponibles en Temuco"),
    ],
    seo_content: `
Puerto Montt es la puerta de entrada a la Patagonia chilena y concentra comercio, pesca y turismo. En nuestra plataforma encontrarás perfiles en Puerto Montt con fotos recientes y datos de contacto. Filtra por disponibilidad y revisa las condiciones de cada perfil. Si vienes desde el norte, puedes explorar también perfiles en Osorno o en Valdivia desde el menú de ciudades.
    `.trim(),
  },
};

export function getCitySeo(slug: string): (CitySeo & { nearbyLinks: { path: string; text: string }[] }) | null {
  return citiesSeoData[slug] ?? null;
}

/** Cuenta palabras del contenido SEO. Si &lt; 600 se considera thin content (noindex). */
export function getSeoContentWordCount(seoContent: string): number {
  return seoContent.trim().split(/\s+/).filter(Boolean).length;
}
