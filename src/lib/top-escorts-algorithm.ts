/**
 * Algoritmo de ranking "Top Escorts" basado en datos de analítica.
 * score = (click_whatsapp * 5) + (click_phone * 3) + (profile_views * 1) + (profile_engagement_seconds / 30)
 */

import type { ProfileRow } from "./admin-analytics";

export interface TopEscortScore {
  profile_id: string;
  profile_name: string;
  city: string;
  whatsapp_clicks: number;
  phone_clicks: number;
  profile_views: number;
  avg_engagement_seconds: number;
  score: number;
  rank: number;
}

const WEIGHT_WHATSAPP = 5;
const WEIGHT_PHONE = 3;
const WEIGHT_VIEW = 1;
const WEIGHT_ENGAGEMENT_SECONDS = 1 / 30;

export function computeTopEscortsScore(profiles: ProfileRow[]): TopEscortScore[] {
  const scored = profiles.map((p) => ({
    ...p,
    score:
      p.whatsapp_clicks * WEIGHT_WHATSAPP +
      p.phone_clicks * WEIGHT_PHONE +
      p.profile_views * WEIGHT_VIEW +
      p.avg_engagement_seconds * WEIGHT_ENGAGEMENT_SECONDS,
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.map((s, i) => ({ ...s, rank: i + 1 }));
}
