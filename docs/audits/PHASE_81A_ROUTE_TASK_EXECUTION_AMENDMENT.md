# Phase 81A - Amendment A10: Route/Task Plan Execution

## Decision

Retain product option B and its frozen meaningful season-point bands. Replace
the rejected generic-volume candidate with one route-specific execution model:
the plan changes only the quality of the route actually played, according to
whether the selected eleven can execute the tasks that route and plan demand.

This amendment is frozen before any G/H match output. It does not reopen the
opponent-aware AI, alter result variance, lower the point target or authorize a
coefficient sweep.

## Player-Facing Thesis

A wide plan should work when the team can progress and finish through the flank
it uses. A compact counter should protect the box and counter with players who
can perform those jobs. Choosing the wrong plan should not make every footballer
generically weaker; it should make the demanded passages of play less clean.

## Canonical Derivation

For one shape capacity `c`, standardize the current eleven against the same
versioned own-squad reference and scale already used by selection:

`z(c) = clamp((capacity(c) - reference(c)) / scale(c), -1, 1)`.

For profile `p`, route `r` and phase `a`, derive a demand-weighted mean:

`fit(p,r,a) = sum(z(c) * demand(p,c)) / sum(demand(p,c))`.

The relevant capacities are derived, never copied:

- attack reads `TACTICAL_ROUTE_DEFINITION[r].ownChain`;
- defence reads `opponentResistance` and also `pressing_cohesion` when the
  opposing route contains `build_up`.

Every profile must have positive demand in every derived attack and defence set;
validation fails rather than inventing a default.

The plan edge is relative to the balanced profile on the same shape and route:

`edge(p,r,a) = clamp(fit(p,r,a) - fit(balanced,r,a), -1, 1)`.

The selected chance receives:

`quality delta = (own attack edge - opponent defence edge) * 300 / 10000`.

The `300` basis-point influence is frozen now. One plan may move a selected
route by at most `0.03`; the two sides together may move it by at most `0.06`.
That remains below the existing per-shot random texture range of `+-0.15` and
the existing route-quality theoretical range of `+-0.125`, while repeated
correct decisions can remain visible over a 34-match season.

## Ownership And Neutrality

- A named candidate carries only its stable `profileKey` into match tactics.
  It never carries selector scores, standardized capacities or a precomputed
  execution edge.
- The selector and match share the capacity standardization primitive.
- Manual/free-form tactics have no profile key and produce exact zero execution
  edge. `balanced` is also exact zero because it is its own reference.
- Opportunity volume, route allocation, control, exposure, team strength, actor
  selection, RNG consumption and result resolution remain unchanged.
- Selection remains opponent-free. The match naturally combines two plans only
  after both teams independently chose from their own squads.

## Fresh Decision Population

- development: `phase81a-route-task-execution-g`, seven worlds;
- untouched validation: `phase81a-route-task-execution-h`, seven worlds;
- the D2 focused paired 34-fixture schedule and eight match seeds per arm;
- exactly seven workers and sets decided independently;
- all-six-profile reachability is read over all canonical club selections in
  each set; it is not incorrectly demanded from only eight focal clubs.

Both sets must retain the original own-fit `+1.5..+6.0`, mismatch
`-6.0..-1.5`, blind `-0.5..+0.5` and own-minus-mismatch `>= 3.0` point
bands. Own-fit and mismatch xG intervals must exclude zero in opposite
directions. Structural, no-dominance, opponent-blind and non-commit replay gates
remain unchanged.

## Rejection Rule

- **GO:** both fresh sets pass every product, direction, structural and replay
  gate; Step 13 opens.
- **REFINE:** only an attributable instrumentation or declared-population
  coverage defect may reopen this step.
- **STOP / RETHINK:** either set misses the frozen point magnitude, the effect
  becomes universal, or neutrality/determinism breaks.

A red result cannot increase `300`, change conversion bands, reduce match
variance, restore the rejected volume multiplier or create a third candidate.
