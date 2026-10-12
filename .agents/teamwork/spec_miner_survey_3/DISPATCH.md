# Task Assignment — Spec Miner 3 (Design System 2.0 & Plugin Specifications Mining)

## Identity
- Archetype: teamwork_preview_spec_miner
- Working directory: c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\spec_miner_survey_3\

## Context & Inputs
- Path to User Request: c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\ORIGINAL_REQUEST.md (READ THIS FIRST)
- Plugin Rules: c:\Users\nicol\Documents\GitHub\Site\.agents\plugins\simulacoes-lab\rules\AGENTS.md
- Plugin Skill: c:\Users\nicol\Documents\GitHub\Site\.agents\plugins\simulacoes-lab\skills\desenvolver-simulacao\SKILL.md
- Design System CSS: c:\Users\nicol\Documents\GitHub\Site\simulacoes\css\design-system.css
- UI Library: c:\Users\nicol\Documents\GitHub\Site\simulacoes\scripts\sim-ui.js
- Assets & Icons: c:\Users\nicol\Documents\GitHub\Site\assets\icons\

## Objectives
1. Deeply mine the Design System 2.0 standard and plugin rules:
   - Extract the full checklist of compliance criteria (HTML head, CSS links, JS modules, importmap, sim-ui.js controllers, CSS tokens, KaTeX, icons, focus mode, bottom sheet, touch-action).
   - Document the API contracts of `sim-ui.js` (`syncDualSlider`, `initToggleButton`, `initBottomSheet`, `initSidebarCollapse`, `RealtimePlot`, `initModal`, etc.).
   - Analyze the current design system CSS and identify what components already exist vs what is missing.
2. Mine the plugin architecture (`.agents/plugins/simulacoes-lab/`) to identify structural gaps:
   - What components/utilities are currently missing in `sim-ui.js` and `design-system.css`?
   - What specialized needs do the existing simulations have that the plugin doesn't yet support? (e.g., matrix/tensor inputs, vector/field visualizers, phase portraits, multi-axis telemetry, touch gesture manipulators).
3. Formulate the precise criteria for classifying a simulation as "Totalmente Conforme (DS 2.0)", "Parcialmente Conforme", or "Legada".

## Deliverable
Write your complete report to:
`c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\spec_miner_survey_3\spec_mining_report.md`
Also produce `handoff.md` and keep `progress.md` updated.


## 2026-10-12T19:34:37Z
You are Spec Miner 3 (Design System 2.0 & Plugin Specifications Miner).
Your working directory is: c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\spec_miner_survey_3\
Read your task assignment in: c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\spec_miner_survey_3\DISPATCH.md
MANDATORY: Read the original user request first at c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\ORIGINAL_REQUEST.md

CRITICAL CONSTRAINT: You are in READ-ONLY specification mining mode. DO NOT modify or create any code files in simulacoes/ or anywhere else in the repository. You may ONLY write your notes and reports inside your working directory (.agents/teamwork/spec_miner_survey_3/).

OBJECTIVE:
1. Thoroughly mine the rules, skills, and design system contracts in:
   - c:\Users\nicol\Documents\GitHub\Site\.agents\plugins\simulacoes-lab\rules\AGENTS.md
   - c:\Users\nicol\Documents\GitHub\Site\.agents\plugins\simulacoes-lab\skills\desenvolver-simulacao\SKILL.md
   - c:\Users\nicol\Documents\GitHub\Site\simulacoes\css\design-system.css
   - c:\Users\nicol\Documents\GitHub\Site\simulacoes\scripts\sim-ui.js
   - c:\Users\nicol\Documents\GitHub\Site\assets\icons\
2. Extract the authoritative 100% compliance criteria for Design System 2.0. Define explicit definitions for:
   - Totalmente Conforme (DS 2.0)
   - Parcialmente Conforme
   - Legada
3. Map all components currently in sim-ui.js and design-system.css, and identify architectural gaps:
   - What UI elements or interaction patterns are needed by the simulations that the plugin doesn't yet support?
   - Focus on R3 requirements: Mobile portability & ergonomics, Specialized physics components (matrices, inertia tensors, vector/field pickers), Advanced telemetry & multi-axis real-time graphing / phase diagrams.
4. Propose technical API signatures and design specifications for at least 3 new extensions/components for the plugin.

Produce your detailed report at:
c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\spec_miner_survey_3\spec_mining_report.md
Also update your progress.md and write handoff.md.
When finished, send a message to parent reporting completion and summary.
