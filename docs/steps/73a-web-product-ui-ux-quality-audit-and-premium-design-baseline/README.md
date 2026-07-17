# Phase 73A - Web Product UI/UX Quality Audit And Premium Design Baseline

## Goal

Review the complete browser product as one football-management experience before
adding another section or starting another visual rework.

This phase is evidence-first and audit-only. It must establish:

1. which browser screens, states, routes, and commands exist today;
2. whether the main career journeys are clear, efficient, and enjoyable;
3. whether information hierarchy supports manager decisions instead of exposing
   implementation details;
4. whether the current visual system is coherent enough to feel like one premium
   product;
5. whether responsive, keyboard, focus, motion, loading, empty, and error states
   satisfy the current accessibility contract;
6. whether the frontend presentation architecture can support consistent future
   sections without accumulating CSS and component debt;
7. which findings require immediate remediation and which are healthy future
   scope;
8. exactly one evidence-backed next phase.

## User-facing reason

The web slice now contains enough real product to judge the whole experience:
app entry, shell, Dashboard, Posta, match preparation, tactical board, staged
matchday, save lifecycle, autosave cadence, and command feedback.

Continuing section by section without a shared quality baseline risks producing
screens that work independently but feel inconsistent, noisy, or slow as a
game. Premium quality does not mean adding decoration. It means that the
manager always understands:

- where they are;
- what matters now;
- what can be acted on;
- what happened after the action;
- how to return to the career rhythm without unnecessary clicks.

## Phase position

This is an intentionally interposed audit phase between completed Phase 73 and
the already-roadmapped Phase 74.

- Phase 73 remains complete.
- Phase 74 remains reserved as `Player Generation And Model Consolidation
  Cleanup`.
- Phase 73A must not silently renumber or replace Phase 74.
- The final evidence may recommend one bounded UI/UX remediation phase before
  Phase 74, or recommend returning directly to Phase 74.

## Locked audit-only contract

No production behavior or browser presentation is changed in this phase.

Allowed work:

- read source, tests, architecture, reports, roadmaps, and Graphify output;
- run the existing application and deterministic career fixtures;
- inspect browser behavior with Playwright and Chromium;
- capture temporary desktop, wide, narrow, zoom, keyboard, and reduced-motion
  evidence;
- measure source size, selector ownership, duplicate patterns, click counts,
  overflow, and interaction states;
- write audit, baseline, scorecard, and remediation documents;
- refine the next step document when evidence changes a future assumption.

Forbidden work:

- no React, TypeScript, CSS, SVG, translation, runtime, engine, storage, or test
  implementation changes;
- no quick visual fixes while collecting evidence;
- no new component library, dependency, design token, route, state store, or
  abstraction;
- no deletion based only on line count or subjective dislike;
- no screenshot mockup presented as implemented behavior.

## Surfaces in scope

The inventory must include every currently reachable production surface and its
meaningful states:

- app entry: no career, available career, preferences, loading, and recovery;
- global career shell: navigation, club/date context, Posta rail, Continue,
  manual save, dirty state, command activity, and exit protection;
- Dashboard: initial attention, match-ready state, post-match state, and empty
  summaries;
- Posta: rail, filters, list, detail, read, acknowledged, resolved, blocking,
  important, informational, narrow back flow, and date transition;
- match preparation: context, tactical board, candidate menus, substitutes,
  squad list, player detail, tactic choice, validation, save, and match entry;
- matchday: pre-match, first-half live, half-time decisions, second-half live,
  full-time review, substitutions, ratings, event hierarchy, consequences, and
  return to Dashboard;
- shared dialogs and feedback: loading, disabled, focus, error, empty, save,
  unsaved-exit, and reduced-motion behavior.

Disabled future navigation labels are inventoried as shell affordances, but
their unimplemented screens are not scored as current product surfaces.

## Product quality lenses

Every surface and journey is reviewed through the same lenses:

1. **Purpose and decision clarity** - one clear screen purpose and one dominant
   next action when an action is required.
2. **Information hierarchy** - football facts appear before technical or
   secondary detail, with no avoidable duplication.
3. **Flow economy** - clicks, route changes, confirmations, and interruptions
   correspond to real manager decisions.
4. **Interaction feedback** - hover, focus, active, disabled, loading, success,
   empty, and error states are intentional and consistent.
5. **Visual coherence** - typography, spacing, density, surfaces, borders,
   controls, iconography, and motion belong to one restrained retro-premium
   football product.
6. **Accessibility and resilience** - WCAG 2.2 AA target, keyboard access,
   visible focus, reduced motion, text zoom, stable layouts, and no essential
   hover-only behavior.
7. **Football identity and fun** - the interface supports anticipation,
   consequence, squad understanding, and career stories rather than resembling
   a generic SaaS dashboard.
8. **Maintainability** - visual ownership is traceable, reusable primitives are
   justified by real use, and future sections can extend the system without
   copying large CSS or screen branches.

## Pixel-perfect evidence contract

`Pixel perfect` is treated as a repeatable quality contract, not a subjective
claim. The audit must verify at minimum:

- stable layout at `1440x900`, `1920x1080`, and `390x844`;
- no horizontal page overflow at supported widths;
- no clipped labels, overlapping regions, unreachable actions, or unexpected
  layout shift during command feedback;
