# Step 06B7G2 - Checkpoint L4.5: Annual Role Continuity

## Status

**GO on the fresh retry.** The original run exposed a match-day depth/tie owner;
Step 06B7G2A corrected it without changing the 22-player senior base, and the
repeated checkpoint passed every structural and carried-health gate.

## Goal

Prove on career worlds that the role-continuity correction reaches the annual
population, keeps squads tactically diverse, and changes only the generation
owner it was authorized to change.

## Frozen Population

- profile `phase81a-annual-role-continuity-l4-5-7x2`;
- the seven existing canary seeds, two complete seasons, three competitions;
- exactly seven simulation workers;
- fresh facts cache and canonical JSON;
- the L4.4 `7 x 10` artifact remains the immutable behavioural before-state and
  is not regenerated to make this checkpoint pass.

## Frozen Gates

### Generated role continuity

- all `10/10` official roles appear in every competition's combined annual
  senior-candidate population whenever canonical maintenance requests that
  emergency population;
- every initial-academy competition population reaches all `10/10` roles;
- when an academy-refill competition-season has at least ten vacancies, it
  reaches all `10/10` roles; smaller populations are evaluated against the
  exact maximum coverage their denominator permits, never marked pass through
  `not_observed`;
- every role token reconciles with exactly one generated player and every
  generated player with exactly one token;
- for `full_back`, `wing_back`, `wide_midfielder` and `winger`, right/left
  counts differ by at most one whenever at least two players of that role are
  generated in the measured competition population;
- every opening academy club retains department counts `1/4/4/2`.

### Correction before execution: senior candidates are lazy

Production code showed before any L4.5 output existed that canonical squad
maintenance asks for generated senior candidates only when the existing free
agent pool cannot fill a shortage. Generating an unused population merely to
make a report row would add dead simulation work and would no longer measure
the game path. Therefore every world-season records exactly one total status:
`generated` or `not_requested`. A generated population must reconcile and reach
`10/10` roles in each competition; `not_requested` is valid only as the direct
fact emitted by canonical maintenance and produces no invented population row.
Missing or duplicate statuses fail. The real content test still invokes the
senior provider and proves the complete quota on generated players.

### Carried health

- all `10` roles have a positive count over each complete world;
- each world uses at least `6` distinct selected formations and no formation
  exceeds `0.50` of selections;
- avoidable out-of-position slots remain `0`; emergency selections are
  recorded separately and remain legal only when `fillableShapeCount = 0`;
- at least one active academy player appears in a real selected XI across the
  whole population, proving the call-up path on generated data without
  requiring every competition to need one;
- generation ability/potential ordering, range, rarity-budget and department
  invariants remain green;
- no formation is read by the role planner and no role-plan fallback occurs.

The L4.4 renewal outputs (`0/7` development parity, `6.90%` generated leaders,
`63.54%` opening-senior survival and `93.10%` opening leaders) are diagnostic
context only here. Two seasons cannot answer ten-season renewal and this gate
must not claim that it does.

## Decision

- **GO:** every structural and carried-health gate passes; Step 06B7G3 may
  instrument the development funnel.
- **REFINE:** reopen only Step 06B7G1 with all targets unchanged.
- **STOP / RETHINK:** all ten roles are generated as designed but formation
  diversity collapses or the competition quota requires a formation hint.

## Expected Files

- `packages/content/src/generators/career-intake-players.ts` and its test;
  expose actual generated candidate positions and planned/generated
  reconciliation from the existing provider closure, never a second generator.
- `packages/content/src/generators/annual-intake-role-plan.ts`, its test, and
  `packages/content/src/index.ts`; share the department-aware coverage
  derivation with the report instead of copying role or flank tables in CLI.
- canonical `simulation-report` generational/formation fact modules and tests,
  only for facts emitted at the generation boundary;
- `apps/cli/src/commands/simulation-report/report-registry.ts` and planner test;
  own the locked `7 x 2 x 7` profile;
- `packages/i18n/src/labels.ts`; profile title in all five languages;
- `docs/audits/PHASE_81A_CHECKPOINT_L4_5_ANNUAL_ROLE_CONTINUITY.md` **(new)**;
- `docs/audits/README.md`;
- this step document, Step 06B7G3, phase `README.md`, and
  `docs/PROJECT_STATUS.md`.

## Required Command

```bash
source "$HOME/.nvm/nvm.sh"
nvm use 24
pnpm cli simulation-report \
  --profile=phase81a-annual-role-continuity-l4-5-7x2 \
  --workers=7 \
  --format=json \
  --report-output=simulation-out/phase81a-annual-role-continuity-l4-5-7x2.json
```

The simulation runs alone. Capture its real exit code without a pipe.

## Definition Of Done

L4.5 records exactly one decision and a canonical hash. Only `GO` opens the
development-funnel diagnostic; no renewal target is moved or inferred from the
two-season population.

## Recorded Result

- report hash `b38fe2ef541143af6e844d00891aec40`, exit `1`;
- `1,404/1,404` planned/generated candidates, zero reconciliation failures;
- all opening academies and generated refill populations reached their exact
  maximum role coverage; side imbalance and department mismatches were zero;
- canonical senior generation was correctly `not_requested` in all `14`
  world-seasons rather than fabricated for the report;
- all `42` competition-seasons retained ten roles, at least eight formations,
  top share at most `0.2778`, zero fallback and zero reconciliation failures;
- the sole failure was `carried_formation_health`: the reader counted
  `416/12,852` catalog ties and `250` forced out-of-position slots in season
  one. Both facts are real, but neither is a diversity collapse caused by the
  role planner.

Step 06B7G2A preserves the 22-player senior base and existing 25-player
promotion ceiling, adds at most three real academy call-ups, lets senior minutes
replace low-detail academy minutes through the existing ledger, and resolves
equal structural shapes on the live quality of their fieldable XI. No extra
senior incumbent is generated.

The repeated artifact hash is `d9113b1687950a60870e724ad98a433c`, exit `0`.
It observed `3,234` selected academy call-ups, zero catalog-sensitive ties,
zero fallback, zero avoidable invalid slots and zero reconciliation failures.
Forced invalid (`33`) and weak legal (`116`) slots remained reachable. This
`GO` opened L4.6; it did not claim ten-season renewal.
