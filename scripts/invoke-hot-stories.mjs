#!/usr/bin/env node
/**
 * Invoca la Edge Function generate-hot-stories (historias calientes).
 * Necesita en .env: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY y CRON_SECRET
 * (CRON_SECRET debe coincidir con el secret en Supabase → Edge Functions → Secrets).
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const envPath = resolve(root, ".env");

let VITE_SUPABASE_URL = process.env.VITE_SUPABASE_URL;
let VITE_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
let CRON_SECRET = process.env.CRON_SECRET;

if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) {
  try {
    const env = readFileSync(envPath, "utf8");
    for (const line of env.split("\n")) {
      const m = line.match(/^\s*([^#=]+)=(.*)$/);
      if (m) {
        const key = m[1].trim();
        const val = m[2].trim().replace(/^["']|["']$/g, "");
        if (key === "VITE_SUPABASE_URL") VITE_SUPABASE_URL = val;
        if (key === "VITE_SUPABASE_ANON_KEY") VITE_SUPABASE_ANON_KEY = val;
        if (key === "CRON_SECRET") CRON_SECRET = val;
      }
    }
  } catch (e) {
    console.error("No se pudo leer .env:", e.message);
  }
}

const url = `${(VITE_SUPABASE_URL || "").replace(/\/$/, "")}/functions/v1/generate-hot-stories`;

if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) {
  console.error("Falta VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env");
  process.exit(1);
}
if (!CRON_SECRET) {
  console.error("Falta CRON_SECRET en .env. Añade el mismo valor que en Supabase → Edge Functions → Secrets.");
  process.exit(1);
}

const res = await fetch(url, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${VITE_SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
    "X-Cron-Secret": CRON_SECRET,
  },
});

const text = await res.text();
let body;
try {
  body = JSON.parse(text);
} catch {
  body = { raw: text };
}

if (!res.ok) {
  console.error("Error:", res.status, body);
  process.exit(1);
}

console.log("OK:", body);
