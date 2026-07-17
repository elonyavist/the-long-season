# Web Critical Journey And Action Economy Audit

Date: 2026-07-15  
Phase: `73a-web-product-ui-ux-quality-audit-and-premium-design-baseline`  
Status: current-product journey audit; no production changes

## Executive Result

The current web MVP has a coherent outer career rhythm:

```text
App entry -> Dashboard -> Continue/Posta -> Preparation -> Matchday -> Dashboard
```

Career creation, career loading, Continue-to-attention, Posta resolution,
explicit saving, dirty exit protection, and command loading feedback are all
bounded and understandable. The current canonical Posta browser journey passes
on desktop and narrow viewports.

Two P1 journey defects remain:

1. a manager can build the complete preparation draft and lose it on refresh
   without a dirty-session warning;
2. Matchday inserts two reveal clicks after the engine has already calculated
   each half, even though no manager decision exists at those stops.

There are no current P0 journey findings.

## Evidence Run

Current evidence was gathered with Node 24.16.0 and production SQLite/OPFS
storage on isolated browser origins.

| Evidence | Result |
| --- | --- |
| `inbox-decision-center.spec.ts` | 2/2 PASS; canonical desktop journey plus 390 x 844, 200% text, keyboard focus, reduced motion, save/reload, and Continue |
| `career-session-autosave-and-loading.spec.ts` | PASS as the current standalone Chromium lifecycle proof |
| `web-career-persistence.spec.ts` | 2 recovery tests PASS; 2 lifecycle tests FAIL because they still query removed copy `Save and go to match` |
| Current draft probe | 11 XI + 8 bench + balanced tactic before refresh; 0 XI + 0 bench + no tactic after reload; session `dirty=false` before and after drafting |
| Current keyboard probe | New career is first focus stop; Dashboard Prepare match is fourth; Posta Prepare match is seventh |

Current screenshots inspected:

- `/tmp/the-long-season-phase73/01-posta-decision-center-desktop.png`
- `/tmp/the-long-season-phase73/04-calendar-transition-desktop.png`
- `/tmp/the-long-season-phase73/06-posta-detail-narrow.png`
- `/tmp/the-long-season-phase73/07-posta-list-narrow.png`
- `/tmp/the-long-season-phase72/01-pre-match-loading-desktop.png`
- `/tmp/the-long-season-phase72/02-half-time-loading-desktop.png`
- `/tmp/the-long-season-phase72/04-dashboard-loading-narrow.png`
- `/tmp/the-long-season-phase72/05-preparation-loading-narrow.png`

The failing persistence spec is classified as stale QA evidence, not a product
failure: the canonical current label is `Confirm and go to match`, and the
Phase 73 journey completes that path successfully.

## Action Classification

- `Decision`: chooses a football or career outcome.
- `Confirmation`: deliberately commits or begins a meaningful outcome.
- `Navigation`: changes context without changing football facts.
- `Recovery`: protects progress or restores a known state.
- `Bureaucracy`: requires input without a new decision, useful explanation, or
  pacing behavior.

Counts below include explicit pointer/keyboard activations. Passive animation,
automatic route changes, and reading are not counted as clicks.

## Journey Measurements

### J1 - New Career To First Useful Dashboard

Current sequence:

| # | Action | Class | Route/state result |
| ---: | --- | --- | --- |
| 1 | New career | Confirmation | App entry -> Dashboard |

Measurement:

- Actions: 1.
- Screen transitions: 1.
- Confirmations: 1.
- Keyboard: first focus stop, then Enter/Space.
- Loading: visible `Creating career...`, disabled conflicts, polite status.
- Reread: none.

Assessment: within budget. One explicit creation confirmation is appropriate;
there is no wizard that asks the manager to confirm facts the MVP does not yet
allow them to choose.

### J2 - Continue Existing Career

Current sequence:

| # | Action | Class | Route/state result |
| ---: | --- | --- | --- |
| 1 | Select save, only when more than one exists | Decision | Entry selection changes |
| 2 | Continue career | Confirmation | Entry -> Dashboard or resumable Matchday |

