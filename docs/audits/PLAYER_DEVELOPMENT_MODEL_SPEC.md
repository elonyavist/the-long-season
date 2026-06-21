# Player Development Model Spec

Date: 2026-06-21
Phase: `28-player-development-and-aging-v1`
Status: Implementation spec

## Goal

Define a deterministic player-development model that is credible over 6-7 seasons before writing engine code.

The model must make long careers interesting without flooding lower divisions with unrealistic stars.

## Product Rules

- The visible ability scale remains `0..20`, Football Manager style.
- Potential is an upper bound and opportunity space, not a guarantee.
- A third-division squad can have interesting young players, but most should become category players, second-division players, or first-division squad depth, not top first-division starters.
- Third-division white-fly players are allowed, but they must be rare and bounded by generation rarity budgets.
- Role coherence remains mandatory: growth should mostly improve role-relevant attributes.
- Age is derived from `GameDate` and `birthDate`; age must not be stored as mutable state.

## Broad Position Groups

The development engine should classify players from their `primaryPosition`.

| Group | Positions | Notes |
|---|---|---|
| Goalkeeper | `gk` | Later peak, slower physical decline, no outfield growth bias. |
| Defender | `defender` | Earlier physical maturity, long tactical/mental usefulness. |
| Midfielder | `midfielder` | Balanced technical/mental growth window. |
| Attacker | `attacker` | Earlier explosive growth, earlier physical decline than goalkeepers. |

## Age Bands

| Group | Prospect | Growth | Peak | Early decline | Late decline |
|---|---:|---:|---:|---:|---:|
| Goalkeeper | 16-21 | 18-27 | 28-33 | 34-36 | 37+ |
| Defender | 16-21 | 17-25 | 26-30 | 31-33 | 34+ |
| Midfielder | 16-21 | 17-26 | 27-31 | 32-34 | 35+ |
| Attacker | 16-21 | 17-25 | 26-29 | 30-32 | 33+ |

Rules:

- Under-21 players are eligible for meaningful growth if they have ability room.
- Players in the growth window can still improve, but less sharply after age 23.
- Peak-age players mostly stabilize; small growth is possible only with meaningful room to potential.
- Early decline should be mild and mainly physical.
- Late decline should become visible and can touch technical/mental attributes in small amounts.

## Development Inputs

The engine should accept explicit, language-agnostic inputs:

- `careerState`
- `seasonId`
- `worldSeed`
- player ID
- current `GameDate`
- player `birthDate`
- player `primaryPosition`
- current `abilities`
- player `potential`
- current `PlayerDynamicState`
- optional player season usage:
  - matches played;
  - starts;
  - minutes or minute proxy;
  - average form, if available later.

If usage is not available in Phase 28, the engine should use a neutral deterministic default. The model must not invent UI-only assumptions.

## Growth Drivers

Positive growth should be a function of:

- age band;
- ability room: `potential - current ability`;
- broad position group;
- ability relevance to role;
- form/morale as small modifiers;
- deterministic player realization factor;
- optional playing-time factor when available.

Recommended weights for Phase 28:

- ability room: primary driver;
- age: strong driver;
- role relevance: strong driver for target attribute selection;
- form/morale: light driver;
- playing time: neutral placeholder unless real usage is available;
- division level and club tier: do not hardcode in engine yet; they are already reflected by generated current ability and potential.

## Role-Relevant Growth

Growth should not lift all attributes equally.

Priority groups:

- Goalkeeper: reflexes, handling, rushing out, goalkeeper positioning, footwork; minor mental growth.
- Defender: tackling, positioning, anticipation, strength, heading; minor passing/leadership.
- Midfielder: passing, technique, vision, stamina, anticipation; minor tackling/composure.
- Attacker: finishing, dribbling, technique, pace, composure, heading depending on current profile.

Ordinary growth should avoid making:

- defenders into strong finishers;
- attackers into strong tacklers;
- goalkeepers into outfield players;
- outfield players into goalkeepers.

## Potential Realization

Potential realization should be deterministic but varied.

The engine should derive a stable realization factor from:

```text
deriveRng(worldSeed, "player-development", seasonId, playerId)
```

The factor should:

- help some players grow faster;
- make some prospects stall;
- make rare prodigies more likely to grow, not guaranteed to become stars;
- never exceed player `potential`;
- avoid exact hidden-potential presentation in CLI/UI.

Because engine must not import content, Phase 28 should infer realization from the shape of `potential - current ability`, age, and current ability. Content archetype names may be used only by content or presentation layers if explicitly passed in later.

## Decline Rules

Decline should be deterministic and bounded.

Outfield decline priority:

1. physical: pace, stamina, agility, strength;
2. secondary physical/duel: heading;
3. late-career technical/mental small drops only after stronger decline bands.

Goalkeeper decline priority:

1. rushing out and footwork;
2. reflexes after later age bands;
3. handling and positioning decline slowly.

Decline must not reduce abilities below plausible category usefulness too aggressively in one season. Phase 28 should use small annual deltas and let long-run reports expose tuning needs.

## Third-Division Credibility Target

Over 6-7 seasons:

- Most third-division players should become unusable for a first-division title push.
- A small number can remain useful as first-division reserves.
- A rare prodigy can become a true first-division player.
- One save may produce a memorable white-fly story; every save must not.

Implementation tests should protect:

- ordinary third-division young players do not all reach elite ability;
- rare high-potential players have better odds than ordinary prospects;
- different seeds produce different development paths;
- same seed produces exactly the same path;
- off-role attributes remain bounded during development.

## Out Of Scope For Phase 28

- Training UI.
- Staff effects.
- Facilities effects.
- Youth intake.
- Injuries and injury recovery.
- Retirement.
- Contract decisions.
- Scouting fog and visible potential ranges.
- Promotion/relegation.
- Multi-country long-run simulation.

## Mandatory Implementation Tests

Step 02 growth tests:

- ordinary youth with room grows deterministically;
- serious prospect grows more than an equivalent ordinary player in the same age band;
- rare prodigy can grow strongly but remains bounded by potential;
- senior peak player has little or no growth;
- same seed and season produce identical output.

Step 03 decline tests:

- old outfield player loses physical ability before technical ability;
- old goalkeeper uses later decline windows;
- late-career attacker declines earlier than goalkeeper;
- young player does not decline.

Step 04 variance tests:

- repeated deterministic seasons produce varied player paths;
- potential is never exceeded;
- low-potential players cannot become stars through randomness;
- long-run sample remains bounded enough for Phase 30.

Step 05 report tests:

- report is deterministic for same seed;
- report does not expose exact hidden potential;
- report includes aggregate growth, decline, stalled prospects, and selected-club examples;
- all user-facing text is localized.

