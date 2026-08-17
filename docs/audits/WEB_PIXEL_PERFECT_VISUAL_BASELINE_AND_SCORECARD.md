# Web Pixel-Perfect Visual Baseline And Scorecard

Date: 2026-07-15  
Phase: `73a-web-product-ui-ux-quality-audit-and-premium-design-baseline`  
Scope: current production web product, audit only

## Executive Result

The current browser product is operational, coherent, and free from horizontal
page overflow in the reviewed states. It is not yet a premium visual baseline.

The review captured 56 deterministic screenshots across app entry, career
shell, Dashboard, Posta, match preparation, every regulation Matchday phase,
and shared feedback states. It covered `1440x900`, `1920x1080`, `390x844`,
keyboard focus, hover, loading, recovery, context menus, dirty-exit dialogs,
`200%` text zoom, and reduced motion.

The scorecard average is `3.59/5`. That number is diagnostic, not a release
percentage. The strongest qualities are purpose clarity (`4.4`) and interaction
feedback (`4.1`). The weakest are maintainability (`3.0`), accessibility and
responsive task priority (`3.1`), and information hierarchy (`3.3`).

There is no visual `P0`. The evidence confirms the existing `P1` findings:

- the current task is displaced by the full career shell on narrow screens;
- oversized headings, repeated framing, and duplicated readiness facts flatten
  operational hierarchy;
- Matchday accumulates phase-specific presentation in one dense surface and
  still asks for two non-decision playback clicks;
- technical fallback values and internal identity leak into manager-facing
  screens;
- keyboard bypass, route-change focus, and blocker-text contrast do not yet
  meet the Phase 73A contract.

The tactical board is the strongest current football visual. Its pitch asset,
normalized geometry, player-token language, and interaction model remain the
approved anchor. The board needs better surrounding hierarchy, not replacement.

## Evidence And Method

Evidence was gathered with Node `v24.19.0`, Chromium, production SQLite/OPFS
storage, deterministic generated careers, and the current Zustand screen state.
No source, CSS, test, translation, runtime, storage, or dependency was changed.

| Evidence | Result |
| --- | --- |
| Phase 73A capture pack | 56 screenshots and 6 manually inspected contact sheets under `/tmp/the-long-season-phase73a/` |
| Final capture manifest | 41 captures recorded in `/tmp/the-long-season-phase73a/manifest-part2.json`; `overflowCaptureCount=0` |
| Earlier 15 captures | app-entry and Dashboard states already measured without horizontal overflow during Step 05 and retained in this pack |
| Current Posta suite | `inbox-decision-center.spec.ts`: 2/2 PASS on desktop, narrow, keyboard, save/reload, text zoom, and reduced motion |
| Current command feedback suite | `career-session-autosave-and-loading.spec.ts`: PASS |
| Manual visual review | every contact sheet and representative full-resolution desktop/narrow state inspected |
| Full-page capture | heights greater than the viewport are intentional and record all reachable vertical content |

Automated geometry is not treated as visual approval. The findings and scores
below come from manual review of the rendered product.

## Deterministic Fixture Legend

| Code | Fixture and prerequisite |
| --- | --- |
| `E0` | `entry-empty`: clear production OPFS and reload |
| `E1` | `entry-existing`: create, manually save, return, and reload |
| `D0` | `dashboard-unprepared`: deterministic new career before preparation |
| `P0` | `posta-attention`: open the current blocking matchday message |
| `T0` | `preparation-empty`: open preparation with empty XI, bench, and tactic |
| `T1` | `preparation-ready`: run Auto and select the Balanced tactic |
| `M0` | `matchday-pre`: confirm the prepared plan |
| `M1` | `matchday-first-half`: start the match |
| `M2` | `matchday-half-time`: play to half-time |
| `M3` | `matchday-second-half`: start the second half |
| `M4` | `matchday-full-time`: play to full time |
| `D1` | `dashboard-post-match`: return after full time |
| `P1` | `posta-result`: open Posta after the played fixture |
| `S0` | shared deterministic fault, command, menu, focus, or dialog state |

The stable match fixture used for the complete second traversal is A.S.D.
Pescara vs Virtus Taranto on `2026-08-01`. The initial unprepared Dashboard
capture uses the deterministic A.C. Lecco career fixture. Club names are
manager-facing facts; internal save and fixture identifiers are not required to
reproduce the visual state.

## Capture Registry

