/**
 * Aplica la marca de agua HolaCachero.cl al centro de la imagen.
 * El resultado se quema en los píxeles (el archivo subido ya contiene la marca).
 *
 * Requisito: public/marcadeagua.png debe existir (se sirve como /marcadeagua.png).
 */

/** URL de la marca de agua: mismo origen para evitar CORS. */
function getWatermarkUrl(): string {
  if (typeof window === "undefined") return "/marcadeagua.png";
  return `${window.location.origin}/marcadeagua.png`;
}

const WATERMARK_OPACITY = 0.6;
/** Ancho de la marca respecto al ancho de la imagen (marcadeagua es horizontal). */
const WATERMARK_WIDTH_RATIO = 0.5;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`No se pudo cargar la marca de agua. ¿Existe public/marcadeagua.png? (${src})`));
    img.src = src;
  });
}

function createImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo cargar la imagen"));
    };
    img.src = url;
  });
}

/**
 * Dibuja la foto en el canvas y superpone el logo en el centro.
 * Devuelve un Blob JPEG listo para subir.
 */
export function addWatermarkToImageFile(file: File): Promise<Blob> {
  const watermarkUrl = getWatermarkUrl();

  return Promise.all([
    createImageFromFile(file),
    loadImage(watermarkUrl),
  ]).then(([photoImg, logoImg]) => {
    const w = photoImg.naturalWidth;
    const h = photoImg.naturalHeight;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return Promise.reject(new Error("Canvas no disponible"));

    ctx.drawImage(photoImg, 0, 0, w, h);

    const logoW = Math.max(120, Math.round(w * WATERMARK_WIDTH_RATIO));
    const logoH = (logoImg.naturalHeight / logoImg.naturalWidth) * logoW;
    const x = (w - logoW) / 2;
    const y = (h - logoH) / 2;

    ctx.globalAlpha = WATERMARK_OPACITY;
    ctx.drawImage(logoImg, x, y, logoW, logoH);
    ctx.globalAlpha = 1;

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Error al generar la imagen"));
        },
        "image/jpeg",
        0.9
      );
    });
  });
}

/**
 * Convierte el Blob con marca de agua a File para mantener nombre/extensión en la subida.
 */
export async function addWatermarkToImageFileAsFile(file: File): Promise<File> {
  const blob = await addWatermarkToImageFile(file);
  const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
}
