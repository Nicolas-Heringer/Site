# Relatório de Auditoria de Usabilidade Móvel e Prontidão Tátil (Mobile Readiness & Touch Usability Survey)

**Data de Emissão**: 2026-10-12  
**Autor**: Explorer 2 (Mobile Readiness & Touch Usability Explorer)  
**Escopo**: Todas as 14 simulações em `c:\Users\nicol\Documents\GitHub\Site\simulacoes\`, `simulacoes/scripts/sim-ui.js` e `simulacoes/css/design-system.css`  
**Dispositivos Alvo**: Smartphones e Tablets (Telas $\le$ 900px, incluindo breakpoints de 360px, 480px, 560px, 768px e 900px)

---

## 1. Resumo Executivo e Matriz Consolidada de Prontidão Móvel

Foi conduzida uma auditoria técnica profunda e exaustiva sobre todas as 14 simulações científicas do repositório, com foco exclusivo na experiência de usuário em dispositivos móveis e telas sensíveis ao toque ($\le$ 900px).

### 1.1 Distribuição de Prontidão Mobile
* **Totalmente Adaptadas (Nível A - Alta Usabilidade Móvel)**: **1** simulação (`atomo_de_hidrogenio.html` — 7,1%). Implementa Bottom Sheet completo com estados reativos, safe-area insets, ocultação de rótulos em telas estreitas e `touch-action: none;` explícito no container 3D.
* **Parcialmente Adaptadas com Débitos Táteis (Nível B - Usabilidade Moderada/Degradada)**: **7** simulações (`clima.html`, `drude.html`, `estacionarias2d.html`, `movimento.html`, `particulas.html`, `snell.html`, `ui_lab.html` — 50,0%). Possuem Bottom Sheet via DS 2.0, mas sofrem de omissão de `touch-action: none;` no canvas, controles exclusivamente atrelados a eventos de mouse (impossibilitando interação tátil em tela), alvos de toque inferiores a 44x44px ou equações KaTeX transbordando o modal de teoria.
* **Completamente Quebradas em Mobile (Nível C - Falha Crítica / Inutilizáveis)**: **6** simulações (`audio.html`, `fonons.html`, `gravidade.html`, `matrizes.html`, `quedalivre.html`, `tensor_de_inercia.html` — 42,9%). Permanecem no layout legado de `base.css` sem Bottom Sheet (painel empilhado abaixo do canvas ou esmagado lateralmente), não possuem tratamento de touch, possuem coordenadas distorcidas ou canvas estático que impede qualquer interação física por toque.

---

### 1.2 Matriz Consolidada de Auditoria Mobile (14 Simulações)

| Simulação | CSS Base | Viewport Tag | Bottom Sheet (`initBottomSheet`) | `touch-action: none` no Canvas | Suporte a Toque no Canvas | Alvos $\ge$ 44px | KaTeX sem Overflow | Classificação Mobile | Resumo da Falha / Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **atomo_de_hidrogenio.html** | DS 2.0 | `width=device-width, initial-scale=1` | ✅ Sim (`peek`/`half`/`exp`) | ✅ Sim (`#three-container`) | ✅ Sim (OrbitControls touch) | ⚠️ Parcial (thumb 18px) | ✅ Sim | **Nível A (Alta)** | Melhor implementação do site; toolbar compacta com safe-insets. |
| **audio.html** | Legado | `width=device-width, initial-scale=1` | ❌ Não (empilhado) | ❌ Não | ❌ Não | ❌ Não (botões 24-32px) | ⚠️ Sem overflow (curto) | **Nível C (Crítica)** | PiP canvas fixo de 220px cobre 60% da tela; sem bottom sheet. |
| **clima.html** | DS 2.0 | `width=device-width, initial-scale=1.0` | ✅ Sim | ❌ Não | ⚠️ Orbit sem touch-action | ⚠️ Parcial | ❌ Não (modal overflow) | **Nível B (Média)** | HUD com 10 linhas polui 50% do canvas; gesto 3D dispara scroll da página. |
| **drude.html** | DS 2.0 | `width=device-width, initial-scale=1` | ✅ Sim | ❌ Não | N/A (passivo) | ⚠️ Parcial (segment 38px) | ❌ Não (modal overflow) | **Nível B (Média)** | Canvas sem touch-action; botões de campo menores que 44px. |
| **estacionarias2d.html** | DS 2.0 | `width=device-width, initial-scale=1.0` | ✅ Sim | ❌ Não | ⚠️ `touchmove` passivo | ⚠️ Parcial | ❌ Não (modal overflow) | **Nível B (Média)** | Inspeção de onda com dedo rola a página simultaneamente. |
| **fonons.html** | Legado | `width=device-width, initial-scale=1` | ❌ Não | ❌ Não | ❌ Apenas `mousedown/move` | ❌ Não | ⚠️ Sem overflow | **Nível C (Crítica)** | Canvas estático 900x600; coordenadas do toque descalibradas em 2,5x. |
| **gravidade.html** | Legado | `width=device-width, initial-scale=1.0` | ❌ Não | ❌ Não | ❌ Não | ❌ Não (checkbox nativo) | ⚠️ Sem overflow | **Nível C (Crítica)** | Grid esmaga painel em 180px no tablet; 2 gráficos de 220px estouram tela. |
| **matrizes.html** | Legado | `width=device-width, initial-scale=1` | ❌ Não | ❌ Não | ❌ Apenas mouse | ❌ Não | ⚠️ Sem overflow | **Nível C (Crítica)** | Impossível arrastar vetores $\hat{i}$ e $\hat{j}$ com o dedo; painel abaixo do canvas. |
| **movimento.html** | DS 2.0 | `width=device-width, initial-scale=1.0` | ✅ Sim | ✅ Sim (`#simCanvas`) | ⚠️ Drag ok, zoom mouse-only | ⚠️ Parcial | ❌ Não (modal overflow) | **Nível B (Média)** | Zoom do gráfico apenas via roda do mouse (sem pinch-to-zoom). |
| **particulas.html** | DS 2.0 | `width=device-width, initial-scale=1.0` | ✅ Sim | ❌ Não | ❌ Apenas `mousedown/move` | ⚠️ Parcial | ❌ Não (11 eqs no modal) | **Nível B (Média)** | Agitação de partículas com o dedo não funciona; tela rola ao tocar. |
| **quedalivre.html** | Legado | `width=device-width, initial-scale=1.0` | ❌ Não | ❌ Não | ❌ Apenas mouse | ❌ Não | ⚠️ Sem overflow | **Nível C (Crítica)** | Bola não pode ser arremessada no touch; canvas fixo 600x600 sem resize. |
| **snell.html** | DS 2.0 | `width=device-width, initial-scale=1.0` | ✅ Sim | ❌ Não | ❌ Apenas `mousedown/move` | ⚠️ Parcial | ❌ Não (modal overflow) | **Nível B (Média)** | Emissão de raio exige clique esquerdo; rotação de ângulo exige roda do mouse. |
| **tensor_de_inercia.html** | Legado | `width=device-width, initial-scale=1.0` | ❌ Não | ❌ Não | ⚠️ Orbit sem touch-action | ❌ Não | ⚠️ Sem overflow | **Nível C (Crítica)** | Órbita 3D trava scroll; badge transborda lateralmente; matriz 3x3 inacessível. |
| **ui_lab.html** | DS 2.0 | `width=device-width, initial-scale=1.0` | ✅ Sim | ❌ Não | ⚠️ Orbit sem touch-action | ❌ Theme dots 14px | ❌ Não (modal overflow) | **Nível B (Média)** | Showcase do DS tem dots de 14px e canvas 3D sem touch-action. |

