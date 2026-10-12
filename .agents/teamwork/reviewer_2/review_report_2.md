# Relatório de Revisão Técnica e Avaliação Adversarial (Reviewer 2)

**Data:** 12 de Outubro de 2026  
**Revisor:** Reviewer 2 (Teamwork Reviewer & Adversarial Critic)  
**Alvos de Revisão:**
1. `c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\worker_synthesis_1\PLUGIN_EXTENSION_SPECS.md` (R3)
2. `c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\worker_synthesis_1\PHASED_MIGRATION_ROADMAP.md` (R4)
**Autor dos Entregáveis:** Worker Synthesis 1  
**Diretório de Trabalho:** `c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\reviewer_2\`  
**Modo de Execução:** READ-ONLY (Auditoria e Análise Crítica sem alteração no código de `simulacoes/`)

---

## 1. Sumário Executivo & Veredito

**Veredito:** **APPROVE** (Aprovado com Apontamentos Técnicos e Ressalvas de Alinhamento)

### Justificativa do Veredito
Os entregáveis produzidos pelo Worker Synthesis 1 (`PLUGIN_EXTENSION_SPECS.md` e `PHASED_MIGRATION_ROADMAP.md`) representam um trabalho de engenharia de altíssima qualidade técnica, profundidade conceitual e clareza arquitetural. O trabalho atende e supera todos os critérios de aceitação do pedido original (`ORIGINAL_REQUEST.md` — R3 e R4):
- Especifica **4 novos componentes de primeira classe** (`MatrixTensorEditor`, `MultiSeriesPlot`, `Vector3DPicker`, `TouchCanvasController`), superando a meta mínima de 3 componentes.
- Apresenta contratos completos de API em TypeScript/JSDoc, marcações semânticas HTML alinhadas ao Design System 2.0 e regras de estilo orientadas a tokens.
- Estrutura um **plano faseado em 4 lotes lógicos e sequenciais** (Fundação → Analítica 2D → Áudio & Telemetria → Tensores & 3D), com estimativa plausível de 76 a 96 horas totais.
- Fornece a reintegração precisa das simulações órfãs (`gravidade.html` e `tensor_de_inercia.html`) com marcação HTML 100% compatível com a lógica de filtragem de `index.html` e `script.js`.
- Não foram detectadas quaisquer violações de integridade (código falso, dados forjados ou atalhos espúrios).

Foram identificados **3 achados de severidade Moderada (Major)** e **5 achados de severidade Leve (Minor)**, detalhados abaixo com suas respectivas mitigações e correções concretas para a etapa de implementação. Nenhum desses achados invalida a arquitetura central, justificando a **Aprovação**.

---

## 2. Auditoria de Integridade & Conectividade

| Critério de Integridade | Status | Evidência Observada |
|---|---|---|
| **Ausência de Resultados Forjados** | CONFORME | Nenhuma massa de dados ou teste sintético embutido. |
| **Implementação Real vs. Facade** | CONFORME | Algoritmos e APIs descritos com modelagem matemática real (Gauss, Viète, Pointer Events, buffers circulares). |
| **Bypass de Tarefas** | CONFORME | Todo o trabalho foi construído sob medida para o Design System 2.0 do repositório, sem delegação a frameworks pesados. |
| **Autocertificação sem Verificação** | CONFORME | O autor referenciou os gargalos reais identificados no diagnóstico R1 e R2. |

---

## 3. Avaliação Detalhada das Especificações dos Componentes (R3)

### 3.1 `MatrixTensorEditor` (Editor & Visualizador de Matrizes e Tensores)
* **Avaliação Arquitetural**: O componente resolve com precisão o débito técnico de `matrizes.html` e `tensor_de_inercia.html`. A imposição de simetria ($I_{ij} = I_{ji}$) é um diferencial físico crucial para mecânica do corpo rígido.
* **Pontos Fortes**:
  - Contrato de opções flexível (`dimensions: 2 | 3`, `symmetric`, `editable`).
  - Suporte nativo à renderização de fórmulas matemáticas KaTeX para traço e determinante.
  - Estrutura de grid CSS limpa (`.matrix-grid-2x2` e `.matrix-grid-3x3`).
* **Vulnerabilidades & Desafios Técnicos Identificados**:
  1. *Autovalores Complexos em Matrizes Assimétricas*: A interface define `eigenvalues: number[]`. Para matrizes $2\times 2$ assimétricas com discriminante $\Delta = \text{tr}^2 - 4\det < 0$, ou matrizes $3\times 3$ gerais, os autovalores são números complexos ($\lambda = \alpha \pm i\beta$). A especificação não esclarece se o cálculo emite `NaN`, strings formatadas ou se a exibição de autovalores deve ser restrita a matrizes simétricas (`symmetric: true`).
  2. *Ergonomia Tátil no Mobile*: Em telas de 320px–360px, um grid $3\times 3$ com células de 60px de largura e ~32px de altura aproxima-se do limite mínimo de toque. Recomenda-se assegurar que o container possua `touch-action: manipulation;` e espaçamento que previna toque acidental na célula vizinha.

### 3.2 `MultiSeriesPlot` (Telemetria Multieixo & Espaço de Fase)
* **Avaliação Arquitetural**: Elimina com total sucesso a dependência de 200 KB do `Chart.js` em `gravidade.html`, substituindo-o por renderização direta em HTML5 Canvas 2D a 60 FPS com buffers circulares.
* **Pontos Fortes**:
  - Suporte a múltiplas curvas com cores, espessuras e estilos de linha configuráveis.
  - Auto-scaling amortecido no eixo Y.
  - Legenda interativa com botões de alternância de visibilidade por série.
* **Vulnerabilidades & Desafios Técnicos Identificados**:
  1. *Inconsistência da API no Modo 'phase'*: O método `pushPhasePoint(x: number, y: number)` não recebe um `seriesId`. Em um componente multissérie, se o usuário desejar plotar dois espaços de fase simultâneos (ex.: oscilador não linear vs. oscilador amortecido), não há como discriminar a série de destino. Deve-se ajustar a assinatura para `pushPhasePoint(seriesId: string, x: number, y: number)`.
  2. *Alocação de Heap no Loop de Animação (Garbage Collection)*: O exemplo de uso propõe `plotEnergia.push({ K, U, E })` a 60 FPS. Instanciar um novo objeto literal a cada frame ($3.600$ alocações/minuto) pode causar micropausas de coleta de lixo (GC jank) em smartphones modestos. Recomenda-se prover uma assinatura alternativa com array de valores ou objeto reusável.
  3. *Penalidade de Desempenho com `shadowBlur`*: O `RealtimePlot` atual em `sim-ui.js` utiliza `ctx.shadowBlur = 8`. Em gráficos multissérie em dispositivos móveis, filtros de sombra em canvas provocam rasterização via software na CPU, reduzindo drasticamente o frame rate. O `MultiSeriesPlot` deve evitar `shadowBlur` no mobile ou desativá-lo por padrão.

### 3.3 `Vector3DPicker` (Seletor Interativo de Vetores e Direções 3D)
* **Avaliação Arquitetural**: Componente excelente para orientação espacial em `tensor_de_inercia.html`, `drude.html` e `snell.html`, unificando a manipulação cartesiana e esférica.
* **Pontos Fortes**:
  - Suporte a presets rápidos ($X, Y, Z, -X, -Y, -Z$).
  - Sincronização entre representação cartesiana $(x,y,z)$ e ângulos esféricos $(\theta, \phi)$.
  - Mini-gimbal interativo de 80x80px tocável com o polegar.
* **Vulnerabilidades & Desafios Técnicos Identificados**:
  1. *Divisão por Zero no Vetor Nulo*: Quando `normalized: true`, se o usuário digitar $(0, 0, 0)$ nos campos cartesianos, a normalização $\vec{v}/\|\vec{v}\|$ gera `NaN`. É imperativo que a implementação trave a magnitude mínima ou aplique fallback seguro (ex.: $[0, 1, 0]$).
  2. *Convenção de Coordenadas Esféricas*: No Three.js o eixo vertical convencional é $+Y$, enquanto em física tradicional frequentemente adota-se $+Z$. A especificação deve documentar explicitamente a convenção adotada (se $\theta$ é o ângulo polar em relação a $+Y$ ou $+Z$).

### 3.4 `TouchCanvasController` (Controlador Unificado de Gestos e Toque)
* **Avaliação Arquitetural**: Componente mandatório que sana o problema sistêmico de scroll acidental nos canvas de 12 simulações, unificando a captura de ponteiros (Pointer Events) com suporte a pinça (pinch-zoom) e pan de dois dedos.
* **Pontos Fortes**:
  - Aplicação mandatória e automática de `touch-action: none !important;` e `user-select: none;`.
  - Captura robusta com `setPointerCapture` e liberação tratada com bloco `try/catch`.
  - Normalização geométrica automática das coordenadas relativas ao canvas com suporte a Retina DPR.
* **Vulnerabilidades & Desafios Técnicos Identificados**:
  1. *Métodos Declarados Omitidos na Implementação de Referência*: A interface TypeScript declara `getActivePointersCount(): number` e `setTouchAction(action: string): void`, porém ambos os métodos foram omitidos no código JavaScript demonstrativo da Seção 5.3.
  2. *Coexistência com Three.js `OrbitControls`*: Em simulações Three.js (`clima.html`, `tensor_de_inercia.html`, `atomo_de_hidrogenio.html`), o `OrbitControls` já anexa ouvintes de ponteiro no `renderer.domElement`. Se o `TouchCanvasController` for anexado ao mesmo elemento sem coordenação, haverá disputa pela captura de ponteiro (`setPointerCapture`). A documentação deve delimitar claramente que em cenas 3D o `TouchCanvasController` é voltado para interação com objetos específicos na cena (via raycasting), enquanto a câmera deve ser controlada por `OrbitControls` (já protegido pela regra CSS de `touch-action: none`).

---

## 4. Avaliação do Roadmap Faseado e Reintegração (R4)

### 4.1 Estrutura dos 4 Lotes e Dependências
A divisão dos 4 lotes é coerente, modular e minimiza os riscos de quebra sistêmica:
- **Lote 1 (Fundação)**: Ataca o CSS central e o `sim-ui.js`, corrigindo o bug crítico do Bottom Sheet ao recolher a barra em telas $\le 900\text{px}$ e aplicando a blindagem de `touch-action: none`.
- **Lote 2 (Analítica 2D)**: Recupera `quedalivre.html` e `fonons.html`, removendo dimensões estáticas e acoplando canvas fluido.
- **Lote 3 (Áudio & Telemetria)**: Migra `audio.html` para ES Modules e refatora `gravidade.html` eliminando `Chart.js` via `MultiSeriesPlot`.
- **Lote 4 (Álgebra & Tensores 3D)**: Implementa `MatrixTensorEditor` e `Vector3DPicker`, elimina `numeric.js` e estabiliza contextos WebGL.

### 4.2 Gaps de Sequenciamento Identificados
* **Lacuna no Agendamento do `TouchCanvasController`**: O Lote 2 prevê que `quedalivre.js` importará `TouchCanvasController` de `sim-ui.js`. No entanto, na lista de atividades do Lote 1, a implementação do `TouchCanvasController` não foi incluída explicitamente (enquanto `MultiSeriesPlot` foi agendado no Lote 3 e `MatrixTensorEditor` no Lote 4).
  - *Correção necessária*: O `TouchCanvasController` deve ser codificado e exportado em `sim-ui.js` logo no **Lote 1** (como parte da fundação tátil).

### 4.3 Reintegração das Simulações Órfãs no Hub (`index.html`)
* **Verificação de Fato**: Confirmou-se independentemente que `gravidade.html` e `tensor_de_inercia.html` existem em `simulacoes/`, mas estão 100% ausentes do grid `#cards` em `index.html`.
* **Conformidade dos Cards Propostos**:
  - Os cards apresentados na Seção 3 do Roadmap utilizam as classes `.card-link`, `.card`, `.card-tags` e atributos `data-categorias="fisica matematica"`.
  - A verificação de `script.js` (linhas 95–96) confirmou que a lógica de busca divide a string de categorias por espaço (`.split(' ')`) e verifica pertinência via `.includes(filtro)`. Logo, os cards propostos funcionarão de forma transparente e perfeita tanto no filtro "Física" quanto no filtro "Matemática".
  - O script de iluminação com mouse (`handleOnMouseMove`) interceptará os novos elementos estáticos sem necessidade de qualquer alteração adicional em `script.js`.

