# Web Product Surface And State Inventory

Date: 2026-07-15  
Phase: `73a-web-product-ui-ux-quality-audit-and-premium-design-baseline`  
Status: authoritative current-product inventory for the remaining Phase 73A audits

## Purpose

This document records what the web product actually exposes before visual,
interaction, accessibility, or architecture quality is scored. It is an
inventory, not a redesign proposal.

The current browser application is a state-driven React application. It does
not use URL routes for its internal career surfaces. `App.tsx` derives view
models from the active career, while `career-ui-store.ts` owns the active
screen, transient drafts, command feedback, filters, and calendar animation.
Persistent football facts remain owned by the career runtime and storage.

## Evidence And Method

- Production source was traced from `apps/web/src/main.tsx` through
  `apps/web/src/app/App.tsx`, the Zustand UI store, runtime, presenters, feature
  screens, and shared UI.
- Graphify was queried for production surface, state, runtime, presentation,
  and storage relationships.
- Existing component, store, runtime, adapter, and Playwright tests were
  mapped as coverage evidence. Their existence does not prove product quality.
- File size and stylesheet concentration are recorded only as audit signals.
- Historical screenshots and flow evidence are not treated as current truth
  unless the same behavior can be reproduced from current production source.

## Production Entry And Ownership Chain

```text
main.tsx
  -> App.tsx
     -> career-ui-store.ts (ephemeral UI/session state)
     -> web-career-runtime.ts (career commands and working career facts)
     -> create-web-career-storage.ts (SQLite WASM + OPFS persistence)
     -> @game/ui builders (stable read models)
     -> web presenters/adapters (browser-specific presentation)
     -> feature screens
        -> AppEntryScreen
        -> CareerDashboardScreen inside AppShell
        -> CareerInboxScreen inside AppShell
        -> CareerMatchPreparationScreen inside AppShell
        -> CareerMatchdayScreen inside AppShell
```

The screen state union is currently:

```text
app_entry
career_dashboard
career_inbox
match_preparation
matchday
```

There is no separate production screen for Squad, Tactics, Calendar, Market,
Finances, Youth, Staff, or Archive yet.

## Navigation And Transition Map

| From | Trigger | Command or store transition | Destination |
| --- | --- | --- | --- |
| App entry | New career | `create_career` then `openPersistedCareer` | Dashboard, unless a resumable checkpoint exists |
| App entry | Continue career | `load_career` then `openPersistedCareer` | Dashboard or Matchday checkpoint |
| Any career surface | Main menu | `backToMenu` | App entry, with dirty-session confirmation when required |
| Dashboard | Continue | `continue_career` | Dashboard when no attention is found; Posta when attention stops progression |
| Dashboard | Primary preparation action | `openMatchPreparation` | Match preparation |
| Dashboard | Primary due-fixture action | `openMatchday` | Matchday |
| Persistent sidebar | Posta | `openInbox` | Posta |
| Persistent sidebar | Dashboard | `openDashboard` | Dashboard |
| Compact Posta rail | Open current attention | `open_inbox` | Posta |
| Posta detail | Prepare match | `prepare_match` | Match preparation |
| Posta detail | Go to match | `open_matchday` | Matchday |
| Match preparation | Confirm and go to match | `confirm_preparation` | Matchday pre-match |
| Matchday | Start/play first half | `play_first_half` | First-half playback, then half-time checkpoint |
| Matchday | Start/play second half | `play_second_half` | Second-half playback, then full time |
| Matchday | Return to dashboard | `return_to_dashboard` | Dashboard |

`Continue` advances calendar facts day by day in the engine until an important
or blocking attention item is reached. The UI animates the already-computed
date span; it does not own progression rules.

## Reachable Surface Inventory

### 1. App Entry