---

## 2. Auditoria Técnica Aprofundada nas 7 Dimensões Mandatórias

### Dimensão 1: Configuração da Meta Tag Viewport
* **Status**: 100% dos 14 arquivos possuem a tag `<meta name="viewport">`.
* **Inconsistências Identificadas**:
  - 6 arquivos utilizam `initial-scale=1` (`atomo_de_hidrogenio`, `audio`, `drude`, `fonons`, `matrizes`).
  - 8 arquivos utilizam `initial-scale=1.0` (`clima`, `estacionarias2d`, `gravidade`, `movimento`, `particulas`, `quedalivre`, `snell`, `ui_lab`, `tensor_de_inercia`).
* **Ausência Crítica de `viewport-fit=cover`**:
  Nenhum arquivo declara `viewport-fit=cover`. Em smartphones modernos com entalhe frontal (notch) ou Dynamic Island (ex.: iPhones a partir do iPhone X e dispositivos Android modernos), a viewport é renderizada com faixas pretas letterboxing no topo e na base. Apenas `atomo_de_hidrogenio.css` compensou manualmente através de `env(safe-area-inset-bottom, 16px)`, mas sem `viewport-fit=cover`, o navegador pode não injetar os valores reais das safe-areas.
* **Acessibilidade e Zoom**: Nenhum arquivo impõe restrições prejudiciais à acessibilidade como `user-scalable=no` ou `maximum-scale=1.0`, o que está em conformidade com as diretrizes WCAG 1.4.4 (Resize Text).

---

### Dimensão 2: Implementação de Bottom Sheet e Painéis Responsivos
* **Infraestrutura no Design System 2.0**:
  - `design-system.css` (linhas 2019–2191) define a transição do `.controls-panel` para um Bottom Sheet fixado na base com três snap points:
    - `.controls-panel.sheet-peek`: altura de 64px (apenas alça e abas visíveis; corpo e rodapé ocultos via `display: none !important;`).
    - `.controls-panel.sheet-half`: altura de 52vh (meia tela).
    - `.controls-panel.sheet-expanded`: altura de 85vh (quase tela cheia).
  - `sim-ui.js` (linhas 448–560) fornece o controlador `initBottomSheet()` com swipe vertical na alça (limiar de 30px) e auto-expansão ao tocar nas abas.
* **Falhas e Débitos Críticos no Bottom Sheet**:
  1. **Alça de Arraste com Zona de Toque Ínfima (16px)**:
     Em `design-system.css` (linha 1996), `.sheet-drag-handle` possui `height: 16px;`. A pílula visual `.sheet-drag-pill` mede apenas 36x4px. Tentar acertar essa faixa vertical de 16px com o polegar enquanto o dispositivo está em movimento é extremamente difícil. Se o usuário tocar 2px acima, interage com o canvas/HUD; se tocar 2px abaixo, ativa involuntariamente uma aba de navegação.
  2. **Conflito Destrutivo entre `initSidebarCollapse` e `initBottomSheet`**:
     Em `sim-ui.js`, o botão `.btn-collapse-sidebar` (que no mobile é reaproveitado visualmente na barra de abas) recebe listeners de evento tanto em `initSidebarCollapse()` quanto em `initBottomSheet()`.
     - `initSidebarCollapse` adiciona a classe `.sidebar-collapsed` ao container `.sim-layout`.
     - No CSS (linha 226 de `design-system.css`), `.sim-layout.sidebar-collapsed .controls-panel` aplica:
       ```css
       opacity: 0;
       pointer-events: none;
       transform: translateX(40px);
       padding: 0;
       border: none;
       ```
     - Como resultado, clicar no botão de recolher no mobile **faz o Bottom Sheet desaparecer por completo para a direita**, tornando-o invisível e intocável!
     - E como `.canvas-btn-expand-sidebar` possui `display: none !important;` no mobile (linha 2042), **não existe nenhum botão na tela para reabrir o painel**. O usuário fica preso na tela sem controles até recarregar a página!
  3. **Ausência Completa nas 6 Simulações Legadas**:
     Em `audio`, `fonons`, `gravidade`, `matrizes`, `quedalivre` e `tensor_de_inercia`, o layout base (`base.css`, linhas 407–422) simplesmente quebra o grid desktop (`1fr 370px`) para `grid-template-rows: auto 1fr;` com `height: auto;`. O painel fica empilhado verticalmente abaixo do canvas, forçando rolagem vertical infinita na página inteira e desconectando a visualização dos controles.

