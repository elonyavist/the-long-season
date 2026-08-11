# Step 06B19C - Checkpoint L6.1C: Common-Support Renewal Attribution

## Status

**Done on 2026-08-11: `STOP / RETHINK: antagonistic`.** All three viable arms
completed and reconciled, but role-aware market logic reduced the frozen four-
formation replication metric materially and coherently in `5/7` paired worlds.
No market, blueprint or joint renewal correction is authorized.

## TESI

The exact pre-06B16 `off/off` control is not a viable ten-season world on the
frozen corpus. Repairing its finances, replacing its seed, shortening its
horizon or using six survivors would manufacture support. The product-relevant
question can still be answered on the three viable corners around the current
game: what is lost when role-aware market logic is removed while the blueprint
stays, and what is lost when the blueprint is removed while role-aware market
logic stays?

This leave-one-component-out design estimates conditional necessity. It cannot
estimate standalone main effects or the market/blueprint interaction, and the
report must say so. A correction opens only when a component has a material,
coherent, player-linked contribution on fresh paired worlds.

## Frozen Population And Estimand

One canary and one full locked profile, both through `simulation-report`:

```text
canary profile: phase81a-renewal-common-support-l6-1c-canary-7x1
full profile: phase81a-renewal-common-support-l6-1c-7x10
seed prefix: phase81a-renewal-common-support-l6-1c-v1
worlds: 7
seasons: 10
workers: exactly 7
```

The full profile runs three serial arms on the same seven world seeds:

- `current`: market on, blueprint on;
- `without_market`: market off, blueprint on;
- `without_blueprint`: market on, blueprint off.

The current arm is simulated fresh, not borrowed from L6.1B. Different
questions use different declared populations, and the paired arms need the
same generation prefix from season zero. Every arm has a separate cache key and
records its actual policy signature.

The A6 metric floors, historical target readers, unique-need definition,
origin derivation and linked player-path rules remain frozen. This step adds no
new balance threshold.

The `7 x 1` canary uses separate seeds, exercises all three policy signatures,
requires zero purity/reconciliation failures and writes
`balanceDecision = not_evaluated`. Its values never enter attribution.

Before either profile evaluates its own population, its first serial stage
reruns only `phase81a-renewal-refinement-l6-1a-v1-world-00005` for ten seasons
on one worker under the historical off/off policy. Keeping this preflight in
the same locked profile artifact makes the control account impossible to omit
from a later reproduction command. It is not a fourth evidence arm and never
enters the three-arm contrasts.

## What To Implement

### Three-arm common-support evaluator

For each frozen metric `M`, compute:

```text
marketGivenBlueprint = current - without_market
blueprintGivenMarket = current - without_blueprint
```

The evaluator obtains the healthy direction from one typed metric mapping. A
contribution is material when its signed delta exceeds the existing A6 floor,
at least `5/7` paired worlds agree beyond that floor, and its 95% paired
half-width is reported. The half-width is evidence, not a third hidden gate.

Return one of:

- `market_required`;
- `blueprint_required`;
- `coupled_required`;
- `antagonistic`;
- `not_reproduced`;
- `not_attributed`.

The checkpoint always emits:

```text
mainEffects = not_identifiable_under_common_support
interaction = not_identifiable_under_common_support
```

No formatter may label the result factorial.

Map the total classification to the canonical checkpoint protocol:

- `GO`: `market_required`, `blueprint_required` or `coupled_required`, with a
  reconciled linked path;
- `REFINE`: `not_reproduced` or a complete but unowned path;
- `STOP_RETHINK`: `antagonistic`, scenario incompleteness, contamination,
  nonzero reconciliation or a missing/unknown player path.

### Linked-path requirement

An aggregate delta is not an owner. Reuse the canonical unique-need episodes,
fulfilled player identity, origin facts, transfer history and player-use facts
to show that players or needs changed by the component intersect the downstream
metric path. The path is reconciled by stable IDs and dated facts; final roster
ownership never reconstructs it.

