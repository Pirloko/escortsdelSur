/**
 * Bloque de contenido SEO en página de ciudad. Enlaces a inicio, H2, región/sur de Chile en texto.
 * Para Rancagua (FASE 1): seo_sections con H2 por sección. Resto: párrafos de seo_content.
 */
import { Link } from "react-router-dom";
import { getCitySeo } from "@/lib/cities-seo-data";

interface CitySeoBlockProps {
  citySlug: string;
  cityName?: string;
}

export function CitySeoBlock({ citySlug, cityName }: CitySeoBlockProps) {
  const seo = getCitySeo(citySlug);
  if (!seo) return null;

  const displayName = cityName ?? seo.keyword_primary.replace(/^escorts en /i, "");
  const sections = "seo_sections" in seo && Array.isArray(seo.seo_sections) && seo.seo_sections.length > 0
    ? seo.seo_sections
    : null;

  return (
    <article className="px-4 py-12 max-w-3xl mx-auto border-t border-border/50">
      <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-gold transition-colors underline underline-offset-2">Inicio</Link>
        <span className="mx-2">/</span>
        <span className="text-gold">{displayName}</span>
      </nav>
      {sections ? (
        <div className="prose prose-invert prose-sm max-w-none text-muted-foreground">
          {sections.map((sec, i) => (
            <section key={i}>
              <h2 className="text-xl font-display font-bold mb-3 mt-8 first:mt-0 text-foreground">
                {sec.h2}
              </h2>
              <div className="space-y-4">
                {(sec.content || "")
                  .split(/\n\n+/)
                  .map((p) => p.trim())
                  .filter(Boolean)
                  .map((p, j) => (
                    <p key={j} className="leading-relaxed">
                      {p}
                    </p>
                  ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <>
          <h2 className="text-xl font-display font-bold mb-4 text-foreground">Sobre {displayName} y el sur de Chile</h2>
          <div className="prose prose-invert prose-sm max-w-none text-muted-foreground">
            {seo.seo_content
              .split(/\n\n+/)
              .map((p, i) => p.trim())
              .filter(Boolean)
              .map((p, i) => (
                <p key={i} className="mb-4 leading-relaxed">
                  {p}
                </p>
              ))}
          </div>
        </>
      )}
      {"nearbyLinks" in seo && seo.nearbyLinks.length > 0 && (
        <div className="mt-8 pt-6 border-t border-border/30">
          <h3 className="text-sm font-semibold text-gold mb-3">Explora otras ciudades</h3>
          <ul className="flex flex-wrap gap-2">
            {seo.nearbyLinks.map(({ path, text }) => (
              <li key={path}>
                <Link
                  to={path}
                  className="text-sm text-muted-foreground hover:text-gold transition-colors underline underline-offset-2"
                >
                  {text}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
