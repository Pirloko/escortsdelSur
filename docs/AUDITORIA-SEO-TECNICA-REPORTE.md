# Auditoría SEO técnica – Reporte final

**Proyecto:** Hola Cachero (Rancagua)  
**Fecha:** Revisión post-implementación de fases SEO  
**Alcance:** Código fuente del proyecto (Supabase, React, Vite, Netlify).

---

## 1️⃣ URLs SEO para perfiles

### ¿Existe el campo `slug` en la tabla `escort_profiles`?
**Sí.** Migración `20260324000000_escort_profiles_slug_seo.sql` añade la columna `slug TEXT` y el índice único `(city_id, slug)` donde `slug IS NOT NULL`.

### ¿El slug se genera automáticamente al crear un perfil?
**Sí.** El trigger `escort_profiles_set_slug_trigger` (BEFORE INSERT) llama a `escort_profiles_set_slug()`: si `NEW.slug` está vacío, se genera con `escort_profile_slug_base(NEW.name)`.

### ¿El slug está basado en nombre + escort + ciudad?
**Parcial.** El slug se basa en **nombre + "-escort"** únicamente. La función `escort_profile_slug_base(name_val)` hace `slugify(name_val) || '-escort'`. **No incluye la ciudad** en el slug.  
- Ejemplo real: `camila` → `camila-escort`.  
- Formato de URL: `/rancagua/camila-escort` (la ciudad va en el path, no en el slug del perfil).

### ¿Ejemplo esperado /rancagua/camila-escort?
**Sí.** La URL canónica es `/:citySlug/:profileSlug` (ej. `/rancagua/camila-escort`). Se construye en `getProfileUrl()` y `profileSeoUrl()` en `src/lib/seo-programmatic.ts`.

### ¿Lógica para evitar slugs duplicados (camila-escort, camila-escort-2)?
**Sí.** En el trigger, si ya existe otro perfil en la misma ciudad con el mismo slug, se añade un sufijo numérico: `final_slug := base_slug || '-' || counter` (2, 3, …). El backfill en la migración hace lo mismo.

### ¿La ruta antigua /perfil/:profileId redirige con 301 a la URL SEO?
**Sí (redirección cliente, equivalente a 301).** En `ProfilePage.tsx` (líneas 192-194):

```tsx
if (byId && dbProfile?.slug && citySlugFromDb) {
  return <Navigate to={`/${citySlugFromDb}/${dbProfile.slug}`} replace />;
}
```

Quien entra por `/perfil/:id` y el perfil tiene `slug` y ciudad, es redirigido con `replace` a `/{citySlug}/{profileSlug}`. No es un 301 HTTP desde servidor (eso requeriría configuración en Netlify o una función), pero el comportamiento para el usuario y para el historial es el de una redirección permanente.

**Resumen 1:** Implementado correctamente. Diferencia: slug = nombre + "-escort" (sin ciudad). Redirección vía React `Navigate replace`, no 301 HTTP en servidor.

---

## 2️⃣ Rutas React actualizadas

### ¿Existe ruta /:citySlug/:profileSlug?
**Sí.** En `App.tsx`: `<Route path="/:citySlug/:segment" element={<CitySegmentRoute />} />`. El `segment` puede ser slug de perfil cuando no es ranking ni filtro.

### ¿Se carga el perfil correcto y se usa el slug en base de datos?
**Sí.** En `CitySegmentRoute.tsx` se usa `ProfilePage` cuando el segment no es ranking ni filtro. En `ProfilePage.tsx`:
- `bySlug = !!paramCitySlug && !!paramSegment`.
- Query `dbProfileBySlug`: obtiene `city.id` por `paramCitySlug` y luego busca en `escort_profiles` por `city_id` y `slug = paramSegment` (líneas 84-98).

**Resumen 2:** Implementado correctamente.

---

## 3️⃣ Sitemap SEO

### ¿Existe archivo o endpoint de sitemap.xml?
**Sí.** En Netlify: `/.netlify/functions/sitemap` sirve el sitemap (redirect en `netlify.toml`: `/sitemap.xml` → `/.netlify/functions/sitemap`). También existe `api/sitemap.xml.js` (Vercel).

