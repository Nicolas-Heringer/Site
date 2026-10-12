# Relatório Executivo Consolidado — Auditoria e Modernização do Laboratório de Simulações

**Projeto**: Laboratório de Simulações Científicas e Matemáticas  
**Diretório do Projeto**: `c:\Users\nicol\Documents\GitHub\Site\`  
**Orquestrador**: Project Orchestrator (`orchestrator`)  
**Data da Auditoria**: 12 de Outubro de 2026  
**Status do Gate de Qualidade**: **PASS** (Aprovado por Reviewer 1, Reviewer 2, Challenger 1 e Auditor Forense)  
**Modo de Execução**: **READ-ONLY ESTRITO** (Zero alterações em código-fonte de `simulacoes/` ou repositório)

---

## 1. Sumário Executivo & Principais Descobertas

O laboratório de simulações passou por uma auditoria exaustiva e independente conduzida por uma equipe multiagente especializada (3 Explorers/Miners, 1 Worker de Síntese, 2 Reviewers adversariais, 1 Challenger empírico e 1 Auditor Forense).

### 1.1 Panorama Geral do Ecossistema
- **Total de Simulações Catalogadas**: Exatamente **14 arquivos HTML** em `simulacoes/`.
- **Status no Hub Principal (`index.html`)**: **12 simulações ativas** e **2 simulações órfãs** (`gravidade.html` e `tensor_de_inercia.html`), que foram excluídas dos cartões de navegação do portal principal.
- **Divisão de Conformidade com o Design System 2.0**:
  - **5 Totalmente Conformes (35,7%)**: `drude.html`, `estacionarias2d.html`, `particulas.html`, `snell.html`, `ui_lab.html`. Adotam `design-system.css`, ES Modules, `sim-ui.js`, Bottom Sheet funcional e ícones SVG nativos.
  - **3 Parcialmente Conformes (21,4%)**: `atomo_de_hidrogenio.html`, `clima.html`, `movimento.html`. Adotam a casca visual moderna e módulos ES, mas possuem débitos pontuais (ex.: sliders sem sincronização dual, falta de barra de transporte padronizada ou ausência de `touch-action` global).
  - **6 Legadas (42,9%)**: `audio.html`, `fonons.html`, `gravidade.html`, `matrizes.html`, `quedalivre.html`, `tensor_de_inercia.html`. Utilizam `css/base.css` legado, scripts clássicos sem módulos, sliders ad-hoc sem acessibilidade e quebram severamente em dispositivos móveis.

### 1.2 Três Vulnerabilidades Críticas de Usabilidade Móvel Descobertas
1. **Omissão Global de `touch-action: none;`**: O arquivo `design-system.css` aplica `touch-action: none;` estritamente na alça de arraste do Bottom Sheet (`.sheet-drag-handle`), mas omitiu no container 3D (`#three-container`) e no canvas principal. Como resultado, **12 das 14 simulações sofrem com scroll acidental da página** ao tentar orbitar em 3D ou desenhar/arrastar na tela tátil.
2. **Bug Crítico de Desaparecimento do Bottom Sheet**: Ao clicar no botão de colapso (`#btn-collapse-sidebar`) ou pressionar o atalho `F` em telas $\le 900\text{px}$, as regras de `design-system.css:226` aplicam `opacity: 0; pointer-events: none; transform: translateX(40px);`. Porém, a regra `design-system.css:2042` oculta o botão de restauração no mobile (`.canvas-btn-expand-sidebar { display: none !important; }`), provocando um **softlock visual irreversível** onde os controles desaparecem para sempre.
3. **Armadilhas de Eventos Exclusivos de Mouse**: As simulações `quedalivre.js`, `fonons.js`, `matrizes.js`, `particulas.js` e `snell.js` escutam unicamente `mousedown`, `mousemove` e `wheel`. Em smartphones, é impossível perturbar a rede cristalina, arremessar massas, transformar matrizes, agitar partículas ou rotacionar o feixe óptico de refração. Além disso, `fonons.js` utiliza coordenadas de mouse descalibradas sobre um canvas rígido de $900\times 600$, provocando erro de toque de $2{,}5\times$ em telas de 360px.

