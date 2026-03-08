# Respuestas: Estructura del sitio, SEO e indexación (holacachero.cl)

Documento generado a partir del código actual del proyecto.

---

## 1. Estructura de URLs

### ¿Cuál es la estructura exacta de URLs actual del sitio?

- **Inicio:** `/`
- **Ciudad:** `/:citySlug` → ej. `/rancagua`
- **Ciudad + filtro/categoría:** `/:citySlug/:segment` → ej. `/rancagua/escorts`, `/rancagua/masajes`, `/rancagua/escort-pelinegra`
- **Perfil:** `/perfil/:profileId` (ID UUID, no slug) → ej. `/perfil/573658ca-4805-4102-81e5-f4b35e40beb2`
- **No existe:** `/rancagua/nombre-perfil` ni `/rancagua/nombre-perfil/comentarios`. Los comentarios y reseñas están dentro de la página del perfil (`/perfil/:id`).

Otras rutas: `/login`, `/registro`, `/registro-cliente`, `/completar-perfil`, `/cambiar-contrasena`, `/mi-perfil`, `/cuenta`, `/cuenta/perfil/:profileId`, `/desafio-del-dia`, `/desafio-del-dia/:quizId`, `/rifa`, `/rifa/terminos`, `/terminos-de-uso`, `/privacidad`, `/politica-de-privacidad`, `/admin/*`.

---

### ¿Existe una estructura por ciudad o solo por Rancagua?

**Por código existe estructura por ciudad** (`/:citySlug`, `/:citySlug/:segment`), pero **en configuración solo está activa Rancagua**.

- `site-config.ts`: `ACTIVE_CITY_SLUG = "rancagua"`, `ALLOWED_CITY_SLUGS = ["rancagua"]`.
- Cualquier otro `citySlug` (ej. `/santiago`, `/talca`) **redirige a `/rancagua`**.
- La base de datos tiene tabla `cities`; el sitemap y la lógica están preparados para ampliar a más ciudades activando slugs en config y en Supabase.

---

### ¿Existen páginas por categoría o servicio?

**Sí.** Son las rutas `/:citySlug/:segment` cuando `segment` es un filtro/categoría conocido.

- **Categorías:** `/rancagua/escorts`, `/rancagua/acompanantes`, `/rancagua/damas-de-compania`
- **Intención:** `/rancagua/sexo`, `/rancagua/skokka`, etc.
- **Características:** `/rancagua/pelinegras`, `/rancagua/tetonas`, `/rancagua/escort-pelinegra`, etc.
- **Servicios:** `/rancagua/masajes`, `/rancagua/a-domicilio`, `/rancagua/masajes-eroticos`, etc.

La lista completa de segmentos válidos está en `seo-programmatic.ts` (`isFilterOrCategorySegment`). Cualquier otro segmento redirige a `/:citySlug`.

---

### ¿Cada perfil tiene URL única indexable o se cargan dinámicamente?

**Cada perfil tiene URL única e indexable:** `/perfil/:profileId` (con UUID). La página se genera en cliente (React) según el `profileId` de la ruta; el contenido es dinámico pero la URL es estable y se puede incluir en sitemap y canonical.

---

### ¿Los perfiles tienen slug SEO o usan ID?

**Se usa ID (UUID), no slug.**  
Ejemplo real: `/perfil/573658ca-4805-4102-81e5-f4b35e40beb2`.  
**No** existe actualmente `/rancagua/camila-escort`; el comentado “futuro: slug de perfil” en `CitySegmentRoute` indica que podría añadirse después.

---

## 2. Indexación y rastreo

### ¿Existe sitemap.xml automático?

**Sí.** Hay una función serverless en Netlify que sirve el sitemap: `netlify/functions/sitemap.js`. La URL es `https://holacachero.cl/sitemap.xml` (configurada en `netlify.toml`).

---

### ¿El sitemap incluye: ciudades, perfiles, categorías, páginas SEO?

