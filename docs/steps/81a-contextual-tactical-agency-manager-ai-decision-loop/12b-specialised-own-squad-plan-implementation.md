# Step 12B - Specialised Own-Squad Plan Implementation

## Status

**Done on 2026-08-13.** Step 12A froze Amendment A8 before implementation. The
development-only A/B reachability lane then falsified comparison on raw
capacity levels. Amendment A9 froze task-specific standardisation before its
production implementation; D2 remains untouched and is next.

## Goal

Ship the six frozen plans through one versioned owner used identically by
manager UI, career AI, automatic matches and web opponents, without changing
match formulas or reading the opponent.

## What To Implement

- Replace generic profile keys and content rows with Amendment A8 verbatim.
- Keep one conserved fit evaluator; do not add route prediction, readiness,
  result scoring or another table. Standardise each capacity with Amendment
  A9's single versioned reference/scale pair before applying the conserved
  demand rows.
- Advance the match-tactics content version. The schema version changes only if
  the serialized shape changes; a vocabulary/content change alone is not a new
  schema.
- Remove obsolete generic labels, fixtures and assertions in the same change.
- Prove every plan and focus is reachable on the already-observed A/B
  development populations. Those populations may test reachability and wiring;
  they may not decide D2 result materiality.
- Prove manager and AI read the same plan objects and CLI/web paths remain
  byte-equivalent for the same world and fixture.

## Expected Files

- `packages/domain/src/balance/match-tactics-calibration.ts`
- `packages/domain/src/balance/match-tactics-calibration.test.ts`
- `packages/content/src/balance/match-tactics-calibration.json`
- `packages/content/src/balance/match-tactics-calibration.test.ts`
- `packages/content/src/schemas/match-tactics-calibration.schema.ts`
- `packages/content/src/schemas/match-tactics-calibration.schema.test.ts`
- `packages/engine/src/team-selection/own-squad-tactical-policy.ts`
- `packages/engine/src/team-selection/own-squad-tactical-policy.test.ts`
- `packages/engine/src/career/career-ai-team-selection.test.ts`
- `packages/engine/src/career/progress-fixture.test.ts`. Its candidate-count
  assertion follows the one canonical vocabulary; retaining `9` would make the
  test reject the new product while production compiled.
- `packages/engine/src/use-cases/simulate-season.test.ts`. Its observed profile
  vocabulary is the automatic-match equality guard.
- `packages/engine/src/test-fixtures/match-tactics-calibration.ts`
- `packages/simulation-tools/src/test-fixtures/match-tactics-calibration.ts`
- `apps/cli/src/commands/simulation-report/tactical-agency-world.test.ts`
- `packages/simulation-tools/src/tactical-agency/own-squad-agency-audit.ts`.
  Initializes reachability from the total domain vocabulary; stale generic keys
  would create permanent zero-count failures in D2.
- `packages/simulation-tools/src/tactical-agency/own-squad-agency-audit.test.ts`
- `apps/web/src/features/match-preparation/match-preparation-adapter.test.ts`
- `apps/web/src/features/matchday/matchday-adapter.test.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`. Replaces the removed generic profile-key
  assertion with one specialised manager-visible key.
- `docs/audits/PHASE_81A_OWN_SQUAD_CAPACITY_STANDARDISATION_AMENDMENT.md`
  **(new)**. Freezes the development-population normalisation before the
  production evaluator is changed; D2 supplies the out-of-sample decision.
- `docs/audits/PHASE_81A_SPECIALISED_OWN_SQUAD_PLANS_AMENDMENT.md`. Records
  that A9 supersedes only A8's raw-scale fit sentence, not its plans or gates.
- `docs/audits/PHASE_81A_CONTEXTUAL_TACTICAL_AGENCY_DESIGN_CONTRACT.md`
- `docs/audits/README.md`
- `docs/PROJECT_STATUS.md`
- the phase `README.md`
- this step document
- `12c-checkpoint-d2-specialised-own-squad-agency.md`

Discovered callers enter this list with ownership before modification. Storage
and match-engine formula files are outside scope.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/engine/src/team-selection/own-squad-tactical-policy.test.ts \
  packages/engine/src/career/career-ai-team-selection.test.ts \
  apps/web/src/features/match-preparation/match-preparation-adapter.test.ts \
  apps/web/src/features/matchday/matchday-adapter.test.ts
pnpm check
pnpm --filter @game/web run build
pnpm web:visual:qa
git diff --check
graphify update .
```

## Definition Of Done

Six specialised plans are active and reachable through one content owner;
generic presets leave no residue; no opponent/result input or direct bonus
exists; all product paths agree; D2 remains untouched and is next.

## Pre-Implementation Reachability Correction

The existing A/B development lane contains `378` production selections across
seven worlds. Raw weighted capacity levels selected only `direct_transition`
(`319`) and `compact_counter` (`53`) plus six old non-commits; cosine and two
relative projections also left at least three plans unreachable. The issue is
unit scale: ordinary `counter_threat` and `final_third_presence` sit above
ordinary `pressing_cohesion`, so a raw cross-capacity comparison prices the
task calibration rather than the club's specialization.

Amendment A9 uses the same A/B rows only to derive one mean and population
standard deviation per capacity, quantized to nearest basis point. With the
formula frozen there and those quantized values, the diagnostic distribution
  is `1 / 67 / 3 / 60 / 200 / 47` in canonical plan order. The initially
  printed `159 / 43 / 3 / 32 / 107 / 34` zeroed only `balanced`; implementation
  caught and corrected that scratch-account contradiction before D2. This is development
reachability, never evidence that D2's result bands pass. No D2 seed has been
generated or inspected.

## Outcome

The six named plans now replace the three generic presets through one v11,
schema-v9 calibration owner. The selector standardises all twelve capacities,
reads every plan through its conserved demand row, applies the same result to
career AI, automatic matches and manager-visible web preparation, and has no
opponent or predicted-result input.

The canonical seven-world A/B lane selects all six plans with counts
`1/67/3/60/200/47`, all three focuses and unique maxima. Catalog reversal is
bit-identical. The initially printed balanced-zero scratch account was rejected
and recorded before D2 rather than reproduced in product code.

Verification: targeted ownership/reachability `79/79`; product-path suite
`119/119`; full `pnpm check` `317` files / `2536` tests / `902` modules with
exit `0`; web build green; Playwright visual QA `38/38`; `git diff --check`
green; Graphify rebuilt. Step 12C is open.
