import assert from "node:assert/strict";
import { test } from "vitest";

import {
  abilityValue,
  clubId,
  gameDate,
  getPlayerRoleProfile,
  mapPlayerAbilities,
  nonNegativeMoney,
  playerId,
  rawDiagnosticAbilityAverage,
  roleCurrentAbility,
  rolePotentialAbility,
  type Club,
  type Player,
  type PlayerAbilities,
  type PlayerPosition,
  type PlayerRole,
} from "@game/domain";

import {
  DEFAULT_PLAYER_VALUATION_CONFIG,
  PlayerValuationError,
  derivePlayerValuation,
  type PlayerValuationConfig,
} from "./player-valuation.ts";

/**
 * Player valuation tests use compact synthetic entities so market pricing can
 * change independently from fake league balance.
 */
test("derivePlayerValuation is deterministic for the same input", () => {
  const input = {
    player: playerFixture("01", "st", 12, 14, 24),
    club: clubFixture("pro01", "third_division", 6),
    currentDate: gameDate(20_000),
    config: DEFAULT_PLAYER_VALUATION_CONFIG,
  } as const;

  const first = derivePlayerValuation(input);
  const second = derivePlayerValuation(input);

  assert.deepEqual(first, second);
  assert.equal(first.age, 24);
});

test("stronger players are valued higher than weaker players in the same context", () => {
  const club = clubFixture("pro01", "third_division", 6);
  const currentDate = gameDate(20_000);

  const weaker = derivePlayerValuation({
    player: playerFixture("01", "st", 8, 10, 24),
    club,
    currentDate,
    config: DEFAULT_PLAYER_VALUATION_CONFIG,
  });
  const stronger = derivePlayerValuation({
    player: playerFixture("02", "st", 14, 16, 24),
    club,
    currentDate,
    config: DEFAULT_PLAYER_VALUATION_CONFIG,
  });

  assert.ok(stronger.value > weaker.value);
});

test("category, reputation, and position multipliers affect value", () => {
  const player = playerFixture("01", "st", 12, 14, 24);
  const currentDate = gameDate(20_000);

  const thirdDivision = derivePlayerValuation({
    player,
    club: clubFixture("pro01", "third_division", 4),
    currentDate,
    config: DEFAULT_PLAYER_VALUATION_CONFIG,
  });
  const firstDivision = derivePlayerValuation({
    player,
    club: clubFixture("pro02", "first_division", 9),
    currentDate,
    config: DEFAULT_PLAYER_VALUATION_CONFIG,
  });
  const goalkeeper = derivePlayerValuation({
    player: playerFixture("03", "gk", 12, 14, 24),
    club: clubFixture("pro01", "third_division", 4),
    currentDate,
    config: DEFAULT_PLAYER_VALUATION_CONFIG,
  });

  assert.ok(firstDivision.value > thirdDivision.value);
  assert.ok(thirdDivision.value > goalkeeper.value);
});

test("role-shaped specialists are valued through football quality rather than diluted raw averages", () => {
  const samples: readonly {
    readonly role: PlayerRole;
    readonly position: PlayerPosition;
    readonly age: number;
  }[] = [
    { role: "goalkeeper", position: "gk", age: 19 },
    { role: "center_back", position: "cb", age: 24 },
    { role: "central_midfielder", position: "cm", age: 28 },
    { role: "winger", position: "rw", age: 31 },
    { role: "striker", position: "st", age: 35 },
  ];

  for (const [index, sample] of samples.entries()) {
    const abilities = roleShapedAbilities(sample.role, 15, 11, 2);
    const potential = roleShapedAbilities(sample.role, 17, 13, 3);
    const player = {
      ...playerFixture(String(index), sample.position, 1, 1, sample.age),
      primaryRole: sample.role,
      abilities,
      potential,
    };
    const valuation = derivePlayerValuation({
      player,
      club: clubFixture("profile", "third_division", 5),
      currentDate: gameDate(20_000),
      config: DEFAULT_PLAYER_VALUATION_CONFIG,
    });
    const profile = getPlayerRoleProfile(sample.role);
    const rawCurrent = Number(rawDiagnosticAbilityAverage(abilities));

    assert.equal(valuation.currentAbilityAverage, Number(roleCurrentAbility(abilities, profile)));
    assert.equal(valuation.potentialAbilityAverage, Number(rolePotentialAbility(potential, profile)));
    assert.ok(valuation.currentAbilityAverage > rawCurrent);
    assert.ok(valuation.value > 0);
  }
});

test("historical players without role identity retain raw-average valuation compatibility", () => {
  const rolePlayer = playerFixture("legacy", "st", 12, 14, 24);
  const { primaryRole: _primaryRole, ...legacyPlayer } = rolePlayer;
  const valuation = derivePlayerValuation({
    player: legacyPlayer,
    club: clubFixture("legacy", "third_division", 5),
    currentDate: gameDate(20_000),
    config: DEFAULT_PLAYER_VALUATION_CONFIG,
  });

  assert.equal(valuation.currentAbilityAverage, Number(rawDiagnosticAbilityAverage(legacyPlayer.abilities)));
  assert.equal(valuation.potentialAbilityAverage, Number(rawDiagnosticAbilityAverage(legacyPlayer.potential)));
});

