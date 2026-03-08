/**
 * SEO para páginas de ranking: mejores-escorts, escorts-nuevas, escorts-recomendadas.
 */

import type { RankingSlug } from "./seo-programmatic";

const CITY_NAMES: Record<string, string> = {
  rancagua: "Rancagua",
  talca: "Talca",
  chillan: "Chillán",
  concepcion: "Concepción",
  temuco: "Temuco",
  curico: "Curicó",
  santiago: "Santiago",
};

function getCityName(citySlug: string): string {
  return CITY_NAMES[citySlug.toLowerCase()] ?? citySlug.charAt(0).toUpperCase() + citySlug.slice(1);
}

export interface RankingSeo {
  title: string;
  description: string;
  h1: string;
  introParagraphs: string[];
}

export function getRankingSeo(citySlug: string, segment: RankingSlug): RankingSeo {
  const cityName = getCityName(citySlug);
  const key = segment.toLowerCase();

  if (key === "mejores-escorts") {
    return {
      title: `Mejores escorts en ${cityName} | Top por valoración | Hola Cachero`,
      description: `Las mejores escorts en ${cityName} según las reseñas de usuarios. Perfiles mejor valorados, fotos y contacto. Encuentra acompañantes premium en Hola Cachero.`,
      h1: `Mejores escorts en ${cityName}`,
      introParagraphs: [
        `Descubre las escorts mejor valoradas en ${cityName}. Este ranking se actualiza con las opiniones y puntuaciones de quienes han contratado sus servicios.`,
        `Todos los perfiles cuentan con reseñas verificadas. Ordenamos por puntuación media para que encuentres las mejores opciones en ${cityName}.`,
      ],
    };
  }

  if (key === "escorts-nuevas") {
    return {
      title: `Escorts nuevas en ${cityName} | Perfiles recién registrados | Hola Cachero`,
      description: `Escorts nuevas en ${cityName}. Perfiles recién incorporados, fotos actuales y contacto directo. Conoce las últimas acompañantes en Hola Cachero.`,
      h1: `Escorts nuevas en ${cityName}`,
      introParagraphs: [
        `Perfiles de escorts recién incorporados en ${cityName}. Ordenados por fecha de alta para que veas las últimas opciones disponibles.`,
        `Si buscas caras nuevas en ${cityName}, aquí encontrarás las escorts que se han unido más recientemente a nuestra plataforma.`,
      ],
    };
  }

  if (key === "escorts-recomendadas") {
    return {
      title: `Escorts recomendadas en ${cityName} | Más activas | Hola Cachero`,
      description: `Escorts recomendadas y más activas en ${cityName}. Perfiles actualizados, con disponibilidad y contacto. Las más solicitadas en Hola Cachero.`,
      h1: `Escorts recomendadas en ${cityName}`,
      introParagraphs: [
        `Estas son las escorts más activas y recomendadas en ${cityName}, ordenadas por su actividad reciente y actualización de perfil.`,
        `Perfiles que mantienen su información al día y suelen tener buena disponibilidad. Ideal para encontrar opciones con respuesta rápida en ${cityName}.`,
      ],
    };
  }

  const fallbackH1 = segment.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return {
    title: `${fallbackH1} en ${cityName} | Hola Cachero`,
    description: `Perfiles en ${cityName}. Escorts y acompañantes. Hola Cachero.`,
    h1: `${fallbackH1} en ${cityName}`,
    introParagraphs: [`Perfiles en ${cityName}.`],
  };
}
