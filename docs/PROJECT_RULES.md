# Project Rules

This file is binding for Claude Code and future developers. `requirements.md` is
the source of truth.

## Always-Active Rules Live In `AGENTS.md`

Package boundaries, engine determinism, the no-duplication rule, the
no-dead-code rule, localization, step discipline, and the local commands are in
[`AGENTS.md`](../AGENTS.md) at the repository root. They are **not repeated
here**: every agent session loads that file automatically, so keeping a second
copy would create exactly the drift the no-duplication rule forbids.

Read `AGENTS.md` first. This file adds the rules that apply to particular kinds
of work.

## Additional Boundary Rules

- Engine must not import React, SQLite, Tauri, browser APIs, filesystem APIs,
  UI code, storage implementations, or apps.
- Domain must not import engine, storage, content, shared, apps, or UI code.
- UI read models may import domain contracts and catalogs, but must not import
  engine, content, storage, i18n, apps, React, or browser APIs.
- `apps/desktop -> web`.
- Content packs must not contain executable scripts.

## Additional Determinism Rules

- Persist seed and algorithm version, not global RNG state.
- Use explicit ordered ID arrays for simulation order.
- Generated IDs must be stable and non integer-like.
- All domain IDs must use the `type:value` namespace convention and must be
  created through the domain constructors (`playerId`, `clubId`,
  `competitionId`, `fixtureId`, `seasonId`, `saveId`).

## Beta Save Compatibility Rules

- The project is in beta until an explicit documented product decision ends
  this policy.
- When a schema, stamped balance/configuration version, or persisted invariant
  changes incompatibly, advance the supported version and delete/reset the
  incompatible save through the canonical storage/runtime interface.
- Do not add save migrations, compatibility defaults, dual readers/writers,
  legacy fields, or fallback reconstruction solely to preserve beta saves.
- Never partially reinterpret an incompatible save as current data. The reset
  must be explicit, tested, and followed by creation of a fresh career.
- Compatible changes that do not alter persisted truth do not require an
  artificial schema bump or deletion.

## Presentation And Localization Rules

- User-facing text must be rendered through the localization layer once Phase 13 introduces it.
- New produced code must not introduce hardcoded labels when those labels are visible or useful to the CLI, future UI, ticker/event rendering, reports, statuses, warnings, hints, or user-facing errors.
- Presentation code must not hardcode user-facing headings, labels, event words, report metric names, statuses, warnings, hints, or user-facing errors when a localization key should exist.
- Domain and engine code must keep structured, language-agnostic keys and data; they must not store rendered prose for reports, events, tactics, formations, or squad-fit messages.
- Stable IDs, schema versions, machine-readable keys, package names, and non-surfaced developer diagnostics are not localization targets unless they are rendered to the user as prose.
- English is the deterministic fallback language for missing translations.
- Supported game languages are Italian (`it`), English (`en`), German (`de`), Spanish (`es`), and French (`fr`).

## LLM And Narrative Content Factory Rules

- The distributed game must not call an LLM at runtime.
- Normal project build, test, lint, typecheck, and release commands must not
  call an LLM or require an LLM API key.
- LLM usage is allowed only as an authoring-time content factory: manual,
  occasional, reviewed, schema-validated, and committed as static content before
  it can be used by the game.
- Engine and domain Modules must emit structured, language-agnostic facts only:
  match events, world events, attention events, consequence summaries, stable
  IDs, tags, keys, numbers, and timestamps.
- Engine and domain Modules must not select prose templates, store rendered
  narrative text, call narrative generators, or depend on LLM/content-factory
  output.
- Narrative rendering must live behind a content/presentation/narrator seam
  outside the engine. That Adapter may map structured facts to localized
  templates, but it must not change gameplay state or simulation outcomes.
- Runtime narrative selection must be deterministic: use seeded RNG, stable
  template IDs, stable corpus versions, and deterministic tie-breakers.
- If exact replay wording matters, persist the selected `templateId` or the
  corpus version needed to reproduce the selection. Do not rely on mutable
  corpus contents for exact replay.
- LLM output must not define gameplay truth: no final player attributes,
  balance numbers, match results, transfer decisions, market values, AI choices,
  league rules, or save migrations.
- LLM output may draft text variants, event copy, press/news templates,
  commentary templates, names, and localization drafts, but only after human
  review and schema validation.
- Raw LLM output is not game content. Only curated files that pass content
  schemas may enter `packages/content` or future official content packs.
- Prompts used for official content should be versioned as authoring assets.
  Raw generated output should not be treated as runtime content and should not
  be shipped.
- Non-English LLM localization is a draft only until reviewed by a competent
  speaker or an explicitly documented localization QA process.

## Content Generation Quality Rules

- Generated players must be deterministic, fictional, and credible by division, club tier, role, age, current ability, and potential.
- Player generation must not create broadly overpowered lower-division squads; rare lower-division outliers must be controlled by explicit rarity budgets and tests.
- Attribute generation must be role-coherent: ordinary defenders, attackers, midfielders, and goalkeepers must not receive high values in irrelevant attributes without an explicit archetype, cap exception, and test coverage.
- Current ability and potential are separate concepts. A lower-division prospect may have high future potential without already being a first-division-ready player.

