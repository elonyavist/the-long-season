# Step 16E - U23 Development Squad x Late Lifecycle Factorial

## Status

Done - **`STOP / RETHINK`**. The fresh paired factorial was pure and
regression-free, but neither factor was material/coherent and no arm cleared
the absolute football bands. Every candidate and superseded callable profile
was removed after the verdict.

## User-Facing Reason

A promoted prospect must not stop becoming a footballer merely because he is
not yet good enough to displace a prime senior. Real clubs give that player
reserve/U23 football or a loan. Loans are not yet available in this release,
but the requirements explicitly allow low-detail youth competitions to create
canonical synthetic minutes. The game already does this for academy players;
the missing transition is the promoted under-23 senior.

This step adds football activity, not free ability. Zero activity outside the
declared low-detail competition remains zero development, and goals, assists,
selection and match output receive no age or origin rule.

## Entry Evidence

L6.35 rejected extra high-tail potential plus random aptitude: generated leader
share moved `0.2000 -> 0.1714`, while both leader-age lanes remained near 31.
Its retained current-engine facts show the real break. Across First-Division
seasons 7-10, `1,255` generated senior-player seasons retained at least `0.5`
potential room; `395` played fewer than `540` senior minutes and `130` played
zero. A real serious prospect developed `7.5518 -> 11.7942` in the academy,
then had zero senior minutes at ages 20, 21 and 22.

## Frozen Development-Squad Behaviour

- Eligibility reads only current football facts: the player is on an active
  club's ordered senior roster, is not in that club's active academy roster,
  and is age 18-22 at the exact month-end checkpoint. Origin, potential,
  leaderboard output and future state are forbidden inputs.
- Each eligible player receives at most two stable low-detail development-
  squad fixtures of 90 minutes in an active competition month.
- Real senior minutes replace whole low-detail fixtures:

```text
development-squad fixtures = max(0, 2 - floor(real senior minutes / 90))
```

- A cameo below 90 minutes does not erase a whole fixture. A player with 90
  real minutes receives one development fixture; a player with at least 180
  receives none.
- Fixture IDs derive from season, month, club and ordinal in a dedicated
  namespace. The canonical participation ledger owns idempotency, club/role
  attribution, development, role adaptation and reload safety.
- The low-detail fixtures have no result, rating, goal, assist, injury or
  condition event. They are participation facts only.
- Existing academy fixtures are unchanged. A player cannot receive both paths
  because senior and academy membership are disjoint and asserted.

Two fixtures per active month model a roughly 18-20-match reserve programme,
below the academy's three-per-month programme. It is frozen from football
structure, not selected from report output.

## Frozen L6.36 Factorial

Four fresh paired arms over the unchanged L6.35 OOS seed prefix:

1. `control`: current participation + current lifecycle;
2. `development_squad`: U23 path + current lifecycle;
3. `lifecycle`: current participation + late-physical v3;
4. `combined`: U23 path + late-physical v3.

Profile: `phase81a-u23-development-lifecycle-factorial-l6-36-7x10`.
Each arm runs seven worlds for ten seasons, exactly seven workers, with a fresh
cache suffix. Every arm records the same opening-state hash; the combined arm
must reproduce the control's opening world exactly because both rules act only
after play begins.

The development-squad factor is material only when, in both lifecycle
backgrounds:

- young-quality and successor-quality median gaps each fall by at least `0.5`;
- generated current-16 count rises by at least `50%` from a positive control;
- season-ten generated leader share rises by at least `0.15`;
- both gap direction and leader direction hold in at least `5/7` paired worlds;
- real development-squad reachability is positive, reconciliation is exact,
  and no player-month exceeds the two-fixture contract.

The lifecycle factor retains L6.35's frozen materiality: both scorer/creator
quality mean ages fall by at least `1.5`, both age-33 shares fall by at least
`0.15`, direction holds in at least `5/7` worlds in both participation
backgrounds, and an age-33+ output leader remains in at least `3/7` worlds.

Absolute product gates remain unchanged: scorer mean age `25.5..28.5`, creator
mean age `25.0..28.5`, each age-33+ share `<=0.12`, generated-leader share
`>=0.50`, age-33+ output leaders reachable in at least `3/7` worlds, zero
reconciliation/purity failure and no new integrated failure.

Adopt the smallest absolute-clearing arm whose factors are material. If no arm
clears but the U23 factor is material and coherent, `REFINE_U23`; likewise for
the lifecycle. A reversal is `STOP / RETHINK`. Thresholds do not move.

## What NOT To Implement