| Item | Current behavior |
| --- | --- |
| Reveal | Initial `app_entry` state or Main menu from a career surface |
| Primary purpose | Start a career or load a committed career |
| Primary actions | New career; Continue career |
| Secondary controls | Save selector when multiple saves exist; language; currency; retry storage |
| Meaningful states | storage loading; storage error with retry; ready with no saves; ready with saves; selected save; create/load command pending |
| View owner | `features/app-entry/app-entry-view-model.ts` plus `@game/ui` app-entry action contracts |
| Component owner | `features/app-entry/AppEntryScreen.tsx` |
| Style owner | app-entry and shared menu/select rules in `styles/components.css`, layout in `styles/layout.css`, tokens in `styles/tokens.css` |
| Unit evidence | `AppEntryScreen.test.tsx`, `app-entry-view-model.test.ts`, app preferences and translation tests |
| Browser evidence | persistence, SQLite/OPFS, full-rebuild, autosave/loading, and Posta end-to-end specs all enter through this screen |

Deterministic prerequisites:

- Empty state: delete every OPFS career through the production storage adapter.
- Existing-save state: create `save:phase49-demo` or any deterministic career,
  then reload.
- Error state: inject a classified persistence failure in component/runtime
  tests; browser reproduction requires an explicit storage-failure harness.
- Pending state: start create/load and observe the shared command activity.

### 2. Persistent Career Shell

| Item | Current behavior |
| --- | --- |
| Reveal | Wraps every implemented career surface |
| Primary purpose | Product identity, destination awareness, Posta awareness, save lifecycle, Continue, and compact career context |
| Left rail | Brand/club, navigation, optional compact Posta rail, Main menu |
| Main region | Active feature screen |
| Right rail | Manual save/autosave controls, optional Continue, current career facts; hidden on Posta |
| Meaningful modes | preparation; matchday; active Posta; global command pending; storage recovery; dirty session |
| View owner | `@game/ui` `buildCareerShellView` |
| Component owner | `features/app-shell/AppShell.tsx` and focused shell components |
| Style owner | shell rules distributed between `layout.css` and `components.css` |
| Unit evidence | `AppShell.test.tsx`, `AppShellPostaRail.test.tsx`, `CareerSaveControl.test.tsx`, `UnsavedCareerDialog.test.tsx` |
| Browser evidence | shell accessibility, persistence, autosave/loading, Posta, full-rebuild, match preparation, and matchday specs |

Shared shell states:

- Current navigation item is non-interactive and exposes `aria-current`.
- Implemented Dashboard and Posta destinations are interactive when available.
- Future destinations are visible but disabled with localized future-phase
  guidance.
- Posta has no right rail, preserving a two-pane decision workspace.
- Match preparation hides global Continue; Matchday hides global Continue and
  compact Posta awareness.
- A global pending command applies `aria-busy`, disables competing commands,
  and exposes a live-region update.

### 3. Dashboard

| Item | Current behavior |
| --- | --- |
| Reveal | New/load career; Dashboard navigation; return from full time; Continue with no attention |
| Primary purpose | Club command centre with exactly one context-sensitive primary action |
| Primary action | Continue, Prepare match, or Go to match according to date and preparation readiness |
| Supporting facts | next fixture; lineup/tactic readiness; blockers; condition; roster count; table context; recent match |
| Meaningful states | fixture in future; due and blocked; due and prepared; attention stop; no table/recent match; command pending |
| Read-model owner | `@game/ui` dashboard view built by `build-career-dashboard.ts` |
| Presentation owner | `career-dashboard-presenter.ts` |
| Component owner | `CareerDashboardScreen.tsx` |
| Style owner | dashboard rules in `components.css` and shell grid in `layout.css` |
| Unit evidence | dashboard screen, builder, and presenter tests |
| Browser evidence | persistence, Continue/Posta, autosave/loading, inbox decision centre, and full-rebuild specs |

Deterministic prerequisites:

- New career starts on 2026-08-01 with a due unprepared fixture.
- Complete `auto` lineup plus a tactic and confirm to create the prepared
  due-fixture state.
- Complete a fixture and return to Dashboard for recent-match and result-Posta
  evidence.
- Continue after a committed result to exercise calendar advancement and the
  next attention stop.

### 4. Posta Decision Centre

