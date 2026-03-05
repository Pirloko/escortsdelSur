/**
 * Página SEO programática: /rancagua/escorts, /rancagua/pelinegras, etc.
 * Contenido optimizado (H1, H2, H3, ~800 palabras) + listado dinámico de perfiles filtrados.
 */

import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SeoHead } from "@/components/SeoHead";
import { ProfileCard } from "@/components/ProfileCard";
import { JsonLdFilterPage } from "@/components/JsonLd";
import { getFilterSeo } from "@/lib/seo-filter-data";
import { getFilterSeoContent } from "@/lib/seo-filter-content";
import {
  isAllowedCitySlug,
  ACTIVE_CITY_SLUG,
} from "@/lib/site-config";
import {
  cityUrl,
  getFilterUrlsForCity,
  isFilterOrCategorySegment,
} from "@/lib/seo-programmatic";
import {
  fetchProfilesByCityId,
  filterProfilesBySegment,
  type EscortProfileRow,
} from "@/lib/seo-profiles";
import { sortProfilesWithSubidas } from "@/lib/franjas";
import { ChevronRight } from "lucide-react";
import { Navigate } from "react-router-dom";

export default function CityFilterPage() {
  const { citySlug, segment } = useParams<{ citySlug: string; segment: string }>();

  if (!citySlug || !segment) {
    return <Navigate to={`/${ACTIVE_CITY_SLUG}`} replace />;
  }
  if (!isAllowedCitySlug(citySlug)) {
    return <Navigate to={`/${ACTIVE_CITY_SLUG}`} replace />;
  }

  const segmentLower = segment.toLowerCase();
  if (!isFilterOrCategorySegment(segmentLower)) {
    return <Navigate to={`/${citySlug}`} replace />;
  }

  const seo = getFilterSeo(citySlug, segmentLower);
  const cityName =
    citySlug === "rancagua"
      ? "Rancagua"
      : citySlug.charAt(0).toUpperCase() + citySlug.slice(1);
  const label = seo.h1.replace(new RegExp(` en ${cityName}$`), "") || segment;
  const contentSections = getFilterSeoContent(
    cityName,
    segmentLower,
    label,
    label
  );

  const { data: cityRow } = useQuery({
    queryKey: ["city-seo", citySlug],
    queryFn: async () => {
      const { supabase } = await import("@/lib/supabase");
      if (!supabase) return null;
      const { data } = await supabase
        .from("cities")
        .select("id, name, slug")
        .eq("slug", citySlug)
        .single();
      return data as { id: string; name: string; slug: string } | null;
    },
    enabled: !!citySlug,
  });

  const cityId = cityRow?.id;
  const { data: allProfiles = [] } = useQuery({
    queryKey: ["escort_profiles_seo", cityId],
    queryFn: () => (cityId ? fetchProfilesByCityId(cityId) : Promise.resolve([])),
    enabled: !!cityId,
  });

  const filtered = filterProfilesBySegment(
    sortProfilesWithSubidas(allProfiles as EscortProfileRow[]),
    segmentLower
  );

  const profilesForCards = filtered.map((p) => ({
    id: p.id,
    name: p.name,
    age: p.age,
    city: cityRow?.name ?? cityName,
    badge: p.badge ?? "Perfil",
    image: p.image ?? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
    available: p.available,
    whatsapp: p.whatsapp ?? null,
  }));

  const internalLinks = getFilterUrlsForCity(citySlug)
    .filter((url) => !url.endsWith(segmentLower))
    .slice(0, 12);

  const SITE_URL = "https://holacachero.cl";
  const profileUrls = profilesForCards
    .slice(0, 20)
    .map((p) => `${SITE_URL}/perfil/${p.id}`);

  return (
    <div className="min-h-screen bg-background pb-24">
      <SeoHead
        title={seo.title}
        description={seo.description}
        canonicalPath={`/${citySlug}/${segmentLower}`}
        robots="index, follow"
      />
      <JsonLdFilterPage
        cityName={cityRow?.name ?? cityName}
        citySlug={citySlug}
        filterSlug={segmentLower}
        filterLabel={seo.h1}
        profileNames={profilesForCards.map((p) => p.name)}
        profileUrls={profileUrls}
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
          <span className="text-foreground font-medium">{label}</span>
        </nav>

        <h1 className="text-3xl font-display font-bold text-foreground mb-6">
          {seo.h1}
        </h1>

        <div className="prose prose-invert max-w-none mb-10 space-y-8">
          {contentSections.map((sec, i) => (
            <section key={i}>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {sec.h2}
              </h2>
              {sec.h3?.map((h3, j) => (
                <h3 key={j} className="text-lg font-medium text-foreground mt-4 mb-2">
                  {h3}
                </h3>
              ))}
              {sec.paragraphs.map((p, j) => (
                <p key={j} className="text-muted-foreground text-sm leading-relaxed mb-3">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>

        <h2 className="text-xl font-display font-bold text-foreground mb-4">
          {profilesForCards.length > 0
            ? `Perfiles en ${cityName} (${profilesForCards.length})`
            : `No hay perfiles que coincidan con este criterio`}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          {profilesForCards.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>

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
            {internalLinks.slice(0, 10).map((url) => {
              const slug = url.split("/").pop() ?? "";
              const labelSlug =
                slug === "escorts"
                  ? "Escorts"
                  : slug === "acompanantes"
                    ? "Acompañantes"
                    : slug
                      .split("-")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ");
              return (
                <Link
                  key={url}
                  to={url}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg border border-border text-muted-foreground text-sm hover:bg-muted hover:text-foreground transition-colors"
                >
                  {labelSlug}
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
