/** Public entrypoint for deterministic AI team-selection helpers. */
export {
  applyAiInGameDecision,
  applyProgressiveAiInGameDecisions,
  hasProgressiveAiInGameDecisionBoundary,
  selectAiInGameDecision,
  type AiInGameDecisionReason,
  type AiInGameDecisionReasonKey,
  type AiInGameDecisionSelection,
  type AiInGameFormationOption,
  type AiInGamePlayerSignal,
  type ApplyAiInGameDecisionResult,
  type ApplyProgressiveAiInGameDecisionsInput,
  type ApplyProgressiveAiInGameDecisionsResult,
  type ProgressiveAiInGameDecision,
  type SelectAiInGameDecisionInput,
} from "./ai-in-game-decisions.ts";
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