`No H overflow` means the rendered page did not exceed the viewport width.
Findings describe the visible result, not an intended future design.

### App Entry

| ID | Fixture/state | Viewport/media | Screenshot | Overflow | Manual finding |
| --- | --- | --- | --- | --- | --- |
| A01 | `E0`, ready/empty | 1440x900 | `/tmp/the-long-season-phase73a/app-entry/01-empty-1440x900.png` | No H overflow | New career is unmistakable; the screen is visually generic outside the central panel. |
| A02 | `E0`, ready/empty | 1920x1080 | `/tmp/the-long-season-phase73a/app-entry/02-empty-wide-1920x1080.png` | No H overflow | Stable geometry, but unused wide space adds no football atmosphere. |
| A03 | `E0`, ready/empty | 390x844 | `/tmp/the-long-season-phase73a/app-entry/03-empty-narrow-390x844.png` | No H overflow | Actions and preferences stack cleanly and remain readable. |
| A04 | `E0`, German stress | 390x844 | `/tmp/the-long-season-phase73a/app-entry/04-german-label-stress-narrow.png` | No H overflow | Long labels wrap without clipping or overlap. |
| A05 | `E1`, saved career | 1440x900 | `/tmp/the-long-season-phase73a/app-entry/05-existing-save-1440x900.png` | No H overflow | New and Continue paths are explicit; the saved-career selector is understandable. |
| A06 | `E1`, saved career | 1920x1080 | `/tmp/the-long-season-phase73a/app-entry/06-existing-save-wide-1920x1080.png` | No H overflow | The centered panel remains stable but reads as a setup form, not a memorable game entrance. |
| A07 | `E1`, saved career | 390x844 | `/tmp/the-long-season-phase73a/app-entry/07-existing-save-narrow-390x844.png` | No H overflow | Primary actions stay above settings and fit the first useful viewport. |

### Career Shell And Dashboard

| ID | Fixture/state | Viewport/media | Screenshot | Overflow | Manual finding |
| --- | --- | --- | --- | --- | --- |
| D01 | `D0`, attention due | 1440x900 | `/tmp/the-long-season-phase73a/shell-dashboard/01-unprepared-1440x900.png` | No H overflow | Prepare match dominates, but readiness is repeated in fixture, blockers, and attention sections. |
| D02 | `D0`, attention due | 1920x1080 | `/tmp/the-long-season-phase73a/shell-dashboard/02-unprepared-wide-1920x1080.png` | No H overflow | Layout is stable; repeated boxes and large title flatten the operational hierarchy. |
| D03 | `D0`, attention due | 390x844 | `/tmp/the-long-season-phase73a/shell-dashboard/03-unprepared-narrow-390x844.png` | No H overflow | The shell consumes the first viewport before the active Dashboard decision. |
| D04 | `D1`, played fixture | 1440x900 | `/tmp/the-long-season-phase73a/shell-dashboard/04-post-match-1440x900.png` | No H overflow | Continue is clear, but recent-match/internal fallback content weakens trust. |
| D05 | `D1`, played fixture | 390x844 | `/tmp/the-long-season-phase73a/shell-dashboard/05-post-match-narrow-390x844.png` | No H overflow | Career context survives reflow; task priority and vertical economy do not. |

### Posta Decision Centre

| ID | Fixture/state | Viewport/media | Screenshot | Overflow | Manual finding |
| --- | --- | --- | --- | --- | --- |
| P01 | `P0`, selected blocker | 1440x900 | `/tmp/the-long-season-phase73a/posta/01-attention-1440x900.png` | No H overflow | Strong list/detail decision structure and one clear Prepare action. |
| P02 | `P0`, selected blocker | 1920x1080 | `/tmp/the-long-season-phase73a/posta/02-attention-wide-1920x1080.png` | No H overflow | Stable wide layout; the awareness rail still repeats the selected message. |
| P03 | `P0`, detail | 390x844 | `/tmp/the-long-season-phase73a/posta/03-attention-detail-narrow-390x844.png` | No H overflow | Explicit Back flow works, but the full shell precedes the message decision. |
| P04 | `P0`, message list | 390x844 | `/tmp/the-long-season-phase73a/posta/04-attention-list-narrow-390x844.png` | No H overflow | List state is understandable and avoids a squeezed desktop split view. |
| P05 | `P0`, empty Unread filter | 1440x900 | `/tmp/the-long-season-phase73a/posta/05-empty-unread-filter-1440x900.png` | No H overflow | Empty state is specific and does not imply missing data. |
| P06 | `P0`, selected blocker | 390x844, 200% text | `/tmp/the-long-season-phase73a/posta/06-attention-text-zoom-200-narrow.png` | No H overflow | Text remains available, but the current decision starts far below enlarged shell chrome. |
| P07 | `P1`, result detail | 1440x900 | `/tmp/the-long-season-phase73a/posta/07-result-message-1440x900.png` | No H overflow | Informational result is distinct from required attention. |
| P08 | `P1`, result detail | 390x844 | `/tmp/the-long-season-phase73a/posta/08-result-message-narrow-390x844.png` | No H overflow | Result detail remains readable; narrow shell cost persists. |