Measurement:

- Actions: 1 with the default/only save; 2 when choosing another save.
- Screen transitions: 1.
- Confirmations: 1.
- Loading: visible `Loading career...` and conflict lock.
- Reread: none.

Assessment: within budget. Explicit resume is useful because the main menu is
a stable boundary between sessions.

### J3 - Continue Until Meaningful Attention

Current sequence:

| # | Action | Class | Route/state result |
| ---: | --- | --- | --- |
| 1 | Continue | Decision | Dashboard -> animated date range -> Posta when attention exists; Dashboard otherwise |

Measurement:

- Actions: 1.
- Screen transitions: at most 1 destination transition after animation.
- Confirmations: 0 beyond the Continue command itself.
- Loading: immediate action-specific label and global command lock.
- Attention interruption: only canonical important/blocking facts stop the
  calendar; informational result mail does not create false required work.
- Reduced motion: jumps to coherent stop date without animation.

Assessment: within budget. The engine computes the stop and the UI presents it;
there is no daily click loop.

### J4 - Understand And Act From Blocking Posta

Path after Continue stops in Posta:

| # | Action | Class | Route/state result |
| ---: | --- | --- | --- |
| 1 | Prepare match / Go to match | Decision | Posta -> required workflow |

Path when opened voluntarily from Dashboard:

| # | Action | Class | Route/state result |
| ---: | --- | --- | --- |
| 1 | Inbox | Navigation | Dashboard -> Posta |
| 2 | Prepare match / Go to match | Decision | Posta -> required workflow |

Measurement:

- Actions: 1 from a Continue attention stop; 2 from Dashboard.
- Message selection: the deterministic highest-priority message is selected,
  so no mandatory list click precedes the real action.
- Optional filters: never required for the single current blocking item.
- Keyboard from document start: Dashboard primary preparation is focus stop 4;
  Posta message action is focus stop 7.
- Loading: opening an unread message and executing its workflow are observable.

Assessment: pointer action economy is good. Dashboard remains the club command
centre, while Continue routes meaningful attention into Posta without forcing a
ceremonial Posta visit when a new career already exposes the due match on the
Dashboard.

### J5 - Prepare Team And Enter Matchday

Minimum assisted path from an empty deterministic preparation:

| # | Action | Class | Route/state result |
| ---: | --- | --- | --- |
| 1 | Auto | Decision/delegation | Selects XI and bench through current rules |
| 2 | Tactic tab | Navigation | Opens tactic choices |
| 3 | Balanced/Attacking/Defensive | Decision | Selects a real tactic profile |
| 4 | Confirm and go to match | Confirmation | Preparation -> Matchday pre-match |

Measurement:

- Actions: 4 assisted; manual selection intentionally adds football decisions.
- Screen transitions: 1.
- Football decisions: delegated lineup plus explicit tactic.
- Confirmation: 1, committing a complete plan and entering the no-save match
  boundary.
- Hidden prerequisites: XI, eight-player bench with goalkeeper, and tactic are
  visible through validation; `Auto` satisfies roster constraints.
- Loading: confirmation uses stable button geometry and `Confirming team...`.

Assessment: acceptable action budget. The tactic tab adds one navigation click,
but it protects the board workspace from simultaneous controls. Step 03 should
review discoverability and hierarchy before recommending any change.

### J6 - Complete Regulation Match And Return To Club

Current zero-change path:

| # | Action | Class | Engine/presentation effect |
| ---: | --- | --- | --- |
| 1 | Start match | Confirmation | Engine progresses to half time; first-half playback opens |
| 2 | Play to half-time | Bureaucracy/pacing | Closes local playback and reveals already-computed half-time facts |
| 3 | Start second half | Decision confirmation | Applies half-time plan and engine completes the match; second-half playback opens |
| 4 | Play to full time | Bureaucracy/pacing | Closes local playback and reveals already-computed full-time facts |
| 5 | Return to dashboard | Navigation/acknowledgement | Resolves current match attention and returns to Dashboard |

