# Phase 81A Checkpoint L4 - Generational Succession

## Decision

**OWNER IDENTIFIED, followed by Step 06B7 `STOP / RETHINK`.** The report first
proved and corrected a real `ai_selection_opportunity` boundary: an automatic
club with ten available seniors could not field an XI despite having eleven
active academy players covering a legal matchday skeleton. After that boundary
was corrected, the complete funnel showed that another local coefficient is
not enough to renew the visible top-player population.

Step 06B8 did not run. No integrated replacement HTML is valid while the
renewal gate is closed.

## Canonical Population

- profile: `phase81a-generational-succession-l4-7x10`;
- seed prefix: the locked seven L1 canary worlds;
- worlds / seasons / workers: `7 / 10 / 7`;
- final adopted-code report:
  `simulation-out/phase81a-generational-succession-l4-final-7x10.json`;
- SHA-256:
  `584f478f84233c9341c40dded50e89dae59e54b0697fdb43613e0f99c8d77aa0`;
- unknown origins and competition-worlds without promotion: `0 / 0`.

## Corrected Matchday Boundary

The first complete diagnosis could not finish because
`club:ita-3-17` reached season seven with ten available senior players. The
same club had eleven active academy players at
`am, cb, cb, cm, cm, dm, gk, lb, rb, rw, st`.

The adopted correction keeps ordinary senior selection first. Active same-club
academy candidates are considered only after the ordinary selector fails, and
the output records the exact academy IDs actually selected. The final cohort
observed `10` emergency selections; an ordinary successful selection observes
none. No registration, contract, promotion or academy status is fabricated.

## Final Funnel

| Measure | Result | Frozen reading |
|---|---:|---|
| opening population | `12,474` | denominator |
| career-generated population | `9,961` (`79.85%`) | quantity holds |
| mature academy intakes | `5,661` | fair maturation window |
| promotion candidates | `1,437` (`25.38%`) | conversion holds narrowly |
| completed promotions | `1,101` (`76.62%`) | promotion holds |
| season-ten registered generated | `1,346` | opportunity denominator |
| season-ten selected generated | `1,077` (`80.01%`) | selection holds |
| generated season-ten leader rows | `6/420` (`1.43%`) | renewal fails |
| opening season-ten leader rows | `414/420` (`98.57%`) | renewal fails |
| worlds with a generated leader | `4/7` | below frozen `7/7` target |
| emergency selections | `10` | real-data reachability proved |

Transfer/free-agent acquisition share (`379/8,922`, `4.25%`) is descriptive,
not an owner. Academy promotions bypass acquisition, so those two quantities
are not adjacent funnel stages. The earlier artifact that treated them as one
is retained as failed instrumentation evidence and was not relabelled.

## Paired Correction Attempts

| Arm | Generated leader rows | Opening share | Additional signal | Decision |
|---|---:|---:|---|---|
| adopted baseline plus emergency path | `6` | `98.57%` | generated age `21..24` ability `6.81` | reference |
| stronger soft outfield aging | `5` | `98.81%` | opening `33+` rows `329 -> 323` | remove |
| stronger positive real-minute opportunity | `5` | `98.81%` | generated age `21..24` ability `6.84` | remove |

Both experiments failed in the direction the frozen rule reads. Both were
removed completely; the adopted production curves remain the L3 curves.

## Interpretation

The career already generates players, promotes them and selects them. The
missing bridge is the chance to accumulate meaningful real development minutes
before those players are expected to displace prime seniors. Increasing the
reward for sparse senior minutes cannot help a player who records zero minutes,
and stronger aging merely lowers veterans without creating a developed
replacement cohort.

The next admissible hypothesis is therefore architectural: canonical
academy/reserve fixtures, loans, or another single owned pathway that produces
durable development minutes. It needs its own implementation step and paired
checkpoint. Adding a youth bonus, forcing leaderboard turnover or continuing
to tune aging would violate the attribution result.

This interpretation is consistent with the external references frozen by
Amendment A2: large elite-football samples place most outfield peak performance
in the mid-to-late twenties, with later positional peaks for goalkeepers and
centre-backs, while longitudinal work finds marked high-intensity decline above
32. Evidence on youth transitions also shows that reaching senior football is
a selective pathway rather than an automatic age replacement:

- [Frontiers: age trends and peak performance in UEFA Champions League players](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2019.00076/full)
- [PubMed: age-related match-performance trajectories in professional football](https://pubmed.ncbi.nlm.nih.gov/41133575/)
- [Frontiers: youth-to-senior transition in professional football](https://www.frontiersin.org/journals/sports-and-active-living/articles/10.3389/fspor.2024.1420220/full)

## Protocol Consequence

Step 06B7 ends at `STOP / RETHINK`. Step 06B8, its `7 x 10` HTML, the fresh
`100 x 10` L1 main cohort and Checkpoint B2 remain closed. This is not a claim
that the completed substitution, fatigue, recovery, injury or emergency-callup
work failed; it prevents those improvements from being mistaken for proof that
the ten-season player world now renews correctly.
