/**
 * Public entrypoint for deterministic simulation rules.
 *
 * Engine code may import only `@game/domain` and `@game/shared`. This file is
 * intentionally limited to pure deterministic simulation helpers.
 */
export * from "./match-engine/index.ts";
export * from "./market/index.ts";
export * from "./player-state/index.ts";
export * from "./squad/index.ts";
export * from "./team-selection/index.ts";
export {
  applyDomesticPromotionRelegation,
  type DomesticCompetitionMovement,
  type DomesticPromotionRelegationApplied,
  type DomesticPromotionRelegationInvalid,
  type DomesticPromotionRelegationResult,
} from "./career/promotion-relegation.ts";
export {
  buildCareerMarketCatalog,
  type CareerMarketCatalog,
  type CareerMarketCatalogEmployment,
  type CareerMarketCatalogTarget,
  type CareerMarketSourceTier,
} from "./career/career-market-catalog.ts";
export {
  advanceAiMarketLifecycle,
  deriveAiMarketNeeds,
  deriveAiMarketTargetScore,
  deriveAiTransferAffordabilitySnapshot,
  deriveAiTransferOfferFee,
  type AdvanceAiMarketLifecycleResult,
  type AiMarketDiagnosticFact,
  type AiMarketDiagnosticReason,
  type AiMarketLifecycleFact,
  type AiMarketNeed,
  type AiMarketNeedReason,
  type AiTransferAffordabilitySnapshot,
  type DeriveAiTransferAffordabilitySnapshotInput,
  type DeriveAiTransferOfferFeeInput,
} from "./career/ai-market-lifecycle.ts";
export {
  CareerMatchStateConsequenceError,
  applyCareerMatchStateConsequences,
  type ApplyCareerMatchStateConsequencesInput,
  type ApplyCareerMatchStateConsequencesResult,
  type CareerMatchPlayerStateConsequence,
  type CareerMatchStateConsequenceErrorCode,
  type CareerMatchStateConsequenceReasonKey,
  type CareerMatchStateConsequenceSummary,
  type CareerMatchStateParticipantRole,
} from "./career/career-match-state-consequences.ts";
export {
  applyCareerWeeklyRecovery,
  type ApplyCareerWeeklyRecoveryInput,
  type ApplyCareerWeeklyRecoveryResult,
  type CareerWeeklyRecoveryChange,
} from "./career/career-weekly-recovery.ts";
export {
  applyCareerPermanentTransfer,
  type AcceptedPermanentTransferDeal,
  type ApplyCareerPermanentTransferInput,
  type ApplyCareerPermanentTransferResult,
} from "./career/apply-career-transfer.ts";
export {
  applyCareerFreeAgentSigning,
  type ApplyCareerFreeAgentSigningInput,
  type ApplyCareerFreeAgentSigningResult,
  type CareerFreeAgentSigningApplied,
  type CareerFreeAgentSigningRejected,
  type CareerFreeAgentSigningRejectionReason,
} from "./career/apply-career-free-agent-signing.ts";
export {
  findNextCareerFixture,
  findNextFixtureEligibilityBlockers,
  orderedCareerFixtureIds,
  type NextCareerFixtureFound,
  type NextCareerFixtureInvalid,
  type NextCareerFixtureInvalidReason,
  type NextCareerFixtureNone,
  type NextCareerFixtureResult,
} from "./career/next-fixture.ts";
export {
  continueCareerUntilAttention,
  createMatchdayAttention,
  createNextCareerMatchdayAttention,
  type CareerMatchdayAttention,
  type CareerContinueStopReason,
  type ContinueCareerPreparationInput,
  type ContinueCareerUntilAttentionInput,
  type ContinueCareerUntilAttentionResult,
  type NextCareerMatchdayAttentionResult,
} from "./career/continue-career.ts";
export {
  CareerInboxLifecycleError,
  acknowledgeImportantCareerInboxMessage,
  deliverCareerInboxMessages,
  openCareerInboxMessage,
  reconcileCareerInboxResolution,
  createMatchConsequenceInboxMessages,
  type CareerInboxLifecycleErrorCode,
} from "./career/career-inbox-lifecycle.ts";
export {
  applyMatchAvailabilityConsequences,
  injuryDurationDays,
  type ApplyMatchAvailabilityConsequencesInput,
  type ApplyMatchAvailabilityConsequencesResult,
} from "./career/match-availability-consequences.ts";
export {
  generateNextSeasonCalendar,
  type NextSeasonCalendarGenerated,
  type NextSeasonCalendarInvalid,
  type NextSeasonCalendarInvalidReason,
  type NextSeasonCalendarResult,
} from "./career/next-season-calendar.ts";
export {
  selectCareerAiTeam,
  type CareerAiTeamSelection,
  type CareerAiTeamSelectionPolicy,
  type SelectCareerAiTeamInput,
} from "./career/career-ai-team-selection.ts";
export {
  commitCompletedCareerFixture,
  progressNextCareerFixture,
  type CommitCompletedCareerFixtureInput,
  type FixtureFieldedLineups,
  type ProgressCareerFixtureAdvanced,
  type ProgressCareerFixtureInvalid,
  type ProgressCareerFixtureInvalidReason,
  type ProgressCareerFixtureNone,
  type ProgressCareerFixtureResult,
  type ProgressCareerAiTeamSelectionInput,
  type ProgressNextCareerFixtureInput,
} from "./career/progress-fixture.ts";
export {
  advanceCareerMonths,
  monthKeyForCareerDate,
  type AdvanceCareerMonthsInput,
  type AdvanceCareerMonthsResult,
  type CareerMonthlyLifecycleSummary,
} from "./career/advance-career-month.ts";
export {
  advanceAiContractLifecycle,
  type AdvanceAiContractLifecycleResult,
  type AiContractDecisionReason,
  type AiContractLifecycleFact,
} from "./career/ai-contract-lifecycle.ts";
export {
  acceptPreliminaryAgreementCounter,
  advancePreliminaryAgreementLifecycle,
  createPreliminaryAgreementId,
  rejectPreliminaryAgreementCounter,
  submitPreliminaryAgreementOffer,
  withdrawPreliminaryAgreement,
  type AdvancePreliminaryAgreementLifecycleResult,
  type PreliminaryAgreementCommandRejectionReason,
  type PreliminaryAgreementCommandResult,
  type PreliminaryAgreementLifecycleFact,
  type SubmitPreliminaryAgreementOfferInput,
} from "./career/preliminary-agreement.ts";
export { selectFreeAgentPlayerIds } from "./career/free-agent-pool.ts";
export {
  selectCareerActivePlayerStock,
  type CareerActivePlayerStockEntry,
} from "./career/active-player-stock.ts";
export {
  replenishSeniorSquadsFromFreeAgents,
  type ReplenishSeniorSquadsFromFreeAgentsInput,
  type ReplenishSeniorSquadsFromFreeAgentsResult,
} from "./career/senior-squad-replenishment.ts";
export {
  applyContractActivationFinance,
  checkContractOfferAffordability,
  reallocateTransferBudgetToWages,
  settleAnnualPayroll,
  settleFixtureContractBonuses,
  settleSeasonDistribution,
  type ApplyContractActivationFinanceInput,
  type CareerFinanceApplied,
  type CareerFinanceLifecycleResult,
  type CareerFinanceRejected,
  type CareerFinanceRejectionReason,
  type CareerAnnualPayrollFact,
  type CareerAnnualPayrollResult,
  type CheckContractOfferAffordabilityInput,
  type ContractOfferAffordabilityResult,
  type ContractOfferAffordable,
  type ReallocateTransferBudgetToWagesInput,
  type SettleFixtureContractBonusesInput,
  type SettleAnnualPayrollInput,
  type SettleSeasonDistributionInput,
} from "./career/career-finance-lifecycle.ts";
export {
  deriveMarketPendingExposure,
  type MarketPendingExposure,
} from "./career/market-pending-exposure.ts";
export {
  evaluateCareerContractCapacity,
  evaluateTransferFeeCapacity,
  type CareerContractCapacityEvaluation,
  type CareerContractCapacityReason,
  type EvaluateCareerContractCapacityInput,
  type TransferFeeCapacityEvaluation,
  type TransferFeeCapacityReason,
} from "./career/career-contract-capacity.ts";
export {
  acceptTransferCounter,
  advanceTransferNegotiations,
  createTransferNegotiationId,
  deriveSellerTransferWillingness,
  deriveTransferCommercialSnapshot,
  submitTransferOffer,
  withdrawTransferNegotiation,
  type AdvanceTransferNegotiationsInput,
  type AdvanceTransferNegotiationsResult,
  type AdvancedTransferNegotiation,
  type ResolveTransferNegotiationInput,
  type SellerTransferDecision,
  type SubmitTransferOfferInput,
  type SubmittedTransferParties,
  type TransferDepartment,
  type TransferCommercialSnapshot,
  type TransferNegotiationCommandRejectionReason,
  type TransferNegotiationCommandResult,
} from "./career/transfer-negotiation.ts";
export {
  acceptTransferPlayerCounter,
  advanceTransferPlayerNegotiations,
  rejectTransferPlayerCounter,
  submitTransferPlayerOffer,
  type AdvanceTransferPlayerNegotiationsInput,
  type AdvanceTransferPlayerNegotiationsResult,
  type AdvancedTransferPlayerNegotiation,
  type ResolveTransferPlayerCounterInput,
  type SubmitTransferPlayerOfferInput,
  type TransferPlayerNegotiationCommandRejectionReason,
  type TransferPlayerNegotiationCommandResult,
} from "./career/transfer-player-negotiation.ts";
export {
  ContractDemandError,
  deriveContractDemand,
  evaluateContractOffer,
  type ContractDemandErrorCode,
  type DeriveContractDemandInput,
  type EvaluateContractOfferInput,
} from "./career/contract-negotiation-demand.ts";
export {
  acceptContractCounterOffer,
  advanceContractNegotiations,
  chooseReleaseAtContractExpiry,
  createContractNegotiationDraft,
  createRenewalNegotiationId,
  offerContractRenewal,
  offerSelectedClubRenewal,
  rejectContractCounterOffer,
  reviseContractOffer,
  submitContractOffer,
  withdrawContractNegotiation,
  type AdvanceContractNegotiationsResult,
  type ContractNegotiationApplied,
  type ContractNegotiationCommandResult,
  type ContractNegotiationFact,
  type ContractNegotiationRejected,
  type ContractNegotiationRejectionReason,
  type ChooseReleaseAtContractExpiryInput,
  type CreateContractNegotiationDraftInput,
  type OfferContractRenewalInput,
  type OfferSelectedClubRenewalInput,
  type ReviseContractOfferInput,
  type ResolveContractCounterInput,
  type SubmitContractOfferInput,
} from "./career/contract-negotiation.ts";
export {
  advanceSelectedClubWorkflowsToAttention,
  projectSelectedClubContractAttention,
  type AdvanceSelectedClubWorkflowsToAttentionResult,
  type SelectedClubContractAttention,
} from "./career/selected-club-contract-workflow.ts";
export {
  advanceSelectedClubMarketLifecycles,
  isSelectedClubMarketMessageResolved,
  nextSelectedClubMarketDueDate,
  projectSelectedClubMarketAttention,
} from "./career/selected-club-market-workflow.ts";
export {
  prepareSeniorSquadPermanentTransfer,
  prepareSeniorSquadSigning,
  SeniorSquadTransferError,
  type PrepareSeniorSquadSigningInput,
  type PrepareSeniorSquadPermanentTransferInput,
  type PreparedSeniorSquadPermanentTransfer,
} from "./career/senior-squad-transfer.ts";
export {
  accrueCommittedFixtureParticipation,
  accrueFixtureParticipationContributions,
  buildFixtureParticipationContributions,
  type AccrueCommittedFixtureParticipationInput,
  type AccrueFixtureParticipationContributionsInput,
  type BuildFixtureParticipationContributionsInput,
  type BuildFixtureParticipationContributionsResult,
  type FixtureParticipationSideContext,
} from "./career/player-participation.ts";
export {
  derivePlayerDevelopmentEnvironmentEvidence,
  developPlayersFromParticipationRows,
  monthlyDevelopmentVariance,
  PlayerDevelopmentError,
  summarizePlayerDevelopmentAbilities,
  totalPlayerAbilityDelta,
  type DevelopPlayersFromParticipationRowsInput,
  type DerivePlayerDevelopmentEnvironmentEvidenceInput,
  type PlayerDevelopmentAbilitySummary,
  type PlayerDevelopmentChange,
  type PlayerDevelopmentErrorCode,
  type PlayerDevelopmentEnvironmentEvidence,
  type PlayerDevelopmentResult,
  type PlayerMonthlyDevelopmentChange,
} from "./career/player-development.ts";
export {
  applyPlayerAgingPolicy,
  currentAbilityFloor,
  monthlyDeclineFor,
  type ApplyPlayerAgingPolicyInput,
  type ApplyPlayerAgingPolicyResult,
} from "./career/player-aging-policy.ts";
export {
  environmentMultiplierFromBasisPoints,
  monthlyDevelopmentPolicy,
  monthlyGrowthAgeMultiplier,
  monthlyOpportunityMultiplier,
  monthlyPerformanceModifier,
  type BroadPositionGroup,
  type MonthlyDevelopmentPolicy,
  type MonthlyDevelopmentPolicyInput,
} from "./career/player-development-policy.ts";
export {
  adaptPlayerRolesFromParticipation,
  type PlayerRoleAdaptationChange,
  type PlayerRoleAdaptationInput,
  type PlayerRoleAdaptationResult,
} from "./career/player-role-adaptation.ts";
export {
  applyEndOfSeasonPlayerExits,
  type PlayerExitInput,
  type PlayerExitReason,
  type PlayerExitRecord,
  type PlayerExitResult,
} from "./career/player-exits.ts";
export {
  CareerIntakePoolError,
  createCareerIntakePool,
  type CareerIntakeCandidate,
  type CareerIntakePoolErrorCode,
  type CareerIntakeRecord,
  type CreateCareerIntakePoolInput,
  type CreateCareerIntakePoolResult,
} from "./career/player-intake.ts";
export {
  applySeasonalYouthIntake,
  YOUTH_ACADEMY_TARGET_MAX_SIZE,
  YouthIntakeError,
  type ApplySeasonalYouthIntakeInput,
  type ApplySeasonalYouthIntakeResult,
  type YouthIntakeCandidate,
  type YouthIntakeErrorCode,
  type YouthIntakeRecord,
} from "./career/youth-intake.ts";
export {
  applyYouthAcademyLifecycle,
  type YouthAcademyLifecycleInput,
  type YouthAcademyLifecycleResult,
  type YouthLifecycleOutcome,
  type YouthLifecycleRecord,
} from "./career/youth-lifecycle.ts";
export {
  promoteYouthCandidatesToSeniorSquads,
  YOUTH_PROMOTION_SENIOR_TARGET_SIZE,
  type PromoteYouthCandidatesInput,
  type PromoteYouthCandidatesResult,
  type YouthPromotionReason,
  type YouthPromotionRecord,
} from "./career/youth-promotion.ts";
export {
  assessCareerSquadStructure,
  maintainCareerSquadShape,
  MINIMUM_CAREER_SQUAD_SIZE,
  TARGET_CAREER_SQUAD_SIZE,
  type MaintainCareerSquadShapeInput,
  type MaintainCareerSquadShapeResult,
  type SquadMaintenanceRecord,
  type SquadMaintenanceWarning,
} from "./career/squad-maintenance.ts";
export {
  CLUB_COMPETITIVE_TIER_DIVISION_SIZE,
  ClubSeasonTierError,
  completedResultPyramidCoordinate,
  deriveClubReputationTarget,
  deriveClubRosterStrength,
  deriveClubSeasonTierUpdate,
  moveReputationTowardTarget,
  type ClubCompletedSeasonResult,
  type ClubRosterStrength,
  type ClubSeasonTierErrorCode,
  type ClubSeasonTierFact,
  type ClubSeasonTierUpdate,
} from "./career/club-season-tier.ts";
export {
  ClubDevelopmentEnvironmentDerivationError,
  deriveClubDevelopmentEnvironment,
  type ClubDevelopmentEnvironmentDerivationErrorCode,
  type DeriveClubDevelopmentEnvironmentInput,
} from "./career/club-development-environment.ts";
export {
  createFreshCareerState,
  type CreateFreshCareerStateInput,
} from "./career/fresh-career-state.ts";
export {
  rolloverPlayersForNextSeason,
  type PlayerSeasonRolloverInput,
  type PlayerSeasonRolloverResult,
} from "./career/player-season-rollover.ts";
export {
  assessCareerSeasonCompletion,
  type CareerSeasonComplete,
  type CareerSeasonCompletionInvalid,
  type CareerSeasonCompletionInvalidReason,
  type CareerSeasonCompletionResult,
  type CareerSeasonIncomplete,
} from "./career/season-completion.ts";
export {
  advanceCareerOneSeason,
  type AdvanceCareerCompletedSeasonMode,
  type AdvanceCareerOneSeasonAdvanced,
  type AdvanceCareerOneSeasonInput,
  type AdvanceCareerOneSeasonInvalid,
  type AdvanceCareerOneSeasonInvalidReason,
  type AdvanceCareerOneSeasonMode,
  type AdvanceCareerOneSeasonResult,
  type AdvanceCareerReportCompetitionResult,
  type AdvanceCareerReportRefreshMode,
  type CareerPlayerDevelopmentFact,
  type CareerPlayerExitFact,
  type CareerSeasonAdvancementFacts,
  type CareerSeasonAdvancementOperation,
  type CareerSeasonAdvancementWarning,
  type CareerSeasonArchiveFact,
  type CareerSeasonMarketLifecycleFact,
  type CareerSquadHealthFact,
  type CareerSquadMaintenanceFact,
  type CareerTransferTurnoverFact,
  type CareerYouthHealthFact,
  type CareerYouthIntakeFact,
  type CareerYouthLifecycleFact,
  type CareerYouthPromotionFact,
} from "./career/advance-career-season.ts";
export {
  buildCareerPlayerSeasonStatistics,
  selectCareerPlayerStatistics,
  type BuildCareerPlayerSeasonStatisticsInput,
  type CareerPlayerStatisticsSelection,
  type CareerPlayerStatisticsSummary,
  type SelectCareerPlayerStatisticsInput,
} from "./career/player-statistics.ts";
export { createMatchReport } from "./match-engine/create-match-report.ts";
export {
  ApplyMatchReportToFixtureError,
  applyMatchReportToFixture,
  type ApplyMatchReportToFixtureErrorCode,
  type ApplyMatchReportToFixtureInput,
  type ApplyMatchReportToFixtureOptions,
} from "./use-cases/apply-match-report-to-fixture.ts";
export {
  SimulateSeasonError,
  simulateSeason,
  type SimulateSeasonErrorCode,
  type SimulateSeasonAiSquadSelection,
  type SimulateSeasonAvailabilityLifecycle,
  type SimulateSeasonFitnessLifecycle,
  type SimulateSeasonFixtureLineupOverride,
  type SimulateSeasonFixtureProgression,
  type SimulateSeasonInput,
  type SimulateSeasonResult,
  type SimulateSeasonSetupOverride,
  type SimulateSeasonTeamInput,
} from "./use-cases/simulate-season.ts";
export {
  CalendarGenerationError,
  combineDomesticCompetitionCalendars,
  generateRoundRobinCalendar,
  type CalendarGenerationErrorCode,
  type DomesticCalendarCollection,
  type GenerateRoundRobinCalendarInput,
  type RoundRobinCalendar,
} from "./season-engine/calendar.ts";
export { computeLeagueTable, type ComputeLeagueTableInput } from "./season-engine/league-table.ts";
export {
  computeSeasonPlayerGoalStats,
  type ComputeSeasonPlayerGoalStatsInput,
  type SeasonPlayerGoalStatRow,
  type SeasonPlayerStatRegistration,
} from "./season-engine/player-stats.ts";
export {
  computePlayerMatchStats,
  type ComputePlayerMatchStatsInput,
  type PlayerMatchStatRegistration,
  type PlayerMatchStatRow,
  type PlayerMatchStatsSortMode,
} from "./season-engine/player-match-stats.ts";
