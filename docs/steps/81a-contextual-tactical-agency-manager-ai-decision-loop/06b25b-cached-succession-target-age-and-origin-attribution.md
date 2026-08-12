# Step 06B25B - Cached Succession Target Age And Origin Attribution

## Status

**Done on 2026-08-12: `mixed`, led by `target_eligibility`.** The cached replay
reconciles and shows that “succession” deals overwhelmingly acquire another
veteran; the few generated prime-age acquisitions also fail downstream.

## TESI

L6.5 proves that more role-succession attempts can improve division capacity
while reducing same-club replacement. Before changing the market again, join
every fulfilled exact-role episode to the acquired player's age, origin and
same-season club facts. Do not infer “young successor” from the need label: the
current selector matches role but has no succession-specific age or incumbent-
quality preference.

## Frozen Attribution

Reuse both completed L6.5 caches and the same command/profile. No world or
season is simulated again. For each arm record:

- fulfilled succession episodes and distinct acquired players;
- acquisition age bands: under 21, 21-29, 30-32 and 33-plus;
- origin counts, with `unknown` fail-closed;
- career-generated 21-29 share;
- acquired players appearing in season-ten leader slots;
- acquired players appearing in the arm's local and division replacement
  matches;
- missing player-season, origin, episode and duplicate-ID reconciliations.

The episode season owns age: use the canonical player-season fact for the
fulfilled player and season, never current age or a birth-date reconstruction.
One player can fulfill multiple episodes only if stable episode identity proves
separate club-season-role needs; distinct-player counts remain separate.

## Preregistered Decision

- `target_eligibility` when fewer than `50%` of fulfilled acquisitions are age
  `21-29`, or fewer than `35%` are career-generated age `21-29`;
- `downstream_selection` when both shares hold but fewer than `20%` of those
  career-generated prime-age acquisitions enter a local replacement match or a
  season-ten leader slot;
- `mixed` when both transitions fail their respective floors;
- `not_reproduced` when no fulfilled succession episode exists;
- `STOP_RETHINK` on any reconciliation or unknown origin.

These are attribution splits, not historical balance targets. They authorize
one next owner only; they do not change L6.5's failed product decision.

## Expected Files

- `apps/cli/src/commands/simulation-report/succession-priority-attribution.ts`
  and test: linked-player age/origin classifier and exhaustive decision;
- `apps/cli/src/commands/simulation-report/career-sections.ts` and test: compose
  existing episode, origin, player-season and replacement facts into the cache
  replay output;
- 06B25A only for the resulting handoff; this step, phase README, status, audit
  and audit index;
- no engine, content, domain, persistence, generator, HTML or web file.

## Command

```bash
nvm use 24.16.0
pnpm cli simulation-report \
  --profile=phase81a-succession-priority-l6-5-7x10 \
  --format=json \
  --report-output=simulation-out/phase81a-succession-priority-l6-5-7x10.json
```

The command must read both arm caches. A simulated world, changed cache key or
different seed is `STOP_RETHINK`, not replacement evidence.

## Outcome

| Arm | Fulfilled | Age 21-29 | Age 33+ | Generated and 21-29 | Downstream |
|---|---:|---:|---:|---:|---:|
| legacy | `3,894` | `18.44%` | `63.33%` | `2.49%` | `0/97` |
| bounded priority | `4,040` | `16.46%` | `64.75%` | `2.10%` | `0/85` |

Origins are known for every episode and all joins reconcile. The owner is
`mixed`, but target eligibility is upstream and dominant: the market identifies
an aging role and then buys mostly opening seniors because its generic target
score has no successor-age or incumbent-quality tier. Step 06B26 may add a
soft ready-successor preference with the complete current fallback; it may not
read generational origin or exclude exceptional older players.
