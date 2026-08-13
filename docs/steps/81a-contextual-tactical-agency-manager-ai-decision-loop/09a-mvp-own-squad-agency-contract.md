# Step 09A - MVP Own-Squad Agency Contract

## Status

Ready. Checkpoint C recorded `REFINE: product_premise_review`; no gameplay step
is open until this documentation-only amendment freezes the replacement MVP
question and rewrites Steps 10-12.

## Goal

Separate two product promises without rewriting history:

1. the future opponent-aware manager/AI contract retains the failed
   `+0.045/-0.045` adversarial target;
2. the active MVP proves that choosing a formation, XI and tactical prior that
   fit one's own available players is useful over a season, while a mismatched
   choice is harmful and football upsets remain credible.

This step changes no target after seeing its output because it produces no
simulation output. It freezes the next checkpoint before implementation.

## Accepted Product Boundary

- Before every fixture, AI selects from its own roster, availability, condition,
  morale, selected XI and shape. It consumes no opponent formation, tactical
  distribution, hidden quality or future event.
- Formation remains geometry, players execute versioned tasks, and tactic plus
  `lateralFocus` allocate the existing contribution. No direct team-strength,
  xG, goal or result bonus is allowed.
- The human manager receives the same own-squad facts and can accept or override
  the same legal controls. Opponent evidence is deferred from this MVP rather
  than fabricated from a tactical effect the engine did not prove.
- Bounded in-match AI may react only to current score, minute, red cards,
  availability and fatigue. It may change the legal plan and substitutions; it
  may not read an opponent oracle. The exact reachable session seams must be
  verified from production code before Step 11 freezes implementation files.
- The current choice must be recomputed each fixture. No club receives a hard
  coded formation or tactic identity; persistent identity comes from its player
  population and current conditions.

## Targets To Freeze In This Step

The amendment must preregister two untouched seven-world sets and a paired
34-fixture replay before Step 10 changes code. At minimum it must make these
claims falsifiable:

- all three tactic profiles and all three lateral focuses are reachable on real
  generated squads;
- at least four complete `formation|tactic|focus` modal policies exist across
  the eight squad identities, no complete policy exceeds `0.50`, and catalog
  reorder invariance is exactly `1.0`;
- a six-club constant-quality role counterfactual changes the complete policy in
  at least `4/6` clubs;
- over 34 paired fixtures, own-squad fit gains between `1.5` and `6.0`
  league-point equivalents against non-commitment, a deliberately mismatched
  legal policy loses between `1.5` and `6.0`, and blinded policy assignment is
  within `0.5` points of zero with its 95% interval crossing zero;
- the correct-versus-wrong spread is therefore at least `3.0` points, without a
  direct result bonus or reduced score variance;
- every versioned Big Five upset, goal, draw and standings guardrail retains its
  existing reader and passes; no tactical gate may make top-versus-bottom
  surprises impossible;
- A2 formation/role gates and L6.31 renewal facts remain mandatory in the final
  integrated `7 x 10`, even though this focused checkpoint does not simulate ten
  seasons.

The `1.5..6.0` band is a product scale chosen before measurement: less than half
a win over a full season is difficult to perceive, while more than two wins
would let tactics overpower squad building. It is not derived from Checkpoint
C's observed `0.02258` ceiling.

## Expected Files

- `docs/audits/PHASE_81A_MVP_OWN_SQUAD_AGENCY_AMENDMENT.md`
- the phase `README.md`
- `10-manager-opponent-read.md`, rewritten as the manager's own-squad tactical
  read without an opponent oracle;
- `11-ai-shared-opponent-read.md`, rewritten as own-squad pre-match policy and
  bounded current-state response;
- `12-checkpoint-d-manager-ai-agency.md`, rewritten around the frozen paired
  season-scale contract;
- `docs/PROJECT_STATUS.md`
- this step document

No production, test, calibration, storage, report-registry or i18n file belongs
to this step.

## Required Checks

```bash
nvm use 24
git diff --check
test "$(wc -l < docs/PROJECT_STATUS.md)" -le 300
```

## Definition Of Done

The amendment names one current MVP contract, retains the historical adversarial
failure without lowering it, rewrites Steps 10-12 in executable order, freezes
populations and numeric targets before implementation, preserves upset and
renewal gates, and changes no code.
