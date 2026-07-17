# Web Information Architecture And Content Hierarchy Audit

Date: 2026-07-15  
Phase: `73a-web-product-ui-ux-quality-audit-and-premium-design-baseline`  
Status: current-product audit; no production changes

## Executive Result

The current web product has a valid top-level structure: app entry, club home,
Posta, preparation, Matchday, and return to the club each have a distinct
football purpose. Primary actions are generally explicit and structured facts
remain the source of truth.

The hierarchy breaks down in two material ways:

1. at 390 x 844 the persistent shell precedes the current task and consumes
   most or all of the first useful viewport;
2. internal fallback language and one raw fixture ID reach the manager-facing
   UI, most visibly in the post-match Dashboard.

There are no P0 information-architecture findings. There are two P1 findings
and five P2 findings. The tactical board remains the approved football anchor.

## Evidence

Evidence was collected with Node 24.16.0 against the production SQLite/OPFS
adapter on a deterministic local origin.

- Desktop viewport: 1440 x 960.
- Narrow viewport: 390 x 844.
- Current-product screenshots: `/tmp/the-long-season-phase73a-step03/`.
- Current loading evidence:
  `/tmp/the-long-season-phase72/01-pre-match-loading-desktop.png` through
  `/tmp/the-long-season-phase72/05-preparation-loading-narrow.png`.
- Current Posta zoom/empty/filter evidence:
  `/tmp/the-long-season-phase73/06-posta-detail-narrow.png` through
  `/tmp/the-long-season-phase73/08-posta-text-zoom-narrow.png`.
- Source ownership inspected in `apps/web/src/features`, `packages/ui/src/career`,
  and `packages/i18n/src/labels.ts`.

Narrow measurements from current rendered geometry:

| State | Sidebar bottom | Main top | Primary action | First football workspace |
| --- | ---: | ---: | ---: | ---: |
| Dashboard, unprepared | 588 px | 604 px | 746-798 px | fixture card below 844 px |
| Posta detail | 588 px | 604 px | 1359-1399 px | message detail below filters/list |
| Preparation, empty | 588 px | 604 px | 789-829 px | tactical board starts at 1448 px |
| Matchday, pre-match | about 425 px | 441 px | 784-834 px | event/review content below 844 px |

The page does not overflow horizontally, but lack of horizontal overflow is
not sufficient evidence of a useful narrow hierarchy.

## Global Information Levels

Every current screen should use the following reading order:

1. `Decision`: what the manager must decide or confirm now.
2. `Football context`: opponent, score, time, readiness, player state, or event
   facts required for that decision.
3. `Supporting context`: condition, table, history, save state, or filters.
4. `Diagnostic/recovery`: blockers, storage errors, invalid state, technical
   fallback, or destructive-exit guidance.

Diagnostic facts must not displace the football decision. Stable IDs and
adapter/model vocabulary are never manager content.

## Screen Purpose And First-Viewport Contracts

| Surface/state | Manager question | Dominant purpose/action | First useful viewport contract | Current result |
| --- | --- | --- | --- | --- |
| App entry, no saves | How do I begin? | New career | Product identity, New career, disabled Continue with reason; language/currency secondary | Pass |
| App entry, existing saves | Which career do I resume? | Continue selected career | Save identity and Continue before preferences | Pass with minor density risk when save count grows |
| App entry, storage error | Can I recover without losing the screen? | Retry storage | Focused alert, useful failure guidance, Retry | Pass |
| Global shell, desktop | Where am I and what needs attention? | Orient without competing with the active screen | Current destination, compact club identity, current attention, active screen, one dominant screen command | Partial |
| Global shell, narrow | What is my current task? | Reach active content first | Compact identity/current destination and immediate active-screen heading/action | Fail, P1 |
| Dashboard, unprepared | What must I do before the next match? | Prepare match | Opponent/round/venue, preparation readiness, one Prepare action | Partial; the same missing plan is repeated |
| Dashboard, ready/post-match | What happens next? | Continue or Go to match | Next real action, next fixture, latest result, condition only when actionable | Partial; raw ID and empty fallback labels appear |
| Posta, actionable | Why did Continue stop and what do I do? | Open current fact and enter its workflow | Counts, selected message source/subject, football facts, one action | Desktop pass; narrow fail due shell/list displacement |
| Posta, informational | What happened? | Read current-season fact | Subject, date/source, result facts; no fake action | Pass with duplicated historical Matchday context |
| Preparation, empty | Which XI, bench, and tactic will I use? | Build plan | Fixture, compact validation, board controls, tactical board, adjacent candidates | Desktop partial; narrow fail because board begins at y=1448 |
| Preparation, ready | Is the plan valid and ready to commit? | Confirm and go to match | Current shape, XI/bench readiness, tactic, board, one confirmation | Partial; readiness appears in several summaries |
| Matchday, pre-match | Am I ready to kick off? | Start match | Teams, venue/round, readiness, one Start match command | Partial; duplicated ready prose and pre-kickoff `level` |
| Matchday, first/second half | What is happening in the match? | Follow the half until the next decision | Score/minute, current phase, chronological football story, optional pacing command | Partial; latest event is repeated and active story starts below narrow fold |
| Matchday, half-time | What should I change? | Review facts, modify plan, start second half | Score, decisive events, ratings/condition, change count, board/bench, one restart command | Desktop partial; narrow tactical decision is far below fold |
| Matchday, full time | What happened and what are the consequences? | Review and return to club | Final score, decisive match facts, ratings, consequences, Return to Dashboard | Partial; repeated framing and mixed-language labels |
| Dashboard, post-match | What is next after the result? | Continue | Latest result in football language, next fixture, relevant condition, one Continue | Fail where raw fixture ID is visible |

