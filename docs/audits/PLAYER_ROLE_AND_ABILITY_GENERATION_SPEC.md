# Player Role And Ability Generation Spec

Date: 2026-06-22
Phase: `33-player-role-and-ability-generation-rework`
Step: `01-generation-audit-and-model-spec`
Status: Draft baseline for implementation

## Goal

Define the global player role, archetype, ability, potential, youth-academy, and development model before changing code.

This spec supersedes the narrower Phase 24 player-generation quality model where the two disagree. Phase 24 made lower-division generation credible enough for the early CLI loop. Phase 33 makes the model explicit enough for multi-season career play, youth academies, market value, scouting, and future UI inspection.

## Non-Negotiable Product Rules

- Generated players must be deterministic, fictional, and credible.
- Third division is roughly Italian Serie C level.
- A lower-division save may contain rare memorable exceptions, but not broadly overpowered squads.
- Current ability and potential are separate concepts.
- Potential does not mean present-day quality.
- Attributes must be role-coherent for all players, not only youth players.
- Role coherence must survive development over many seasons.
- User club youth and squad decisions must be reported, not silently automated.

## Visible Attribute Scale

The visible scale remains `1..20`.

| Range | Meaning |
|---:|---|
| `1..4` | very poor |
| `5..8` | low |
| `9..11` | acceptable |
| `12..14` | good |
| `15..16` | very good |
| `17..18` | excellent |
| `19..20` | elite |

Implementation note: current code still accepts `0` through `abilityValue`. Phase 33 does not need to migrate the value object immediately, but generation/reporting should target the `1..20` product scale and avoid meaningful generated `0` values.

## Official Role List V1

The generation model should use this role list as the football identity layer:

- `goalkeeper`
- `center_back`
- `full_back`
- `wing_back`
- `defensive_midfielder`
- `central_midfielder`
- `attacking_midfielder`
- `wide_midfielder`
- `winger`
- `striker`

The existing `PlayerPosition` list may remain as pitch-position data. The new role model is not the same thing as tactical slot position:

- position answers: where does he line up?
- role identity answers: what kind of footballer is he?
- archetype answers: what style inside that role?

## Role Identity Contract

Every generated player should have the following model, either directly on the domain entity or through a validated content-owned metadata layer until a domain migration is justified:

- `primaryRole`
- `archetype`
- `naturalRoles`
- `adaptedRoles`
- `weakRoles`
- `roleFamiliarity`

Rules:

- `primaryRole` is stable.
- `archetype` is stable for Phase 33.
- Repeated out-of-role usage may improve familiarity in a future step.
- Familiarity must not change hard caps or turn a center back into a striker.
- Formation fit should read natural/adapted/weak role information.
- Development should follow `primaryRole + archetype`, not every role the player can cover.

## Attribute Classification

Each role/archetype must classify every ability path into exactly one bucket:

- `coreForRole`: can become very high for strong players.
- `secondaryForRole`: useful but should not dominate the profile.
- `allowedButLow`: can exist but normally stays low or medium.
- `cappedOutOfRole`: has a hard cap even for top players.

The classification must be data-like, tested, and reusable by:

- senior generation;
- youth generation;
- academy refill;
- development;
- quality reports.

## Hard-Cap Principles

Hard caps are global generation/development rules, not lower-division-only fixes.

Examples:

- Center backs and full backs should not have `technical.finishing` above roughly `10..11`.
- Defensive midfielders should not become striker-level finishers.
- Strikers should not have defensive attributes above roughly `10..11`.
- Wingers may have higher finishing only through winger archetypes that explicitly allow it.
- Goalkeepers use goalkeeper attributes and should not be treated as failed outfield players.
- Non-goalkeepers should keep goalkeeper-specific abilities low.

Caps apply to both `abilities` and `potential`. Development cannot grow an ability beyond the role cap even if an old player record has a higher potential value.

## Role Group Examples

### Goalkeeper

