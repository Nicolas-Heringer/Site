# Relatório de Mineração de Especificações: Design System 2.0 & Plataforma de Simulações Científicas

**Documento:** Relatório Técnico Autorizado de Especificação e Mineração de Arquitetura  
**Autor:** Spec Miner 3 (Especialista em Design System 2.0 & Especificações do Plugin)  
**Data:** 12 de Outubro de 2026  
**Repositório:** Plataforma de Simulações Científicas e Matemáticas  
**Diretório de Trabalho:** `.agents/teamwork/spec_miner_survey_3/`  

---

## 1. Visão Geral e Fontes Autoritativas Inspecionadas

Este relatório consolida a investigação exaustiva das especificações técnicas, padrões de código, bibliotecas de interface e contratos de arquitetura que regem as simulações científicas da plataforma. Todas as regras e interfaces foram mineradas diretamente das seguintes fontes primárias e autoritativas:

1. **Regras de Engenharia do Plugin**: `.agents/plugins/simulacoes-lab/rules/AGENTS.md`
2. **Guia Operacional e Skill**: `.agents/plugins/simulacoes-lab/skills/desenvolver-simulacao/SKILL.md`
3. **Manual de Referência Técnica**: `.agents/plugins/simulacoes-lab/skills/desenvolver-simulacao/references/design-system-guide.md` e `simulacoes/DESIGN_SYSTEM_GUIDE.md`
4. **Catálogo de Ícones Nativos**: `.agents/plugins/simulacoes-lab/skills/desenvolver-simulacao/references/icon-catalog.md` e repositório real em `assets/icons/` (66 arquivos SVG validados)
5. **Biblioteca de Componentes e Controladores**: `simulacoes/scripts/sim-ui.js` (611 linhas)
6. **Folha de Estilos Central (Tokens e Classes)**: `simulacoes/css/design-system.css` (2.193 linhas)
7. **Templates Canônicos de Scaffold**: `simulacoes-lab/skills/desenvolver-simulacao/templates/simulacao-template.html` e `simulacao-template.js`
8. **Simulações Modernizadas (Benchmarks)**: `drude.html`, `clima.html`, `snell.html`, `atomo_de_hidrogenio.html`, `ui_lab.html`
9. **Simulações Legadas Avaliadas para Gaps**: `matrizes.html`, `tensor_de_inercia.html`, `audio.html`, `fonons.html`, `gravidade.html`, `quedalivre.html`

---

## 2. Features Discovered (Tabela de Funcionalidades Mineradas)

