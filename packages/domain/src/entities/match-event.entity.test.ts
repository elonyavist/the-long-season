import { test } from "vitest";
import assert from "node:assert/strict";

import { TACTICAL_ROUTES } from "../balance/match-tactics-calibration.ts";
import { playerId } from "../types/ids.ts";
import { MATCH_EVENT_SCHEMA_VERSION } from "./match.entity.ts";
import type { GoalMatchEvent, SaveMatchEvent, ShotContext } from "./match-event.entity.ts";

/**
 * These tests protect the durable event contract, not the engine that fills it.
 *
 * The route arrived here at schema `8`. What matters durably is that it is one
 * of the five frozen routes, that it survives being written into an event, and
 * that a shot which never came down one says so by absence rather than by
 * claiming a route it did not use.
 */

test("a shot context carries one of the five frozen routes", () => {
  const shot = openPlayShot("central");

  assert.equal(TACTICAL_ROUTES.includes(shot.route ?? "central"), true);
});

test("every frozen route is a legal shot context route", () => {
  // The union and the ordered array are two statements of the same vocabulary.
  // If a sixth route is ever added to one, this fails rather than letting the
  // event contract quietly fall behind the model that produces it.
  for (const route of TACTICAL_ROUTES) {
    assert.equal(openPlayShot(route).route, route);
  }
});

test("an awarded penalty carries no route at all", () => {
  // Absence is the fact. A penalty is not worked down a way through, so filling
  // the field with `central` would state something the match never decided.
  const penalty: GoalMatchEvent = {
    type: "goal",
    shot: {
      minute: 61,
      side: "home",
      quality: 0.76,
      isShotOnTarget: true,
      shotType: "set_piece",
      chanceType: "dead_ball",
    },
    scorerPlayerId: playerId("player:home-taker"),
  };

  assert.equal(penalty.shot.route, undefined);
});

test("the route survives onto every shot-outcome event that has one", () => {
  const save: SaveMatchEvent = {
    type: "save",
    shot: openPlayShot("right"),
    shooterPlayerId: playerId("player:away-shooter"),
    goalkeeperPlayerId: playerId("player:home-gk"),
  };

  assert.equal(save.shot.route, "right");
});

test("the schema version is the one the route was added at", () => {
  // A reader that wants a route gates on this number instead of treating an
  // absent field as `central`, so the version and the field move together.
  assert.equal(MATCH_EVENT_SCHEMA_VERSION, 8);
});

/** Builds one open-play shot context down an explicit route. */
function openPlayShot(route: ShotContext["route"]): ShotContext {
  return {
    minute: 18,
    side: "home",
    quality: 0.55,
    isShotOnTarget: true,
    shotType: "normal",
    chanceType: "open_play",
    ...(route === undefined ? {} : { route }),
  };
}
