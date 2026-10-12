# Handoff Report — Explorer 2 (Mobile Readiness & Touch Usability Survey)

## 1. Observation
Across all 14 simulation files in `simulacoes/`, linked stylesheets in `simulacoes/css/`, and scripts in `simulacoes/scripts/`:

1. **Global CSS Touch-Action Omission**:
   - `design-system.css` line 2000 defines `touch-action: none;` exclusively on `.sheet-drag-handle`.
   - `.canvas-area` (line 174, 2031), `#three-container` (line 189), and canvas elements DO NOT possess `touch-action: none;`.
   - Only `atomo_de_hidrogenio.css:12` (`#three-container { touch-action: none; }`) and `movimento.css:14` (`#simCanvas { touch-action: none; }`) declare this property. All other 12 simulations lack it.

2. **Bottom Sheet & Sidebar Collapse Conflict**:
   - `design-system.css` lines 226–232: `.sim-layout.sidebar-collapsed .controls-panel` sets `opacity: 0; pointer-events: none; transform: translateX(40px);`.
   - `design-system.css` line 2041: `@media (max-width: 900px) { .canvas-btn-expand-sidebar { display: none !important; } }`.
   - `sim-ui.js` lines 413–428: `initSidebarCollapse()` attaches a click listener to `#btn-collapse-sidebar` that adds `sidebar-collapsed` without checking window width.
   - `sim-ui.js` lines 512–520: `initBottomSheet()` ALSO attaches a click listener to `#btn-collapse-sidebar`.
   - Clicking `#btn-collapse-sidebar` on mobile permanently hides the bottom sheet with `opacity: 0`, leaving no button to reopen it.

3. **Mouse-Only Event Traps in Interactive Canvases**:
   - `quedalivre.js` lines 154–173: listeners registered strictly for `mousemove`, `mousedown`, `mouseup`. Zero touch/pointer listeners. Canvas has fixed `<canvas width="600" height="600">`.
   - `fonons.js` lines 183–208: listeners registered strictly for `mousedown`, `mousemove`, `mouseup`, `mouseout`. `getPosMouse(e)` (line 217) computes `e.clientX - rect.left` against a fixed 900x600 canvas without scaling, causing a 2.5x coordinate offset on a 360px screen.
   - `matrizes.js` lines 657–709: listeners registered strictly for `mousemove`, `mousedown`, `mouseup`. Dragging basis vectors $\hat{i}$ and $\hat{j}$ is impossible on touch devices.
   - `particulas.js` lines 702–714: `aplicarImpulsoCursor(e)` registered only for `mousedown` and `mousemove`. Canvas finger drag does not agitate particles.
   - `snell.js` lines 579–620: ray emission requires `mousedown` (`e.button === 0`), and angle $\theta$ adjustment requires `canvas.addEventListener('wheel')`. Touch screens cannot emit rays or rotate emission angle.

4. **Touch Target Dimensions**:
   - `design-system.css` line 800: `input[type="range"].sim-slider::-webkit-slider-thumb` measures `18px x 18px` (no `::-moz-range-thumb`).
   - `design-system.css` line 2058: `.toolbar-dot, .theme-dot-btn` measures `14px x 14px`.
   - `design-system.css` line 658: `.btn-icon` measures `36px x 36px`.
   - `design-system.css` line 1996: `.sheet-drag-handle` has `height: 16px;`.
   - All are below the WCAG 2.1 SC 2.5.5 minimum of 44x44px.

5. **KaTeX Modal Overflow**:
   - `design-system.css` lines 1371–1377: `overflow-x: auto;` exists only for `.theory-card .katex-display`.
   - In modals (`.sim-modal-body`), display equations (`$$...$$`) are placed directly in `.theory-section` or `<p>` tags without `.theory-card`:
     `clima.html` (5 eqs), `drude.html` (5 eqs), `estacionarias2d.html` (8 eqs), `movimento.html` (4 eqs), `particulas.html` (6 eqs), `snell.html` (4 eqs), `ui_lab.html` (2 eqs).
   - On screens $\le 400\text{px}$, equations overflow and get clipped horizontally.

6. **Legacy Simulation Layout Breakdown**:
   - `base.css` lines 407–422: `@media (max-width: 900px) { .sim-layout { grid-template-columns: 1fr; grid-template-rows: auto 1fr; height: auto; } }`. Controls panel is stacked under 50vh canvas.
   - `gravidade.css` line 71: `@media (max-width: 768px)` ignores tablets (769–900px), squashing side panel to ~180px. On $\le 768\text{px}$, 2 charts of 220px each (440px total) overflow a 1/3 viewport height container.
   - `audio.css` line 451: PiP canvas is fixed at `220px x 140px`, covering >60% of screen width on 360px phones.

