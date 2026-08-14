# Step 16F - Checkpoint L6.37 Reachable-Potential Compression Owner

## Status

Done - **`OWNER_IDENTIFIED: premature_potential_compression`**. This is a
read-only closeout of the current-product L6.36 control facts and the two
production policies that authored them. It changes no gameplay.

## Thesis

The late-career leaderboard is old because the career does not preserve the
quality tail it has already authored for young successors. The generation
policy declares a serious young player's ceiling reachable, but the engine
uses a second, stricter age table and deletes part of that ceiling during
monthly development. More minutes after promotion cannot recover potential
that no longer exists.

This is not evidence for a youth bonus or an over-30 penalty. It is evidence
that one football concept has two owners whose contracts disagree.

## Current-Code Contradiction

`familyGrowthCap(...)` in
`packages/content/src/generators/player-potential-allocation.ts` is the
construction bound used by the joint current/potential profile. For young
outfield players it permits up to `10` points of family room through age 17 and
`9` through age 21.

Every monthly development pass then calls `applyPlayerAgingPolicy(...)`.
`remainingReachableRoom(...)` in
`packages/engine/src/career/player-aging-policy.ts` independently caps the same
room at `5` for physical and `6` for every other outfield family through age
21. The stricter runtime table can therefore compress a ceiling at age 15-20
even though the generator proved that exact profile reachable. The Phase 80A
contract requires young joint profiles to remain inside the age/role
family-growth path and forbids advertising an impossible ceiling.

## Observed Current-Product Population

The analysis reads the seven L6.36 `control` shards only: seven OOS worlds, ten
seasons, exactly the adopted product, zero reconciliation failure. It joins all
accepted First-Division academy candidates generated in seasons 1-6 to the
canonical player-season facts. No candidate arm or output-conditioned filter
enters the population.

| class | generated | represented | active S10 | ceiling >=16 | ever current >=16 |
| --- | ---: | ---: | ---: | ---: | ---: |
| routine | `1,156` | `645` | `622` | `0` | `0` |
| interesting | `509` | `299` | `285` | `0` | `0` |
| serious | `176` | `100` | `97` | `60` | `0` |
| rare | `63` | `33` | `33` | `63` | `17` |

For the high-ceiling players that become observable in senior football:

| class | rows | generation age/current/ceiling | first senior age/current/ceiling | mean ceiling lost | loss >0.5 | current >=16 |
| --- | ---: | --- | --- | ---: | ---: | ---: |
| serious | `33` | `16.08 / 8.19 / 16.22` | `20.70 / 12.37 / 13.73` | `2.47` | `33/33` | `0/33` |
| rare | `33` | `16.00 / 11.10 / 18.30` | `21.09 / 15.41 / 16.57` | `1.62` | `23/33` | `17/33` |

The represented serious players still average `3,366` senior minutes and a
`4.34` current-quality gain from generation. Their problem is not zero
football: the authored upper tail has already been compressed by the time that
football could convert it. This also explains why L6.35's higher ceiling and
L6.36's abundant U23 minutes were individually reachable yet non-material.

## Decision

The next step may change only the duplicated reachability/compression owner.
It must:

- establish one total family/age policy readable by content and engine;
- preserve every authored current profile, candidate count, prospect class,
  role, age, club and exceptional-stock allocation;
- keep actual growth dependent on minutes, performance, environment, dated age
  curves, variance and hard caps;
- retain potential compression when a ceiling is genuinely no longer
  reachable;
- never read age or origin in selection, shots, goals, assists or opportunity;
- prove the exact current arm is reproduced before comparing a candidate.

Step 16G owns the paired causal checkpoint. No fresh HTML is authorized by this
diagnosis alone.

## Expected Files

- this document;
- `docs/audits/PHASE_81A_CHECKPOINT_L6_37_REACHABLE_POTENTIAL_COMPRESSION_OWNER.md`;
- phase README, audit index and `docs/PROJECT_STATUS.md`.

## Verification

- all counts reconcile to the seven immutable L6.36 control shards;
- the two policy tables are read from production, not copied from a document;
- `git diff --check` and the repository 300-line status budget;
- no production or report code changes in this step.
