# Arquitectura SEO programática — Hola Cachero (holacachero.cl)

## 1. Mapa de arquitectura SEO programática

```
                    INDEXACIÓN FASE 1 (solo Rancagua)
                    ─────────────────────────────────
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    │                               │                               │
    ▼                               ▼                               ▼
/rancagua                    /rancagua/[categoria]           /rancagua/[filtro]
  (ciudad)                   /rancagua/escorts                 /rancagua/pelinegras
  │                          /rancagua/acompanantes            /rancagua/tetonas
  │                          (Nivel 2)                         /rancagua/masajes
  │                                                             (Nivel 3)
  │
  └───────────────────────────────────────────────────────────────────┐
                                                                      │
                                                                      ▼
                                                            /rancagua/[profile-slug]
                                                            /rancagua/camila-escort-rancagua
                                                            (Nivel 4 — perfil)
```

- **Nivel 1:** Una página por ciudad (solo `/rancagua` indexada en Fase 1).
- **Nivel 2:** Ciudad + categoría (escorts, acompañantes).
- **Nivel 3:** Ciudad + filtro SEO (característica o servicio: pelinegras, tetonas, masajes, etc.).
- **Nivel 4:** Ciudad + slug del perfil (ej. `camila-escort-rancagua`).

Combinaciones programáticas (Fase 1): una ciudad × (1 landing + N categorías + M filtros + P perfiles).

---

## 2. Lista completa de páginas SEO a generar (Fase 1 — Rancagua)

### Nivel 1 — Ciudad
| URL | Tipo |
|-----|------|
| `/rancagua` | Landing ciudad |

### Nivel 2 — Ciudad + categoría
| URL | Tipo |
|-----|------|
| `/rancagua/escorts` | Categoría |
| `/rancagua/acompanantes` | Categoría |
| `/rancagua/damas-de-compania` | Categoría (opcional) |

### Nivel 3 — Ciudad + filtro (característica / servicio)
| URL | Tipo |
|-----|------|
| `/rancagua/pelinegras` | Filtro |
| `/rancagua/tetonas` | Filtro |
| `/rancagua/culonas` | Filtro |
| `/rancagua/bajitas` | Filtro |
| `/rancagua/depiladas` | Filtro |
| `/rancagua/a-domicilio` | Servicio |
| `/rancagua/apartamento-propio` | Servicio |
| `/rancagua/masajes` | Servicio (masajes eróticos) |
| `/rancagua/trios` | Servicio |
| `/rancagua/fetichismo` | Servicio |
| `/rancagua/atencion-parejas` | Servicio |
| **Combinaciones ciudad + categoría + filtro (opcional)** | |
| `/rancagua/escorts-pelinegras` | Categoría + filtro |
| `/rancagua/escorts-tetonas` | Categoría + filtro |
| `/rancagua/escorts-culonas` | Categoría + filtro |
| `/rancagua/escorts-a-domicilio` | Categoría + filtro |
| `/rancagua/escorts-masajes` | Categoría + filtro |
| `/rancagua/acompanantes-a-domicilio` | Categoría + filtro |

### Nivel 4 — Perfiles
| Patrón URL | Ejemplo |
|------------|---------|
| `/{citySlug}/{profileSlug}` | `/rancagua/camila-escort-rancagua` |

`profileSlug` = slug único por perfil en esa ciudad (ej. `nombre-escort-rancagua`). Se obtiene de Supabase (campo `slug` en `escort_profiles` o generado desde `name` + ciudad).

---

## 3. Estructura de carpetas React recomendada

```
src/
├── pages/
│   ├── Index.tsx                    # Home (no indexar ciudad en Fase 1 desde aquí)
│   ├── CityRoute.tsx                # Resuelve /:citySlug → CityPage o redirect
│   ├── CityPage.tsx                 # /rancagua (Nivel 1)
│   ├── CityFilterPage.tsx           # /rancagua/[filterSlug] (Nivel 2 y 3)
│   ├── CityProfilePage.tsx          # /rancagua/[profileSlug] (Nivel 4)
│   ├── ProfilePage.tsx              # /perfil/:id (legacy; redirect o canonical a /city/slug)
│   └── ...
├── lib/
│   ├── site-config.ts               # ACTIVE_CITY_SLUG, ALLOWED_CITY_SLUGS
│   ├── seo-programmatic.ts          # Slugs de filtros, categorías, generación URLs
│   ├── cities-seo-data.ts           # Títulos, meta, contenido por ciudad
│   ├── seo-filter-data.ts            # Títulos, meta, H1 por filtro (nuevo)
│   └── supabase.ts
├── components/
│   ├── SeoHead.tsx
│   ├── JsonLd.tsx                   # Schema ciudad, perfil, breadcrumb
│   └── ...
└── routes/
    └── (las rutas se definen en App.tsx; no hace falta carpeta routes si se usa React Router)
```

