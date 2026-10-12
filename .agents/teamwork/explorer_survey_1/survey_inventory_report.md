# Relatório de Auditoria e Inventário Técnico Completo das Simulações
**Data:** 12 de Outubro de 2026  
**Autor:** Explorer 1 (Simulation Inventory & Technical Stack Explorer)  
**Escopo:** `c:\Users\nicol\Documents\GitHub\Site\simulacoes\` e dependências associadas  
**Status da Auditoria:** Concluída (100% dos arquivos inspecionados)  

---

## 1. Sumário Executivo

Foi realizada uma varredura exaustiva e minuciosa em **todos os 14 arquivos HTML de simulação**, bem como nos seus **18 scripts JavaScript**, **16 folhas de estilo CSS**, Web Workers e ativos vetoriais contidos no ecossistema da plataforma.

### Principais Indicadores Globais:
- **Total de Simulações Catalogadas**: 14 páginas HTML (12 catalogadas no portal `index.html` + 2 simulações órfãs não listadas no hub: `gravidade.html` e `tensor_de_inercia.html`).
- **Conformidade com Design System 2.0**:
  - **Totalmente Conforme (DS 2.0 Referência)**: 4 simulações (`drude.html`, `particulas.html`, `snell.html`, `ui_lab.html`).
  - **Parcialmente Conforme (DS 2.0 Híbrido)**: 4 simulações (`atomo_de_hidrogenio.html`, `clima.html`, `estacionarias2d.html`, `movimento.html`).
  - **Legado (DS 1.0 ou Sem Padrão)**: 6 simulações (`audio.html`, `fonons.html`, `gravidade.html`, `matrizes.html`, `quedalivre.html`, `tensor_de_inercia.html`).
- **Adoção de CSS**:
  - 8 arquivos (57,1%) utilizam `css/design-system.css` (tokens modernos `:root`, classes padronizadas).
  - 6 arquivos (42,9%) utilizam o legado `css/base.css` (tokens obsoletos, layout pré-DS 2.0).
- **Arquitetura de Scripts**:
  - 9 arquivos (64,3%) utilizam ES Modules (`<script type="module">`).
  - 5 arquivos (35,7%) utilizam scripts clássicos inline ou globais sem escopo de módulo.
  - 2 simulações utilizam Web Workers dedicados (`clima.worker.js` e `snell.worker.js`).
- **Prontidão Mobile / Telas Táteis (<= 900px)**:
  - **Bottom Sheet (`sheet-drag-handle` + `initBottomSheet`)**: 8 simulações implementam (57,1%); 6 simulações carecem completamente (42,9%).
  - **Prevenção de Scroll Acidental (`touch-action: none;` no Canvas)**: Presente explicitamente em **apenas 2 simulações** (`atomo_de_hidrogenio.css` e `movimento.css`). As outras 12 simulações falham no requisito crítico de prevenção de captura de gestos em telas sensíveis ao toque.
  - **Canvases com Dimensões Rígidas/Hardcoded**: 2 simulações legadas (`fonons.html` 900x600 e `quedalivre.html` 600x600) quebram layouts fluidos em smartphones e tablets.

---

## 2. Matriz Consolidada do Inventário Técnico

| # | Arquivo HTML | Título & Domínio Físico/Matemático | Renderização | Arquitetura JS & Workers | Uso de `sim-ui.js` | CSS Base | Dependências Externas | Suporte Mobile (Bottom Sheet / Touch) | Status DS |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `atomo_de_hidrogenio.html` | Átomo de Hidrogênio (Mecânica Quântica / Orbitais) | Three.js 3D (Nuvem Monte Carlo) | ES Module (`atomo_de_hidrogenio.js`) | Parcial (`initSidebarCollapse`, `initBottomSheet`, `inlineSVGImages`) | `design-system.css` + `atomo_de_hidrogenio.css` | Three.js 0.165 (importmap), KaTeX 0.16.11 | Bottom Sheet: Sim<br>`touch-action: none`: Sim | Parcial Conforme |
| 2 | `audio.html` | Laboratório de Áudio (Física Acústica / Fourier FFT) | HTML5 2D Canvas (Osciloscópio + FFT PIP) + Web Audio API | Classic Script (`audio.js`) | Nenhum (Custom legacy UI) | `base.css` + `audio.css` | Web Audio API nativa, KaTeX 0.16.11 | Bottom Sheet: Não<br>`touch-action: none`: Não | Legado |
| 3 | `clima.html` | Tesselação de Voronoi & Clima (Física Planetária / SCVT) | Three.js 3D (Malha geodésica esférica) | ES Module (`clima.js`) + **Web Worker** (`clima.worker.js`) | Parcial (`initSidebarCollapse`, `initBottomSheet`, `initModal`, `inlineSVGImages`) | `design-system.css` + `clima.css` | Three.js 0.165 (importmap), KaTeX 0.16.11, Texturas NASA | Bottom Sheet: Sim<br>`touch-action: none`: Não | Parcial Conforme |
| 4 | `drude.html` | Modelo de Drude (Matéria Condensada / Condução) | HTML5 2D Canvas | ES Module (`drude.js`) | Completo (`initToggleButton`, `syncDualSlider`, `initSidebarCollapse`, `initBottomSheet`, `initModal`, `inlineSVGImages`) | `design-system.css` + `drude.css` | KaTeX 0.16.11 | Bottom Sheet: Sim<br>`touch-action: none`: Não | Totalmente Conforme |
| 5 | `estacionarias2d.html` | Ondas Estacionárias 2D (Ondulatória / Chladni) | HTML5 2D Canvas (Raster de autofunções) | ES Module (`estacionarias2d.js`) | Completo exceto transport (`syncDualSlider`, `initSidebarCollapse`, `initBottomSheet`, `initModal`, `inlineSVGImages`) | `design-system.css` + `estacionarias2d.css` | KaTeX 0.16.11 | Bottom Sheet: Sim<br>`touch-action: none`: Não | Totalmente Conforme |
| 6 | `fonons.html` | Simulação de Fônons (Física do Estado Sólido) | HTML5 2D Canvas (Fixo 900x600) | Classic Script (`fonons.js`) | Nenhum (Custom legacy UI) | `base.css` + `fonons.css` | KaTeX 0.16.11 | Bottom Sheet: Não<br>`touch-action: none`: Não (Fixo) | Legado |
| 7 | `gravidade.html` *(Órfão)* | Movimento Planetário 3D (Gravitação Universal) | HTML5 2D Canvas (Projeção 3D perspectiva manual) | Classic Script (`gravidade.js`) | Nenhum (Custom `.side-panel`) | `base.css` + `gravidade.css` | **Chart.js CDN**, KaTeX 0.16.11 | Bottom Sheet: Não<br>`touch-action: none`: Não | Legado |
| 8 | `matrizes.html` | Transformações Matriciais 2D (Álgebra Linear) | HTML5 2D Canvas (Plano cartesiano interativo) | Classic Script (`matrizes.js`) | Nenhum (Custom `matrix-box`) | `base.css` + `matrizes.css` | KaTeX 0.16.11 | Bottom Sheet: Não<br>`touch-action: none`: Não | Legado |
| 9 | `movimento.html` | Cinemática 1D (Funções Horárias & Encontros) | HTML5 2D Canvas (Pista 1D + Gráfico s(t) 2D) | ES Module (`movimento.js`) | Quase completo (`initToggleButton`, `initSidebarCollapse`, `initBottomSheet`, `initModal`, `inlineSVGImages`) | `design-system.css` + `movimento.css` | KaTeX 0.16.11 | Bottom Sheet: Sim<br>`touch-action: none`: Sim | Parcial Conforme |
| 10 | `particulas.html` | Dinâmica Molecular & Campos Retardados (Eletrodinâmica) | HTML5 2D Canvas + 2x Telemetry Canvases | ES Module (`particulas.js`) | Referência total (`initToggleButton`, `syncDualSlider`, `RealtimePlot`, `initSidebarCollapse`, `initBottomSheet`, `initModal`, `inlineSVGImages`) | `design-system.css` + `particulas.css` | KaTeX 0.16.11 | Bottom Sheet: Sim<br>`touch-action: none`: Não | Totalmente Conforme |
| 11 | `quedalivre.html` | Queda Livre Interativa (Cinemática / Mecânica) | HTML5 2D Canvas (Fixo 600x600) | Classic Script (`quedalivre.js`) | Nenhum (Sem controles) | `base.css` + `quedalivre.css` | KaTeX 0.16.11 | Bottom Sheet: Não<br>`touch-action: none`: Não (Fixo) | Legado |
| 12 | `snell.html` | Lei de Snell (Óptica Geométrica / Ray Tracing) | HTML5 2D Canvas + Trail Buffer | ES Module (`snell.js`) + **Web Worker** (`snell.worker.js`) | Referência total (`initToggleButton`, `syncDualSlider`, `initSidebarCollapse`, `initBottomSheet`, `initModal`, `inlineSVGImages`) | `design-system.css` + `snell.css` | KaTeX 0.16.11 | Bottom Sheet: Sim<br>`touch-action: none`: Não | Totalmente Conforme |
| 13 | `tensor_de_inercia.html` *(Órfão)* | Tensor de Inércia (Mecânica Clássica / Rotação) | Three.js 3D (Duplo renderer: Principal + Elipsoide) | ES Module (`tensor_de_inercia.js`) | Nenhum (Custom legacy UI) | `base.css` + `tensor_de_inercia.css` | Three.js 0.158 (importmap), **numeric.js CDN**, KaTeX 0.16.11 | Bottom Sheet: Não<br>`touch-action: none`: Não | Legado |
| 14 | `ui_lab.html` | Design System UI Sandbox (Laboratório de Interface) | Three.js 3D (Torus demo) + Demonstração DOM | ES Module (`ui_lab.js`) | Exaustivo (Testbench completo de todos os controllers) | `design-system.css` | Three.js 0.165 (importmap), KaTeX 0.16.11 | Bottom Sheet: Sim<br>`touch-action: none`: Não | Totalmente Conforme |

---

## 3. Catálogo Técnico Detalhado por Simulação

### 3.1 `atomo_de_hidrogenio.html`
- **Domínio**: Física Quântica / Mecânica Quântica / Estrutura Atômica.
- **Arquivo HTML**: `simulacoes/atomo_de_hidrogenio.html` (438 linhas, 22.6 KB).
- **Scripts**: `simulacoes/scripts/atomo_de_hidrogenio.js` (830 linhas, 29.7 KB, ES Module).
- **Estilos**: `css/design-system.css` + `css/atomo_de_hidrogenio.css` (10.5 KB).
- **Motor de Renderização**: Three.js 3D (WebGL via `three@0.165.0` e `OrbitControls`). Computa analiticamente a função de onda $\Psi_{n,l,m_l}(r,\theta,\phi)$ com polinômios associados de Laguerre e Legendre e plota nuvem de probabilidades por amostragem Monte Carlo de pontos 3D (`THREE.Points`).
- **Arquitetura de UI**:
  - Implementa `.sim-header`, `.canvas-area`, `.canvas-toolbar` e `.sim-popover` para números quânticos no modo foco.
  - Implementa `.controls-panel` com `.sheet-drag-handle` e `.tab-nav` (Parâmetros / Teoria).
  - **Débito de Controles**: Não utiliza `.sim-dual-slider` nem `syncDualSlider`. O número de pontos utiliza `<input type="range" class="sim-slider">` com sincronização manual. Não utiliza `.sim-transport-bar` (é uma simulação estática de estado quântico acionada por botão "Gerar Orbital").
- **Dependências**: Three.js 0.165.0 via `<script type="importmap">`, KaTeX 0.16.11 via CDN (com auto-render).
- **Prontidão Mobile**:
  - Alça `.sheet-drag-handle` e `initBottomSheet` presentes e ativos.
  - `touch-action: none;` **configurado corretamente** no `#three-container` em `css/atomo_de_hidrogenio.css:12`.

