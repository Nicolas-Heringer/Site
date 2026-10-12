# Relatório de Revisão Técnica e Adversarial (Reviewer 1)

**Data:** 12 de Outubro de 2026  
**Revisor:** Reviewer 1 (Compliance Matrix & Mobile Usability Reviewer)  
**Papéis:** Reviewer (Objetivo) & Adversarial Critic (Desafiador)  
**Alvos da Revisão:**
1. `c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\worker_synthesis_1\AUDIT_COMPLIANCE_MATRIX.md`
2. `c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\worker_synthesis_1\MOBILE_USABILITY_ASSESSMENT.md`  
**Referência Normativa:** `.agents/plugins/simulacoes-lab/rules/AGENTS.md` e `ORIGINAL_REQUEST.md`  
**Veredito Formal:** **APPROVE** (Aprovado com Apontamentos Técnicos e Ressalva de Consolidação)

---

## 1. Sumário Executivo & Veredito

| Critério | Avaliação | Status |
|---|---|---|
| **Integridade Ética & Anti-Cheating** | Zero violações de integridade detectadas. Implementações e dados 100% verificados no código real. | **PASS** |
| **Cobertura do Escopo (R1)** | Todas as 14 simulações ativas em `simulacoes/` foram auditadas com fichas individuais completas. | **PASS** |
| **Exatidão Técnica dos Débitos** | Diagnóstico rigoroso de ES Modules, tokens CSS, `sim-ui.js`, CDNs externos e órfãos no hub. | **PASS** |
| **Avaliação Mobile (R2)** | Análise cirúrgica de telas $\le 900\text{px}$, bug de colapso do bottom sheet, `touch-action` e mouse traps. | **PASS** |
| **Consistência Interna** | Detectada discrepância na contagem de conformidade de `estacionarias2d.html` (Sec. 1.1 vs Sec. 2/4.5). | **MINOR FIX** |
| **Veredito Geral** | **APPROVE** | **APROVADO** |

O trabalho entregue pelo **Worker Synthesis 1** é de qualidade técnica excepcional. Os relatórios demonstram uma inspeção exaustiva do código-fonte real, identificando com precisão de linhas e seletores CSS problemas estruturais graves (como o desaparecimento irreversível do Bottom Sheet no mobile e a omissão de `touch-action: none;` em 12 das 14 simulações).

---

## 2. Auditoria de Integridade e Postura Adversarial

Em estrita conformidade com as diretrizes de integridade ética:
1. **Resultados Hardcoded / Facade Implementations**: NÃO foram detectados. Todas as conclusões são apoiadas em arquivos existentes no repositório.
2. **Atalhos e Delegação Indevida**: NÃO houve terceirização; todos os 14 arquivos HTML, 18 scripts JS e 16 folhas CSS foram diretamente catalogados.
3. **Fabricação de Métricas ou Linhas**: Todas as citações de linhas e seletores foram auditadas independentemente neste processo de revisão e confirmaram exatidão milimétrica.
4. **Violações de Integridade**: **Zero violações**.

---

## 3. Avaliação Detalhada: Matriz de Conformidade Técnica (`AUDIT_COMPLIANCE_MATRIX.md`)

### 3.1 Cobertura de Simulações
* **Requisito**: Auditar individualmente todas as simulações em `simulacoes/*.html`.
* **Constatação do Revisor**: O diretório `simulacoes/` contém exatamente 14 arquivos `.html` (mais o guia `DESIGN_SYSTEM_GUIDE.md`). Todas as 14 simulações possuem fichas técnicas individuais detalhadas nas seções 4.1 a 4.14 do relatório.
* **Resultado**: **Aprovado com 100% de cobertura**.

### 3.2 Validação das Classificações e Débitos Técnicos
A auditoria independente via scripts no repositório confirmou:
* **Adoção de CSS**:
  - `css/design-system.css`: 8 arquivos (`atomo_de_hidrogenio`, `clima`, `drude`, `estacionarias2d`, `movimento`, `particulas`, `snell`, `ui_lab`).
  - `css/base.css`: 6 arquivos (`audio`, `fonons`, `gravidade`, `matrizes`, `quedalivre`, `tensor_de_inercia`).
* **Arquitetura JavaScript**:
  - ES Modules (`<script type="module">`): 9 arquivos (os 8 de DS 2.0 mais `tensor_de_inercia.html`).
  - Classic Scripts: 5 arquivos (`audio`, `fonons`, `gravidade`, `matrizes`, `quedalivre`).
  - Web Workers: 2 arquivos ativos (`clima.worker.js` e `snell.worker.js`).
