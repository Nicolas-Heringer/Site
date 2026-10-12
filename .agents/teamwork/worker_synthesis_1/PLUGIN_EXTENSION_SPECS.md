# R3: Especificações Técnicas de Extensão do Plugin `simulacoes-lab`

**Data de Emissão:** 12 de Outubro de 2026  
**Autor:** Worker Synthesis 1 (Technical Documentation and Synthesis Worker)  
**Escopo:** Especificação Formal de 4 Novos Componentes e Extensões de UI para o Plugin `.agents/plugins/simulacoes-lab/`  
**Padrão Alvo:** Design System 2.0 (`sim-ui.js`, `design-system.css`, KaTeX CDN, SVG nativos)  
**Objetivo:** Suprir lacunas estruturais de física especializada, telemetria avançada e ergonomia mobile, eliminando dependências externas (`Chart.js`, `numeric.js`)  

---

## 1. Visão Geral da Expansão Arquitetural

Com base na auditoria exaustiva das 14 simulações e nas lacunas identificadas em `matrizes.html`, `tensor_de_inercia.html`, `gravidade.html`, `clima.html` e `movimento.html`, foram concebidas **quatro novas extensões de componentes** de primeira classe para o ecossistema do plugin `simulacoes-lab`:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   NOVAS EXTENSÕES DO PLUGIN SIMULACOES-LAB             │
├─────────────────────────┬──────────────────────────────────────────────┤
│ 1. MatrixTensorEditor   │ Manipulador interativo 2x2 e 3x3 com         │
│                         │ simetria, traço, determinante e autovalores. │
├─────────────────────────┼──────────────────────────────────────────────┤
│ 2. MultiSeriesPlot      │ Telemetria multieixo em tempo real e         │
│                         │ diagramas de espaço de fase (substitui Chart)│
├─────────────────────────┼──────────────────────────────────────────────┤
│ 3. Vector3DPicker       │ Seletor 3D interativo de eixos e vetores com │
│                         │ coordenadas esféricas (θ, φ) e presets.      │
├─────────────────────────┼──────────────────────────────────────────────┤
│ 4. TouchCanvasController│ Controlador de gestos com touch-action: none,│
│                         │ pinch-to-zoom e abstração de ponteiro.       │
└─────────────────────────┴──────────────────────────────────────────────┘
```

Cada especificação abaixo é acompanhada de sua motivação física, contrato completo de API em TypeScript / JSDoc, estrutura semântica HTML, tokens CSS do Design System 2.0 e exemplo de integração em código real.

---

## 2. Componente 1: `MatrixTensorEditor` (Editor & Visualizador de Matrizes e Tensores)

### 2.1 Motivação Física & Necessidade de Engenharia
* **Domínios Físicos**: Transformações lineares em 2D (`matrizes.html`), Tensores de Inércia em mecânica do corpo rígido (`tensor_de_inercia.html`), tensores de tensão/deformação em elasticidade, e matrizes de rotação no espaço.
* **Problema Resolvido**: Atualmente, `matrizes.html` e `tensor_de_inercia.html` utilizam marcações HTML rudimentares e não padronizadas (`.matrix-box`, `.tensor-matrix`). Não existe suporte a:
  1. Forçar simetria física do tensor ($I_{ij} = I_{ji}$), onde alterar a célula $(1, 2)$ atualiza instantaneamente a célula $(2, 1)$.
  2. Cálculo automático síncrono de invariantes tensoriais (Traço $\text{tr}(\mathbf{I}) = I_{xx} + I_{yy} + I_{zz}$, Determinante $\det(\mathbf{I})$, e Autovalores principais $I_1, I_2, I_3$).
  3. Renderização reativa de equações matemáticas em KaTeX acoplada aos valores dos campos.

---

### 2.2 Contrato de API (TypeScript / JSDoc)
```typescript
/**
 * Opções de configuração para o MatrixTensorEditor
 */
