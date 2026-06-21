import { abilityValue, type PlayerAbilities, type PlayerPosition } from "@game/domain";

/** Role-template keys used by fictional player generation. */
export type PlayerGenerationRoleTemplateKey =
  | "goalkeeper"
  | "full_back"
  | "center_back"
  | "wing_back"
  | "central_midfielder"
  | "wide_midfielder"
  | "striker";

type AttributeProfile = {
  /** Offset from the generated role base. */
  readonly offset?: number;
  /** Optional lower bound for this role attribute. */
  readonly min?: number;
  /** Optional upper cap for this role attribute. */
  readonly max?: number;
};

/** Full role template used to turn one role base into 25 player abilities. */
export interface PlayerGenerationRoleTemplate {
  /** Stable machine key for tests and diagnostics. */
  readonly key: PlayerGenerationRoleTemplateKey;
  /** Technical ability profiles. */
  readonly technical: Readonly<Record<keyof PlayerAbilities["technical"], AttributeProfile>>;
  /** Physical ability profiles. */
  readonly physical: Readonly<Record<keyof PlayerAbilities["physical"], AttributeProfile>>;
  /** Mental ability profiles. */
  readonly mental: Readonly<Record<keyof PlayerAbilities["mental"], AttributeProfile>>;
  /** Goalkeeper ability profiles. */
  readonly goalkeeping: Readonly<Record<keyof PlayerAbilities["goalkeeping"], AttributeProfile>>;
}

const OUT_OF_GOAL_CAP = 4;

/** Content-owned role templates for generated players. */
export const PLAYER_GENERATION_ROLE_TEMPLATES: Readonly<
  Record<PlayerGenerationRoleTemplateKey, PlayerGenerationRoleTemplate>
