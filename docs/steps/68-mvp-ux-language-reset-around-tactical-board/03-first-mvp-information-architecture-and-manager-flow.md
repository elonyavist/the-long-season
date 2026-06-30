# 03 - First MVP Information Architecture And Manager Flow

## Goal

Define the first MVP information architecture and manager flow before code
rework starts.

## Scope

Document:

- first MVP screens and their responsibilities;
- screens to keep visible but inactive;
- screens to remove from the immediate flow;
- dashboard as command centre;
- Inbox/Posta as attention rail or surface;
- match preparation as tactical workspace around the approved board;
- matchday as staged football centre, not log report;
- navigation rules and click-path rules;
- what facts each screen needs from current read models/adapters;
- what belongs to future phases.

## Expected files

- `docs/design/MVP_INFORMATION_ARCHITECTURE.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/PROJECT_STATUS.md`

## What NOT to implement

- Do not change source code.
- Do not add persistence.
- Do not add new gameplay systems.
- Do not silently expand MVP scope.

## Required checks

```bash
nvm use 24
test -f docs/design/MVP_INFORMATION_ARCHITECTURE.md
git diff --check
```

## Done when

- Each first MVP screen has one clear job.
- The manager flow from main menu to matchday and back is explicit.
- Future sections are documented as future, not half-built UI.
- `docs/PROJECT_STATUS.md` records the information-architecture decision.
