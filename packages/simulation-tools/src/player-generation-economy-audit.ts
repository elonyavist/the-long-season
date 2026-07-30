import {
  PLAYER_STAR_RATINGS,
  type ClubCategory,
  type PlayerStarRating,
} from "@game/domain";

/** Squad population that produced one player-level diagnostic observation. */
export type PlayerGenerationPopulation = "senior" | "academy" | "free_agent";

/** Broad role family used to keep goalkeeper projection bands separate. */
export type PlayerGenerationRoleGroup = "outfield" | "goalkeeper";

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

/** Allocation labels emitted by the deterministic content generator. */
export interface PlayerExceptionalAllocationLabels {
  readonly currentSixAllocated: boolean;
  readonly potentialSixAllocated: boolean;
  readonly rarityKind?: string;
}

/**
 * One complete caller-supplied player/economy fact.
 *
 * The observation stores both the hidden generated ceiling and the public
 * lower/expected/upper projection. Keeping the two facts explicit prevents a
 * presentation change from silently redefining rarity or allocation counts.
 */
export interface PlayerGenerationEconomyObservation {
  readonly observationId: string;
  readonly worldId: string;
  readonly playerId: string;
  readonly playerName: string;
  readonly age: number;
  readonly seasonIndex: number;
  readonly division: ClubCategory | "free_agent";
  readonly population: PlayerGenerationPopulation;
  readonly roleGroup: PlayerGenerationRoleGroup;
  readonly currentRating: PlayerStarRating;
  readonly storedPotentialCeilingRating: PlayerStarRating;
  readonly publicPotentialLowerRating: PlayerStarRating;
  readonly publicPotentialExpectedRating: PlayerStarRating;
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
  readonly seasonIndex: number;
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
  readonly currentSixMinimum: number;
  readonly currentSixMaximum: number;
  readonly potentialSixMinimum: number;
  readonly potentialSixMaximum: number;
  readonly lowerDivisionPotentialSixMaximum: number;
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
  readonly allocatedPotentialSixPlayerIds: readonly string[];
  readonly generatedPotentialSixPlayerIds: readonly string[];
  readonly acceptedPlayerIds: readonly string[];
  readonly activePotentialSixPlayerIds: readonly string[];
}

/** Zero-safe annual intake funnel over supplied world-season observations. */
export interface PlayerGenerationAnnualIntakeSummary {
  readonly observationCount: number;
  readonly evaluationStatus: "evaluated" | "not_evaluated";
  readonly allocatedPotentialSixCount: number;
  readonly generatedPotentialSixCount: number;
  readonly acceptedPotentialSixCount: number;
  readonly activePotentialSixCount: number;
  readonly allocatedMissingGeneratedCount: number;
  readonly generatedMissingAcceptedCount: number;
  readonly maximumAcceptedPotentialSixPerSeason: number;
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
  readonly lowerRatingDistribution: PlayerGenerationRatingDistribution;
  readonly expectedRatingDistribution: PlayerGenerationRatingDistribution;
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
  readonly lowerRatingDistribution: PlayerGenerationRatingDistribution;
  readonly expectedRatingDistribution: PlayerGenerationRatingDistribution;
  readonly upperRatingDistribution: PlayerGenerationRatingDistribution;
  readonly widthDistribution: PlayerGenerationNumberDistribution;
}

/** Forced allocation counts compared with effective initial generated ratings. */
export interface PlayerGenerationAllocationSummary {
  readonly observationCount: number;
  readonly allocatedCurrentSixCount: number;
  readonly effectiveCurrentSixCount: number;
  readonly allocatedPotentialSixCount: number;
  readonly effectivePotentialSixCount: number;
  readonly lowerDivisionPotentialSixCount: number;
  readonly allocatedCurrentSixMissingEffectiveCount: number;
  readonly unallocatedEffectiveCurrentSixCount: number;
  readonly allocatedPotentialSixMissingEffectiveCount: number;
  readonly unallocatedEffectivePotentialSixCount: number;
}

