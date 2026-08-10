# Step 06B10A - Lower-Division Baselines And Target Register

## Status

Done on 2026-08-09. Separate lower-division populations and one production-used
target register are frozen; no gameplay behaviour changed.

## Goal

Complete the historical calibration layer before correction: retain the frozen
Big Five first-division targets and derive independent second- and
third-division populations, normalization and targets.

## Implementation Contract

- second-division source population: Championship, 2. Bundesliga, Serie B,
  Segunda Division and Ligue 2, seasons `2005/06..2024/25`, Football-Data CSV,
  expected denominator `100` league-seasons before availability validation;
- third-division source population: England League One `2005/06..2024/25`
  from Football-Data plus German 3. Liga `2010/11..2024/25` from the public-
  domain openfootball/footballcsv mirror, expected denominator `35`;
- Italian Serie C and Spanish Primera Federacion are excluded because their
  group/regional structure is not comparable with the game's single national
  division. French National lacks one same-format twenty-year source in the
  declared corpus and is not added after output;
- accepted table/result bands are the declared population's historical
  `p10..p90`, normalized to `34` matches exactly as the Big Five baseline;
- sources, seasons, denominators, schedule normalization and exclusions are
  written before reading the game output;
- lower-division bands are not ratios copied from the Big Five;
- champion `72..88` remains first-division-only and cohort-distribution based;
- rare outliers remain legal;
- one versioned target register is consumed by later report gates.

## What NOT To Implement

- no engine, content, selection, transfer or career change;
- no runtime web fetch;
- no target chosen from the current canary;
- no new report command.

## Expected Files

- `docs/audits/PHASE_81A_LOWER_DIVISION_STATISTICAL_BASELINE.md` **(new)**;
- `apps/cli/src/commands/simulation-report/historical-simulation-targets.ts`
  and tests **(new)**: the sole versioned numeric register;
- `owner-attribution.ts`: replaces copied threshold literals with the register,
  giving the new Module a production caller immediately;
- `PHASE_81A_POST_L5_CORRECTION_TRANCHE.md` if evidence refines its scope;
- this step document;
- phase `README.md`, audit `README.md`, `docs/PROJECT_STATUS.md`;
- the exact versioned target-register owner, added only after production-code
  inspection and `graphify affected`.

## Exit

GO freezes separate First/Second/Third targets. REFINE fixes only source or
normalization quality. No gameplay step opens.

## Recorded Outcome

- Second Division: `100` league-seasons, `42,453` matches; champion p10..p90
  `60.8293..73.6913` on 34 matches.
- Third Division: `31` league-seasons, `14,723` matches; champion p10..p90
  `62.0870..76.0526`. The contract's expected denominator was `35` with
  3. Liga from `2010/11`; the source carries no 3. Liga file before `2014-15`,
  so availability validation reduced the corpus to `31`. That cause went
  unrecorded at freeze time; 06B18 recorded it in the baseline document
  (source unavailability, data unchanged).
- All six table/result metrics have independent level-one, level-two and
  level-three bands in `historical-simulation-targets.ts`.
- The existing L5.1 reader consumes that register, so no dead calibration
  export or copied literal remains.

## Verification

- focused target/owner tests: `2/2`;
- `pnpm check`: exit `0`, run alone; `302` files and `2,308` tests, `874`
  dependency modules and `3,603` dependencies clean;
- all custom checks and typechecks green.

Next: 06B10B repairs the fail-open decision and exact metric identity before
any attribution retry.
