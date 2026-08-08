import assert from "node:assert/strict";
import { test } from "vitest";

import { clubId, fixtureId, playerId, type CanonicalPlayerRole, type PlayerId, type TacticalRoute } from "@game/domain";

import { AggregateOccasionResolver } from "./aggregate-occasion-resolver.ts";
import { buildOccasionContext, type OccasionContext } from "./occasion-context.ts";
import type { MatchContext, MatchPlayerIncidentProfile, MatchTeamContext } from "./match-context.ts";
import type { MatchEngineConfig } from "./match-engine-config.ts";
import { createInitialMatchSimulationState, type MatchSimulationState } from "./match-simulation-state.ts";
import { createLineupSlot } from "./team-strength.ts";
import {
  matchTacticsCalibrationFixture,
  tacticalShapeProfileFixture,
} from "../test-fixtures/match-tactics-calibration.ts";
import { deriveRng } from "@game/shared";

/**
 * The occasion context is the answer to "who was actually involved, and did it
 * matter" - asked before the engine knows how the chance ended.
 *
 * These tests state the four things that makes true: the actors are legal and
 * distinct, they are decided without reference to any outcome, their attributes
 * move only the question each of them answers, and none of it gives the
 * population a free lift.
 */

test("the same occasion key always produces the same context", () => {
  const simulation = simulationFixture();
  const first = occasionAt(simulation, 18, "central");
  const second = occasionAt(simulation, 18, "central");

  assert.deepEqual(first, second);
});

test("resolving an occasion cannot change who was on it", () => {
  // Causal ordering, stated where it can be broken. The context is built, the
  // occasion is resolved fifty different ways, and the context is rebuilt: if
  // anything about the actors were being decided from the outcome, the two
  // would drift apart.
  const simulation = simulationFixture();
  const before = occasionAt(simulation, 24, "left");
  const resolver = new AggregateOccasionResolver();
  const outcomes = new Set<string>();

  for (let draw = 0; draw < 50; draw += 1) {
    outcomes.add(
      resolver.resolveOccasion(
        { simulation, occasion: before },
        deriveRng("occasion-test", "resolve", `draw-${draw}`),
      ).outcome,
    );
  }

  assert.ok(outcomes.size > 1, "the fixture must produce more than one outcome for this to prove anything");
  assert.deepEqual(occasionAt(simulation, 24, "left"), before);
});

test("attacking actors come from the attacking eleven and defending ones from the other", () => {
  const simulation = simulationFixture();
  const occasion = occasionAt(simulation, 31, "right");
  const attacking = simulation.context.home.lineup.map((slot) => slot.playerId);
  const defending = simulation.context.away.lineup.map((slot) => slot.playerId);

  assert.equal(attacking.includes(occasion.creatorPlayerId), true);
  assert.equal(attacking.includes(occasion.shooterPlayerId), true);
  assert.equal(defending.includes(occasion.primaryDefenderPlayerId), true);
  assert.equal(defending.includes(occasion.goalkeeperPlayerId), true);
});

test("the goalkeeper on the occasion is the man in the goalkeeper slot", () => {
  const simulation = simulationFixture();

  for (let minute = 1; minute <= 90; minute += 1) {
    const occasion = occasionAt(simulation, minute, "central");

    assert.equal(occasion.goalkeeperPlayerId, playerId("player:away-01"));
    assert.notEqual(occasion.shooterPlayerId, playerId("player:home-01"));
    assert.notEqual(occasion.creatorPlayerId, playerId("player:home-01"));
  }
});

test("the creator and the shooter are never the same player", () => {
  // Two names on one chance or one name once. A chance credited to the same
  // player twice would read as a pass to himself.
  const simulation = simulationFixture();

  for (let minute = 1; minute <= 90; minute += 1) {
    const occasion = occasionAt(simulation, minute, "central");

    assert.notEqual(occasion.creatorPlayerId, occasion.shooterPlayerId);
  }
});

test("a player who works his own chance is never credited with assisting it", () => {
  // The one lineup where the pool leaves no alternative. Assist credit is
  // decided here rather than after a goal, so it has to answer this before it
  // knows whether there was one.
  const simulation = simulationFixture({ homeLineupSize: 2 });
  const occasion = occasionAt(simulation, 14, "central");

  assert.equal(occasion.creatorPlayerId, occasion.shooterPlayerId);
  assert.equal(occasion.creatorIsCreditedWithAssist, false);
});

test("assist credit is settled before the occasion is resolved, not after a goal", () => {
  // Same occasion, resolved or not resolved: the answer was already there. The
  // path this replaced drew for an assist only once a goal existed, so a chance
  // that missed had never asked who set it up.
  const simulation = simulationFixture();
  const occasion = occasionAt(simulation, 21, "left");

  new AggregateOccasionResolver().resolveOccasion(
    { simulation, occasion },
    deriveRng("occasion-test", "resolve", "assist"),
  );

  assert.equal(occasionAt(simulation, 21, "left").creatorIsCreditedWithAssist, occasion.creatorIsCreditedWithAssist);
});

