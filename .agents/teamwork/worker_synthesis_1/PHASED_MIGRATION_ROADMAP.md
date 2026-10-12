# R4: Roadmap Faseado de Migração e Modernização do Laboratório de Simulações

**Data de Emissão:** 12 de Outubro de 2026  
**Autor:** Worker Synthesis 1 (Technical Documentation and Synthesis Worker)  
**Escopo:** Plano de Ação Estruturado em 4 Lotes para a Modernização de 100% das Simulações Legadas e Parciais  
**Padrão Alvo:** Design System 2.0 (`.agents/plugins/simulacoes-lab/rules/AGENTS.md`)  
**Modo de Operação:** Planejamento Executável Sem Alteração de Código-Fonte nesta Fase  

---

## 1. Visão Geral Estratégica do Roadmap

Com base no diagnóstico minucioso da Matriz de Conformidade (R1), na Avaliação de Usabilidade Móvel (R2) e nas Especificações Técnicas das Novas Extensões do Plugin (R3), estabeleceu-se um plano de migração estruturado em **4 lotes lógicos e sequenciais**.

A ordem de execução foi projetada para:
1. **Minimizar Riscos**: Estabelecer primeiro a fundação compartilhada (`design-system.css` e `sim-ui.js`) para que todas as simulações subsequentes herdem correções de acessibilidade e toque instantaneamente.
2. **Escalar Complexidade**: Iniciar por simulações analíticas 2D de baixa dependência antes de avançar para Web Audio API, Web Workers e tensores tridimensionais com WebGL.
3. **Garantir Integridade e Reintegração**: Incluir a reincorporação formal das simulações órfãs (`gravidade.html` e `tensor_de_inercia.html`) no portal `index.html` e a remoção segura de código morto.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   PIPELINE DE MIGRAÇÃO EM 4 LOTES                      │
├───────────────────┬────────────────────────────────────────────────────┤
│ Lote 1: Fundação  │ Blindagem global de touch-action, correção de bugs │
│ & Quick Wins      │ do Bottom Sheet e ajustes nas 4 simulações DS 2.0. │
├───────────────────┼────────────────────────────────────────────────────┤
│ Lote 2: Analítica │ Modernização de quedalivre.html e fonons.html:     │
│ 2D Simples        │ canvas fluido, pointer events e controles DS 2.0.  │
├───────────────────┼────────────────────────────────────────────────────┤
│ Lote 3: Áudio &   │ Modernização de audio.html e gravidade.html:       │
│ Telemetria        │ Web Audio em ES Module, remoção do Chart.js CDN.   │
├───────────────────┼────────────────────────────────────────────────────┤
│ Lote 4: Álgebra   │ Modernização de matrizes.html e tensor_inercia:    │
│ & Tensores 3D     │ MatrixTensorEditor, Vector3DPicker, remoção numeric│
└───────────────────┴────────────────────────────────────────────────────┘
```

---

## 2. Cronograma Detalhado dos 4 Lotes de Migração

---

### Lote 1: Fundação, Correções Globais e Alinhamento de Parciais (Quick Wins)
* **Objetivo**: Sanar todas as causas-raiz sistêmicas no CSS central e na biblioteca controladora, elevando imediatamente as 4 simulações parcialmente conformes (`atomo_de_hidrogenio`, `clima`, `estacionarias2d`, `movimento`) e as 4 simulações de referência (`drude`, `particulas`, `snell`, `ui_lab`) a 100% de prontidão móvel.
* **Complexidade**: Baixa–Média.
* **Estimativa de Esforço**: ~12 a 16 horas de engenharia.
* **Arquivos Alvo**:
  - `simulacoes/css/design-system.css`
  - `simulacoes/scripts/sim-ui.js`
  - `simulacoes/css/clima.css`, `drude.css`, `particulas.css`, `snell.css`
  - `simulacoes/atomo_de_hidrogenio.html` (slider de densidade de pontos)
  - `simulacoes/movimento.html` (conversão para `.sim-dual-slider`)

#### 1. Atividades Técnicas do Lote 1:
1. **Blindagem Global de Touch-Action**:
   Adicionar no `design-system.css`:
   ```css
   .canvas-area,
   .canvas-area canvas,
   #three-container,
   #three-container canvas,
   .sim-layout canvas {
       touch-action: none !important;
       -webkit-touch-callout: none;
       user-select: none;
   }
   ```
2. **Correção do Bug de Desaparecimento do Bottom Sheet**:
   - Atualizar `initSidebarCollapse()` em `sim-ui.js` para abortar se `window.innerWidth <= 900`.
   - No CSS mobile, ocultar `.btn-collapse-sidebar` da `.tab-nav` para eliminar cliques acidentais.
3. **Ergonomia dos Sliders e Alça (WCAG 44px)**:
   - Elevar a altura de `.sheet-drag-handle` de 16px para 40px com padding ergonômico.
   - Definir `::-webkit-slider-thumb` e `::-moz-range-thumb` com 24x24px.
   - Expandir seletores de paleta `.toolbar-dot` no mobile de 14px para 22px.
4. **Contenção Universal de Transbordamento para KaTeX Display**:
   Aplicar `overflow-x: auto !important;` na classe global `.katex-display`.
5. **Alinhamento dos Sliders em `atomo_de_hidrogenio.html` e `movimento.html`**:
   - Substituir o range slider manual de amostragem quântica de hidrogênio por `.sim-dual-slider` sincronizado via `syncDualSlider`.
   - Substituir `.clean-slider-item` em `movimento.html` por `.sim-dual-slider` com inputs numéricos editáveis.

#### Critérios de Aceite do Lote 1:
- [ ] O gesto de órbita 3D em `clima.html` e `ui_lab.html` não dispara rolagem vertical da página em smartphones.
- [ ] Clicar no botão de recolher ou pressionar 'F' em telas $\le 900\text{px}$ não torna o Bottom Sheet invisível.
- [ ] Todas as equações de teoria em `particulas.html` e `movimento.html` possuem rolagem horizontal suave sem cortar textos ou criar barra de rolagem na janela inteira.
- [ ] Todos os sliders possuem cursors táteis visíveis de 24px no WebKit e no Firefox.

---

### Lote 2: Simulações Analíticas 2D Simples (`quedalivre.html` e `fonons.html`)
* **Objetivo**: Resgatar duas simulações completamente quebradas com dimensões fixas no HTML (`600x600` e `900x600`), migrando-as de `base.css` para o esqueleto padrão do Design System 2.0 com canvas fluido e suporte a toque.
* **Complexidade**: Média.
* **Estimativa de Esforço**: ~16 a 20 horas de engenharia.
* **Arquivos Alvo**:
  - `simulacoes/quedalivre.html`, `scripts/quedalivre.js`, `css/quedalivre.css`
  - `simulacoes/fonons.html`, `scripts/fonons.js`, `css/fonons.css`

#### 1. Atividades Técnicas do Lote 2:
1. **Refatoração Estrutural de `quedalivre.html`**:
   - Substituir a estrutura legada por `<main class="sim-layout">`, `.sim-header`, `.canvas-area` e `<aside class="controls-panel">` com Bottom Sheet.
   - Remover atributos estáticos `width="600" height="600"` do canvas e implementar redimensionamento automático via `ResizeObserver`.
   - Adicionar parâmetros físicos interativos ausentes:
     - Gravidade $g \in [1, 25]\,\text{m/s}^2$ com `.sim-dual-slider`.
     - Coeficiente de Restituição $e \in [0, 1]$ com `.sim-dual-slider`.
     - Coeficiente de Arrasto / Resistência do Ar $b \in [0, 0.5]$ com `.sim-dual-slider`.
   - Adicionar `.sim-transport-bar` com Play/Pause e botão de Reset.
   - Migrar `quedalivre.js` para ES Module importando `sim-ui.js` e `TouchCanvasController` para permitir agarrar e arremessar a bola com o dedo.
   - Adicionar cartão `.sim-plot-card` de telemetria de Energia Mecânica $E(t) = K(t) + U(t)$ usando `RealtimePlot`.
2. **Refatoração Estrutural de `fonons.html`**:
   - Remover `width="900" height="600"` estático do canvas.
   - Corrigir a função de coordenadas relativas recalculando a escala proporcional (`canvas.width / rect.width`), eliminando o erro de toque de 2,5x.
   - Migrar os sliders brutos para `.sim-dual-slider` com `syncDualSlider` (Constante Elástica $K$, Massa Atômica $M$, Frequência da Fonte $\omega$, Amortecimento $\gamma$).
   - Substituir botões avulsos `#btn-pause` e `#btn-reset` por `.sim-transport-bar` e `initToggleButton`.
   - Adicionar aba "Teoria" com a dedução KaTeX da relação de dispersão acústica e óptica:
     $$\omega(k) = 2 \sqrt{\frac{K}{M}} \left| \sin\left(\frac{ka}{2}\right) \right|$$
   - Adicionar `inlineSVGImages()` e ícones nativos de `assets/icons/` (`wave-sine.svg`, `refresh.svg`, `play.svg`).

