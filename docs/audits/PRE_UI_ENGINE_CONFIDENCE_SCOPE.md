# Pre-UI Engine Confidence Scope

Date: 2026-06-23
Phase: `47-pre-ui-engine-confidence-gate`
Step: `01-engine-confidence-scope`
Status: Complete

## Purpose

Define the evidence needed before the project starts UI-readiness work.

The first UI will make the current engine much more visible. This audit gate
therefore checks whether the game is credible and fun enough to expose, not
whether every metric is mathematically tidy.

## Current Confidence Baseline

Recent phases provide a healthy baseline:

- Phase 39 locked representative match behavior and added fixture explanation
  traces.
- Phase 41 made selected-starter condition consequences visible and persistent
  in career matchday progression.
- Phase 46 split long-run reporting enough that warning output can be reviewed
  as product evidence instead of CLI noise.
- Phase 24 reworked player generation so lower-division squads are no longer
  broadly overpowered and role-incoherent.

The current project is therefore ready for a pre-UI confidence audit. It is not
yet automatically cleared for UI: the next steps must review concrete samples.

## Pre-UI Questions

### Match Engine

- Do fixture explanations make football sense?
- Are scorelines explainable from team strength, chance volume, shot quality,
  and variance markers?
- Do scorers, creators, defenders, and goalkeepers look plausible for the
  reported match?
- Are unusual results interesting football variance or signs of missing logic?

### Season And Table

- Does the season table create believable tension?
- Are champion points, relegation-level points, goal difference, and attack/
  defense profiles credible for a third division?
- Do table warnings indicate user-facing problems or monitoring signals?

### Career Loop

- Does the manager have meaningful next decisions after creating a career?
- Are lineup/tactic preparation, condition, next fixture, squad depth, youth,
  development, and turnover visible enough to support a first dashboard?
- Does the loop create stories across seasons without collapsing squad
  structure?

### Player Generation

- Do abilities match role, age, division, club strength, current ability, and
  potential?
- Are rare lower-division outliers controlled enough to create stories without
  breaking the world?
- Are names and club identities varied enough for user-facing screens?

### Warning Semantics

- Does a warning describe a real problem, a monitorable trend, healthy football
  variance, or a threshold/presentation issue?
- Would the user see the issue in the first UI slice?

## Sample Seeds

Use these deterministic seeds for the confidence pass:

- `world-a`: current primary smoke seed, used by many architecture and engine
  reports.
- `world-b`: secondary seed to catch seed-specific illusions.
- `world-c`: optional third seed when a finding is unclear.
- `phase47-career-*`: batch seeds for ten-season and career-loop report review.
- `test-balance`: strict calibration profile smoke prefix.

## Required Evidence Commands

### Match Samples

```bash
pnpm cli simulate-season --seed=world-a --fixture=fixture:000001 --fixture-explanation
pnpm cli simulate-season --seed=world-b --fixture=fixture:000001 --fixture-explanation
pnpm cli simulate-season --seed=world-a
pnpm cli simulate-season --seed=world-b
```

Optional deeper samples when one result looks suspicious:

```bash
pnpm cli simulate-season --seed=world-c --fixture=fixture:000001 --fixture-explanation
pnpm cli simulate-season --seed=world-a --fixture=fixture:000006 --fixture-explanation
```

### Career Loop Samples

```bash
pnpm cli career --save=phase47-engine-check --seed=world-a --new-world-preview
pnpm cli career --save=phase47-engine-check --summary
pnpm cli career --save=phase47-engine-check --development-report
pnpm cli ten-season-report --seed-prefix=phase47-career --worlds=10 --seasons=10
```

### Player Generation Samples

```bash
pnpm cli simulate-season --seed=world-a --player-generation-report
pnpm cli simulate-season --seed=world-b --player-generation-report
pnpm cli simulate-season --seed=world-a --identity-review
```

### Final Gates

```bash
pnpm check
pnpm cli simulate-season --seed=world-a
pnpm cli simulate-season --seed=world-a --fixture=fixture:000001 --fixture-explanation
pnpm cli ten-season-report --seed-prefix=phase47-final --worlds=10 --seasons=10
pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict
```

## Classification Model

| Classification | Meaning | UI Decision |
|---|---|---|
| Pre-UI blocker | A visible issue would make the first UI misleading, unfun, or obviously broken. | Stop before Phase 48 and document a scoped fix. |
| Post-UI improvement | Real issue, but not harmful to the first dashboard or first playable slice. | Proceed, track for later phase. |
| Healthy variance | Rare but explainable football story. | Preserve; do not tune away. |
| Monitoring signal | Worth watching across larger samples, but not yet a user-facing problem. | Proceed with report note. |
| False warning | Threshold or presentation signal does not match product meaning. | Do not tune behavior; consider report semantics later. |
| Unclear | Evidence is insufficient or contradictory. | Run a deeper focused sample before deciding. |

## Evidence Standard

A finding should become a blocker only when it can answer all of these:

1. What would the user see?
2. Why would it feel wrong or reduce agency/fun?
3. Which system owns the behavior?
4. Is the issue reproducible with a deterministic command?
5. Is there a narrow fix that does not create a broader refactor?

## Step 01 Decision

Proceed to Step 02.

The confidence gate has a clear sample plan and a product-first classification
model. Later steps should not tune the game just to remove warnings; they should
classify evidence by user-facing impact.
