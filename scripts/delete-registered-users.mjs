/**
 * Elimina TODOS los usuarios con role = 'registered_user' (publicadores/escorts).
 *
 * Uso:
 *   Añade a .env (o .env.local):
 *     SUPABASE_URL=https://tu-proyecto.supabase.co
 *     SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
 *   (Service role: Supabase Dashboard → Settings → API → service_role secret)
 *
 *   Luego:
 *     node scripts/delete-registered-users.mjs
 *
 * Opción con variables en línea:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/delete-registered-users.mjs
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error(
    "Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Añádelos a .env o pásalos al ejecutar:\n" +
      "  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/delete-registered-users.mjs"
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data: profiles, error: selectError } = await supabase
    .from("profiles")
    .select("id, display_name, email")
    .eq("role", "registered_user");

  if (selectError) {
    console.error("Error leyendo profiles:", selectError.message);
    process.exit(1);
  }

  if (!profiles?.length) {
    console.log("No hay usuarios registered_user que eliminar.");
    return;
  }

  console.log(`Se eliminarán ${profiles.length} usuario(s) con role = registered_user:\n`);
  profiles.forEach((p) => console.log(`  - ${p.email ?? p.id} (${p.display_name ?? "sin nombre"})`));
  console.log("");

  let deleted = 0;
  let failed = 0;

  for (const p of profiles) {
    const { error } = await supabase.auth.admin.deleteUser(p.id);
    if (error) {
      console.warn(`  No se pudo eliminar ${p.email ?? p.id}:`, error.message);
      failed++;
    } else {
      deleted++;
      console.log(`  Eliminado: ${p.email ?? p.id}`);
    }
  }

  console.log(`\nListo: ${deleted} eliminado(s), ${failed} error(es).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
