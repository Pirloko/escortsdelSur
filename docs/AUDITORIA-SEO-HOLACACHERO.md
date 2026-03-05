# Auditoría SEO – holacachero.cl (FASE 1: Rancagua)

**Dominio:** holacachero.cl  
**Objetivo principal:** Posicionar para "escorts en rancagua"  
**Alcance:** Solo Rancagua, Chile. Otras ciudades preparadas pero no indexadas.

---

## 1. Resumen ejecutivo

- **Estrategia:** FASE 1 = posicionar fuerte en Rancagua; FASE 2 = expandir a otras ciudades.
- **Stack:** React, Supabase, Vercel.
- **Rutas indexables:** `/`, `/rancagua`, `/perfil/:id` (solo perfiles activos en Rancagua).
- **Rutas no indexables:** `/login`, `/registro`, `/admin`, `/cuenta`, `/mi-perfil`, `/completar-perfil`, `/cambiar-contrasena`, `/desafio-del-dia`, `/rifa` y subrutas.

---

## 2. Auditoría técnica implementada

### 2.1 Meta tags y canonical

| Página        | Title único | Meta description | Canonical | Robots     |
|--------------|-------------|------------------|-----------|------------|
| `/`          | Sí (Rancagua + Hola Cachero) | Sí | `/`       | index, follow |
| `/rancagua`  | Sí (Escorts en Rancagua…)   | Sí | `/rancagua` | index, follow |
| `/perfil/:id`| Sí (Nombre Escort en Rancagua \| Acompañante VIP) | Sí (descripción/perfil) | `/perfil/:id` | index, follow (noindex si perfil vencido) |
| Login, Cuenta, Admin, etc. | Sí | Sí | Correcto | noindex, nofollow |

- **SeoHead** (react-helmet-async): title, description, canonical, robots, Open Graph, Twitter Cards, hreflang (es-cl, x-default).
- **index.html:** fallback con título/descripción/og orientados a Rancagua y Hola Cachero; `lang="es-CL"`.

### 2.2 robots.txt

- **Dominio sitemap:** `https://holacachero.cl/sitemap.xml`
- **Allow:** `/`, `/rancagua`, `/perfil/`
- **Disallow:** `/login`, `/registro`, `/registro-cliente`, `/completar-perfil`, `/cambiar-contrasena`, `/cuenta`, `/cuenta/`, `/mi-perfil`, `/admin`, `/admin/`, `/desafio-del-dia`, `/rifa`, `/rifa/`

### 2.3 Sitemap (Vercel API)

- **Origen:** `api/sitemap.xml.js` → servido en `/sitemap.xml` vía `vercel.json`.
- **Contenido FASE 1:**
  - `/` (priority 1.0)
  - `/rancagua` (priority 0.95)
  - `/perfil/:id` solo para perfiles cuya ciudad es Rancagua y están activos (active_until null o futuro).
- **Excluidos:** admin, login, registro, perfiles expirados, otras ciudades.

### 2.4 Schema / JSON-LD

- **Home:** WebSite + Organization (nombre Hola Cachero, descripción con keywords Rancagua).
- **Ciudad (/rancagua):** BreadcrumbList, CollectionPage, ItemList (perfiles).
- **Perfil:** BreadcrumbList, Person (nombre, url, description, image).

### 2.5 Indexación controlada

- Páginas con **noindex, nofollow** y **noSocial:** Login, Registro, Registro-cliente, Completar perfil, Cambiar contraseña, Cuenta (dashboard y edición), Mi perfil, Admin (y subrutas).
- **Perfil vencido:** `robots="noindex, nofollow"` y `noSocial` en SeoHead.

### 2.6 Estructura de headings

- **/rancagua:** Un solo **H1:** "Escorts en Rancagua". **H2** en bloque SEO: "Escorts en Rancagua", "Acompañantes VIP en Rancagua", "Servicios disponibles", "Cómo contactar escorts en Rancagua", "Por qué elegir acompañantes en Rancagua". H3 para "Explora otras ciudades" (en FASE 1 Rancagua no tiene enlaces a otras ciudades).
- **Perfil:** Un solo **H1:** "{Nombre} escort en Rancagua" (para Rancagua) o "{Nombre}, {Edad}" (resto). H2 "Sobre mí", etc.

### 2.7 URLs y canonicalización

- Estructura limpia: `/{ciudad}`, `/perfil/:id`.
- Canonical sin query params; filtros (categoría, edad) no generan URLs indexables.
- **CityRoute:** Solo slug permitido FASE 1 = `rancagua`; cualquier otro redirige a `/rancagua`.

---

## 3. Contenido SEO

### 3.1 Landing /rancagua

- **H1:** "Escorts en Rancagua".
- **Contenido:** Bloque con 5 secciones H2 y texto >800 palabras (variaciones: escorts en Rancagua, escort en Rancagua, acompañantes, damas de compañía, escorts independientes/VIP/a domicilio, longtail pelinegra/tetona/culona/bajita/depilada, holacachero, servicios masajes/oral/sexo anal/tríos/juguetes/fetichismo/a domicilio/apartamento propio).
- **nearbyLinks:** Vacío en FASE 1 (no se enlaza a Talca, Chillán, etc.).

### 3.2 Perfiles (/perfil/:id)

