# Pre-UI Match Engine Sample Review

Date: 2026-06-23
Phase: `47-pre-ui-engine-confidence-gate`
Step: `02-match-engine-sample-review`
Status: Complete

## Purpose

Review concrete fixture explanations before exposing match outcomes in the first
UI slice.

The review judges whether results are explainable and fun from a manager's
point of view. It does not tune the match engine.

## Commands Reviewed

```bash
PATH=/Users/elianarducci/.nvm/versions/node/v24.16.0/bin:$PATH pnpm cli simulate-season --seed=world-a --fixture=fixture:000001 --fixture-explanation
PATH=/Users/elianarducci/.nvm/versions/node/v24.16.0/bin:$PATH pnpm cli simulate-season --seed=world-b --fixture=fixture:000001 --fixture-explanation
PATH=/Users/elianarducci/.nvm/versions/node/v24.16.0/bin:$PATH pnpm cli simulate-season --seed=world-a --fixture=fixture:000006 --fixture-explanation
PATH=/Users/elianarducci/.nvm/versions/node/v24.16.0/bin:$PATH pnpm cli simulate-season --seed=world-c --fixture=fixture:000001 --fixture-explanation
```

`PATH` was set explicitly because this shell exposed Node 20 by default while
the project runtime is Node `v24.16.0`.

## Sample Table

| Seed | Fixture | Result | Shape | Classification |
|---|---|---:|---|---|
| `world-a` | `fixture:000001` | Ascoli Calcio 3-0 A.S.D. Rimini | Slightly stronger home side, clinical finishing, away side wastes volume | Healthy variance |
| `world-b` | `fixture:000001` | A.S. Rimini 1-1 Carpi Calcio | Stronger home side held by keeper-heavy away chance profile | Healthy variance |
| `world-a` | `fixture:000006` | A.S.D. Trieste 2-2 U.S. Ravenna | Balanced event volume, both keepers active, credible draw | Healthy variance |
| `world-c` | `fixture:000001` | F.C. Lucca 3-3 A.C. Cagliari | Stronger away team rescues draw at 90' after weaker home side overperforms | Story-positive variance |

## Fixture Notes

### `world-a`, `fixture:000001`

Result: `Ascoli Calcio 3-0 A.S.D. Rimini`.

Strength:

- Ascoli: `OVR=9.38`
- Rimini: `OVR=9.01`

Chance summary:

- Ascoli: `5` shots, `4` on target, `3` goals.
- Rimini: `7` shots, `1` on target, `0` goals.
- Variance markers: `low event volume`, `normal conversion`.

User-facing read:

Ascoli are only slightly stronger, but the score is explainable because their
shots are much cleaner. Rimini have more attempts but almost no shot quality.
This creates a believable manager story: the losing side can complain about
territory or volume, but the winner had the better moments.

Classification: healthy variance.

### `world-b`, `fixture:000001`

Result: `A.S. Rimini 1-1 Carpi Calcio`.

Strength:

- Rimini: `OVR=9.52`
- Carpi: `OVR=8.68`

Chance summary:

- Rimini: `7` shots, `2` on target, `1` goal.
- Carpi: `6` shots, `4` on target, `1` goal.
- Rimini goalkeeper: `3` saves.
- Variance markers: `normal event volume`, `normal conversion`.

User-facing read:

The stronger side does not win, but the explanation is credible. Carpi create
fewer shots but more shots on target, forcing the Rimini keeper into three
saves. This reads like a plausible lower-division draw rather than a broken
strength model.

Classification: healthy variance.

### `world-a`, `fixture:000006`

Result: `A.S.D. Trieste 2-2 U.S. Ravenna`.

Strength:

- Trieste: `OVR=8.86`
- Ravenna: `OVR=9.31`

Chance summary:

- Trieste: `10` shots, `6` on target, `2` goals, `4` saved.
- Ravenna: `11` shots, `6` on target, `2` goals, `4` saved.
- Both goalkeepers record `4` saves.
- Variance markers: `normal event volume`, `normal conversion`.

User-facing read:

This is a useful first-UI example because the score is lively but easy to
explain. Ravenna are better on paper, but both sides produce very similar
volume and shot-on-target counts. It feels like a competitive division match
where keepers kept both teams from winning.

Classification: healthy variance.

### `world-c`, `fixture:000001`

Result: `F.C. Lucca 3-3 A.C. Cagliari`.

Strength:

- Lucca: `OVR=8.88`
- Cagliari: `OVR=10.36`

Chance summary:

- Lucca: `11` shots, `5` on target, `3` goals.
- Cagliari: `7` shots, `3` on target, `3` goals.
- Cagliari score the equalizer at `90'`.
- Variance markers: `normal event volume`, `normal conversion`.

User-facing read:

This is the most surprising sample because Cagliari are clearly stronger.
However, it is not a blocker: Lucca create enough volume to make the result
believable, and the stronger side still has a story-positive late equalizer.
For the first UI, this is useful variance rather than a logic hole.

Classification: story-positive healthy variance.

## Cross-Sample Findings

### Positive Signals

- Explanation traces give enough context to understand why a score happened.
- Team-strength differences are visible but not deterministic result locks.
- Chance summaries support manager-readable narratives: wasteful volume, keeper
  influence, clinical finishing, late comeback.
- Player attribution looks plausible enough for a first UI slice: goals,
  assists, saves, and defender blocks attach to named players.
- No reviewed fixture showed an inexplicable result where chance profile and
  team strength contradicted each other.

### Risks

| Finding | Classification | UI Impact | Action |
|---|---|---|---|
| Condition impact says `not tracked` in simulate-season fixture explanations. | Post-UI improvement | In standalone season inspection this is acceptable; career matchday commands track condition separately. | Do not block UI. Future UI should use career dashboard/career matchday data, not raw simulate-season condition text. |
| High-score samples can include high conversion on limited away shots. | Healthy variance | Creates story and late drama when explained by shot quality and event timing. | Preserve; monitor only if long-run reports show systemic over-conversion. |
| Explanation output is technical and CLI-shaped. | Post-UI improvement | UI should consume structured facts, not render this prose directly. | Phase 48 should define view contracts instead of parsing CLI output. |

## Step 02 Decision

Proceed to Step 03.

No pre-UI match-engine blocker was found in the reviewed samples. The match
engine is not mathematically perfect, but the current explanation traces create
credible football stories and enough transparency for a first UI dashboard.
