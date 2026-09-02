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

## 3. Esqueleto HTML Base (*Scaffolding*)

Ao criar qualquer nova simulação, utilize este esqueleto padrão completo (responsivo para Desktop e Mobile):

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nome da Simulação - Plataforma Científica</title>
    
    <!-- Favicon e Design System CSS -->
    <link rel="icon" type="image/svg+xml" href="../favicon.svg">
    <link rel="stylesheet" href="css/design-system.css">

    <!-- Suporte a Fórmulas Matemáticas com KaTeX -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"></script>

    <!-- Three.js via Importmap (ES Modules) -->
    <script type="importmap">
    {
        "imports": {
            "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js",
            "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/"
        }
    }
    </script>
</head>
<body>
    <!-- Cabeçalho da Simulação -->
    <header class="sim-header">
        <a href="../index.html#secao-simulacoes" class="btn-back">
            <svg class="icon-svg" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Voltar
        </a>
        <h1 class="sim-title">Título da Simulação</h1>
    </header>

    <!-- Layout Grid Principal -->
    <main class="sim-layout">
        <!-- 1. Área do Canvas 3D / 2D -->
        <div class="canvas-area">
            <div id="three-container"></div>

            <!-- Barra de Ferramentas / Seletor Rápido (Topo Esquerdo) -->
            <div class="canvas-toolbar pos-top-left" id="sim-toolbar">
                <span>🎨 Acento:</span>
                <div class="toolbar-dot active" style="--c: #facc15;" data-color="#facc15" title="Amarelo"></div>
                <div class="toolbar-dot" style="--c: #38bdf8;" data-color="#38bdf8" title="Ciano"></div>
                <div class="toolbar-dot" style="--c: #22c55e;" data-color="#22c55e" title="Verde"></div>
            </div>

            <!-- Grupo de Ações do Topo Direito (Rotação + Reabrir Controles no Modo Foco) -->
            <div class="canvas-top-actions">
                <button id="btn-quick-autorotate" class="canvas-btn-floating active" title="Alternar Rotação 3D">
                    <img src="../assets/icons/rotate.svg" class="icon-svg icon-spin" alt="Rotação">
                    <span class="btn-label-text">Rotação 3D</span>
                </button>
                <button id="btn-expand-sidebar" class="canvas-btn-expand-sidebar" title="Expandir Controles (F)">
                    <img src="../assets/icons/expand.svg" class="icon-svg" alt="Expandir">
                    <span class="btn-label-text">Controles</span>
                </button>
            </div>

            <!-- HUD de Telemetria no Canto Inferior Esquerdo -->
            <div class="sim-hud" id="sim-hud">
                <div class="hud-item">
                    <span class="hud-label">Status:</span>
                    <span class="hud-val" id="hud-status">Pronto</span>
                </div>
                <div class="hud-item">
                    <span class="hud-label">FPS:</span>
                    <span class="hud-val" id="hud-fps" style="color: var(--color-emerald, #22c55e);">60 fps</span>
                </div>
            </div>

            <!-- Dica Interativa Centralizada no Fundo (Desktop) -->
            <div class="interactive-hint">
                <img src="../assets/icons/lightbulb.svg" class="icon-svg icon-accent" alt="Dica">
                Arraste para orbitar a cena 3D e use o painel para ajustar os parâmetros.
            </div>
        </div>

        <!-- 2. Painel Lateral de Controles (Layout Tripartido / Bottom Sheet no Mobile) -->
        <aside class="controls-panel">
            <!-- Alça de Arraste para Mobile / Tablet (Bottom Sheet) -->
            <div class="sheet-drag-handle" id="sheet-drag-handle" title="Deslize ou toque para expandir/recolher">
                <div class="sheet-drag-pill"></div>
            </div>

            <!-- Topo: Barra de Abas Expansíveis -->
            <div class="tab-nav">
                <button class="tab-btn active" id="tab-btn-params">
                    <img src="../assets/icons/rotate.svg" class="icon-svg" alt="Parâmetros">
                    <span class="tab-label">Parâmetros</span>
                </button>
                <button class="tab-btn" id="tab-btn-theory">
                    <img src="../assets/icons/compass.svg" class="icon-svg" alt="Teoria">
                    <span class="tab-label">Teoria</span>
                </button>
                <button class="btn-collapse-sidebar" id="btn-collapse-sidebar" title="Modo Foco (F)">
                    <img src="../assets/icons/collapse.svg" class="icon-svg" alt="Recolher">
                </button>
            </div>

            <!-- Centro: Corpo Rolável de Conteúdo -->
            <div class="panel-body">
                <div id="panel-tab-params">
                    <!-- Controles e Sliders da Simulação -->
                </div>
                <div id="panel-tab-theory" style="display: none;">
                    <!-- Teoria e fórmulas matemáticas KaTeX -->
                </div>
            </div>

            <!-- Base: Rodapé Fixo de Telemetria -->
            <div class="panel-footer">
                <div class="sim-badge" id="footer-status-badge">
                    <span class="status-dot"></span>
                    <span id="footer-status-text">Simulação Pronta</span>
                </div>
                <span class="footer-meta" id="footer-sim-timer">t = 0.00s</span>
            </div>
        </aside>
    </main>

    <script type="module" src="scripts/sua_simulacao.js"></script>
