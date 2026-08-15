# Phase 81A Checkpoint L6.41 - Role-Aware Aging

## Verdict

**`STOP_RETHINK` on 2026-08-15.** The role-aware late-career aging candidate
was rejected and removed. The shipped L6.40 aging model remains unchanged.

This is not a near miss that authorizes coefficient tuning. The candidate
failed its intended attacking and resilience directions, increased the opening
elite stock, reduced generated elite stock and introduced a new historical
guardrail failure.

## Population And Reproducibility

- control profile: `phase81a-role-aware-aging-l6-41-control-7x10`;
- candidate profile: `phase81a-role-aware-aging-l6-41-candidate-7x10`;
- frozen seed prefix:
  `phase81a-stationary-age-succession-l6-40-oos-v1`;
- seven worlds, ten seasons and exactly seven workers per arm;
- both arms ran only through `pnpm cli simulation-report`;
- control and candidate reports rebuilt byte-identically from their completed
  caches;
- the control reproduced the L6.40 checkpoint exactly and returned
  `CONTROL_RECORDED` with `instrumentContinuityHeld=true`.

The first control attempt used an incomplete observation envelope. Its `v1`
shards are valid simulations but not evidence. The corrected `v2` profile
enabled the inherited standings, market and strength readers and was rerun
without filling facts after output.

## Frozen-Gate Outcome

| area | control | candidate | result |
|---|---:|---:|---|
| attacking-explosive median delta, age 30..32 | n/a | `-0.007736` | misses `<= -0.02` |
| wide-explosive median delta, age 30..32 | n/a | `-0.041376` | holds |
| central-durable median delta | n/a | `0` | diagnostic |
| goalkeeper median through age 34 | n/a | `0` | holds |
| wide decline at least central | n/a | `7/7` worlds | holds |
| resilience direction | n/a | `0/7` worlds | fails |
| opening-senior current-16 stock | `91` | `98` | worsens `7.69%` |
| worlds improving opening current-16 stock | n/a | `2/7` | fails |
| career-generated current-16 stock | `15` | `10` | fails guardrail |
| career-generated leader share | `0.207143` | `0.214286` | holds in isolation |
| scorer mean age | n/a | `30.30` | fails |
| creator mean age | n/a | `30.13` | fails |
| scorer age-33-plus share | n/a | `0.27` | fails |
| creator age-33-plus share | n/a | `0.32` | fails |
| age-33-plus starts / minutes | n/a | `22.84 / 1846.86` | both fail |

Exceptional veterans remained reachable (`32` distinct age-33-plus leaders),
so the failure is not caused by deleting longevity. The candidate instead did
too little in the attacking lane, proved no resilience ordering, and made the
season-ten stock balance worse.

## World Guardrails

The candidate added one failure absent from control:
`upsets:first_versus_last`. All reconciliation facts held. Structural
reachability found every lane and ability family, a negative explosive change,
goalkeeper preservation and an exceptional older leader, but did not reach the
required resilience direction on real output.

## Decision Account

The preregistered rule required `STOP_RETHINK` when the candidate could not
separate the role/resilience lanes or improved leader ages only by damaging
successor flow or general football output. Three independent reasons trigger
that outcome:

1. the attacking lane and resilience policy do not execute as intended;
2. opening current-16 veterans rise from `91` to `98`, while generated
   current-16 players fall from `15` to `10`;
3. the historical upset suite gains a new red gate.

No post-output coefficient change is authorized. Every candidate production
field, asset, selector, profile, label and test was removed in the same step.
There is no dormant aging variant or dead analysis seam.

## What This Falsifies

The L6.40 late-career imbalance is not safely repairable by adding a single
role-aware physical aging curve on top of the present population and successor
pipeline. The current evidence still names `OPENING_STOCK_RETENTION` and
`SUCCESSOR_FLOW`, but this candidate moved both in the wrong direction.

A later proposal must first explain why current-16 opening seniors survive and
why the candidate reduced generated current-16 stock. It may not start by
retuning these rejected magnitudes or by adding a direct age penalty to
selection, goals, assists or match results.

## Evidence

Local generated artifacts, intentionally outside version control:

- `simulation-out/phase81a-role-aware-aging-l6-41-control-7x10.json`;
- `simulation-out/phase81a-role-aware-aging-l6-41-control-7x10-rebuild.json`;
- `simulation-out/phase81a-role-aware-aging-l6-41-candidate-7x10.json`;
- `simulation-out/phase81a-role-aware-aging-l6-41-candidate-7x10-rebuild.json`;
- corresponding `v2` resumable caches under
  `saves/long-run-checkpoints/`.

The candidate report records `STOP_RETHINK`; the control records
`CONTROL_RECORDED`. Rebuild comparisons returned zero byte differences.
