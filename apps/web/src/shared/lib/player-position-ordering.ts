/** Minimal player option shape needed by web-side preparation/squad sorting. */
export interface WebPlayerPositionOption {
  /** Stable player id used by selects and tables. */
  readonly playerId: string;
  /** Display name used as final deterministic tie-breaker. */
  readonly name: string;
  /** Broad role key, kept as fallback when a specific position is missing. */
  readonly roleKey: string;
  /** Specific football position key when available. */
  readonly positionKey?: string;
  /** Optional football strength used by manager helper sorting. */
  readonly currentAbility?: number;
}

/** Numeric position-fit tier used by selection ordering and tactical-board suitability. */
export type WebPlayerPositionFitTier = 0 | 1 | 2 | 3 | 4;

/** Football departments used by compact squad filters. */
export type WebPlayerDepartment = "goalkeeper" | "defender" | "midfielder" | "attacker";

/** Canonical short position codes shared by web squad and tactical surfaces. */
export type WebPlayerPositionCode =
  | "POR"
  | "TD"
  | "DC"
  | "TS"
  | "MED"
  | "CC"
  | "ED"
  | "ES"
  | "TRQ"
  | "AD"
  | "AS"
  | "ATT";

const DEFAULT_PLAYER_SELECTION_STRENGTH = 50;

const SLOT_FIT_SELECTION_BONUS: Readonly<Record<WebPlayerPositionFitTier, number>> = {
  0: 35,
  1: 25,
  2: 10,
  3: 0,
  4: -1_000,
};

const POSITION_ORDER: readonly string[] = [
  "gk",
  "rb",
  "rwb",
  "cb",
  "lb",
  "lwb",
  "dm",
  "cm",
  "rm",
  "lm",
  "wide",
  "am",
  "winger",
  "rw",
  "lw",
  "st",
];

const POSITION_ORDER_INDEX = new Map<string, number>(
  POSITION_ORDER.map((positionKey, index) => [positionKey, index]),
);

const SLOT_POSITION_TIERS: Readonly<Record<string, readonly (readonly string[])[]>> = {
  gk: [["gk"]],
  rb: [["rb"], ["rwb"], ["cb", "lb", "wide"], ["dm", "cm", "am", "winger", "st"]],
  cb: [["cb"], ["dm"], ["rb", "lb", "cm"], ["am", "wide", "winger", "st"]],
  "cb-right": [["cb"], ["rb", "lb", "dm"], ["rwb", "lwb", "cm"], ["am", "wide", "winger", "st"]],
  "cb-center": [["cb"], ["dm"], ["rb", "lb", "cm"], ["am", "wide", "winger", "st"]],
  "cb-left": [["cb"], ["lb", "rb", "dm"], ["lwb", "rwb", "cm"], ["am", "wide", "winger", "st"]],
  lb: [["lb"], ["lwb"], ["cb", "rb", "wide"], ["dm", "cm", "am", "winger", "st"]],
  rwb: [["rwb"], ["rb", "wide"], ["rw", "cm"], ["cb", "lb", "am", "st"]],
  lwb: [["lwb"], ["lb", "wide"], ["lw", "cm"], ["cb", "rb", "am", "st"]],
  rm: [["rm", "wide"], ["rw", "rwb", "cm"], ["am", "st"], ["rb", "cb", "lb", "gk"]],
  lm: [["lm", "wide"], ["lw", "lwb", "cm"], ["am", "st"], ["rb", "cb", "lb", "gk"]],
  "cm-right": [["cm"], ["dm", "am"], ["wide", "winger"], ["cb", "rb", "lb", "st"]],
  cm: [["cm"], ["dm", "am"], ["wide", "winger"], ["cb", "rb", "lb", "st"]],
  "cm-center": [["cm"], ["dm", "am"], ["wide", "winger"], ["cb", "rb", "lb", "st"]],
  "cm-left": [["cm"], ["dm", "am"], ["wide", "winger"], ["cb", "rb", "lb", "st"]],
  dm: [["dm"], ["cm", "cb"], ["am"], ["rb", "lb", "wide", "winger", "st"]],
  "dm-right": [["dm"], ["cm", "cb"], ["am"], ["rb", "lb", "wide", "winger", "st"]],
  "dm-center": [["dm"], ["cm", "cb"], ["am"], ["rb", "lb", "wide", "winger", "st"]],
  "dm-left": [["dm"], ["cm", "cb"], ["am"], ["rb", "lb", "wide", "winger", "st"]],
  "am-right": [["am"], ["cm", "winger"], ["st", "wide", "dm"], ["rb", "lb", "cb"]],
  "am-left": [["am"], ["cm", "winger"], ["st", "wide", "dm"], ["rb", "lb", "cb"]],
  am: [["am"], ["cm", "winger"], ["st", "wide", "dm"], ["rb", "lb", "cb"]],
  rw: [["rw", "winger"], ["wide", "rwb", "am"], ["st", "cm"], ["rb", "cb", "lb", "gk"]],
  lw: [["lw", "winger"], ["wide", "lwb", "am"], ["st", "cm"], ["rb", "cb", "lb", "gk"]],
  "st-right": [["st"], ["winger", "am"], ["wide", "cm"], ["rb", "cb", "lb", "gk"]],
  "st-left": [["st"], ["winger", "am"], ["wide", "cm"], ["rb", "cb", "lb", "gk"]],
  st: [["st"], ["winger", "am"], ["wide", "cm"], ["rb", "cb", "lb", "gk"]],
};

const FALLBACK_POSITION_BY_ROLE: Readonly<Record<string, string>> = {
  goalkeeper: "gk",
  defender: "cb",
  midfielder: "cm",
  attacker: "st",
};