</body>
</html>
```

---

## 4. Catálogo de Componentes & Receitas de Código (HTML + JS)

### 4.1 Barra de Reprodução Físico-Temporal (`.sim-transport-bar`)
Controle temporal completo contendo: Play/Pause binário, avanço discreto de passo ($\Delta t$), reinício para $t=0$ e seletor de velocidade temporal.

#### HTML:
```html
<div class="sim-transport-bar">
    <div class="transport-controls-row">
        <button class="btn-primary btn-toggle transport-btn-play" id="btn-play-sim"
                data-state="0"
                data-text-idle="Executar"
                data-text-active="Pausar"
                data-icon-idle="play"
                data-icon-active="pause">
            <img src="../assets/icons/play.svg" class="icon-svg" alt="Play">
            <span class="btn-text">Executar</span>
        </button>
        <button class="btn-icon" id="btn-step-sim" title="Avançar 1 Passo (Δt)">
            <img src="../assets/icons/step.svg" class="icon-svg" alt="Passo">
        </button>
        <button class="btn-icon" id="btn-reset-sim" title="Reiniciar (t = 0)">
            <img src="../assets/icons/refresh.svg" class="icon-svg" alt="Reset">
        </button>
    </div>

    <div class="transport-speed-row">
        <span class="transport-speed-label">
            <img src="../assets/icons/rotate.svg" class="icon-svg" style="width: 14px; height: 14px;" alt="Velocidade">
            Velocidade:
        </span>
        <div class="transport-speed-pills" id="sim-speed-pills">
            <button class="speed-btn" data-speed="0.5">0.5×</button>
            <button class="speed-btn active" data-speed="1.0">1.0×</button>
            <button class="speed-btn" data-speed="2.0">2.0×</button>
            <button class="speed-btn" data-speed="5.0">5.0×</button>
        </div>
    </div>
</div>
```

#### JavaScript:
```javascript
import { initToggleButton } from './sim-ui.js';

let isRunning = false;
let simSpeed = 1.0;
let simTime = 0.0;

// Inicializa o botão de play/pause
const playControl = initToggleButton('#btn-play-sim', (active) => {
    isRunning = active;
});

// Botão de Passo Único (dt)
document.getElementById('btn-step-sim')?.addEventListener('click', () => {
    if (isRunning) playControl.setState(0);
    simularPasso(0.05);
});

// Botão de Reset
document.getElementById('btn-reset-sim')?.addEventListener('click', () => {
    if (isRunning) playControl.setState(0);
    simTime = 0.0;
    reiniciarFisica();
});

