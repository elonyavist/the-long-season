import {
  CLUB_COMPETITIVE_TIERS,
  PLAYER_STAR_RATINGS,
  type ClubCategory,
  type ClubCompetitiveTier,
  type PlayerStarRating,
} from "@game/domain";

/** Active or explicitly reserved transitional population behind one observation. */
export type PlayerGenerationPopulation =
  | "senior"
  | "academy"
  | "promotion_candidate"
  | "free_agent"
  | "loaned";

/** Broad role family used to keep goalkeeper projection bands separate. */
export type PlayerGenerationRoleGroup = "outfield" | "goalkeeper";

/** Canonical sporting placement used to audit the opening exceptional stock. */
export type PlayerGenerationSquadPlacement =
  | "first_team"
  | "reserve"
  | "academy"
  | "unattached";

/** Final seller-stage story retained for one supplied negotiation. */
export type PlayerGenerationSellerOutcome =
  | "open"
  | "accepted"
  | "countered"
  | "rejected"
  | "expired"
  | "withdrawn";

/** Final counter-stage story retained independently from the seller outcome. */
export type PlayerGenerationCounterOutcome =
  | "not_observed"
  | "open"
  | "accepted"
  | "rejected"
  | "expired";

/** Stable status used by a diagnostic that may have no relevant population. */
export type PlayerGenerationGateStatus =
  | "pass"
  | "warn"
  | "fail"
  | "not_evaluated";

/** Public-star lane supplied by content for one allocated young phenomenon. */
export interface PlayerGenerationCurrentRatingGuardrail {
  readonly minimumRating: PlayerStarRating;
  readonly maximumRating: PlayerStarRating;
}

/** Independent opening-stock assignments emitted by the content allocator. */
export interface PlayerExceptionalAllocationLabels {
  readonly establishedCurrentSixAllocated: boolean;
  readonly youngStoredCeilingSixAllocated: boolean;
  /** Required only for a young stored-ceiling-six allocation. */
  readonly youngStoredCeilingSixCurrentRatingGuardrail?: PlayerGenerationCurrentRatingGuardrail;
  readonly rarityKind?: string;
}

/**
 * One complete caller-supplied player/economy fact.
 *
 * The observation stores both the hidden generated ceiling and the public
 * current/P50/upper projection. Keeping the facts explicit prevents a
 * presentation change from silently redefining rarity or allocation counts.
 */
export interface PlayerGenerationEconomyObservation {
  readonly observationId: string;
  readonly worldId: string;
  readonly playerId: string;
  readonly playerName: string;
  readonly age: number;
  /** Civil season identity; this is not an elapsed-loop index. */
  readonly seasonStartYear: number;
  readonly division: ClubCategory | "free_agent";
  readonly population: PlayerGenerationPopulation;
  /** Null only when no club currently provides the player's sporting context. */
  readonly clubCompetitiveTier: ClubCompetitiveTier | null;
  readonly squadPlacement: PlayerGenerationSquadPlacement;
  readonly roleGroup: PlayerGenerationRoleGroup;
  readonly currentRating: PlayerStarRating;
  readonly storedPotentialCeilingRating: PlayerStarRating;
  readonly publicPotentialP50Rating: PlayerStarRating;
  readonly publicPotentialUpperRating: PlayerStarRating;
  readonly publicValueMinorUnits: number;
  readonly askingPriceMinorUnits?: number;
  readonly allocation?: PlayerExceptionalAllocationLabels;
  readonly archetype: string;
  readonly hardCapEligible: boolean;
}

/**
 * One caller-supplied transfer negotiation with every monetary stage retained.
 *
 * A player may have multiple negotiations, so these facts are deliberately
 * separate from the unique player observations above.
 */
export interface PlayerGenerationNegotiationObservation {
  readonly negotiationId: string;
  readonly playerId: string;
  readonly playerName: string;
  readonly age: number;
  /** Civil season identity; this is not an elapsed-loop index. */
  readonly seasonStartYear: number;
  readonly division: ClubCategory | "free_agent";
  readonly askingPriceMinorUnits: number;
  readonly offeredFeeMinorUnits: number;
  readonly counterFeeMinorUnits?: number;
  readonly agreedFeeMinorUnits?: number;
  readonly completedFeeMinorUnits?: number;
  readonly sellerOutcome: PlayerGenerationSellerOutcome;
  readonly counterOutcome: PlayerGenerationCounterOutcome;
}

/** Versioned initial-world rarity bounds supplied by the composition root. */
export interface PlayerGenerationInitialRarityConstraints {
  readonly establishedCurrentSixMinimum: number;
  readonly establishedCurrentSixMaximum: number;
  readonly youngStoredCeilingSixMinimum: number;
  readonly youngStoredCeilingSixMaximum: number;
  readonly lowerDivisionYoungStoredCeilingSixMaximum: number;
}

/** Employment/context transition whose public value must remain intrinsic. */
export type PlayerGenerationValueTransition =
  | "owner_category"
  | "promotion_relegation"
  | "transfer"
  | "contract_expiry"
  | "free_agent";

/** Paired intrinsic-value facts for one otherwise-identical player. */
export interface PlayerGenerationIntrinsicValueInvarianceObservation {
  readonly observationId: string;
  readonly playerId: string;
  readonly transition: PlayerGenerationValueTransition;
  readonly beforeContextFingerprint: string;
  readonly afterContextFingerprint: string;
  readonly beforePublicValueMinorUnits: number;
  readonly afterPublicValueMinorUnits: number;
}

/** One completed free-agent move with value and fee kept as separate facts. */
export interface PlayerGenerationFreeAgentSigningObservation {
  readonly observationId: string;
  readonly playerId: string;
  /** Stable identity derived from the completed canonical signing fact. */
  readonly completedSigningFingerprint: string;
  readonly publicValueMinorUnits: number;
  readonly transferFeeMinorUnits: number;
}

/** Live AI decision surface that must not gain hidden-ceiling information. */
export type PlayerGenerationAiDecisionKind =
  | "target_ranking"
  | "offer_selection"
  | "willingness";

/**
 * Paired AI decisions with identical public facts and deliberately different
 * hidden ceilings. Fingerprints keep the diagnostic independent from engine
 * decision types while still proving equality rather than trusting a boolean.
 */
export interface PlayerGenerationAiInformationParityObservation {
  readonly observationId: string;
  readonly decisionKind: PlayerGenerationAiDecisionKind;
  readonly leftStoredCeilingRating: PlayerStarRating;
  readonly rightStoredCeilingRating: PlayerStarRating;
  readonly leftPublicAssessmentFingerprint: string;
  readonly rightPublicAssessmentFingerprint: string;
  readonly leftDecisionFingerprint: string;
  readonly rightDecisionFingerprint: string;
}

/** Committed aggregate from a separately reproduced negotiation cohort. */
export interface SuppliedNegotiationAggregate {
  readonly sourceLabel: string;
  readonly offerCount: number;
  readonly sellerCounterCount: number;
  readonly permanentCompletionCount: number;
  readonly askingPriceDistribution: PlayerGenerationMoneyDistribution;
  readonly completedFeeDistribution: PlayerGenerationMoneyDistribution;
}

/** One caller-supplied annual intake application at a world-season boundary. */
export interface PlayerGenerationAnnualIntakeObservation {
  readonly seasonIndex: number;
  readonly allocatedStoredCeilingSixPlayerIds: readonly string[];
  readonly generatedStoredCeilingSixPlayerIds: readonly string[];
  readonly acceptedStoredCeilingSixPlayerIds: readonly string[];
  readonly activeStoredCeilingSixPlayerIds: readonly string[];
}

/** Zero-safe annual intake funnel over supplied world-season observations. */
export interface PlayerGenerationAnnualIntakeSummary {
  readonly observationCount: number;
  readonly evaluationStatus: "evaluated" | "not_evaluated";
  readonly allocatedStoredCeilingSixCount: number;
  readonly generatedStoredCeilingSixCount: number;
  readonly acceptedStoredCeilingSixCount: number;
  readonly activeStoredCeilingSixCount: number;
  readonly allocatedStoredCeilingSixMissingGeneratedCount: number;
  readonly generatedStoredCeilingSixMissingAcceptedCount: number;
  readonly maximumAcceptedStoredCeilingSixPerSeason: number;
}

/**
 * Club/category fact supplied by the composition root for stock diagnostics.
 *
 * This association is deliberately not an ownership or registration model.
 * Phase 80B owns those semantics for loans; this audit only consumes the
 * canonical club association selected by the caller for the accepted stock
 * policy.
 */
export type PlayerGenerationExceptionalStockClubAssociation =
  | Readonly<{
      readonly kind: "club";
      readonly clubId: string;
      readonly category: ClubCategory;
      readonly competitiveTier: ClubCompetitiveTier;
    }>
  | Readonly<{ readonly kind: "unattached" }>;

/** One active player fact in a complete world-season stock snapshot. */
export interface PlayerGenerationExceptionalStockPlayerObservation {
  readonly playerId: string;
  readonly age: number;
  readonly population: PlayerGenerationPopulation;
  /** Hidden generated ceiling used by the exceptional-stock budget. */
  readonly storedPotentialCeilingRating: PlayerStarRating;
  /** Public estimate retained only to prove it does not redefine the stock. */
  readonly publicPotentialUpperRating: PlayerStarRating;
  readonly clubAssociation: PlayerGenerationExceptionalStockClubAssociation;
}

/**
 * Complete active-player snapshot for one world and season.
 *
 * Callers must include every active senior, academy, reserved promotion
 * candidate, free-agent, and available loan population. A promotion candidate
 * remains its own transitional source until promotion resolves; it must not be
 * relabelled as academy stock. Supplying no snapshots leaves the stock gates
 * explicitly `not_evaluated`; a partial sample must never masquerade as
 * complete stock.
 */
export interface PlayerGenerationExceptionalStockSnapshotObservation {
  readonly observationId: string;
  readonly worldId: string;
  readonly seasonIndex: number;
  /** Deterministic national target allocated for this world-season. */
  readonly targetYoungStoredCeilingSixCount: number;
  readonly players: readonly PlayerGenerationExceptionalStockPlayerObservation[];
}

/** Population and placement counts for one complete world-season snapshot. */
export interface PlayerGenerationExceptionalStockSnapshotSummary {
  readonly observationId: string;
  readonly worldId: string;
  readonly seasonIndex: number;
  readonly targetYoungStoredCeilingSixCount: number;
  readonly activePlayerObservationCount: number;
  readonly youngStoredCeilingSixCount: number;
  readonly youngPublicUpperSixCount: number;
  readonly firstDivisionCount: number;
  readonly outsideFirstDivisionCount: number;
  readonly firstDivisionOutsideStrongClubCount: number;
  readonly placementCounts: Readonly<Record<ClubCategory | "unattached", number>>;
  readonly distinctAssociatedClubCount: number;
  readonly clubUniquenessViolationCount: number;
  readonly populationCounts: Readonly<Record<PlayerGenerationPopulation, number>>;
  readonly youngStoredCeilingSixPlayerIds: readonly string[];
}

/** Lifecycle moment at which the generation policy owns stock placement. */
export type PlayerGenerationExceptionalStockEntryKind =
  | "opening_allocation"
  | "stock_arrival";

/**
 * One opening allocation or later arrival cohort with introduced violations.
 *
 * Current snapshot placement remains descriptive. These deltas isolate only
 * the extra category or club-concentration violation created when new stock
 * enters, so an ordinary later transfer cannot be blamed on generation.
 */
export interface PlayerGenerationExceptionalStockEntrySummary {
  readonly worldId: string;
  readonly seasonIndex: number;
  readonly entryKind: PlayerGenerationExceptionalStockEntryKind;
  readonly retainedPlayerObservationCount: number;
  readonly entryPlayerObservationCount: number;
  readonly entryPlayerIds: readonly string[];
  readonly placementCounts: Readonly<Record<ClubCategory | "unattached", number>>;
  readonly outsideFirstDivisionCount: number;
  readonly firstDivisionOutsideStrongClubCount: number;
  readonly introducedCategoryPlacementViolationCount: number;
  readonly introducedClubUniquenessViolationCount: number;
}

