# Auditoría SEO piramidal – holacachero.cl

**Proyecto:** Hola Cachero (directorio de escorts, foco Rancagua)  
**Alcance:** Arquitectura piramidal con 100+ páginas programáticas  
**Fecha:** Post-implementación

---

## 1️⃣ Verificación de arquitectura piramidal

### Estructura esperada vs implementada

| Nivel        | Esperado              | Implementado                                                                 | Estado |
|-------------|------------------------|-------------------------------------------------------------------------------|--------|
| Hub ciudad  | `/rancagua`            | `/:citySlug` → `CityRoute` → `CityPage`                                     | ✅     |
| Categoría   | `/rancagua/categoria`  | `/:citySlug/:segment` → ranking o filtro (ej. `/rancagua/mejores-escorts`, `/rancagua/escorts-vip`) | ✅     |
| Servicio    | `/rancagua/servicio`   | `/:citySlug/:segment` (ej. `/rancagua/masajes-eroticos`)                     | ✅     |
| Atributo    | `/rancagua/atributo`   | `/:citySlug/:segment` (ej. `/rancagua/escort-rubia`)                         | ✅     |
| Zona        | `/rancagua/zona`       | `/:citySlug/:segment` (ej. `/rancagua/escorts-centro`)                       | ✅     |
| Perfil      | `/rancagua/perfil`     | `/:citySlug/:segment` cuando `segment` no es filtro/ranking → `ProfilePage` (ej. `/rancagua/camila-escort`) | ✅     |

### Rutas React

- **`App.tsx`:**  
  - `Route path="/:citySlug"` → `CityRoute` (hub).  
  - `Route path="/:citySlug/:segment"` → `CitySegmentRoute` (única ruta dinámica para categoría/servicio/atributo/zona/perfil).
- **`CitySegmentRoute.tsx`:**  
  1. Si `segment` es ranking → `CityRankingPage`.  
  2. Si `segment` está en `FILTER_AND_CATEGORY_SET` (incluye todos los slugs piramidales vía `getAllPyramidalSlugs()`) → `CityFilterPage`.  
  3. En caso contrario → `ProfilePage` (slug de perfil).

### Generación dinámica

- **Una sola ruta:** `/:citySlug/:segment`. No hay rutas separadas por tipo (categoría/servicio/atributo/zona).
- El tipo de página se deduce por el valor de `segment` y los conjuntos en `seo-programmatic.ts` y `seo-pyramidal.ts`.
- Meta (title, description, h1) y contenido SEO se generan en función del slug: `getFilterSeo()` / `getPyramidalSeo()` y `getFilterSeoContent()`.

### Consistencia de slugs

- Slugs definidos en un solo lugar: `seo-pyramidal.ts` (PIRAMIDAL_CATEGORY_SLUGS, PIRAMIDAL_SERVICE_SLUGS, PIRAMIDAL_ATTRIBUTE_SLUGS, PIRAMIDAL_ZONE_SLUGS).
- Mismos slugs usados en: router (vía `getAllPyramidalSlugs()` en FILTER_AND_CATEGORY_SET), filtrado de perfiles (`seo-profiles.ts`), sitemap (listas en `netlify/functions/sitemap.js`) y prerender (`scripts/generate-prerender-routes.mjs`).
- **Inconsistencia menor:** En el sitemap de Netlify los slugs piramidales están duplicados en un array local (PIRAMIDAL_*) en lugar de importar desde un módulo compartido; si se añade un slug nuevo en `seo-pyramidal.ts` hay que añadirlo también en el sitemap para no desincronizar.

### Escalabilidad multi-ciudad

- **Sí, es escalable.**  
  - Todas las URLs son `/:citySlug/:segment`; no hay ciudad fija en el código de rutas.  
  - `site-config.ts` define `ALLOWED_CITY_SLUGS` (hoy solo `["rancagua"]`). Para Santiago, Talca, Temuco, Antofagasta, etc., basta con ampliar ese array (o cargarlo desde BD) y tener las ciudades en la tabla `cities`.  
  - `getPyramidalSeo()`, `getFilterSeo()`, filtros y sitemap usan `citySlug`/`cityName`; no hay lógica atada solo a Rancagua en la arquitectura de URLs.  