| Item | Current behavior |
| --- | --- |
| Reveal | Sidebar Posta, compact Posta awareness, or Continue attention stop |
| Primary purpose | Read current-season football facts and resolve the item requiring the manager's decision |
| Primary action | Message-specific real workflow action, currently Prepare match or Go to match |
| Secondary actions | All, To handle, and Unread filters; select message; narrow Back to messages; Dashboard |
| Meaningful states | actionable unread; actionable read; informational result; empty filter; empty inbox; desktop list/detail; narrow list/detail; command pending |
| Read-model owner | `@game/ui` inbox and shell views |
| Presentation owner | `career-inbox-presenter.ts` |
| Component owner | `CareerInboxScreen.tsx`, `InboxMessageList.tsx`, `InboxMessageDetail.tsx` |
| Style owner | Posta list/detail/shell rules in `components.css` and responsive workspace in `layout.css` |
| Unit evidence | screen, list, detail, presenter, Posta rail, calendar transition, runtime lifecycle, and store tests |
| Browser evidence | `inbox-decision-center.spec.ts` is the canonical Phase 73 journey; Continue/Posta and autosave specs add coverage |

Current content boundary:

- Current categories are matchday decision and played-fixture result facts.
- Market, contracts, finances, youth, and staff messages are intentionally
  absent until their real workflows exist.
- Current-season history is reset when a new season begins by the engine
  lifecycle; this is product policy, not an empty-state defect.

### 5. Match Preparation

| Item | Current behavior |
| --- | --- |
| Reveal | Dashboard primary action or actionable Posta message |
| Primary purpose | Produce one complete, valid lineup, bench, and tactic for the next fixture |
| Primary action | Confirm and go to match |
| Secondary actions | Dashboard; Auto; Fill gaps; Clear; formation; tactical slot/menu actions; bench assignment; panel tabs; tactic choice |
| Meaningful states | empty draft; partial XI; complete XI without valid bench; complete selection without tactic; valid preparation; selected player detail; squad/tactic/detail tabs; pending confirmation |
| Read-model owner | `@game/ui` career match-preparation view |
| Browser adapter | `match-preparation-adapter.ts` |
| Component owner | `CareerMatchPreparationScreen.tsx`, shared selection UI, and tactical-board components |
| Style owner | preparation/selection rules in `components.css` and `layout.css`; board-specific rules in `tactical-board.css` |
| Unit evidence | screen, adapter, career-loop, pitch-lineup/layout, shared table/candidate/fact panel, tactical-board unit suites |
| Browser evidence | match preparation, tactical workspace, shared board, squad responsive, full-rebuild, Posta, and persistence specs |

The tactical board is an approved visual/product anchor. It is also reused in
the half-time decision workspace; it is not a second implementation.

### 6. Matchday

| Item | Current behavior |
| --- | --- |
| Reveal | Confirmed preparation, prepared due fixture, Posta Go to match, or resumable active-match checkpoint |
| Primary purpose | Confirm the match, progress deterministic halves, make a half-time decision, review full time, and return to the club |
| Primary actions | Start match; Play to half-time; Start second half; Play to full time; Return to dashboard |
| Secondary actions | Prepare match when blocked; half-time formation, player movement, role, XI/bench, and substitution decisions |
| Meaningful states | unavailable/blocked; pre-match ready; first-half playback; half-time checkpoint; second-half playback; full-time review; command pending; resumable checkpoint |
| Read-model owner | `@game/ui` matchday and staged-phase views |
| Browser adapter | `matchday-adapter.ts` |
| Presentation owner | `career-matchday-presenter.ts` |
| Component owner | `CareerMatchdayScreen.tsx` plus reused tactical board/bench |
| Style owner | extensive match-centre rules in `components.css` and responsive composition in `layout.css` |
| Unit evidence | screen, adapter, presenter indirectly through screen tests, runtime checkpoint, staged engine, ratings, substitutions, and store tests |
| Browser evidence | interactive flow, playable slice, flow simplification, information architecture, full-rebuild, Posta, and persistence specs |

Current regulation phases are `pre_match`, `first_half`, `half_time`,
`second_half`, and `full_time`. Extra time and penalties are not exposed in the
web product because no current competition workflow requires them.

