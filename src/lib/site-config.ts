/**
 * Configuración de ciudad única. Mientras solo trabajes con Rancagua,
 * el resto de ciudades queda oculta y las URLs a otras ciudades redirigen aquí.
 */
export const ACTIVE_CITY_SLUG = "rancagua" as const;

/** Slugs permitidos (solo uno por ahora). Cualquier otra ciudad se redirige a ACTIVE_CITY_SLUG. */
export const ALLOWED_CITY_SLUGS: readonly string[] = [ACTIVE_CITY_SLUG];

export function isAllowedCitySlug(slug: string): boolean {
  return ALLOWED_CITY_SLUGS.includes(slug);
}
