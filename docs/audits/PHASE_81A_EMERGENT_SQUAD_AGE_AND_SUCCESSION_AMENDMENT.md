# Phase 81A Amendment A13 - Emergent Squad Age And Succession

## Status

**Accepted on 2026-08-14. Step 16I/L6.40 is Done; Step 16J/L6.41 is proposed
for review and is not implemented.**

This amendment records the product direction agreed after Checkpoint L6.39. It
does not reinterpret that checkpoint, move any frozen Big Five target or make a
new gameplay claim.

## Thesis

The game should produce recognisably different squad histories without asking
fifteen competitions to carry fifteen age models or assigning every club a
permanent behavioural label.

One general football model should create the variation:

1. opening squads receive different age structures inside a competition;
2. players age differently according to role, ability family and their existing
   physical resilience;
3. every AI club derives its next recruitment decision from its current squad,
   public assessments, contracts and finances;
4. those different starting states and later events create different club
   histories.

The identity is therefore an outcome of the squad and its history. It is not a
stored `young_club`, `experienced_club` or `win_now` strategy.

## User-Facing Reason

A thirty-year-old leading midfielder should create a believable question for
his club. It may already own a credible replacement, buy a player who develops,
lose that player to a richer club, keep the veteran longer than planned or have
to restart the search. The game becomes more credible and more interesting
because none of those endings is guaranteed.

The same model must still allow an exceptional veteran to remain decisive. An
age is evidence about likely physical evolution, never a direct instruction to
remove a player from the lineup or his name from a goal or assist table.

## What The Current Code Actually Does

This section was verified against production before this amendment was written.

### Opening population

`selectPlayerArchetype(...)` in
`packages/content/src/generators/fake-players.ts` walks the same global
archetype weights for every club. A seeded draw creates incidental differences,
but the generator expresses no competition-level age-composition decision.

`assignGeneratedSquadIdentities(...)` separately distributes eight role/depth
charts as a deterministic balanced deck. That owner is correct and remains
orthogonal: the players a squad has may influence its formation, but its age
structure must not imply a formation.

### Aging, load and exits

`applyPlayerAgingPolicy(...)` currently gives outfield players no current-
ability decline before age 32. After that boundary, every outfield group shares
the same physical curve; only later technical/mental onset differs among the
four broad position groups. Goalkeepers have a separate later curve.

Fitness already has one versioned age-and-resilience model:
`matchFitnessCostForPlayer(...)` and `recoveryHalfLifeDays(...)`. Recovery
resilience derives from stamina, agility and strength. A future aging policy
must deepen or reuse that meaning; it must not introduce a second hidden
"longevity" field that tries to prove agreement with the first.

`applyEndOfSeasonPlayerExits(...)` applies retirement pressure from age 33 and
halves it for high-quality players. This can preserve a credible exceptional
veteran, but it can also retain an old elite stock when successor supply and
decline are weak. Retirement is not changed unless attribution isolates it.

### AI succession

`deriveAiMarketNeedsFromAssessments(...)` already creates an exact-role
`role_succession` need. It reacts when an outfielder reaches 30 or a goalkeeper
33 and no player aged 21..29 is within the configured current-quality tolerance
of the incumbent.

The market remains canonical after that need: public assessments, seller squad
floors, willingness, negotiations, finance and player decisions can all stop a
transfer. The target funnel also records whether a qualified prime-age player
existed and whether generic scoring selected him.

The lifecycle already recalculates needs from current state, so a failed or
superseded search can naturally appear again; no durable completion flag blocks
it. What is missing is anticipation. The current rule reads a fixed age and
current quality; it does not estimate the incumbent one or two seasons ahead or
distinguish a ready successor from a development successor.

## Locked Product Decisions

### One policy for every competition

- No competition-specific age tables and no hand-authored configuration for
  fifteen leagues.
- Division strength, club resources, current squad and public player quality
  provide the context. The football rules themselves are shared.
- Big Five data remains the First-Division calibration population. Lower
  divisions remain guardrails until their own real-world baselines exist.

### Opening variety without a permanent club label

- Opening generation may use a deterministic, competition-balanced set of age
  compositions so a league contains younger, balanced and more experienced
  squads.
- The composition is generation input only. It is not stored as a recruitment
  philosophy and does not constrain later transfers, academy decisions,
  lineups or formations.
- Role/depth identity and age composition remain independent dimensions. A
  youthful club is not automatically a winger club or a particular formation.