### 4.4 Limpeza de Código Morto (Housekeeping)
* Confirmou-se que `simulacoes/css/buttons.css` possui 0 bytes.
* Confirmou-se que `simulacoes/scripts/buttons.js` possui 20 linhas e não é importado por nenhuma simulação ativa.
* Confirmou-se que `simulacoes/css/base.css` possui 422 linhas e é importado apenas por simulações legadas (`quedalivre`, `fonons`, `gravidade`, `tensor_de_inercia`). Sua descontinuação após o Lote 4 é 100% segura e desejável.

---

## 5. Tabela Consolidada de Achados (Findings)

| ID | Severidade | Componente / Arquivo | Descrição do Problema | Ação Recomendada para a Fase de Implementação |
|---|---|---|---|---|
| **F-01** | **Major** | `PLUGIN_EXTENSION_SPECS.md` (CSS) | **Discrepância de Tokens CSS**: O CSS proposto usa `var(--transition-fast)` e `var(--radius-full)`, mas em `design-system.css` os tokens reais são `--trans-fast` e `--radius-pill`. | Substituir nos estilos dos novos componentes por `var(--trans-fast)` e `var(--radius-pill)`. |
| **F-02** | **Major** | `PHASED_MIGRATION_ROADMAP.md` (Lote 1/2) | **Sequenciamento de Dependência**: `quedalivre.js` no Lote 2 depende de `TouchCanvasController`, mas sua criação não consta nas atividades do Lote 1. | Mover a implementação de `TouchCanvasController` em `sim-ui.js` para o Lote 1. |
| **F-03** | **Major** | `PLUGIN_EXTENSION_SPECS.md` (TouchCtrl) | **Omissão de Métodos na Implementação**: `getActivePointersCount()` e `setTouchAction()` estão na interface TS, mas ausentes na classe JS (Seção 5.3). | Adicionar a implementação trivial desses dois métodos em `TouchCanvasController`. |
| **F-04** | **Minor** | `PLUGIN_EXTENSION_SPECS.md` (MultiPlot) | **Assinatura Incompleta no Modo 'phase'**: `pushPhasePoint(x, y)` não possui parâmetro de série, impossibilitando múltiplos diagramas de fase. | Atualizar para `pushPhasePoint(seriesId: string, x: number, y: number)`. |
| **F-05** | **Minor** | `PLUGIN_EXTENSION_SPECS.md` (MatrixEditor) | **Autovalores Complexos**: A interface define `eigenvalues: number[]`, que falha conceitualmente se o discriminante for negativo em matrizes não simétricas. | Documentar que `showEigenvalues` é restrito a matrizes simétricas ou retornar objeto com parte real e imaginária. |
| **F-06** | **Minor** | `PLUGIN_EXTENSION_SPECS.md` (VectorPicker) | **Vetor Nulo no Modo Normalizado**: Digitar $(0,0,0)$ gera divisão por zero (`NaN`) na normalização. | Aplicar trava com fallback para vetor unitário padrão (ex.: $[0, 1, 0]$). |
| **F-07** | **Minor** | `PLUGIN_EXTENSION_SPECS.md` (MultiPlot) | **Alocação Contínua de Objetos a 60 FPS**: O exemplo `push({ K, U, E })` causa alocação no heap a cada frame de animação. | Suportar sobrecarga `pushValues(seriesArray)` para evitar instanciar novos objetos a cada tick. |
| **F-08** | **Minor** | `PLUGIN_EXTENSION_SPECS.md` (TouchCtrl) | **Conflito Potencial com OrbitControls**: O uso concomitante no mesmo canvas sem isolamento pode causar disputa de eventos de ponteiro. | Documentar diretriz de uso: `OrbitControls` para câmera orbital geral vs. `TouchCanvasController` para canvas 2D ou objetos selecionados. |