const DEPARTMENT_BY_POSITION: Readonly<Record<string, WebPlayerDepartment>> = {
  gk: "goalkeeper",
  rb: "defender",
  rwb: "defender",
  cb: "defender",
  lb: "defender",
  lwb: "defender",
  dm: "midfielder",
  cm: "midfielder",
  rm: "midfielder",
  lm: "midfielder",
  wide: "midfielder",
  am: "midfielder",
  winger: "attacker",
  rw: "attacker",
  lw: "attacker",
  st: "attacker",
};

const POSITION_CODE_BY_POSITION: Readonly<Record<string, WebPlayerPositionCode>> = {
  gk: "POR",
  rb: "TD",
  rwb: "TD",
  cb: "DC",
  lb: "TS",
  lwb: "TS",
  dm: "MED",
  cm: "CC",
  rm: "ED",
  lm: "ES",
  wide: "ED",
  am: "TRQ",
  winger: "AD",
  rw: "AD",
  lw: "AS",
  st: "ATT",
};

const FALLBACK_DEPARTMENT_BY_ROLE: Readonly<Record<string, WebPlayerDepartment>> = {
  goalkeeper: "goalkeeper",
  defender: "defender",
  midfielder: "midfielder",
  attacker: "attacker",
};

const FALLBACK_CODE_BY_ROLE: Readonly<Record<string, WebPlayerPositionCode>> = {
  goalkeeper: "POR",
  defender: "DC",
  midfielder: "CC",
  attacker: "ATT",
};

/**
 * Orders selectable players for one lineup slot.
 *
 * The manager still chooses manually, but the select is useful: natural fits
 * appear first, adapted/weak options follow, and unsuitable options are last.
 */
export function orderPlayerOptionsForLineupSlot<TPlayer extends WebPlayerPositionOption>(
  slotKey: string,
  players: readonly TPlayer[],
): readonly TPlayer[] {
  return [...players].sort((left, right) => {
    const scoreComparison = compareNumbers(
      scorePlayerOptionForLineupSlot(slotKey, right),
      scorePlayerOptionForLineupSlot(slotKey, left),
    );

    if (scoreComparison !== 0) {
      return scoreComparison;
    }

    return comparePlayerOptionsByPosition(left, right);
  });
}

/**
 * Scores one web player option for one lineup slot.
 *
 * This mirrors the domain-side manager helper intent: positional fit matters,
 * but a strong adapted player can still be the best practical choice.
 */
export function scorePlayerOptionForLineupSlot(slotKey: string, player: WebPlayerPositionOption): number {
  const fitTier = playerPositionFitTierForSlot(slotKey, player);
  const playerStrength = player.currentAbility ?? DEFAULT_PLAYER_SELECTION_STRENGTH;

  return playerStrength + SLOT_FIT_SELECTION_BONUS[fitTier];
}

/** Returns the raw position-fit tier for one tactical slot key. */
export function playerPositionFitTierForSlot(
  slotKey: string,
  player: WebPlayerPositionOption,
): WebPlayerPositionFitTier {
  return playerPositionFitTierForPositionKey(slotKey, player);
}

/** Returns the raw position-fit tier against one canonical position key. */
export function playerPositionFitTierForPositionKey(
  positionKey: string,
  player: WebPlayerPositionOption,
): WebPlayerPositionFitTier {
  const playerPositionKey = player.positionKey ?? FALLBACK_POSITION_BY_ROLE[player.roleKey];
  const slotTiers = SLOT_POSITION_TIERS[positionKey] ?? [];

  if (playerPositionKey === undefined) {
    return 4;
  }

  if (playerPositionKey === "gk" && positionKey !== "gk") {
    return 4;
  }

  const tierIndex = slotTiers.findIndex((tier) => tier.includes(playerPositionKey));

  return tierIndex === -1 ? 4 : (tierIndex as WebPlayerPositionFitTier);
}

/**
 * Compares player options by football position order, not localized role text.
 *
 * Use this for squad/tactics tables where sorting by a translated broad role
 * would produce unstable or tactically meaningless ordering.
 */
export function comparePlayerOptionsByPosition(
  left: WebPlayerPositionOption,
  right: WebPlayerPositionOption,
): number {
  return (
    compareNumbers(positionSortIndex(left), positionSortIndex(right)) ||
    left.name.localeCompare(right.name) ||
    left.playerId.localeCompare(right.playerId)
  );
}

/** Returns the deterministic sort index for a player's specific position. */
export function positionSortIndex(player: WebPlayerPositionOption): number {
  const positionKey = player.positionKey ?? FALLBACK_POSITION_BY_ROLE[player.roleKey] ?? "";

  return POSITION_ORDER_INDEX.get(positionKey) ?? POSITION_ORDER.length;
}

/** Returns the football department used to filter one player in compact squad lists. */
export function playerDepartment(player: WebPlayerPositionOption): WebPlayerDepartment {
  const positionDepartment = player.positionKey === undefined ? undefined : DEPARTMENT_BY_POSITION[player.positionKey];

  return positionDepartment ?? FALLBACK_DEPARTMENT_BY_ROLE[player.roleKey] ?? "midfielder";
}

/** Returns the canonical football position code shown in compact squad lists. */
export function playerPositionCode(player: WebPlayerPositionOption): WebPlayerPositionCode {
  const positionCode = player.positionKey === undefined ? undefined : POSITION_CODE_BY_POSITION[player.positionKey];

  return positionCode ?? FALLBACK_CODE_BY_ROLE[player.roleKey] ?? "CC";
}

function compareNumbers(left: number, right: number): number {
  return left === right ? 0 : left - right;
}