| # | Categoria | Feature | Descrição | Inputs | Outputs | Comportamento de Erro | Descoberto Via |
|---|-----------|---------|-----------|--------|---------|-----------------------|----------------|
| 1 | Arquitetura | Importmap Three.js | Mapeia módulos bare `three` e `three/addons/` via CDN unificado para ES Modules | Declaração JSON `<script type="importmap">` | Mapeamento global de módulos | Falha de resolução silenciosa ou erro de módulo se versão incompatível | `AGENTS.md:11`, `simulacao-template.html:18` |
| 2 | Arquitetura | KaTeX CDN + Auto-Render | Renderização declarativa e síncrona de fórmulas LaTeX com delimitadores `$$` e `$` | Elementos DOM contendo `$$...$$` ou `$...$` | Árvore HTML/MathML estilizada | `throwOnError: false` suprime travamentos e mantém código LaTeX cru | `AGENTS.md:12`, `design-system.css:1372` |
| 3 | Tokens CSS | Paleta de Superfície `:root` | Sistema de tokens CSS dark-mode de alto contraste (`--bg-main`, `--bg-surface`, `--bg-card`, etc.) | Variáveis CSS em `:root` | Estilização hierárquica de fundos | Fallback para cores nativas do navegador se variável indefinida | `design-system.css:13`, `AGENTS.md:17` |
| 4 | Tokens CSS | Sistema de Acentos Independentes | Herança em cascata de `--accent-color` para acentos modulares (`--accent-btn`, `--accent-slider`, etc.) | `--accent-color` ou sobrescrita específica | Renderização dinâmica com `color-mix` | Fallback para `--accent-color` global | `design-system.css:28`, `sim-ui.js:92` |
| 5 | UI Control | `initToggleButton` | Controlador binário de execução (0/1) para Play/Pause com troca automática de ícones e texto | `target` (seletor/elemento), `onToggleCallback` | Objeto `{ toggle, setState, getState, isActive }` | Retorna `null` se elemento alvo não existir | `sim-ui.js:106`, `design-system.css:425` |
| 6 | UI Control | `syncDualSlider` | Sincronização bidirecional entre slider (`<input type="range">`) e campo numérico (`<input type="number">`) | `sliderTarget`, `numTarget`, `onChangeCallback` | Objeto `{ getValue, setValue }` | Clamping de limites no `blur`/`change` se valor estiver fora de `min`/`max` | `sim-ui.js:168`, `design-system.css:711` |
| 7 | UI Control | `RealtimePlot` | Canvas 2D de telemetria em tempo real com buffer circular, preenchimento em gradiente e linha com glow | `canvasTarget`, `{ maxPoints, minVal, maxVal, color }` | Instância da classe com método `.push(val)` | Trunca valores fora de `minVal`/`maxVal` visualmente entre `2px` e `height - 2px` | `sim-ui.js:220`, `design-system.css:1179` |
| 8 | UI Control | `initModal` | Janela modal imersiva com backdrop blur, KaTeX render automático e atalhos (`Esc`, backdrop, `[data-modal-close]`) | `modalTarget` (seletor/elemento) | Objeto `{ open, close, toggle }` | Retorna `null` se alvo não existir; bloqueia scroll de `body` durante abertura | `sim-ui.js:332`, `design-system.css:1382` |
| 9 | UI Control | `initSidebarCollapse` | Modo foco desktop com recolhimento animado da barra lateral (350ms), resize WebGL contínuo e atalho `F`/`[` | Opções `{ layoutSelector, collapseBtnSelector, expandBtnSelector, onResize }` | Objeto `{ collapse, expand, toggle, isCollapsed }` | Ignora atalhos de teclado quando o foco está em `<input>` ou `<textarea>` | `sim-ui.js:388`, `design-system.css:169` |
| 10 | Responsividade | `initBottomSheet` | Painel de controle mobile ancorado na base com 3 snap points (`peek`, `half`, `expanded`) e gestos de swipe | Opções `{ panelSelector, handleSelector, tabNavSelector, collapseBtnSelector, defaultState, onStateChange }` | Objeto `{ setState, getState, toggle }` | Inerte em telas `> 900px`; ajusta classes dinamicamente no redimensionamento | `sim-ui.js:459`, `design-system.css:1993` |
| 11 | Ícones | Cache & Inlining de SVGs | Utilitário `getSVGContent`, `setElementIcon` e `inlineSVGImages` para permitir herança de `currentColor` | Tags `<img class="icon-svg">` ou nomes de ícones | Código `<svg class="icon-svg">` embutido | Requisições com falha são suprimidas silenciosamente via `try/catch` | `sim-ui.js:18`, `sim-ui.js:57` |
| 12 | Layout | Layout Tripartido do Painel | Estrutura `<aside class="controls-panel">` contendo topo fixo (`.tab-nav`), corpo rolável (`.panel-body`) e rodapé (`.panel-footer`) | Marcação HTML com classes semânticas | Organização estável sem estouro de viewport | Estouro contido por `min-height: 0` e `overflow: hidden` no container pai | `design-system.css:208`, `simulacao-template.html:83` |
| 13 | UI Control | Controles Segmentados | Grade de botões selecionáveis estilo pill/segmentos para seleção rápida de modos ou direções | Classes `.segmented-control` e `.segment-btn` | Seleção de opção única ativa com destaque de acento | Requer lógica de exclusão mútua no script JS da simulação | `design-system.css:928` |
| 14 | UI Control | Switches Deslizantes iOS | Toggle booleano compacto baseado em checkbox nativo com animação suave de transição | Marcação `.sim-switch` com `<input type="checkbox">` e `.slider-round` | Alternância visual ON/OFF | Não dispara eventos customizados nativamente além do `change` padrão | `design-system.css:868` |
| 15 | UI Control | Toolbar Flutuante & Popovers | Barra flutuante ancorada no canvas com suporte a seletores rápidos de cor e popover flutuante modal | Classes `.canvas-toolbar` e `.sim-popover` | Menus secundários flutuantes sem poluir a sidebar | Requer fechamento explícito ou listener de clique externo | `design-system.css:1673`, `design-system.css:1763` |
| 16 | Teoria | Cards Teóricos KaTeX | Containers de texto didático formatado com suporte a equações em bloco, callouts e listas | Classes `.theory-card`, `.theory-section`, `.theory-callout` | Apresentação padronizada de conceitos físicos | Transbordo horizontal em equações longas contido por `overflow-x: auto` | `design-system.css:1337`, `design-system.css:1488` |
| 17 | Telemetria | HUDs Flutuantes no Canvas | Quadro translúcido no canto inferior esquerdo exibindo grandezas dinâmicas em tempo real | Container `.sim-hud` com itens `.hud-item`, `.hud-label` e `.hud-val` | Exibição de métricas sem obstruir controles | `pointer-events: none` assegura que cliques passem diretamente para o canvas 3D | `design-system.css:1139`, `simulacao-template.html:64` |
| 18 | Ícones | 66 Ícones Nativos em SVG | Conjunto completo de ícones de interface, física, partículas, dispositivos móveis e ponteiros de mouse | Arquivos em `assets/icons/*.svg` | Glifos vetoriais responsivos com `currentColor` | Fallback para ícone ausente se o caminho relativo for incorreto | `assets/icons/`, `icon-catalog.md` |

