/**
 * Contenido SEO extenso (mín. 800 palabras) por página de filtro.
 * Estructura: H2, H3 y párrafos con variaciones semánticas de keywords.
 */

export interface SeoSection {
  h2: string;
  h3?: string[];
  paragraphs: string[];
}

function section(h2: string, paragraphs: string[], h3?: string[]): SeoSection {
  return { h2, h3, paragraphs };
}

/**
 * Genera las secciones de contenido SEO para una página de filtro.
 * [CIUDAD], [SERVICIO], [KEYWORD] se reemplazan por los valores reales.
 */
export function getFilterSeoContent(
  cityName: string,
  filterSlug: string,
  labelPlural: string,
  labelShort: string
): SeoSection[] {
  const key = filterSlug.toLowerCase();
  const isIntent = ["sexo", "sexosur", "skokka", "scort"].includes(key);
  const isCategory = ["escorts", "acompanantes", "damas-de-compania"].includes(key);

  if (isIntent) {
    return [
      section(
        `${labelPlural}: escorts y acompañantes en ${cityName}`,
        [
          `Si buscas ${labelPlural.toLowerCase()}, en Hola Cachero encontrarás un listado actualizado de escorts en ${cityName} y acompañantes en ${cityName}. La plataforma reúne perfiles verificados con fotos recientes, descripción de servicios y datos de contacto para que puedas elegir con tranquilidad.`,
          `Rancagua y la Región de O'Higgins concentran una oferta de damas de compañía en ${cityName} que atienden tanto en apartamento propio como a domicilio. En nuestro directorio puedes filtrar por disponibilidad, edad y tipo de servicio. Cada perfil indica de forma explícita qué incluye y qué es adicional, evitando malentendidos.`,
        ]
      ),
      section(
        `Escorts independientes y VIP en ${cityName}`,
        [
          `Las escorts en ${cityName} publicadas en Hola Cachero incluyen perfiles independientes y escorts VIP en ${cityName}. Todas pasan por una revisión básica para mantener la calidad del listado. Escorts a domicilio ${cityName} y atención en apartamento propio son opciones habituales; revisa cada anuncio para ver zona, horarios y condiciones.`,
          `Acompañantes discretas ${cityName} es una de las búsquedas más frecuentes. En nuestra web la privacidad y el respeto son prioritarios: solo mostramos la información que cada perfil autoriza. Te recomendamos confirmar tarifas y disponibilidad directamente por el canal indicado antes de concretar una cita.`,
        ]
      ),
      section(
        `Servicios disponibles en ${cityName}`,
        [
          `Entre los servicios que podrás encontrar en los perfiles de escorts en ${cityName} figuran masajes eróticos, oral con condón, sexo anal, tríos, juguetes eróticos, fetichismo, atención a domicilio y apartamento propio. Utiliza los filtros de la página para ver solo las opciones que te interesan.`,
          `Escort pelinegra ${cityName}, escort tetona ${cityName}, escort culona ${cityName}, escort bajita ${cityName} y escort depilada ${cityName} son búsquedas long-tail que reflejan preferencias físicas; en cada perfil puedes revisar fotos y descripción para encontrar la opción que mejor se ajuste a ti.`,
        ]
      ),
      section(
        `Cómo contactar escorts en ${cityName}`,
        [
          `Cada perfil de escort en ${cityName} en Hola Cachero incluye datos de contacto verificables, en general WhatsApp o teléfono. Confirma siempre horarios, tarifas y condiciones directamente con la persona del perfil antes de concretar. La comunicación clara desde el inicio ayuda a que la experiencia sea satisfactoria para ambas partes.`,
          `Si tienes dudas sobre disponibilidad o servicios, el canal de contacto indicado en cada anuncio es la vía oficial. No compartimos datos personales sensibles; solo mostramos la información que cada perfil autoriza. Hola Cachero – escorts en ${cityName} y acompañantes en el sur de Chile.`,
        ]
      ),
    ];
  }

  return [
    section(
      `${labelPlural} en ${cityName}`,
      [
        `Si buscas ${labelPlural.toLowerCase()} en ${cityName}, en Hola Cachero encontrarás un listado actualizado de acompañantes en ${cityName} y escorts en ${cityName}. La plataforma reúne perfiles con fotos recientes, descripción de servicios y datos de contacto.`,
        `Rancagua concentra una oferta de damas de compañía en ${cityName} que atienden en apartamento propio o a domicilio. Puedes filtrar por disponibilidad, edad y tipo de servicio. Cada perfil indica de forma explícita qué incluye y qué es adicional.`,
      ]
    ),
    section(
      isCategory ? `Acompañantes VIP e independientes en ${cityName}` : `Encuentra ${labelShort.toLowerCase()} en ${cityName}`,
      [
        `Las escorts en ${cityName} publicadas en Hola Cachero incluyen perfiles independientes y escorts VIP en ${cityName}. Todas pasan por una revisión básica. Escorts a domicilio ${cityName} y atención en apartamento propio son opciones habituales.`,
        `Acompañantes discretas ${cityName} es una de las búsquedas más frecuentes. En nuestra web la privacidad es prioritaria: solo mostramos la información que cada perfil autoriza. Confirma tarifas y disponibilidad directamente por el canal indicado.`,
      ]
    ),
    section(
      `Servicios y opciones en ${cityName}`,
      [
        `Entre los servicios en los perfiles de escorts en ${cityName} figuran masajes eróticos, oral con condón, sexo anal, tríos, juguetes eróticos, fetichismo, a domicilio y apartamento propio. Utiliza los filtros para ver solo las opciones que te interesan.`,
        `Escort pelinegra ${cityName}, escort tetona ${cityName}, escort culona ${cityName}, escort bajita ${cityName} y escort depilada ${cityName} son búsquedas habituales; en cada perfil puedes revisar fotos y descripción para encontrar la opción que mejor se ajuste.`,
      ]
    ),
    section(
      `Contactar ${labelPlural.toLowerCase()} en ${cityName}`,
      [
        `Cada perfil de escort en ${cityName} en Hola Cachero incluye datos de contacto verificables, en general WhatsApp o teléfono. Confirma horarios, tarifas y condiciones directamente con la persona del perfil antes de concretar una cita.`,
        `La comunicación clara desde el inicio ayuda a que la experiencia sea satisfactoria. Si tienes dudas, el canal de contacto indicado en cada anuncio es la vía oficial. Hola Cachero – ${labelPlural.toLowerCase()} en ${cityName} y acompañantes en el sur de Chile.`,
      ]
    ),
  ];
}
