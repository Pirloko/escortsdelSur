/**
 * Registra un clic en WhatsApp (usuario visitante + perfil) para la insignia "El Cachero".
 * Solo tiene efecto si el usuario está logueado como visitante.
 */

import { supabase } from "@/lib/supabase";

export async function recordWhatsAppClickForBadge(
  userId: string,
  escortProfileId: string
): Promise<void> {
  if (!supabase || !userId || !escortProfileId) return;
  await (supabase as any)
    .from("profile_whatsapp_clicks")
    .upsert(
      { user_id: userId, escort_profile_id: escortProfileId },
      { onConflict: "user_id,escort_profile_id", ignoreDuplicates: true }
    );
}