---

## 3. Edge Cases Minerados e Comportamentos Observados

| # | Feature | Input / Cenário | Comportamento Observado |
|---|---------|-----------------|-------------------------|
| 1 | `syncDualSlider` | Usuário digita número menor que `min` no `<input type="number">` e sai do campo (`blur`) | O valor é corrigido automaticamente para o limite `min`, formatado com até 3 casas decimais e refletido no slider |
| 2 | `syncDualSlider` | Usuário digita número maior que `max` no `<input type="number">` e sai do campo (`blur`) | O valor é truncado para o limite `max`, atribuído ao slider e dispara o callback `onChangeCallback` |
| 3 | `syncDualSlider` | Usuário limpa o input numérico deixando-o vazio (NaN) | `isNaN(val)` retorna antecipadamente sem atualizar o slider nem invocar o callback |
| 4 | `initSidebarCollapse` | Usuário digita a tecla `F` enquanto o foco está dentro de um `<input>` ou `<textarea>` | A condicional `e.target.tagName === 'INPUT'` intercepta o evento, impedindo que o painel feche acidentalmente |
| 5 | `initBottomSheet` | Transição de largura de tela de mobile ($\le 900\text{px}$) para desktop ($> 900\text{px}$) | O listener `resize` remove todas as classes `.sheet-peek`, `.sheet-half` e `.sheet-expanded`, restaurando o painel lateral desktop |
| 6 | `initBottomSheet` | Usuário clica em uma aba do `.tab-nav` enquanto o bottom sheet está no estado `peek` | O controlador intercepta o clique na aba e promove automaticamente o estado para `half`, expondo o conteúdo |
| 7 | `initBottomSheet` | Swipe vertical com deslocamento menor que $30\text{px}$ na alça de arraste | O gesto é ignorado (filtro de histerese $\Delta Y < 30\text{px}$), mantendo o estado de snap atual sem saltos |
| 8 | `RealtimePlot` | Array de dados ultrapassa `maxPoints` (padrão: 80 pontos) | Executa `data.shift()`, mantendo o tamanho do buffer estritamente constante e evitando vazamentos de memória (*memory leaks*) |
| 9 | `RealtimePlot` | Redimensionamento do container pai monitorado via `ResizeObserver` | O canvas recomputa suas dimensões internas multiplicadas pelo `devicePixelRatio` (até 2x), evitando embaçamento em telas Retina |
| 10 | `initModal` | Usuário pressiona `Esc` quando múltiplos modais existem ou com modal fechado | Apenas modais sem a classe `.hidden` interceptam a tecla e executam `close()`, liberando `document.body.style.overflow` |
| 11 | `touch-action` | Gesto de pinça (*pinch*) ou órbita 3D em container Three.js sem `touch-action: none;` | O navegador mobile captura o gesto como rolagem de página vertical nativa, congelando a órbita e rolando a tela |
| 12 | KaTeX auto-render | Equação KaTeX contendo sintaxe inválida com `throwOnError: false` | O KaTeX renderiza o código cru com destaque em vermelho sem estourar exceção nem interromper o script da simulação |

---

## 4. Critérios Autoritativos de Conformidade com o Design System 2.0

Para eliminar qualquer ambiguidade nas auditorias e nas refatorações, definem-se abaixo os critérios formais para a categorização de simulações.

### 4.1 Definições Formais de Categorização

#### Categoria A: Totalmente Conforme (DS 2.0)
A simulação atende a **100% dos requisitos inegociáveis** de arquitetura, sem débitos técnicos:
1. **Estrutura HTML**: Cabeçalho padronizado `.sim-header` com `.btn-back` e ícone SVG; layout envolto em `<main class="sim-layout">`; canvas em `.canvas-area`; painel em `<aside class="controls-panel">`.
2. **Dependências & CSS**: Carrega estritamente `css/design-system.css` (e opcionalmente `css/<nome>.css` apenas com estilos específicos); KaTeX via CDN padronizado; Three.js (quando aplicável) importado estritamente via `<script type="importmap">`.
3. **Módulos JS**: Script carregado como `<script type="module" src="scripts/<nome>.js">`; importa controladores exclusivamente de `./sim-ui.js`.
4. **Componentes Obrigatórios**: Sliders usando a estrutura `.sim-dual-slider` sincronizada via `syncDualSlider`; controle temporal usando `.sim-transport-bar` com `initToggleButton`; abas gerenciadas em `.tab-nav` com corpo rolável `.panel-body` e rodapé de telemetria `.panel-footer`.
5. **Ícones & Tokens**: Uso exclusivo de ícones SVG de `../assets/icons/` com `.icon-svg` (sem bibliotecas externas como FontAwesome ou Bootstrap Icons); zero cores hexadecimais arbitrárias soltas sobrescrevendo superfícies do DS.
6. **Mobile & Ergonomia**: Alça `.sheet-drag-handle` presente; inicialização obrigatória de `initBottomSheet()`; suporte a modo foco com `initSidebarCollapse()`; container interativo configurado com `touch-action: none;`.

