# Step 01 - Documentation Noise Audit

## Goal

Identify which documents still guide the project and which documents create noise.

## Context

The project has accumulated many audit reports, roadmap sketches, and phase reports. Some are still useful because they explain decisions. Others are superseded and make it harder to understand what matters now.

## Expected files

- `docs/audits/DOCUMENTATION_NOISE_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- List project documentation under `docs/`.
- Classify documents as:
  - keep as active guidance;
  - keep as historical reference;
  - archive candidate;
  - deletion candidate.
- Identify obsolete roadmap documents, especially speculative roadmap material that no longer matches the Phase 26-30 direction.
- Do not move or delete files in this step.
- Record the exact next cleanup action.

## What NOT to implement

- Do not modify source code.
- Do not archive or delete files yet.
- Do not rewrite requirements.
- Do not start season rollover work.

## Required checks

- `find docs -maxdepth 3 -type f | sort`
- `rg -n "roadmap|Phase 7|Phase 20|future|archive|obsolete" docs`
- `git diff --check`

## Definition of Done

- The audit exists.
- Every noisy document category has a proposed action.
- The next step has enough information to define a retention policy.

