# Step 06C12 - Independent Downstream Owner Replication

## Status

Done: `REFINE` before replay. Both structural sets pass, but one population row
contains one weak positional fit; downstream ownership is `not_evaluated`.

## Goal

Resolve whether the near-boundary disagreement is sampling instability by
repeating the exact chance-to-result attribution on a larger, wholly untouched
population. Change no gameplay, target, analytic formula, response, formation
or classifier.

This is the conservative branch of 06C11's product fork: obtain stronger
evidence before choosing between a deeper tactical redesign and reconsidering
the intended value of one correct read.

## Preregistration Before Implementation Or Output

The locked population is:

| fact | value |
|---|---|
| seed set A | `phase81a-b2-downstream-replication-a` |
| seed set B | `phase81a-b2-downstream-replication-b` |
| worlds per set | `14` |
| replay contexts per set | `64` reciprocal, stratified farthest-first |
| responses | unchanged `3 tactics x 3 lateralFocus = 9` |
| selection seeds per response | unchanged `8` paired |
| replay seeds per context | unchanged `207` paired |
| worker count | exactly `7` |

Both seed prefixes were searched before this document was written and have no
prior repository or artifact use. Selection and replay streams are disjoint and
prefixed `phase81a-b2-downstream-replication-selection-v1` and
`phase81a-b2-downstream-replication-replay-v1` respectively.

The context count doubles instead of changing replay depth: 06C11 already has
precise within-context means but only `32` independently shaped contexts. The
world count doubles so the farthest-first pool itself also comes from a wider
formation and squad population. No result may authorize adding a fifteenth
world, a sixty-fifth context or a third seed set.

## Frozen Decision

Every invariant from 06C11 remains binding:

- both sets must pass canonical Phase 1, all population rows, conservation and
  mirror checks;
- xG response variance must be positive and the pooled slope must be positive;
- both `R^2 >= 0.5` and `R^2 < 0.5` must occur among real contexts in each set;
- `opportunity_xg_magnitude` requires pooled `R^2 >= 0.5` in both sets;
- `result_resolution` requires pooled `R^2 < 0.5` in both sets;
- opposite owners remain `MIXED`, and no gameplay correction is authorized;
- the original materiality target remains `+0.045/-0.045`, with blind
  `|delta| <= 0.015`; this step cannot redefine it.

A coherent owner opens one implementation step for that owner only, followed
immediately by this exact replication profile and independent B2. A second
`MIXED` result proves the owner is not stable under the frozen semantic split
and returns to the explicit product fork; it does not authorize more sampling.

## Implementation Contract

- Parameterize the existing conditioned-population and complete-row producer;
  do not copy either loop.
- Existing B2 profiles continue using their frozen seven-world, 32-context
  settings and exact stream prefixes.
- Add one locked `phase81a-b2-downstream-replication` profile to the sole
  `simulation-report` entrypoint. Corpus dimensions are registry constants, not
  CLI flags.
- Report full per-set Phase-1, population, materiality and downstream facts plus
  the aggregate owner and reachability decision.
- The profile returns fail-closed while materiality is red; an identified owner
  is diagnostic evidence, never a replacement `GO`.

## Expected Files

- `apps/cli/src/commands/simulation-report/tactical-agency-section.ts`; share
  the existing producer through an explicit immutable population contract;
- `apps/cli/src/commands/simulation-report/tactical-agency-world.ts`; retain
  each already-observed club's out-of-position count so a failed aggregate row
  identifies its owner without selecting the club a second time;
- `apps/cli/src/commands/simulation-report/report-registry.ts`; register the
  one locked profile and route it to the shared producer;
- `apps/cli/src/commands/simulation-report/report-planner.test.ts`; prove the
  profile locks `28` total worlds, one season and seven workers;
- `packages/i18n/src/labels.ts`; the visible profile needs all five labels;
- `docs/audits/PHASE_81A_DOWNSTREAM_OWNER_REPLICATION.md` **(new)**;
- `docs/audits/README.md`;
- `docs/PROJECT_STATUS.md`;
- this step document;
- `README.md`;
- the next owner step document only after a coherent result;
- `07-player-task-execution.md` only after independent B2 `GO`.

Any discovered file is added here with ownership before editing it.

## Required Checks

```bash
nvm use 24
pnpm cli simulation-report \
  --profile=phase81a-b2-downstream-replication --workers=7 --format=json \
  --report-output=simulation-out/phase81a-b2-downstream-replication.json
pnpm check
git diff --check
graphify update .
```

The checkpoint runs alone, records its real exit and may take roughly twice
06C11's wall clock because its replay context count doubles.

## Definition Of Done

One shared producer has run the fixed independent population, both sets have a
fail-closed owner decision with reachable classifier branches, and only a
twice-replicated owner may open gameplay implementation.

## Result

Both `6,804`-context matrices pass with `6/9` best-response signatures,
ubiquity `3.5013/3.5026`, `292/298` cycles and zero conservation or mirror
mismatch. Set A nevertheless fails one of `84` competition rows:
`club:ita-2-01` in the first A world selects `4-1-4-1` with one weak fit.

The domain says `weak` is not covering suitability, while the free selector's
private ordinary predicate accepts it. The emergency retry already owns
non-covering lineups. Step 06C12A removes that duplicate semantic and reruns
this exact profile; no downstream replay or owner is read before then.
