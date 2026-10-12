# R1: Matriz de Auditoria e Conformidade Técnica — Laboratório de Simulações

**Data de Emissão:** 12 de Outubro de 2026  
**Autor:** Worker Synthesis 1 (Technical Documentation and Synthesis Worker)  
**Escopo:** Auditoria Exaustiva de 100% das Simulações em `simulacoes/*.html`, scripts JS, folhas CSS e dependências  
**Padrão Alvo:** Design System 2.0 (`.agents/plugins/simulacoes-lab/rules/AGENTS.md`)  
**Modo de Execução:** READ-ONLY (Diagnóstico Estrutural Sem Alteração de Código-Fonte)  

---

## 1. Sumário Executivo & Indicadores Globais da Auditoria

A auditoria cobriu rigorosamente todas as **14 simulações científicas e matemáticas** hospedadas no diretório `simulacoes/`, compreendendo **18 scripts JavaScript**, **16 folhas de estilo CSS**, **2 Web Workers**, ativos de textura e **66 ícones SVG nativos**.

### 1.1 Distribuição de Conformidade Técnica (Design System 2.0)
* **Totalmente Conforme (DS 2.0 — Referência Completa)**: **4 simulações (28,6%)**
  - `drude.html`, `particulas.html`, `snell.html`, `ui_lab.html`.
  - Apresentam arquitetura moderna em ES Modules, consumo integral de `sim-ui.js`, `.sim-transport-bar`, `.sim-dual-slider`, `.sheet-drag-handle`, e layout flexível.
* **Parcialmente Conforme (DS 2.0 — Híbrido / Débitos Específicos)**: **4 simulações (28,6%)**
  - `atomo_de_hidrogenio.html`, `clima.html`, `estacionarias2d.html`, `movimento.html`.
  - Adotam `css/design-system.css` e o esqueleto visual novo, mas possuem débitos pontuais (omissão de `syncDualSlider`, sliders com `<span class="slider-val">` manuais, múltiplos botões avulsos de transporte ou omissão de `touch-action: none;`).
* **Legado (DS 1.0 ou Sem Padrão)**: **6 simulações (42,8%)**
  - `audio.html`, `fonons.html`, `gravidade.html`, `matrizes.html`, `quedalivre.html`, `tensor_de_inercia.html`.
  - Presas a `css/base.css` (ou CSS inline/ad-hoc), scripts clássicos sem escopo modular, dimensões estáticas em `<canvas>`, dependências externas desnecessárias (`Chart.js`, `numeric.js`) e ausência total de suporte mobile/bottom sheet.

```
┌────────────────────────────────────────────────────────────────────────┐
│               DISTRIBUIÇÃO DE CONFORMIDADE DS 2.0                      │
├──────────────────────────┬──────────────────────────┬──────────────────┤
│ Totalmente Conforme      │ Parcialmente Conforme    │ Legado (DS 1.0)  │
│ 4 simulações (28,6%)     │ 4 simulações (28,6%)     │ 6 simulações     │
│ [drude, particulas,      │ [atomo, clima,           │ (42,8%)          │
│  snell, ui_lab]          │  estacionarias, mov]     │ [audio, fonons,  │
│                          │                          │  gravidade, mat, │
│                          │                          │  queda, tensor]  │
└──────────────────────────┴──────────────────────────┴──────────────────┘
```

### 1.2 Indicadores Tecnológicos Globais
* **Adoção de CSS**:
  - `css/design-system.css`: 8 simulações (57,1%).
  - `css/base.css` (legado de 2024): 6 simulações (42,9%).
  - Arquivos obsoletos/órfãos: `css/buttons.css` (0 bytes, vazio) e `scripts/buttons.js` (20 linhas, código inerte de `aberturaSlider`).
* **Arquitetura JavaScript**:
  - ES Modules (`<script type="module">`): 9 simulações (64,3%).
  - Classic Scripts (escopo global ou inline): 5 simulações (35,7%).
  - Web Workers dedicados: 2 simulações (`clima.worker.js` e `snell.worker.js`).
* **Biblioteca Controladora (`sim-ui.js`)**:
  - Consumo ativo: 8 simulações (57,1%).
  - Zero integração: 6 simulações (42,9%).
* **Renderização 3D (Three.js)**:
  - 4 simulações utilizam Three.js (`atomo_de_hidrogenio`, `clima`, `tensor_de_inercia`, `ui_lab`).
  - 3 utilizam importmap para Three.js 0.165.0.
  - 1 simulação legada (`tensor_de_inercia.html`) está presa ao importmap de Three.js 0.158.0.
* **Bibliotecas Externas Obsoletas / Pesadas via CDN**:
  - `Chart.js` (jsdelivr CDN): carregado em `gravidade.html` (substituível por `RealtimePlot` / `MultiSeriesPlot`).
  - `numeric.js` v1.2.6 (cdnjs CDN): carregado em `tensor_de_inercia.html` (biblioteca de 2013 para autovalores $3\times 3$, substituível por solver analítico nativo).
* **Integração no Portal Hub (`index.html`)**:
  - 12 simulações possuem cards ativos no hub principal.
  - **2 simulações estão ÓRFÃS** (não listadas no `index.html`): `gravidade.html` e `tensor_de_inercia.html`.

---

## 2. Matriz Consolidada de Conformidade Técnica (14 Simulações)

A tabela abaixo sintetiza a avaliação de cada uma das 14 simulações frente a todas as dimensões de engenharia de `AGENTS.md`.

