# Phase 73B - Current Web Product Premium Remediation And Journey Hardening

## Status

Complete. All ten ordered steps and the phase-level gate pass.

## Goal

Resolve the evidence-backed P1 product-quality findings from Phase 73A without
rewriting the browser app, changing gameplay truth, or adding another career
system.

The phase turns the current functional MVP into a clearer, safer, more
accessible, and more coherent football-management product through ten ordered
browser-visible slices. Every slice must:

1. improve one current manager journey;
2. be independently testable in the real browser application;
3. preserve deterministic engine, persistence, and save behavior;
4. remove the code or presentation path it replaces in the same scope;
5. leave one explicit next step with no known local cleanup deferred silently.

## User-Facing Reason

The current web loop works, but Phase 73A measured avoidable friction and trust
problems:

- a complete preparation draft can disappear silently;
- Matchday asks for two clicks that reveal no manager decision;
- narrow screens place repeated chrome before the football task;
- raw IDs and backend fallback words leak into valid product states;
- operational pages use flattened panel and heading hierarchy;
- keyboard users cannot bypass repeated navigation and lose focus after screen
  transitions;
- one blocker color pair misses WCAG AA contrast;
- broad App and Matchday ownership makes visual improvement risky;
- there is no single executable current-product visual release gate.

This phase fixes those real problems. It does not chase a score or add
decoration for its own sake. The intended experience is a modern Football
Manager-style operational flow with a restrained retro skin: dense, serious,
football-specific, immediately readable, and responsive to every command.

## Phase Position

- Phase 73 and audit-only Phase 73A are complete.
- Phase 73B completed the only remediation recommended by the Phase 73A
  evidence.
- Phase 74 remains reserved as `Player Generation And Model Consolidation
  Cleanup` and is the single next recommendation.
- Phase 73B does not renumber, replace, or start Phase 74.
- No later career section starts until the Phase 73B exit gate passes.

## Authoritative Inputs

- `docs/audits/WEB_PRODUCT_UI_UX_QUALITY_AUDIT.md`
- `docs/audits/WEB_PIXEL_PERFECT_VISUAL_BASELINE_AND_SCORECARD.md`
- `docs/audits/WEB_CRITICAL_JOURNEY_AND_ACTION_ECONOMY_AUDIT.md`
- `docs/audits/WEB_INFORMATION_ARCHITECTURE_AND_CONTENT_HIERARCHY_AUDIT.md`
- `docs/audits/WEB_PREMIUM_VISUAL_SYSTEM_AND_COMPONENT_LANGUAGE_AUDIT.md`
- `docs/audits/WEB_ACCESSIBILITY_RESPONSIVE_AND_INTERACTION_STATE_AUDIT.md`
- `docs/audits/WEB_FRONTEND_PRESENTATION_ARCHITECTURE_AND_CSS_AUDIT.md`
- `docs/roadmaps/WEB_UI_UX_PREMIUM_REMEDIATION_MAP.md`

If a step discovers that an audit assumption is false, stop that step, record
the evidence in `docs/PROJECT_STATUS.md`, and refine only the next relevant step
document. Do not expand the active step opportunistically.

## Locked Product Contract

The following behavior must remain true throughout all ten steps:

- engine and domain emit structured, language-agnostic facts only;
- `@game/ui` remains the framework-free presentation-contract layer;
- SQLite WASM on OPFS remains the only browser career persistence path;
- one loaded `CareerSession` owns durable baseline, working state, dirty state,
  and manual/7-day/15-day save semantics;
- the typed command runner remains the only asynchronous mutation lock;
- Dashboard remains the operational home;
- Continue remains the calendar rhythm and stops only on canonical blocking or
  important attention;
- Posta remains current-season decision context and history, not a mandatory
  bureaucratic detour;
- one real workflow may be reached from Dashboard or explained by Posta;
- Matchday remains deterministic, checkpointed, refresh-safe, and centered on
  one real half-time decision;
- all visible copy remains localized in Italian, English, German, Spanish, and
  French with English fallback;
- reduced motion, command failure, storage recovery, dirty exit, and narrow
  behavior remain explicit.

## Tactical Board Preservation Contract

The tactical board is the approved football visual anchor. This phase must not:

- modify or replace `apps/web/src/assets/campo-calcio.svg`;
- move normalized board coordinates into pixel state;
- duplicate role or formation catalogs;
- change suitability calculation or candidate ordering;
- weaken drag clamp, pointer, touch, keyboard, context-menu, long-press, empty
  slot, goalkeeper, bench, or no-duplicate behavior;
- redesign player tokens, pitch markings, or board geometry as a side effect of
  surrounding layout work.

Board work is limited to preserving its current rendering while surrounding
screen hierarchy and Matchday phase ownership improve.

## Finding Coverage

| Finding | Owning step |
|---|---:|
| `Q-P1-01` preparation draft safety | 05 |
| `Q-P1-02` Matchday playback economy | 06-07 |
| `Q-P1-03` narrow task priority | 01, then every screen step |
| `Q-P1-04` technical content leaks | 03, 06-09 |
| `Q-P1-05` flattened hierarchy | 02-04, 08-10 |
| `Q-P1-06` missing bypass | 01 |
| `Q-P1-07` lost screen focus | 01 |
| `Q-P1-08` blocker contrast | 02 |
| `Q-P1-09` broad App composition | 03 |
| `Q-P1-10` concentrated Matchday owner | 06-09 |
| `Q-P1-11` missing canonical visual gate | 01, finalized in 10 |

P2 findings are resolved only inside the browser-visible step that owns their
real consumer. There is no invisible cleanup-only refactor between steps.

## Implementation Discipline

