# Step 06B6 - Checkpoint L4: Generational Succession Attribution

## Status

Done. L4 identified the matchday emergency boundary, then isolated the
downstream renewal problem. Step 06B7 corrected the former and returned `STOP /
RETHINK` on the latter; Step 06B8 remains closed.

## Goal

Identify which lifecycle boundary prevents career-generated players from
replacing the opening population. This checkpoint changes no growth, promotion,
selection, market or retirement behaviour.

## Before-State

In the committed L1 canary, season-ten scorer/assist leaderboard occupancy is:

- opening population: `395/420` (`94.0%`);
- academy/youth intake: `25/420` (`6.0%`);
- senior intake: `0/420`.

The number is not unique players. It measures the visible top-ten positions the
owner inspected and is therefore the correct denominator for that finding.

## Frozen Population

- the same locked `phase81a-league-diversity-canary-7x10` worlds and seasons,
  rerun on the post-L3 code state with exactly `7` workers;
- JSON is canonical; HTML is derived but not yet the final acceptance view;
- every player is classified from durable lifecycle facts as opening senior,
  opening academy, annual academy intake, annual senior intake or unknown;
- unknown origin is a reconciliation failure, never `opening`.

## Required Funnel

For every world, season, division, origin and age band, record:

1. generated and active population;
2. academy membership and exits;
3. promotion candidates and completed promotions;
4. registered senior stock;
5. selections, starts and minutes;
6. current ability and potential-room distributions;
7. transfer/free-agent acquisition where canonical history supports it;
8. scorer/assist leaderboard occupancy.

Each stage reconciles with its canonical owner. The report must distinguish
“not generated”, “generated but not promoted”, “promoted but not selected” and
“selected but not productive”.

## Attribution Decision

Exactly one primary owner is named from the first material funnel break:

- `generation_quality_or_quantity`;
- `development_conversion`;
- `academy_promotion`;
- `ai_selection_opportunity`;
- transfer/free-agent acquisition share remains descriptive, not an owner,
  because academy promotions do not traverse the market;
- `retirement_or_exit`;
- `multiple_owners` only when two independently material breaks remain after a
  paired ablation.

No coefficient moves in this step. Before closing, rewrite Step 06B7 with the
exact owner, expected files, paired counterfactual and frozen target. If the
owner cannot be isolated, the decision is `STOP / RETHINK`, not a broad patch.

### Frozen Material-Break Rule

The first applicable break in this ordered funnel owns the result. Thresholds
are fixed before the first L4 execution:

1. career-generated population / opening population `< 0.50` ->
   `generation_quality_or_quantity`;
2. promotion candidates / academy intakes from seasons `1..6` `< 0.25` ->
   `development_conversion` (later intakes have not had a fair maturation
   window and never enter this denominator);
3. completed promotions / promotion candidates `< 0.50` ->
   `academy_promotion`;
4. season-ten selected career-generated players / registered
   career-generated players `< 0.50` -> `ai_selection_opportunity`;
5. career-generated acquisitions / all canonical transfer and free-agent
   acquisitions is reported descriptively but cannot own the funnel: promoted
   academy players reach senior registration without an acquisition;
6. opening-origin leaderboard occupancy still exceeds career-generated
   occupancy after all prior conversions hold -> `retirement_or_exit`.

A zero denominator is `not_observed`, never a pass or a fabricated zero. Any
unknown player origin returns `REFINE` before ownership. If all six conditions
are false the result is `STOP / RETHINK`: the implementation may not invent a
seventh explanation after reading output.

### Instrument Correction Before A Complete Artifact

The first execution stopped when it reached a generated senior-intake player
with no club association. That is not unknown origin: it is the exact
"generated but not acquired" state the funnel must preserve. Such players are
now assigned the explicit report-only location `not_registered`, never a
fabricated division or club. This location is excluded from the
per-competition promotion-vacuity count and remains included in generated and
market-conversion denominators. The corrected run uses a new checkpoint cache;
no partial shard is mixed into the evidence.

The second execution reached a real season-six selection failure before it
could produce a complete artifact: one club had only ten available senior
players. Attribution cannot infer the missing lifecycle boundary from rendered
error prose. `SimulateSeasonError` therefore carries the owning `clubId`, and
the report adapter enriches this **read-only** failure with the same club's
canonical academy roster and promotion-candidate facts. This correction was
recorded before rerunning L4; it changes neither selection nor lifecycle
behaviour and uses a new checkpoint cache.

That join initially covered the background-competition call site. The repeated
failure showed that the same club was in the long-run runner's selected
competition. Before any complete L4 output existed, the identical structured
join was therefore added around the runner boundary and the cache advanced
again. The two paths call one enrichment function; neither parses the message
or changes a simulation input.

## Descriptive Acceptance Targets For The Later Correction

Step 06B7 must be capable of reaching, on the same L4 population:

- season-ten opening-origin leaderboard share `<= 0.50`;
- season-ten career-generated leaderboard share `>= 0.30`;
- at least one career-generated scorer or assist leader in every world;
- no division with zero completed academy-to-senior promotion over ten seasons;
- stable-ID and origin reconciliation failures exactly `0`.

They are frozen now but do not turn L4 into a behaviour gate. L4's gate is
truthful attribution.

## Decision

- **GO / OWNER IDENTIFIED:** one owner or paired owner set is isolated; complete
  and open Step 06B7.
- **REFINE:** a missing or irreconcilable fact prevents attribution; repair only
  the canonical fact owner and repeat L4.
