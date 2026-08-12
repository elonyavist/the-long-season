# Phase 81A Contextual Route-Quality Materiality

## Decision

`STOP / RETHINK`. All three preregistered candidates fail the complete-row
materiality target. `routeQualityBiasBasisPoints` is restored to `2500`; no
candidate gameplay change survives.

## Results

| candidate | in ceiling / exposure | out ceiling / exposure | Phase 1 | decision |
|---:|---:|---:|---|---|
| `4000` | `+0.02314 / -0.02300` | `+0.02688 / -0.02267` | pass twice | `REFINE` |
| `5000` | `+0.02331 / -0.02644` | `+0.02674 / -0.02375` | pass twice | `REFINE` |
| `6000` | `+0.02427 / -0.02765` | `+0.02943 / -0.02547` | pass twice | `REFINE` |

Every run used the exact 06C5 populations, full nine-response rows, `207`
replay pairs and seven workers. Every population remained `21/21`; the blind
arm stayed neutral. The configured field was the only gameplay value changed.

Artifacts and SHA-256:

- `phase81a-b2-minute-effect-candidate-4000.json`:
  `bb2b9147ffe6d4e9346352cb1c051370df2d519567f02f86df960ea5eab58b26`;
- `phase81a-b2-minute-effect-candidate-5000.json`:
  `8b89e03dfe5add1ff4123909561b9e0ae2ac3b4dbed78142570a9f4ed2ea2333`;
- `phase81a-b2-minute-effect-candidate-6000.json`:
  `8670b3ad6e136d1ae6fe4e0a1f9cd7e951d5503450b56ad424d399283344b541`.

## Interpretation

Raising route quality affects the negative tail more than the positive one and
does not scale the ceiling to the target. The original hypothesis—insufficient
chance-quality translation owns minute materiality—is falsified. The remaining
contextual channel is route advantage changing opportunity volume. Generic
tactic volume and direct strength bonuses remain closed because they would
reward a tactic independently of the opponent.
