# Step 06B29K - Checkpoint L6.15 Cached Leader Conversion

## Status

Done - `OWNER_IDENTIFIED: leader_quality_supply` on 2026-08-12.

## User-Facing Reason

The world already generates and fields new senior-level players, but too few of
them replace the opening population among season-ten scorers and creators. The
next correction must target the actual missing transition: reaching leader
quality, receiving material minutes, or converting both into visible output.
Changing growth, market selection or match output before separating those
owners would make the game less credible rather than more realistic.

## Frozen Population

- the unchanged current product recorded by the L6.4 `7 x 10` cache;
- exactly seven worlds, ten seasons and the three canonical divisions;
- the read-only cache identity and directory of
  `phase81a-renewal-baseline-l6-4-7x10`;
- season-ten player-season facts and their recorded generation origin only;
- `annual_academy_intake` and `annual_senior_intake` are the career-generated
  cohort, using the canonical origin helper;
- no simulation, gameplay, market, growth, aging or actor-selection change.

The cached profile still declares exactly seven workers. It performs no new
world work: the worker count is retained as population metadata and the cache
is read-only.

## Frozen Classification

For every `(world, competition)` the canonical deterministic top-ten scorer and
top-ten assist readers define twenty leader slots. Their union defines leader
players. A generated player enters the comparison cohort only when the player's
primary role occurs in at least one of those two leader lanes; goalkeeper and
other unrepresented roles are counted separately, never treated as failed
scorers or creators.

For each represented role, the leader-quality floor is the minimum current
ability among scorer or assist leaders of that role in that same world and
competition. Each generated comparison player receives exactly one terminal
stage, in this order:

1. `season_ten_leader` - the player is in either canonical top ten;
2. `below_role_leader_quality` - current ability is below the role-local floor;
3. `quality_ready_below_900_minutes` - the floor is reached but the existing
   material-season threshold is not;
4. `quality_and_minutes_ready_not_leader` - both prerequisites are reached but
   neither leaderboard contains the player.

This is deliberately not a model of how goals or assists should be allocated.
It is the smallest observable partition that can assign the next investigation
to quality, selection opportunity or downstream production.

## Frozen Decision

The report fails closed with `STOP_RETHINK` when any of these holds:

- the cache is not exactly `7 x 10` or does not contain all `21`
  world-competition season-ten groups;
- a group does not contain exactly twenty leader slots;
- an origin, player row, world seed or group cannot be reconciled;
- any of the four stages is unreachable on real cached data;
- fewer than `100` generated represented-role players enter the cohort.

Otherwise the three failure stages are divided by all non-leader cohort rows.
A stage with share `>= 0.50` records `OWNER_IDENTIFIED`; otherwise the result is
`MIXED`. The owner mapping is fixed:

- `below_role_leader_quality` -> `leader_quality_supply`;
- `quality_ready_below_900_minutes` -> `material_selection_opportunity`;
- `quality_and_minutes_ready_not_leader` -> `leader_output_conversion`.

The result authorizes only an observation or correction step for that owner.
It cannot reopen generic market targeting, global development, aging or actor
allocation by implication.

## Expected Files

- `apps/cli/src/commands/simulation-report/succession-priority-attribution.ts`
  and test;
- `apps/cli/src/commands/simulation-report/career-sections.ts`;
- `apps/cli/src/commands/simulation-report/report-registry.ts` and planner test;
- `packages/i18n/src/labels.ts`;
- this document, its generated audit, audit index, Phase README and
  `docs/PROJECT_STATUS.md`.

No engine, content, domain, persistence, web, save, HTML or gameplay file.

## Required Checks

```bash
pnpm typecheck
pnpm exec vitest run \
  apps/cli/src/commands/simulation-report/succession-priority-attribution.test.ts \
  apps/cli/src/commands/simulation-report/report-planner.test.ts \
  --maxWorkers=7
pnpm cli simulation-report \
  --profile=phase81a-leader-conversion-l6-15-cached \
  --workers=7 \
  --format=json \
  --report-output=simulation-out/phase81a-leader-conversion-l6-15-cached.json
git diff --check
```

## Outcome

The cached report exited zero, reconciled all `21` groups and `420` leader
slots, and wrote SHA-256
`25d3f7c17d50812e15e35434308bcc942bd99222e4bc85714099bdd71d778271`.
All declared stages were reachable:

- season-ten leader: `78`;
- below role-local leader quality: `1,130`;
- quality-ready below 900 minutes: `74`;
- quality and minutes ready but not leader: `261`.

The represented-role cohort is `1,543`; `1,072` other generated players are
excluded because their role never appears in either leader lane. Among the
`1,465` non-leaders, insufficient role-local quality has share `0.771331` and
is the largest stage in every world. The result identifies
`leader_quality_supply`; material selection and downstream output remain real
but secondary.

The next checkpoint must separate insufficient stored ceiling from sufficient
ceiling that was not realized. No gameplay owner opens before that split.