- **Inicio:** sí (`/`).
- **Ciudad:** actualmente solo Rancagua (`/rancagua`) de forma fija.
- **Perfiles:** sí, todos los perfiles de Rancagua con `active_until` válido; URLs tipo `/perfil/{id}`.
- **Categorías/filtros:** sí, una lista fija de slugs (ej. `/rancagua/escorts`, `/rancagua/masajes`, etc.) definida en `FILTER_SLUGS` dentro de la función; no se generan dinámicamente desde BD por ciudad.
- **Otras páginas SEO:** términos, privacidad, rifa, etc. no aparecen en el sitemap actual (solo inicio, ciudad, filtros y perfiles).

---

### ¿Existe robots.txt configurado?

**Sí.** `public/robots.txt`:

- `Allow: /`, `/rancagua`, `/rancagua/`, `/perfil/`
- `Disallow:` `/login`, `/registro`, `/registro-cliente`, `/completar-perfil`, `/cambiar-contrasena`, `/cuenta`, `/cuenta/`, `/mi-perfil`, `/admin`, `/admin/`, `/desafio-del-dia`, `/rifa`, `/rifa/`
- `Sitemap: https://holacachero.cl/sitemap.xml`

---

### ¿Qué páginas están bloqueadas para indexación?

Por `robots.txt`: login, registro, registro-cliente, completar-perfil, cambiar-contrasena, cuenta, mi-perfil, admin, desafío del día, rifa (y subrutas indicadas).  
Además, en las páginas no indexables se usa `<meta name="robots" content="noindex, nofollow">` (p. ej. en desafío, cuenta, etc.). La documentación interna menciona no indexar también `/admin`, `/login`, `/registro`, `/cuenta`, `/mi-perfil`, `/desafio-del-dia`, `/completar-perfil`, `/cambiar-contrasena`.

---

### ¿Los perfiles usan rel=canonical?

**Sí.** `SeoHead` incluye `<link rel="canonical" href={canonical}>`. En perfil se usa `canonicalPath={`/perfil/${profileId}`}`, así que la URL canónica es la del perfil por ID.

---

## 3. SEO On Page

### ¿Cómo se generan los title tags?

Con el componente `SeoHead` (react-helmet-async). Se sanitiza y se trunca a ~70 caracteres.

- **Perfil (Rancagua):** `{nombre} Escort en Rancagua | Acompañante VIP – Hola Cachero`
- **Perfil (otra ciudad):** `{nombre}, Escort en {ciudad} | Perfil Disponible – Hola Cachero`
- **Ciudad / filtros / inicio:** cada página define su propio `title` y se lo pasa a `SeoHead`.

Formato tipo “Camila Escort en Rancagua | Escorts y Acompañantes” se puede lograr ajustando las cadenas en cada página; la estructura actual ya es cercana.

---

### ¿Cómo se generan las meta descriptions?

Con el mismo `SeoHead`: `<meta name="description" content={safeDesc}>` (sanitizado y limitado a ~160 caracteres).  
En perfil: si hay `description` del perfil se usa; si no, texto por defecto por ciudad (ej. Rancagua) o genérico.

---

### ¿Cada perfil tiene contenido textual SEO de al menos 300–500 palabras?

Depende del campo `description` del perfil y del contenido que se renderiza (descripción, servicios, comentarios, reseñas). No hay un mínimo fijo en código; si la descripción es corta, la página puede quedar con poco texto. Las reseñas y comentarios añaden contenido adicional.

---

### ¿Las páginas de ciudad tienen contenido propio o solo listados?

Tienen **contenido propio además del listado.** Se usa un bloque SEO por ciudad (`CitySeoBlock`) y datos en `cities-seo-data.ts` (ej. `getCitySeo`, `seo_content`). Se considera “thin content” cuando el bloque tiene menos de ~600 palabras (`getSeoContentWordCount`).

---

### ¿El sitio usa schema markup?

**Sí.** En `JsonLd.tsx`:

- **Home:** WebSite + Organization.
- **Ciudad:** CollectionPage + BreadcrumbList + ItemList (perfiles).
- **Página de filtro:** CollectionPage + BreadcrumbList + ItemList.
- **Perfil:** **Person** + **BreadcrumbList**.