| # | Arquivo HTML | Domínio Físico / Matemático | Motor de Render | Arquitetura JS & Workers | CSS Base | `sim-ui.js` Controllers | Suporte KaTeX | Ícones SVG Nativos | Three.js Importmap | Status no Hub (`index.html`) | Classificação DS |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `atomo_de_hidrogenio.html` | Mecânica Quântica / Orbitais Atômicos | Three.js 0.165 3D (`THREE.Points` Monte Carlo) | ES Module (`atomo_de_hidrogenio.js`) | `design-system.css` + `atomo_de_hidrogenio.css` | Parcial (`initSidebarCollapse`, `initBottomSheet`, `inlineSVGImages`) | Sim (Auto-render CDN) | Sim (`assets/icons/*.svg`) | Sim (0.165.0) | Presente (Card ativo) | **Parcialmente Conforme** |
| 2 | `audio.html` | Física Acústica / Análise Fourier FFT | Canvas 2D duplo + Web Audio API | Classic Script (`audio.js`) | `base.css` + `audio.css` | Ausente (0 controles) | Sim (Auto-render CDN) | Não (Unicode / CSS custom) | Não se aplica | Presente (Card ativo) | **Legado** |
| 3 | `clima.html` | Geofísica / Voronoi Esférico & Balanço Radiativo | Three.js 0.165 3D + Delaunay / Lloyd | ES Module (`clima.js`) + **Web Worker** (`clima.worker.js`) | `design-system.css` + `clima.css` | Parcial (`initSidebarCollapse`, `initBottomSheet`, `initModal`, `inlineSVGImages`) | Sim (Auto-render CDN) | Sim (`assets/icons/*.svg`) | Sim (0.165.0) | Presente (Card ativo) | **Parcialmente Conforme** |
| 4 | `drude.html` | Matéria Condensada / Condução Drude | Canvas 2D (`#drudeCanvas`) | ES Module (`drude.js`) | `design-system.css` + `drude.css` | Completo (`initToggleButton`, `syncDualSlider`, `initSidebarCollapse`, `initBottomSheet`, `initModal`, `inlineSVGImages`) | Sim (Auto-render CDN) | Sim (`assets/icons/*.svg`) | Não se aplica | Presente (Card ativo) | **Totalmente Conforme** |
| 5 | `estacionarias2d.html` | Ondulatória / Modos 2D (Chladni) | Canvas 2D (`#simulacao`) | ES Module (`estacionarias2d.js`) | `design-system.css` + `estacionarias2d.css` | Quase Completo (`syncDualSlider`, `initSidebarCollapse`, `initBottomSheet`, `initModal`, `inlineSVGImages`) | Sim (Auto-render CDN) | Sim (`assets/icons/*.svg`) | Não se aplica | Presente (Card ativo) | **Totalmente Conforme** |
| 6 | `fonons.html` | Estado Sólido / Modos Normais de Rede | Canvas 2D rígido (`900x600`) | Classic Script (`fonons.js`) | `base.css` + `fonons.css` | Ausente (0 controles) | Sim (Auto-render CDN) | Não (Botões texto) | Não se aplica | Presente (Card ativo) | **Legado** |
| 7 | `gravidade.html` | Mecânica Celeste / Gravitação 3D Perspectiva | Canvas 2D (projeção perspectiva manual 3D) | Classic Script (`gravidade.js`) + **Chart.js CDN** | `base.css` + `gravidade.css` | Ausente (0 controles) | Sim (Auto-render CDN) | Não | Não se aplica | **ÓRFÃO (Sem link)** | **Legado** |
| 8 | `matrizes.html` | Álgebra Linear / Transformações 2D | Canvas 2D interativo (`#simCanvas`) | Classic Script (`matrizes.js`) | `base.css` + `matrizes.css` | Ausente (0 controles) | Sim (Auto-render CDN) | Não | Não se aplica | Presente (Card ativo) | **Legado** |
| 9 | `movimento.html` | Cinemática 1D / MRU, MRUV & Encontros | Canvas 2D dual (Pista 1D + Gráfico s(t)) | ES Module (`movimento.js` em classe) | `design-system.css` + `movimento.css` | Quase Completo (`initToggleButton`, `initSidebarCollapse`, `initBottomSheet`, `initModal`, `inlineSVGImages`) | Sim (Auto-render CDN) | Sim (`assets/icons/*.svg`) | Não se aplica | Presente (Card ativo) | **Parcialmente Conforme** |
| 10 | `particulas.html` | Dinâmica Molecular & Campos Retardados | Canvas 2D principal + 2x Telemetria | ES Module (`particulas.js`) | `design-system.css` + `particulas.css` | Referência Total (`initToggleButton`, `syncDualSlider`, `RealtimePlot`, `initSidebarCollapse`, `initBottomSheet`, `initModal`, `inlineSVGImages`) | Sim (Auto-render CDN) | Sim (`assets/icons/*.svg`) | Não se aplica | Presente (Card ativo) | **Totalmente Conforme** |
| 11 | `quedalivre.html` | Mecânica / Cinemática com Colisão | Canvas 2D rígido (`600x600`) | Classic Script (`quedalivre.js`) | `base.css` + `quedalivre.css` | Ausente (0 controles) | Sim (Auto-render CDN) | Não | Não se aplica | Presente (Card ativo) | **Legado** |
| 12 | `snell.html` | Óptica Geométrica / Ray Tracing Meios Não-Homogêneos | Canvas 2D duplo + Buffer acumulador | ES Module (`snell.js`) + **Web Worker** (`snell.worker.js`) | `design-system.css` + `snell.css` | Referência Total (`initToggleButton`, `syncDualSlider`, `initSidebarCollapse`, `initBottomSheet`, `initModal`, `inlineSVGImages`) | Sim (Auto-render CDN) | Sim (`assets/icons/*.svg`) | Não se aplica | Presente (Card ativo) | **Totalmente Conforme** |
| 13 | `tensor_de_inercia.html` | Mecânica Clássica / Tensor 3x3 & Poinsot | Three.js duplo (Cena 3D + Elipsoide) | ES Module (`tensor_de_inercia.js`) + **numeric.js CDN** | `base.css` + `tensor_de_inercia.css` | Ausente (0 controles) | Sim (Auto-render CDN) | Não | Parcial (Three 0.158 desatualizado) | **ÓRFÃO (Sem link)** | **Legado** |
| 14 | `ui_lab.html` | Design System 2.0 / UI Component Sandbox | Three.js 0.165 3D + DOM Showcases | ES Module (`ui_lab.js`) | `design-system.css` puro | Exaustivo (Testbench de todos os controllers) | Sim (Auto-render CDN) | Sim (`assets/icons/*.svg` - 66 ícones) | Sim (0.165.0) | Presente (Card ativo) | **Totalmente Conforme** |

