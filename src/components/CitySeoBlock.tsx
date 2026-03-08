/**
 * Bloque de contenido SEO en página de ciudad. Enlaces a inicio, H2, región/sur de Chile en texto.
 * Para Rancagua: seo_sections + enlaces internos piramidales (categorías, servicios, zonas).
 */
import { Link } from "react-router-dom";
import { getCitySeo } from "@/lib/cities-seo-data";
import {
  getCategoryInternalLinks,
  getServiceInternalLinksSample,
  getZoneInternalLinksSample,
} from "@/lib/seo-pyramidal";

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
      {citySlug === "rancagua" && (
        <div className="mt-10 pt-8 border-t border-border/30 space-y-8">
          <section aria-labelledby="enlaces-categorias-heading">
            <h2 id="enlaces-categorias-heading" className="text-lg font-display font-bold mb-3 text-foreground">
              Explora por categorías
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              Mejores escorts, escorts nuevas, VIP, independientes, premium y más en {displayName}.
            </p>
            <ul className="flex flex-wrap gap-2">
              {getCategoryInternalLinks(citySlug).map(({ path, text }) => (
                <li key={path}>
                  <Link to={path} className="text-sm text-muted-foreground hover:text-gold transition-colors underline underline-offset-2">
                    {text}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="enlaces-servicios-heading">
            <h2 id="enlaces-servicios-heading" className="text-lg font-display font-bold mb-3 text-foreground">
              Servicios en {displayName}
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              Masajes, acompañante a domicilio, tríos, fetichismo y más.
            </p>
            <ul className="flex flex-wrap gap-2">
              {getServiceInternalLinksSample(citySlug, 12).map(({ path, text }) => (
                <li key={path}>
                  <Link to={path} className="text-sm text-muted-foreground hover:text-gold transition-colors underline underline-offset-2">
                    {text}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="enlaces-zonas-heading">
            <h2 id="enlaces-zonas-heading" className="text-lg font-display font-bold mb-3 text-foreground">
              Zonas y barrios de {displayName}
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              Perfiles por zona: centro, Machalí, Cachapoal y más.
            </p>
            <ul className="flex flex-wrap gap-2">
              {getZoneInternalLinksSample(citySlug, 12).map(({ path, text }) => (
                <li key={path}>
                  <Link to={path} className="text-sm text-muted-foreground hover:text-gold transition-colors underline underline-offset-2">
                    {text}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
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
