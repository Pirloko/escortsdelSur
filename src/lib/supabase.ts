import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn("Supabase: faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. Usa datos locales.");
}

export const supabase = url && anonKey ? createClient<Database>(url, anonKey) : null;
