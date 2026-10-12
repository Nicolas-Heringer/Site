# Project: Auditoria e Plano de Modernização do Laboratório de Simulações

## Architecture
- **Domínio**: Simulações científicas e matemáticas web (`simulacoes/`)
- **Padrão Alvo**: Design System 2.0 (`.agents/plugins/simulacoes-lab/rules/AGENTS.md`)
- **Modo**: Read-Only / Auditoria e Planejamento (Zero alterações em código-fonte de `simulacoes/`)

## Feature Inventory
| # | Requisito / Entregável | Descrição | Milestone | Fonte |
|---|------------------------|-----------|-----------|-------|
| 1 | Inventário e Classificação de Conformidade | Mapear todas as 14 simulações e classificar como Totalmente Conforme, Parcialmente Conforme ou Legada | M1 (R1) | ORIGINAL_REQUEST §R1 |
| 2 | Matriz Detalhada de Débitos Técnicos | Tabela consolidada com débitos de CSS, JS Modules, sim-ui.js, Three.js importmap e KaTeX | M1 (R1) | ORIGINAL_REQUEST §R1 |
| 3 | Diagnóstico de Usabilidade Mobile e Telas <= 900px | Avaliação crítica de Bottom Sheet, prevenção de scroll, alvos de toque e ergonomia | M2 (R2) | ORIGINAL_REQUEST §R2 |
| 4 | Diagnóstico de Overflow KaTeX e Conflitos de UI | Análise de equações em modais e conflito entre sidebar collapse e bottom sheet | M2 (R2) | ORIGINAL_REQUEST §R2 |
| 5 | Especificações Técnicas de Extensão do Plugin | Especificações completas com APIs TypeScript/JSDoc para 4 novos componentes | M3 (R3) | ORIGINAL_REQUEST §R3 |
| 6 | Roadmap Faseado de Migração | Plano de modernização priorizado em lotes com dependências, complexidade e riscos | M4 (R4) | ORIGINAL_REQUEST §R4 |
| 7 | Síntese Executiva e Verificação Forense | Relatório final unificado com garantia estrita de integridade e não-modificação de código | M5 | ORIGINAL_REQUEST |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M0 | Survey & File Mapping | Levantamento de 100% dos arquivos, componentes e regras | none | DONE |
| M1 | Technical Compliance Matrix (R1) | Matriz completa de conformidade e catálogo de débitos técnicos | M0 | DONE |
| M2 | Mobile Usability Assessment (R2) | Diagnóstico aprofundado de telas móveis, toque e KaTeX | M0 | DONE |
| M3 | Plugin Extension Specs (R3) | Especificações formais para MatrixTensorEditor, MultiSeriesPlot, etc. | M0 | DONE |
| M4 | Phased Migration Roadmap (R4) | Plano executável de migração em 4 lotes priorizados | M1, M2, M3 | DONE |
| M5 | Review, Audit & Consolidated Delivery | Verificação independente por revisores, challenger e auditor forense | M1-M4 | DONE |

## Code Layout
- `.agents/teamwork/orchestrator/`: Arquivos de coordenação, matrizes consolidadas e relatórios executivos.
- `.agents/teamwork/explorer_survey_1/`: Relatório de inventário e stack técnica.
- `.agents/teamwork/explorer_survey_2/`: Relatório de auditoria móvel e controles táteis.
- `.agents/teamwork/spec_miner_survey_3/`: Relatório de mineração de regras do DS 2.0 e especificações.
- `.agents/teamwork/worker_synthesis_1/`: Redação dos relatórios técnicos mestres e especificações executivas.
- `simulacoes/`: NÃO MODIFICAR (Read-only total).
