# Step 06B22 - Structural Player-Task Actor Allocation

## Status

Done - structural implementation, real-data reachability and full gate green.

## User-Facing Reason

The team and its formation should decide where chances come from, while the
footballers' relevant abilities decide who is most likely to perform the job.
Today the engine first collapses all roles into attacker, midfielder or
defender, then applies output-derived divisors `10` and `70`. That makes the
named scorer and creator only weakly connected to the actual role played and
leaves two calibration numbers with no football meaning.

## Entry Evidence

Checkpoint L6.2 is structurally valid and its upset lane is `GO`. It records:

- shooter / creator nomination correlations `0.0769 / 0.3253`;
- top-ten scorer / assist means `19.99 / 8.58`;
- scorer / creator ages `29.84 / 29.96`;
- age-33+ scorer / assist shares `0.23 / 0.28`.

Those values are evidence for the next checkpoint, not coefficients to invert.
The A6 amendment already names the divisors as technical debt owned here.
Hierarchy, result probability, opportunity volume, route selection, conversion
and assist credit are outside this step.

## Frozen Structural Design

One canonical draw selects each actor from one finite task budget:

```text
actor weight = assigned-role responsibility for the selected route
             x current player quality for that route's task
```

Both factors already exist on the causal match path:

1. **Role responsibility** comes from the versioned
   `tacticalShape.taskAllocationBasisPointsByRole` asset that built the team's
   shape. It is not a new actor table. The selected route chooses the task:
   central progression for a central creator, lateral progression and the
   canonical channel share for a flank creator, build-up for a direct creator,
   counter threat for a transition creator, final-third presence for ordinary
   shooters and counter threat for transition shooters.
2. **Player quality** is the existing route-specific creator or shooter task
   composite from the live `MatchPlayerIncidentProfile`. Abilities are valid on
   `1..20` for real players, so every role with positive task responsibility
   remains reachable without a clamp, floor or fallback.

The formula is dimensionless for selection: multiplying every candidate by a
common scale cannot change the weighted draw. There is therefore no response
divisor, multiplier band, exponent or post-output coefficient to tune.

The actor selector receives the selected `TacticalRoute`, never a separately
passed `ShotChanceType`; the latter is derived from the canonical route mapping.
This removes a pair of facts that could disagree. It also receives the exact
match-tactics calibration already carried by `MatchContext`, rather than
copying role responsibility into `MatchTeamContext`.

The exact shooter selection pool remains ephemeral and continues to centre the
named shooter's conversion edge. Selection still consumes exactly three actor
RNG draws in the same order. A different named player may deterministically
change the chance outcome because that player is causal; the count and identity
of opportunity decisions do not change.

## What NOT To Implement

- no age, origin, fame, leaderboard, season or division term;
- no output-derived divisor, bound, exponent or replacement-level constant;
- no second role-responsibility table and no stored derived task score;
- no new shot, goal, assist, chance or RNG draw;
- no tuning of hierarchy, upsets, formations, tactics or route frequency;
- no compatibility wrapper for the superseded actor API: this project is beta
  and the old path has no independent caller to preserve.

## Expected Files

- `packages/engine/src/match-engine/chance-actors.ts`: replace the coarse role
  tables and divisor policies with the structural route/task derivation;
- `packages/engine/src/match-engine/chance-actors.test.ts`: prove the route/task
  contract, determinism, reachability and removal of divisor-era assumptions;
- `packages/engine/src/match-engine/occasion-context.ts`: pass the canonical
  route and existing match calibration into actor selection, without storing a
  duplicate;
- `apps/cli/src/commands/simulation-report/actor-allocation-reachability.test.ts`:
  real generated-player counterfactuals must reverse creator and shooter
  advantages independently while both candidates remain reachable;
- `packages/engine/src/match-engine/step-match.test.ts`: the structural draw can
  expose a self-created goal, so the wiring test must enforce the actual
  optional-assist contract rather than require one credited team-mate per goal;
- `packages/engine/src/use-cases/simulate-season.test.ts`: re-record only the
  deterministic top-scorer identities moved by actor allocation; the table,
  fixture and opportunity sentinels remain pinned;
- `apps/cli/src/commands/simulate-season.test.ts`: stop requiring the selected
  demonstration fixture to contain a positive assist total; optional assist
  output and player-stat reconciliation remain tested independently;
- this document, the Phase 81A README and `docs/PROJECT_STATUS.md`;
- Step 06B23 only after this implementation and its local evidence are green.

If production truth requires another file, it must be added here with the
ownership reason before editing it.

## Required Verification

1. `graphify explain` and `graphify affected` before the shared edit;
2. focused engine and real-world reachability tests;
3. tests proving that central, flank, direct and transition routes read the
   declared existing tactical tasks and that left/right creators follow the
   existing channel policy;
4. same-seed determinism, exactly three actor draws, self-created and two-player
   chances reachable, and no goalkeeper in an attacking pool;
5. source absence of the superseded creator/shooter role tables, divisor
   policies and `10`/`70` response path;
6. `pnpm check` alone, `git diff --check`, then `graphify update .`.

## Exit

- **Done:** the structural rule is the only production actor-allocation path,
  all real-data branches are reachable, and the full gate is green. Open 06B23.
- **REFINE:** a declared route/task branch or eligible real player is not
  reachable, or a focused invariant fails. Reopen only this step.
- **STOP / RETHINK:** the change requires a second simulator, an output-derived
  coefficient, another role table, altered opportunity totals or altered RNG
  draw count.

## Adopted Solution

The frozen design shipped without a fallback or compatibility path. The
selector now accepts the canonical route and the match's existing tactical
calibration. Creator responsibility reads central progression, lateral
progression plus the existing channel share, build-up or counter threat;
shooter responsibility reads final-third presence or counter threat. The
existing route-specific ability composite distributes that role budget between
the named players.

The coarse creator/shooter department tables, both response policies, their
clamps and the divisors `10` / `70` were deleted. `ShotChanceType` is no longer
passed into the selector beside the route, and the unreachable dead-ball actor
branches disappeared with it. Defender selection is unchanged.

The first full gate exposed three stale assumptions rather than gameplay
regressions. One season golden moved only its three scorer rows. Two tests
incorrectly required positive assist output: a self-created goal must have no
assist, while a distinct selected creator receives exactly one assist-or-chance
credit. Those tests now assert the real optional-assist contract; the separate
reachability test still proves both assisted and self-created chances.

## Verification

- Graphify `explain` / `affected` identified the occasion builder, focused
  tests and season/report consumers before the edit;
- central, direct, transition and mirrored left/right route tests pass;
- real generated-player creator and shooter counterfactuals independently
  reverse their nomination advantage after swapping only relevant task
  abilities; both weaker players remain reachable;
- focused engine, CLI and reachability set: `6` files green;
- source search finds no creator/shooter divisor policy or superseded role
  lookup;
- `pnpm check`: exit `0`, `306` files / `2,387` tests, all typechecks, package
  boundaries and custom checks green;
- `git diff --check`: green; Graphify rebuilt after the implementation.

## Next Action

Step 06B23 runs a fresh, locked `7 x 10` L6.3 cohort. It measures the existing
minutes, age, leader concentration and actor-causality facts without changing
this formula after seeing its output.
