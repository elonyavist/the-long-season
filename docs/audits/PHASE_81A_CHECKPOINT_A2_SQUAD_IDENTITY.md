# Phase 81A - Checkpoint A2: Real-Career Squad Identity

- decision: **GO**
- low-block guardrail attribution (A2.1): **legacy_chart_also_fails**
- workers: 7
- targets: frozen in `03b-checkpoint-a2-real-career-squad-identity.md` before Step 03A

## Decision

Every primary gate passed on both seed sets and the archetype-mix counterfactual moved the chosen shape. **Only Steps 04-05 open.** Checkpoint A2.1 found that the legacy chart also fails on the same Phase 81A-generated ability vectors, so the chart component is not the demonstrated cause. It does not recreate the pre-81A role-conditioned ability population and therefore does not absolve the whole generation change. The live low-block band remains broken; Step 05 must repair it on both seed sets before Step 06 or anything after it opens.

## Causality: Archetype-Mix Counterfactual

Squad quality held constant. Each club's twenty-two footballers keep their
ability, age, condition and contract, and are re-roled onto each identity's
chart. Only the roles change.

- world: `phase81a-agency-before-state-001`
- clubs tested: 6
- clubs whose shape moved: 6
- distinct shapes per club: 5, 8, 6, 4, 6, 7
- moves the shape: **true**

| club | identity | chosen shape |
|---|---|---|
| `club:ita-3-01` | `wing_back_pairing` | `3-5-2` |
| `club:ita-3-01` | `wide_midfield_stock` | `5-4-1` |
| `club:ita-3-01` | `creator_and_wingers` | `5-2-3` |
| `club:ita-3-01` | `holding_pair_and_strike_pair` | `5-2-1-2` |
| `club:ita-3-01` | `double_width_stock` | `5-4-1` |
| `club:ita-3-01` | `holder_heavy_low_build_up` | `5-4-1` |
| `club:ita-3-01` | `winger_stock_and_strike_pair` | `5-2-3` |
| `club:ita-3-01` | `creator_trio` | `4-4-1-1` |
| `club:ita-3-02` | `wing_back_pairing` | `3-6-1` |
| `club:ita-3-02` | `wide_midfield_stock` | `4-4-2` |
| `club:ita-3-02` | `creator_and_wingers` | `4-2-3-1` |
| `club:ita-3-02` | `holding_pair_and_strike_pair` | `4-1-2-1-2` |
| `club:ita-3-02` | `double_width_stock` | `3-5-2` |
| `club:ita-3-02` | `holder_heavy_low_build_up` | `5-3-2` |
| `club:ita-3-02` | `winger_stock_and_strike_pair` | `4-2-4` |
| `club:ita-3-02` | `creator_trio` | `4-3-1-2` |
| `club:ita-3-03` | `wing_back_pairing` | `3-5-2` |
| `club:ita-3-03` | `wide_midfield_stock` | `4-4-2` |
| `club:ita-3-03` | `creator_and_wingers` | `4-2-4` |
| `club:ita-3-03` | `holding_pair_and_strike_pair` | `4-2-2-2` |
| `club:ita-3-03` | `double_width_stock` | `4-4-2` |
| `club:ita-3-03` | `holder_heavy_low_build_up` | `5-2-1-2` |
| `club:ita-3-03` | `winger_stock_and_strike_pair` | `4-2-4` |
| `club:ita-3-03` | `creator_trio` | `4-4-1-1` |
| `club:ita-3-04` | `wing_back_pairing` | `3-5-2` |
| `club:ita-3-04` | `wide_midfield_stock` | `4-4-2` |
| `club:ita-3-04` | `creator_and_wingers` | `4-2-4` |
| `club:ita-3-04` | `holding_pair_and_strike_pair` | `4-1-2-1-2` |
| `club:ita-3-04` | `double_width_stock` | `4-4-2` |
| `club:ita-3-04` | `holder_heavy_low_build_up` | `4-1-2-1-2` |
| `club:ita-3-04` | `winger_stock_and_strike_pair` | `4-2-4` |
| `club:ita-3-04` | `creator_trio` | `4-4-2` |
| `club:ita-3-05` | `wing_back_pairing` | `3-5-2` |
| `club:ita-3-05` | `wide_midfield_stock` | `4-4-2` |
| `club:ita-3-05` | `creator_and_wingers` | `5-2-3` |
| `club:ita-3-05` | `holding_pair_and_strike_pair` | `5-2-1-2` |
| `club:ita-3-05` | `double_width_stock` | `4-4-2` |
| `club:ita-3-05` | `holder_heavy_low_build_up` | `5-4-1` |
| `club:ita-3-05` | `winger_stock_and_strike_pair` | `4-2-4` |
| `club:ita-3-05` | `creator_trio` | `5-4-1` |
| `club:ita-3-06` | `wing_back_pairing` | `3-5-2` |
| `club:ita-3-06` | `wide_midfield_stock` | `4-4-2` |
| `club:ita-3-06` | `creator_and_wingers` | `4-2-4` |
| `club:ita-3-06` | `holding_pair_and_strike_pair` | `4-1-2-1-2` |
| `club:ita-3-06` | `double_width_stock` | `4-5-1` |
| `club:ita-3-06` | `holder_heavy_low_build_up` | `5-4-1` |
| `club:ita-3-06` | `winger_stock_and_strike_pair` | `4-2-4` |
| `club:ita-3-06` | `creator_trio` | `4-4-1-1` |

