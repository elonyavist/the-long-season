# Phase 81A Checkpoint L5.4 - Integrated 7 x 10

## Verdict

**REFINE (2026-08-10).** The fresh locked population completed all seven worlds,
ten seasons and three divisions at exactly seven workers. The market response
introduced by Step 06B16 is real and structurally clean, but it does not yet
produce enough prime-age replacement capacity. Carried veteran, leader,
formation-retention and First-Division hierarchy gates also remain red. The
`100 x 10` L1 run, B2 and Steps 07-16 remain closed.

This is a valid negative result, not a failed execution. Canonical JSON and its
English desktop HTML were written with decision `FAIL` / checkpoint `REFINE`.
The renderer exits `1` only after writing either artifact, as required.

## Locked Execution

- profile: `phase81a-integrated-l5-4-7x10`;
- seed prefix: `phase81a-integrated-l5-4-v1`;
- population: `7 x 10`, all three domestic divisions;
- worker count: exactly `7`;
- report contract: `simulation-report-v1`;
- report hash: `78c8b85ffe71b61295a7e5ff131eebb2`;
- JSON SHA-256: `dc885f0bc730990ff5b65fd2f1330a0423e06b93b3e6f8a04215df18c914e400`;
- HTML SHA-256: `2712969b20664c517d16e0194d4856a789de95230108415f7d819c7ea93da0e8`.

The first completed artifact exposed one instrumentation mismatch before the
decision was recorded: L5.4 correctly omitted the expensive L5.1 paired-table
oracle, while the shared player evaluator still counted its absent 70 rows as
one reconciliation failure. The lane is now an explicit total
`required | not_requested` contract. L5.1 remains fail-closed; L5.4 no longer
requires a fact it is forbidden to generate. Focused tests passed `21/21`, the
same cached world projections were re-evaluated, and final reconciliation is
zero.

## Step 06B16 Owner Response

| Measurement | Before | L5.4 | Frozen target | Result |
|---|---:|---:|---:|---|
| local one-to-one replacement capacity | 0.0641 | 0.1011 | >= 0.20 | REFINE |
| division-wide replacement capacity | 0.5256 | 0.4719 | >= 0.50 | REFINE |
| worlds meeting mature-academy parity | 7/7 | 7/7 | >= 6/7 | pass |
| senior-quality academy material-minute share | not frozen as before-state | 0.9245 | >= 0.75 | pass |
| department needs evaluated | n/a | 1,201,586 | > 0 | pass |
| role needs evaluated | n/a | 1,034,001 | > 0 | pass |
| recruitable role needs | n/a | 661,080 | > 0 | pass |
| exact-role targets found | n/a | 7,311 | > 0 | pass |
| role mismatch / missing target player | n/a | 0 / 0 | 0 / 0 | pass |

The new market understands the missing football job and reaches real exact-role
targets without forcing a transfer. The remaining owner is still renewal
supply/distribution: the career creates credible academy players, but too few
prime-age replacements are locally or divisionally available when an opening
leader needs replacing. No synthetic external pool or protected outcome is
authorized by this finding.

## Carried Player And World Findings

| First-Division measurement | L5.4 | Frozen target | Result |
|---|---:|---:|---|
| age-33+ mean starts | 22.27 | 12..17 | REFINE |
| age-33+ mean minutes | 1,829.67 | 1,100..1,500 | REFINE |
| career-generated season-ten leader share | 0.2786 | >= 0.30 | REFINE |
| opening season-ten leader share | 0.7214 | <= 0.50 | REFINE |
| top-ten scorer mean | 19.84 | 14.5..18.5 | REFINE |
| top-ten assist mean | 8.23 | 8..10.5 | pass |
| scorer mean age | 29.26 | 25.5..28.5 | REFINE |
| assist mean age | 29.86 | 25..28.5 | REFINE |
| age-33+ scorer / assist share | 0.20 / 0.20 | <= 0.12 / <= 0.12 | REFINE |
| exceptional age-33+ leader observations | 40 | > 0 | pass |

The soft-aging system remains non-mechanical: exceptional older leaders still
exist and only `2.83%` of retained age-33+ leader observations play a full
season. But older players remain selected too often and dominate leaderboards
too broadly. The result points to renewal quality/opportunity plus actor
allocation, not to a hard age ban.

Formation selection has no fallback, missing source, missing stable ID or
reconciliation failure; every role survives and maximum top-formation share is
only `0.3333`. Four-replicated-formation retention is nevertheless `0.8810`
against `0.95`, with one opening failure in world 2 / Second Division. This is
identity erosion, not a return to a universal formation.

Substitutions average `4.3727` per automatic team-match with median first change
at minute `60`; unavailable starters, invalid minutes, competition-limit and
lifecycle reconciliation failures are zero. Time-loss injuries are `22.1593`
per 1,000 player-match hours and occur in all seven worlds.

## Division Tables

| Division | Champion points | Last points | Spread | PPG sd | Goals/match | Draw share | Result |
|---|---:|---:|---:|---:|---:|---:|---|
| First | 72.2571 | 23.9143 | 48.3429 | 0.3988 | 2.8139 | 0.2709 | REFINE: champion points below 72.3842 |
| Second | 64.5143 | 27.3857 | 37.1286 | 0.2851 | 2.7019 | 0.2895 | pass |
| Third | 67.6714 | 26.0143 | 41.6571 | 0.3272 | 2.7134 | 0.2860 | pass |

The First Division misses its frozen lower bound by `0.1271` points. The other
five First-Division table quantities and all twelve Second/Third-Division
quantities pass. This remains a measured hierarchy calibration debt; its target
is not rounded or relaxed after output.

## Artifact Verification

The HTML was rebuilt twice from the canonical JSON with `--from-report`; the two
files are byte-identical. Static inspection found eight resolved navigation
anchors, eight report sections, 70 season views, 1,147 tables, no duplicate IDs
and no rendered `NaN`, `undefined` or object placeholders. It includes league
tables, player names/ages/roles/minutes/goals/assists, transfer fees in EUR,
buying and selling competitions, formations, role populations, economy,
development and the checkpoint decision.

Automated visual opening was not claimed: the Codex in-app browser rejected the
local `file://` URL under its security policy. No alternate browser or temporary
server was used to bypass that boundary. The artifact remains directly
consultable as a local desktop HTML file, and renderer structure/determinism are
covered above.

Final `pnpm check` exited `0`: `305` test files and `2,346` tests passed;
dependency cruise found no violation across `878` modules and `3,631` edges;
all typechecks and the localized-text, squad-depth, role-department and single-
report-entrypoint checks passed. Graphify was rebuilt and the affected L5.4
reader/caller graph was inspected.

## Handoff

Step 06B17 is complete with `REFINE`. A later documented correction tranche may
change only demonstrated owners: renewal supply/distribution, age-aware
selection/actor allocation, soft club-identity persistence, and the existing
First-Division hierarchy owner. It must preregister a fresh population before
gameplay changes. The `100 x 10` main cohort is not authorized by this result.