/** Exact public-value hard-cap and rendered-label collision counts. */
export interface PlayerGenerationCapSummary {
  readonly observationCount: number;
  readonly exactHardCapCount: number;
  readonly eligibleExactHardCapCount: number;
  readonly ineligibleExactHardCapCount: number;
  readonly ineligibleRenderedAsHardCapCount: number;
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
  readonly seasonIndex: number;
  readonly division: ClubCategory | "free_agent";
  readonly currentRating?: PlayerStarRating;
  readonly storedCeilingRating?: PlayerStarRating;
  readonly lowerRating?: PlayerStarRating;
  readonly expectedRating?: PlayerStarRating;
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
}

/** Complete descriptive report for the supplied exceptional-player sample. */
export interface PlayerGenerationEconomyAudit {
  readonly observationCount: number;
  readonly percentileMethod: "Hyndman-Fan type 7 linear interpolation, rounded to nearest integer";
  readonly currentSix: PlayerGenerationExceptionalSlice;
  /** Players whose hidden generated potential ceiling is six stars. */
  readonly storedCeilingSix: PlayerGenerationExceptionalSlice;
  /** Players whose age-aware public P90 projection currently reaches six stars. */
  readonly publicUpperSix: PlayerGenerationExceptionalSlice;
  readonly publicPotentialRanges: readonly PlayerGenerationPotentialRangeSlice[];
  readonly allocation: PlayerGenerationAllocationSummary;
  readonly cap: PlayerGenerationCapSummary;
  readonly negotiations: PlayerGenerationNegotiationSummary;
  readonly annualIntake: PlayerGenerationAnnualIntakeSummary;
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
  const allocation = allocationSummary(observations);
  const cap = capSummary(observations, input.hardCapMinorUnits);
  const negotiations = negotiationSummary(negotiationObservations);
  const annualIntake = createPlayerGenerationAnnualIntakeSummary(
    input.annualIntakeObservations ?? [],
  );

