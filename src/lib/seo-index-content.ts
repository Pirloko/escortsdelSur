/**
 * Contenido SEO (500-800 palabras) para páginas índice: servicios, atributos, zonas.
 */

const SITE = "Hola Cachero";

export interface IndexSeoContent {
  title: string;
  description: string;
  h1: string;
  sections: { h2: string; paragraphs: string[] }[];
}

export function getIndexPageSeoContent(
  type: "servicios" | "atributos" | "zonas",
  cityName: string
): IndexSeoContent {
  if (type === "servicios") {
    return {
      title: `Servicios de escorts en ${cityName} | ${SITE}`,
      description: `Listado de servicios que ofrecen las escorts en ${cityName}. Masajes, acompañamiento, citas a domicilio y más. Encuentra por tipo de servicio en ${SITE}.`,
      h1: `Servicios de escorts en ${cityName}`,
      sections: [
        {
          h2: `Qué servicios encontrar en ${cityName}`,
          paragraphs: [
            `En ${SITE} reunimos perfiles de escorts y acompañantes en ${cityName} que indican los servicios que ofrecen. Desde masajes eróticos y masaje tantrico hasta citas a domicilio, atención en hotel o motel, tríos, fetichismo, BDSM y experiencias más íntimas. Cada perfil en nuestro directorio muestra de forma clara qué incluye y qué es adicional.`,
            `La oferta de servicios en ${cityName} y la Región de O'Higgins es amplia. Puedes filtrar por servicio concreto usando los enlaces de esta página: cada uno te lleva a un listado de perfiles que ofrecen ese servicio. Así encuentras más rápido la opción que buscas.`,
          ],
        },
        {
          h2: `Servicios más buscados en ${cityName}`,
          paragraphs: [
            `Entre los servicios más demandados por quienes buscan escorts en ${cityName} figuran masajes eróticos, sexo con y sin condón, oral, sexo anal, tríos, striptease, juguetes sexuales, roleplay y cumplir fantasías. También son frecuentes las búsquedas de acompañante de cena, acompañante a eventos, escort a domicilio, escort en hotel o motel, y experiencias como garganta profunda o masaje con final feliz.`,
            `Las escorts en ${cityName} publicadas en ${SITE} describen en su perfil los servicios que ofrecen. Te recomendamos leer siempre la descripción completa y confirmar condiciones y tarifas directamente con la persona antes de concretar una cita. La comunicación clara evita malentendidos y hace que la experiencia sea satisfactoria.`,
          ],
        },
        {
          h2: `Cómo usar el listado de servicios`,
          paragraphs: [
            `En esta página encontrarás enlaces a cada categoría de servicio disponible en ${cityName}. Al hacer clic en un servicio, verás solo los perfiles que lo ofrecen. Desde ahí puedes entrar a cada perfil para ver fotos, descripción y datos de contacto.`,
            `Si no encuentras un servicio concreto en el listado, puedes revisar la página principal de ${cityName} y usar la descripción de cada perfil para filtrar por palabras clave. ${SITE} prioriza la discreción y el respeto: solo mostramos la información que cada perfil autoriza.`,
          ],
        },
        {
          h2: `Contacto y seguridad`,
          paragraphs: [
            `Cada perfil de escort en ${cityName} en ${SITE} incluye datos de contacto verificables, en general WhatsApp o teléfono. Confirma horarios, tarifas y condiciones directamente con la persona del perfil. No compartimos datos sensibles; el canal indicado en cada anuncio es la vía oficial para coordinar.`,
            `${SITE} – servicios de escorts en ${cityName} y acompañantes en el sur de Chile.`,
          ],
        },
      ],
    };
  }

  if (type === "atributos") {
    return {
      title: `Atributos y tipos de escorts en ${cityName} | ${SITE}`,
      description: `Explora escorts en ${cityName} por atributo: rubias, morenas, altas, bajitas, tetonas, culonas, maduras, jóvenes y más. Encuentra tu tipo en ${SITE}.`,
      h1: `Atributos y tipos de escorts en ${cityName}`,
      sections: [
        {
          h2: `Buscar escorts por atributo en ${cityName}`,
          paragraphs: [
            `Muchas personas buscan escorts en ${cityName} por características concretas: pelo rubio, moreno o castaño, estatura alta o bajita, tipo de cuerpo tetona o culona, edad joven o madura, nacionalidad chilena o extranjera. En ${SITE} puedes filtrar por estos atributos usando los enlaces de esta página.`,
            `Cada enlace te lleva a un listado de perfiles que coinciden con ese atributo. Los datos se basan en la descripción y la información que cada escort publica en su perfil. Revisa siempre la galería y la descripción para confirmar que la opción se ajusta a lo que buscas.`,
          ],
        },
        {
          h2: `Atributos físicos y preferencias`,
          paragraphs: [
            `Entre los atributos más buscados en ${cityName} figuran escort rubia, escort pelinegra, escort tetona, escort culona, escort bajita, escort alta, escort delgada, escort curvy. También son habituales las búsquedas por edad o estilo: escort joven, escort madura, escort milf, escort universitaria, escort modelo.`,
            `La nacionalidad y el estilo son otros criterios: escort chilena, escort latina, escort brasileña, escort colombiana, escort venezolana, escort europea. Y por tipo de experiencia: escort sensual, escort discreta, escort de lujo, escort natural, escort siliconada. En esta página tienes el listado completo de atributos con enlace a los perfiles que coinciden.`,
          ],
        },
        {
          h2: `Cómo elegir por atributo`,
          paragraphs: [
            `Usa los enlaces de esta página para ir directamente al listado que te interesa. En cada listado verás las escorts en ${cityName} que indican ese atributo en su perfil. Desde ahí puedes entrar a cada perfil para ver fotos, descripción y contacto.`,
            `Te recomendamos confirmar siempre con la persona del perfil antes de concretar. La comunicación clara y el respeto son prioritarios en ${SITE}. Solo mostramos la información que cada perfil autoriza.`,
          ],
        },
        {
          h2: `Explora más en ${cityName}`,
          paragraphs: [
            `Además de atributos, puedes explorar por servicios o por zona en ${cityName}. La página principal de ${cityName} muestra todas las opciones disponibles. Cada perfil incluye datos de contacto verificables para que coordines con tranquilidad.`,
            `${SITE} – atributos y tipos de escorts en ${cityName} y acompañantes en el sur de Chile.`,
          ],
        },
      ],
    };
  }

  // zonas
  return {
    title: `Zonas y barrios de escorts en ${cityName} | ${SITE}`,
    description: `Escorts por zona en ${cityName}: centro, Machalí, Cachapoal, barrios y sectores. Encuentra acompañantes cerca de ti en ${SITE}.`,
    h1: `Zonas y barrios de escorts en ${cityName}`,
    sections: [
      {
        h2: `Escorts por zona en ${cityName}`,
        paragraphs: [
          `En ${SITE} puedes buscar escorts en ${cityName} por zona o barrio. Muchos clientes prefieren opciones cercanas a su ubicación o a un punto de encuentro. En esta página encontrarás enlaces a cada zona disponible: centro de ${cityName}, Machalí, Cachapoal, y distintos barrios y poblaciones.`,
          `Cada perfil de escort en ${cityName} puede indicar la zona en la que atiende. Al hacer clic en una zona en el listado, verás los perfiles que la tienen registrada. Así puedes elegir opciones en tu sector o en un lugar que te quede cómodo.`,
        ],
      },
      {
        h2: `Zonas más populares en ${cityName}`,
        paragraphs: [
          `El centro de ${cityName}, Machalí, Cachapoal y barrios como Baquedano, La Compañía, San Damián o Parque Koke son algunas de las zonas que suelen aparecer en las búsquedas. La disponibilidad varía según el día y la hora; te recomendamos contactar directamente a la escort para confirmar zona y horario.`,
          `En ${cityName} y la Región de O'Higgins hay opciones tanto en apartamento propio como a domicilio. La descripción de cada perfil suele indicar si atiende en un lugar fijo o se desplaza. Revisa cada anuncio y usa el canal de contacto indicado para coordinar.`,
        ],
      },
      {
        h2: `Cómo usar el listado de zonas`,
        paragraphs: [
          `Usa los enlaces de esta página para ir al listado de escorts en ${cityName} por zona. En cada listado verás los perfiles que atienden en esa zona. Desde ahí puedes entrar a cada perfil para ver fotos, descripción y datos de contacto.`,
          `Si tu zona no aparece o no hay resultados, puedes revisar la página principal de ${cityName} o filtrar por servicio o atributo. La oferta se actualiza con frecuencia; volver a revisar en otro momento suele dar más opciones.`,
        ],
      },
      {
        h2: `Contacto y coordinación`,
        paragraphs: [
          `Cada perfil en ${SITE} incluye datos de contacto verificables. Confirma siempre la zona, la dirección o punto de encuentro y las condiciones directamente con la persona del perfil antes de concretar. La discreción y el respeto son prioritarios.`,
          `${SITE} – zonas y barrios de escorts en ${cityName} y acompañantes en el sur de Chile.`,
        ],
      },
    ],
  };
}
