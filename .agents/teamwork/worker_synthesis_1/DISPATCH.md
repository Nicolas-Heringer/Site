# Task Assignment — Worker Synthesis 1 (Technical Reports & Specifications Writer)

## Identity
- Archetype: teamwork_preview_worker
- Working directory: c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\worker_synthesis_1\

## Context & Inputs
- Path to User Request: c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\ORIGINAL_REQUEST.md (READ THIS FIRST)
- Master Project Scope: c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\orchestrator\PROJECT.md
- Explorer 1 Report (Inventory): c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\explorer_survey_1\survey_inventory_report.md
- Explorer 2 Report (Mobile & Touch): c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\explorer_survey_2\survey_mobile_report.md
- Spec Miner 3 Report (DS 2.0 & Components): c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\spec_miner_survey_3\spec_mining_report.md

## Mandatory Constraints
- DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
- READ-ONLY ON REPOSITORY CODE: You MUST NOT modify, edit, or delete any source code files in `simulacoes/` or anywhere else in the repository. All your deliverables are comprehensive documentation, matrices, and specifications written inside your working directory (`c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\worker_synthesis_1\`).

## Objectives & Deliverables
Produce the following 4 comprehensive technical documents in your working directory:

1. `c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\worker_synthesis_1\AUDIT_COMPLIANCE_MATRIX.md` (Fulfilling R1):
   - Exhaustive audit table covering all 14 simulations in `simulacoes/*.html`.
   - Classification: Totalmente Conforme (DS 2.0), Parcialmente Conforme, Legada.
   - Catalog of technical debts: CSS (`design-system.css` vs `base.css` vs custom), JS architecture (ES Modules vs classic script, inline scripts, web workers), `sim-ui.js` controllers used vs missing, Three.js importmap compliance, KaTeX auto-render, icon compliance (`assets/icons/*.svg`), status in `index.html` hub (linked vs orphaned).
   - Individual technical diagnosis sheet for each of the 14 simulations.

2. `c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\worker_synthesis_1\MOBILE_USABILITY_ASSESSMENT.md` (Fulfilling R2):
   - Deep mobile readiness diagnostic for screens <= 900px (smartphones and tablets).
   - Analysis of Bottom Sheet implementation (`sheet-drag-handle`, `initBottomSheet`) and the critical bug where `initSidebarCollapse` makes the panel vanish permanently on mobile.
   - Analysis of accidental scroll prevention (`touch-action: none;` on canvas and 3D containers), detailing which simulations fail.
   - Analysis of mouse-only event traps (`quedalivre`, `fonons`, `matrizes`, `particulas`, `snell`).
   - Touch ergonomics: slider thumb size, hit targets (< 44px vs WCAG standards).
   - KaTeX equation readability and horizontal overflow clipping in theory modals.

3. `c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\worker_synthesis_1\PLUGIN_EXTENSION_SPECS.md` (Fulfilling R3):
   - Formal technical specifications and recommended API signatures for at least 3 (preferably 4) new extensions for `.agents/plugins/simulacoes-lab/`:
     a. `MatrixTensorEditor`: interactive 2D matrix ($2\times 2$) and 3D inertia tensor ($3\times 3$) editor with symmetry constraints and live determinant calculation.
     b. `MultiSeriesPlot`: telemetry component supporting multiple simultaneous time series (kinetic, potential, total energy) and phase portrait diagrams $(x, p)$, replacing external `Chart.js`.
     c. `Vector3DPicker`: interactive 3D vector and axis selector with spherical coordinates $(\theta, \phi)$ and touch drag controls.
     d. `TouchCanvasController`: unified pointer/gesture controller ensuring `touch-action: none;` and touch orbit/pan virtual controls.
   - For each component: motivation, complete TypeScript / JSDoc API contract, HTML template, CSS classes and tokens, and integration example.

4. `c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\worker_synthesis_1\PHASED_MIGRATION_ROADMAP.md` (Fulfilling R4):
   - Structured migration plan organized in 4 coherent batches by complexity:
     - Batch 1: Quick Wins & Foundation (CSS & sim-ui.js fixes, global touch-action, sidebar collapse mobile bug, partial DS 2.0 alignments).
     - Batch 2: Simple 2D Simulations (quedalivre.html, fonons.html - converting to flex/DS2, removing fixed canvas sizes, adding pointer events).
     - Batch 3: Advanced Audio & Multi-series Telemetry (audio.html, gravidade.html - integrating Web Audio + MultiSeriesPlot).
     - Batch 4: Specialized Physics & 3D Tensors (matrizes.html, tensor_de_inercia.html - integrating MatrixTensorEditor & Vector3DPicker).
   - Dependencies, estimated effort, risks, and verification criteria for each batch.
   - Strategy for reintegrating orphaned simulations into `index.html`.

Also generate `handoff.md` and keep `progress.md` updated.
Send a message to parent orchestrator when completed.


## 2026-10-12T19:48:15Z
[Message from parent c92eacfc-95db-497e-8dc1-41c76d86ec02]
You are Worker Synthesis 1 (Technical Documentation and Synthesis Worker).
Your working directory is: c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\worker_synthesis_1\
Read your task assignment in: c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\worker_synthesis_1\DISPATCH.md
MANDATORY: Read the original user request first at c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\ORIGINAL_REQUEST.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

CRITICAL CONSTRAINT: You are in READ-ONLY mode regarding the codebase. You MUST NOT modify, edit, or delete any source code files in simulacoes/ or anywhere else in the repository. All your deliverables are comprehensive documentation, matrices, and specifications written inside your working directory (.agents/teamwork/worker_synthesis_1/).

OBJECTIVES:
Synthesize the findings from:
- c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\explorer_survey_1\survey_inventory_report.md
- c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\explorer_survey_2\survey_mobile_report.md
- c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\spec_miner_survey_3\spec_mining_report.md

Write the following 4 exhaustive technical deliverables in your directory:
1. AUDIT_COMPLIANCE_MATRIX.md (Fulfilling R1: Complete compliance table of all 14 simulations, individual diagnosis sheets, technical debts cataloged).
2. MOBILE_USABILITY_ASSESSMENT.md (Fulfilling R2: Deep mobile diagnosis, touch-action analysis, bottom sheet & sidebar collapse bug, pointer events traps, WCAG touch target audit, KaTeX overflow analysis).
3. PLUGIN_EXTENSION_SPECS.md (Fulfilling R3: Rigorous technical specifications with TypeScript/JSDoc API signatures, HTML templates, CSS classes and tokens for MatrixTensorEditor, MultiSeriesPlot, Vector3DPicker, and TouchCanvasController).
4. PHASED_MIGRATION_ROADMAP.md (Fulfilling R4: Actionable 4-batch migration plan with complexity ratings, dependencies, risks, effort estimates, and orphaned simulation reintegration).

Also produce handoff.md and update progress.md.
When completed, send a message to parent orchestrator.
