# Pre-UI Engine Confidence Report

Date: 2026-06-23
Phase: `47-pre-ui-engine-confidence-gate`
Step: `06-pre-ui-engine-confidence-report`
Status: Complete

## Purpose

Close the pre-UI engine confidence gate.

This report decides whether the project can proceed to Phase 48 UI readiness or
whether a specific engine/content/career blocker must be fixed first.

## Final Decision

Proceed to:

`docs/steps/48-career-ui-slice-readiness-and-first-screen-scope/01-phase-47-output-review.md`

Decision status:

**Ready for Phase 48 with non-blocking risks.**

No pre-UI blocker was found. The current engine, career loop, and player
generation are credible enough to define the first career dashboard/read-model
contracts.

## Evidence Summary

### Step 01 - Scope

`docs/audits/PRE_UI_ENGINE_CONFIDENCE_SCOPE.md`

The phase uses a product-first classification model:

- pre-UI blocker;
- post-UI improvement;
- healthy variance;
- monitoring signal;
- false warning;
- unclear and needs deeper sample.

The standard is intentionally user-facing: a blocker must describe what the
manager would see, why it hurts fun or agency, which system owns it, and how to
reproduce it deterministically.

### Step 02 - Match Engine Samples

`docs/audits/PRE_UI_MATCH_ENGINE_SAMPLE_REVIEW.md`

Reviewed fixture explanations:

- `world-a fixture:000001`: Ascoli Calcio 3-0 A.S.D. Rimini;
- `world-b fixture:000001`: A.S. Rimini 1-1 Carpi Calcio;
- `world-a fixture:000006`: A.S.D. Trieste 2-2 U.S. Ravenna;
- `world-c fixture:000001`: F.C. Lucca 3-3 A.C. Cagliari.

Decision:

No match-engine blocker. The samples are explainable through team strength,
chance volume, shot-on-target quality, goalkeeper saves, timing, and variance
markers. The 3-3 sample is story-positive variance, not a logic hole.

### Step 03 - Career Loop Samples

`docs/audits/PRE_UI_CAREER_LOOP_SAMPLE_REVIEW.md`

Reviewed:

- new career creation for `phase47-engine-check`;
- career summary;
- squad view;
- youth academy view;
- development report;
- `10` worlds x `10` seasons long-run report.

Decision:

No first-dashboard blocker. Career state exposes selected club, date, next
fixture, missing preparation, squad count, condition baseline, youth count, and
development stories. The 10x10 report passed with zero failures.

Important note:

Youth nationality can render as `unknown` in the youth academy CLI output. This
is not a first-dashboard blocker if Phase 48 shows only youth count/status, but
it should be fixed before a dedicated youth detail UI.

### Step 04 - Player Generation Sanity

`docs/audits/PRE_UI_PLAYER_GENERATION_SANITY_REVIEW.md`

Reviewed:

- `world-a` and `world-b` player generation reports;
- `world-a` and `world-b` identity reviews.

Decision:

No player-generation blocker. Reviewed worlds have:

- no senior current-ability `15+` players;
- no senior or youth role-coherence warnings;
- controlled serious-prospect budgets;
- exactly `11` youth per club;
- no over-20 youth at start;
- mostly domestic lower-division squads with some foreign variety.

Minor note:

Some Italian first names repeat in selected-club samples. This is polish, not a
logic issue, because surnames/full names remain varied enough.

### Step 05 - Fun Signals And Blockers

`docs/audits/PRE_UI_FUN_SIGNALS_AND_BLOCKERS.md`

Decision:

No pre-UI blocker.

Risks carried into Phase 48:

1. Do not build UI by parsing CLI prose.
2. Do not expose raw long-run warnings as manager advice.
3. Do not show automatic squad needs.
4. Keep full youth detail out of the first dashboard unless youth identity
   presentation is fixed.
5. Treat repeated first names as polish unless the web squad table makes them
   feel repetitive.

## Final Gate Commands

All final gate commands were run with Node `v24.19.0` by setting:

```bash
PATH=/Users/elianarducci/.nvm/versions/node/v24.19.0/bin:$PATH
```

### `pnpm check`

Result: PASS.

Summary:

- ESLint passed.
- Dependency Cruiser found no dependency violations.
- Localized presentation text check passed.
- Vitest passed: `84` test files, `585` tests.
- Workspace typecheck passed.

### One-Season Smoke

Command:

```bash
pnpm cli simulate-season --seed=world-a
```

Result: PASS.

Key output:

- champion: `A.C. Lecco`, `66` points;
- top scorer: `Enrico Piazza (A.S.D. Cesena) - 20 goals`;
- top assist: `Giorgio Bellini (Virtus Trento) - 9 assists`;
- top goalkeeper saves: `Enrico D'Amico (Pro Palermo) - 81 saves`;
- strict-looking table shape: credible for a third division.

### Fixture Explanation Smoke

Command:

```bash
pnpm cli simulate-season --seed=world-a --fixture=fixture:000001 --fixture-explanation
```

Result: PASS.

Key output:

- `Ascoli Calcio 3-0 A.S.D. Rimini`;
- Ascoli: `5` shots, `4` on target, `3` goals;
- Rimini: `7` shots, `1` on target, `0` goals;
- variance markers: `low event volume`, `normal conversion`.

### Ten-Season Gate

Command:

```bash
pnpm cli ten-season-report --seed-prefix=phase47-final --worlds=10 --seasons=10
```

Result: PASS.

Key output:

- failed worlds: `0`;
- warning worlds: `2`;
- goals per match avg/p95: `2.820 / 2.920`;
- table spread avg/min: `39.25 / 34.70`;
- champion streak max: `3`;
- top assist p95: `14`;
- minimum squad size observed: `19`;
- clubs below minimum squad size: `0`;
- clubs without natural goalkeeper: `0`;
- youth roster max observed: `11`;
- failing checks: `none`;
- warning checks: `table_points_spread_avg=2`;
- signal group: `story=2`.

Interpretation:

The two warnings are story/table-spread variance, not structural failure. The
world remains safe enough for UI readiness because no squad, goalkeeper, youth,
or long-run collapse signal appeared.

### Strict Balance

Command:

```bash
pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict
```

Result: PASS.

Key output:

- goals per match: `3.102`;
- home win rate: `0.433`;
- draw rate: `0.228`;
- away win rate: `0.339`;
- first-place points: `70.300`;
- last-place points: `26.500`;
- table points spread: `43.800`;
- upset proxy rate: `0.370`.

## Phase 48 Guidance

Phase 48 should proceed, but with these constraints:

- Build structured UI-facing contracts/read models.
- Do not parse CLI text.
- Keep the first screen focused on selected club, current date, next fixture,
  match preparation, squad readiness, compact table context, and available
  actions.
- Do not expose internal warning rows as user-facing advice.
- Do not automate squad needs or market suggestions.
- Do not include a full youth detail table in the first screen unless the
  `unknown` youth nationality presentation issue is resolved first.

## Final Conclusion

The engine is not finished as a full game, but it is mature enough for the next
architectural step: defining the first career UI slice.

The correct next action is to execute:

`docs/steps/48-career-ui-slice-readiness-and-first-screen-scope/01-phase-47-output-review.md`