/** One adjacent-season stock transition used to audit top-ups and inflation. */
export interface PlayerGenerationExceptionalStockTransitionSummary {
  readonly worldId: string;
  readonly fromSeasonIndex: number;
  readonly toSeasonIndex: number;
  readonly openingCount: number;
  readonly retainedCount: number;
  readonly departureCount: number;
  readonly arrivalCount: number;
  readonly closingCount: number;
  readonly requiredReplacementCount: number;
  readonly completedReplacementCount: number;
  readonly missingReplacementCount: number;
  readonly permittedArrivalCount: number;
  readonly inflationArrivalCount: number;
}

/** Non-vacuous stock, placement, uniqueness, replacement, and inflation facts. */
export interface PlayerGenerationExceptionalStockSummary {
  readonly observationCount: number;
  readonly evaluationStatus: "evaluated" | "not_evaluated";
  readonly activePlayerObservationCount: number;
  readonly youngStoredCeilingSixObservationCount: number;
  readonly youngPublicUpperSixObservationCount: number;
  readonly transitionObservationCount: number;
  readonly requiredReplacementObservationCount: number;
  readonly completedReplacementCount: number;
  readonly missingReplacementCount: number;
  readonly inflationArrivalCount: number;
  readonly stockEntryObservationCount: number;
  readonly stockEntryPlayerObservationCount: number;
  readonly stockEntryCategoryPlacementViolationCount: number;
  readonly stockEntryClubUniquenessViolationCount: number;
  readonly snapshots: readonly PlayerGenerationExceptionalStockSnapshotSummary[];
  readonly transitions: readonly PlayerGenerationExceptionalStockTransitionSummary[];
  readonly stockEntries: readonly PlayerGenerationExceptionalStockEntrySummary[];
}

/** Stable type-7 distribution in integer minor units. */
export interface PlayerGenerationMoneyDistribution {
  readonly observationCount: number;
  readonly p50MinorUnits: number;
  readonly p90MinorUnits: number;
  readonly p99MinorUnits: number;
  readonly maximumMinorUnits: number;
}

/** Stable type-7 distribution over half-star values, expressed in half-stars. */
export interface PlayerGenerationRatingDistribution {
  readonly observationCount: number;
  readonly minimum: PlayerStarRating | null;
  readonly p50: PlayerStarRating | null;
  readonly p90: PlayerStarRating | null;
  readonly maximum: PlayerStarRating | null;
}

/** Stable type-7 distribution over non-negative scalar diagnostic values. */
export interface PlayerGenerationNumberDistribution {
  readonly observationCount: number;
  readonly minimum: number | null;
  readonly p50: number | null;
  readonly p90: number | null;
  readonly maximum: number | null;
}

/** Age/value/range joint distribution for one exceptional-rating slice. */
export interface PlayerGenerationExceptionalSlice {
  readonly observationCount: number;
  readonly minimumAge: number | null;
  readonly maximumAge: number | null;
  readonly meanAgeHundredths: number | null;
  readonly currentRatingDistribution: PlayerGenerationRatingDistribution;
  readonly p50RatingDistribution: PlayerGenerationRatingDistribution;
  readonly upperRatingDistribution: PlayerGenerationRatingDistribution;
  readonly valueDistribution: PlayerGenerationMoneyDistribution;
  readonly askingPriceDistribution: PlayerGenerationMoneyDistribution;
  readonly archetypeCounts: Readonly<Record<string, number>>;
}

/** One exact age/role public-potential range slice. */
export interface PlayerGenerationPotentialRangeSlice {
  readonly age: number;
  readonly roleGroup: PlayerGenerationRoleGroup;
  readonly observationCount: number;
  readonly currentRatingDistribution: PlayerGenerationRatingDistribution;
  readonly p50RatingDistribution: PlayerGenerationRatingDistribution;
  readonly upperRatingDistribution: PlayerGenerationRatingDistribution;
  readonly storedCeilingRatingDistribution: PlayerGenerationRatingDistribution;
  readonly widthDistribution: PlayerGenerationNumberDistribution;
}

/** Four rating facts that must share one explicit diagnostic denominator. */
export interface PlayerGenerationRatingProfileSummary {
  readonly observationCount: number;
  readonly currentRatingDistribution: PlayerGenerationRatingDistribution;
  /** Public median outcome; this is intentionally distinct from the ceiling. */
  readonly publicP50RatingDistribution: PlayerGenerationRatingDistribution;
  /** Public high-upside estimate; this is intentionally distinct from the ceiling. */
  readonly publicUpperRatingDistribution: PlayerGenerationRatingDistribution;
  /** Hidden hard cap used only by generation, development, and diagnostics. */
  readonly storedCeilingRatingDistribution: PlayerGenerationRatingDistribution;
}

/** Exact age-17 denominator for the pre-80A visible-upside finding. */
export interface PlayerGenerationPublicUpsideSummary {
  readonly age: 17;
  readonly observationCount: number;
  readonly atLeastOneFullStarCount: number;
  readonly atLeastOneFullStarShareBasisPoints: number | null;
  readonly ratingProfile: PlayerGenerationRatingProfileSummary;
}

/** Category share of active senior age-15-to-20 players with meaningful stored upside. */
export interface PlayerGenerationYoungProspectShare {
  readonly category: ClubCategory;
  readonly minimumAge: 15;
  readonly maximumAge: 20;
  readonly minimumStoredCeilingRating: 3.5;
  /** All supplied senior players in the age/category slice; this is the share denominator. */
  readonly observationCount: number;
  readonly matchingObservationCount: number;
  readonly shareBasisPoints: number | null;
  readonly ratingProfile: PlayerGenerationRatingProfileSummary;
}

/** Forced allocation counts compared with effective initial generated ratings. */
export interface PlayerGenerationAllocationSummary {
  readonly observationCount: number;
  readonly allocatedEstablishedCurrentSixCount: number;
  readonly effectiveEstablishedCurrentSixCount: number;
  readonly allocatedYoungStoredCeilingSixCount: number;
  readonly effectiveYoungStoredCeilingSixCount: number;
  readonly lowerDivisionYoungStoredCeilingSixCount: number;
  readonly allocatedEstablishedCurrentSixMissingEffectiveCount: number;
  readonly unallocatedEffectiveEstablishedCurrentSixCount: number;
  readonly allocatedYoungStoredCeilingSixMissingEffectiveCount: number;
  readonly unallocatedEffectiveYoungStoredCeilingSixCount: number;
}

/** Exact public-value hard-cap and rendered-label collision counts. */
export interface PlayerGenerationCapSummary {
  readonly observationCount: number;
  readonly eligibleObservationCount: number;
  readonly exactHardCapCount: number;
  readonly eligibleExactHardCapCount: number;
  readonly ineligibleExactHardCapCount: number;
  readonly ineligibleRenderedAsHardCapCount: number;
}

/** Public-value equality grouped by a named owner/employment transition. */
export interface PlayerGenerationIntrinsicValueInvarianceSummary {
  readonly observationCount: number;
  readonly mismatchCount: number;
  readonly observationCounts: Readonly<Record<PlayerGenerationValueTransition, number>>;
  readonly mismatchCounts: Readonly<Record<PlayerGenerationValueTransition, number>>;
}

/** Positive-value and exact-zero-fee facts for completed free-agent moves. */
export interface PlayerGenerationFreeAgentSigningSummary {
  readonly observationCount: number;
  readonly nonPositivePublicValueCount: number;
  readonly nonZeroTransferFeeCount: number;
}

/** Equal-public-input AI outcomes grouped by the live decision surface. */
export interface PlayerGenerationAiInformationParitySummary {
  readonly observationCount: number;
  readonly violationCount: number;
  readonly observationCounts: Readonly<Record<PlayerGenerationAiDecisionKind, number>>;
  readonly violationCounts: Readonly<Record<PlayerGenerationAiDecisionKind, number>>;
}

/** Stable type-7 ratio distribution expressed as basis points. */
export interface PlayerGenerationRatioDistribution {
  readonly observationCount: number;
  readonly p50BasisPoints: number;
  readonly p90BasisPoints: number;
  readonly p99BasisPoints: number;
  readonly maximumBasisPoints: number;
}

/** Negotiation ratios and independent seller/counter outcome counts. */
export interface PlayerGenerationNegotiationSummary {
  readonly observationCount: number;
  readonly offeredAskingRatioDistribution: PlayerGenerationRatioDistribution;
  readonly counterAskingRatioDistribution: PlayerGenerationRatioDistribution;
  readonly agreedAskingRatioDistribution: PlayerGenerationRatioDistribution;
  readonly completedAskingRatioDistribution: PlayerGenerationRatioDistribution;
  readonly exactAskingOfferedEqualityCount: number;
  readonly exactAskingOfferedEqualityShareBasisPoints: number | null;
  readonly exactAskingCompletedEqualityCount: number;
  readonly exactAskingCompletedEqualityShareBasisPoints: number | null;
  readonly completedAfterCounterCount: number;
  readonly sellerOutcomeCounts: Readonly<Record<PlayerGenerationSellerOutcome, number>>;
  readonly counterOutcomeCounts: Readonly<Record<PlayerGenerationCounterOutcome, number>>;
  readonly evaluationStatus: "evaluated" | "not_evaluated";
}

/** Named fact retained with a failing gate for direct reproduction. */
export interface PlayerGenerationGateExample {
  readonly observationId: string;
  readonly playerId: string;
  readonly playerName: string;
  readonly age: number;
  readonly seasonStartYear: number;
  readonly division: ClubCategory | "free_agent";
  readonly currentRating?: PlayerStarRating;
  readonly storedCeilingRating?: PlayerStarRating;
  readonly p50Rating?: PlayerStarRating;
  readonly upperRating?: PlayerStarRating;
  readonly publicValueMinorUnits?: number;
  readonly askingPriceMinorUnits?: number;
}

/** One machine-readable non-vacuous diagnostic gate. */
export interface PlayerGenerationEconomyGate {
  readonly key: string;
  readonly status: PlayerGenerationGateStatus;
  readonly observationCount: number;
  readonly violationCount: number;
  readonly threshold: string;
  readonly examples: readonly PlayerGenerationGateExample[];
  /**
   * Additive numerator and frozen band evaluated over the supplied cohort.
   * One world supplies evidence but does not independently hard-fail a
   * cohort-level calibration band.
   */
  readonly cohortShareEvidence?: Readonly<{
    readonly matchingObservationCount: number;
    readonly minimumBasisPoints: number;
    readonly maximumBasisPoints: number;
  }>;
  /**
   * Additive evidence whose minimum is enforced by the cohort aggregator.
   * World-local status remains based on this gate's own denominator and
   * violations, so an otherwise valid world never fails for cohort sparsity.
   */
  readonly cohortMinimumEvidence?: Readonly<{
    readonly evidenceObservationCount: number;
    readonly minimumObservationCount: number;
  }>;
}