---

## 6. Avaliação Adversarial & Testes de Estresse (Critic Dimension)

### Desafio 1: Estresse sob Resoluções Extremas de Smartphones (320px – iPhone SE)
* **Cenário**: O usuário abre `tensor_de_inercia.html` em tela de 320px de largura com a gaveta Bottom Sheet no estado `half`.
* **Análise de Quebra**: A gaveta abriga o `MatrixTensorEditor` $3\times 3$ (largura mínima calculada de ~250px) e o `Vector3DPicker` (largura mínima de ~260px). Em 320px, descontando o padding lateral do painel ($2 \times 12\text{px} = 24\text{px}$), restam 296px de largura disponível.
* **Resultado**: Os componentes cabem dentro do viewport, mas com margem estreita (~20px de folga). O uso de `box-sizing: border-box` e `width: 100%` com grids centrados é mandatório para evitar scrollbar horizontal interna.
* **Mitigação Aprovada**: Garantir que as classes `.sim-matrix-card` e `.sim-vector-picker` possuam `max-width: 100%;` e `overflow-x: hidden;`.

### Desafio 2: Perda de Contexto WebGL por Concorrência de Renderers
* **Cenário**: Em dispositivos Android de entrada com limite restrito de contextos WebGL simultâneos (frequentemente apenas 8 a 16 contextos em todo o navegador), o `tensor_de_inercia.html` atual instancia 2 WebGLRenderers distintos.
* **Análise de Quebra**: A navegação entre abas ou o redimensionamento da janela dispara perda de contexto WebGL (`webglcontextlost`), travando a renderização 3D.
* **Resultado do Roadmap**: A recomendação do Lote 4 de unificar o elipsoide de Poinsot na cena principal ou utilizar scissor viewport em um único renderer resolve de forma definitiva e elegante esse vetor crítico de falha.