  return {
    observationCount: observations.length,
    percentileMethod: "Hyndman-Fan type 7 linear interpolation, rounded to nearest integer",
    currentSix: exceptionalSlice(currentSix),
    storedCeilingSix: exceptionalSlice(storedCeilingSix),
    publicUpperSix: exceptionalSlice(publicUpperSix),
    publicPotentialRanges: potentialRangeSlices(observations),
    allocation,
    cap,
    negotiations,
    annualIntake,
    suppliedNegotiationAggregates: (input.suppliedNegotiationAggregates ?? []).map(
      (aggregate) => ({
        ...aggregate,
        askingPriceDistribution: { ...aggregate.askingPriceDistribution },
        completedFeeDistribution: { ...aggregate.completedFeeDistribution },
      }),
    ),
    gates: createGates({
      observations,
      currentSix,
      storedCeilingSix,
      allocation,
      cap,
      negotiations,
      annualIntake,
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
    const accepted = new Set(observation.acceptedPlayerIds);
    return observation.generatedPotentialSixPlayerIds.filter((id) =>
      accepted.has(id)
    ).length;
  });
  return {
    observationCount: observations.length,
    evaluationStatus: observations.length === 0 ? "not_evaluated" : "evaluated",
    allocatedPotentialSixCount: observations.reduce(
      (sum, observation) =>
        sum + observation.allocatedPotentialSixPlayerIds.length,
      0,
    ),
    generatedPotentialSixCount: observations.reduce(
      (sum, observation) =>
        sum + observation.generatedPotentialSixPlayerIds.length,
      0,
    ),
    acceptedPotentialSixCount: perSeasonAccepted.reduce(
      (sum, count) => sum + count,
      0,
    ),
    activePotentialSixCount: observations.reduce(
      (sum, observation) =>
        sum + observation.activePotentialSixPlayerIds.length,
      0,
    ),
    allocatedMissingGeneratedCount: observations.reduce(
      (sum, observation) => {
        const generated = new Set(observation.generatedPotentialSixPlayerIds);
        return sum + observation.allocatedPotentialSixPlayerIds.filter(
          (id) => !generated.has(id),
        ).length;
      },
      0,
    ),
    generatedMissingAcceptedCount: observations.reduce(
      (sum, observation) => {
        const accepted = new Set(observation.acceptedPlayerIds);
        return sum + observation.generatedPotentialSixPlayerIds.filter(
          (id) => !accepted.has(id),
        ).length;
      },
      0,
    ),
    maximumAcceptedPotentialSixPerSeason: Math.max(0, ...perSeasonAccepted),
  };
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
    lowerRatingDistribution: ratingDistribution(
      observations.map(({ publicPotentialLowerRating }) =>
        publicPotentialLowerRating
      ),
    ),
    expectedRatingDistribution: ratingDistribution(
      observations.map(({ publicPotentialExpectedRating }) =>
        publicPotentialExpectedRating
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
      lowerRatingDistribution: ratingDistribution(
        values.map(({ publicPotentialLowerRating }) =>
          publicPotentialLowerRating
        ),
      ),
      expectedRatingDistribution: ratingDistribution(
        values.map(({ publicPotentialExpectedRating }) =>
          publicPotentialExpectedRating
        ),
      ),
      upperRatingDistribution: ratingDistribution(
        values.map(({ publicPotentialUpperRating }) =>
          publicPotentialUpperRating
        ),
      ),
      widthDistribution: numberDistribution(
        values.map((value) =>
          value.publicPotentialUpperRating
            - value.publicPotentialLowerRating
        ),
      ),
    }))
    .sort((left, right) =>
      left.age - right.age || left.roleGroup.localeCompare(right.roleGroup)
    );
}

function allocationSummary(
  observations: readonly PlayerGenerationEconomyObservation[],
): PlayerGenerationAllocationSummary {
  const allocated = observations.filter(
    (observation) => observation.allocation !== undefined,
  );
  return {
    observationCount: allocated.length,
    allocatedCurrentSixCount: allocated.filter(
      ({ allocation }) => allocation?.currentSixAllocated === true,
    ).length,
    effectiveCurrentSixCount: allocated.filter(
      ({ currentRating }) => currentRating === 6,
    ).length,
    allocatedPotentialSixCount: allocated.filter(
      ({ allocation }) => allocation?.potentialSixAllocated === true,
    ).length,
    effectivePotentialSixCount: allocated.filter(
      ({ storedPotentialCeilingRating }) =>
        storedPotentialCeilingRating === 6,
    ).length,
    lowerDivisionPotentialSixCount: allocated.filter(
      ({ division, storedPotentialCeilingRating }) =>
        division !== "first_division" && storedPotentialCeilingRating === 6,
    ).length,
    allocatedCurrentSixMissingEffectiveCount: allocated.filter(
      ({ allocation, currentRating }) =>
        allocation?.currentSixAllocated === true && currentRating !== 6,
    ).length,
    unallocatedEffectiveCurrentSixCount: allocated.filter(
      ({ allocation, currentRating }) =>
        allocation?.currentSixAllocated === false && currentRating === 6,
    ).length,
    allocatedPotentialSixMissingEffectiveCount: allocated.filter(
      ({ allocation, storedPotentialCeilingRating }) =>
        allocation?.potentialSixAllocated === true
        && storedPotentialCeilingRating !== 6,
    ).length,
    unallocatedEffectivePotentialSixCount: allocated.filter(
      ({ allocation, storedPotentialCeilingRating }) =>
        allocation?.potentialSixAllocated === false
        && storedPotentialCeilingRating === 6,
    ).length,
  };
}