- **Limitación:** El texto SEO piramidal en `seo-filter-content.ts` usa “Región de O'Higgins” en la plantilla genérica; para otras regiones convendría parametrizar o usar contenido por ciudad/región.

---

## 2️⃣ Conteo real de páginas SEO

Conteo según definiciones en código (`seo-pyramidal.ts` + `seo-programmatic.ts` + sitemap).

| Tipo        | Cantidad | Detalle |
|------------|----------|--------|
| **Ciudad** | 1        | Hub por ciudad activa (ej. `/rancagua`). Con una ciudad activa = 1 página. |
| **Categorías** | 8  | mejores-escorts, escorts-nuevas, escorts-recomendadas, escorts-vip, escorts-independientes, escorts-premium, escorts-verificadas, escorts-disponibles. Las 3 primeras son ranking; las 5 restantes son filtro por badge/descripción. |
| **Servicios** | 40 | PIRAMIDAL_SERVICE_SLUGS (masajes-eroticos, sexo-anal, oral-sin-condon, trios, masaje-tantrico, etc.). |
| **Atributos** | 41 | PIRAMIDAL_ATTRIBUTE_SLUGS (escort-rubia, escort-pelinegra, escort-tetona, escort-milf, escort-curvy, etc.). |
| **Zonas**  | 20 | PIRAMIDAL_ZONE_SLUGS (escorts-centro, escorts-machali, escorts-parque-koke, etc.). |
| **Total páginas SEO (segmentos)** | **110** | 8 + 40 + 41 + 20 + 1 ciudad. Sin contar filtros “clásicos” (escorts, acompanantes, pelinegras, etc.). |

**Páginas adicionales (filtros no piramidales):**  
- Ranking: 3 (ya contadas en categorías).  
- Filtros/categorías antiguos: escorts, acompanantes, damas-de-compania, sexo, sexosur, skokka, scort, pelinegras, tetonas, culonas, bajitas, depiladas, escort-pelinegra, escort-tetona, etc., y combinaciones (escorts-pelinegras, etc.). Suman varias decenas más por ciudad.  
- **Total con filtros clásicos y pirámide:** 1 (ciudad) + 3 (ranking) + 43 (FILTER_SLUGS + combos) + 5 (categorías piramidales extra) + 40 (servicios) + 40 (atributos) + 20 (zonas) ≈ **152 URLs de segmento por ciudad** (sin contar perfiles).

**Categorías esperadas:** Las 8 categorías solicitadas (mejores, nuevas, recomendadas, vip, independientes, premium, verificadas, disponibles) están implementadas. No falta ninguna a nivel de definición de slugs.

---

## 3️⃣ Verificación de páginas de servicios

Rutas comprobadas en código: `/rancagua/masajes-eroticos`, `/rancagua/sexo-anal`, `/rancagua/oral-sin-condon`, `/rancagua/trios`, `/rancagua/masaje-tantrico`.

- **Carga de perfiles filtrados:**  
  - `CityFilterPage` usa `fetchProfilesByCityIdForFilterPage(cityId)` y luego `filterProfilesBySegment(profiles, segmentLower)`.  
  - Para servicios se usan `SERVICE_SLUG_TO_TERMS` y `PIRAMIDAL_SERVICE_TERMS`: coincidencia por `services_included`, `services_extra` y/o `description`.  
  - **Correcto:** Los perfiles que coinciden con los términos del servicio se muestran en la lista.

- **Contenido SEO:**  
  - Todas las páginas de segmento (incluidas servicios) tienen: H1 (`seo.h1`), breadcrumb, varias secciones H2 con párrafos generados por `getFilterSeoContent()`.  
  - Para slugs piramidales se usa la plantilla genérica de 3 secciones (aprox. 6 párrafos).

- **Meta title único:**  
  - `getPyramidalSeo()` / `getFilterSeo()` construyen el title con `{label} en {cityName} | ...`.  
  - Cada slug tiene un `label` distinto, por lo que el title es único por página.

- **Meta description:**  
  - Se genera por slug y ciudad; descripción única por tipo de página (y por slug).

