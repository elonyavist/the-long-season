# Phase 81A Checkpoint L6.31 — Integrated Renewal Replay

## Verdict

**`GO` in-sample and out-of-sample on fresh current-engine facts.** The adopted
stationary routine-youth runway still creates materially more senior-ready
replacements and career-generated leaders after the complete Step 13 engine is
present. It changes only declared potential profiles at the immediate boundary,
introduces no new integrated failure and has zero reconciliation failure.

## Why This Replay Exists

The original L6.31 evidence was green on two disjoint paired populations, but
later tactical and matchday work changed the integrated engine. The owner made
generational renewal an explicit priority before Step 14. Step 13A therefore
advanced all four existing profiles from `facts-v2` to `facts-v3` and replayed
them from fresh facts. No gameplay rule, seed or threshold changed.

Each arm ran seven worlds for ten seasons with exactly seven workers. Controls
and candidates share seeds and differ only in whether the ordinary-youth runway
is active.

## Artifacts

| Set | Arm | Report hash | SHA-256 |
| --- | --- | --- | --- |
| in-sample | control | `8061dc232e00b498cc2c4ba5624d231e` | `b41ed815ece719df862710ba2a1e42d1f3d4103acc8383603da77d87ce6ca96b` |
| in-sample | candidate | `b4ffd4545a52e3408bfc088065513f94` | `b50124f4e39e8688ab3195d2fe3dae66792bb26336c94f04249757bcdbd44bc6` |
| out-of-sample | control | `ebda90ea1c211ba013ce0dcae4358680` | `42a12e88d432adbb10e7a37ed7e2e4940c4a4fe4827f1849b9e0a39c84d48256` |
| out-of-sample | candidate | `20c603a8e978474be105206c28bb648f` | `cfd4d8cfd74e1b8dabb91248fdecf93390ad63255c4ee391b405266a869ca44d` |

The OOS candidate rebuilt byte-identically from its canonical JSON (`cmp` exit
`0`). All four reports record `routine-youth-stationary-runway-v1` and return
process/report `PASS`.

## Results

| Measure | In control | In candidate | OOS control | OOS candidate | Frozen gate |
| --- | ---: | ---: | ---: | ---: | --- |
| generation stationary-capable | `0.3038` | `0.5365` (`6/7`) | `0.2997` | `0.5219` (`6/7`) | `>= 0.48`, `5/7` |
| season-ten stationary-ready | `0.2275` | `0.3381` | `0.2248` | `0.3306` | delta `>= +0.08`, `5/7` |
| ceiling-gap share | `0.7046` | `0.5398` | `0.7052` | `0.5345` | reduction `>= 0.08`, `5/7` |
| generated-leader share | `0.2048` | `0.2738` | `0.1881` | `0.2381` | delta `>= +0.03`, `5/7` |

In-sample deltas are ready `+0.1106`, gap reduction `0.1648` and leaders
`+0.0690`. OOS deltas are `+0.1057`, `0.1707` and `+0.0500`. Ready and gap move
in the intended direction in `7/7` worlds in both sets; leaders improve in
`6/7` in both.

## Purity And Limits

Immediate purity is exact: `144/144` changed-potential/effective-assignment
rows in-sample and `147/147` OOS, with zero other mismatch and zero structural
failure. Both candidates report no newly failing integrated gate.

This result establishes a robust improvement, not a claim that every young
player reaches senior level or that renewal needs no future observation. The
policy gives half of ordinary youth a credible stable runway; selection,
development, transfers and match minutes still decide which careers realise it.
No further generic uplift or veteran penalty is authorized by this replay.
