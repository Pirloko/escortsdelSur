# Optimización de rendimiento y Core Web Vitals — holacachero.cl

Objetivos de rendimiento:

- **Lighthouse Performance:** 90+
- **First Contentful Paint (FCP):** < 1,8 s
- **Largest Contentful Paint (LCP):** < 2,5 s
- **Speed Index:** < 3 s
- **SEO:** 100
- **Accesibilidad:** 100

## Medición con Lighthouse

1. **Chrome DevTools**
   - Abre el sitio en Chrome (producción o `npm run preview` tras `npm run build`).
   - F12 → pestaña **Lighthouse**.
   - Selecciona **Performance**, **SEO**, **Accessibility** (y opcionalmente Best practices).
   - Modo **Navigation** (carga completa).
   - Ejecuta el informe y revisa FCP, LCP, Speed Index y puntuaciones.

2. **PageSpeed Insights**
   - https://pagespeed.web.dev/
   - Introduce la URL de producción (ej. `https://holacachero.cl`).
   - Revisa métricas de campo (si hay datos de usuarios reales) y de laboratorio.

3. **Web Vitals en producción**
   - Considera registrar `web-vitals` (FCP, LCP, INP, CLS) y enviarlos a analytics para monitorear a usuarios reales.

## Cambios implementados

### Fase 1 — Imágenes y WebP
- **WatermarkedImage:** `loading="lazy"` por defecto; prop `priority` para la primera imagen above the fold (LCP) con `fetchPriority="high"` y `loading="eager"`.
- **WebP automático:** Uso de `<picture>` con `<source type="image/webp">` y `<img>` de fallback. Si se pasa `webpSrc` se usa; si no, se deriva de `src` reemplazando `.jpg`/`.png` por `.webp`. Reduce peso de imagen ~40–70% cuando el navegador soporta WebP.
- **Variantes de tamaño:** `variant="thumbnail"` (300px), `variant="profile"` (600px), `variant="full"` (1200px); atributo `sizes` y opcional `srcSet` para responsive. Helper `buildSrcSetWithWidth(baseUrl)` para CDN con parámetro `?width=`.
- **Placeholder blur:** Prop `placeholder` (URL o data URL de miniatura ~20px). Se muestra borroso de fondo y la imagen final hace transición de opacidad al cargar (mejora LCP percibido).
- **Logos hero (AgeGate, HeroSection):** `fetchPriority="high"`, `loading="eager"`, `decoding="async"`.
- **Imagen hero ciudad (CityPage):** `fetchPriority="high"`, `decoding="async"`.

### Fase 2 — React.lazy
- **GalleryViewerModal:** carga diferida en CityPage (Suspense).
- **ReviewExperienceForm y ReviewExperienceCard:** carga diferida en ProfilePage (Suspense).

### Fase 3 — Code splitting por rutas
- **Index, CityRoute, CitySegmentRoute:** cargados con `React.lazy()` para que cada ruta principal tenga su propio chunk (home, ciudad, segmento de ciudad).

### Fase 4 y 8 — Preload y LCP
- **index.html:** preload del logo principal (LCP): `/HolaCachero.png` y `/HolaCachero01.png` con `<link rel="preload" as="image">`.
- **Preload dinámico en ciudad:** En CityPage se inyecta `<link rel="preload" as="image">` para la primera imagen de perfil visible, mejorando LCP cuando el LCP es esa imagen.

### Fase 5 — Scripts secundarios
- **Google Analytics (gtag):** se inyecta y configura después del evento `load` de la ventana, para no competir con el contenido crítico (FCP/LCP).

### Fase 7 — Cache estático (Netlify)
- **netlify.toml:** headers `Cache-Control: public, max-age=31536000, immutable` para:
  - `/assets/*` (JS/CSS con hash)
  - `/*.png`, `/*.jpg`, `/*.jpeg`, `/*.webp`, `/*.css`, `/*.js`

### Fase 9 — Prerender
- El proyecto ya incluye **prerender** opcional:
  - Script: `scripts/generate-prerender-routes.mjs` (genera `prerender-routes.json`).
  - Comando: `npm run build:prerender` (o `npm run build:prod`).
  - Rutas SEO principales (ej. `/rancagua`, `/rancagua/escorts-vip`, `/rancagua/masajes-eroticos`, `/rancagua/escort-rubia`, `/rancagua/escort-milf`, rankings, filtros) se generan en el script.
- **En Netlify:** usar como comando de build `npm run build:prerender` para que las páginas SEO clave se sirvan con HTML estático (mejor SEO e indexación).

### Fase 10 — Fuentes
- Google Fonts se cargan con `display=swap` en `index.css` para evitar bloqueo de texto visible.

### Imágenes Supabase CDN (Image Transformations)
- **src/lib/supabase-image.ts:** Utilidad para URLs de Supabase Storage. Convierte `object/public` → `render/image/public` con `width` y `quality`. Variantes: thumbnail (300, 70), profile (600, 75), full (1200, 80). `getSupabaseImageSrcSet()` genera srcSet 300w/600w/1200w.
- **WatermarkedImage:** Si `src` es URL de Supabase, genera automáticamente la URL transformada y srcSet responsive. WebP lo aplica el CDN según el cliente.

### Página ciudad: scroll infinito y paginación
- **CityPage:** Primera carga **12 perfiles** (Supabase `.range(0, 11)`). Scroll infinito con **Intersection Observer**: sentinel al final de la lista; al ser visible se llama `fetchNextPage()` (sin disparar si ya está cargando). Paginación con **useInfiniteQuery** (página 0, 1, 2…). Skeleton cards mientras `isFetchingNextPage`. Orden: `promotion` asc (destacada primero), `updated_at` desc. Las primeras 12 cards están en el HTML inicial (SEO).

### Auditoría de bundle (manualChunks)
- **vite.config.ts:** `manualChunks` para separar: `framer-motion`, `recharts`, `pdf` (jspdf + html2canvas), `supabase`, `embla`, `react`, `react-dom`, `lucide`, `radix`. Objetivo: reducir el chunk inicial y acercarlo a &lt; 200 kB (revisar con `npm run build` y el reporte de Vite).

## Recomendaciones adicionales

- **Imágenes de perfiles desde Supabase:** si el almacenamiento lo permite, servir variantes redimensionadas (p. ej. 600px para perfil, 300px para miniatura) o WebP; en el cliente ya se usan `sizes` y `priority` donde corresponde.
- **Auditoría de dependencias:** ejecutar `npm run build` y revisar el análisis de bundles (ej. `vite-bundle-visualizer` o el reporte de Vite) para detectar librerías pesadas no usadas.
- **Pruebas en red lenta:** en DevTools → Network, throttling "Fast 3G" o "Slow 3G", y volver a ejecutar Lighthouse para validar FCP/LCP en condiciones adversas.