### ¿El sitemap incluye páginas de ciudad, perfiles con slug y páginas ranking?
**Sí.** En `netlify/functions/sitemap.js`:
- Home: `/`.
- Por cada ciudad activa (Supabase): `/{citySlug}`.
- Por cada ciudad: `/{citySlug}/mejores-escorts`, `/{citySlug}/escorts-nuevas`, `/{citySlug}/escorts-recomendadas`.
- Por cada ciudad: todas las URLs de filtros (FILTER_SLUGS).
- Perfiles: `/{citySlug}/{profile.slug}` si existe slug, si no ` /perfil/{id}`.

### ¿El sitemap se actualiza automáticamente al crear perfiles?
**Sí.** Es dinámico: cada petición a la función consulta Supabase (ciudades activas y perfiles con `active_until` válido), por lo que nuevos perfiles con slug aparecen en la siguiente generación del sitemap. No hay caché largo que impida ver perfiles nuevos.

**Resumen 3:** Implementado correctamente.

---

## 4️⃣ Schema de reseñas

### ¿Los perfiles con reseñas incluyen schema JSON-LD (AggregateRating y Review)?
**Sí.** En `JsonLd.tsx`:
- `JsonLdAggregateRating`: `ratingValue`, `reviewCount`, `bestRating`, `worstRating`.
- `JsonLdReviewItem`: `authorName`, `datePublished`, `ratingValue`, `reviewBody`.
- En `Person` se añade `aggregateRating` cuando hay reseñas (líneas 208-216).
- Hasta 10 reseñas como bloques `Review` independientes (líneas 219-238).

### ¿El schema incluye ratingValue y reviewCount?
**Sí.** Se pasan desde `ProfilePage.tsx`: `aggregateRating: { ratingValue: reviewsAvg, reviewCount: reviews.length, bestRating: 5, worstRating: 1 }` y se escriben en el `Person.aggregateRating`.

### ¿El schema se genera en HTML o solo se inyecta con JavaScript?
**Se inyecta con JavaScript.** Los componentes React (`JsonLdProfile`, etc.) renderizan `<script type="application/ld+json">` en el árbol de React. En una SPA sin prerender/SSR, ese HTML no está en la respuesta inicial del servidor; aparece cuando React monta la página. Con prerender (FASE 7), el HTML generado por Puppeteer sí incluiría el JSON-LD en el documento.

**Resumen 4:** Lógica y datos correctos. En modo solo SPA, el schema llega tras la ejecución de JS; para indexación óptima conviene prerender o SSR en páginas clave.

---

## 5️⃣ Páginas ranking SEO

### ¿Existen las rutas dinámicas?
**Sí.**  
- `/rancagua/mejores-escorts`  
- `/rancagua/escorts-nuevas`  
- `/rancagua/escorts-recomendadas`  

Resueltas por `/:citySlug/:segment` → `CitySegmentRoute` → `CityRankingPage` cuando `isRankingSegment(segment)` es true.

### ¿Cómo se calculan los rankings?
- **mejores-escorts:** orden por promedio de `review_experiences` (desc) y luego por cantidad de reseñas (desc). Datos vía `fetchReviewAveragesByProfileIds`.
- **escorts-nuevas:** orden por `created_at` descendente.
- **escorts-recomendadas:** orden por `updated_at` (fallback `created_at`) descendente.

### ¿Tienen contenido SEO (texto) además del listado?
**Sí.** `getRankingSeo()` en `seo-ranking-data.ts` devuelve por cada ranking: `title`, `description`, `h1`, `introParagraphs` (varios párrafos). Ese contenido se muestra en `CityRankingPage` (H1 + párrafos en `.prose`) y se usa en meta.

### ¿Tienen meta tags propios?
**Sí.** `SeoHead` recibe `title={seo.title}` y `description={seo.description}`. JSON-LD tipo `CollectionPage` + `ItemList` también se incluye.

**Resumen 5:** Implementado correctamente.

---

## 6️⃣ Generador de descripciones SEO