- readable first useful viewport and deliberate vertical density;
- consistent alignment and spacing from the current token scale;
- explicit typography roles and controlled line lengths;
- one coherent control language across buttons, links, tabs, filters, menus,
  tables, and dialogs;
- complete hover, focus-visible, active, disabled, loading, empty, error, and
  selected states where relevant;
- keyboard completion of every primary journey;
- usable text at `200%` zoom and immediate reduced-motion behavior;
- screenshot evidence whose viewport, state, seed/save fixture, and inspection
  result are recorded.

The tactical board remains the approved visual anchor. It is reviewed for
integration, readability, accessibility, and consistency, but this audit must
not propose replacing its pitch asset or core interaction model without a
separate product decision.

## Severity and scoring contract

Findings use player-facing severity:

- `P0`: blocks, corrupts, traps, hides, or makes a primary journey unusable;
- `P1`: materially harms understanding, trust, accessibility, efficiency, or
  premium product coherence;
- `P2`: visible polish or maintainability weakness that should be scheduled but
  does not invalidate the current journey;
- `Monitor`: plausible concern lacking enough evidence for a change.

Each current surface receives a `1-5` score for the eight quality lenses. A
score is diagnostic, never the goal. Findings must explain the user-facing
impact before proposing a code or visual remedy. The audit must not inflate
scores merely to declare the product ready.

## Evidence rules

- Use deterministic seeds, save fixtures, dates, and routes wherever possible.
- Record whether evidence came from source inspection, automated assertion,
  screenshot inspection, keyboard walkthrough, or manual product judgment.
- Store temporary screenshots under a phase-specific `/tmp` directory and
  record their absolute paths in the audit documents; do not commit generated
  screenshot noise unless a later explicit decision requires baselines in Git.
- Do not treat an existing Playwright assertion as proof of visual quality
  without inspecting the rendered result.
- Do not treat file size as proof of poor architecture. Large files and CSS
  ownership are investigation signals that require coupling and caller
  evidence.
- Distinguish current defects from future feature absence. Missing market,
  contract, finance, youth, or staff workflows are roadmap scope, not UI bugs.

## Ordered steps

1. [01-current-web-surface-and-state-inventory.md](01-current-web-surface-and-state-inventory.md)
2. [02-critical-journey-and-action-economy-audit.md](02-critical-journey-and-action-economy-audit.md)
3. [03-information-architecture-and-content-hierarchy-audit.md](03-information-architecture-and-content-hierarchy-audit.md)
4. [04-premium-visual-system-and-component-language-audit.md](04-premium-visual-system-and-component-language-audit.md)
5. [05-accessibility-responsive-and-interaction-state-audit.md](05-accessibility-responsive-and-interaction-state-audit.md)
6. [06-frontend-presentation-architecture-and-css-maintainability-audit.md](06-frontend-presentation-architecture-and-css-maintainability-audit.md)
7. [07-playwright-visual-baseline-and-pixel-perfect-scorecard.md](07-playwright-visual-baseline-and-pixel-perfect-scorecard.md)
8. [08-consolidated-findings-remediation-map-and-next-phase-decision.md](08-consolidated-findings-remediation-map-and-next-phase-decision.md)

## Phase-level checks

- Every in-scope production surface and meaningful state appears in the
  inventory and final scorecard.
- Every P0/P1 finding has reproducible evidence, user impact, ownership, and a
  bounded remediation direction.
- Every recommended remediation maps to an existing current workflow; future
  systems are not scaffolded.
- Temporary Playwright evidence covers desktop, wide, narrow, keyboard, `200%`
  text zoom, and reduced motion where applicable.
- Existing relevant visual QA suites are run and their limitations documented.
- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test`
- `pnpm --filter @game/web run build`
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`
- `graphify update .` is not required when only documentation changes; if any
  source changes occur unexpectedly, stop because the phase scope was broken.

Run `nvm use 24` before project commands.

## What NOT to implement in this phase

- No visual rework, CSS cleanup, component extraction, or route rewrite.
- No new product feature or career workflow.
- No change to tactical-board behavior or `campo-calcio.svg`.
- No theme expansion or replacement palette.
- No new UI library, table library, icon package, animation package, or design
  system dependency.
- No deletion of disabled future navigation merely because its destination is
  not implemented.
- No implementation backlog disguised as audit prose without evidence,
  severity, owner, and user-facing reason.
- No recommendation to rewrite the whole web app unless the evidence proves a
  bounded migration cannot solve the identified problems.

## Definition of Done

- The complete current web product has one traceable surface/state inventory.
- Critical career journeys have measured click, interruption, feedback, and
  keyboard paths.
- Every screen has a documented purpose, first-viewport hierarchy, dominant
  action, and removable or deferred information.
- The current visual system has a concrete token, typography, spacing, control,
  table, dialog, icon, and motion assessment.
- Responsive, accessibility, loading, empty, error, and reduced-motion states
  have browser evidence.
- Frontend component and CSS ownership risks are mapped without speculative
  refactoring.
- One cross-screen scorecard and one prioritized remediation map exist.
- Tactical board preservation and future workflow boundaries are explicit.
- No production source or dependency changed during the phase.
- `pnpm check` passes.
- The final report recommends exactly one next phase and does not implement it.