---

### Dimensão 3: Prevenção de Rolagem Acidental (`touch-action: none`)
* **A Grande Omissão do Design System 2.0**:
  A Regra 4 de `.agents/plugins/simulacoes-lab/rules/AGENTS.md` determina categoricamente:
  > *"Canvas 3D: O container do canvas DEVE possuir a propriedade CSS touch-action: none; para prevenir que o gesto de pinça ou órbita 3D capture a rolagem nativa do navegador."*
  No entanto, **`design-system.css` NÃO CONTÉM `touch-action: none;` no `.canvas-area`, nem no `#three-container`, nem em `canvas`**! A única menção a `touch-action: none;` em todo o `design-system.css` está na `.sheet-drag-handle` (linha 2000).
* **Impacto nas Simulações 3D**:
  - `clima.html`, `tensor_de_inercia.html` e `ui_lab.html` utilizam `OrbitControls` do Three.js sobre containers sem `touch-action: none;`.
  - Ao deslizar o dedo na tela para girar a Terra (`clima.html`), o tensor de inércia (`tensor_de_inercia.html`) ou a forma 3D (`ui_lab.html`), o motor de renderização do navegador mobile intercepta o gesto como rolagem vertical da página ou gesto de pull-to-refresh. A cena 3D treme violently ou a página rola para cima/baixo em vez de orbitar o objeto.
  - Apenas `atomo_de_hidrogenio.css` (linha 12) adicionou explicitamente `#three-container { touch-action: none; }`.
* **Impacto nas Simulações 2D e Toque Passivo**:
  - Em `estacionarias2d.js`, o evento de toque é registrado como:
    ```javascript
    canvas.addEventListener('touchmove', (e) => {
        if (!e.touches || e.touches.length === 0) return;
        inspectAt(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    ```
    Como o listener é `{ passive: true }` e o canvas não possui `touch-action: none;`, arrastar o dedo para inspecionar a amplitude da membrana elástica rola a janela inteira, tornando a inspeção contínua impossível.
  - Em `particulas.html` e `snell.html`, o canvas também não possui `touch-action: none;`.

---

### Dimensão 4: Ergonomia Tátil e Dimensionamento de Alvos (Critérios WCAG)
* **Avaliação Frente ao Padrão de 44x44px (WCAG 2.1 SC 2.5.5 / Apple HIG / Material Design)**:
  1. **Thumb dos Sliders (`sim-slider`)**:
     Em `design-system.css` (linhas 800–801):
     ```css
     input[type="range"].sim-slider::-webkit-slider-thumb {
         height: 18px;
         width: 18px;
     }
     ```
     O cursor deslizante possui apenas **18x18px**, menos de metade da área tátil recomendada de 44x44px. Ao tentar puxar o slider com o polegar em um smartphone, o usuário frequentemente erra o ponto de toque ou ativa o clique direto no track do slider, causando saltos indesejados no parâmetro. Além disso, **não há definição de `::-moz-range-thumb`**, fazendo com que o Firefox Mobile exiba o cursor cinza nativo desestilizado.
  2. **Botões Compactos (`.btn-icon`)**:
     Definidos com `width: 36px; height: 36px;` (linha 658). Ficam abaixo do patamar de 44px.
  3. **Botões Flutuantes do Canvas (`.canvas-btn-floating`)**:
     Definidos com `padding: 5px 8px; font-size: 0.74rem;` (linha 2071). Em telas $< 560\text{px}$, o texto é ocultado via `.btn-label-text { display: none; }` e o padding reduzido para `5px 7px`. O botão resultante mede cerca de **26x26px**, tornando o clique propenso a erros.
  4. **Seletores de Cor da Toolbar (`.toolbar-dot`, `.theme-dot-btn`)**:
     Em telas $\le 900\text{px}$, medem **14x14px** (linha 2058). Tentar tocar em um círculo de 14px com o polegar (cuja impressão digital cobre ~45–57px) quase invariavelmente aciona o ponto adjacente ou a barra inteira.
  5. **Responsividade do Dual-Slider em Telas Ultra-Estreitas ($\le 360\text{px}$)**:
     O componente `.sim-dual-slider` alinha o rótulo e o wrapper numérico através de `justify-content: space-between`. O input numérico possui `width: 62px;` fixo. Em telas estreitas como Galaxy Fold (280px) ou iPhones compactos (320px–360px), se o rótulo da grandeza física for ligeiramente extenso (ex.: *"Coeficiente de Restituição"*), o layout quebra ou empurra o input para fora dos limites visíveis do card, pois não há `flex-wrap: wrap;`.

---

