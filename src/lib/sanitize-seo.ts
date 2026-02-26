/**
 * Sanitización para meta tags y JSON-LD. Previene XSS e inyección.
 */

const ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "/": "&#x2F;",
};

function escapeHtml(s: string): string {
  return String(s).replace(/[&<>"'/]/g, (c) => ENTITIES[c] ?? c);
}

/** Para meta description y og:description. Máx 160 caracteres recomendado. */
export function truncateMeta(s: string, max = 160): string {
  const t = String(s).trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 3);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 120 ? cut.slice(0, lastSpace) : cut) + "...";
}

/** Sanitiza texto para usar en meta content (escape HTML). */
export function sanitizeMeta(s: string, maxLength = 160): string {
  return truncateMeta(escapeHtml(s), maxLength);
}

/** Sanitiza para JSON-LD (escape y elimina caracteres de control). */
export function sanitizeForJsonLd(s: string): string {
  return escapeHtml(String(s)).replace(/[\u0000-\u001F]/g, "");
}

/** Sanitiza URL para canonical/og:url. Solo permite https y path. */
export function sanitizeUrl(url: string, base = "https://puntocachero.cl"): string {
  try {
    const u = new URL(url, base);
    if (u.protocol !== "https:") return "";
    return u.origin + u.pathname + (u.search || "");
  } catch {
    return "";
  }
}