// Seletor de Velocidade
document.querySelectorAll('#sim-speed-pills .speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('#sim-speed-pills .speed-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        simSpeed = parseFloat(btn.dataset.speed || '1.0');
    });
});
```

---

### 4.2 Slider com Entrada Numérica Sincronizada (`.sim-dual-slider`)
Permite ao usuário arrastar a barra para ajuste fluido OU digitar um número exato com validação automática de limites `min` e `max`.

#### HTML:
```html
<div class="control-group">
    <div class="slider-container sim-dual-slider">
        <div class="slider-header">
            <label for="slider-massa" class="slider-label">Massa do Corpo ($m$)</label>
            <div class="dual-input-wrapper">
                <input type="number" class="dual-input-number" id="num-massa"
                       min="0.1" max="10.0" step="0.1" value="2.5">
                <span class="dual-input-unit">kg</span>
            </div>
        </div>
        <input type="range" class="sim-slider" id="slider-massa"
               min="0.1" max="10.0" step="0.1" value="2.5">
    </div>
</div>
```

#### JavaScript:
```javascript
import { syncDualSlider } from './sim-ui.js';

// Sincronização bidirecional em 1 linha:
syncDualSlider('#slider-massa', '#num-massa', (valor) => {
    particula.massa = valor;
});
```

---

### 4.3 Mini-Gráfico de Telemetria 2D (`.sim-plot-card` / `RealtimePlot`)
Canvas 2D de alta performance com linha luminosa (*glow*), área preenchida em degradê e buffer circular sem vazamento de memória.

#### HTML:
```html
<div class="control-group">
    <div class="sim-plot-card" id="card-telemetria">
        <div class="plot-header">
            <div class="plot-title-group">
                <span class="plot-dot"></span>
                <span class="plot-title">Energia Cinética $K(t)$</span>
            </div>
            <div class="plot-stats">
                <span class="plot-stat-label">Atual:</span>
                <span class="plot-stat-val" id="plot-valor-k">0.00 J</span>
            </div>
        </div>
        <div class="plot-canvas-wrapper">
            <canvas class="sim-plot-canvas" id="canvas-plot-k"></canvas>
            <span class="plot-axis-label plot-axis-max">+5.0</span>
            <span class="plot-axis-label plot-axis-min">0.0</span>
        </div>
    </div>
</div>
```

#### JavaScript:
```javascript
import { RealtimePlot } from './sim-ui.js';

// Cria o gráfico com limites
const plotEnergia = new RealtimePlot('#canvas-plot-k', {
    maxPoints: 80,
    minVal: 0.0,
    maxVal: 5.0
});

// No loop de animação (requestAnimationFrame):
function loop() {
    const valorAtual = particula.calcularEnergia();
    plotEnergia.push(valorAtual);
    document.getElementById('plot-valor-k').textContent = `${valorAtual.toFixed(2)} J`;
}
```

---

### 4.4 Modal Didático de Teoria e Fórmulas (`.sim-modal`)
Janela modal imersiva com *backdrop blur*, rolagem interna independente, suporte a KaTeX e fechamento via botão `✕`, botão de ação, clique externo ou tecla `Esc`.

#### HTML:
```html
<!-- Botão no Painel para abrir -->
<button class="btn-secondary" id="btn-abrir-modal-teoria" style="width: 100%;">
    <img src="../assets/icons/compass.svg" class="icon-svg" alt="Teoria"> Ver Dedução Matemática Completa
</button>