export interface MatrixEditorOptions {
    /** Dimensão da matriz quadrada: 2 para 2x2 ou 3 para 3x3 (padrão: 2) */
    dimensions?: 2 | 3;
    /** Habilita edição de inputs pelo usuário; se false, atua como visualizador (padrão: true) */
    editable?: boolean;
    /** Impõe simetria matricial M[i][j] === M[j][i] (padrão: false) */
    symmetric?: boolean;
    /** Incremento do input numérico step (padrão: 0.1) */
    step?: number;
    /** Limite numérico inferior para as células (padrão: -100) */
    min?: number;
    /** Limite numérico superior para as células (padrão: 100) */
    max?: number;
    /** Rótulos subscritos para cada célula (ex: [['Ixx', 'Ixy'], ['Iyx', 'Iyy']]) */
    labels?: string[][];
    /** Exibe badge com o cálculo em tempo real de det(M) (padrão: true) */
    showDeterminant?: boolean;
    /** Exibe badge com o cálculo em tempo real de tr(M) (padrão: false) */
    showTrace?: boolean;
    /** Exibe lista com os autovalores principais calculados analiticamente (padrão: false) */
    showEigenvalues?: boolean;
    /** Callback disparado a cada alteração de célula ou método programático */
    onChange?: (matrix: number[][], metrics: MatrixMetrics) => void;
}

/**
 * Métricas e invariantes calculados a partir da matriz atual
 */
export interface MatrixMetrics {
    determinant: number;
    trace: number;
    eigenvalues: number[];
    isSingular: boolean;
    isSymmetric: boolean;
}

/**
 * Classe controladora para edição e renderização de matrizes e tensores
 */
export class MatrixTensorEditor {
    constructor(containerTarget: string | HTMLElement, options?: MatrixEditorOptions);

    /** Retorna a matriz atual como array bidimensional [linhas][colunas] */
    public getMatrix(): number[][];

    /** Atualiza a matriz completa e recalcula invariantes */
    public setMatrix(newMatrix: number[][]): void;

    /** Atualiza o valor de uma célula específica (0-indexed) */
    public setCell(row: number, col: number, value: number): void;

    /** Alterna modo de edição */
    public setEditable(editable: boolean): void;

    /** Alterna imposição de simetria */
    public setSymmetric(symmetric: boolean): void;

    /** Força re-renderização da árvore DOM e fórmulas KaTeX */
    public render(): void;

    /** Destrói ouvintes de eventos e libera referências */
    public destroy(): void;
}
```

---

### 2.3 Estrutura HTML Semântica Padrão
```html
<div class="sim-matrix-card" id="tensor-editor-container">
    <div class="matrix-header">
        <span class="matrix-title">
            <img src="../assets/icons/cube.svg" class="icon-svg" alt="Tensor">
            Tensor de Inércia $\mathbf{I}$
        </span>
        <div class="matrix-badges">
            <span class="sim-badge" id="badge-det">$\det(\mathbf{I}) = 1.000$</span>
            <span class="sim-badge" id="badge-tr">$\mathrm{tr}(\mathbf{I}) = 3.000$</span>
        </div>
    </div>
    
    <div class="matrix-bracket-container">
        <span class="matrix-bracket bracket-left" aria-hidden="true">[</span>
        <div class="matrix-grid matrix-grid-3x3" role="grid" aria-label="Células do Tensor de Inércia">
            <!-- Célula (0,0) -->
            <div class="matrix-cell" data-row="0" data-col="0" role="gridcell">
                <input type="number" class="matrix-input" value="1.0" step="0.1" aria-label="Ixx">
                <span class="matrix-sub">I_{xx}</span>
            </div>
            <!-- Células subsequentes geradas dinamicamente -->
        </div>
        <span class="matrix-bracket bracket-right" aria-hidden="true">]</span>
    </div>

    <!-- Painel Opcional de Autovalores Principais -->
    <div class="matrix-eigen-section">
        <span class="eigen-title">Momentos Principais de Inércia:</span>
        <div class="eigen-values-row">
            <span class="sim-badge badge-accent">I_1 = 1.00</span>
            <span class="sim-badge badge-accent">I_2 = 1.00</span>
            <span class="sim-badge badge-accent">I_3 = 1.00</span>
        </div>
    </div>
</div>
```

---

### 2.4 Tokens e Classes CSS (`design-system.css`)
```css
/* ==========================================================================
   COMPONENTE: MatrixTensorEditor
   ========================================================================== */
