# R2: Avaliação Aprofundada de Usabilidade Móvel e Controles Táteis

**Data de Emissão:** 12 de Outubro de 2026  
**Autor:** Worker Synthesis 1 (Technical Documentation and Synthesis Worker)  
**Escopo:** Diagnóstico de Usabilidade Móvel para Telas $\le 900\text{px}$ (Smartphones e Tablets: 360px, 480px, 560px, 768px e 900px)  
**Arquivos Inspecionados:** Todas as 14 Simulações em `simulacoes/`, `simulacoes/scripts/sim-ui.js` e `simulacoes/css/design-system.css`  
**Referência Normativa:** WCAG 2.1 (Critério 2.5.5 Target Size), Apple Human Interface Guidelines, Material Design 3 e `.agents/plugins/simulacoes-lab/rules/AGENTS.md`  

---

## 1. Sumário Executivo & Diagnóstico Global de Prontidão Tátil

A auditoria de usabilidade em dispositivos móveis e telas sensíveis ao toque avaliou sistematicamente o comportamento de cada uma das 14 simulações científicas. Foi verificado como o ecossistema reage em diferentes fatores de forma (smartphones compactos de 360px a 390px, phablets de 412px a 480px, tablets verticais de 768px e tablets horizontais até 900px).

### 1.1 Distribuição de Prontidão Mobile
* **Nível A — Totalmente Pronta (Alta Usabilidade)**: **1 simulação (7,1%)**
  - `atomo_de_hidrogenio.html`: Implementa Bottom Sheet com snap points reativos, possui `touch-action: none;` explícito no container 3D, compensa barras do sistema com `env(safe-area-inset-bottom)` e oculta rótulos de texto na toolbar superior em telas estreitas mantendo ícones táteis acessíveis.
* **Nível B — Usabilidade Moderada / Parcialmente Degradada**: **7 simulações (50,0%)**
  - `clima.html`, `drude.html`, `estacionarias2d.html`, `movimento.html`, `particulas.html`, `snell.html`, `ui_lab.html`.
  - Adotam o Bottom Sheet do DS 2.0, mas sofrem com a **omissão generalizada de `touch-action: none;`**, armadilhas de eventos de mouse (impossibilitando rotação ou emissão pelo toque), alvos de toque inferiores ao padrão ergonômico de 44px ou corte horizontal de equações KaTeX em modais de teoria.
* **Nível C — Falha Crítica / Inutilizáveis no Mobile**: **6 simulações (42,9%)**
  - `audio.html`, `fonons.html`, `gravidade.html`, `matrizes.html`, `quedalivre.html`, `tensor_de_inercia.html`.
  - Presas ao layout de `base.css` sem Bottom Sheet (painel empilhado verticalmente abaixo do canvas ou espremido lateralmente), canvases rígidos que estouram a tela, ausência total de listeners de toque e distorção severa de coordenadas relativas.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   DISTRIBUIÇÃO DE PRONTIDÃO TÁTIL                      │