/** Complete descriptive report for the supplied exceptional-player sample. */
export interface PlayerGenerationEconomyAudit {
  readonly observationCount: number;
  readonly percentileMethod: "Hyndman-Fan type 7 linear interpolation, rounded to nearest integer";
  /** Whole-sample current/P50/upper/stored profile with one common denominator. */
  readonly ratingProfile: PlayerGenerationRatingProfileSummary;
  readonly ageSeventeenPublicUpside: PlayerGenerationPublicUpsideSummary;
  /** Fixed-category rows remain present even when a caller supplies no denominator. */
  readonly youngStoredCeilingProspectShares: readonly PlayerGenerationYoungProspectShare[];
  readonly currentSix: PlayerGenerationExceptionalSlice;
  /** Opening players selected by the national established-champion allocator. */
  readonly initialEstablishedCurrentSix: PlayerGenerationExceptionalSlice;
  /** Opening age-15-to-20 players selected by the national upside allocator. */
  readonly initialYoungStoredCeilingSix: PlayerGenerationExceptionalSlice;
  /** Players whose hidden generated potential ceiling is six stars. */
  readonly storedCeilingSix: PlayerGenerationExceptionalSlice;
  /** Players whose age-aware public P90 projection currently reaches six stars. */
  readonly publicUpperSix: PlayerGenerationExceptionalSlice;
  readonly publicPotentialRanges: readonly PlayerGenerationPotentialRangeSlice[];
  readonly allocation: PlayerGenerationAllocationSummary;
  readonly cap: PlayerGenerationCapSummary;
  readonly intrinsicValueInvariance: PlayerGenerationIntrinsicValueInvarianceSummary;
  readonly freeAgentSignings: PlayerGenerationFreeAgentSigningSummary;
  readonly aiInformationParity: PlayerGenerationAiInformationParitySummary;
  readonly negotiations: PlayerGenerationNegotiationSummary;
  readonly annualIntake: PlayerGenerationAnnualIntakeSummary;
  /** Complete-snapshot diagnostics for the national young ceiling-six stock. */
  readonly youngExceptionalStock: PlayerGenerationExceptionalStockSummary;
  readonly suppliedNegotiationAggregates: readonly SuppliedNegotiationAggregate[];
  readonly gates: readonly PlayerGenerationEconomyGate[];
}

/** Inputs for the pure exceptional-player and negotiation audit. */
export interface CreatePlayerGenerationEconomyAuditInput {
  readonly observations: readonly PlayerGenerationEconomyObservation[];
  readonly negotiationObservations?: readonly PlayerGenerationNegotiationObservation[];
  readonly hardCapMinorUnits: number;
  readonly initialRarityConstraints: PlayerGenerationInitialRarityConstraints;
  readonly suppliedNegotiationAggregates?: readonly SuppliedNegotiationAggregate[];
  readonly annualIntakeObservations?: readonly PlayerGenerationAnnualIntakeObservation[];
  readonly exceptionalStockSnapshots?: readonly PlayerGenerationExceptionalStockSnapshotObservation[];
  readonly intrinsicValueInvarianceObservations?: readonly PlayerGenerationIntrinsicValueInvarianceObservation[];
  readonly freeAgentSigningObservations?: readonly PlayerGenerationFreeAgentSigningObservation[];
  readonly aiInformationParityObservations?: readonly PlayerGenerationAiInformationParityObservation[];
}

/**
 * Creates a deterministic, mutation-free audit over caller-supplied facts.
 *
 * Every binding diagnostic has its own observation count. Required empty
 * populations are therefore reported as `not_evaluated`, never as an implicit
 * pass derived from zero-initialized maxima.
 */
export function createPlayerGenerationEconomyAudit(
  input: CreatePlayerGenerationEconomyAuditInput,
): PlayerGenerationEconomyAudit {
  validateInput(input);
  const observations = [...input.observations].sort((left, right) =>
    left.observationId.localeCompare(right.observationId)
  );
  const negotiationObservations = [...(input.negotiationObservations ?? [])]
    .sort((left, right) => left.negotiationId.localeCompare(right.negotiationId));
  const currentSix = observations.filter(({ currentRating }) => currentRating === 6);
  const storedCeilingSix = observations.filter(
    ({ storedPotentialCeilingRating }) => storedPotentialCeilingRating === 6,
  );
  const publicUpperSix = observations.filter(
    ({ publicPotentialUpperRating }) => publicPotentialUpperRating === 6,
  );
  const initialEstablishedCurrentSix = observations.filter(
    ({ allocation }) =>
      allocation?.establishedCurrentSixAllocated === true,
  );
  const initialYoungStoredCeilingSix = observations.filter(
    ({ allocation }) =>
      allocation?.youngStoredCeilingSixAllocated === true,
  );
  const allocation = allocationSummary(observations);
  const cap = capSummary(observations, input.hardCapMinorUnits);
  const intrinsicValueInvariance = intrinsicValueInvarianceSummary(
    input.intrinsicValueInvarianceObservations ?? [],
  );
  const freeAgentSignings = freeAgentSigningSummary(
    input.freeAgentSigningObservations ?? [],
  );
  const aiInformationParity = aiInformationParitySummary(
    input.aiInformationParityObservations ?? [],
  );
  const negotiations = negotiationSummary(negotiationObservations);
  const annualIntake = createPlayerGenerationAnnualIntakeSummary(
    input.annualIntakeObservations ?? [],
  );
  const youngExceptionalStock = exceptionalStockSummary(
    input.exceptionalStockSnapshots ?? [],
  );
  const youngProspectShares = youngStoredCeilingProspectShares(observations);

  return {
    observationCount: observations.length,
    percentileMethod: "Hyndman-Fan type 7 linear interpolation, rounded to nearest integer",
    ratingProfile: ratingProfileSummary(observations),
    ageSeventeenPublicUpside: publicUpsideSummaryAtAgeSeventeen(observations),
    youngStoredCeilingProspectShares: youngProspectShares,
    currentSix: exceptionalSlice(currentSix),
    initialEstablishedCurrentSix: exceptionalSlice(
      initialEstablishedCurrentSix,
    ),
    initialYoungStoredCeilingSix: exceptionalSlice(
      initialYoungStoredCeilingSix,
    ),
    storedCeilingSix: exceptionalSlice(storedCeilingSix),
    publicUpperSix: exceptionalSlice(publicUpperSix),
    publicPotentialRanges: potentialRangeSlices(observations),
    allocation,
    cap,
    intrinsicValueInvariance,
    freeAgentSignings,
    aiInformationParity,
    negotiations,
    annualIntake,
    youngExceptionalStock,
    suppliedNegotiationAggregates: (input.suppliedNegotiationAggregates ?? []).map(
      (aggregate) => ({
        ...aggregate,
        askingPriceDistribution: { ...aggregate.askingPriceDistribution },
        completedFeeDistribution: { ...aggregate.completedFeeDistribution },
      }),
    ),
    gates: createGates({
      observations,
      storedCeilingSix,
      initialEstablishedCurrentSix,
      initialYoungStoredCeilingSix,
      allocation,
      cap,
      intrinsicValueInvariance,
      freeAgentSignings,
      aiInformationParity,
      negotiations,
      annualIntake,
      youngExceptionalStock,
      youngProspectShares,
      constraints: input.initialRarityConstraints,
      hardCapMinorUnits: input.hardCapMinorUnits,
    }),
  };
}

/**
 * Summarizes the allocation-to-active funnel for canonical annual intakes.
 *
 * The caller supplies facts from the production composition root, keeping this
 * diagnostic independent from content generation and career orchestration.
 */
export function createPlayerGenerationAnnualIntakeSummary(
  observations: readonly PlayerGenerationAnnualIntakeObservation[],
): PlayerGenerationAnnualIntakeSummary {
  validateAnnualIntakeObservations(observations);
  const perSeasonAccepted = observations.map((observation) => {
    const accepted = new Set(observation.acceptedStoredCeilingSixPlayerIds);
    return observation.generatedStoredCeilingSixPlayerIds.filter((id) =>
      accepted.has(id)
    ).length;
  });
  return {
    observationCount: observations.length,
    evaluationStatus: observations.length === 0 ? "not_evaluated" : "evaluated",
    allocatedStoredCeilingSixCount: observations.reduce(
      (sum, observation) =>
        sum + observation.allocatedStoredCeilingSixPlayerIds.length,
      0,
    ),
    generatedStoredCeilingSixCount: observations.reduce(
      (sum, observation) =>
        sum + observation.generatedStoredCeilingSixPlayerIds.length,
      0,
    ),
    acceptedStoredCeilingSixCount: perSeasonAccepted.reduce(
      (sum, count) => sum + count,
      0,
    ),
    activeStoredCeilingSixCount: observations.reduce(
      (sum, observation) =>
        sum + observation.activeStoredCeilingSixPlayerIds.length,
      0,
    ),
    allocatedStoredCeilingSixMissingGeneratedCount: observations.reduce(
      (sum, observation) => {
        const generated = new Set(
          observation.generatedStoredCeilingSixPlayerIds,
        );
        return sum + observation.allocatedStoredCeilingSixPlayerIds.filter(
          (id) => !generated.has(id),
        ).length;
      },
      0,
    ),
    generatedStoredCeilingSixMissingAcceptedCount: observations.reduce(
      (sum, observation) => {
        const accepted = new Set(
          observation.acceptedStoredCeilingSixPlayerIds,
        );
        return sum + observation.generatedStoredCeilingSixPlayerIds.filter(
          (id) => !accepted.has(id),
        ).length;
      },
      0,
    ),
    maximumAcceptedStoredCeilingSixPerSeason: Math.max(
      0,
      ...perSeasonAccepted,
    ),
  };
}

function exceptionalStockSummary(
  observations: readonly PlayerGenerationExceptionalStockSnapshotObservation[],
): PlayerGenerationExceptionalStockSummary {
  const orderedObservations = [...observations]
    .sort((left, right) =>
      left.worldId.localeCompare(right.worldId)
      || left.seasonIndex - right.seasonIndex
      || left.observationId.localeCompare(right.observationId)
    );
  const snapshots = orderedObservations.map(exceptionalStockSnapshotSummary);
  const transitions = exceptionalStockTransitions(snapshots);
  const stockEntries = exceptionalStockEntrySummaries(orderedObservations);

  return {
    observationCount: snapshots.length,
    evaluationStatus: snapshots.length === 0 ? "not_evaluated" : "evaluated",
    activePlayerObservationCount: snapshots.reduce(
      (sum, snapshot) => sum + snapshot.activePlayerObservationCount,
      0,
    ),
    youngStoredCeilingSixObservationCount: snapshots.reduce(
      (sum, snapshot) => sum + snapshot.youngStoredCeilingSixCount,
      0,
    ),
    youngPublicUpperSixObservationCount: snapshots.reduce(
      (sum, snapshot) => sum + snapshot.youngPublicUpperSixCount,
      0,
    ),
    transitionObservationCount: transitions.length,
    requiredReplacementObservationCount: transitions.filter(
      ({ requiredReplacementCount }) => requiredReplacementCount > 0,
    ).length,
    completedReplacementCount: transitions.reduce(
      (sum, transition) => sum + transition.completedReplacementCount,
      0,
    ),
    missingReplacementCount: transitions.reduce(
      (sum, transition) => sum + transition.missingReplacementCount,
      0,
    ),
    inflationArrivalCount: transitions.reduce(
      (sum, transition) => sum + transition.inflationArrivalCount,
      0,
    ),
    stockEntryObservationCount: stockEntries.length,
    stockEntryPlayerObservationCount: stockEntries.reduce(
      (sum, entry) => sum + entry.entryPlayerObservationCount,
      0,
    ),
    stockEntryCategoryPlacementViolationCount: stockEntries.reduce(
      (sum, entry) =>
        sum + entry.introducedCategoryPlacementViolationCount,
      0,
    ),
    stockEntryClubUniquenessViolationCount: stockEntries.reduce(
      (sum, entry) => sum + entry.introducedClubUniquenessViolationCount,
      0,
    ),
    snapshots,
    transitions,
    stockEntries,
  };
}