Measurement:

- Actions: 5 without tactical changes.
- Actual decision stops: pre-match confirmation and half-time continuation;
  full-time return is a deliberate acknowledgement.
- Screen route transitions: Matchday remains one screen; five passive phase
  states are shown; return creates one route transition.
- Tactical actions: optional and proportional to the manager's decisions.
- Loading: both engine commands and return action have action-specific feedback.
- Reread: first-/second-half playback and the next checkpoint repeat the same
  already-computed event facts across adjacent states.

Assessment: P1. Two clicks are neither football decisions nor genuine live
simulation controls. They exist because local React flags hide/reveal the
checkpoint returned by a completed engine command. This makes the core match
feel like a report slideshow.

Decision-derived target budget:

1. Start match.
2. At half time, modify or retain the plan and start the second half.
3. At full time, return to the club.

First- and second-half presentation may still expose an optional skip control,
but normal playback should progress to the decision checkpoint without a
mandatory reveal click. This target removes no football decision.

### J7 - Manual Save And Safe Exit

Current safe-screen paths:

| Intent | Actions | Classification |
| --- | ---: | --- |
| Manual save | Save game: 1 | Explicit career command |
| Leave clean career | Main menu: 1 | Navigation |
| Leave dirty and save | Main menu; Save and exit: 2 | Navigation plus recovery confirmation |
| Leave dirty and discard | Main menu; Exit without saving: 2 | Navigation plus destructive confirmation |
| Cancel dirty exit | Main menu; Cancel: 2 | Navigation plus recovery |

During Matchday, Save and exit is absent and the dialog explains that leaving
discards unsaved match progress. Browser refresh/close receives a native
before-unload warning whenever the runtime working session is dirty.

Assessment: within budget. The extra dirty-exit click is necessary to preserve
trust. Autosave policy controls are secondary and do not obstruct gameplay.

### J8 - Refresh And Resume

| State | Current behavior | Assessment |
| --- | --- | --- |
| Dashboard/Posta dirty runtime facts | Native warning; accepting reload restores last durable baseline; Continue career is one action | Intentional save policy |
| Matchday checkpoint/full time | Native warning; no hidden mid-match save; accepting reload restores baseline | Intentional and clearly documented in matchday save control/dialog |
| Match preparation draft | No warning when only XI/bench/tactic draft changed; reload silently reconstructs an empty draft | P1 progress-loss defect |

The reproduced preparation probe produced:

```text
before refresh: XI=11, bench=8, tactic=balanced, sessionDirty=false
after refresh:  XI=0,  bench=0, tactic=none,     sessionDirty=false
```

The draft is owned by Zustand and is not represented in the runtime session's
dirty state. Manual save commits the runtime career, not the incomplete draft.
This contradicts the visual meaning of a manager having changed the team.

Bounded target behavior:

- preparation edits must participate in unsaved-progress semantics;
- refresh/Main menu must never silently discard a changed draft;
- a deliberate manual or due safe-stop save must be able to restore the
  manager's current preparation work, without reintroducing action-level saves;
- entering Matchday remains the explicit plan confirmation boundary.

## Findings

### P1 - JRN-01: Preparation work is silently lost on refresh

- Evidence: current isolated Chromium probe above; `careerSessionStatus.dirty`
  remains false after Auto plus tactic selection; reload restores 0/11, 0/8,
  and no tactic.
- User impact: selecting a full team is meaningful work. Losing it without a
  warning damages trust in the save model and makes the manager repeat the most
  interaction-heavy pre-match task.
- Owner: Zustand preparation draft, career session dirty projection, and
  durable preparation/save lifecycle.
- Bounded direction: include preparation draft changes in unsaved lifecycle and
  safe-stop persistence; do not add per-action autosave.

### P1 - JRN-02: Match halves require two non-decision reveal clicks

