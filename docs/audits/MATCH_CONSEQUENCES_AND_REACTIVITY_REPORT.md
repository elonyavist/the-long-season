# Match Consequences And Reactivity Report

Date: 2026-06-29
Phase: `64-match-consequences-and-player-state-reactivity`
Status: Complete

## Summary

Phase 64 makes played selected-club fixtures affect player state in a bounded,
deterministic, football-plausible way.

The manager can now see that match preparation has consequences after the
fixture: starters spend fitness as before, and selected-club starters can also
gain or lose `form` and `morale` from structured match facts.

No match tuning, player-generation tuning, injury logic, team talks, bench
dissatisfaction, market behavior, or web UI was added in this phase.

## Implemented Module

The new engine Module is:

- `packages/engine/src/career/career-match-state-consequences.ts`

Public Interface:

- `applyCareerMatchStateConsequences(input)`

The Interface takes:

- current immutable `playerStates`;
- `selectedClubId`;
- the played `fixture`;
- the durable `MatchReport`;
- ordered selected-club starter IDs.

It returns:

- a copy-on-write `playerStates` lookup;
- ordered player-level consequence facts;
- an aggregate consequence summary.

The Module emits only structured facts. It does not render prose, localize text,
inspect tactics, spend fitness, infer advice, or create unsupported player
psychology.

## State Values Affected

Existing behavior preserved:

- starter fitness spend still happens through the existing condition path;
- weekly recovery and season rollover remain separate systems.

New v1 behavior:

- selected-club starter `form` can move after a played fixture;
- selected-club starter `morale` can move after a played fixture.

Bounds:

- `form`: capped to `-5..+5` per match;
- `morale`: capped to `-4..+4` per match;
- final state values are clamped to `0..100`.

## Consequence Reason Keys

The engine exposes stable language-agnostic reason keys:

- `result_win`
- `result_draw`
- `result_loss`
- `team_clean_sheet`
- `team_heavy_loss`
- `player_goal`
- `player_assist`
- `goalkeeper_saves`

These keys are facts, not labels. CLI, web, and future presentation Adapters
must localize them before showing them to the user.

## Integration Point

`packages/engine/src/career/progress-fixture.ts` now applies selected-club
fixture progression in this order:

1. Simulate the selected fixture.
2. Build and apply the durable match report.
3. Spend selected starter fitness.
4. Apply selected starter `form` and `morale` consequences.
5. Return the copied career state and structured consequence facts.

This order means the next fixture can consume the changed player state through
the existing team-strength state multiplier path when callers supply those
curves.

## CLI Inspection Output

The career advancement output now includes a compact post-match player-state
section when fixture progression produces changes.

The output is intentionally inspectable, not advisory:

- changed player count;
- total form delta;
- total morale delta;
- player before/after form and morale values;
- signed deltas;
- localized reason labels.

The CLI still does not recommend rotations or make manager decisions.

## Deterministic Checks Run

Focused checks used during the phase:

- `pnpm exec vitest run packages/engine/src/career/career-match-state-consequences.test.ts`
- `pnpm exec vitest run packages/engine/src/career/progress-fixture.test.ts`
- `pnpm exec vitest run apps/cli/src/commands/career.test.ts`
- `pnpm exec vitest run packages/engine/src/match-engine/team-strength.test.ts`
- `pnpm exec vitest run packages/engine/src/career/player-season-rollover.test.ts`

Broad checks:

- `pnpm check`
- `pnpm cli ten-season-report --seed=phase64-world --seasons=10`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

Step 07 originally found an unrelated content-test timeout in
`packages/content/src/generators/fake-players.test.ts`. Step 07a stabilized
that test by replacing an 80-world scan with two deterministic seed fixtures
that preserve the product contract: rare prodigies are possible, but not
guaranteed. No gameplay tuning changed.

## Command Output Summary

The Phase 64 smoke save advanced a selected-club fixture and showed the new
state reactivity:

- selected-club starters spent fitness;
- starters received form/morale movement from result and durable match facts;
- the squad inspection afterwards showed changed starter `Fit`, `Form`, and
  `Morale` values while rested players remained unchanged.

The ten-season report and strict balance report remained passing after the
change. That is important because this phase is about player-state reactivity,
not match result retuning.

## Residual Risks

The current model is intentionally narrow:

- only selected-club starters receive v1 form/morale changes;
- substitute minutes are not modeled yet;
- bench dissatisfaction is excluded because durable bench/minute facts do not
  exist yet;
- negative individual blame is excluded because the match report does not yet
  contain reliable defensive mistake facts;
- injuries, cards, suspensions, personality, team talks, staff, training, and
  media remain future systems;
- web does not yet expose the playable matchday loop.

These are not blockers for the next step. They are future feature seams that
need their own durable facts and tests before affecting state.

## Next Phase Recommendation

Proceed to:

- `Phase 65 - Web Matchday Playable Slice`

Reason:

The user can already prepare lineup, bench, formation, and tactic in the web
prototype. Now that playing a fixture produces structured result and
player-state consequence facts, the next product value is to let the manager
play or advance the next fixture from the web flow, see the result, see the
consequences, and return to an updated dashboard.