function exceptionalStockSnapshotSummary(
  observation: PlayerGenerationExceptionalStockSnapshotObservation,
): PlayerGenerationExceptionalStockSnapshotSummary {
  const youngStoredCeilingSix = observation.players.filter(
    isYoungStoredCeilingSix,
  );
  const youngPublicUpperSix = observation.players.filter(
    (player) => isYoungExceptionalAge(player.age)
      && player.publicPotentialUpperRating === 6,
  );
  let firstDivisionCount = 0;
  let outsideFirstDivisionCount = 0;
  let firstDivisionOutsideStrongClubCount = 0;
  for (const player of youngStoredCeilingSix) {
    if (
      player.clubAssociation.kind === "club"
      && player.clubAssociation.category === "first_division"
    ) {
      firstDivisionCount += 1;
      if (!isStrongFirstDivisionTier(player.clubAssociation.competitiveTier)) {
        firstDivisionOutsideStrongClubCount += 1;
      }
    } else {
      outsideFirstDivisionCount += 1;
    }
  }

  return {
    observationId: observation.observationId,
    worldId: observation.worldId,
    seasonIndex: observation.seasonIndex,
    targetYoungStoredCeilingSixCount:
      observation.targetYoungStoredCeilingSixCount,
    activePlayerObservationCount: observation.players.length,
    youngStoredCeilingSixCount: youngStoredCeilingSix.length,
    youngPublicUpperSixCount: youngPublicUpperSix.length,
    firstDivisionCount,
    outsideFirstDivisionCount,
    firstDivisionOutsideStrongClubCount,
    placementCounts: exceptionalStockPlacementCounts(youngStoredCeilingSix),
    distinctAssociatedClubCount:
      exceptionalStockAssociatedClubCounts(youngStoredCeilingSix).size,
    clubUniquenessViolationCount:
      exceptionalStockClubUniquenessViolationCount(youngStoredCeilingSix),
    populationCounts: populationCounts(youngStoredCeilingSix),
    youngStoredCeilingSixPlayerIds: youngStoredCeilingSix
      .map(({ playerId }) => playerId)
      .sort(),
  };
}

/** Derives binding placement evidence only at opening allocation and arrival. */
function exceptionalStockEntrySummaries(
  observations: readonly PlayerGenerationExceptionalStockSnapshotObservation[],
): readonly PlayerGenerationExceptionalStockEntrySummary[] {
  const previousPlayersByWorld = new Map<
    string,
    readonly PlayerGenerationExceptionalStockPlayerObservation[]
  >();
  const entries: PlayerGenerationExceptionalStockEntrySummary[] = [];

  for (const observation of observations) {
    const currentPlayers = observation.players.filter(isYoungStoredCeilingSix);
    const previousPlayers = previousPlayersByWorld.get(observation.worldId);
    const previousPlayerIds = new Set(
      previousPlayers?.map(({ playerId }) => playerId) ?? [],
    );
    const retainedPlayers = previousPlayers === undefined
      ? []
      : currentPlayers.filter(({ playerId }) => previousPlayerIds.has(playerId));
    const entryPlayers = previousPlayers === undefined
      ? currentPlayers
      : currentPlayers.filter(({ playerId }) => !previousPlayerIds.has(playerId));

    if (previousPlayers === undefined || entryPlayers.length > 0) {
      const retainedPlacementViolationCount =
        exceptionalStockCategoryPlacementViolationCount(retainedPlayers);
      const currentPlacementViolationCount =
        exceptionalStockCategoryPlacementViolationCount(currentPlayers);
      const retainedClubUniquenessViolationCount =
        exceptionalStockClubUniquenessViolationCount(retainedPlayers);
      const currentClubUniquenessViolationCount =
        exceptionalStockClubUniquenessViolationCount(currentPlayers);

      entries.push({
        worldId: observation.worldId,
        seasonIndex: observation.seasonIndex,
        entryKind: previousPlayers === undefined
          ? "opening_allocation"
          : "stock_arrival",
        retainedPlayerObservationCount: retainedPlayers.length,
        entryPlayerObservationCount: entryPlayers.length,
        entryPlayerIds: entryPlayers.map(({ playerId }) => playerId).sort(),
        placementCounts: exceptionalStockPlacementCounts(entryPlayers),
        outsideFirstDivisionCount: entryPlayers.filter(
          ({ clubAssociation }) =>
            clubAssociation.kind !== "club"
            || clubAssociation.category !== "first_division",
        ).length,
        firstDivisionOutsideStrongClubCount: entryPlayers.filter(
          ({ clubAssociation }) =>
            clubAssociation.kind === "club"
            && clubAssociation.category === "first_division"
            && !isStrongFirstDivisionTier(clubAssociation.competitiveTier),
        ).length,
        introducedCategoryPlacementViolationCount: Math.max(
          0,
          currentPlacementViolationCount - retainedPlacementViolationCount,
        ),
        introducedClubUniquenessViolationCount: Math.max(
          0,
          currentClubUniquenessViolationCount
            - retainedClubUniquenessViolationCount,
        ),
      });
    }

    previousPlayersByWorld.set(observation.worldId, currentPlayers);
  }

  return entries;
}