## Gameplay Quality Rules

- User fun, football credibility, readability, and emergent stories are the goal; math is a diagnostic tool, not the design objective.
- A warning, anomaly, or outlier must be evaluated first as a player-facing experience: healthy narrative variance, useful monitoring signal, bad threshold semantics, missing diagnostics, or real engine/content/career logic issue.
- Do not tune systems just to make reports greener. Change behavior only when the evidence shows that the current result hurts long-run credibility, user agency, or the quality of football stories.
- Do not remove believable variance. Standout players, tight leagues, dynasties, collapses, and surprise seasons are desirable when they are rare, explainable, and football-plausible.
- Any proposed fix must state the user-facing reason before the mathematical reason.

## Local Runtime And Visual QA Rules

- Node `24.16.0` is the local runtime.
- Before installing, upgrading, or removing dependencies, or before changing
  any `package.json`/`pnpm-lock.yaml` content, run `nvm use 24` from the
  repository root and perform the dependency change with pnpm.
- Web/UI phases must have Playwright available for screenshot-based visual QA.
- Chromium is the default browser for automated visual inspection. Install or
  refresh it with `pnpm playwright:install`.
- Before closing a web/UI phase, run Playwright against the local app whenever a
  browser-rendered screen exists. At minimum inspect desktop and narrow
  viewport screenshots for blank pages, clipped text, overlapping content, and
  broken navigation.
- If Playwright cannot run, document the exact blocker in
  `docs/PROJECT_STATUS.md` and the phase report instead of silently skipping
  visual QA.

## Simulation Execution Rules

- `packages/simulation-tools/src/simulation-execution-policy.ts` is the single
  owner of the repository simulation worker budget.
- Current and future batch-simulation adapters default to
  `min(7, independent work items)` and must never exceed `7` workers.
- A single indivisible world/season remains one work item and therefore uses
  one worker; do not create empty or duplicate jobs to display a larger count.
- Explicit CLI or test overrides may reduce concurrency. Values above the
  canonical limit are capped, not treated as authority to saturate the host.
- CLI environments may use `TLS_SIMULATION_WORKERS` only as a lower
  operational override. Do not introduce runner-specific worker environment
  variables or a second host-CPU-derived default.
- Worker count is execution metadata only. It must not alter seeds, canonical
  ordering, checkpoint hashes, metrics, thresholds, or gameplay behavior.
- Resumable long runs require an explicit checkpoint directory and stable
  shards. Their reproduction command must record the actual worker count.
- Vitest uses the same seven-worker maximum. Playwright retains its separate
  visual-QA worker policy.

## Web Accessibility Rules

- Web UI work targets WCAG 2.2 AA unless a step documents a narrower temporary
  prototype scope.
- Browser-rendered screens must be usable by keyboard for primary flows.
- Interactive controls must have visible focus states and accessible names.
- Sticky or fixed regions must not hide focused controls.
- Navigation must expose the current location with semantic state such as
  `aria-current` when applicable.
- Use semantic landmarks (`header`, `nav`, `aside`, `main`, `section`) where
  they clarify page regions.
- Do not communicate important state by color alone.
- Do not knowingly ship clipped labels, overlapping content, unreachable
  controls, or hover-only essential interactions.
- Before closing a web/UI phase, document screenshot findings and keyboard/focus
  findings in the phase audit or report.

## Web Motion Rules

- Motion for React is the canonical React dependency for state transitions,
  enter/exit choreography, layout continuity, and football-event emphasis in
  `apps/web`.
- Motion is presentation only. Domain, engine, content, storage, simulation
  tools, shared packages, UI read models, persistence, and career commands must
  never depend on Motion or on animation completion.
- Every new browser-visible feature must classify each proposed movement as
  `none`, `micro`, `transition`, or `narrative`. Use the shared web motion system
  when movement clarifies feedback, location, continuity, or a structured
  football event; choose `none` when it would only decorate a static surface.
- Shared durations, easing, springs, variants, and reduced-motion policy belong
  to the web motion Module. Do not scatter arbitrary animation constants,
  duplicate variants, or screen-local motion frameworks.
- Mount one application-level `MotionConfig` with `reducedMotion="user"` and
  prefer `LazyMotion` plus the smallest production-used feature bundle. A
  reduced-motion path must preserve the same facts, commands, focus result,
  readable event hold, and final screen state.
- Components that render lazy motion elements must import `m` from
  `motion/react-m`. Full `motion/react` imports are reserved for the provider,
  hooks, and types that do not have a smaller public entrypoint.
- CSS remains appropriate for simple hover, focus, color, and other
  non-structural micro feedback. Do not replace stable CSS merely to increase
  Motion usage, and do not add new hand-written keyframes for stateful React
  enter/exit or orchestration when the shared motion system owns that concern.
- Prefer opacity and transforms. Do not animate dimensions or positional
  properties when they cause avoidable layout work, text reflow, horizontal
  overflow, cumulative page growth, or movement of the primary action.
