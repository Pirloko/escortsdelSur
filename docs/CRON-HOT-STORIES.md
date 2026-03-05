# Cron diario: Historias calientes

La Edge Function **generate-hot-stories** genera **una historia por perfil** (con promoción activa) para el día actual y las guarda en la tabla `hot_stories`. Debe ejecutarse **una vez al día** (recomendado: madrugada, ej. 00:05 UTC).

## Unicidad

- **Ninguna historia se repite:** cada historia es distinta. El generador usa una semilla derivada de `profile_id + story_date`:
  - Dos perfiles distintos **nunca** tienen la misma historia el mismo día.
  - El mismo perfil tiene una historia **diferente cada día** (cambia la fecha → cambia la semilla → cambia el texto).

## Configuración en Supabase

1. **Secrets** en el proyecto Supabase (Dashboard → Edge Functions → Secrets):
   - `CRON_SECRET`: contraseña secreta que solo usará el servicio cron.

2. **Desplegar la función**:
   ```bash
   supabase functions deploy generate-hot-stories
   ```

## Llamada diaria (cron)

La URL de la función (proyecto actual) es:
```
https://cczxyoqiinpdtjrcatje.supabase.co/functions/v1/generate-hot-stories
```

Debe enviarse una petición **POST** con **dos headers** (Supabase exige autorización para aceptar la petición):

1. **Authorization:** `Bearer <TU_ANON_KEY>`  
   La anon key la ves en Supabase: **Dashboard → Settings → API → Project API keys → anon public**. También suele estar en tu `.env` como `VITE_SUPABASE_ANON_KEY`.

2. **X-Cron-Secret:** `<valor de CRON_SECRET>`  
   El mismo valor que configuraste en Edge Functions → Secrets.

Ejemplo con curl:
```bash
curl -X POST "https://cczxyoqiinpdtjrcatje.supabase.co/functions/v1/generate-hot-stories" \
  -H "Authorization: Bearer TU_ANON_KEY" \
  -H "X-Cron-Secret: TU_CRON_SECRET"
```

### Opciones para programar la llamada

1. **cron-job.org** (gratuito): crear un job que ejecute una vez al día; método POST, URL anterior. Añadir **dos** headers: `Authorization: Bearer <anon_key>` y `X-Cron-Secret: tu_secreto`.

2. **Vercel Cron** (si el front está en Vercel): en `vercel.json` puedes definir un cron que llame a una API route; la API route hace `fetch` a la URL de la función con el header.

3. **GitHub Actions**: workflow que corre a diario y hace `curl -X POST ... -H "X-Cron-Secret: ${{ secrets.CRON_SECRET }}"`.

4. **Supabase pg_cron** (si está disponible): puedes programar un job en la base que invoque una extensión HTTP o que inserte en una cola; la opción más simple suele ser un cron externo que llame por HTTP a la función.

## Respuesta correcta

Si todo va bien, la función devuelve `200` y un JSON como:
```json
{
  "success": true,
  "story_date": "2026-03-02",
  "profiles_processed": 12,
  "stories_upserted": 12
}
```

Si falta o no coincide el header `X-Cron-Secret`, devuelve `401 No autorizado`.
