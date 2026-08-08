# Phase 81A - Checkpoint A2.1: Low-Block Guardrail Attribution

Checkpoint A2 recorded `ownLossPerConcededReduction` above its `<= 2.0`
guardrail on the out-of-sample seeds. This asks one narrow question:
**did Step 03A's chart assignment cause that failure?**

Coupled comparison. Same seeds, same clubs, same footballers with the same
abilities, ages and contracts. The arms differ only in which chart the squad
is roled onto. Those abilities were generated from the Phase 81A roles, so
this isolates the chart component and does **not** recreate the full pre-81A
role-conditioned ability population.

The control chart is the pre-Phase-81A `positionForSlot(...)` recovered from
`f850ccc^`: a `4-2-4` shared by every club.

## in-sample (Checkpoint A before-state seeds)

- attribution: **not_reproduced**

| arm | concededExpectedGoalsReduction | ownLossPerConcededReduction | guardrail held |
|---|---:|---:|---|
| legacy chart on Phase 81A-generated footballers (control) | 0.1648 | 1.7141 | yes |
| Phase 81A squad identities | 0.1539 | 1.8938 | yes |

## out-of-sample (never used for selection or tuning)

- attribution: **legacy_chart_also_fails**

| arm | concededExpectedGoalsReduction | ownLossPerConcededReduction | guardrail held |
|---|---:|---:|---|
| legacy chart on Phase 81A-generated footballers (control) | 0.1557 | 3.0411 | **no** |
| Phase 81A squad identities | 0.1689 | 2.8051 | **no** |

## Reading

- `legacy_chart_also_fails` - applying the legacy chart to the same Phase
  81A-generated abilities does not restore the guardrail. The chart component
  is not the demonstrated cause; the whole generation change is not absolved.
- `step_03a_chart` - the legacy chart held and the current chart did not. Step
  03A reopens.
- `not_reproduced` - the current arm held here, so the A2 reading was not
  reproduced under this instrument and neither conclusion is available.

A `legacy_chart_also_fails` result permits the primary A2 result to proceed
only through Steps 04-05. Step 05 must restore the live low-block band on
both seed sets before Checkpoint B or any later step opens.
