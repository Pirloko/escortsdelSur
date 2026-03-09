/**
 * Cliente de analítica para el dashboard admin.
 * Llama a la función Netlify que consulta GA4 (o devuelve mock).
 * Cache en memoria de 5 minutos para no saturar la API.
 */

const CACHE_MS = 5 * 60 * 1000; // 5 minutos
const FN_URL = "/.netlify/functions/analytics";

type CacheEntry<T> = { data: T; at: number };

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const ent = cache.get(key) as CacheEntry<T> | undefined;
  if (!ent || Date.now() - ent.at > CACHE_MS) return null;
  return ent.data;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, at: Date.now() });
}

function cacheKey(params: { city?: string; days?: number; type?: string }): string {
  return [params.type ?? "all", params.city ?? "", params.days ?? 30].join(":");
}

export interface ProfileRow {
  profile_id: string;
  profile_name: string;
  city: string;
  whatsapp_clicks: number;
  phone_clicks: number;
  profile_views: number;
  avg_engagement_seconds: number;
}

export interface SeoPageRow {
  page_path: string;
  city: string;
  visits: number;
  whatsapp_clicks: number;
  phone_clicks: number;
}

export interface FunnelStep {
  step: string;
  count: number;
  label: string;
}

export interface AnalyticsSummary {
  total_whatsapp_clicks: number;
  total_phone_clicks: number;
  total_profile_views: number;
  avg_time_on_profile_seconds: number;
}

export interface AnalyticsPayload {
  summary: AnalyticsSummary;
  topProfiles: ProfileRow[];
  topSeoPages: SeoPageRow[];
  funnel: FunnelStep[];
  topEngagement: ProfileRow[];
  whatsappByDay: { date: string; count: number }[];
}

/** Payload mock cuando la función Netlify no está disponible (ej. npm run dev sin netlify dev). */
function getMockPayload(city?: string, days = 30): AnalyticsPayload {
  const topProfiles: ProfileRow[] = [
    { profile_id: "p1", profile_name: "Megan", city: "Rancagua", whatsapp_clicks: 45, phone_clicks: 12, profile_views: 320, avg_engagement_seconds: 92 },
    { profile_id: "p2", profile_name: "Camila", city: "Rancagua", whatsapp_clicks: 38, phone_clicks: 8, profile_views: 280, avg_engagement_seconds: 78 },
    { profile_id: "p3", profile_name: "Valentina", city: "Rancagua", whatsapp_clicks: 30, phone_clicks: 15, profile_views: 250, avg_engagement_seconds: 65 },
  ];
  const topSeoPages: SeoPageRow[] = [
    { page_path: "/rancagua", city: "Rancagua", visits: 1200, whatsapp_clicks: 120, phone_clicks: 40 },
    { page_path: "/rancagua/escorts-vip", city: "Rancagua", visits: 450, whatsapp_clicks: 55, phone_clicks: 18 },
    { page_path: "/rancagua/masajes-eroticos", city: "Rancagua", visits: 380, whatsapp_clicks: 42, phone_clicks: 12 },
    { page_path: "/rancagua/escort-rubia", city: "Rancagua", visits: 290, whatsapp_clicks: 35, phone_clicks: 10 },
  ];
  const funnel: FunnelStep[] = [
    { step: "page_view", count: 5000, label: "Page View" },
    { step: "profile_click", count: 1200, label: "Click perfil" },
    { step: "view_profile", count: 800, label: "Vista perfil" },
    { step: "contact", count: 200, label: "Click WhatsApp / Teléfono" },
  ];
  const summary: AnalyticsSummary = {
    total_whatsapp_clicks: 113,
    total_phone_clicks: 35,
    total_profile_views: 850,
    avg_time_on_profile_seconds: 78,
  };
  const whatsappByDay = Array.from({ length: Math.min(days, 30) }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (Math.min(days, 30) - 1 - i));
    return { date: d.toISOString().slice(0, 10), count: 3 + (i % 8) };
  });
  const filtered = city ? topProfiles.filter((p) => p.city === city) : topProfiles;
  const filteredPages = city ? topSeoPages.filter((p) => p.city === city) : topSeoPages;
  return {
    summary,
    topProfiles: filtered,
    topSeoPages: filteredPages,
    funnel,
    topEngagement: [...filtered].sort((a, b) => b.avg_engagement_seconds - a.avg_engagement_seconds),
    whatsappByDay,
  };
}

async function fetchAnalytics(params: {
  city?: string;
  days?: number;
}): Promise<AnalyticsPayload> {
  const key = cacheKey({ ...params, type: "payload" });
  const cached = getCached<AnalyticsPayload>(key);
  if (cached) return cached;

  const search = new URLSearchParams();
  if (params.city) search.set("city", params.city);
  if (params.days) search.set("days", String(params.days));
  const url = `${FN_URL}?${search.toString()}`;

  try {
    const res = await fetch(url);
    const contentType = res.headers.get("content-type") || "";
    if (!res.ok || !contentType.includes("application/json")) {
      return getMockPayload(params.city, params.days ?? 30);
    }
    const data = (await res.json()) as AnalyticsPayload;
    setCache(key, data);
    return data;
  } catch {
    return getMockPayload(params.city, params.days ?? 30);
  }
}

/** Top perfiles por clics WhatsApp */
export async function getTopProfilesByWhatsappClicks(params: {
  city?: string;
  days?: number;
}): Promise<ProfileRow[]> {
  const payload = await fetchAnalytics(params);
  return payload.topProfiles.sort((a, b) => b.whatsapp_clicks - a.whatsapp_clicks);
}

/** Top perfiles por clics teléfono */
export async function getTopProfilesByPhoneClicks(params: {
  city?: string;
  days?: number;
}): Promise<ProfileRow[]> {
  const payload = await fetchAnalytics(params);
  return payload.topProfiles.sort((a, b) => b.phone_clicks - a.phone_clicks);
}

/** Top perfiles por visitas */
export async function getTopProfilesByViews(params: {
  city?: string;
  days?: number;
}): Promise<ProfileRow[]> {
  const payload = await fetchAnalytics(params);
  return payload.topProfiles.sort((a, b) => b.profile_views - a.profile_views);
}

/** Páginas SEO con más conversión */
export async function getTopSeoPages(params: {
  city?: string;
  days?: number;
}): Promise<SeoPageRow[]> {
  const payload = await fetchAnalytics(params);
  return payload.topSeoPages.sort(
    (a, b) => b.whatsapp_clicks + b.phone_clicks - (a.whatsapp_clicks + a.phone_clicks)
  );
}

/** Resumen + estadísticas de engagement por perfil */
export async function getProfileEngagementStats(params: {
  city?: string;
  days?: number;
}): Promise<{
  summary: AnalyticsSummary;
  topProfiles: ProfileRow[];
  funnel: FunnelStep[];
  topEngagement: ProfileRow[];
  whatsappByDay: { date: string; count: number }[];
}> {
  const payload = await fetchAnalytics(params);
  return {
    summary: payload.summary,
    topProfiles: payload.topProfiles,
    funnel: payload.funnel,
    topEngagement: payload.topEngagement,
    whatsappByDay: payload.whatsappByDay,
  };
}

/** Todo el payload (una sola llamada para el dashboard) */
export async function getAnalyticsDashboard(params: {
  city?: string;
  days?: number;
}): Promise<AnalyticsPayload> {
  return fetchAnalytics(params);
}
