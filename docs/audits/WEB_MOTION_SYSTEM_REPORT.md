# Web Motion System Report

Date: 2026-07-19  
Phase: `76-web-motion-language-and-football-feedback-system`

## Purpose

This report tracks the production-used Motion for React presentation system in
`apps/web`. Motion must improve feedback, spatial continuity, comprehension, or
football-event hierarchy. It must never own game facts, command completion,
persistence, or Matchday pacing.

## Runtime Baseline

Measurements use the production web build under Node 24.

| Measurement | Before Motion | Step 01 | Final | Final difference |
| --- | ---: | ---: | ---: | ---: |
| CSS | 127.78 kB / 18.00 kB gzip | 127.75 kB / 17.98 kB gzip | 127.84 kB / 17.96 kB gzip | +0.06 kB / -0.04 kB gzip |
| Entry JavaScript | 901.98 kB / 233.77 kB gzip | 942.34 kB / 248.41 kB gzip | 949.25 kB / 249.64 kB gzip | +47.27 kB / +15.87 kB gzip |
| Deferred DOM animation chunk | none | 37.20 kB / 14.07 kB gzip | 37.20 kB / 14.07 kB gzip | +37.20 kB / +14.07 kB gzip |

The DOM animation feature bundle is loaded through one application-level
`LazyMotion` boundary. It is split from the entry chunk and requested only when
a rendered Motion consumer needs it. The pre-existing build warning for the
large application entry chunk remains; Phase 76 may not use Motion to justify
further uncontrolled growth.

## Shared Language

The first production seam contains only values with active consumers:

- `micro`: immediate control and label feedback;
- `transition`: screen or bounded workspace continuity;
- `narrative`: decisive football moments and checkpoint changes;
- `commandPending`: the only shared repeating motion, active only during real
  asynchronous work.

One `MotionConfig reducedMotion="user"` preserves the same state, copy, and
command completion semantics for users who request reduced motion. Reduced
motion removes the repeated transform while retaining the visible progress mark
and pending label.

## Step 01 - Runtime And Command Feedback

### Adopted solution

- Added `motion` only to `apps/web`.
- Mounted one lazy, strict provider at the browser composition root.
- Migrated the shared command indicator from a CSS keyframe to the semantic
  Motion layer.
- Kept a stable spinner column in idle and pending states so labels and buttons
  do not resize.
- Reused the same label for manual save and save-before-exit without creating a
  generic animated button framework.
- Preserved command locking, `aria-busy`, polite announcements, recovery, and
  all existing runtime ownership.

### Verification

- Focused provider and command-indicator tests pass.
- Full web unit suite: 57 files, 239 tests passed.
- Web typecheck passed.
- Production build passed with the measured split chunk above.
- Playwright specifically proves pending feedback remains visible and static in
  an application session started with reduced motion.

### Next motion seam

Step 02 may add restrained shell, navigation, and modal continuity using the
shared runtime. It must not animate business state or introduce a second motion
configuration boundary.

## Step 02 - Shell, Navigation, And Modal Continuity

### Adopted solution

- The persistent club sidebar remains static. Only the current `<main>` outlet
  receives a four-pixel, opacity-led transition keyed by the real shell section
  and mode.
- Existing screen ownership, route commands, and request-animation-frame focus
  transfer remain unchanged; no router or navigation registry was introduced.
- The native dirty-exit dialog uses the shared transition timing while keeping
  `showModal`, Escape, autofocus, pending locks, and focus return authoritative.
- Both native dialogs use one centered, bounded viewport treatment. The save
  dialog remains the existing save surface and the dirty-exit dialog no longer
  falls back to the page origin in full-page layouts.
- No static sidebar item, background, or persistent shell chrome animates on
  destination changes.

### Verification

- Focused shell/frame/dialog tests pass (13 tests); full web suite passes (57
  files / 240 tests).
- Web typecheck and production build pass.
- Playwright passes 19/19 across desktop, wide, narrow, keyboard, 200% text,
  reduced motion, Matchday, and SQLite/OPFS persistence.
- Visual evidence confirms a fixed sidebar between Dashboard and Posta, a
  centered save dialog, and a centered dirty-exit decision dialog.
- A pre-existing visual assertion was corrected: an event-light first half may
  legitimately omit the tabellino instead of rendering an empty record.

### Next motion seam

Step 03 may use the shared language for calendar progression and Posta
attention changes. The calendar command remains the sole owner of dates,
stopping rules, and final destination.

## Step 03 - Continue And Posta Attention

### Adopted solution

- Continue retains its pure sampled-date policy, seven readable ordinary days,
  accelerated long range, and 1.8-second cap. The existing application-level
  reduced-motion signal now comes from Motion instead of a second manual media
  query.