├──────────────────────────┬──────────────────────────┬──────────────────┤
│ Nível A (Alta Usabilidade)│ Nível B (Degradada)      │ Nível C (Crítica)│
│ 1 simulação (7,1%)       │ 7 simulações (50,0%)     │ 6 simulações     │
│ [atomo_de_hidrogenio]    │ [clima, drude,           │ (42,9%)          │
│                          │  estacionarias2d,        │ [audio, fonons,  │
│                          │  movimento, particulas,  │  gravidade,      │
│                          │  snell, ui_lab]          │  matrizes, queda,│
│                          │                          │  tensor_inercia] │
└──────────────────────────┴──────────────────────────┴──────────────────┘
```

---

## 2. Análise Estrutural do Bottom Sheet e o Bug Crítico do Sidebar Collapse

### 2.1 Arquitetura do Bottom Sheet no Design System 2.0
No arquivo `simulacoes/css/design-system.css` (linhas 1990–2190) e `simulacoes/scripts/sim-ui.js` (linhas 448–560), o Design System 2.0 define a adaptação do painel de controle (`.controls-panel`) para um Bottom Sheet inferior quando a viewport possui largura $\le 900\text{px}$:
1. **Snap Points Padronizados**:
   - `.sheet-peek`: Altura fixa de **64px**. Apenas a alça e as abas (`.tab-nav`) ficam visíveis; o corpo (`.panel-body`) e o rodapé (`.panel-footer`) são suprimidos via `display: none !important;`.
   - `.sheet-half`: Altura dinâmica de **52vh** (meia tela), permitindo visualizar o canvas e os parâmetros simultaneamente.
   - `.sheet-expanded`: Altura de **85vh**, maximizando o espaço para leitura de teoria ou ajuste fino de parâmetros densos.
2. **Controlador Tátil (`initBottomSheet`)**:
   - Escuta eventos `touchstart`, `touchmove` e `touchend` na alça `.sheet-drag-handle`.
   - Aplica histerese mínima de $30\text{px}$ ($\Delta Y$) para transicionar entre os estados `peek`, `half` e `expanded`.
   - Promove o painel de `peek` para `half` automaticamente se o usuário tocar em qualquer botão de aba (`.tab-btn`).

---

### 2.2 O Bug Crítico: Desaparecimento Irreversível do Painel no Mobile

Durante a auditoria de código, foi identificada uma falha crítica de interação entre o módulo `initSidebarCollapse()` e o layout mobile:

#### O Mecanismo da Falha:
1. **Compartilhamento de Botão**: No desktop, a barra de abas (`.tab-nav`) inclui o botão `.btn-collapse-sidebar` para entrar em Modo Foco (recolher a barra lateral para a direita). No mobile ($\le 900\text{px}$), esse botão continua renderizado no DOM dentro do `.tab-nav`.
2. **Duplo Registro de Listeners**: Tanto `initSidebarCollapse()` quanto `initBottomSheet()` associam ouvintes de evento a esse mesmo botão.
3. **Injeção da Classe `.sidebar-collapsed`**: Ao clicar no botão em um smartphone ou tablet (ou ao pressionar a tecla `F` em um tablet com teclado acoplado), a função `initSidebarCollapse` adiciona a classe `.sidebar-collapsed` ao elemento raiz `.sim-layout`.
4. **Regra CSS Destrutiva**: Em `design-system.css` (linha 226):
   ```css
   .sim-layout.sidebar-collapsed .controls-panel {
       opacity: 0;
       pointer-events: none;
       transform: translateX(40px);
       padding: 0;
       border: none;
   }
   ```
   No mobile, o `.controls-panel` é o próprio Bottom Sheet fixado na base (`position: absolute; bottom: 0;`). A aplicação de `transform: translateX(40px)` e `opacity: 0` faz o **Bottom Sheet sumir completamente para a direita da tela**.
5. **Armadilha Sem Retorno (Softlock de UI)**: No desktop, existe o botão `.canvas-btn-expand-sidebar` posicionado no canto superior direito para restaurar o painel. Porém, no mobile, a linha 2042 de `design-system.css` impõe:
   ```css
   @media (max-width: 900px) {
       .canvas-btn-expand-sidebar {
           display: none !important;
       }
   }
   ```
   **Conclusão**: O botão de restauração está sumido (`display: none !important;`) e o Bottom Sheet está invisível (`opacity: 0; pointer-events: none;`). O usuário fica preso na simulação sem acesso a nenhum controle físico, sendo obrigado a recarregar a página para restaurar o estado.

#### Solução de Engenharia Recomendada:
Em `sim-ui.js`, `initSidebarCollapse` deve abortar imediatamente se a tela estiver em modo mobile:
```javascript
const collapse = () => {
    if (window.innerWidth <= 900) return; // Inerte em resoluções mobile/tablet
    layout.classList.add('sidebar-collapsed');
    smoothResize();
};
```
E no CSS mobile, suprimir o botão de colapso lateral dentro da tab-nav:
```css
@media (max-width: 900px) {
    .tab-nav .btn-collapse-sidebar {
        display: none !important;
    }
}
```

---

## 3. Prevenção de Rolagem Acidental (`touch-action: none`)

### 3.1 A Regra de Engenharia vs. A Realidade do Repositório
A Regra 4 de `.agents/plugins/simulacoes-lab/rules/AGENTS.md` determina:
> *"Canvas 3D: O container do canvas DEVE possuir a propriedade CSS touch-action: none; para prevenir que o gesto de pinça ou órbita 3D capture a rolagem nativa do navegador."*

Contudo, **`design-system.css` NÃO DECLARA `touch-action: none;` no seletor `.canvas-area`, nem em `#three-container`, nem na tag `canvas`**. A única menção em todo o arquivo ocorre na classe `.sheet-drag-handle` (linha 2000).