function exceptionalStockTransitions(
  snapshots: readonly PlayerGenerationExceptionalStockSnapshotSummary[],
): readonly PlayerGenerationExceptionalStockTransitionSummary[] {
  const byWorld = new Map<string, PlayerGenerationExceptionalStockSnapshotSummary[]>();
  for (const snapshot of snapshots) {
    const values = byWorld.get(snapshot.worldId) ?? [];
    values.push(snapshot);
    byWorld.set(snapshot.worldId, values);
  }

  return [...byWorld.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .flatMap(([worldId, values]) => {
      const ordered = [...values].sort((left, right) =>
        left.seasonIndex - right.seasonIndex
        || left.observationId.localeCompare(right.observationId)
      );
      return ordered.slice(1).flatMap((closing, index) => {
        const opening = ordered[index];
        if (
          opening === undefined
          || closing.seasonIndex !== opening.seasonIndex + 1
        ) {
          return [];
        }
        return [exceptionalStockTransitionSummary(worldId, opening, closing)];
      });
    });
}

function exceptionalStockTransitionSummary(
  worldId: string,
  opening: PlayerGenerationExceptionalStockSnapshotSummary,
  closing: PlayerGenerationExceptionalStockSnapshotSummary,
): PlayerGenerationExceptionalStockTransitionSummary {
  const openingPlayerIds = new Set(opening.youngStoredCeilingSixPlayerIds);
  const closingPlayerIds = new Set(closing.youngStoredCeilingSixPlayerIds);
  const retainedCount = opening.youngStoredCeilingSixPlayerIds.filter(
    (playerId) => closingPlayerIds.has(playerId),
  ).length;
  const departureCount = opening.youngStoredCeilingSixCount - retainedCount;
  const arrivalCount = closing.youngStoredCeilingSixPlayerIds.filter(
    (playerId) => !openingPlayerIds.has(playerId),
  ).length;
  const requiredReplacementCount = Math.max(
    0,
    closing.targetYoungStoredCeilingSixCount - retainedCount,
  );
  const completedReplacementCount = Math.min(
    requiredReplacementCount,
    arrivalCount,
  );
  const permittedArrivalCount = Math.max(
    0,
    closing.targetYoungStoredCeilingSixCount - retainedCount,
  );

  return {
    worldId,
    fromSeasonIndex: opening.seasonIndex,
    toSeasonIndex: closing.seasonIndex,
    openingCount: opening.youngStoredCeilingSixCount,
    retainedCount,
    departureCount,
    arrivalCount,
    closingCount: closing.youngStoredCeilingSixCount,
    requiredReplacementCount,
    completedReplacementCount,
    missingReplacementCount:
      requiredReplacementCount - completedReplacementCount,
    permittedArrivalCount,
    inflationArrivalCount: Math.max(0, arrivalCount - permittedArrivalCount),
  };
}

function isYoungStoredCeilingSix(
  player: PlayerGenerationExceptionalStockPlayerObservation,
): boolean {
  return isYoungExceptionalAge(player.age)
    && player.storedPotentialCeilingRating === 6;
}

function isYoungExceptionalAge(age: number): boolean {
  return age >= YOUNG_EXCEPTIONAL_AGE_MINIMUM
    && age <= YOUNG_EXCEPTIONAL_AGE_MAXIMUM;
}

function populationCounts(
  players: readonly PlayerGenerationExceptionalStockPlayerObservation[],
): Readonly<Record<PlayerGenerationPopulation, number>> {
  return Object.fromEntries(
    playerGenerationPopulations.map((population) => [
      population,
      players.filter((player) => player.population === population).length,
    ]),
  ) as Record<PlayerGenerationPopulation, number>;
}

function exceptionalStockPlacementCounts(
  players: readonly PlayerGenerationExceptionalStockPlayerObservation[],
): Readonly<Record<ClubCategory | "unattached", number>> {
  const counts: Record<ClubCategory | "unattached", number> = {
    first_division: 0,
    second_division: 0,
    third_division: 0,
    unattached: 0,
  };
  for (const player of players) {
    const placement = player.clubAssociation.kind === "club"
      ? player.clubAssociation.category
      : "unattached";
    counts[placement] += 1;
  }
  return counts;
}

/** Returns the binding category-placement excess for one complete stock set. */
function exceptionalStockCategoryPlacementViolationCount(
  players: readonly PlayerGenerationExceptionalStockPlayerObservation[],
): number {
  let outsideFirstDivisionCount = 0;
  let firstDivisionOutsideStrongClubCount = 0;

  for (const player of players) {
    if (
      player.clubAssociation.kind === "club"
      && player.clubAssociation.category === "first_division"
    ) {
      if (!isStrongFirstDivisionTier(player.clubAssociation.competitiveTier)) {
        firstDivisionOutsideStrongClubCount += 1;
      }
    } else {
      outsideFirstDivisionCount += 1;
    }
  }

  return Math.max(
    0,
    outsideFirstDivisionCount
      - YOUNG_EXCEPTIONAL_OUTSIDE_FIRST_DIVISION_MAXIMUM,
  ) + firstDivisionOutsideStrongClubCount;
}

/** Counts extra stock members associated with an already occupied club. */
function exceptionalStockClubUniquenessViolationCount(
  players: readonly PlayerGenerationExceptionalStockPlayerObservation[],
): number {
  return [...exceptionalStockAssociatedClubCounts(players).values()].reduce(
    (sum, count) => sum + Math.max(0, count - 1),
    0,
  );
}

/** Groups stock by its current descriptive club association. */
function exceptionalStockAssociatedClubCounts(
  players: readonly PlayerGenerationExceptionalStockPlayerObservation[],
): ReadonlyMap<string, number> {
  const counts = new Map<string, number>();
  for (const player of players) {
    if (player.clubAssociation.kind !== "club") continue;
    counts.set(
      player.clubAssociation.clubId,
      (counts.get(player.clubAssociation.clubId) ?? 0) + 1,
    );
  }
  return counts;
}

function exceptionalSlice(
  observations: readonly PlayerGenerationEconomyObservation[],
): PlayerGenerationExceptionalSlice {
  const ages = observations.map(({ age }) => age);
  return {
    observationCount: observations.length,
    minimumAge: ages.length === 0 ? null : Math.min(...ages),
    maximumAge: ages.length === 0 ? null : Math.max(...ages),
    meanAgeHundredths: ages.length === 0
      ? null
      : Math.round((ages.reduce((sum, age) => sum + age, 0) * 100) / ages.length),
    currentRatingDistribution: ratingDistribution(
      observations.map(({ currentRating }) => currentRating),
    ),
    p50RatingDistribution: ratingDistribution(
      observations.map(({ publicPotentialP50Rating }) =>
        publicPotentialP50Rating
      ),
    ),
    upperRatingDistribution: ratingDistribution(
      observations.map(({ publicPotentialUpperRating }) =>
        publicPotentialUpperRating
      ),
    ),
    valueDistribution: moneyDistribution(
      observations.map(({ publicValueMinorUnits }) => publicValueMinorUnits),
    ),
    askingPriceDistribution: moneyDistribution(
      observations.flatMap(({ askingPriceMinorUnits }) =>
        askingPriceMinorUnits === undefined ? [] : [askingPriceMinorUnits]
      ),
    ),
    archetypeCounts: sortedCounts(observations.map(({ archetype }) => archetype)),
  };
}

function potentialRangeSlices(
  observations: readonly PlayerGenerationEconomyObservation[],
): readonly PlayerGenerationPotentialRangeSlice[] {
  const groups = new Map<string, PlayerGenerationEconomyObservation[]>();
  for (const observation of observations) {
    const key = `${observation.age}|${observation.roleGroup}`;
    const values = groups.get(key) ?? [];
    values.push(observation);
    groups.set(key, values);
  }
  return [...groups.values()]
    .map((values) => ({
      age: values[0]!.age,
      roleGroup: values[0]!.roleGroup,
      observationCount: values.length,
      currentRatingDistribution: ratingDistribution(
        values.map(({ currentRating }) => currentRating),
      ),
      p50RatingDistribution: ratingDistribution(
        values.map(({ publicPotentialP50Rating }) =>
          publicPotentialP50Rating
        ),
      ),
      upperRatingDistribution: ratingDistribution(
        values.map(({ publicPotentialUpperRating }) =>
          publicPotentialUpperRating
        ),
      ),
      storedCeilingRatingDistribution: ratingDistribution(
        values.map(({ storedPotentialCeilingRating }) =>
          storedPotentialCeilingRating
        ),
      ),
      widthDistribution: numberDistribution(
        values.map((value) =>
          value.publicPotentialUpperRating
            - value.currentRating
        ),
      ),
    }))
    .sort((left, right) =>
      left.age - right.age || left.roleGroup.localeCompare(right.roleGroup)
    );
}

function ratingProfileSummary(
  observations: readonly PlayerGenerationEconomyObservation[],
): PlayerGenerationRatingProfileSummary {
  return {
    observationCount: observations.length,
    currentRatingDistribution: ratingDistribution(
      observations.map(({ currentRating }) => currentRating),
    ),
    publicP50RatingDistribution: ratingDistribution(
      observations.map(({ publicPotentialP50Rating }) =>
        publicPotentialP50Rating
      ),
    ),
    publicUpperRatingDistribution: ratingDistribution(
      observations.map(({ publicPotentialUpperRating }) =>
        publicPotentialUpperRating
      ),
    ),
    storedCeilingRatingDistribution: ratingDistribution(
      observations.map(({ storedPotentialCeilingRating }) =>
        storedPotentialCeilingRating
      ),
    ),
  };
}

function publicUpsideSummaryAtAgeSeventeen(
  observations: readonly PlayerGenerationEconomyObservation[],
): PlayerGenerationPublicUpsideSummary {
  const ageSeventeen = observations.filter(({ age }) => age === 17);
  const ageSeventeenSeniors = ageSeventeen.filter(
    ({ population }) => population === "senior",
  );
  const atLeastOneFullStarCount = ageSeventeenSeniors.filter(
    ({ currentRating, publicPotentialUpperRating }) =>
      publicPotentialUpperRating - currentRating >= 1,
  ).length;
  return {
    age: 17,
    observationCount: ageSeventeenSeniors.length,
    atLeastOneFullStarCount,
    atLeastOneFullStarShareBasisPoints: shareBasisPoints(
      atLeastOneFullStarCount,
      ageSeventeenSeniors.length,
    ),
    ratingProfile: ratingProfileSummary(ageSeventeenSeniors),
  };
}

function youngStoredCeilingProspectShares(
  observations: readonly PlayerGenerationEconomyObservation[],
): readonly PlayerGenerationYoungProspectShare[] {
  return clubCategories.map((category) => {
    const categoryPlayers = observations.filter((observation) =>
      observation.population === "senior"
      && observation.division === category
      && observation.age >= 15
      && observation.age <= 20
    );
    const matchingObservationCount = categoryPlayers.filter(
      ({ storedPotentialCeilingRating }) =>
        storedPotentialCeilingRating >= 3.5,
    ).length;
    return {
      category,
      minimumAge: 15,
      maximumAge: 20,
      minimumStoredCeilingRating: 3.5,
      observationCount: categoryPlayers.length,
      matchingObservationCount,
      shareBasisPoints: shareBasisPoints(
        matchingObservationCount,
        categoryPlayers.length,
      ),
      ratingProfile: ratingProfileSummary(categoryPlayers),
    };
  });
}

function allocationSummary(
  observations: readonly PlayerGenerationEconomyObservation[],
): PlayerGenerationAllocationSummary {
  const allocated = observations.filter(
    (observation) => observation.allocation !== undefined,
  );
  return {
    observationCount: allocated.length,
    allocatedEstablishedCurrentSixCount: allocated.filter(
      ({ allocation }) =>
        allocation?.establishedCurrentSixAllocated === true,
    ).length,
    effectiveEstablishedCurrentSixCount: allocated.filter(
      ({ currentRating }) => currentRating === 6,
    ).length,
    allocatedYoungStoredCeilingSixCount: allocated.filter(
      ({ allocation }) =>
        allocation?.youngStoredCeilingSixAllocated === true,
    ).length,
    effectiveYoungStoredCeilingSixCount: allocated.filter(
      (observation) => isYoungStoredCeilingSixObservation(observation),
    ).length,
    lowerDivisionYoungStoredCeilingSixCount: allocated.filter(
      (observation) =>
        observation.division !== "first_division"
        && isYoungStoredCeilingSixObservation(observation),
    ).length,
    allocatedEstablishedCurrentSixMissingEffectiveCount: allocated.filter(
      ({ allocation, currentRating }) =>
        allocation?.establishedCurrentSixAllocated === true
        && currentRating !== 6,
    ).length,
    unallocatedEffectiveEstablishedCurrentSixCount: allocated.filter(
      ({ allocation, currentRating }) =>
        allocation?.establishedCurrentSixAllocated === false
        && currentRating === 6,
    ).length,
    allocatedYoungStoredCeilingSixMissingEffectiveCount: allocated.filter(
      (observation) =>
        observation.allocation?.youngStoredCeilingSixAllocated === true
        && !isYoungStoredCeilingSixObservation(observation),
    ).length,
    unallocatedEffectiveYoungStoredCeilingSixCount: allocated.filter(
      (observation) =>
        observation.allocation?.youngStoredCeilingSixAllocated === false
        && isYoungStoredCeilingSixObservation(observation),
    ).length,
  };
}

function isYoungStoredCeilingSixObservation(
  observation: PlayerGenerationEconomyObservation,
): boolean {
  return isYoungExceptionalAge(observation.age)
    && observation.storedPotentialCeilingRating === 6;
}

function capSummary(
  observations: readonly PlayerGenerationEconomyObservation[],
  hardCapMinorUnits: number,
): PlayerGenerationCapSummary {
  return {
    observationCount: observations.length,
    eligibleObservationCount: observations.filter(
      ({ hardCapEligible }) => hardCapEligible,
    ).length,
    exactHardCapCount: observations.filter(
      ({ publicValueMinorUnits }) => publicValueMinorUnits === hardCapMinorUnits,
    ).length,
    eligibleExactHardCapCount: observations.filter(
      ({ publicValueMinorUnits, hardCapEligible }) =>
        hardCapEligible && publicValueMinorUnits === hardCapMinorUnits,
    ).length,
    ineligibleExactHardCapCount: observations.filter(
      ({ publicValueMinorUnits, hardCapEligible }) =>
        !hardCapEligible && publicValueMinorUnits === hardCapMinorUnits,
    ).length,
    ineligibleRenderedAsHardCapCount: observations.filter(
      ({ publicValueMinorUnits, hardCapEligible }) =>
        !hardCapEligible
        && Math.round(publicValueMinorUnits / 100)
          === Math.round(hardCapMinorUnits / 100),
    ).length,
  };
}

function intrinsicValueInvarianceSummary(
  observations: readonly PlayerGenerationIntrinsicValueInvarianceObservation[],
): PlayerGenerationIntrinsicValueInvarianceSummary {
  const mismatches = observations.filter(
    ({
      beforeContextFingerprint,
      afterContextFingerprint,
      beforePublicValueMinorUnits,
      afterPublicValueMinorUnits,
    }) =>
      beforeContextFingerprint === afterContextFingerprint
      || beforePublicValueMinorUnits !== afterPublicValueMinorUnits,
  );
  return {
    observationCount: observations.length,
    mismatchCount: mismatches.length,
    observationCounts: countsByOrderedValue(
      observations,
      valueTransitionOrder,
      ({ transition }) => transition,
    ),
    mismatchCounts: countsByOrderedValue(
      mismatches,
      valueTransitionOrder,
      ({ transition }) => transition,
    ),
  };
}

function freeAgentSigningSummary(
  observations: readonly PlayerGenerationFreeAgentSigningObservation[],
): PlayerGenerationFreeAgentSigningSummary {
  return {
    observationCount: observations.length,
    nonPositivePublicValueCount: observations.filter(
      ({ publicValueMinorUnits }) => publicValueMinorUnits <= 0,
    ).length,
    nonZeroTransferFeeCount: observations.filter(
      ({ transferFeeMinorUnits }) => transferFeeMinorUnits !== 0,
    ).length,
  };
}

function aiInformationParitySummary(
  observations: readonly PlayerGenerationAiInformationParityObservation[],
): PlayerGenerationAiInformationParitySummary {
  const violations = observations.filter(isAiInformationParityViolation);
  return {
    observationCount: observations.length,
    violationCount: violations.length,
    observationCounts: countsByOrderedValue(
      observations,
      aiDecisionKindOrder,
      ({ decisionKind }) => decisionKind,
    ),
    violationCounts: countsByOrderedValue(
      violations,
      aiDecisionKindOrder,
      ({ decisionKind }) => decisionKind,
    ),
  };
}

function isAiInformationParityViolation(
  observation: PlayerGenerationAiInformationParityObservation,
): boolean {
  return observation.leftStoredCeilingRating
      === observation.rightStoredCeilingRating
    || observation.leftPublicAssessmentFingerprint
      !== observation.rightPublicAssessmentFingerprint
    || observation.leftDecisionFingerprint
      !== observation.rightDecisionFingerprint;
}

function negotiationSummary(
  observations: readonly PlayerGenerationNegotiationObservation[],
): PlayerGenerationNegotiationSummary {
  const offeredRatios = observations.flatMap((observation) =>
    ratio(observation.offeredFeeMinorUnits, observation.askingPriceMinorUnits)
  );
  const counterRatios = observations.flatMap((observation) =>
    ratio(observation.counterFeeMinorUnits, observation.askingPriceMinorUnits)
  );
  const agreedRatios = observations.flatMap((observation) =>
    ratio(observation.agreedFeeMinorUnits, observation.askingPriceMinorUnits)
  );
  const completedRatios = observations.flatMap((observation) =>
    ratio(observation.completedFeeMinorUnits, observation.askingPriceMinorUnits)
  );
  const completed = observations.filter(
    ({ completedFeeMinorUnits }) => completedFeeMinorUnits !== undefined,
  );
  return {
    observationCount: observations.length,
    offeredAskingRatioDistribution: ratioDistribution(offeredRatios),
    counterAskingRatioDistribution: ratioDistribution(counterRatios),
    agreedAskingRatioDistribution: ratioDistribution(agreedRatios),
    completedAskingRatioDistribution: ratioDistribution(completedRatios),
    exactAskingOfferedEqualityCount: observations.filter(
      ({ askingPriceMinorUnits, offeredFeeMinorUnits }) =>
        askingPriceMinorUnits === offeredFeeMinorUnits,
    ).length,
    exactAskingOfferedEqualityShareBasisPoints: equalityShareBasisPoints(
      observations,
      (observation) => observation.offeredFeeMinorUnits,
    ),
    exactAskingCompletedEqualityCount: completed.filter(
      ({ askingPriceMinorUnits, completedFeeMinorUnits }) =>
        askingPriceMinorUnits === completedFeeMinorUnits,
    ).length,
    exactAskingCompletedEqualityShareBasisPoints: equalityShareBasisPoints(
      completed,
      (observation) => observation.completedFeeMinorUnits,
    ),
    completedAfterCounterCount: completed.filter(
      ({ counterFeeMinorUnits }) => counterFeeMinorUnits !== undefined,
    ).length,
    sellerOutcomeCounts: outcomeCounts(observations, sellerOutcomeOrder, "sellerOutcome"),
    counterOutcomeCounts: outcomeCounts(observations, counterOutcomeOrder, "counterOutcome"),
    evaluationStatus: observations.length === 0 ? "not_evaluated" : "evaluated",
  };
}

interface CreateGatesInput {
  readonly observations: readonly PlayerGenerationEconomyObservation[];
  readonly storedCeilingSix: readonly PlayerGenerationEconomyObservation[];
  readonly initialEstablishedCurrentSix: readonly PlayerGenerationEconomyObservation[];
  readonly initialYoungStoredCeilingSix: readonly PlayerGenerationEconomyObservation[];
  readonly allocation: PlayerGenerationAllocationSummary;
  readonly cap: PlayerGenerationCapSummary;
  readonly intrinsicValueInvariance: PlayerGenerationIntrinsicValueInvarianceSummary;
  readonly freeAgentSignings: PlayerGenerationFreeAgentSigningSummary;
  readonly aiInformationParity: PlayerGenerationAiInformationParitySummary;
  readonly negotiations: PlayerGenerationNegotiationSummary;
  readonly annualIntake: PlayerGenerationAnnualIntakeSummary;
  readonly youngExceptionalStock: PlayerGenerationExceptionalStockSummary;
  readonly youngProspectShares: readonly PlayerGenerationYoungProspectShare[];
  readonly constraints: PlayerGenerationInitialRarityConstraints;
  readonly hardCapMinorUnits: number;
}

function createGates(input: CreateGatesInput): readonly PlayerGenerationEconomyGate[] {
  const rangeViolations = input.observations.filter((observation) =>
    !(
      observation.currentRating <= observation.publicPotentialP50Rating
      && observation.publicPotentialP50Rating
        <= observation.publicPotentialUpperRating
      && observation.publicPotentialUpperRating
        <= observation.storedPotentialCeilingRating
    )
  );
  const establishedCurrentSixViolations = input.initialEstablishedCurrentSix.filter(
    (observation) =>
      observation.currentRating !== 6
      || observation.age <= 20
      || observation.population !== "senior"
      || observation.division !== "first_division"
      || observation.squadPlacement !== "first_team"
      || observation.clubCompetitiveTier === null
      || !isStrongFirstDivisionTier(observation.clubCompetitiveTier),
  );
  const youngStoredCeilingSixViolations = input.initialYoungStoredCeilingSix.filter(
    (observation) =>
      !isYoungExceptionalAge(observation.age)
      || observation.storedPotentialCeilingRating !== 6
      || observation.currentRating === 6
      || observation.allocation?.youngStoredCeilingSixCurrentRatingGuardrail
        === undefined
      || observation.currentRating
        < observation.allocation.youngStoredCeilingSixCurrentRatingGuardrail.minimumRating
      || observation.currentRating
        > observation.allocation.youngStoredCeilingSixCurrentRatingGuardrail.maximumRating,
  );
  const storedCeilingSixProspects = input.storedCeilingSix.filter(
    ({ currentRating }) => currentRating < 6,
  );
  const invalidProspectValues = storedCeilingSixProspects.filter(
    ({ publicValueMinorUnits }) => publicValueMinorUnits <= 0,
  );
  const invalidStoredCeilingSixValues = input.storedCeilingSix.filter(
    ({ publicValueMinorUnits }) => publicValueMinorUnits <= 0,
  );
  const ageSeventeenSeniorObservationCount = input.observations.filter(
    ({ age, population }) => age === 17 && population === "senior",
  ).length;
  const allocationViolations = allocationViolationCountByWorld(
    input.observations,
    input.constraints,
  );
  const intakeViolations =
    input.annualIntake.allocatedStoredCeilingSixMissingGeneratedCount
    + input.annualIntake.generatedStoredCeilingSixMissingAcceptedCount;
  const sellerOutcomeViolations = (
    input.negotiations.sellerOutcomeCounts.accepted === 0 ? 1 : 0
  ) + (
    input.negotiations.sellerOutcomeCounts.rejected === 0 ? 1 : 0
  ) + (
    input.negotiations.sellerOutcomeCounts.countered === 0 ? 1 : 0
  );
  const counterObservationCount =
    input.negotiations.counterAskingRatioDistribution.observationCount;
  const counterViolations =
    input.negotiations.completedAfterCounterCount === 0 ? 1 : 0;
  const stockSizeViolations = input.youngExceptionalStock.snapshots.filter(
    ({ targetYoungStoredCeilingSixCount, youngStoredCeilingSixCount }) =>
      youngStoredCeilingSixCount !== targetYoungStoredCeilingSixCount,
  ).length;
  const youngProspectShareGates = input.youngProspectShares.map((share) => {
    const band = YOUNG_STORED_CEILING_PROSPECT_SHARE_BANDS[share.category];
    return cohortShareEvidenceGate(
      `young_stored_ceiling_prospect_share_${share.category}`,
      share.observationCount,
      share.matchingObservationCount,
      band,
      `active senior age 15..20 with stored ceiling >=3.5: ${band.minimumBasisPoints}..${band.maximumBasisPoints} basis points`,
    );
  });
  const intrinsicValueGates = valueTransitionOrder.map((transition) =>
    gate(
      `intrinsic_public_value_invariance_${transition}`,
      input.intrinsicValueInvariance.observationCounts[transition],
      input.intrinsicValueInvariance.mismatchCounts[transition],
      "same canonical player assessment and intrinsic facts produce identical public value",
      [],
    )
  );
  const aiInformationParityGates = aiDecisionKindOrder.map((decisionKind) =>
    gate(
      `ai_information_parity_${decisionKind}`,
      input.aiInformationParity.observationCounts[decisionKind],
      input.aiInformationParity.violationCounts[decisionKind],
      "different stored ceilings with identical public assessments produce identical live AI decisions",
      [],
    )
  );

  return [
    gate(
      "initial_established_current_six_stock",
      input.initialEstablishedCurrentSix.length,
      establishedCurrentSixViolations.length,
      "allocated opening champions are current six, age >20, senior first-team players at strong First Division clubs",
      establishedCurrentSixViolations.map(playerExample),
    ),
    gate(
      "initial_young_stored_ceiling_six_stock",
      input.initialYoungStoredCeilingSix.length,
      youngStoredCeilingSixViolations.length,
      "allocated opening prospects are age 15..20, have stored ceiling six, and remain inside the content-supplied age/division current-rating guardrail",
      youngStoredCeilingSixViolations.map(playerExample),
    ),
    gate(
      "stored_ceiling_six_joint_profile",
      input.storedCeilingSix.length,
      invalidStoredCeilingSixValues.length,
      "every stored-ceiling-six observation has positive public value; asking is measured separately",
      invalidStoredCeilingSixValues.map(playerExample),
    ),
    gate(
      "public_potential_range_ordering",
      input.observations.length,
      rangeViolations.length,
      "current <= P50 <= public upper <= stored ceiling",
      rangeViolations.map(playerExample),
    ),
    gate(
      "age_seventeen_senior_public_upside_observations",
      ageSeventeenSeniorObservationCount,
      0,
      "descriptive age-17 senior public-upside share; positive denominator required, no frozen quota",
      [],
    ),
    gate(
      "initial_exceptional_allocation",
      input.allocation.observationCount,
      allocationViolations,
      [
        `established current-six ${input.constraints.establishedCurrentSixMinimum}..${input.constraints.establishedCurrentSixMaximum}`,
        `young stored-ceiling-six ${input.constraints.youngStoredCeilingSixMinimum}..${input.constraints.youngStoredCeilingSixMaximum}`,
        `lower-tier young stored-ceiling-six <=${input.constraints.lowerDivisionYoungStoredCeilingSixMaximum}`,
        "allocated/effective identity",
      ].join("; "),
      allocationExamples(input.observations, input.constraints),
    ),
    gate(
      "annual_exceptional_intake",
      input.annualIntake.observationCount,
      intakeViolations,
      "allocated -> generated -> accepted; active-stock bounds and replacement are checked from complete snapshots",
      [],
    ),
    ...youngProspectShareGates,
    gate(
      "young_stored_ceiling_six_active_stock",
      input.youngExceptionalStock.observationCount,
      stockSizeViolations,
      `complete world-season snapshots; stored ceiling count equals each snapshot's deterministic target (${YOUNG_EXCEPTIONAL_STOCK_MINIMUM} or ${YOUNG_EXCEPTIONAL_STOCK_MAXIMUM})`,
      [],
    ),
    gate(
      "young_stored_ceiling_six_stock_arrival_category_placement",
      input.youngExceptionalStock.stockEntryPlayerObservationCount,
      input.youngExceptionalStock.stockEntryCategoryPlacementViolationCount,
      `opening allocation and new stock arrivals; outside First Division <=${YOUNG_EXCEPTIONAL_OUTSIDE_FIRST_DIVISION_MAXIMUM}; every introduced First Division placement is title_contender or playoff_contender`,
      [],
    ),
    gate(
      "young_stored_ceiling_six_stock_arrival_club_uniqueness",
      input.youngExceptionalStock.stockEntryPlayerObservationCount,
      input.youngExceptionalStock.stockEntryClubUniquenessViolationCount,
      "opening allocation and new stock arrivals introduce <=1 associated player per club; later market concentration remains descriptive",
      [],
    ),
    gate(
      "young_stored_ceiling_six_vacancy_replacement",
      input.youngExceptionalStock.transitionObservationCount,
      input.youngExceptionalStock.missingReplacementCount,
      "adjacent-season vacancies are replenished to the closing snapshot's deterministic target",
      [],
      {
        evidenceObservationCount:
          input.youngExceptionalStock.completedReplacementCount,
        minimumObservationCount: 1,
      },
    ),
    gate(
      "young_stored_ceiling_six_no_inflation",
      input.youngExceptionalStock.transitionObservationCount,
      input.youngExceptionalStock.inflationArrivalCount,
      "adjacent-season arrivals never raise active stock above the closing snapshot's deterministic target",
      [],
    ),
    hardCapCohortGate(input),
    ...intrinsicValueGates,
    gate(
      "free_agent_zero_fee_and_value",
      input.freeAgentSignings.observationCount,
      input.freeAgentSignings.nonPositivePublicValueCount
        + input.freeAgentSignings.nonZeroTransferFeeCount,
      "every completed canonical free-agent movement has positive public value and exact zero transfer fee; value invariance is owned by intrinsic_public_value_invariance_free_agent",
      [],
    ),
    ...aiInformationParityGates,
    gate(
      "stored_ceiling_six_prospect_value_observations",
      storedCeilingSixProspects.length,
      invalidProspectValues.length,
      "required positive-valued stored-ceiling-six prospect population",
      invalidProspectValues.map(playerExample),
    ),
    gate(
      "negotiation_offer_spread",
      input.negotiations.offeredAskingRatioDistribution.observationCount,
      input.negotiations.observationCount > 0
          && input.negotiations.exactAskingOfferedEqualityCount
            === input.negotiations.observationCount
        ? 1
        : 0,
      "required offers; not structural 100% asking/offer equality",
      [],
    ),
    gate(
      "negotiation_seller_outcomes",
      input.negotiations.observationCount,
      sellerOutcomeViolations,
      "required accepted, rejected, and countered observations",
      [],
    ),
    gate(
      "negotiation_counter_path",
      counterObservationCount,
      counterViolations,
      "required counter observations and at least one completed-after-counter path",
      [],
    ),
  ];
}

function gate(
  key: string,
  observationCount: number,
  violationCount: number,
  threshold: string,
  examples: readonly PlayerGenerationGateExample[],
  cohortMinimumEvidence?: Readonly<{
    readonly evidenceObservationCount: number;
    readonly minimumObservationCount: number;
  }>,
): PlayerGenerationEconomyGate {
  return {
    key,
    status: observationCount === 0
      ? "not_evaluated"
      : violationCount > 0 ? "fail" : "pass",
    observationCount,
    violationCount,
    threshold,
    examples: examples.slice(0, 5),
    ...(cohortMinimumEvidence === undefined
      ? {}
      : { cohortMinimumEvidence }),
  };
}

/**
 * Records additive per-world share evidence for a band owned by the cohort
 * aggregator. Positive world samples pass provisionally; only the supplied
 * cohort's combined numerator and denominator evaluate the frozen band.
 */
function cohortShareEvidenceGate(
  key: string,
  observationCount: number,
  matchingObservationCount: number,
  band: Readonly<{ minimumBasisPoints: number; maximumBasisPoints: number }>,
  threshold: string,
): PlayerGenerationEconomyGate {
  return {
    key,
    status: observationCount === 0 ? "not_evaluated" : "pass",
    observationCount,
    violationCount: 0,
    threshold,
    examples: [],
    cohortShareEvidence: {
      matchingObservationCount,
      minimumBasisPoints: band.minimumBasisPoints,
      maximumBasisPoints: band.maximumBasisPoints,
    },
  };
}

/**
 * Records hard-cap eligibility violations per world and rarity over the cohort.
 *
 * The cap is one global model rule. A world with one eligible player and one
 * exact hit is therefore evidence, not a standalone rarity failure; only the
 * aggregated eligible numerator and denominator can prove that exact hits are
 * not routine. Ineligible exact or rendered collisions remain immediate
 * structural violations in the world that produced them.
 */
function hardCapCohortGate(
  input: CreateGatesInput,
): PlayerGenerationEconomyGate {
  const structuralViolationCount =
    input.cap.ineligibleExactHardCapCount
    + input.cap.ineligibleRenderedAsHardCapCount;
  const examples = input.observations.filter(
    ({ hardCapEligible, publicValueMinorUnits }) =>
      !hardCapEligible
      && (
        publicValueMinorUnits === input.hardCapMinorUnits
        || Math.round(publicValueMinorUnits / 100)
          === Math.round(input.hardCapMinorUnits / 100)
      ),
  ).map(playerExample);

  return {
    key: "hard_cap_eligibility_and_display",
    status: structuralViolationCount > 0
      ? "fail"
      : input.cap.eligibleObservationCount === 0 ? "not_evaluated" : "pass",
    observationCount: input.cap.eligibleObservationCount,
    violationCount: structuralViolationCount,
    threshold:
      "positive cohort eligible population; zero ineligible exact/display collisions; eligible exact cap share <10000 basis points",
    examples: examples.slice(0, 5),
    cohortShareEvidence: {
      matchingObservationCount: input.cap.eligibleExactHardCapCount,
      minimumBasisPoints: 0,
      maximumBasisPoints: 9_999,
    },
  };
}

function allocationViolationCountByWorld(
  observations: readonly PlayerGenerationEconomyObservation[],
  constraints: PlayerGenerationInitialRarityConstraints,
): number {
  const byWorld = new Map<string, PlayerGenerationEconomyObservation[]>();
  for (const observation of observations) {
    if (observation.allocation === undefined) continue;
    const values = byWorld.get(observation.worldId) ?? [];
    values.push(observation);
    byWorld.set(observation.worldId, values);
  }
  return [...byWorld.values()].reduce((total, values) => {
    const summary = allocationSummary(values);
    return total
      + [
        summary.effectiveEstablishedCurrentSixCount
          < constraints.establishedCurrentSixMinimum,
        summary.effectiveEstablishedCurrentSixCount
          > constraints.establishedCurrentSixMaximum,
        summary.effectiveYoungStoredCeilingSixCount
          < constraints.youngStoredCeilingSixMinimum,
        summary.effectiveYoungStoredCeilingSixCount
          > constraints.youngStoredCeilingSixMaximum,
        summary.lowerDivisionYoungStoredCeilingSixCount
          > constraints.lowerDivisionYoungStoredCeilingSixMaximum,
      ].filter(Boolean).length
      + summary.allocatedEstablishedCurrentSixMissingEffectiveCount
      + summary.unallocatedEffectiveEstablishedCurrentSixCount
      + summary.allocatedYoungStoredCeilingSixMissingEffectiveCount
      + summary.unallocatedEffectiveYoungStoredCeilingSixCount;
  }, 0);
}

function allocationExamples(
  observations: readonly PlayerGenerationEconomyObservation[],
  constraints: PlayerGenerationInitialRarityConstraints,
): readonly PlayerGenerationGateExample[] {
  return observations.filter(({
    allocation,
    currentRating,
    storedPotentialCeilingRating,
    age,
    division,
  }) =>
    allocation !== undefined
    && (
      allocation.establishedCurrentSixAllocated !== (currentRating === 6)
      || allocation.youngStoredCeilingSixAllocated
        !== (
          isYoungExceptionalAge(age)
          && storedPotentialCeilingRating === 6
        )
      || (
        division !== "first_division"
        && isYoungExceptionalAge(age)
        && storedPotentialCeilingRating === 6
        && constraints.lowerDivisionYoungStoredCeilingSixMaximum === 0
      )
    )
  ).map(playerExample);
}

function playerExample(
  observation: PlayerGenerationEconomyObservation,
): PlayerGenerationGateExample {
  return {
    observationId: observation.observationId,
    playerId: observation.playerId,
    playerName: observation.playerName,
    age: observation.age,
    seasonStartYear: observation.seasonStartYear,
    division: observation.division,
    currentRating: observation.currentRating,
    storedCeilingRating: observation.storedPotentialCeilingRating,
    p50Rating: observation.publicPotentialP50Rating,
    upperRating: observation.publicPotentialUpperRating,
    publicValueMinorUnits: observation.publicValueMinorUnits,
    ...(observation.askingPriceMinorUnits === undefined
      ? {}
      : { askingPriceMinorUnits: observation.askingPriceMinorUnits }),
  };
}

function outcomeCounts<
  T extends PlayerGenerationNegotiationObservation,
  K extends "sellerOutcome" | "counterOutcome",
>(
  observations: readonly T[],
  order: readonly T[K][],
  key: K,
): Readonly<Record<T[K], number>> {
  return Object.fromEntries(order.map((outcome) => [
    outcome,
    observations.filter((observation) => observation[key] === outcome).length,
  ])) as Record<T[K], number>;
}

function countsByOrderedValue<T, K extends string>(
  observations: readonly T[],
  order: readonly K[],
  select: (observation: T) => K,
): Readonly<Record<K, number>> {
  return Object.fromEntries(
    order.map((value) => [
      value,
      observations.filter((observation) => select(observation) === value).length,
    ]),
  ) as Record<K, number>;
}

function equalityShareBasisPoints(
  observations: readonly PlayerGenerationNegotiationObservation[],
  selectComparedValue: (
    observation: PlayerGenerationNegotiationObservation,
  ) => number | undefined,
): number | null {
  if (observations.length === 0) return null;
  const equalityCount = observations.filter(
    (observation) =>
      observation.askingPriceMinorUnits === selectComparedValue(observation),
  ).length;
  return Math.round(equalityCount * 10_000 / observations.length);
}

const sellerOutcomeOrder: readonly PlayerGenerationSellerOutcome[] = [
  "open",
  "accepted",
  "countered",
  "rejected",
  "expired",
  "withdrawn",
];

const counterOutcomeOrder: readonly PlayerGenerationCounterOutcome[] = [
  "not_observed",
  "open",
  "accepted",
  "rejected",
  "expired",
];

const valueTransitionOrder: readonly PlayerGenerationValueTransition[] = [
  "owner_category",
  "promotion_relegation",
  "transfer",
  "contract_expiry",
  "free_agent",
];

const aiDecisionKindOrder: readonly PlayerGenerationAiDecisionKind[] = [
  "target_ranking",
  "offer_selection",
  "willingness",
];

const playerGenerationPopulations: readonly PlayerGenerationPopulation[] = [
  "senior",
  "academy",
  "promotion_candidate",
  "free_agent",
  "loaned",
];

const YOUNG_EXCEPTIONAL_AGE_MINIMUM = 15;
const YOUNG_EXCEPTIONAL_AGE_MAXIMUM = 20;
const YOUNG_EXCEPTIONAL_STOCK_MINIMUM = 4;
const YOUNG_EXCEPTIONAL_STOCK_MAXIMUM = 5;
const YOUNG_EXCEPTIONAL_OUTSIDE_FIRST_DIVISION_MAXIMUM = 1;

/** Frozen Phase 80A senior prospect-share bands, expressed in basis points. */
const YOUNG_STORED_CEILING_PROSPECT_SHARE_BANDS: Readonly<Record<
  ClubCategory,
  Readonly<{ minimumBasisPoints: number; maximumBasisPoints: number }>
>> = {
  third_division: {
    minimumBasisPoints: 400,
    maximumBasisPoints: 800,
  },
  second_division: {
    minimumBasisPoints: 800,
    maximumBasisPoints: 1_500,
  },
  first_division: {
    minimumBasisPoints: 1_500,
    maximumBasisPoints: 2_500,
  },
};

function isStrongFirstDivisionTier(tier: ClubCompetitiveTier): boolean {
  return tier === "title_contender" || tier === "playoff_contender";
}

const clubCategories: readonly ClubCategory[] = [
  "first_division",
  "second_division",
  "third_division",
];

function shareBasisPoints(
  matchingObservationCount: number,
  observationCount: number,
): number | null {
  return observationCount === 0
    ? null
    : Math.round(matchingObservationCount * 10_000 / observationCount);
}

function ratio(
  numerator: number | undefined,
  denominator: number | undefined,
): readonly number[] {
  if (numerator === undefined || denominator === undefined || denominator === 0) {
    return [];
  }
  return [Math.round((numerator * 10_000) / denominator)];
}

function moneyDistribution(
  values: readonly number[],
): PlayerGenerationMoneyDistribution {
  const sorted = [...values].sort((left, right) => left - right);
  return {
    observationCount: sorted.length,
    p50MinorUnits: Math.round(percentileTypeSeven(sorted, 0.5)),
    p90MinorUnits: Math.round(percentileTypeSeven(sorted, 0.9)),
    p99MinorUnits: Math.round(percentileTypeSeven(sorted, 0.99)),
    maximumMinorUnits: sorted.at(-1) ?? 0,
  };
}

function ratingDistribution(
  values: readonly PlayerStarRating[],
): PlayerGenerationRatingDistribution {
  const sorted = [...values].sort((left, right) => left - right);
  return {
    observationCount: sorted.length,
    minimum: sorted[0] ?? null,
    p50: ratingPercentile(sorted, 0.5),
    p90: ratingPercentile(sorted, 0.9),
    maximum: sorted.at(-1) ?? null,
  };
}

function numberDistribution(
  values: readonly number[],
): PlayerGenerationNumberDistribution {
  const sorted = [...values].sort((left, right) => left - right);
  return {
    observationCount: sorted.length,
    minimum: sorted[0] ?? null,
    p50: sorted.length === 0 ? null : percentileTypeSeven(sorted, 0.5),
    p90: sorted.length === 0 ? null : percentileTypeSeven(sorted, 0.9),
    maximum: sorted.at(-1) ?? null,
  };
}

function ratingPercentile(
  sorted: readonly PlayerStarRating[],
  percentile: number,
): PlayerStarRating | null {
  if (sorted.length === 0) return null;
  const value = percentileTypeSeven(sorted, percentile);
  const halfStar = Math.round(value * 2) / 2;
  return PLAYER_STAR_RATINGS.includes(halfStar as PlayerStarRating)
    ? halfStar as PlayerStarRating
    : null;
}

function ratioDistribution(
  values: readonly number[],
): PlayerGenerationRatioDistribution {
  const sorted = [...values].sort((left, right) => left - right);
  return {
    observationCount: sorted.length,
    p50BasisPoints: Math.round(percentileTypeSeven(sorted, 0.5)),
    p90BasisPoints: Math.round(percentileTypeSeven(sorted, 0.9)),
    p99BasisPoints: Math.round(percentileTypeSeven(sorted, 0.99)),
    maximumBasisPoints: sorted.at(-1) ?? 0,
  };
}

function percentileTypeSeven(
  sorted: readonly number[],
  percentile: number,
): number {
  if (sorted.length === 0) return 0;
  const rank = (sorted.length - 1) * percentile;
  const lowerIndex = Math.floor(rank);
  const upperIndex = Math.ceil(rank);
  const lower = sorted[lowerIndex];
  const upper = sorted[upperIndex];
  if (lower === undefined || upper === undefined) {
    throw new Error("Exceptional-player percentile rank is outside the supplied sample");
  }
  return lower + ((upper - lower) * (rank - lowerIndex));
}

function sortedCounts(values: readonly string[]): Readonly<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const value of values) counts[value] = (counts[value] ?? 0) + 1;
  return Object.fromEntries(
    Object.entries(counts).sort(([left], [right]) => left.localeCompare(right)),
  );
}

