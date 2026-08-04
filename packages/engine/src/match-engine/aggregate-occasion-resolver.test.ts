import assert from "node:assert/strict";
import { test } from "vitest";

import { clubId, fixtureId, playerId } from "@game/domain";
import { deriveRng, type Rng } from "@game/shared";

import { AggregateOccasionResolver } from "./aggregate-occasion-resolver.ts";
import { buildOccasionContext } from "./occasion-context.ts";
import type { ResolveOccasionInput } from "./occasion-resolver.ts";
import { EVEN_CONTEST_ROUTE_CAPACITY } from "./opportunity-route.ts";
import { createInitialMatchSimulationState, type MatchSide } from "./match-simulation-state.ts";
import type { MatchContext, MatchTeamContext } from "./match-context.ts";
import type { MatchEngineConfig } from "./match-engine-config.ts";
import { createLineupSlot } from "./team-strength.ts";
import {
  matchTacticsCalibrationFixture,
  tacticalShapeProfileFixture,
} from "../test-fixtures/match-tactics-calibration.ts";
import { withNeutralIncidentProfiles } from "../test-fixtures/match-player-incident-profiles.ts";

/**
 * These tests state the football the shot chain claims, in the order the chain
 * asks its questions: the defence blocks, the striker aims, the keeper saves.
 *
 * Each one is measured over many occasions rather than one draw, because every
 * step is a probability and a single roll proves nothing about any of them.
 */

test("a better striker puts more shots on target against the same keeper", () => {
  const great = outcomesOver({ attack: 19 });
  const poor = outcomesOver({ attack: 8 });

  assert.equal(
    great.onTarget > poor.onTarget,
    true,
    `a 19 attack hit the target ${great.onTarget} times against ${poor.onTarget} for an 8`,
  );
});

test("keeper quality never changes how many shots reach him", () => {
  // The heart of it. Whether a shot is on target is settled by the player
  // striking it, so replacing the keeper must leave the shot count alone. When
  // the keeper decided this, a world-class one produced *more* shots on target
  // than a poor one, because every save he made counted as one.
  const worldClass = outcomesOver({ goalkeeper: 19 });
  const ordinary = outcomesOver({ goalkeeper: 14 });
  const weak = outcomesOver({ goalkeeper: 10 });

  assert.equal(worldClass.onTarget, ordinary.onTarget);
  assert.equal(ordinary.onTarget, weak.onTarget);
});

test("the same shots on target become fewer goals against a better keeper", () => {
  const worldClass = outcomesOver({ goalkeeper: 19 });
  const weak = outcomesOver({ goalkeeper: 10 });

  assert.equal(
    weak.goal > worldClass.goal,
    true,
    `a 10 keeper conceded ${weak.goal} against ${worldClass.goal} for a 19`,
  );
  assert.equal(
    worldClass.save > weak.save,
    true,
    "the goals a better keeper prevents must show up as saves, not as shots that vanish",
  );
});

test("a goal is always a shot on target, and a block never is", () => {
  const resolver = new AggregateOccasionResolver();

  for (let draw = 0; draw < 400; draw += 1) {
    const resolution = resolver.resolveOccasion(occasionFor({}), rngFor(`shape-${draw}`));

    assert.equal(
      resolution.isShotOnTarget,
      resolution.outcome === "goal" || resolution.outcome === "save",
      `${resolution.outcome} reported isShotOnTarget=${resolution.isShotOnTarget}`,
    );
    assert.equal(resolution.expectedGoals >= 0 && resolution.expectedGoals <= 1, true);
    assert.equal(resolution.quality >= 0 && resolution.quality <= 1, true);
  }
});

test("even the worst mismatch leaves the keeper something to save", () => {
  // A goal is one kind of shot on target, so nothing stops the two collapsing
  // into each other once the attack is good enough - and then the keeper has
  // stopped existing. Football does not do that.
  const rout = outcomesOver({ attack: 20, midfield: 20, defense: 1, goalkeeper: 1 });

  assert.equal(rout.save > 0, true, "a hopeless keeper still saved nothing at all");
  assert.equal(
    rout.goal < rout.onTarget,
    true,
    `every one of ${rout.onTarget} shots on target went in`,
  );
});

test("the same players create better chances down a route they own", () => {
  // The route model's whole point reaching the shot. Identical elevens: only
  // the way through changes. Without this the shape decides how *many* chances
  // a side gets and never how good they are, so two equal-quality sides in
  // different shapes produce chances that are indistinguishable one by one.
  const owned = outcomesOver({ routeCapacity: 0.65 });
  const contested = outcomesOver({ routeCapacity: EVEN_CONTEST_ROUTE_CAPACITY });
  const shut = outcomesOver({ routeCapacity: 0.35 });

  assert.equal(
    owned.goal > contested.goal && contested.goal > shut.goal,
    true,
    `goals down an owned/contested/shut route: ${owned.goal}/${contested.goal}/${shut.goal}`,
  );
  assert.equal(
    owned.onTarget > shut.onTarget,
    true,
    "a better position is struck on target more often, whoever is shooting",
  );
});

test("an evenly contested route is worth exactly nothing", () => {
  // The block 2 lesson, restated where it can be broken again. A term
  // proportional to raw capacity rather than to distance from an even contest
  // would lift every chance in every match and read as separation.
  const resolver = new AggregateOccasionResolver();
  const qualityAt = (routeCapacity: number): number =>
    resolver.resolveOccasion(occasionFor({ routeCapacity }), rngFor("even")).quality;

  assert.equal(qualityAt(EVEN_CONTEST_ROUTE_CAPACITY), qualityAt(EVEN_CONTEST_ROUTE_CAPACITY));
  assert.equal(
    qualityAt(EVEN_CONTEST_ROUTE_CAPACITY) > qualityAt(0.4)
      && qualityAt(EVEN_CONTEST_ROUTE_CAPACITY) < qualityAt(0.6),
    true,
    "the even contest must sit between a route given up and a route won",
  );
});