#### Critérios de Aceite do Lote 2:
- [ ] O canvas de queda livre e o de fônons se ajustam fluidamente a qualquer resolução de tela (de 320px a 4K) sem scroll horizontal.
- [ ] A esfera em queda livre pode ser agarrada, puxada e arremessada com o dedo em telas sensíveis ao toque.
- [ ] Perturbações na rede de fônons ocorrem exatamente na posição em que o dedo toca a tela.
- [ ] `base.css` é completamente desvinculado de ambos os arquivos, adotando `design-system.css`.

---

### Lote 3: Áudio Avançado e Telemetria Multieixo (`audio.html` e `gravidade.html`)
* **Objetivo**: Modernizar o laboratório de som e a simulação de gravidade orbital, eliminando dependências externas pesadas (`Chart.js`) e resolvendo problemas severos de layout móvel (Picture-in-Picture e breakpoints incorretos de tablet).
* **Complexidade**: Média–Alta.
* **Estimativa de Esforço**: ~20 a 26 horas de engenharia.
* **Arquivos Alvo**:
  - `simulacoes/audio.html`, `scripts/audio.js`, `css/audio.css`
  - `simulacoes/gravidade.html`, `scripts/gravidade.js`, `css/gravidade.css`
  - Nova inclusão: `simulacoes/scripts/sim-ui.js` (implementação do `MultiSeriesPlot`)

