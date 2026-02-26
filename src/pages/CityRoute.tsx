/**
 * Ruta que resuelve /:citySlug. Solo renderiza CityPage si el slug es válido;
 * si no, muestra NotFound (evita doorway y URLs inventadas).
 */

import { useParams } from "react-router-dom";
import { isValidCitySlug } from "@/lib/seo";
import CityPage from "./CityPage";
import NotFound from "./NotFound";

export function CityRoute() {
  const { citySlug } = useParams<{ citySlug: string }>();
  if (!citySlug || !isValidCitySlug(citySlug)) {
    return <NotFound />;
  }
  return <CityPage />;
}