- Evidence: `Start match` already calls `progressMatchdayToHalfTime`; local
  `isFirstHalfPlaybackOpen` controls a second `Play to half-time` reveal. The
  second-half path mirrors this after `completeMatchday`.
- User impact: the flagship loop feels stepped through reports instead of
  unfolding as a match. The manager clicks without making a choice or receiving
  new simulation.
- Owner: Matchday presentation state and playback orchestration; engine staged
  progression remains authoritative.
- Bounded direction: automatic bounded playback to each decision checkpoint,
  with optional skip; preserve Start match, half-time decisions, and full-time
  acknowledgement.

### P2 - JRN-03: Primary keyboard actions sit behind shell awareness controls

- Evidence: fresh Dashboard Prepare match is the fourth focus stop after Inbox,
  compact Matchday awareness, and Main menu. In Posta, Prepare match is seventh
  after Dashboard, Main menu, three filters, and the message row. No skip link
  exists.
- User impact: keyboard users traverse orientation controls before the one
  command the screen visually promotes.
- Owner: AppShell DOM order, compact Posta rail, and screen landmarks.
- Bounded direction: add a robust skip-to-main/decision path or equivalent
  focus strategy; do not hide the Posta context or remove keyboard access to
  filters.

### P2 - JRN-04: One persistence browser journey is stale

- Evidence: desktop and narrow lifecycle tests in
  `web-career-persistence.spec.ts` time out on removed copy `Save and go to
  match`, while the current Posta and autosave journeys pass using `Confirm and
  go to match`.
- User impact: no immediate runtime defect, but stale recovery evidence can hide
  real future regressions and increases false alarm cost.
- Owner: visual QA suite.
- Bounded direction: Step 07 should classify and consolidate the stale path
  around current role-based selectors and one canonical lifecycle.

### Monitor - JRN-05: Dashboard and Posta expose the same matchday destination

- Evidence: a due unprepared fixture exposes Prepare match directly on
  Dashboard and through the Posta matchday message.
- Reason to monitor: this can be either useful context-sensitive access or a
  competing command-centre model. Current entry context resolves the ambiguity:
  New career starts on Dashboard; Continue attention lands in Posta.
- Change gate: act only if Step 03 evidence shows conflicting hierarchy or users
  cannot identify which surface owns the decision history.

## Journey Budgets Derived From Decisions

| Journey | Current minimum | Target | Basis |
| --- | ---: | ---: | --- |
| New career -> Dashboard | 1 | 1 | One explicit creation confirmation |
| Existing career -> current state | 1 | 1 | Default save already selected |
| Continue -> attention | 1 | 1 | One calendar-advance intent |
| Attention Posta -> workflow | 1 | 1 | One decision action after automatic context selection |
| Assisted preparation -> pre-match | 4 | 3-4 | Delegation, tactic decision, plan confirmation; tab navigation may remain |
| Pre-match -> Dashboard after full time | 5 | 3 mandatory | Start, half-time continuation, full-time acknowledgement |
| Manual save | 1 | 1 | Explicit save intent |
| Dirty save-and-exit | 2 | 2 | Navigation plus safety decision |

These are not universal click limits. Manual lineup, formation, substitution,
or tactic work should add exactly the interactions needed for those football
decisions.

## Dashboard And Posta Rhythm Decision

The intended split is currently viable:

- Dashboard is the operational home and exposes the next club action.
- Continue owns calendar rhythm.
- Posta owns explanation, durable current-season history, and decision context
  when Continue stops.

Forcing every Dashboard action through Posta would add bureaucracy. Removing
Posta action routes would make it an ornamental log. The bounded rule for later
work is therefore:

> Entering from Continue should land on the relevant Posta fact; entering from
> Dashboard may take the manager directly to the same real workflow. Both must
> converge on one command and one underlying football state.

## Step 02 Conclusion

The career shell and Posta flow do not need wholesale rerouting. The next audit
must focus on information hierarchy while preserving the measured good paths.
Any eventual remediation phase must first protect preparation work from silent
loss and remove mandatory match reveal clicks that contain no manager decision.