### Match Preparation And Tactical Board

| ID | Fixture/state | Viewport/media | Screenshot | Overflow | Manual finding |
| --- | --- | --- | --- | --- | --- |
| T01 | `T0`, empty plan | 1440x900 | `/tmp/the-long-season-phase73a/match-preparation/01-empty-1440x900.png` | No H overflow | Board is the visual anchor; repeated blockers and controls compete above it. |
| T02 | `T0`, empty plan | 1920x1080 | `/tmp/the-long-season-phase73a/match-preparation/02-empty-wide-1920x1080.png` | No H overflow | Workspace scales without overlap; dense right-panel facts remain visually secondary. |
| T03 | `T0`, empty plan | 390x844 | `/tmp/the-long-season-phase73a/match-preparation/03-empty-narrow-390x844.png` | No H overflow | Complete workflow is reachable, but the full page is 3429px tall. |
| T04 | `T1`, complete plan | 1440x900 | `/tmp/the-long-season-phase73a/match-preparation/04-ready-1440x900.png` | No H overflow | The populated pitch and bench communicate football decisions immediately. |
| T05 | `T1`, complete plan | 1920x1080 | `/tmp/the-long-season-phase73a/match-preparation/05-ready-wide-1920x1080.png` | No H overflow | Board-first composition remains coherent at wide desktop. |
| T06 | `T1`, complete plan | 390x844 | `/tmp/the-long-season-phase73a/match-preparation/06-ready-narrow-390x844.png` | No H overflow | Board, bench, and tactic survive reflow; shell-first ordering and 3307px height slow use. |
| T07 | `T1`, selected player | 1440x900 | `/tmp/the-long-season-phase73a/match-preparation/07-player-detail-1440x900.png` | No H overflow | Detail tab stays contextual and does not replace the board. |

### Matchday

| ID | Fixture/state | Viewport/media | Screenshot | Overflow | Manual finding |
| --- | --- | --- | --- | --- | --- |
| M01 | `M0`, pre-match | 1440x900 | `/tmp/the-long-season-phase73a/matchday/01-pre-match-1440x900.png` | No H overflow | Scoreboard and Start match are clear; phase facts are repeated below. |
| M02 | `M0`, pre-match | 1920x1080 | `/tmp/the-long-season-phase73a/matchday/02-pre-match-wide-1920x1080.png` | No H overflow | Stable but underuses wide space and football atmosphere. |
| M03 | `M0`, pre-match | 390x844 | `/tmp/the-long-season-phase73a/matchday/03-pre-match-narrow-390x844.png` | No H overflow | One command remains clear after the shell; first useful match content is delayed. |
| M04 | `M1`, first half | 1440x900 | `/tmp/the-long-season-phase73a/matchday/04-first-half-1440x900.png` | No H overflow | Event hierarchy is readable, but Play to half-time is a reveal click, not a manager decision. |
| M05 | `M1`, first half | 390x844 | `/tmp/the-long-season-phase73a/matchday/05-first-half-narrow-390x844.png` | No H overflow | Events reflow into cards; total page length reaches 2207px. |
| M06 | `M2`, half-time | 1440x900 | `/tmp/the-long-season-phase73a/matchday/06-half-time-1440x900.png` | No H overflow | Tactical board creates a real decision moment; watch-list cards are dense and repetitive. |
| M07 | `M2`, half-time | 1920x1080 | `/tmp/the-long-season-phase73a/matchday/07-half-time-wide-1920x1080.png` | No H overflow | Board and decision signals coexist, but the screen still contains too many equal-weight frames. |
| M08 | `M2`, half-time | 390x844 | `/tmp/the-long-season-phase73a/matchday/08-half-time-narrow-390x844.png` | No H overflow | The decision remains possible, but a 4011px page separates evidence, board, and command. |
| M09 | `M3`, second half | 1440x900 | `/tmp/the-long-season-phase73a/matchday/09-second-half-1440x900.png` | No H overflow | Live score and second-half facts are clear; Play to full time is another non-decision gate. |
| M10 | `M3`, second half | 390x844 | `/tmp/the-long-season-phase73a/matchday/10-second-half-narrow-390x844.png` | No H overflow | Event cards remain readable, with high vertical cost. |
| M11 | `M4`, full time | 1440x900 | `/tmp/the-long-season-phase73a/matchday/11-full-time-1440x900.png` | No H overflow | Tabellino, ratings, then consequences is the right order; technical role/fallback copy remains. |
| M12 | `M4`, full time | 1920x1080 | `/tmp/the-long-season-phase73a/matchday/12-full-time-wide-1920x1080.png` | No H overflow | Dense tables are legible, but repeated framed regions weaken the final-whistle story. |
| M13 | `M4`, full time | 390x844 | `/tmp/the-long-season-phase73a/matchday/13-full-time-narrow-390x844.png` | No H overflow | Cards replace horizontal tables successfully; the review still spans 3339px. |

