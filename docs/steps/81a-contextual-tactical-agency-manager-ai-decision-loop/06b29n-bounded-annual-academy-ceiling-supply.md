# Step 06B29N - Bounded Annual Academy Ceiling Supply

## Status

Done - `REFINE`; candidate rejected and removed on 2026-08-12.

## User-Facing Reason

Ten-year careers still rely too heavily on the opening senior population. L6.16
locates the bottleneck before development, minutes or transfers: `1,030/1,116`
mature generated non-leaders cannot reach the quality of the leaders in their
own role even if all stored potential is realized. A career therefore needs a
few more credible future first-team leaders, not more generated players or an
across-the-board growth boost.

## Frozen Candidate

The candidate changes only the annual academy intake's split between existing
`good_prospect` and `serious_prospect` outcomes:

```text
prospectChance = seriousChance + interestingChance
candidateSeriousChance = min(prospectChance, 2 * seriousChance)
candidateInterestingChance = prospectChance - candidateSeriousChance
```

It keeps the same deterministic roll and therefore preserves the total prospect
share. `normal_youth`, batch size, roles, ages, the national potential-six
allocation and annual senior generation do not move. At the seven versioned
academy environments the serious share changes from `3..12%` to `6..24%`; the
combined good-plus-serious share remains `15..42%`.

The temporary typed analysis seam exists only to compare the candidate with the
current product on identical seeds. Checkpoint L6.17 must either collapse the
candidate into the sole product policy or delete it completely. Phase closeout
is not an acceptable removal owner.

## Frozen L6.17 Decision

The paired population is the L6.4 seven seeds, ten seasons and exactly seven
workers. Both arms are fresh simulations under one code revision; the report
records both arms and per-world deltas.

### Pre-Output Instrument Correction

The first execution completed all candidate shards but emitted no report and no
metric. The L6.4 cache predates the canonical succession-target-pool facts, so
the current integrated evaluator failed instead of reconstructing or defaulting
the absent field. Before any candidate output was readable, the current arm was
changed from that incompatible read-only cache to a fresh same-revision run on
the same seeds. This spends a second `7 x 10` but makes every paired field real;
the completed candidate shards remain valid and are reused.

The candidate is adopted only if all of these hold:

- mature below-role-leader-quality share falls by at least `0.05` and improves
  in at least `5/7` worlds;
- stored-ceiling-below-leader-quality share falls by at least `0.08` and
  improves in at least `5/7` worlds;
- season-ten career-generated leader share rises by at least `0.03`, improves
  in at least `5/7` worlds and reaches at least `0.28` overall;
- all four L6.15B conversion stages and both L6.16 feasibility stages remain
  reachable on real generated careers;
- the candidate preserves total generated counts, complete academy-refill
  ten-role coverage, zero generation reconciliation failures and the national
  potential-six stock; the unchanged annual-senior coverage finding may not
  worsen;
- First-Division champion points remain inside `72..88`; division replacement
  stays at least `0.50` with delta at least `-0.02`; transfer acquisitions stay
  within `0.90..1.10` of current; four-formation retention does not fall by more
  than `0.02` and remains at least `0.75` in `5/7` worlds;
- the candidate introduces no new integrated L6.2 failed gate key.

The content boundary additionally measures a deterministic real-input corpus.
The candidate must increase serious outcomes, reduce good outcomes by exactly
the same amount, preserve the total prospect count and potential-six identities,
and keep mean current ability within `0.20` of current. This is a guard against
silently solving a future-ceiling problem by shipping stronger teenagers.

Failure of a structural or current-strength guardrail rejects the candidate.
Insufficient ceiling/leader movement records `REFINE` and permits a second
bounded ceiling-distribution candidate; it never opens global development,
annual senior generation, extra academy volume or market expansion.

## Expected Files

- `packages/content/src/generators/youth-development-level.ts` and test: own the
  single conserved probability derivation;
- `packages/content/src/generators/initial-youth-academies.ts` and test: consume
  the one-roll candidate split and prove it on real generated inputs;
- `packages/content/src/generators/career-intake-players.ts`: passes the typed
  policy only to annual academy generation; annual seniors remain unchanged;
- `apps/cli/src/commands/simulation-report/career-world-facts.ts`: carries the
  typed analysis policy to the canonical annual provider;
- `apps/cli/src/commands/simulation-report/career-sections.ts`: runs paired
  current/candidate careers and evaluates L6.17 from canonical facts;
- `apps/cli/src/commands/simulation-report/succession-priority-attribution.ts`
  and test: own the frozen paired decision without duplicating career facts;
- `apps/cli/src/commands/simulation-report/report-registry.ts` and planner test:
  register the only locked `simulation-report` profile and its seven-worker
  cache identities;
- `packages/i18n/src/labels.ts`;
- this document, generated audit/index, Phase README and
  `docs/PROJECT_STATUS.md`.

No domain, engine, persistence, web, HTML, save schema or parallel report path.

## Required Checks

```bash
pnpm typecheck
pnpm exec vitest run \
  packages/content/src/generators/career-intake-players.test.ts \
  apps/cli/src/commands/simulation-report/succession-priority-attribution.test.ts \
  apps/cli/src/commands/simulation-report/report-planner.test.ts \
  --maxWorkers=7
pnpm cli simulation-report \
  --profile=phase81a-academy-ceiling-candidate-l6-17-7x10 \
  --workers=7 \
  --format=json \
  --report-output=simulation-out/phase81a-academy-ceiling-candidate-l6-17-7x10.json
git diff --check
```

The simulation gate runs alone. Each arm owns distinct stable shards under
`saves/long-run-checkpoints/`; a rerun may read them but never mix identities.

### Verdict-Neutral Reader Correction

The first complete report classified both arms as structurally invalid because
each inherited the same `56` incomplete annual-senior role rows. L6.17 changes
only academy candidates, and both arms had equal senior facts. The reader was
corrected to require complete academy-refill coverage and no regression in the
carried senior count. This cannot rescue the candidate: every preregistered
movement gate already failed, including adverse leader and quality movement.

## Outcome

The final artifact exited `1` with SHA-256
`5caab76ccd595b6dab5a2bb693ada6edbf447fb48b32b6fe5e1fa9e579d90586`.
The candidate reduced ceiling insufficiency only `0.0059`, while mature
below-leader-quality share worsened `0.0269` and generated leader share fell
`0.0048`. Coherence was `1/7`, `3/7` and `4/7` respectively. All carried
formation, standings, division-replacement and transfer-volume guardrails held,
with no new integrated failure.

The result rejects frequency as the missing owner. Every candidate seam,
profile, label and evaluator introduced by this step is removed after recording
the audit. L6.18 opens only a cached measurement of the missing ceiling distance
by division and role.
