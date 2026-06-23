# Pre-UI Player Generation Sanity Review

Date: 2026-06-23
Phase: `47-pre-ui-engine-confidence-gate`
Step: `04-player-generation-sanity-review`
Status: Complete

## Purpose

Review generated player quality before the first UI starts presenting squads as
a core screen.

The review checks whether generated players are believable by division, club,
role, age, potential, and identity. It does not tune the generator.

## Commands Reviewed

```bash
PATH=/Users/elianarducci/.nvm/versions/node/v24.16.0/bin:$PATH pnpm cli simulate-season --seed=world-a --player-generation-report
PATH=/Users/elianarducci/.nvm/versions/node/v24.16.0/bin:$PATH pnpm cli simulate-season --seed=world-b --player-generation-report
PATH=/Users/elianarducci/.nvm/versions/node/v24.16.0/bin:$PATH pnpm cli simulate-season --seed=world-a --identity-review
PATH=/Users/elianarducci/.nvm/versions/node/v24.16.0/bin:$PATH pnpm cli simulate-season --seed=world-b --identity-review
```

## Player Generation Summary

| Seed | Players | Current `15+` | Serious prospects | Elite prospects | Role-coherence warnings |
|---|---:|---:|---:|---:|---|
| `world-a` | `396` | `0` | `4` | `0` | none |
| `world-b` | `396` | `0` | `4` | `0` | none |

## Current Ability

`world-a`:

- `0-8`: `82`
- `9-11`: `203`
- `12-14`: `111`
- `15+`: `0`

`world-b`:

- `0-8`: `75`
- `9-11`: `219`
- `12-14`: `102`
- `15+`: `0`

User-facing read:

This is credible for a third-division game start. The league has useful
players, but no currently elite-looking outliers in the reviewed seeds. That
matches the product intent: lower-division squads should not look like hidden
first-division teams.

Classification: positive fun signal.

## Potential And Rarity

`world-a`:

- category: `252`
- interesting: `140`
- serious: `4`
- elite: `0`
- white-fly players: `3 / 3`
- serious prospects: `4 / 4`
- rare prodigies: `0 / 0`

`world-b`:

- category: `247`
- interesting: `145`
- serious: `4`
- elite: `0`
- white-fly players: `1 / 1`
- serious prospects: `4 / 4`
- rare prodigies: `0 / 0`

User-facing read:

The reviewed worlds have plenty of interesting prospects but no elite prodigy.
That is good: the user can find useful young players without every save feeling
like it contains a guaranteed superstar. White-fly and serious prospect counts
are explicitly budgeted.

Classification: positive fun signal.

## Role Coherence

Both reviewed player-generation reports show:

- senior role-coherence warnings: `none`;
- youth role-coherence warnings: `none`.

User-facing read:

This directly addresses the earlier concern that defenders could look like
finishers, attackers could look like elite tacklers, or goalkeepers could share
too much outfield profile. The current generator is safe enough for squad UI
inspection.

Classification: positive fun signal.

## Youth Academy Baseline

Both reviewed seeds:

- youth players: `198`;
- clubs exactly at `11` youth: `18 / 18`;
- youth roster size min/max: `11 / 11`;
- youth departments: `GK=18 DEF=72 MID=72 ATT=36`;
- no `20+` youth players;
- role-coherence warnings: `none`.

Age spread:

| Seed | Age 15 | Age 16 | Age 17 | Age 18 | Age 19 |
|---|---:|---:|---:|---:|---:|
| `world-a` | `24` | `50` | `68` | `46` | `10` |
| `world-b` | `24` | `52` | `53` | `54` | `15` |

User-facing read:

The youth pipeline matches the agreed structure: always `11` youth per club,
with ages mostly `15-18`, and no over-20 players left in the academy at start.
This is safe for a dashboard count and credible enough for future youth detail
work, aside from the separate nationality presentation issue identified in
Step 03.

Classification: positive fun signal.

## Identity Review

`world-a` selected club:

- selected club: `S.S. Perugia`;
- senior nationality summary: `Italian=19`, `German=2`,
  `Argentinian=1`;
- surnames are varied enough inside the selected club.

`world-b` selected club:

- selected club: `A.C. Parma`;
- senior nationality summary: `Italian=15`, plus Turkish, Albanian, Spanish,
  Japanese, French, Colombian, Serbian players;
- names differ clearly from `world-a`.

User-facing read:

Third-division squads remain mostly domestic, which matches product direction.
`world-b` shows stronger foreign variety while staying believable. The current
identity generation is good enough for first squad/dashboard UI.

Minor note:

Some Italian first names repeat often in the selected squads. This is not a
blocker because full names and surnames remain varied, but it can be improved
later if the UI starts to feel repetitive in dense squad tables.

Classification: post-UI polish, not blocker.

## Findings

| Finding | Classification | UI Impact | Action |
|---|---|---|---|
| No reviewed senior player reaches current ability `15+`. | Positive fun signal | Third division will not look overpowered in squad UI. | Proceed. |
| Serious prospects are scarce and budgeted. | Positive fun signal | Young-player stories exist without guaranteed stars. | Proceed. |
| No senior or youth role-coherence warnings. | Positive fun signal | Role/attribute profiles are credible enough for UI. | Proceed. |
| Youth rosters are exactly `11` per club with no `20+` players. | Positive fun signal | Youth count can be safely shown in dashboard. | Proceed. |
| Mostly domestic third-division nationality mix. | Healthy realism | Matches intended lower-division identity. | Proceed. |
| Repeated Italian first names appear in selected-club samples. | Post-UI polish | Could feel repetitive in dense tables, but not wrong. | Track only if UI inspection makes it annoying. |
| Youth CLI nationality can render `unknown` from Step 03. | Post-UI improvement | Not a generation blocker, but a presentation/data-detail issue before youth UI. | Track before dedicated youth screen. |

## Step 04 Decision

Proceed to Step 05.

No pre-UI player-generation blocker was found. The generator is credible enough
for the first dashboard and squad-readiness contracts, with only non-blocking
presentation polish notes for later UI phases.
