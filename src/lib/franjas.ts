/**
 * Franjas horarias y lógica de subidas diarias.
 * Cada perfil elige 1 franja; tiene 10 subidas/día repartidas al azar dentro de esa franja.
 */

export const TIME_SLOTS = [
  { value: "09-12", label: "09:00 a 12:00" },
  { value: "12-15", label: "12:01 a 15:00" },
  { value: "15-18", label: "15:01 a 18:00" },
  { value: "18-22", label: "18:01 a 22:00" },
  { value: "22-09", label: "22:01 a 08:59" },
] as const;

export type TimeSlotValue = (typeof TIME_SLOTS)[number]["value"];

/** Minutos desde medianoche (0-1439) */
function minuteOfDay(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

/** Duración de la franja en minutos */
function franjaLength(slot: TimeSlotValue): number {
  switch (slot) {
    case "09-12":
      return 12 * 60 - 9 * 60; // 180
    case "12-15":
      return 15 * 60 - (12 * 60 + 1); // 179
    case "15-18":
      return 18 * 60 - (15 * 60 + 1); // 179
    case "18-22":
      return 22 * 60 - (18 * 60 + 1); // 239
    case "22-09":
      return (24 * 60 - (22 * 60 + 1)) + (8 * 60 + 59 + 1); // 119 + 540 = 659
    default:
      return 180;
  }
}

/** ¿Está el momento actual dentro de la franja? */
function isInFranja(slot: TimeSlotValue, mod: number): boolean {
  switch (slot) {
    case "09-12":
      return mod >= 9 * 60 && mod < 12 * 60;
    case "12-15":
      return mod >= 12 * 60 + 1 && mod < 15 * 60;
    case "15-18":
      return mod >= 15 * 60 + 1 && mod < 18 * 60;
    case "18-22":
      return mod >= 18 * 60 + 1 && mod < 22 * 60;
    case "22-09":
      return mod >= 22 * 60 + 1 || mod <= 8 * 60 + 59;
    default:
      return false;
  }
}

/** Índice de minuto dentro de la franja (0 .. length-1) */
function minuteIndexInFranja(slot: TimeSlotValue, mod: number): number | null {
  if (!isInFranja(slot, mod)) return null;
  switch (slot) {
    case "09-12":
      return mod - 9 * 60;
    case "12-15":
      return mod - (12 * 60 + 1);
    case "15-18":
      return mod - (15 * 60 + 1);
    case "18-22":
      return mod - (18 * 60 + 1);
    case "22-09":
      if (mod >= 22 * 60 + 1) return mod - (22 * 60 + 1);
      return 119 + mod; // 22:01-23:59 = 119 min, luego 0:00-8:59
    default:
      return 0;
  }
}

/** PRNG determinista: seed string -> número 0..1 */
function seededRandom(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  const x = Math.sin(h) * 10000;
  return x - Math.floor(x);
}

/** Genera N minutos (índices dentro de la franja) para este perfil y fecha. Determinista. N = 5 o 10. */
export function getSubidaMinutesForDay(
  profileId: string,
  dateKey: string,
  slot: TimeSlotValue,
  count: number = 10
): number[] {
  const length = franjaLength(slot);
  const n = count === 5 ? 5 : 10;
  const minutes: number[] = [];
  const seed = `${profileId}-${dateKey}-${slot}`;
  for (let i = 0; i < n; i++) {
    const r = seededRandom(seed + i);
    minutes.push(Math.floor(r * length));
  }
  return minutes.sort((a, b) => a - b);
}

/** Ventana en minutos: cada subida cuenta como "activa" durante SUBIDA_WINDOW minutos */
const SUBIDA_WINDOW = 6;

/** ¿Está el perfil en una subida ahora? (dentro de su franja y en uno de los N slots de hoy) */
export function isInSubidaNow(
  profileId: string,
  timeSlot: string | null,
  now: Date,
  subidasPerDay: number = 10
): boolean {
  if (!timeSlot || !TIME_SLOTS.some((t) => t.value === timeSlot)) return false;
  const slot = timeSlot as TimeSlotValue;
  const mod = minuteOfDay(now);
  const idx = minuteIndexInFranja(slot, mod);
  if (idx === null) return false;
  const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const subidaMinutes = getSubidaMinutesForDay(profileId, dateKey, slot, subidasPerDay);
  for (const start of subidaMinutes) {
    if (idx >= start && idx < start + SUBIDA_WINDOW) return true;
  }
  return false;
}

/** Ordenar perfiles: primero los que están en subida (orden aleatorio entre ellos), luego el resto */
export function sortProfilesWithSubidas<T extends { id: string; time_slot?: string | null; subidas_per_day?: number | null }>(
  profiles: T[],
  now: Date = new Date()
): T[] {
  const inSubida: T[] = [];
  const rest: T[] = [];
  for (const p of profiles) {
    const subidas = p.subidas_per_day === 5 ? 5 : 10;
    if (isInSubidaNow(p.id, p.time_slot ?? null, now, subidas)) inSubida.push(p);
    else rest.push(p);
  }
  // Shuffle inSubida deterministically by date so order is stable within the same minute
  const shuffleSeed = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}`;
  for (let i = inSubida.length - 1; i > 0; i--) {
    const r = seededRandom(shuffleSeed + i);
    const j = Math.floor(r * (i + 1));
    [inSubida[i], inSubida[j]] = [inSubida[j], inSubida[i]];
  }
  return [...inSubida, ...rest];
}
