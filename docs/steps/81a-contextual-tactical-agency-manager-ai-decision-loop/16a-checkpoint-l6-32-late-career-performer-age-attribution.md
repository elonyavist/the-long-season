# Step 16A - Checkpoint L6.32 Late-Career Performer Age Attribution

## Status

Done. `SHARED_QUALITY_LIFECYCLE_OWNER`; Step 16B owns the paired correction
design. This checkpoint changed no gameplay.

## User-Facing Reason

The accepted L6.31 runway improves renewal relative to its control, but the
desktop report still tells the wrong ten-season story: by seasons seven to ten,
First-Division scorer and creator tables are dominated by players over thirty.
The game must keep exceptional veteran stories without making one opening
generation own nearly every later leaderboard.

This checkpoint locates where the age skew first appears. It does not penalize
an individual because of age and does not make a young player score because he
was generated later.

## Frozen Real-World Reference

The existing Big Five register remains the sole numeric authority:

- top-ten scorer mean age `25.5..28.5`;
- top-ten creator mean age `25.0..28.5`;
- scorer and creator age-33-plus share each `<= 0.12`;
- season-ten career-generated leader share `>= 0.50`;
- rare age-33-plus leaders remain legal and observed, never capped.

The local baseline contains `400` scorer and `400` creator top-ten rows over
`40` Big Five league-seasons. Its observed means are `26.62` and `26.29`, with
age-33-plus shares `0.080` and `0.065`. Independent research supports a broad,
position-dependent peak rather than a cliff: Dendir's four-league player model
places outfield peaks at `25..27`, while award nominations place exceptional
individual peaks around `27..28` and allow later positional peaks. Recent
longitudinal match tracking finds high-intensity physical decline after 32 while
endurance and technical/tactical compensation remain heterogeneous.

Sources:

- <https://journals.sagepub.com/doi/10.3233/JSA-160021>
- <https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.661523/full>
- <https://pmc.ncbi.nlm.nih.gov/articles/PMC12551122/>

## Frozen Population

- exact read-only `facts-v3` cache behind the accepted
  `phase81a-routine-youth-runway-l6-31-oos-candidate-7x10` report;
- seven worlds, ten simulated seasons and exactly seven recorded workers;
- only `competition:ita-1`, seasons `7..10`: `28` late-career competition
  observations;
- canonical `ownerAttribution.playerSeasons` and
  `renewalArchitecture.playerOrigins` facts, never reconstructed from HTML;
- outfield players only; goalkeeper longevity cannot explain scorer or creator
  leaderboards;
- player ID is the final deterministic tie-breaker.

This population can identify where the current accepted product becomes old-
skewed. It cannot prove that one unexecuted correction will repair the product.

## Frozen Measurements

For scorer and creator lanes, rank exactly ten players in every competition-
season at four outcome-unconditioned or progressively downstream rungs:

1. `quality`: role-current ability among roles with a positive canonical lane
   opportunity;
2. `opportunity_rate`: shots or creator nominations per 900 minutes, requiring
   at least 900 minutes;
3. `raw_opportunity`: shots or creator nominations;
4. `actual_output`: goals or assists.

Each rung records mean age, age-30-plus share, age-33-plus share, the four
origin counts and its complete `280`-slot reconciliation. `actual_output` also
evaluates the frozen historical bands.

Two outcome-free counterfactuals compare each quality top ten with:

- the best ten players aged `22..29` in the same observed population;
- the best ten players not originating from `opening_senior`.

Record the median quality gap for both. The existing `0.50` role-quality floor
is material; it is not selected from this report. Counterfactual players are
analysis oracles only and never become a lineup preference.

Also record, at season ten, active population and quality-top-ten counts split
between `opening_senior`, `opening_academy` and `annual_academy_intake`, plus
the current and stored-ceiling counts above `16.0`, `16.5` and `17.0`. These
thresholds describe the already-versioned 1-20 ability scale and do not become
gameplay gates.

## Frozen Decision

- `STOP / RETHINK`: any cache identity, seven-world/ten-season metadata,
  origin join, `28`-observation, `280`-slot or replay reconciliation fails.
- `DOWNSTREAM_OWNER`: an absolute output-age gate fails while the matching
  quality rung is inside its output band and both successor quality gaps are
  below `0.50` in aggregate and in at least `5/7` worlds.
- `QUALITY_SUPPLY_OWNER`: an output-age gate fails, at least one successor
  quality gap is `>= 0.50` in aggregate and in `>=5/7` worlds, and the quality
  rung is already older than the matching output upper age bound.