---

## 3. Catálogo Sistemático de Débitos Técnicos por Categoria

### 3.1 Categoria 1: Arquitetura de Scripts e Modularização
1. **Scripts Globais / Classic Scripts**:
   - `audio.js`, `fonons.js`, `gravidade.js`, `matrizes.js` e `quedalivre.js` poluem o escopo global (`window`), sem `import`/`export`. Não usam ES Modules, impedindo compartilhamento de código com `sim-ui.js`.
2. **Scripts e Estilos Órfãos / Abandonados**:
   - `simulacoes/css/buttons.css`: arquivo vazio de 0 bytes mantido no repositório.
   - `simulacoes/scripts/buttons.js`: script de 20 linhas que referencia `aberturaSlider` que não existe em nenhuma simulação ativa.
3. **Comunicação de Web Workers sem Tipagem Estruturada**:
   - `clima.worker.js` e `snell.worker.js` operam com payloads de mensagens ad-hoc sem interfaces TypeScript/JSDoc definidas, dificultando rastreabilidade de dados.

### 3.2 Categoria 2: Folhas de Estilo e Sistema de Tokens
1. **Retenção de `css/base.css`**:
   - 6 simulações continuam carregando `css/base.css` (422 linhas de código legado com `@import` de Google Fonts redundante, cores dessincronizadas e sem tokens DS 2.0).
2. **Cores Hexadecimais Hardcoded em Interfaces**:
   - `gravidade.css`, `matrizes.css`, `audio.css` e `tensor_de_inercia.css` definem cores diretas (ex.: `#222`, `#1e293b`, `#4CAF50`, `#007acc`) em botões, bordas e fundos, violando a Regra 2 de `AGENTS.md` que proíbe hex solto fora dos tokens CSS de `:root`.
3. **Omissão Global de `touch-action: none;`**:
   - `css/design-system.css` define `touch-action: none;` na alça do bottom sheet, mas NÃO o declara nos containers `.canvas-area canvas` e `#three-container canvas`, forçando 12 das 14 simulações a quebrarem ergonomicamente no mobile.

### 3.3 Categoria 3: Controladores de UI e `sim-ui.js`
1. **Sliders Manuais sem `.sim-dual-slider`**:
   - `atomo_de_hidrogenio.html` utiliza range sliders manuais com span de texto.
   - `movimento.html` utiliza `.clean-slider-item` com display estático `<strong>` em vez de input numérico sincronizado.
   - `clima.html` tem sliders manuais em 4 abas diferentes.
   - `fonons.html`, `audio.html` e `gravidade.html` usam `<input type="range">` crus sem campos numéricos acoplados.
2. **Ausência de `.sim-transport-bar` Padronizada**:
   - `audio.html`, `fonons.html`, `gravidade.html`, `matrizes.html`, `quedalivre.html` e `tensor_de_inercia.html` não implementam a barra de transporte universal (`.sim-transport-bar`), carecendo de botões de Play/Pause com persistência de estado e pílulas de velocidade temporal.
3. **Inexistência de Componentes Nativos no DS 2.0**:
   - O DS 2.0 não oferece manipulador de matrizes/tensores nem seletor tridimensional de vetores, forçando `matrizes.html` e `tensor_de_inercia.html` a criarem DOMs proprietários frágeis.

### 3.4 Categoria 4: Dependências Externas Obsoletas
1. **`Chart.js` em `gravidade.html`**:
   - Inclusão desnecessária de biblioteca pesada via CDN externo (`https://cdn.jsdelivr.net/npm/chart.js`) para plotar 2 linhas simples de energia cinética e potencial.
2. **`numeric.js` em `tensor_de_inercia.html`**:
   - Inclusão de biblioteca obsoleta de 2013 (`numeric-1.2.6.min.js` via cdnjs) com quase 200 KB para cálculo de autovetores e autovalores de matriz simétrica $3\times 3$, que pode ser resolvida de forma analítica exata (Cardano / método trigonométrico de Viète) em menos de 50 linhas de JS puro.

### 3.5 Categoria 5: Integridade do Hub e Descoberta
1. **Simulações Órfãs**:
   - `simulacoes/gravidade.html` e `simulacoes/tensor_de_inercia.html` estão perfeitamente executáveis, mas não possuem cards correspondentes em `index.html`, sendo invisíveis para os usuários finais da plataforma.

---

## 4. Fichas de Diagnóstico Individual das 14 Simulações

---

