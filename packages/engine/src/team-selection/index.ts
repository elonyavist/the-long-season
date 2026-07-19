/** Public entrypoint for deterministic AI team-selection helpers. */
export {
  applyAiHalfTimeSubstitutions,
  selectAiHalfTimeSubstitutions,
  type AiHalfTimeSubstitutionReason,
  type AiHalfTimeSubstitutionReasonKey,
  type AiHalfTimeSubstitutionSelection,
  type ApplyAiHalfTimeSubstitutionsResult,
  type SelectAiHalfTimeSubstitutionsInput,
} from "./ai-half-time-substitution.ts";
export {
  AiSquadSelectionError,
  buildAiSquadMatchTeamContext,
  selectAiMatchSquad,
  type AiRecentPlayerUse,
  type AiSquadSelectionErrorCode,
  type AiSquadSelectionInput,
  type AiSquadSelectionReason,
  type AiSquadSelectionResult,
  type BuildAiSquadMatchTeamContextInput,
  type BuildAiSquadMatchTeamContextResult,
} from "./ai-squad-selection.ts";
