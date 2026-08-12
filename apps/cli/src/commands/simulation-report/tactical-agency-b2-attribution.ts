import type {
  LeagueDiversityOpeningGateVerdict,
} from "./league-diversity-gate.ts";
import type {
  TacticalAgencyConditionedClubSelection,
  TacticalAgencyConditionedPopulationRow,
} from "./tactical-agency-world.ts";

/** One B2 seed set supplied to the formation-concentration attribution. */
export interface TacticalAgencyB21FormationSetInput {
  readonly setName: string;
  readonly clubSelections: readonly TacticalAgencyConditionedClubSelection[];
  readonly populationRows: readonly TacticalAgencyConditionedPopulationRow[];
  readonly population: readonly LeagueDiversityOpeningGateVerdict[];
}

/** One identity's observed formation behaviour inside one frozen seed set. */
export interface TacticalAgencyB21IdentityFormationRow {
  readonly setName: string;
  readonly squadIdentityKey: string;
  readonly appearanceCount: number;
  readonly fourFourTwoCount: number;
  readonly fourFourTwoShare: number;
  readonly modalFormationKey: string;
}

/** One `4-4-2` selection inside a failed local population row. */
export interface TacticalAgencyB21FailedSelectionRow {
  readonly clubId: string;
  readonly squadIdentityKey: string;
  readonly tiedAtBestCount: number;
  readonly bestMinusSecond: number | "not_observed";
}

/** A population failure plus the exact clubs that created its concentration. */
export interface TacticalAgencyB21FailedPopulationRow {
  readonly setName: string;
  readonly worldSeed: string;
  readonly competitionId: string;
  readonly clubCount: number;
  readonly fourFourTwoCount: number;
  readonly allowedFourFourTwoCount: number;
  readonly excessClubCount: number;
  readonly failedGateKeys: readonly string[];
  readonly selections: readonly TacticalAgencyB21FailedSelectionRow[];
}

export type TacticalAgencyB21FormationOwner =
  | "squad_chart"
  | "selection_fit"
  | "sampling_variance"
  | "mixed"
  | "unresolved";

/** Complete formation-concentration attribution over both frozen seed sets. */
export interface TacticalAgencyB21FormationAttribution {
  readonly failedRows: readonly TacticalAgencyB21FailedPopulationRow[];
  readonly identityRows: readonly TacticalAgencyB21IdentityFormationRow[];
  readonly squadChartRuleHeld: boolean;
  readonly selectionFitRuleHeld: boolean;
  readonly samplingVarianceRuleHeld: boolean;
  readonly owner: TacticalAgencyB21FormationOwner;
}

/** Attributes the two local B2 failures without changing their verdict. */
export function summarizeTacticalAgencyB21FormationAttribution(
  sets: readonly TacticalAgencyB21FormationSetInput[],
): TacticalAgencyB21FormationAttribution {
  const failedRows = sets.flatMap((set) => {
    const verdictByRow = new Map(set.population.map((verdict) => [
      populationKey(verdict.worldSeed, verdict.competitionId),
      verdict,
    ]));
    return set.populationRows.flatMap((row) => {
      const verdict = verdictByRow.get(populationKey(row.worldSeed, row.competitionId));
      if (verdict === undefined) {
        throw new Error(`B2.1 has no population verdict for ${row.worldSeed}|${row.competitionId}`);
      }
      if (verdict.held) return [];
      const selections = set.clubSelections
        .filter((selection) =>
          selection.worldSeed === row.worldSeed
          && String(selection.competitionId) === row.competitionId
          && selection.formationKey === "4-4-2")
        .sort((left, right) => String(left.clubId).localeCompare(String(right.clubId)))
        .map((selection): TacticalAgencyB21FailedSelectionRow => ({
          clubId: String(selection.clubId),
          squadIdentityKey: selection.squadIdentityKey,
          tiedAtBestCount: selection.tiedAtBestCount,
          bestMinusSecond: selection.secondStructuralScore === "not_observed"
            ? "not_observed"
            : selection.bestStructuralScore - selection.secondStructuralScore,
        }));
      const allowedFourFourTwoCount = Math.floor(row.clubCount * 0.30);
      return [{
        setName: set.setName,
        worldSeed: row.worldSeed,
        competitionId: row.competitionId,
        clubCount: row.clubCount,
        fourFourTwoCount: selections.length,
        allowedFourFourTwoCount,
        excessClubCount: Math.max(0, selections.length - allowedFourFourTwoCount),
        failedGateKeys: verdict.failedGateKeys,
        selections,
      }];
    });
  }).sort((left, right) => left.setName.localeCompare(right.setName)
    || left.worldSeed.localeCompare(right.worldSeed)
    || left.competitionId.localeCompare(right.competitionId));

  const identityRows = sets.flatMap((set) => identityRowsFor(set));
  const squadChartRuleHeld = squadChartOwns(failedRows, identityRows, sets.map(({ setName }) => setName));
  const failedSelections = failedRows.flatMap(({ selections }) => selections);
  const margins = failedSelections.flatMap(({ bestMinusSecond }) =>
    bestMinusSecond === "not_observed" ? [] : [bestMinusSecond]);
  const selectionFitRuleHeld = !squadChartRuleHeld
    && failedSelections.length > 0
    && failedSelections.every(({ tiedAtBestCount }) => tiedAtBestCount === 1)
    && margins.length === failedSelections.length
    && median(margins) > 0;
  const samplingVarianceRuleHeld = failedRows.length === 2
    && failedRows.every(({ failedGateKeys }) =>
      failedGateKeys.length === 1 && failedGateKeys[0] === "top_formation_share")
    && failedRows.every((failed) => {
      const set = sets.find(({ setName }) => setName === failed.setName);
      if (set === undefined) return false;
      return set.population
        .filter(({ worldSeed }) => worldSeed === failed.worldSeed)
        .every((verdict) =>
          verdict.competitionId === failed.competitionId || verdict.held);
    });
  const candidates: TacticalAgencyB21FormationOwner[] = [
    ...(squadChartRuleHeld ? ["squad_chart" as const] : []),
    ...(selectionFitRuleHeld ? ["selection_fit" as const] : []),
    ...(samplingVarianceRuleHeld ? ["sampling_variance" as const] : []),
  ];

  return {
    failedRows,
    identityRows,
    squadChartRuleHeld,
    selectionFitRuleHeld,
    samplingVarianceRuleHeld,
    owner: candidates.length === 1
      ? candidates[0] as TacticalAgencyB21FormationOwner
      : candidates.length > 1
        ? "mixed"
        : "unresolved",
  };
}

