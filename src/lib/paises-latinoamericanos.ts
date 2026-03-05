/**
 * Listado de países latinoamericanos para el selector de nacionalidad.
 * Orden alfabético. Incluye América Latina y el Caribe hispanohablante.
 */
export const PAISES_LATINOAMERICANOS = [
  "Argentina",
  "Belice",
  "Bolivia",
  "Brasil",
  "Chile",
  "Colombia",
  "Costa Rica",
  "Cuba",
  "Ecuador",
  "El Salvador",
  "Guatemala",
  "Guyana",
  "Haití",
  "Honduras",
  "México",
  "Nicaragua",
  "Panamá",
  "Paraguay",
  "Perú",
  "Puerto Rico",
  "República Dominicana",
  "Surinam",
  "Uruguay",
  "Venezuela",
] as const;

export type PaisLatinoamericano = (typeof PAISES_LATINOAMERICANOS)[number];
