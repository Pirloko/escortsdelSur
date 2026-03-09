/**
 * Páginas de ranking: /rancagua/mejores-escorts, escorts-nuevas, escorts-recomendadas.
 * Orden: por valoración, por fecha de creación, por actividad (updated_at).
 */

import { Link, useParams, Navigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { trackPageCategoryView } from "@/lib/analytics";
import { ChevronRight } from "lucide-react";
import { SeoHead } from "@/components/SeoHead";
import { ProfileCard } from "@/components/ProfileCard";
import {
  isAllowedCitySlug,
  ACTIVE_CITY_SLUG,
} from "@/lib/site-config";
import {
  cityUrl,
  getProfileUrl,
  isRankingSegment,
  getRankingUrlsForCity,
} from "@/lib/seo-programmatic";
import { getRankingSeo } from "@/lib/seo-ranking-data";
import {
  fetchProfilesByCityIdForRanking,
  fetchReviewAveragesByProfileIds,
  type EscortProfileRow,
} from "@/lib/seo-profiles";
import type { RankingSlug } from "@/lib/seo-programmatic";
import { SITE_URL } from "@/lib/seo-constants";

const RANKING_LABELS: Record<string, string> = {
  "mejores-escorts": "Mejores escorts",
  "escorts-nuevas": "Escorts nuevas",
  "escorts-recomendadas": "Escorts recomendadas",
};

export default function CityRankingPage() {
  const { citySlug, segment } = useParams<{ citySlug: string; segment: string }>();

  if (!citySlug || !segment) {
    return <Navigate to={`/${ACTIVE_CITY_SLUG}`} replace />;
  }
  if (!isAllowedCitySlug(citySlug)) {
    return <Navigate to={`/${ACTIVE_CITY_SLUG}`} replace />;
  }

  const segmentLower = segment.toLowerCase();
  if (!isRankingSegment(segmentLower)) {
    return <Navigate to={`/${citySlug}`} replace />;
  }

  const cityName =
    citySlug === "rancagua"
      ? "Rancagua"
      : citySlug.charAt(0).toUpperCase() + citySlug.slice(1);
  const seo = getRankingSeo(citySlug, segmentLower as RankingSlug);

  const pageViewTracked = useRef(false);
  useEffect(() => {
    if (pageViewTracked.current) return;
    pageViewTracked.current = true;
    trackPageCategoryView({
      page_path: `/${citySlug}/${segmentLower}`,
      city: cityName,
      category_or_filter: `ranking_${segmentLower}`,
    });
  }, [citySlug, segmentLower, cityName]);

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
  const { data: profilesRaw = [] } = useQuery({
    queryKey: ["escort_profiles_ranking", cityId],
    queryFn: () => (cityId ? fetchProfilesByCityIdForRanking(cityId) : Promise.resolve([])),
    enabled: !!cityId,
  });

  const { data: reviewAverages = new Map<string, { avg: number; count: number }>() } = useQuery({
    queryKey: ["review_averages_ranking", profilesRaw.map((p) => p.id).join(","), segmentLower],
    queryFn: () =>
      segmentLower === "mejores-escorts" && profilesRaw.length > 0
        ? fetchReviewAveragesByProfileIds(profilesRaw.map((p) => p.id))
        : Promise.resolve(new Map<string, { avg: number; count: number }>()),
    enabled: !!cityId && segmentLower === "mejores-escorts" && profilesRaw.length > 0,
  });

  const sortedProfiles = (() => {
    const list = [...(profilesRaw as EscortProfileRow[])];
    if (segmentLower === "mejores-escorts") {
      list.sort((a, b) => {
        const ra = reviewAverages.get(a.id);
        const rb = reviewAverages.get(b.id);
        const avgA = ra?.avg ?? 0;
        const avgB = rb?.avg ?? 0;
        if (avgB !== avgA) return avgB - avgA;
        return (rb?.count ?? 0) - (ra?.count ?? 0);
      });
    } else if (segmentLower === "escorts-nuevas") {
      list.sort((a, b) => {
        const da = a.created_at ?? "";
        const db = b.created_at ?? "";
        return db.localeCompare(da);
      });
    } else if (segmentLower === "escorts-recomendadas") {
      list.sort((a, b) => {
        const da = a.updated_at ?? a.created_at ?? "";
        const db = b.updated_at ?? b.created_at ?? "";
        return db.localeCompare(da);
      });
    }
    return list;
  })();

  const profilesForCards = sortedProfiles.map((p) => ({
    id: p.id,
    name: p.name,
    age: p.age,
    city: cityRow?.name ?? cityName,
    badge: p.badge ?? "Perfil",
    image: p.image ?? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
    available: p.available,
    whatsapp: p.whatsapp ?? null,
    slug: p.slug ?? null,
  }));

  const rankingUrls = getRankingUrlsForCity(citySlug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: seo.h1,
    description: seo.description,
    url: `${SITE_URL}/${citySlug}/${segmentLower}`,
    numberOfItems: profilesForCards.length,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: profilesForCards.length,
      itemListElement: profilesForCards.slice(0, 10).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.name,
        url: `${SITE_URL}${getProfileUrl(p, citySlug)}`,
      })),
    },
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <SeoHead
        title={seo.title}
        description={seo.description}
        canonicalPath={`/${citySlug}/${segmentLower}`}
        robots="index, follow"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
            {RANKING_LABELS[segmentLower] ?? segment}
          </span>
        </nav>

        <h1 className="text-3xl font-display font-bold text-foreground mb-6">
          {seo.h1}
        </h1>

        <div className="prose prose-invert max-w-none mb-10 space-y-4">
          {seo.introParagraphs.map((p, i) => (
            <p key={i} className="text-muted-foreground text-sm leading-relaxed">
              {p}
            </p>
          ))}
        </div>

        <h2 className="text-xl font-display font-bold text-foreground mb-4">
          {profilesForCards.length > 0
            ? `Perfiles en ${cityName} (${profilesForCards.length})`
            : "Aún no hay perfiles en este ranking"}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          {profilesForCards.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} citySlug={citySlug} />
          ))}
        </div>

        <section className="border-t border-border pt-8">
          <h2 className="text-lg font-display font-bold text-foreground mb-4">
            Otros rankings y categorías en {cityName}
          </h2>
          <div className="flex flex-wrap gap-2">
            <Link
              to={cityUrl(citySlug)}
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-copper/20 text-copper text-sm font-medium hover:bg-copper/30 transition-colors"
            >
              Ver todos los perfiles
            </Link>
            {rankingUrls
              .filter((url) => !url.endsWith(segmentLower))
              .map((url) => {
                const slug = url.split("/").pop() ?? "";
                const label = RANKING_LABELS[slug] ?? slug;
                return (
                  <Link
                    key={url}
                    to={url}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg border border-border text-muted-foreground text-sm hover:bg-muted hover:text-foreground transition-colors"
                  >
                    {label}
                  </Link>
                );
              })}
          </div>
        </section>
      </div>
    </div>
  );
}
