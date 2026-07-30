import type { ApplyCareerPermanentTransferInput } from "@game/engine";
import type { SaveCareerInput } from "@game/storage";

/**
 * Shared career CLI aliases keep private command modules aligned with the
 * durable career contracts without exporting these helper shapes from domain.
 */
export type CliCareerState = ApplyCareerPermanentTransferInput["careerState"];

/** Current saved game-state shape used by the career CLI. */
export type CliGameState = CliCareerState["gameState"];

/** Current canonical club-finance state used by the career CLI. */
export type CliClubFinanceState = NonNullable<CliCareerState["clubFinanceState"]>;

/** Current canonical senior registration and contract state used by the career CLI. */
export type CliSeniorSquadState = NonNullable<CliCareerState["seniorSquadState"]>;

/** Permanent-transfer intent shape accepted by the engine use-case. */
export type CliIntent = ApplyCareerPermanentTransferInput["intent"];

/** Club ID stored by the canonical domain career state. */
export type ClubId = CliGameState["clubIds"][number];

/** Player ID stored by the canonical domain career state. */
export type PlayerId = CliGameState["playerIds"][number];

/** Player shape stored inside the career game state. */
export type CliPlayer = CliGameState["players"][PlayerId];

/** Ability map shape stored on generated players. */
export type CliPlayerAbilities = CliPlayer["abilities"];

/** Money value object shape used by canonical club finances. */
export type CliMoney = CliClubFinanceState["accounts"][ClubId]["availableTransferBudget"];

/** Canonical finance account stored for one club. */
export type CliClubFinanceAccount = CliClubFinanceState["accounts"][ClubId];

/** Career save ID accepted by the storage adapter. */
export type CliSaveId = SaveCareerInput["saveId"];
