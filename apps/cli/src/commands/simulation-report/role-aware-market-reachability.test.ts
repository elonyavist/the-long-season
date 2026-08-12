import assert from "node:assert/strict";
import { test } from "vitest";

import {
  createFakeDomesticWorld,
  selectAskingPriceCurves,
  selectMarketBehaviorCalibration,
  selectPlayerValuationConfig,
  selectPlayerWagePolicyConfig,
} from "@game/content";
import {
  advanceAiMarketLifecycle,
  deriveAiMarketNeeds,
} from "@game/engine";

import { careerStateFromNewWorld } from "../career/scenarios.ts";
import type { CliSaveId } from "../career/types.ts";

test("generated domestic worlds reach department and exact-role market paths", () => {
  let departmentNeedCount = 0;
  let roleNeedCount = 0;
  let recruitableRoleNeedCount = 0;
  let exactRoleTargetFoundCount = 0;
  let boundedReorderCount = 0;

  // Three consecutive generated worlds are a search of the real input space,
  // not a statistical checkpoint. Keeping the smallest consecutive corpus
  // that exercises every branch prevents this proof from competing with the
  // long-run cohorts that own effect size.
  for (let worldIndex = 0; worldIndex < 3; worldIndex += 1) {
    const worldSeed = `role-aware-market-reachability-${worldIndex + 1}`;
    const world = createFakeDomesticWorld({ worldSeed });
    const careerState = careerStateFromNewWorld(
      `save:role-aware-market-${worldIndex + 1}` as CliSaveId,
      world,
      worldSeed,
    );
    const versions = careerState.gameState.meta.calibrationVersions;
    const valuationConfig = selectPlayerValuationConfig(versions);
    const marketBehaviorPolicy = selectMarketBehaviorCalibration(versions);
    const needs = deriveAiMarketNeeds({
      careerState,
      asOf: careerState.gameState.calendar.currentDate,
      valuationConfig,
      marketBehaviorPolicy,
    });
    departmentNeedCount += needs.filter(({ target }) => target.kind === "department").length;
    roleNeedCount += needs.filter(({ target }) => target.kind === "role").length;

    const competitionId = world.transferWindowCompetitionIds[0];
    const transferWindows = competitionId === undefined
      ? undefined
      : world.transferWindowsByCompetitionId[competitionId];
    assert.ok(transferWindows !== undefined);
    const advanced = advanceAiMarketLifecycle({
      careerState,
      fromDate: careerState.gameState.calendar.currentDate,
      throughDate: (careerState.gameState.calendar.currentDate + 30) as typeof careerState.gameState.calendar.currentDate,
      transferWindows,
      valuationConfig,
      askingPriceConfig: selectAskingPriceCurves(versions),
      wagePolicy: selectPlayerWagePolicyConfig(versions),
      marketBehaviorPolicy,
      needSubmissionOrder: "legacy",
    });
    const bounded = advanceAiMarketLifecycle({
      careerState,
      fromDate: careerState.gameState.calendar.currentDate,
      throughDate: (careerState.gameState.calendar.currentDate + 30) as typeof careerState.gameState.calendar.currentDate,
      transferWindows,
      valuationConfig,
      askingPriceConfig: selectAskingPriceCurves(versions),
      wagePolicy: selectPlayerWagePolicyConfig(versions),
      marketBehaviorPolicy,
      needSubmissionOrder: "bounded_succession",
    });
    boundedReorderCount += Number(
      JSON.stringify(advanced.facts) !== JSON.stringify(bounded.facts),
    );
    recruitableRoleNeedCount += advanced.diagnostics.filter(({ event, target }) =>
      event === "need_recruitable" && target.kind === "role"
    ).reduce((sum, { count }) => sum + count, 0);
    exactRoleTargetFoundCount += advanced.diagnostics.filter(({ event, target }) =>
      event === "permanent_target_found" && target.kind === "role"
    ).reduce((sum, { count }) => sum + count, 0);
  }

  assert.equal(departmentNeedCount > 0, true, "department maintenance became unreachable");
  assert.equal(roleNeedCount > 0, true, "generated squads never expressed role succession");
  assert.equal(recruitableRoleNeedCount > 0, true, "role needs never cleared canonical finance");
  assert.equal(exactRoleTargetFoundCount > 0, true, "exact-role domestic candidates were unreachable");
  assert.equal(boundedReorderCount > 0, true, "generated squads never reached bounded reordering");
});