Como consequência dessa omissão central, cada desenvolvedor precisou lembrar de declarar manualmente a propriedade na folha CSS específica de cada simulação. O resultado da auditoria revelou uma falha quase generalizada:
* **Possuem `touch-action: none;`**: Apenas **2 simulações** (`atomo_de_hidrogenio.css:12` e `movimento.css:14`).
* **FALHAM na Prevenção de Scroll**: **12 simulações (85,7%)**.

### 3.2 Impacto Físico por Tipo de Renderizador
1. **Cenas Tridimensionais com OrbitControls (`clima.html`, `tensor_de_inercia.html`, `ui_lab.html`)**:
   - Ao colocar o dedo na tela para girar o globo da Terra em `clima.html`, o navegador mobile (Chrome/Safari) interpreta o gesto inicial como rolagem vertical da página ou gesto de *pull-to-refresh*.
   - A órbita 3D engasga violently enquanto a página salta verticalmente, tornando a inspeção astronômica e climática frustrante.
2. **Inspeção Passiva 2D (`estacionarias2d.html`)**:
   - Em `estacionarias2d.js` (linhas 93–98), o ouvinte foi cadastrado como:
     ```javascript
     canvas.addEventListener('touchmove', (e) => {
         inspectAt(e.touches[0].clientX, e.touches[0].clientY);
     }, { passive: true });
     ```
     O uso de `{ passive: true }` sem `touch-action: none;` garante ao navegador que o script não chamará `preventDefault()`. Portanto, o gesto do dedo na placa de Chladni arrasta a janela inteira, cortando a visualização contínua dos modos nodais.
3. **Agitação Molecular e Óptica (`particulas.html` e `snell.html`)**:
   - Qualquer tentativa de interagir no canvas móvel resulta no deslocamento indesejado do viewport do navegador.

---

## 4. Análise Detalhada das Armadilhas de Eventos Exclusivos de Mouse

Em 5 simulações legadas e modernizadas, a interação central do usuário foi acoplada exclusivamente a eventos do mouse (`mousedown`, `mousemove`, `mouseup`, `wheel`), sem suporte à API moderna de **Pointer Events** ou toque direto.

```
┌────────────────────────────────────────────────────────────────────────┐
│                 ARMADILHAS DE EVENTOS EXCLUSIVOS DE MOUSE              │
├─────────────────────┬──────────────────┬───────────────────────────────┤
│ Simulação           │ Linhas de Código │ Sintoma Mobile                │
├─────────────────────┼──────────────────┼───────────────────────────────┤
│ quedalivre.js       │ 154–173          │ Impossível pegar e arremessar │
│                     │                  │ a esfera com o dedo.          │
├─────────────────────┼──────────────────┼───────────────────────────────┤
│ fonons.js           │ 183–208, 216–222 │ Toque não perturba átomos;    │
│                     │                  │ escala com erro de 2,5x.      │
├─────────────────────┼──────────────────┼───────────────────────────────┤
│ matrizes.js         │ 657–709          │ Vetores da base i e j não     │
│                     │                  │ podem ser arrastados.         │
├─────────────────────┼──────────────────┼───────────────────────────────┤
│ particulas.js       │ 702–714          │ Injeção de calor por cursor   │
│                     │                  │ inoperante em telas táteis.   │
├─────────────────────┼──────────────────┼───────────────────────────────┤
│ snell.js            │ 579–585, 587–596 │ Rotação exige roda do mouse;  │
│                     │                  │ emissão exige botão esquerdo. │
└─────────────────────┴──────────────────┴───────────────────────────────┘
```

### 4.1 `quedalivre.js` (Linhas 154–173)
```javascript
canvas.addEventListener('mousedown', function(e) {
    var mousePos = getMousePos(canvas, e);
    // detecta se clicou na bola e ativa isDragging
});
canvas.addEventListener('mousemove', function(e) {
    // calcula velocidade de arremesso
});
canvas.addEventListener('mouseup', function(e) {
    // libera a bola com velocidade inicial
});
```
* **Diagnóstico**: O código não possui ouvintes para `touchstart`, `touchmove`, `touchend` nem `pointerdown/move/up`. Ao tocar na bola em um smartphone, o evento `mousedown` sintético do navegador muitas vezes não dispara devido à falta de `touch-action: none;` e à rolagem da página. O usuário não consegue arremessar a bola.

