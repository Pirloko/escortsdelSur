/**
 * Franjas horarias y lógica de subidas diarias.
 * Un perfil puede elegir 1 o más franjas; en cada franja tiene 10 subidas/día.
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

/** Convierte índice dentro de franja a minuto absoluto del día (0..1439) */
function minuteOfDayFromIndex(slot: TimeSlotValue, idx: number): number {
  switch (slot) {
    case "09-12":
      return 9 * 60 + idx;
    case "12-15":
      return 12 * 60 + 1 + idx;
    case "15-18":
      return 15 * 60 + 1 + idx;
    case "18-22":
      return 18 * 60 + 1 + idx;
    case "22-09": {
      const firstSegment = 24 * 60 - (22 * 60 + 1); // 22:01-23:59 = 119
      if (idx < firstSegment) {
        return 22 * 60 + 1 + idx;
      }
      return idx - firstSegment; // 0:00-8:59
    }
    default:
      return idx;
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

/** ¿Está el perfil en una subida ahora? (una sola franja; subidasPerDay 5 o 10) */
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

/** Horario completo de subidas para un día (por franjas) */
export function getSubidaScheduleForDay(
  profileId: string,
  date: Date,
  timeSlots: string[],
  subidasPorFranja: number
): { slot: TimeSlotValue; minuteOfDay: number }[] {
  if (!timeSlots.length) return [];
  const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const result: { slot: TimeSlotValue; minuteOfDay: number }[] = [];
  for (const slotStr of timeSlots) {
    if (!TIME_SLOTS.some((t) => t.value === slotStr)) continue;
    const slot = slotStr as TimeSlotValue;
    const minutesIdx = getSubidaMinutesForDay(profileId, dateKey, slot, subidasPorFranja);
    for (const idx of minutesIdx) {
      const mod = minuteOfDayFromIndex(slot, idx);
      result.push({ slot, minuteOfDay: mod });
    }
  }
  return result.sort((a, b) => a.minuteOfDay - b.minuteOfDay);
}

/** ¿Está el perfil en subida ahora con múltiples franjas? (5 o 10 subidas por franja) */
export function isInSubidaNowMulti(
  profileId: string,
  timeSlots: string[],
  now: Date,
  subidasPorFranja: number
): boolean {
  if (!timeSlots.length) return false;
  const mod = minuteOfDay(now);
  const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  for (const slotStr of timeSlots) {
    if (!TIME_SLOTS.some((t) => t.value === slotStr)) continue;
    const slot = slotStr as TimeSlotValue;
    const idx = minuteIndexInFranja(slot, mod);
    if (idx === null) continue;
    const subidaMinutes = getSubidaMinutesForDay(profileId, dateKey, slot, subidasPorFranja);
    for (const start of subidaMinutes) {
      if (idx >= start && idx < start + SUBIDA_WINDOW) return true;
    }
  }
  return false;
}

/** Ordenar perfiles: primero los que están en subida (orden aleatorio entre ellos), luego el resto */
export function sortProfilesWithSubidas<T extends {
  id: string;
  time_slot?: string | null;
  time_slots?: string[] | null;
  subidas_per_day?: number | null;
}>(
  profiles: T[],
  now: Date = new Date()
): T[] {
  const inSubida: T[] = [];
  const rest: T[] = [];
  for (const p of profiles) {
    const slots = p.time_slots && p.time_slots.length > 0 ? p.time_slots : null;
    const inSubidaNow = slots
      ? isInSubidaNowMulti(
          p.id,
          slots,
          now,
          (() => {
            const total = p.subidas_per_day ?? 10;
            const per = slots.length > 0 ? Math.round(total / slots.length) : total;
            return per === 5 ? 5 : 10;
          })()
        )
      : isInSubidaNow(p.id, p.time_slot ?? null, now, p.subidas_per_day === 5 ? 5 : 10);
    if (inSubidaNow) inSubida.push(p);
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
