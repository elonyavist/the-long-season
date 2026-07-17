# Web UI/UX Premium Remediation Map

Date: 2026-07-15  
Source phase: `73a-web-product-ui-ux-quality-audit-and-premium-design-baseline`  
Recommended implementation phase: `Phase 73B - Current Web Product Premium Remediation And Journey Hardening`

## Purpose

Turn the evidence collected in Phase 73A into a bounded implementation order
for the current playable browser product. This is not a redesign brief and is
not permission to rewrite the web app. Each slice must improve one real manager
journey in the browser, preserve deterministic gameplay behavior, and remove
the code or presentation path it replaces in the same scope.

Phase 74 remains reserved as `Player Generation And Model Consolidation
Cleanup`. Phase 73B is an evidence-driven interposition before Phase 74; it does
not renumber, replace, or start Phase 74.

The executable phase contract and all ten ordered step documents now live at
`docs/steps/73b-current-web-product-premium-remediation-and-journey-hardening/`.
All steps are pending; this map and its documentation do not start production
implementation.

## Source Evidence

- `docs/audits/WEB_PRODUCT_UI_UX_QUALITY_AUDIT.md`
- `docs/audits/WEB_PRODUCT_SURFACE_AND_STATE_INVENTORY.md`
- `docs/audits/WEB_CRITICAL_JOURNEY_AND_ACTION_ECONOMY_AUDIT.md`
- `docs/audits/WEB_INFORMATION_ARCHITECTURE_AND_CONTENT_HIERARCHY_AUDIT.md`
- `docs/audits/WEB_PREMIUM_VISUAL_SYSTEM_AND_COMPONENT_LANGUAGE_AUDIT.md`
- `docs/audits/WEB_ACCESSIBILITY_RESPONSIVE_AND_INTERACTION_STATE_AUDIT.md`
- `docs/audits/WEB_FRONTEND_PRESENTATION_ARCHITECTURE_AND_CSS_AUDIT.md`
- `docs/audits/WEB_PIXEL_PERFECT_VISUAL_BASELINE_AND_SCORECARD.md`

## Non-Negotiable Constraints

- Preserve structured engine/domain facts. React must not infer or fabricate
  gameplay outcomes.
- Preserve `@game/ui` as the framework-free presentation-contract layer.
- Preserve SQLite/OPFS, the working career session, manual save, and 7/15-day
  autosave semantics.
- Preserve the single typed asynchronous command activity and dirty-exit
  protection.
- Preserve Dashboard as operational home, Continue as calendar rhythm, and
  Posta as current-season decision context and history.
- Preserve the tactical board, `campo-calcio.svg`, normalized geometry,
  canonical roles/formations, tokens, suitability, drag, pointer, touch,
  keyboard, context-menu, candidate, and bench behavior.
- Preserve the staged engine checkpoint and the real half-time decision.
- Keep all visible copy in the typed localization owner.
- Do not introduce a router, UI framework, alternate state store, icon package,
  theme system, second persistence layer, or second command queue.
- Do not add future Squad, Market, Finance, Youth, Staff, or other decorative
  screens before their workflows exist.
- Do not remove a historical test, source path, selector, or adapter until its
  unique current behavior is covered by the canonical replacement gate.
- Run every package/install command with Node 24.

## Severity Coverage

| Finding | First owning slice | Completion evidence |
|---|---:|---|
| `Q-P1-01` preparation draft safety | 5 | non-empty draft cannot disappear silently on refresh or exit |
| `Q-P1-02` match playback economy | 6-7 | no mandatory click exists only to reveal a predetermined period |
| `Q-P1-03` narrow task priority | 1, then each feature slice | current task is visible in the first useful narrow viewport |
| `Q-P1-04` technical content leaks | 3, 6-9 | no raw IDs or backend fallback words in valid product states |
| `Q-P1-05` flattened hierarchy | 2-4, 8-10 | one dominant task and consistent information tiers per screen |
| `Q-P1-06` missing bypass | 1 | keyboard-visible skip reaches active main content |
| `Q-P1-07` lost screen focus | 1 | genuine screen changes focus the new task heading/main |
| `Q-P1-08` blocker contrast | 2 | normal-size semantic text reaches WCAG AA contrast |
| `Q-P1-09` broad App composition | 3 | repeated career-frame composition has one named owner |
| `Q-P1-10` concentrated Matchday owner | 6-9 | current phase contract and phase-local compositions are explicit |
| `Q-P1-11` missing canonical visual gate | 1, completed in 10 | one documented current-product Playwright command is authoritative |

P2 work is paired with its owning visible slice. It must not become an
independent cleanup batch with no user-visible outcome.