---

## 2. Requisito R1: Matriz Consolidada de Conformidade Técnica

A tabela abaixo sintetiza a auditoria individual de todas as 14 simulações frente às regras do Design System 2.0 (`.agents/plugins/simulacoes-lab/rules/AGENTS.md`).

| # | Simulação (`simulacoes/*.html`) | Classificação DS 2.0 | CSS Utilizado | Arquitetura JS | Componentes `sim-ui.js` | Three.js & KaTeX | Status no Hub | Débitos Técnicos Principais |
|---|---|---|---|---|---|---|---|---|
| 1 | `atomo_de_hidrogenio.html` | **Parcialmente Conforme** | `design-system.css` + local | ES Module (`atomo_de_hidrogenio.js`) | `initBottomSheet`, `inlineSVGImages` | Three.js 0.165 (importmap) + KaTeX CDN | Ativo no Hub | Sliders numéricos não usam `syncDualSlider`; carece de `.sim-transport-bar` unificada. |
| 2 | `audio.html` | **Legada** | `base.css` + `audio.css` | Script clássico (`audio.js`) | Nenhum (`sim-ui.js` ausente) | Sem Three.js; KaTeX CDN | Ativo no Hub | Sem design tokens; controles ad-hoc; PiP canvas rígido de 220px estourando em mobile; sem Bottom Sheet. |
| 3 | `clima.html` | **Parcialmente Conforme** | `design-system.css` + local | ES Module + `clima.worker.js` | `initBottomSheet`, `inlineSVGImages`, `initModal` | Three.js 0.165 (importmap) + KaTeX CDN | Ativo no Hub | Omissão de `touch-action: none` em `#three-container`; sliders customizados fora do padrão `.sim-dual-slider`. |
| 4 | `drude.html` | **Totalmente Conforme** | `design-system.css` + local | ES Module (`drude.js`) | `syncDualSlider`, `initToggleButton`, `initBottomSheet`, `initSidebarCollapse`, `RealtimePlot`, `initModal` | Sem Three.js; KaTeX CDN | Ativo no Hub | Padrão de referência DS 2.0. Requer apenas injeção de `touch-action: none;` no canvas 2D. |
| 5 | `estacionarias2d.html` | **Totalmente Conforme** | `design-system.css` + local | ES Module (`estacionarias2d.js`) | `syncDualSlider`, `initBottomSheet`, `initSidebarCollapse`, `initModal`, `inlineSVGImages` | Sem Three.js; KaTeX CDN | Ativo no Hub | Padrão de referência DS 2.0 para autofunções espaciais estáticas (Chladni). Requer `touch-action: none`. |
| 6 | `fonons.html` | **Legada** | `base.css` + local | Script clássico (`fonons.js`) | Nenhum (`sim-ui.js` ausente) | Sem Three.js; KaTeX CDN | Ativo no Hub | Canvas com largura estática $900\times 600$; listeners exclusivos de mouse; sem Bottom Sheet; coordenadas de clique descalibradas. |
| 7 | `gravidade.html` | **Legada** | `base.css` + `gravidade.css` | Script clássico (`gravidade.js`) | Nenhum (`sim-ui.js` ausente) | Sem Three.js; KaTeX CDN; **Dependência externa de Chart.js** | **Órfão (Não listado)** | Usa CDN externo `Chart.js` para energias; colisão visual severa em telas $\le 768\text{px}$; controles legados; sem Bottom Sheet. |
| 8 | `matrizes.html` | **Legada** | `base.css` + local | Script clássico (`matrizes.js`) | Nenhum (`sim-ui.js` ausente) | Sem Three.js; KaTeX CDN | Ativo no Hub | Entradas de matriz em tabelas HTML com estilos legados; arrasto de vetores $\hat{i}, \hat{j}$ restrito a mouse; sem Bottom Sheet. |
| 9 | `movimento.html` | **Parcialmente Conforme** | `design-system.css` + local | ES Module (`movimento.js`) | `initBottomSheet`, `initSidebarCollapse`, `initModal`, `inlineSVGImages` | Sem Three.js; KaTeX CDN | Ativo no Hub | Possui `touch-action: none;`, mas não padronizou transport bar nem dual sliders numéricos. |
| 10 | `particulas.html` | **Totalmente Conforme** | `design-system.css` + local | ES Module (`particulas.js`) | `syncDualSlider`, `initToggleButton`, `initBottomSheet`, `initSidebarCollapse`, `RealtimePlot`, `initModal` | Sem Three.js; KaTeX CDN | Ativo no Hub | Padrão de referência DS 2.0. Requer migração de `mousedown/mousemove` para `pointerdown/pointermove` no impulso de partículas. |
| 11 | `quedalivre.html` | **Legada** | `base.css` + local | Script clássico (`quedalivre.js`) | Nenhum (`sim-ui.js` ausente) | Sem Three.js; KaTeX CDN | Ativo no Hub | Canvas rígido $600\times 600$; ouvintes exclusivos de mouse; formulários sem design tokens; sem suporte mobile. |
| 12 | `snell.html` | **Totalmente Conforme** | `design-system.css` + local | ES Module + `snell.worker.js` | `syncDualSlider`, `initToggleButton`, `initBottomSheet`, `initSidebarCollapse`, `RealtimePlot`, `initModal` | Sem Three.js; KaTeX CDN | Ativo no Hub | Padrão de referência avançado com Web Worker. Requer controle tátil alternativo à roda do mouse (`wheel`) para rotação angular. |
| 13 | `tensor_de_inercia.html` | **Legada** | `base.css` + local | ES Module isolado (`tensor_de_inercia.js`) | Nenhum (`sim-ui.js` ausente) | Three.js 0.158 (importmap legado) + **Dependência externa de `numeric.js`** | **Órfão (Não listado)** | Usa Three.js desatualizado e `numeric.js` CDN para autovalores; UI legada com tabela de tensores; sem Bottom Sheet. |
| 14 | `ui_lab.html` | **Totalmente Conforme** | `design-system.css` | ES Module (`ui_lab.js`) | Suite completa de `sim-ui.js` | Three.js 0.165 (importmap) + KaTeX CDN | Ativo no Hub | Laboratório de componentes e vitrine oficial do Design System 2.0. |