An otherwise material contribution without a linked path is `not_attributed`.
`unknown` origin, missing players, duplicate episodes or nonzero reconciliation
are fail-closed.

### Historical control account

Rerun only the known failed world as a diagnostic preflight, never as an
evidence arm. Capture the exact finance operation that returned the existing
`finance_lifecycle_rejected` reason. Prefer a non-derivable structured diagnostic
beside that reason; do not create a second product reason or duplicate the
transaction's own status.

The one-world account can conclude only:

- `counterfactual_nonviable`: the off/off policy reaches a canonical rejected
  finance operation;
- `unresolved`: the precise operation cannot be established.

`unresolved` stops L6.1C before the long run. Analysis contamination belongs to
the separate ordinary-versus-observer-disabled purity comparison: a one-world
runner can emit at most one failure and therefore cannot infer contamination
from multiple errors. A genuine nonviable control confirms why the three-arm
estimand is necessary; it does not count toward its gate.

### Decision and authorization

- a single required component with zero reconciliations and linked path opens
  only its corresponding conditional owner step;
- `coupled_required` opens only a new joint **design** step, not two gameplay
  corrections;
- `antagonistic`, `not_reproduced` or `not_attributed` keeps market and blueprint
  correction closed and records `REFINE`/`STOP` as appropriate;
- the active-talk cap remains absolved unless a new paired linked path crosses
  its existing material floors. This profile does not rerun the cap oracle.

## Output And Audit

Canonical commands:

```bash
pnpm cli simulation-report \
  --profile=phase81a-renewal-common-support-l6-1c-canary-7x1 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81a-renewal-common-support-l6-1c-canary-7x1.json

pnpm cli simulation-report \
  --profile=phase81a-renewal-common-support-l6-1c-7x10 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81a-renewal-common-support-l6-1c-7x10.json
```

After execution create
`docs/audits/PHASE_81A_CHECKPOINT_L6_1C_COMMON_SUPPORT_RENEWAL.md` with the
control account, manifests, arm values, paired contrasts, linked-path
reconciliations, total classification, hashes, real exits and wall time.

## Expected Files

- `apps/cli/src/commands/simulation-report/career-sections.ts` and test: serial
  three-arm orchestration, linked-path composition and checkpoint decision;
- `apps/cli/src/commands/simulation-report/career-world-facts.ts` and test: reuse
  the existing analysis policy seams for the two one-component removals;
- `apps/cli/src/commands/simulation-report/renewal-architecture-attribution.ts`
  and test: total common-support evaluator and shared typed healthy-direction
  mapping; remove or supersede no active L6.1 evaluator;
- `apps/cli/src/commands/simulation-report/long-run-profile-checkpoints.ts` and
  test: only if the diagnostic failure needs a new non-derivable checkpoint
  field; reuse collision-proof failure envelopes;
- `apps/cli/src/commands/simulation-report/report-registry.ts` and planner tests:
  two locked profiles and isolated caches;
- `packages/engine/src/career/advance-career-season.ts` and test: only if the
  precise rejected finance operation cannot be observed at the canonical return
  site without a structured diagnostic;
- `packages/i18n/src/labels.ts`: discoverable profile labels in all five
  languages;
- this step, the phase README, the decision-disentanglement tranche and
  `docs/PROJECT_STATUS.md`;
- after execution only,
  `docs/audits/PHASE_81A_CHECKPOINT_L6_1C_COMMON_SUPPORT_RENEWAL.md` and
`docs/audits/README.md`.

## Outcome

The final canary returned `GO` with `balanceDecision = not_evaluated`, all
three policy signatures at `7/7`, observer purity `7/7`, zero reconciliation
failures and exit `0`. Its historical preflight reproduced the known season-9
failure and named the exact rejected operation: `annual_payroll`.

