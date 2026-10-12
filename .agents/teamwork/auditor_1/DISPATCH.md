# Task Assignment — Forensic Auditor 1 (Integrity Verification)

## Identity
- Archetype: teamwork_preview_auditor
- Working directory: c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\auditor_1\

## Context & Inputs
- Path to User Request: c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\ORIGINAL_REQUEST.md (READ THIS FIRST)
- Worker Deliverables:
  - Compliance Matrix: c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\worker_synthesis_1\AUDIT_COMPLIANCE_MATRIX.md
  - Mobile Usability Assessment: c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\worker_synthesis_1\MOBILE_USABILITY_ASSESSMENT.md
  - Plugin Specs: c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\worker_synthesis_1\PLUGIN_EXTENSION_SPECS.md
  - Roadmap: c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\worker_synthesis_1\PHASED_MIGRATION_ROADMAP.md
- Repository Codebase: `simulacoes/`, `assets/`, `index.html`

## Objectives
Perform forensic integrity verification:
1. Verify ABSOLUTE RULE: "NENHUMA alteração ou modificação em arquivos de código em simulacoes/ deve ser feita nesta etapa. Apenas relatórios, matrizes e especificações devem ser gerados."
   - Check `git status` / working tree to prove that 0 files in `simulacoes/`, `assets/`, etc., were modified, added, or deleted.
2. Verify Authenticity of Audit Findings:
   - Verify that data points, line numbers, CSS selectors, JS function names, and citations in the deliverables are genuine and reflect actual code, not hallucinated or fabricated placeholders.
   - Verify that the deliverables are complete (covering all 14 files, all R1-R4 requirements, detailed specifications with code signatures).
3. Issue a formal forensic verdict: CLEAN or INTEGRITY VIOLATION / CHEATING DETECTED.

Write your report to:
`c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\auditor_1\audit_report.md`
Also update `progress.md` and produce `handoff.md`.
Send a message when completed.


## 2026-10-12T19:57:48Z
From: c92eacfc-95db-497e-8dc1-41c76d86ec02
Priority: MESSAGE_PRIORITY_HIGH

You are Forensic Auditor 1 (Integrity Auditor).
Your working directory is: c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\auditor_1\
Read your task assignment in: c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\auditor_1\DISPATCH.md
MANDATORY: Read the original user request first at c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\ORIGINAL_REQUEST.md

CRITICAL CONSTRAINT: You are in READ-ONLY mode. DO NOT modify any code in simulacoes/ or anywhere in the repo.

OBJECTIVE:
Perform forensic integrity verification on the entire project and the deliverables in c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\worker_synthesis_1\:
1. Check repository integrity: Run git status / inspection to confirm ZERO code modifications in simulacoes/, assets/, or repository files.
2. Check authenticity: Ensure all citations, line numbers, CSS rules, and JavaScript functions cited in the deliverables correspond to actual code in the repo and are not fabricated or dummy.
3. Check completeness: Ensure all 14 simulations are audited and all 4 core requirements (R1, R2, R3, R4) are fully addressed.

Produce your audit report at:
c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\auditor_1\audit_report.md
Include a clear verdict: CLEAN or INTEGRITY VIOLATION.
Also write handoff.md and update progress.md. When done, send a message to parent orchestrator.