- **Riesgo de thin content:**  
  - Plantilla piramidal: 3 secciones × 2 párrafos = 6 párrafos; estimado ~250–400 palabras.  
  - Para Google, 300+ palabras suele considerarse mínimo razonable; el contenido está en el límite.  
  - **Problema:** La plantilla es la misma para todos los slugs piramidales (solo cambia `labelPlural`/`labelShort` y `cityName`). No hay párrafos específicos por servicio (p. ej. “masajes eróticos en Rancagua” con contexto propio), por lo que el contenido es genérico y repetitivo entre páginas de servicios.

---

## 4️⃣ Verificación de páginas de atributos

Rutas: `/rancagua/escort-rubia`, `/rancagua/escort-tetona`, `/rancagua/escort-milf`, `/rancagua/escort-curvy`.

- **Filtros:**  
  - En `filterProfilesBySegment()` se usan `FEATURE_SLUG_TO_TERMS` (slugs antiguos) y `PIRAMIDAL_ATTRIBUTE_TERMS` (piramidales).  
  - Coincidencia por `description` y/o `badge` (incluye variantes: rubia, pelo negro, busty, etc.).  
  - **Comportamiento:** Correcto; los perfiles que mencionan el atributo en descripción o badge se listan.

- **Perfiles “correctos”:**  
  - Depende de que los perfiles tengan en `description` o `badge` los términos definidos. Si nadie escribe “rubia” o “curvy”, la página puede quedar vacía pero el filtro funciona.  
  - No hay campo estructurado “color de pelo” o “tipo de cuerpo”; todo se infiere por texto. Es coherente con el modelo de datos actual.

---

## 5️⃣ Verificación de páginas por zona

Rutas: `/rancagua/escorts-centro`, `/rancagua/escorts-machali`, `/rancagua/escorts-parque-koke`.

- **Existencia:**  
  - Los 20 slugs de `PIRAMIDAL_ZONE_SLUGS` están en `FILTER_AND_CATEGORY_SET` y en el sitemap; las rutas existen y abren `CityFilterPage`.

- **Contenido SEO:**  
  - Mismo sistema que servicios/atributos: meta desde `getPyramidalSeo()`, contenido desde `getFilterSeoContent()` (plantilla genérica con nombre de zona y ciudad).

- **Perfiles de la zona:**  
  - Filtro por campo `zone` de `escort_profiles` usando `PIRAMIDAL_ZONE_MATCH` (ej. “centro”, “machalí”, “parque koke”).  
  - Si `zone` está vacío o no coincide con los términos definidos, la página puede mostrar 0 resultados.  
  - **Riesgo:** Que muchos perfiles no tengan `zone` rellenado, dando muchas páginas de zona vacías (thin + mala UX).

---

## 6️⃣ Contenido SEO programático

- **Generador dinámico:**  
  - Sí: `getFilterSeoContent(cityName, filterSlug, labelPlural, labelShort)` en `seo-filter-content.ts`.  
  - Para slugs piramidales se usa un único bloque condicional que devuelve 3 secciones con 2 párrafos cada una.

- **Plantillas:**  
  - Una sola plantilla para toda la pirámide (categorías, servicios, atributos, zonas).  
  - Las páginas no piramidales (intención, categorías antiguas) tienen plantillas propias (varias secciones con más variación).  
  - En la práctica: 1 plantilla genérica para 109 páginas piramidales.

- **Evitar duplicado:**  
  - No hay aleatoriedad ni rotación de frases; mismo esquema de texto para todas las páginas piramidales, cambiando solo `labelPlural`, `labelShort` y `cityName`.  
  - **Conclusión:** El contenido es muy parecido entre páginas; Google puede considerarlo duplicado o de baja diferenciación.