---

## 3. Requisito R2: Avaliação Aprofundada de Usabilidade Móvel e Controles Táteis

### 3.1 Classificação de Prontidão Mobile por Tiers
- **Tier A (Totalmente Pronta — 1 simulação)**: `atomo_de_hidrogenio.html`. Possui Bottom Sheet, layout responsivo e declaração explícita de `touch-action: none;` no container 3D.
- **Tier B (Parcialmente Adaptada — 7 simulações)**: `clima.html`, `drude.html`, `estacionarias2d.html`, `movimento.html`, `particulas.html`, `snell.html`, `ui_lab.html`. Possuem Bottom Sheet e responsividade, mas sofrem com a omissão de `touch-action: none;` no canvas, risco de softlock no colapso e alguns ouvintes restritos a mouse.
- **Tier C (Completamente Quebrada em $\le 900\text{px}$ — 6 simulações)**: `audio.html`, `fonons.html`, `gravidade.html`, `matrizes.html`, `quedalivre.html`, `tensor_de_inercia.html`. Não possuem Bottom Sheet (painel empilha abaixo do canvas ou colide horizontalmente), utilizam canvases rígidos e ignoram toques na tela.

### 3.2 Diagnóstico dos Pontos de Falha Ergonômicos
1. **Alvos de Toque (WCAG 2.1 Critério de Sucesso 2.5.5 - Mínimo 44x44px)**:
   - Os sliders `.sim-slider` possuem thumb de apenas **18x18px** (`design-system.css:800`), exigindo precisão motora excessiva em smartphones.
   - A alça de arraste do Bottom Sheet (`.sheet-drag-handle`) possui altura visual de **16px** (`design-system.css:1996`), gerando toques acidentais no primeiro controle do painel.
   - Botões de tema e utilitários medem **14px a 36px**, violando o alvo mínimo de 44px.
2. **Quebra de Layout Dual Slider em Telas Ultra-Estreitas ($\le 360\text{px}$)**:
   - A estrutura `.sim-dual-slider` alinha horizontalmente label, slider e input numérico (`width: 58px`). Em telas de 320–360px, o slider é espremido para menos de 80px, tornando impossível selecionar valores intermediários.
