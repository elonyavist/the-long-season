# Validation Protocol

## General Rules

- Run `nvm use 24`; pinned runtime is Node `24.16.0`.
- Use only `pnpm cli simulation-report`.
- Use exactly `7` workers with at least seven independent worlds.
- Run each gate alone, never beside tests/build/browser/another report.
- Redirect output and capture the actual command exit code; no pipe verdicts.
- Artifacts state worlds, seasons, seed prefix, profile, workers, versions and
  what the population cannot see.
- Every threshold/branch needs real-data reachability.
- Empty population is `STOP_INSTRUMENT`, never green.
- Old artifacts are immutable. Corrections use a new profile/version.

## Decisions

- `GO`: all binding gates and non-vacuity pass.
- `REFINE`: mechanism is reachable but binding gate fails; reopen named owner.
- `STOP_RETHINK`: hypothesis/population/architecture is falsified.
- `STOP_INSTRUMENT`: reconciliation, continuity, reachability or purity fails.
- `NOT_EVALUATED`: population cannot answer; never pass.

## Frozen Populations

Step 00 registers exact seed prefixes before implementation. Locked profiles
cannot widen their population through command-line knobs.

### A - `7 x 1` generation/forecast

Opening world plus academy/intake facts; fresh and reordered derivations.
Tests reachability/distribution, not longitudinal success.
The long-run `3:2:1` rule is read on the Step 00 fixed allocation-cycle search
corpus using the production population policy and stable creation requests; it
is not inferred from one season's realized high-tail count.

### B - `7 x 2` early realization

Same worlds, paired where comparison is meaningful. Tests base training,
minutes acceleration, forecast ordering, damage and retirement reachability.

### C - `7 x 5` market/squad renewal

Tests three AI intents, transfers, role health, generated usage and early
forecast calibration.

### D/E - `7 x 15` longitudinal truth

Exactly seven workers. D attributes failures; E repeats after owner-only
correction on the same population and gates.

### F - `50 x 20` broad player-model review

Exactly seven workers, 50 stable one-world shards and checkpoint directory.
Canonical JSON plus derived HTML, reported for seasons `1-5`, `6-10`, `11-15`
and `16-20`. It uses the same 1,000 world-season planning volume as `100 x 10`
but tests long-horizon renewal; `100 x 10` is superseded and must not also run.

## Gate Families

Step 00 owns exact numeric bands. Later steps refer to the register, not copied
literals.

Metric IDs, formulas, populations, non-vacuity and failure owners live only in
[`IMPLEMENTATION_AND_CHECKPOINT_REGISTER.md`](IMPLEMENTATION_AND_CHECKPOINT_REGISTER.md).
The numeric values referenced by `targetRegisterKey` live only in
`docs/audits/PHASE_81B_NUMERIC_REGISTER.md` after Step 00. A checkpoint report
must emit both identifiers so a rendered status cannot silently substitute a
different formula or threshold.

### Population pyramid

- Shares in `10-11`, `12-13`, `14`, `15`, `16+` by division/origin.
- D1/D2/D3 drift and opening distance.
- Role coverage/squad floors.
- Thin non-zero aggregate `16+`; no per-division occupancy guarantee.

### Talent allocation

- High-tail convergence toward `3:2:1` over declared cycle.
- Equal-division club reorder invariance.
- Club identity changes role mix, not hidden-quality mean.
- No desired-star input or special star lane remains reachable.

### Forecast

- Probabilities sum to `10_000`.
- Production star classes reachable on real players.
- Elite realization ordered by forecast class; adjacent classes overlap.
- No class has zero/certain elite outcome unless Step 00 explicitly defines an
  unreachable extreme presentation class.
- Manager/AI/value/squad/market receive byte-equivalent assessment for same
  player/date.

### Realization