- Core: `goalkeeping.reflexes`, `goalkeeping.handling`, `goalkeeping.goalkeeperPositioning`, `goalkeeping.rushingOut`, `goalkeeping.footwork`
- Secondary: `mental.composure`, `mental.leadership`, `technical.passing`, `technical.longPassing`
- Allowed low: `physical.strength`, `physical.agility`, `mental.anticipation`
- Capped out of role: `technical.finishing`, `technical.tackling`, `technical.dribbling`, `technical.crossing`, `physical.heading`

### Center Back

- Core: `technical.tackling`, `physical.heading`, `physical.strength`, `mental.positioning`, `mental.anticipation`
- Secondary: `technical.passing`, `technical.longPassing`, `mental.composure`, `mental.leadership`, `physical.pace`
- Allowed low: `technical.technique`, `technical.dribbling`, `technical.freeKicks`
- Capped out of role: `technical.finishing`, `technical.crossing`, goalkeeper abilities

### Full Back

- Core: `technical.tackling`, `technical.crossing`, `physical.pace`, `physical.stamina`, `mental.positioning`
- Secondary: `technical.passing`, `technical.dribbling`, `technical.technique`, `mental.anticipation`
- Allowed low: `technical.finishing`, `technical.penalties`, `technical.freeKicks`
- Capped out of role: goalkeeper abilities and striker-level finishing

### Wing Back

- Core: `technical.crossing`, `physical.pace`, `physical.stamina`, `technical.dribbling`, `technical.tackling`
- Secondary: `technical.passing`, `technical.technique`, `mental.positioning`, `mental.anticipation`
- Allowed low: `technical.finishing`, `technical.freeKicks`
- Capped out of role: goalkeeper abilities and striker-level finishing

### Defensive Midfielder

- Core: `technical.tackling`, `mental.positioning`, `mental.anticipation`, `physical.strength`, `physical.stamina`
- Secondary: `technical.passing`, `technical.longPassing`, `mental.composure`, `mental.determination`
- Allowed low: `technical.finishing`, `technical.dribbling`, `technical.freeKicks`
- Capped out of role: goalkeeper abilities and striker-level finishing

### Central Midfielder

- Core: `technical.passing`, `technical.longPassing`, `technical.technique`, `physical.stamina`, `mental.vision`, `mental.composure`
- Secondary: `technical.tackling`, `mental.positioning`, `mental.anticipation`, `mental.determination`
- Allowed low: `technical.finishing`, `technical.crossing`, `technical.dribbling`
- Capped out of role: goalkeeper abilities and specialist-striker finishing unless an archetype explicitly allows box-to-box scoring.

### Attacking Midfielder

- Core: `technical.passing`, `technical.technique`, `technical.dribbling`, `mental.vision`, `mental.composure`
- Secondary: `technical.finishing`, `technical.freeKicks`, `physical.agility`, `mental.anticipation`
- Allowed low: `technical.tackling`, `physical.strength`
- Capped out of role: goalkeeper abilities and defensive-specialist tackling

### Wide Midfielder

- Core: `technical.crossing`, `technical.passing`, `physical.stamina`, `physical.pace`, `mental.positioning`
- Secondary: `technical.dribbling`, `technical.technique`, `technical.tackling`, `mental.vision`
- Allowed low: `technical.finishing`, `physical.heading`
- Capped out of role: goalkeeper abilities and striker-level finishing

### Winger

- Core: `physical.pace`, `technical.dribbling`, `technical.crossing`, `technical.technique`, `physical.agility`
- Secondary: `technical.finishing`, `technical.passing`, `mental.vision`, `mental.composure`
- Allowed low: `technical.tackling`, `mental.positioning`
- Capped out of role: goalkeeper abilities and defensive-specialist tackling

### Striker

- Core: `technical.finishing`, `mental.composure`, `mental.anticipation`, `physical.heading`, plus either `physical.pace` or `physical.strength` by archetype
- Secondary: `technical.dribbling`, `technical.technique`, `technical.passing`, `mental.vision`
- Allowed low: `technical.tackling`, `technical.crossing`, `mental.positioning`
- Capped out of role: goalkeeper abilities and defensive-specialist tackling

## Senior Current-Ability Bands

These are target bands after role classification, not single global averages. Club tier can modify within the division, but must not bypass the division.