### 4.1 Ficha Técnica: `atomo_de_hidrogenio.html`
* **Domínio Científico**: Mecânica Quântica / Estrutura da Matéria / Equação de Schrödinger em Potenciais Centrais.
* **Arquivos**: `simulacoes/atomo_de_hidrogenio.html` (438 linhas, 22.6 KB), `simulacoes/scripts/atomo_de_hidrogenio.js` (830 linhas, 29.7 KB), `simulacoes/css/atomo_de_hidrogenio.css` (10.5 KB).
* **Motor & Renderização**: Three.js WebGL (0.165.0 via importmap) com `OrbitControls`. Computa funções de onda analíticas $\Psi_{n,l,m_l}(r,\theta,\phi) = R_{nl}(r) Y_{l}^{m_l}(\theta,\phi)$ com polinômios associados de Laguerre $L_{n-l-1}^{2l+1}$ e harmônicos esféricos reais, gerando nuvem de pontos via amostragem de probabilidade Monte Carlo com `THREE.Points`.
* **Arquitetura de UI**:
  - Implementa `.sim-header`, `.canvas-area`, `.controls-panel`, `.sheet-drag-handle`, `.tab-nav` (Parâmetros / Teoria) e modo foco.
  - Implementa `.sim-popover` flutuante no modo foco para troca rápida dos números quânticos $(n, l, m_l)$.
* **Classificação DS**: **Parcialmente Conforme**.
* **Débitos Técnicos Identificados**:
  1. *Sliders*: Não usa `.sim-dual-slider` nem `syncDualSlider`; o número de pontos da nuvem utiliza slider avulso com sincronização manual via listener de input.
  2. *Evolução Temporal*: Não possui `.sim-transport-bar` (é justificado pelo caráter estacionário dos orbitais, mas falta padronizar a barra de ações secundárias).
* **Conformidade Mobile**: **Nível A (Referência)**. `#three-container` possui `touch-action: none;` explícito em `atomo_de_hidrogenio.css:12`, suporte a `env(safe-area-inset-bottom)` e toolbar compacta responsiva.
* **Plano de Remediação**:
  - Migrar o slider de densidade de pontos para `.sim-dual-slider` com `syncDualSlider`.
  - Integrar o novo componente `Vector3DPicker` quando disponível para visualização opcional de campo elétrico ou magnético externo (Efeito Stark/Zeeman).

---

### 4.2 Ficha Técnica: `audio.html`
* **Domínio Científico**: Física Acústica / Ondulatória / Análise Espectral e Séries de Fourier.
* **Arquivos**: `simulacoes/audio.html` (174 linhas, 8.7 KB), `simulacoes/scripts/audio.js` (732 linhas, 23.3 KB), `simulacoes/css/audio.css` (10.5 KB).
* **Motor & Renderização**: Canvas HTML5 2D duplo (`#timeCanvas` para forma de onda no tempo e `#freqCanvas` para espectro de Fourier FFT) com visualização Picture-in-Picture (PiP). Integrado à Web Audio API nativa (`AudioContext`, `AnalyserNode`, `OscillatorNode`, microfone via `navigator.mediaDevices.getUserMedia`).
* **Arquitetura de UI**:
  - Estrutura legada em `base.css` com classes customizadas (`.audio-canvas-container`, `.audio-hud`, `.canvas-stage`).
  - Abas 2 e 3 (`#tabBtnWaves` e `#tabBtnBeats`) desativadas com avisos de placeholder.
  - Não consome `sim-ui.js`.
* **Classificação DS**: **Legada**.
* **Débitos Técnicos Identificados**:
  1. *CSS & Tokens*: Carrega `base.css`; usa cores soltas e botões próprios sem variáveis do DS 2.0.
  2. *JS Modular*: Script clássico procedural no escopo global sem `type="module"`.
  3. *UI Controllers*: Não utiliza `sim-ui.js`, sem `initBottomSheet`, sem `syncDualSlider`.
  4. *Mobile*: Sem bottom sheet (painel empilhado abaixo da tela); PiP flutuante de 220px invade 60% da tela mobile; canvas sem `touch-action: none;`.
* **Plano de Remediação**:
  - Reestruturar para `<main class="sim-layout">` com `design-system.css`.
  - Modularizar `audio.js` para ES Module importando `sim-ui.js`.
  - Implementar Bottom Sheet e redimensionar dinamicamente o PiP em telas $\le 900\text{px}$.
  - Ativar as etapas de batimentos e superposição de harmônicos com sliders padronizados.

---

### 4.3 Ficha Técnica: `clima.html`
* **Domínio Científico**: Física Planetária / Meteorologia Computacional / Tesselação de Voronoi Esférica Centrada (SCVT) e Balanço Radiativo Global.
* **Arquivos**: `simulacoes/clima.html` (668 linhas, 39.1 KB), `simulacoes/scripts/clima.js` (1.711 linhas, 70.2 KB), `simulacoes/scripts/clima.worker.js` (654 linhas, 24.9 KB), `simulacoes/css/clima.css` (10.2 KB).
* **Motor & Renderização**: Three.js WebGL (0.165.0 via importmap) com `OrbitControls`. Geração de malha geodésica esférica de Voronoi a partir de icosaedro subdividido e relaxamento de Lloyd em segundo plano via Web Worker. Renderização de mapas da NASA (Blue Marble), cálculo da insolação diária $S(\phi, \delta)$ e modelo térmico de difusão de energia em 1D/2D.
* **Arquitetura de UI**:
  - Implementa `.sim-header`, `.canvas-area`, `.controls-panel`, `.sheet-drag-handle`, `.tab-nav` (Parâmetros / Teoria) e pílulas de navegação por 4 etapas (`.stage-nav-pills`).
  - Modais didáticos com KaTeX via `initModal`.