.sim-matrix-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    box-shadow: var(--shadow-sm);
}

.matrix-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
}

.matrix-title {
    font-size: 0.88rem;
    font-weight: 600;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 6px;
}

.matrix-badges {
    display: flex;
    align-items: center;
    gap: 6px;
}

.matrix-bracket-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 4px 0;
}

.matrix-bracket {
    font-size: 2.8rem;
    font-weight: 200;
    color: var(--text-muted);
    user-select: none;
    line-height: 1;
}

.matrix-grid-2x2 {
    display: grid;
    grid-template-columns: repeat(2, 68px);
    gap: 8px;
}

.matrix-grid-3x3 {
    display: grid;
    grid-template-columns: repeat(3, 60px);
    gap: 6px;
}

.matrix-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: var(--bg-input);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    padding: 5px 3px;
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.matrix-cell:focus-within {
    border-color: var(--accent-slider, var(--accent-color));
    box-shadow: 0 0 0 1px var(--accent-slider, var(--accent-color));
}

.matrix-cell.cell-linked {
    background: color-mix(in srgb, var(--accent-color) 8%, var(--bg-input));
}

.matrix-input {
    width: 100%;
    background: transparent;
    border: none;
    color: var(--accent-slider, var(--accent-color));
    font-family: var(--font-mono);
    font-size: 0.84rem;
    font-weight: 600;
    text-align: center;
    outline: none;
}

.matrix-sub {
    font-size: 0.65rem;
    color: var(--text-muted);
    font-family: var(--font-mono);
    margin-top: 2px;
}

.matrix-eigen-section {
    display: flex;
    flex-direction: column;
    gap: 4px;
    border-top: 1px solid var(--border-subtle);
    padding-top: 8px;
}

.eigen-title {
    font-size: 0.72rem;
    color: var(--text-secondary);
}

.eigen-values-row {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}
```

---

### 2.5 Exemplo de Integração em `simulacoes/scripts/matrizes.js`
```javascript
import { MatrixTensorEditor } from './sim-ui.js';

// Inicializa editor interativo 2x2 para transformações lineares
const editorTransformacao = new MatrixTensorEditor('#editor-matriz-2d', {
    dimensions: 2,
    editable: true,
    symmetric: false,
    step: 0.05,
    min: -10,
    max: 10,
    labels: [
        ['a_{11}', 'a_{12}'],
        ['a_{21}', 'a_{22}']
    ],
    showDeterminant: true,
    showTrace: true,
    onChange: (matrix, metrics) => {
        // Atualiza os vetores da base no canvas da simulação
        vetorI.set(matrix[0][0], matrix[1][0]);
        vetorJ.set(matrix[0][1], matrix[1][1]);
        
        // Atualiza badge visual de orientação espacial
        document.getElementById('orientacao-status').textContent = 
            metrics.determinant > 0 ? 'Preserva Orientação' : 
            metrics.determinant < 0 ? 'Inverte Orientação' : 'Colapso Linear';
        
        redesenharCena();
    }
});
```

---

## 3. Componente 2: `MultiSeriesPlot` (Telemetria Multieixo & Diagramas de Espaço de Fase)

### 3.1 Motivação Física & Necessidade de Engenharia
* **Domínios Físicos**: Conservação de Energia em Gravitação (`gravidade.html` — onde é mandatório plotar $K(t)$, $U(t)$ e $E(t) = K + U$ sobrepostos), sistemas dinâmicos e osciladores (onde o diagrama de espaço de fase $(x, p)$ revela atratores e ciclos-limite), e termodinâmica estatística (`particulas.html`).
* **Problema Resolvido**: `RealtimePlot` suporta estritamente uma única curva escalar $y(t)$. Por causa dessa limitação, `gravidade.html` foi forçada a carregar a pesada biblioteca externa **Chart.js via CDN**, que quebra em telas móveis e não se integra aos tokens CSS do Design System. O `MultiSeriesPlot` resolve isso com Canvas 2D nativo ultraleve a 60 FPS.

---

### 3.2 Contrato de API (TypeScript / JSDoc)
```typescript
/**
 * Definição de uma série de dados a ser plotada
 */