function capSummary(
  observations: readonly PlayerGenerationEconomyObservation[],
  hardCapMinorUnits: number,
): PlayerGenerationCapSummary {
  return {
    observationCount: observations.length,
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
  readonly currentSix: readonly PlayerGenerationEconomyObservation[];
  readonly storedCeilingSix: readonly PlayerGenerationEconomyObservation[];
  readonly allocation: PlayerGenerationAllocationSummary;
  readonly cap: PlayerGenerationCapSummary;
  readonly negotiations: PlayerGenerationNegotiationSummary;
  readonly annualIntake: PlayerGenerationAnnualIntakeSummary;
  readonly constraints: PlayerGenerationInitialRarityConstraints;
  readonly hardCapMinorUnits: number;
}

function createGates(input: CreateGatesInput): readonly PlayerGenerationEconomyGate[] {
  const rangeViolations = input.observations.filter((observation) =>
    !(
      observation.currentRating <= observation.publicPotentialLowerRating
      && observation.publicPotentialLowerRating
        <= observation.publicPotentialExpectedRating
      && observation.publicPotentialExpectedRating
        <= observation.publicPotentialUpperRating
      && observation.publicPotentialUpperRating
        <= observation.storedPotentialCeilingRating
    )
  );
  const currentSixViolations = input.currentSix.filter(
    ({ age, archetype }) => age < 19 || archetype === "rare_prodigy",
  );
  const potentialSixProspects = input.storedCeilingSix.filter(
    ({ currentRating }) => currentRating < 6,
  );
  const invalidProspectValues = potentialSixProspects.filter(
    ({ publicValueMinorUnits }) => publicValueMinorUnits <= 0,
  );
  const allocationViolations = allocationViolationCountByWorld(
    input.observations,
    input.constraints,
  );
  const intakeViolations =
    input.annualIntake.allocatedMissingGeneratedCount
    + input.annualIntake.generatedMissingAcceptedCount
    + (
      input.annualIntake.maximumAcceptedPotentialSixPerSeason > 1
        ? input.annualIntake.maximumAcceptedPotentialSixPerSeason - 1
        : 0
    );
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

  return [
    gate(
      "current_six_age_archetype_compatibility",
      input.currentSix.length,
      currentSixViolations.length,
      "required population; age >=19 and archetype != rare_prodigy",
      currentSixViolations.map(playerExample),
    ),
    gate(
      "stored_ceiling_six_joint_profile",
      input.storedCeilingSix.length,
      invalidProspectValues.length,
      "required population with positive public value; asking is measured separately",
      invalidProspectValues.map(playerExample),
    ),
    gate(
      "public_potential_range_ordering",
      input.observations.length,
      rangeViolations.length,
      "current <= lower <= expected <= public upper <= stored ceiling",
      rangeViolations.map(playerExample),
    ),
    gate(
      "initial_exceptional_allocation",
      input.allocation.observationCount,
      allocationViolations,
      [
        `current ${input.constraints.currentSixMinimum}..${input.constraints.currentSixMaximum}`,
        `potential ${input.constraints.potentialSixMinimum}..${input.constraints.potentialSixMaximum}`,
        `lower-tier potential <=${input.constraints.lowerDivisionPotentialSixMaximum}`,
        "allocated/effective identity",
      ].join("; "),
      allocationExamples(input.observations, input.constraints),
    ),
    gate(
      "annual_exceptional_intake",
      input.annualIntake.observationCount,
      intakeViolations,
      "allocated -> generated -> accepted; <=1 accepted potential-six per season",
      [],
    ),
    gate(
      "hard_cap_eligibility_and_display",
      input.cap.observationCount,
      input.cap.ineligibleExactHardCapCount
        + input.cap.ineligibleRenderedAsHardCapCount,
      "zero ineligible exact or rendered hard-cap labels",
      input.observations.filter(
        ({ hardCapEligible, publicValueMinorUnits }) =>
          !hardCapEligible
          && (
            publicValueMinorUnits === input.hardCapMinorUnits
            || Math.round(publicValueMinorUnits / 100)
              === Math.round(input.hardCapMinorUnits / 100)
          ),
      ).map(playerExample),
    ),
    gate(
      "stored_ceiling_six_prospect_value_observations",
      potentialSixProspects.length,
      invalidProspectValues.length,
      "required positive-valued potential-six prospect population",
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
        summary.effectiveCurrentSixCount < constraints.currentSixMinimum,
        summary.effectiveCurrentSixCount > constraints.currentSixMaximum,
        summary.effectivePotentialSixCount < constraints.potentialSixMinimum,
        summary.effectivePotentialSixCount > constraints.potentialSixMaximum,
        summary.lowerDivisionPotentialSixCount
          > constraints.lowerDivisionPotentialSixMaximum,
      ].filter(Boolean).length
      + summary.allocatedCurrentSixMissingEffectiveCount
      + summary.unallocatedEffectiveCurrentSixCount
      + summary.allocatedPotentialSixMissingEffectiveCount
      + summary.unallocatedEffectivePotentialSixCount;
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
    division,
  }) =>
    allocation !== undefined
    && (
      allocation.currentSixAllocated !== (currentRating === 6)
      || allocation.potentialSixAllocated
        !== (storedPotentialCeilingRating === 6)
      || (
        division !== "first_division"
        && storedPotentialCeilingRating === 6
        && constraints.lowerDivisionPotentialSixMaximum === 0
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
    seasonIndex: observation.seasonIndex,
    division: observation.division,
    currentRating: observation.currentRating,
    storedCeilingRating: observation.storedPotentialCeilingRating,
    lowerRating: observation.publicPotentialLowerRating,
    expectedRating: observation.publicPotentialExpectedRating,
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
      || !Number.isSafeInteger(observation.seasonIndex)
      || observation.seasonIndex < 0
      || !Number.isSafeInteger(observation.publicValueMinorUnits)
      || observation.publicValueMinorUnits < 0
      || !PLAYER_STAR_RATINGS.includes(observation.currentRating)
      || !PLAYER_STAR_RATINGS.includes(
        observation.storedPotentialCeilingRating,
      )
      || !PLAYER_STAR_RATINGS.includes(observation.publicPotentialLowerRating)
      || !PLAYER_STAR_RATINGS.includes(observation.publicPotentialExpectedRating)
      || !PLAYER_STAR_RATINGS.includes(observation.publicPotentialUpperRating)
    ) {
      throw new Error("Exceptional-player audit received an invalid or duplicate observation");
    }
    observationIds.add(observation.observationId);
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
      || !Number.isSafeInteger(observation.seasonIndex)
      || observation.seasonIndex < 0
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
  validateAnnualIntakeObservations(input.annualIntakeObservations ?? []);
}

function validateConstraints(
  constraints: PlayerGenerationInitialRarityConstraints,
): void {
  const values = Object.values(constraints);
  if (
    values.some((value) => !Number.isSafeInteger(value) || value < 0)
    || constraints.currentSixMinimum > constraints.currentSixMaximum
    || constraints.potentialSixMinimum > constraints.potentialSixMaximum
  ) {
    throw new Error("Exceptional-player audit requires valid initial rarity constraints");
  }
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
      || !allUnique(observation.allocatedPotentialSixPlayerIds)
      || !allUnique(observation.generatedPotentialSixPlayerIds)
      || !allUnique(observation.acceptedPlayerIds)
      || !allUnique(observation.activePotentialSixPlayerIds)
    ) {
      throw new Error("Exceptional-player audit received an invalid annual intake observation");
    }
    intakeSeasons.add(observation.seasonIndex);
  }
}

function allUnique(values: readonly string[]): boolean {
  return values.every((value) => value.length > 0)
    && new Set(values).size === values.length;
}
