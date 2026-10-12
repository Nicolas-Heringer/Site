---
name: desenvolver-simulacao
description: >-
  Criação, refatoração, modernização e manutenção de simulações científicas e matemáticas
  no padrão Design System 2.0 (sim-ui.js, layout responsivo desktop/mobile bottom-sheet,
  Three.js, KaTeX e ícones nativos). Use sempre que o usuário pedir para criar uma nova
  simulação, migrar uma simulação legada, adicionar controles físicos ou ajustar a interface.
---

# Workflow: Desenvolvimento e Modernização de Simulações Científicas

Este guia operacional orienta a criação do zero e a refatoração de simulações interativas para a plataforma, assegurando conformidade estrita com o **Design System 2.0**.

---

## 1. Documentos e Recursos de Referência

Ao executar este fluxo, consulte os arquivos especializados:
* **Especificação Completa de Componentes**: [references/design-system-guide.md](./references/design-system-guide.md)
* **Catálogo de Ícones Nativos (42 SVGs)**: [references/icon-catalog.md](./references/icon-catalog.md)
* **Template HTML Base**: [templates/simulacao-template.html](./templates/simulacao-template.html)
* **Template JS Modular**: [templates/simulacao-template.js](./templates/simulacao-template.js)

---

## 2. Procedimento 1: Criando uma Nova Simulação do Zero

1. **Scaffold do HTML**:
   * Crie o arquivo `simulacoes/<nome>.html` copiando a estrutura de [templates/simulacao-template.html](./templates/simulacao-template.html).
   * Atualize a tag `<title>`, o cabeçalho `.sim-title` e a importação do script final (`scripts/<nome>.js`).
   * Configure os parâmetros físicos desejados dentro de `#panel-tab-params` utilizando o container `.sim-dual-slider`.
   * Configure a teoria e equações KaTeX na aba `#panel-tab-theory`.

2. **Scaffold do JavaScript**:
   * Crie `simulacoes/scripts/<nome>.js` a partir de [templates/simulacao-template.js](./templates/simulacao-template.js).
   * Importe os controladores de `./sim-ui.js`.
   * Configure a cena Three.js (ou canvas 2D correspondente).
   * Conecte cada grandeza física com `syncDualSlider('#slider-id', '#num-id', callback)`.
   * Conecte a evolução temporal à barra `.sim-transport-bar` e à função `stepPhysics(dt)`.

3. **Verificação de Estilos Complementares**:
   * O estilo principal é suprido por `css/design-system.css`.
   * Se a simulação exigir shaders ou estilos específicos do domínio, crie `css/<nome>.css` contendo apenas as regras específicas, derivando cores de `var(--accent-color)` ou variáveis CSS do `:root`.

---

## 3. Procedimento 2: Migrando uma Simulação Legada para o DS 2.0

Para atualizar uma simulação existente que ainda não segue o Design System 2.0:

1. **Substituição do Layout HTML**:
   * Migrar `<header>` para a estrutura `.sim-header` com `.btn-back` e `.sim-title`.
   * Envolver a área visual e controles em `<main class="sim-layout">`.
   * Envolver o canvas em `<div class="canvas-area">` com `#three-container` e as ações flutuantes (`.canvas-top-actions`).
   * Substituir barras laterais antigas por `<aside class="controls-panel">` contendo:
     - `.sheet-drag-handle` (essencial para mobile).
     - `.tab-nav` com abas de Parâmetros e Teoria.
     - `.panel-body` rolável.
     - `.panel-footer` com badge de status e timer.

2. **Refatoração dos Controles**:
   * Substituir inputs e sliders avulsos pela estrutura `.sim-dual-slider`.
   * Substituir botões de Play/Pausa antigos por `.sim-transport-bar` com botão toggle.
   * Substituir ícones de bibliotecas externas (FontAwesome, Lucide web) pelos SVGs nativos de `../assets/icons/` com a classe `icon-svg`.

3. **Refatoração do JavaScript**:
   * Converter o script para módulo ES (`type="module"`).
   * Importar `initSidebarCollapse` e `initBottomSheet` de `./sim-ui.js` e inicializá-los.
   * Eliminar implementações manuais de redimensionamento e sincronização de sliders, adotando `syncDualSlider` e o callback `onResize`.
   * Adicionar `touch-action: none;` no container Three.js.

---

## 4. Checklist de Qualidade Obrigatório

Antes de concluir a tarefa, verifique os seguintes pontos:
- [ ] O layout possui as duas experiências: Desktop (com modo foco `F`) e Mobile (Bottom Sheet deslizante).
- [ ] A alça `.sheet-drag-handle` está presente no topo do `.controls-panel`.
- [ ] Os sliders de parâmetros físicos estão sincronizados bidirecionalmente com os inputs numéricos.
- [ ] Todos os ícones utilizam `../assets/icons/<nome>.svg` com a classe `.icon-svg`.
- [ ] Todas as equações matemáticas estão formatadas com KaTeX (`$$...$$` ou `$...$`) e renderizadas.
- [ ] Não há cores hexadecimais arbitrárias soltas sobrescrevendo os tokens do `:root`.
- [ ] O redimensionamento de janela (resize) ajusta a câmera e o renderer Three.js sem distorção visual.