- Base training reachable with zero minutes.
- Opportunity/performance acceleration reachable and capped.
- Early/normal/late timing ordered without fixed final outcomes.
- Current ability respects hard caps.
- Latent profile byte-identical through advancement.
- Serious damage changes physical reachable path only.
- No potential-compression field/event remains.

### Aging/retirement

- Role/family decline reachable on real careers.
- Exceptional longevity exists but is rare.
- Season-end age-37 retirement is `100%`.
- No next-season active player older than `37`.
- Over-33 aggregate gates use the historical register unless Step 00
  explicitly supersedes it.

### AI/market

- Every intent is reached on real clubs.
- Every intent completes a transfer or is `NOT_EVALUATED` and blocks GO.
- AI uses public facts only.
- Depth includes medium players, not only stars/prospects.
- Succession reopens after prospect sale.
- Useful-level transfer movement is measured.
- Owned and free-agent candidates use the same intent/score owner.
- Free-agent opening stock, unique inflow, attributed signing and closing stock
  reconcile under the current clock; Phase 81C later revalidates cadence after
  changing contract timing.

### Long-run football health

- Generated share of appearances/goals/assists/leaders.
- Opening senior survival.
- Champion points/goals by division.
- Top scorer/assist ages.
- Formation diversity/minimum league replication from Phase 81A.
- Squad size, availability, transfers and finance reconciliation.

## Continuity And Purity

- Diagnostics change no gameplay rows or RNG consumption.
- Declared baseline sections have a continuity hash; new diagnostic sections
  are separately named or structurally excluded by tested rule.
- Mutation proves every continuity gate can fail.
- Retained facts are non-derivable at report time or removed.
- Cache signature includes producer, policy and payload.

## Command Templates

Profile IDs below are reserved by Step 00 without renaming. Step 00 registers
the executable baseline; each checkpoint registers its own executable profile
after its section exists, using the already frozen ID, seeds, worlds, seasons
and worker contract. Exact seed strings and the baseline artifact hash are
recorded by Step 00 before production gameplay code.

```bash
nvm use 24

pnpm cli simulation-report \
  --profile=phase81b-player-model-baseline-7x15-v1 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81b-baseline-7x15-v1.json

pnpm cli simulation-report \
  --profile=phase81b-generation-forecast-a-7x1 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81b-a-7x1.json

pnpm cli simulation-report \
  --profile=phase81b-realization-b-7x2 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81b-b-7x2.json

pnpm cli simulation-report \
  --profile=phase81b-market-c-7x5 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81b-c-7x5.json

pnpm cli simulation-report \
  --profile=phase81b-longitudinal-d-7x15 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81b-d-7x15.json

pnpm cli simulation-report \
  --profile=phase81b-longitudinal-e-7x15 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81b-e-7x15.json

pnpm cli simulation-report \
  --profile=phase81b-product-f-canary-7x20 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81b-f-canary-7x20.json

pnpm cli simulation-report \
  --profile=phase81b-product-f-50x20 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81b-f-50x20.json

pnpm cli simulation-report \
  --from-report=simulation-out/phase81b-f-50x20.json \
  --format=html \
  --report-output=simulation-out/phase81b-f-50x20.html
```

Before Step 13 executes, its focused parser test must prove this exact
`--from-report` form is accepted. If production truth differs, correct this
document and the step before the canary; do not add an alias.

Checkpoint directories are not CLI arguments. Each locked long-run profile
owns its ignored `saves/long-run-checkpoints/...` directory in
`report-registry.ts`; the exact-profile test pins it with the seeds, horizon
and cache signature. Adding `--checkpoint-dir` would be an unknown argument and
must not be documented or implemented as a compatibility alias.

## Closeout

```bash
nvm use 24
pnpm check
git diff --check
graphify update .
```

Shipped web screens receive desktop/narrow Playwright QA. The diagnostic HTML
may remain English, desktop-only and non-accessible by accepted product scope;
shipped Squad/Market UI still follows project accessibility rules.