---

### 3.2 `audio.html`
- **Domínio**: Física Acústica / Ondas / Análise Espectral de Fourier.
- **Arquivo HTML**: `simulacoes/audio.html` (174 linhas, 8.7 KB).
- **Scripts**: `simulacoes/scripts/audio.js` (732 linhas, 23.3 KB, Classic Script).
- **Estilos**: `css/base.css` + `css/audio.css` (10.5 KB).
- **Motor de Renderização**: Duplo Canvas HTML5 2D (`#timeCanvas` e `#freqCanvas`) com layout de miniatura Picture-in-Picture (PIP) alternável. Integração com Web Audio API (`AudioContext`, `AnalyserNode`, microfone `getUserMedia`).
- **Arquitetura de UI**:
  - Utiliza classes personalizadas antigas: `.canvas-stage`, `.audio-canvas-container`, `.audio-hud`, `.tabs-nav` com botões de abas customizados (`#tabBtnMic`, `#tabBtnWaves`, `#tabBtnBeats`).
  - Abas 2 e 3 estão desativadas como placeholders ("Esta etapa será ativada em breve").
  - Botão de microfone customizado (`.sim-btn--primary`), seletor segmentado ad-hoc (`#scaleControl`).
  - **Não importa nem utiliza `sim-ui.js`**.