* **Consumo de `sim-ui.js`**:
  - Ativo em 8 simulações (`drude`, `particulas`, `snell`, `ui_lab`, `estacionarias2d`, `atomo_de_hidrogenio`, `clima`, `movimento`).
  - Zero integração em 6 simulações legadas.
* **Versões de Three.js**:
  - Three.js 0.165.0: `atomo_de_hidrogenio.html`, `clima.html`, `ui_lab.html`.
  - Three.js 0.158.0 (desatualizado): `tensor_de_inercia.html` (linha 210).
* **Dependências Externas CDN**:
  - `Chart.js` em `gravidade.html:22` (desnecessário para 2 gráficos simples).
  - `numeric.js` v1.2.6 em `tensor_de_inercia.html:204` (desnecessário para autovalores $3\times 3$).
* **Simulações Órfãs no Hub (`index.html`)**:
  - O `index.html` linka exatamente 12 simulações (linhas 264 a 386).
  - `gravidade.html` e `tensor_de_inercia.html` estão comprovadamente ausentes de `index.html`.

### 3.3 Apontamento Crítico / Discrepância Interna: `estacionarias2d.html`
* **Localização**: Seção 1.1 (linhas 16–25) vs. Seção 2 (linha 74) e Seção 4.5 (linha 224).
* **O Problema**:
  - Na **Seção 1.1**, `estacionarias2d.html` é agrupada como **Parcialmente Conforme**:
    > *"Parcialmente Conforme (DS 2.0 — Híbrido / Débitos Específicos): 4 simulações (28,6%) — atomo_de_hidrogenio.html, clima.html, estacionarias2d.html, movimento.html."*
  - Na **Tabela da Seção 2 (linha 74)** e na **Ficha 4.5 (linha 224)**, `estacionarias2d.html` é classificada como **Totalmente Conforme**.
  - A contagem do sumário executivo (4 Totalmente Conformes, 4 Parcialmente Conformes, 6 Legadas = 14) só fecha com 4/4/6 se `estacionarias2d.html` for computada como Parcialmente Conforme. Se ela for Totalmente Conforme, a distribuição real é **5 Totalmente Conformes (35,7%)**, **3 Parcialmente Conformes (21,4%)** e **6 Legadas (42,9%)**.
* **Avaliação do Revisor**:
  `estacionarias2d.html` adota `syncDualSlider` para ambos os modos $n$ e $m$, usa `initSidebarCollapse`, `initBottomSheet`, `initModal`, `inlineSVGImages`, `design-system.css`, KaTeX e ícones nativos. Por ser uma simulação de modo estacionário estático, ela não necessita da barra de transporte temporal. Seus únicos débitos são `touchmove` passivo e falta de `touch-action: none;` (que também ocorrem em `drude`, `particulas` e `snell`).
* **Ação Recomendada para Síntese Final**:
  Uniformizar a classificação: considerar `estacionarias2d.html` como **Totalmente Conforme** (elevando para 5 simulações / 35,7%) e retificar a lista da Seção 1.1 (Parcialmente Conforme = 3 simulações: `atomo_de_hidrogenio`, `clima`, `movimento`), OU justificar formalmente por que os débitos táteis a rebaixam para Parcialmente Conforme e atualizar a tabela da Seção 2.

### 3.4 Apontamento Menor: Contexto de `scripts/buttons.js`
* Na Seção 3.1 item 2, afirma-se que o controle `aberturaSlider` "não existe em nenhuma simulação ativa".
* **Verificação**: `aberturaSlider` existe no DOM de `simulacoes/snell.html` (linhas 190 e 197). Porém, `snell.html` não carrega `scripts/buttons.js`, pois o slider é controlado modernamente em `snell.js` via `syncDualSlider`. Portanto, `scripts/buttons.js` é de fato código morto/órfão, mas a justificativa deve citar que o slider foi absorvido pelo ES Module `snell.js`.

---

## 4. Avaliação Detalhada: Usabilidade Móvel (`MOBILE_USABILITY_ASSESSMENT.md`)

### 4.1 Validação do Bug Crítico de Colapso do Bottom Sheet
* **Cenário**: Usuário clica no botão `.btn-collapse-sidebar` ou pressiona `F` em tela $\le 900\text{px}$.
* **Verificação no Código**:
  1. Em `sim-ui.js` (linha 413), a função `collapse()` adiciona `.sidebar-collapsed` à raiz sem testar `window.innerWidth`.
  2. Em `design-system.css` (linha 226), `.sim-layout.sidebar-collapsed .controls-panel` recebe `opacity: 0; pointer-events: none; transform: translateX(40px);`.
  3. No mobile, `.controls-panel` é o Bottom Sheet fixado na base da tela; ele é transladado e ocultado para fora da visão.
  4. Em `design-system.css` (linha 2042), `@media (max-width: 900px) { .canvas-btn-expand-sidebar { display: none !important; } }`. O botão para reverter o colapso está suprimido!
  5. Mesmo que `initBottomSheet` trate o clique em `collapseBtn` (linha 513), `e.stopPropagation()` NÃO impede a execução do ouvinte irmão registrado por `initSidebarCollapse` no mesmo elemento!
