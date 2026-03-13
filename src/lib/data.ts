export const cities = [
  { id: "rancagua", name: "Rancagua", profiles: 24, image: "/Sewell.jpg" },
  { id: "talca", name: "Talca", profiles: 18, image: "/marcadeagua.png" },
  { id: "chillan", name: "Chillán", profiles: 15, image: "/marcadeagua.png" },
  { id: "concepcion", name: "Concepción", profiles: 42, image: "/marcadeagua.png" },
  { id: "temuco", name: "Temuco", profiles: 31, image: "/marcadeagua.png" },
  { id: "valdivia", name: "Valdivia", profiles: 27, image: "/marcadeagua.png" },
  { id: "osorno", name: "Osorno", profiles: 12, image: "/marcadeagua.png" },
  { id: "puerto-montt", name: "Puerto Montt", profiles: 22, image: "/marcadeagua.png" },
];

/** Slugs de ciudades a mostrar en el selector (por ahora solo Rancagua). */
export const CITIES_DROPDOWN_SLUGS = ["rancagua"];

export function getCityBySlug(slug: string) {
  return cities.find((c) => c.id === slug) ?? null;
}

export const featuredProfiles = [
  { id: "1", name: "Perfil 1", age: 24, city: "Temuco", badge: "Premium", image: "/marcadeagua.png", available: true },
  { id: "2", name: "Perfil 2", age: 26, city: "Concepción", badge: "VIP", image: "/marcadeagua.png", available: true },
  { id: "3", name: "Perfil 3", age: 23, city: "Valdivia", badge: "Nueva", image: "/marcadeagua.png", available: false },
  { id: "4", name: "Perfil 4", age: 25, city: "Rancagua", badge: "Premium", image: "/marcadeagua.png", available: true },
  { id: "5", name: "Perfil 5", age: 22, city: "Talca", badge: "VIP", image: "/marcadeagua.png", available: true },
  { id: "6", name: "Perfil 6", age: 27, city: "Puerto Montt", badge: "VIP", image: "/marcadeagua.png", available: true },
  { id: "7", name: "Perfil 7", age: 24, city: "Osorno", badge: "Premium", image: "/marcadeagua.png", available: false },
  { id: "8", name: "Perfil 8", age: 28, city: "Chillán", badge: "Nueva", image: "/marcadeagua.png", available: true },
];

export const profileGallery = ["/marcadeagua.png"];

/** Categorías para filtrar (coinciden con el campo badge/categoría del perfil). */
export const filterCategories = ["Todas", "Escort Mujer", "Escort Trans", "Escort Hombre"];
export const filterAges = ["18-22", "23-26", "27-30", "30+"];
export const filterAvailability = ["Disponible", "Ocupada"];