> = {
  goalkeeper: {
    key: "goalkeeper",
    technical: {
      finishing: { offset: -5, max: 5 },
      passing: { offset: -2, max: 8 },
      longPassing: { offset: -2, max: 8 },
      crossing: { offset: -5, max: 5 },
      dribbling: { offset: -4, max: 6 },
      technique: { offset: -3, max: 7 },
      tackling: { offset: -5, max: 5 },
      penalties: { offset: -3, max: 8 },
      freeKicks: { offset: -4, max: 7 },
    },
    physical: {
      pace: { offset: -2, max: 9 },
      strength: { offset: 0, max: 10 },
      stamina: { offset: -2, max: 9 },
      agility: { offset: 1, max: 13 },
      heading: { offset: -4, max: 6 },
    },
    mental: {
      positioning: { offset: 1, max: 11 },
      vision: { offset: -2, max: 8 },
      anticipation: { offset: 1, max: 12 },
      composure: { offset: 1, max: 12 },
      determination: { offset: 0, max: 12 },
      leadership: { offset: 0, max: 12 },
    },
    goalkeeping: {
      reflexes: { offset: 4 },
      handling: { offset: 4 },
      rushingOut: { offset: 3 },
      goalkeeperPositioning: { offset: 4 },
      footwork: { offset: 2 },
    },
  },
  full_back: {
    key: "full_back",
    technical: {
      finishing: { offset: -4, max: 7 },
      passing: { offset: 0 },
      longPassing: { offset: 0 },
      crossing: { offset: 2 },
      dribbling: { offset: 0 },
      technique: { offset: 0 },
      tackling: { offset: 2 },
      penalties: { offset: -2, max: 9 },
      freeKicks: { offset: -2, max: 9 },
    },
    physical: {
      pace: { offset: 1 },
      strength: { offset: 0 },
      stamina: { offset: 1 },
      agility: { offset: 0 },
      heading: { offset: 0 },
    },
    mental: {
      positioning: { offset: 2 },
      vision: { offset: -1 },
      anticipation: { offset: 1 },
      composure: { offset: -1 },
      determination: { offset: 0 },
      leadership: { offset: -1 },
    },
    goalkeeping: outfieldGoalkeepingCaps(),
  },
  center_back: {
    key: "center_back",
    technical: {
      finishing: { offset: -4, max: 7 },
      passing: { offset: -1 },
      longPassing: { offset: 0 },
      crossing: { offset: -5, max: 6 },
      dribbling: { offset: -3, max: 7 },
      technique: { offset: -1 },
      tackling: { offset: 3 },
      penalties: { offset: -2, max: 9 },
      freeKicks: { offset: -3, max: 8 },
    },
    physical: {
      pace: { offset: -1 },
      strength: { offset: 2 },
      stamina: { offset: 0 },
      agility: { offset: -1 },
      heading: { offset: 2 },
    },
    mental: {
      positioning: { offset: 3 },
      vision: { offset: -2 },
      anticipation: { offset: 2 },
      composure: { offset: 0 },
      determination: { offset: 1 },
      leadership: { offset: 1 },
    },
    goalkeeping: outfieldGoalkeepingCaps(),
  },
  wing_back: {
    key: "wing_back",
    technical: {
      finishing: { offset: -3, max: 8 },
      passing: { offset: 1 },
      longPassing: { offset: 0 },
      crossing: { offset: 3 },
      dribbling: { offset: 1 },
      technique: { offset: 0 },
      tackling: { offset: 1 },
      penalties: { offset: -2, max: 9 },
      freeKicks: { offset: -1, max: 10 },
    },
    physical: {
      pace: { offset: 1 },
      strength: { offset: 0 },
      stamina: { offset: 2 },
      agility: { offset: 1 },
      heading: { offset: 0 },
    },
    mental: {
      positioning: { offset: 1 },
      vision: { offset: 0 },
      anticipation: { offset: 1 },
      composure: { offset: -1 },
      determination: { offset: 1 },
      leadership: { offset: -1 },
    },
    goalkeeping: outfieldGoalkeepingCaps(),
  },
  central_midfielder: {
    key: "central_midfielder",
    technical: {
      finishing: { offset: -2, max: 10 },
      passing: { offset: 2 },
      longPassing: { offset: 1 },
      crossing: { offset: -1, max: 10 },
      dribbling: { offset: 1 },
      technique: { offset: 2 },
      tackling: { offset: 1 },
      penalties: { offset: -1, max: 11 },
      freeKicks: { offset: 0, max: 12 },
    },
    physical: {
      pace: { offset: 0 },
      strength: { offset: 0 },
      stamina: { offset: 2 },
      agility: { offset: 0 },
      heading: { offset: -1 },
    },
    mental: {
      positioning: { offset: 1 },
      vision: { offset: 2 },
      anticipation: { offset: 1 },
      composure: { offset: 0 },
      determination: { offset: 1 },
      leadership: { offset: 0 },
    },
    goalkeeping: outfieldGoalkeepingCaps(),
  },
  wide_midfielder: {
    key: "wide_midfielder",
    technical: {
      finishing: { offset: -1, max: 11 },
      passing: { offset: 1 },
      longPassing: { offset: 0 },
      crossing: { offset: 3 },
      dribbling: { offset: 2 },
      technique: { offset: 1 },
      tackling: { offset: -2, max: 8 },
      penalties: { offset: -1, max: 10 },
      freeKicks: { offset: 0, max: 11 },
    },
    physical: {
      pace: { offset: 2 },
      strength: { offset: -1 },
      stamina: { offset: 1 },
      agility: { offset: 1 },
      heading: { offset: -1 },
    },
    mental: {
      positioning: { offset: 0 },
      vision: { offset: 1 },
      anticipation: { offset: 0 },
      composure: { offset: 0 },
      determination: { offset: 0 },
      leadership: { offset: -1 },
    },
    goalkeeping: outfieldGoalkeepingCaps(),
  },
  striker: {
    key: "striker",
    technical: {
      finishing: { offset: 3 },
      passing: { offset: 0 },
      longPassing: { offset: -2, max: 9 },
      crossing: { offset: -2, max: 9 },
      dribbling: { offset: 1 },
      technique: { offset: 1 },
      tackling: { offset: -3, max: 8 },
      penalties: { offset: 1 },
      freeKicks: { offset: -1, max: 11 },
    },
    physical: {
      pace: { offset: 1 },
      strength: { offset: 1 },
      stamina: { offset: 0 },
      agility: { offset: 0 },
      heading: { offset: 2 },
    },
    mental: {
      positioning: { offset: 0 },
      vision: { offset: -1, max: 10 },
      anticipation: { offset: 1 },
      composure: { offset: 2 },
      determination: { offset: 0 },
      leadership: { offset: -1 },
    },
    goalkeeping: outfieldGoalkeepingCaps(),
  },
};

