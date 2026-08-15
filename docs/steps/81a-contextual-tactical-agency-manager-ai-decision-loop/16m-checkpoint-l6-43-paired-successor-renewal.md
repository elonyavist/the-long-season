# Step 16M - Checkpoint L6.43 Paired Successor Renewal

## Status

**Done - `STOP_RETHINK` on 2026-08-15.** Measurement and cleanup only; no
coefficient or product behaviour changed after either arm started.

## Question

Does the structural successor-ceiling stock create enough real prime-age senior
quality and leadership to replace the opening cohort without inflating elite
quality or breaking the rest of the football world?

## Frozen Cohort

- two fresh arms: current control and Step 16L candidate;
- same seven never-inspected world seeds in both arms;
- ten seasons;
- exactly seven workers;
- same world producer, calendar, fixtures, AI, market and report modules;
- only the Step 16L semantic composition switch differs;
- separate resumable checkpoint directories and immutable manifests.

The control must reproduce current L6.40/L6.42A directions. Failure to do so is
`STOP_INSTRUMENT`; the candidate is not interpreted.

## Required Facts

For every world and season, record from canonical facts:

- active five-star-or-better and six-star young stock;
- target, vacancy, assignment, refusal and reconciliation counts;
- selected club, role, development environment, intake current rating and
  stored ceiling rating;
- the complete L6.42A nested lifecycle funnel;
- opening and career-generated current-16 stock;
- scorer/creator leaders by origin, age, role and club;
- current-16 stock by division and club;
- every existing integrated age, workload, injury, transfer, finance, league,
  goals, assist, formation, tactic, upset and rarity gate.

No leader or player fact may be reconstructed from final ownership when a
season fact already owns it.

## Frozen GO Gates

All must pass:

1. generated season-ten current-16 stock is at least opening-senior season-ten
   current-16 stock in `>=5/7` candidate worlds;
2. pooled career-generated scorer/creator leader share is `>=0.50`;
3. candidate generated current-16 stock exceeds its paired control in `>=5/7`
   worlds;
4. successor target/vacancy/assignment facts reconcile in every world-season;
5. selected successors are current below five-star and stored-ceiling exactly
   five-star at intake;
6. paired six-star allocation IDs and counts are identical;
7. candidate season-ten total current-16 stock is never above that world's
   opening current-16 stock;
8. every previously accepted integrated gate remains green under its original
   reader and threshold;
9. at least one genuine age-33-plus leader remains reachable.

The L6.42A owner label remains diagnostic. Routine players are supposed to lack
top-flight ceilings, so the raw ceiling transition need not stop being the
largest loss if the stock and leadership outcomes above pass.

## Decision

- **GO:** all gates pass; adopt the policy and open Step 16N.
- **REFINE:** material successor improvement exists but a primary stock or
  leadership target remains red; reopen only Step 16L with every target fixed.
- **STOP_RETHINK:** no coherent improvement, instant-star leakage, six-star
  drift, stock inflation, reconciliation failure or a regression outside the
  proven owner. Remove the candidate and paired seam.

No partial GO and no qualitative override from player names or a favorable
single world.

## Outcome

The fresh paired `7 x 10` completed with exactly seven workers and returned
`STOP_RETHINK`. The candidate made `728` exact-five successor assignments over
`70` candidate world-seasons, but generated season-ten current-16 stock exceeded
the paired control in only `2/7` worlds and matched the remaining five. It
reached the opening-senior current-16 stock in `0/7` worlds. Pooled
career-generated scorer/creator leadership was `0.2071` against the frozen
`0.50` floor.

The candidate and control both reproduce `OWNER_IDENTIFIED:
observed_ceiling_supply`. Candidate progression is
`1876 generated -> 1089 senior-observed -> 24 ceiling-16 -> 17 current-16 ->
16 retained -> 5 leaders`; control produces six current-16 leaders. No new
integrated failure appears, age-33-plus leadership remains reachable (`64`
leader observations), selected-player semantics and stock reconciliation hold,
and total current-16 stock does not inflate. The six-star assignment identities
do change, so the five-star lane is not isolated from the existing rarity lane.

The result falsifies the product premise, not the instrument. An exact-five
assignment is not evidence that the selected player survives the academy and
senior pathway. The current facts cannot join the `728` selected IDs to academy
admission, retention, promotion, first-team use and terminal exit. Step 16M-A
therefore owns one diagnostic replay over that exact cohort before any further
gameplay correction. The failed policy is not adopted: normal product execution
must retain pre-16L semantics, while the candidate survives only as an explicit
analysis arm with Step 16M-A as its removal owner.

## Verification

- focused successor evaluator: `3/3` tests green;
- paired `7 x 1` canary: `PASS`;
- paired `7 x 10`: report decision `FAIL`, checkpoint
  `STOP_RETHINK`, process exit `1` as required;
- output:
  `simulation-out/phase81a-successor-ceiling-l6-43-paired-7x10.json`.
- audit:
  [`PHASE_81A_CHECKPOINT_L6_43_SUCCESSOR_RENEWAL.md`](../../audits/PHASE_81A_CHECKPOINT_L6_43_SUCCESSOR_RENEWAL.md).

## Next Action

Execute Step 16M-A. Do not open Step 16N, retune the stock target, raise generic
growth, add protected minutes or reinterpret this result as `REFINE`.

## Expected Files

- `apps/cli/src/commands/simulation-report/career-world-facts.ts` and test only
  for canonical per-season stock facts not already present.
- `apps/cli/src/commands/simulation-report/stationary-age-succession-attribution.ts`
  and test - extend the sole lifecycle evaluator; no second funnel.
- `apps/cli/src/commands/simulation-report/career-sections.ts`,
  `report-registry.ts`, `report-planner.test.ts` and `packages/i18n/src/labels.ts`
  - one locked paired profile through `simulation-report`.
- Step 16L content/provider files only to remove the candidate after a
  `STOP_RETHINK`; no tuning is permitted here.
- generated L6.43 audit, audit index, this step, phase README, Step 16N and
  status.

## Required Commands

After focused tests and a `7 x 1` canary, run each gate alone:

```bash
nvm use 24.16.0
pnpm cli simulation-report \
  --profile=phase81a-successor-ceiling-l6-43-paired-7x10 \
  --workers=7 \
  --format=json \
  --report-output=simulation-out/phase81a-successor-ceiling-l6-43-paired-7x10.json
```

Then rebuild the report once from completed canonical facts and require
byte-identical JSON. Run `graphify update .`, `git diff --check` and
`pnpm check` alone.
