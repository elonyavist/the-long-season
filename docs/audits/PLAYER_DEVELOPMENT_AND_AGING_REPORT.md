# Player Development And Aging Report

Date: 2026-06-21
Phase: `28-player-development-and-aging-v1`
Status: Complete

## Summary

Phase 28 adds the first deterministic player development and aging model.

The model is intentionally engine-level and presentation-neutral. It changes player true abilities only inside explicit development passes and keeps exact hidden potential out of CLI output.

## Growth Model

Growth is implemented by `developPlayersForSeason`.

Inputs:

- durable `CareerState`;
- world seed;
- season ID;
- player ID order from the save;
- current date and birth date for age;
- current abilities;
- true potential.

Determinism key:

```text
worldSeed + seasonId + playerId
```

Growth behavior:

- young players with ability room can improve;
- growth is stronger in the correct age windows;
- growth is biased toward broad-position-relevant abilities;
- off-role attributes grow only lightly;
- no ability can exceed true potential;
- peak-age senior players mostly stabilize.

## Potential Realization

Potential is now modeled as opportunity, not a guarantee.

Each player receives a stable realization modifier derived from the world seed and player ID. Season variance then changes annual outcomes. This means:

- similar prospects can develop differently;
- high-potential players have better upside but are not guaranteed stars;
- low-potential players cannot become stars through randomness;
- long-run development remains deterministic for the same seed.

The engine does not import content archetype names. It infers opportunity from current ability, potential, age, and position only.

## Decline Model

Decline is part of the same development pass.

Outfield players:

- decline starts by broad position age window;
- physical attributes decline before technical and mental attributes;
- late decline can touch technical and mental attributes lightly.

Goalkeepers:

- decline starts later;
- rushing out and footwork decline first;
- reflexes, handling, and goalkeeper positioning decline later.

No retirement, injury effects, contract logic, or staff effects were added.

## CLI Lab Report

The lab command is:

```sh
pnpm cli career --save=<saveId> --development-report
```

It loads an existing save, simulates seven seasons of development in memory, and writes no save.

It reports:

- seasons simulated;
- reviewed players;
- improved players;
- declined players;
- stalled prospects;
- total growth;
- total decline;
- selected-club examples for biggest improver, biggest decline, stalled prospect, and declining veteran.

It does not expose exact hidden potential.

## Smoke Output

Smoke command used:

```sh
pnpm cli career --save=phase28-development-world --seed=world-a --new-world-preview
pnpm cli career --save=phase28-development-world --development-report
```

Observed report:

```text
The Long Season career development report
Save: save:phase28-development-world
Save directory: saves/career
Seasons simulated: 7
Inspection only: the career save is not changed.
Career save written: no
Development aggregate:
  Players reviewed: 22
  Players improved: 13
  Players declined: 10
  Stalled prospects: 0
  Total growth: 63.71
  Total decline: 38.99
Selected-club examples:
  Biggest improver: Giorgio De Santis, age 18->24, growth 12.74, decline 0.00
  Biggest decline: Niklas Keller, age 30->36, growth 0.00, decline 10.01
  Stalled prospect: none
  Declining veteran: Niklas Keller, age 30->36, growth 0.00, decline 10.01
```

## Remaining Limitations

- Development is not yet wired into season rollover persistence.
- The development report advances time in memory only.
- Playing time is not yet an input because the career loop does not persist full season usage data.
- Staff, training facilities, morale history, injuries, and youth intake are not included.
- The model needs Phase 30 long-run reports before final tuning.
- Promotion/relegation and richer calendar identity are still missing.

These limitations are acceptable for Phase 28 because the goal was a deterministic growth/decline foundation, not the final career loop.

## Phase 29 Readiness

Phase 29 can start.

Recommended active next step:

`docs/steps/29-club-identity-and-world-calendar-v1/01-club-identity-source-data-spec.md`

Reason:

- careers can now cross season boundaries;
- players can age, grow, stall, and decline in deterministic reports;
- the next credibility gap before the ten-season report is world readability: club identities are still placeholders and calendar assumptions need review.

## Verification

Passed:

- `pnpm --filter @game/engine run typecheck`
- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck`
- `pnpm exec vitest run packages/engine/src/career/player-development.test.ts`
- `pnpm exec vitest run apps/cli/src/commands/career.test.ts packages/i18n/src/labels.test.ts`
- `pnpm check`
- deterministic development report smoke

Strict `calibration-v1` balance report was not required for this phase because the new development engine is not yet wired into `simulate-season` or match output.

