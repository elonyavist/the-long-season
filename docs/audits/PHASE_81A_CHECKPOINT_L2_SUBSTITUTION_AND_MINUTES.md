# Phase 81A Checkpoint L2 - Substitution And Minute Truth

## Verdict

**GO (2026-08-08).** The canonical automatic match path produces accepted
substitutions for both controlled sides and truthful appearance intervals
without exceeding competition limits. Step 06B3 is open.

## Population

- profile: `phase81a-substitution-minute-l2-7x1`;
- seed prefix: `phase81a-substitution-minute-l2-v1`;
- exactly `7` deterministic worlds and `1` complete season per world;
- all three domestic competitions;
- exactly `7` workers;
- canonical JSON produced by `pnpm cli simulation-report`.

## Frozen Gates And Result

| Measurement | Result | Gate |
|---|---:|---:|
| automatic team-match observations | `12,852` | positive |
| mean substitutions per team-match | `3.766729` | `3.5..4.9` |
| median first substitution minute | `60` | `50..70` |
| observed substitution range | `0..5` | contains `<5` and `5` |
| reconciliation failures | `0` | `0` |
| invalid minute facts | `0` | `0` |
| competition-limit violations | `0` | `0` |
| missing controlled-side evidence | `0` | `0` |
| carried league-diversity decision | `GO` | `GO` |

## Refinement Record

The first run returned `REFINE`: a chained substitute and unreplaced incident
exit exposed an incorrect participation interval, while the AI averaged only
`2.800887` changes. The canonical interval owner was corrected and minute `60`
was allowed a second sequential, independently validated decision. The next run
removed reconciliation failures but averaged `3.402350`; the same sequential
opportunity at minute `70` raised the mean to `3.766729`.

That run then exposed `41` CLI-only mismatches because the diagnostic reordered
same-minute substitutions by player ID. Preserving canonical applied order
removed all mismatches without changing gameplay. Seeds, population and frozen
thresholds never moved.

## Ownership

Checkpoint L2 proves substitutions and minutes. It makes no claim about
availability, recovery, age, injury frequency or generational replacement;
those remain owned by Steps 06B3-06B8.
