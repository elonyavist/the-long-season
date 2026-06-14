# Match Report

## Goal

Formalize the serializable `MatchReport` contract that can later be applied to fixtures and stored in saves.

## Why we implement it this way

`requirements.md` says the engine emits structured events, never text, and saves preserve reports without making them the source of truth for league tables. A stable report contract lets future storage, narration, and UI read the same match data without engine coupling.

## What to implement

- `MatchReport` domain type if not already present.
- `MatchEvent` discriminated union with sparse event types.
- `MatchStats` type.
- `eventSchemaVersion` field.
- Conversion from `simulateMatch` output to `MatchReport`.
- Minimal type tests or compile tests to prevent report drift.

## What NOT to implement

- Do not implement Zod storage schemas in domain.
- Do not implement rich prose narration.
- Do not implement save retention policy.
- Do not implement fixture application or league table updates unless a minimal result type is needed by season steps.
- Do not add micro-duel event streams.

## Allowed dependencies

- `packages/domain -> nothing` for report data types.
- `packages/engine -> domain, shared` for report creation.

## Expected files

- `packages/domain/src/entities/match.entity.ts`
- `packages/domain/src/entities/match-event.entity.ts`
- `packages/engine/src/match-engine/create-match-report.ts`
- `packages/engine/src/match-engine/create-match-report.test.ts`
- `packages/domain/src/index.ts`
- `packages/engine/src/index.ts`

## Required tests

- Report score matches goal events.
- Report contains event schema version.
- Report contains only IDs and primitives.
- Unknown or future event fields do not affect current report creation tests.
- No event contains rendered text.

## Definition of Done

- `MatchReport` is serializable.
- Events are structured and language-agnostic.
- No text narration exists in engine.
- Report creation is deterministic.

## Claude Code task prompt

Read `docs/PROJECT_STATUS.md` before starting and update it after verification. Implement only the structured `MatchReport` and sparse `MatchEvent` contract from `docs/steps/01-match-engine/05-match-report.md`. Do not implement narration, storage schemas, retention, or season application.