test("derivePlayerValuation clamps to configured value limits", () => {
  const config: PlayerValuationConfig = {
    ...DEFAULT_PLAYER_VALUATION_CONFIG,
    minValue: nonNegativeMoney(1_000_000_00),
    maxValue: nonNegativeMoney(1_500_000_00),
  };

  const low = derivePlayerValuation({
    player: playerFixture("01", "gk", 1, 1, 36),
    club: clubFixture("pro01", "third_division", 0),
    currentDate: gameDate(20_000),
    config,
  });
  const high = derivePlayerValuation({
    player: playerFixture("02", "st", 20, 20, 24),
    club: clubFixture("pro02", "first_division", 10),
    currentDate: gameDate(20_000),
    config,
  });

  assert.equal(low.value, 1_000_000_00);
  assert.equal(high.value, 1_500_000_00);
});

test("derivePlayerValuation rejects missing primary position and bad config", () => {
  assertPlayerValuationError(
    () =>
      derivePlayerValuation({
        player: { ...playerFixture("01", "st", 12, 14, 24), naturalPositions: [] },
        club: clubFixture("pro01", "third_division", 6),
        currentDate: gameDate(20_000),
        config: DEFAULT_PLAYER_VALUATION_CONFIG,
      }),
    "missing_primary_position",
  );

  assertPlayerValuationError(
    () =>
      derivePlayerValuation({
        player: playerFixture("01", "st", 12, 14, 24),
        club: clubFixture("pro01", "third_division", 6),
        currentDate: gameDate(20_000),
        config: {
          ...DEFAULT_PLAYER_VALUATION_CONFIG,
          currentAbilityWeight: -1,
        },
      }),
    "invalid_config",
  );
});

function playerFixture(
  suffix: string,
  primaryPosition: PlayerPosition,
  currentAbility: number,
  potentialAbility: number,
  age: number,
): Player {
  return {
    id: playerId(`player:test-${suffix}`),
    firstName: "Test",
    lastName: `Player${suffix}`,
    birthDate: gameDate(20_000 - age * 365),
    naturalPositions: [primaryPosition],
    primaryRole: roleForPosition(primaryPosition),
    abilities: abilitiesFixture(currentAbility),
    potential: abilitiesFixture(potentialAbility),
  };
}

function roleForPosition(position: PlayerPosition): PlayerRole {
  if (position === "gk") return "goalkeeper";
  if (position === "cb") return "center_back";
  if (position === "rb" || position === "lb") return "full_back";
  if (position === "rwb" || position === "lwb") return "wing_back";
  if (position === "dm") return "defensive_midfielder";
  if (position === "cm") return "central_midfielder";
  if (position === "am") return "attacking_midfielder";
  if (position === "rw" || position === "lw") return "winger";
  return "striker";
}

function clubFixture(suffix: string, category: Club["category"], reputation: number): Club {
  return {
    id: clubId(`club:${suffix}`),
    name: `Club ${suffix}`,
    shortName: suffix.toUpperCase(),
    category,
    reputation,
    playerIds: [],
  };
}

function abilitiesFixture(value: number): PlayerAbilities {
  const ability = abilityValue(value);

  return {
    technical: {
      finishing: ability,
      passing: ability,
      longPassing: ability,
      crossing: ability,
      dribbling: ability,
      technique: ability,
      tackling: ability,
      penalties: ability,
      freeKicks: ability,
    },
    physical: {
      pace: ability,
      strength: ability,
      stamina: ability,
      agility: ability,
      heading: ability,
    },
    mental: {
      positioning: ability,
      vision: ability,
      anticipation: ability,
      composure: ability,
      determination: ability,
      leadership: ability,
    },
    goalkeeping: {
      reflexes: ability,
      handling: ability,
      rushingOut: ability,
      goalkeeperPositioning: ability,
      footwork: ability,
    },
  };
}

function roleShapedAbilities(
  role: PlayerRole,
  coreValue: number,
  secondaryValue: number,
  fallbackValue: number,
): PlayerAbilities {
  const profile = getPlayerRoleProfile(role);
  const core = new Set(profile.coreForRole);
  const secondary = new Set(profile.secondaryForRole);

  return mapPlayerAbilities(abilitiesFixture(fallbackValue), (_value, key) =>
    abilityValue(core.has(key) ? coreValue : secondary.has(key) ? secondaryValue : fallbackValue),
  );
}

/** Asserts a typed player valuation failure and its stable machine code. */
function assertPlayerValuationError(action: () => void, code: PlayerValuationError["code"]): void {
  assert.throws(action, (error) => error instanceof PlayerValuationError && error.code === code);
}
