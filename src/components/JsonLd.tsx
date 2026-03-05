/**
 * JSON-LD estructurado para SEO.
 * Home: WebSite + Organization. Ciudad: CollectionPage + BreadcrumbList + ItemList. Perfil: Person + BreadcrumbList.
 * Valores sanitizados para evitar inyección.
 */
import { SITE_URL, SITE_NAME } from "@/lib/seo-constants";
import { sanitizeForJsonLd } from "@/lib/sanitize-seo";

export function JsonLdHome() {
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Hola Cachero",
    url: SITE_URL + "/",
    description:
      "Hola Cachero: escorts en Rancagua, escort en Rancagua, acompañantes en Rancagua, damas de compañía en Rancagua. Sexo en Rancagua y sur de Chile.",
  };
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Hola Cachero",
    url: SITE_URL + "/",
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
    </>
  );
}

export interface JsonLdCityProps {
  cityName: string;
  citySlug: string;
  profileCount: number;
  profileNames?: string[];
}

export function JsonLdCity({ cityName, citySlug, profileCount, profileNames = [] }: JsonLdCityProps) {
  const cityUrl = `${SITE_URL}/${sanitizeForJsonLd(citySlug)}`;
  const safeName = sanitizeForJsonLd(cityName);

  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL + "/" },
      { "@type": "ListItem", position: 2, name: safeName, item: cityUrl },
    ],
  };

  const isRancagua = citySlug?.toLowerCase() === "rancagua";
  const collectionPage = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: isRancagua ? `Escorts en Rancagua, acompañantes y damas de compañía | Hola Cachero` : `Perfiles en ${safeName}`,
    description: isRancagua
      ? "Escorts en Rancagua, putas en Rancagua, damas de compañía y acompañantes. Sexo en Rancagua. Perfiles premium en Hola Cachero."
      : `Listado de perfiles disponibles en ${safeName}`,
    url: cityUrl,
    numberOfItems: profileCount,
  };

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Perfiles en ${safeName}`,
    numberOfItems: profileCount,
    itemListElement: profileNames.slice(0, 10).map((name, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: sanitizeForJsonLd(name),
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
    </>
  );
}

export interface JsonLdFilterPageProps {
  cityName: string;
  citySlug: string;
  filterSlug: string;
  filterLabel: string;
  profileNames: string[];
  profileUrls?: string[];
}

export function JsonLdFilterPage({
  cityName,
  citySlug,
  filterSlug,
  filterLabel,
  profileNames,
  profileUrls = [],
}: JsonLdFilterPageProps) {
  const cityUrl = `${SITE_URL}/${sanitizeForJsonLd(citySlug)}`;
  const filterUrlPath = `${cityUrl}/${sanitizeForJsonLd(filterSlug)}`;
  const safeCity = sanitizeForJsonLd(cityName);
  const safeFilter = sanitizeForJsonLd(filterLabel);

  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL + "/" },
      { "@type": "ListItem", position: 2, name: safeCity, item: cityUrl },
      { "@type": "ListItem", position: 3, name: safeFilter, item: filterUrlPath },
    ],
  };

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${safeFilter} en ${safeCity}`,
    numberOfItems: profileNames.length,
    itemListElement: profileNames.slice(0, 20).map((name, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: sanitizeForJsonLd(name),
      ...(profileUrls[i] ? { url: profileUrls[i] } : {}),
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
    </>
  );
}

export interface JsonLdProfileProps {
  profileName: string;
  profileId: string;
  cityName: string;
  citySlug: string;
  image?: string;
  description?: string;
}

export function JsonLdProfile({
  profileName,
  profileId,
  cityName,
  citySlug,
  image,
  description,
}: JsonLdProfileProps) {
  const profileUrl = `${SITE_URL}/perfil/${sanitizeForJsonLd(profileId)}`;
  const cityUrl = `${SITE_URL}/${sanitizeForJsonLd(citySlug)}`;
  const safeName = sanitizeForJsonLd(profileName);
  const safeCity = sanitizeForJsonLd(cityName);
  const safeDesc = description ? sanitizeForJsonLd(description) : `Perfil de ${safeName}, disponible en ${safeCity}.`;

  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL + "/" },
      { "@type": "ListItem", position: 2, name: safeCity, item: cityUrl },
      { "@type": "ListItem", position: 3, name: safeName, item: profileUrl },
    ],
  };

  const person: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: safeName,
    url: profileUrl,
    description: safeDesc,
  };
  if (image && image.startsWith("http")) person.image = image;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }} />
    </>
  );
}
