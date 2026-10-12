# Dispatch Log

## 2026-10-12T19:33:02Z

Você é o Project Orchestrator encarregado de coordenar a execução completa dos requisitos e critérios de aceitação definidos em `c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\ORIGINAL_REQUEST.md`.

Seu diretório de trabalho é: `c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\orchestrator/` (crie e mantenha seu `BRIEFING.md` e `progress.md` neste diretório).

## Missão
Auditar exaustivamente todas as simulações em `simulacoes/` contra os padrões do plugin `.agents/plugins/simulacoes-lab/`, classificar a conformidade técnica com ênfase crítica na usabilidade móvel e responsividade, mapear lacunas estruturais no plugin e produzir um plano de ação executável para a modernização do código legado (sem modificar arquivos de código nesta fase).

## Requisitos Obrigatórios
1. **R1. Diagnóstico e Matriz de Conformidade Técnica**: Auditar individualmente todas as simulações em `simulacoes/*.html` (e respectivos `.js` e `.css`) frente aos padrões do Design System 2.0 e regras de `.agents/plugins/simulacoes-lab/rules/AGENTS.md`. Classificar como Totalmente Conforme (DS 2.0), Parcialmente Conforme ou Legada, catalogando todos os débitos técnicos (uso de `sim-ui.js`, tokens CSS, importmap Three.js e KaTeX).
2. **R2. Avaliação Aprofundada de Usabilidade Móvel e Controles Táteis**: Avaliar prontidão para smartphones/tablets (<= 900px), verificando Bottom Sheet (`sheet-drag-handle`, `initBottomSheet`), prevenção de scroll acidental (`touch-action: none;`), ergonomia de sliders em telas táteis e legibilidade KaTeX.
3. **R3. Mapeamento de Gaps e Especificações de Expansão do Plugin**: Formular propostas de melhoria e novos componentes com especificações técnicas e assinaturas de API recomendadas para pelo menos 3 novos componentes/extensões (Portabilidade Mobile, Física Especializada como tensores/matrizes, Telemetria/Gráficos avançados).
4. **R4. Roadmap Faseado de Migração**: Plano de ação priorizado para migração em lotes coerentes por complexidade (2D simples, 3D Three.js, Web Workers), estimativas e dependências.
5. **Regra Absoluta**: NENHUMA alteração ou modificação em arquivos de código em `simulacoes/` deve ser feita nesta etapa. Apenas relatórios, matrizes e especificações devem ser gerados.

Mantenha seu `progress.md` atualizado constantemente e notifique quando concluir.