#### 1. Atividades Técnicas do Lote 3:
1. **Implementação do Novo Componente `MultiSeriesPlot`**:
   - Codificar a classe `MultiSeriesPlot` dentro de `sim-ui.js` conforme especificação R3.
   - Suportar buffer circular multicanal com gradientes e legendas interativas em Canvas 2D puro.
2. **Refatoração Completa de `gravidade.html`**:
   - **Eliminar Dependência de `Chart.js`**: Remover `<script src="https://cdn.jsdelivr.net/npm/chart.js">` do cabeçalho HTML e instanciar `MultiSeriesPlot` para plotar as curvas de Energia Cinética $K$, Energia Potencial $U$ e Energia Total $E = K + U$ com 60 FPS estáveis.
   - **Correção do Breakpoint de Tablet**: Corrigir `gravidade.css` substituindo o breakpoint rígido de 768px por `@media (max-width: 900px)`, eliminando o esmagamento lateral de 180px no painel de iPads.
   - Adicionar `.sim-transport-bar` com controle de velocidade orbital (1x, 2x, 5x).
   - Adicionar `.sim-dual-slider` para Massa do Corpo Central $M$, Massa do Satélite $m$, e Velocidade Inicial $v_0$.
   - Adicionar Bottom Sheet com abas de Órbitas e Teoria (Leis de Kepler e Potencial Efetivo $V_{\text{eff}}(r)$).
3. **Refatoração Completa de `audio.html`**:
   - Migrar `audio.js` para ES Module (`<script type="module">`).
   - Adotar o layout `.sim-layout` do Design System 2.0 com Bottom Sheet inferior.
   - **Redimensionamento Inteligente do Picture-in-Picture (PiP)**:
     - No mobile, limitar a miniatura do osciloscópio/FFT a um máximo de `140x90px` ancorada no canto inferior direito, ou permitir alternância de visualização em abas/pílulas sem cobrir o canvas principal.
   - Ativar as etapas pendentes de física acústica (geração de ondas senoidais, ruído branco, harmônicos e batimentos com dois osciladores acoplados).
   - Adicionar ícones nativos de `assets/icons/` (`sound.svg`, `microphone.svg`, `wave-sine.svg`).

