# Phase 81A Amendment A7 - MVP Own-Squad Tactical Agency

## Thesis

Checkpoint C falsified the phase's historical magnitude promise, not its player
model. Real players, distinct squad identities, tactical tasks, lateral
execution, diversity, dominance and blind neutrality all work. What did not
work is the claim that an opponent-specific tactical read should move one-match
win share by `+0.045/-0.045`.

That claim is retained for a future opponent-aware product. It is not lowered,
renamed as green or fed into production as an oracle.

The active MVP asks a different question already accepted by product direction:
can a manager or AI choose a formation, XI and tactical prior that fit the
players actually available today, and can that choice help or hurt over a
season-sized schedule without making squad quality or football variance
irrelevant?

## Production Before-State

- `selectCareerAiTeam(...)` already selects a formation and XI from available
  senior/academy players, dated public assessment, fitness and recent use.
- `deriveTeamShapeAndStrength(...)` already applies the versioned fitness, form
  and morale curves when producing the exact engine capacities shown in match
  preparation.
- `TacticalConsequenceReading` already carries those engine-derived capacities;
  the UI derives at most three qualitative costs/emphases and never recomputes
  football or prints an optimal command.
- Three manager tactic profiles already exist, but their values live in the web
  adapter. Step 11 must move them to one production content owner before AI can
  consume them; keeping a second engine table is forbidden.
- `selectAiInGameDecision(...)` already handles injury, condition, performance,
  score, dismissal and legal substitutions through the canonical live command
  path. Automatic matches already invoke it for both sides. Formation changes
  are supported only when a caller supplies canonical formation options; the
  automatic runner currently supplies none.
- `lateralFocus` is a complete domain vocabulary but remains an explicit match
  option rather than a field in `TacticSetup` until Step 14's single persistence
  integration.

These facts narrow Steps 10-11. They do not authorize a parallel read model,
second match loop, duplicated tactic catalog or direct result bonus.

## Frozen Checkpoint D Contract

Two never-inspected seed sets are fixed before implementation:
`phase81a-own-squad-agency-a` and `phase81a-own-squad-agency-b`, seven worlds
each. In each world, stable ID selects one club for every observed squad
identity. Each club supplies its canonical 34-fixture league schedule.

Four arms choose from the same legal `formation|profile|lateralFocus` space:
maximum own fit, minimum own fit, canonical non-commitment and stable blind
assignment. All policy choices use own-squad facts only. Fixture, opponent,
home/away, players and match seed are paired. Eight seeds are used per fixture
arm and the run rejects any worker count except seven.

Actual points are `3/1/0`. For each club and arm, mean paired point difference
is summed over 34 fixtures into `seasonPointDelta`. The population-weighted
mean, per seed set, must satisfy:

- own fit: `[+1.5,+6.0]` against non-commitment;
- mismatch: `[-6.0,-1.5]` against non-commitment;
- blind: `[-0.5,+0.5]`, with its 95% interval crossing zero;
- correct-minus-wrong spread: at least `3.0` points.

The lower bound makes the choice perceptible over a season. The upper bound
prevents tactics from replacing squad building. These numbers were frozen
before Steps 10-11 and do not come from Checkpoint C's observed effects.

Structural gates also require all three profiles and focuses reachable, at
least four modal complete policies across all eight identities, no modal policy
above `0.50`, `100%` catalog reorder invariance, and at least `4/6` complete-
policy changes in the constant-quality role counterfactual.

Every existing Big Five upset/goal/draw/standings guardrail remains unchanged.
The final integrated `7 x 10` must additionally rerun A2 and L6.31 renewal
facts; the focused D schedule cannot certify long-run generational renewal.

## Ordered Consequence

1. Step 10 reuses and hardens the canonical manager own-squad read.
2. Step 11 gives the AI the same own-squad facts, one versioned tactic-profile
   owner, a deterministic fit evaluator and bounded formation options for the
   already-existing live policy.
3. Step 12 runs the frozen paired schedule and decides GO/REFINE/STOP.
4. Opponent reads remain deferred. If introduced later, human and AI receive
   the same durable facts and the original adversarial target is re-evaluated.
