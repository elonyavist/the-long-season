# Phase 81A - Checkpoint D2 Specialised Own-Squad Agency

## Verdict

`REFINE`. The six-plan structure is varied, deterministic and opponent-free,
but neither correct own-squad fit nor deliberate mismatch reaches the frozen
season-point magnitude. Step 13 remains closed. Step 12D must attribute the
first weak translation stage before any gameplay owner can reopen.

## Frozen Population

- sets `phase81a-specialised-own-squad-c` and
  `phase81a-specialised-own-squad-d`, seven worlds each and independently
  decided;
- first stable club for all eight generated squad identities, the canonical
  34-fixture schedule and eight paired match seeds per arm;
- arms `own_fit`, `mismatch`, `non_commit`, `blind` on identical footballers,
  fixtures and RNG seeds;
- historical lane: the same worlds advanced for five seasons, producing 35
  first-division seasons per set and 105 competition-seasons per set;
- exactly seven workers, v11 match-tactics content, schema v9;
- renewal `not_evaluated`, never inherited from L6.31.

The modular report ran alone for `1,650,669 ms`, wrote
`simulation-out/phase81a-checkpoint-d2-specialised.json` with hash
`0bd9ef5a0aec25d888a220418997eac3`, and exited `1` because the checkpoint is
red.

## Tactical Results

| set | own fit | mismatch | blind | own - mismatch | verdict |
|---|---:|---:|---:|---:|---|
| D2-C | +0.4531 | -0.3415 | -0.2500 | 0.7946 | REFINE |
| D2-D | +0.2009 | -0.4955 | -0.2076 | 0.6964 | REFINE |
| target, each | +1.5..+6.0 | -6.0..-1.5 | -0.5..+0.5 | >=3.0 | required |

Both blind intervals cross zero. The focused replay therefore rejects hidden
blind benefit; it does not reject match variance by pretending a small mean is
a significant tactical effect.

Structural gates are healthy:

- eight distinct modal `formation|plan|focus` policies and maximum share
  `0.125` in each set;
- all three focuses, exact reorder invariance and zero opponent-source reads;
- all six constant-quality club counterfactuals change complete policy;
- A2 and all three original no-dominance readers pass.

Profile reachability fails inside the eight-club schedules. `high_press` is
absent in both sets and `balanced` is also absent in D2-D. A read-only join over
all `378` club selections per set finds all six profiles reachable, including
`high_press` `3/4` times. The checkpoint finding is therefore a sampled-identity
coverage failure, not a dead vocabulary, and remains red exactly as frozen.

## Historical Results

D2-C fails First-Division PPG standard deviation and upset buckets `7..9`,
`10..14`, and first-versus-last. D2-D fails upset buckets `7..9` and `10..14`.
Both sides reconcile with zero selection fallback and zero unavailable selected
players.

The wider denominator exposes a specification issue without resolving it:
D2-C observes `49` first-versus-last fixtures against a frozen minimum of `50`,
while D2-D observes `59`. Five seasons were frozen before execution and are not
extended after this output. The short denominator stays a real failed reader;
it is not used to explain away the tactical effect failure, which occurs in
both sets independently.

## Attribution Boundary

The selector has a mean best-to-worst internal spread of `0.2862/0.2873` over
all club selections and produces many distinct best/worst profile pairs. Yet
its result spread is below one season point. D2 does not record the intermediate
opportunity/xG/goal stages, so it cannot say whether the first weak owner is
policy-to-execution alignment, opportunity-to-xG, xG-to-goal or goal-to-points.

Step 12D adds those observations to the same paired replay. Until it decides an
owner, no selector, match formula, result resolver, plan row, commitment
threshold or historical band may change.
