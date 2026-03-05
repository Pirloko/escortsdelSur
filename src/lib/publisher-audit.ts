import { supabase } from "@/lib/supabase";

export type PublisherAuditEventType =
  | "login"
  | "logout"
  | "edit_account"
  | "edit_profile"
  | "create_profile"
  | "delete_profile"
  | "promote_profile"
  | "pause_profile"
  | "unpause_profile"
  | "activate_7d";

/**
 * Registra un evento de auditoría para un usuario publicador.
 * Solo se usa cuando el usuario actual es el publicador (auth.uid() = user_id).
 * RLS permite INSERT solo si auth.uid() = user_id.
 */
export async function recordPublisherAudit(
  userId: string,
  eventType: PublisherAuditEventType,
  options?: { escortProfileId?: string | null; details?: Record<string, unknown> }
): Promise<void> {
  if (!supabase) return;
  const { escortProfileId = null, details = null } = options ?? {};
  await supabase.from("publisher_audit_log").insert({
    user_id: userId,
    event_type: eventType,
    escort_profile_id: escortProfileId ?? null,
    details: details ? (details as object) : null,
  });
}
