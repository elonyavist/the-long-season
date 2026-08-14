# Phase 81A Checkpoint L6.32 - Late-Career Performer Age Attribution

## Verdict

`SHARED_QUALITY_LIFECYCLE_OWNER`.

The accepted L6.31 product improves renewal relative to its paired control but
does not meet the absolute Big Five age contract. In First Division seasons
7-10, top-ten scorer output has mean age `30.99` and age-33-plus share `0.4571`;
creator output reads `30.31` and `0.4107`. The frozen references are mean age
`25.5..28.5` / `25.0..28.5` and age-33-plus share `<= 0.12`.

## Attribution

The defect begins at available quality, not at match selection or statistical
conversion. For both lanes, the quality top ten has mean age `30.99`, age-30-
plus share `0.7821` and age-33-plus share `0.4143`. The downstream opportunity
and output rungs preserve rather than create the old-skewed population.

The best age-22..29 alternative is a median `1.8876` role-quality points below
the incumbent top ten. The best non-opening-senior successor is `1.9321` below.
Both gaps exceed the frozen `0.50` materiality floor in every one of the seven
worlds.

At season ten, annual academy intake owns only `28/140` scorer/creator leader
slots. Of `938` active annual-intake players, only `16` reach current quality
`16.0`, `11` reach `16.5`, and `7` reach `17.0`. The opening population has
`72`, `45` and `6` respectively. Generated elite players are therefore viable
when produced; the high-quality successor tail is too sparse, while too much of
the opening population remains near-elite deep into the career.

## Decision Boundary

No direct veteran malus in goals, assists or lineup selection is authorized.
It would hide the population error after quality has already become old-skewed
and would suppress legitimate exceptional veterans.

Step 16B must run a paired factorial on the same seeds and players:

- a stationary high-quality successor tail only;
- a heterogeneous late-career lifecycle only;
- both together;
- the unchanged control.

Only the demonstrated arm or interaction may ship. Every arm must preserve
role distribution, deterministic RNG ownership, player-quality rarity, economy,
formation diversity and current tactical gates.

## Reconciliation

- source: accepted L6.31 OOS `facts-v3` cache;
- corpus: `7` worlds, `10` seasons, First Division seasons `7..10`;
- slots: `280` per rung and lane;
- replay: two independent report builds, byte-identical;
- reconciliation failures: `0`;
- report exit: `1`, correctly reflecting an owner result rather than `GO`.
