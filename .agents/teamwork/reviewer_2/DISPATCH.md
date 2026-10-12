# Task Assignment — Reviewer 2 (Plugin Specs & Migration Roadmap Review)

## Identity
- Archetype: teamwork_preview_reviewer
- Working directory: c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\reviewer_2\

## Context & Inputs
- Path to User Request: c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\ORIGINAL_REQUEST.md (READ THIS FIRST)
- Worker Deliverables:
  - Plugin Extension Specs: c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\worker_synthesis_1\PLUGIN_EXTENSION_SPECS.md
  - Migration Roadmap: c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\worker_synthesis_1\PHASED_MIGRATION_ROADMAP.md
- Plugin Architecture:
  - Rules: c:\Users\nicol\Documents\GitHub\Site\.agents\plugins\simulacoes-lab\rules\AGENTS.md
  - UI Library: c:\Users\nicol\Documents\GitHub\Site\simulacoes\scripts\sim-ui.js
  - CSS: c:\Users\nicol\Documents\GitHub\Site\simulacoes\css\design-system.css

## Objectives
1. Objectively and adversarially review `PLUGIN_EXTENSION_SPECS.md`:
   - Are at least 3 new extensions specified with complete API signatures?
   - Do `MatrixTensorEditor`, `MultiSeriesPlot`, `Vector3DPicker`, and `TouchCanvasController` solve the exact architectural bottlenecks of the legacy cohort?
   - Are the TypeScript/JSDoc signatures, HTML structures, and CSS tokens sound and aligned with `sim-ui.js`?
2. Review `PHASED_MIGRATION_ROADMAP.md`:
   - Is the 4-batch structure logical and ordered by dependencies?
   - Are effort estimates, risk mitigations, and testing criteria realistic?
   - Is the reintegration plan for orphaned simulations (`gravidade.html`, `tensor_de_inercia.html`) in `index.html` clear and viable?
3. Issue a formal verdict: APPROVE or REQUEST_CHANGES, with detailed justification.

Write your review report to:
`c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\reviewer_2\review_report_2.md`
Also update `progress.md` and produce `handoff.md`.
Send a message when completed.


## 2026-10-12T19:57:47Z
[Message] timestamp=2026-10-12T19:57:47Z sender=c92eacfc-95db-497e-8dc1-41c76d86ec02 priority=MESSAGE_PRIORITY_HIGH content=You are Reviewer 2 (Plugin Specs & Migration Roadmap Reviewer).
Your working directory is: c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\reviewer_2\
Read your task assignment in: c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\reviewer_2\DISPATCH.md
MANDATORY: Read the original user request first at c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\ORIGINAL_REQUEST.md

CRITICAL CONSTRAINT: You are in READ-ONLY mode. DO NOT modify any code in simulacoes/ or anywhere in the repo.

OBJECTIVE:
Review the following deliverables produced by Worker Synthesis 1:
1. c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\worker_synthesis_1\PLUGIN_EXTENSION_SPECS.md
2. c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\worker_synthesis_1\PHASED_MIGRATION_ROADMAP.md

Evaluate them against the architectural requirements and constraints of simulacoes-lab.
Check:
- Are the 4 new component specifications (MatrixTensorEditor, MultiSeriesPlot, Vector3DPicker, TouchCanvasController) technically rigorous with realistic APIs, HTML templates, and CSS tokens?
- Is the 4-batch migration roadmap realistic, properly sequenced, with sound risk mitigations and orphan reintegration plan?

Produce your review report at:
c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\reviewer_2\review_report_2.md
Include a clear verdict: APPROVE or REQUEST_CHANGES.
Also write handoff.md and update progress.md. When done, send a message to parent orchestrator.