```text
Third division senior
  core role: 8-13 normal, 14-15 rare, 16+ exceptional
  secondary: 6-11 normal, 12-13 rare
  out-of-role: 1-8 normal, 9-11 maximum rare

Second division senior
  core role: 10-15 normal, 16 rare, 17+ exceptional
  secondary: 8-13 normal, 14 rare
  out-of-role: 1-9 normal, 10-11 maximum rare

First division senior
  core role: 12-17 normal, 18-20 top player only
  secondary: 9-15 normal, 16 rare
  out-of-role: 1-10 normal, 11 maximum rare
```

## Youth Current-Ability Bands

Youth current ability should be lower than senior current ability in the same division.

```text
Youth 15-17 in third division
  core current: 4-9 normal, 10-11 interesting, 12+ rare
  secondary current: 3-8
  out-of-role: 1-6, hard cap 8/9

Youth 18-19 in third division
  core current: 6-11 normal, 12-13 interesting, 14+ rare
  secondary current: 4-9
  out-of-role: 1-7, hard cap 9/10
```

An elite youth prospect in third division should generally have high potential and contained current ability. He may have one or two impressive role-core attributes for his age, but he should not already look like a complete first-division starter.

## Potential And Rarity

Potential bands:

- `ordinary`
- `interesting`
- `high`
- `elite`

Rarity budget per division and season:

- `ordinary`: majority of youth players.
- `interesting`: common enough to create stories.
- `high`: roughly `2..5` per division per season.
- `elite`: roughly `0..1` per division per season, often `0`.

Rarity budget is league/division-level, not per club. The game should not guarantee every club a high or elite prospect.

## Lower-Division White-Flies

White-fly players are allowed but must be budgeted:

- rare high-current veteran/specialist in a lower division;
- rare high-potential young player with contained current ability;
- rare third-division bomber who can help in second division;
- not a league-wide pattern.

## Youth Academy Refill Model

The Phase 33 target replaces the Phase 32 random annual intake shape with exact refill.

Lifecycle order:

1. Aging and development.
2. Over-19 resolution.
3. Promotions, sales, releases.
4. Academy gap calculation.
5. Refill to exactly `11`.
6. Report.

After refill, every club should have exactly:

- `1` goalkeeper
- `4` defenders
- `4` midfielders
- `2` attackers

Rules:

- Youth academy age range is `15..19`.
- From `20+`, players must leave the academy.
- Refill ages should be almost always `15..17`, rare `18`, no default `19`.
- Refill first satisfies department counts, then balances roles inside the department.
- DEF roles: `center_back`, `full_back`, `wing_back`.
- MID roles: `defensive_midfielder`, `central_midfielder`, `attacking_midfielder`, `wide_midfielder`.
- ATT roles: `striker`, `winger`.
- AI clubs may automatically promote only useful `high` or `elite` youth players.
- User club receives report/decision prompts; no hidden automatic promotion/sale/release.
- Refill must be visible at least in CLI/report outputs.

## Development Model Rule

Development must use the same role/archetype classification as generation:

- `coreForRole`: strongest growth opportunity.
- `secondaryForRole`: modest growth opportunity.
- `allowedButLow`: small growth only.
- `cappedOutOfRole`: no growth past hard cap.

Development must never convert a player identity implicitly. Future role familiarity can reduce out-of-position penalties, but it cannot rewrite a player's primary role or remove hard caps.

## Reporting Requirements

Reports should expose:

- role-coherence cap violations;
- high off-role attributes;
- current-ability distribution by role/division/age;
- potential-band distribution;
- academy refill counts by club/department/role/age;
- aged-out youth resolution;
- development cap violations;
- creator/assist concentration checks after generation changes.

Reports must not expose exact hidden potential as normal user-facing truth.

## Implementation Order

1. Add/refine role identity and familiarity contracts.
2. Add role/archetype classification and hard caps.
3. Add division/age current-ability bands.
4. Add potential rarity and white-fly budget.
5. Rework senior generator.
6. Rework youth academy refill generator.
7. Make development respect role caps.
8. Extend tests and reports.
9. Re-run long-run gates.

