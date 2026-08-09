# Step 06B4 - Soft Age Resilience And Recovery

## Status

**Done.** The full local gate is green; Step 06B5 is active.

## Goal

Replace flat linear recovery with a content-owned, deterministic recovery curve
that reads elapsed rest, residual load and physical resilience, with age as a
soft modifier beginning around `30` and becoming more visible after `32`.

## User-Facing Reason

A fit veteran can remain decisive, but repeatedly completing matches should
cost him more recovery time than it costs a resilient player in his physical
prime. The manager should gain something by rotating without seeing an
arbitrary “old player” debuff.

## Model Contract

- Age never modifies goals, assists or actor selection directly.
- Same-age players can recover differently because their stamina and physical
  profile differ.
- Age effects are continuous: no cliff at birthdays `30`, `31` or `33`.
- A high-resilience `34`-year-old must be able to recover at least as well as a
  low-resilience `30`-year-old in a reachable real-data case.
- Recovery is derived from the same minute load created by Step 06B3.
- Recent `7`/`28`-day load is derived from participation truth, not persisted as
  a second mutable statistic.
- Existing match condition, control, discipline and injury owners consume the
  resulting starting fitness; no second performance penalty is added.

## Frozen Controlled Bounds

For identical outfield attributes, minutes and starting state:

- ages `18..29` have no age-only recovery penalty;
- at `72` hours after one full match, age `34` retains between `2` and `8` more
  fitness points of deficit than age `24`;
- changing age by one year changes readiness by at most `1` point in the same
  scenario;
- after seven rest days a healthy high-resilience player of any supported age
  can return to at least `95`, preserving exceptional veterans;
- repeated short-rest starts produce more residual deficit than the same total
  minutes separated by ordinary weekly rest.

These are design materiality bounds, not claims that real physiology uses the
game's `0..100` state scale.

## What To Implement

1. Create the requirements-owned `player-state-curves.json`, which is not yet
   present in production. Put tunable magnitudes in that one validated,
   versioned content asset; keep direction and total age-band vocabulary in
   typed code.
2. Derive one recovery capacity from age, physical resilience and rest time.
3. Use a diminishing/non-linear rest curve so `5 x days` no longer erases every
   prior context.
4. Expose structured diagnostic components only when they cannot be derived
   from the canonical inputs; do not store the final recovery twice.
5. Pass the selected policy through app/content composition into engine; engine
   must not import content. Stamp its version in report metadata now. Step 14
   remains the owner of persisted calibration integration and the phase's only
   beta reset.
6. Prove every band and inversion on generated players, not hand-built values.

## What NOT To Implement

- No random fragility trait introduced by this step.
- No training injuries, retirement or development changes.
- No age multiplier on match outcome, goals or assists.
- No new save reset; Step 14 remains the sole Phase 81A reset owner.

## Expected Files

- `packages/content/src/balance/player-state-curves.json` **(new)**
- `packages/content/src/balance/player-state-curves.ts` and test **(new)**;
  schema, validation and supported version selection have one owner
- `packages/domain/src/balance/player-state-curves.ts` and test, plus the domain
  index export. They own the typed policy contract and validation; content owns
  only its versioned magnitudes.
- `packages/engine/src/player-state/fitness.ts` and test
- `packages/engine/src/use-cases/simulate-season.ts` and test. The automatic
  recovery caller must supply player/date/policy facts instead of keeping the
  flat daily rule alive.
- generated-player reachability tests in the content owner selected after
  Graphify/code inspection
- `packages/engine/src/career/career-weekly-recovery.ts` and test if it remains
  a live caller after the shared recovery seam is deepened
- `packages/engine/src/index.ts`
- `packages/content/src/index.ts`
- `apps/cli/src/commands/career/progression.ts` and
  `apps/cli/src/commands/career.test.ts`. The latter owned exact flat-recovery
  output/state pins; it must keep proving partial recovery without restating
  the retired linear result.
- `apps/web/src/features/matchday/matchday-adapter.ts` and test
- `apps/cli/src/commands/fake-season-input.ts`
- `apps/cli/src/commands/simulate-season.ts` and its existing tests. Its opt-in
  fitness demo is a live composition caller and cannot retain an unstamped flat
  recovery path.
- `apps/cli/src/commands/simulate-season/demo-output.ts` and test, plus
  `packages/i18n/src/labels.ts`. The demo currently recomputes `dailyRecovery`
  itself and renders that retired key; it must call the canonical recovery and
  remove the stale label in all five locales.
- `apps/cli/src/commands/simulation-report/career-world-facts.ts` and test. The
  test composes generated players with the engine curve to prove the veteran
  resilience inversion on real content rather than a hand-built fixture.
- `apps/cli/src/commands/simulation-report/career-sections.ts` and test. The
  career report manifest records `playerStateCurves` without recomputing it.
- this step document
- `docs/PROJECT_STATUS.md`
- `06b5-checkpoint-l3-availability-aging-and-injury.md`

Exact caller paths are added here after code inspection and before editing; no
second recovery config, engine-to-content import, unstamped report or persistence
reset is permitted.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/player-state/fitness.test.ts packages/engine/src/career/career-weekly-recovery.test.ts --maxWorkers=7
pnpm check
git diff --check
graphify update .
```

## Outcome

- Recovery now closes a fraction of the remaining deficit rather than adding a
  flat daily amount. Exact minutes remain the sole workload input from 06B3.
- The content-owned `player-state-curves-v1` combines continuous exact-day age
  from `30`, stamina/agility/strength resilience and a diminishing rest curve.
  It is stamped in the canonical report manifest.
- The first linear resilience interpolation failed the frozen seven-seed
  generated-player reachability search: the best age-34 half-life was
  `1.9313313415059856` days against `1.5134739933058166` for the worst age-30
  player. No seed was added or removed. Smootherstep interpolation over the
  same generated corpus made the required exceptional-veteran inversion
  reachable while preserving the neutral midpoint and endpoints.
- Career and season callers now use the same recovery owner. The CLI tests no
  longer encode the retired `100 -> 92 -> -8` flat lifecycle; they prove that
  seven-day recovery is strong but incomplete and one-day recovery remains
  materially partial.
- No injury probability, goal/assist formula, direct age performance modifier,
  persistence schema or beta version changed.
- Final gate: `297` test files, `2260` tests, `863` modules, all custom checks
  and typechecks green; `pnpm check` exit `0`. `git diff --check` and Graphify
  update are green.

## Definition Of Done

Recovery is continuous, age-soft, minutes-aware, resilience-sensitive and
reachable on generated players; old linear recovery and duplicated callers are
gone; match-output formulas are untouched. **Satisfied.**