3. **Transbordamento Horizontal de Fórmulas KaTeX em Modais de Teoria**:
   - A regra de `overflow-x: auto;` em `design-system.css:1371` foi aplicada exclusivamente a `.theory-card .katex-display`.
   - Nos modais de teoria (`.sim-modal-body`), as fórmulas display (`$$...$$`) são inseridas diretamente em parágrafos e seções sem a classe `.theory-card`. Em telas com menos de 400px de largura, equações longas são cortadas à direita sem barra de rolagem.

---

## 4. Requisito R3: Especificações de Expansão do Plugin `simulacoes-lab`

Para viabilizar a migração da coorte legada e suprir as lacunas estruturais do plugin, foram especificadas 4 novas extensões formais com contratos completos de engenharia.

### 4.1 `MatrixTensorEditor` (Física Especializada: Matrizes e Tensores)
- **Motivação**: Eliminar inputs dispersos e tabelas HTML em `matrizes.html` e `tensor_de_inercia.html`, oferecendo um componente unificado com colchetes matemáticos, simetria em tempo real, cálculo de determinante e eliminação da biblioteca externa `numeric.js`.
- **API Signature (TypeScript / JSDoc)**:
  ```typescript
  export interface MatrixTensorOptions {
    container: HTMLElement | string;
    dimension: 2 | 3;
    symmetric?: boolean;
    initialValues?: number[][];
    step?: number;
    min?: number;
    max?: number;
    showInvariants?: boolean; // Traço, Determinante, Autovalores
    onChange?: (matrix: number[][], invariants: MatrixInvariants) => void;
  }

  export class MatrixTensorEditor {
    constructor(options: MatrixTensorOptions);
    getValues(): number[][];
    setValues(matrix: number[][]): void;
    computeEigenvalues(): [number, number, number]; // Solver cúbico analítico com clamp numérico
    computeEigenvectors(): number[][];
    destroy(): void;
  }
  ```
- **Robustez Numérica Adicionada (Recomendação Challenger 1)**: O método cúbico trigonométrico para autovalores inclui proteção obrigatória contra overflow de arco-cosseno:
  `const ratio = Math.max(-1.0, Math.min(1.0, R / Math.sqrt(Q * Q * Q)));`

### 4.2 `MultiSeriesPlot` (Telemetria Multicanal e Espaço de Fase)
- **Motivação**: Substituir o CDN externo `Chart.js` em `gravidade.html` por uma implementação nativa ultraleve (Canvas 2D puro, <8 KB) que suporta múltiplas séries temporais (Cinética, Potencial, Mecânica Total) com legendas dinâmicas e modo de espaço de fase $(x, p)$.
- **API Signature**:
  ```typescript
  export interface MultiSeriesPlotOptions {
    container: HTMLElement | string;
    width?: number;
    height?: number;
    maxPoints?: number;
    mode?: 'time-series' | 'phase-space';
    series: Array<{
      id: string;
      label: string;
      color: string;
      unit?: string;
    }>;
  }

  export class MultiSeriesPlot {
    constructor(options: MultiSeriesPlotOptions);
    push(data: Record<string, number>): void; // Para time-series: { ec: 12.4, ep: -5.2, em: 7.2 }
    pushPhasePoint(x: number, p: number): void; // Para phase-space: órbita no espaço de fase
    clear(): void;
    resize(): void;
  }
  ```

### 4.3 `Vector3DPicker` (Seletores de Vetores e Eixos 3D)
- **Motivação**: Permitir a escolha visual e tátil de vetores de velocidade, campos elétricos/magnéticos e eixos de rotação em `tensor_de_inercia.html` e futuras simulações 3D.
- **API Signature**:
  ```typescript
  export interface Vector3DPickerOptions {
    container: HTMLElement | string;
    initialVector?: [number, number, number];
    normalized?: boolean;
    color?: string;
    showSpherical?: boolean; // Exibe sliders táteis de Theta e Phi
    onChange?: (vector: [number, number, number], spherical: { theta: number; phi: number; r: number }) => void;
  }

  export class Vector3DPicker {
    constructor(options: Vector3DPickerOptions);
    setVector(x: number, y: number, z: number): void;
    getVector(): [number, number, number];
  }
  ```

