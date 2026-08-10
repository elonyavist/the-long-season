# Step 06B9 - Big Five Statistical Baseline And Preregistration

## Status

Done on 2026-08-09. No gameplay or report code changed. The Big Five baseline,
accepted product bands and the post-L5 attribution order were frozen before
Step 06B10 instrumentation or corrective implementation.

## Goal

Turn the L5 human findings into an external, reproducible football benchmark
without choosing an engine owner from the output.

## Adopted Solution

- Compare only the fictional first division with the real Big Five.
- Use `100` league-seasons from 2005/06 through 2024/25 for results and table
  shape.
- Use `22,065` player-seasons from 2017/18 through 2024/25 for playing time,
  age and leader production.
- Normalize unequal schedules to `34` matches.
- Preserve total goals and draw share as guardrails while adding table
  hierarchy, player-use, age and leader-production facts.
- Keep rare over-33 leaders reachable; never force or directly penalize their
  output.
- Keep second- and third-division calibration out of scope until a separate
  lower-league source population is declared.

The full population, method, caveats, observations and accepted targets live in
[`PHASE_81A_BIG_FIVE_STATISTICAL_BASELINE.md`](../../audits/PHASE_81A_BIG_FIVE_STATISTICAL_BASELINE.md).

## Post-L5 Ordered Tranche

1. **06B10 / L5.1:** instrument and attribute table compression, age/minute
   concentration, leader diffusion and club-identity erosion on one canonical
   `7 x 10` population.
2. **06B11:** correct only the demonstrated table-hierarchy owner.
3. **06B12 / L5.2:** repeat a `7 x 2` table checkpoint because the defect is
   already present at career opening.
4. **06B13:** correct only the demonstrated selection, development or renewal
   owner for excessive late-career senior load.
5. **06B14:** make creator/shooter opportunity depend on current football task
   quality only if L5.1 attributes the flat leaderboard to actor allocation;
   age never enters actor choice.
6. **06B15 / L5.3:** `7 x 10` player-use, renewal, leader-age and production
   checkpoint.
7. **06B16:** preserve a soft club role blueprint through annual intake only if
   L5.1 confirms that the current deficit-balancing allocation erodes identity.
8. **06B17 / L5.4:** integrated `7 x 10` JSON and English desktop HTML. It is
   the only post-remediation cohort allowed to reopen the `100 x 10` main run.

No owner step starts when L5.1 returns `not_attributed`. Conditional step
documents are completed only after the preceding checkpoint names their exact
files and owner branch.

## What NOT To Implement

- no match, selection, generation, development, transfer or intake change;
- no new CLI report command;
- no historical data fetch at runtime or during `pnpm check`;
- no top-flight thresholds applied to lower divisions;
- no direct result bonus for club tier;
- no direct age modifier for goals, assists or actor selection;
- no widening of existing gates to accept the canary.

## Expected Files

- `docs/audits/PHASE_81A_BIG_FIVE_STATISTICAL_BASELINE.md` **(new)**;
- `docs/audits/README.md`;
- `docs/audits/PHASE_81A_CONTEXTUAL_TACTICAL_AGENCY_DESIGN_CONTRACT.md`;
- this step document **(new)**;
- `06b10-checkpoint-l5-1-owner-attribution.md` **(new, next-step contract)**;
- phase `README.md`;
- `docs/PROJECT_STATUS.md`.

## Required Checks

```bash
nvm use 24
pnpm check
git diff --check
```

No simulation is run in this documentation-only step. The repository gate runs
alone.

## Definition Of Done

- source populations and denominators are explicit;
- first division and lower divisions are not conflated;
- every target is frozen before corrective code;
- the next checkpoint can return `not_attributed` rather than guessing;
- no production file changed.

## Recorded Outcome

The product owner accepted all three decisions: Big Five calibration for the
first division, normal champion range `72..88` on `34` matches, and rare but
unrestricted over-33 leaders. Step 06B10 is authorized as instrumentation and
attribution only.

## Verification

- `pnpm check`: exit `0`, run alone on Node 24; `300` test files and `2,304`
  tests passed, with `870` dependency modules and `3,591` dependencies clean;
- all four project-specific checks and typechecking passed;
- `git diff --check`: clean;
- `docs/PROJECT_STATUS.md`: `299` lines.
