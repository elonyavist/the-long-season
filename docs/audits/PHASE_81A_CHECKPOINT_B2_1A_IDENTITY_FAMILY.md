# Phase 81A Checkpoint B2.1A - Identity Family

## Verdict

`IDENTITY_FAMILY`. The unique minimum stable owner is
`double_width_stock + wide_midfield_stock`.

The family covers all twelve `4-4-2` selections in both failed league rows,
and every covered selector decision is a unique maximum. Across the complete
populations the family selects `4-4-2` in `78 / 90 = 0.8667` in-sample and
`84 / 98 = 0.8571` out-of-sample. Both exceed the unchanged `0.80` owner floor.

## Locked Evidence

- command: `pnpm cli simulation-report
  --profile=phase81a-b2-identity-family --workers=7 --format=json
  --report-output=simulation-out/phase81a-checkpoint-b2-1a-identity-family.json`
- SHA-256:
  `c0a498bac32d6a3464bb3a3d59870a26eae41bfcc259376b218a46ea8047d6cc`
- process exit `0`; attribution is `NOT_EVALUATED`, not a green B2 gate
- B2 and B2.1 reproduction: true
- failed-row family coverage: `1.0 / 1.0`
- same family is the only minimum qualifying subset of at most two identities

## Consequence

The two charts are not independent football identities in the selector's
observable output. `wide_midfield_stock` is correctly a classic midfield-width
and two-striker squad. `double_width_stock` claims width twice over, but its
starting stock also supplies a two-striker, four-midfielder skeleton and thereby
converges on the same `4-4-2`.

A correction may change only `double_width_stock`, the identity whose name and
comment already promise wing-backs plus advanced width. It must make that claim
true through positions, never a preferred-formation hint, while preserving all
department floors and the complete Step 06A population gates. The unchanged B2
profile then decides whether the correction worked.
