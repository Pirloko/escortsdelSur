/**
 * Constantes SEO. SITE_URL debe coincidir con el dominio en producción (holacachero.cl).
 * En Vercel: configurar VITE_SITE_URL o usar fallback.
 */
export const SITE_URL =
  (typeof import.meta !== "undefined" && (import.meta as unknown as { env?: { VITE_SITE_URL?: string } }).env?.VITE_SITE_URL) ||
  "https://holacachero.cl";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;
export const SITE_NAME = "Hola Cachero";