## Dependency Order

```text
01 safety gate + task-first shell + focus
  -> 02 semantic visual contract
    -> 03 Dashboard/content/App composition
      -> 04 Posta hierarchy
      -> 05 preparation draft safety
      -> 06 Matchday contract + first-half playback
        -> 07 second-half playback + phase extraction
          -> 08 half-time hierarchy
          -> 09 full-time story
            -> 10 shared finish + evidence/dead-path closeout
```

Slices 04 and 05 may be documented independently after Slice 03, but they must
not execute in parallel because both use the shared shell and current visual
gate. Matchday slices are strictly ordered.

## Slice 01 - Current Visual Gate, Task-First Narrow Shell, And Focus

### User outcome

On a narrow screen the current football task is visible before secondary
orientation. A keyboard user can bypass repeated chrome, and a genuine screen
change announces the new task without stealing focus during same-screen work.

### Owners

- `apps/web/src/features/app-shell/`
- the existing shared main/screen boundary in `apps/web/src/app/`
- current visual-QA scripts and `apps/web/package.json`

### Browser-visible acceptance

- a keyboard-visible skip control lands on the active `main` target;
- Dashboard, Posta, Preparation, and Matchday place their current task in the
  first useful `390x844` viewport;
- destination order remains understandable and reachable;
- New career, Posta, Prepare match, and Confirm transitions focus the new
  screen heading/main; filters, selection, playback, and menu updates do not;
- no page-level horizontal overflow at desktop, wide, narrow, or 200% text;
- one documented Playwright command captures current desktop/narrow/focus/
  zoom/reduced-motion evidence.

### Deletion boundary

Delete only repeated per-screen focus/reset logic and superseded shell narrow
overrides proven redundant by the new shared owner. Do not delete historical
visual scripts yet; migrate unique assertions first.

### Automated and manual gate

- shell, App, keyboard, and current journey tests;
- canonical Playwright command on SQLite/OPFS;
- screenshots at `1440x900`, `1920x1080`, `390x844`, and 200% text;
- manual Tab order and screen-reader-oriented focus inspection.

## Slice 02 - Semantic Tokens And Interaction-State Contract

### User outcome

Blocking, selected, pending, disabled, focus, error, and recovery states are
immediately distinguishable and readable without making the interface louder.

### Owners

- current global visual tokens and shared control/surface styles;
- real Dashboard, Preparation, Posta, dialog, and command-feedback consumers.

### Browser-visible acceptance

- blocker text/background reaches at least `4.5:1` for normal text;
- focus, hover, active, selected, disabled, pending, error, and success states
  have one semantic language across current controls;
- passive Matchday progress and disabled future navigation do not look like
  available buttons;
- no tactical-board or pitch visual changes;
- reduced motion retains all state meaning.

### Deletion boundary

Remove the three undefined variable uses and local duplicate semantic-state
rules replaced by the named contract. Keep intentional tactical geometry and
specialized board tokens local.

### Automated and manual gate

- computed-style/contrast checks on real consumers;
- focus, hover, pending, disabled, dialog, recovery, and reduced-motion shots;
- web typecheck, tests, build, and canonical visual gate.

## Slice 03 - Dashboard Command Hierarchy And Career Composition Seam

### User outcome

Dashboard answers one question: what should the manager do now? It shows one
dominant command, concise football context, and no raw identifiers, duplicated
readiness, or diagnostic fallback words.

### Owners

- Dashboard presenter/read model and screen;
- `apps/web/src/app/App.tsx` current career-frame composition;
- typed i18n labels and existing shared shell.

### Browser-visible acceptance

- the first viewport contains the next decision, opponent/round where real,
  and only supporting information needed to make it;
- `fixture:*`, `season:*`, `unknown`, `none`, `missing`, and mixed football
  terminology do not render in valid states;
- preparation readiness has one product owner and one visible action;
- current Posta awareness and save status remain available without competing
  with the task;
- desktop and narrow Dashboard retain all real commands and recovery states.

### Deletion boundary

Extract only the repeated current-career frame and named command/view
composition from `App.tsx`. Remove Dashboard fields, branches, selectors, and
CSS made obsolete by the new hierarchy. Do not create a generic route or
screen framework.

### Automated and manual gate

- presenter, App, store, command, save, and Dashboard tests;
- unprepared, ready, attention, post-match, loading, and error screenshots;
- entry-to-Dashboard-to-task canonical journey.

## Slice 04 - Posta Active-Route Hierarchy

### User outcome

Posta reads as a dense football decision workspace. The selected message and
its real action dominate; the shell does not repeat the same subject/count
while the user is already inside Posta.

### Owners