export interface SeriesDefinition {
    /** Identificador único da série (ex: 'cinetica', 'potencial') */
    id: string;
    /** Rótulo legível para a legenda */
    label: string;
    /** Cor de traçado (hexadecimal ou variável CSS var(--...)) */
    color: string;
    /** Padrão de traço pontilhado [tamanhoTraço, tamanhoEspaço] (opcional) */
    dash?: number[];
    /** Espessura da linha em pixels (padrão: 1.5) */
    lineWidth?: number;
    /** Visibilidade inicial da curva (padrão: true) */
    visible?: boolean;
}

/**
 * Opções de inicialização do MultiSeriesPlot
 */
export interface MultiPlotOptions {
    /** Modo de plotagem: 'timeseries' (evolução temporal) ou 'phase' (espaço de fase X vs Y) */
    mode?: 'timeseries' | 'phase';
    /** Capacidade máxima do buffer circular de pontos (padrão: 100) */
    maxPoints?: number;
    /** Limite mínimo de X (no modo 'phase') */
    minX?: number;
    /** Limite máximo de X (no modo 'phase') */
    maxX?: number;
    /** Limite mínimo de Y (padrão: automático se autoScaleY for true) */
    minY?: number;
    /** Limite máximo de Y (padrão: automático se autoScaleY for true) */
    maxY?: number;
    /** Habilita ajuste automático amortecido dos limites verticais (padrão: true) */
    autoScaleY?: boolean;
    /** Exibe linhas de grade e eixos cartesianos (padrão: true) */
    showGrid?: boolean;
    /** Exibe legenda no topo do gráfico com toggles de visibilidade (padrão: true) */
    showLegend?: boolean;
    /** Unidade física da grandeza vertical para exibição no eixo (ex: "J", "m/s", "V") */
    unitY?: string;
    /** Rótulo do eixo horizontal (padrão: "t" no modo timeseries, "x" no modo phase) */
    labelX?: string;
}

/**
 * Classe controladora de gráficos multissérie em tempo real
 */
export class MultiSeriesPlot {
    constructor(canvasTarget: string | HTMLCanvasElement, options?: MultiPlotOptions);

    /** Registra uma nova série temporal no gráfico */
    public addSeries(series: SeriesDefinition): void;

    /** Remove uma série existente pelo ID */
    public removeSeries(seriesId: string): void;

    /** Insere amostras no modo 'timeseries': push({ cinetica: 12.4, potencial: -5.2, total: 7.2 }) */
    public push(dataMap: Record<string, number>): void;

    /** Insere ponto de trajetória paramétrica no modo 'phase': pushPhasePoint(x, px) */
    public pushPhasePoint(x: number, y: number): void;

    /** Limpa os buffers de dados de todas as séries */
    public clear(): void;

    /** Alterna dinamicamente entre os modos 'timeseries' e 'phase' */
    public setMode(mode: 'timeseries' | 'phase'): void;

    /** Força recálculo de escala e renderização imediata */
    public render(): void;

    /** Reajusta resolução interna ao redimensionar a tela (suporte a telas Retina) */
    public resize(): void;

    /** Destrói observers e cancela animações */
    public destroy(): void;
}
```

---

### 3.3 Estrutura HTML Semântica Padrão
```html
<div class="sim-plot-card" id="card-telemetria-energia">
    <div class="plot-card-header">
        <span class="plot-title">
            <img src="../assets/icons/pulse.svg" class="icon-svg" alt="Telemetria">
            Conservação de Energia Mecânica
        </span>
        <div class="plot-legend" id="plot-legend-container">
            <!-- Gerado dinamicamente pelo MultiSeriesPlot -->
            <button class="legend-item active" data-series="K">
                <span class="legend-dot" style="background: #38bdf8;"></span>
                <span class="legend-label">Cinética ($K$)</span>
            </button>
            <button class="legend-item active" data-series="U">
                <span class="legend-dot" style="background: #f43f5e;"></span>
                <span class="legend-label">Potencial ($U$)</span>
            </button>
            <button class="legend-item active" data-series="E">
                <span class="legend-dot" style="background: #facc15;"></span>
                <span class="legend-label">Total ($E$)</span>
            </button>
        </div>
    </div>
    <div class="plot-canvas-wrapper">
        <canvas id="canvas-energia-multi" class="multi-series-canvas"></canvas>
    </div>