- **STOP / RETHINK:** the funnel cannot isolate a correction without tuning the
  final leaderboard directly.

### Observed Blocking Boundary

The frozen run reaches a deterministic season-seven failure in
`phase81a-league-diversity-canary-world-00007`: club `club:ita-3-17` has ten
available senior players and cannot field an XI. The same club has eleven
active academy players with positions
`am, cb, cb, cm, cm, dm, gk, lb, rb, rw, st` and zero promotion candidates.

This identifies `ai_selection_opportunity` before any coefficient or final
leaderboard is read. The generated players exist and cover a complete matchday
skeleton; automatic selection cannot consume them even as an emergency. Step
06B7 may add only that emergency boundary. L4 then repeats on the unchanged
seven worlds to complete the downstream funnel; this partial run is not a
substitute for the final artifact.

The post-correction repetition uses another empty cache (`facts-v5`). A shard
from the senior-only failure cannot be reused as if academy emergency candidates
had participated in it.

The first post-correction execution completed simulation but failed during
projection: the L4 composition path observed every domestic competition, then
also tried to assemble the unrelated L1/L2/L3 carried facts although their
modules were not requested. L4 still observes all competitions for the
generational funnel, but now derives only its requested L4 facts. This is a
post-simulation report-composition correction, recorded before a complete
artifact and isolated under cache `facts-v6`.

### Complete L4 Result And Attribution Refinement

The first complete artifact returned `OWNER_IDENTIFIED` with the originally
registered `market_replacement` branch because career-generated acquisitions
were `379/8922` (`4.25%`). That branch is structurally invalid as a funnel owner:
academy promotions bypass acquisition, so its numerator and denominator are not
adjacent populations. The result is retained in the `facts-v6` artifact and is
not re-labelled retroactively.

The adjacent stages actually hold: candidate conversion is `25.38%`, promotion
conversion `76.62%`, and selected/registered generated players `80.01%`. The
break appears after opportunity: career-generated players occupy `6/420`
season-ten leader positions (`1.43%`), while opening players occupy `414/420`.
Opening `33+` players alone occupy `329/420`; their mean current ability is
`11.80`, versus `6.81` for generated players aged `21..24`.

L4 therefore refines to a one-owner ablation before allowing a paired fix:
`retirement_or_exit` changes only the existing outfield aging policy. European
football research places average peak performance around `25..27`, observes a
notable physical decline above `32`, and allows later peaks for goalkeepers and
centre-backs. Goalkeeper decline remains unchanged. If this ablation fails the
frozen renewal targets, the residual is `development_conversion`; market share
cannot be reinstated as an owner.

The ablation failed decisively. Opening share moved `98.57% -> 98.81%` and
career-generated positions moved `6 -> 5`; opening `33+` leaders moved only
`329 -> 323`. The experimental aging change was removed in full. The residual
owner is `development_conversion`: generated players exist, promote and are
selected, but their real-minute development opportunity does not produce a new
prime cohort.

The authorized development-opportunity ablation also failed. Increasing only
the positive real-minute bands moved career-generated leader positions from
`6` to `5` and mean ability for generated players aged `21..24` only from
`6.81` to `6.84`. It was removed in full. The final adopted-code repetition is
therefore the baseline funnel plus the emergency-selection correction, not
either failed coefficient experiment.

Final adopted-code artifact:
`simulation-out/phase81a-generational-succession-l4-final-7x10.json`, SHA-256
`584f478f84233c9341c40dded50e89dae59e54b0697fdb43613e0f99c8d77aa0`.
It reconciles with `0` unknown origins, observes `10` emergency selections, and
retains the decisive season-ten result: `6/420` career-generated leaderboard
positions against `414/420` from the opening population.

## Expected Files

- `apps/cli/src/commands/simulation-report/career-world-facts.ts` and test
- `apps/cli/src/commands/simulation-report/career-sections.ts` and test
- `apps/cli/src/commands/simulation-report/generational-succession.ts` and test;
  one origin registry and one row accumulator join the canonical facts without
  a second career execution
- `apps/cli/src/commands/simulation-report/report-registry.ts`
- `apps/cli/src/commands/simulation-report/report-planner.test.ts` and
  `packages/i18n/src/labels.ts`; the locked profile refuses any population or
  worker override and remains discoverable in all supported CLI languages
- canonical lifecycle projection owners exposed by Graphify, only when the CLI
  would otherwise reconstruct facts
- `packages/engine/src/use-cases/simulate-season.ts` and test; the existing
  typed invalid-selection error gains its owning club ID so L4 can join the
  failure to canonical lifecycle facts without parsing prose
- `docs/audits/PHASE_81A_CHECKPOINT_L4_GENERATIONAL_SUCCESSION.md` **(new)**
- `docs/audits/README.md`
- this step document
- `docs/PROJECT_STATUS.md`
- `06b7-generational-renewal-owner-correction.md`

## Required Checks

```bash
nvm use 24
pnpm cli simulation-report --profile=phase81a-generational-succession-l4-7x10 --workers=7 --format=json --report-output=simulation-out/phase81a-generational-succession-l4-7x10.json
pnpm check
git diff --check
graphify update .
```

## Definition Of Done

The complete funnel reconciles, an owner is identified without changing
behaviour, and Step 06B7 has been made executable before it becomes active.

**Recorded outcome:** Done. L4 provided the evidence that caused 06B7 to stop
instead of widening another coefficient.
