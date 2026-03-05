# Configurar cron de Historias calientes (paso a paso)

Para que la sección **Historias calientes** se llene cada día, hay que ejecutar una vez al día la función que genera las historias. Sigue estos pasos en orden.

---

## Paso 1: Crear el secreto en Supabase

1. Entra a [Supabase](https://supabase.com) y abre tu proyecto (**holacachero** / el que uses).
2. En el menú izquierdo: **Edge Functions** → pestaña **Secrets** (o **Settings** → **Edge Functions**).
3. Añade un secret:
   - **Name:** `CRON_SECRET`
   - **Value:** inventa una contraseña larga (ej. `miClaveSecretaCron2026`). **Guárdala**: la usarás en el Paso 4.
4. Guarda.

---

## Paso 2: Desplegar la función

1. Abre una terminal en la carpeta del proyecto:  
   `chilean-south-visuals-main`
2. Asegúrate de estar logueado en Supabase:
   ```bash
   npx supabase login
   ```
3. Enlaza el proyecto si aún no está enlazado (te pedirá el project ref; está en la URL del proyecto: `cczxyoqiinpdtjrcatje`):
   ```bash
   npx supabase link --project-ref cczxyoqiinpdtjrcatje
   ```
4. Despliega la función:
   ```bash
   npx supabase functions deploy generate-hot-stories
   ```
5. Si te pide **SUPABASE_URL** y **SUPABASE_SERVICE_ROLE_KEY**, puedes añadirlas en un `.env` en `supabase/` o pasarlas cuando te lo pida. La **service role key** está en: Dashboard → **Settings** → **API** → **service_role** (secret).

---

## Paso 3: Probar la función a mano

Así compruebas que todo funciona antes de programar el cron.

1. En Supabase: **Settings** → **API**. Copia:
   - **Project URL** (ej. `https://cczxyoqiinpdtjrcatje.supabase.co`)
   - **anon public** (Project API keys)

2. En la terminal ejecuta (sustituye `TU_ANON_KEY` y `TU_CRON_SECRET` por los valores reales):

   ```bash
   curl -X POST "https://cczxyoqiinpdtjrcatje.supabase.co/functions/v1/generate-hot-stories" \
     -H "Authorization: Bearer TU_ANON_KEY" \
     -H "X-Cron-Secret: TU_CRON_SECRET"
   ```

3. Deberías recibir un **200** y un JSON parecido a:
   ```json
   { "success": true, "story_date": "2026-03-XX", "profiles_processed": 1, "stories_upserted": 1 }
   ```
   Si recibes **401**, revisa que `CRON_SECRET` en Supabase coincida con el que usas en el header.

4. Entra en tu app, ve a la página de la ciudad (Rancagua). Deberías ver la sección **Historias calientes** con al menos una historia (si hay algún perfil con promoción activa).

---

## Paso 4: Programar la llamada diaria (cron-job.org)

Vamos a usar **cron-job.org** (gratis) para que la función se ejecute solo cada día.

1. Entra en [cron-job.org](https://cron-job.org) y crea una cuenta (o inicia sesión).

2. **Create cronjob**:
   - **Title:** `Historias calientes holacachero`
   - **Address (URL):**  
     `https://cczxyoqiinpdtjrcatje.supabase.co/functions/v1/generate-hot-stories`
   - **Request method:** **POST**
   - **Schedule:** una vez al día (ej. **Daily** a las **00:05** o a la hora que prefieras, en la zona horaria que elijas).

3. Añadir headers (en la sección de headers del cronjob):
   - Header 1:
     - **Name:** `Authorization`  
     - **Value:** `Bearer TU_ANON_KEY`  
     (sustituye `TU_ANON_KEY` por la **anon public** key de Supabase.)
   - Header 2:
     - **Name:** `X-Cron-Secret`  
     - **Value:** el mismo valor que pusiste en **Paso 1** para `CRON_SECRET`.

4. Guarda el cronjob.

5. (Opcional) Pulsa **Execute now** una vez para comprobar que la llamada desde cron-job.org también devuelve 200.

---

## Resumen

| Paso | Qué haces |
|------|-----------|
| 1 | Crear `CRON_SECRET` en Supabase (Edge Functions → Secrets). |
| 2 | `npx supabase functions deploy generate-hot-stories` en el proyecto. |
| 3 | Probar con `curl` (POST + Authorization + X-Cron-Secret). |
| 4 | Crear cron en cron-job.org: POST a la URL de la función, con los dos headers. |

A partir de ahí, cada día a la hora programada se generarán las historias para los perfiles con promoción activa y se verán en la sección **Historias calientes** de cada ciudad.