- **Keywords locales:**  
  - Sí: en los párrafos aparecen “en ${cityName}”, “acompañantes en ${cityName}”, “escorts en ${cityName}”, “escort en ${cityName}”, “Hola Cachero”, “perfil de escort en ${cityName}`.  
  - Cubre “escort en rancagua”, “escorts rancagua”, “acompañantes rancagua” de forma genérica.

- **Riesgo contenido repetitivo:**  
  - Alto. Misma estructura y frases muy similares en 109 URLs; solo cambian 2–3 palabras (el label). Recomendable: más variación por tipo (servicio vs atributo vs zona), párrafos específicos por slug y/o bloques rotatorios con frases distintas.

---

## 7️⃣ Enlazado interno

- **Página de servicio/atributo/zona → perfiles:**  
  - `CityFilterPage` muestra una rejilla de `ProfileCard` con enlace a `getProfileUrl(p, citySlug)` (URL canónica del perfil).  
  - Correcto.

- **Perfiles → otras escorts en Rancagua:**  
  - En `ProfilePage`: sección “Otras escorts en {ciudad}” con hasta 6 perfiles y enlace a la ciudad (`/${citySlug}`).  
  - “Perfiles similares” y “Escorts recomendadas” con enlaces a perfiles y a `/${citySlug}/mejores-escorts` y `/${citySlug}/escorts-recomendadas`.  
  - Correcto.

- **Hub ciudad → categorías/servicios/zonas:**  
  - `CitySeoBlock` (solo para `citySlug === "rancagua"`) muestra enlaces a categorías (8), muestra de servicios (12) y muestra de zonas (12).  
  - Correcto.

- **Página de filtro/piramidal → otras páginas:**  
  - “Explora más en {ciudad}”: enlace a “Ver todos los perfiles” (hub) y hasta 10 `internalLinks` obtenidos de `getFilterUrlsForCity(citySlug)`, que incluye todos los filtros y slugs piramidales (sin orden específico; se muestran 10).  
  - No se priorizan enlaces a “misma familia” (ej. desde un servicio no se destacan otros servicios).  
  - **Valoración:** Enlazado interno correcto y presente; se podría reforzar enlazando más páginas por tipo (más servicios desde una página de servicio, o sección “Otros servicios en Rancagua”) y aumentando el número de enlaces internos por página.

---

## 8️⃣ Sitemap SEO

- **Incluye:**  
  - `/` (home).  
  - `/:citySlug` (ej. `/rancagua`).  
  - Por ciudad: RANKING_SLUGS (3), FILTER_SLUGS (~43), ALL_PIRAMIDAL_SLUGS (5 + 40 + 40 + 20 = 105).  
  - Perfiles: `/{citySlug}/{profile.slug}` o `/perfil/{id}` si no hay slug.

- **No existen como URLs:**  
  - `/rancagua/servicios`, `/rancagua/atributos`, `/rancagua/zonas` (no hay páginas “índice” de servicios/atributos/zonas; sí hay muchas URLs concretas como `/rancagua/masajes-eroticos`, `/rancagua/escort-rubia`, etc.).  
  - Los perfiles no están bajo una ruta literal “/perfiles”; están en `/:citySlug/:profileSlug`.

- **Conteo aproximado de URLs en sitemap (1 ciudad):**  
  - 1 home + 1 ciudad + 3 ranking + 43 filter + 105 piramidal = 153 URLs de segmento + N perfiles.  
  - Total: 154 + N (perfiles).

---

## 9️⃣ Indexabilidad en SPA

- **Prerender:**  
  - Implementado de forma opcional (FASE 7): `npm run build:prerender`, `vite-plugin-prerender`, lista de rutas en `prerender-routes.json` (generada por `generate-prerender-routes.mjs`), que incluye hub, ranking, filtros y slugs piramidales.  
  - No está activado por defecto en el build; depende de que en CI se use `build:prerender` y de que Puppeteer/Chrome esté disponible.

- **Indexación por Google:**  
  - Sin prerender: la SPA sirve un único HTML; el contenido de cada URL se pinta con React. Google puede indexar si ejecuta JS, pero con posible retraso y mayor riesgo de thin/duplicate por falta de texto inicial.  
  - Con prerender: las rutas incluidas en el script tienen HTML estático con H1, párrafos y listados, lo que favorece la indexación.  
  - **Problema potencial:** Si el build en producción no ejecuta prerender, las 100+ páginas piramidales siguen siendo solo SPA; conviene asegurar prerender en el pipeline de deploy o valorar SSR/ISR para las páginas clave.

---

## 🔟 Canibalización SEO

- **Pares que compiten por intención similar:**  
  - **escorts-vip vs escort-premium:** Ambas apuntan a perfiles “premium/vip”. Los términos de filtro son: escorts-vip → ["vip", "premium"]; escort-premium → ["premium", "vip", "exclusivo"]. Muchos perfiles aparecerán en ambas.  
  - **escorts-premium vs escorts-verificadas:** Comparten “premium” y “vip” en los términos; solapamiento alto.  
  - **escort-de-lujo vs escort-premium vs escorts-vip:** Triple solapamiento (lujo, premium, vip).  
  - **escort-pelinegra vs pelinegras:** Misma idea (plural vs singular); pueden canibalizar si ambas rankean para “pelinegra(s) rancagua”.

- **Recomendación:**  
  - Diferenciar con contenido único por página (intro específica para “VIP” vs “premium” vs “de lujo”) y/o consolidar: por ejemplo, redirigir `escort-premium` a `escorts-vip` o definir criterios distintos (ej. VIP = con badge, premium = por precio).  
  - Para atributos, usar canonical o contenido más diferenciado entre plural/singular (pelinegras vs escort-pelinegra).

---

## 1️⃣1️⃣ Escalabilidad nacional

- **Sin cambios grandes en el código:**  
  - Rutas ya son `/:citySlug/:segment`; no hay ciudad hardcodeada en el router.  
  - Slugs piramidales y filtros son los mismos para cualquier ciudad.  
  - `getPyramidalSeo(citySlug, segmentSlug, cityName)` y `getFilterSeo(citySlug, filterSlug)` reciben ciudad; `getCityName()` en varios módulos permite mapear slug → nombre (Rancagua, Talca, Santiago, etc.).  
  - Sitemap y prerender iteran por `activeCities` (Supabase) o por lista; al añadir ciudades en BD y en `ALLOWED_CITY_SLUGS`, las mismas 152+ URLs por ciudad se generan para cada una.

- **Cambios necesarios para escalar:**  
  - Añadir slugs a `ALLOWED_CITY_SLUGS` (o leer de BD).  
  - Dar de alta las ciudades en la tabla `cities` con `slug`, `name`, etc.  
  - Opcional: ajustar textos que mencionan “Región de O'Higgins” para que sean por ciudad/región.  
  - Zonas: `PIRAMIDAL_ZONE_SLUGS` y `PIRAMIDAL_ZONE_MATCH` son específicos de Rancagua (Machalí, Cachapoal, etc.). Para Santiago/Talca habría que tener zonas por ciudad (ej. estructura `zone_slugs_by_city` o tabla de zonas).

---

## 1️⃣2️⃣ Oportunidades SEO adicionales

- **Páginas por edad:** No implementadas. Podrían ser `/rancagua/escorts-18-25`, `/rancagua/escorts-30-40`, etc., filtrando por campo `age` (o rango). Fácil de añadir como nuevo tipo de slug y filtro en `filterProfilesBySegment`.  
- **Páginas por nacionalidad:** Tampoco. Ya hay atributos tipo “escort-colombiana”, “escort-chilena”; si se quiere una página “Nacionalidad: Colombia” con listado, podría ser una variante o usar el atributo existente.  
- **Servicio combinado:** No hay URLs del tipo “masajes-eroticos-a-domicilio”; se podría definir un conjunto de slugs combinados (servicio + modalidad) y filtrar por intersección de términos.  
- **Páginas por precio:** No hay filtro por precio ni URLs tipo “escorts-economicas” o “escorts-premium-precio”; dependería de tener un campo de rango de precio o etiqueta en el perfil.

---

# RESULTADO FINAL

## 1. Lo que está bien implementado

- Arquitectura de URLs única `/:citySlug/:segment` para hub, categoría, servicio, atributo, zona y perfil.  
- Rutas React y resolución (ranking → filtro → perfil) correctas y coherentes con los conjuntos de slugs.  
- Conteo de páginas SEO: 1 ciudad + 8 categorías + 40 servicios + 41 atributos + 20 zonas = 110 páginas piramidales (+ filtros clásicos y perfiles).  
- Servicios, atributos y zonas: filtrado por términos/zone implementado; listados y enlaces a perfiles correctos.  
- Meta title y description únicos por página (generados por slug y ciudad).  
- Contenido SEO programático con keywords locales (ciudad, escort, acompañantes).  
- Enlazado interno: hub → categorías/servicios/zonas; filtro → hub y otras páginas; perfil → ciudad, mejores-escorts, recomendadas y otros perfiles.  
- Sitemap incluye ciudad, ranking, filtros, pirámide y perfiles; cuenta con 154+ URLs por ciudad + perfiles.  
- Prerender opcional disponible para mejorar indexación.  
- Escalabilidad multi-ciudad: solo requiere ampliar ciudades permitidas y datos; zonas por ciudad pendiente de parametrizar.

## 2. Lo que está incompleto

- Una sola plantilla de contenido para las 109 páginas piramidales; poca diferenciación y riesgo de contenido duplicado.  
- No hay páginas índice “/rancagua/servicios”, “/rancagua/atributos”, “/rancagua/zonas” (solo URLs concretas).  
- Texto genérico con “Región de O'Higgins” en plantilla piramidal; no parametrizado por ciudad/región.  
- Zonas definidas solo para Rancagua; para otras ciudades haría falta un modelo de zonas por ciudad.  
- Prerender no está activado por defecto en el build; las páginas piramidales pueden seguir siendo solo SPA en producción si no se configura el comando de build con prerender.

## 3. Errores técnicos SEO

- **Contenido muy repetitivo:** Misma estructura y frases en 109 URLs; solo cambian 2–3 palabras. Riesgo de baja calidad o duplicado para Google.  
- **Posible thin content:** ~250–400 palabras por página piramidal; en el límite del mínimo recomendable.  
- **Sitemap desincronizado:** Lista de slugs piramidales duplicada en `netlify/functions/sitemap.js`; si se añade un slug en `seo-pyramidal.ts` hay que actualizar también el sitemap.  
- **Páginas vacías:** Servicios/atributos/zonas pueden devolver 0 resultados si no hay perfiles que coincidan; se muestra “No hay perfiles que coincidan” pero la página se indexa igual (posible thin + mala señal de calidad).

## 4. Riesgos de contenido duplicado

- Plantilla única para toda la pirámide: mismo esquema de 3 secciones y frases muy similares; solo cambian label y ciudad.  
- Canibalización entre escorts-vip / escort-premium / escort-de-lujo / escorts-verificadas por solapamiento de términos y intención.  
- Posible duplicado entre slugs en plural y singular (pelinegras vs escort-pelinegra) si el contenido no se diferencia.

**Recomendaciones:**  
- Variar plantillas por tipo (servicio vs atributo vs zona) y añadir 1–2 párrafos específicos por slug o por grupo de slugs.  
- Introducir rotación de frases o bloques opcionales para que no todas las páginas tengan exactamente el mismo texto.  
- Para pares canibalizadores: contenido claramente distinto o redirección/canonical (ej. canonical de escort-premium a escorts-vip si se consolidan).

## 5. Oportunidades para multiplicar tráfico orgánico

- **Contenido único por página:** Párrafos específicos por servicio (ej. “Masajes eróticos en Rancagua” con contexto), por atributo y por zona; aumentar a 400–600 palabras donde sea posible.  
- **Páginas índice:** Añadir `/rancagua/servicios`, `/rancagua/atributos`, `/rancagua/zonas` con listados de enlaces a las páginas concretas y texto explicativo; mejoran enlazado interno y captación de búsquedas genéricas.  
- **Por edad:** Slugs tipo `escorts-18-25`, `escorts-30-40` con filtro por `age`.  
- **Por nacionalidad:** Reforzar o agrupar páginas por nacionalidad (atributos ya existentes o página índice “Nacionalidades”).  
- **Combinaciones:** Servicio + modalidad (ej. masajes-a-domicilio) para long-tail.  
- **Prerender en producción:** Activar `build:prerender` en Netlify (o equivalente) y asegurar Chrome/Puppeteer en el entorno para que las páginas piramidales se sirvan con HTML completo.  
- **Zonas por ciudad:** Modelo de zonas parametrizado por ciudad para poder replicar “escorts-centro” en Santiago, Talca, etc.  
- **Reducir canibalización:** Diferenciar o consolidar escorts-vip / escort-premium / escort-de-lujo con contenido único o canonicals.

---

*Auditoría basada en el estado del código en el repositorio. Archivos principales: App.tsx, CitySegmentRoute.tsx, CityFilterPage.tsx, seo-pyramidal.ts, seo-programmatic.ts, seo-profiles.ts, seo-filter-data.ts, seo-filter-content.ts, CitySeoBlock.tsx, netlify/functions/sitemap.js, site-config.ts, ProfilePage.tsx.*
