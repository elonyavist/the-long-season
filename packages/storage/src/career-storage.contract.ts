import {
  ClubCompetitiveTierStateError,
  createCareerState,
  type CareerState,
  type SaveId,
} from "@game/domain";

import type { CareerStorage } from "./career-storage.interface.ts";
import { StorageError, type StorageErrorCode } from "./game-storage.interface.ts";
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

/** Career snapshot whose required persistence-owned slices are complete. */
export type PersistableCareerState = CareerState & Required<
  Pick<CareerState, "seniorSquadState" | "clubFinanceState" | "clubCompetitiveTierState">
>;

/**
 * Validates the complete beta persistence baseline without synthesizing facts.
 *
 * Domain careers may be assembled incrementally by focused engine tests, but a
 * durable save must always contain the generated senior-squad and finance
 * slices. Old beta payloads therefore fail at this boundary instead of loading
 * with invented contracts or balances.
 */
export function createPersistableCareerState(
  input: CareerState,
  failureCode: Extract<StorageErrorCode, "save_unreadable" | "save_unwritable" | "unsupported_schema_version">,
): PersistableCareerState {
  if (input.clubCompetitiveTierState === undefined) {
    throw new StorageError(
      failureCode,
      "Career save does not contain the Phase 80A season-frozen competitive-tier state",
    );
  }
  let state: CareerState;
  try {
    state = createCareerState(input);
  } catch (error) {
    if (error instanceof ClubCompetitiveTierStateError) {
      throw new StorageError(
        failureCode,
        `Career save contains an invalid season-frozen competitive-tier state: ${error.message}`,
        { cause: error },
      );
    }
    throw error;
  }
  if (state.seniorSquadState === undefined || state.clubFinanceState === undefined) {
    throw new StorageError(
      failureCode,
      "Career save does not contain the Phase 78 senior-squad and club-finance baseline",
    );
  }
  return state as PersistableCareerState;
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
