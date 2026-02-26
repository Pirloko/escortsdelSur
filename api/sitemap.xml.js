/**
 * Sitemap dinámico para Vercel. Consulta Supabase: ciudades activas y perfiles indexables.
 * Variables de entorno: VITE_SUPABASE_URL (o SUPABASE_URL), VITE_SUPABASE_ANON_KEY (o SUPABASE_ANON_KEY), VITE_SITE_URL (o SITE_URL).
 */
const { createClient } = require("@supabase/supabase-js");

const SITE_URL = process.env.VITE_SITE_URL || process.env.SITE_URL || "https://puntocachero.cl";

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

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate");

  const base = SITE_URL.replace(/\/$/, "");
  const today = new Date().toISOString().slice(0, 10);
  let urls = [urlEl(`${base}/`, today, "daily", "1.0")];

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: cities } = await supabase
        .from("cities")
        .select("id, slug, updated_at, is_active, meta_robots")
        .order("slug");

      const activeCities = (cities || []).filter((c) => {
        if (c.is_active === false) return false;
        if (c.meta_robots && /noindex/i.test(c.meta_robots)) return false;
        return true;
      });

      for (const c of activeCities) {
        const lastmod = c.updated_at ? c.updated_at.slice(0, 10) : today;
        urls.push(urlEl(`${base}/${c.slug}`, lastmod, "daily", "0.9"));
      }

      const cityIds = activeCities.map((x) => x.id);
      if (cityIds.length > 0) {
        const now = new Date().toISOString();
        const { data: profiles } = await supabase
          .from("escort_profiles")
          .select("id, updated_at")
          .in("city_id", cityIds)
          .or(`active_until.is.null,active_until.gt.${now}`);

        for (const p of profiles || []) {
          const lastmod = p.updated_at ? p.updated_at.slice(0, 10) : today;
          urls.push(urlEl(`${base}/perfil/${p.id}`, lastmod, "weekly", "0.8"));
        }
      }
    } catch (e) {
      console.error("Sitemap Supabase error:", e);
    }
  } else {
    const slugs = ["rancagua", "talca", "chillan", "concepcion", "temuco", "valdivia", "osorno", "puerto-montt"];
    slugs.forEach((slug) => urls.push(urlEl(`${base}/${slug}`, today, "daily", "0.9")));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;
  res.status(200).send(xml);
}

module.exports = handler;