- Animation may acknowledge a command but must not issue it. `onAnimationComplete`
  must not simulate, navigate, persist, mutate career facts, advance a match, or
  unlock correctness-critical state.
- Product pacing and animation duration are separate. Matchday frame holds,
  Continue date pacing, and command locks remain typed presentation policies;
  they must not be inferred from a CSS/Motion transition callback.
- Do not add infinite decorative loops. A bounded pending indicator may repeat
  only while real work is active and must stop immediately when that state
  ends.
- Important state must never be communicated by movement alone. Motion must
  preserve semantic markup, accessible names, visible focus, live-region
  discipline, stable target sizes, and WCAG 2.2 AA contrast.
- Browser-visible motion work requires Playwright evidence for normal and
  reduced-motion modes at desktop and narrow viewports. Matchday narrative
  motion also requires event-light and event-rich evidence.

## Step Discipline Rules

One step at a time, `Expected Files` only, and no residue: those are in
`AGENTS.md`. What follows is the rest.

- The active step is the smallest `docs/steps/**.md` file named by the task or by the next unfinished milestone.
- `docs/PROJECT_STATUS.md` may always be modified for status updates, even when it is not listed in the active step's `Expected files`.
- The next relevant step document may be modified to capture lessons learned before that step starts.
- `What NOT to implement` is scoped to the active step, not a permanent project ban.
- The workflow is incremental and iterative: implement the smallest useful slice, run its checks, fix what fails, update the next step if reality changed, then advance.
- When a step makes an old helper, test fixture, branch, or abstraction redundant, either remove/refactor it in the same step if it is inside the step scope, or explicitly document the reason and the next cleanup step in `docs/PROJECT_STATUS.md` or the next relevant step document.
- Mandatory execution loop:
  1. Read `docs/PROJECT_STATUS.md`.
  2. Choose the active step.
  3. Implement only that step.
  4. Run the required checks.
  5. If something is wrong, fix the current step or update the next step document before moving on.
  6. Update the step document with the outcome, and `docs/PROJECT_STATUS.md` only if the active step or a live constraint changed.
  7. Advance to the next step.
- Do not start the next step while the current step has failing checks, unresolved scope questions, or an unsatisfied Definition of Done.
- A later step may refine or replace earlier implementation details, but only through a documented step with tests and a narrow migration path.
- After every step, record the adopted solution, verification result, blocker or lesson, and next action **in that step's own document**. Update `docs/PROJECT_STATUS.md` only with the active step, the phase progress table, and anything that constrains future work. It is a live snapshot, not a log: it has a hard `300` line budget, and history belongs in `git log` and the phase reports under `docs/audits/`.
- Future systems are allowed when they become the active documented step and their phase gate is satisfied.
- When the current documented sequence is complete, create the next numbered step document under `docs/steps/` before implementing the next feature.
- Do not modify this rulebook just to move to the next phase.
- First real command: `pnpm cli doctor`.
- First gameplay milestone: `pnpm cli simulate-season --seed=demo-001`.

## Early Phase Scope Guard

- Before `pnpm cli simulate-season --seed=demo-001` works, do not implement React, SQLite, Web Worker, Tauri, localization, modding editor, youth, staff, facilities, media/events, advanced market, Steam work, or other future systems.
- After that milestone works, future systems may proceed one documented step at a time.

## Definition Of Done

- Code compiles.
- Tests pass.
- Dependency rules pass.
- Determinism tests pass.
- No forbidden imports exist.
- No forbidden runtime APIs are used inside engine.
- No known dead code, obsolete helper, unnecessary duplication, or obviously local cleanup is left undocumented.
- Step-specific Definition of Done is satisfied.
- Lessons learned that affect future work are captured in the next step document, not hidden in code or chat.
- `docs/PROJECT_STATUS.md` reflects the current active step, the phase progress table, and the constraints still binding future work. Per-step detail lives in the step document.

## Executable Enforcement

- Use `nvm use 24` before the commands below when starting from a fresh shell.
- `pnpm check` is the single local gate and runs `pnpm lint`, `pnpm depcruise`, `pnpm test`, and `pnpm typecheck`.
- `pnpm playwright:install` installs the Chromium browser used for local
  Playwright screenshots and visual inspection.
- `pnpm lint` uses ESLint and rejects forbidden runtime APIs inside `packages/engine`.
- `pnpm depcruise` uses Dependency Cruiser and rejects package-boundary violations from this file.
- `pnpm test` uses Vitest for `packages/**/*.test.ts`.
- `pnpm cli doctor` is the first real CLI command and must exit `0`.
- Negative dependency proof command:

```sh
printf 'import "@game/engine";\nexport {};\n' > packages/storage/src/__forbidden-import.fixture.ts
pnpm depcruise
rm packages/storage/src/__forbidden-import.fixture.ts
```

- Negative engine determinism proof command:

```sh
printf '/** Temporary lint fixture. */\nexport function forbiddenRandomForLintFixture(): number {\n  return Math.random();\n}\n' > packages/engine/src/__forbidden-runtime.fixture.ts
pnpm lint
rm packages/engine/src/__forbidden-runtime.fixture.ts
```
