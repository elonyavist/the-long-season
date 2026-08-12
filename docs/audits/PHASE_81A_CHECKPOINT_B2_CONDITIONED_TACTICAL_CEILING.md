# Phase 81A Checkpoint B2 - Conditioned Tactical Ceiling

## Verdict

`REFINE`. The production squad selector now supplies varied real formations,
and the conditioned tactical graph is non-transitive, conservative and exactly
mirrorable. It is not yet a healthy decision space: `high_pressing|balanced`
wins roughly two thirds of all declared contexts and lateral focus is almost
never the best response. Phase 2 was therefore not run.

This is not a return to the old formation monoculture. Forty of the forty-two
per-competition population rows pass the frozen Step 06A gate. The two local
failures are both out-of-sample `4-4-2` concentrations of `6 / 18`, above the
frozen `0.30` maximum by one club.

## Locked Run

- command: `pnpm cli simulation-report --profile=phase81a-b2 --workers=7
  --format=json
  --report-output=simulation-out/phase81a-checkpoint-b2-conditioned-phase1.json`
- canonical artifact:
  `simulation-out/phase81a-checkpoint-b2-conditioned-phase1.json`
- artifact SHA-256:
  `f0c57cc3f82cea3cfddf63b0b66a73c2f88ab185752a4f3a50df4d4dd91d2d75`
- report hash: `a842abcfe2ed81e64bf70298015828b1`
- real process exit: `1`, because the report decision is `FAIL / REFINE`
- workers: exactly `7`
- populations: the seven Checkpoint A seeds and the seven frozen out-of-sample
  seeds, decided separately
- formation source: one canonical `selectCareerAiTeam(...)` selection per club
  from the first scheduled fixture in every domestic competition
- conditioned response space: `3` tactic profiles by `3` lateral focuses

## Phase 1 Results

| Measure | In-sample | Out-of-sample | Gate |
| --- | ---: | ---: | ---: |
| Real directed matchups | 378 | 378 | declared population |
| Analytic contexts | 3,402 | 3,402 | complete `378 x 9` |
| Raw/effective responses | 9 / 9 | 9 / 9 | outcome-blind signature |
| Distinct best responses | 3 | 3 | `R / N_eff >= 0.25` |
| Response diversity | 0.3333 | 0.3333 | pass |
| Largest best-response coverage | 2,269 | 2,385 | diagnostic |
| Ubiquity multiple | 6.0026 | 6.3095 | **fail: `<= 4`** |
| Material local cycles | 134 | 133 | pass: at least one |
| Universal responses | 0 | 0 | pass |
| Conservation mismatches | 0 | 0 | pass |
| Horizontal-mirror mismatches | 0 | 0 | pass |

Best-response coverage is concentrated in the same way on both populations:

- in-sample: `high_pressing|balanced = 2,269`,
  `direct_play|balanced = 1,132`, `high_pressing|right = 1`;
- out-of-sample: `high_pressing|balanced = 2,385`,
  `direct_play|balanced = 1,014`, `high_pressing|right = 3`.

`direct_play|balanced` has the strongest complete-field standing in both sets
(`5,294` mean; minimum `4,257` and `4,305`), but it is not universally
dominant. The local cycles prove that matchup-specific reversals exist. The
failed ubiquity gate proves they do not yet produce enough usable choices.

## Population Result

The in-sample population passes `21 / 21` competition rows. The out-of-sample
population passes `19 / 21`. Both failures are only `top_formation_share`:

- `phase81a-agency-a2-out-of-sample-002`, Third Division: `4-4-2 = 6 / 18`;
- `phase81a-agency-a2-out-of-sample-006`, Second Division: `4-4-2 = 6 / 18`.

Those rows still have eight or nine distinct formations, at least five
replicated formations, all ten primary roles, seven distinct identity-modal
shapes, no catalog-order sensitivity and no avoidable out-of-position slot.
The failure is local concentration, not a collapsed league.

## Instrument Correction Before The Deciding Retry

The first preflight compared the reverse fixture direction as if it were a
horizontal mirror. That is false: home/away reversal changes which real shape
owns the response. Before the deciding retry, the invariant was corrected to
mirror both capacity maps through the domain's canonical mapping and swap only
`left/right`. No target, seed, tactic or gameplay coefficient moved. The final
result has zero mirror mismatch in both sets.

## Ownership And Next Step

The report supports two separate attribution questions and does not authorize
a coefficient change:

1. Why does `balanced` beat `left/right` in virtually every context: route
   leverage, tactic magnitude or their interaction?
2. Why do two otherwise healthy out-of-sample leagues put six clubs in
   `4-4-2`: squad-chart allocation, selector fit or ordinary finite-sample
   concentration?

Step 06C1 answers those questions on the same retained facts. Step 07 remains
closed. No Monte Carlo replay code or dormant product seam was added after the
Phase-1 failure.
