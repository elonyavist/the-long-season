# Phase 81A Checkpoint L6.3B - Empirical Shooter And Reader

## Verdict

**SHOOTER GO / overall REFINE.** Empirical role propensity brings the corrected
top-ten scorer mean to `18.45`, inside the frozen `14.5..18.5` band. The
creator lane remains red at `7.1614`, but a cached historical replay proves it
was already red before the shooter change (`7.1914`).

## Population And Limits

- current arm: locked `phase81a-integrated-l6-3b-7x10`, seven fresh worlds,
  ten seasons, seven workers;
- historical ownership arm: cached `phase81a-integrated-l6-3-7x10` facts only;
- both readers use the corrected world-isolated top-ten derivation;
- the two profiles have different seeds, so their numeric difference is not a
  causal estimate;
- the historical arm can answer whether the failure pre-existed, not which
  creator sub-mechanism owns it.

## Instrument Correction

The first L6.3B evaluator pooled all seven worlds before selecting each season's
top ten. It therefore chose ten leaders from `140` clubs instead of ten leaders
per world-season. Match and player facts were valid; leader concentration,
ages and over-33 shares were not.

06B23A1 preserves world ownership until each top ten is selected, then pools
the resulting rows. A two-world test distinguishes the correct `10.5` from the
old pooled `15.5`, and reversing world order is byte-identical. Full `pnpm
check` passes `306` files and `2394` tests.

## Corrected Evidence

| Metric | Historical corrected | L6.3B corrected | Frozen lane |
|---|---:|---:|---:|
| top-ten scorer mean | `25.2114` | `18.4500` | `14.5..18.5` |
| top-ten assist mean | `7.1914` | `7.1614` | `8..10.5` |
| scorer mean age | `30.1886` | `30.0871` | carried overall gate |
| assist mean age | `29.7486` | `29.8186` | carried overall gate |
| scorer age-33+ share | `0.2771` | `0.2871` | carried overall gate |
| assist age-33+ share | `0.2500` | `0.2786` | carried overall gate |

The corrected L6.3B report hash is
`845fd9df94c3934a00170fd5108b4540`, file SHA-256
`39d606b4e29817711af6c39ff8b7cc781fb2975cf05d7c44f985099782e132de`.
The corrected historical report hash is
`f8d084d42d88f1402275690af72d1c9e`, file SHA-256
`de0e6ef093033b514594fdff7eb445a59c944e38f2db0c8124ff8b3790db6f3e`.
Both have zero player reconciliation failures.

## Ownership Decision

The original and corrected historical `players` sections are byte-identical:

```text
a703b521a40c0c9083346dcc9fbc840c05e018e9c4167849090874dc11f913a9
```

The preregistered 06B23B outcome is therefore **pre_existing**. The empirical
shooter frequencies remain accepted because their direct lane is green. The
creator path requires separate attribution; no creator coefficient is inferred
from the observed shortfall and no shooter rate is reopened.

## Carried Findings

The complete report remains `REFINE`. Veteran leader shares, squad use,
career-generated leaders, local replacement, four-formation retention and the
exact first-versus-last non-loss lane remain visible. They are not assigned to
the shooter implementation merely because the integrated report reads them.