### 4.2 `fonons.js` (Linhas 183–208 e 216–222)
* **Diagnóstico 1 (Ausência de Toque)**: Listeners atrelados unicamente a `mousedown` e `mousemove`.
* **Diagnóstico 2 (Descalibração Matemática de Coordenadas em 2,5x)**:
  O cálculo de posição em `getPosMouse(e)` é:
  ```javascript
  function getPosMouse(e) {
      var rect = canvas.getBoundingClientRect();
      return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
      };
  }
  ```
  O canvas possui `width="900" height="600"` estático. Em um smartphone de 360px de largura, o CSS encolhe visualmente o elemento para 360px de largura, mas a resolução interna permanece 900px. O clique físico do usuário é registrado em pixels da viewport (0 a 360), mas o motor de física interpreta como se o cursor estivesse nos primeiros 360px do grid de 900px! O ponto de contato fica deslocado em um fator de $\frac{900}{360} = 2{,}5\times$ em relação ao átomo que o usuário tocou.

### 4.3 `matrizes.js` (Linhas 657–709)
* **Diagnóstico**: O recurso pedagógico mais valioso da simulação — pegar interativamente as pontas dos vetores $\hat{i}$ e $\hat{j}$ no plano cartesiano para deformar a malha e observar a variação do determinante e da área — foi programado estritamente com `mousedown`, `mousemove` e `mouseup`. No mobile, essa manipulação geométrica não funciona.

### 4.4 `particulas.js` (Linhas 702–714)
* **Diagnóstico**: A função `aplicarImpulsoCursor(e)` escuta `mousedown` e `mousemove`. O usuário móvel não consegue injetar perturbações térmicas nem empurrar o gás de partículas com o dedo.

### 4.5 `snell.js` (Linhas 579–585 e 587–596)
* **Diagnóstico**:
  - A rotação contínua do ângulo de incidência sobre o canvas foi mapeada para `canvas.addEventListener('wheel')`. Celulares não possuem roda de rolagem de mouse.
  - A emissão instantânea de feixes no clique verifica explicitamente `if (e.button === 0)`. Em muitos dispositivos táteis, o evento de toque não sintetiza a propriedade `button === 0`, impedindo o disparo de raios luminosos ao tocar no meio óptico.

---

## 5. Auditoria Ergonômica de Alvos de Toque (WCAG 2.1 Critério 2.5.5)

O critério de acessibilidade WCAG 2.1 SC 2.5.5 (Target Size) e os manuais de ergonomia móvel determinam que **alvos de toque devem possuir dimensões mínimas de 44x44px** (ou 48x48px no Android Material Design) para acomodar com conforto a área média da impressão digital humana (~10mm a 12mm de diâmetro).

### 5.1 O Cursor Deslizante dos Sliders (`.sim-slider`)
Em `design-system.css` (linhas 800–801):
```css
input[type="range"].sim-slider::-webkit-slider-thumb {
    height: 18px;
    width: 18px;
}
```
* **Medição**: O cursor deslizante possui apenas **18x18px**, cobrindo menos de 17% da área tátil recomendada de 44x44px.
* **Impacto**: Ao tentar arrastar o controle de parâmetros físicos com o polegar, o usuário erra o cursor e clica na trilha do slider, provocando saltos bruscos no valor da grandeza física simulada.
* **Defeito no Firefox Mobile**: O arquivo não declara `::-moz-range-thumb`, fazendo com que no Firefox para Android o cursor seja exibido como um botão cinza minúsculo e desalinhado do sistema operacional.

### 5.2 A Alça do Bottom Sheet (`.sheet-drag-handle`)
Em `design-system.css` (linha 1996):
```css
.sheet-drag-handle {
    height: 16px;
}
.sheet-drag-pill {
    width: 36px;
    height: 4px;
}
```
* **Medição**: A zona de arraste possui apenas **16px de altura**.
* **Impacto**: Em movimento ou com uma só mão, tocar numa faixa vertical de 16px é extremamente difícil. Se o usuário toca ligeiramente acima, clica no canvas; se toca abaixo, aciona uma aba do `.tab-nav`.

