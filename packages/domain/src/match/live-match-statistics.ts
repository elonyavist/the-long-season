/** Cumulative statistics for one side of an in-progress or completed match. */
export interface LiveMatchSideStatistics {
  /** Share of recorded possession in the inclusive 0..1 range. */
  readonly possessionShare: number;
  readonly shots: number;
  readonly shotsOnTarget: number;
  readonly expectedGoals: number;
  readonly corners: number;
  readonly fouls: number;
  readonly yellowCards: number;
  readonly redCards: number;
  readonly saves: number;
  readonly goals: number;
}

/** Cumulative statistics for both match sides. */
export interface LiveMatchStatistics {
  readonly home: LiveMatchSideStatistics;
  readonly away: LiveMatchSideStatistics;
}

/** Machine-readable cumulative-statistics validation failures. */
export type LiveMatchStatisticsErrorCode =
  | "invalid_possession"
  | "invalid_count"
  | "invalid_expected_goals"
  | "shots_on_target_exceed_shots";

/** Typed error raised when cumulative match facts are internally impossible. */
export class LiveMatchStatisticsError extends Error {
  public readonly code: LiveMatchStatisticsErrorCode;

  public constructor(code: LiveMatchStatisticsErrorCode, message: string) {
    super(message);
    this.name = "LiveMatchStatisticsError";
    this.code = code;
  }
}

/** Creates a zeroed cumulative statistics snapshot for a new match. */
export function emptyLiveMatchStatistics(): LiveMatchStatistics {
  return { home: emptySideStatistics(), away: emptySideStatistics() };
}

/** Validates and copies cumulative statistics without calculating them. */
export function createLiveMatchStatistics(input: LiveMatchStatistics): LiveMatchStatistics {
  const home = createSideStatistics("home", input.home);
  const away = createSideStatistics("away", input.away);
  const possessionTotal = home.possessionShare + away.possessionShare;

  if (possessionTotal !== 0 && Math.abs(possessionTotal - 1) > 0.000_001) {
    throw new LiveMatchStatisticsError(
      "invalid_possession",
      `Recorded possession must total 1 or remain 0 before play: ${possessionTotal}`,
    );
  }

  return { home, away };
}

function emptySideStatistics(): LiveMatchSideStatistics {
  return {
    possessionShare: 0,
    shots: 0,
    shotsOnTarget: 0,
    expectedGoals: 0,
    corners: 0,
    fouls: 0,
    yellowCards: 0,
    redCards: 0,
    saves: 0,
    goals: 0,
  };
}

function createSideStatistics(side: "home" | "away", input: LiveMatchSideStatistics): LiveMatchSideStatistics {
  if (!Number.isFinite(input.possessionShare) || input.possessionShare < 0 || input.possessionShare > 1) {
    throw new LiveMatchStatisticsError(
      "invalid_possession",
      `${side} possession must be finite and between 0 and 1: ${input.possessionShare}`,
    );
  }

  for (const [key, value] of countEntries(input)) {
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new LiveMatchStatisticsError("invalid_count", `${side} ${key} must be a non-negative safe integer: ${value}`);
    }
  }

  if (!Number.isFinite(input.expectedGoals) || input.expectedGoals < 0) {
    throw new LiveMatchStatisticsError(
      "invalid_expected_goals",
      `${side} expected goals must be finite and non-negative: ${input.expectedGoals}`,
    );
  }

  if (input.shotsOnTarget > input.shots) {
    throw new LiveMatchStatisticsError(
      "shots_on_target_exceed_shots",
      `${side} shots on target cannot exceed total shots`,
    );
  }

  return { ...input };
}

function countEntries(
  input: LiveMatchSideStatistics,
): readonly (readonly [Exclude<keyof LiveMatchSideStatistics, "possessionShare" | "expectedGoals">, number])[] {
  return [
    ["shots", input.shots],
    ["shotsOnTarget", input.shotsOnTarget],
    ["corners", input.corners],
    ["fouls", input.fouls],
    ["yellowCards", input.yellowCards],
    ["redCards", input.redCards],
    ["saves", input.saves],
    ["goals", input.goals],
  ];
}
