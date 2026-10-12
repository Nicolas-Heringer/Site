# Original User Request

## 2026-10-12T19:32:09Z

Auditar exaustivamente todas as simulações em `simulacoes/` contra os padrões do plugin `.agents/plugins/simulacoes-lab/`, classificar a conformidade técnica com ênfase crítica na usabilidade móvel e responsividade, mapear lacunas estruturais no plugin e produzir um plano de ação executável para a modernização do código legado (sem modificar arquivos de código nesta fase).

Working directory: c:\Users\nicol\Documents\GitHub\Site
Integrity mode: development

## Requirements

### R1. Diagnóstico e Matriz de Conformidade Técnica
Auditar individualmente cada uma das 15+ simulações em `simulacoes/*.html` (e respectivos `.js` e `.css`) frente aos padrões do Design System 2.0 e às regras definidas em `.agents/plugins/simulacoes-lab/rules/AGENTS.md`. Classificar cada simulação como Totalmente Conforme (DS 2.0), Parcialmente Conforme ou Legada, catalogando todos os débitos técnicos (uso de `sim-ui.js`, tokens CSS, importmap Three.js e KaTeX).

### R2. Avaliação Aprofundada de Usabilidade Móvel e Controles Táteis
Avaliar rigorosamente a prontidão de cada simulação para smartphones e tablets (telas <= 900px). Verificar a implementação ou ausência de Bottom Sheet (`sheet-drag-handle`, `initBottomSheet`), prevenção de scroll acidental em canvas (`touch-action: none;`), ergonomia de sliders em telas táteis e legibilidade de equações KaTeX.

### R3. Mapeamento de Gaps e Especificações de Expansão do Plugin
Com base nas peculiaridades das simulações existentes, formular propostas de melhoria e novos componentes para o plugin `simulacoes-lab`. As propostas devem priorizar:
1. **Portabilidade e Ergonomia Mobile**: padrões e componentes de UI otimizados para toque.
2. **Componentes para Física Especializada**: manipulação de matrizes e tensores (como em `matrizes.html` e `tensor_de_inercia.html`) e seletores de vetores/campos.
3. **Telemetria e Gráficos Avançados**: gráficos com múltiplos eixos ou diagramas de fase em tempo real.

### R4. Roadmap Faseado de Migração
Produzir um plano de ação priorizado para migração de todas as simulações legadas, agrupadas em lotes coerentes por complexidade (ex.: simulações analíticas 2D simples vs. simulações 3D Three.js vs. simulações com Web Workers como `clima.html` e `snell.html`). O relatório deve orientar as fases de implementação futuras sem alterar o código nesta rodada.

## Acceptance Criteria

### Matriz de Auditoria
- [ ] Tabela consolidada cobrindo todas as simulações do diretório `simulacoes/` com classificação de status, dependências e lista de débitos técnicos.
- [ ] Diagnóstico detalhado de conformidade com o Design System 2.0 para cada arquivo.

### Análise de Prontidão Mobile
- [ ] Diagnóstico explícito do suporte mobile de cada simulação, identificando quais falham em telas menores que 900px ou carecem de bottom sheet e `touch-action: none;`.

### Especificações para o Plugin
- [ ] Relatório com especificações técnicas e assinaturas de API recomendadas para pelo menos 3 novos componentes/extensões do plugin `simulacoes-lab`.

### Plano de Ação e Roadmap
- [ ] Roadmap estruturado em lotes de migração com critérios claros de prioridade, complexidade estimada e dependências entre arquivos.
- [ ] Nenhuma alteração destrutiva ou modificação de arquivos de código em `simulacoes/` é realizada nesta etapa de planejamento.