## Surface Review

### App Entry

Keep:

- one product name and short career proposition;
- New career and Continue career as the only primary commands;
- explicit no-save state;
- save selection only when real saves exist;
- language and currency as secondary settings;
- focused storage recovery with Retry.

The entry screen is the cleanest current hierarchy. At 390 x 844 both primary
commands remain above preferences and the no-save explanation is adjacent to
disabled Continue. Preferences are allowed to move below the first decision if
future save selection increases density, but there is no current defect.

### Persistent Career Shell

Desktop shell intent is sound: brand/current club, navigation, attention, main
content, save lifecycle, and career context are separated.

Current hierarchy problems:

- eight disabled future destinations receive the same repeated rectangular
  footprint as live destinations;
- the compact Posta rail is still rendered while Posta itself is active;
- narrow mode stacks the entire navigation, compact Posta, and Main menu before
  the active `main` landmark;
- Matchday removes global Continue and right-side Posta noise but still stacks
  all future navigation above the match.

Disposition:

- keep all future destinations represented because they are roadmap
  orientation, not dead screens;
- demote or collapse their narrow presentation rather than deleting them;
- keep compact Posta awareness on other club screens;
- suppress duplicate Posta awareness when Posta is the active destination;
- put the current screen and its decision before secondary shell context at
  narrow widths.

### Dashboard

The manager question is clear and the top-right action is correctly derived
from readiness. The central content repeats the same pre-match state through:

1. `Saved lineup: missing` and `Saved tactic: missing`;
2. a separate Blockers panel with both missing items;
3. compact Posta `Matchday` attention;
4. a later Attention required summary after Continue stops.

The duplication does not add another decision. A single preparation-status
summary should own readiness, while Posta remains the historical explanation.

Exact current technical/weak content:

- `Next selected-club fixture`;
- `Selected club` with value `22` and supporting `Selected club roster size`;
- `Table context: unknown`;
- `Recent match: none`;
- post-match `fixture:000003: ...`, visibly truncated in the card.

Disposition:

- keep opponent, round, venue, current readiness, condition when it affects
  selection, latest score, and one next action;
- combine readiness and blockers;
- demote roster size to a future Squad summary or career context;
- hide table/recent-match modules when no football fact exists rather than
  render `unknown`/`none`;
- keep the recent score but remove the fixture ID entirely from presentation;
- keep days advanced/stop date only in the bounded calendar transition or
  Posta context, not as a repeated Dashboard diagnostic block.

### Posta

The two-column desktop model is appropriate for a manager decision centre:
filters and message rows on the left, structured detail and one action on the
right. `All`, `To handle`, and `Unread` are bounded and do not block the current
single-message path.

Current issues:

- the shell rail repeats subject and counts while the full Posta screen is
  already active;
- narrow detail does not expose its action until y=1359 because shell and
  message chrome precede it;
- after full time the resolved `Matchday` row can still say `The team is ready
  to enter the match centre` beside the new Match result row;
- metadata uses uppercase status fragments (`Requires a decision`, `Read`) with
  equal weight despite different importance.

Keep current-season history, source, date, subject, football facts, lifecycle,
and one real workflow action. Demote read-state metadata, suppress the active
screen rail duplication, and ensure narrow list/detail navigation does not
precede the manager's selected decision with the full global shell.

### Match Preparation

The tactical board and player adjacency are the correct centre of gravity on
desktop. The approved board must remain the visual and interaction anchor.

Current repeated information:

- blocker strip says lineup, bench, and tactic are missing;
- summary row separately says `0/11` and `0/8`;
- empty pitch/bench slots communicate the same absence;
- current shape appears in controls and board header;
- the disabled confirmation is presented before the manager can see the board
  on narrow screens.

Keep one compact validation summary, formation controls, current shape, board,
bench, role-ranked candidate access, squad list/detail, tactic choices, and one
confirmation. The validation summary must explain what prevents confirmation,
but it need not narrate every empty slot already visible on the board.

At 390 x 844 the board starts at y=1448. The narrow contract therefore fails
even though the layout has no horizontal overflow. The first football tool is
more than one viewport below the top of the page.

### Matchday

The five real phases should remain states, not navigation tabs. Their small
rail is correctly non-interactive.

Pre-match duplicates:

- fixture/venue appears in the score frame and a `Ready to play` card;
- readiness prose appears in the frame and the card;
- `0-0` is labelled `level` before kickoff;
- the large generic `Matchday` title consumes space without differentiating the
  current phase.

Live-half duplicates:

- the latest line appears in the score frame and again in the event feed;
- the engine has already reached 45/90 while the command still says Play to the
  same checkpoint, as recorded in Step 02;
- goal-first hierarchy is useful, but live supporting events should retain an
  obvious chronological reading lane.

Half-time duplicates:

- score and score state appear in the frame and review facts;
- `0/5 changes` appears in the first-half review, board header, and decision
  signals;
- `Current shape` appears above both workspace and board;
- `First-half tabellino`, `Decision signals`, and `Watch list` mix product and
  implementation vocabulary;
- ratings abbreviations (`RAT`, `FIT`, `STAT...`) make the decision column look
  diagnostic rather than managerial.

Full-time hierarchy is directionally correct: score, decisive events, ratings,
then consequences. `Match tabellino` and `Goals first, then the quieter match
facts` are not acceptable English product copy, and the result sentence still
refers to `the selected club` instead of the named side or `your team`.

Disposition:

- keep named clubs, score/minute, current phase, decisive events, live ratings,
  condition, applied substitutions, final consequences, and one phase command;
- remove pre-kickoff score-state prose and duplicate ready card;
- combine repeated score/change/shape facts;
- translate football concepts consistently per locale;
- keep complete event/stat detail below the first decision viewport rather than
  removing it;
- use the focused Matchday shell to put match facts before global navigation on
  narrow screens.

### Loading, Empty, Error, And Recovery States

| State | Current result | Disposition |
| --- | --- | --- |
| App storage loading | Action-specific loading in place, conflicts disabled | Keep |
| App storage error | Focused `role=alert`, reason, Retry, current screen preserved | Keep |
| Career command pending | Stable button geometry, spinner, explicit verb, global lock/live region | Keep |
| Empty Posta/filter | Clear `No messages match this filter` or empty-inbox copy | Keep; do not invent decorative mail |
| Empty Dashboard facts | Renders `unknown` and `none` | Remove modules or provide a football-specific unavailable reason |
| Incomplete preparation | Explicit blockers and disabled confirmation | Keep one compact validation owner; remove duplication |
| No major Matchday events | Explicit empty event state | Keep when no structured event exists |
| Save unavailable in Matchday | Explains why save is unavailable | Keep, but secondary to match facts |
| Dirty exit | Explicit save/discard/cancel choices | Keep; this is recovery, not bureaucracy |

## Content Disposition Matrix

| Current content | Evidence/owner | Disposition | Where the fact remains inspectable |
| --- | --- | --- | --- |
| Raw `fixture:000003` in recent match | `CareerDashboardScreen.formatRecentMatch` and `career.dashboard.recentMatchLine` | Remove from product copy, P1 | Stable ID remains in domain/storage/debug evidence; named clubs and score stay on Dashboard/Posta |
| `selected-club` labels | i18n dashboard, preparation, and Matchday keys | Replace with named-club or natural manager language | Structured selected-club relation remains in `@game/ui` views |
| `unknown`, `none`, `missing` as card values | common/dashboard i18n fallbacks | Hide empty module or use specific guidance | Error/recovery surfaces may retain a precise reason |
| Saved lineup/tactic plus duplicate blockers | Dashboard screen/presenter | Combine | Readiness remains on Dashboard, Posta detail, and preparation validation |
| Roster size 22 as a Dashboard signal | Dashboard signal grid | Move/demote | Future Squad overview or compact career context |
| Compact Posta rail while Posta active | `AppShell` plus `CareerInboxScreen` | Remove only the duplicate active-screen rendering | Rail remains on other club screens; full history remains in Posta |
| Disabled future sections | `AppShell.SIDEBAR_ORDER` | Keep orientation, demote/collapse narrow | Full roadmap labels remain available without displacing current task |
| Pre-match `level` | Matchday score state | Remove before kickoff | Draw/lead/trail remains meaningful after play begins |
| Duplicate Matchday ready/live lines | score frame plus phase card/feed | Combine | Full event/report detail remains below the score frame |
| `tabellino` in English | Matchday i18n labels | Localize consistently | Structured event groups remain unchanged |
| Repeated half-time shape/change counts | Matchday half-time sections | Combine around the decision workspace | Board and substitution summary remain inspectable |

