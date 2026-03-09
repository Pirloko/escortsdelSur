/**
 * Eventos de Google Analytics (GA4) para el dashboard de analítica.
 * Enviar con gtag para que la API de GA4 pueda agrupar por profile_id, page_path, etc.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function sendEvent(eventName: string, params: Record<string, string | number | undefined>) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
}

/** Clic en botón/enlace de WhatsApp */
export function trackWhatsAppClick(params: {
  profile_id: string;
  profile_name: string;
  city: string;
  page_path?: string;
}) {
  sendEvent("click_whatsapp", {
    profile_id: params.profile_id,
    profile_name: params.profile_name,
    city: params.city,
    page_path: params.page_path ?? (typeof window !== "undefined" ? window.location.pathname : ""),
  });
}

/** Clic en botón/enlace de teléfono (llamada) */
export function trackPhoneClick(params: {
  profile_id: string;
  profile_name: string;
  city: string;
  page_path?: string;
}) {
  sendEvent("click_phone", {
    profile_id: params.profile_id,
    profile_name: params.profile_name,
    city: params.city,
    page_path: params.page_path ?? (typeof window !== "undefined" ? window.location.pathname : ""),
  });
}

/** Vista de ficha de perfil (página de perfil cargada) */
export function trackViewProfile(params: {
  profile_id: string;
  profile_name: string;
  city: string;
  page_path?: string;
}) {
  sendEvent("view_profile", {
    profile_id: params.profile_id,
    profile_name: params.profile_name,
    city: params.city,
    page_path: params.page_path ?? (typeof window !== "undefined" ? window.location.pathname : ""),
  });
}

/** Clic en un perfil desde un listado (tarjeta, galería, etc.) */
export function trackProfileClickFromList(params: {
  profile_id: string;
  profile_name: string;
  city: string;
  list_context?: string;
  page_path?: string;
}) {
  sendEvent("profile_click_from_list", {
    profile_id: params.profile_id,
    profile_name: params.profile_name,
    city: params.city,
    list_context: params.list_context ?? "list",
    page_path: params.page_path ?? (typeof window !== "undefined" ? window.location.pathname : ""),
  });
}

/** Vista de página de categoría/filtro SEO (ej. /rancagua/escorts-vip) */
export function trackPageCategoryView(params: {
  page_path: string;
  city: string;
  category_or_filter: string;
}) {
  sendEvent("page_category_view", {
    page_path: params.page_path,
    city: params.city,
    category_or_filter: params.category_or_filter,
  });
}

/** Tiempo en perfil / engagement (opcional: enviar al salir o cada N segundos) */
export function trackProfileEngagement(params: {
  profile_id: string;
  profile_name: string;
  city: string;
  engagement_seconds: number;
}) {
  sendEvent("profile_engagement", {
    profile_id: params.profile_id,
    profile_name: params.profile_name,
    city: params.city,
    engagement_seconds: params.engagement_seconds,
  });
}