test("a stronger defence blocks more of what it faces", () => {
  const stout = outcomesOver({ defense: 19 });
  const porous = outcomesOver({ defense: 8 });

  assert.equal(stout.block > porous.block, true, `${stout.block} blocks against ${porous.block}`);
});

test("one occasion always advances the stream by the same amount", () => {
  // Outcomes take different branches, so a chain that drew its rolls lazily
  // would leave the stream in a different place depending on what happened.
  const resolver = new AggregateOccasionResolver();
  const drawsFor = (goalkeeper: number): number => {
    const rng = countingRng(rngFor("stream"));
    resolver.resolveOccasion(occasionFor({ goalkeeper }), rng.rng);
    return rng.count();
  };

  assert.equal(drawsFor(19), drawsFor(8));
});

test("the same occasion and seed always resolve identically", () => {
  const resolver = new AggregateOccasionResolver();
  const resolve = () => resolver.resolveOccasion(occasionFor({}), rngFor("repeat"));

  assert.deepEqual(resolve(), resolve());
});

/** The four departmental strengths one side fields. */
interface DepartmentStrengths {
  readonly attack: number;
  readonly midfield: number;
  readonly defense: number;
  readonly goalkeeper: number;
}

/** What a case varies; anything unset stays ordinary or evenly contested. */
interface StrengthOptions extends Partial<DepartmentStrengths> {
  readonly routeCapacity?: number;
}

interface OutcomeCounts {
  readonly goal: number;
  readonly save: number;
  readonly block: number;
  readonly miss: number;
  readonly onTarget: number;
}

/** Resolves many independent occasions and counts how each one ended. */
function outcomesOver(options: StrengthOptions, draws = 600): OutcomeCounts {
  const resolver = new AggregateOccasionResolver();
  const counts = { goal: 0, save: 0, block: 0, miss: 0, onTarget: 0 };

  for (let draw = 0; draw < draws; draw += 1) {
    const resolution = resolver.resolveOccasion(occasionFor(options), rngFor(`draw-${draw}`));
    counts[resolution.outcome] += 1;
    if (resolution.isShotOnTarget) counts.onTarget += 1;
  }

  return counts;
}

/**
 * Builds one resolve input where `home` attacks with the requested strengths.
 *
 * The occasion is built through the real seam rather than hand-written, so these
 * cases keep measuring the chain a match actually runs. None of these fixtures
 * carries per-player attributes, which is exactly the point: every candidate is
 * the same neutral profile, so both actor edges are `0` and each case still
 * isolates the one department it varies.
 */
function occasionFor(options: StrengthOptions): ResolveOccasionInput {
  const context: MatchContext = {
    fixtureId: fixtureId("fixture:resolver-000001"),
    seed: "resolver-seed",
    home: teamFor("home", { attack: options.attack ?? 13, midfield: options.midfield ?? 13, defense: 13, goalkeeper: 13 }),
    away: teamFor("away", {
      attack: 13,
      midfield: 13,
      defense: options.defense ?? 13,
      goalkeeper: options.goalkeeper ?? 13,
    }),
    engineConfig: engineConfig(),
    matchTacticsCalibration: matchTacticsCalibrationFixture(),
  };
  const simulation = createInitialMatchSimulationState(context);

  return {
    simulation,
    occasion: buildOccasionContext({
      simulation,
      attackingSide: "home",
      defendingSide: "away",
      minute: 10,
      route: "central",
      routeCapacity: options.routeCapacity ?? EVEN_CONTEST_ROUTE_CAPACITY,
      scoreBeforeOccasion: simulation.score,
    }),
  };
}

function teamFor(side: MatchSide, strength: DepartmentStrengths): MatchTeamContext {
  return withNeutralIncidentProfiles({
    clubId: clubId(`club:${side}`),
    lineup: [
      createLineupSlot({ slotId: `${side}:gk`, playerId: playerId(`player:${side}-gk`), canonicalRole: "goalkeeper" }),
      createLineupSlot({ slotId: `${side}:cb`, playerId: playerId(`player:${side}-cb`), canonicalRole: "center_back" }),
      createLineupSlot({ slotId: `${side}:cm`, playerId: playerId(`player:${side}-cm`), canonicalRole: "central_midfielder" }),
      createLineupSlot({ slotId: `${side}:st`, playerId: playerId(`player:${side}-st`), canonicalRole: "striker" }),
    ],
    strength: {
      ...strength,
      overall: (strength.attack + strength.midfield + strength.defense + strength.goalkeeper) / 4,
    },
    shape: tacticalShapeProfileFixture(),
    tacticalDistribution: { directness: 0.5, pressing: 0.5, width: 0.5, risk: 0.5, mentality: "balanced" },
  });
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

function rngFor(key: string): Rng {
  return deriveRng("resolver-test", "occasion", key);
}

/** Wraps an RNG so a test can assert how many values one call consumed. */
function countingRng(inner: Rng): { readonly rng: Rng; readonly count: () => number } {
  let drawn = 0;

  return {
    rng: {
      ...inner,
      nextFloat: () => {
        drawn += 1;
        return inner.nextFloat();
      },
      nextInt: (min: number, max: number) => {
        drawn += 1;
        return inner.nextInt(min, max);
      },
    },
    count: () => drawn,
  };
}