* **Classificação DS**: **Parcialmente Conforme**.
* **Débitos Técnicos Identificados**:
  1. *Touch-Action*: `#three-container` NÃO possui `touch-action: none;` em `clima.css`, provocando travamento de rotação do globo e scroll acidental no mobile.
  2. *Sliders*: Não utiliza `syncDualSlider`; usa múltiplos sliders avulsos em 4 etapas com spans de texto manuais.
  3. *Transporte*: Múltiplos botões de play/pause independentes (relaxamento de Lloyd, translação orbital, rotação diurna) em vez de uma `.sim-transport-bar` coerente.
  4. *HUD Mobile*: O HUD de 10 linhas cobre 40% da tela sobre o Bottom Sheet recolhido.
  5. *KaTeX Overflow*: Equações display de balanço térmico transbordam o modal no mobile.
* **Plano de Remediação**:
  - Adicionar `touch-action: none;` imediato no container 3D.
  - Sincronizar sliders com `syncDualSlider`.
  - Compactar o HUD para modo colapsável no mobile.
  - Aplicar `overflow-x: auto` nas fórmulas do modal de teoria.

---

### 4.4 Ficha Técnica: `drude.html`
* **Domínio Científico**: Física da Matéria Condensada / Transporte de Carga / Modelo Clássico de Drude em Redes Cristalinas.
* **Arquivos**: `simulacoes/drude.html` (401 linhas, 24.4 KB), `simulacoes/scripts/drude.js` (713 linhas, 25.6 KB), `simulacoes/css/drude.css` (1.4 KB).
* **Motor & Renderização**: Canvas HTML5 2D (`#drudeCanvas`). Dinâmica molecular microscópica de elétrons livres acelerados por campo elétrico $\vec{E}$, sofrendo colisões elásticas e inelásticas com íons de uma rede cristalina (quadrada, triangular, grafeno, armchair, kagome e amorfa).
* **Arquitetura de UI**:
  - **Padrão de Ouro do Design System 2.0**:
    - `.sim-transport-bar` com `initToggleButton`, passo de tempo e pílulas de velocidade.
    - Todos os parâmetros utilizam `.sim-dual-slider` vinculados por `syncDualSlider`.
    - `.sheet-drag-handle`, `.tab-nav` e `initBottomSheet`.
    - Ícones SVG nativos via `inlineSVGImages`.
* **Classificação DS**: **Totalmente Conforme**.
* **Débitos Técnicos Identificados**:
  1. *Touch-Action*: Falta `touch-action: none;` no `#drudeCanvas` em `css/drude.css`.
  2. *Hit-targets*: Os botões segmentados de direção de campo elétrico possuem 38px (abaixo de 44px).
  3. *KaTeX Overflow*: Fórmulas de condutividade no modal didático sofrem corte horizontal em telas $\le 400\text{px}$.
* **Plano de Remediação**:
  - Adicionar `touch-action: none;` no canvas.
  - Elevar `min-height` dos botões segmentados para 44px.
  - Garantir `overflow-x: auto` no modal de teoria.

---

### 4.5 Ficha Técnica: `estacionarias2d.html`
* **Domínio Científico**: Física Ondulatória / Acústica / Modos Normais em Superfícies Bidimensionais e Figuras de Chladni.
* **Arquivos**: `simulacoes/estacionarias2d.html` (360 linhas, 20.9 KB), `simulacoes/scripts/estacionarias2d.js` (353 linhas, 13.6 KB), `simulacoes/css/estacionarias2d.css` (1.1 KB).
* **Motor & Renderização**: Canvas HTML5 2D (`#simulacao`). Avaliação direta da equação de ondas estacionárias bidimensionais em placas quadradas com contorno livre ou fixo: $\psi(x, y) = \cos\frac{n\pi x}{L}\cos\frac{m\pi y}{L} \pm \cos\frac{m\pi x}{L}\cos\frac{n\pi y}{L}$.
* **Arquitetura de UI**:
  - Implementa `.sim-header`, `.canvas-area`, `.controls-panel`, `.sheet-drag-handle`, `.tab-nav`, `initSidebarCollapse`, `initBottomSheet`, `initModal`, `inlineSVGImages`.
  - Presets rápidos em grade 2x2 e sliders dos modos espaciais $(n, m)$ com `syncDualSlider`.
* **Classificação DS**: **Totalmente Conforme**.
* **Débitos Técnicos Identificados**:
  1. *Touch-Action*: Falta `touch-action: none;` no canvas.
  2. *Inspeção Tátil*: O evento `touchmove` está com `{ passive: true }`, fazendo o toque na placa rolar a página verticalmente em vez de inspecionar a amplitude nodal.
  3. *KaTeX Overflow*: Equações display de autofunções cortam horizontalmente no modal em telas menores que 400px.
* **Plano de Remediação**:
  - Adicionar `touch-action: none;` no canvas e remover a passividade do listener de toque.
  - Garantir contenção de overflow nas fórmulas do modal.

---

### 4.6 Ficha Técnica: `fonons.html`
* **Domínio Científico**: Física do Estado Sólido / Termodinâmica / Modos Vibracionais Coletivos (Fônons Acústicos e Ópticos) em Cadeias Unidimensionais.
* **Arquivos**: `simulacoes/fonons.html` (96 linhas, 4.2 KB), `simulacoes/scripts/fonons.js` (365 linhas, 14.1 KB), `simulacoes/css/fonons.css` (859 bytes).
* **Motor & Renderização**: Canvas HTML5 2D fixo (`width="900" height="600"`). Sistema acoplado massa-mola integrado numericamente com excitação de onda senoidal contínua ou pulsos pontuais.
* **Arquitetura de UI**:
  - Estrutura legada em `base.css`.
  - Sliders brutos sem input numérico; botões avulsos `#btn-pause` e `#btn-reset`.
  - Sem abas, sem aba de teoria, sem ícones SVG nativos.
