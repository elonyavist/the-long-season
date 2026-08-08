import type { ClubId, PlayerPosition } from "@game/domain";
import { deriveRng } from "@game/shared";

import { FAKE_PLAYERS_PER_CLUB } from "./fake-clubs.ts";

/**
 * The depth chart one generated club is built from, deepest slot last.
 *
 * Exactly `FAKE_PLAYERS_PER_CLUB` entries, as a tuple rather than an array, so
 * a chart that is one player short fails to compile instead of generating a
 * club that quietly cannot field an eleven.
 */
type GeneratedSquadDepthChart = readonly [
  PlayerPosition,
  PlayerPosition,
  PlayerPosition,
  PlayerPosition,
  PlayerPosition,
  PlayerPosition,
  PlayerPosition,
  PlayerPosition,
  PlayerPosition,
  PlayerPosition,
  PlayerPosition,
  PlayerPosition,
  PlayerPosition,
  PlayerPosition,
  PlayerPosition,
  PlayerPosition,
  PlayerPosition,
  PlayerPosition,
  PlayerPosition,
  PlayerPosition,
  PlayerPosition,
  PlayerPosition,
];

/**
 * Ties the tuple width above to the squad size the generator actually uses.
 *
 * Widening `FAKE_PLAYERS_PER_CLUB` without revisiting every chart would
 * otherwise generate short squads at runtime; here it is a type error, and the
 * fix is to decide what the eleven new footballers play, which is a football
 * decision and not a mechanical one.
 */
const _depthChartCoversTheWholeSquad: GeneratedSquadDepthChart["length"] = FAKE_PLAYERS_PER_CLUB;
void _depthChartCoversTheWholeSquad;

/**
 * Stable keys for the squad identities generated clubs are drawn from.
 *
 * Each key names the footballers a club is rich in - who it has, never how it
 * lines up. No formation is named, implied or reachable from here: which shape
 * suits a squad is the selector's answer to give, and a hint left in content
 * would answer it in advance.
 */
export const GENERATED_SQUAD_IDENTITY_KEYS = [
  "wing_back_pairing",
  "wide_midfield_stock",
  "creator_and_wingers",
  "holding_pair_and_strike_pair",
  "double_width_stock",
  "holder_heavy_low_build_up",
  "winger_stock_and_strike_pair",
  "creator_trio",
] as const;

/** Stable key for one generated squad identity. */
export type GeneratedSquadIdentityKey = (typeof GENERATED_SQUAD_IDENTITY_KEYS)[number];

/** One club's football identity, expressed as the players it holds. */
export interface GeneratedSquadIdentity {
  /** Stable identity key, for reports and tests. */
  readonly key: GeneratedSquadIdentityKey;
  /** Position held by each squad slot, starters first. */
  readonly positions: GeneratedSquadDepthChart;
}

/**
 * Every squad identity a generated world draws from.
 *
 * Read this as eight squads a scout could describe, not eight formations. The
 * football claim each one makes is that a club is *rich* in some kinds of
 * footballer and *has none* of others: `wing_back_pairing` owns no full-back at
 * all, `winger_stock_and_strike_pair` owns no attacking midfielder, and
 * `holding_pair_and_strike_pair` owns nobody wide of a full-back. Abundance
 * that varied only in degree would leave every club able to field the same
 * shape, which is the monoculture this table exists to break.
 *
 * Four things every chart holds to, because each is an invariant somewhere
 * else in generation:
 *
 * - slot `1` and slot `12` are the two goalkeepers, so the eleven has exactly
 *   one and the reserves cover him;
 * - slots `1..11` are the starters and the rest are depth, because
 *   `slotDepthOffset(...)` reads the slot number and not the position;
 * - department depth clears `MINIMUM_CAREER_DEPARTMENT_DEPTH` - `2` keepers,
 *   `6` defenders, `6` midfielders, `3` attackers - so no identity is born
 *   already asking career maintenance for a signing;
 * - a side that has a right-sided footballer has the left-sided one too,
 *   except among the deepest reserves, where a squad genuinely can be lopsided.
 */
export const GENERATED_SQUAD_IDENTITIES: Readonly<
  Record<GeneratedSquadIdentityKey, GeneratedSquadIdentity>
