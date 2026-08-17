# Phase 76 - Web Motion Language And Football Feedback System

## Status

Complete. Steps 01-09 are Done.

## Goal

Introduce Motion for React as one controlled web presentation system that makes
commands feel responsive, navigation understandable, tactical changes coherent,
and decisive football events emotionally legible without turning the product
into an animated dashboard.

## User-Facing Outcome

- Every asynchronous command responds immediately and never appears frozen.
- Screen changes, dialogs, Inbox updates, Continue progression, and dashboard
  updates feel coherent and spatially stable.
- Tactical assignments and substitutions preserve visual continuity without
  changing the approved pitch, role, or drag behavior.
- Ordinary Matchday events stay quick and restrained.
- Goals and other currently supported decisive events receive bounded emphasis
  that improves tension without delaying manager decisions excessively.
- Half time and full time feel like clear football moments rather than abrupt
  component replacement.
- Users who request reduced motion receive the same facts, timing meaning,
  commands, and destinations without unnecessary transforms.

## Entry Gate

1. Phase 75 is complete.
2. The current product gate passes before dependency installation.
3. The shared tactical board remains the approved football visual anchor.
4. Motion remains an `apps/web` dependency and may not enter engine, domain,
   storage, content, simulation tools, shared packages, or `@game/ui`.
5. Existing command, Continue, Matchday playback, persistence, and focus rules
   are the behavioral baseline; this phase changes presentation, not gameplay.

## Locked Product Decisions

### Motion categories

Every browser-visible movement belongs to exactly one category:

- `none`: a static fact or surface that gains no clarity from movement;
- `micro`: immediate press, pending, success, selection, or error feedback;
- `transition`: bounded enter/exit or layout continuity that explains where the
  user is and what changed;
- `narrative`: restrained emphasis for a real structured football event.

The existence of Motion never justifies movement by itself.

### Technical ownership

- Install the `motion` package in `apps/web` with Node 24 and pnpm.
- Use one application-level `MotionConfig` with `reducedMotion="user"`.
- Prefer `LazyMotion` and `m` with the smallest feature bundle used by the
  production paths.
- Keep shared timing, easing, spring, and reusable variants in one deep web
  motion Module with a small Interface.
- Import concrete motion Modules directly; do not add a broad barrel that hides
  bundle ownership.
- Keep ephemeral animation presence, direction, and local sequence state out of
  Zustand and durable storage.

### Behavioral safety

- Animation completion never simulates, saves, navigates, commits a fixture,
  advances a date, or unlocks correctness-critical state.
- Commands and final screen states remain correct when animation is skipped,
  interrupted, or reduced.
- Existing typed product pacing remains authoritative. Motion visual duration
  does not replace Continue date plans or Matchday frame holds.
- No animation introduces cumulative vertical growth, horizontal page scroll,
  clipped text, displaced primary actions, or unstable click targets.
- No infinite decorative loop is allowed. Only a real pending indicator may
  repeat while work is active.

### Football hierarchy

- App entry, shell, dashboard, and tables remain calm and work-focused.
- Posta uses motion to signal a new decision once, not to pulse permanently.
- Tactical changes emphasize continuity of players and slots, not spectacle.
- Matchday is the strongest motion surface because it represents time and
  decisive events.
- Goal treatment is strongest; significant currently emitted incidents are
  secondary; ordinary saves, misses, and blocks remain quiet.
- Do not create dormant penalty, card, injury, crowd, audio, or celebration
  animations before those structured facts and product flows exist.

## Ordered Steps

1. [01-motion-runtime-and-command-feedback-foundation.md](01-motion-runtime-and-command-feedback-foundation.md) - Done
2. [02-shell-navigation-and-modal-transition-language.md](02-shell-navigation-and-modal-transition-language.md) - Done
3. [03-continue-and-inbox-attention-motion.md](03-continue-and-inbox-attention-motion.md) - Done
4. [04-dashboard-information-change-and-widget-motion.md](04-dashboard-information-change-and-widget-motion.md) - Done
5. [05-tactical-workspace-state-and-layout-motion.md](05-tactical-workspace-state-and-layout-motion.md) - Done
6. [06-matchday-playback-and-commentary-motion.md](06-matchday-playback-and-commentary-motion.md) - Done
7. [07-decisive-match-event-and-score-choreography.md](07-decisive-match-event-and-score-choreography.md) - Done
8. [08-half-time-full-time-and-substitution-motion.md](08-half-time-full-time-and-substitution-motion.md) - Done
9. [09-accessibility-performance-cleanup-and-phase-report.md](09-accessibility-performance-cleanup-and-phase-report.md) - Done

## Phase-Level Checks

Run with Node `24.19.0`:

```bash
nvm use 24
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm depcruise
pnpm check
git diff --check
graphify update .
```

## Phase-Level Visual Evidence

The final report must include manually inspected desktop and narrow evidence
for:

- app entry and initial career load;
- command pending, success, and failure;
- shell navigation and dirty-exit/save dialogs;
- short and long Continue progression;
- Posta new-message and list/detail transitions;
- dashboard initial and updated states;
- tactical assignment, removal, formation change, and substitution;
- Matchday event-light and event-rich first/second halves;
- goal emphasis and score update;
- half-time entry, tactical change, full-time entry, and dashboard return;
- keyboard focus, 200% text, and `prefers-reduced-motion: reduce`.

Evidence must prove stable dimensions, no horizontal page overflow, no
cumulative live-feed growth, no focus loss, and no animation-only meaning.

## What NOT To Implement

- No engine, match-calculator, generation, development, market, economy, or
  persistence behavior change.
- No replacement of the tactical board, pitch SVG, normalized coordinates,
  role zones, suitability, or drag implementation.
- No new gameplay event invented to justify an animation.
- No runtime LLM, generated narrative, audio, 2D/3D match viewer, crowd
  simulation, confetti, parallax, or animated background.
- No animation playground, storybook-only component, dormant preset, generic
  animation registry, second UI store, or persisted animation state.
- No broad visual redesign, palette change, typography change, or dashboard
  information-architecture expansion.
- No mass conversion of every CSS transition to Motion.
- Do not start the future Squad, Market, Finance, Youth, Staff, Archive, or
  dashboard-consolidation phases.

## Definition Of Done

- Motion is installed once in `apps/web` and loaded through the documented
  bundle-conscious provider.
- All production-used motion values come from one shared semantic system.
- Current command, navigation, Continue, Posta, dashboard, tactical, and
  Matchday flows use Motion only where it improves feedback or football
  meaning.
- Existing redundant React-state keyframes/manual transition code is removed
  after migration; simple CSS hover/focus/color transitions remain.
- Normal and reduced-motion journeys reach identical facts and destinations.
- Focus, live regions, command locks, save cadence, staged Matchday, and the
  approved tactical board remain correct.
- Web tests, typecheck, build, Playwright visual QA, dependency rules, and full
  `pnpm check` pass.
- The final report documents bundle impact, motion ownership, removed paths,
  accessibility, visual quality, user-facing value, and exactly one next-phase
  recommendation.
