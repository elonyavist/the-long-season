# Step 06B27A - Checkpoint L6.7 Soft Aging 7 x 10

## Status

Done - `REFINE: curve_strength`.

## Frozen Population

- profile `phase81a-soft-aging-l6-7-7x10`;
- seed prefix `phase81a-renewal-baseline-l6-4-v1`, identical to L6.4;
- `7` worlds, `10` seasons, exactly `7` workers;
- current product only; L6.4 is the frozen pre-change arm;
- same sections, detail and canonical producer as L6.4.

## Preregistered Decision

`GO` requires all of:

- pooled season-ten opening-senior leader ability delta `<= 0` and non-positive
  in at least `5/7` worlds;
- opening-senior leader-slot share `<= 0.55`;
- career-generated leader share `>= 0.32` and at least `+0.05` versus L6.4;
- scorer and assist age-33-plus shares each fall by at least `0.08`;
- opening-senior active share remains `0.30..0.50` rather than collapsing;
- exceptional age-33-plus leaders remain observed in at least `3/7` worlds;
- formation retention loses at most `0.02`, champion-points mean remains inside
  the frozen historical band, and reconciliation/unknown-origin failures stay
  zero.

`REFINE: curve_strength` means direction and guardrails hold but one renewal
floor misses. `REFINE: downstream_selection` means ability trajectories correct
while leader turnover does not. `STOP_RETHINK` covers collapsed veteran
reachability, structural contamination, formation/standings regression, or
movement without the player-ability path.

The old integrated report's unrelated red gates do not become failures of this
step. Every decision above is evaluated against the paired L6.4 facts.

## Expected Files

- report registry/planner, career section tests and five-language profile labels;
- this step, phase README, status, audit and audit index;
- no gameplay file unless 06B27A exposes contamination in 06B27 itself.

## Required Checks

Run the locked profile alone with `7` workers, inspect raw paired facts, render
JSON, run focused tests, `pnpm check` alone, `git diff --check`, and update
Graphify.

## Outcome

- trajectory mean `+0.542944 -> +0.503535`, non-positive worlds `0/7`;
- generated leader share `0.259524 -> 0.245238`;
- scorer age-33-plus share `0.466667 -> 0.401587`;
- assist age-33-plus share `0.387302 -> 0.346032`;
- active opening-senior share `0.520202 -> 0.522487`;
- exceptional age-33-plus observations remain `471`;
- formation retention improves `0.814286 -> 0.871429`; reconciliation and
  unknown-origin failures are zero.

The direction exists without enough force. The senior population did not
collapse, standings and formation remained healthy, and no downstream claim is
available because the causal ability path itself missed. 06B27B owns one
predeclared physical-only refinement.
