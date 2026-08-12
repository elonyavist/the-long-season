# Step 06B26 - Soft Ready-Successor Targeting

## Status

Done - measured and rejected by L6.6. No product or analysis seam remains.

## TESI

An exact-role succession need currently carries no role-quality floor and
uses the generic target score, so most fulfilled deals replace an aging player
with another 33-plus opening senior. Add one football concept: a ready successor
is age 21-29, matches the exact role and has public current ability within the
existing versioned succession tolerance of that club's current exact-role
average. A successor need not already equal the strongest aging incumbent.

Ready successors rank before generic candidates. The generic candidate list is
not filtered: if no ready successor is viable, the old deterministic score and
all older/younger exceptional candidates remain reachable.

## Contract

- derive the minimum acceptable current ability once with the role need from
  the current exact-role group and the existing tolerance; it is non-durable
  decision context and target selection never rebuilds the squad;
- evaluate only public assessment age/current ability;
- never read generational origin, hidden potential or report facts;
- preserve seller floors, willingness, affordability, talks, seasonal starts,
  transfer ordering and stable ID tie-breakers;
- use bounded within-club need order only in the candidate arm until L6.6;
- keep both legacy controls analysis-only with Phase 81A closeout removal.

## Reachability

Real generated worlds must produce all three facts: a succession need with a
ready candidate, a ready candidate selected ahead of a higher generic score,
and a succession need with no ready candidate that reaches the unchanged
fallback. A fixture may prove exact ordering but cannot be the only proof.

## Expected Files

- `packages/engine/src/career/ai-market-lifecycle.ts` and test: minimum ability,
  ready tier, full fallback and deterministic target ordering;
- engine index only if a real-data package-boundary proof needs an active export;
- `packages/engine/src/career/advance-career-month.ts` and season forwarding
  only for the analysis control;
- `apps/cli/src/commands/simulation-report/career-world-facts.ts` and
  `role-aware-market-reachability.test.ts`: candidate flag and real-world reach;
- this step, phase README and status.

No content coefficient, generator, growth, market capacity, finance, save,
lineup, HTML, web or new report entrypoint changes.

## First Attempt

The strongest-incumbent formulation was reachable in a bounded generated-world
search but changed `0/7` ten-season worlds: every projection was byte-identical
to bounded priority. L6.6 correctly returned `REFINE: target_eligibility` with
zero age/origin delta. The attempt is not product evidence. The v2 candidate
uses the exact-role average described above, a new cache identity and all
original L6.6 gates unchanged.

## Outcome

The exact-role-average v2 also changed `0/7` paired worlds. Target shares,
replacement measures and leader measures were byte-identical to the bounded
control. The candidate was therefore removed rather than retained as dormant
policy. L6.4's player trajectories identify aging, not target ordering, as the
next causal owner.