---

## 2. Logic Chain
1. From Observation 1, because `design-system.css` does not include `touch-action: none;` on `.canvas-area` or `#three-container`, any 3D OrbitControls or 2D canvas simulation relying solely on the design system stylesheet suffers from native viewport touch scroll capture (swiping to orbit or pan moves the webpage).
2. From Observation 2, because both `initSidebarCollapse` and `initBottomSheet` listen to `#btn-collapse-sidebar` and `.canvas-btn-expand-sidebar` is `display: none !important;` on mobile, clicking the collapse button or pressing 'F' makes the bottom sheet permanently invisible with no UI mechanism to restore it.
3. From Observation 3, because `quedalivre.js`, `fonons.js`, `matrizes.js`, `particulas.js`, and `snell.js` only bind `mousedown`/`mousemove`/`wheel`, touch gestures fail to interact with core physics mechanics (throwing balls, perturbing crystal lattice, transforming matrices, agitating particles, rotating refraction angles).
4. From Observation 4, because thumbs (18px), buttons (26–36px), drag handles (16px), and theme dots (14px) are smaller than 44px, tactile input is ergonomically degraded and prone to misclicks.
5. From Observation 5, because KaTeX display rules with `overflow-x: auto;` are strictly scoped to `.theory-card`, all Theory Modals exhibit unscrollable horizontal overflow on mobile screens $\le 400\text{px}$.
6. From Observation 6, because `base.css` uses stacked column layout without bottom sheets, the 6 legacy simulations fail basic responsive design principles, with `gravidade.html` and `audio.html` experiencing acute visual collision.

---

## 3. Caveats
- Real device testing on physical iOS/Android hardware was not conducted directly; all findings were proven via code analysis, CSS AST extraction, event listener inspection, and DOM hierarchy verification.
- Mobile browser synthetic click emulation (`click` triggered after `touchend`) exists, but does not allow dragging (`mousemove`/`touchmove`), which is what interactive simulations require.
- No source code files in `simulacoes/` were altered during this audit, adhering to the read-only constraint.

---

## 4. Conclusion
Out of 14 simulations:
- **1** is fully mobile-ready (`atomo_de_hidrogenio.html` — Tier A).
- **7** are partially adapted with touch and ergonomics deficits (`clima.html`, `drude.html`, `estacionarias2d.html`, `movimento.html`, `particulas.html`, `snell.html`, `ui_lab.html` — Tier B).
- **6** completely break on screens $\le 900\text{px}$ (`audio.html`, `fonons.html`, `gravidade.html`, `matrizes.html`, `quedalivre.html`, `tensor_de_inercia.html` — Tier C).

The primary remediation actions required are:
1. In `design-system.css`: Add global `touch-action: none !important;` on `.canvas-area, .canvas-area canvas, #three-container`.
2. In `design-system.css`: Expand `.sheet-drag-handle` height to 38px (with padding > 44px) and slider thumb to 24px.
3. In `design-system.css`: Apply universal `max-width: 100%; overflow-x: auto;` on `.katex-display`.
4. In `sim-ui.js`: Add window width check in `initSidebarCollapse` to disable sidebar collapse on $\le 900\text{px}$.
5. In simulation scripts: Migrate mouse listeners to the unified Pointer Events API (`pointerdown`, `pointermove`, `pointerup`, `setPointerCapture`).

---

## 5. Verification Method
To independently verify the observations:
1. Inspect CSS rules:
   ```bash
   python -c "with open(r'simulacoes/css/design-system.css') as f: text = f.read(); print('touch-action on canvas:', 'canvas-area' in text and 'touch-action' in text)"
   ```
2. Inspect event listeners in legacy and DS 2.0 simulations:
   ```bash
   python -c "for f in ['quedalivre.js', 'fonons.js', 'matrizes.js', 'snell.js', 'particulas.js']:
       with open(f'simulacoes/scripts/{f}') as fp: t = fp.read()
       print(f, 'touch listeners:', any(k in t for k in ['touchstart', 'pointerdown']))"
   ```
3. Inspect Theory Modal KaTeX wrappers:
   ```bash
   python .agents/teamwork/explorer_survey_2/inspect_modal_math.py
   ```
4. Invalidation condition: If `design-system.css` is found to already contain `.canvas-area { touch-action: none; }` or if `quedalivre.js` has `touchstart` listeners, these specific claims would be invalidated. Code inspection confirms they are absent.
