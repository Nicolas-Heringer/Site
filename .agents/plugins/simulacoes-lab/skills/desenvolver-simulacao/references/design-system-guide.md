# Guia de Implementação do Design System para Simulações Científicas
**Autor:** Nicolas Heringer  
**Projeto:** Plataforma de Simulações Científicas & Matemáticas  
**Documento:** Manual de Referência e Especificação de Componentes (Desenvolvedores & Agentes de IA)  
**Versão:** 2.0 (Com Biblioteca Isolada `sim-ui.js` e Suporte a Mobile Bottom Sheet)

---

## 1. Visão Geral & Filosofia de Arquitetura

Este Design System foi desenvolvido especificamente para **aplicações interativas de física, matemática e computação científica**. Toda a biblioteca segue 4 pilares inegociáveis:
1. **100% Desacoplada e Modular**: Nenhuma classe CSS, função ou variável possui nomes restritos a uma única simulação (como clima ou temperatura).
2. **Orientada a Tokens de Design**: Cores, superfícies, raios e tipografia são controlados centralmente via CSS Variables no `:root`.
3. **Zero-Boilerplate para JavaScript (`sim-ui.js`)**: Cada componente dinâmico possui controladores exportados prontos para uso com inicialização em 1 linha de código.
4. **Responsividade Bidirecional**: Experiência desktop em tela cheia (com Modo Foco) e experiência mobile nativa com **Bottom Sheet deslizante** em 3 snap points.

---

## 2. Arquitetura de Tokens (`:root`)

Todas as cores e estilos derivam dos seguintes tokens definidos em `css/design-system.css`:

```css
:root {
    /* Superfícies Dark Theme de Alto Contraste */
    --bg-main: #070b16;
    --bg-surface: #0f172a;
    --bg-surface-elevated: #1e293b;
    --bg-panel: rgba(15, 23, 42, 0.80);
    --bg-card: rgba(30, 41, 59, 0.65);
    --bg-input: rgba(15, 23, 42, 0.85);

    /* Cor de Acento Global */
    --accent-color: #facc15;          /* Amarelo Solar (Padrão) */

    /* Acentos Independentes por Componente (com fallback para --accent-color) */
    --accent-nav: var(--accent-color);
    --accent-btn: var(--accent-color);
    --accent-card: var(--accent-color);
    --accent-text: var(--accent-color);
    --accent-slider: var(--accent-color);
    --accent-switch: var(--accent-color);
    --accent-hud: var(--accent-color);

    /* Tipografia */
    --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
    --font-mono: 'JetBrains Mono', monospace;

    /* Raios de Borda */
    --radius-xs: 4px;
    --radius-sm: 6px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;
    --radius-full: 9999px;
}
```

---

## 3. Catálogo de Componentes & Controladores JavaScript (`sim-ui.js`)

### 3.1 Barra de Reprodução Físico-Temporal (`.sim-transport-bar`)
Controle temporal completo contendo: Play/Pause binário, avanço discreto de passo ($\Delta t$), reinício para $t=0$ e seletor de velocidade temporal.

```javascript
import { initToggleButton } from './sim-ui.js';

let isRunning = false;
let simSpeed = 1.0;

const playControl = initToggleButton('#btn-play-sim', (active) => {
    isRunning = active;
});
```

### 3.2 Slider com Entrada Numérica Sincronizada (`.sim-dual-slider`)
Permite ao usuário arrastar a barra para ajuste fluido OU digitar um número exato com validação automática de limites `min` e `max`.

```javascript
import { syncDualSlider } from './sim-ui.js';

syncDualSlider('#slider-massa', '#num-massa', (valor) => {
    particula.massa = valor;
});
```

### 3.3 Mini-Gráfico de Telemetria 2D (`.sim-plot-card` / `RealtimePlot`)
Canvas 2D de alta performance com linha luminosa (*glow*), área preenchida em degradê e buffer circular sem vazamento de memória.

```javascript
import { RealtimePlot } from './sim-ui.js';

const plotEnergia = new RealtimePlot('#canvas-plot-k', {
    maxPoints: 80,
    minVal: 0.0,
    maxVal: 5.0
});

// No loop:
plotEnergia.push(valorAtual);
```

### 3.4 Modal Didático de Teoria e Fórmulas (`.sim-modal`)
Janela modal imersiva com *backdrop blur*, rolagem interna independente, suporte a KaTeX e fechamento via botão `✕`, clique externo ou tecla `Esc`.

```javascript
import { initModal } from './sim-ui.js';

const modal = initModal('#modal-teoria');
document.getElementById('btn-abrir-modal-teoria')?.addEventListener('click', () => modal.open());
```

### 3.5 Modo Foco Desktop / Recolhimento Lateral (`initSidebarCollapse`)
Recolhe o painel lateral com transição suave (350ms) e redimensionamento Three.js contínuo sem distorção. Atalho de teclado `F`.

```javascript
import { initSidebarCollapse } from './sim-ui.js';

initSidebarCollapse({
    layoutSelector: '.sim-layout',
    collapseBtnSelector: '#btn-collapse-sidebar',
    expandBtnSelector: '#btn-expand-sidebar',
    onResize: onWindowResize
});
```

### 3.6 Bottom Sheet Responsivo para Mobile & Tablet (`initBottomSheet`)
Em telas $\le 900\text{px}$, o painel de controles se transforma em um **Bottom Sheet ancorado na base** com suporte a toque/arraste vertical e 3 *snap points* (`peek`, `half`, `expanded`).

```javascript
import { initBottomSheet } from './sim-ui.js';

initBottomSheet({
    panelSelector: '.controls-panel',
    handleSelector: '#sheet-drag-handle',
    tabNavSelector: '.tab-nav',
    collapseBtnSelector: '#btn-collapse-sidebar',
    defaultState: 'peek'
});
```