- **Dependências**: Web Audio API nativa do navegador, KaTeX 0.16.11 via CDN.
- **Prontidão Mobile**:
  - **Inadequada**. Sem alça `.sheet-drag-handle`, sem `initBottomSheet`.
  - Canvases sem `touch-action: none;`. Gestos de toque conflitam com rolagem.
  - O HUD e o PIP ocupam área excessiva em telas pequenas, ocultando gráficos.

---

### 3.3 `clima.html`
- **Domínio**: Física Planetária / Geofísica Computacional / Tesselação de Voronoi Esférica (SCVT) e Balanço Radiativo.
- **Arquivo HTML**: `simulacoes/clima.html` (668 linhas, 39.1 KB).
- **Scripts**:
  - Thread Principal: `simulacoes/scripts/clima.js` (1.711 linhas, 70.2 KB, ES Module).
  - Thread Secundária: `simulacoes/scripts/clima.worker.js` (654 linhas, 24.9 KB, Web Worker).
- **Estilos**: `css/design-system.css` + `css/clima.css` (10.2 KB).
- **Motor de Renderização**: Three.js 3D (WebGL via `three@0.165.0` e `OrbitControls`). Renderiza malha esférica geodésica de Voronoi gerada por triangulação esférica de Delaunay e relaxamento de Lloyd no Web Worker, com mapeamento de texturas da NASA (Blue Marble) e modelos de insolação solar/estações do ano.
- **Arquitetura de UI**:
  - Implementa `.sim-header`, `.canvas-area`, `.canvas-toolbar pos-top-left` com popovers de camadas, `.sheet-drag-handle`, `.tab-nav` (Parâmetros / Teoria).
  - Possui sub-abas segmentadas em pílulas (`.stage-nav-pills` com 4 etapas: Geometria, Planeta, Estações, Clima).
  - **Débitos de Controles**: Não utiliza `.sim-dual-slider` ou `syncDualSlider` (usa sliders comuns com `<span class="slider-val">`). Não utiliza `.sim-transport-bar` unificada (possui múltiplos botões de reprodução independentes para relaxamento de Lloyd, translação orbital e rotação diurna).
- **Dependências**: Three.js 0.165.0 (importmap), KaTeX 0.16.11 CDN, assets externos de textura.
- **Prontidão Mobile**:
  - Suporta Bottom Sheet (`initBottomSheet` e `.sheet-drag-handle`).
  - **Crítico**: Falta `touch-action: none;` no container `#three-container`, provocando conflito entre órbita 3D e scroll da página em smartphones.