- `apps/web/src/features/inbox/`
- active-route behavior in the existing app shell;
- current `@game/ui` inbox read models.

### Browser-visible acceptance

- the active Posta route suppresses duplicate awareness framing but other
  routes retain compact awareness;
- blocking, important, informational, read, acknowledged, resolved, empty,
  and narrow list/detail states remain clear;
- narrow Back behavior, filters, selected message, and primary destination are
  reachable without shell displacement;
- no future market/contract/finance/youth/staff content is invented.

### Deletion boundary

Remove only the active-route duplicate branch and selectors. Preserve durable
message lifecycle, deterministic selection, current-season reset, and one real
destination shared with Dashboard.

### Automated and manual gate

- current Posta unit and SQLite/OPFS Playwright suites;
- desktop/narrow list, detail, empty filter, loading, focus, and text-zoom
  evidence;
- lifecycle and save-cadence regression checks.

## Slice 05 - Preparation Draft Safety And Validation Hierarchy

### User outcome

A manager cannot silently lose a non-empty XI, bench, formation, or tactic
draft. The board remains the first football object, and validation explains
only what blocks confirmation.

### Owners

- match-preparation draft/store boundary;
- career working-session unsaved semantics;
- preparation presenter/screen and dirty-exit dialog.

### Browser-visible acceptance

- assigning any player or tactic makes unsaved work explicit without writing
  through on every action;
- refresh/exit offers a truthful recovery choice; cancel preserves the draft;
- save-and-exit/reload restores the intended saved state;
- confirmation remains explicit and autosave cadence remains manual/7/15-day;
- readiness/blockers are not repeated above, beside, and below the board;
- the tactical board and pitch are behaviorally and visually unchanged.

### Deletion boundary

Remove draft paths that bypass session unsaved semantics and duplicate blocker
narration replaced by the canonical validation owner. Do not persist temporary
hover, menu, selection, or drag state.

### Automated and manual gate

- draft, session, refresh, cancel, save-and-exit, reload, and persistence tests;
- empty, partial, complete, invalid, dialog, desktop, and narrow shots;
- tactical pointer/touch/keyboard and candidate-order regression suite.

## Slice 06 - Matchday Contract And Automatic First-Half Playback

### User outcome

After explicit `Start match`, the product presents bounded live first-half
playback and stops at the real half-time decision. No extra click exists only
to reveal a predetermined first half.

### Owners

- Matchday adapter/presenter current phase contract;
- Matchday screen first-half composition;
- existing staged checkpoint commands, unchanged engine simulation.

### Browser-visible acceptance

- pre-match retains one explicit Start command;
- first-half events/score progress visibly with command feedback;
- playback ends at the persisted half-time checkpoint exactly once;
- refresh during/after the bounded transition recovers the canonical state;
- no engine resimulation, outcome change, or hidden manager decision occurs;
- raw IDs/fallback words are absent from pre-match and first-half states.

### Deletion boundary

Make one current phase contract mandatory, then delete the proven unreachable
production fallback and the obsolete first-half reveal command/state. Do not
delete any checkpoint or recovery path.

### Automated and manual gate

- adapter, checkpoint, screen, command-lock, refresh, and deterministic replay
  tests;
- pre-match, pending, live first half, half-time arrival, narrow, reduced-
  motion, and error screenshots.

## Slice 07 - Automatic Second-Half Playback And Phase Composition

### User outcome

After the manager confirms half-time decisions, the second half presents
bounded live playback and reaches full time without another non-decision reveal
click.

### Owners

- Matchday second-half/full-time adapter and screen compositions;
- existing half-time command and staged engine checkpoint.

### Browser-visible acceptance

- half-time confirmation is the only command needed to resume play;
- second-half events/score progress visibly and finish exactly once;
- full time requires acknowledgement/return, not another simulation command;
- refresh and command conflict states remain deterministic;
- optional skip is added only if it has a real, explicit product purpose and
  does not bypass a decision.

### Deletion boundary

Delete the obsolete second-half reveal command/state and replaced phase branch
only after the current staged journey is green. Extract pre/live phase
composition by responsibility; do not create a generic match component system.

### Automated and manual gate

- full checkpoint and match consequence regression suite;
- half-time pending, second-half live, full-time arrival, refresh, narrow, and
  reduced-motion browser evidence.

## Slice 08 - Half-Time Decision Hierarchy And Matchday Decomposition

### User outcome

Half-time quickly answers: what happened, who is struggling, and what should I
change? The approved tactical board remains the central decision surface.

### Owners

- Matchday half-time presenter/read model;
- half-time screen composition and existing shared tactical/bench owners.

### Browser-visible acceptance