### Shared Interaction And Feedback States

| ID | Fixture/state | Viewport/media | Screenshot | Overflow | Manual finding |
| --- | --- | --- | --- | --- | --- |
| S01 | `S0`, entry primary hover | 1440x900, pointer | `/tmp/the-long-season-phase73a/shared-states/01-entry-primary-hover.png` | No H overflow | Hover is visible and keeps geometry stable. |
| S02 | `S0`, entry primary focus | 1440x900, keyboard | `/tmp/the-long-season-phase73a/shared-states/02-entry-primary-focus.png` | No H overflow | Focus ring is conspicuous and distinct from hover. |
| S03 | `S0`, career creation pending | 1440x900 | `/tmp/the-long-season-phase73a/shared-states/03-entry-create-loading.png` | No H overflow | Initiating command exposes progress without layout shift. |
| S04 | `S0`, storage recovery | 1440x900 | `/tmp/the-long-season-phase73a/shared-states/04-entry-storage-error.png` | No H overflow | Error explains recovery and keeps one Try again action. |
| S05 | `S0`, Dashboard primary focus | 1440x900, keyboard | `/tmp/the-long-season-phase73a/shared-states/05-dashboard-primary-focus.png` | No H overflow | Primary focus remains visible in the denser shell. |
| S06 | `S0`, Continue/calendar pending | 1440x900 | `/tmp/the-long-season-phase73a/shared-states/06-dashboard-calendar-loading.png` | No H overflow | Calendar movement is announced at the initiating command. |
| S07 | `S0`, reduced-motion Continue | 390x844, reduced motion | `/tmp/the-long-season-phase73a/shared-states/07-dashboard-calendar-reduced-motion-narrow.png` | No H overflow | Progress resolves without decorative day animation; narrow task-order issue remains. |
| S08 | `S0`, manual save failure | 1440x900 | `/tmp/the-long-season-phase73a/shared-states/08-career-save-error.png` | No H overflow | Recoverable failure is contextual and does not erase career state. |
| S09 | `T0`, candidate menu | 1440x900, menu | `/tmp/the-long-season-phase73a/shared-states/09-tactical-candidate-menu.png` | No H overflow | Role-relative candidates and suitability are visible at the empty slot. |
| S10 | `T1`, player context menu | 1440x900, menu | `/tmp/the-long-season-phase73a/shared-states/10-tactical-player-context-menu.png` | No H overflow | Context actions stay attached to the selected token. |
| S11 | `T1`, confirmation pending | 1440x900 | `/tmp/the-long-season-phase73a/shared-states/11-preparation-confirm-loading.png` | No H overflow | Pending label appears on the initiating action with stable dimensions. |
| S12 | `M0`, Start match pending | 1440x900 | `/tmp/the-long-season-phase73a/shared-states/12-pre-match-command-loading.png` | No H overflow | Match command feedback is immediate and contextual. |
| S13 | `M2`, second-half command pending | 1440x900 | `/tmp/the-long-season-phase73a/shared-states/13-half-time-command-loading.png` | No H overflow | Half-time decision remains visible while progression is pending. |
| S14 | `S0`, dirty exit protection | 1440x900, dialog | `/tmp/the-long-season-phase73a/shared-states/14-dirty-exit-dialog-1440x900.png` | No H overflow | Choices are safe and explicit; the large top-left dialog feels less polished than the centered product language. |
| S15 | `S0`, dirty exit protection | 390x844, dialog | `/tmp/the-long-season-phase73a/shared-states/15-dirty-exit-dialog-narrow-390x844.png` | No H overflow | All three choices remain reachable and readable. |
| S16 | `S0`, manual save pending | 1440x900 | `/tmp/the-long-season-phase73a/shared-states/16-manual-save-loading.png` | No H overflow | Save feedback is visible at the command and preserves surrounding geometry. |