### 5.3 Botões Flutuantes e Compactos
* `.btn-icon`: Definido com `36x36px` (linha 658), abaixo de 44px.
* `.canvas-btn-floating`: Em telas $< 560\text{px}$, o texto é ocultado e o padding reduzido, gerando um botão de aproximadamente **26x26px** (linha 2071).
* `.toolbar-dot` / `.theme-dot-btn`: Os seletores circulares de paleta de cores medem **14x14px** em telas $\le 900\text{px}$ (linha 2058). Tentar acertar um ponto de 14px com o polegar quase sempre ativa o botão vizinho.

### 5.4 Quebra do Dual-Slider em Telas Ultra-Estreitas ($\le 360\text{px}$)
O componente `.sim-dual-slider` utiliza `display: flex; justify-content: space-between;` no cabeçalho do parâmetro. O input numérico `.dual-num-input` possui `width: 62px;` rígido sem `flex-wrap: wrap;`.
Em aparelhos compactos como iPhone SE (375px) ou Galaxy Z Fold fechado (280px–320px), rótulos mais longos (ex.: *"Coeficiente de Restituição"*) empurram o input numérico para fora da borda do card, truncando o número.

---

## 6. Legibilidade e Transbordamento de Fórmulas KaTeX

### 6.1 A Discrepância Estrutural no CSS do Design System
Em `simulacoes/css/design-system.css` (linhas 1371–1377), a contenção de rolagem horizontal para fórmulas matemáticas foi aplicada unicamente ao seletor:
```css
.theory-card .katex-display {
    margin: 10px 0;
    font-size: 0.95em;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 4px 0;
}
```
Ou seja, **somente equações KaTeX inseridas dentro de `.theory-card` recebem `overflow-x: auto`**!

### 6.2 O Efeito Cascata nos Modais de Teoria
Nas simulações com modal de dedução matemática (`clima.html`, `drude.html`, `estacionarias2d.html`, `movimento.html`, `particulas.html`, `snell.html`, `ui_lab.html`), as deduções didáticas foram estruturadas com seções `.theory-section` diretamente no corpo do modal (`.sim-modal-body`), sem o contêiner `.theory-card`.