- `SHARED_QUALITY_LIFECYCLE_OWNER`: the `QUALITY_SUPPLY_OWNER` conditions hold
  and the quality rung itself has age-33-plus share above `0.12`. This opens a
  paired population-tail/lifecycle factorial, not two independent fixes.
- `GO`: every absolute output-age and generated-leader gate already holds.

Minutes, actor allocation, output conversion, retirement and aging remain
closed unless the rung where age skew first appears authorizes them. A relative
L6.31 improvement cannot override an absolute red result.

## Expected Files

- `apps/cli/src/commands/simulation-report/succession-priority-attribution.ts`
  and test. Extend the existing renewal owner with the age ladder and
  counterfactuals; do not introduce a parallel statistics module.
- `apps/cli/src/commands/simulation-report/career-sections.ts` and test. Read
  the accepted L6.31 cache through the canonical career section path.
- `apps/cli/src/commands/simulation-report/report-registry.ts` and
  `report-planner.test.ts`. Add one locked read-only L6.32 profile mapped to the
  current OOS candidate `facts-v3` cache and exactly seven workers.
- `packages/i18n/src/labels.ts`. Profile name and description in all supported
  languages.
- `vitest.config.ts`. The full gate exposed nested simulation contention: five
  tests timed out across four files with seven files active, while all four
  files pass alone. Cap file-level test workers at four; checkpoint simulation
  workers remain exactly seven and no timeout is widened.
- `docs/audits/PHASE_81A_CHECKPOINT_L6_32_LATE_CAREER_PERFORMER_AGE.md` **(new,
  generated outcome)** and `docs/audits/README.md`.
- this document, phase README and `docs/PROJECT_STATUS.md`.

No engine, content, domain, storage, web, HTML, coefficient, save, player state,
selection score, output probability, retirement or report entrypoint change.

## Outcome

The cached report was executed twice and is byte-identical. Both executions
return process exit `1` because an attribution checkpoint naming an owner is not
a gameplay `GO`; all cache, origin and slot reconciliations hold with zero
failure.

The result is `SHARED_QUALITY_LIFECYCLE_OWNER` in both scorer and creator lanes:

| Late First-Division seasons 7-10 | Scorer | Creator | Frozen reference |
| --- | ---: | ---: | ---: |
| actual-output mean age | `30.99` | `30.31` | `25.5..28.5` / `25.0..28.5` |
| actual-output age-30-plus share | `0.7821` | `0.6714` | diagnostic |
| actual-output age-33-plus share | `0.4571` | `0.4107` | `<= 0.12` |
| quality mean age | `30.99` | `30.99` | matching output upper bound |
| quality age-30-plus share | `0.7821` | `0.7821` | diagnostic |
| quality age-33-plus share | `0.4143` | `0.4143` | `<= 0.12` |

All four rungs reconcile at exactly `280` observations per lane. The skew is
already present at quality; minutes, opportunity allocation and output
conversion do not create it. The median gap from the incumbent quality top ten
to the best age-22..29 alternative is `1.8876`, and to the best non-opening-
senior successor is `1.9321`. Both exceed the frozen materiality floor in all
`7/7` worlds.

At season ten, only `28/140` (`0.20`) scorer/creator leader slots belong to
annual academy intake. The active First-Division population contains `938`
annual-intake players, yet only `16/11/7` have current quality at least
`16.0/16.5/17.0`; the corresponding opening-population counts are `72/45/6`.
The seven generated players who reach `17.0` prove that young quality works
when it exists. Its supply is too thin, while the opening population retains
too much high quality for too long.

Therefore no direct age penalty in scoring, assists or lineup selection is
authorized. Step 16B must test a stationary high-quality successor tail and a
heterogeneous late-career lifecycle together and separately, on the same
players and seeds, before adopting either.

The first full gate recorded five timeouts across four simulation-heavy files.
All four pass alone (`10/10`, `3/3`, `20/20`, `16/16`); the heaviest file takes
`558.87s` in isolation but keeps every individual finite test budget. The suite
was nesting file-level parallelism over simulation parallelism. Its owner now
caps test files at four workers; report/checkpoint profiles remain at seven.

## Required Checks

Run Graphify explain/affected before shared report edits; focused reachability,
reconciliation and decision tests; typecheck; then twice, alone:

```sh
pnpm cli simulation-report \
  --profile=phase81a-late-career-performer-age-l6-32-cached \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81a-late-career-performer-age-l6-32-cached.json
```

The second output uses a distinct path and must be byte-identical. Close with
`git diff --check`, `graphify update .` and `pnpm check` alone. A gameplay step
may be written only after this checkpoint names its owner.