### Dimensão 5: Legibilidade e Transbordamento de Equações KaTeX
* **Discrepância Estrutural no CSS do Design System**:
  Em `design-system.css`, a única regra que garante rolagem horizontal para fórmulas LaTeX é:
  ```css
  /* Linhas 1371-1377 */
  .theory-card .katex-display {
      margin: 10px 0;
      font-size: 0.95em;
      overflow-x: auto;
      overflow-y: hidden;
      padding: 4px 0;
  }
  ```
  Ou seja, **apenas equações inseridas dentro de `.theory-card` recebem `overflow-x: auto`**!
* **Transbordamento nos Modais Didáticos de Teoria**:
  Em **todas** as simulações com modal de teoria (`clima.html`, `drude.html`, `estacionarias2d.html`, `movimento.html`, `particulas.html`, `snell.html`, `ui_lab.html`), as equações matemáticas display (`$$...$$`) são inseridas diretamente dentro de `<div class="theory-section">` ou parágrafos normais do `.sim-modal-body`, **sem o encapsulamento em `.theory-card`**.
* **Impacto Visual em Telas $\le 400\text{px}$**:
  Como KaTeX define equações em modo display como blocos centralizados sem quebra automática de linha (`white-space: nowrap`), fórmulas extensas como:
  - $\left( \nabla^2 - \frac{1}{c^2}\frac{\partial^2}{\partial t^2} \right) \Phi(\mathbf{r}, t) = -\rho(\mathbf{r}, t)/\varepsilon_0$ (`particulas.html`)
  - $G_{\text{ret}}(\mathbf{r}, t; \mathbf{r}', t') = \frac{\delta\left( t - t' - \frac{|\mathbf{r}-\mathbf{r}'|}{c} \right)}{4\pi |\mathbf{r}-\mathbf{r}'|}$ (`particulas.html`)
  - $\psi_{n,m}(x, y) = \cos\left(\frac{n\pi x}{L}\right) \cos\left(\frac{m\pi y}{L}\right) - \cos\left(\frac{m\pi x}{L}\right) \cos\left(\frac{n\pi y}{L}\right)$ (`estacionarias2d.html`)
  - $\frac{1}{2}(a_A - a_B) t^2 + (v_{0A} - v_{0B}) t + (s_{0A} - s_{0B}) = 0$ (`movimento.html`)
  
  **ultrapassam a largura do modal**, sendo cortadas no lado direito da tela ou forçando o aparecimento de uma barra de rolagem horizontal defeituosa na janela inteira do navegador.
* **Badges Matemáticos nos HUDs**:
  Em `clima.html` e `atomo_de_hidrogenio.html`, pequenos badges utilizam LaTeX inline (ex.: `$F_5$`, `$F_6$`, `$n$`, `$l$`, `$m_l$`). Nesses elementos, a renderização inline é estável, mas a ausência de escala dinâmica reduzida em telas pequenas faz com que linhas de métricas se amontoem verticalmente.

---

### Dimensão 6: Modo Foco e Recolhimento Lateral (`initSidebarCollapse` & Atalho 'F')
* **Incompatibilidade Arquitetural com Telas Móveis**:
  - `initSidebarCollapse` foi concebido exclusivamente para layouts de desktop com duas colunas (`grid-template-columns: 1fr 370px`).
  - Em telas $\le 900\text{px}$, o layout mobile do DS 2.0 redefine o `.sim-layout` para uma única coluna relativa (`position: relative; grid-template-columns: 1fr; grid-template-rows: 1fr;`), onde o canvas ocupa 100% da viewport e o painel vira uma folha inferior (`position: absolute; bottom: 0;`).
  - O código de `initSidebarCollapse` em `sim-ui.js` (linha 413) **não verifica a largura da janela**. Se o atalho de teclado `F` for pressionado (por exemplo, por um usuário utilizando iPad ou tablet com teclado físico acoplado), a classe `.sidebar-collapsed` é injetada, acionando a regra CSS que oculta o Bottom Sheet com `opacity: 0` e `transform: translateX(40px)`.
  - Como o botão flutuante de restauração `.canvas-btn-expand-sidebar` está com `display: none !important;` no mobile, o usuário perde o acesso a todos os controles físicos da simulação.

---

## 3. Catálogo Detalhado das Simulações Quebradas em Mobile

Esta seção detalha o modo de falha exato de cada simulação, acompanhado de arquivo, linha e mecanismo técnico.

---

### 3.1 Falhas Críticas (Totalmente Quebradas)

#### [F1] `quedalivre.html` — Inoperância Tátil Total e Canvas Rígido
* **Arquivos**: `simulacoes/quedalivre.html`, `simulacoes/scripts/quedalivre.js`, `simulacoes/css/quedalivre.css`
* **Modo de Falha Exato**:
  1. **Ausência de Listeners de Toque**: Em `quedalivre.js` (linhas 154–173), a interação foi programada estritamente com `mousemove`, `mousedown` e `mouseup`. Não existem listeners para `touchstart`, `touchmove`, `touchend` nem `pointerdown/move/up`. Quando o usuário toca na esfera para pegá-la e arremessá-la, nada acontece.
  2. **Dimensões Rígidas do Canvas**: No HTML (linha 49), o canvas possui `width="600" height="600"` estático. O script não implementa ouvinte de `resize`. Em telas com largura menor que 600px, o canvas sofre distorção geométrica via CSS ou transborda a tela horizontalmente.
  3. **Captura Indesejada de Rolagem**: O canvas não possui `touch-action: none;`. Tocar na área gráfica tenta rolar a página para baixo.
  4. **Layout Legado**: Utiliza `base.css` sem Bottom Sheet; o painel fica perdido abaixo do canvas.

#### [F2] `fonons.html` — Inoperância Tátil e Desalinhamento Grave de Coordenadas
* **Arquivos**: `simulacoes/fonons.html`, `simulacoes/scripts/fonons.js`, `simulacoes/css/fonons.css`
* **Modo de Falha Exato**:
  1. **Sem Suporte a Toque**: Em `fonons.js` (linhas 183–208), a geração de pulsos na rede cristalina escuta apenas `mousedown`, `mousemove`, `mouseup` e `mouseout`. O toque do dedo não perturba os átomos da rede.
  2. **Erro de Cálculo de Coordenadas em Telas Redimensionadas**: O método `getPosMouse(e)` (linhas 216–222) calcula `x = e.clientX - rect.left` em pixels CSS sobre um canvas cuja resolução interna é rígida em `width="900" height="600"`. Em um smartphone de 360px de largura, a escala real é de $\frac{900}{360} = 2{,}5\times$. Mesmo se um mouse Bluetooth for conectado ao celular, o clique ocorre a uma distância 2,5 vezes deslocada dos átomos visuais!
  3. **Canvas sem Resize**: `fonons.js` não implementa redimensionamento dinâmico no resize da janela.
  4. **Sem Bottom Sheet**: Os controles e sliders ficam empilhados abaixo do canvas.

#### [F3] `matrizes.html` — Inoperância Tátil dos Vetores da Base e Desconexão Visual
* **Arquivos**: `simulacoes/matrizes.html`, `simulacoes/scripts/matrizes.js`, `simulacoes/css/matrizes.css`
* **Modo de Falha Exato**:
  1. **Arrasto dos Vetores $\hat{i}$ e $\hat{j}$ Apenas por Mouse**: `matrizes.js` (linhas 657–709) implementa a interatividade central da simulação — pegar a ponta dos vetores da base no plano cartesiano e arrastá-los para transformar a malha — escutando exclusivamente `mousemove`, `mousedown` e `mouseup`. No mobile, o recurso principal da simulação é completamente inacessível.
  2. **Sem Prevenção de Scroll**: O canvas `simCanvas` não possui `touch-action: none;`. O gesto de arrasto no centro do gráfico rola a página inteira.
  3. **Desconexão Espacial dos Controles**: Na folha de estilo `base.css`, os quatro campos numéricos da matriz 2x2 ($a, b, c, d$) e o seletor de transformações ficam empurrados para baixo da tela, forçando o usuário a rolar para baixo para digitar números e depois rolar para cima para ver o resultado geométrico.

#### [F4] `tensor_de_inercia.html` — Conflito Destrutivo de Órbita 3D e Transbordamento
* **Arquivos**: `simulacoes/tensor_de_inercia.html`, `simulacoes/scripts/tensor_de_inercia.js`, `simulacoes/css/tensor_de_inercia.css`
* **Modo de Falha Exato**:
  1. **Conflito de Órbita 3D com Rolagem da Página**: O Three.js monta o renderer dentro de `#canvas-area` (linha 46 do HTML). Nem a div container nem o canvas possuem `touch-action: none;`. Ao tentar girar o corpo rígido 3D com um dedo ou fazer gesto de pinça para zoom, o navegador captura o evento como rolagem vertical da página, congelando a rotação 3D e fazendo a página saltar.
  2. **Transbordamento Horizontal do Badge de Instruções**: Em `tensor_de_inercia.css` (linhas 321–337), o elemento `.canvas-instructions` possui:
     ```css
     position: absolute;
     bottom: 15px;
     left: 50%;
     transform: translateX(-50%);
     white-space: nowrap;
     ```
     O texto *"💡 Use o mouse para orbitar a cena. Arraste os objetos para reposicioná-los."* com `white-space: nowrap` mede mais de 440px de largura. Em telas com $< 450\text{px}$ de largura, esse badge transborda a tela para a esquerda e para a direita, gerando rolagem horizontal indesejada no canvas.
  3. **Matriz de Inércia 3x3 Inacessível**: O cálculo do tensor e os autovetores principais ficam soterrados no final de uma página longa, impossibilitando a correlação simultânea entre geometria 3D e álgebra tensorial.

#### [F5] `gravidade.html` — Colapso de Layout em Tablets e Gráficos Confinados
* **Arquivos**: `simulacoes/gravidade.html`, `simulacoes/css/gravidade.css`, `simulacoes/scripts/gravidade.js`
* **Modo de Falha Exato**:
  1. **Breakpoint Incorreto para Tablets (769px–900px)**: Em `gravidade.css` (linha 71), a regra responsiva é:
     ```css
     @media (max-width: 768px) {
         .sim-layout {
             grid-template-columns: 1fr;
             grid-template-rows: 2fr 1fr;
         }
     }
     ```
     Em tablets na orientação retrato (larguras entre 769px e 900px, como iPad padrão de 810px ou 834px), o layout mantém a regra desktop `grid-template-columns: 3fr 1fr;`. A coluna lateral `.side-panel` fica espremida em apenas ~180px de largura, colapsando os gráficos de energia do Chart.js.
  2. **Estouro de Altura em Telas $\le 768\text{px}$**: O layout impõe `height: calc(100vh - 80px); overflow: hidden;`. No modo de 2 linhas (`2fr 1fr`), o painel inferior recebe apenas 33% da altura útil (cerca de 180–200px num smartphone). Dentro desse espaço minúsculo, existem dois wrappers `.chart-wrapper` com `height: 220px;` fixo cada um (total de 440px apenas para os gráficos, sem contar títulos e checkboxes). Os gráficos ficam cortados e inacessíveis.
  3. **Alvos de Toque Inadequados**: Os checkboxes nativos de visualização de vetores de posição e velocidade não possuem padding nem dimensões táteis (apenas `font-size: 14px; gap: 8px;`).

#### [F6] `audio.html` — Picture-in-Picture Invadindo 60% da Área Útil
* **Arquivos**: `simulacoes/audio.html`, `simulacoes/css/audio.css`, `simulacoes/scripts/audio.js`
* **Modo de Falha Exato**:
  1. **Container PiP Desproporcional no Mobile**: Em `audio.css` (linhas 449–456):
     ```css
     @media (max-width: 900px) {
         .audio-canvas-container.canvas-pip {
             width: 220px;
             height: 140px;
             bottom: 8px;
             right: 8px;
         }
     }
     ```
     Em smartphones com largura de 360px a 390px, um canvas flutuante de 220px de largura consome mais de 60% do espaço horizontal útil, obscurecendo o espectrograma FFT principal.
  2. **HUD Poluído**: `.audio-hud` ocupa altura vertical valiosa no topo do canvas, espremendo ainda mais a área gráfica.
  3. **Botões de Controle Minúsculos**: Botões de alternância e congelamento possuem dimensões entre 24px e 32px, difíceis de acionar por toque.
  4. **Sem Bottom Sheet**: Painel empilhado abaixo do canvas via `base.css`.

---

### 3.2 Falhas Moderadas em Simulações Design System 2.0

#### [F7] `clima.html` — Poluição Severa de HUD e Órbita 3D Capturada
* **Arquivos**: `simulacoes/clima.html`, `simulacoes/css/clima.css`, `simulacoes/scripts/clima.js`
* **Modo de Falha Exato**:
  1. **Omissão de `touch-action: none;` no Container 3D**: Ao contrário de `atomo_de_hidrogenio.css`, `clima.css` (linha 7) definiu `#three-container` sem a propriedade `touch-action: none;`. A órbita do globo terrestre em 3D disputa gestos com o navegador móvel.
  2. **HUD Gigantesco no Estado Peek**: O `.sim-hud` desta simulação possui **10 itens de telemetria** (linhas 124–170 do HTML). No mobile, o HUD fica fixado em `bottom: 74px;` (logo acima do Bottom Sheet recolhido). Com 10 linhas, o HUD mede cerca de 180px de altura. Em uma tela de smartphone (altura útil de ~600px), o HUD mais o Bottom Sheet de 64px ocupam quase 250px (mais de 40% da tela), deixando o globo terrestre confinado a uma fresta estreita.
  3. **Transbordamento de LaTeX no Modal**: Cinco equações display de balanço térmico planetário e tesselação esférica transbordam a largura do modal no mobile.

#### [F8] `particulas.html` — Agitação de Partículas Exclusiva para Mouse
* **Arquivos**: `simulacoes/particulas.html`, `simulacoes/scripts/particulas.js`
* **Modo de Falha Exato**:
  1. **Agitação por Toque Desabilitada**: A função `aplicarImpulsoCursor(e)` em `particulas.js` (linhas 702–714) só é chamada em eventos de `mousedown` e `mousemove`. Tocar ou deslizar o dedo sobre o canvas não agita o gás de partículas nem gera ondas acústicas.
  2. **Canvas sem `touch-action: none;`**: O canvas `myCanvas` não possui proteção tátil, fazendo a tela rolar ao toque.
  3. **11 Equações com Overflow**: O modal de teoria contém 11 fórmulas complexas (Funções de Green, Potencial de Lennard-Jones, Equação de Onda não-homogênea) que sofrem corte horizontal em telas $\le 400\text{px}$.

#### [F9] `snell.html` — Emissão de Luz Apenas com Clique e Rotação via Scroll Wheel
* **Arquivos**: `simulacoes/snell.html`, `simulacoes/scripts/snell.js`
* **Modo de Falha Exato**:
  1. **Ajuste de Ângulo Exige Roda de Mouse**: Em `snell.js` (linhas 579–585), a alteração do ângulo de incidência $\theta$ sobre o canvas foi programada com `canvas.addEventListener('wheel')`. Em dispositivos móveis não existe roda de rolagem de mouse nem gesto de rotação tátil mapeado, obrigando o usuário a abrir a aba de parâmetros para usar o slider.
  2. **Emissão de Feixes Bloqueada para Toque**: A emissão dinâmica ao tocar no canvas (linhas 587–596) exige `e.button === 0` (botão esquerdo do mouse) em `mousedown`. O toque do dedo não emite feixes de luz.
  3. **Sem `touch-action: none;`**: Arrasto no canvas dispara a rolagem do navegador.

#### [F10] `estacionarias2d.html` — Inspeção Tátil que Rola a Janela
* **Arquivos**: `simulacoes/estacionarias2d.html`, `simulacoes/scripts/estacionarias2d.js`
* **Modo de Falha Exato**:
  1. **`touchmove` com Rolagem Simultânea**: Conforme analisado na Dimensão 3, `touchmove` está com `{ passive: true }` e o canvas não possui `touch-action: none;`. A inspeção da membrana elástica é interrompida pelo movimento vertical involuntário da página.
  2. **Transbordamento de Equações**: Oito equações de separação de variáveis em coordenadas cartesianas transbordam a largura do modal no smartphone.

#### [F11] `movimento.html` — Zoom nos Gráficos Apenas via Roda do Mouse
* **Arquivos**: `simulacoes/movimento.html`, `simulacoes/scripts/movimento.js`
* **Modo de Falha Exato**:
  1. **Ausência de Gesto de Pinça (Pinch-to-Zoom)**: Em `movimento.js` (linhas 559–566), o zoom bidirecional nos gráficos de cinemática escuta unicamente o evento `wheel`. Usuários móveis não conseguem aproximar ou afastar curvas com dois dedos. (Embora haja botões `+` e `-` na toolbar, a ausência de pinch-zoom reduz a ergonomia).
  2. **Bug de Fechamento Irreversível no `#btn-collapse-sidebar`**: Clique no botão de recolher adiciona `.sidebar-collapsed`, ocultando o Bottom Sheet sem botão visível para restauração.

#### [F12] `drude.html` — Segment Buttons Abaixo do Tamanho Tátil Recomendado
* **Arquivos**: `simulacoes/drude.html`, `simulacoes/css/drude.css`
* **Modo de Falha Exato**:
  1. **Alvos de 38px**: `#dirCampoControl .segment-btn` possui `min-height: 38px;`, abaixo do limiar de 44px.
  2. **Transbordamento LaTeX**: Cinco equações de condutividade Drude transbordam no modal didático.

#### [F13] `ui_lab.html` — Micro-Alvos e Canvas 3D sem Touch-Action
* **Arquivos**: `simulacoes/ui_lab.html`, `simulacoes/scripts/ui_lab.js`
* **Modo de Falha Exato**:
  1. **Dots de 14x14px**: Na barra de ferramentas superior esquerda, os 5 seletores circulares de cor possuem diâmetro de 14px, impossíveis de tocar sem errar em telas compactas.
  2. **Three.js sem `touch-action: none;`**: O container `#three-container` não herda a proteção de toque, apresentando conflito entre órbita 3D e viewport scroll.

---

### 3.3 A Simulação de Referência (O Que Funciona Corretamente)

#### `atomo_de_hidrogenio.html` — Caso de Sucesso e Modelo para as Demais
* **Pontos Fortes Demonstrados**:
  1. `#three-container` possui `touch-action: none;` explícito em `atomo_de_hidrogenio.css` (linha 12), viabilizando rotação e zoom do orbital 3D sem qualquer conflito de rolagem.
  2. Implementa callbacks de estado no `initBottomSheet` sincronizados com a classe `.mobile-sheet-peek` no layout.
  3. Quando o Bottom Sheet está em `peek` (recolhido), ativa automaticamente uma toolbar quântica compacta no topo esquerdo com seletores de $n, l, m_l$ e geração rápida.
  4. Em telas $< 560\text{px}$, oculta os textos dos botões da toolbar (`span { display: none; }`) mantendo apenas ícones vetoriais com padding ajustado.
  5. Suporta `env(safe-area-inset-bottom, 16px)` para aparelhos com bordas arredondadas e home bar.

---

## 4. Causas-Raiz Sistêmicas no Design System e na Biblioteca `sim-ui.js`

A auditoria identificou 5 causas-raiz estruturais que afetam todo o ecossistema de simulações:

```
┌────────────────────────────────────────────────────────────────────────┐
│                    CAUSAS-RAIZ SISTÊMICAS MOBILE                       │
├────────────────────────────────┬───────────────────────────────────────┤
│ 1. Omissão Global de           │ design-system.css não aplica          │
│    touch-action: none          │ touch-action: none em .canvas-area,   │
│                                │ repassando o fardo a cada CSS local.  │
├────────────────────────────────┼───────────────────────────────────────┤
│ 2. Zona Tátil da Alça          │ .sheet-drag-handle tem apenas 16px de │
│    Insuficiente                │ altura, gerando toques perdidos.      │
├────────────────────────────────┼───────────────────────────────────────┤
│ 3. Conflito Sidebar vs.        │ initSidebarCollapse não checa largura │
│    Bottom Sheet                │ móvel, tornando o painel invisível.   │
├────────────────────────────────┼───────────────────────────────────────┤
│ 4. Sliders e Alvos Abaixo      │ Thumbs de 18px e botões de 26-36px    │
│    do Padrão WCAG (44px)       │ violam critérios de ergonomia tátil.  │
├────────────────────────────────┼───────────────────────────────────────┤
│ 5. Falta de Tratamento de      │ Apenas .theory-card .katex-display    │
│    KaTeX nos Modais            │ tem overflow-x: auto; modais estouram.│
└────────────────────────────────┴───────────────────────────────────────┘
```

1. **Ausência de Padronização Global de `touch-action: none;`**: O arquivo mestre `design-system.css` deveria conter:
   ```css
   .canvas-area,
   .canvas-area canvas,
   #three-container,
   #three-container canvas {
       touch-action: none;
   }
   ```
   A omissão obrigou cada desenvolvedor a lembrar de colocar isso em seu CSS local — o que só aconteceu em 2 das 14 simulações.
2. **Manipulação Tátil Centralizada em Mouse Events**: Os scripts das simulações (`quedalivre.js`, `fonons.js`, `matrizes.js`, `particulas.js`, `snell.js`) foram escritos utilizando a API legada de `mousedown` / `mousemove` em vez da API moderna unificada de **Pointer Events** (`pointerdown`, `pointermove`, `pointerup`, `setPointerCapture`), que abstrai perfeitamente mouse, toque de dedos e canetas stylus.
3. **Falta de Abstração para Gesto de Pinça (Pinch-to-Zoom)**: Simulações 2D com planos cartesianos ou gráficos (`movimento.js`, `snell.js`) contam apenas com o evento `wheel`, deixando telas táteis desprovidas de aproximação fluida.
4. **Isolamento Estilístico de KaTeX**: O Design System 2.0 pressupôs que todas as fórmulas ficariam dentro de `.theory-card`, negligenciando a estrutura real dos modais didáticos criados posteriormente (`.theory-section` dentro de `.sim-modal-body`).
5. **Divisão Incompleta de Código entre Simulações Legadas e DS 2.0**: As 6 simulações legadas continuam presas a `base.css` de 2024, sem modularização em ES Modules e sem consumir os controladores reativos de `sim-ui.js`.

---

## 5. Especificações Técnicas e Recomendações para Implementação Futura

Para orientar a fase de implementação e modernização do código sem alterar arquivos nesta etapa, recomendam-se as seguintes soluções técnicas padronizadas:

### 5.1 Atualização Global em `design-system.css`
1. **Blindagem Tátil Automática do Canvas**:
   ```css
   /* Aplicar globalmente para prevenir captura de scroll por qualquer canvas ou container 3D */
   .canvas-area,
   .canvas-area canvas,
   #three-container,
   #three-container canvas {
       touch-action: none !important;
       -webkit-touch-callout: none;
       user-select: none;
   }
   ```
2. **Expansão da Zona de Arraste do Bottom Sheet para 44px**:
   ```css
   .sheet-drag-handle {
       display: none;
       width: 100%;
       height: 38px; /* Aumentado de 16px para 38px (com padding atinge >44px) */
       padding: 10px 0;
       align-items: center;
       justify-content: center;
       cursor: pointer;
       touch-action: none;
       user-select: none;
   }
   .sheet-drag-pill {
       width: 44px; /* Aumentado de 36px para 44px */
       height: 5px; /* Aumentado de 4px para 5px */
       border-radius: 999px;
   }
   ```
3. **Ergonomia dos Sliders e Alvos Táteis (Mínimo WCAG 44px)**:
   ```css
   /* Sliders com área de toque ampliada via padding ou transform */
   input[type="range"].sim-slider::-webkit-slider-thumb {
       height: 24px;
       width: 24px;
       margin-top: -9px;
   }
   input[type="range"].sim-slider::-moz-range-thumb {
       height: 24px;
       width: 24px;
       border-radius: 50%;
       background: var(--accent-slider, var(--accent-color));
       border: 2px solid var(--bg-surface);
   }
   /* Dots de cor da toolbar ampliados no mobile */
   @media (max-width: 900px) {
       .toolbar-dot, .theme-dot-btn {
           width: 22px; /* Aumentado de 14px para 22px */
           height: 22px;
       }
   }
   ```
4. **Proteção de Overflow para KaTeX em Qualquer Contêiner**:
   ```css
   /* Regra universal para KaTeX Display em qualquer lugar da aplicação */
   .katex-display {
       max-width: 100%;
       overflow-x: auto !important;
       overflow-y: hidden !important;
       -webkit-overflow-scrolling: touch;
       padding: 6px 2px;
       margin: 8px 0;
   }
   ```

---

### 5.2 Refatoração no Controlador `sim-ui.js`
1. **Desativação Segura do Sidebar Collapse em Telas Móveis**:
   No método `initSidebarCollapse()`:
   ```javascript
   const collapse = () => {
       if (window.innerWidth <= 900) return; // Não recolhe lateralmente em mobile
       layout.classList.add('sidebar-collapsed');
       smoothResize();
   };
   ```
2. **Utilitário Unificado de Eventos de Ponteiro (`attachCanvasPointer`)**:
   Criar em `sim-ui.js` uma função de alta ordem para gerenciar interação no canvas compatível com mouse, toque e caneta:
   ```javascript
   export function attachCanvasPointer(canvas, { onDown, onMove, onUp, onPinchZoom }) {
       canvas.style.touchAction = 'none';
       let activeTouches = new Map();
       
       canvas.addEventListener('pointerdown', (e) => {
           canvas.setPointerCapture(e.pointerId);
           activeTouches.set(e.pointerId, { x: e.clientX, y: e.clientY });
           if (typeof onDown === 'function') onDown(e, getRelativeCoords(canvas, e));
       });
       
       canvas.addEventListener('pointermove', (e) => {
           if (activeTouches.has(e.pointerId)) {
               activeTouches.set(e.pointerId, { x: e.clientX, y: e.clientY });
               // Detecção de pinch-to-zoom com 2 dedos
               if (activeTouches.size === 2 && typeof onPinchZoom === 'function') {
                   // cálculo de distância e callback de zoom
               } else if (typeof onMove === 'function') {
                   onMove(e, getRelativeCoords(canvas, e));
               }
           }
       });
       
       const handleUp = (e) => {
           activeTouches.delete(e.pointerId);
           try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
           if (typeof onUp === 'function') onUp(e);
       };
       canvas.addEventListener('pointerup', handleUp);
       canvas.addEventListener('pointercancel', handleUp);
   }
   ```

---

### 5.3 Roadmap de Migração Prioritário sob a Ótica Mobile
Com base no nível de gravidade das falhas:
* **Prioridade 1 (Crítica — Restauração de Usabilidade Básica)**:
  Migrar as 3 simulações analíticas 2D com inoperância tátil total: `quedalivre.html`, `fonons.html` e `matrizes.html`. Substituir mouse events por pointer events e adotar o layout DS 2.0 com Bottom Sheet.
* **Prioridade 2 (Alta — Correção Estrutural de 3D e Gráficos)**:
  Migrar `tensor_de_inercia.html`, `gravidade.html` e `audio.html`. Adicionar `touch-action: none;` na órbita Three.js, redimensionar PiP no áudio e reestruturar gráficos Chart.js com Bottom Sheet.
* **Prioridade 3 (Média — Polimento de Ergonomia e KaTeX nas 7 Simulações DS 2.0)**:
  Adicionar `touch-action: none;` faltante em `clima.html`, `ui_lab.html`, `particulas.html`, `snell.html` e `drude.html`. Ampliar hit-targets na toolbar e nos sliders, implementar rolagem horizontal para equações no modal didático e corrigir a lógica de `#btn-collapse-sidebar`.

---
*Fim do Relatório de Auditoria de Usabilidade Móvel e Prontidão Tátil.*