<!-- Estrutura do Modal (colocar antes de </body>) -->
<div id="modal-teoria" class="sim-modal-overlay hidden" aria-hidden="true" role="dialog">
    <div class="sim-modal-container">
        <div class="sim-modal-header">
            <div class="sim-modal-title">
                <img src="../assets/icons/compass.svg" class="icon-svg icon-accent" alt="Teoria">
                <span>Fundamentação Teórica & Dedução</span>
            </div>
            <button class="sim-modal-close" data-modal-close title="Fechar (Esc)">✕</button>
        </div>

        <div class="sim-modal-body">
            <div class="theory-section">
                <h4>1. Equações Diferenciais Governantes</h4>
                <p>O campo escalar satisfaz a equação de Helmholtz:</p>
                $$\nabla^2 \psi + k^2 \psi = 0$$
            </div>
            <div class="theory-callout">
                <strong>💡 Nota:</strong> $k = \omega / c$ é o número de onda no meio.
            </div>
        </div>

        <div class="sim-modal-footer">
            <span class="sim-modal-hint">Pressione <kbd>Esc</kbd> para fechar</span>
            <button class="btn-primary" data-modal-close>Entendido</button>
        </div>
    </div>
</div>
```

#### JavaScript:
```javascript
import { initModal } from './sim-ui.js';

