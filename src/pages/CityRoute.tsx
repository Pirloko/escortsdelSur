/**
 * Ruta que resuelve /:citySlug. Solo renderiza CityPage si el slug está permitido;
 * si no, redirige a la ciudad activa (por ahora solo Rancagua).
 */

import { useParams, Navigate } from "react-router-dom";
import { isAllowedCitySlug, ACTIVE_CITY_SLUG } from "@/lib/site-config";
import CityPage from "./CityPage";

export function CityRoute() {
  const { citySlug } = useParams<{ citySlug: string }>();
  if (!citySlug || !isAllowedCitySlug(citySlug)) {
    return <Navigate to={`/${ACTIVE_CITY_SLUG}`} replace />;
  }
  return <CityPage />;
}
