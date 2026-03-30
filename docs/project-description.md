# Geometría a Través del Tiempo — Descripción del Proyecto

## Resumen

Aplicación web frontend interactiva que presenta la historia de la geometría desde la prehistoria hasta 1872 como una línea de tiempo visual y navegable. El contenido proviene de `timeline.md` y se presenta en español como una experiencia educativa envolvente.

## Objetivos

- Mostrar 12 hitos de la historia de la geometría organizados en 5 períodos temáticos
- Permitir navegación fluida mediante teclado, botones y clic directo
- Ofrecer tarjetas colapsadas con resumen y un modal de detalle completo por entrada
- Funcionar sin servidor: `index.html` abierto directamente en cualquier navegador moderno

## Requisitos Técnicos

### Stack
- **HTML/CSS/JS vanilla** con ES modules (`<script type="module">`)
- Sin frameworks, sin bundler, sin npm
- Google Fonts (Crimson Pro) vía `<link>` en el `<head>`
- CSS Custom Properties como sistema de design tokens

### Compatibilidad
- Navegadores modernos (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Protocolo `file://` y `http://` (sin dependencias de servidor)
- Diseño responsive: escritorio ≥1024px, tablet 768–1023px, móvil ≤767px

## Estructura de Archivos

```
caece-geometria/
├── index.html
├── docs/
│   ├── project-description.md
│   └── todo.md
├── data/
│   └── timeline.json
├── css/
│   ├── reset.css
│   ├── variables.css
│   ├── layout.css
│   ├── card.css
│   ├── navigation.css
│   ├── modal.css
│   └── responsive.css
├── js/
│   ├── data.js
│   ├── timeline.js
│   ├── navigation.js
│   ├── modal.js
│   └── main.js
└── assets/
    └── images/
```

## Estructura de Datos

### Períodos (5 total)
Cada período tiene: `id`, `label`, `color` (primario), `accentColor` (acento).

| ID | Etiqueta | Color |
|---|---|---|
| prehistoria | Prehistoria y Antigüedad | #7B5EA7 |
| grecia | Grecia Clásica | #2E6B8A |
| renacimiento | Renacimiento | #8A5A2E |
| moderna | Geometría Moderna | #2E7A4F |
| sigloXIX | Siglo XIX | #8A2E2E |

### Entradas (12 total)
Cada entrada tiene: `id`, `periodId`, `year`, `yearLabel`, `sortKey`, `title`, `summary`, `body`, `image`, `tags`.

- `sortKey`: entero (negativo = a.C.) para orden cronológico
- `yearLabel`: cadena legible para mostrar en la UI
- `summary`: una oración para la tarjeta colapsada
- `body`: párrafo completo para el modal de detalle

## Funcionalidades

### Línea de Tiempo
- Eje horizontal con scroll, mostrando todas las entradas cronológicamente
- Cabeceras de período con color distintivo
- Tarjetas en disposición alternada (arriba/abajo del eje)
- Entrada activa resaltada visualmente

### Navegación
- Botones Anterior/Siguiente en barra inferior fija
- Teclas ← → para navegar entre entradas
- Teclas Tab/Shift+Tab para foco accesible
- Teclas Enter/Space para abrir modal desde tarjeta activa
- Píldoras de salto por período
- Escape para cerrar modal

### Modal de Detalle
- Overlay de pantalla completa con animación
- Contenido completo de la entrada (`body`)
- Trampa de foco (focus trap) para accesibilidad
- Botón de cierre y tecla Escape

### Accesibilidad
- Atributos ARIA en todos los elementos interactivos
- `lang="es"` en `<html>`
- Roles landmark: `<header>`, `<main>`, `<nav>`, `<dialog>`
- Soporte `prefers-reduced-motion`
- Objetivo Lighthouse Accesibilidad ≥ 90

## Diseño Visual

### Tipografía
- **Crimson Pro** (Google Fonts): serif elegante para contenido histórico
- Escala tipográfica modular basada en `--font-size-base: 1rem`

### Paleta
- Fondo general: `#0F0E17` (tono muy oscuro cálido)
- Texto principal: `#FFFFFE`
- Cada período tiene color primario y acento definidos en `variables.css`

### Tarjetas
- Estado inactivo: borde sutil, fondo oscuro semitransparente
- Estado activo: borde coloreado con el color del período, sombra
- Estado expandido (modal): overlay animado con backdrop blur

## Criterios de Aceptación

- [ ] Las 12 entradas se renderizan correctamente
- [ ] Navegación por teclado funciona sin mouse
- [ ] Modal abre, muestra contenido completo y se cierra correctamente
- [ ] Focus trap funciona dentro del modal
- [ ] Layout es usable en 375px de ancho
- [ ] No hay errores en consola del navegador
- [ ] Lighthouse Accesibilidad ≥ 90