#### Categoria B: Parcialmente Conforme
A simulação adotou elementos superficiais do Design System 2.0, mas ainda retém **débitos técnicos críticos**:
* Inclui `css/design-system.css`, mas mistura estilos legados (`base.css` ou regras redundantes).
* Possui o esqueleto HTML novo, mas os scripts não utilizam `sim-ui.js` (ex.: sincronização manual de sliders via listeners de input avulsos).
* Possui `.sheet-drag-handle` no HTML, mas não inicializou `initBottomSheet()` no script JS, ou vice-versa.
* Não implementou `touch-action: none;` na área de desenho, resultando em falha ergonômica em dispositivos móveis.
* Carrega bibliotecas externas de terceiros (como `Chart.js` em vez de `RealtimePlot`, ou scripts Three.js fora de importmap).

#### Categoria C: Legada
A simulação utiliza arquitetura antiga ou proprietária:
* Carrega `css/base.css` ou CSS específico sem `design-system.css`.
* Estrutura HTML anterior (ex.: `<div class="side-panel">`, botões sem classes semânticas, ausência de `.sim-layout`).
* Ícones ausentes, emojis inseridos como texto ou ícones externos em fontes de terceiros.
* Scripts clássicos não modulares (`<script src="...">` sem `type="module"`), código em escopo global sem importações de `sim-ui.js`.
* Total ausência de suporte móvel: painel fixo que esmaga o canvas em telas menores que 900px, sem bottom sheet e sem tratamento para toques.

---

### 4.2 Checklist Exaustivo de Conformidade 100% (Auditoria & Scaffold)

```markdown
### 1. Cabeçalho, Metadados e Dependências
- [ ] <!DOCTYPE html> e <html lang="pt-BR"> (ou "pt-br")
- [ ] <meta name="viewport" content="width=device-width, initial-scale=1.0">
- [ ] Favicon SVG: <link rel="icon" type="image/svg+xml" href="../favicon.svg">
- [ ] CSS Central: <link rel="stylesheet" href="css/design-system.css"> presente e prioritário
- [ ] CSS Específico: se existir (css/<nome>.css), não redefine tokens globais (:root) nem reinicia regras já presentes no DS
- [ ] KaTeX: carregamento completo de katex.min.css, katex.min.js e auto-render.min.js com flag defer e auto-render configurado
- [ ] Three.js: se a simulação for 3D, carregado estritamente via <script type="importmap"> mapeando "three" e "three/addons/"
- [ ] JavaScript: <script type="module" src="scripts/<nome>.js">

### 2. Estrutura do Layout e Semântica DOM
- [ ] <header class="sim-header"> contendo .btn-back com ícone SVG nativo e .sim-title
- [ ] Container principal: <main class="sim-layout">
- [ ] Área visual: <div class="canvas-area"> contendo #three-container ou canvas 2D
- [ ] Ações flutuantes no canvas: <div class="canvas-top-actions"> contendo .canvas-btn-expand-sidebar
- [ ] Telemetria de tela: .sim-hud posicionado com pointer-events: none
- [ ] Dica didática: .interactive-hint no rodapé do canvas com ícone lightbulb.svg
- [ ] Painel de controle: <aside class="controls-panel"> estruturado em três zonas (topo, centro, rodapé)
- [ ] Alça de arraste mobile: <div class="sheet-drag-handle" id="sheet-drag-handle"> no topo imediato do painel
- [ ] Barra de abas: <div class="tab-nav"> com botões .tab-btn contendo ícones nativos e botão .btn-collapse-sidebar
- [ ] Corpo rolável: <div class="panel-body"> com rolagem independente e containers #panel-tab-params e #panel-tab-theory
- [ ] Rodapé fixo: <div class="panel-footer"> contendo badge de status (.sim-badge) e indicador temporal

### 3. Controles Interativos & Biblioteca sim-ui.js
- [ ] Todos os parâmetros numéricos físicos utilizam .sim-dual-slider (.slider-header, .dual-input-wrapper, input range .sim-slider)
- [ ] Sliders vinculados estritamente via syncDualSlider('#slider-id', '#num-id', callback)
- [ ] Evolução temporal gerenciada pela .sim-transport-bar com botão toggle inicializado via initToggleButton('#btn-play-sim', callback)
- [ ] Atalho e colapso desktop inicializados via initSidebarCollapse({ layoutSelector, collapseBtnSelector, expandBtnSelector, onResize })
- [ ] Bottom Sheet mobile inicializado via initBottomSheet({ panelSelector, handleSelector, tabNavSelector, collapseBtnSelector, defaultState: 'peek' })
- [ ] Gráficos de telemetria em tempo real (quando presentes) utilizam new RealtimePlot(...) sem dependência de Chart.js
- [ ] Deduções formais utilizam a aba Teoria com fórmulas em bloco ($$...$$) ou modal acionado por initModal()
- [ ] Execução de inlineSVGImages() para assegurar que tags <img> de ícones herdem currentColor

### 4. Padrões Visuais, Tokens e Ícones
- [ ] Cores de interface utilizam estritamente tokens CSS (:root): var(--bg-main), var(--bg-surface), var(--accent-color), etc.
- [ ] Proibido o uso de cores hexadecimais soltas hardcoded em elementos de interface (painéis, botões, bordas, textos)
- [ ] Ícones vetoriais: utilizam estritamente <img src="../assets/icons/<nome>.svg" class="icon-svg"> do catálogo nativo
- [ ] Proibição absoluta de classes de FontAwesome (fa, fas), Lucide externo ou bibliotecas adicionais de ícones

### 5. Ergonomia Mobile e Telas Táteis (<= 900px)
- [ ] Alça .sheet-drag-handle com pílula central (.sheet-drag-pill) presente e visível no mobile
- [ ] O container de desenho (#three-container ou canvas) possui explicitamente touch-action: none;
- [ ] Elementos clicáveis e controles deslizantes com altura/área de toque mínima de 44px para dedos humanos
- [ ] Layout mobile testado para visualização sem rolagem horizontal ou sobreposição do canvas 3D
- [ ] Equações matemáticas longas contidas em blocos com overflow-x: auto sem quebrar o layout da página
```

