# Handoff Report — Explorer 1 (Simulation Inventory & Technical Stack)

## 1. Observation
1. **Contagem e Mapeamento de Arquivos em `simulacoes/`**:
   - `simulacoes/` contém exatamente 14 arquivos `.html`: `atomo_de_hidrogenio.html`, `audio.html`, `clima.html`, `drude.html`, `estacionarias2d.html`, `fonons.html`, `gravidade.html`, `matrizes.html`, `movimento.html`, `particulas.html`, `quedalivre.html`, `snell.html`, `tensor_de_inercia.html`, `ui_lab.html`.
   - `simulacoes/scripts/` contém 18 arquivos `.js`: 14 scripts correspondentes às simulações, 2 Web Workers (`clima.worker.js`, `snell.worker.js`), a biblioteca de componentes `sim-ui.js` (611 linhas) e 1 script legado isolado `buttons.js`.
   - `simulacoes/css/` contém 16 arquivos `.css`: 12 folhas específicas de simulações, `design-system.css` (2.193 linhas, 55.7 KB), `base.css` (422 linhas, 10.1 KB), `buttons.css` (0 bytes) e a folha mestre.
   - `assets/icons/` contém 66 arquivos de ícones SVG.
2. **Adoção do CSS**:
   - 8 simulações incluem `<link rel="stylesheet" href="css/design-system.css">`: `atomo_de_hidrogenio.html:20`, `clima.html:20`, `drude.html:20`, `estacionarias2d.html:20`, `movimento.html:20`, `particulas.html:20`, `snell.html:20`, `ui_lab.html:16`.
   - 6 simulações incluem `<link rel="stylesheet" href="css/base.css">`: `audio.html:20`, `fonons.html:20`, `gravidade.html:20`, `matrizes.html:20`, `quedalivre.html:20`, `tensor_de_inercia.html:19`.
3. **Módulos JS e Integração com `sim-ui.js`**:
   - 8 scripts importam de `./sim-ui.js`: `atomo_de_hidrogenio.js:15`, `clima.js:9`, `drude.js:16`, `estacionarias2d.js:15`, `movimento.js:15`, `particulas.js:17`, `snell.js:16`, `ui_lab.js:21`.
   - 1 script é ES Module via importmap Three.js, mas não usa `sim-ui.js`: `tensor_de_inercia.js:7-9` com `<script type="module" src="scripts/tensor_de_inercia.js">` em `tensor_de_inercia.html:215`.
   - 5 simulações utilizam scripts clássicos: `audio.html:171`, `fonons.html:93`, `gravidade.html:79`, `matrizes.html:170`, `quedalivre.html:61`.
4. **Web Workers**:
   - `clima.js:1159`: `worker = new Worker('scripts/clima.worker.js?v=2.2');` processa relaxamento de Lloyd e malha esférica de Voronoi.
   - `snell.js:688`: `worker = new Worker('scripts/snell.worker.js?v=' + Date.now());` processa mapas de índice $n(x,y)$ e gradiente $\nabla n$.
5. **Dependências Externas**:
   - `gravidade.html:22`: `<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>` carrega Chart.js para gráficos de energia cinética e potencial.
   - `tensor_de_inercia.html:204`: `<script src="https://cdnjs.cloudflare.com/ajax/libs/numeric/1.2.6/numeric.min.js"></script>` carrega numeric.js para diagonalização de autovalores.
   - Todas as 14 simulações incluem KaTeX 0.16.11 via CDN (`katex.min.css`, `katex.min.js`, `auto-render.min.js`).
   - Four simulações utilizam Three.js via importmap: `atomo_de_hidrogenio.html:41`, `clima.html:33`, `ui_lab.html:36` (v0.165.0) e `tensor_de_inercia.html:210` (v0.158.0).
6. **Usabilidade Mobile & Toque**:
   - `touch-action: none;` é aplicado explicitamente em canvas apenas em: `css/atomo_de_hidrogenio.css:12` e `css/movimento.css:14`. Está ausente em todas as outras 12 simulações.
   - Alça de bottom sheet `.sheet-drag-handle` e `initBottomSheet` estão presentes em 8 simulações (`atomo_de_hidrogenio`, `clima`, `drude`, `estacionarias2d`, `movimento`, `particulas`, `snell`, `ui_lab`) e ausentes em 6 simulações.
   - Dimensões rígidas: `fonons.html:50` (`<canvas id="myCanvas" width="900" height="600"></canvas>`) e `quedalivre.html:49` (`<canvas id="simulacao" width="600" height="600"></canvas>`).
7. **Simulações Órfãs no Hub**:
   - O portal `index.html:263-396` referencia 12 simulações nos cartões.
   - `gravidade.html` e `tensor_de_inercia.html` não constam na lista de cartões de `index.html`.