- **Title:** "{Nombre} Escort en Rancagua | Acompañante VIP – Hola Cachero".
- **H1:** "{Nombre} escort en Rancagua" (si ciudad Rancagua).
- **Descripción, servicios incluidos/adicionales, nacionalidad, galería con alt en imágenes** (alt con nombre y ciudad o "Galería – imagen N").
- **Enlaces internos:** "Ver todos los perfiles en Rancagua", "Otros perfiles en {ciudad}".

### 3.3 Home (/)

- Título y descripción centrados en Rancagua y Hola Cachero; enlace destacado a `/rancagua`; sección "Escorts en el sur" con solo Rancagua (FASE 1).

---

## 4. Optimización React / SPA

- **react-helmet-async** para meta dinámicos (crawlers que ejecutan JS).
- **SeoHead** centralizado: sanitización de title/description/URL (sanitize-seo).
- **Preload:** SeoHead admite `preloadImage` para LCP (imagen hero ciudad).
- **Lazy loading:** Galería perfiles con `loading="lazy"` en imágenes no críticas; primera imagen con `loading="eager"` o sin lazy.
- **Code splitting:** Rutas con `lazy()` en App.tsx.

Recomendación adicional para crawlers sin JS: considerar pre-render (Vercel) o SSR para `/rancagua` y `/perfil/:id` si se detecta bajo rendimiento en Google.

---

## 5. Core Web Vitals (recomendaciones)

- **LCP:** Preload de imagen hero en CityPage; dimensiones width/height en hero para evitar CLS.
- **CLS:** Dimensiones fijas en header ciudad; reservar espacio para galería/cards.
- **Bundle:** Lazy de rutas; revisar tamaño de chunks (p. ej. Cuenta) con `build.rollupOptions.output.manualChunks` si hace falta.
- **TTFB:** Vercel + Supabase en misma región cuando sea posible.

---

## 6. Riesgos y prevención de penalizaciones

| Riesgo              | Mitigación aplicada |
|---------------------|----------------------|
| Thin content        | Rancagua 800+ palabras; perfiles con descripción + servicios + bloque de datos. |
| Keyword stuffing    | Uso natural de variaciones en párrafos; sin repetición artificial. |
| Doorway pages       | Una landing principal por ciudad (Rancagua); sin páginas intermedias duplicadas. |
| Contenido duplicado | Canonical único por URL; descripciones por perfil únicas. |
| Páginas vacías      | Perfiles no encontrados o vencidos: noindex o 404; listado ciudad con mensaje claro si 0 resultados. |
| Spam / políticas    | Contenido orientado a información de perfiles y contacto; cumplimiento Google Search Essentials. |

---

## 7. Preparación para escalado (FASE 2)

- **Estructura de URLs:** `/{ciudad}`, `/perfil/:id` ya listos; ciudades futuras: Talca, Curicó, Chillán, Concepción, Temuco (en `cities-seo-data` y BD).
- **site-config:** `ALLOWED_CITY_SLUGS` solo incluye `rancagua`; al expandir, añadir slugs y activar ciudades en BD.
- **Sitemap:** Actualmente solo Rancagua y sus perfiles; al pasar FASE 2, incluir en `api/sitemap.xml.js` las nuevas ciudades activas y sus perfiles.
- **robots.txt:** No bloquear `/talca`, etc.; la no indexación se controla por meta robots y por no incluir esas URLs en el sitemap hasta FASE 2.

---

## 8. Checklist post-despliegue

- [ ] Configurar en Vercel `VITE_SITE_URL=https://holacachero.cl` (y opcionalmente SITE_URL).
- [ ] Comprobar que `https://holacachero.cl/sitemap.xml` devuelve XML con `/`, `/rancagua` y perfiles activos Rancagua.
- [ ] Comprobar que `https://holacachero.cl/robots.txt` muestra Sitemap y Disallow correctos.
- [ ] En Google Search Console: propiedad holacachero.cl; enviar sitemap; revisar cobertura e indexación de `/rancagua` y `/perfil/*`.
- [ ] Verificar en vista previa de resultados que title/description de `/rancagua` y un perfil son los esperados.
- [ ] Revisar Core Web Vitals en PageSpeed Insights para `/` y `/rancagua`.

---

## 9. Archivos modificados / creados en esta auditoría

- `src/lib/seo-constants.ts` – SITE_URL holacachero.cl, SITE_NAME Hola Cachero
- `index.html` – Meta y og para Rancagua / Hola Cachero, lang es-CL
- `public/robots.txt` – Sitemap holacachero.cl, Disallow mi-perfil, desafio, rifa
- `api/sitemap.xml.js` – Solo Rancagua y perfiles Rancagua; SITE_URL holacachero.cl
- `src/pages/CityPage.tsx` – H1 "Escorts en Rancagua" cuando ciudad es Rancagua
- `src/lib/cities-seo-data.ts` – Rancagua: seo_sections (5 H2), 800+ palabras, nearbyLinks vacío
- `src/components/CitySeoBlock.tsx` – Render de seo_sections con H2
- `src/pages/ProfilePage.tsx` – Title/H1 optimizados Rancagua, robots noindex si perfil vencido
- `src/pages/Login.tsx`, `Registro.tsx`, `MiPerfil.tsx`, `Cuenta.tsx`, `admin/AdminLayout.tsx` – Título "Hola Cachero" y noindex ya presentes
- `docs/AUDITORIA-SEO-HOLACACHERO.md` – Este documento

---

**Objetivo final:** Que `holacachero.cl/rancagua` se posicione en Google para "escorts en rancagua" en los primeros resultados, con soporte técnico y de contenido listo para escalar a más ciudades en FASE 2.