function validateInput(input: CreatePlayerGenerationEconomyAuditInput): void {
  if (!Number.isSafeInteger(input.hardCapMinorUnits) || input.hardCapMinorUnits <= 0) {
    throw new Error("Exceptional-player audit requires a positive integer hard cap");
  }
  validateConstraints(input.initialRarityConstraints);
  const observationIds = new Set<string>();
  for (const observation of input.observations) {
    if (
      observation.observationId.length === 0
      || observation.worldId.length === 0
      || observation.playerId.length === 0
      || observation.playerName.length === 0
      || observationIds.has(observation.observationId)
      || !Number.isInteger(observation.age)
      || observation.age < 0
      || !Number.isSafeInteger(observation.seasonStartYear)
      || observation.seasonStartYear <= 0
      || !Number.isSafeInteger(observation.publicValueMinorUnits)
      || observation.publicValueMinorUnits < 0
      || !PLAYER_STAR_RATINGS.includes(observation.currentRating)
      || !PLAYER_STAR_RATINGS.includes(
        observation.storedPotentialCeilingRating,
      )
      || !PLAYER_STAR_RATINGS.includes(observation.publicPotentialP50Rating)
      || !PLAYER_STAR_RATINGS.includes(observation.publicPotentialUpperRating)
      || !isValidObservationClubContext(observation)
    ) {
      throw new Error("Exceptional-player audit received an invalid or duplicate observation");
    }
    observationIds.add(observation.observationId);
    const guardrail = observation.allocation
      ?.youngStoredCeilingSixCurrentRatingGuardrail;
    if (
      (
        observation.allocation?.youngStoredCeilingSixAllocated === true
        && (
          guardrail === undefined
          || !PLAYER_STAR_RATINGS.includes(guardrail.minimumRating)
          || !PLAYER_STAR_RATINGS.includes(guardrail.maximumRating)
          || guardrail.minimumRating > guardrail.maximumRating
        )
      )
      || (
        observation.allocation?.youngStoredCeilingSixAllocated === false
        && guardrail !== undefined
      )
    ) {
      throw new Error(
        "Exceptional-player audit requires one valid content-supplied young-prospect guardrail",
      );
    }
    if (
      observation.askingPriceMinorUnits !== undefined
      && (
        !Number.isSafeInteger(observation.askingPriceMinorUnits)
        || observation.askingPriceMinorUnits < 0
      )
    ) {
      throw new Error("Exceptional-player audit received invalid asking money");
    }
  }
  const negotiationIds = new Set<string>();
  for (const observation of input.negotiationObservations ?? []) {
    if (
      observation.negotiationId.length === 0
      || observation.playerId.length === 0
      || observation.playerName.length === 0
      || negotiationIds.has(observation.negotiationId)
      || !Number.isInteger(observation.age)
      || observation.age < 0
      || !Number.isSafeInteger(observation.seasonStartYear)
      || observation.seasonStartYear <= 0
    ) {
      throw new Error("Exceptional-player audit received an invalid negotiation observation");
    }
    negotiationIds.add(observation.negotiationId);
    for (const value of [
      observation.askingPriceMinorUnits,
      observation.offeredFeeMinorUnits,
      observation.counterFeeMinorUnits,
      observation.agreedFeeMinorUnits,
      observation.completedFeeMinorUnits,
    ]) {
      if (value !== undefined && (!Number.isSafeInteger(value) || value < 0)) {
        throw new Error("Exceptional-player audit received invalid negotiation money");
      }
    }
  }
  for (const aggregate of input.suppliedNegotiationAggregates ?? []) {
    if (
      aggregate.sourceLabel.length === 0
      || !Number.isSafeInteger(aggregate.offerCount)
      || !Number.isSafeInteger(aggregate.sellerCounterCount)
      || !Number.isSafeInteger(aggregate.permanentCompletionCount)
      || aggregate.offerCount < 0
      || aggregate.sellerCounterCount < 0
      || aggregate.permanentCompletionCount < 0
    ) {
      throw new Error("Exceptional-player audit received an invalid negotiation aggregate");
    }
  }
  validateIntrinsicValueInvarianceObservations(
    input.intrinsicValueInvarianceObservations ?? [],
  );
  validateFreeAgentSigningObservations(
    input.freeAgentSigningObservations ?? [],
  );
  validateAiInformationParityObservations(
    input.aiInformationParityObservations ?? [],
  );
  validateAnnualIntakeObservations(input.annualIntakeObservations ?? []);
  validateExceptionalStockSnapshots(input.exceptionalStockSnapshots ?? []);
}