---

### 3.4 `drude.html`
- **Domínio**: Física da Matéria Condensada / Física do Estado Sólido / Transporte de Carga Eletrônica.
- **Arquivo HTML**: `simulacoes/drude.html` (401 linhas, 24.4 KB).
- **Scripts**: `simulacoes/scripts/drude.js` (713 linhas, 25.6 KB, ES Module).
- **Estilos**: `css/design-system.css` + `css/drude.css` (1.4 KB).
- **Motor de Renderização**: HTML5 2D Canvas (`#drudeCanvas`). Simulação microscópica de conjunto estatístico de elétrons livres interagindo com rede de íons fixos, com suporte a 6 redes cristalinas (quadrada, triangular, grafeno, armchair, kagome, amorfa).
- **Arquitetura de UI**:
  - **Padrão de Ouro de Conformidade com DS 2.0**.
  - `.sim-transport-bar` com botão toggle (`initToggleButton`), passo temporal e pílulas de velocidade.
  - Todos os sliders numéricos usam `.sim-dual-slider` com sincronização bidirecional via `syncDualSlider`.
  - `.tab-nav` com abas ativas de Parâmetros e Teoria KaTeX.
  - `.sheet-drag-handle` e `initBottomSheet`.
  - Ícones SVG nativos via `<img src="../assets/icons/...svg" class="icon-svg">` com `inlineSVGImages`.
- **Dependências**: KaTeX 0.16.11 CDN.
- **Prontidão Mobile**:
  - Bottom sheet implementado.
  - **Único Débito**: Falta `touch-action: none;` na declaração de `#drudeCanvas` em `css/drude.css`.

---

### 3.5 `estacionarias2d.html`
- **Domínio**: Física Ondulatória / Acústica / Modos Normais 2D / Figuras de Chladni.
- **Arquivo HTML**: `simulacoes/estacionarias2d.html` (360 linhas, 20.9 KB).
- **Scripts**: `simulacoes/scripts/estacionarias2d.js` (353 linhas, 13.6 KB, ES Module).
- **Estilos**: `css/design-system.css` + `css/estacionarias2d.css` (1.1 KB).
- **Motor de Renderização**: HTML5 2D Canvas (`#simulacao`). Avaliação direta da equação de ondas estacionárias bidimensionais $\psi(x, y) = \cos\frac{n\pi x}{L}\cos\frac{m\pi y}{L} \pm \cos\frac{m\pi x}{L}\cos\frac{n\pi y}{L}$ em grade raster.
- **Arquitetura de UI**:
  - Utiliza `syncDualSlider` para os modos espaciais $n$ e $m$.
  - Presets modais rápidos em grade 2x2.
  - `.sheet-drag-handle`, `.tab-nav`, `initSidebarCollapse`, `initBottomSheet`, `initModal`, `inlineSVGImages`.
  - Ausência de transport bar é justificada matematicamente pelo caráter estático das linhas nodais.
- **Dependências**: KaTeX 0.16.11 CDN.
- **Prontidão Mobile**:
  - Bottom Sheet implementado.
  - Falta `touch-action: none;` no canvas.

---

### 3.6 `fonons.html`
- **Domínio**: Física do Estado Sólido / Termodinâmica / Modos Normais em Redes Cristalinas.
- **Arquivo HTML**: `simulacoes/fonons.html` (96 linhas, 4.2 KB).
- **Scripts**: `simulacoes/scripts/fonons.js` (365 linhas, 14.1 KB, Classic Script).
- **Estilos**: `css/base.css` + `css/fonons.css` (859 bytes).
- **Motor de Renderização**: HTML5 2D Canvas (`#myCanvas`). Sistema acoplado de partículas massa-mola com excitação harmônica e propagação de ondas longitudinais/transversais.
- **Arquitetura de UI**:
  - **Totalmente Legada (DS 1.0)**.
  - Dimensões do canvas cravadas no HTML (`width="900" height="600"`), quebrando em resoluções menores que 900px.
  - Controles sem agrupamento DS 2.0; sliders brutos sem inputs numéricos; botões avulsos `#btn-reset` e `#btn-pause`.
  - Não utiliza `sim-ui.js`, sem abas, sem aba de teoria.
- **Dependências**: KaTeX 0.16.11 CDN.
- **Prontidão Mobile**: **Inapto**. Canvas fixo não responsivo, sem bottom sheet, sem controle de toque.

---

### 3.7 `gravidade.html` *(Órfão no Hub)*
- **Domínio**: Mecânica Celeste / Gravitação Newtoniana / Leis de Kepler.
- **Arquivo HTML**: `simulacoes/gravidade.html` (82 linhas, 3.3 KB).
- **Scripts**: `simulacoes/scripts/gravidade.js` (278 linhas, 9.0 KB, Classic Script).
- **Estilos**: `css/base.css` + `css/gravidade.css` (1.4 KB).
- **Motor de Renderização**: HTML5 2D Canvas com projeção perspectiva 3D para 2D codificada manualmente (`project3DTo2D`). Não utiliza Three.js. Renderiza órbita gravitacional e atualiza gráficos de energia cinética e potencial.
- **Arquitetura de UI**:
  - Utiliza contêiner proprietário `.side-panel` em vez de `.controls-panel`.
  - Apenas 2 checkboxes brutos (`#showPosition`, `#showVelocity`).
  - Utiliza biblioteca externa pesada **Chart.js via CDN** para renderizar os 2 gráficos de energia (`#kineticChart` e `#potentialChart`), em vez do componente nativo e leve `RealtimePlot` do `sim-ui.js`.
  - Não utiliza `sim-ui.js`. Sem controles de play/pause, sem ajuste de massa ou velocidade inicial.