### ¿Existe función tipo generateSeoDescription(profile)?
**Sí.** `src/lib/seo-description-generator.ts` exporta `generateSeoDescription(input: SeoDescriptionInput)` con campos: name, age, city, category, servicesIncluded, servicesExtra, nationality, whatsapp.

### ¿Usa plantillas combinables (intro, service, closing)?
**Sí.** Hay arrays de plantillas: `INTROS`, `CITY_PRESENT`, `ABOUT_ME`, `SERVICES_INTRO`, `SEO_BLOCK`, `CONTACT_CTA`. Se elige una opción por bloque con `pick()` y se combinan en párrafos.

### ¿Las descripciones generadas tienen 250-400 palabras?
**Sí.** Tras generar el texto se aplica: si `wordCount(text) < 250` se añaden frases de `extra` hasta llegar a 250; si `wordCount(text) > 400` se recorta a 400 palabras terminando en frase completa.  
**Corrección aplicada:** se sustituyó el uso de variable inexistente `count` por `wordCount(text)` en la condición del piso de palabras.

### ¿Incluyen keyword local (escort en rancagua, acompañante en rancagua)?
**Sí.** En `SEO_BLOCK(city)` y bloques similares aparecen expresiones como "escorts en ${city}", "acompañantes en ${city}", "escort en ${city}", "dama de compañía en ${city}". La ciudad por defecto es "Rancagua" si no se pasa.

### ¿Se evita sobrescribir descripciones editadas manualmente?
**Sí.** La generación solo se ejecuta cuando el usuario pulsa el botón "Texto aleatorio" / "Generar descripción SEO"; el resultado se asigna al estado (`setDescription`) y el usuario puede editarlo o guardar. No hay lógica que reemplace automáticamente un texto ya escrito; el placeholder indica que no se sobrescribe texto escrito a mano.

### ¿Las descripciones generadas se guardan en escort_profiles.description?
**Sí.** En Cuenta, CompletarPerfil y AdminEscortForm, el valor del campo descripción (incluido el generado por el botón) se envía en el `update`/`upsert` a `escort_profiles` en el campo `description`.

**Resumen 6:** Implementado correctamente. Bug corregido: uso de `wordCount(text)` en la condición de mínimo de palabras.

---

## 7️⃣ Enlazado interno

### ¿Los perfiles incluyen secciones "Otras escorts en Rancagua", "Perfiles similares", "Escorts recomendadas"?
**Sí.** En `ProfilePage.tsx`:
- **"Otras escorts en {profile.city}"** (antes "Otros perfiles en la misma ciudad"): hasta 6 perfiles mismo `city_id`, distinto perfil actual. Query `otherProfilesInCity`.
- **"Perfiles similares"**: hasta 4 perfiles mismo `city_id` y mismo `badge`, distinto perfil. Query `similarProfiles`.
- **"Escorts recomendadas"**: hasta 4 perfiles mismo `city_id` con `promotion` no nulo. Query `recommendedProfiles`.

### ¿Cómo se generan esas listas?
Con React Query contra Supabase: filtros por `city_id`, exclusión del perfil actual, y en "Perfiles similares" por `badge`; en "Escorts recomendadas" por `promotion IS NOT NULL`. Límites 6, 4 y 4 respectivamente. Los enlaces usan `getProfileUrl(profile, citySlug)` (URLs SEO con slug).

**Resumen 7:** Implementado correctamente.

---

## 8️⃣ SEO programático

### Rutas como /rancagua/escorts-vip, escorts-independientes, escorts-jovenes
**Parcial.**

- **Existen y cargan perfiles filtrados:**  
  - `/rancagua/escort-vip` y `/rancagua/escort-independiente` (singular) están en `LONGTAIL_SINGULAR_SLUGS` y son manejadas por `CityFilterPage` (filtro por slug).  
  - No existe slug `escorts-vip` ni `escorts-independientes` (en plural) ni `escorts-jovenes`. Los slugs definidos son en singular: `escort-vip`, `escort-independiente`, etc.

