# Step 05a - Headless Public Potential Projection Contract

## Status

Done after rework.

Step 07 proved algebraically and through the complete deterministic matrix that
using the stored ceiling as the public upper estimate makes the visible range
widen as the conservative factor falls with age. This rework keeps the stored
ceiling unchanged and adds a separately modeled public upper estimate.

## Goal

Create and verify the one pure age- and role-aware potential-projection owner
before changing production content, public read models, saves, valuation, or
pixels.

## Expected Files

- `packages/domain/src/balance/player-economy-calibration.ts`
- `packages/domain/src/balance/player-economy-calibration.test.ts`
- `packages/domain/src/balance/index.ts`
- `packages/domain/src/index.ts`
- `packages/engine/src/squad/player-potential-projection.ts`
- `packages/engine/src/squad/player-potential-projection.test.ts`
- `packages/engine/src/squad/public-player-assessment.test.ts`
- `packages/engine/src/market/player-valuation.test.ts`
- `packages/engine/src/test-fixtures/player-valuation-config.ts`
- `packages/engine/src/squad/index.ts`
- `packages/engine/src/index.ts`
- `docs/steps/79d-exceptional-player-generation-prospect-economy-and-non-vacuous-diagnostics/05a-headless-public-potential-projection-contract.md`
- `docs/PROJECT_STATUS.md`
- the next relevant step document only if a lesson changes future work

## Headless Contract

- Keep `Player.potential` as the sole persisted per-ability development
  ceiling. Do not add `potentialFloor`, `potentialCeiling`, a public range, or
  observer knowledge to `Player`.
- Define one stable domain configuration shape for conservative, expected, and
  upper-estimate realization factors by age band and role-development family.
- Engine receives the validated policy, rating scale, player, and game date
  explicitly. It must not import content or invent defaults.
- Derive these ordered ability-space facts:

```text
current ability
<= conservative lower estimate
<= expected realization
<= public upper estimate
<= internal stored ceiling
```

- Map current/lower/upper ability to the canonical global `1..6` half-star
  scale only after the ability-space derivation.
- The lower estimate is not guaranteed. Only current ability/rating is an
  already-realized fact.
- The public upper estimate is a high-upside outcome estimate, not the stored
  ceiling and not a guarantee. The internal stored ceiling remains hidden,
  unchanged, and is never exceeded.
- Derive the projection only from canonical facts:
  - age on the supplied game date;
  - primary role and role-development family;
  - current canonical role ability;
  - internal potential role-ability ceiling;
  - remaining development room.
- Calibrate the policy from the Step 01 deterministic development-outcome
  matrix. Aggregate realized-room outcomes at the exact policy granularity:
  role-development family plus age band. Do not estimate P90 independently
  from the five streams in one cell. Conservative, expected, and public upper
  factors use the predeclared P10/P50/P90 interpretation from the pooled
  deterministic observations. Transfermarkt and other real-market sources
  calibrate money, not fictional star probabilities.
- Require:
  - `0 <= conservative factor <= expected factor <= upper factor <= 1`;
  - current ability never exceeds the lower estimate;
  - the expected estimate remains inside the lower/upper interval;
  - public upper ability never exceeds stored potential;
  - upper ability never exceeds stored potential;
  - `upper factor - conservative factor` never increases with age inside each
    role family independently;
  - goalkeeper and outfield monotonicity are never compared globally;
  - a goalkeeper may retain uncertainty longer only when its independently
    monotone role-specific curve supports it;
  - same facts, date, policy, and scale produce the same immutable result.
- Ages `15..22` must retain a visible range whenever remaining room crosses a
  half-star boundary. When lower and upper map to the same star value, the
  later presentation may collapse to one singular estimate.

## Implementation Checklist

- Add failing table-driven fixtures before implementing the pure function.
- Cover half-star boundaries, ages `15`, `18`, `22`, and later ages, outfield
  and goalkeeper curves, zero remaining room, elite ceilings, and invalid
  policy ordering.
- Add direct table-driven proof that the public width factor is non-increasing
  across adjacent bands in each role family, including the final adult band.
- Keep an explicit defensive assertion that the derived public upper ability
  is at most the stored ceiling even though the validated upper factor is at
  most `10,000` basis points.
- Use stable exported types and useful TSDoc; keep the derivation independent
  of selected club, observer, contract, value, form, reputation, and UI.
- Export the headless owner for Step 05b without changing
  `derivePublicPlayerAssessments` or any production caller in this step.
- Update isolated engine test policies only as required by the new mandatory
  contract field. Their production behavior and assertions remain owned by
  Steps 05b and 06.
- Do not add a production JSON policy or bump a career-stamped version yet.
  Step 05b must adopt the asset and beta-save reset atomically.

## What NOT To Implement

- No content asset, schema, production composition, public assessment, UI read
  model, React, CSS, localization, CLI, or browser change.
- No save/configuration version bump, persistence field, migration, or reset.
- No valuation, asking-price, fee, rarity, generation, development, aging,
  participation, realization-RNG, or long-run change.
- No star-space subtraction shortcut.
- No claim that the conservative estimate is guaranteed.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/domain/src/balance/player-economy-calibration.test.ts \
  packages/engine/src/squad/player-potential-projection.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/engine run typecheck
pnpm depcruise
git diff --check
```

## Definition Of Done

- One pure, deterministic, caller-configured projection owner enforces every
  ordering and age/role invariant.
- The projection is calibrated from Step 01 game-outcome evidence without
  attributing star probabilities to real-market sources.
- No production caller, browser screen, public value, or save changed.
- Step 05b can adopt the owner without duplicating the formula.

## Rework Decision - 2026-07-29

- Keep `Player.potential` as the sole persisted ceiling.
- Add `upperRealizationBasisPoints` to the caller-supplied policy.
- Derive public upper as
  `current + remainingRoom * upperRealizationBasisPoints / 10_000`.
- Treat the public interval as a P10/P90 modeled band with P50 expected
  realization, calibrated from pooled observations per role family and policy
  age band.
- Leave rarity, valuation, public integration, diagnostics, and saves to their
  existing downstream owners.

## Rework Completion - 2026-07-29

- Added the mandatory public upper-realization factor and ordered validation
  `conservative <= expected <= upper <= 10,000`.
- Validation now rejects widening `upper - conservative` across adjacent age
  bands independently for goalkeeper and outfield families.
- The pure engine projection derives a bounded public upper estimate while
  retaining the hidden stored ceiling ability/rating for defensive checks.
- Verification: focused `2` files / `12` tests PASS; domain and engine
  typechecks PASS; dependency boundaries PASS (`762` modules / `2,950`
  dependencies); `git diff --check` PASS.
