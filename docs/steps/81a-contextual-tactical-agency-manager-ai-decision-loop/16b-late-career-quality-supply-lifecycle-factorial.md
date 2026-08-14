# Step 16B - Late-Career Quality Supply x Lifecycle Factorial

## Status

Done - `STOP / RETHINK`. All 28 fresh ten-season worlds reconciled, immediate
purity held and no arm added an integrated failure, but neither candidate was
material and no arm approached the absolute age or renewal targets. Step 16C
owns removal of both exact candidates and the next, narrower owner test.

## User-Facing Reason

After seven to ten seasons the game should show new prime-age stars, veterans
who remain exceptional for understandable reasons, and individual decline
stories. It should not preserve an opening population until almost every scorer
and creator is over thirty, and it should not repair that problem by secretly
penalising an older player's goals, assists or lineup score.

L6.32 locates the defect before those downstream systems. Young players who
reach elite quality perform correctly; too few reach it, while the existing
monthly aging model averages independent variance away and leaves too much
opening quality near its peak. This step tests both owners on the same worlds.

## Frozen Four-Arm Design

Run one locked `simulation-report` profile over the current out-of-sample seed
prefix, seven worlds, ten seasons and exactly seven simulation workers. It
executes and checkpoints four arms independently:

| Arm | Successor tail | Late-career lifecycle |
| --- | --- | --- |
| `control` | current L6.31 runway | current shipped curve |
| `supply` | high-tail candidate | current shipped curve |
| `lifecycle` | current L6.31 runway | heterogeneous candidate |
| `combined` | high-tail candidate | heterogeneous candidate |

At the opening generation boundary, generated IDs, positions, roles, ages,
current ability, contracts and every unrelated fact must be identical. Supply
may change only declared potential; lifecycle may change nothing there. The
report hashes the complete non-potential opening state and each player's
potential independently. Any other immediate difference is `STOP / RETHINK`.

The annual root is additionally proved on the same real input by a focused
generator test. Annual rows inside the ten-season arms are not required to stay
identical: once a treatment has changed quality or decline, later transfers,
vacancies and role needs are causal outcomes of that treatment. Treating those
effects as contamination would make any effective lifecycle intervention fail
its own purity gate.

The main profile is the control. The other three arms use sibling checkpoint
directories and the same ordered seeds. Four fresh current-tree arms are
required; the older L6.31 report is evidence but cannot substitute for one.

## Frozen Supply Candidate

Do not increase intake count, prospect-class frequency, current ability or the
existing `5,000` basis-point stationary-runway share. Split that same half of
ordinary youth deterministically:

- draw `0..999`: high tail, exactly `1,000` basis points of all eligible
  `normal_youth`;
- draw `1,000..4,999`: existing ordinary L6.31 target;
- draw `5,000..9,999`: unchanged policy output.

The high target is the median across seven worlds of each world's player-level
`p90` current ability among opening seniors aged 23-27, by division and role,
rounded to `0.25` and clamped to `+/-0.50` around the matching division p90.
This makes the future top decile stationary without relabelling ordinary youth
as interesting prospects or creating a quota coupled to other players.

| Division | GK | CB | FB | WB | DM | CM | AM | WM | W | ST |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| First | 15.75 | 16.50 | 16.25 | 16.00 | 16.50 | 16.50 | 16.25 | 16.00 | 16.00 | 16.25 |
| Second | 12.50 | 13.00 | 12.75 | 12.50 | 12.50 | 12.75 | 12.75 | 12.50 | 12.75 | 13.00 |
| Third | 11.00 | 11.00 | 11.00 | 10.75 | 10.75 | 11.25 | 10.75 | 11.00 | 10.75 | 11.00 |

The target is a minimum role-potential runway, not current ability and not a
guaranteed outcome. Development, hard caps, opportunity, transfers and injury
still decide whether the player reaches it.

## Frozen Lifecycle Candidate

Keep the current physical floor (`7`), maximum monthly decline (`0.045`),
technical/mental start ages, potential compression and goalkeeper curve. For
outfield physical attributes only, use the previously measured soft curve:

- under 30: `0`;
- age 30-31: `0.35`;
- age 32-33: `0.65`;
- age 34-35: `1.00`;
- age 36+: `1.40`.

Unlike the rejected L6.7 curve, do not average all players toward the same
career. Multiply decline by one stable, explainable resilience:

- immutable derived player factor `0.70..1.30` from world seed and player ID;
- determination factor `1.15..0.85` from ability `1..20`;
- for physical decline only, stamina factor `1.10..0.90` from ability `1..20`.

The three factors multiply. A determined, durable player with a favourable
stable factor can age at roughly half the average rate; a fragile player can
decline materially faster. This preserves rare veteran excellence without an
age exemption and creates distinct career stories. The derived stream consumes
no shared RNG. The control path must remain bit-identical.

Retirement, injuries, recovery, match selection, scorer/creator allocation and
output conversion do not change in this factorial.

## Frozen Measures And Decision

Read First Division seasons 7-10 exactly as L6.32: top ten per season and world,
outfield only, stable player-ID tie-breaker. Each arm reports quality,
opportunity-rate, raw-opportunity and actual-output age ladders; successor gaps;
season-ten origins and thresholds; integrated register and tactical guardrails.

Absolute `GO` requires in the `combined` arm:

- scorer actual-output mean age `25.5..28.5`;
- creator actual-output mean age `25.0..28.5`;
- scorer and creator actual-output age-33-plus share each `<= 0.12`;
- both quality mean ages no higher than their matching output upper bound and
  both quality age-33-plus shares `<= 0.12`;
- season-ten career-generated scorer/creator leader share `>= 0.50`;
- at least one age-33-plus actual-output leader in `>=3/7` worlds, proving
  exceptional veterans remain reachable;