- no direct youth, generated-origin, age, goal, assist or selection bonus;
- no free growth without a canonical participation fixture;
- no new match simulator, reserve table or invented match output;
- no loan approximation or transfer shortcut;
- no further potential floor, prospect quota, random aptitude or generic
  growth-coefficient increase;
- no retained rejected L6.33-L6.35 branch after the L6.36 verdict.

## Expected Files

- `packages/engine/src/career/development-squad-participation.ts` and test
  **(new)**: the single owner of eligibility and stable low-detail facts;
- `packages/engine/src/career/player-development.ts`: exports the existing
  month-end age derivation rather than duplicating it;
- `packages/engine/src/career/advance-career-month.ts` and test: accrues both
  low-detail sources before the one canonical development batch and reports
  exact diagnostics;
- `packages/engine/src/career/advance-career-season.ts` and test: carries the
  analysis arm and aggregates structured development-squad evidence;
- `packages/engine/src/index.ts`: active structured exports only;
- `packages/content/src/generators/routine-youth-stationary-runway.ts`,
  `initial-youth-academies.ts`, `career-intake-players.ts`, `domestic-world.ts`
  and focused tests: remove the rejected high-tail pipeline and its seam;
- `packages/engine/src/career/player-aging-policy.ts`,
  `player-development.ts` and focused tests: retain lifecycle v3 only as the
  L6.36 arm and remove rejected random aptitude;
- `apps/cli/src/commands/simulation-report/career-world-facts.ts`,
  `career-sections.ts`, `succession-priority-attribution.ts`, registry/planner
  and focused tests: carry the two real factors, report reachability, evaluate
  L6.36 and delete superseded callable profiles;
- `packages/i18n/src/labels.ts`: replace the superseded visible profile label in
  all five languages;
- `vitest.config.ts` and
  `apps/cli/src/commands/simulation-report/career-world-facts.test.ts`: own the
  measured post-L6.36 test budget once. Report files run serially because each
  may already open the canonical bounded simulation workers; stale local
  timeouts no longer override the one repository budget;
- this document, Step 16D, phase README, audit README, status and the L6.36
  audit.

## Required Checks

Focused engine/content/report tests, typecheck, localization and diff check,
then alone:

```sh
pnpm cli simulation-report \
  --profile=phase81a-u23-development-lifecycle-factorial-l6-36-7x10 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81a-u23-development-lifecycle-factorial-l6-36-7x10.json
```

Only after the verdict: remove every rejected analysis seam, run `pnpm check`
alone, refresh Graphify, run the fresh integrated product `7 x 10`, rebuild its
HTML from canonical JSON and inspect the desktop output.

## Recorded Result

The four-arm `7 x 10` ran alone with exactly seven workers from
`2026-08-14 03:43:15` to `07:28:11` (`3 h 44 m 56 s`). It recorded zero
immediate purity failures, zero reconciliation failures and no new integrated
failure. Full evidence:
[`PHASE_81A_CHECKPOINT_L6_36_U23_DEVELOPMENT_LIFECYCLE_FACTORIAL.md`](../../audits/PHASE_81A_CHECKPOINT_L6_36_U23_DEVELOPMENT_LIFECYCLE_FACTORIAL.md).

| arm | generated leaders | scorer mean / 33+ | creator mean / 33+ |
| --- | ---: | ---: | ---: |
| control | `0.2000` | `30.9857 / 0.4571` | `30.3071 / 0.4107` |
| development squad | `0.1929` | `30.7500 / 0.4393` | `29.8500 / 0.3786` |
| lifecycle v3 | `0.2286` | `30.6857 / 0.4321` | `29.8643 / 0.3643` |
| combined | `0.1857` | `30.3143 / 0.4000` | `29.4536 / 0.2964` |

The U23 factor was unquestionably reached (about `19.5m` minutes and `216k+`
appearances per contrast, zero invalid/missing player-month), but direction held
in only `1/7` worlds and generated-leader share fell. Lifecycle direction held
in only `4/7`; its largest mean-age reduction was `0.6857` and largest 33+
reduction `0.0536`, far below `1.5` / `0.15`. Combining them does not turn two
non-material factors into an owner and remains outside every absolute band.

The product therefore keeps neither candidate. The production tree was
restored to the already adopted option-B product; U23, lifecycle v3, high-tail
supply, random aptitude, their analysis flags, profile, labels and tests are
gone. The next step must decompose the current product's quality-to-first-team
transition before proposing another correction. A fresh integrated HTML is
not authorized by this failed factorial.
