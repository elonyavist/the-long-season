# Phase 81A - Checkpoint L6.17 Academy Ceiling Candidate

## Verdict

`REFINE` - candidate rejected and removed.

## Population

- same seven `phase81a-renewal-baseline-l6-4-v1` world seeds;
- ten seasons per world;
- exactly seven workers, with the two arms executed serially;
- fresh current and candidate worlds under the same code revision;
- candidate only: double the existing serious-prospect probability by moving
  probability from good prospects, with total prospect volume conserved.

The first candidate run completed but emitted no metric because the intended
L6.4 current cache lacked a newer canonical market diagnostic. Before any
candidate result was readable, the current arm was changed to a fresh run. No
field was reconstructed or defaulted.

## Result

| Metric | Current | Candidate | Delta | Frozen direction |
|---|---:|---:|---:|---:|
| mature below-role-leader-quality share | 0.772318 | 0.799197 | +0.026878 | <= -0.05 |
| stored-ceiling-below-leader share | 0.922939 | 0.917085 | -0.005854 | <= -0.08 |
| career-generated leader share, season 10 | 0.259524 | 0.254762 | -0.004762 | >= +0.03 and >= 0.28 |
| division replacement capacity | 0.516484 | 0.515789 | -0.000694 | >= 0.50, delta >= -0.02 |
| four-formation retention | 0.814286 | 0.857143 | +0.042857 | delta >= -0.02 |
| First-Division champion points | 73.6857 | 74.2429 | +0.5572 | 72..88 |
| transfer acquisitions | 5,198 | 5,283 | ratio 1.01635 | 0.90..1.10 |

Coherence was `1/7` for reduced below-leader-quality share, `3/7` for reduced
ceiling insufficiency and `4/7` for increased generated leader share. No new
integrated failed gate appeared. Both conversion stages and both feasibility
stages remained reachable, generated counts reconciled, academy role coverage
held and annual-senior role coverage was unchanged.

The first complete reader called both arms structurally invalid because both
carried the same `56` incomplete annual-senior role rows. That was a reader
scope error: the candidate changes only academy generation. A verdict-neutral
correction required complete academy coverage and no worsening of the carried
senior count. The candidate remained `REFINE` on all six movement gates.

## Product Meaning

Frequency is not the missing owner. Doubling serious prospects inside the same
authored ceiling bands barely changes stored-ceiling feasibility and does not
produce more leaders. It slightly worsens the broader quality funnel. The
candidate is therefore removed completely; no analysis switch remains in
product code.

The next step must measure the missing ceiling distance by division and role
from the completed current cache before proposing a stronger band. It may not
open extra academy volume, annual senior generation, global development,
minutes or market expansion.

## Reproduction

The rejected profile is intentionally removed after this audit. The historical
artifact remains at
`simulation-out/phase81a-academy-ceiling-candidate-l6-17-7x10.json` with
SHA-256 `5caab76ccd595b6dab5a2bb693ada6edbf447fb48b32b6fe5e1fa9e579d90586`.