- The app compares the pre-command and post-command current-season Inbox only
  after a successful Continue result. It exposes at most one newly delivered
  blocking or important message ID as ephemeral presentation state; no durable
  lifecycle or animation cursor was added.
- The selected arrival receives one bounded narrative entrance, then clears its
  ephemeral cue. Informational messages stay quiet.
- Posta detail changes use one small directional transition keyed by the real
  selected message and narrow list/detail mode. Existing selection, focus
  transfer, Back focus restoration, filters, pending locks, and responsive
  markup remain authoritative.
- The compact Posta rail can acknowledge an in-place increase in unread or
  action-required counts once; it never pulses or loops.

### Verification

- Focused Continue/Posta/App tests pass (13 tests); full web suite passes (57
  files / 242 tests).
- Web typecheck and production build pass. Entry JavaScript is 944.11 kB / 248.35
  kB gzip; the deferred DOM feature chunk remains 37.20 kB / 14.07 kB gzip.
- Playwright passes 19/19 across desktop, wide, narrow, keyboard, 200% text,
  reduced motion, Matchday, and SQLite/OPFS.
- Desktop Posta list/detail plus narrow list and detail screenshots were
  manually inspected. They preserve the established hierarchy, focus path,
  fixed workspace height, and lack of horizontal overflow.

### Next motion seam

Step 04 may animate only meaningful Dashboard fact changes and bounded widget
entry. It must not turn static metrics into decorative counters or change the
Dashboard information architecture.

## Step 04 - Dashboard Information Change And Widget Motion

### Adopted solution

- The dominant task remounts only when its visible task state, fixture/result
  facts, or readiness blockers change. It uses one restrained four-pixel
  transition and remains actionable immediately.
- League table and league results each derive a stable key from the exact facts
  they render. A newly available or genuinely changed football context settles
  once; unchanged parent renders do not replay it.
- No table row, counter, background, static heading, or unrelated card was
  animated. Dashboard presenters, commands, information hierarchy, and table
  semantics remain unchanged.
- Reduced motion reaches the final state immediately through the shared
  application policy without alternate content or timing logic.

### Verification

- Full web unit suite passes: 57 files / 242 tests; focused Dashboard coverage
  proves exactly three fact-keyed motion owners in attention and ready states.
- Web typecheck and production build pass. Entry JavaScript is 945.12 kB /
  248.59 kB gzip; the deferred DOM feature chunk remains 37.20 kB / 14.06 kB
  gzip.
- Playwright passes 19/19 across all Dashboard states, desktop, narrow,
  keyboard, 200% text, reduced motion, Matchday, and SQLite/OPFS.
- Attention, ready, post-match, and narrow Dashboard screenshots were manually
  inspected. Layout tracks, primary action, football context, and page width
  remain stable.

### Next motion seam

Step 05 may add continuity to real tactical assignments, removals, formation
changes, and substitutions. It must preserve normalized board state, role
zones, suitability, drag ownership, and the approved pitch presentation.

## Step 05 - Tactical Workspace State And Layout Motion

### Adopted solution

- Every canonical XI and bench slot owns one bounded entrance keyed by the
  player and role facts it currently renders. Unchanged slots stay still.
- Formation changes remount the 11 canonical pitch slots only after the
  existing formation transformation has produced the new draft. Pixel
  coordinates, drag movement, role clamping, candidate ranking, and mutation
  remain under the existing tactical Modules.
- Candidate and context menus receive one compact entrance inside their
  existing positioning owner. Outside click, Escape, long press, keyboard, and
  focus behavior are unchanged.
- No exit-presence overlap or shared-layout clone is used, so a player moved
  between XI and bench can never appear twice for animation purposes.

### Verification

- Full web unit suite passes: 57 files / 242 tests. Focused rendering proves
  exactly 11 pitch motion owners and 8 bench motion owners.
- Web typecheck and production build pass. Entry JavaScript is 946.49 kB /
  248.92 kB gzip; the deferred DOM feature chunk remains 37.20 kB / 14.07 kB
  gzip.
- Playwright passes 19/19. It verifies the 19 unique motion owners before and
  after role/shape change and again in the half-time tactical workspace.
- Desktop preparation, narrow preparation, and reduced-motion narrow
  half-time screenshots were manually inspected. Player labels, pitch bounds,
  bench slots, responsive order, and approved board geometry remain stable.

### Next motion seam

Step 06 may improve the already-authoritative Matchday playback and single-line
commentary presentation. Motion must remain subordinate to the existing typed
frame schedule and real command checkpoints.

## Step 06 - Matchday Playback And Commentary Motion

### Adopted solution

