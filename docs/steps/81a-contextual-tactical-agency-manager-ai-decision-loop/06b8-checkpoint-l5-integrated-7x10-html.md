# Step 06B8 - Checkpoint L5: Integrated 7 x 10 JSON And HTML

## Status

Done with `REFINE`. All carried owners were evaluated from the same seven
ten-season worlds and the consultable JSON/HTML pair was produced. The `100 x
10` main run remains unauthorized.

## Goal

Decide whether match rotation, availability, aging, injuries, player renewal and
tactical diversity form one credible ten-season world before spending the
`100 x 10` main-run budget.

## Locked Population

- existing `phase81a-league-diversity-canary-7x10` profile;
- exactly `7` worlds x `10` seasons x `3` competitions;
- exactly `7` workers;
- fresh checkpoints because the stopped main shards predate changed behaviour;
- canonical JSON followed by byte-identical English desktop HTML rendering;
- preregistered human inspection: every world at seasons `1`, `4`, `7`, `10`,
  not only selected interesting examples.

## Integrated Gates

### Match and availability

- L2 substitution/minute gates remain green;
- L3 availability/recovery/injury gates remain green;
- unavailable starters and all reconciliation/fallback failures are `0`;
- no club-season fields one identical XI in all `34` fixtures;
- among retained `33+` leaders, the share with `34` appearances is `<= 0.50`.

### Age and renewal

- seasons `8-10` pooled `33+` share is `<= 0.25` for scorers and assists;
- the absolute difference between seasons `1-2` and `9-10` mean leader age is
  `<= 2.0` years for both tables;
- season-ten opening-origin leaderboard share is `<= 0.50`;
- season-ten career-generated share is `>= 0.30`;
- every world has at least one career-generated scorer or assist leader;
- exceptional `33+` leaders remain observed in at least one world or are marked
  `not_observed`, never forced by a fixture.

### Carried world and tactical health

- all frozen L1 formation/role diversity gates pass;
- goal-rate, standings, transfer, economy, development, stable-ID, rarity and
  age-distribution invariants do not regress;
- transfer fees remain integer EUR facts in JSON and formatted euros with both
  club divisions in HTML;
- HTML derives only from JSON and contains no simulation or formula.

## Decision

- **GO:** all automatic gates pass and the complete preregistered HTML review
  finds no engine-critical contradiction; authorize the fresh `100 x 10` L1
  main run.
- **REFINE:** reopen only the named owner step and repeat its local checkpoint
  before L5.
- **STOP / RETHINK:** credible ten-season renewal requires direct outcome
  control, hidden AI information or a second simulator.

## Expected Files

- `apps/cli/src/commands/simulation-report/career-sections.ts` and test: one
  integrated checkpoint kind, exact lineup-continuity and leaderboard-age
  facts, and one decision over the already-played worlds;
- `apps/cli/src/commands/simulation-report/report-registry.ts` and tests: map
  the existing canary profile to L5 and advance only its fact-cache version;
- `packages/content/src/generators/career-intake-players.ts`,
  `packages/simulation-tools/src/player-generation-economy-audit.ts`,
  `apps/cli/src/commands/simulation-report/career-world-facts.ts` and their
  tests: preserve the allocation-time club association for a newly allocated
  exceptional player. The full gate exposed that intake is generated before
  the next competitive-tier freeze; judging a new entry with the later tier
  creates a false placement violation. Current-stock summaries still read the
  current association, while the entry gate reads the non-derivable entry
  fact. This instrumentation correction is required before L5 evidence is
  admissible and must not change generation or simulation;
- `apps/cli/src/commands/simulation-report/generational-succession.ts`, L4.3
  step/audit and L4.4 handoff: v9 invalidates the old frozen generation-input
  signature. A fresh L4.3 `7 x 10` must reproduce all `21` generated-ceiling
  rows independently before its signature can move; L5 then re-aggregates its
  existing v5 shards under that proven input identity;
- canonical HTML renderer and tests only if the existing renderer cannot show
  an already-recorded L5 fact; it must never evaluate a gate;
- `packages/content/src/generators/initial-youth-academies.test.ts`: the final
  full gate measured its real-data rarity sweep at `15.219s` under contention,
  while the same file passed alone in `10.95s`. Remove its stale local `15s`
  override so it uses the suite-owned documented `60s` budget; no assertion,
  corpus or generation rule changes;
- `docs/audits/PHASE_81A_CHECKPOINT_L5_INTEGRATED_PLAYER_WORLD.md` **(new)**
- `docs/audits/README.md`
- this step document
- `06b-checkpoint-l1-league-diversity-100x10.md`
- `06c-checkpoint-b2-conditioned-tactical-ceiling.md`
- phase `README.md`
- `docs/PROJECT_STATUS.md`

## Required Checks

```bash
nvm use 24
pnpm cli simulation-report --profile=phase81a-league-diversity-canary-7x10 --workers=7 --format=json --report-output=simulation-out/phase81a-league-diversity-canary-7x10.json
pnpm cli simulation-report --from-report=simulation-out/phase81a-league-diversity-canary-7x10.json --format=html --report-output=simulation-out/phase81a-league-diversity-canary-7x10.html
pnpm check
git diff --check
graphify update .
```

The simulation and repository gate run alone. Capture real exit codes without a
pipe.

## Definition Of Done

L5 has one recorded decision, the owner has inspected the complete declared
HTML sample, JSON rebuild is deterministic, and only `GO` authorizes a new
`100 x 10` run. The old `35` shards are never resumed as evidence.

## Recorded Result

- canonical report hash `b2dc660f8024fe7f754dd85547b54025`, decision
  `REFINE`;
- zero identical-XI club-seasons, `0.023952` of `33+` leaders on 34
  appearances, substitution/availability/injury facts green;
- seasons `8..10` `33+` shares: scorers `0.422222`, assists `0.373016`;
- mean-age drift: scorers `2.535714`, assists `2.085714`;
- development parity `5/7`, active opening-senior survival `0.545575`, but
  career-generated leaders only `0.226190` and opening leaders `0.773810`;
- formation replication retention `0.890476` against `0.95`; all other carried
  L1 facts, fallbacks, stable IDs and reconciliations held;
- HTML desktop QA at `1440 x 1000`: body width `1440`, eight navigation links,
  eight sections, euro fees and buyer/seller competition facts present.
  Final JSON/HTML SHA-256 are `3ff22d4e...917` / `33881537...a7f` and the
  HTML rebuild is byte-identical.
- the final gate's only first-run failure was the academy rarity sweep's stale
  local `15s` timeout (`15.219s` contended, `10.95s` alone); it now reads the
  single suite-owned `60s` budget and keeps its real corpus and assertions.

The artifacts are
`simulation-out/phase81a-league-diversity-canary-7x10.json` and
`simulation-out/phase81a-league-diversity-canary-7x10.html`. Rendering preserves
the report's failing decision and therefore exits `1` after writing the file.
