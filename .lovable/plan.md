

# Marketplace Premium - Ciudades del Sur de Chile

## Sistema de Diseño

### Paleta de colores
- **Fondo principal**: Negro profundo (#0A0A0A)
- **Superficies**: Gris grafito (#1A1A1A, #242424)
- **Acentos dorados**: #C9A96E (botones, badges, detalles premium)
- **Acentos rojos**: #8B2635 (CTAs secundarios, alertas)
- **Texto**: Blanco (#FAFAFA), gris claro (#A0A0A0)
- **Glassmorphism**: fondos con blur y opacidad sutil

### Componentes base
- Bordes `rounded-2xl` en todo el sistema
- Sombras suaves con tono cálido
- Efectos glassmorphism (backdrop-blur + bordes semitransparentes)
- Skeleton loaders con shimmer animado
- Microinteracciones en hover (scale 1.02-1.05, glow dorado sutil)
- Transiciones globales fade + slide (300ms)

---

## Página 1: Home Principal

- **Hero**: Fondo oscuro con gradiente sutil negro → grafito, título grande con acento dorado, subtítulo elegante
- **Selector de ciudad**: Dropdown/modal premium con las ciudades (Rancagua, Talca, Chillán, Concepción, Temuco, Valdivia, Osorno, Puerto Montt, etc.)
- **Buscador**: Input con glassmorphism, ícono dorado, placeholder limpio
- **Cards destacadas**: Grid responsive (2 cols mobile, 4 desktop), imagen con overlay gradiente, badge dorado, hover con scale + glow
- **Sección "Ciudades Disponibles"**: Cards horizontales scrolleables con nombre de ciudad e imagen de fondo, efecto parallax sutil
- **Sección "Destacadas"**: Carousel con cards premium, indicadores dorados
- **Footer**: Diseño limpio, links organizados en columnas, logo, separador dorado sutil

## Página 2: Ciudad (ej: /ciudad/temuco)

- **Header**: Nombre de ciudad en tipografía grande, breadcrumb sutil, contador de perfiles
- **Filtros**: Pills/chips horizontales scrolleables (edad, categoría, disponibilidad) con estilo glassmorphism
- **Grid de perfiles**: 2 columnas mobile, 3-4 desktop. Cards con imagen, nombre, badge, precio. Animación staggered fade-in al cargar
- **Paginación**: Infinite scroll con skeleton loaders

## Página 3: Perfil Individual

- **Galería**: Carousel con swipe en mobile (usando Embla Carousel), thumbnails abajo, transición suave entre imágenes
- **Info principal**: Nombre grande, badges, ubicación, disponibilidad con indicador visual
- **Descripción**: Sección con tipografía elegante, bien espaciada
- **CTAs**: Botones grandes dorados (contactar, reservar), sticky en mobile
- **Detalles**: Sección con iconos y datos organizados en grid limpio

## Animaciones y Transiciones

- Transición entre páginas: fade + slide vertical suave (200-300ms)
- Cards: hover scale 1.03 + sombra expandida
- Skeleton loaders: shimmer dorado sobre fondo grafito
- Scroll reveal: elementos aparecen con fade-in staggered
- Botones: transición de color + scale sutil en hover/active
- Navegación mobile: bottom bar con iconos animados

## Mobile First

- Bottom navigation bar fija con iconos (Home, Buscar, Ciudades, Perfil)
- Cards a pantalla completa en mobile
- Swipe gestures en galería
- Filtros como bottom sheet deslizable
- CTAs sticky en la parte inferior