### Desafio 3: Transbordamento Numérico no Solver Trigonométrico de Viète
* **Cenário**: Diagonalização de matriz simétrica $3\times 3$ com autovalores degenerados (ex.: matriz identidade $I_{xx}=I_{yy}=I_{zz}$, onde o discriminante da equação cúbica $q^3 - r^2 \to 0$).
* **Análise de Quebra**: No método de Viète, calcula-se $\theta = \frac{1}{3}\arccos(R / \sqrt{Q^3})$. Se pequenos erros de precisão de ponto flutuante levarem a $R / \sqrt{Q^3} > 1.0$ (ex.: $1.0000000000000002$), `Math.acos()` retorna `NaN`.
* **Mitigação Recomendada**: O algoritmo analítico a ser escrito em `sim-ui.js` deve clampar estritamente o argumento do arco-cosseno no intervalo $[-1, 1]$ via `Math.min(1, Math.max(-1, arg))`.

---

## 7. Reivindicações Verificadas (Verified Claims)

1. **Reivindicação**: *`buttons.css` é um arquivo inerte de 0 bytes.*  
   → **Verificação**: Inspecionado via `view_file` em `simulacoes/css/buttons.css` → **Confirmado (0 bytes, 1 linha vazia)**.
2. **Reivindicação**: *`buttons.js` é um script legado de 20 linhas não importado.*  
   → **Verificação**: Inspecionado via `view_file` em `simulacoes/scripts/buttons.js` → **Confirmado (20 linhas, manipula elemento inexistente)**.
