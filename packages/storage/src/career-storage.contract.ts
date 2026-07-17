import type { CareerState, SaveId } from "@game/domain";

import type { CareerStorage } from "./career-storage.interface.ts";
import type { SaveMetadata } from "./save-metadata.ts";

/** Named states used to exercise one implementation of the storage contract. */
export interface CareerStorageContractFixture {
  readonly firstName: string;
  readonly firstState: CareerState;
  readonly secondName: string;
  readonly secondState: CareerState;
  readonly replacementName: string;
  readonly replacementState: CareerState;
}

/** Observable facts produced by the backend-independent storage contract. */
export interface CareerStorageContractResult {
  readonly firstMetadata: SaveMetadata;
  readonly initialList: readonly SaveMetadata[];
  readonly loadedFirst: CareerState;
  readonly replacementMetadata: SaveMetadata;
  readonly loadedReplacement: CareerState;
  readonly finalList: readonly SaveMetadata[];
}

/**
 * Exercises the canonical save lifecycle without relying on adapter internals.
 *
 * Tests can apply the same assertions to JSON and SQLite implementations while
 * production code remains dependent only on `CareerStorage`.
 */
export async function runCareerStorageContract(
  storage: CareerStorage,
  fixture: CareerStorageContractFixture,
): Promise<CareerStorageContractResult> {
  const firstMetadata = await storage.saveCareer({
    saveId: fixture.firstState.saveId,
    name: fixture.firstName,
    state: fixture.firstState,
  });
  await storage.saveCareer({
    saveId: fixture.secondState.saveId,
    name: fixture.secondName,
    state: fixture.secondState,
  });

  const initialList = await storage.listCareers();
  const loadedFirst = await storage.loadCareer(fixture.firstState.saveId);
  const replacementMetadata = await storage.saveCareer({
    saveId: fixture.replacementState.saveId,
    name: fixture.replacementName,
    state: fixture.replacementState,
  });
  const loadedReplacement = await storage.loadCareer(fixture.replacementState.saveId);

  await storage.deleteCareer(fixture.secondState.saveId);
  const finalList = await storage.listCareers();

  return {
    firstMetadata,
    initialList,
    loadedFirst,
    replacementMetadata,
    loadedReplacement,
    finalList,
  };
}

/** Returns the ordered save IDs from contract metadata for concise assertions. */
export function contractSaveIds(metadata: readonly SaveMetadata[]): readonly SaveId[] {
  return metadata.map((entry) => entry.saveId);
}