- Work on one step document at a time.
- Start each implementation shell with `nvm use 24`.
- Before editing, reproduce the exact current state named by the step.
- Keep the current deterministic career fixture and SQLite/OPFS path in the
  browser gate; do not substitute mock-only visual proof.
- Capture desktop `1440x900`, wide `1920x1080` when required, and narrow
  `390x844` screenshots under `/tmp/the-long-season-phase73b/step-XX/`.
- Inspect screenshots manually. A passing locator assertion is not visual QA.
- Verify keyboard, focus, 200% text, and reduced motion in the steps that touch
  those behaviors.
- Use existing semantic CSS ownership. Do not add a component framework or a
  second token system.
- Add an abstraction only when the active slice has multiple current callers or
  removes real repeated composition.
- Remove superseded branches, fields, selectors, tests, and documentation in
  the same step once replacement coverage is green.
- Update `docs/PROJECT_STATUS.md` and
  `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md` after every completed step.
- Run `graphify update .` after source changes.

## Ordered Steps

1. [01-current-visual-gate-task-first-shell-and-screen-focus.md](01-current-visual-gate-task-first-shell-and-screen-focus.md) - Done
2. [02-semantic-tokens-contrast-and-interaction-state-contract.md](02-semantic-tokens-contrast-and-interaction-state-contract.md) - Done
3. [03-dashboard-command-hierarchy-and-career-composition-seam.md](03-dashboard-command-hierarchy-and-career-composition-seam.md) - Done
4. [04-posta-active-route-and-decision-hierarchy.md](04-posta-active-route-and-decision-hierarchy.md) - Done
5. [05-match-preparation-draft-safety-and-validation-hierarchy.md](05-match-preparation-draft-safety-and-validation-hierarchy.md) - Done
6. [06-matchday-current-contract-and-first-half-playback.md](06-matchday-current-contract-and-first-half-playback.md) - Done
7. [07-matchday-second-half-playback-and-live-phase-composition.md](07-matchday-second-half-playback-and-live-phase-composition.md) - Done
8. [08-half-time-decision-hierarchy-and-phase-decomposition.md](08-half-time-decision-hierarchy-and-phase-decomposition.md) - Done
9. [09-full-time-football-story-and-consequence-hierarchy.md](09-full-time-football-story-and-consequence-hierarchy.md) - Done
10. [10-shared-finish-visual-gate-dead-path-closeout-and-phase-report.md](10-shared-finish-visual-gate-dead-path-closeout-and-phase-report.md) - Done

## Phase-Level Checks

Run with Node `24.19.0`:

```bash
nvm use 24
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
pnpm --filter @game/web run build
pnpm depcruise
pnpm check
pnpm web:visual:qa
git diff --check
graphify update .
```

`pnpm web:visual:qa` is authoritative after Step 10 migrated every still-current
unique assertion. It runs the current-product journey and the unique real
SQLite/OPFS persistence proof.

## Phase-Level Manual Inspection

- App Entry, Dashboard, Posta, Preparation, pre-match, first half, half-time,
  second half, full time, dialogs, loading, error, and recovery all belong to
  one restrained retro-premium product.
- The current football task appears in the first useful viewport.
- One dominant action appears only when the manager has a real decision.
- No required click exists only to expose an already-determined result.
- No raw ID, backend fallback word, mixed-locale football term, or diagnostic
  field appears in a valid product state.
- Desktop, wide, narrow, and 200% text have no overlap, clipping, unreachable
  action, horizontal page overflow, or unexpected layout shift.
- Keyboard journeys have bypass, logical order, visible focus, and correct
  screen-change focus.
- Semantic state is never communicated by color alone and normal text reaches
  WCAG 2.2 AA contrast.
- Reduced motion removes non-essential transition while preserving feedback.
- The tactical board is unchanged and remains fully operable.
- Save, autosave, dirty-exit, refresh recovery, Posta lifecycle, and staged
  Matchday remain deterministic.

## What NOT To Implement

- No new career section or future navigation destination.
- No market, contract, finance, youth, staff, facilities, archive, board, media,
  press, economy, or player-model workflow.
- No future Posta category without its real producer and resolution condition.
- No match-engine balance, tactical-effect, player-rating, or simulation change.
- No extra time, penalties, cups, or animated 2D/3D match viewer.
- No theme picker, palette replacement, font replacement, pitch replacement,
  decorative hero, gradient-orb treatment, or generic SaaS card redesign.
- No router, dependency-injection container, event bus, second Zustand store,
  second persistence layer, alternate command queue, or design-system package.
- No runtime/build-time LLM behavior.
- No deletion based only on line count, age, naming, or a stale test failure.
- No Phase 74 implementation.

## Definition Of Done

- All 11 Phase 73A P1 findings have passing implementation evidence.
- Preparation work cannot disappear silently.
- Matchday contains no mandatory non-decision reveal click.
- Narrow task priority, keyboard bypass, screen focus, target size, and contrast
  satisfy the documented WCAG 2.2 AA working target.
- Valid product states expose football facts, not technical IDs or backend
  fallback words.
- App and Matchday ownership are narrower without a generic framework.
- One canonical current-product Playwright command covers every real journey
  and shared interaction state.
- Every removed path has replacement coverage and no known compatibility or
  dead-code bridge remains undocumented.
- Tactical-board, engine, persistence, Posta, save cadence, and deterministic
  Matchday behavior are unchanged.
- The final browser scorecard is manually reviewed and the product is clearer,
  faster to understand, and more enjoyable, not merely numerically greener.
- `pnpm check`, web build, dependency rules, canonical Playwright QA,
  `git diff --check`, and Graphify update pass.
- The phase report recommends exactly one next phase without starting it.
