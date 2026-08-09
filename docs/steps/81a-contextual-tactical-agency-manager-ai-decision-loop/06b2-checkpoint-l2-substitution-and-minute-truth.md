# Step 06B2 - Checkpoint L2: Substitution And Minute Truth

## Status

**Done (2026-08-08): `GO`.** The frozen `7 x 1` cohort passed every structural,
distribution and carried league-diversity gate. Step 06B3 is open.

## Question

Does the canonical automatic path now produce believable substitutions and
truthful minutes without changing manager control or violating competition
rules?

## Frozen Population

- exactly `7` fresh deterministic worlds;
- exactly `1` season and all three domestic competitions per world;
- exactly `7` workers;
- canonical `simulation-report` JSON first, HTML optional and derived only;
- seed prefix `phase81a-substitution-minute-l2-v1`;
- no overlap with L1, calibration or future L5 seeds.

## Frozen Gates

- accepted substitutions reconcile exactly with events, final lineups and
  participation minutes;
- no team exceeds the competition's substitution or window limits;
- automated decision facts exist for both sides in every world;
- the played-match test population records zero automatic manager-side
  commands;
- mean substitutions per team-match is within `3.5..4.9`, around UEFA's `4.4`
  descriptive reference;
- median first substitution minute is within `50..70`, around UEFA's minute
  `56` descriptive reference;
- at least one match-team uses fewer than five and at least one uses five, so
  the policy is neither a fixed minimum nor a fixed maximum;
- player minutes are finite, non-negative and never exceed the played final
  minute;
- stable IDs, scores, goal rates, formation selection and deterministic replay
  do not regress.

The two distribution bands are intentionally broad. They reject zero/rare
substitutions and mechanical minute-80-only behaviour without demanding that a
fictional three-tier league copy one elite season exactly.

## Decision

- **GO:** all structural and distribution gates pass; open Step 06B3.
- **REFINE:** the canonical runner or existing AI policy is locally wrong;
  reopen only Step 06B1 with unchanged targets.
- **STOP / RETHINK:** automatic and played matches cannot share one progression
  owner without changing manager control.

## Expected Files

- `apps/cli/src/commands/simulation-report/report-registry.ts`
- `apps/cli/src/commands/simulation-report/career-world-facts.ts` and test
- `apps/cli/src/commands/simulation-report/career-sections.ts` and test
- `packages/i18n/src/labels.ts`. The new locked profile is user-visible through
  `simulation-report --help`; all five locales need one title and description
  rather than a hard-coded CLI exception.
- `docs/audits/PHASE_81A_CHECKPOINT_L2_SUBSTITUTION_AND_MINUTES.md` **(new)**
- `docs/audits/README.md`
- this step document
- `docs/PROJECT_STATUS.md`
- `06b3-canonical-availability-and-minute-weighted-workload.md`

No gameplay file is expected. A missing fact must be returned by the Step 06B1
owner, never reconstructed in the CLI.

## Required Checks

```bash
nvm use 24
pnpm cli simulation-report --profile=phase81a-substitution-minute-l2-7x1 --workers=7 --format=json --report-output=simulation-out/phase81a-substitution-minute-l2-7x1.json
pnpm check
git diff --check
graphify update .
```

The checkpoint and `pnpm check` run alone. Capture the real exit code without a
pipe.

## Definition Of Done

The report records population, worker count, reconciliation, distribution,
decision and owner. Only `GO` opens Step 06B3.

## First Run And Preregistered Refinement

The first real run returned `REFINE`: mean substitutions were `2.800887`, the
median first change was minute `60`, the observed range was `0..5`, both sides
had decision facts, and the carried league-diversity gate stayed `GO`.

It also found `218` reconciliation failures. Inspection showed the original
checkpoint combined three independent comparisons in one count. Before the
refinement rerun, the owner was corrected to handle a substitute later being
substituted again and unreplaced incident exits as real appearance intervals.
The minute-60 boundary now allows two sequential canonical commands, each
validated against the team produced by the previous command; it is not a batch
shortcut or a fixed substitution minimum. The existing cached world projections
predate those facts, so the unchanged seven-world corpus writes to the explicit
`-facts-v2` checkpoint directory rather than reading incompatible evidence.

That rerun removed every reconciliation failure and returned `3.402350`
substitutions per team-match: structurally green but below the unchanged `3.5`
floor. The next refinement gives minute `70` the same sequential second
evaluation as minute `60`; it remains conditional and the validator still caps
the side at five. Its projections use `-facts-v3`; population and seeds remain
unchanged.

The `-facts-v3` run reached a healthy mean of `3.766729` but exposed `41`
diagnostic-only mismatches: two accepted substitutions at minute `70` were
being reordered by player ID during the CLI comparison. The canonical applied
order is now preserved after incident exits, and the corrected projection uses
`-facts-v4` without changing match behavior, seeds or thresholds.

## Final Result

The unchanged `-facts-v4` cohort returned `GO`:

- `12,852` automatic team-match observations;
- mean substitutions per team-match `3.766729`;
- median first substitution minute `60`;
- observed substitution range `0..5`;
- `0` reconciliation failures, invalid minutes, limit violations or missing
  controlled sides;
- carried Checkpoint L1 league-diversity decision `GO`.

The intermediate failures remain part of the audit trail: they distinguish the
two production defects from the final diagnostic ordering defect and prevent a
green rerun from erasing why the code changed.