### 4.4 `TouchCanvasController` (Portabilidade e Controles Táteis)
- **Motivação**: Eliminar de forma centralizada os problemas de scroll acidental e unificar a gestão de Pointer Events (`pointerdown`, `pointermove`, `pointerup`), pinch-to-zoom e rotação tátil em 2D e 3D.
- **API Signature**:
  ```typescript
  export function initTouchCanvas(canvasElement: HTMLCanvasElement, options?: {
    preventScroll?: boolean; // Aplica touch-action: none;
    onDrag?: (dx: number, dy: number, e: PointerEvent) => void;
    onPinchZoom?: (scaleDelta: number) => void;
  }): { destroy: () => void };
  ```

---

## 5. Requisito R4: Roadmap Faseado de Migração

O plano de modernização foi estruturado em **4 lotes lógicos sequenciais**, priorizados por complexidade técnica e dependências de arquitetura (estimativa total de **76 a 96 horas de desenvolvimento**).

```
[ Lote 1: Fundação & Hotfixes ]
             │
             ▼
[ Lote 2: Simulações Analíticas 2D ]
             │
             ▼
[ Lote 3: Áudio & Telemetria Multicanal ]
             │
             ▼
[ Lote 4: Álgebra Linear & Tensores 3D ]
             │
             ▼
[ Reintegração no Hub & Limpeza de Código ]
```

### Lote 1: Fundação, Correções Globais de UI e Alinhamento Parcial (~12–16h)
- **Objetivos**:
  1. Injetar em `design-system.css` a regra universal:
     ```css
     .canvas-area, .canvas-area canvas, #three-container, #three-container canvas, .sim-layout canvas {
         touch-action: none !important;
     }
     ```
  2. Corrigir o bug de softlock do Bottom Sheet em `sim-ui.js` e `design-system.css`, garantindo que `#btn-collapse-sidebar` não oculte irreversivelmente o painel em telas $\le 900\text{px}$.
  3. Expandir a área de toque do drag handle para 40px (com padding seguro de 44px) e aumentar o thumb do slider para 24px.
  4. Tornar universal a regra `max-width: 100%; overflow-x: auto;` para todas as instâncias de `.katex-display`.
  5. Alinhar as 3 simulações parcialmente conformes (`atomo_de_hidrogenio.html`, `clima.html`, `movimento.html`) aos padrões estritos de controles e transport bar.

### Lote 2: Simulações Analíticas 2D Simples (~16–20h)
- **Escopo**: `quedalivre.html` e `fonons.html`.
- **Ações**:
  - Migrar de `css/base.css` para `css/design-system.css` com Bottom Sheet responsivo.
  - Substituir canvases rígidos ($600\times 600$ e $900\times 600$) por layouts de proporção fluida baseados no container.
  - Converter scripts para ES Modules (`<script type="module">`).
  - Migrar ouvintes de mouse para a Pointer Events API unificada (`pointerdown`, `pointermove`, `pointerup`), garantindo suporte tátil impecável.

### Lote 3: Áudio Avançado e Telemetria Multicanal (~20–26h)
- **Escopo**: `audio.html` e `gravidade.html`.
- **Ações**:
  - Integrar o novo componente `MultiSeriesPlot` em `gravidade.html`, eliminando a dependência de `Chart.js`.
  - Modernizar a interface de `audio.html`, adaptando o canvas de Picture-in-Picture (PiP) para recolhimento responsivo no mobile.
  - Sincronizar transport bar e áudio bufferizado com estados de reprodução do `sim-ui.js`.

### Lote 4: Álgebra Linear Especializada e Tensores 3D (~28–34h)
- **Escopo**: `matrizes.html` e `tensor_de_inercia.html`.
- **Ações**:
  - Integrar o componente `MatrixTensorEditor` em `matrizes.html` e `tensor_de_inercia.html`.
  - Integrar `Vector3DPicker` para orientação do eixo de rotação e vetor velocidade angular $\vec{\omega}$.
  - Atualizar Three.js de 0.158 para 0.165 via importmap unificado.
  - Eliminar o CDN de `numeric.js` em `tensor_de_inercia.html`, utilizando o solver cúbico analítico com clamp.