- The single polite commentary node now remounts from the current event or
  transition fact and receives one quiet enter transition. There is no exit
  overlap, queue, revealed-event list, or second live region.
- The existing immutable playback frame plan remains the only owner of event
  sampling, frame holds, speed scaling, pause, and checkpoint arrival. Motion
  completion never advances the frame.
- Pause/resume and the three existing speed choices use only bounded press
  feedback while retaining native buttons, `aria-pressed`, stable dimensions,
  and immediate state updates.
- Reduced motion replaces commentary directly while retaining the canonical
  typed playback hold and final checkpoint.

### Verification

- Full web unit suite passes: 57 files / 242 tests; focused Matchday tests prove
  one motion-owned live region and four accessible playback controls.
- Web typecheck and production build pass. Entry JavaScript is 947.11 kB /
  249.14 kB gzip; the deferred DOM feature chunk remains 37.20 kB / 14.07 kB
  gzip.
- Playwright passes 19/19 across event-light/event-rich first and second
  halves, pause/resume, all speeds, narrow, 200% text, reduced motion, and real
  checkpoint stops.
- Opening, paused, ordinary-event, and second-half screenshots were manually
  inspected. Score, commentary, phase rail, controls, and page height remain
  stable.

### Next motion seam

Step 07 may give the score and already-supported decisive structured events a
stronger but bounded narrative hierarchy. It must not invent incidents or
change the existing event holds.

## Step 07 - Decisive Match Event And Score Choreography

### Adopted solution

- A real goal animates only the immutable score side whose structured value
  changed. The first render and refreshed checkpoints remain still, so an old
  result is never presented as a new event.
- The current event-keyed commentary node receives the strongest available
  narrative entrance only for a structured goal. Its existing typed playback
  hold remains the sole pacing owner.
- The compact tabellino animates only the newly mounted goal or substitution
  incident. Existing rows do not replay and ordinary saves, misses, and blocks
  remain visually quiet.
- The superseded CSS goal keyframe was removed. Motion now owns transient
  sequence feedback while static CSS retains color and typographic hierarchy.
- Visual QA exposed that decisive facts became too faint at low initial
  opacity. Narrative entrances now retain high first-frame readability while
  using restrained scale and movement for emphasis.

### Verification

- Full web unit suite passes: 57 files / 242 tests, including score-side,
  event-identity, tabellino synchronization, and event-category assertions.
- Web typecheck and production build pass. Entry JavaScript is 948.29 kB /
  249.45 kB gzip; the deferred DOM feature chunk remains 37.20 kB / 14.07 kB
  gzip.
- Playwright passes 19/19 across opening, ordinary incidents, a real goal hold,
  pause, closing, narrow, 200% text, reduced motion, and SQLite/OPFS.
- Opening, ordinary-event, goal-hold, and closing screenshots were manually
  inspected. The correct score side, commentary, tabellino, controls, and
  stable layout remain coherent.
- `git diff --check` and `graphify update .` pass.

### Next motion seam

Step 08 may make half-time and full-time feel like canonical football
checkpoints and preserve tactical continuity across substitutions and formation
changes. It must not make animation completion own commands, match progression,
or persisted tactical state.

## Step 08 - Half-Time, Full-Time, And Substitution Motion

### Adopted solution

- Canonical phase changes now give the scoreboard and the matching half-time or
  full-time panel one bounded checkpoint entrance. Command completion and
  heading focus remain immediate and do not wait for Motion.
- Phase-tab changes replace one selected panel with an enter-only transition;
  initial mount and restored state remain still, and inactive panels are not
  duplicated for exit choreography.
- The half-time formation, XI, and bench continue to use the shared tactical
  workspace and the Step 05 slot language. No Matchday-only substitution or
  formation owner was introduced.
- A local, ephemeral entered-phase latch survives focus-driven rerenders in the
  current mount, while fresh mounts start still. It is neither Zustand nor
  durable career state and cannot advance or commit the match.
- Reduced motion reaches the same phase, focus target, tabs, commands, and
  football facts without transform interpolation.

### Verification

- Full web unit suite passes: 57 files / 242 tests, including focused phase,
  selected-tab, checkpoint-panel, and shared half-time tactical assertions.
- Web typecheck and production build pass. Entry JavaScript is 949.28 kB /
  249.70 kB gzip; the deferred DOM feature chunk remains 37.20 kB / 14.07 kB
  gzip.
- Playwright passes 19/19 across canonical half-time/full-time arrival,
  normal/reduced motion, tab changes, narrow tactics, SQLite/OPFS, and the
  second-fixture regression journey.
- Half-time arrival, narrow tactical decisions, second-half opening, full-time
  result, and opponent-review screenshots were manually inspected. No overlap,
  cumulative growth, horizontal overflow, or duplicate tactical surface was
  found.