**No hay** LocalBusiness, Review ni AggregateRating en el JSON-LD actual. Las reseñas (review_experiences) y comentarios existen en la UI pero no tienen schema de Review/AggregateRating.

---

## 4. SEO programático

### ¿El sitio tiene páginas automáticas tipo /escorts-en-rancagua, /acompanantes-en-rancagua?

**No.** Las URLs son `/:citySlug/:segment` (ej. `/rancagua/escorts`, `/rancagua/acompanantes`), no `/escorts-en-rancagua`. El patrón es ciudad primero, luego segmento.

---

### ¿Se generan páginas combinadas ciudad + servicio?

**Sí**, con el patrón ciudad + segmento: ej. `/rancagua/escorts`, `/rancagua/masajes`, `/rancagua/masajes-eroticos`, `/rancagua/a-domicilio`. No hay rutas tipo `masajes-en-rancagua` como URL literal.

---

### ¿Se generan páginas tipo perfil + ciudad (ej. camila-escort-en-rancagua)?

**No.** Los perfiles son solo `/perfil/:id` (UUID). No hay URLs tipo `camila-escort-en-rancagua`.

---

## 5. Contenido generado por usuarios (UGC)

### ¿Los perfiles permiten comentarios, reseñas, puntuaciones?

- **Comentarios:** sí (`profile_comments`).
- **Reseñas estructuradas:** sí (`review_experiences`: puntuaciones, campos estructurados, `promedio_final`).
- **Puntuaciones:** las reseñas tienen puntuaciones (ej. 1–5, 1–10) y un promedio; no hay un “rating” global único por perfil en la UI como número destacado tipo 4.2/5, pero el dato existe.

---

### ¿Las reseñas generan contenido indexable HTML o solo JS?

El contenido de reseñas y comentarios se renderiza en React (HTML en el DOM), así que **sí es contenido HTML** que los crawlers pueden ver. El sitio es SPA: todo se genera en cliente; no hay HTML estático pre-renderizado para esas secciones.

---

### ¿Las reseñas tienen schema markup de Review / AggregateRating?

**No.** El JSON-LD de perfil solo incluye Person y BreadcrumbList. No se inyecta Review ni AggregateRating para comentarios o reseñas.

---

## 6. Enlazado interno

### ¿Desde la página de ciudad se enlazan todos los perfiles?

En la página de ciudad se muestran listados de perfiles (destacadas, galería, etc.) con enlaces a `/perfil/:id`. No se enlaza “todos” en una sola lista gigante; se enlazan los que se muestran en esa vista (p. ej. destacados y los del carrusel/filtros).

---

### ¿Los perfiles enlazan a otras escorts en Rancagua?

**Sí.** En `ProfilePage` hay una sección de otros perfiles (ej. “Otros perfiles en {ciudad}”) con enlaces a otros perfiles de la misma ciudad.

---

### ¿Existe sección “Perfiles similares”?

No hay una sección literal llamada “Perfiles similares”; sí hay “otros perfiles” en la misma ciudad, que actúa como enlazado interno relacionado.

---

### ¿Existen páginas tipo “mejores escorts en rancagua”, “escorts recomendadas”, “nuevas escorts”?

**No** en el código actual. Solo ciudad, filtros/categorías por segmento y perfiles por ID. No hay rutas ni páginas dedicadas a “mejores”, “recomendadas” o “nuevas”.

---

## 7. Core Web Vitals

### ¿El sitio usa lazy loading en imágenes?

**Sí.** Varios componentes usan `loading="lazy"` en `<img>` (p. ej. ProfileCard, FeaturedProfileCard, CityCard, QuizImageReveal).

---

### ¿Las imágenes de perfil están optimizadas en webp?

**No obligatorio.** Los formularios aceptan `image/jpeg`, `image/png`, `image/webp`, `image/gif`; no hay conversión automática a WebP en el código. Las imágenes se sirven como se suben.

---

### ¿Las páginas cargan en menos de 2.5 segundos?