## Manual Surface Review

### App Entry

The screen has an excellent decision budget: New career, optional saved-career
selection, Continue, language, and currency. It remains a restrained setup
panel rather than a football-world entrance. The large empty canvas, generic
form geometry, and absence of a current-career football signal limit emotional
identity. Narrow and German-label evidence are resilient.

### Persistent Career Shell

Desktop orientation is dependable: club identity, current section, future
destinations, Posta awareness, and exit are easy to locate. Narrow reflow is the
critical defect. It converts the entire shell into a tall first block, so the
manager sees global chrome before the current decision on every primary screen.
Disabled future navigation also retains enough button affordance to increase
visual density without enabling a task.

### Dashboard

Prepare match or Continue is clear. The rest of the screen repeatedly explains
the same state through fixture readiness, blocker copy, Posta awareness, and an
attention section. `unknown`, `none`, internal season formatting, and recent
fixture identity make the command centre look unfinished. The large display
title and equal card borders give low-value summaries too much visual weight.

### Posta

Posta is the strongest non-tactical decision surface. Desktop list/detail,
filters, source, status, structured match facts, and single destination form a
coherent manager workflow. Narrow list/detail switching is correct. The global
shell and awareness card duplicate the active message and become especially
costly at `200%` text size, where the message decision begins far below the
initial viewport despite remaining technically reachable.

### Match Preparation

The approved tactical board gives this screen clear football identity. The
populated XI, fixed bench, formation, role suitability, candidate menus, and
tactic profiles support an actual manager decision. The surrounding validation
strip, readiness counters, toolbar, tabs, save panel, and career-context footer
create a long operational frame. A preparation draft also remains outside the
career dirty-state contract, so visual confidence is not matched by persistence
confidence.

### Matchday Pre-Match And Live Halves

The scoreboard, current phase, one command, and event hierarchy are readable.
The phase rail is visually calm enough to avoid looking like five primary
buttons. The flow still requires Play to half-time and Play to full time even
though neither click contains a manager decision. This weakens pace and makes
the live states feel like report-reveal screens rather than a staged match.

### Half-Time

Half-time is the strongest Matchday state because evidence leads to a real
tactical decision and the approved board remains central. The right-side watch
list and contributor cards repeat names, labels, and status fields in a narrow
column. At 390px the useful parts remain reachable but are separated across a
4011px page, reducing comparison speed at the exact moment the manager needs it.

### Full Time

The macro order is correct: score and match story, tabellino, ratings, then
consequences and return. Goal cards receive stronger emphasis than quieter
facts. The final review still looks like several bordered reports placed in
sequence. `unknown` roles, terse contribution abbreviations, a repeated next
action, and an unavailable save footer expose implementation state instead of
closing the football story cleanly.

### Shared Feedback And Recovery

Pending commands, disabled controls, storage recovery, save failure, reduced
motion, context menus, and dirty-exit protection are materially stronger than
the visual average. Geometry remains stable and feedback appears at the
initiating surface. Focus rings are visible. The dialog placement and generic
feedback framing do not yet share a fully polished component language, but the
underlying behavior is trustworthy.

## Surface Scorecard

Scores use the Phase 73A `1-5` contract. `PDC` is purpose/decision clarity,
`IH` information hierarchy, `FE` flow economy, `IF` interaction feedback, `VC`
visual coherence, `AR` accessibility/resilience, `FI` football identity/fun,
and `M` maintainability.