- **Dependências**: `Chart.js` via CDN jsDelivr, KaTeX 0.16.11 CDN.
- **Status Especial**: **Órfão**. Não existe link ou card apontando para esta simulação na página inicial `index.html`.
- **Prontidão Mobile**: **Inapto**. Painel lateral fixo, sem bottom sheet, gráficos do Chart.js quebram no mobile.

---

### 3.8 `matrizes.html`
- **Domínio**: Álgebra Linear / Geometria Vetorial / Transformações Lineares 2D e Determinante.
- **Arquivo HTML**: `simulacoes/matrizes.html` (174 linhas, 8.5 KB).
- **Scripts**: `simulacoes/scripts/matrizes.js` (662 linhas, 24.8 KB, Classic Script).
- **Estilos**: `css/base.css` + `css/matrizes.css` (5.9 KB).
- **Motor de Renderização**: HTML5 2D Canvas interativo (`#simCanvas`). Renderiza grid cartesiano deformado, paralelogramo de área, e permite arrastar interativamente os vetores da base $\hat{i}$ e $\hat{j}$.
- **Arquitetura de UI**:
  - UI especializada com grid matricial manual `.matrix-box` com 4 campos numéricos ($a, b, c, d$).
  - Presets de transformação em `<select>` customizado.
  - Cartão de telemetria geométrica `.readout-card` com cálculo de determinante, área e orientação.
  - **Não utiliza `sim-ui.js`**. Falta `.sheet-drag-handle`, falta `.tab-nav` para deduções formais de determinantes e autovalores.
- **Dependências**: KaTeX 0.16.11 CDN.
- **Prontidão Mobile**:
  - **Inadequada**. Inputs numéricos da matriz 2x2 são pequenos e desconfortáveis em toque.
  - O canvas permite arrastar os vetores, mas como **não tem `touch-action: none;`**, o toque na tela arrasta a página inteira em vez do vetor base.

---

### 3.9 `movimento.html`
- **Domínio**: Cinemática Escalar 1D / Funções Horárias da Posição / Encontro de Móveis (MRU & MRUV).
- **Arquivo HTML**: `simulacoes/movimento.html` (520 linhas, 29.1 KB).
- **Scripts**: `simulacoes/scripts/movimento.js` (1.777 linhas, 64.8 KB, ES Module em classe).
- **Estilos**: `css/design-system.css` + `css/movimento.css` (5.4 KB).
- **Motor de Renderização**: HTML5 2D Canvas (`#simCanvas`). Sistema dual com alternância fluida entre visualização em Pista Horizontal 1D (com carros/esferas, vetores de velocidade e aceleração e estroboscopia) e Gráfico Cartesiano 2D $s(t)$ com determinação gráfica e analítica do instante de encontro por Bhaskara.
- **Arquitetura de UI**:
  - Implementa `.sim-transport-bar` com `initToggleButton`, passo e velocidades.
  - Implementa `.tab-nav` com 4 abas (Manual, 1 Corpo, 2 Corpos, Teoria).
  - Implementa `.sheet-drag-handle`, `initSidebarCollapse`, `initBottomSheet`, `initModal`, `inlineSVGImages`.
  - **Débito Menor**: Em vez de `.sim-dual-slider` com input numérico editável, utiliza uma variante simplificada `.clean-slider-item` com slider e `<strong class="slider-val">`.
- **Dependências**: KaTeX 0.16.11 CDN.
- **Prontidão Mobile**:
  - **Excelente**. Possui Bottom Sheet completo.
  - `touch-action: none;` **explicitamente configurado** em `css/movimento.css:14`.

---

### 3.10 `particulas.html`
- **Domínio**: Dinâmica Molecular / Eletrodinâmica Clássica / Campos Retardados (Funções de Green) e Termodinâmica.
- **Arquivo HTML**: `simulacoes/particulas.html` (502 linhas, 32.4 KB).
- **Scripts**: `simulacoes/scripts/particulas.js` (876 linhas, 31.5 KB, ES Module).
- **Estilos**: `css/design-system.css` + `css/particulas.css` (1.5 KB).
- **Motor de Renderização**: HTML5 2D Canvas principal (`#myCanvas`) com frentes de onda circulares concêntricas propagando-se a velocidade finita $c$, mais 2 mini-canvases para telemetria em tempo real via classe `RealtimePlot`.
- **Arquitetura de UI**:
  - **Referência Completa do Design System 2.0**:
    - `.sim-transport-bar` com `initToggleButton`.
    - 4x `.sim-dual-slider` sincronizados via `syncDualSlider` ($T_{\text{target}}$, $c$, $\gamma$, $\varepsilon_C$).
    - 2x cartões `.sim-plot-card` de telemetria em tempo real com `RealtimePlot` (Energia Cinética Total $K(t)$ e Temperatura Instantânea $T(t)$ com gradientes dinâmicos).
    - Grade de 8 presets com ícones SVG animados dinamicamente via CSS (`@keyframes particleVectorStem`).
    - `.sheet-drag-handle`, `.tab-nav` com abas Parâmetros, Telemetria e Teoria.