* **Classificação DS**: **Legada**.
* **Débitos Técnicos Identificados**:
  1. *Canvas Rígido*: Dimensões 900x600 px cravadas no HTML, quebrando completamente em telas $< 900\text{px}$.
  2. *Descalibração de Toque*: A função de mouse `getPosMouse(e)` divide coordenadas relativas sobre um canvas estático de 900px, gerando erro de clique de até 2,5x em smartphones.
  3. *Mouse-Only Trap*: Perturbação de átomos escuta apenas `mousedown`/`mousemove`.
  4. *CSS & JS*: Script clássico não-modular; depende de `base.css`.
* **Plano de Remediação**:
  - Migrar canvas para layout responsivo fluido com `ResizeObserver`.
  - Migrar para ES Module, `design-system.css` e adotar `.sim-dual-slider`.
  - Substituir listeners de mouse por Pointer Events unificados.
  - Adicionar aba Teoria com relação de dispersão $\omega(k) = 2\sqrt{\frac{K}{M}}|\sin(ka/2)|$.

---

### 4.7 Ficha Técnica: `gravidade.html` (Órfão no Hub)
* **Domínio Científico**: Mecânica Clássica / Gravitação Newtoniana / Leis de Kepler e Conservação de Energia Orbital.
* **Arquivos**: `simulacoes/gravidade.html` (82 linhas, 3.3 KB), `simulacoes/scripts/gravidade.js` (278 linhas, 9.0 KB), `simulacoes/css/gravidade.css` (1.4 KB).
* **Motor & Renderização**: Canvas HTML5 2D com projeção isométrica/perspectiva 3D codificada manualmente em trigonometria pura (`project3DTo2D`). Simula órbita de dois corpos em torno do centro de massa e renderiza telemetria de energia cinética e potencial.
* **Arquitetura de UI**:
  - Contêiner proprietário `.side-panel` com 2 checkboxes brutos.
  - Carrega **Chart.js via CDN** para renderizar os 2 gráficos de energia.
  - Não utiliza `sim-ui.js`.
* **Classificação DS**: **Legada**.
* **Débitos Técnicos Identificados**:
  1. *Status Órfão*: Totalmente ausente de `index.html`.
  2. *Dependência Externa Pesada*: Uso de `Chart.js` via CDN para gráficos simples.
  3. *Layout Mobile Quebrado*: Breakpoint rígido em 768px esmaga painel em 180px no tablet; dois canvases de gráfico de 220px estouram a tela no mobile.
  4. *Interatividade Restrita*: Sem controle de massas, sem ajuste de excentricidade, sem play/pause.
* **Plano de Remediação**:
  - Substituir `Chart.js` pelo novo componente `MultiSeriesPlot` nativo em canvas 2D puro.
  - Adicionar `.sim-transport-bar` e sliders para $M_1$, $M_2$ e velocidade orbital.
  - Criar card dedicado no portal `index.html` na categoria Física.

---

### 4.8 Ficha Técnica: `matrizes.html`
* **Domínio Científico**: Álgebra Linear / Geometria Analítica / Transformações Lineares 2D, Base Cartesiana, Determinante e Autovetores.
* **Arquivos**: `simulacoes/matrizes.html` (174 linhas, 8.5 KB), `simulacoes/scripts/matrizes.js` (662 linhas, 24.8 KB), `simulacoes/css/matrizes.css` (5.9 KB).
* **Motor & Renderização**: Canvas HTML5 2D interativo (`#simCanvas`). Malha cartesiana dinâmica que se deforma sob a ação de uma matriz $\begin{pmatrix} a & b \\ c & d \end{pmatrix}$, exibindo a área do paralelogramo gerado por $T(\hat{i})$ e $T(\hat{j})$ e permitindo o arrasto dos vetores de base com o cursor.
* **Arquitetura de UI**:
  - Estrutura customizada com `.matrix-box`, 4 campos manuais e presets em dropdown.
  - Cartão de telemetria geométrica para determinante e área orientada.
  - Não consome `sim-ui.js`.
* **Classificação DS**: **Legada**.
* **Débitos Técnicos Identificados**:
  1. *Mouse-Only Trap*: O arrasto interativo das pontas dos vetores $\hat{i}$ e $\hat{j}$ escuta unicamente `mousedown`, `mousemove` e `mouseup`. Usuários móveis não conseguem arrastar os vetores na tela.
  2. *Touch-Action*: Canvas sem `touch-action: none;`; tocar no gráfico rola a página.
  3. *Arquitetura*: Baseada em `base.css` e script clássico.
  4. *Falta de Componente*: Não utiliza componente padrão do DS 2.0 para matrizes.
* **Plano de Remediação**:
  - Adotar a nova extensão `MatrixTensorEditor` para a entrada da matriz $2\times 2$.
  - Migrar para ES Module e `design-system.css` com Bottom Sheet.
  - Converter a manipulação dos vetores para Pointer Events unificados.

---

### 4.9 Ficha Técnica: `movimento.html`
* **Domínio Científico**: Cinemática Escalar 1D / Movimento Retilíneo Uniforme (MRU) / Movimento Retilíneo Uniformemente Variado (MRUV) e Encontro de Móveis.
* **Arquivos**: `simulacoes/movimento.html` (520 linhas, 29.1 KB), `simulacoes/scripts/movimento.js` (1.777 linhas, 64.8 KB), `simulacoes/css/movimento.css` (5.4 KB).
* **Motor & Renderização**: Canvas HTML5 2D (`#simCanvas`). Sistema dual sofisticado que alterna entre Pista 1D com esferas/carros, vetores estroboscópicos e escala métrica, e Gráfico 2D espaço-tempo $s(t)$ com cálculo analítico do instante de cruzamento por raízes de Bhaskara.
* **Arquitetura de UI**:
  - Implementa `.sim-transport-bar` com `initToggleButton`.
  - Abas em `.tab-nav` (Manual, 1 Corpo, 2 Corpos, Teoria).
  - Bottom Sheet e modo foco.