The fresh full profile completed `210` evidence world-seasons plus the one-
world historical preflight, with exactly seven workers for each evidence arm.
All three arms completed `7/7`; scenario failures and linked-path
reconciliations were zero. The canonical decision is nevertheless
`STOP_RETHINK: antagonistic`:

- market given blueprint reduced four-formation replication by
  `0.0476190476`, beyond the `0.02` floor in the unhealthy direction in `5/7`
  worlds;
- no market or blueprint contrast produced a healthy material contribution in
  `5/7` worlds;
- market and blueprint paths were observable and reconciled (`57` changed
  fulfilled players realized and `2` intersecting downstream players each), so
  absence of an owner is not a missing-ID artifact;
- current champion points were `72.3857`, already inside the historical band.
  The evaluator therefore uses change in distance to the band, not raw “more
  is always better”; the raw deltas remain reported but were not antagonistic.

`mainEffects` and `interaction` remain
`not_identifiable_under_common_support`. The invalid off/off corner was not
reintroduced, no target moved, and no gameplay changed. Exact arm values,
contrasts, uncertainty, hashes and reproduction commands are in
[`PHASE_81A_CHECKPOINT_L6_1C_COMMON_SUPPORT_RENEWAL.md`](../../audits/PHASE_81A_CHECKPOINT_L6_1C_COMMON_SUPPORT_RENEWAL.md).

## Verification

- common-support evaluator, career composition, engine advancement and planner
  focused suites passed before the long run;
- canary exit `0`; full checkpoint exit `1` from canonical
  `STOP_RETHINK: antagonistic`;
- `pnpm check`: `305` test files, `2372` tests, `878` modules with no dependency
  violations, localization/depth/role/single-entrypoint checks and all workspace
  typechecks green;
- the final diff-check and Graphify rebuild run after this documentation update.

No market coefficient, blueprint content, financial fallback, save migration,
HTML, web file or new report entrypoint is expected. Before editing a shared
Module, run Graphify affected and add any proven owner here with its reason.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/career/advance-career-season.test.ts
pnpm exec vitest run apps/cli/src/commands/simulation-report/renewal-architecture-attribution.test.ts
pnpm exec vitest run apps/cli/src/commands/simulation-report/career-sections.test.ts
pnpm exec vitest run apps/cli/src/commands/simulation-report/long-run-profile-checkpoints.test.ts
pnpm exec vitest run apps/cli/src/commands/simulation-report/report-planner.test.ts
pnpm cli simulation-report --profile=phase81a-renewal-common-support-l6-1c-canary-7x1 --workers=7 --format=json --report-output=simulation-out/phase81a-renewal-common-support-l6-1c-canary-7x1.json
pnpm cli simulation-report --profile=phase81a-renewal-common-support-l6-1c-7x10 --workers=7 --format=json --report-output=simulation-out/phase81a-renewal-common-support-l6-1c-7x10.json
pnpm check
git diff --check
graphify update .
```

The canary profile, full profile and `pnpm check` each run alone. The historical
preflight is their first serial stage and uses one worker because it is one
indivisible world; it does not invent six empty jobs. Both checkpoint cohorts
use exactly seven workers.

## What NOT To Implement

No off/off arm, six-world survivor analysis, replacement seed, shorter horizon,
finance repair, product fallback, active-talk retune, market coefficient,
blueprint retune, target move, post-output arm, second simulator, manual report
merge or dead compatibility profile.

## Definition Of Done

- the exact historical control failure is accounted for before the long run;
- all three viable arms complete on the same seven fresh seeds;
- every reconciliation and purity check is zero;
- conditional contributions use frozen floors and linked player paths;
- non-identifiable main effects and interaction are explicit in JSON and prose;
- only a preregistered total classification can open a follow-up;
- no gameplay/content behaviour changes and no code residue survives;
- focused tests, `pnpm check`, diff-check and Graphify are green;
- audit, step, phase README and project status agree.
