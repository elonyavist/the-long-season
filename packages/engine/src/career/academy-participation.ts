import {
  fixtureId,
  naturalCanonicalRoleForPosition,
  playerParticipationRowKey,
  type CareerState,
  type FixtureId,
  type PlayerFixtureParticipationContribution,
  type PlayerParticipationLedger,
  type SeasonId,
} from "@game/domain";

const LOW_DETAIL_ACADEMY_FIXTURES_PER_ACTIVE_MONTH = 3;
export const LOW_DETAIL_ACADEMY_FIXTURE_MINUTES = 90;
const LOW_DETAIL_ACADEMY_FIXTURE_PREFIX = "fixture:academy-low-detail:";

/** Input for deriving academy activity before a monthly development checkpoint. */
export interface BuildLowDetailAcademyParticipationInput {
  /** Career whose active academy rosters and participation ledger own the facts. */
  readonly careerState: CareerState;
  /** Season receiving the low-detail fixture contributions. */
  readonly seasonId: SeasonId;
  /** First month that is not complete and must remain open. */
  readonly beforeMonthKey: string;
}

/**
 * Builds canonical academy fixture contributions without simulating results.
 *
 * The career design allows a low-detail competition to synthesize match
 * minutes, but growth must still consume the same ledger as senior football.
 * Stable fixture IDs make reloads idempotent. Whole senior-match equivalents
 * replace academy load so an emergency player is not given two full schedules.
 */
export function buildLowDetailAcademyParticipation(
  input: BuildLowDetailAcademyParticipationInput,
): readonly PlayerFixtureParticipationContribution[] {
  const academy = input.careerState.youthAcademyState;
  const ledger = input.careerState.playerParticipationLedger;
  if (academy === undefined || ledger === undefined) return [];

  const monthKeys = openCompetitionMonthKeys(
    ledger,
    input.seasonId,
    input.beforeMonthKey,
  );
  const contributions: PlayerFixtureParticipationContribution[] = [];

  for (const monthKey of monthKeys) {
    for (const clubId of academy.clubRosterIds) {
      const roster = academy.clubRosters[clubId];
      if (roster === undefined) {
        throw new Error(`Academy participation lost ordered club roster: ${clubId}`);
      }

      for (const playerId of roster.playerIds) {
        const player = input.careerState.gameState.players[playerId];
        const naturalPosition = player?.naturalPositions[0];
        if (player === undefined || naturalPosition === undefined) {
          throw new Error(`Academy participation lost active player: ${playerId}`);
        }
        const current = ledger.rows[
          playerParticipationRowKey(input.seasonId, monthKey, playerId)
        ];
        const plannedFixtureIds = lowDetailAcademyFixtureIds({
          seasonId: input.seasonId,
          monthKey,
          clubId: String(clubId),
        });
        const existingAcademyFixtureCount = plannedFixtureIds.filter((id) =>
          current?.appliedFixtureIds.includes(id) === true
        ).length;
        const existingAcademyMinutes =
          existingAcademyFixtureCount * LOW_DETAIL_ACADEMY_FIXTURE_MINUTES;
        const nonAcademyMinutes = (current?.minutes ?? 0) - existingAcademyMinutes;
        if (nonAcademyMinutes < 0) {
          throw new Error(`Academy fixture minutes exceed participation total: ${playerId}|${monthKey}`);
        }
        const targetFixtureCount = Math.max(
          0,
          LOW_DETAIL_ACADEMY_FIXTURES_PER_ACTIVE_MONTH
            - Math.floor(nonAcademyMinutes / LOW_DETAIL_ACADEMY_FIXTURE_MINUTES),
        );
        const playedRole = naturalCanonicalRoleForPosition(naturalPosition);

        for (let index = 0; index < targetFixtureCount; index += 1) {
          const academyFixtureId = plannedFixtureIds[index]!;
          if (current?.appliedFixtureIds.includes(academyFixtureId) === true) {
            continue;
          }
          contributions.push({
            fixtureId: academyFixtureId,
            playerId,
            clubId,
            seasonId: input.seasonId,
            monthKey,
            started: true,
            substituteAppearance: false,
            minutes: LOW_DETAIL_ACADEMY_FIXTURE_MINUTES,
            playedRoleMinutes: {
              [playedRole]: LOW_DETAIL_ACADEMY_FIXTURE_MINUTES,
            },
          });
        }
      }
    }
  }

  return contributions;
}

/** Identifies the stable academy-fixture namespace in a participation row. */
export function isLowDetailAcademyFixtureId(value: FixtureId): boolean {
  return String(value).startsWith(LOW_DETAIL_ACADEMY_FIXTURE_PREFIX);
}

function openCompetitionMonthKeys(
  ledger: PlayerParticipationLedger,
  seasonId: SeasonId,
  beforeMonthKey: string,
): readonly string[] {
  const closed = new Set(ledger.closedMonthKeys);
  return [...new Set(ledger.rowKeys.flatMap((rowKey) => {
    const row = ledger.rows[rowKey];
    if (
      row === undefined
      || row.seasonId !== seasonId
      || row.monthKey >= beforeMonthKey
      || closed.has(`${seasonId}|${row.monthKey}`)
    ) return [];
    return [row.monthKey];
  }))].sort();
}

function lowDetailAcademyFixtureIds(input: {
  readonly seasonId: SeasonId;
  readonly monthKey: string;
  readonly clubId: string;
}): readonly FixtureId[] {
  return Array.from(
    { length: LOW_DETAIL_ACADEMY_FIXTURES_PER_ACTIVE_MONTH },
    (_, index) => fixtureId(
      `${LOW_DETAIL_ACADEMY_FIXTURE_PREFIX}${input.seasonId}:${input.monthKey}:${input.clubId}:${String(index + 1).padStart(2, "0")}`,
    ),
  );
}
