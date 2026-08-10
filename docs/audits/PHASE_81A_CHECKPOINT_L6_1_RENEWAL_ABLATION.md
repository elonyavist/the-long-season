# Phase 81A Checkpoint L6.1 - Renewal Ablation And Funnel Attribution

## Verdict

**`REFINE` on 2026-08-10. No 06B20 correction step is authorized.**

The four-arm `2 x 2` is valid and uncontaminated, but it does not identify a
single correction owner for every frozen metric. Local replacement capacity
and champion points are `not_reproduced`; division replacement capacity,
four-formation retention and career-generated leader share have a material
market/blueprint interaction. The result rules out a one-axis correction, not
the existence of the problems.

Two newly evaluated A6 player-use gates are red in every arm. They expose a
separate rotation/selection problem but were not part of the frozen factorial
owner rule, so this checkpoint records them without assigning an owner.

## Corpus And Artifacts

Each arm ran alone through `pnpm cli simulation-report`, with the same seven
world seeds, ten seasons and exactly seven workers:

- `simulation-out/phase81a-renewal-ablation-l6-1-control-7x10.json`;
- `simulation-out/phase81a-renewal-ablation-l6-1-market-7x10.json`;
- `simulation-out/phase81a-renewal-ablation-l6-1-blueprint-7x10.json`;
- `simulation-out/phase81a-renewal-ablation-l6-1-combined-7x10.json`.

All four reports have exit code `0`, seven arm rows, seven population-signature
worlds, ten signatures per world and zero reconciliation failures. The seed
prefix is `phase81a-integrated-l5-4-v1` in every arm.

## Instrument Correction Before A Valid Result

The first control execution was rejected before any factorial interpretation.
Its `distinctUsersPerClubSeason` reader pooled identical club IDs from seven
worlds and returned `161.8667`. The canonical facts were correct: the first
world contained `12,826` player-club-season rows, or roughly `21` distinct
users per club-season. The cohort reader had lost the world boundary.

The reader now derives club-season counts inside each world before pooling.
A two-world test with deliberately overlapping club IDs pins the failure, and
all four cache suffixes advanced from `facts-v1` to `facts-v2`. The valid
control reports `23.1238`. Its seven normalized projection hashes match the
rejected control `7/7`, proving the correction changed only the reader.

## Arm Values

| Metric | Control | Market | Blueprint | Combined |
| --- | ---: | ---: | ---: | ---: |
| Local replacement capacity | 0.0562 | 0.0825 | 0.0769 | 0.1011 |
| Division replacement capacity | 0.4494 | 0.4948 | 0.4725 | 0.4719 |
| Four-formation retention | 0.8714 | 0.8381 | 0.8762 | 0.8810 |
| Career-generated leader share, season 10 | 0.2690 | 0.2619 | 0.2619 | 0.2786 |
| First-Division champion points | 72.1429 | 72.6571 | 71.9000 | 72.2571 |

`evaluateRenewalAblation(...)` applied the preregistered floors and separate
`5/7` coherence rule. No post-output coefficient or threshold was introduced.

## Frozen Factorial Result

| Metric | Market contrasts | Blueprint contrasts | Interaction | Coherence M / B | Result |
| --- | ---: | ---: | ---: | ---: | --- |
| Local capacity | +0.0263 / +0.0242 | +0.0207 / +0.0186 | -0.0021 | 2,3 / 2,4 | `not_reproduced` |
| Division capacity | +0.0454 / -0.0006 | +0.0231 / -0.0229 | -0.0460 | 4,4 / 4,3 | `shared_interaction` |
| Formation retention | -0.0333 / +0.0048 | +0.0048 / +0.0429 | +0.0381 | 5,4 / 4,4 | `shared_interaction` |
| Generated leaders | -0.0071 / +0.0167 | -0.0071 / +0.0167 | +0.0238 | 2,4 / 4,3 | `shared_interaction` |
| Champion points | +0.5143 / +0.3571 | -0.2429 / -0.4000 | -0.1571 | 3,2 / 3,4 | `not_reproduced` |

For coherence, each pair is `without other axis, with other axis`. The material
floors remain `0.03`, `0.03`, `0.02`, `0.02` and `0.5` respectively.

The local-capacity contrasts all remain below `0.03`, so their positive signs
are not evidence of ownership. Champion points cross `0.5` only for market
without blueprint and fail both the conditional-contrast and coherence rules.
The other three metrics have interactions above their own floors; assigning
them to either axis alone would contradict the frozen rule.

Every market, blueprint and combined population diverges from control in season
one in all seven worlds. This proves both switches reach the real career path;
it also records the lower coupling of the blueprint axis rather than pretending
its per-world deltas are bit-coupled after intake changes generation.

## Unique-Need Funnel

The market arm records `16,089` unique role-need episodes and the combined arm
`16,280`. Both reconcile stage and terminal totals exactly.

For the combined arm:

- `4,103` episodes are fulfilled;
- `5,538` terminate at `active_talk_limit_reached`;
- `3,131` terminate at `club_cannot_recruit`;
- First and Second Division are dominated by `active_talk_limit_reached`;
- Third Division is dominated by `fulfilled`.

These are episode counts, not the former repeated monthly evaluations. They
identify a market-funnel bottleneck, but the overall factorial `REFINE` means
they do not independently authorize 06B20A.

## First A6 Player-Use Reading

| Arm | Appearance share | Distinct users per club-season |
| --- | ---: | ---: |
| Control | 0.6456 | 23.1238 |
| Market | 0.6490 | 23.0778 |
| Blueprint | 0.6496 | 23.0278 |
| Combined | 0.6492 | 23.0619 |

The frozen historical bands are `0.48..0.58` and `26..31`. Both gates fail in
all four arms and barely move when either 06B16 mechanism changes. This is
strong evidence that role-aware recruitment and role-aware intake are not the
direct repair for squad-use breadth. It is not yet a preregistered attribution
to selection, substitutions, availability or squad size.

## L5.4 Purity Replay

The combined arm is ordinary current gameplay. Its replay remains `REFINE`.
All eight visible report-world sections are byte-identical to the hardened
L5.4 replay. After removing only the three declared new observation fields -
player-use rows, need episodes and population signatures - all seven canonical
world projections are byte-identical.

The checkpoint comparison differs only where A6 intended: `appearanceShare`
and `distinctUsersPerClubSeason` change from `not_evaluated` to their measured
values and add their two failed keys. No shared gameplay fact moved.

## Handoff

06B20A, 06B20B and 06B20C remain closed. The next authorized work is a
preregistered refinement of attribution that:

1. treats the three material interactions as coupled mechanisms rather than
   forcing a market or blueprint owner;
2. decides whether the two sub-floor local-capacity responses are practically
   irrelevant or need a larger independently justified cohort;
3. gives the consistently red player-use gates their own owner experiment;
4. does not tune the active-talk cap, rotation, squad size or hierarchy before
   those owners exist.
