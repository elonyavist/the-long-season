# Step 06B22B - Empirical Shooter-Propensity Allocation

## Status

Done - **GO**. The empirical propensity is the only shooter-frequency owner;
the complete repository gate is green and Checkpoint L6.3B is open.

## Entry Gate

Step 06B22A is `GO`. Its accepted StatsBomb baseline is immutable evidence:
`docs/audits/PHASE_81A_STATSBOMB_SHOOTER_PROPENSITY_BASELINE.md`.

L6.3 rejected only shooter concentration: top-ten scoring was `37.38`, while
creator correlation (`0.3197`) and top-ten assists (`10.25`) remained healthy.
Therefore this step may change only who shoots. It may not change opportunity
volume, conversion, creator selection, assists, tactics, player quality, aging,
minutes, transfers or the frozen historical bands.

## Thesis

Formation task allocation answers how a team produces an opportunity. It does
not answer how often one fielded role takes the final shot. The previous 06B22
implementation multiplied shooter quality by `final_third_presence` or
`counter_threat`; this gave strikers `7.71x` a central midfielder's structural
weight before player quality and produced an implausible scoring monopoly.

The corrected selector has two independent, observable inputs:

```text
shooter weight = empirical shots-per-90 propensity of assigned canonical role
               * route-specific shooter task quality of the named player
```

The first term comes only from the frozen external baseline. The second is the
live footballer and route already owned by `shooterTaskQuality(...)`. Absolute
scale cancels in the weighted draw. No output-derived response term exists.

## Versioned Contract

Add one top-level `chanceActorSelection` section to
`MatchTacticsCalibrationConfig`:

```ts
interface ChanceActorSelectionCalibrationConfig {
  readonly shooterPropensityBasisPointsByRole:
    Readonly<Record<CanonicalPlayerRole, number>>;
}
```

Despite the historical name, these are integer ten-thousandths of shots per 90,
not bounded shares. The domain validator must prove:

- the mapping is total over `CANONICAL_PLAYER_ROLES`;
- every value is a non-negative safe integer;
- goalkeeper is exactly zero because the game has no goalkeeper shooter path;
- every outfield role is strictly positive, preserving reachability.

The shipped outfield values are copied exactly from 06B22A: `4,372`, `4,011`,
`4,417`, `7,704`, `12,079`, `13,335`, `13,990`, `18,573`, `18,366`, `20,442`,
and `24,234` in canonical role order. They are externally calibrated content,
not game-output tuning. Content pins the complete mapping and increments the
match-tactics schema and asset versions. No compatibility reader survives: the
project is beta, the asset is supplied by the composition root, and career
state does not persist this config.

## What To Implement

1. Add and validate the one total role-propensity mapping in domain/content.
2. Update the two shared test fixtures; each declares one total mapping rather
   than reproducing selection logic.
3. In `selectChanceActors(...)`, keep creator construction byte-for-byte in
   meaning. Build shooter candidates from the assigned slot's canonical-role
   propensity multiplied by `shooterTaskQuality(...)`.
4. Delete `SHOOTER_TASK_BY_ROUTE` and any comment/helper made obsolete. Rename
   the generic candidate builder if its old task-budget name becomes false.
5. Keep the exact ephemeral `shooterSelectionPool`; conversion still centres
   the selected player's edge on the pool that actually selected him.
6. Extend the real generated-world reachability test so a same-quality role
   comparison reads the versioned propensity in the expected direction, while
   the existing same-role ability swap still reverses.

## Required Proof

- schema refuses a missing/unknown role and the domain refuses goalkeeper > 0,
  outfield zero, negative, fractional and unsafe values;
- shipped content equals the accepted baseline exactly;
- equal-quality shooters have pool weights in the exact ratio of their role
  propensities, independent of route;
- changing route changes quality semantics but never swaps in a second role
  propensity table;
- goalkeeper remains unreachable as shooter; every real outfield role with a
  fielded player remains reachable;
- all existing creator-route/channel tests pass unchanged;
- same seed/context remains deterministic and no main match RNG is consumed;
- focused tests, `pnpm check` alone, `git diff --check`, and `graphify update .`
  are green.

## Staged Exit

- **GO:** every proof above passes and no old shooter-task responsibility path
  or duplicate propensity table remains. Open a fresh L6.3 retry on new seeds.
- **REFINE:** the one empirical mapping is wired but a reachable role or current
  creator/engine invariant breaks. Reopen only this step.
- **STOP / RETHINK:** credible selection still requires a coefficient chosen
  from simulated output, the creator path must change, or the baseline cannot
  be represented without a second owner.

No long-run simulation runs inside this implementation step.

## What NOT To Implement

- no multiplier, divisor, clamp, exponent, age term or role exception;
- no direct use of StatsBomb event data at runtime;
- no separate actor-calibration asset or second composition-root argument;
- no tactical-shape allocation in shooter propensity;
- no creator, assist, conversion or opportunity-volume change;
- no deprecated schema reader, migration, fallback or optional field;
- no generated report, HTML or checkpoint result.

## Expected Files

- `packages/domain/src/balance/match-tactics-calibration.ts` and test;
- `packages/content/src/schemas/match-tactics-calibration.schema.ts` and test;
- `packages/content/src/balance/match-tactics-calibration.json` and test;
- `packages/engine/src/test-fixtures/match-tactics-calibration.ts`;
- `packages/simulation-tools/src/test-fixtures/match-tactics-calibration.ts`;
- `packages/engine/src/match-engine/chance-actors.ts` and test;
- `packages/engine/src/use-cases/simulate-season.test.ts`; its one compact
  golden keeps every team/match fact and re-records only the scorer identities
  and totals that this step intentionally redistributes;
- `apps/cli/src/commands/simulation-report/actor-allocation-reachability.test.ts`;
- this step document, the Phase README and `docs/PROJECT_STATUS.md`;
- the fresh L6.3 retry step only after this step reaches `GO`.

The audit and historical target register are inputs and must not be edited.

## Outcome

- match-tactics schema `3`, asset `match-tactics-calibration-v4`;
- one total content mapping reproduces 06B22A exactly; domain and schema reject
  missing, fractional, unsafe, negative, goalkeeper-positive and outfield-zero
  values;
- shooter weight is now role propensity multiplied by live route task quality;
- `SHOOTER_TASK_BY_ROUTE` and the false task-budget shooter meaning are deleted;
- creator construction is unchanged and all creator route/channel tests pass;
- real generated-player reachability and same-role ability reversal pass;
- the compact season golden changed only its scorer rows (`10/8/8` to `6/5/5`)
  while every team, fixture, chance and result fact remained byte-identical;
- focused typecheck/tests passed; `pnpm check` passed `306/306` files and
  `2392/2392` tests; `880` modules have zero dependency violations;
- `git diff --check` and `graphify update .` are green.

No long-run output was read while choosing the rule or its external values.
Step 06B23A owns a fresh seed population and the unchanged complete reader.