const modal = initModal('#modal-teoria');
document.getElementById('btn-abrir-modal-teoria')?.addEventListener('click', () => {
    modal.open();
});
```

---

### 4.5 Modo Foco Desktop / Recolhimento Lateral (`initSidebarCollapse`)
Recolhe o painel lateral com transição suave (350ms) e redimensionamento Three.js contínuo sem distorção de aspect ratio. Suporta o atalho de teclado `F` ou `[`.

#### JavaScript:
```javascript
import { initSidebarCollapse } from './sim-ui.js';

initSidebarCollapse({
    layoutSelector: '.sim-layout',
    collapseBtnSelector: '#btn-collapse-sidebar',
    expandBtnSelector: '#btn-expand-sidebar',
    onResize: onWindowResize // Função de resize da câmera Three.js
});
```

---

### 4.6 Bottom Sheet Responsivo para Mobile & Tablet (`initBottomSheet`)
Em telas com largura $\le 900\text{px}$, o painel de controles se transforma automaticamente em um **Bottom Sheet ancorado na base** com suporte a toque/arraste vertical e 3 *snap points* (`peek`, `half`, `expanded`).

#### HTML (inserir no topo de `<aside class="controls-panel">`):
```html
<div class="sheet-drag-handle" id="sheet-drag-handle" title="Deslize ou toque para expandir/recolher">
    <div class="sheet-drag-pill"></div>
</div>
```

#### JavaScript:
```javascript
import { initBottomSheet } from './sim-ui.js';

initBottomSheet({
    panelSelector: '.controls-panel',
    handleSelector: '#sheet-drag-handle',
    tabNavSelector: '.tab-nav',
    collapseBtnSelector: '#btn-collapse-sidebar',
    defaultState: 'peek' // 'peek' (recolhido) ou 'half' (meia tela)
});
```

---

### 4.7 Botões de Ação, Alternância 0/1 e Presets

#### Botão de Alternância (Toggle $0 \leftrightarrow 1$):
```html
<button class="btn-primary btn-toggle" id="btn-toggle-demo"
        data-state="0"
        data-text-idle="Ligar Força de Arrasto"
        data-text-active="Desligar Arrasto"
        data-icon-idle="play"
        data-icon-active="pause">
    <img src="../assets/icons/play.svg" class="icon-svg" alt="Toggle">
    <span class="btn-text">Ligar Força de Arrasto</span>
</button>
```

#### Grade de Presets 2x2:
```html
<div class="sim-divider-label"><span>Condições Iniciais</span></div>
<div class="control-grid-2x2">
    <button class="btn-preset active" id="preset-1">
        <img src="../assets/icons/sun.svg" class="icon-svg" alt="Sol"> Vácuo
    </button>
    <button class="btn-preset" id="preset-2">
        <img src="../assets/icons/wind.svg" class="icon-svg" alt="Ar"> Atmosfera
    </button>
</div>
```

---

### 4.8 Barra Flutuante & Popovers no Canvas (`.canvas-toolbar` / `.sim-popover`)

```html
<!-- Barra Flutuante no Topo Esquerdo -->
<div class="canvas-toolbar pos-top-left">
    <span>🎨 Acento:</span>
    <div class="toolbar-dot active" style="--c: #facc15;" title="Amarelo"></div>
    <div class="toolbar-dot" style="--c: #38bdf8;" title="Ciano"></div>
    <div class="toolbar-divider"></div>
    <button class="toolbar-btn" id="btn-abrir-popover">
        <img src="../assets/icons/sparkles.svg" class="icon-svg" alt="Opções">
        <span>Opções</span>
    </button>
</div>
```

---

### 4.9 Galeria de Ícones Vetoriais Nativos (`assets/icons/`)

Todos os 19 ícones vetoriais estão disponíveis em `assets/icons/` e adaptam-se automaticamente à cor do texto via `currentColor`:

| Nome do Ícone | Arquivo | Finalidade Sugerida |
| :--- | :--- | :--- |
| `play` | `play.svg` | Executar, Iniciar simulação |
| `pause` | `pause.svg` | Pausar simulação |
| `step` | `step.svg` | Avançar 1 quadro temporal ($\Delta t$) |
| `refresh` | `refresh.svg` | Reiniciar parâmetros ($t=0$) |
| `rotate` | `rotate.svg` | Rotação 3D, Sliders, Velocidade angular |
| `collapse` | `collapse.svg` | Recolher painel lateral (Modo Foco) |
| `expand` | `expand.svg` | Expandir painel lateral |
| `compass` | `compass.svg` | Teoria, Vetores, Direção matemática |
| `sparkles` | `sparkles.svg` | Customização, Efeitos visuais, Destaque |
| `lightbulb` | `lightbulb.svg` | Dicas interativas, Ajuda |
| `dice` | `dice.svg` | Sortear valores aleatórios |
| `sun` | `sun.svg` | Fonte de luz, Radiação, Calor |
| `snowflake` | `snowflake.svg` | Baixa temperatura, Criogenia |
| `thermometer` | `thermometer.svg` | Temperatura termodinâmica |
| `wind` | `wind.svg` | Campo de velocidades, Convecção |
| `cyclone` | `cyclone.svg` | Vórtices, Coriolis, Turbulência |
| `globe` | `globe.svg` | Coordenadas globais, Esfera |
| `leaf` | `leaf.svg` | Ecologia, Dinâmica de populações |
| `flower` | `flower.svg` | Padrões de Turing, Biologia |

Para renderizar um ícone com coloração automática:
```html
<img src="../assets/icons/rotate.svg" class="icon-svg" alt="Rotação">
```

---

## 5. Checklist para Criar uma Nova Simulação do Zero

1. [ ] **Copiar o esqueleto base** do item `3` deste guia para o novo arquivo `.html`.
2. [ ] **Definir as abas** no `.tab-nav` e criar os containers correspondentes no `.panel-body`.
3. [ ] **Adicionar a Barra de Reprodução** (`.sim-transport-bar`) caso a simulação envolva evolução temporal.
4. [ ] **Adicionar os Sliders Sincronizados** (`.sim-dual-slider`) para as grandezas físicas configuráveis.
5. [ ] **Adicionar o Mini-Gráfico** (`.sim-plot-card`) caso haja interesse em monitorar curvas como energia, velocidade ou posição.
6. [ ] **Adicionar o Modal Teórico** (`.sim-modal`) com as deduções matemáticas e fórmulas KaTeX.
7. [ ] **No JavaScript**:
   * Importar controladores de `./sim-ui.js`.
   * Chamar `initSidebarCollapse({ onResize: onWindowResize })`.
   * Chamar `initBottomSheet({ defaultState: 'peek' })`.
   * Chamar `syncDualSlider(...)` para cada parâmetro.
   * Executar `inlineSVGImages()` e `renderMathInElement(document.body)` no `DOMContentLoaded`.
