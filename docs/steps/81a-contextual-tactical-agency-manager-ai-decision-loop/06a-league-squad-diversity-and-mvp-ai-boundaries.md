# Step 06A - League Squad Diversity And MVP AI Boundaries

## Status

**Done on 2026-08-08.** Design Contract Amendment A1 authorized this step after
Checkpoint B recorded `STOP / RETHINK`. The generated population now uses one
balanced identity deck per competition, while the inspected AI boundaries
already matched the MVP and required no speculative production code. Step 07
remains closed; Step 06B now owns the longitudinal `100 x 10`, and only the
subsequent Checkpoint B2 / Step 06C can reopen Step 07.

## Product Thesis

Formation variety must be caused by the footballers each club owns, and that
variety must exist inside each competition the manager plays in. A pooled
multi-world report is insufficient if one individual league can still contain
the same squad identity repeatedly and therefore converge on one shape.

The unit of construction is the club; the league owns only distribution. With
`20` clubs and the current `8` squad identities, every identity must be assigned
to exactly `floor(20 / 8)` or `ceil(20 / 8)` clubs: two or three clubs per
identity. This creates several clubs naturally suited to each broad football
family without writing an exact formation onto any club.

For the MVP, AI complexity stays deliberately bounded:

- pre-match formation comes from the available squad's structural role fit;
  condition, form, morale, fitness and availability influence the XI and may
  later refine the own-squad policy without becoming an opponent oracle;
- the pre-match tactical prior comes from that squad and selected shape, not an
  opponent oracle;
- live decisions react to current match facts such as score, minute,
  dismissals, injuries and legal replacements;
- future opponent-aware policies must fit behind these active decision seams,
  but no unused future policy or ignored opponent input is created now.

## Code Reality Before Implementation

- `generatedSquadIdentity(seed, clubNumber)` draws independently for each club.
  It makes every identity reachable over many seeds but guarantees neither
  coverage nor balance inside one competition.
- `generateDomesticSeniorPlayers(...)` calls
  `generateFakePlayersForClubs(...)` separately per division with the same
  world seed and restarts `clubNumber` from one, so division identity sequences
  are not scoped by competition.
- `squadIdentityKeyByClubId(...)` in the tactical-agency report re-derives the
  old per-club draw and verifies it against generated positions. It must consume
  the new canonical assignment rather than become a second allocator.
- `selectCareerAiTeam(...)` already owns career formation and XI selection and
  has no opponent-read input.
- `selectAiInGameDecision(...)` already separates stopped-minute live decisions
  and applies them through the canonical validated command path. Its existing
  dismissal, trailing, lead-protection and injury branches are the active MVP
  extension seam; a generic strategy registry would duplicate it.

## Locked Implementation Decisions

### One deterministic assignment per competition

Replace the independent club draw with one canonical allocator that consumes:

- the world seed;
- a stable competition identity key;
- the competition's explicit ordered club IDs.

It builds the smallest balanced deck of the eight existing
`GENERATED_SQUAD_IDENTITY_KEYS`, shuffles it with a competition-scoped derived
RNG, and assigns it once in canonical club order. For every competition:

- if it has at least eight clubs, all eight identities appear;
- for `C` clubs and `K` identities, every identity count is exactly
  `floor(C / K)` or `ceil(C / K)`; therefore counts differ by at most one and a
  twenty-club league contains two or three clubs from every identity;
- if it has fewer than eight clubs, no identity repeats before every reachable
  distinct identity has been used;
- identical input produces an identical assignment;
- the competition key participates in the RNG derivation, so restarting club
  ordinals in another division does not silently reuse the same draw;
- an identity continues to name only the positions a club owns. It never names,
  hints at or stores a formation.

### Deterministic role depth belongs to the club

Each assigned identity supplies one complete `22`-player position chart. That
chart is the source of truth for the club's deterministic role depth: minimum
role counts are derived from its positions and asserted, never copied into a
second table that could disagree. Some identities deliberately stock holders,
some creators, some classic wide midfielders, some wing-backs and some strike
pairs; no identity is required to contain all ten primary roles.

The chart must make its intended football family naturally fieldable while
retaining department floors and one valid goalkeeper in the XI. It must not
force one exact catalog shape. Player quality, condition, availability and
suitability remain free to make the selector choose a neighbouring compatible
formation. The generator guarantees the role supply; only
`selectCareerAiTeam(...)` answers how the club lines up today.

The assignment is one derivation with one owner. Player generation and audit
joins consume it. `generatedSquadIdentity(seed, clubNumber)` and any test or
report that replays its obsolete rule are removed in the same change; no
compatibility alias survives.