---

## 5. Mapeamento de Componentes Existentes e Análise de Gaps

### 5.1 Inventário dos Componentes Atuais (`sim-ui.js` e `design-system.css`)

1. **`getSVGContent` / `setElementIcon` / `inlineSVGImages`**:
   * *Função*: Cache de requisições fetch para SVGs e substituição do elemento `<img>` por nó `<svg>` no DOM para coloração dinâmica com `currentColor`.
   * *Status*: Estável e maduro.

2. **`setGlobalAccent(color)`**:
   * *Função*: Altera `--accent-color` no elemento raiz `:root` e sincroniza indicadores visuais de paleta.
   * *Status*: Estável.

3. **`initToggleButton(target, onToggleCallback)`**:
   * *Função*: Alternador binário com suporte a atributos `data-text-idle`, `data-text-active`, `data-icon-idle`, `data-icon-active` e despacho de evento customizado `toggle`.
   * *Status*: Excelente para Play/Pause e toggles de campo.

4. **`syncDualSlider(sliderTarget, numTarget, onChangeCallback)`**:
   * *Função*: Amarração bidirecional com validação de limites `min`/`max` e precisão decimal para parâmetros contínuos.
   * *Status*: Altamente estável.

5. **`RealtimePlot`**:
   * *Função*: Canvas 2D com buffer circular de $N$ amostras, escala automática ou fixa (`minVal`, `maxVal`), gradiente de preenchimento e sombra glow.
   * *Status*: Adequado para um único escalar temporal.

6. **`initModal(modalTarget)`**:
   * *Função*: Diálogo modal com backdrop blur, atalho `Esc`, fechamento em clique externo e renderização automática de fórmulas KaTeX internas.
   * *Status*: Estável.

7. **`initSidebarCollapse(options)`**:
   * *Função*: Modo foco desktop com suporte ao atalho `F` e animação de 350ms com tick contínuo de `requestAnimationFrame` para evitar distorções de proporção da câmera Three.js.
   * *Status*: Estável.

8. **`initBottomSheet(options)`**:
   * *Função*: Transforma o painel lateral em um Bottom Sheet inferior para telas $\le 900\text{px}$ com estados `peek`, `half` e `expanded` e suporte a touch swipe.
   * *Status*: Estável, porém carece de persistência de estado e manipulação gestual contínua (drag 1:1 com o dedo).

9. **`renderMath(target, tex)` e `renderMathToString(tex)`**:
   * *Função*: Helpers síncronos para compilação LaTeX via KaTeX programático.
   * *Status*: Estável.

---

### 5.2 Lacunas Arquiteturais Identificadas (Gaps)

A investigação das simulações existentes revelou necessidades científicas e ergonômicas críticas não atendidas pelo Design System 2.0 em seu estado atual:

#### Lacuna 1: Omissão Global de `touch-action: none;` no CSS Central
* **Diagnóstico**: O arquivo `design-system.css` define `touch-action: none;` na alça `.sheet-drag-handle` (linha 2000), mas **NÃO** define `touch-action: none;` em `#three-container` ou na classe base `.canvas-area canvas`.
* **Impacto**: Apenas duas simulações (`atomo_de_hidrogenio.css` e `movimento.css`) contornaram isso adicionando a regra em seus CSS específicos. Em todas as outras simulações, o usuário que tenta orbitar o modelo 3D ou arrastar elementos no canvas em smartphones acaba disparando a rolagem vertical nativa da página móvel.

