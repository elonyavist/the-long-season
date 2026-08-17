# Design Contract - Player Career Trajectory And Population

## Status

Draft product contract. Numeric thresholds not explicitly locked here are
frozen in Step 00 before production changes.

The executable metric IDs, populations, formulas, non-vacuity and failure
owners are centralized in
[`IMPLEMENTATION_AND_CHECKPOINT_REGISTER.md`](IMPLEMENTATION_AND_CHECKPOINT_REGISTER.md).
Numeric values derived by the unchanged baseline are owned only by
`docs/audits/PHASE_81B_NUMERIC_REGISTER.md` after Step 00.

## Domain Vocabulary

- **Current ability**: present 25-attribute state in `Player.abilities`.
- **Latent career trajectory**: stable hidden innate prime shape and
  maturation/longevity facts. It is neither a promise nor public.
- **Reachable career path**: date-specific derivation from current state,
  latent trajectory, elapsed window, realization and permanent damage.
- **Public forecast**: observer-independent probability distribution over
  absolute role-ability bands, shared by all public consumers.
- **Realization**: training, opportunity, performance, environment, age and
  deterministic variation moving current abilities through the trajectory.
- **Career damage**: persisted non-derivable consequence such as rare permanent
  physical loss after serious injury; never folded into innate trajectory.

## Persisted Domain Shape

Conceptual target:

```ts
export type MaturationTiming = "early" | "normal" | "late";
export type LongevityProfile = "short" | "normal" | "long" | "exceptional";

export interface PlayerCareerTrajectory {
  readonly latentPrimeAbilities: PlayerAbilities;
  readonly maturationByFamily: Readonly<
    Record<PlayerAbilityFamily, MaturationTiming>
  >;
  readonly longevity: LongevityProfile;
}
```

The exact TypeScript shape is finalized in Step 01. Invariants:

- latent prime is persisted once per ability, never per family and ability;
- family timing is stored only if it cannot be derived from a smaller profile;
- peak ages/monthly multipliers are versioned content, not copied per player;
- public P50/upper/probabilities/current role score/reachable room are derived;
- serious-injury damage is separate career state;
- no `potential` compatibility alias survives.

The canonical ability families are the existing `PlayerAbilities` keys:
`technical`, `physical`, `mental`, `goalkeeping`. One domain list/mapping owns
traversal and exhaustiveness.

## Public Forecast Interface

Target semantics:

```ts
export interface PublicAbilityBandProbability {
  readonly band: "10_11" | "12_13" | "14" | "15" | "16_plus";
  readonly basisPoints: number;
}

export interface PublicPlayerAssessment {
  readonly playerId: PlayerId;
  readonly assessedOn: GameDate;
  readonly age: number;
  readonly currentAbility: number;
  readonly currentRating: PublicPlayerStarAssessment;
  readonly outcomeProbabilities: readonly PublicAbilityBandProbability[];
  readonly projectedRating: PublicPlayerStarAssessment;
  readonly optimisticRating: PublicPlayerStarAssessment;
}
```

Names may change; semantics do not:

- probabilities are integer basis points summing exactly to `10_000`;
- bands and stars are absolute/global;
- stars derive from the distribution, never hidden prime alone;
- six-star presentation remains for extraordinary forecasts;
- projected/optimistic stars are summaries of the probability vector, not
  separately calculated truth;
- AI receives exactly the public Interface used by UI/valuation;
- no latent prime/profile key is exposed.

Step 00 freezes probability-to-half-star mapping before Step 04 and proves
monotonicity/reachability on real generated players.

## Absolute Ability Bands

| Role ability | Interpretation |
|---:|---|
| `10-11` | Useful D3 player, lower-tier depth or developing reserve |
| `12-13` | D2 starter, D3 leader or credible higher-tier reserve |
| `14` | Strong D2 player or D1 rotation |
| `15` | Strong D1 starter |
| `16+` | Rare elite player |

Product interpretations overlap by role and squad. Engine stores numbers and
structured keys, not rendered prose.

