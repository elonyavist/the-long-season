import { createFakeLeagueSystem } from "@game/content";
import { applyCareerPermanentTransfer } from "@game/engine";
import { createTranslator } from "@game/i18n";
import { JsonCareerStorage, StorageError } from "@game/storage";

import {
  formatCareerAdvanceOutput,
  formatCareerInspectOutput,
  formatCareerMarketApplyOutput,
  formatCareerSummaryOutput,
  formatNewCareerWorldOutput,
} from "./career/format.ts";
import {
  formatSupportedMarketDemoProfiles,
  parseCareerArgs,
} from "./career/parse-career-args.ts";
import {
  buildMarketDemoScenario,
  careerStateFromNewWorld,
  careerStateFromScenario,
} from "./career/scenarios.ts";
import { advanceCareerNextFixture } from "./career/progression.ts";
import type { CliIntent } from "./career/types.ts";

/** Minimal IO adapter used by command tests. */
export interface CareerCommandIo {
  /** Writes normal command output. */
  readonly stdout: (line: string) => void;
  /** Writes command errors. */
  readonly stderr: (line: string) => void;
}

/** Optional adapters for deterministic command tests. */
export interface CareerCommandOptions {
  /** Directory used by the JSON career storage adapter. */
  readonly storageDirectoryPath?: string;
}

/**
 * Runs the deterministic career CLI command.
 *
 * The public command stays intentionally small: argument parsing, state/scenario
 * construction, and formatting live in private modules so Phase 23 can add a
 * career loop without growing this file into another broad command surface.
 *
 * @example
 * await runCareerCommand(["--seed=demo-001", "--save=career-demo", "--apply-market-demo=pro01-affordable-permanent"]);
 */
export async function runCareerCommand(
  args: readonly string[],
  io: CareerCommandIo = defaultIo(),
  options: CareerCommandOptions = {},
): Promise<number> {
  const parsed = parseCareerArgs(args);
  const text = createTranslator(parsed.language);

  if (!parsed.ok) {
    io.stderr(parsed.message);
    io.stderr(text("career.usage", { marketProfiles: formatSupportedMarketDemoProfiles() }));
    return 1;
  }

  const storageDirectoryPath = options.storageDirectoryPath ?? "saves/career";
  const storage = new JsonCareerStorage({
    directoryPath: storageDirectoryPath,
  });

  if (parsed.mode === "inspect") {
    try {
      const careerState = await storage.loadCareer(parsed.saveId);
      for (const line of formatCareerInspectOutput({ careerState, saveDirectoryPath: storageDirectoryPath, text })) {
        io.stdout(line);
      }

      return 0;
    } catch (error) {
      if (error instanceof StorageError && error.code === "save_not_found") {
        io.stderr(text("career.error.saveNotFound", { saveId: parsed.saveId }));
        return 1;
      }

      throw error;
    }
  }

  if (parsed.mode === "summary") {
    try {
      const careerState = await storage.loadCareer(parsed.saveId);
      for (const line of formatCareerSummaryOutput({ careerState, saveDirectoryPath: storageDirectoryPath, text })) {
        io.stdout(line);
      }

      return 0;
    } catch (error) {
      if (error instanceof StorageError && error.code === "save_not_found") {
        io.stderr(text("career.error.saveNotFound", { saveId: parsed.saveId }));
        return 1;
      }

      throw error;
    }
  }

  if (parsed.mode === "advanceNextFixture") {
    try {
      const careerState = await storage.loadCareer(parsed.saveId);
      const result = advanceCareerNextFixture(careerState);

      if (result.status === "advanced") {
        await storage.saveCareer({
          saveId: parsed.saveId,
          name: String(parsed.saveId),
          state: result.careerState,
        });
      }

      for (const line of formatCareerAdvanceOutput({
        result,
        saveId: parsed.saveId,
        saveDirectoryPath: storageDirectoryPath,
        text,
      })) {
        io.stdout(line);
      }

      return result.status === "invalid" ? 1 : 0;
    } catch (error) {
      if (error instanceof StorageError && error.code === "save_not_found") {
        io.stderr(text("career.error.saveNotFound", { saveId: parsed.saveId }));
        return 1;
      }

      throw error;
    }
  }

  if (parsed.mode === "newWorldPreview") {
    const league = createFakeLeagueSystem({ worldSeed: parsed.seed });
    const careerState = careerStateFromNewWorld(parsed.saveId, league, parsed.seed);

    await storage.saveCareer({
      saveId: parsed.saveId,
      name: String(parsed.saveId),
      state: careerState,
    });

    for (const line of formatNewCareerWorldOutput({
      league,
      careerState,
      saveDirectoryPath: storageDirectoryPath,
      worldSeed: parsed.seed,
      text,
    })) {
      io.stdout(line);
    }

    return 0;
  }

  const league = createFakeLeagueSystem();
  const scenario = buildMarketDemoScenario(league, parsed.marketDemo);
  const careerState = careerStateFromScenario(parsed.saveId, scenario);
  const intent: CliIntent = {
    buyingClubId: scenario.buyingClubId,
    sellingClubId: scenario.sellingClubId,
    playerId: scenario.targetPlayerId,
  };
  const result = applyCareerPermanentTransfer({ careerState, intent });
  const careerSaveWritten = result.status === "accepted";

  if (careerSaveWritten) {
    await storage.saveCareer({
      saveId: parsed.saveId,
      name: String(parsed.saveId),
      state: result.careerState,
    });
  }

  for (const line of formatCareerMarketApplyOutput({
    league,
    seed: parsed.seed,
    saveId: parsed.saveId,
    saveDirectoryPath: storageDirectoryPath,
    profileKey: parsed.marketDemo,
    scenario,
    result,
    careerSaveWritten,
    text,
  })) {
    io.stdout(line);
  }

  return 0;
}

function defaultIo(): CareerCommandIo {
  return {
    stdout: (line) => console.log(line),
    stderr: (line) => console.error(line),
  };
}
