/**
 * Utilidades para enlaces de WhatsApp.
 * Mensaje predefinido al contactar desde un perfil: sitio, ciudad, enlace al perfil y pregunta por valores/servicios.
 */
import { SITE_URL } from "@/lib/seo-constants";

const WHATSAPP_MESSAGE_TEMPLATE = (
  profileUrl: string,
  cityName: string
) => `Hola corazon acabo de ver tu perfil en ${SITE_URL} en ${cityName}.

tu perfil: ${profileUrl}

me gustaria saber tus valores y servicios ??`;

/**
 * Normaliza el número y devuelve solo dígitos con prefijo 56 (Chile), o null si no válido.
 */
export function getWhatsAppNumber(raw: string | null | undefined): string | null {
  if (!raw || !raw.trim()) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 8) return null;
  return digits.startsWith("56") ? digits : "56" + digits;
}

/**
 * URL de WhatsApp para abrir chat con mensaje predefinido (perfil visto en holacachero, enlace al perfil, pregunta valores/servicios).
 * @param phoneRaw - Número de WhatsApp del perfil
 * @param profileId - ID del perfil (para armar el enlace)
 * @param cityName - Nombre de la ciudad (ej. "Rancagua") para el mensaje
 */
export function getWhatsAppProfileUrl(
  phoneRaw: string | null | undefined,
  profileId: string,
  cityName: string = "Rancagua"
): string | null {
  const num = getWhatsAppNumber(phoneRaw);
  if (!num) return null;
  const profileUrl = `${SITE_URL}/perfil/${profileId}`;
  const text = WHATSAPP_MESSAGE_TEMPLATE(profileUrl, cityName);
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}
