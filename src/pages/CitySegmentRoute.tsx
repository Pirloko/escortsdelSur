/**
 * Ruta /:citySlug/:segment.
 * Si segment es ranking (mejores-escorts, etc.) → CityRankingPage.
 * Si segment es filtro/categoría → CityFilterPage.
 * Si no → slug de perfil → ProfilePage.
 */

import { useParams, Navigate } from "react-router-dom";
import { isAllowedCitySlug } from "@/lib/site-config";
import {
  isRankingSegment,
  isFilterOrCategorySegment,
  INDEX_SLUGS,
} from "@/lib/seo-programmatic";
import CityRankingPage from "./CityRankingPage";
import CityFilterPage from "./CityFilterPage";
import CityIndexPage from "./CityIndexPage";
import ProfilePage from "./ProfilePage";
import TopEscortsPage from "./TopEscortsPage";

export function CitySegmentRoute() {
  const { citySlug, segment } = useParams<{ citySlug: string; segment: string }>();

  if (!citySlug || !segment) {
    return <Navigate to="/rancagua" replace />;
  }
  if (!isAllowedCitySlug(citySlug)) {
    return <Navigate to="/rancagua" replace />;
  }

  if (segment === "top-escorts") {
    return <TopEscortsPage />;
  }
  if (INDEX_SLUGS.includes(segment as (typeof INDEX_SLUGS)[number])) {
    return <CityIndexPage />;
  }
  if (isRankingSegment(segment)) {
    return <CityRankingPage />;
  }
  if (isFilterOrCategorySegment(segment)) {
    return <CityFilterPage />;
  }

  return <ProfilePage />;
}