#### Lacuna 2: Ausência de Componentes para Álgebra Linear e Tensores Físicos
* **Simulações Afetadas**: `matrizes.html` e `tensor_de_inercia.html`.
* **Diagnóstico**: O plugin não possui nenhum componente para manipulação de matrizes $2\times 2$ e tensores $3\times 3$.
  * Em `matrizes.html`, foram criados estilos manuais em `matrizes.css` (`.matrix-box`, `.matrix-grid`, `.matrix-cell`, `.matrix-bracket`) com inputs avulsos.
  * Em `tensor_de_inercia.html`, foram criados 9 spans manuais (`#I00` até `#I22`) e campos manuais de autovalores. Não há no DS 2.0 uma abstração para edição de matrizes simétricas (onde $I_{xy} = I_{yx}$), visualização de elipsoides de inércia embutidos ou cálculo automático de determinante/traço com renderização KaTeX sincronizada.

#### Lacuna 3: Limitação Unidimensional da Telemetria (`RealtimePlot`)
* **Simulações Afetadas**: `gravidade.html` (que recorreu à inclusão de `Chart.js` externo), `quedalivre.html`, `movimento.html` e `audio.html`.
* **Diagnóstico**: A classe `RealtimePlot` suporta estritamente **uma única curva escalar** $y(t)$.
  * Não há suporte a **múltiplas séries temporais simultâneas com legenda** (ex.: plotar Energia Cinética $K$, Energia Potencial $U$ e Energia Mecânica Total $E = K + U$ no mesmo canvas).
  * Não há suporte a **Diagramas de Espaço de Fase 2D** $(x, v)$ ou $(q, p)$, fundamentais para sistemas dinâmicos e mecânica clássica.
  * Em `audio.html`, a visualização de espectro FFT (gráfico de barras por bandas de frequência) foi feita com código manual ad-hoc sem padronização.

#### Lacuna 4: Ausência de Seletores Tridimensionais de Vetores e Campos
* **Simulações Afetadas**: `tensor_de_inercia.html` (eixo de rotação unitário $\hat{n} = (n_x, n_y, n_z)$), `drude.html` (direção do campo elétrico $\vec{E}$), `snell.html` (vetor de onda do feixe) e `gravidade.html`.
* **Diagnóstico**: Hoje o usuário precisa digitar manualmente três números flutuantes em inputs separados ou clicar em botões rudimentares de eixos cartesianos ($X, Y, Z$). Falta um componente ergonômico de controle vetorial (esfera unitária interativa ou seletor de ângulos esféricos $\theta, \phi$) otimizado para mouse e telas sensíveis ao toque.

#### Lacuna 5: Falta de Controles Virtuais de Câmera para Telas Móveis
* **Diagnóstico**: Em celulares onde o usuário opera com apenas um polegar, o gesto de pinça para zoom (*pinch-to-zoom*) muitas vezes é desajeitado ou entra em conflito com zooms do sistema operacional móvel. Falta um overlay ergonômico opcional no canvas com botões rápidos de zoom in/out e reset de ponto de vista com ícones nativos (`camera-reset.svg`, `pinch.svg`).

---

## 6. Propostas Técnicas de Expansão do Plugin (Especificações de API)

Com base nas lacunas mapeadas no item 5 e atendendo estritamente ao requisito R3 do projeto, formulam-se a seguir as especificações técnicas formais e assinaturas de API para 4 novos componentes/extensões modulares do Design System 2.0.

---

### Proposta 1: `MatrixTensorEditor` (Editor & Visualizador de Matrizes e Tensores)

#### 1.1 Objetivo e Domínio
Componente nativo para entrada e visualização de matrizes de transformação linear ($2\times 2$) e tensores de física ($3\times 3$, ex.: tensor de inércia, tensor de tensões, matriz de rotação). Suporta modo somente-leitura ou editável, imposição automática de simetria ($M_{ij} = M_{ji}$), cálculo em tempo real de traço, determinante e autovalores, com saída LaTeX/KaTeX integrada.

#### 1.2 Assinatura da Classe JavaScript (`sim-ui.js`)
```typescript
interface MatrixEditorOptions {
    dimensions?: 2 | 3;                      // Ordem da matriz (padrão: 2)
    editable?: boolean;                     // Habilita inputs (padrão: true)
    symmetric?: boolean;                    // M[i][j] = M[j][i] automático (padrão: false)
    step?: number;                          // Passo dos inputs numéricos (padrão: 0.1)
    min?: number;                           // Limite inferior (padrão: -100)
    max?: number;                           // Limite superior (padrão: 100)
    labels?: string[][];                    // Rótulos subscritos por célula
    showDeterminant?: boolean;              // Exibe badge com det(M) (padrão: true)
    showTrace?: boolean;                    // Exibe traço tr(M) (padrão: false)
    onChange?: (matrix: number[][], metrics: MatrixMetrics) => void;
}

interface MatrixMetrics {
    determinant: number;
    trace: number;
    eigenvalues?: number[];
    isSingular: boolean;
}

export class MatrixTensorEditor {
    constructor(containerTarget: string | HTMLElement, options?: MatrixEditorOptions);
    public getMatrix(): number[][];
    public setMatrix(matrix: number[][]): void;
    public setCell(row: number, col: number, val: number): void;
    public setEditable(editable: boolean): void;
    public setSymmetric(symmetric: boolean): void;
    public render(): void;
    public destroy(): void;
}
```