## Findings

### P1 - IA-01: Narrow shell displaces the active decision

- Evidence: at 390 x 844 the sidebar ends at y=588; Posta action is at y=1359,
  preparation board begins at y=1448, and Matchday football story begins below
  the first viewport. Screenshots and geometry are recorded above.
- User impact: the manager sees disabled future navigation and duplicate Posta
  awareness before the task they opened. Preparation and half-time decisions
  feel buried, and keyboard/zoom users traverse the same hierarchy.
- Owner: `AppShell`, shell read-model mode, `layout.css`, and per-screen narrow
  composition.
- Bounded direction: preserve destinations and facts, but introduce a compact
  narrow shell/focused Matchday hierarchy that puts `main` and its current
  action before secondary navigation/context.

### P1 - IA-02: Technical identity and fallback values leak into football UI

- Evidence: post-match Dashboard renders `fixture:000003`; current cards render
  `selected-club`, `unknown`, `none`, and `missing`; English Matchday renders
  `tabellino`.
- User impact: the career world stops feeling authoritative and premium. Raw
  identity and backend fallback language make valid states look unfinished.
- Owner: Dashboard formatter, i18n labels, and screen-level fallback decisions.
- Bounded direction: never render stable IDs; use named football facts; omit
  unavailable summary modules; reserve diagnostic reason text for recovery.

### P2 - IA-03: Dashboard readiness is narrated repeatedly

- Evidence: saved-plan rows, Blockers, compact Posta, and attention-stop copy
  describe the same missing preparation.
- User impact: scanning cost rises without adding a decision.
- Bounded direction: one readiness owner in the command deck; Posta retains the
  durable explanation and history.

### P2 - IA-04: Active Posta repeats its own awareness rail

- Evidence: subject/count rail and full Posta workspace are simultaneously
  visible on desktop and narrow.
- User impact: duplicate context consumes space and obscures list/detail
  ownership.
- Bounded direction: show compact awareness only outside Posta.

### P2 - IA-05: Matchday repeats phase facts and mixes vocabulary

- Evidence: duplicated ready/live lines, pre-kickoff `level`, repeated score,
  shape and change counts, and mixed `tabellino`/English labels.
- User impact: the match centre feels assembled from diagnostics rather than
  one broadcast and decision hierarchy.
- Bounded direction: one score frame, one phase story, one decision workspace,
  and locale-consistent football terms.

### P2 - IA-06: Preparation validation competes with the approved board

- Evidence: blocker strip, counters, empty slots, and disabled confirmation all
  communicate incompleteness before the board.
- User impact: the manager reads status prose before interacting with the most
  useful football tool.
- Bounded direction: retain one compact validation summary and make the board
  the first workspace after fixture context.

### P2 - IA-07: Future navigation behaves like current content density

- Evidence: eight disabled destinations use the same rectangular footprint as
  Dashboard/Posta on every current screen.
- User impact: false visual affordance on desktop and severe displacement on
  narrow screens.
- Bounded direction: retain roadmap orientation but visibly and spatially
  demote unavailable destinations, especially in compact mode.

## Locked Content Baseline For Later Remediation

Later work must preserve:

- one explicit primary command per decision state;
- Dashboard as operational home, Continue as calendar rhythm, Posta as durable
  current-season decision/history context;
- one real preparation confirmation boundary;
- tactical board and bench as the preparation/half-time football workspace;
- staged engine facts, ratings, condition, events, substitutions, and
  consequences;
- explicit loading, save, storage recovery, and dirty-exit feedback;
- complete details below the first useful viewport rather than deleting them.

Later work must not preserve:

- raw IDs or generic backend fallbacks in product copy;
- repeated readiness, shape, score, or change facts;
- a full disabled navigation catalogue before the active narrow task;
- duplicate compact Posta awareness while Posta is active;
- mixed-locale football terminology.

## Step 03 Conclusion

The product does not need a new route model to fix its content hierarchy. It
needs a bounded shell hierarchy, one owner for repeated readiness facts, and a
strict football-language boundary between structured data and presentation.
Step 04 may now judge visual execution against these screen-purpose contracts
instead of rewarding visual consistency that merely repeats the wrong content.
