# Step 16N - Checkpoint L6.44 Integrated Successor HTML

## Status

**Blocked by Step 16M-B attribution and Step 16M-C paired `GO`.** Step 16M
returned `STOP_RETHINK`; this step cannot consume the failed five-star policy
as though it had passed. Final current-product integration and manual
inspection remain its scope; no new gameplay policy.

## Purpose

Prove that the adopted successor-ceiling policy survives without its paired
control seam and produces a ten-season football world that is both numerically
credible and understandable by inspection.

## Before The Run

- remove the Step 16L analysis switch, control branch, paired-only profile,
  fixtures and localization keys;
- make the adopted policy the sole annual composition path used by CLI and web;
- assert the production graph has one annual ceiling allocator and no stale
  pre-policy symbol;
- freeze seven fresh seeds, ten seasons, seven workers and artifact paths;
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
  --profile=phase81a-successor-renewal-l6-44-7x10 \
  --workers=7 \
  --format=json \
  --report-output=simulation-out/phase81a-successor-renewal-l6-44-7x10.json

pnpm cli simulation-report \
  --from-report=simulation-out/phase81a-successor-renewal-l6-44-7x10.json \
  --format=html \
  --report-output=simulation-out/phase81a-successor-renewal-l6-44-7x10.html
```

Finish with desktop visual inspection, `graphify update .`, stale-symbol search,
`git diff --check` and `pnpm check` alone.