#### Critérios de Aceite do Lote 3:
- [ ] `Chart.js` é 100% removido de `gravidade.html`, com telemetria de conservação de energia renderizada de forma nativa e leve por `MultiSeriesPlot`.
- [ ] Em tablets de 768px a 900px, `gravidade.html` utiliza Bottom Sheet funcional sem colapsar os gráficos.
- [ ] Em `audio.html`, a janela PiP não oculta o espectrograma FFT em telas compactas de 360px.
- [ ] `base.css` é desvinculado de ambos os arquivos.

---

### Lote 4: Álgebra Linear, Tensores e Física Especializada 3D (`matrizes.html` e `tensor_de_inercia.html`)
* **Objetivo**: Integrar os novos componentes de física especializada (`MatrixTensorEditor` e `Vector3DPicker`), modernizar a álgebra tensorial, eliminar a biblioteca obsoleta `numeric.js` e estabilizar o consumo de memória GPU em dispositivos móveis.
* **Complexidade**: Alta.
* **Estimativa de Esforço**: ~28 a 34 horas de engenharia.
* **Arquivos Alvo**:
  - `simulacoes/matrizes.html`, `scripts/matrizes.js`, `css/matrizes.css`
  - `simulacoes/tensor_de_inercia.html`, `scripts/tensor_de_inercia.js`, `css/tensor_de_inercia.css`
  - Nova inclusão: `simulacoes/scripts/sim-ui.js` (`MatrixTensorEditor` e `Vector3DPicker`)

#### 1. Atividades Técnicas do Lote 4:
1. **Implementação de `MatrixTensorEditor` e `Vector3DPicker`**:
   - Codificar as classes no `sim-ui.js` e respectivos estilos em `design-system.css` de acordo com as especificações formais de R3.
2. **Refatoração Completa de `matrizes.html`**:
   - Substituir o grid manual `.matrix-box` pela extensão `MatrixTensorEditor` ($2\times 2$).
   - Migrar a manipulação dos vetores da base $\hat{i}$ e $\hat{j}$ no canvas cartesiano para `TouchCanvasController`, permitindo arrastar os vetores diretamente com o dedo no smartphone.
   - Adotar o layout `.sim-layout` com Bottom Sheet inferior e aba de Teoria com deduções formais de transformação de base, determinante como fator de escala de área e autovetores.
3. **Refatoração Completa de `tensor_de_inercia.html`**:
   - **Atualização do Three.js**: Atualizar o importmap de 0.158 para a versão padrão **0.165.0**.
   - **Eliminação de `numeric.js`**: Substituir a biblioteca externa por um solver analítico exato em JavaScript puro para autovalores e autovetores de matriz simétrica real $3\times 3$ baseado no método trigonométrico de Viète para raízes cúbicas (reduzindo 200 KB de carga de rede).
   - **Unificação do Contexto WebGL (Prevenção de GPU Crash)**: Em vez de manter dois WebGLRenderers separados disputando memória de GPU no mobile, integrar o Elipsoide de Inércia de Poinsot na própria cena 3D principal (ou em um único contexto WebGL com renderização por viewports via `renderer.setScissor`).
   - Integrar `MatrixTensorEditor` ($3\times 3$ com simetria forçada $I_{ij} = I_{ji}$) e `Vector3DPicker` para seleção do eixo de rotação $\hat{n}$.
   - Remover o badge de instrução com `white-space: nowrap` de 440px que transborda no mobile.

#### Critérios de Aceite do Lote 4:
- [ ] O arrasto dos vetores de base em `matrizes.html` funciona com perfeição tanto por mouse quanto por toque em celulares.
- [ ] `tensor_de_inercia.html` roda com um único renderer WebGL moderno (Three.js 0.165), sem `numeric.js` e sem perda de contexto WebGL no mobile.
- [ ] A edição de componentes simétricas do tensor de inércia atualiza em tempo real o elipsoide 3D e os momentos principais de inércia.
- [ ] Ambas as simulações utilizam estritamente `design-system.css` e módulos ES6.

---

## 3. Estratégia de Reintegração das Simulações Órfãs no Hub (`index.html`)

Atualmente, `gravidade.html` e `tensor_de_inercia.html` estão ausentes de `index.html`. Para restabelecer 100% de integridade pedagógica e permitir que estudantes e professores acessem essas ferramentas a partir do portal, definem-se os seguintes cards padronizados para inclusão em `index.html` (dentro da div `#cards`):