- score, decisive events, ratings, condition, role, contribution, and change
  count are concise and ordered around a real decision;
- board, bench, formation change, player movement, and substitution remain
  complete on desktop and narrow;
- repeated shape/change/status facts are removed;
- compact targets meet at least 24px effective target or a documented WCAG
  spacing exception;
- one dominant resume command is visible only when decisions are valid.

### Deletion boundary

Remove repeated half-time cards/labels and split the existing composition into
named phase-local owners only where that reduces current complexity. Keep all
tactical logic in its existing shared/domain owners.

### Automated and manual gate

- ratings, substitutions, formation, suitability, checkpoint, and screen tests;
- desktop/narrow/200%/keyboard/context-menu/long-press shots;
- manual proof that the interval supports a useful decision, not decoration.

## Slice 09 - Full-Time Football Story And Consequence Hierarchy

### User outcome

Full time reads as a match story: result first, decisive tabellino second,
selected-club ratings third, durable consequences last, then one return to the
club.

### Owners

- Matchday full-time presenter/read model and screen composition;
- structured report/consequence adapter and typed i18n copy.

### Browser-visible acceptance

- score and result dominate without oversized operational typography;
- goals, penalties, cards, injuries, and substitutions use appropriate visual
  priority from structured facts;
- ratings/condition/role/contribution are scannable without horizontal page
  overflow;
- no duplicate next action, raw IDs, `unknown`, `none`, or diagnostic labels;
- consequences appear only at full time and return to Dashboard is singular.

### Deletion boundary

Delete fallback and duplicate full-time branches/cards/selectors replaced by
the current composition. Do not add narrative prose that changes or invents
engine facts.

### Automated and manual gate

- result, report, ratings, consequence, persistence, and idempotent full-time
  commit tests;
- win/draw/loss, event-rich/event-light, desktop/narrow/zoom screenshots;
- full entry-to-return canonical journey.

## Slice 10 - Shared Finish, Evidence Migration, And Dead-Path Closeout

### User outcome

App entry, dialogs, shared feedback, and all current screens feel like one
premium football product. The release gate proves that the finished loop still
works, and obsolete presentation code no longer misleads contributors.

### Owners

- app entry and existing shared dialog/feedback owners;
- current visual-QA command and package scripts;
- CSS/source/test/doc paths proven superseded by Slices 01-09.

### Browser-visible acceptance

- app entry has a clear football-world signal without a marketing hero;
- dialogs use the current product geometry, hierarchy, focus, and recovery
  language;
- shared empty/loading/error/pending states are coherent across the loop;
- all scorecard surfaces are re-captured and manually reviewed;
- the average score improves with no lens below the Phase 73B exit threshold;
- one canonical current-product Playwright command passes in Node 24.

### Deletion boundary

After replacement proof only, archive/delete superseded visual runners, the 43
confirmed unused selector groups, and the three production-looking test-only
paths together with dedicated obsolete tests/docs. Do not remove unique
assertions or tactical behavior to make the count smaller.

### Automated and manual gate

- all current unit, type, build, dependency, and monorepo checks;
- canonical SQLite/OPFS Playwright matrix;
- desktop/wide/narrow/focus/zoom/reduced-motion/shared-state contact sheets;
- `git diff --check` and a source/dependency/dead-code review.

## Phase 73B Exit Gate

Phase 73B is complete only when:

- all 11 P1 findings have passing implementation evidence;
- preparation work cannot disappear silently;
- Matchday contains no mandatory non-decision reveal click;
- skip, screen focus, contrast, narrow task priority, and target-size checks
  satisfy the documented WCAG 2.2 AA working target;
- valid product states contain no raw IDs or backend fallback words;
- App and Matchday ownership has been narrowed without generic frameworks;
- one canonical current-product Playwright command covers the complete real
  journey and shared interaction states;
- every removed path has replacement coverage and no dead compatibility bridge
  remains;
- the tactical board and engine/persistence behavior remain unchanged unless a
  separately documented product decision explicitly authorizes change;
- `pnpm check`, dependency rules, web build, current Playwright, and
  `git diff --check` pass under Node 24;
- manual review confirms the product is clearer and more enjoyable, not merely
  mathematically compliant.

## Explicitly Deferred

- new gameplay systems or career sections;
- future Posta categories without real workflows;
- player-generation/model consolidation in reserved Phase 74;
- match-engine balance or tactical-outcome tuning;
- extra time, penalties, and cups;
- theme, palette, font, pitch, or tactical-board redesign;
- runtime/build-time LLM behavior;
- bundle optimization without measured user impact.

This map documents Phase 73B only. It does not start implementation.