Rutas en `App.tsx`:

- `/:citySlug` → CityPage (solo si ciudad permitida).
- `/:citySlug/:segment` → componente que resuelve: si `segment` es un **filtro/categoría** conocido → CityFilterPage; si no → CityProfilePage (perfil por slug).

---

## 4. Sistema dinámico para generar páginas desde Supabase

### 4.1 Datos necesarios en Supabase

| Tabla | Uso para SEO |
|-------|----------------------|
| `cities` | slug, name, is_active, meta_robots. Solo ciudades con `is_active` y sin noindex se consideran. |
| `escort_profiles` | id, city_id, name, slug (nuevo), available, services_included, services_extra, badge, … Para listar por ciudad y por filtro y para URLs de perfil. |
| Opcional: `seo_filters` o config estática | slug (pelinegras, tetonas, …), label, tipo (característica | servicio). |

### 4.2 Generación de slugs de perfil

- **Opción A:** Columna `slug` en `escort_profiles` (ej. `camila-escort-rancagua`). Se rellena al crear/editar perfil (normalizar nombre + ciudad).
- **Opción B:** Slug generado en app: `slugify(profile.name) + '-escort-' + citySlug`. Resolución: buscar por `city_id` + slug generado o por slug almacenado.

Recomendación: **Opción A** para unicidad y control (evitar colisiones).

### 4.3 Resolución dinámica en front (React)

- **Ciudad:** `useParams().citySlug` → validar con `ALLOWED_CITY_SLUGS` / `cities` en Supabase.
- **Segmento:** `useParams().segment`:
  - Si `segment` está en lista de **filter slugs** (pelinegras, tetonas, escorts, masajes, …) → renderizar **CityFilterPage** con datos de Supabase (perfiles filtrados por ciudad + servicio/característica).
  - Si no → tratar como **profile slug** → `CityProfilePage`: buscar en Supabase `escort_profiles` por `city_id` (de ciudad) + `slug = segment` (o por slug generado). 404 si no existe.

### 4.4 Filtros y servicios en Supabase

- **Características (long-tail):** mapear a tags o a búsqueda en descripción/nombre. Ej.: slug `pelinegras` → perfiles que tengan tag o texto “pelinegra”.
- **Servicios:** ya existen `services_included` y `services_extra` (arrays). Mapeo slug → valor:
  - `masajes` → "masajes eroticos" o similar en `services_included`
  - `a-domicilio` → "a domicilio"
  - `trios` → "trios"
  - `fetichismo` → "fetichismo"
  - `atencion-parejas` → "atencion a parejas"

Un mismo perfil puede aparecer en varias páginas de filtro si cumple el criterio.

---

## 5. Templates SEO por tipo de página

### 5.1 Página de ciudad (Nivel 1) — ej. `/rancagua`

| Campo | Contenido |
|-------|-----------|
| **TITLE** | Escorts en Rancagua \| Acompañantes en Rancagua \| Hola Cachero |
| **META DESCRIPTION** | 150–160 caracteres con keywords: escorts en Rancagua, acompañantes, damas de compañía, sexo en Rancagua. |
| **H1** | Escorts en Rancagua |
| **H2** | Escorts en Rancagua / Acompañantes VIP / Servicios disponibles / Cómo contactar / Por qué elegir… (según `cities-seo-data`) |
| **Contenido SEO** | Mínimo 800 palabras (ya en `cities-seo-data.ts`). |
| **Schema** | LocalBusiness o ItemList + BreadcrumbList. |

### 5.2 Página de filtro (Nivel 3) — ej. `/rancagua/pelinegras`

| Campo | Contenido |
|-------|-----------|
| **TITLE** | Escorts Pelinegras en Rancagua \| Acompañantes \| Hola Cachero |
| **META DESCRIPTION** | Escorts pelinegras en Rancagua. Perfiles con fotos y contacto. [~155 caracteres] |
| **H1** | Escorts Pelinegras en Rancagua |
| **H2** | Perfiles pelinegras en Rancagua / Cómo contactar |
| **Contenido SEO** | 300–500 palabras (párrafo intro + listado de perfiles con enlaces internos). |
| **Schema** | ItemList (lista de perfiles) + BreadcrumbList. |

### 5.3 Página de perfil (Nivel 4) — ej. `/rancagua/camila-escort-rancagua`