No se puede afirmar solo con el código; depende de hosting, red y tamaño de recursos. Es una SPA con lazy loading y chunks; los tiempos habría que medirlos con RUM o Lighthouse.

---

### ¿El sitio usa SSR o solo React SPA?

**Solo React SPA.** No hay SSR ni prerenderizado. Todo el HTML significativo se genera en el cliente. Esto **perjudica el SEO** si el crawler no ejecuta bien JS; para SEO fuerte suele recomendarse SSR o pre-render (o al menos comprobar que Google rastree bien la SPA).

---

## 8. Indexación real en Google

### ¿Cuántas páginas tiene indexadas Google? ¿Indexó perfiles? ¿Páginas de ciudad?

No se puede saber desde el código. Hay que comprobarlo en:

- **Búsqueda:** `site:holacachero.cl`
- **Google Search Console:** páginas indexadas, cobertura, URLs de perfiles y de ciudad.

Las respuestas deben rellenarse con datos reales de GSC y búsqueda.

---

## 9. Competencia SEO

### ¿Quiénes son tus competidores directos? ¿Analizaste títulos, URLs, páginas indexadas?

Pregunta de estrategia/negocio; no se deduce del código. Ejemplos que sueles citar: Skokka, Sexosur. Habría que analizarlos manualmente (títulos, URLs, indexación).

---

## 10. Autoridad del dominio

### ¿El dominio tiene backlinks, menciones, directorios? ¿Google Search Console? ¿Google Analytics?

Todo eso es configuración y datos externos; no está definido en el repositorio. Debe responderse con datos de GSC, GA (o similar) y herramientas de backlinks.

---

## 11. SEO técnico avanzado

### ¿El sitio tiene breadcrumbs SEO?

**Sí.**  
- **Visual:** en varias páginas se muestra tipo “Inicio > Rancagua” o “Inicio > Rancagua > Perfil”.  
- **Estructurado:** BreadcrumbList en JSON-LD en ciudad, filtro y perfil (JsonLdCity, JsonLdFilterPage, JsonLdProfile).

---

### ¿Usas structured data para breadcrumbs?

**Sí.** Schema.org BreadcrumbList en el JSON-LD de las páginas de ciudad, filtro y perfil.

---

### ¿Las páginas tienen Open Graph?

**Sí.** `SeoHead` incluye `og:title`, `og:description`, `og:image`, `og:type`, `og:url`, `og:site_name` y Twitter card. En páginas con `noSocial` (ej. noindex) no se envían og/twitter.

---

## 12. SEO de crecimiento

### ¿Planeas expandirte a más ciudades (Santiago, Talca, Curicó, Temuco, etc.)?

La base de código está preparada (rutas por `citySlug`, tabla `cities`, sitemap que podría incluir más ciudades). La configuración actual permite solo Rancagua; ampliar es sobre todo config y datos (activar ciudades en BD y en `site-config` / sitemap).

---

### ¿Quieres crear páginas tipo “escorts en chile” o blog SEO (guía escorts rancagua, barrios vida nocturna)?

**No** implementado en el código. No hay rutas ni páginas para “escorts en chile” ni sección de blog.

---

## La pregunta más importante

### ¿El sitio es React SPA puro o tiene renderizado para SEO (SSR o prerender)?

**React SPA puro.** No hay SSR ni prerender. El contenido (títulos, meta, JSON-LD, listados, perfiles, reseñas) se genera en el cliente. Para SEO:

- Ventaja: títulos, meta, canonical y schema están bien definidos en código.
- Riesgo: si el crawler no ejecuta JavaScript o lo hace con límites, puede no ver todo el contenido o indexar más lento.
- Recomendación típica: comprobar en GSC y “Probar URL” que Google vea bien las páginas; si no, valorar SSR (Next.js, Remix, etc.) o un servicio de prerender para las URLs importantes.

---

*Documento basado en el estado del código del proyecto (rutas, componentes, sitemap, robots, SeoHead, JsonLd, site-config, seo-programmatic, cities-seo-data, etc.).*