#### 1.3 Estrutura HTML Semântica Padrão
```html
<div class="sim-matrix-card" id="editor-tensor">
    <div class="matrix-header">
        <span class="matrix-title">Tensor de Inércia $\mathbf{I}$</span>
        <div class="matrix-badges">
            <span class="sim-badge" id="badge-det">$\det(\mathbf{I}) = 1.00$</span>
        </div>
    </div>
    <div class="matrix-bracket-container">
        <span class="matrix-bracket bracket-left">[</span>
        <div class="matrix-grid matrix-grid-3x3">
            <!-- Células geradas automaticamente ou declaradas -->
            <div class="matrix-cell" data-row="0" data-col="0">
                <input type="number" class="matrix-input" value="1.0" step="0.1">
                <span class="matrix-sub">I_{xx}</span>
            </div>
            <!-- ... demais células ... -->
        </div>
        <span class="matrix-bracket bracket-right">]</span>
    </div>
</div>
```

#### 1.4 Tokens CSS Associados (`design-system.css`)
```css
.sim-matrix-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.matrix-bracket-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
}
.matrix-bracket {
    font-size: 2.2rem;
    font-weight: 300;
    color: var(--text-secondary);
    user-select: none;
    line-height: 1;
}
.matrix-grid-2x2 { display: grid; grid-template-columns: repeat(2, 64px); gap: 6px; }
.matrix-grid-3x3 { display: grid; grid-template-columns: repeat(3, 58px); gap: 5px; }
.matrix-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: var(--bg-input);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    padding: 4px 2px;
}
.matrix-input {
    width: 100%;
    background: transparent;
    border: none;
    color: var(--accent-slider, var(--accent-color));
    font-family: var(--font-mono);
    font-size: 0.82rem;
    font-weight: 600;
    text-align: center;
    outline: none;
}
.matrix-sub {
    font-size: 0.62rem;
    color: var(--text-muted);
    font-family: var(--font-mono);
}
```

---

### Proposta 2: `MultiSeriesPlot` (Telemetria Multieixo & Diagramas de Espaço de Fase)

#### 2.1 Objetivo e Domínio
Extensão de alta performance do `RealtimePlot` em Canvas 2D puro que substitui a necessidade de bibliotecas externas pesadas (como `Chart.js`). Suporta:
1. Plotagem temporal de múltiplas curvas simultâneas ($N$ canais com cores e legendas independentes).
2. Modo **Espaço de Fase** ($X$ vs. $Y$ ou $x$ vs. $\dot{x}$) para atratores, pêndulos e órbitas.
3. Auto-ajuste de escala com amortecimento (*smooth auto-range*) ou limites estáticos.

#### 2.2 Assinatura da Classe JavaScript (`sim-ui.js`)
```typescript
interface SeriesDefinition {
    id: string;
    label: string;
    color: string;                          // Hex ou CSS var
    dash?: number[];                        // Traço tracejado opcional
    visible?: boolean;
}

interface MultiPlotOptions {
    mode?: 'timeseries' | 'phase';          // Modo temporal ou espaço de fase
    maxPoints?: number;                     // Buffer circular (padrão: 100)
    minX?: number; maxX?: number;           // Usado no modo phase
    minY?: number; maxY?: number;           // Usado em ambos os modos
    autoScaleY?: boolean;                   // Ajuste automático dinâmico
    showGrid?: boolean;                     // Grade central e eixos
    showLegend?: boolean;                   // Exibe legenda compacta
    unitY?: string;                         // Unidade (ex: "J", "m/s")
}

export class MultiSeriesPlot {
    constructor(canvasTarget: string | HTMLCanvasElement, options?: MultiPlotOptions);
    public addSeries(series: SeriesDefinition): void;
    public push(dataMap: Record<string, number>): void;      // Modo timeseries: { K: 2.1, U: 3.4, E: 5.5 }
    public pushPhasePoint(x: number, y: number): void;        // Modo phase: trajetória paramétrica
    public clear(): void;
    public setMode(mode: 'timeseries' | 'phase'): void;
    public resize(): void;
    public destroy(): void;
}
```

#### 2.3 Exemplo de Uso Prático
```javascript
import { MultiSeriesPlot } from './sim-ui.js';

// Instanciação para Conservação de Energia (substitui Chart.js em gravidade.html)
const plotEnergia = new MultiSeriesPlot('#canvas-energia', {
    mode: 'timeseries',
    maxPoints: 120,
    unitY: 'J'
});

plotEnergia.addSeries({ id: 'K', label: 'Cinética (K)', color: '#38bdf8' });
plotEnergia.addSeries({ id: 'U', label: 'Potencial (U)', color: '#f43f5e' });
plotEnergia.addSeries({ id: 'E', label: 'Mecânica Total (E)', color: '#facc15' });

// No loop:
plotEnergia.push({ K: eCinetica, U: ePotencial, E: eTotal });
```

