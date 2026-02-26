/**
 * Meta completo por ruta: title, description, canonical, Open Graph, Twitter, robots.
 * Sanitiza valores para evitar XSS.
 */
import { Helmet } from "react-helmet-async";
import { SITE_URL, DEFAULT_OG_IMAGE, SITE_NAME } from "@/lib/seo-constants";
import { sanitizeMeta, sanitizeUrl } from "@/lib/sanitize-seo";

export interface SeoHeadProps {
  title: string;
  description: string;
  canonicalPath: string;
  ogImage?: string | null;
  /** "index, follow" | "noindex, nofollow" | "noindex, follow". Por defecto index, follow. */
  robots?: string;
  /** Si true, no se incluyen og/twitter (p. ej. noindex). */
  noSocial?: boolean;
  /** URL de imagen hero para preload (LCP). */
  preloadImage?: string | null;
}

export function SeoHead({
  title,
  description,
  canonicalPath,
  ogImage,
  robots = "index, follow",
  noSocial = false,
  preloadImage,
}: SeoHeadProps) {
  const canonical = sanitizeUrl(canonicalPath.startsWith("http") ? canonicalPath : `${SITE_URL}${canonicalPath.startsWith("/") ? "" : "/"}${canonicalPath}`, SITE_URL);
  const safeTitle = sanitizeMeta(title, 70);
  const safeDesc = sanitizeMeta(description, 160);
  const image = ogImage && ogImage.startsWith("http") ? ogImage : (ogImage ? `${SITE_URL}${ogImage.startsWith("/") ? "" : "/"}${ogImage}` : DEFAULT_OG_IMAGE);
  const preloadUrl = preloadImage && (preloadImage.startsWith("http") ? preloadImage : `${SITE_URL}${preloadImage.startsWith("/") ? "" : "/"}${preloadImage}`);

  return (
    <Helmet>
      <title>{safeTitle}</title>
      <meta name="description" content={safeDesc} />
      <link rel="canonical" href={canonical} />
      <link rel="alternate" hrefLang="es-cl" href={canonical} />
      <link rel="alternate" hrefLang="x-default" href={canonical} />
      {preloadUrl && <link rel="preload" href={preloadUrl} as="image" />}
      <meta name="robots" content={robots} />
      {!noSocial && (
        <>
          <meta property="og:title" content={safeTitle} />
          <meta property="og:description" content={safeDesc} />
          <meta property="og:image" content={image} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={canonical} />
          <meta property="og:site_name" content={SITE_NAME} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={safeTitle} />
          <meta name="twitter:description" content={safeDesc} />
          <meta name="twitter:image" content={image} />
        </>
      )}
    </Helmet>
  );
}
