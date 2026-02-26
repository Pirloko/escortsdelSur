# Estrategia SEO – Marketplace Sur de Chile

## URLs (Fase SEO estructural)

- **Ciudad:** `/[slug]/` → ej. `/rancagua/`, `/talca/`, `/temuco/`
- **Perfil:** `/perfil/[id]`
- Ya no se usa `/ciudad/rancagua`.

## Palabras clave por ciudad (Fase 1)

- **Principal:** "escorts en [Ciudad]"
- **Variaciones:** perfiles en [ciudad], acompañantes en [ciudad], servicio premium en [ciudad], disponibles en [ciudad]
- Sin keyword stuffing; uso natural en títulos, descripciones y contenido.

## Meta dinámicos

- **Ciudad:** `Title: "Escorts en [Ciudad] | Perfiles Premium en el Sur de Chile"` + `Description` con keyword principal y variación.
- **Perfil:** `Title: "[Nombre], Escort en [Ciudad] | Perfil Disponible"` + descripción natural.
- **Home:** título y descripción genéricos del marketplace.

Implementación: `react-helmet-async` en cada página (Index, CityPage, ProfilePage).

## Contenido SEO en página ciudad

- Bloque debajo del grid (componente `CitySeoBlock`).
- 600–900 palabras únicas para Fase 1: Rancagua, Talca, Chillán, Concepción, Temuco.
- Keyword principal 1–2 veces; variaciones semánticas y contexto geográfico real.
- Enlaces internos con anchor natural: "Ver más perfiles en Temuco", "Explorar escorts en Talca", etc.
- Datos en `src/lib/cities-seo-data.ts` (escalable a Supabase).

## JSON-LD

- **Ciudad:** BreadcrumbList + ItemList.
- **Perfil:** BreadcrumbList + Person.
- Componentes en `src/components/JsonLd.tsx`. Reemplazar `SITE_URL` en ese archivo por el dominio real.

## Supabase (escalabilidad)

- Migración: `supabase/migrations/20260224000000_create_cities_seo.sql`.
- Tabla `cities`: `slug`, `name`, `profiles`, `image`, `keyword_primary`, `seo_title`, `seo_description`, `seo_content`.
- Tipos en `src/types/supabase-cities.ts`. Cuando conectes Supabase, puedes cargar SEO por ciudad desde la API y dejar de usar `cities-seo-data.ts` como fuente principal.

## Enlaces internos

- Footer: "Ver perfiles en [Ciudad]" → `/[slug]`.
- Bloque SEO ciudad: sección "Explora otras ciudades" con enlaces a ciudades cercanas.
- CityCard, BottomNav, ProfilePage (vuelta atrás): todos usan `/[slug]`.

## Buenas prácticas

- Sin doorway pages: una URL por ciudad, contenido único.
- Sin contenido duplicado: texto distinto por ciudad.
- Estructura pensada para escalar ciudad por ciudad (nuevas ciudades = nuevo slug + datos SEO).

## Dominio

- Reemplazar `https://tudominio.cl` en `src/components/JsonLd.tsx` por el dominio real antes de producción.