</div>
```

---

### 3.4 Tokens e Classes CSS (`design-system.css`)
```css
/* ==========================================================================
   COMPONENTE: MultiSeriesPlot
   ========================================================================== */
.plot-legend {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.legend-item {
    background: transparent;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-full);
    padding: 2px 8px;
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.72rem;
    color: var(--text-secondary);
    cursor: pointer;
    transition: background var(--transition-fast), opacity var(--transition-fast);
}

.legend-item:not(.active) {
    opacity: 0.4;
    text-decoration: line-through;
}

.legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}

.plot-canvas-wrapper {
    position: relative;
    width: 100%;
    height: 140px;
    background: var(--bg-surface);
    border-radius: var(--radius-md);
    overflow: hidden;
}

.multi-series-canvas {
    width: 100%;
    height: 100%;
    display: block;
}
```

---

### 3.5 Exemplo de Integração em `simulacoes/scripts/gravidade.js`
```javascript
import { MultiSeriesPlot } from './sim-ui.js';

// Substitui Chart.js por componente nativo leve e reativo
const plotEnergia = new MultiSeriesPlot('#canvas-energia-multi', {
    mode: 'timeseries',
    maxPoints: 120,
    unitY: 'J',
    autoScaleY: true,
    showGrid: true,
    showLegend: true
});

plotEnergia.addSeries({ id: 'K', label: 'Cinética', color: '#38bdf8' });
plotEnergia.addSeries({ id: 'U', label: 'Potencial', color: '#f43f5e' });
plotEnergia.addSeries({ id: 'E', label: 'Mecânica Total', color: '#facc15', lineWidth: 2 });

// Dentro do loop de animação física (60 FPS):
function loopSimulacao() {
    integradorVerlet.step(dt);
    
    const K = corpo.calcularEnergiaCinetica();
    const U = corpo.calcularEnergiaPotencial();
    const E = K + U;
    
    // Atualização instantânea em buffer circular sem alocação no heap
    plotEnergia.push({ K, U, E });
    
    requestAnimationFrame(loopSimulacao);
}
```

---

## 4. Componente 3: `Vector3DPicker` (Seletor Interativo de Vetores e Direções 3D)

### 4.1 Motivação Física & Necessidade de Engenharia
* **Domínios Físicos**: Seleção do eixo de rotação unitário $\hat{n} = (n_x, n_y, n_z)$ em `tensor_de_inercia.html`, direção do campo elétrico $\vec{E}$ ou magnético $\vec{B}$ em `drude.html` e `atomo_de_hidrogenio.html`, e vetor de onda $\vec{k}$ do feixe de luz em `snell.html`.
* **Problema Resolvido**: Hoje o usuário é forçado a digitar 3 coordenadas cartesianas desconexas em inputs separados ou alternar entre 3 botões estáticos ($X, Y, Z$). Falta um componente ergonômico com suporte a coordenadas esféricas $(\theta, \phi)$, mini-esfera interativa tocável com o polegar no mobile e botões de presets rápidos.

---

### 4.2 Contrato de API (TypeScript / JSDoc)
```typescript
/**
 * Objeto com as representações cartesianas e esféricas do vetor
 */
export interface Vector3DState {
    /** Coordenada cartesiana X */
    x: number;
    /** Coordenada cartesiana Y */
    y: number;
    /** Coordenada cartesiana Z */
    z: number;
    /** Ângulo polar θ em radianos [0, π] */
    theta: number;
    /** Ângulo azimutal φ em radianos [0, 2π] */
    phi: number;
    /** Norma euclidiana do vetor |v| */
    magnitude: number;
}

/**
 * Opções de inicialização do Vector3DPicker
 */
export interface VectorPickerOptions {
    /** Vetor inicial [x, y, z] (padrão: [0, 1, 0]) */
    defaultVector?: [number, number, number];
    /** Força o vetor a manter norma unitária |v| === 1 (padrão: true) */
    normalized?: boolean;
    /** Exibe mini-esfera gráfica interativa para arrasto do vetor (padrão: true) */
    showGimbalSphere?: boolean;
    /** Exibe sliders para os ângulos esféricos polar θ e azimutal φ (padrão: true) */
    showSphericalInputs?: boolean;
    /** Passo numérico para as coordenadas cartesianas (padrão: 0.05) */
    step?: number;
    /** Callback disparado em qualquer mudança de orientação */
    onChange?: (state: Vector3DState) => void;
}