### 5.1 Reintegração das Simulações Órfãs no Hub Principal (`index.html`)
Após a conclusão do Lote 3 e Lote 4, as duas simulações órfãs devem ser reinseridas no grid de cartões de `index.html`:
```html
<!-- Card: Gravitação e Órbitas -->
<a href="simulacoes/gravidade.html" class="sim-card" data-category="mecanica">
    <div class="sim-card-badge">Mecânica Celeste</div>
    <h3>Órbitas Gravitacionais</h3>
    <p>Simulação orbital e conservação de energia cinética, potencial e mecânica total.</p>
    <div class="sim-card-tags">
        <span class="tag">Gravitação</span>
        <span class="tag">Energia</span>
        <span class="tag">Telemetria</span>
    </div>
</a>

<!-- Card: Tensor de Inércia -->
<a href="simulacoes/tensor_de_inercia.html" class="sim-card" data-category="mecanica">
    <div class="sim-card-badge">Mecânica Clássica</div>
    <h3>Tensor de Inércia & Rotação 3D</h3>
    <p>Diagonalização de tensores de inércia, momentos principais e elipsoide de Poinsot.</p>
    <div class="sim-card-tags">
        <span class="tag">Three.js 3D</span>
        <span class="tag">Álgebra Linear</span>
        <span class="tag">Tensores</span>
    </div>
</a>
```

### 5.2 Limpeza e Descarte de Código Obsoleto
Ao término da modernização do Lote 4, os seguintes artefatos obsoletos devem ser removidos com segurança:
- `simulacoes/css/buttons.css` (arquivo inerte de 0 bytes).
- `simulacoes/scripts/buttons.js` (script legado de 20 linhas não referenciado).
- `simulacoes/css/base.css` (folha legada de 422 linhas que será 100% substituída por `design-system.css`).

---

## 6. Verificação e Auditoria de Integridade (Audit Verdict)

| Agente Verificador | Papel | Veredito | Observações Principais |
|---|---|---|---|
| **auditor_1** | Forensic Integrity Auditor | **CLEAN** | Repositório 100% preservado; zero modificações em código; citações de linhas e seletores 100% autênticas. |
| **reviewer_1** | Reviewer Técnico (R1 & R2) | **APPROVE** | Validação minuciosa dos débitos técnicos de todas as 14 simulações e do diagnóstico tátil. |
| **reviewer_2** | Reviewer Arquitetural (R3 & R4) | **APPROVE** | Especificações completas com contratos de API e roadmap realista aprovados tecnicamente. |
| **challenger_1** | Verificador Empírico e Stress Tester | **APPROVE** | Contagens e mecânicas de eventos comprovadas no código; mitigações e clamps incorporados. |

---

## 7. Índice de Artefatos Gerados

Todas as documentações, matrizes e especificações encontram-se persistidas nos seguintes caminhos absolutos:
- **Matriz de Conformidade Técnica (R1)**:  
  `c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\worker_synthesis_1\AUDIT_COMPLIANCE_MATRIX.md`
- **Avaliação de Usabilidade Móvel e Toque (R2)**:  
  `c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\worker_synthesis_1\MOBILE_USABILITY_ASSESSMENT.md`
- **Especificações de Expansão do Plugin (R3)**:  
  `c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\worker_synthesis_1\PLUGIN_EXTENSION_SPECS.md`
- **Roadmap Faseado de Migração (R4)**:  
  `c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\worker_synthesis_1\PHASED_MIGRATION_ROADMAP.md`
- **Relatório Forense de Integridade**:  
  `c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\auditor_1\audit_report.md`
- **Relatórios de Revisão e Teste de Estresse**:  
  `c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\reviewer_1\review_report_1.md`  
  `c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\reviewer_2\review_report_2.md`  
  `c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\challenger_1\challenger_report.md`
- **Status do Gate de Qualidade**:  
  `c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\orchestrator\GATE_STATUS.md`