| Campo | Contenido |
|-------|-----------|
| **TITLE** | Camila Escort en Rancagua \| Acompañante \| Hola Cachero |
| **META DESCRIPTION** | Camila, escort en Rancagua. [Edad], [servicios]. Contacto y galería. [~155 caracteres] |
| **H1** | Camila escort en Rancagua |
| **H2** | Sobre Camila / Servicios / Galería / Contacto / Otros perfiles en Rancagua |
| **Contenido SEO** | Mínimo 400 palabras (descripción + servicios + ciudad). |
| **Schema** | Person o LocalBusiness + BreadcrumbList. |

---

## 6. Estrategia de linking interno

- **Desde ciudad (`/rancagua`):** enlaces a filtros principales (pelinegras, tetonas, a-domicilio, masajes, etc.) y a categorías (escorts, acompañantes). Enlace a “Ver todos los perfiles” (misma URL o `/rancagua/escorts`).
- **Desde filtros (`/rancagua/pelinegras`):** enlaces a ciudad (`/rancagua`), a otros filtros relacionados, y a cada perfil listado (URL canónica `/rancagua/slug-perfil`).
- **Desde perfil:** breadcrumb Ciudad → [Filtro opcional] → Perfil. Enlaces “Volver a Rancagua”, “Otros perfiles en Rancagua”, y si aplica “Más escorts pelinegras en Rancagua”.
- **Desde listados:** cada tarjeta de perfil debe enlazar a la URL canónica SEO (`/rancagua/camila-escort-rancagua`), no solo a `/perfil/:id`.

Regla: cada página indexable debe tener al menos 2–3 enlaces internos relevantes (ciudad, filtros, perfiles).

---

## 7. Sitemap dinámico

- **Origen:** generado por API (Vercel serverless) o por script build que lee Supabase.
- **URLs a incluir:**
  - `https://holacachero.cl/` (home)
  - `https://holacachero.cl/rancagua`
  - Todas las URLs de filtro/categoría de Rancagua: `/rancagua/escorts`, `/rancagua/pelinegras`, …
  - Todas las URLs de perfiles activos de Rancagua: `/rancagua/{profileSlug}`.
- **Frecuencia:** `weekly` para ciudad y filtros, `weekly` o `daily` para perfiles.
- **Prioridad:** home 1.0, ciudad 0.9, filtros 0.8, perfiles 0.7.

Estructura ejemplo:

```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://holacachero.cl/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>https://holacachero.cl/rancagua</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://holacachero.cl/rancagua/escorts</loc>...</url>
  <url><loc>https://holacachero.cl/rancagua/pelinegras</loc>...</url>
  …
  <url><loc>https://holacachero.cl/rancagua/camila-escort-rancagua</loc>...</url>
</urlset>
```

Si se superan ~50.000 URLs, dividir en sitemap index + varios sitemaps (ciudades, filtros, perfiles por ciudad).

---

## 8. Indexación controlada (robots y meta)

- **Indexar:** `/`, `/rancagua`, `/rancagua/*`, `/rifa`, `/rifa/terminos`, términos/privacidad si se desea.
- **No indexar:** `/admin`, `/admin/*`, `/login`, `/registro`, `/registro-cliente`, `/cuenta`, `/cuenta/*`, `/mi-perfil`, `/desafio-del-dia`, `/completar-perfil`, `/cambiar-contrasena`.

Implementación:

- **robots.txt:** `Allow: /rancagua`, `Allow: /rancagua/`, `Allow: /perfil/` (si se mantiene legacy); `Disallow: /admin`, `Disallow: /login`, etc. `Sitemap: https://holacachero.cl/sitemap.xml`.
- **Meta robots:** en cada página no indexable: `<meta name="robots" content="noindex, nofollow">` (o solo noindex). En páginas de ciudad/filtro/perfil: no poner noindex (indexación permitida).

---

## 9. Preparación para escalar ciudades

- Mantener **lista de slugs de ciudad** (Rancagua, Talca, Curicó, Chillán, Concepción, Temuco, Santiago) en config o en `cities` (Supabase).
- **Fase 1:** solo Rancagua en `ALLOWED_CITY_SLUGS` y solo Rancagua con `meta_robots` indexable; el resto de ciudades pueden existir en BD con `is_active = false` o `meta_robots = noindex`.
- **Fase 2:** activar ciudades una a una: poner `is_active = true` y quitar noindex; añadir slug a `ALLOWED_CITY_SLUGS`; regenerar sitemap con esas URLs; mismo esquema de URLs: `/{citySlug}`, `/{citySlug}/{filterSlug}`, `/{citySlug}/{profileSlug}`.
- Contenido SEO por ciudad: ya existe estructura en `cities-seo-data.ts`; añadir bloques para Talca, Chillán, etc. cuando se activen.
- Filtros y categorías son los mismos para todas las ciudades; solo cambia el `city_id` en las consultas.