/**
 * Classe controladora de seleção e manipulação de vetores 3D
 */
export class Vector3DPicker {
    constructor(containerTarget: string | HTMLElement, options?: VectorPickerOptions);

    /** Retorna as coordenadas cartesianas como tupla [x, y, z] */
    public getVector(): [number, number, number];

    /** Define o vetor a partir de coordenadas cartesianas */
    public setVector(x: number, y: number, z: number): void;

    /** Define o vetor a partir de ângulos esféricos (em radianos) */
    public setSpherical(thetaRad: number, phiRad: number): void;

    /** Aplica um preset rápido ('x', 'y', 'z', '-x', '-y', '-z') */
    public setPreset(axis: 'x' | 'y' | 'z' | '-x' | '-y' | '-z'): void;

    /** Destrói ouvintes e libera memória */
    public destroy(): void;
}
```

---

### 4.3 Estrutura HTML Semântica Padrão
```html
<div class="sim-vector-picker" id="picker-eixo-rotacao">
    <div class="vector-header">
        <label class="vector-label">
            <img src="../assets/icons/compass.svg" class="icon-svg" alt="Vetor">
            Eixo de Rotação ($\hat{n}$)
        </label>
        <div class="vector-presets-pills">
            <button class="pill-btn" data-preset="x">X</button>
            <button class="pill-btn active" data-preset="y">Y</button>
            <button class="pill-btn" data-preset="z">Z</button>
        </div>
    </div>

    <!-- Mini-Gimbal Visual 3D -->
    <div class="vector-interactive-row">
        <div class="vector-gimbal-canvas-wrapper">
            <canvas class="gimbal-canvas" width="80" height="80"></canvas>
        </div>
        <div class="vector-coords-column">
            <div class="vector-coord-item">
                <span class="coord-tag tag-x">x</span>
                <input type="number" class="coord-input" id="vec-x" value="0.00" step="0.05">
            </div>
            <div class="vector-coord-item">
                <span class="coord-tag tag-y">y</span>
                <input type="number" class="coord-input" id="vec-y" value="1.00" step="0.05">
            </div>
            <div class="vector-coord-item">
                <span class="coord-tag tag-z">z</span>
                <input type="number" class="coord-input" id="vec-z" value="0.00" step="0.05">
            </div>
        </div>
    </div>
</div>
```

---

### 4.4 Tokens e Classes CSS (`design-system.css`)
```css
/* ==========================================================================
   COMPONENTE: Vector3DPicker
   ========================================================================== */
