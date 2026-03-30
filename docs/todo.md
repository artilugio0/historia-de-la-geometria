# Todo — Iteraciones de Implementación

## Iteración 1 — Esqueleto HTML Estático ✅
- [x] Crear `data/timeline.json` con los 12 hitos y 5 períodos completos
- [x] Crear `css/reset.css` (reset moderno, box-sizing, variables de fuente base)
- [x] Crear `css/variables.css` (design tokens: colores, tipografía, espaciado, períodos)
- [x] Crear `index.html` con estructura ARIA, `<link>` a Google Fonts, sin tarjetas estáticas (generadas por JS desde el inicio)
- [ ] **Verificar:** abrir con `python3 -m http.server 8080` y confirmar que las 12 entradas son visibles

## Iteración 2 — Tipografía y Colores ✅
- [x] Crear `css/layout.css` (contenedor principal, estructura de página, site header)
- [x] Crear `css/card.css` (estilos de tarjeta: base, inactiva, tipografía interna)
- [x] Aplicar Crimson Pro a títulos y cuerpo de texto vía Google Fonts
- [x] Colores de período definidos en `variables.css` y aplicados en cabeceras
- [ ] **Verificar:** jerarquía visual clara, colores distinguibles por período

## Iteración 3 — Eje de Línea de Tiempo y Bandas de Período ✅
- [x] `css/layout.css`: track flex con scroll horizontal, espina del eje (`.timeline-axis`)
- [x] Posicionamiento zigzag (clases `.above` / `.below` en tarjetas y conectores)
- [x] Cabeceras de período como bandas coloreadas (`.period-header` + `.period-label`)
- [x] Marcadores de año junto al eje (`.entry-year`)
- [ ] **Verificar:** scroll horizontal funciona, zigzag visible, períodos diferenciados visualmente

## Iteración 4 — Carga de Datos JS y Render Dinámico ✅
- [x] `js/data.js`: `fetchTimeline()`, `buildIndex()`, `getEntry()`, manejo de error con mensaje amigable
- [x] `js/timeline.js`: `renderTimeline()`, `setActiveEntry()`, `getActiveEntryId()`
- [x] `js/main.js`: inicialización async, cableado de módulos vía callbacks
- [x] `index.html` no contiene tarjetas HTML estáticas
- [ ] **Verificar:** las 12 tarjetas se generan desde JSON, sin errores en consola

## Iteración 5 — Estado Activo y Barra de Navegación Inferior ✅
- [x] `css/navigation.css`: barra sticky inferior, botones prev/next, contador
- [x] `css/card.css`: clase `.is-active` con borde coloreado y sombra
- [x] `js/navigation.js`: `goToPrev()`, `goToNext()`, `updateNavUI()`
- [x] Conectado con `setActiveEntry()` y callbacks en `main.js`
- [x] Primera entrada activa al cargar (llamada en `renderTimeline`)
- [ ] **Verificar:** prev/next funcionan, entrada activa visualmente destacada, scroll automático al centro

## Iteración 6 — Navegación por Teclado ✅
- [x] `ArrowLeft` / `ArrowRight` → prev/next
- [x] `Tab` / `Shift+Tab` → foco navegable en tarjetas (`tabindex="0"`)
- [x] `Enter` / `Space` → abre modal desde tarjeta activa o botón nav
- [x] `Escape` → cierra modal
- [x] Píldoras de salto por período en barra de navegación (`jumpToPeriod()`)
- [x] Atributos ARIA en tarjetas, nav, y píldoras (`aria-label`, `aria-current`, `aria-pressed`, `role`)
- [ ] **Verificar:** navegación completa sin mouse, anillo de foco visible en todo momento

## Iteración 7 — Modal de Detalle ✅
- [x] `css/modal.css`: overlay con backdrop blur, animación entrada/salida, barra de acento de período
- [x] `js/modal.js`: `openModal(entry)`, `closeModal()`, focus trap completo
- [x] Conectado vía callback `onOpenModal` en `main.js` (navigation no importa modal)
- [x] Modal muestra: tag de período, `yearLabel`, título, `body` completo, tags
- [x] Cierre con botón ×, tecla Escape, o clic en overlay
- [ ] **Verificar:** modal abre/cierra con animación, foco queda atrapado dentro, accesible con lector de pantalla

## Iteración 8 — Layout Responsive para Móvil ✅
- [x] `css/responsive.css` creado
- [x] ≤768px: layout vertical, tarjetas apiladas con borde izquierdo coloreado, nav compacta
- [x] ≤480px: modal como sheet desde abajo (pantalla completa), texto ajustado, botones compactos
- [x] Píldoras de período con scroll horizontal oculto en móvil
- [ ] **Verificar:** usable en 375px de ancho, sin overflow horizontal no deseado

## Iteración 9 — Pulido Final y QA ✅ (código) / ⏳ (verificación)
- [x] Animaciones de carga escalonadas: `animationDelay = index * 60ms` por tarjeta
- [x] `prefers-reduced-motion`: desactiva animaciones en `card.css`, `modal.css`, `responsive.css`
- [x] ARIA completo: `lang="es"`, landmarks, `aria-label`, `aria-current`, `aria-modal`, `aria-live`, `role`
- [x] `<noscript>` con mensaje de degradación elegante
- [ ] **Ejecutar Lighthouse:** objetivo Accesibilidad ≥ 90
- [ ] **Verificar consola:** sin errores en Chrome, Firefox y Safari
- [ ] **Revisar contraste:** colores WCAG AA (especialmente texto sobre fondos de período)
- [ ] **Probar sin mouse:** navegación completa solo con teclado en flujo real

---

## Estado General

| Iteración | Código | Verificación en browser |
|---|---|---|
| 1 — Esqueleto | ✅ | ⏳ pendiente |
| 2 — Tipografía | ✅ | ⏳ pendiente |
| 3 — Eje y bandas | ✅ | ⏳ pendiente |
| 4 — JS dinámico | ✅ | ⏳ pendiente |
| 5 — Estado activo y nav | ✅ | ⏳ pendiente |
| 6 — Teclado | ✅ | ⏳ pendiente |
| 7 — Modal | ✅ | ⏳ pendiente |
| 8 — Responsive | ✅ | ⏳ pendiente |
| 9 — Pulido y QA | ✅ código | ⏳ auditoría pendiente |
