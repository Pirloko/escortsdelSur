/**
 * Sitemap dinámico para Netlify. Consulta Supabase: ciudades activas y perfiles indexables.
 * Variables de entorno: VITE_SUPABASE_URL (o SUPABASE_URL), VITE_SUPABASE_ANON_KEY (o SUPABASE_ANON_KEY), VITE_SITE_URL (o SITE_URL).
 */
const { createClient } = require("@supabase/supabase-js");

const SITE_URL = process.env.VITE_SITE_URL || process.env.SITE_URL || "https://holacachero.cl";

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
  const urls = [
    urlEl(`${base}/`, today, "daily", "1.0"),
    urlEl(`${base}/rancagua`, today, "weekly", "0.95"),
  ];

  for (const slug of FILTER_SLUGS) {
    urls.push(urlEl(`${base}/rancagua/${slug}`, today, "weekly", "0.85"));
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: rancaguaCity } = await supabase
        .from("cities")
        .select("id, slug, updated_at, is_active, meta_robots")
        .eq("slug", "rancagua")
        .single();

      if (rancaguaCity && rancaguaCity.is_active !== false && (!rancaguaCity.meta_robots || !/noindex/i.test(rancaguaCity.meta_robots))) {
        const now = new Date().toISOString();
        const { data: profiles } = await supabase
          .from("escort_profiles")
          .select("id, updated_at")
          .eq("city_id", rancaguaCity.id)
          .or(`active_until.is.null,active_until.gt.${now}`);

        for (const p of profiles || []) {
          const lastmod = p.updated_at ? p.updated_at.slice(0, 10) : today;
          urls.push(urlEl(`${base}/perfil/${p.id}`, lastmod, "weekly", "0.8"));
        }
      }
    } catch (e) {
      console.error("Sitemap Supabase error:", e);
    }
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