| Surface | PDC | IH | FE | IF | VC | AR | FI | M | Average |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| App Entry | 5 | 4 | 5 | 4 | 3 | 4 | 2 | 4 | 3.88 |
| Persistent Career Shell | 3 | 2 | 3 | 4 | 3 | 2 | 3 | 2 | 2.75 |
| Dashboard | 4 | 2 | 4 | 4 | 3 | 2 | 3 | 3 | 3.13 |
| Posta | 5 | 4 | 4 | 4 | 3 | 3 | 4 | 4 | 3.88 |
| Match Preparation | 5 | 4 | 3 | 4 | 4 | 3 | 5 | 3 | 3.88 |
| Shared Tactical Board | 5 | 4 | 4 | 4 | 5 | 4 | 5 | 4 | 4.38 |
| Matchday Pre/Live | 4 | 3 | 2 | 4 | 3 | 3 | 4 | 2 | 3.13 |
| Matchday Half-Time | 5 | 3 | 4 | 4 | 4 | 3 | 5 | 2 | 3.75 |
| Matchday Full-Time | 4 | 3 | 4 | 4 | 3 | 3 | 4 | 2 | 3.38 |
| Shared Feedback/Dialogs | 4 | 4 | 4 | 5 | 3 | 4 | 2 | 4 | 3.75 |
| **Lens average** | **4.4** | **3.3** | **3.7** | **4.1** | **3.4** | **3.1** | **3.7** | **3.0** | **3.59** |

## Evidence For Every Score Below Four

| Surface | Lenses below 4 | Evidence |
| --- | --- | --- |
| App Entry | `VC=3`, `FI=2` | A02/A06 show a generic centered form on a mostly unused canvas; football identity is carried by copy and color rather than a current career or football-world signal. |
| Career Shell | `PDC=3`, `IH=2`, `FE=3`, `VC=3`, `AR=2`, `FI=3`, `M=2` | D03/P03/M03 show shell-first narrow ordering; future disabled controls add density; there is no skip link or route-focus transfer; App owns repeated frame composition and broad state wiring. |
| Dashboard | `IH=2`, `VC=3`, `AR=2`, `FI=3`, `M=3` | D01-D05 repeat readiness and blockers, expose `unknown`/`none`/internal identity, use equal framed cards, and place the current decision after shell chrome on narrow. |
| Posta | `VC=3`, `AR=3` | P02 repeats active awareness beside the route; P03/P06 show shell displacement and extreme vertical cost at text zoom despite correct reflow. |
| Match Preparation | `FE=3`, `AR=3`, `M=3` | T03/T06 exceed 3300px full-page height on narrow; preparation draft loss undermines the action path; large screen/CSS ownership surrounds an otherwise reusable board. |
| Matchday Pre/Live | `IH=3`, `FE=2`, `VC=3`, `AR=3`, `M=2` | M01-M05/M09-M10 repeat phase facts, require two non-decision reveal commands, remain long on narrow, and are owned by the concentrated Matchday screen/adapter pair. |
| Matchday Half-Time | `IH=3`, `AR=3`, `M=2` | M06-M08 show repeated shape/status framing and dense signal cards; narrow evidence is 4011px; implementation is part of the same concentrated Matchday owner. |
| Matchday Full-Time | `IH=3`, `VC=3`, `AR=3`, `M=2` | M11-M13 show `unknown` roles, terse abbreviations, repeated next-action/footer facts, uniform bordered reports, and 3339px narrow height. |
| Shared Feedback/Dialogs | `VC=3`, `FI=2` | S14 uses a large top-left dialog unlike the centered product grammar; loading/error/dialog states are behaviorally good but visually generic rather than football-specific. |

The shared tactical board has no score below four. This does not make it
untouchable; it means the evidence supports preserving its current asset and
interaction contract while improving integration around it.

## Cross-Screen Inconsistency Matrix

