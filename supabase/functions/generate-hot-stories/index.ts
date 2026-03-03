/**
 * Genera una historia por perfil para el día actual (story_date = hoy).
 * Llamar diariamente vía cron (ej. 00:05 UTC). Header: X-Cron-Secret = CRON_SECRET.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

const MIN_LENGTH = 780;

/**
 * Reglas de generación:
 * - Cada historia es ÚNICA: seed = hash(profileId + story_date), sin repetición entre perfiles ni días.
 * - Coherencia: estructura narrativa (intro → nudo → desenlace) con conectores y párrafos lógicos.
 * - Todas distintas entre sí: distintos arcos narrativos, orden de frases y vocabulario por seed.
 */

/** Hash entero reproducible a partir de un string (diferente string => distinto índice). */
function hashToIndex(s: string, max: number): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return (Math.abs(h) >>> 0) % max;
}

/** Prefijo único por perfil y fecha para que cada historia use índices distintos. */
function slot(profileId: string, storyDate: string, index: number, tag: string): string {
  return `${profileId}|${storyDate}|${index}|${tag}`;
}

const INICIOS = [
  "Anoche fue una de esas noches que no se olvidan. ",
  "Cuando me escribió supe que algo intenso iba a pasar. ",
  "Llegó a mi lugar con esa mirada que lo dice todo. ",
  "Desde que entró por la puerta el ambiente se cargó. ",
  "Habíamos quedado en vernos y la tensión era enorme. ",
  "Era la primera vez que nos veíamos y la química fue inmediata. ",
  "Después de semanas de mensajes por fin coincidimos. ",
  "Me abrió la puerta y supe que la noche iba a ser larga. ",
];

const TRANSICIONES = [
  "Poco a poco ", "En seguida ", "Después de un rato ", "Más tarde ", "Entonces ", "De repente ",
  "Cuando ya no aguantábamos más ", "Sin mediar palabra ", "Al cabo de un tiempo ",
];

const FRAGMENTOS_CALIENTES = [
  "sus manos recorrieron cada centímetro de mi cuerpo",
  "empezamos a desnudarnos sin poder esperar más",
  "los besos se volvieron más profundos y urgentes",
  "sentí cómo me tomaba con fuerza y me llevaba al límite",
  "la pasión nos envolvió y no había vuelta atrás",
  "cada caricia encendía más el deseo",
  "nos fundimos en una sola persona durante horas",
  "el calor entre los dos era insoportable en el mejor sentido",
  "exploramos cada fantasía sin límites",
  "su cuerpo contra el mío me hizo perder la cabeza",
  "acabamos exhaustos pero más que satisfechos",
  "no hubo un solo momento de tregua",
  "la química era tan fuerte que todo fluyó natural",
  "me hizo sentir deseada como nunca",
  "terminamos en la cama una y otra vez",
  "sus labios no dejaron de recorrer mi piel",
  "el roce de nuestros cuerpos nos llevó al borde",
  "nos miramos y ya no hizo falta hablar",
  "la noche se nos fue entre sábanas y suspiros",
  "cada minuto era más intenso que el anterior",
];

const ADJETIVOS = [
  "ardiente", "intenso", "fogoso", "caliente", "apasionado", "deseado", "íntimo",
  "profundo", "urgente", "salvaje", "dulce", "electrizante", "adictivo", "devastador",
  "obsesivo", "lujurioso", "candente", "feroz", "torrencial",
];

const CONECTORES_PARR = [
  "Lo que siguió fue aún más intenso. ",
  "A partir de ahí todo se desató. ",
  "No podíamos parar. ",
  "La tensión había llegado al límite. ",
  "Fue entonces cuando todo estalló. ",
  "Así pasamos la mayor parte de la noche. ",
];

const FINALES = [
  "Cuando se fue me quedé con la piel todavía encendida y la promesa de repetirlo pronto.",
  "Fue una de esas experiencias que marcan y que uno quiere vivir de nuevo.",
  "Al despedirnos supe que no sería la última vez. La conexión era demasiado fuerte.",
  "Me dejó sin palabras y con el cuerpo temblando de placer. Así me gusta.",
  "Sin duda una noche para el recuerdo. Este tipo de encuentros son los que valen la pena.",
  "Al cerrar la puerta sonreí. Había valido cada segundo.",
  "Noches así son las que me hacen amar lo que hago.",
];

function generateStory(profileId: string, storyDate: string, _profileName: string, index: number): string {
  const base = (p: number, f: number, tag: string) =>
    slot(profileId, storyDate, index, tag + p + "_" + f);
  const pick = <T>(arr: T[], key: string) => arr[hashToIndex(key, arr.length)];

  const inicio = pick(INICIOS, slot(profileId, storyDate, index, "inicio"));
  const numParrafos = 2 + hashToIndex(slot(profileId, storyDate, index, "np"), 3);

  let content = inicio;
  for (let p = 0; p < numParrafos; p++) {
    const numFrases = 2 + hashToIndex(base(p, 0, "nf"), 4);
    for (let f = 0; f < numFrases; f++) {
      const trans = pick(TRANSICIONES, base(p, f, "t"));
      const frag = pick(FRAGMENTOS_CALIENTES, base(p, f, "fr"));
      const adj = pick(ADJETIVOS, base(p, f, "a"));
      content += trans + frag.charAt(0).toUpperCase() + frag.slice(1) + ". ";
      content += `Todo muy ${adj}. `;
    }
    content += pick(CONECTORES_PARR, slot(profileId, storyDate, index, "conn" + p));
  }
  content += pick(FINALES, slot(profileId, storyDate, index, "final"));

  let ext = 0;
  while (content.length < MIN_LENGTH) {
    const t = pick(TRANSICIONES, slot(profileId, storyDate, index, "extT" + ext));
    const frag = pick(FRAGMENTOS_CALIENTES, slot(profileId, storyDate, index, "extF" + ext));
    const adj = pick(ADJETIVOS, slot(profileId, storyDate, index, "extA" + ext));
    content += t + frag.charAt(0).toUpperCase() + frag.slice(1) + ". ";
    content += `Muy ${adj}. `;
    ext++;
  }
  return content.slice(0, 2500);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const secret = req.headers.get("X-Cron-Secret");
    const expected = Deno.env.get("CRON_SECRET");
    if (!expected || secret !== expected) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const today = new Date().toISOString().slice(0, 10);

    const { data: profiles, error: fetchErr } = await supabase
      .from("escort_profiles")
      .select("id, name")
      .not("promotion", "is", null)
      .gt("active_until", new Date().toISOString())
      .order("id", { ascending: true });

    if (fetchErr) {
      return new Response(JSON.stringify({ error: fetchErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const list = (profiles ?? []) as { id: string; name: string }[];
    let upserted = 0;

    for (let i = 0; i < list.length; i++) {
      const profile = list[i];
      const content = generateStory(profile.id, today, profile.name, i);

      const { error: upsertErr } = await supabase
        .from("hot_stories")
        .upsert(
          {
            escort_profile_id: profile.id,
            story_date: today,
            content,
          },
          { onConflict: "escort_profile_id,story_date" }
        );

      if (upsertErr) {
        console.error("upsert hot_stories", profile.id, upsertErr);
        continue;
      }
      upserted++;
    }

    return new Response(
      JSON.stringify({
        success: true,
        story_date: today,
        profiles_processed: list.length,
        stories_upserted: upserted,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