test("the route decides the chance type and nothing else does", () => {
  const simulation = simulationFixture();
  const chanceTypeFor = (route: TacticalRoute): string => occasionAt(simulation, 40, route).chanceType;

  assert.equal(chanceTypeFor("central"), "open_play");
  assert.equal(chanceTypeFor("direct"), "open_play");
  assert.equal(chanceTypeFor("left"), "cross");
  assert.equal(chanceTypeFor("right"), "cross");
  assert.equal(chanceTypeFor("transition"), "counter");
});

test("only a cross is ever headed, and only when the shooter wins the air", () => {
  // Role and route relevance in one statement. A cross met by a physically
  // stronger attacker is a header; the same cross attacked by a weaker one is
  // not; and no amount of physical advantage turns a central chance into one.
  const strongAttack = simulationFixture({ homeStrengthByIndex: () => 18, awayStrengthByIndex: () => 4 });
  const weakAttack = simulationFixture({ homeStrengthByIndex: () => 4, awayStrengthByIndex: () => 18 });

  assert.equal(occasionAt(strongAttack, 12, "left").shotType, "header");
  assert.equal(occasionAt(weakAttack, 12, "left").shotType, "normal");
  assert.equal(occasionAt(strongAttack, 12, "central").shotType, "normal");
});

test("eleven identical players give every actor an edge of exactly zero", () => {
  // The rule that keeps the edges safe rather than merely bounded: an edge is a
  // distance from the pool, so a squad with no spread has nothing to separate
  // itself from and the aggregate chain runs exactly as it did before actors
  // were named.
  //
  // Until Step 07A this was stated as "a context with no attributes at all",
  // because one could exist. It cannot now - `incidentProfiles` is required and
  // must cover the lineup - so the case is written as what it always really
  // measured.
  const occasion = occasionAt(simulationFixture({ uniformAttributes: true }), 55, "central");

  assert.equal(occasion.shooterQualityEdge, 0);
  assert.equal(occasion.primaryDefenderBlockEdge, 0);
});

test("a better striker in the same eleven produces a better chance", () => {
  const ordinary = occasionAt(simulationFixture(), 7, "central");
  const withOneStandout = occasionAt(
    simulationFixture({ homeComposureFor: (id) => (id === ordinary.shooterPlayerId ? 20 : 8) }),
    7,
    "central",
  );

  assert.equal(withOneStandout.shooterPlayerId, ordinary.shooterPlayerId);
  assert.ok(
    withOneStandout.shooterQualityEdge > 0,
    `the standout shooter carried ${withOneStandout.shooterQualityEdge}`,
  );
});

test("no shooter may be worth more than a tenth of a chance", () => {
  // Quality has no bound of its own the way block probability and the keeper
  // factor do, so the cap is the only thing standing between one extreme
  // attribute and a chance worth more than the whole gap between the two teams.
  const shooter = occasionAt(simulationFixture(), 9, "central").shooterPlayerId;
  const absurd = occasionAt(
    simulationFixture({ homeComposureFor: (id) => (id === shooter ? 100 : 1) }),
    9,
    "central",
  );

  assert.equal(absurd.shooterPlayerId, shooter);
  assert.equal(absurd.shooterQualityEdge, 0.1, "an uncapped edge would have been above one whole quality point");
});

test("naming actors gives the population nothing", () => {
  // The measured version of the discipline the route term already follows. An
  // edge is a distance from the pool the actor was drawn from, so across many
  // chances it has no mean to give away - otherwise every match in every
  // division would quietly convert better and the separation would be inflation.
  const simulation = simulationFixture();
  let shooterTotal = 0;
  let defenderTotal = 0;
  const minutes = 90;

  for (let minute = 1; minute <= minutes; minute += 1) {
    const occasion = occasionAt(simulation, minute, "central");
    shooterTotal += occasion.shooterQualityEdge;
    defenderTotal += occasion.primaryDefenderBlockEdge;
  }

  assert.ok(
    Math.abs(shooterTotal / minutes) < 0.01,
    `mean shooter edge was ${shooterTotal / minutes} of a quality point`,
  );
  assert.ok(
    Math.abs(defenderTotal / minutes) < 0.01,
    `mean defender edge was ${defenderTotal / minutes} of a block share`,
  );
});

/** What a case varies about the two elevens; anything unset is ordinary. */
interface SimulationOptions {
  /** Gives every player the same attributes, so no actor can differ from his pool. */
  readonly uniformAttributes?: boolean;
  readonly homeComposureFor?: (playerId: PlayerId) => number;
  readonly homeStrengthByIndex?: (index: number) => number;
  readonly awayStrengthByIndex?: (index: number) => number;
  /** Shortens the attacking eleven, down to the goalkeeper and one outfielder. */
  readonly homeLineupSize?: number;
}