| Dimension | Evidence | Scope | Severity | Bounded ownership direction |
| --- | --- | --- | --- | --- |
| Operational title scale | Dashboard, preparation, and Matchday display titles dominate more than the current decision | Systemic | P1, confirms `VIS-01` | one operational heading scale in shared page composition; keep display scale for app entry only |
| Current-task placement | full shell appears before active content at 390px and 200% text | Systemic | P1, confirms `IA-01`/`RESP-01` | responsive shell task-priority contract plus bypass/focus behavior |
| Repeated framed surfaces | Dashboard, Matchday, footers, and decision panels use borders at nearly every hierarchy level | Systemic | P1, confirms `VIS-01` | reduce framing by semantic level; no nested-card rewrite of tactical board |
| Technical copy | `unknown`, `none`, internal season/fixture identity, role fallbacks, terse contribution keys | Cross-screen | P1, confirms `IA-02` | fix presenters/read models and localization at the source, not CSS |
| Primary commands | amber filled command remains clear and stable across screens | Systemic strength | Preserve | retain one primary command per decision state |
| Async feedback | pending labels remain local, stable, recoverable, and reduced-motion safe | Systemic strength | Preserve | keep the Phase 72 command activity contract |
| Navigation language | active and disabled destinations share much of the same rectangular button grammar | Shell-local with global visibility | P2, confirms `VIS-07` | demote disabled future destinations without deleting roadmap orientation |
| Readiness narration | Dashboard and preparation repeat blockers, counters, and completion copy | Cross-screen | P2, confirms `IA-03`/`IA-06` | select one summary owner per state; keep exact validation near the action |
| Phase vocabulary | Matchday repeats phase in metadata, scoreboard, rail, review, and footer | Matchday-local | P2, confirms `IA-05` | one phase source in the Matchday read model and one visual rail |
| Tables and compact cards | desktop tables are useful; narrow cards become vertically expensive and labels repeat | Matchday-local | P2 | prioritize selected club and decision facts; preserve structured data access |
| Dialog placement | dirty-exit protection is safe but visually disconnected from centered screen grammar | Shared local | P2 | align dialog geometry through the existing shared feedback owner |
| Tactical board | pitch, tokens, suitability, formation, and context menus form a coherent football language | Shared strength | Preserve | keep pitch asset and interaction model; improve surrounding screen hierarchy |

## Visual QA Ownership Classification

The repository has rich historical evidence but no single executable current
visual baseline. This Step 07 pack is temporary evidence, not a new committed
runner.

| Classification | Current files | Decision |
| --- | --- | --- |
| Current workflow proof | `inbox-decision-center.spec.ts`, `career-session-autosave-and-loading.spec.ts`, `sqlite-opfs-storage.spec.ts` | Retain; these cover current Posta, command, and persistence behavior. |
| Current assertions with bounded stale parts | `web-career-persistence.spec.ts`, `shared-tactical-board.spec.ts`, `squad-list-responsive.spec.ts`, `matchday-information-architecture.spec.ts` | Migrate unique current assertions into one gate before changing or deleting historical files. Known stale selectors/candidate-order assumptions must not be accepted as product failures. |
| Historical phase proof | `architecture-rework.spec.ts`, `continue-inbox.spec.ts`, `interactive-matchday-flow.spec.ts`, `match-preparation.spec.ts`, `matchday-flow-simplification.spec.ts`, `matchday-playable-slice.spec.ts`, `retro-football-identity.spec.ts`, `shell-accessibility.spec.ts`, `tactics-workspace.spec.ts`, `web-ui-full-rebuild.spec.ts` | Preserve until current assertions are inventoried and migrated; do not run all as one release gate and do not delete by filename. |

The current Posta suite and command-feedback suite passed during this step.
`matchday-information-architecture.spec.ts` was not rerun because it writes a
tracked historical audit outside this step's allowed files; the complete
current Matchday journey was instead reproduced and manually captured by the
Phase 73A fixture traversal.

## Pixel-Perfect Contract Result

| Contract | Result | Evidence |
| --- | --- | --- |
| Stable desktop/wide/narrow layout | Pass with hierarchy findings | A01-A07, D01-D05, P01-P08, T01-T07, M01-M13 |
| No horizontal page overflow | Pass | measured capture manifest plus Step 05 browser evidence |
| No clipped labels or overlap | Pass in reviewed states | German stress, narrow screens, context menus, dialogs |
| Useful first viewport | Fail on narrow career screens | D03, P03, T06, M03; shell precedes task |
| Consistent alignment and spacing | Partial | stable token rhythm, but nested frames and exceptions flatten hierarchy |
| Controlled typography roles | Partial | readable families, oversized operational display titles, mixed uppercase metadata |
| Coherent control language | Partial | strong primary command/focus; disabled navigation and phase indicators retain button-like geometry |
| Complete interaction states | Pass with local polish debt | S01-S16 |
| Keyboard primary journeys | Partial | controls are reachable; no skip link and route changes do not focus the new task |
| `200%` text zoom | Pass for access, fail for task priority | P06 |
| Reduced motion | Pass | S07 and current Posta suite |
| Premium football identity | Partial | tactical board and match facts are strong; app entry, shell, Dashboard, and generic feedback remain product-frame heavy |

## Readiness Gate

