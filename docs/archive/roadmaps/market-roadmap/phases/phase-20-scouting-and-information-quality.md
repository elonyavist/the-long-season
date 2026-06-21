# Candidate Market Phase — Scouting And Information Quality

## Goal

Make market information imperfect without hiding the entire game behind tedious scouting.

## Why this phase exists

The current simulation exposes exact data. A long-term manager game needs uncertainty: unknown players should have ranges and confidence levels, while known squad players remain clear enough to manage.

## Possible Scope

- `ScoutingKnowledge` for player information quality.
- Visible ability/potential ranges.
- Scouting confidence level.
- Observe-player action.
- Market list that can show unknown, partially known, and known players.
- Deterministic scouting improvement over time.

## What NOT to include

- Full staff network.
- Geographic scout assignments.
- Opponent scouting reports.
- Deep fog UI.
- Hidden randomness not derived from seed.

## Extension Points

- Knowledge should be per club or per manager save, not global truth.
- True player data remains in domain/content; presentation receives visible ranges.
- Future staff/scouting systems can improve knowledge through the same contract.

## Phase Gate Question

Can the manager make recruitment decisions with partial information while tests can still verify deterministic true values?

## Manual Inspection Target

The user should be able to inspect:

- exact known players;
- partially known market players;
- an observe action that narrows a range deterministically.