- **Contenido SEO:** Las páginas de filtro usan `SeoHead` y `JsonLdFilterPage` con título/descripción y ItemList según el slug; el contenido textual adicional (párrafos tipo ranking) es limitado comparado con las páginas de ranking.

- **Conclusión:** Las URLs son del tipo `/rancagua/escort-vip`, `/rancagua/escort-independiente`. No hay página "escorts jóvenes" ni variantes en plural; si se desea, habría que añadir slugs y criterio de filtro (por ejemplo por rango de edad).

**Resumen 8:** Rutas de filtro (ej. escort-vip, escort-independiente) implementadas. No existen escorts-vip/escorts-independientes/escorts-jovenes tal cual; es una decisión de diseño (nomenclatura singular vs plural y falta de filtro por edad).

---

## 9️⃣ Performance y Core Web Vitals

### ¿Las imágenes de perfil se convierten automáticamente a WebP?
**No.** No hay conversión automática a WebP en subida ni en entrega. Se aceptan formatos JPG, PNG, WebP, GIF en formularios; las URLs de Supabase Storage sirven el archivo en el formato original. Para WebP habría que: convertir en cliente antes de subir, o usar Edge/CloudFront con conversión on-the-fly, o generar variantes en build/backend.

### ¿Se usa lazy loading?
**Sí.** En `ProfileCard`, `FeaturedProfileCard`, `CityCard`, `QuizImageReveal` se usa `loading="lazy"` en las imágenes. En la galería del perfil, la primera imagen usa `loading="eager"` y el resto `loading="lazy"`.

### ¿La imagen principal del perfil usa preload?
**No.** En `ProfilePage.tsx`, `SeoHead` no recibe la prop `preloadImage`. En `CityPage` sí se pasa `preloadImage={city.image}` para la ciudad. Para mejorar LCP del perfil convendría algo como `preloadImage={profile.image}` en la página de perfil.

### ¿Se redujo el tamaño de los bundles JavaScript?
No se ha aplicado en esta auditoría una estrategia específica de reducción (manualChunks, lazy de rutas pesadas, etc.). El build ya usa code-splitting por rutas (lazy de páginas). Hay avisos de chunks >500 KB (p. ej. Cuenta, index principal); es una oportunidad de mejora (manualChunks, análisis de dependencias).

**Resumen 9:** Lazy loading sí; WebP automático no; preload de imagen principal del perfil no; tamaño de bundles sin optimización adicional.

---

## 🔟 SEO para SPA

### ¿Se implementó prerender, static rendering o SSR parcial?
**Sí (prerender opcional).** FASE 7:
- Documento: `docs/FASE-7-PRERENDER-SEO.md`.
- Script: `scripts/generate-prerender-routes.mjs` genera `prerender-routes.json` (home, ciudad, rankings, filtros).
- Comando: `npm run build:prerender` (genera rutas + `PRERENDER=true vite build`).
- Plugin: `vite-plugin-prerender` con Puppeteer; `renderAfterTime: 4000`; rutas leídas desde el JSON. Si el prerender falla (p. ej. Chrome no disponible en CI), el build de Vite ya produjo el SPA y el sitio sigue funcionando.

**Impacto si no se usa prerender:** En SPA puro, el crawler recibe un HTML casi vacío y el contenido y el JSON-LD dependen de la ejecución de JS. Google suele ejecutar JS, pero la indexación puede ser más lenta y el riesgo de contenido "thin" es mayor. El prerender opcional mitiga esto para las rutas incluidas en el script.

**Resumen 10:** Prerender opcional implementado. Sin ejecutarlo, el sitio sigue siendo SPA; con él, las rutas prerenderizadas tienen HTML completo (incluido schema) para crawlers.

---

## 1️⃣1️⃣ Preparación multi-ciudad