The product should not move directly into another broad feature slice while
the confirmed `P1` hierarchy, narrow task-priority, accessibility, journey, and
Matchday ownership findings remain open. A rewrite is not supported by the
evidence: package boundaries, runtime/storage ownership, Posta decomposition,
command feedback, and the tactical board are healthy foundations.

The evidence supports a bounded remediation phase that changes only current
workflows and establishes one canonical visual gate. Step 08 must consolidate
the exact scope, dependency order, acceptance evidence, and the single next
phase decision. It must not implement that remediation.

## Phase 73B Closure Update - 2026-07-16

The scorecard above remains the historical Phase 73A baseline. Phase 73B has
now completed the bounded remediation it requested. The current-product review
contains `87` product captures plus three contact sheets under
`/tmp/the-long-season-phase73b/step-10/`, covering `1440x900`, `1920x1080`,
`390x844`, keyboard focus, `200%` text, reduced motion, pointer, touch, loading,
empty, error, recovery, dirty-dialog, and command-pending states.

### Final Eight-Lens Review

| Lens | Result | Current evidence |
| --- | --- | --- |
| Purpose and decision clarity | Pass | App Entry and every loaded-career screen expose one current manager question and one dominant command only when a decision exists. |
| Information hierarchy | Pass | Dashboard, Posta, preparation, live Matchday, interval, and full time each have one fact owner; technical IDs and valid-state fallback copy are absent. |
| Flow economy | Pass | Preparation work is protected; Matchday retains only Start match and the real interval decision; both halves present automatically from canonical facts. |
| Interaction feedback | Pass | Pending, disabled, success, warning, failure, dirty-exit, storage recovery, focus transfer, and reduced-motion states are explicit and geometry-stable. |
| Visual coherence | Pass | App Entry, shell, dialogs, operational screens, and Matchday share one restrained navy/cream/gold football language without redesigning the approved pitch. |
| Accessibility and resilience | Pass | Skip navigation, visible-heading focus, keyboard journeys, dialog focus, narrow reflow, `200%` text, contrast, touch cancellation, and no horizontal page overflow are browser-proven. |
| Football identity and enjoyment | Pass | The App Entry formation mark, concise manager tasks, Posta decisions, football-first Matchday stories, and preserved tactical board make the current loop read as a football product. |
| Maintainability | Pass | Current composition is phase-local, shared state presentation is bounded, obsolete tactical/test runners are removed, and one browser gate owns the accepted product contract. |

The narrow full-time view remains intentionally long because it preserves the
result, decisive incidents, selected-club ratings, and meaningful consequences.
It has no horizontal overflow, overlap, clipped action, or repeated technical
summary, so this is a content-density Monitor item rather than a blocker.

### Authoritative Visual-QA Ownership

| Classification | Current files | Final decision |
| --- | --- | --- |
| Canonical current product | `current-product.spec.ts` | Retained as the single journey, state, responsive, accessibility, and tactical-interaction gate. |
| Unique persistence proof | `sqlite-opfs-storage.spec.ts` | Retained because real SQLite/OPFS isolation and rollback are not presentation assertions. |
| Historical phase runners | all former files in `apps/web/src/visual-qa/` | Deleted only after every still-current assertion was migrated into the canonical gate; historical screenshots and audit prose remain documentation evidence. |

`pnpm web:visual:qa` now runs exactly these two files with one worker and passes
`17/17` scenarios. A production-caller scan reports no unreferenced CSS class
selector. The obsolete `TacticalPitchLineup`, `tactical-pitch-layout`, and
`tactical-board-adapters` test-only paths were deleted after replacement tests
proved that current preparation and half-time both use the shared normalized
tactical board directly.

### Final Pixel-Perfect Contract

| Contract | Final result |
| --- | --- |
| Stable desktop, wide, and narrow layout | Pass |
| No horizontal page overflow, clipped labels, or incoherent overlap | Pass |
| Current task in the first useful viewport | Pass |
| Controlled operational typography and spacing | Pass |
| One coherent command and semantic-state language | Pass |
| Keyboard, focus, `200%` text, reduced motion, pointer, and touch | Pass |
| Premium football identity around the preserved tactical board | Pass |
| Real SQLite/OPFS journey and rollback proof | Pass |

Phase 73B therefore clears the premium-remediation gate. The existing Vite
large-chunk warning remains a measured-impact Monitor item; this phase does not
add speculative code splitting merely to silence build output.
