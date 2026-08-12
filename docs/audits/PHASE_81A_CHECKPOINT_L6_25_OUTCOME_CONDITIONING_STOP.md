# Phase 81A Checkpoint L6.25 — Outcome-Conditioning Stop

## Verdict

`STOP / RETHINK: outcome_conditioned_comparator`. No gameplay owner and no
product correction were accepted.

## Invalid Output

The reconciled cache read reported scorer quality-plus-selection overlap at
`34/65` and creator conversion deficits at `176/227`, dominant in six worlds.
Artifact SHA-256:
`63218313885733ab1e34ace64a5f38ece6dfb6f525e2f39e6e88d2fe8793d58b`.
Those numbers are diagnostic output from an invalid causal comparison, not
evidence about the product.

## Why It Is Invalid

The reader selected top-ten players by goals or assists and then used those
same outcomes to define the conversion median against which non-leaders were
judged. Better conversion is partly guaranteed by selection into the
comparator. This is outcome conditioning, not attribution.

Engine inspection independently shows that creator conversion is not an
individual post-nomination decision. Assist eligibility is sampled before
actor selection; a distinct selected creator gets the assist only when the
shooter scores. Individual assists per creator nomination therefore mix
teammate finishing, club environment and chance luck. An origin- or
creator-specific conversion correction would target the wrong owner.

## Consequence

All L6.25 report code was removed. L6.26 uses outcome-unconditioned ladders:
role quality, raw opportunities, opportunities per 900 minutes and
leave-one-out club-conditioned expected output. Actual leaderboard origin is
read only after those independent ranks exist.
