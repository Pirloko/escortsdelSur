/**
 * Sitemap dinámico para Netlify. Consulta Supabase: ciudades activas y perfiles indexables.
 * Variables de entorno: VITE_SUPABASE_URL (o SUPABASE_URL), VITE_SUPABASE_ANON_KEY (o SUPABASE_ANON_KEY), VITE_SITE_URL (o SITE_URL).
 */
const { createClient } = require("@supabase/supabase-js");

const SITE_URL = process.env.VITE_SITE_URL || process.env.SITE_URL || "https://holacachero.cl";

/** Páginas de ranking por ciudad (FASE 3). */
const RANKING_SLUGS = ["mejores-escorts", "escorts-nuevas", "escorts-recomendadas"];

/** Páginas índice: servicios, atributos, zonas. */
const INDEX_SLUGS = ["servicios", "atributos", "zonas"];

/** Páginas SEO programáticas: filtros y categorías por ciudad. */
const FILTER_SLUGS = [
  "escorts", "acompanantes", "damas-de-compania",
  "sexo", "sexosur", "skokka", "scort",
  "pelinegras", "tetonas", "culonas", "bajitas", "depiladas",
  "escort-pelinegra", "escort-tetona", "escort-culona", "escort-bajita", "escort-depilada",
  "escort-a-domicilio", "escort-masajes-eroticos", "escort-vip", "escort-independiente",
  "a-domicilio", "apartamento-propio", "masajes", "masajes-eroticos", "trios", "fetichismo", "atencion-parejas",
  "oral-con-condon", "sexo-anal", "juguetes-eroticos",
  "escorts-pelinegras", "escorts-tetonas", "escorts-culonas", "escorts-bajitas", "escorts-depiladas",
  "escorts-a-domicilio", "escorts-apartamento-propio", "escorts-masajes", "escorts-trios",
  "acompanantes-a-domicilio", "acompanantes-masajes",
];

/** Pirámide SEO: categorías extra + servicios + atributos + zonas (109+ páginas por ciudad). */
const PIRAMIDAL_CATEGORY_EXTRA = ["escorts-vip", "escorts-independientes", "escorts-premium", "escorts-verificadas", "escorts-disponibles"];
const PIRAMIDAL_SERVICES = [
  "masajes-eroticos", "sexo-anal", "oral-sin-condon", "sexo-con-condon", "trios", "lesbico", "beso-negro",
  "masaje-tantrico", "masaje-prostatico", "sexo-virtual", "companera-de-cena", "acompanante-eventos",
  "escort-a-domicilio", "escort-hotel", "escort-motel", "striptease", "fetichismo", "bdsm", "domina", "sumisa",
  "sexo-ducha", "juguetes-sexuales", "roleplay", "cumplir-fantasias", "garganta-profunda", "facial",
  "masaje-relajante", "masaje-sensual", "sexo-lento", "sexo-intenso", "citas-privadas", "encuentros-discretos",
  "servicio-nocturno", "servicio-24-horas", "servicio-express", "citas-lujosas", "companera-viajes",
  "masaje-con-final-feliz", "sexo-romantico", "experiencia-girlfriend",
];
const PIRAMIDAL_ATTRIBUTES = [
  "escort-rubia", "escort-pelinegra", "escort-castana", "escort-pelirroja", "escort-alta", "escort-bajita",
  "escort-delgada", "escort-curvy", "escort-tetona", "escort-culona", "escort-joven", "escort-madura",
  "escort-milf", "escort-universitaria", "escort-modelo", "escort-latina", "escort-brasilena", "escort-colombiana",
  "escort-venezolana", "escort-chilena", "escort-europea", "escort-exotica", "escort-de-lujo", "escort-premium",
  "escort-natural", "escort-siliconada", "escort-tatuada", "escort-sin-tatuajes", "escort-deportista",
  "escort-sensual", "escort-elegante", "escort-sexy", "escort-discreta", "escort-divertida", "escort-carismatica",
  "escort-apasionada", "escort-experta", "escort-intensa", "escort-romantica", "escort-aventurera",
];
const PIRAMIDAL_ZONES = [
  "escorts-centro", "escorts-machali", "escorts-cachapoal", "escorts-poblacion-diego-portales",
  "escorts-poblacion-rene-schneider", "escorts-villa-teniente", "escorts-villa-el-cobre", "escorts-villa-nueva",
  "escorts-baquedano", "escorts-la-compania", "escorts-san-damian", "escorts-los-lirios",
  "escorts-barrio-industrial", "escorts-parque-koke", "escorts-la-granja", "escorts-poblacion-manuel-rodriguez",
  "escorts-santa-julia", "escorts-san-joaquin", "escorts-las-americas", "escorts-el-manantial",
];
const ALL_PIRAMIDAL_SLUGS = [...PIRAMIDAL_CATEGORY_EXTRA, ...PIRAMIDAL_SERVICES, ...PIRAMIDAL_ATTRIBUTES, ...PIRAMIDAL_ZONES];

