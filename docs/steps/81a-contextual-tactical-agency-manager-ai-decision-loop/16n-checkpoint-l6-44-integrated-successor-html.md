# Step 16N - Checkpoint L6.44 Integrated Successor HTML

## Status

**`superseded_not_executed`. L6.44 is not run.**

This step exists to prove that an **adopted** successor-ceiling policy survives
without its paired control seam. No policy was ever adopted: Step 16M returned
`STOP_RETHINK`, and Step 16M-C is itself `superseded_not_executed` after L6.43B
showed its allocation branch corrects a rating band rather than a defect. The
`GO` this step waits on cannot arrive, and the step is **not redefined to answer
a different question** - displaying the current product without an adopted policy
would be a different checkpoint wearing this one's name.

Simulating a policy that was never adopted is also refused. A fifteen-season
HTML world built on the failed five-star lane would look like evidence and be
none.

**A phase may close correctly with `STOP_RETHINK` when its hypothesis is
falsified.** That is what happened here: the last valid evidence is L6.43B, and
the structural answer moves to Phase 81B, which replaces the mutable
`Player.potential` and the special generation lanes instead of correcting a
selection rule over them.

One instruction in *Before The Run* is explicitly **not** executed: the removal
of the Step 16M-B observation seam. That seam's locked profile remains
executable and is the historical baseline of the superseded model, so Phase 81B
owns its removal once new instrumentation and new evidence replace it.
`baselineContinuityHash` is retained on the same ground and carries that removal
path in its own documentation.

## Purpose

Prove that the adopted successor-ceiling policy survives without its paired
control seam and produces a **fifteen-season** football world that is both
numerically credible and understandable by inspection.

The horizon matches Step 16M-C, not the earlier ten-season plan. A succession
policy validated at fifteen seasons cannot be displayed at ten: the L6.43A
audit showed that at ten seasons `97/173` selected prospects are `<=23` at the
horizon and only `10/173` have closed their growth window, so a ten-season
world would show none of the outcome the policy was gated on.

## Before The Run

- remove the Step 16L analysis switch, control branch, paired-only profile,
  fixtures and localization keys;
- remove every Step 16M-B observation seam, diagnostic flag and rejected
  16M-C branch, including the per-season age-composition diagnostic if it did
  not become a gate;
- make the adopted policy the sole annual composition path used by CLI and web;
- assert the production graph has one annual ceiling allocator and no stale
  pre-policy symbol;
- freeze seven fresh seeds, **fifteen seasons**, seven workers and artifact
  paths;
- run a `7 x 1` current-product canary through the same producer and formatter.

## Integrated Output

Produce canonical JSON and English desktop HTML with:

- every league table and champion points;
- scorer and assist rankings with name, age, role and origin;
- appearances and minutes by age;
- transfers with euro values and buyer/seller divisions;
- formations, tactics and selection-source distributions;
- successor stock, current-16 funnel and leader-origin panels;
- injuries, substitutions, squad use and age distribution;
- all gate verdicts with failed keys, never a summary-only PASS.

The HTML derives only from the canonical JSON through `--from-report`; it does
not simulate, evaluate gates or recalculate facts.

## GO Conditions

- all Step 16M primary gates pass again on fresh current-product worlds;
- every integrated pre-existing gate passes under its original reader;
- report reconciliation failures are zero;
- fallback formation/selection sources are zero;
- JSON rebuild and HTML rebuild are byte-identical;
- CLI and web use the same annual composition default;
- manual desktop inspection finds no systemic old-leader monopoly, instant
  youth stars, repeated club monopoly, broken tables or implausible transfer
  values;
- no analysis seam or superseded report residue remains.

`REFINE` reopens only the demonstrated owner from this fresh cohort. A red
unrelated subsystem is recorded and owned before any correction. `GO` closes
the absolute late-career finding and unblocks Phase 81B.

## Expected Files

- Step 16L provider/content files for removal of the analysis seam only.
- `apps/cli/src/commands/simulation-report/report-registry.ts`, renderer and
  focused tests for the current-only locked profile and integrated HTML.
- `packages/i18n/src/labels.ts` only for canonical console/report labels; the
  English audit HTML itself remains intentionally English.
- generated L6.44 audit, audit index, this step, phase README and status.

## Required Commands

```bash
nvm use 24.16.0
pnpm cli simulation-report \
  --profile=phase81a-successor-renewal-l6-44-7x15 \
  --workers=7 \
  --format=json \
  --report-output=simulation-out/phase81a-successor-renewal-l6-44-7x15.json

pnpm cli simulation-report \
  --from-report=simulation-out/phase81a-successor-renewal-l6-44-7x15.json \
  --format=html \
  --report-output=simulation-out/phase81a-successor-renewal-l6-44-7x15.html
```

Finish with desktop visual inspection, `graphify update .`, stale-symbol search,
`git diff --check` and `pnpm check` alone.