- `git diff --check` and `graphify update .` pass.

### Next motion seam

Step 09 must consolidate accessibility, bundle, dead-code, dependency, and
complete journey evidence. It may delete redundant motion paths, but it must
not add another animated product surface.

## Step 09 - Accessibility, Performance, Cleanup, And Phase Report

### Production ownership inventory

| Category | Production consumers | User-facing reason |
| --- | --- | --- |
| `micro` | command activity label; Matchday pause/speed controls; tactical XI/bench assignment and popovers | acknowledge real work or preserve tactical continuity without resizing controls |
| `transition` | shell outlet; native decision dialog content; Continue date replacement; Posta detail; Dashboard task/context; ordinary commentary; phase tabs; half-time/full-time panels | explain destination or changed football context while persistent navigation and static facts remain still |
| `narrative` | new blocking/important Posta attention; real goal commentary and changed score side; newly mounted decisive tabellino fact; canonical Matchday checkpoints | emphasize a structured football event or required decision once, never permanently |
| `none` | persistent sidebar/navigation; static tables and rows; backgrounds; unchanged Dashboard widgets; ordinary Matchday score; restored checkpoint facts | movement would be decorative or would weaken scanning and trust |

Every target in `web-motion.ts` has at least one production consumer. There is
no generic registry, animation playground, second provider, persisted animation
cursor, or unused preset.

### Cleanup and architecture

- All rendered lazy Motion elements import `m` through `motion/react-m`.
  `motion/react` remains only for the application provider, reduced-motion
  hook, DOM feature loader, and shared `Transition` type.
- The previous calendar-date CSS keyframe and its duplicate media-query branch
  were replaced by the existing shared transition. No hand-written keyframe,
  `animationend`, or `transitionend` listener remains in production web code.
- The two `onAnimationComplete` callbacks only clear one-shot local Posta
  presentation cues. They cannot invoke navigation, commands, persistence,
  Matchday progression, or career mutation.
- Static dependency inspection finds `motion` only in `apps/web/package.json`
  and web source. Domain, engine, content, storage, simulation tools, CLI,
  `@game/ui`, and shared packages remain independent.

### Bundle assessment

- Final CSS is 127.84 kB / 17.96 kB gzip, effectively unchanged from the
  pre-Motion 127.78 kB / 18.00 kB gzip baseline.
- Final entry JavaScript is 949.25 kB / 249.64 kB gzip: +47.27 kB / +15.87 kB
  gzip over the pre-Motion entry. The application already had a pre-existing
  large-entry warning.
- The deferred DOM animation feature remains a separate 37.20 kB / 14.07 kB
  gzip chunk. The Step 09 lightweight-import cleanup reduced the Step 08 entry
  from 949.28 kB / 249.70 kB gzip and removed 0.21 kB of CSS.
- The measured cost is accepted for production-used command, shell, Continue,
  Posta, Dashboard, tactics, and full Matchday feedback. It does not justify
  broadening motion to static product surfaces.

### Accessibility, responsive, and football-quality evidence

- The authoritative Playwright matrix passes 19/19 with normal and reduced
  motion, desktop, wide, narrow, 200% text, keyboard focus, touch long press,
  dirty dialogs, command success/failure, SQLite/OPFS, second-fixture recovery,
  and the complete staged Matchday journey.
- Reduced motion reaches identical facts, focus targets, command results,
  checkpoint states, tabs, and destinations. Motion never carries meaning
  without text, status, color-independent structure, or a live-region owner.
- The full evidence pack under `/tmp/the-long-season-phase76/` was reviewed
  during the nine steps. Primary actions keep stable geometry; Matchday uses one
  replace-in-place commentary line; no cumulative feed growth, horizontal page
  overflow, duplicated tactical board, clipped decision, or focus loss was
  found.
- Management surfaces remain calm. Tactical changes emphasize player/slot
  continuity. Matchday alone receives the strongest hierarchy, and only a real
  goal is stronger than ordinary incidents.

### Final verification

- Web tests: 57 files / 242 tests pass.
- Web typecheck and production build pass under Node 24.
- Playwright visual QA: 19/19 pass.
- Dependency cruiser: 540 modules / 1,929 dependencies, zero violations.
- Full `pnpm check`: 184 files / 1,099 tests plus all workspace typechecks pass.
- Localized presentation text, static ownership/dead-code scans,
  `git diff --check`, and `graphify update .` pass.

## Phase 76 Decision

Phase 76 is complete. The single recommended next phase is **Squad Screen And
Player Memory Foundation**. It should make the current player lifecycle legible
and emotionally useful before Market UI work; it is not started by this phase.
