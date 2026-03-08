#!/usr/bin/env node
/**
 * Genera prerender-routes.json con las rutas a prerenderizar para SEO.
 * Incluye: /, /:ciudad, /:ciudad/ranking, /:ciudad/filtro (sin perfiles).
 * Ejecutar antes de "vite build" cuando PRERENDER=true.
 */

import { writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outPath = join(root, "prerender-routes.json");

// Ciudad indexada por defecto (debe coincidir con la app)
const CITY_SLUG = "rancagua";

const RANKING_SLUGS = [
  "mejores-escorts",
  "escorts-nuevas",
  "escorts-recomendadas",
];

const ALL_FILTER_SLUGS = [
  "escorts",
  "acompanantes",
  "damas-de-compania",
  "sexo",
  "sexosur",
  "skokka",
  "scort",
  "pelinegras",
  "tetonas",
  "culonas",
  "bajitas",
  "depiladas",
  "escort-pelinegra",
  "escort-tetona",
  "escort-culona",
  "escort-bajita",
  "escort-depilada",
  "escort-a-domicilio",
  "escort-masajes-eroticos",
  "escort-vip",
  "escort-independiente",
  "a-domicilio",
  "apartamento-propio",
  "masajes",
  "masajes-eroticos",
  "trios",
  "fetichismo",
  "atencion-parejas",
  "oral-con-condon",
  "sexo-anal",
  "juguetes-eroticos",
];

const CATEGORY_FILTER_COMBO_SLUGS = [
  "escorts-pelinegras", "escorts-tetonas", "escorts-culonas", "escorts-bajitas", "escorts-depiladas",
  "escorts-a-domicilio", "escorts-apartamento-propio", "escorts-masajes", "escorts-trios",
  "acompanantes-a-domicilio", "acompanantes-masajes",
];

// Pirámide SEO: categorías + servicios + atributos + zonas
const PIRAMIDAL_CATEGORY_EXTRA = ["escorts-vip", "escorts-independientes", "escorts-premium", "escorts-verificadas", "escorts-disponibles"];
const PIRAMIDAL_SERVICES = [
  "masajes-eroticos", "sexo-anal", "oral-sin-condon", "sexo-con-condon", "trios", "lesbico", "beso-negro",
  "masaje-tantrico", "masaje-prostatico", "sexo-virtual", "companera-de-cena", "acompanante-eventos",
  "escort-hotel", "escort-motel", "striptease", "bdsm", "domina", "sumisa", "sexo-ducha", "juguetes-sexuales",
  "roleplay", "cumplir-fantasias", "garganta-profunda", "facial", "masaje-relajante", "masaje-sensual",
  "sexo-lento", "sexo-intenso", "citas-privadas", "encuentros-discretos", "servicio-nocturno", "servicio-24-horas",
  "servicio-express", "citas-lujosas", "companera-viajes", "masaje-con-final-feliz", "sexo-romantico", "experiencia-girlfriend",
];
const PIRAMIDAL_ATTRIBUTES = [
  "escort-rubia", "escort-castana", "escort-pelirroja", "escort-alta", "escort-delgada", "escort-curvy",
  "escort-joven", "escort-madura", "escort-milf", "escort-universitaria", "escort-modelo", "escort-latina",
  "escort-brasilena", "escort-colombiana", "escort-venezolana", "escort-chilena", "escort-europea", "escort-exotica",
  "escort-de-lujo", "escort-natural", "escort-siliconada", "escort-tatuada", "escort-sin-tatuajes", "escort-deportista",
  "escort-sensual", "escort-elegante", "escort-sexy", "escort-discreta", "escort-divertida", "escort-carismatica",
  "escort-apasionada", "escort-experta", "escort-intensa", "escort-romantica", "escort-aventurera",
];
const PIRAMIDAL_ZONES = [
  "escorts-centro", "escorts-machali", "escorts-cachapoal", "escorts-poblacion-diego-portales",
  "escorts-poblacion-rene-schneider", "escorts-villa-teniente", "escorts-villa-el-cobre", "escorts-villa-nueva",
  "escorts-baquedano", "escorts-la-compania", "escorts-san-damian", "escorts-los-lirios", "escorts-barrio-industrial",
  "escorts-parque-koke", "escorts-la-granja", "escorts-poblacion-manuel-rodriguez", "escorts-santa-julia",
  "escorts-san-joaquin", "escorts-las-americas", "escorts-el-manantial",
];
const ALL_PIRAMIDAL = [...PIRAMIDAL_CATEGORY_EXTRA, ...PIRAMIDAL_SERVICES, ...PIRAMIDAL_ATTRIBUTES, ...PIRAMIDAL_ZONES];

const routes = [
  "/",
  `/${CITY_SLUG}`,
  ...RANKING_SLUGS.map((s) => `/${CITY_SLUG}/${s}`),
  ...ALL_FILTER_SLUGS.map((s) => `/${CITY_SLUG}/${s}`),
  ...CATEGORY_FILTER_COMBO_SLUGS.map((s) => `/${CITY_SLUG}/${s}`),
  ...ALL_PIRAMIDAL.map((s) => `/${CITY_SLUG}/${s}`),
];

try {
  mkdirSync(root, { recursive: true });
  writeFileSync(outPath, JSON.stringify(routes, null, 2), "utf8");
  console.log(`Prerender routes written to ${outPath} (${routes.length} routes).`);
} catch (err) {
  console.error("Failed to write prerender-routes.json:", err);
  process.exit(1);
}
