/**
 * Páginas índice: /rancagua/servicios, /rancagua/atributos, /rancagua/zonas.
 * Listado de todos los servicios, atributos o zonas con contenido SEO 500-800 palabras.
 */

import { Link, useParams, Navigate } from "react-router-dom";
import { SeoHead } from "@/components/SeoHead";
import { JsonLdIndexPage } from "@/components/JsonLd";
import { ChevronRight } from "lucide-react";
import { isAllowedCitySlug, ACTIVE_CITY_SLUG } from "@/lib/site-config";
import { cityUrl, filterUrl } from "@/lib/seo-programmatic";
import { INDEX_SLUGS } from "@/lib/seo-programmatic";
import { getIndexPageSeoContent } from "@/lib/seo-index-content";
import {
  getAllServiceInternalLinks,
  getAttributeInternalLinks,
  getAllZoneInternalLinks,
  getCategoryInternalLinks,
} from "@/lib/seo-pyramidal";

type IndexSegment = "servicios" | "atributos" | "zonas";

function isIndexSegment(segment: string): segment is IndexSegment {
  return INDEX_SLUGS.includes(segment as (typeof INDEX_SLUGS)[number]);
}

export default function CityIndexPage() {
  const { citySlug, segment } = useParams<{ citySlug: string; segment: string }>();

  if (!citySlug || !segment || !isIndexSegment(segment)) {
    return <Navigate to={`/${ACTIVE_CITY_SLUG}`} replace />;
  }
  if (!isAllowedCitySlug(citySlug)) {
    return <Navigate to={`/${ACTIVE_CITY_SLUG}`} replace />;
  }

  const cityName =
    citySlug === "rancagua"
      ? "Rancagua"
      : citySlug.charAt(0).toUpperCase() + citySlug.slice(1);

  const content = getIndexPageSeoContent(segment, cityName);

  const linkList =
    segment === "servicios"
      ? getAllServiceInternalLinks(citySlug)
      : segment === "atributos"
        ? getAttributeInternalLinks(citySlug)
        : getAllZoneInternalLinks(citySlug);

  const categoryLinks = getCategoryInternalLinks(citySlug);

  return (
    <div className="min-h-screen bg-background pb-24">
      <SeoHead
        title={content.title}
        description={content.description}
        canonicalPath={`/${citySlug}/${segment}`}
        robots="index, follow"
      />
      <JsonLdIndexPage
        cityName={cityName}
        citySlug={citySlug}
        indexType={segment}
        itemNames={linkList.map(({ text }) => text)}
      />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">
            Inicio
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link to={cityUrl(citySlug)} className="hover:text-foreground transition-colors">
            {cityName}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">
            {segment === "servicios" ? "Servicios" : segment === "atributos" ? "Atributos" : "Zonas"}
          </span>
        </nav>

        <h1 className="text-3xl font-display font-bold text-foreground mb-6">
          {content.h1}
        </h1>

        <div className="prose prose-invert max-w-none mb-10 space-y-8">
          {content.sections.map((sec, i) => (
            <section key={i}>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {sec.h2}
              </h2>
              {sec.paragraphs.map((p, j) => (
                <p key={j} className="text-muted-foreground text-sm leading-relaxed mb-3">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-display font-bold text-foreground mb-4">
            {segment === "servicios"
              ? `Todos los servicios en ${cityName}`
              : segment === "atributos"
                ? `Todos los atributos en ${cityName}`
                : `Todas las zonas en ${cityName}`}
          </h2>
          <div className="flex flex-wrap gap-2">
            {linkList.map(({ path, text }) => (
              <Link
                key={path}
                to={path}
                className="inline-flex items-center px-3 py-1.5 rounded-lg border border-border text-muted-foreground text-sm hover:bg-muted hover:text-foreground transition-colors"
              >
                {text}
              </Link>
            ))}
          </div>
        </section>

        <section className="border-t border-border pt-8">
          <h2 className="text-lg font-display font-bold text-foreground mb-4">
            Explora más en {cityName}
          </h2>
          <div className="flex flex-wrap gap-2">
            <Link
              to={cityUrl(citySlug)}
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-copper/20 text-copper text-sm font-medium hover:bg-copper/30 transition-colors"
            >
              Ver todos los perfiles
            </Link>
            {segment !== "servicios" && (
              <Link
                to={filterUrl(citySlug, "servicios")}
                className="inline-flex items-center px-3 py-1.5 rounded-lg border border-border text-muted-foreground text-sm hover:bg-muted hover:text-foreground transition-colors"
              >
                Servicios
              </Link>
            )}
            {segment !== "atributos" && (
              <Link
                to={filterUrl(citySlug, "atributos")}
                className="inline-flex items-center px-3 py-1.5 rounded-lg border border-border text-muted-foreground text-sm hover:bg-muted hover:text-foreground transition-colors"
              >
                Atributos
              </Link>
            )}
            {segment !== "zonas" && (
              <Link
                to={filterUrl(citySlug, "zonas")}
                className="inline-flex items-center px-3 py-1.5 rounded-lg border border-border text-muted-foreground text-sm hover:bg-muted hover:text-foreground transition-colors"
              >
                Zonas
              </Link>
            )}
            {categoryLinks.slice(0, 5).map(({ path, text }) => (
              <Link
                key={path}
                to={path}
                className="inline-flex items-center px-3 py-1.5 rounded-lg border border-border text-muted-foreground text-sm hover:bg-muted hover:text-foreground transition-colors"
              >
                {text}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