* **Conclusão**: **Bug 100% comprovado**. Trata-se de um softlock crítico de interface que bloqueia o usuário em modo mobile.

### 4.2 Validação da Omissão de `touch-action: none;`
* **Requisito Normativo**: Regra 4 de `AGENTS.md` ("Canvas 3D: O container do canvas DEVE possuir a propriedade CSS touch-action: none;").
* **Varredura no Repositório**:
  Apenas 3 declarações existem em todo o repositório:
  1. `simulacoes/css/atomo_de_hidrogenio.css:12` (no container 3D).
  2. `simulacoes/css/movimento.css:14` (no canvas).
  3. `simulacoes/css/design-system.css:2000` (na alça do bottom sheet `.sheet-drag-handle`).
* **Conclusão**: `design-system.css` omitiu a regra nos seletores globais `.canvas-area` e `canvas`. Exatamente **12 das 14 simulações (85,7%) falham na prevenção de scroll nativo**, provocando saltos verticais e engasgos de órbita 3D/interação 2D. Diagnóstico **100% verificado**.

### 4.3 Validação das Armadilhas de Eventos Exclusivos de Mouse
A auditoria manual linha por linha confirmou todas as referências citadas:
1. `quedalivre.js` (linhas 154–173): Listeners exclusivamente para `mousemove`, `mousedown` e `mouseup`. O toque mobile não consegue arremessar a bola.
2. `fonons.js` (linhas 183–208, 216–222): `mousedown`/`mousemove` apenas. A função `getPosMouse(e)` divide coordenadas relativas sobre um canvas fixo de `900x600`, provocando erro de escala de $2{,}5\times$ em smartphones de 360px.
3. `matrizes.js` (linhas 657–709): O arraste interativo das pontas dos vetores de base $\hat{i}$ e $\hat{j}$ escuta unicamente eventos de mouse.
4. `particulas.js` (linhas 702–714): Injeção de perturbação e calor por clique/arraste (`aplicarImpulsoCursor`) escuta unicamente `mousedown`/`mousemove`.
5. `snell.js` (linhas 579–585 e 587–596): Rotação do ângulo de incidência mapeada para evento `wheel` (inexistente no mobile) e emissão condicionada a `e.button === 0`.
* **Conclusão**: Diagnóstico **100% verificado e exato**.

### 4.4 Validação do Transbordamento de Fórmulas KaTeX
* **Verificação no Código**:
  Em `design-system.css` (linhas 1371–1377), a regra de rolagem horizontal é estritamente:
  ```css
  .theory-card .katex-display {
      overflow-x: auto;
      overflow-y: hidden;
  }
  ```
  Nas simulações com modal (`.sim-modal-body`), as seções de dedução são estruturadas com `.theory-section`, sem o container `.theory-card`.
  Como consequência, as equações KaTeX display em modais herdam o comportamento padrão sem contenção de overflow, transbordando horizontalmente em telas $\le 400\text{px}$.
* **Conclusão**: Diagnóstico **100% verificado**.

---

## 5. Desafios Adversariais & Testes de Estresse (Critic Perspective)

Como Crítico Adversarial, submeti as soluções propostas pelo Worker Synthesis 1 a cenários de falha para prevenir novos problemas na futura fase de implementação:

### Desafio 1: Conflito de Alturas do Bottom Sheet (`sheet-peek`)
* **Proposta do Worker**: Aumentar `.sheet-drag-handle` de 16px para 40px (`padding: 12px 0`).
* **Cenário de Estresse**: Em modo `.sheet-peek`, a altura total do Bottom Sheet está definida em `64px` (`design-system.css:2018`). Se a alça consome 40px, sobram apenas `24px` para a barra de abas (`.tab-nav`). Porém, os botões `.tab-btn` têm altura mínima de 36px.
* **Blast Radius**: Colapso visual ou sobreposição da alça sobre os botões de aba no estado recolhido.
* **Mitigação Recomendada**: Ao elevar `.sheet-drag-handle` para 40px, a altura de `.sheet-peek` DEVE ser ajustada simultaneamente de **64px para 80px** (ou 84px), garantindo espaço suficiente para a barra de abas sem sobreposição.