- **Dependências**: KaTeX 0.16.11 CDN.
- **Prontidão Mobile**:
  - Bottom sheet funcional.
  - **Débito Crítico**: Falta `touch-action: none;` em `#myCanvas` em `css/particulas.css`. Clicar no canvas mobile para spawnar ou arrastar partículas aciona a rolagem nativa.

---

### 3.11 `quedalivre.html`
- **Domínio**: Mecânica Clássica / Gravitação / Cinemática com Colisão e Coeficiente de Restituição.
- **Arquivo HTML**: `simulacoes/quedalivre.html` (64 linhas, 2.6 KB).
- **Scripts**: `simulacoes/scripts/quedalivre.js` (175 linhas, 6.7 KB, Classic Script).
- **Estilos**: `css/base.css` + `css/quedalivre.css` (38 bytes).
- **Motor de Renderização**: HTML5 2D Canvas fixo (`width="600" height="600"`). Corpo pontual com gravidade, velocidade vetorial e colisões inelásticas no chão e paredes com amortecimento $e = 0.7$.
- **Arquitetura de UI**:
  - **Incompleta e Abandonada**. O painel lateral possui apenas um parágrafo textual sem nenhum slider, botão ou indicador.
  - Não permite alterar a aceleração $g$, nem o coeficiente de restituição, nem a massa. Não possui botões de play/pause ou reset.
- **Dependências**: KaTeX 0.16.11 CDN.
- **Prontidão Mobile**: **Inapto**. Canvas fixo estoura a largura de telas mobile; ausência de qualquer controle tátil.

---

### 3.12 `snell.html`
- **Domínio**: Óptica Geométrica / Eletromagnetismo / Ray Tracing em Meios Contínuos e Dispersão Cromática.
- **Arquivo HTML**: `simulacoes/snell.html` (422 linhas, 24.7 KB).
- **Scripts**:
  - Thread Principal: `simulacoes/scripts/snell.js` (717 linhas, 27.8 KB, ES Module).
  - Thread Secundária: `simulacoes/scripts/snell.worker.js` (161 linhas, 5.8 KB, Web Worker).
- **Estilos**: `css/design-system.css` + `css/snell.css` (1.1 KB).
- **Motor de Renderização**: HTML5 2D Canvas duplo (canvas principal + trailCanvas acumulador de persistência luminosa). Integração numérica da equação diferencial dos raios luminosos $\frac{d}{ds}\left(n\frac{d\vec{r}}{ds}\right) = \nabla n$ em meios não-homogêneos, com cálculo do mapa $n(x,y)$ e gradiente $\nabla n$ em background worker.
- **Arquitetura de UI**:
  - **Referência do Design System 2.0**:
    - `initToggleButton` para execução e pausa.
    - 4x `.sim-dual-slider` sincronizados via `syncDualSlider` (abertura angular / largura de frente, densidade de feixes, persistência do rastro, número de comprimentos de onda espectrais).
    - Seletor de 11 perfis ópticos contínuos (interfaces planas, lentes GRIN, fibras ópticas, miragens).
    - `.sheet-drag-handle`, `.tab-nav`, `initSidebarCollapse`, `initBottomSheet`, `initModal`, `inlineSVGImages`.
- **Dependências**: KaTeX 0.16.11 CDN.
- **Prontidão Mobile**:
  - Bottom sheet implementado.
  - **Débito**: Falta `touch-action: none;` em `#simulationCanvas` em `css/snell.css`. Arrastar para apontar o laser dispara o scroll nativo.

---

### 3.13 `tensor_de_inercia.html` *(Órfão no Hub)*
- **Domínio**: Mecânica Clássica / Mecânica Racional / Tensor de Inércia, Elipsoide de Poinsot e Diagonalização.
- **Arquivo HTML**: `simulacoes/tensor_de_inercia.html` (218 linhas, 10.9 KB).
- **Scripts**: `simulacoes/scripts/tensor_de_inercia.js` (1.194 linhas, 40.5 KB, ES Module).
- **Estilos**: `css/base.css` + `css/tensor_de_inercia.css` (8.1 KB).
- **Motor de Renderização**: Three.js 3D (WebGL via `three@0.158.0`, `OrbitControls` e `DragControls`). Renderiza a cena espacial 3D com massas pontuais arrastáveis ou corpos extensos (esferas sólidas/ocas, cilindros, discos, blocos), e instancia um **segundo renderer WebGL simultâneo** dentro do painel lateral para projetar o Elipsoide de Inércia em rotação síncrona.
- **Arquitetura de UI**:
  - Código modular moderno em Three.js, mas com **casca visual totalmente legada**:
    - Usa `css/base.css` em vez de `design-system.css`.
    - Matriz 3x3 customizada `.tensor-matrix` com 9 células de texto ($I_{xx}, I_{xy}, \dots, I_{zz}$).
    - Botão "Diagonalizar Tensor" acionando biblioteca externa pesada **numeric.js** (`numeric.eig`).
    - **Não utiliza `sim-ui.js`**, não possui `.sim-dual-slider`, sem `.sim-transport-bar`, sem `.sheet-drag-handle`.