function identityRowsFor(
  set: TacticalAgencyB21FormationSetInput,
): readonly TacticalAgencyB21IdentityFormationRow[] {
  const formationsByIdentity = new Map<string, Map<string, number>>();
  for (const selection of set.clubSelections) {
    const counts = formationsByIdentity.get(selection.squadIdentityKey) ?? new Map<string, number>();
    counts.set(selection.formationKey, (counts.get(selection.formationKey) ?? 0) + 1);
    formationsByIdentity.set(selection.squadIdentityKey, counts);
  }
  return [...formationsByIdentity].sort(([left], [right]) => left.localeCompare(right))
    .map(([squadIdentityKey, counts]) => {
      const ordered = [...counts].sort(([leftFormation, leftCount], [rightFormation, rightCount]) =>
        rightCount - leftCount || leftFormation.localeCompare(rightFormation));
      const modal = ordered[0];
      if (modal === undefined) throw new Error(`B2.1 identity ${squadIdentityKey} has no selections`);
      const appearanceCount = [...counts.values()].reduce((sum, count) => sum + count, 0);
      const fourFourTwoCount = counts.get("4-4-2") ?? 0;
      return {
        setName: set.setName,
        squadIdentityKey,
        appearanceCount,
        fourFourTwoCount,
        fourFourTwoShare: fourFourTwoCount / appearanceCount,
        modalFormationKey: modal[0],
      };
    });
}

function squadChartOwns(
  failedRows: readonly TacticalAgencyB21FailedPopulationRow[],
  identityRows: readonly TacticalAgencyB21IdentityFormationRow[],
  setNames: readonly string[],
): boolean {
  if (failedRows.length === 0) return false;
  const candidateIdentities = new Set(failedRows[0]?.selections.map(({ squadIdentityKey }) => squadIdentityKey));
  for (const squadIdentityKey of candidateIdentities) {
    const ownsEveryFailure = failedRows.every((row) => {
      const owned = row.selections.filter((selection) =>
        selection.squadIdentityKey === squadIdentityKey).length;
      return row.selections.length > 0 && owned / row.selections.length >= 0.8;
    });
    const ownsBothSets = setNames.every((setName) => {
      const row = identityRows.find((candidate) =>
        candidate.setName === setName && candidate.squadIdentityKey === squadIdentityKey);
      return row !== undefined && row.fourFourTwoShare >= 0.8;
    });
    if (ownsEveryFailure && ownsBothSets) return true;
  }
  return false;
}

function populationKey(worldSeed: string, competitionId: string): string {
  return `${worldSeed}|${competitionId}`;
}

function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const ordered = [...values].sort((left, right) => left - right);
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 === 1
    ? ordered[middle] as number
    : ((ordered[middle - 1] as number) + (ordered[middle] as number)) / 2;
}