Important implementation fact for later audit: first- and second-half
“playback” are local presentation states around staged deterministic engine
results. Whether that feels convincingly live is a UX question for later
steps, not an inventory finding.

### 7. Shared Tactical Board

| Item | Current behavior |
| --- | --- |
| Reveal | Match preparation and half-time tactical decision |
| Primary purpose | Place unique players in role-bound normalized slots and expose suitability and current shape |
| States | occupied/empty slot; drag zone; context menu; candidate menu; role change; fixed goalkeeper; bench S1-S8 |
| Data owner | tactical-board draft in the Zustand UI store; durable preparation only after confirmation |
| Component owner | `features/tactics-board/components/*` |
| Logic owner | tactical-board formation, geometry, interactions, roles, state, squad, bench, suitability modules |
| Style owner | `styles/tactical-board.css` plus bounded shared rules |
| Unit evidence | dedicated tests for every tactical-board logic and component area |
| Browser evidence | shared board, tactics workspace, match preparation, full-rebuild, and matchday specs |

### 8. Cross-Surface Feedback And Dialogs

| Surface/state | Owner | Trigger | Evidence |
| --- | --- | --- | --- |
| Command loading indicator and live region | `CommandActivityIndicator.tsx`, store `commandActivity` | every async runtime command | component/store tests and autosave/loading Playwright |
| Calendar advance animation | `CalendarAdvanceTransition.tsx`, store transition | successful Continue across dates | unit tests and Posta Playwright, including reduced motion |
| Dirty-session exit confirmation | `UnsavedCareerDialog.tsx`, App session lifecycle | Main menu with uncommitted session facts | component/session tests and persistence Playwright |
| Manual save/autosave cadence | `CareerSaveControl.tsx`, runtime/session metadata | shell right rail | component/runtime tests and persistence/autosave Playwright |
| Storage recovery | App entry or AppShell recovery alert | persistence setup/command failure | component/runtime tests; browser fault injection not yet canonical |

## Implemented And Future Navigation

| Navigation label | Current status | Defect classification |
| --- | --- | --- |
| Dashboard | Implemented | Audit now |
| Posta | Implemented | Audit now |
| Squad | Future, disabled | Not a current defect |
| Tactics | Future, disabled; tactical board exists only within decisions | Not a current destination defect |
| Calendar | Future, disabled | Not a current defect |
| Fixtures | Used as Matchday shell context, not a standalone list | Audit naming/orientation; do not infer a missing list implementation |
| Market | Future, disabled | Not a current defect |
| Finances | Future, disabled | Not a current defect |
| Youth | Future, disabled | Not a current defect |
| Staff | Future, disabled | Not a current defect |
| Archive | Future, disabled | Not a current defect |

## Source And Style Ownership Measurements

Measurements on the Step 01 baseline:

| Source | Lines | Interpretation boundary |
| --- | ---: | --- |
| `App.tsx` | 630 | Composition and command orchestration concentration signal |
| `career-ui-store.ts` | 579 | UI/session transition concentration signal |
| `CareerMatchdayScreen.tsx` | 1,458 | Strong decomposition/readability audit candidate |
| `CareerMatchPreparationScreen.tsx` | 567 | Shared workspace composition audit candidate |
| `AppShell.tsx` | 317 | Shell policy and layout concentration signal |
| `CareerDashboardScreen.tsx` | 290 | Bounded but information-dense surface |
| `components.css` | 3,319 | Dominant style ownership concentration signal |
| `layout.css` | 707 | Responsive/shell layout concentration signal |
| `tactical-board.css` | 409 | Feature-specific style boundary |
| all web CSS | 4,656 | Baseline for Step 06, not a target metric |

Line count alone is not a defect. Later audit steps must connect any proposed
split to clearer ownership, lower regression risk, or a better player
experience.

## Existing Test Evidence Map