## Seed Set: in-sample (Checkpoint A before-state seeds)

- worlds: 7
- selections: 504
- all gates passed: **true**
- all guardrails held: **true**

| gate | observed | target | passed |
|---|---:|---|---|
| `topFormationShare` | 0.2063 | <= 0.5 | yes |
| `distinctFormationCount` | 12 | >= 6 | yes |
| `primaryRolesWithPositiveCount` | 10 of 10 | = 10 | yes |
| `distinctModalShapesAcrossIdentities` | 7 | >= 3 | yes |
| `catalogReorderInvariance` | 1.0000 | = 1 | yes |
| `meanOutOfPositionSlots` | 0.0000 | <= 0 | yes |
| `squadIdentitiesObserved` | 8 of 8 | = 8 | yes |

Non-regression guardrails. Already passing in the before-state, and never
evidence that this step improved anything - they exist so it cannot make
anything worse.

| guardrail | observed | target | held |
|---|---:|---|---|
| `concededExpectedGoalsReduction` | 0.1539 | >= 0.08 | yes |
| `ownLossPerConcededReduction` | 1.8938 | <= 2.0 | yes |

| squad identity | selections | modal shape | modal count |
|---|---:|---|---:|
| `wing_back_pairing` | 56 | `3-6-1` | 56 |
| `wide_midfield_stock` | 56 | `4-4-2` | 48 |
| `creator_and_wingers` | 84 | `4-2-3-1` | 72 |
| `holding_pair_and_strike_pair` | 60 | `4-2-2-2` | 32 |
| `double_width_stock` | 56 | `4-4-2` | 56 |
| `holder_heavy_low_build_up` | 80 | `4-1-4-1` | 64 |
| `winger_stock_and_strike_pair` | 64 | `4-2-4` | 56 |
| `creator_trio` | 48 | `4-4-1-1` | 48 |

- unattributed selections: 0

## Seed Set: out-of-sample (never used for selection or tuning)

- worlds: 7
- selections: 504
- all gates passed: **true**
- all guardrails held: **false**

| gate | observed | target | passed |
|---|---:|---|---|
| `topFormationShare` | 0.2222 | <= 0.5 | yes |
| `distinctFormationCount` | 11 | >= 6 | yes |
| `primaryRolesWithPositiveCount` | 10 of 10 | = 10 | yes |
| `distinctModalShapesAcrossIdentities` | 7 | >= 3 | yes |
| `catalogReorderInvariance` | 1.0000 | = 1 | yes |
| `meanOutOfPositionSlots` | 0.0000 | <= 0 | yes |
| `squadIdentitiesObserved` | 8 of 8 | = 8 | yes |

Non-regression guardrails. Already passing in the before-state, and never
evidence that this step improved anything - they exist so it cannot make
anything worse.

| guardrail | observed | target | held |
|---|---:|---|---|
| `concededExpectedGoalsReduction` | 0.1689 | >= 0.08 | yes |
| `ownLossPerConcededReduction` | 2.8051 | <= 2.0 | **no** |

| squad identity | selections | modal shape | modal count |
|---|---:|---|---:|
| `wing_back_pairing` | 56 | `3-6-1` | 56 |
| `wide_midfield_stock` | 68 | `4-4-2` | 68 |
| `creator_and_wingers` | 60 | `4-2-3-1` | 52 |
| `holding_pair_and_strike_pair` | 84 | `4-1-2-1-2` | 52 |
| `double_width_stock` | 52 | `4-4-2` | 44 |
| `holder_heavy_low_build_up` | 72 | `4-1-4-1` | 52 |
| `winger_stock_and_strike_pair` | 68 | `4-2-4` | 68 |
| `creator_trio` | 44 | `4-4-1-1` | 44 |

- unattributed selections: 0