## 2. Logic Chain
1. A partir da observação de que 6 simulações (`audio`, `fonons`, `gravidade`, `matrizes`, `quedalivre`, `tensor_de_inercia`) utilizam `css/base.css` em vez de `css/design-system.css`, não importam `sim-ui.js`, e carecem de `.sheet-drag-handle`, infere-se que este grupo pertence à arquitetura legada (DS 1.0 ou código ad-hoc pré-padronização), exigindo refatoração de layout e componentes.
2. A partir da observação de que `drude`, `particulas`, `snell` e `ui_lab` implementam simultaneamente `css/design-system.css`, `initToggleButton`, `syncDualSlider`, `initBottomSheet` e `inlineSVGImages`, infere-se que constituem o padrão de ouro de conformidade com o Design System 2.0.
3. A partir da observação de que `atomo_de_hidrogenio`, `clima`, `estacionarias2d` e `movimento` adotam `design-system.css`, ES modules e `initBottomSheet`, mas possuem pequenas variações (ausência de dual sliders numéricos ou ausência de transport bar unificada), infere-se que são simulações em conformidade parcial, necessitando apenas de alinhamentos pontuais.
4. A partir da busca global por `touch-action: none;`, constata-se que ela só existe em `css/atomo_de_hidrogenio.css` e `css/movimento.css`. Como as outras 12 simulações (incluindo Three.js 3D como `clima` e simulações com interação por ponteiro como `particulas`, `drude`, `matrizes`, `snell`) não possuem essa regra no canvas, o navegador interpreta gestos de arraste/órbita como intenção de scroll da página em telas táteis (<= 900px), quebrando a usabilidade móvel.
5. A partir da observação de dependências pesadas (`Chart.js` em `gravidade.html` e `numeric.js` em `tensor_de_inercia.html`), infere-se uma lacuna no plugin `simulacoes-lab`: o componente `RealtimePlot` ainda não atende casos de gráficos multicanais de `gravidade.html`, e falta um componente nativo de manipulação/diagonalização tensorial para substituir `numeric.js`.
6. A partir da inspeção do `index.html`, conclui-se que `gravidade.html` e `tensor_de_inercia.html` foram deixadas de fora do grid de navegação, devendo ser reintegradas após a modernização.

## 3. Caveats
- O teste de execução em runtime real foi restrito à análise estática profunda de código fonte (read-only), inspecionando scripts, estilos, importmaps e conexões assíncronas de Workers.
- A simulação `audio.html` depende de permissão de microfone pelo usuário (`navigator.mediaDevices.getUserMedia`), portanto a validação do pipeline de áudio em hardware real depende de permissão no navegador.
- Não foram alterados arquivos em `simulacoes/` nesta fase, em cumprimento estrito ao modo read-only de exploração.

## 4. Conclusion
O ecossistema contém 14 simulações estruturadas em dois grandes blocos: um bloco moderno de 8 simulações em Design System 2.0 (4 de referência e 4 híbridas) e um bloco legado de 6 simulações que demandam migração completa.
A principal falha transversal que afeta a usabilidade móvel em quase todas as simulações (12 de 14) é a falta da regra CSS `touch-action: none;` aplicada diretamente aos contêineres de canvas. Além disso, as simulações `matrizes.html` e `tensor_de_inercia.html` demonstram a necessidade de um componente de manipulação de tensores no plugin `simulacoes-lab`, e `gravidade.html` pode ter sua dependência externa de `Chart.js` eliminada pela expansão do `RealtimePlot`.

## 5. Verification Method
Para verificar de forma independente as observações e conclusões deste relatório:
1. **Contagem e Arquitetura de Arquivos**:
   - Executar busca por arquivos HTML em `simulacoes/`: `fd -e html simulacoes/` (deve retornar 14 arquivos).
   - Inspecionar inclusão de `design-system.css` vs `base.css`: `rg "design-system\.css" simulacoes/` (8 ocorrências em HTML) vs `rg "base\.css" simulacoes/` (6 ocorrências em HTML).
2. **Integração com `sim-ui.js`**:
   - `rg "from './sim-ui\.js'" simulacoes/scripts/` (deve retornar 8 arquivos JS).
3. **Prevenção de Toque (`touch-action`)**:
   - `rg "touch-action" simulacoes/` (deve retornar apenas `atomo_de_hidrogenio.css:12`, `movimento.css:14` e a alça interna em `design-system.css:2000`).
4. **Dependências Externas**:
   - `rg "chart\.js" simulacoes/` (encontrado em `gravidade.html:22`).
   - `rg "numeric" simulacoes/` (encontrado em `tensor_de_inercia.html:204`).
5. **Verificação de Simulações Órfãs**:
   - `rg "gravidade\.html" index.html` e `rg "tensor_de_inercia\.html" index.html` (ambos retornam zero resultados).