| Layer | Current evidence |
| --- | --- |
| Read models/presenters | `packages/ui/src/career/*` tests plus dashboard, Posta, preparation, and matchday presenter/adapter tests |
| React surfaces | screen and component tests colocated under every implemented feature |
| UI state transitions | `career-ui-store.test.ts`, `use-career-command-runner.test.ts`, app tests |
| Runtime/session/persistence | career session/runtime tests, storage package tests, SQLite worker/browser specs |
| Tactical interaction | dedicated formation, role, geometry, suitability, state, interaction, pitch, menu, and bench tests |
| Browser journeys | 17 current files in `apps/web/src/visual-qa/`, spanning shell, storage, preparation, tactical board, matchday, Posta, responsive behavior, and accessibility |

The canonical current end-to-end product fixture is
`inbox-decision-center.spec.ts`: it resets production OPFS storage, creates a
career, prepares and plays a fixture, returns to Posta, manually saves, reloads,
and exercises Continue/autosave. Older visual specs remain evidence candidates
until Step 07 classifies them as current, overlapping, or legacy.

## Deterministic Fixture Matrix For Steps 02-07

All browser runs must use production storage and deterministic world seeds.
Screenshots belong in a temporary Phase 73A evidence directory, not source.

| Fixture ID | Recipe | Required surfaces/states |
| --- | --- | --- |
| `entry-empty` | Clear OPFS, reload app | Entry ready/no saves, New enabled, Continue disabled |
| `entry-existing` | Create career, manually save, reload | Save selector and Continue |
| `dashboard-unprepared` | New career at deterministic initial date | Dashboard due fixture, preparation blockers, single Prepare action |
| `posta-attention` | Open Posta from the new career | All/To handle/Unread, selected actionable message, desktop and narrow detail |
| `preparation-empty` | Open the actionable message | Empty XI/bench/tactic, board, squad, validation |
| `preparation-ready` | Auto-select and choose balanced tactic | Valid XI/bench/tactic and confirm action |
| `matchday-pre` | Confirm deterministic preparation | Pre-match confirmation and prepared facts |
| `matchday-first-half` | Start match, retain staged first-half presentation | First-half live surface and pending command feedback |
| `matchday-half-time` | Progress to half time | score/events/ratings plus tactical decision workspace |
| `matchday-second-half` | Start second half | second-half live surface |
| `matchday-full-time` | Progress to full time | tabellino, final ratings, consequences, return action |
| `dashboard-post-match` | Return to Dashboard | recent match and result awareness |
| `posta-result` | Open Posta after full time | informational unread result, no false required action |
| `dirty-session` | Change working facts without manual/autosave | dirty save status and Main menu confirmation |
| `calendar-transition` | Continue after a committed fixture | advancing/complete animation and reduced-motion alternative |

Required viewport/media variants:

- Desktop: 1440 x 960.
- Narrow: 390 x 844.
- Text resize: 200% on the narrow Posta and any surface where truncation is
  suspected.
- Motion: normal and `prefers-reduced-motion: reduce` for calendar and command
  feedback.
- Locale sampling: English for stable existing selectors, Italian for product
  copy fit, and German for long-label stress where practical.

## Investigation Candidates, Not Findings

1. `CareerMatchdayScreen.tsx` contains a fallback from the current phase view
   to a legacy-derived phase view. Production caller and checkpoint behavior
   must be verified before classifying or removing it.
2. Matchday owns many internal presentation components in one source file.
   Step 06 must determine whether they are cohesive or conceal competing
   ownership.
3. `components.css` owns most visual rules. Step 06 must map selectors to live
   components before calling any rule dead or moving it.
4. Several Playwright specs predate the latest Posta and matchday flows. Step 07
   must classify overlap and stale assertions instead of deleting by filename.
5. The shell shows future disabled destinations. Step 02 must assess whether
   this aids orientation or creates false affordance, while preserving the
   distinction between product debt and unimplemented roadmap scope.
6. Current browser fault evidence for storage failures is mostly component and
   runtime based. Step 05 must decide whether a deterministic visual recovery
   fixture is required for confidence.

## Inventory Conclusion

The current production web MVP has five reachable screen states, two real
career destinations, one shared tactical workspace, one staged match flow, and
cross-surface persistence/feedback infrastructure. This inventory is complete
enough for Step 02 to judge critical journeys and action economy without
mistaking future sections for broken current features.
