/**
 * Configuración de la rifa mensual.
 * Número de WhatsApp para "Cobrar premio": configurable por env, por defecto +569 35229947.
 */
const DEFAULT_WHATSAPP = "56935229947";

export const RAFFLE_WHATSAPP_NUMBER = (
  import.meta.env.VITE_RAFFLE_WHATSAPP_NUMBER ?? DEFAULT_WHATSAPP
).replace(/\D/g, "");

export const RAFFLE_CLAIM_MESSAGE = "Hola, gané el sorteo mensual y quiero coordinar mi premio.";

export function getRaffleClaimWhatsAppUrl(): string {
  const num = RAFFLE_WHATSAPP_NUMBER || DEFAULT_WHATSAPP;
  const text = encodeURIComponent(RAFFLE_CLAIM_MESSAGE);
  return `https://wa.me/${num}?text=${text}`;
}
