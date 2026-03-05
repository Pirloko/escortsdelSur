/**
 * Ruta /:citySlug/:segment.
 * Si segment es un filtro/categoría conocido → CityFilterPage.
 * Si no (futuro: slug de perfil) → redirect a ciudad o 404.
 */

import { useParams, Navigate } from "react-router-dom";
import { isAllowedCitySlug } from "@/lib/site-config";
import { isFilterOrCategorySegment } from "@/lib/seo-programmatic";
import CityFilterPage from "./CityFilterPage";

export function CitySegmentRoute() {
  const { citySlug, segment } = useParams<{ citySlug: string; segment: string }>();

  if (!citySlug || !segment) {
    return <Navigate to="/rancagua" replace />;
  }
  if (!isAllowedCitySlug(citySlug)) {
    return <Navigate to="/rancagua" replace />;
  }

  if (isFilterOrCategorySegment(segment)) {
    return <CityFilterPage />;
  }

  return <Navigate to={`/${citySlug}`} replace />;
}