- **Dependências**: Three.js 0.158.0 via importmap, `numeric.js` 1.2.6 via CDN cdnjs, KaTeX 0.16.11 CDN.
- **Status Especial**: **Órfão**. Não está referenciado no catálogo do portal `index.html`.
- **Prontidão Mobile**:
  - **Muito Ruim**. Concorrência de dois contextos WebGL em dispositivos de baixa memória (GPU crash em celulares modestos); arrasto de massas 3D sem prevenção de scroll tátil (`touch-action: none;` ausente); controles laterais sem bottom sheet.

---

### 3.14 `ui_lab.html`
- **Domínio**: Arquitetura de Software / Design System / Sandbox e Catálogo de Componentes.
- **Arquivo HTML**: `simulacoes/ui_lab.html` (692 linhas, 41.1 KB).
- **Scripts**: `simulacoes/scripts/ui_lab.js` (676 linhas, 26.2 KB, ES Module).
- **Estilos**: `css/design-system.css` puro (sem folha de estilo complementar).
- **Motor de Renderização**: Three.js 3D (Torus Knot demonstrativo animado com iluminação dinâmica) + Demonstrações DOM e Canvas 2D dos componentes de UI.
- **Arquitetura de UI**:
  - É a suíte oficial de testes e referência do Design System 2.0.
  - Contém demonstrações interativas de:
    - Alternância de tokens de cor `--accent-color` em tempo real.
    - Todos os tipos de botões, switches, segmented controls e toolbars.
    - `.sim-dual-slider` e `syncDualSlider`.
    - Telemetria gráfica com `RealtimePlot`.
    - Modais acessíveis com KaTeX (`initModal`).
    - Controles de sidebar e bottom sheet (`initSidebarCollapse`, `initBottomSheet`).
    - Renderizador reativo de equações LaTeX em tempo real (`renderMath`, `renderMathToString`).
    - Catálogo visual dinâmico com os 66 ícones SVG nativos.
- **Dependências**: Three.js 0.165.0 (importmap), KaTeX 0.16.11 CDN.
- **Prontidão Mobile**: Totalmente adaptado para bottom sheet e foco desktop.

---

## 4. Análise dos Módulos Compartilhados, CSS e Ativos

### 4.1 Biblioteca Controladora `simulacoes/scripts/sim-ui.js` (611 linhas)
Módulo central ES6 que implementa todos os controladores interativos:
1. `getSVGContent(iconName)` / `setElementIcon(containerEl, iconName)` / `inlineSVGImages()`: Gerencia cache em memória (`Map`) dos 66 ícones SVG, convertendo tags `<img>` em SVGs inline para que a propriedade CSS `currentColor` e as variáveis do tema funcionem com fidelidade.
2. `setGlobalAccent(color)`: Altera dinamicamente `--accent-color` e variantes no `:root`.
3. `initToggleButton(target, callback)`: Controlador de botões de transporte play/pause com persistência de estado binário (0/1), alternância automática de ícone e atributo ARIA.
4. `syncDualSlider(sliderTarget, numTarget, callback)`: Sincronização bidirecional entre slider range e input numérico de alta precisão.
5. `RealtimePlot`: Classe leve para mini-gráficos canvas 2D de telemetria em 60 FPS com buffer circular, interpolação, gradientes glow e auto-resize via `ResizeObserver`.
6. `initModal(modalTarget)`: Controlador de modais de teoria com suporte a tecla ESC, clique no backdrop e compilação KaTeX no evento de abertura.
7. `initSidebarCollapse({ layoutSelector, collapseBtnSelector, expandBtnSelector, onResize })`: Gerencia modo foco desktop com recolhimento animado do painel e disparo sincronizado de callbacks de resize na Three.js e atalho de teclado `F`.
8. `initBottomSheet({ panelSelector, handleSelector, tabNavSelector, collapseBtnSelector, defaultState, onStateChange })`: Controlador tátil de painel inferior deslizante em 3 estados (`peek`, `half`, `expanded`) com captura de gestos touch swipe vertical.
9. `renderMath(target, tex, options)` / `renderMathToString(tex, options)`: Compiladores KaTeX seguros e síncronos.

### 4.2 Folhas de Estilo Compartilhadas
- `simulacoes/css/design-system.css` (2.193 linhas, 55.7 KB):
  - Sistema completo de design baseado em tokens no `:root` (`--bg-main: #070b16`, `--bg-surface`, `--accent-color: #facc15`, `--font-sans`, etc.).
  - Inclui suporte a grid responsivo `.sim-layout`, cabeçalho `.sim-header`, painéis flutuantes `.canvas-toolbar`, modais `.sim-modal-overlay`, e media queries completas para smartphones/tablets (`@media (max-width: 900px)` com comportamento de bottom sheet).
  - **Ponto de Atenção**: Define `touch-action: none;` na classe `.sheet-drag-handle` (linha 2000), mas **não define genericamente** nos containers de canvas (`.canvas-area`, `#three-container`, `canvas`), exigindo que cada CSS individual faça essa declaração.