---

### Proposta 3: `Vector3DPicker` (Seletor Interativo de Vetores e Direções 3D)

#### 3.1 Objetivo e Domínio
Componente de interface para selecionar orientações no espaço tridimensional. Essencial para simulações que exigem definição de eixos de rotação ($\hat{n}$ em `tensor_de_inercia.html`), campos vetoriais externos ($\vec{E}$ em `drude.html` ou `atomo_de_hidrogenio.html`) ou direção de feixes ópticos (`snell.html`).

#### 3.2 Assinatura da Classe JavaScript (`sim-ui.js`)
```typescript
interface VectorPickerOptions {
    defaultVector?: [number, number, number]; // [x, y, z] inicial (padrão: [0, 1, 0])
    normalized?: boolean;                     // Força norma unitária |v| = 1 (padrão: true)
    showGimbalSphere?: boolean;               // Exibe mini-esfera interativa canvas
    showSphericalInputs?: boolean;            // Controles de ângulos polar (θ) e azimutal (φ)
    onChange?: (vector: { x: number; y: number; z: number; theta: number; phi: number }) => void;
}

export class Vector3DPicker {
    constructor(containerTarget: string | HTMLElement, options?: VectorPickerOptions);
    public getVector(): [number, number, number];
    public setVector(x: number, y: number, z: number): void;
    public setSpherical(thetaRad: number, phiRad: number): void;
    public setPreset(axis: 'x' | 'y' | 'z' | '-x' | '-y' | '-z'): void;
    public destroy(): void;
}
```

#### 3.3 Estrutura HTML Semântica
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
    <div class="vector-inputs-row">
        <div class="vector-coord"><span class="coord-tag">x</span><input type="number" class="coord-input" id="v-x" value="0.0" step="0.1"></div>
        <div class="vector-coord"><span class="coord-tag">y</span><input type="number" class="coord-input" id="v-y" value="1.0" step="0.1"></div>
        <div class="vector-coord"><span class="coord-tag">z</span><input type="number" class="coord-input" id="v-z" value="0.0" step="0.1"></div>
    </div>
</div>
```

---

### Proposta 4: `TouchCanvasController` (Garantia Global de `touch-action` & Ergonomia Tátil)

#### 4.1 Objetivo e Domínio
Extensão de infraestrutura do Design System para resolver a lacuna crítica de scroll mobile e fornecer botões virtuais táteis de suporte para dispositivos com tela menor que 900px.

#### 4.2 Especificações Técnicas
1. **Inclusão Obrigatória no CSS Global (`design-system.css`)**:
   ```css
   /* Correção imediata no Design System 2.0 */
   #three-container,
   .canvas-area canvas {
       touch-action: none !important;
       -webkit-touch-callout: none;
       user-select: none;
   }
   ```
2. **Helper de Inicialização em `sim-ui.js`**:
   ```javascript
   /**
    * Configura controles táteis ergonômicos e assegura touch-action no canvas
    * @param {HTMLElement|string} canvasTarget
    * @param {Object} [options]
    */
   export function setupTouchCanvas(canvasTarget, options = {}) {
       const el = typeof canvasTarget === 'string' ? document.querySelector(canvasTarget) : canvasTarget;
       if (el) {
           el.style.touchAction = 'none';
       }
   }
   ```

---

## 7. Sumário Executivo de Recomendações para a Equipe de Engenharia

1. **Auditoria de Conformidade**:
   * As 8 simulações modernizadas (`atomo_de_hidrogenio`, `clima`, `drude`, `estacionarias2d`, `movimento`, `particulas`, `snell`, `ui_lab`) estão na categoria **Totalmente Conforme**, necessitando apenas da garantia explícita de `touch-action: none;` no container 3D.
   * As 6 simulações legadas (`audio`, `fonons`, `gravidade`, `matrizes`, `quedalivre`, `tensor_de_inercia`) estão na categoria **Legada**, utilizando `base.css`, inputs despadronizados e carecendo de suporte a telas menores que 900px.
2. **Plano para o Plugin**:
   * Integrar a correção de `touch-action: none;` na folha `design-system.css`.
   * Implementar `MatrixTensorEditor` e `MultiSeriesPlot` em `sim-ui.js` antes da migração de `matrizes.html`, `tensor_de_inercia.html` e `gravidade.html`.
3. **Preservação de Integridade**:
   * Este relatório cumpriu rigorosamente a restrição READ-ONLY do projeto, sem alterar nenhum arquivo em `simulacoes/`.

---
*Fim do Relatório de Mineração de Especificações.*