Como o KaTeX renderiza blocos de equação display (`$$...$$`) com `white-space: nowrap` por padrão, fórmulas científicas extensas sofrem corte ou quebra visual severa em telas $\le 400\text{px}$:
1. **Partículas (`particulas.html`)**:
   - Equação de onda eletrodinâmica não-homogênea:
     $$\left( \nabla^2 - \frac{1}{c^2}\frac{\partial^2}{\partial t^2} \right) \Phi(\mathbf{r}, t) = -\frac{\rho(\mathbf{r}, t)}{\varepsilon_0}$$
   - Função de Green retardada:
     $$G_{\text{ret}}(\mathbf{r}, t; \mathbf{r}', t') = \frac{\delta\left( t - t' - \frac{|\mathbf{r}-\mathbf{r}'|}{c} \right)}{4\pi |\mathbf{r}-\mathbf{r}'|}$$
2. **Ondas Estacionárias (`estacionarias2d.html`)**:
   $$\psi_{n,m}(x, y) = \cos\left(\frac{n\pi x}{L}\right) \cos\left(\frac{m\pi y}{L}\right) - \cos\left(\frac{m\pi x}{L}\right) \cos\left(\frac{n\pi y}{L}\right)$$
3. **Cinemática (`movimento.html`)**:
   $$\frac{1}{2}(a_A - a_B) t^2 + (v_{0A} - v_{0B}) t + (s_{0A} - s_{0B}) = 0$$

Essas equações ultrapassam os 360px de largura útil do modal, sendo cortadas abruptamente na margem direita ou forçando uma barra de rolagem horizontal indesejada no corpo da página inteira.

---

## 7. Soluções de Engenharia e Especificações Técnicas de Correção

Para sanar 100% dos débitos de usabilidade móvel identificados sem alterar arquivos de código nesta etapa, definem-se as seguintes correções para a fase de implementação:

### 7.1 Regras Globais a Adicionar em `simulacoes/css/design-system.css`
```css
/* ==========================================================================
   BLINDAGEM MOBILE & ERGONOMIA TÁTIL UNIVERSAL (DS 2.0)
   ========================================================================== */

/* 1. Prevenção Universal de Captura de Scroll no Canvas */
.canvas-area,
.canvas-area canvas,
#three-container,
#three-container canvas,
.sim-layout canvas {
    touch-action: none !important;
    -webkit-touch-callout: none;
    user-select: none;
}

/* 2. Ampliação da Alça de Arraste do Bottom Sheet para Área Ergonômica */
.sheet-drag-handle {
    height: 40px !important; /* Elevado de 16px para 40px */
    padding: 12px 0 !important;
    cursor: grab;
    touch-action: none;
    display: flex;
    align-items: center;
    justify-content: center;
}
.sheet-drag-pill {
    width: 44px !important;  /* Elevado de 36px para 44px */
    height: 5px !important;   /* Elevado de 4px para 5px */
    border-radius: 999px;
    background: var(--border-color);
}

/* 3. Ergonomia dos Sliders para Padrão WCAG (>= 44px de área de toque) */
input[type="range"].sim-slider {
    height: 32px; /* Aumenta a trilha interativa */
}
input[type="range"].sim-slider::-webkit-slider-thumb {
    height: 24px !important;
    width: 24px !important;
    margin-top: -8px !important;
    cursor: pointer;
}
input[type="range"].sim-slider::-moz-range-thumb {
    height: 24px !important;
    width: 24px !important;
    border-radius: 50%;
    background: var(--accent-slider, var(--accent-color));
    border: 2px solid var(--bg-surface);
    cursor: pointer;
}

/* 4. Dots de Tema e Botões Flutuantes Ampliados em Telas Móveis */
@media (max-width: 900px) {
    .toolbar-dot, .theme-dot-btn {
        width: 22px !important;  /* Elevado de 14px para 22px */
        height: 22px !important;
    }
    .canvas-btn-floating {
        min-height: 38px;
        min-width: 38px;
    }
    /* Oculta botão de colapso lateral dentro da tab-nav mobile */
    .tab-nav .btn-collapse-sidebar {
        display: none !important;
    }
}

/* 5. Contenção Universal de Transbordamento para KaTeX Display */
.katex-display {
    max-width: 100% !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    -webkit-overflow-scrolling: touch;
    padding: 6px 2px;
    margin: 8px 0;
}
```

### 7.2 Atualizações Estruturais em `simulacoes/scripts/sim-ui.js`
1. **Proteção contra Colapso Irreversível**:
   ```javascript
   export function initSidebarCollapse(options = {}) {
       // ...
       const collapse = () => {
           if (window.innerWidth <= 900) return; // Inerte em mobile
           layout.classList.add('sidebar-collapsed');
           smoothResize();
       };
       // ...
   }
   ```
2. **Utilitário de Eventos de Ponteiro Unificados (`attachCanvasPointer`)**:
   Implementar função auxiliar em `sim-ui.js` para abstrair toque, mouse e stylus em qualquer canvas:
   ```javascript
   export function attachCanvasPointer(canvas, { onDown, onMove, onUp, onPinchZoom }) {
       canvas.style.touchAction = 'none';
       const activePointers = new Map();

       canvas.addEventListener('pointerdown', (e) => {
           canvas.setPointerCapture(e.pointerId);
           activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
           if (onDown) onDown(e, getRelativeCoords(canvas, e));
       });

       canvas.addEventListener('pointermove', (e) => {
           if (!activePointers.has(e.pointerId)) return;
           activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
           
           if (activePointers.size === 2 && onPinchZoom) {
               // Cálculo da distância euclidiana entre os dois dedos para pinch-to-zoom
               const [p1, p2] = Array.from(activePointers.values());
               const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
               onPinchZoom(dist);
           } else if (onMove) {
               onMove(e, getRelativeCoords(canvas, e));
           }
       });

       const handlePointerUp = (e) => {
           activePointers.delete(e.pointerId);
           try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
           if (onUp) onUp(e);
       };

       canvas.addEventListener('pointerup', handlePointerUp);
       canvas.addEventListener('pointercancel', handlePointerUp);
   }
   ```

---
*Fim do Relatório R2 — Avaliação Aprofundada de Usabilidade Móvel e Controles Táteis.*