* **Classificação DS**: **Parcialmente Conforme**.
* **Débitos Técnicos Identificados**:
  1. *Dual-Slider Débito*: Em vez de `.sim-dual-slider` com inputs numéricos editáveis, utiliza `.clean-slider-item` com slider e `<strong class="slider-val">` estático, impossibilitando digitação precisa de valores.
  2. *Pinch-Zoom Ausente*: O zoom no gráfico $s(t)$ foi implementado apenas via evento de roda de mouse (`wheel`), sem suporte a pinça com dois dedos no mobile.
  3. *KaTeX Overflow*: Equações quadráticas do instante de encontro transbordam o modal de teoria no mobile.
* **Plano de Remediação**:
  - Migrar os sliders para `.sim-dual-slider` com `syncDualSlider`.
  - Adicionar suporte a gesto de pinça no canvas gráfico.
  - Proteger equações com `overflow-x: auto`.

---

### 4.10 Ficha Técnica: `particulas.html`
* **Domínio Científico**: Física Estatística / Eletrodinâmica Clássica / Potencial de Lennard-Jones, Campos Retardados (Funções de Green) e Termodinâmica Molecular.
* **Arquivos**: `simulacoes/particulas.html` (502 linhas, 32.4 KB), `simulacoes/scripts/particulas.js` (876 linhas, 31.5 KB), `simulacoes/css/particulas.css` (1.5 KB).
* **Motor & Renderização**: Canvas HTML5 2D principal (`#myCanvas`) com frentes de onda circulares concêntricas propagando-se a velocidade finita $c$, mais 2 mini-canvases para telemetria em tempo real via classe `RealtimePlot`.
* **Arquitetura de UI**:
  - **Referência do Design System 2.0**:
    - `.sim-transport-bar` com `initToggleButton`.
    - 4x `.sim-dual-slider` sincronizados via `syncDualSlider` ($T_{\text{target}}$, $c$, $\gamma$, $\varepsilon_C$).
    - 2x cartões `.sim-plot-card` de telemetria com `RealtimePlot` (Energia Cinética $K(t)$ e Temperatura $T(t)$).
    - Grade de 8 presets com ícones SVG animados dinamicamente via CSS.
    - `.sheet-drag-handle`, `.tab-nav` com abas Parâmetros, Telemetria e Teoria.
* **Classificação DS**: **Totalmente Conforme**.
* **Débitos Técnicos Identificados**:
  1. *Touch-Action*: Falta `touch-action: none;` em `#myCanvas` em `css/particulas.css`.
  2. *Mouse-Only Trap*: A injeção de calor e agitação do gás via cursor (`aplicarImpulsoCursor`) escuta unicamente `mousedown`/`mousemove`. Tocar na tela não agita partículas e causa rolagem indesejada.
  3. *KaTeX Overflow*: 11 equações de campo retardado transbordam o modal de teoria no mobile.
* **Plano de Remediação**:
  - Adicionar `touch-action: none;` imediato no canvas.
  - Migrar manipulação para Pointer Events.
  - Proteger equações do modal contra overflow.

---

### 4.11 Ficha Técnica: `quedalivre.html`
* **Domínio Científico**: Mecânica Clássica / Cinemática / Gravidade com Colisão Inelástica e Restituição.
* **Arquivos**: `simulacoes/quedalivre.html` (64 linhas, 2.6 KB), `simulacoes/scripts/quedalivre.js` (175 linhas, 6.7 KB), `simulacoes/css/quedalivre.css` (38 bytes).
* **Motor & Renderização**: Canvas HTML5 2D com dimensões rígidas (`width="600" height="600"`). Partícula com gravidade $g$, integração Euler simples e colisões nas bordas com coeficiente de restituição $e = 0.7$.
* **Arquitetura de UI**:
  - **Incompleta e Abandonada**: O painel lateral tem apenas um parágrafo de texto explicativo sem controles interativos. Não há sliders para $g$, $e$ ou massa, nem botões de reset ou pause.
  - Não utiliza `sim-ui.js`, sem abas, sem modo mobile.
* **Classificação DS**: **Legada**.
* **Débitos Técnicos Identificados**:
  1. *Canvas Fixo*: Estoura horizontalmente telas com largura $< 600\text{px}$.
  2. *Mouse-Only Trap*: Arremesso da esfera escuta exclusivamente `mousedown`, `mousemove` e `mouseup`. O toque não funciona.
  3. *Falta de Controles*: Ausência total de sliders, botões e telemetria.
* **Plano de Remediação**:
  - Reconstruir o layout com `design-system.css`, Bottom Sheet e canvas fluido.
  - Adicionar `.sim-dual-slider` para Gravidade $g$, Coeficiente de Restituição $e$, e Resistência do Ar $b$.
  - Adicionar `.sim-transport-bar` e mini-plot com `RealtimePlot` de Energia Mecânica $E(t)$.
  - Implementar Pointer Events para agarrar e arremessar a bola com o dedo.

---