function validateConstraints(
  constraints: PlayerGenerationInitialRarityConstraints,
): void {
  const values = Object.values(constraints);
  if (
    values.some((value) => !Number.isSafeInteger(value) || value < 0)
    || constraints.establishedCurrentSixMinimum
      > constraints.establishedCurrentSixMaximum
    || constraints.youngStoredCeilingSixMinimum
      > constraints.youngStoredCeilingSixMaximum
  ) {
    throw new Error("Exceptional-player audit requires valid initial rarity constraints");
  }
}

function isValidObservationClubContext(
  observation: PlayerGenerationEconomyObservation,
): boolean {
  const hasValidTier = observation.clubCompetitiveTier === null
    || CLUB_COMPETITIVE_TIERS.includes(observation.clubCompetitiveTier);
  if (!hasValidTier) return false;
  switch (observation.population) {
    case "free_agent":
      return observation.division === "free_agent"
      && observation.clubCompetitiveTier === null
      && observation.squadPlacement === "unattached";
    case "academy":
      return observation.division !== "free_agent"
        && observation.clubCompetitiveTier !== null
        && observation.squadPlacement === "academy";
    case "promotion_candidate":
      return observation.division !== "free_agent"
        && observation.clubCompetitiveTier !== null
        && observation.squadPlacement === "reserve";
    case "senior":
    case "loaned":
      return observation.division !== "free_agent"
        && observation.clubCompetitiveTier !== null
        && (
          observation.squadPlacement === "first_team"
          || observation.squadPlacement === "reserve"
        );
  }
}

