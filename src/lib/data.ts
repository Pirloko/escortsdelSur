export const cities = [
  { id: "rancagua", name: "Rancagua", profiles: 24, image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80" },
  { id: "talca", name: "Talca", profiles: 18, image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&q=80" },
  { id: "chillan", name: "Chillán", profiles: 15, image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600&q=80" },
  { id: "concepcion", name: "Concepción", profiles: 42, image: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&q=80" },
  { id: "temuco", name: "Temuco", profiles: 31, image: "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=600&q=80" },
  { id: "valdivia", name: "Valdivia", profiles: 27, image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&q=80" },
  { id: "osorno", name: "Osorno", profiles: 12, image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80" },
  { id: "puerto-montt", name: "Puerto Montt", profiles: 22, image: "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?w=600&q=80" },
];

/** Slugs de ciudades a mostrar en el selector "Ciudad" (dropdown). Por ahora solo Rancagua y Talca. */
export const CITIES_DROPDOWN_SLUGS = ["rancagua", "talca"];

export function getCityBySlug(slug: string) {
  return cities.find((c) => c.id === slug) ?? null;
}

export const featuredProfiles = [
  { id: "1", name: "Valentina", age: 24, city: "Temuco", badge: "Premium", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80", available: true },
  { id: "2", name: "Camila", age: 26, city: "Concepción", badge: "VIP", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80", available: true },
  { id: "3", name: "Sofía", age: 23, city: "Valdivia", badge: "Nueva", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80", available: false },
  { id: "4", name: "Isabella", age: 25, city: "Rancagua", badge: "Premium", image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&q=80", available: true },
  { id: "5", name: "Martina", age: 22, city: "Talca", badge: "Destacada", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80", available: true },
  { id: "6", name: "Antonella", age: 27, city: "Puerto Montt", badge: "VIP", image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&q=80", available: true },
  { id: "7", name: "Fernanda", age: 24, city: "Osorno", badge: "Premium", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", available: false },
  { id: "8", name: "Catalina", age: 28, city: "Chillán", badge: "Nueva", image: "https://images.unsplash.com/photo-1464863979621-258859e62245?w=400&q=80", available: true },
];

export const profileGallery = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80",
];

/** Categorías para filtrar (coinciden con el campo badge/categoría del perfil). */
export const filterCategories = ["Todas", "Escort Mujer", "Escort Trans", "Escort Hombre"];
export const filterAges = ["18-22", "23-26", "27-30", "30+"];
export const filterAvailability = ["Disponible", "Ocupada"];
