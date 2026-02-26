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
    name: sanitizeForJsonLd(SITE_NAME),
    url: SITE_URL + "/",
    description: "Marketplace de perfiles premium por ciudad en el sur de Chile.",
  };
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: sanitizeForJsonLd(SITE_NAME),
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

  const collectionPage = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Perfiles en ${safeName}`,
    description: `Listado de perfiles disponibles en ${safeName}`,
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