### 4.12 Ficha Técnica: `snell.html`
* **Domínio Científico**: Óptica Geométrica / Eletromagnetismo / Lei de Snell em Meios Não-Homogêneos e Ray Tracing com Gradiente de Índice de Refração $\nabla n$.
* **Arquivos**: `simulacoes/snell.html` (422 linhas, 24.7 KB), `simulacoes/scripts/snell.js` (717 linhas, 27.8 KB), `simulacoes/scripts/snell.worker.js` (161 linhas, 5.8 KB), `simulacoes/css/snell.css` (1.1 KB).
* **Motor & Renderização**: Canvas HTML5 2D duplo (canvas de cena + buffer acumulador de persistência luminosa). Integração numérica da equação dos raios luminosos $\frac{d}{ds}(n \frac{d\vec{r}}{ds}) = \nabla n$ com geração de mapa $n(x,y)$ em Web Worker.
* **Arquitetura de UI**:
  - **Padrão de Ouro do Design System 2.0**:
    - `initToggleButton` para execução e pausa.
    - 4x `.sim-dual-slider` com `syncDualSlider`.
    - Seletor de 11 perfis ópticos contínuos.
    - `.sheet-drag-handle`, `.tab-nav`, `initSidebarCollapse`, `initBottomSheet`, `initModal`, `inlineSVGImages`.
* **Classificação DS**: **Totalmente Conforme**.
* **Débitos Técnicos Identificados**:
  1. *Touch-Action*: Falta `touch-action: none;` no canvas.
  2. *Mouse Wheel Trap*: Ajuste do ângulo de emissão no canvas exige roda de mouse (`wheel`), inacessível no mobile.
  3. *Mouse Button Trap*: Emissão exige `e.button === 0` em `mousedown`.
  4. *KaTeX Overflow*: Equações diferenciais de raios transbordam no modal mobile.
* **Plano de Remediação**:
  - Adicionar `touch-action: none;` no canvas.
  - Mapear gesto de arrasto angular por toque (ou botões virtuais de rotação).
  - Garantir contenção de overflow no modal.

---

### 4.13 Ficha Técnica: `tensor_de_inercia.html` (Órfão no Hub)
* **Domínio Científico**: Mecânica Clássica / Mecânica Racional / Tensor de Inércia Tridimensional, Eixos Principais e Elipsoide de Poinsot.
* **Arquivos**: `simulacoes/tensor_de_inercia.html` (218 linhas, 10.9 KB), `simulacoes/scripts/tensor_de_inercia.js` (1.194 linhas, 40.5 KB), `simulacoes/css/tensor_de_inercia.css` (8.1 KB).
* **Motor & Renderização**: Three.js 3D (versão 0.158.0 desatualizada via importmap) com **duplo renderer WebGL** simultâneo (cena principal com massas arrastáveis e mini-cena lateral com o Elipsoide de Inércia). Diagonalização via biblioteca legada **numeric.js CDN**.
* **Arquitetura de UI**:
  - Estrutura baseada em `base.css`.
  - Matriz 3x3 artesanal `.tensor-matrix` com 9 células estáticas.
  - Não utiliza `sim-ui.js`, sem bottom sheet.
* **Classificação DS**: **Legada**.
* **Débitos Técnicos Identificados**:
  1. *Status Órfão*: Totalmente ausente de `index.html`.
  2. *Three.js Desatualizado*: Usa versão 0.158 em vez da padronizada 0.165.
  3. *Dependência Obsoleta*: Uso de `numeric.js` para autovalores $3\times 3$.
  4. *Risco de GPU Crash*: Dois renderers WebGL simultâneos em mobile causam perda de contexto WebGL em dispositivos modestos.
  5. *Sem Touch-Action*: Arrasto de massas e órbita 3D disputam gestos com o navegador.
  6. *Badge com Overflow*: `.canvas-instructions` com `white-space: nowrap` mede > 440px e estoura no mobile.
* **Plano de Remediação**:
  - Migrar para `design-system.css`, Three.js 0.165 e `sim-ui.js`.
  - Adotar os novos componentes `MatrixTensorEditor` e `Vector3DPicker`.
  - Substituir `numeric.js` por rotina analítica leve de diagonalização $3\times 3$.
  - Fundir o elipsoide na cena principal ou gerenciar um único contexto WebGL.
  - Reintegrar o card da simulação no portal `index.html`.

---

### 4.14 Ficha Técnica: `ui_lab.html`
* **Domínio Científico**: Arquitetura de Software / Design System / Sandbox de Componentes e Catálogo Visual.
* **Arquivos**: `simulacoes/ui_lab.html` (692 linhas, 41.1 KB), `simulacoes/scripts/ui_lab.js` (676 linhas, 26.2 KB), `simulacoes/css/design-system.css` puro.
* **Motor & Renderização**: Three.js WebGL (0.165.0) com nó de Torus animado + demonstrações completas de componentes DOM e canvas 2D.
* **Arquitetura de UI**:
  - **Testbench Oficial do Design System 2.0**:
    - Demonstração de todos os botões, sliders, switches e modais.
    - Demonstração do `RealtimePlot`.
    - Catálogo dinâmico com os 66 ícones SVG nativos.
* **Classificação DS**: **Totalmente Conforme**.
* **Débitos Técnicos Identificados**:
  1. *Touch-Action*: Container 3D sem `touch-action: none;`.
  2. *Hit-targets*: Os 5 seletores de tema na toolbar medem apenas 14x14px no mobile.
* **Plano de Remediação**:
  - Adicionar `touch-action: none;` no container 3D.
  - Aumentar os dots da toolbar para 22x22px no mobile.

---

## 5. Resumo das Recomendações e Próximos Passos

1. **Priorização Imediata (Lote 1)**: Injetar `touch-action: none;` globalmente em `design-system.css` e corrigir o bug de desaparecimento do Bottom Sheet em `sim-ui.js` (`initSidebarCollapse`).
2. **Reintegração de Órfãos**: Adicionar cards para `gravidade.html` e `tensor_de_inercia.html` no `index.html`.
3. **Limpeza de Arquivos Mortos**: Programar a remoção de `css/buttons.css`, `scripts/buttons.js` e a eventual eliminação de `css/base.css` após a migração das 6 simulações legadas.

---
*Fim do Relatório R1 — Matriz de Auditoria e Conformidade Técnica.*