### Desafio 2: Risco de Interceptação de Pointer Events em Three.js
* **Proposta do Worker**: Criar a função utilitária `attachCanvasPointer` com `canvas.setPointerCapture(e.pointerId)` para unificar mouse/touch/stylus.
* **Cenário de Estresse**: Em simulações 3D (`atomo_de_hidrogenio`, `clima`, `ui_lab`, `tensor_de_inercia`), o Three.js `OrbitControls` (r165) já gerencia nativamente eventos de ponteiro para órbita (1 dedo), pinch-to-zoom (2 dedos) e pan. Se `attachCanvasPointer` com `setPointerCapture` for aplicado ao container 3D, haverá captura concorrente de ponteiros, travando o `OrbitControls`.
* **Mitigação Recomendada**: Especificar explicitamente que `attachCanvasPointer` é **exclusivo para simulações 2D Canvas** (`matrizes`, `fonons`, `quedalivre`, `particulas`, `snell`, `movimento`). Para Three.js 3D, a única intervenção necessária é o CSS `touch-action: none !important;`.

### Desafio 3: Fórmulas KaTeX Inline com Quebra Indesejada
* **Proposta do Worker**: Aplicar `.katex-display { overflow-x: auto !important; }`.
* **Cenário de Estresse**: O que ocorre com fórmulas inline (`$...$`) inseridas no meio de parágrafos teóricos em telas ultra-estreitas (ex.: 320px)?
* **Mitigação Recomendada**: Adicionar nas regras globais de tipografia matemática que blocos inline recebam `word-break: normal;` e equações longas devam ser preferencialmente convertidas para display blocks (`$$...$$`).

---

## 6. Tabela de Reivindicações Auditadas e Métodos de Verificação

| Reivindicação do Worker | Método de Verificação Independente | Resultado |
|---|---|---|
| 14 simulações HTML no total | `list_dir simulacoes/` e PowerShell `Get-ChildItem *.html` | **CONFIRMADO** (14 arquivos) |
| 8 simulações em `design-system.css`, 6 em `base.css` | Script de inspeção de tags `<link rel="stylesheet">` | **CONFIRMADO** (8 vs 6) |
| 9 ES Modules, 5 scripts clássicos | Script de regex em `<script type="module">` | **CONFIRMADO** (9 vs 5) |
| 8 scripts consomem `sim-ui.js` | Busca por `from './sim-ui.js'` em `scripts/*.js` | **CONFIRMADO** (8 scripts) |
| Three.js 0.158 desatualizado em `tensor_de_inercia` | Inspeção de importmap em `tensor_de_inercia.html:210` | **CONFIRMADO** (0.158.0) |
| `gravidade` e `tensor_de_inercia` ausentes do hub | Busca por links em `index.html` (linhas 264–386) | **CONFIRMADO** (Órfãos) |
| Bug de colapso irreversível no mobile | Análise estática de `sim-ui.js:413` e `design-system.css:226,2042` | **CONFIRMADO** (Softlock) |
| Apenas 2 simulações possuem `touch-action: none` | Grep em `simulacoes/css/` para `touch-action` | **CONFIRMADO** (atomo:12, mov:14) |
| Mouse-only traps em 5 scripts | Leitura de código em `quedalivre`, `fonons`, `matrizes`, `particulas`, `snell` | **CONFIRMADO** (Linhas exatas) |
| Scoping de KaTeX restrito a `.theory-card` | Inspeção de `design-system.css:1371` | **CONFIRMADO** (Linha 1371) |
| Polegar de slider com 18px e sem `moz-range` | Inspeção de `design-system.css:800` | **CONFIRMADO** (18x18px) |

---

## 7. Recomendações de Ação para o Orquestrador e Fases Seguintes

1. **Ajuste de Consolidação em R1**: O orquestrador deve orientar o alinhamento da classificação de `estacionarias2d.html` entre a Seção 1.1 e a Seção 2 da Matriz de Auditoria, padronizando formalmente a distribuição em 5 Totalmente Conformes (35,7%) ou 4 Totalmente Conformes (28,6%).
2. **Incorporação das Mitigações Adversariais em R3/R4**:
   - Ajustar `.sheet-peek` para 80px no planejamento da correção do Bottom Sheet.
   - Restringir `attachCanvasPointer` a canvas 2D.
3. **Aprovação Formal dos Entregáveis**: Ambos os documentos (`AUDIT_COMPLIANCE_MATRIX.md` e `MOBILE_USABILITY_ASSESSMENT.md`) estão aprovados como bases sólidas e verídicas para guiar as propostas do plugin (R3) e o roadmap de migração (R4).