### ¿La arquitectura soporta múltiples ciudades sin cambiar el router?
**Sí.**  
- Rutas: `/:citySlug` y `/:citySlug/:segment` ya son genéricas.  
- `CityRoute` y `CitySegmentRoute` validan con `isAllowedCitySlug(citySlug)` (configuración en `src/lib/site-config.ts`: `ALLOWED_CITY_SLUGS`).  
- Actualmente `ALLOWED_CITY_SLUGS = ["rancagua"]`; cualquier otro `citySlug` redirige a `ACTIVE_CITY_SLUG`.  
- Para soportar Santiago, Talca, Temuco, Curicó, etc.: basta con añadir los slugs a `ALLOWED_CITY_SLUGS` (o leerlos de BD) y tener las ciudades en la tabla `cities` con sus datos SEO. El router no requiere cambios; el sitemap ya itera sobre ciudades activas desde Supabase.

**Resumen 11:** Implementado correctamente; solo hay que ampliar la lista de slugs permitidos y los datos en `cities`.

---

## RESULTADO FINAL

### 1. Mejoras implementadas correctamente
- Slug SEO en `escort_profiles`, generación automática y unicidad por ciudad (nombre + "-escort", duplicados con -2, -3…).
- Redirección desde `/perfil/:id` a `/:citySlug/:profileSlug` (cliente, replace).
- Ruta `/:citySlug/:segment` y resolución de perfil por slug (city_id + slug).
- Sitemap dinámico (Netlify function) con home, ciudades, rankings, filtros y perfiles (slug o /perfil/id).
- Schema de reseñas: AggregateRating y Review en JSON-LD con ratingValue y reviewCount; Person con aggregateRating.
- Páginas ranking (mejores-escorts, escorts-nuevas, escorts-recomendadas) con orden correcto, contenido SEO y meta propios.
- Generador de descripciones SEO con plantillas, 250-400 palabras, keywords locales y guardado en `escort_profiles.description`; no sobrescribe texto manual sin acción del usuario.
- Enlazado interno: "Otras escorts en {ciudad}", "Perfiles similares", "Escorts recomendadas" con listas desde Supabase y URLs SEO.
- Filtros programáticos (ej. escort-vip, escort-independiente) con páginas y contenido SEO básico.
- Prerender opcional (FASE 7) para rutas clave.
- Arquitectura multi-ciudad lista (solo ampliar slugs permitidos y datos).

### 2. Mejoras incompletas o matices
- **Slug sin ciudad:** El slug es "nombre-escort", no "nombre-escort-ciudad"; es intencional y la URL sigue siendo SEO-friendly.
- **301 real:** La redirección /perfil/:id → URL SEO es vía React; un 301 HTTP en Netlify (o función) mejoraría señales para buscadores.
- **Schema en SPA:** El JSON-LD se inyecta por React; sin prerender depende de que el crawler ejecute JS.
- **Rutas programáticas:** Existen escort-vip / escort-independiente (singular); no hay escorts-vip, escorts-independientes ni escorts-jovenes; se puede extender si se desea.
- **Preload imagen perfil:** No se usa `preloadImage` en la página de perfil para la imagen principal.

### 3. Problemas técnicos corregidos / a considerar
- **Corregido:** En `seo-description-generator.ts` la variable `count` no existía; se reemplazó por `wordCount(text)` para el piso de 250 palabras.
- **Pendiente:** Conversión automática a WebP no implementada.
- **Pendiente:** Preload de la imagen principal en ProfilePage para mejorar LCP.
- **Opcional:** Reducir tamaño de bundles (manualChunks, revisión de dependencias) para mejorar LCP y TTI.

### 4. Oportunidades SEO no aprovechadas (resumen)
- 301 HTTP desde servidor para /perfil/:id → URL canónica.
- Preload de la imagen principal del perfil (LCP).
- WebP (en subida o en entrega) para imágenes de perfil.
- Páginas "escorts jóvenes" o equivalentes si hay demanda de búsqueda.
- Slug en plural para algunas categorías (escorts-vip, etc.) si se prioriza ese naming.
- Prerender en CI (Netlify) con Chrome disponible para tener HTML estático en cada deploy.
- Optimización de chunks (manualChunks / análisis de bundle) para mejorar Core Web Vitals.

---

*Auditoría basada en el código del proyecto en el estado actual. Corrección aplicada en `src/lib/seo-description-generator.ts` (wordCount).*
