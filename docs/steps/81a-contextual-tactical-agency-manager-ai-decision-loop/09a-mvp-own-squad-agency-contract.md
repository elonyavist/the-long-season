# Step 09A - MVP Own-Squad Agency Contract

## Status

**Done on 2026-08-13.** Amendment A7 freezes the replacement MVP question,
retains the historical adversarial failure and rewrites Steps 10-12. Step 10 is
open; no gameplay changed here.

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

The amendment preregisters two untouched seven-world sets:
`phase81a-own-squad-agency-a` and `phase81a-own-squad-agency-b`. Each world
selects the first club of each of the eight generated squad identities by
stable club ID. Every selected club plays its canonical 34-fixture league
schedule from the same opening snapshot in each arm; same fixture, home/away,
players, opponent plan and match seed are paired. Each fixture arm uses eight
paired seeds. The report must state the complete population: `2` sets x `7`
worlds x `8` identity clubs x `34` fixtures x `8` seeds, separately for every
policy arm, and exactly `7` workers.

For one fixture, points are `3/1/0` from the controlled club's actual score.
`seasonPointDelta` is the sum of per-fixture mean-point differences across the
34 scheduled fixtures. It is not `winShare`, a rescaled xG quantity, or a full
career season with later state drift. The final integrated `7 x 10` owns that
longitudinal question.

Four preregistered policy arms share the same complete legal candidate space:

- `own_fit`: maximum own-squad fit score;
- `mismatch`: minimum own-squad fit score, with stable plan ID as final tie;
- `non_commit`: the canonical balanced profile plus balanced focus;
- `blind`: stable uniform assignment across candidate signatures without
  reading squad facts.

No arm reads the opponent while choosing. The opponent plan and all other facts
remain paired. At minimum the checkpoint must make these claims falsifiable:

- all three tactic profiles and all three lateral focuses are reachable on real
  generated squads;
- at least four complete `formation|tactic|focus` modal policies exist across
  the eight squad identities, no complete policy exceeds `0.50`, and catalog
  reorder invariance is exactly `1.0`;
- a six-club constant-quality role counterfactual changes the complete policy in
  at least `4/6` clubs;
- in **each** seed set, the population-weighted mean `seasonPointDelta` for
  `own_fit - non_commit` lies in `[+1.5,+6.0]`, `mismatch - non_commit` lies in
  `[-6.0,-1.5]`, and `blind - non_commit` lies in `[-0.5,+0.5]` with its 95%
  interval crossing zero;
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
- `docs/audits/PHASE_81A_CONTEXTUAL_TACTICAL_AGENCY_DESIGN_CONTRACT.md`; append
  Amendment A7 rather than rewriting the historical contract that C falsified;
- `docs/audits/README.md`;
- the phase `README.md`
- `01-contracts-and-tactical-ownership.md`; mark its historical OpponentRead
  ownership as deferred by A7;
- `03c-canonical-modular-simulation-report-foundation.md`; replace the renamed
  Checkpoint D document path so the single-entrypoint audit has no dead link;
- `10-manager-own-squad-tactical-read.md`, replacing the obsolete opponent-read
  step without an opponent oracle;
- `11-ai-own-squad-and-live-state-policy.md`, replacing the obsolete shared-read
  AI plan;
- `12-checkpoint-d-own-squad-agency.md`, replacing the historical checkpoint;
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

## Result

The contract now uses two untouched seven-world sets, eight squad identities,
each club's 34-fixture schedule and eight paired seeds per arm. Actual `3/1/0`
points aggregate at whole-club-schedule level. Own fit, mismatch, non-commitment
and blind arms have frozen bands, while all opponent facts are forbidden inputs.

Production inspection also narrowed implementation: the manager consequence
read and live AI decision loop already exist and stay canonical; Step 11 must
move the duplicated web tactic-profile table into one versioned content owner,
add own-capacity policy evaluation and supply credible live formation options.
