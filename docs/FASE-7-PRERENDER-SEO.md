# FASE 7 – Prerender para SEO

## Objetivo

Mejorar la indexación de Google (y otros crawlers) generando **HTML estático** para las páginas clave (ciudad, ranking, filtros y, opcionalmente, perfiles) sin migrar el proyecto a SSR.

## Situación actual

- **SPA puro (React + Vite):** el servidor sirve siempre `index.html` y el contenido se renderiza en el cliente.
- **Crawlers:** reciben el HTML inicial con poco contenido; el resto depende de que ejecuten JS (Google suele hacerlo, pero con límites).
- **Riesgo:** contenido crítico para SEO (títulos, meta, listados, perfiles) puede indexarse más tarde o con menor prioridad.

## Opciones evaluadas

| Opción | Descripción | Pros | Contras |
|--------|-------------|------|--------|
| **A. Prerender en build** | Generar HTML estático en `dist/` para rutas concretas durante el build (vite-plugin-prerender + Puppeteer). | HTML listo para crawlers, sin cambiar runtime. | Build más lento, más uso de memoria en CI, lista de rutas a mantener. |
| **B. Prerender on-demand** | Servir HTML pre-renderizado solo a bots (middleware/Edge + servicio tipo Prerender.io). | Rutas ilimitadas, siempre actualizado. | Infra y coste extra, configuración más compleja. |
| **C. Solo rutas estáticas** | Prerender solo home, ciudad, ranking y filtros (lista fija). | Build controlado y rápido. | Perfiles individuales siguen siendo solo SPA. |

## Decisión implementada: opción C (híbrido)

- **Prerender en build** solo para un conjunto acotado de rutas:
  - `/` (inicio)
  - `/:ciudad` (ej. `/rancagua`)
  - `/:ciudad/mejores-escorts`, `/:ciudad/escorts-nuevas`, `/:ciudad/escorts-recomendadas`
  - `/:ciudad/:filtro` (todas las páginas de filtro/categoría programáticas)
- **Perfiles** (`/:ciudad/:slug-perfil`): no se prerenderizan por defecto (muchas URLs, build muy largo). Opcionalmente se puede ampliar la lista en el script de rutas si en el futuro se quiere incluir un subconjunto.

Con esto, las páginas más importantes para SEO (landing, ciudad, rankings, filtros) quedan con HTML estático; los perfiles siguen siendo SPA pero con slugs SEO, meta tags y schema (Fases 1–2) ya implementados.

## Uso

### Build normal (sin prerender)

```bash
npm run build
```

Comportamiento actual: solo genera el SPA en `dist/`. Todas las rutas sirven `index.html`.

### Build con prerender

```bash
npm run build:prerender
```

1. Genera `prerender-routes.json` con la lista de rutas (script `scripts/generate-prerender-routes.mjs`).
2. Ejecuta `vite build` con `PRERENDER=true`.
3. Tras el build, el plugin levanta un servidor con `dist/`, visita cada ruta con Puppeteer, espera a que el contenido se renderice y guarda el HTML en:
   - `dist/index.html` → `/`
   - `dist/rancagua/index.html` → `/rancagua`
   - `dist/rancagua/mejores-escorts/index.html` → `/rancagua/mejores-escorts`
   - etc.

En Netlify (o cualquier host estático), al publicar `dist/`, las peticiones a `/rancagua`, `/rancagua/mejores-escorts`, etc. obtienen ese HTML estático; el resto de rutas siguen cayendo en el fallback SPA (`index.html`).

### Despliegue en Netlify con prerender

1. En el proyecto, **Build command:** `npm run build:prerender`.
2. **Publish directory:** `dist` (sin cambios).
3. Los redirects actuales se mantienen; Netlify sirve primero los archivos estáticos, así que `/rancagua/index.html` se sirve para `/rancagua/` y `/rancagua`.
4. Opcional: variable de entorno `PRERENDER=true` no es necesaria si siempre usas `build:prerender`.

### Tiempo de espera (renderAfterTime)

El plugin usa **renderAfterTime** (por defecto 4 s) para dar tiempo a que React y las peticiones a Supabase pinten el contenido antes de capturar el HTML. Si en el futuro quieres afinar:

- Añadir en las páginas clave un `document.dispatchEvent(new Event('prerender-ready'))` cuando los datos estén cargados.
- En la config del plugin, cambiar a `renderAfterDocumentEvent: 'prerender-ready'` y quitar o reducir `renderAfterTime`.

## Archivos implicados

- `scripts/generate-prerender-routes.mjs`: genera la lista de rutas a prerenderizar (ciudad activa + rankings + filtros).
- `vite.config.ts`: registro condicional del plugin cuando `PRERENDER=true`.
- `prerender-routes.json`: generado antes del build; no versionar si se regenera siempre en CI.

## Requisitos para que el prerender funcione

- **Chrome/Chromium:** el plugin usa Puppeteer, que necesita una instancia de Chrome. En local suele funcionar si tienes Chrome instalado. En CI (p. ej. Netlify):
  - Por defecto Puppeteer descarga su propia revisión de Chromium; si la descarga falla o hay timeout, el paso de prerender puede fallar.
  - Si el prerender falla, el build de Vite ya habrá terminado: tendrás el SPA en `dist/` y el sitio seguirá funcionando; solo no se generará HTML estático para esas rutas.
  - Para Netlify puedes probar con `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1` y un build image que incluya Chrome, o usar un build image que ya traiga Chromium (por ejemplo `node:20` con dependencias de Chrome instaladas).

## Limitaciones

- **Perfiles:** no incluidos en la lista por defecto; el build sería muy largo con cientos de URLs. Si se necesita, se puede ampliar el script para obtener slugs desde Supabase en el build y escribir más rutas.
- **Datos en build time:** el HTML prerenderizado refleja los datos de Supabase en el momento del build. Para datos muy cambiantes, el prerender sigue siendo útil para estructura, títulos y meta; el contenido dinámico se actualiza cuando el usuario ejecuta la SPA.
- **Recursos:** Puppeteer requiere más CPU/memoria en CI; en Netlify suele ser suficiente con el plan estándar.

## Resumen

FASE 7 queda cerrada con **evaluación documentada** y **implementación opcional** de prerender para las rutas estáticas y programáticas clave. No se migra a SSR; el resto del sitio sigue siendo SPA con las mejoras SEO ya aplicadas (slugs, schema, meta, sitemap).