- no new integrated, tactical, role, formation, economy, ability-range,
  current-above-potential, cache or reconciliation failure versus control.

Owner effects are evaluated even if absolute `GO` misses:

- supply is material when both successor median gaps fall by at least `0.50`,
  season-ten generated current-quality counts at `16.0` rise by at least `50%`,
  and generated leader share rises by at least `0.10`. A world is coherent only
  when its mean across the four young/successor gaps strictly falls, its
  generated-current count at `16.0` does not fall and its generated-leader
  share does not fall; at least `5/7` worlds must be coherent;
- lifecycle is material when both quality mean ages fall by at least `1.0` and
  both quality age-33-plus shares fall by at least `0.10`. A world is coherent
  only when its mean quality age and mean quality age-33-plus share both
  strictly fall; at least `5/7` worlds must be coherent, while exceptional
  veteran reachability holds;
- conditional contrasts are computed in both backgrounds. Same-direction
  material effects in both backgrounds identify independent owners;
  materiality only in the combined arm identifies interaction.

Decision:

- `GO_COMBINED`, `GO_SUPPLY` or `GO_LIFECYCLE`: that exact arm alone clears all
  absolute and guardrail gates; Step 16C adopts the smallest clearing arm;
- `REFINE_SHARED`: both owners are material/coherent but no arm clears every
  absolute gate; Step 16C may adjust only the demonstrated owner magnitudes;
- `REFINE_SUPPLY` or `REFINE_LIFECYCLE`: only that owner is material;
- `STOP_RETHINK`: purity/reconciliation fails, neither owner is material, the
  signs reverse across backgrounds, or exceptional veterans disappear.

No threshold moves after any arm is read.

## Outcome

| Measure | Control | Supply | Lifecycle | Combined | Frozen target |
| --- | ---: | ---: | ---: | ---: | ---: |
| generated leader share | 0.2000 | 0.2571 | 0.1857 | 0.1786 | >= 0.50 |
| scorer output mean age | 30.986 | 31.289 | 30.925 | 30.907 | 25.5..28.5 |
| creator output mean age | 30.307 | 29.814 | 30.261 | 30.129 | 25.0..28.5 |
| scorer age-33-plus share | 0.457 | 0.482 | 0.457 | 0.443 | <= 0.12 |
| creator age-33-plus share | 0.411 | 0.354 | 0.418 | 0.361 | <= 0.12 |

Supply reduced each successor gap by only `0.05..0.12`, produced a
`0.80..0.81` rather than `>=1.50` generated-current-16 ratio, and was coherent
in only `2..3/7` worlds. Lifecycle reduced quality age by `0.32` years without
the supply arm and effectively zero with it; age-33-plus quality share fell by
`0.061` and `0.000`, coherent in `4/7` and `2/7`. Exceptional veterans remained
reachable in all seven worlds, so the failure is not caused by that guardrail.

The post-result cache reading does not authorize a coefficient change. It
localizes the failed candidates: the high tail raised the ceiling of matched
First-Division season-1..3 prospects from `13.76` to `16.18`, but their
season-ten current quality moved only `12.35 -> 12.45`, with zero reaching
`16`. The lifecycle candidate changed `3,085` paired opening seniors but moved
age-34-plus current quality by only `-0.065` on average because its base curve
was nearly identical to current after age 34. Step 16C therefore tests stable
development aptitude and a materially different late physical curve; it does
not widen either failed L6.33 candidate after seeing output.

## Expected Files

- `packages/content/src/generators/routine-youth-stationary-runway.ts` and test:
  versioned high-tail target and stable lane decision.
- `packages/content/src/generators/initial-youth-academies.ts`,
  `career-intake-players.ts`, `domestic-world.ts` and their focused tests:
  analysis arm reaches both opening and annual roots without a second builder.
- `packages/content/src/generators/initial-youth-academies.test.ts` and
  `career-intake-players.test.ts`: real generated-root purity and reachability
  for opening and annual players.
- `packages/engine/src/career/player-aging-policy.ts` and test: heterogeneous
  candidate; current control remains bit-identical.
- `packages/engine/src/index.ts`: exports the analysis-mode type through the
  existing public boundary; the CLI may not deep-import engine files.
- `packages/engine/src/career/player-development.ts`, `advance-career-month.ts`,
  `advance-career-season.ts` and focused tests: explicit analysis mode reaches
  the existing aging owner, never persisted.
- `packages/engine/src/career/player-development.test.ts`: proves the selected
  lifecycle reaches canonical monthly participation processing and replays.
- `apps/cli/src/commands/simulation-report/career-world-facts.ts`,
  `career-sections.ts`, `report-registry.ts` and tests: one locked four-arm
  profile, sibling resumable caches, exact seven-worker execution.
- `apps/cli/src/commands/simulation-report/succession-priority-attribution.ts`
  and test: compose L6.32 facts into paired conditional contrasts; no duplicate
  age reader.
- `packages/i18n/src/labels.ts`; this document, phase README, status, audit and
  audit index.

Every analysis switch has Step 16C as removal owner. If no arm is adopted, all
candidate code is removed there. If one is adopted, it becomes the single
default policy and all control/sibling orchestration is removed. Nothing may
survive merely to make this historical factorial rerunnable.

## Required Checks

Focused reachability and control-equivalence tests, typecheck, `git diff
--check`, then the locked factorial alone:

```sh
pnpm cli simulation-report \
  --profile=phase81a-late-career-factorial-l6-33-7x10 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81a-late-career-factorial-l6-33-7x10.json
```

Resume, rebuild and decision must be byte-identical. Update Graphify after the
tree is final. `pnpm check` runs alone before this step closes.
