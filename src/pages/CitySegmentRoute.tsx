/**
 * Ruta /:citySlug/:segment.
 * Si segment es ranking (mejores-escorts, etc.) → CityRankingPage.
 * Si segment es filtro/categoría → CityFilterPage.
 * Si no → slug de perfil → ProfilePage.
 */

import { useParams, Navigate } from "react-router-dom";
import { isAllowedCitySlug } from "@/lib/site-config";
import { isRankingSegment, isFilterOrCategorySegment } from "@/lib/seo-programmatic";
import CityRankingPage from "./CityRankingPage";
import CityFilterPage from "./CityFilterPage";
import ProfilePage from "./ProfilePage";

export function CitySegmentRoute() {
  const { citySlug, segment } = useParams<{ citySlug: string; segment: string }>();

  if (!citySlug || !segment) {
    return <Navigate to="/rancagua" replace />;
  }
  if (!isAllowedCitySlug(citySlug)) {
    return <Navigate to="/rancagua" replace />;
  }

  if (isRankingSegment(segment)) {
    return <CityRankingPage />;
  }
  if (isFilterOrCategorySegment(segment)) {
    return <CityFilterPage />;
  }

  return <ProfilePage />;
}