/** Builds one occasion down an explicit route at an explicit minute. */
function occasionAt(simulation: MatchSimulationState, minute: number, route: TacticalRoute): OccasionContext {
  return buildOccasionContext({
    simulation,
    attackingSide: "home",
    defendingSide: "away",
    minute,
    route,
    routeQualityEdge: 0,
    scoreBeforeOccasion: simulation.score,
  });
}

/** Builds a simulation state where `home` attacks `away` with full elevens. */
function simulationFixture(options: SimulationOptions = {}): MatchSimulationState {
  const context: MatchContext = {
    fixtureId: fixtureId("fixture:occasion-000001"),
    seed: "occasion-seed",
    home: teamFixture("home", options, options.homeStrengthByIndex, options.homeLineupSize),
    away: teamFixture("away", options, options.awayStrengthByIndex, undefined),
    engineConfig: engineConfig(),
    matchTacticsCalibration: matchTacticsCalibrationFixture(),
  };

  return createInitialMatchSimulationState(context);
}

/** The eleven canonical roles both fixture teams field, in lineup order. */
const FIXTURE_ROLES = [
  "goalkeeper",
  "right_full_back",
  "center_back",
  "center_back",
  "left_full_back",
  "defensive_midfielder",
  "central_midfielder",
  "right_midfielder",
  "left_midfielder",
  "striker",
  "striker",
] as const satisfies readonly CanonicalPlayerRole[];

/** Builds one side with eleven distinguishable players. */
function teamFixture(
  side: "home" | "away",
  options: SimulationOptions,
  strengthByIndex: ((index: number) => number) | undefined,
  lineupSize: number | undefined,
): MatchTeamContext {
  const lineup = FIXTURE_ROLES.slice(0, lineupSize ?? FIXTURE_ROLES.length).map((canonicalRole, index) =>
    createLineupSlot({
      slotId: `${side}:${slotNumber(index)}`,
      playerId: playerId(`player:${side}-${slotNumber(index)}`),
      canonicalRole,
    }),
  );

  return {
    clubId: clubId(`club:${side}`),
    lineup,
    strength: { attack: 13, midfield: 13, defense: 13, goalkeeper: 13, overall: 13 },
    shape: tacticalShapeProfileFixture(),
    tacticalDistribution: { directness: 0.5, pressing: 0.5, width: 0.5, risk: 0.5, mentality: "balanced" },
    incidentProfiles: lineup.map((slot, index) =>
      incidentProfile(slot.playerId, index, side, options, strengthByIndex),
    ),
  };
}

/**
 * Gives each player attributes that differ from his team-mates'.
 *
 * The spread is what makes an edge measurable at all: eleven identical players
 * would produce an edge of zero however the selection worked, so the tests would
 * pass without proving the term reads anybody.
 */
function incidentProfile(
  player: PlayerId,
  index: number,
  side: "home" | "away",
  options: SimulationOptions,
  strengthByIndex: ((index: number) => number) | undefined,
): MatchPlayerIncidentProfile {
  const spread = options.uniformAttributes === true ? 10 : 6 + ((index * 3) % 11);

  return {
    playerId: player,
    tackling: spread,
    composure: side === "home" && options.homeComposureFor !== undefined
      ? options.homeComposureFor(player)
      : spread,
    determination: 10,
    stamina: 10,
    agility: 10,
    strength: strengthByIndex === undefined ? spread : strengthByIndex(index),
    penalties: 10,
    goalkeeperReflexes: index === 0 ? 15 : 3,
    goalkeeperHandling: index === 0 ? 15 : 3,
    startingFitness: 100,
  };
}

/** Two-digit slot number so IDs sort and read in lineup order. */
function slotNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}

function engineConfig(): MatchEngineConfig {
  const knob = { minInclusive: 0, maxInclusive: 1 };

  return {
    minuteCount: 90,
    rates: { baseOpportunityRatePerMinute: 0.12, maxOpportunityRatePerMinute: 0.4 },
    conversionBands: [
      { bandKey: "low", minQualityInclusive: 0, maxQualityExclusive: 0.4, goalProbability: 0.05 },
      { bandKey: "mid", minQualityInclusive: 0.4, maxQualityExclusive: 0.7, goalProbability: 0.13 },
      { bandKey: "high", minQualityInclusive: 0.7, maxQualityExclusive: 1.01, goalProbability: 0.26 },
    ],
    homeAdvantageFactor: 1.05,
    tacticalDistributionCaps: { directness: knob, pressing: knob, width: knob, risk: knob },
  };
}
