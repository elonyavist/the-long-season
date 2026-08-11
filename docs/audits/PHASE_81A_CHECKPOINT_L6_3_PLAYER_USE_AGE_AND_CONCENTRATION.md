# Phase 81A - Checkpoint L6.3 Player Use, Age And Concentration

## Verdict

`REFINE`. The structural actor rule is not accepted.

The new allocation makes shooter ability materially visible, but turns a
tactical-capacity allocation into an individual shot-propensity table. That
semantic substitution over-concentrates goals: First-Division top-ten scorers
average `37.38` against the frozen `14.5..18.5` band. Step 06B22 therefore
reopens. No target, seed or coefficient moves.

## Executed Population

- command: `pnpm cli simulation-report --profile=phase81a-integrated-l6-3-7x10 --format=json --report-output=simulation-out/phase81a-integrated-l6-3-7x10.json`;
- seed prefix: `phase81a-integrated-l6-3-v1`;
- population: `7` worlds, `10` seasons, three divisions;
- workers: exactly `7`;
- wall time: approximately `13m 30s`;
- process exit: `1`, canonical `REFINE`;
- report hash: `81b7527a1c360af041d23504dc536d8e`;
- artifact SHA-256:
  `7d81d3c2d43e982c527a874be6e9027f0b53ddc829c5920049eb24b1cbe5a7ad`;
- reconciliation failures: `0`;
- fallback selections: `0`;
- unavailable selected players: `0`.

The L6.2 and L6.3 seeds differ. Their deltas below are descriptive evidence,
not a paired causal estimate.

## Focus Results

| Metric | L6.2 context | L6.3 | Frozen band | Result |
|---|---:|---:|---:|---|
| shooter ability / nomination correlation | `0.0769` | `0.2065` | diagnostic | improved |
| creator ability / nomination correlation | `0.3253` | `0.3197` | diagnostic | stable |
| top-ten scorer mean | `19.99` | `37.38` | `14.5..18.5` | fail |
| top-ten assist mean | `8.58` | `10.25` | `8..10.5` | pass |
| scorer mean age | `29.84` | `30.14` | `25.5..28.5` | fail |
| assist mean age | `29.96` | `30.00` | `25..28.5` | fail |
| age-33+ scorer share | `0.23` | `0.28` | `0..0.12` | fail |
| age-33+ assist share | `0.28` | `0.27` | `0..0.12` | fail |
| age-33+ starts | `22.17` | `22.19` | `12..17` | fail |
| age-33+ minutes | `1818.40` | `1815.18` | `1100..1500` | fail |
| appearance share | `0.6483` | `0.6503` | `0.48..0.58` | fail |
| distinct users / club-season | `23.02` | `22.97` | `26..31` | fail |
| generated leader share, season ten | `0.2952` | `0.2881` | `0.5..1` | fail |

The maximum scorer mean is `47.9`; the assist maximum is `13.4`. Exceptional
age-33+ leaders remain reachable (`55` First-Division observations), so the age
gate is not rejecting all veteran excellence.

Late-career leader age remains structurally red: seasons 8-10 show scorer and
assist age-33+ shares `0.4556 / 0.3476`; scorer age drift is `2.7048` against
`<= 2`, while assist drift `1.0595` passes.

## Structural Account

The Step 06B22 formula multiplies player task quality by
`taskAllocationBasisPointsByRole.final_third_presence`. That asset answers how
much one role contributes to the team's finite tactical capacity; it never
claimed to be the player's share of shots. Its shipped rows make the distinction
visible:

- striker final-third allocation: `13,361` basis points;
- attacking midfielder: `6,177`;
- winger: `7,036`;
- central midfielder: `1,732`;
- centre-back: `532`.

A striker therefore receives `7.71x` a central midfielder's responsibility
before player quality enters. The superseded coarse shooter pool was `5:3`
between attacker and midfielder. Multiplication by quality then rewards the
same football hierarchy a second time. The structural rule is internally
deterministic and its branches are reachable, but its input has the wrong
domain meaning. Green implementation tests cannot make that model valid.

The creator side does not show the same failure: assist concentration remains
inside its band and its ability correlation stays stable. Any refinement must
therefore separate shooter propensity from creator responsibility rather than
undo both together.

## Carried Guardrails

- all three standings divisions remain `GO`; First Division records champion
  `74.4857`, last `22.3857`, goals/match `2.8373`, draw share `0.2706`;
- all five rank-gap upset lanes pass;
- exact first-versus-last is narrowly red: `30/102` non-losses (`0.294118`)
  against maximum `0.287469`, while wins `10/102` pass. One fewer non-loss
  would pass, but the frozen gate remains red and is not reinterpreted;
- four-formation retention is `0.87619` against `>= 0.95`;
- local replacement capacity is `0.10345`; division capacity `0.58621` passes;
- role-aware market facts reconcile with zero mismatches and missing targets.

The exact-upset red is not attributed to actor allocation from fresh-cohort
subtraction. Hierarchy and upset coefficients remain frozen.

## Handoff

Reopen Step 06B22 through a documented attribution/refinement substep. The next
design must treat tactical capacity and individual actor propensity as separate
football concepts, establish the latter from evidence before implementation,
and keep the creator path that already passes. No new output-derived response
divisor is authorized.