- Exact composition bands are not invented in this amendment. They must be
  frozen against real club-level evidence before implementation, not selected
  from whichever game output is easiest to pass.

### State-derived AI evolution

Every club uses the same total decision function. At a decision date it reads:

- the current exact-role incumbents and internal successors;
- dated public current, P50 and upper assessments, never stored potential;
- the canonical role-aware aging forecast when it exists;
- minutes, availability, contract horizon, squad depth and current finances;
- active talks, seller protection, willingness and affordability through the
  existing market lifecycle.

The decision may identify a ready replacement or a development candidate. It
may not guarantee that candidate growth, senior minutes, retention or eventual
leadership. A sale, failed development path, injury, contract decision or
stronger competing bid is seen when the existing lifecycle evaluates current
squad state again. The current no-flag behaviour is retained rather than
replaced by a durable "replacement complete" state that can become stale.

### Differentiated football aging

- Decline is role- and ability-family-aware, not a direct age multiplier on one
  aggregate player rating.
- Explosive physical execution may begin declining earlier for forwards,
  wingers, wing-backs and full-backs. Central defenders and goalkeepers retain
  later curves. Central roles sit between those populations.
- Technical and mental qualities can remain stable longer and partially
  compensate for physical loss. Compensation changes the player's abilities;
  it never grants goals, assists, minutes or lineup priority directly.
- Deterministic individual variation derives from existing dated player facts
  and the shared physical-resilience meaning. No new opaque trait is added only
  to manufacture exceptional veterans.
- Exceptional 33-plus players must remain reachable on real generated data.

## Explicit Non-Goals

- no direct age penalty in lineup selection, goals, assists or match results;
- no forced retirement, transfer, successor purchase or successor promotion;
- no hidden-potential read by the AI;
- no formation or tactic chosen by age composition;
- no synthetic external-player pool, loan simulation or reserve-league result;
- no permanent club age philosophy in this MVP;
- no second report command or analysis-only simulator.

## Evidence Ladder

### Step 16I / Checkpoint L6.40 - current-product attribution

Fresh `7 x 10`, current product only. Measure opening club-age dispersion,
stationary elite survival, successor flow, role/age quality paths, exceptional-
stock allocation and the existing succession need/acquisition funnel. No
gameplay changes.

L6.40 returned `OPENING_STOCK_RETENTION` and `SUCCESSOR_FLOW`. It ruled out
`SUCCESSION_TIMING`: `431/432` viable transitions already received at least one
complete season of warning. Step 16J therefore owns only a shared role-aware
aging correction. Successor flow is remeasured after that independent change
and receives no guessed fix here.

### Conditional owner steps

Later step files are deliberately not written before L6.40 names their owners.
The possible order is:

1. opening population variety, followed immediately by a fresh opening/
   one-season checkpoint;
2. role-aware ability aging, followed by a paired lifecycle checkpoint;
3. prospective exact-role succession, followed by a paired market/lifecycle
   checkpoint;
4. a fresh integrated `7 x 10` and canonical desktop HTML only after adopted
   factors have passed separately.

A checkpoint can remove an item from this list. Multiple plausible mechanisms
are never shipped together merely because the final HTML looks better.

## Existing Acceptance Contract

The frozen numeric register remains
`PHASE_81A_BIG_FIVE_STATISTICAL_BASELINE.md`:

- scorer top-ten mean age `25.5..28.5`;
- creator top-ten mean age `25.0..28.5`;
- scorer and creator age-33-plus shares each `<= 0.12`;
- generated season-ten leader share `>= 0.50`;
- pooled 33-plus starts `12..17` and minutes `1100..1500` per selected player;
- an actual 33-plus leader remains reachable;
- no direct age read assigns output.

Opening club-age diversity needs its own external, club-level denominator before
it can receive a numeric gate. A pooled mean cannot prove that individual clubs
are different.

## Clean Architecture Contract

- `simulation-report` remains the only report entrypoint.
- New observations extend canonical facts or existing attribution modules; they
  do not reconstruct seasons or create a second market evaluator.
- A temporary analysis field or switch needs an explicit removal owner. A
  rejected branch leaves no callable profile, field, fixture or label.
- Content owns opening population. Engine owns dated aging and market decisions.
  Reports observe and evaluate; they never become gameplay owners.
- Every new threshold must be demonstrated reachable on real generated data in
  the direction the rule reads.