function escapeXml(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEl(loc, lastmod, changefreq, priority) {
  const last = lastmod ? `<lastmod>${lastmod}</lastmod>` : "";
  const cf = changefreq ? `<changefreq>${changefreq}</changefreq>` : "";
  const pr = priority != null ? `<priority>${priority}</priority>` : "";
  return `<url><loc>${escapeXml(loc)}</loc>${last}${cf}${pr}</url>`;
}

exports.handler = async () => {
  const base = SITE_URL.replace(/\/$/, "");
  const today = new Date().toISOString().slice(0, 10);
  const urls = [urlEl(`${base}/`, today, "daily", "1.0")];

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  let activeCities = [];
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: cities } = await supabase
        .from("cities")
        .select("id, slug, updated_at, is_active, meta_robots")
        .order("slug");

      activeCities = (cities || []).filter(
        (c) => c.is_active !== false && (!c.meta_robots || !/noindex/i.test(String(c.meta_robots)))
      );

      const now = new Date().toISOString();
      for (const city of activeCities) {
        const citySlug = city.slug || "rancagua";
        const cityLastmod = city.updated_at ? city.updated_at.slice(0, 10) : today;
        urls.push(urlEl(`${base}/${citySlug}`, cityLastmod, "weekly", "0.95"));
        for (const slug of RANKING_SLUGS) {
          urls.push(urlEl(`${base}/${citySlug}/${slug}`, cityLastmod, "weekly", "0.9"));
        }
        urls.push(urlEl(`${base}/${citySlug}/top-escorts`, cityLastmod, "weekly", "0.9"));
        for (const slug of INDEX_SLUGS) {
          urls.push(urlEl(`${base}/${citySlug}/${slug}`, cityLastmod, "weekly", "0.9"));
        }
        for (const slug of FILTER_SLUGS) {
          urls.push(urlEl(`${base}/${citySlug}/${slug}`, today, "weekly", "0.85"));
        }
        for (const slug of ALL_PIRAMIDAL_SLUGS) {
          urls.push(urlEl(`${base}/${citySlug}/${slug}`, today, "weekly", "0.85"));
        }

        const { data: profiles } = await supabase
          .from("escort_profiles")
          .select("id, slug, updated_at")
          .eq("city_id", city.id)
          .or(`active_until.is.null,active_until.gt.${now}`);

        for (const p of profiles || []) {
          const lastmod = p.updated_at ? p.updated_at.slice(0, 10) : today;
          const profileLoc = p.slug ? `${base}/${citySlug}/${p.slug}` : `${base}/perfil/${p.id}`;
          urls.push(urlEl(profileLoc, lastmod, "weekly", "0.8"));
        }
      }
    } catch (e) {
      console.error("Sitemap Supabase error:", e);
      urls.push(urlEl(`${base}/rancagua`, today, "weekly", "0.95"));
      for (const slug of RANKING_SLUGS) urls.push(urlEl(`${base}/rancagua/${slug}`, today, "weekly", "0.9"));
      urls.push(urlEl(`${base}/rancagua/top-escorts`, today, "weekly", "0.9"));
      for (const slug of INDEX_SLUGS) urls.push(urlEl(`${base}/rancagua/${slug}`, today, "weekly", "0.9"));
      for (const slug of FILTER_SLUGS) urls.push(urlEl(`${base}/rancagua/${slug}`, today, "weekly", "0.85"));
      for (const slug of ALL_PIRAMIDAL_SLUGS) urls.push(urlEl(`${base}/rancagua/${slug}`, today, "weekly", "0.85"));
    }
  }
  if (activeCities.length === 0) {
    urls.push(urlEl(`${base}/rancagua`, today, "weekly", "0.95"));
    for (const slug of RANKING_SLUGS) urls.push(urlEl(`${base}/rancagua/${slug}`, today, "weekly", "0.9"));
    urls.push(urlEl(`${base}/rancagua/top-escorts`, today, "weekly", "0.9"));
    for (const slug of INDEX_SLUGS) urls.push(urlEl(`${base}/rancagua/${slug}`, today, "weekly", "0.9"));
    for (const slug of FILTER_SLUGS) urls.push(urlEl(`${base}/rancagua/${slug}`, today, "weekly", "0.85"));
    for (const slug of ALL_PIRAMIDAL_SLUGS) urls.push(urlEl(`${base}/rancagua/${slug}`, today, "weekly", "0.85"));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate",
    },
    body: xml,
  };
};