> = {
  /** A back three screened by two holders, with the width entirely behind. */
  wing_back_pairing: {
    key: "wing_back_pairing",
    positions: [
      "gk", "cb", "cb", "cb", "rwb", "lwb", "dm", "cm", "cm", "am", "st",
      "gk", "cb", "cb", "rwb", "lwb", "dm", "cm", "am", "st", "st", "rw",
    ],
  },
  /** Full-backs behind wide midfielders: width from the middle band, not the front. */
  wide_midfield_stock: {
    key: "wide_midfield_stock",
    positions: [
      "gk", "rb", "cb", "cb", "lb", "rm", "cm", "cm", "lm", "st", "st",
      "gk", "cb", "cb", "rb", "lb", "rm", "lm", "cm", "st", "st", "dm",
    ],
  },
  /** A creator behind a lone striker, with two wingers to find. */
  creator_and_wingers: {
    key: "creator_and_wingers",
    positions: [
      "gk", "rb", "cb", "cb", "lb", "dm", "cm", "am", "rw", "lw", "st",
      "gk", "cb", "rb", "lb", "dm", "cm", "am", "rw", "lw", "st", "cm",
    ],
  },
  /** Central density: two holders, a creator, a strike pair, nobody wide. */
  holding_pair_and_strike_pair: {
    key: "holding_pair_and_strike_pair",
    positions: [
      "gk", "rb", "cb", "cb", "lb", "dm", "dm", "cm", "am", "st", "st",
      "gk", "cb", "cb", "rb", "lb", "dm", "cm", "am", "st", "st", "cm",
    ],
  },
  /** Width twice over: wing-backs underneath wide midfielders. */
  double_width_stock: {
    key: "double_width_stock",
    positions: [
      "gk", "rwb", "cb", "cb", "lwb", "cm", "cm", "rm", "lm", "st", "st",
      "gk", "cb", "cb", "rwb", "lwb", "rm", "lm", "cm", "rw", "lw", "st",
    ],
  },
  /** A deep, crowded defence and holders in front of it, ahead of one forward. */
  holder_heavy_low_build_up: {
    key: "holder_heavy_low_build_up",
    positions: [
      "gk", "rb", "cb", "cb", "cb", "lb", "dm", "dm", "cm", "rm", "st",
      "gk", "cb", "cb", "rb", "lb", "dm", "cm", "lm", "st", "st", "am",
    ],
  },
  /** Wingers outside a strike pair, and no creator anywhere in the club. */
  winger_stock_and_strike_pair: {
    key: "winger_stock_and_strike_pair",
    positions: [
      "gk", "rb", "cb", "cb", "lb", "cm", "cm", "rw", "lw", "st", "st",
      "gk", "cb", "rb", "lb", "cm", "dm", "dm", "rw", "lw", "st", "cm",
    ],
  },
  /** Three footballers between the midfield and the striker, one of them central. */
  creator_trio: {
    key: "creator_trio",
    positions: [
      "gk", "rb", "cb", "cb", "lb", "cm", "cm", "rm", "am", "lm", "st",
      "gk", "cb", "cb", "rb", "lb", "am", "rm", "lm", "st", "st", "dm",
    ],
  },
};

/**
 * Assigns a balanced deck of squad identities to one ordered competition.
 *
 * The club is the football unit: each receives one complete depth chart. The
 * competition owns only distribution, so twenty clubs over eight identities
 * receive two or three of each instead of twenty independent draws that may
 * converge by chance.
 *
 * `competitionIdentityKey` is part of the derived RNG stream because domestic
 * divisions restart their club ordinal at one. Without the key, three leagues
 * in the same world silently receive the same identity sequence.
 *
 * @example
 * const assignments = assignGeneratedSquadIdentities({
 *   seed: "demo-001",
 *   competitionIdentityKey: "competition:ita-3",
 *   orderedClubIds,
 * });
 */
export function assignGeneratedSquadIdentities(input: {
  readonly seed: string;
  readonly competitionIdentityKey: string;
  readonly orderedClubIds: readonly ClubId[];
}): ReadonlyMap<ClubId, GeneratedSquadIdentity> {
  if (input.competitionIdentityKey.length === 0) {
    throw new Error("Generated squad identity assignment requires a competition identity key");
  }

  const seenClubIds = new Set<ClubId>();
  for (const clubId of input.orderedClubIds) {
    if (seenClubIds.has(clubId)) {
      throw new Error(`Generated squad identity assignment contains duplicate club ${clubId}`);
    }
    seenClubIds.add(clubId);
  }

  const rng = deriveRng(
    input.seed,
    "squad-identity-assignment",
    input.competitionIdentityKey,
  );
  const identityOrder = [...GENERATED_SQUAD_IDENTITY_KEYS];
  shuffleInPlace(identityOrder, rng);

  const deck = input.orderedClubIds.map((_, index) => {
    const key = identityOrder[index % identityOrder.length];
    if (key === undefined) {
      throw new Error(`Generated squad identity deck has no key at index ${index}`);
    }
    return key;
  });
  shuffleInPlace(deck, rng);

  const assignments = new Map<ClubId, GeneratedSquadIdentity>();
  for (let index = 0; index < input.orderedClubIds.length; index += 1) {
    const clubId = input.orderedClubIds[index];
    const key = deck[index];
    if (clubId === undefined || key === undefined) {
      throw new Error(`Generated squad identity assignment is incomplete at index ${index}`);
    }
    assignments.set(clubId, GENERATED_SQUAD_IDENTITIES[key]);
  }

  return assignments;
}

/**
 * Resolves the position one squad slot holds under a club's identity.
 *
 * Slot numbers are one-based because the rest of generation counts squads that
 * way, and the throw keeps an off-by-one from silently becoming a striker.
 *
 * @example
 * squadIdentityPositionForSlot(identity, 1); // => "gk"
 */
export function squadIdentityPositionForSlot(
  identity: GeneratedSquadIdentity,
  slotNumber: number,
): PlayerPosition {
  const position = identity.positions[slotNumber - 1];

  if (position === undefined) {
    throw new Error(`Squad identity ${identity.key} has no slot ${slotNumber}`);
  }

  return position;
}

/** Fisher-Yates shuffle over one local array and one derived deterministic RNG. */
function shuffleInPlace<T>(values: T[], rng: ReturnType<typeof deriveRng>): void {
  for (let index = values.length - 1; index > 0; index -= 1) {
    const otherIndex = rng.nextInt(0, index + 1);
    const value = values[index];
    const otherValue = values[otherIndex];
    if (value === undefined || otherValue === undefined) {
      throw new Error(`Generated squad identity shuffle fell outside index ${index}`);
    }
    values[index] = otherValue;
    values[otherIndex] = value;
  }
}