function validateIntrinsicValueInvarianceObservations(
  observations: readonly PlayerGenerationIntrinsicValueInvarianceObservation[],
): void {
  const ids = new Set<string>();
  for (const observation of observations) {
    if (
      observation.observationId.length === 0
      || observation.playerId.length === 0
      || ids.has(observation.observationId)
      || observation.beforeContextFingerprint.length === 0
      || observation.afterContextFingerprint.length === 0
      || !isNonNegativeMoney(observation.beforePublicValueMinorUnits)
      || !isNonNegativeMoney(observation.afterPublicValueMinorUnits)
    ) {
      throw new Error(
        "Exceptional-player audit received an invalid intrinsic-value observation",
      );
    }
    ids.add(observation.observationId);
  }
}

function validateFreeAgentSigningObservations(
  observations: readonly PlayerGenerationFreeAgentSigningObservation[],
): void {
  const ids = new Set<string>();
  for (const observation of observations) {
    if (
      observation.observationId.length === 0
      || observation.playerId.length === 0
      || ids.has(observation.observationId)
      || observation.completedSigningFingerprint.length === 0
      || !isNonNegativeMoney(observation.publicValueMinorUnits)
      || !isNonNegativeMoney(observation.transferFeeMinorUnits)
    ) {
      throw new Error(
        "Exceptional-player audit received an invalid free-agent signing observation",
      );
    }
    ids.add(observation.observationId);
  }
}

function validateAiInformationParityObservations(
  observations: readonly PlayerGenerationAiInformationParityObservation[],
): void {
  const ids = new Set<string>();
  for (const observation of observations) {
    if (
      observation.observationId.length === 0
      || ids.has(observation.observationId)
      || !PLAYER_STAR_RATINGS.includes(observation.leftStoredCeilingRating)
      || !PLAYER_STAR_RATINGS.includes(observation.rightStoredCeilingRating)
      || observation.leftPublicAssessmentFingerprint.length === 0
      || observation.rightPublicAssessmentFingerprint.length === 0
      || observation.leftDecisionFingerprint.length === 0
      || observation.rightDecisionFingerprint.length === 0
    ) {
      throw new Error(
        "Exceptional-player audit received an invalid AI-information observation",
      );
    }
    ids.add(observation.observationId);
  }
}

function isNonNegativeMoney(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0;
}

function validateAnnualIntakeObservations(
  observations: readonly PlayerGenerationAnnualIntakeObservation[],
): void {
  const intakeSeasons = new Set<number>();
  for (const observation of observations) {
    if (
      !Number.isSafeInteger(observation.seasonIndex)
      || observation.seasonIndex < 0
      || intakeSeasons.has(observation.seasonIndex)
      || !allUnique(observation.allocatedStoredCeilingSixPlayerIds)
      || !allUnique(observation.generatedStoredCeilingSixPlayerIds)
      || !allUnique(observation.acceptedStoredCeilingSixPlayerIds)
      || !allUnique(observation.activeStoredCeilingSixPlayerIds)
    ) {
      throw new Error("Exceptional-player audit received an invalid annual intake observation");
    }
    intakeSeasons.add(observation.seasonIndex);
  }
}

function validateExceptionalStockSnapshots(
  observations: readonly PlayerGenerationExceptionalStockSnapshotObservation[],
): void {
  const observationIds = new Set<string>();
  const worldSeasonKeys = new Set<string>();
  const targetByWorld = new Map<string, number>();
  for (const observation of observations) {
    const worldSeasonKey = `${observation.worldId}|${observation.seasonIndex}`;
    const existingWorldTarget = targetByWorld.get(observation.worldId);
    if (
      observation.observationId.length === 0
      || observation.worldId.length === 0
      || observationIds.has(observation.observationId)
      || !Number.isSafeInteger(observation.seasonIndex)
      || observation.seasonIndex < 0
      || !Number.isSafeInteger(
        observation.targetYoungStoredCeilingSixCount,
      )
      || observation.targetYoungStoredCeilingSixCount
        < YOUNG_EXCEPTIONAL_STOCK_MINIMUM
      || observation.targetYoungStoredCeilingSixCount
        > YOUNG_EXCEPTIONAL_STOCK_MAXIMUM
      || (
        existingWorldTarget !== undefined
        && existingWorldTarget
          !== observation.targetYoungStoredCeilingSixCount
      )
      || worldSeasonKeys.has(worldSeasonKey)
    ) {
      throw new Error(
        "Exceptional-player audit received an invalid or duplicate stock snapshot",
      );
    }
    observationIds.add(observation.observationId);
    worldSeasonKeys.add(worldSeasonKey);
    targetByWorld.set(
      observation.worldId,
      observation.targetYoungStoredCeilingSixCount,
    );

    const playerIds = new Set<string>();
    for (const player of observation.players) {
      if (
        player.playerId.length === 0
        || playerIds.has(player.playerId)
        || !Number.isSafeInteger(player.age)
        || player.age < 0
        || !PLAYER_STAR_RATINGS.includes(player.storedPotentialCeilingRating)
        || !PLAYER_STAR_RATINGS.includes(player.publicPotentialUpperRating)
        || (
          player.clubAssociation.kind === "club"
          && player.clubAssociation.clubId.length === 0
        )
      ) {
        throw new Error(
          "Exceptional-player audit received an invalid or duplicate stock player",
        );
      }
      playerIds.add(player.playerId);
    }
  }
}

function allUnique(values: readonly string[]): boolean {
  return values.every((value) => value.length > 0)
    && new Set(values).size === values.length;
}