3. **Reivindicação**: *`base.css` possui 422 linhas e é utilizado pelas simulações legadas.*  
   → **Verificação**: Inspecionado via `view_file` em `simulacoes/css/base.css` → **Confirmado (422 linhas exatas)**.
4. **Reivindicação**: *`gravidade.html` carrega `Chart.js` via CDN e `base.css`.*  
   → **Verificação**: Inspecionado via `view_file` em `simulacoes/gravidade.html` (linhas 20 e 22) → **Confirmado**.
5. **Reivindicação**: *`tensor_de_inercia.html` carrega `numeric.js` via CDN e Three.js 0.158 desatualizado.*  
   → **Verificação**: Inspecionado via `view_file` em `simulacoes/tensor_de_inercia.html` (linhas 204 e 210) → **Confirmado**.
6. **Reivindicação**: *`gravidade.html` e `tensor_de_inercia.html` estão ausentes de `index.html`.*  
   → **Verificação**: Inspecionado o container `#cards` em `index.html` (linhas 263–396) → **Confirmado (ambas estão ausentes)**.

---

## 8. Conclusão da Revisão

Os documentos `PLUGIN_EXTENSION_SPECS.md` e `PHASED_MIGRATION_ROADMAP.md` constituem uma base técnica sólida, completa e madura para a evolução do ecossistema `simulacoes-lab`. 

A aprovação formal é concedida, cabendo aos agentes implementadores das fases subsequentes observar rigorosamente os 8 apontamentos técnicos (F-01 a F-08) consolidados neste relatório.