.sim-vector-picker {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.vector-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.vector-label {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 6px;
}

.vector-presets-pills {
    display: flex;
    gap: 4px;
}

.vector-presets-pills .pill-btn {
    background: var(--bg-input);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    color: var(--text-secondary);
    padding: 2px 8px;
    font-size: 0.72rem;
    cursor: pointer;
    min-height: 28px;
}

.vector-presets-pills .pill-btn.active {
    background: var(--accent-color);
    color: var(--bg-main);
    font-weight: 700;
    border-color: var(--accent-color);
}

.vector-interactive-row {
    display: flex;
    align-items: center;
    gap: 12px;
}

.vector-gimbal-canvas-wrapper {
    width: 80px;
    height: 80px;
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: grab;
    touch-action: none;
}

.vector-coords-column {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
}

.vector-coord-item {
    display: flex;
    align-items: center;
    background: var(--bg-input);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    overflow: hidden;
}

.coord-tag {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    font-weight: 700;
    padding: 2px 6px;
}

.coord-tag.tag-x { color: #f43f5e; background: rgba(244, 63, 94, 0.1); }
.coord-tag.tag-y { color: #10b981; background: rgba(16, 185, 129, 0.1); }
.coord-tag.tag-z { color: #38bdf8; background: rgba(56, 189, 248, 0.1); }

.coord-input {
    width: 100%;
    background: transparent;
    border: none;
    color: var(--text-primary);
    font-family: var(--font-mono);
    font-size: 0.78rem;
    text-align: right;
    padding-right: 6px;
    outline: none;
}
```

---

### 4.5 Exemplo de Integração em `simulacoes/scripts/tensor_de_inercia.js`
```javascript
import { Vector3DPicker } from './sim-ui.js';

// Cria seletor de eixo unitário de rotação
const pickerEixo = new Vector3DPicker('#container-picker-eixo', {
    defaultVector: [0, 1, 0],
    normalized: true,
    showGimbalSphere: true,
    onChange: (state) => {
        // Atualiza a direção do vetor n no Three.js
        eixoRotacao3D.set(state.x, state.y, state.z);
        arrowHelper.setDirection(eixoRotacao3D);
        
        // Recalcula o momento de inércia escalar I_n = n^T * I * n
        recalcularMomentoDirecional();
    }
});
```

---

## 5. Componente 4: `TouchCanvasController` (Controlador Unificado de Gestos e Toque)

### 5.1 Motivação Física & Necessidade de Engenharia
* **Domínios Físicos**: Todas as 14 simulações que utilizam Canvas 2D ou Three.js 3D.
* **Problema Resolvido**: Como diagnosticado no relatório R2, 12 simulações sofrem com captura acidental de scroll vertical no canvas e 5 simulações utilizam eventos legados de mouse (`mousedown`/`wheel`). O `TouchCanvasController` resolve isso fornecendo uma abstração única baseada na API de **Pointer Events**, aplicando `touch-action: none;` automaticamente e adicionando suporte a gestos multitouch de **Pinch-to-Zoom** e **Two-Finger Pan**.

---

### 5.2 Contrato de API (TypeScript / JSDoc)
```typescript
/**
 * Coordenadas normalizadas e relativas calculadas pelo controlador
 */
export interface CanvasPointerEvent {
    originalEvent: PointerEvent;
    /** Posição X em pixels dentro do canvas */
    canvasX: number;
    /** Posição Y em pixels dentro do canvas */
    canvasY: number;
    /** Posição normalizada X no intervalo [-1, 1] ou [0, 1] */
    normalizedX: number;
    /** Posição normalizada Y no intervalo [-1, 1] ou [0, 1] */
    normalizedY: number;
    /** Identificador exclusivo do ponteiro */
    pointerId: number;
    /** Tipo de ponteiro: 'touch', 'mouse' ou 'pen' */
    pointerType: string;
}

/**
 * Opções de configuração para o TouchCanvasController
 */
export interface TouchControllerOptions {
    /** Previne contexto de menu nativo ao segurar o toque (padrão: true) */
    preventContextMenu?: boolean;
    /** Callback disparado no contato inicial (pointerdown) */
    onDown?: (event: CanvasPointerEvent) => void;
    /** Callback disparado no movimento do cursor/dedo (pointermove) */
    onMove?: (event: CanvasPointerEvent) => void;
    /** Callback disparado na liberação do toque (pointerup / pointercancel) */
    onUp?: (event: CanvasPointerEvent) => void;
    /** Callback disparado quando dois dedos realizam pinça de zoom */
    onPinchZoom?: (scaleDelta: number, distance: number) => void;
    /** Callback disparado quando dois dedos realizam arrasto de pan */
    onTwoFingerPan?: (deltaX: number, deltaY: number) => void;
}

/**
 * Classe controladora de ponteiro universal para canvas científicos
 */
export class TouchCanvasController {
    constructor(canvasTarget: string | HTMLCanvasElement, options?: TouchControllerOptions);

    /** Retorna a quantidade de toques simultâneos ativos na tela */
    public getActivePointersCount(): number;

    /** Força o estado de touch-action */
    public setTouchAction(action: string): void;

    /** Desativa listeners e libera captura de ponteiros */
    public destroy(): void;
}
```

---

### 5.3 Implementação do Controlador Interno (`sim-ui.js`)
```javascript
export class TouchCanvasController {
    constructor(canvasTarget, options = {}) {
        this.canvas = typeof canvasTarget === 'string' ? document.querySelector(canvasTarget) : canvasTarget;
        if (!this.canvas) return;

        this.options = {
            preventContextMenu: true,
            ...options
        };

        // Aplica blindagem tátil mandante
        this.canvas.style.touchAction = 'none';
        this.canvas.style.webkitTouchCallout = 'none';
        this.canvas.style.userSelect = 'none';

        this.activePointers = new Map();
        this.lastDistance = null;
        this.lastMidpoint = null;

        this._bindEvents();
    }

    _getCoords(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const canvasX = (e.clientX - rect.left) * scaleX;
        const canvasY = (e.clientY - rect.top) * scaleY;
        const normalizedX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const normalizedY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

        return {
            originalEvent: e,
            canvasX,
            canvasY,
            normalizedX,
            normalizedY,
            pointerId: e.pointerId,
            pointerType: e.pointerType
        };
    }

    _bindEvents() {
        if (this.options.preventContextMenu) {
            this.canvas.addEventListener('contextmenu', e => e.preventDefault());
        }

        this.canvas.addEventListener('pointerdown', (e) => {
            this.canvas.setPointerCapture(e.pointerId);
            this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

            if (this.activePointers.size === 2) {
                const [p1, p2] = Array.from(this.activePointers.values());
                this.lastDistance = Math.hypot(p2.x - p1.x, p2.y - p1.y);
                this.lastMidpoint = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
            }

            if (this.options.onDown) {
                this.options.onDown(this._getCoords(e));
            }
        });

        this.canvas.addEventListener('pointermove', (e) => {
            if (!this.activePointers.has(e.pointerId)) return;
            this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

            // Gestos multitouch de 2 dedos (Pinch Zoom & Pan)
            if (this.activePointers.size === 2) {
                const [p1, p2] = Array.from(this.activePointers.values());
                const currentDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
                const currentMid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

                if (this.lastDistance && this.options.onPinchZoom) {
                    const scaleDelta = currentDist / this.lastDistance;
                    this.options.onPinchZoom(scaleDelta, currentDist);
                }

                if (this.lastMidpoint && this.options.onTwoFingerPan) {
                    const deltaX = currentMid.x - this.lastMidpoint.x;
                    const deltaY = currentMid.y - this.lastMidpoint.y;
                    this.options.onTwoFingerPan(deltaX, deltaY);
                }

                this.lastDistance = currentDist;
                this.lastMidpoint = currentMid;
            } else if (this.options.onMove) {
                this.options.onMove(this._getCoords(e));
            }
        });

        const handleUp = (e) => {
            this.activePointers.delete(e.pointerId);
            try { this.canvas.releasePointerCapture(e.pointerId); } catch (_) {}

            if (this.activePointers.size < 2) {
                this.lastDistance = null;
                this.lastMidpoint = null;
            }

            if (this.options.onUp) {
                this.options.onUp(this._getCoords(e));
            }
        };

        this.canvas.addEventListener('pointerup', handleUp);
        this.canvas.addEventListener('pointercancel', handleUp);
    }

    destroy() {
        this.activePointers.clear();
    }
}
```

---

### 5.4 Exemplo de Integração em `simulacoes/scripts/quedalivre.js`
```javascript
import { TouchCanvasController } from './sim-ui.js';

// Transforma o arremesso de mouse em controle touch perfeitamente calibrado
const touchCtrl = new TouchCanvasController('#canvas-quedalivre', {
    onDown: (pt) => {
        const dist = Math.hypot(pt.canvasX - bola.x, pt.canvasY - bola.y);
        if (dist <= bola.raio) {
            bola.isDragging = true;
            bola.vx = 0;
            bola.vy = 0;
        }
    },
    onMove: (pt) => {
        if (bola.isDragging) {
            bola.vx = (pt.canvasX - bola.x) * 0.3; // calcula velocidade de arremesso
            bola.vy = (pt.canvasY - bola.y) * 0.3;
            bola.x = pt.canvasX;
            bola.y = pt.canvasY;
        }
    },
    onUp: () => {
        if (bola.isDragging) {
            bola.isDragging = false; // libera a bola com a velocidade inercial
        }
    }
});
```

---
*Fim do Relatório R3 — Especificações Técnicas de Extensão do Plugin `simulacoes-lab`.*