### Active AI seams, not speculative abstractions

Preserve the current public decision boundaries:

1. `selectCareerAiTeam(...)` selects the formation and XI from own-squad facts.
2. `deriveShapeTacticalDistribution(...)` remains the active tactical prior
   until Step 07 gives a real per-task player executor to improve it.
3. `selectAiInGameDecision(...)` owns live reactions and returns the same
   structured reasons and validated commands already consumed by production.

Do not add an `OpponentRead` parameter that the MVP ignores. Do not add a
strategy registry, base class, alternate selector, feature flag or dormant
opponent-aware Implementation. If inspection shows the existing boundaries are
already sufficient, close this part with characterization tests and no wrapper.
Future dynamism is allowed by replacing the decision policy behind an active
entrypoint, not by preserving unused code in advance.

## Real-Data Verification Frozen Before Implementation

Step 06A proves the allocator on real generated single-league and three-division
worlds. Checkpoint L1 / Step 06B then evaluates its frozen `7 x 10` canary and
`100 x 10` main populations. Every generated domestic competition in every
world is a row; pooling cannot rescue a failed league. The checkpoint uses
exactly seven workers and records the population and actual worker count.

For each competition with at least eight clubs:

| Gate | Target |
|---|---:|
| identities observed | `8 / 8` |
| identity count for `C` clubs and `K` identities | each `floor(C/K)` or `ceil(C/K)` |
| primary roles with positive count | `10 / 10` |
| selected catalog formations | `>= 6` |
| formation choices used by at least two clubs | `>= 4` |
| top formation share | `<= 0.30` |
| distinct modal formations across identities | `>= 6` |
| catalog-reorder invariance | `1.0000` |
| mean out-of-position slots in selected XI | `0.0000` |

Additionally, each multi-competition world must contain at least two distinct
competition assignment vectors. This proves the competition scope has a real
effect; it does not require every division to have a unique vector by chance.

For a twenty-club competition the identity rule gives the requested two or
three clubs per construction exactly. The formation gates are deliberately
separate and slightly looser: `0.30` permits at most six clubs to converge when
two compatible identities happen to prefer the same catalog shape, while the
four replicated choices rule prevents a nominally diverse result made mostly
of one-off formations. These values are frozen before Step 06A changes the
population and are evaluated again out of sample.

The identity counts guarantee two or three **role constructions** of every type
in a twenty-club league. The formation gates separately verify what the AI
actually selected; identity variety is not accepted as a proxy for lineup
variety. These are population gates, not instructions to tune the selector. A
failed formation-distribution gate first reopens the depth charts or allocator.
It does not authorize a direct formation bonus, a named preferred formation,
catalog reordering, or weakening a player-fit score.

## What To Implement

1. Add the canonical competition-scoped balanced assignment beside
   `GENERATED_SQUAD_IDENTITIES`.
2. Pass the competition identity key and the single assignment into generated
   player creation; do not draw again inside the club loop.
3. Migrate the single-league and domestic-world generators to explicit stable
   scopes.
4. Migrate the tactical-agency identity join to the canonical owner and retain
   its position-by-position verification.
5. Remove the obsolete per-club draw and all tests that prove its old semantics.
6. Add real generated-world tests for every invariant above, including small
   competitions, deterministic replay and different competition scopes.
7. Characterize the active pre-match and live AI seams. Change production AI
   code only if inspection reveals duplicated ownership; do not manufacture a
   new abstraction merely to satisfy this document.
8. Register no new standalone report. Longitudinal evidence belongs to the
   locked `simulation-report` profiles owned by Step 06B; tactical ceiling
   evidence remains Step 06C's.

## What NOT To Implement

- Opponent-aware AI formation or tactic selection.
- A formation stored on a squad identity.
- New squad identities chosen after reading B2 output.
- Player-task execution from Step 07.
- New live diagnoses, match chapters, persistence or UI.
- A second simulator, report entrypoint or identity table.
- Compatibility exports for `generatedSquadIdentity(...)`.

## Expected Files

- `packages/content/src/generators/squad-identity.ts`
- `packages/content/src/generators/squad-identity.test.ts`
- `packages/content/src/generators/fake-players.ts`
- `packages/content/src/generators/fake-players.test.ts`
- `packages/content/src/generators/domestic-world.ts`
- `packages/content/src/generators/domestic-world.test.ts`
- `packages/content/src/generators/league-system.ts`
- `packages/content/src/generators/league-system.test.ts`
- `packages/content/src/index.ts`
- `apps/cli/src/commands/simulation-report/tactical-agency-world.ts`
- `apps/cli/src/commands/simulation-report/tactical-agency-world.test.ts`
- `apps/cli/src/commands/career.test.ts` and
  `apps/web/src/runtime/web-career-runtime.test.ts`. Their paired canonical
  identity hash is a continuity record of the generated world, so the balanced
  assignment moves both together or neither.
