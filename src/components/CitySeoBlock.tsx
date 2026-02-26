/**
 * Bloque de contenido SEO en página de ciudad. Enlaces a inicio, H2, región/sur de Chile en texto.
 * 600+ palabras recomendado; variaciones semánticas naturales, enlaces internos.
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

  const paragraphs = seo.seo_content
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const displayName = cityName ?? seo.keyword_primary.replace(/^escorts en /i, "");

  return (
    <article className="px-4 py-12 max-w-3xl mx-auto border-t border-border/50">
      <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-gold transition-colors underline underline-offset-2">Inicio</Link>
        <span className="mx-2">/</span>
        <span className="text-gold">{displayName}</span>
      </nav>
      <h2 className="text-xl font-display font-bold mb-4 text-foreground">Sobre {displayName} y el sur de Chile</h2>
      <div className="prose prose-invert prose-sm max-w-none text-muted-foreground">
        {paragraphs.map((p, i) => (
          <p key={i} className="mb-4 leading-relaxed">
            {p}
          </p>
        ))}
      </div>
      {seo.nearbyLinks.length > 0 && (
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