---

## 10. Resumen de entregables en código

1. **Lista de páginas SEO** → definida en este doc y en `lib/seo-programmatic.ts` (slugs de filtros/categorías y helper de URLs).
2. **Estructura de carpetas React** → ya existente; añadir `CityFilterPage`, `CityProfilePage` y rutas `/:citySlug/:segment`.
3. **Sistema dinámico** → resolución en un solo componente o en rutas: por `segment` decidir filtro vs perfil; datos desde Supabase (cities, escort_profiles con slug, servicios/características).
4. **Templates SEO** → reutilizar `SeoHead` + bloques de contenido en CityPage, CityFilterPage, CityProfilePage; títulos/descripciones desde `cities-seo-data` y `seo-filter-data`.
5. **Linking interno** → enlaces en CityPage, CityFilterPage y CityProfilePage como se detalla en la sección 6.
6. **Sitemap** → endpoint o script que genera XML con ciudades permitidas, filtros y perfiles activos.
7. **Indexación** → robots.txt y meta robots en rutas no indexables; solo Rancagua indexada en Fase 1.

Con esta base se puede escalar a miles de URLs (ciudades × filtros × perfiles) manteniendo la misma arquitectura y solo activando nuevas ciudades y contenido en Supabase.

---

## 11. Ejemplos de código para implementar

### 11.1 Resolver segmento (filtro vs perfil) en React Router

En `App.tsx` una ruta `/:citySlug/:segment` debe renderizar un componente que decide:

```tsx
// Ejemplo: componente que decide si segment es filtro o perfil
import { useParams, Navigate } from "react-router-dom";
import { isAllowedCitySlug } from "@/lib/site-config";
import { isFilterOrCategorySegment } from "@/lib/seo-programmatic";
import CityFilterPage from "@/pages/CityFilterPage";
import CityProfilePage from "@/pages/CityProfilePage";

export function CitySegmentRoute() {
  const { citySlug, segment } = useParams<{ citySlug: string; segment: string }>();
  if (!citySlug || !segment || !isAllowedCitySlug(citySlug)) {
    return <Navigate to={`/rancagua`} replace />;
  }
  if (isFilterOrCategorySegment(segment)) {
    return <CityFilterPage />;
  }
  return <CityProfilePage />; // segment = profile slug
}
```

### 11.2 Uso de datos SEO de filtro

```ts
import { getFilterSeo } from "@/lib/seo-filter-data";

const { title, description, h1 } = getFilterSeo("rancagua", "pelinegras");
// title: "Escorts pelinegras en Rancagua | Acompañantes | Hola Cachero"
// h1: "Escorts pelinegras en Rancagua"
```

### 11.3 Generar enlaces internos (linking)

```ts
import { cityUrl, filterUrl, profileSeoUrl } from "@/lib/seo-programmatic";

const linkCiudad = cityUrl("rancagua");           // "/rancagua"
const linkFiltro = filterUrl("rancagua", "pelinegras"); // "/rancagua/pelinegras"
const linkPerfil = profileSeoUrl("rancagua", "camila-escort-rancagua"); // "/rancagua/camila-escort-rancagua"
```

### 11.4 Consulta Supabase para perfiles por filtro (servicio)

```ts
import { SERVICE_SLUG_TO_TERMS } from "@/lib/seo-programmatic";

// Para slug "masajes", buscar perfiles con services_included o services_extra que contengan los términos
const terms = SERVICE_SLUG_TO_TERMS["masajes"] ?? []; // ["masajes eroticos", "masajes", ...]
// Query: .or(terms.map(t => `services_included.cs.{"${t}"}`).join(","))
// o filtrar en cliente si Supabase no soporta búsqueda en array por substring.
```

Los archivos creados en el proyecto son:

- `docs/SEO-ARQUITECTURA-PROGRAMATICA.md` — este documento.
- `src/lib/seo-programmatic.ts` — slugs de filtros/categorías, helpers de URL, mapeos servicio/característica.
- `src/lib/seo-filter-data.ts` — título, meta description y H1 por filtro y ciudad.
- `api/sitemap.xml.js` — actualizado con todas las URLs de filtro para Rancagua y perfiles (por ahora `/perfil/:id`).
- `public/robots.txt` — añadido `Allow: /rancagua/` para indexar páginas de filtro.