- `apps/cli/src/commands/simulate-season.test.ts`. Its formation-fit, ability
  histogram and setup-demo rows observe the generated `demo-001` club directly;
  they must be re-read for false slot/role assumptions before any record moves.
- `apps/cli/src/commands/simulation-report/career-world-facts.test.ts`. The
  pending outfield projection column samples named roles from a generated
  world; the balanced population requires a complete re-derivation of every
  band, never a one-cell patch.
- `apps/cli/src/commands/simulation-report/hard-cap-reachability-profile.test.ts`.
  The balanced deck moved one previously pinned real hit. Reachability must be
  re-established inside the already-preregistered opening corpus before the
  old seed can be removed or replaced.
- `packages/engine/src/career/progress-fixture.test.ts`. Characterization may
  prove the existing own-squad pre-match boundary; production selection is not
  edited unless code inspection first demonstrates duplicated ownership.
- `packages/engine/src/team-selection/ai-in-game-decisions.test.ts`.
  Characterization owns the already-active dismissal, injury, chase and protect
  branches; it must not create a future policy.
- `docs/PROJECT_STATUS.md`
- this step document
- `06b-checkpoint-l1-league-diversity-100x10.md`
- `README.md`

If a changed population moves a real golden or calibration record, add its file
here **before** editing it and record the causal account. Do not rerecord a red
value mechanically.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/content/src/generators/squad-identity.test.ts
pnpm exec vitest run packages/content/src/generators/fake-players.test.ts
pnpm exec vitest run packages/content/src/generators/domestic-world.test.ts
pnpm exec vitest run packages/content/src/generators/league-system.test.ts
pnpm exec vitest run packages/engine/src/team-selection/ai-in-game-decisions.test.ts
pnpm check
git diff --check
graphify update .
```

## Implementation Outcome

The independent per-club draw is gone. `assignGeneratedSquadIdentities(...)`
is the sole allocator and consumes the world seed, stable competition key and
ordered club IDs. It constructs and shuffles a balanced deck once; player
generation and the tactical-agency audit join consume that same derivation.
There is no compatibility alias and no identity stores a formation.

Real generated-world tests establish the local construction contract:

- an `18`-club competition contains all eight identities with sorted counts
  `[2, 2, 2, 2, 2, 2, 3, 3]`;
- every competition size from `1` through `32` has only floor/ceil counts, and
  sizes below eight contain no repeat;
- all three generated domestic divisions satisfy the balance independently,
  expose all ten primary roles, and at least two divisions have different
  assignment vectors;
- the position-by-position audit join agrees with each generated `22`-player
  chart, so it is not reconstructing an obsolete draw;
- duplicate club IDs and an empty competition key fail rather than falling
  back to an invented scope.

Code inspection confirmed that `selectCareerAiTeam(...)` already owns the
own-squad pre-match choice and that `selectAiInGameDecision(...)` already owns
current-state dismissal, injury, chase and protect reactions. Existing real
tests characterize those active seams. No opponent input, strategy registry,
wrapper or unused future policy was added.

The population move changed several deterministic continuity records. They
were measured before being updated:

- CLI and web still build the same canonical world; their shared hash moved
  together from `620ad19b` to `f1527230`;
- the `world-a` ability histogram moved from `121/256/19` to `119/260/17` while
  still reconciling to all `396` players;
- the Phase 80A pending outfield projection was re-derived across every band,
  not patched at the first failure. Its two associated counters moved from
  `62/383` to `60/370`; Step 14 still owns the versioned `v8` delivery;
- the same preregistered `21`-world hard-cap opening corpus retains one real
  exact hit at `phase81a-hardcap-a-world-00007`. The old `00004` pin was
  removed, no new seed was added, and reachability remains non-vacuous.

Verification completed with the focused affected suite at `5` files / `144`
tests and the repository gate at `294` files / `2233` tests, both exit `0`.
`graphify update .` and `git diff --check` also completed successfully.

## Definition Of Done

Every generated competition receives a deterministic balanced identity deck;
all consumers read the same assignment; no per-club draw or dead compatibility
path remains; identities still contain no formation; the active AI boundaries
are characterized without speculative code; all focused and repository checks
pass; and Step 06B is the only next action.