/**
 * Returns the role template key used for one natural position.
 */
export function roleTemplateKeyForPosition(position: PlayerPosition): PlayerGenerationRoleTemplateKey {
  if (position === "gk") {
    return "goalkeeper";
  }

  if (position === "rb" || position === "lb") {
    return "full_back";
  }

  if (position === "cb") {
    return "center_back";
  }

  if (position === "rwb" || position === "lwb") {
    return "wing_back";
  }

  if (position === "rw" || position === "lw") {
    return "wide_midfielder";
  }

  if (position === "st") {
    return "striker";
  }

  return "central_midfielder";
}

/**
 * Builds a full 25-attribute ability shape from a role base and position.
 */
export function buildPlayerAbilitiesForPosition(base: number, position: PlayerPosition): PlayerAbilities {
  const template = PLAYER_GENERATION_ROLE_TEMPLATES[roleTemplateKeyForPosition(position)];

  return {
    technical: {
      finishing: rating(base, template.technical.finishing),
      passing: rating(base, template.technical.passing),
      longPassing: rating(base, template.technical.longPassing),
      crossing: rating(base, template.technical.crossing),
      dribbling: rating(base, template.technical.dribbling),
      technique: rating(base, template.technical.technique),
      tackling: rating(base, template.technical.tackling),
      penalties: rating(base, template.technical.penalties),
      freeKicks: rating(base, template.technical.freeKicks),
    },
    physical: {
      pace: rating(base, template.physical.pace),
      strength: rating(base, template.physical.strength),
      stamina: rating(base, template.physical.stamina),
      agility: rating(base, template.physical.agility),
      heading: rating(base, template.physical.heading),
    },
    mental: {
      positioning: rating(base, template.mental.positioning),
      vision: rating(base, template.mental.vision),
      anticipation: rating(base, template.mental.anticipation),
      composure: rating(base, template.mental.composure),
      determination: rating(base, template.mental.determination),
      leadership: rating(base, template.mental.leadership),
    },
    goalkeeping: {
      reflexes: rating(base, template.goalkeeping.reflexes),
      handling: rating(base, template.goalkeeping.handling),
      rushingOut: rating(base, template.goalkeeping.rushingOut),
      goalkeeperPositioning: rating(base, template.goalkeeping.goalkeeperPositioning),
      footwork: rating(base, template.goalkeeping.footwork),
    },
  };
}

/** Returns a compact cap set for outfield players' goalkeeper attributes. */
function outfieldGoalkeepingCaps(): PlayerGenerationRoleTemplate["goalkeeping"] {
  return {
    reflexes: { offset: -6, max: OUT_OF_GOAL_CAP },
    handling: { offset: -6, max: OUT_OF_GOAL_CAP },
    rushingOut: { offset: -6, max: OUT_OF_GOAL_CAP },
    goalkeeperPositioning: { offset: -6, max: OUT_OF_GOAL_CAP },
    footwork: { offset: -5, max: 5 },
  };
}

/** Applies one role profile and returns a branded ability value. */
function rating(base: number, profile: AttributeProfile) {
  const offsetValue = base + (profile.offset ?? 0);
  const min = profile.min ?? 0;
  const max = profile.max ?? 20;

  return abilityValue(Math.max(min, Math.min(max, offsetValue)));
}
