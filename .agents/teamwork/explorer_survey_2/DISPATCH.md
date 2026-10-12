# Task Assignment — Explorer 2 (Mobile Readiness & Touch Usability Survey)

## Identity
- Archetype: teamwork_preview_explorer
- Working directory: c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\explorer_survey_2\

## Context & Inputs
- Path to User Request: c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\ORIGINAL_REQUEST.md (READ THIS FIRST)
- Simulations Directory: c:\Users\nicol\Documents\GitHub\Site\simulacoes\
- Design System CSS: c:\Users\nicol\Documents\GitHub\Site\simulacoes\css\design-system.css
- UI Library: c:\Users\nicol\Documents\GitHub\Site\simulacoes\scripts\sim-ui.js

## Objectives
1. Inspect every simulation in `simulacoes/*.html` specifically for mobile & touch readiness (screens <= 900px, phones, tablets):
   - Viewport meta tag configuration (`<meta name="viewport" content="...">`).
   - Bottom sheet implementation: `.sheet-drag-handle`, `.sim-controls-panel` bottom sheet behavior, call to `initBottomSheet()`.
   - Accidental scroll prevention on canvas: CSS `touch-action: none;` on canvas/container, or touch event prevention (`preventDefault` on touchstart/touchmove/gesture).
   - Sliders and interactive controls: thumb size, hit-target size (minimum 44x44px touch targets), dual slider touch ergonomics, touch support on custom canvas sliders or overlays.
   - KaTeX equation legibilidade on narrow screens: overflow-x handling, text sizing, wrapping or horizontal scrollbar on complex formulas.
   - Sidebar collapse / focus mode (`initSidebarCollapse`, `F` shortcut).
2. Detail exactly which simulations completely fail on screens <= 900px (e.g. controls overlapping canvas, unscrollable panels, broken layout, canvas stealing scroll or scrolling causing canvas jump).
3. Document mobile responsiveness issues and classify each simulation by mobile readiness level.

## Deliverable
Write your complete report to:
`c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\explorer_survey_2\survey_mobile_report.md`
Also produce `handoff.md` and keep `progress.md` updated.
Send a message when completed.


## 2026-10-12T19:34:37Z
Sender: c92eacfc-95db-497e-8dc1-41c76d86ec02
Content:
You are Explorer 2 (Mobile Readiness & Touch Usability Explorer).
Your working directory is: c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\explorer_survey_2\
Read your task assignment in: c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\explorer_survey_2\DISPATCH.md
MANDATORY: Read the original user request first at c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\ORIGINAL_REQUEST.md

CRITICAL CONSTRAINT: You are in READ-ONLY exploration mode. DO NOT modify or create any code files in simulacoes/ or anywhere else in the repository. You may ONLY write your notes and reports inside your working directory (.agents/teamwork/explorer_survey_2/).

OBJECTIVE:
Perform a deep and rigorous mobile & touch usability assessment across ALL simulations in c:\Users\nicol\Documents\GitHub\Site\simulacoes\ for screens <= 900px (smartphones and tablets):
1. Viewport meta tag configuration.
2. Bottom Sheet: presence of .sheet-drag-handle, .sim-controls-panel responsive behavior, calls to initBottomSheet().
3. Accidental scroll prevention: touch-action: none; on canvas/container, touchmove preventDefault.
4. Touch ergonomics: slider thumb dimensions, hit-target size (min 44x44px), dual-slider responsiveness on mobile, touch controls for 3D orbit/2D canvas.
5. KaTeX math readability: equation overflow, horizontal scroll or wrapping, font size on small screens.
6. Focus mode / sidebar collapse (initSidebarCollapse, 'F' shortcut).
7. Identify and list every simulation that completely breaks on mobile, detailing the exact failure mode (overlapping controls, unreachable buttons, canvas stealing scroll, broken layout).

Produce your detailed report at:
c:\Users\nicol\Documents\GitHub\Site\.agents\teamwork\explorer_survey_2\survey_mobile_report.md
Also update your progress.md and write handoff.md.
When finished, send a message to parent reporting completion and summary.