## Continuous Population Interface

One content-owned `PlayerPopulationPolicy` produces non-derivable player facts.
Opening seniors, opening academies and annual intake are adapters.

Inputs:

- stable world/player keys;
- nation/division;
- club identity and requested role/position;
- age/reference date;
- readiness context (`opening_senior`, `opening_academy`, `annual_youth`,
  `annual_senior`);
- versioned population policy.

Outputs:

- current abilities;
- latent prime abilities;
- maturation/longevity profile;
- role/archetype identity;
- non-derived generation provenance needed for audit.

The Interface cannot accept desired stars or an exact ceiling tier.

### National/division supply

- Same MVP policy for every country.
- High-tail opportunity converges to `3:2:1` over D1/D2/D3.
- Deterministic multi-season allocation, not exact annual quotas.
- Equal-division clubs have equal base access; identity shapes role mix.
- D1 has higher readiness and more high-tail opportunities; D2/D3 less.
- Lower divisions retain non-zero elite latent access.
- No per-club star guarantee or top-up.

### Quantity and role health

Quantity may respond to exits, national/division headcount, structural floors
and competition role shortages. Quality sampling cannot read missing-star stock
or replacement strength. Role plans combine league health, club identity and
seeded variation, not current formation replication.

## Development Interface

The development Module derives bounded monthly movement from:

- current abilities and latent trajectory;
- date, age, role and family maturation curve;
- base training;
- opportunity/performance/environment;
- deterministic player-month variance;
- permanent career damage.

Base training is non-zero for eligible active players even with no match row.
Participation adds bounded acceleration; excessive minutes cannot create
unbounded growth. The Module never mutates latent trajectory or lowers a stored
prime toward current ability. Time reduces derived remaining realization
opportunity instead.

## Aging, Injury And Retirement

- Decline changes current abilities by family/role.
- Explosive physical abilities usually decline earlier.
- Technique/mentality can compensate partially.
- Goalkeepers and exceptional longevity can decline later.
- Rare serious injury may add permanent physical career damage.
- Ordinary injury affects availability/condition only.
- No direct goal/assist/selection penalty.
- Every player aged `37+` retires at season end.
- Before `37`, retirement can use ability, role/longevity, employability and a
  deterministic hazard.
- Age is read through `completedPlayerAge(...)` at the canonical boundary.

## AI Recruitment Interface

```ts
type AiRecruitmentIntent =
  | "immediate_upgrade"
  | "depth"
  | "succession";
```

- `immediate_upgrade`: current ability and exact role fit.
- `depth`: adequate current ability, reliability, affordability and floor use.
- `succession`: public probability of meeting future role need before expected
  incumbent decline, never latent truth.

Intent derives from squad/club context and does not bypass seller willingness,
finance, contracts or canonical commands. Selling a successor causes the next
cycle to derive the need again.

Owned-market players and free agents are candidate channels for the same need.
Free-agent status changes fee/contract/transaction mechanics, never intent or
player-quality truth. One canonical policy therefore owns both candidate
ranking and execution-time need revalidation; no broad-department free-agent
shortcut survives.

## Persistence

- Remove `Player.potential`.
- Advance career/save/SQLite versions once in Step 01.
- Delete incompatible beta saves and create fresh careers.
- Replace SQLite `current|potential` scopes with explicit final scopes.
- JSON and SQLite round-trip the same state.
- Do not store forecast or reachable path.
- Advance balance/config versions in the same reset epoch.

## No-Duplication Invariants

- One ability-family traversal.
- One population distribution owner.
- One public assessment function.
- One maturation/decline register.
- One role-quality evaluator.
- One AI need owner.
- One simulation report entrypoint.
- One beta reset.

## Determinism Invariants

- Derived seeded streams with stable keys only.
- Diagnostics consume no RNG.
- Explicit nation/division/club/player order.
- Stable final tie-breakers.
- Worker count never changes outcomes/hashes.
- CLI and web consume the same engine/public Interfaces.