- `simulacoes/css/base.css` (422 linhas, 10.1 KB):
  - Folha de estilo legada da versão 1.0. Ainda possui referências a `@import url('...Inter...')` desnecessárias, paleta antiga com menos contraste e sem nenhum suporte a bottom sheet ou modo foco. **Candidato a obsolescência e remoção após migração dos 6 arquivos legados.**
- `simulacoes/css/buttons.css` (0 bytes):
  - Arquivo vazio abandonado.
- `simulacoes/scripts/buttons.js` (20 linhas, 907 bytes):
  - Script isolado legado contendo listener para `aberturaSlider` que não é importado por nenhuma simulação moderna.

### 4.3 Catálogo de Ícones Vetoriais Nativos
- Localização: `assets/icons/`
- Quantidade: **66 arquivos SVG otimizados** (incluindo ícones de física especializada: `orbital.svg`, `electron-drift.svg`, `magnetic-field.svg`, `prism.svg`, `chladni-plate.svg`, `salt-nacl.svg`, `wave-sine.svg`, e gestos táteis `touch-pinch.svg`, `touch-drag.svg`).

---

## 5. Mapeamento de Débitos Técnicos e Lacunas Estruturais

### 5.1 Débitos de Usabilidade Mobile e Ergonomia Tátil (R2)
1. **Ausência Generalizada de `touch-action: none;`**:
   - Apenas `atomo_de_hidrogenio` e `movimento` possuem a propriedade CSS.
   - Em simulações interativas por toque como `clima` (rotação do globo 3D), `particulas` (inserção e arrasto de cargas), `drude` (interação no canvas) e `snell` (mira do feixe óptico), o usuário mobile sofre com a captura de gestos pelo navegador (scroll vertical indesejado e zoom de página).
2. **Ausência de Bottom Sheet em 6 Simulações**:
   - `audio`, `fonons`, `gravidade`, `matrizes`, `quedalivre` e `tensor_de_inercia` empilham a área visual e a barra de controles verticalmente em telas <= 900px, empurrando os controles para baixo da dobra e exigindo scroll longo do usuário.
3. **Canvases Rígidos sem Responsividade**:
   - `fonons.html` (900x600 px) e `quedalivre.html` (600x600 px) utilizam largura e altura fixas no elemento `<canvas>`, causando overflow horizontal e cortes em smartphones.

### 5.2 Débitos Arquiteturais e de Componentes (R1 & R3)
1. **Falta de Componentes para Álgebra Linear / Tensores no Plugin**:
   - `matrizes.html` e `tensor_de_inercia.html` precisaram criar estruturas DOM artesanais complexas para apresentar matrizes 2x2 e 3x3 (`.matrix-box`, `.tensor-matrix`).
   - O plugin `simulacoes-lab` carece de um componente nativo de manipulação matricial/tensorial bidirecional para o Design System 2.0.
2. **Dependências Externas Pesadas**:
   - `gravidade.html` carrega `Chart.js` (CDN externa pesada) para plotar duas curvas temporais simples que poderiam ser atendidas pelo `RealtimePlot` nativo de `sim-ui.js` sem overhead de rede.
   - `tensor_de_inercia.html` carrega `numeric.js` (biblioteca obsoleta de 2013) para diagonalização de matrizes 3x3, a qual pode ser calculada com métodos analíticos simples (equação característica cúbica) ou módulo leve ES6.
3. **Simulações Órfãs**:
   - `gravidade.html` e `tensor_de_inercia.html` não estão linkadas no catálogo da página principal `index.html`.

---

## 6. Conclusões e Recomendações para os Próximos Exploradores

1. **Classificação para o Explorer 2 (Auditoria de Conformidade e Usabilidade Mobile)**:
   - Os 6 arquivos legados (`audio`, `fonons`, `gravidade`, `matrizes`, `quedalivre`, `tensor_de_inercia`) devem ser marcados como **Prioridade Alta de Modernização**, pois não possuem estrutura responsiva para telas <= 900px e violam múltiplos requisitos de AGENTS.md.
   - Os 4 arquivos parcialmente conformes (`atomo_de_hidrogenio`, `clima`, `estacionarias2d`, `movimento`) requerem apenas alinhamentos pontuais (como adição de `touch-action: none;` e padronização para `.sim-dual-slider`).
2. **Subsídios para o Explorer 3 (Propostas de Expansão do Plugin)**:
   - Especificar componente nativo de entrada e exibição de Matrizes/Tensores (`MatrixInput` / `TensorViewer`).
   - Especificar regra global em `design-system.css` aplicando `touch-action: none;` diretamente no seletor `.canvas-area canvas` e `#three-container canvas`.
   - Especificar expansão para `RealtimePlot` suportar plotagem de múltiplos canais (duplo eixo ou curvas sobrepostas) para eliminar de vez a dependência do `Chart.js`.
3. **Subsídios para o Explorer 4 (Roadmap de Migração)**:
   - Lote 1: Correção rápida de `touch-action: none;` nas simulações DS 2.0 existentes.
   - Lote 2: Migração das simulações 2D simples (`quedalivre`, `fonons`).
   - Lote 3: Migração de simulações com gráficos e áudio (`audio`, `gravidade`).
   - Lote 4: Migração das simulações matemáticas complexas (`matrizes`, `tensor_de_inercia`) com novos componentes de tensor e reinclusão no `index.html`.