### 3.1 Card para `gravidade.html`
```html
<a href='simulacoes/gravidade.html' class="card-link" data-categorias="fisica matematica">
    <div class="card">
        <div class="card-tags">
            <span class="card-tag tag-fisica">Física</span>
            <span class="card-tag tag-matematica">Matemática</span>
        </div>
        <h1>Movimento Planetário & Gravitação</h1>
        <p>Explore a mecânica celeste newtoniana, órbitas elípticas de Kepler, conservação de momento angular e telemetria em tempo real de energia mecânica.</p>
    </div>
</a>
```

### 3.2 Card para `tensor_de_inercia.html`
```html
<a href='simulacoes/tensor_de_inercia.html' class="card-link" data-categorias="fisica matematica">
    <div class="card">
        <div class="card-tags">
            <span class="card-tag tag-fisica">Física</span>
            <span class="card-tag tag-matematica">Matemática</span>
        </div>
        <h1>Tensor de Inércia & Rotação 3D</h1>
        <p>Visualização interativa tridimensional do tensor de inércia, rotação de corpos rígidos no espaço, diagonalização e elipsoide de Poinsot.</p>
    </div>
</a>
```

---

## 4. Plano de Limpeza e Eliminação de Código Obsoleto (Housekeeping)

Após a conclusão da migração dos 4 lotes, todos os arquivos HTML estarão operando sobre `design-system.css` e ES Modules. Será então executado o seguinte procedimento de faxina arquitetural:

1. **Remoção de Arquivos Mortos**:
   - Excluir `simulacoes/css/buttons.css` (arquivo inerte de 0 bytes).
   - Excluir `simulacoes/scripts/buttons.js` (script legado de 20 linhas não importado).
2. **Descontinuação de `css/base.css`**:
   - Como nenhuma das 14 simulações dependerá mais de `base.css`, o arquivo pode ser arquivado ou removido com total segurança, eliminando 422 linhas de CSS legado e evitando divergências visuais futuras.

---

## 5. Matriz de Riscos, Dependências e Estratégia de Rollback

| Risco Técnico Identificado | Impacto | Probabilidade | Estratégia de Mitigação | Procedimento de Rollback |
|---|---|---|---|---|
| **Conflito de Layout em Telas Antigas (< 360px)** | Médio | Baixa | Utilizar `flex-wrap: wrap;` e unidades relativas `rem`/`dvh` nos cards de parâmetros | Reverter regra de padding e manter min-width do viewport |
| **Queda de Performance em WebGL Móvel** | Alto | Média | Limitar `devicePixelRatio` a um teto de 2.0 e fundir múltiplos renderers em um único loop | Reduzir contagem de partículas ou taxa de amostragem |
| **Erros de Arredondamento no Solver Cúbico 3x3** | Médio | Baixa | Validar rotina matemática contra suite de testes numéricos de matrizes hermitianas/simétricas | Manter fallback provisório para script isolado |
| **Divergência de Áudio em Safari iOS** | Alto | Média | Desbloquear `AudioContext` explicitamente no primeiro evento de toque do usuário (`touchend`) | Exibir prompt pedindo interação do usuário para áudio |

---

## 6. Quadro Geral de Esforço e Recursos

```
┌────────────────────────────────────────────────────────────────────────┐
│                   RESUMO EXECUTIVO DO CRONOGRAMA                       │
├─────────┬────────────────────────────┬─────────────┬───────────────────┤
│ Lote    │ Escopo Principal           │ Esforço Est.│ Dependências      │
├─────────┼────────────────────────────┼─────────────┼───────────────────┤
│ Lote 1  │ Fundação, CSS, sim-ui.js   │ 12–16 horas │ Nenhuma           │
│ Lote 2  │ Queda Livre & Fônons       │ 16–20 horas │ Lote 1 concluído  │
│ Lote 3  │ Áudio & Gravidade (Multi)  │ 20–26 horas │ Lote 1 concluído  │
│ Lote 4  │ Matrizes & Tensor Inércia  │ 28–34 horas │ Lotes 1, 2 e 3    │
├─────────┼────────────────────────────┼─────────────┼───────────────────┤
│ TOTAL   │ 14 Simulações Modernizadas │ 76–96 horas │ Migração Completa │
└─────────┴────────────────────────────┴─────────────┴───────────────────┘
```

---
*Fim do Relatório R4 — Roadmap Faseado de Migração e Modernização.*
