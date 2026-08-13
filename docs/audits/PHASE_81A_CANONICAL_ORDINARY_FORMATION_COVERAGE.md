# Phase 81A Canonical Ordinary Formation Coverage

## Decision

`GO`. The free AI selector now uses the domain's canonical covering predicate
for ordinary formation choice. Weak and invalid fits remain reachable only
through caller-imposed shapes or the existing emergency catalog retry.

## Change

The selector's private `isUsableSuitability(...)` accepted `weak`, contradicting
`isCoveringSuitability(...)` and its own claim that ordinary selection searches
only credible fits. The duplicate predicate is deleted. No score, formation,
player, squad identity or emergency policy changes.

The real discovered club
`phase81a-b2-downstream-replication-a-001 / club:ita-2-01` moves from one weak
slot to zero non-covering slots. The exact identity remains
`holder_heavy_low_build_up`; the correction changes the chosen credible shape,
not its footballers.

## Locked Replication Result

The unchanged Step 06C12 profile ran alone with exactly seven workers and
completed its full `64`-context replay per set:

| fact | set A | set B | gate |
|---|---:|---:|---:|
| population rows | `42/42` | `42/42` | all pass |
| best-response signatures | `6/9` | `6/9` | `>= 0.25` share |
| ubiquity multiple | `3.5119` | `3.5026` | `<= 4` |
| material cycles | `292` | `298` | `> 0` |
| conservation / mirror mismatches | `0 / 0` | `0 / 0` | zero |
| optimistic ceiling | `+0.01784` | `+0.02079` | `>= +0.045` |
| optimistic exposure | `-0.02003` | `-0.01583` | `<= -0.045` |
| blind delta | `+0.00315` | `-0.00551` | neutral |
| xG-to-result `R^2` | `0.38381` | `0.37142` | owner split at `0.5` |
| downstream owner | `result_resolution` | `result_resolution` | same twice |

Classifier reachability holds in both sets: real contexts above/below `0.5`
are `49/15` and `41/23`. Positive xG-result covariance occurs in `61/64` and
`62/64` contexts. The aggregate owner is therefore coherent and held; original
materiality remains `REFINE` as required.

The final artifact is
`simulation-out/phase81a-b2-downstream-replication.json`, SHA-256
`fb8394fa2c73e3d37f0dbda102ed05bea78c12878892a34b48ea691b813ec1f8`.
It completed in about `163.4s`, real exit `1` because materiality is still red.

## Handoff

`result_resolution` does not by itself authorize reducing football variance or
adding a tactical result bonus. Step 06C13 decomposes the same retained rows
into xG-to-goal and goal-to-win stages before changing gameplay. Upsets and rare
results are product requirements; a resolver correction must identify a real
causal distortion rather than merely make the tactical gate easier.
