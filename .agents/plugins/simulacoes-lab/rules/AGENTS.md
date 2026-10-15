# Regras de Engenharia para Simulações Científicas

Este conjunto de regras define os padrões de arquitetura, interface e performance para todas as simulações científicas e matemáticas do projeto.

---

## 1. Arquitetura de Arquivos e Dependências
* **Localização**: Arquivos HTML residem em `simulacoes/`, scripts JS em `simulacoes/scripts/` e folhas de estilo complementares em `simulacoes/css/`.
* **CSS Base**: Toda página DEVE incluir `<link rel="stylesheet" href="css/design-system.css">`.
* **JavaScript Modular**: Toda simulação DEVE ser estruturada em ES Modules (`<script type="module" src="scripts/...js">`) e importar controladores de UI a partir de `./sim-ui.js`.
* **Biblioteca 3D**: Three.js deve ser importado via importmap padronizado (`three` e `three/addons/`).
* **Fórmulas Matemáticas**: Renderização via KaTeX CDN com renderizador automático (`renderMathInElement(document.body)`).

---

## 2. Padrões Visuais & Tokens de Design
* **Cores e Superfícies**: É proibido codificar cores hexadecimais soltas para elementos de interface. Utilize estritamente os tokens de `--bg-main`, `--bg-surface`, `--bg-card`, `--accent-color`, etc.
* **Ícones Vetoriais**: Use apenas os ícones SVG nativos de `../assets/icons/` através de `<img src="../assets/icons/<nome>.svg" class="icon-svg">`. Os ícones adaptam-se automaticamente à cor do texto via `currentColor`.
* **Nomenclatura Semântica**: Classes CSS e IDs de componentes devem refletir sua função no design system (ex.: `.sim-dual-slider`, `.sim-transport-bar`, `.sim-plot-card`), nunca o domínio exclusivo de uma física em particular (ex.: evite `.temperatura-slider`).

---

## 3. Controles & Componentes Obrigatórios (`sim-ui.js`)
* **Sliders Numéricos**: Parâmetros físicos devem utilizar a estrutura `.sim-dual-slider` sincronizada via `syncDualSlider(sliderSelector, numberInputSelector, onChange)`.
* **Evolução Temporal**: Simulações que evoluem no tempo devem implementar a barra `.sim-transport-bar` e o botão toggle com `initToggleButton()`.
* **Mini-Gráficos 2D**: Plotagens em tempo real de grandezas (energia, velocidade, etc.) devem utilizar a classe `RealtimePlot`.
* **Barra Flutuante de Modo Foco**: Controles que sobem para o menu flutuante em tela cheia/foco DEVEM utilizar a convenção declarativa `data-focus-control` (`action`, `toggle`, `select`, `slider`, `badge`) e ser inicializados via `initFocusMirrorToolbar()`. É proibido duplicar marcação HTML ou adicionar listeners manuais para replicar botões no canvas.
* **Teoria & Deduções**: Conteúdo pedagógico e deduções formais devem ser apresentados na aba "Teoria" ou em modal imersivo via `initModal()`.

---

## 4. Responsividade e Telas Táteis
* **Desktop**: Suporte a Modo Foco com recolhimento lateral via `initSidebarCollapse()` e atalho de teclado `F`.
* **Mobile / Tablet (<= 900px)**: Suporte obrigatório a Bottom Sheet com alça `.sheet-drag-handle` e `initBottomSheet()`.
* **Canvas 3D**: O container do canvas DEVE possuir a propriedade CSS `touch-action: none;` para prevenir que o gesto de pinça ou órbita 3D capture a rolagem nativa do navegador.

---

## 5. Fluxo de Trabalho & Procedimentos
Para criar uma nova simulação do zero ou migrar uma página legada para o padrão Design System 2.0, consulte e execute a skill `desenvolver-simulacao`.
