/**
 * Elimina todos los usuarios (auth + perfil) excepto los que tienen role = 'admin' en profiles.
 *
 * Uso:
 *   Añade a .env (o .env.local) las variables:
 *     SUPABASE_URL=https://tu-proyecto.supabase.co
 *     SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
 *   (Service role: Supabase Dashboard → Settings → API → service_role secret)
 *
 *   Luego:
 *     node scripts/delete-non-admin-users.mjs
 *
 * Opción con variables en línea:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/delete-non-admin-users.mjs
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error(
    "Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Añádelos a .env o pásalos al ejecutar:\n" +
      "  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/delete-non-admin-users.mjs"
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  // 1) Obtener ids de perfiles que NO son admin
  const { data: nonAdminProfiles, error: selectError } = await supabase
    .from("profiles")
    .select("id")
    .neq("role", "admin");

  if (selectError) {
    console.error("Error leyendo profiles:", selectError.message);
    process.exit(1);
  }

  if (!nonAdminProfiles?.length) {
    console.log("No hay usuarios que eliminar (solo hay admins o la tabla está vacía).");
    return;
  }

  const idsToDelete = nonAdminProfiles.map((p) => p.id);
  console.log(`Se eliminarán ${idsToDelete.length} usuario(s) (todos excepto admin).`);

  let deleted = 0;
  let failed = 0;

  for (const uid of idsToDelete) {
    const { error } = await supabase.auth.admin.deleteUser(uid);
    if (error) {
      console.warn(`  No se pudo eliminar ${uid}:`, error.message);
      failed++;
    } else {
      deleted++;
      console.log(`  Eliminado: ${uid}`);
    }
  }

  console.log(`\nListo: ${deleted} eliminado(s), ${failed} error(es).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
