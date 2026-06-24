/// <reference types="node" />

import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";
import type { Browser, Page } from "playwright";

const CURRENT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(CURRENT_DIR, "../../../..");
const QA_OUTPUT_DIR = "/tmp/the-long-season-phase59";
const PORT = 5182;
const URL = `http://127.0.0.1:${PORT}/`;

/** Runs browser QA for the shared tactical board inside match preparation. */
async function main(): Promise<void> {
  await mkdir(QA_OUTPUT_DIR, { recursive: true });
  const server = spawn(
    "pnpm",
    ["--filter", "@game/web", "exec", "vite", "--host", "127.0.0.1", "--port", String(PORT)],
    {
      cwd: REPO_ROOT,
      stdio: "pipe",
    },
  );

  try {
    await waitForServer();
    const browser = await chromium.launch();

    try {
      await inspectDesktopBoard(browser);
      await inspectNarrowBoard(browser);
      await inspectTouchLongPress(browser);
    } finally {
      await browser.close();
    }
  } finally {
    server.kill("SIGTERM");
  }

  console.log(`Phase 59 shared-bench-board QA screenshots written to ${QA_OUTPUT_DIR}`);
}

/** Verifies desktop board layout, drag, role change, remove, assignment, and keyboard access. */
async function inspectDesktopBoard(browser: Browser): Promise<void> {
  const page = await browser.newPage({ viewport: { width: 1500, height: 960 } });

  try {
    await openMatchPreparation(page);
    await expectPhase58WorkspaceChrome(page);
    await expectEmptyBoard(page);
    await expectEmptyBenchBoard(page);
    await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/shared-bench-empty-desktop.png` });

    await page.getByRole("button", { name: "Auto" }).click();
    await expectFilledBoard(page);
    await expectFilledBenchBoard(page);
    await expectNoHorizontalOverflow(page, "desktop");
    await expectPitchVisible(page);
    await expectBoardColumnsDoNotOverlap(page);
    await expectSharedBenchBoard(page);
    await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/shared-bench-filled-desktop.png` });

    await expectMenuDismissal(page);
    await expectBenchMenuDismissal(page);
    await expectBenchRemoveAssignAndGoalkeeperBlocker(page);
    await expectGoalkeeperLocked(page);
    await expectCenterMidfielderClamp(page);
    await expectWideRoleChangeUpdatesShape(page);
    await expectRemoveAndCandidateFiltering(page);
    await expectCandidateOrdering(page);
    await expectGoalkeeperReplacementMenu(page);
    await expectTripleCentralSpacing(page);
    await expectHelperActionsFillAndClear(page);
    await page.getByRole("button", { name: "Auto" }).click();
    await expectFilledBenchBoard(page);
    await page.getByLabel("Balanced").check();
    await expectKeyboardReachability(page);
    await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/shared-bench-after-interactions-desktop.png` });
  } finally {
    await page.close();
  }
}

/** Verifies the board remains readable and non-overflowing on a narrow viewport. */
async function inspectNarrowBoard(browser: Browser): Promise<void> {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  try {
    await openMatchPreparation(page);
    await page.getByRole("button", { name: "Auto" }).click();
    await expectFilledBoard(page);
    await expectFilledBenchBoard(page);
    await expectNoHorizontalOverflow(page, "narrow");
    await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/shared-bench-narrow.png` });
  } finally {
    await page.close();
  }
}

/** Verifies touch long press opens and cancels the context menu. */
async function inspectTouchLongPress(browser: Browser): Promise<void> {
  const openPage = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  try {
    await openMatchPreparation(openPage);
    await dispatchTouchLongPress(openPage, "gk", false);
    await expectMenuVisible(openPage);
    await openPage.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/shared-bench-long-press-open.png` });
  } finally {
    await openPage.close();
  }

  const cancelPage = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  try {
    await openMatchPreparation(cancelPage);
    await dispatchTouchLongPress(cancelPage, "gk", true);
    const menuCount = await cancelPage.locator(".tls-tactical-board-menu").count();

    if (menuCount !== 0) {
      throw new Error("Expected moved long press to cancel before opening the menu.");
    }
  } finally {
    await cancelPage.close();
  }
}

/** Opens the match-preparation screen from a fresh app entry. */
async function openMatchPreparation(page: Page): Promise<void> {
  await page.goto(URL);
  await page.getByRole("button", { name: "New career" }).click();
  await page.getByRole("button", { name: "Prepare match" }).click();
  await visibleText(page, "Preparation incomplete");
  await page.locator(".tls-tactical-board-svg").waitFor({ state: "visible", timeout: 5_000 });
}

/** Checks the first board render has 11 empty slots and no assigned tokens. */
async function expectEmptyBoard(page: Page): Promise<void> {
  const emptySlots = await page.locator(".tls-tactical-board-empty-slot").count();
  const tokens = await page.locator(".tls-tactical-board-token").count();

  if (emptySlots !== 11 || tokens !== 0) {
    throw new Error(`Expected empty board 11/0, got empty=${emptySlots} token=${tokens}.`);
  }
}

/** Checks the auto-filled board has 11 assigned tokens. */
async function expectFilledBoard(page: Page): Promise<void> {
  const tokens = await page.locator(".tls-tactical-board-token").count();

  if (tokens !== 11) {
    throw new Error(`Expected 11 tactical-board tokens, got ${tokens}.`);
  }
}

/** Checks the shared bench board starts with eight empty plus slots. */
async function expectEmptyBenchBoard(page: Page): Promise<void> {
  const benchBoard = page.locator(".tls-tactical-bench-board");
  const slots = benchBoard.locator(".tls-tactical-bench-slot");
  const pluses = benchBoard.locator(".tls-tactical-bench-empty-plus");

  await benchBoard.waitFor({ state: "visible", timeout: 5_000 });

  const slotCount = await slots.count();
  const plusCount = await pluses.count();

  if (slotCount !== 8 || plusCount !== 8) {
    throw new Error(`Expected empty bench board 8 slots and 8 pluses, got slots=${slotCount} pluses=${plusCount}.`);
  }
}

/** Checks the shared bench board has eight filled substitute slots. */
async function expectFilledBenchBoard(page: Page): Promise<void> {
  const benchBoard = page.locator(".tls-tactical-bench-board");
  const slots = benchBoard.locator(".tls-tactical-bench-slot");
  const pluses = benchBoard.locator(".tls-tactical-bench-empty-plus");
  const players = benchBoard.locator(".tls-tactical-bench-player");

  await benchBoard.waitFor({ state: "visible", timeout: 5_000 });

  const slotCount = await slots.count();
  const plusCount = await pluses.count();
  const playerCount = await players.count();
  const firstSlotText = (await slots.first().textContent()) ?? "";

  if (slotCount !== 8 || plusCount !== 0 || playerCount !== 8 || !/\d/.test(firstSlotText) || !firstSlotText.includes("POR")) {
    throw new Error(
      `Expected filled bench board 8 slots/players with number surname role, got slots=${slotCount} pluses=${plusCount} players=${playerCount} first=${firstSlotText}.`,
    );
  }
}

/** Confirms Phase 58 compact workspace chrome is present in the first useful viewport. */
async function expectPhase58WorkspaceChrome(page: Page): Promise<void> {
  await page.locator(".tls-preparation-match-strip").waitFor({ state: "visible", timeout: 5_000 });
  await page.locator(".tls-preparation-alert-strip").waitFor({ state: "visible", timeout: 5_000 });
  await page.locator(".tls-preparation-board-toolbar").waitFor({ state: "visible", timeout: 5_000 });

  const oldBlockerCards = await page.locator(".tls-preparation-blockers").count();
  if (oldBlockerCards !== 0) {
    throw new Error(`Expected compact alert strip to replace old blocker cards, found ${oldBlockerCards}.`);
  }

  const geometry = await page.evaluate(() => {
    const matchStrip = document.querySelector(".tls-preparation-match-strip")?.getBoundingClientRect();
    const alertStrip = document.querySelector(".tls-preparation-alert-strip")?.getBoundingClientRect();
    const toolbar = document.querySelector(".tls-preparation-board-toolbar")?.getBoundingClientRect();

    return {
      alertStripBottom: alertStrip?.bottom ?? Number.POSITIVE_INFINITY,
      matchStripBottom: matchStrip?.bottom ?? Number.POSITIVE_INFINITY,
      toolbarTop: toolbar?.top ?? Number.POSITIVE_INFINITY,
      viewportHeight: window.innerHeight,
    };
  });

  if (geometry.matchStripBottom > geometry.viewportHeight || geometry.alertStripBottom > geometry.viewportHeight) {
    throw new Error(`Expected compact match and alert strips in first viewport, got ${JSON.stringify(geometry)}.`);
  }

  if (geometry.toolbarTop > geometry.viewportHeight) {
    throw new Error(`Expected board toolbar to be reachable in first viewport, got ${JSON.stringify(geometry)}.`);
  }
}

/** Guards against horizontal overflow in the current viewport. */
async function expectNoHorizontalOverflow(page: Page, name: string): Promise<void> {
  const geometry = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));

  if (geometry.scrollWidth > geometry.viewportWidth + 1) {
    throw new Error(`${name} viewport has horizontal overflow: ${JSON.stringify(geometry)}.`);
  }
}

/** Confirms the full pitch is usable inside the desktop viewport. */
async function expectPitchVisible(page: Page): Promise<void> {
  const box = await page.locator(".tls-tactical-board-svg").boundingBox();

  if (box === null || box.width < 320 || box.height < 520 || box.height > 930) {
    throw new Error(`Expected visible vertical pitch, got ${JSON.stringify(box)}.`);
  }
}

/** Confirms the tactical column does not visually intrude into the squad list column. */
async function expectBoardColumnsDoNotOverlap(page: Page): Promise<void> {
  const geometry = await page.evaluate(() => {
    const toolbar = document.querySelector(".tls-preparation-board-toolbar")?.getBoundingClientRect();
    const pitch = document.querySelector(".tls-tactical-board-svg")?.getBoundingClientRect();
    const squad = document.querySelector(".tls-preparation-squad-panel")?.getBoundingClientRect();

    return {
      pitchRight: pitch?.right ?? Number.POSITIVE_INFINITY,
      squadLeft: squad?.left ?? Number.NEGATIVE_INFINITY,
      toolbarRight: toolbar?.right ?? Number.POSITIVE_INFINITY,
    };
  });

  const minimumGapPx = 16;

  if (geometry.squadLeft - geometry.pitchRight < minimumGapPx || geometry.squadLeft - geometry.toolbarRight < minimumGapPx) {
    throw new Error(`Expected tactical column to stay left of squad list, got ${JSON.stringify(geometry)}.`);
  }
}

/** Confirms the shared bench board uses the tactical menu language and fixed-slot surface. */
async function expectSharedBenchBoard(page: Page): Promise<void> {
  await page.locator(".tls-tactical-bench-board").scrollIntoViewIfNeeded();
  await expectFilledBenchBoard(page);

  const firstBenchSlot = page.locator('[data-bench-slot-id="bench:01"]');
  await firstBenchSlot.click();
  await expectMenuVisible(page);

  const menuText = (await page.locator(".tls-tactical-board-menu").textContent()) ?? "";
  if (!menuText.includes("Remove from bench")) {
    throw new Error(`Expected filled bench slot to show remove-only menu, got ${menuText}.`);
  }

  await page.keyboard.press("Escape");
  await expectNoMenu(page, "bench parity cleanup");
}

/** Confirms bench menus close on outside click, background click, and Escape. */
async function expectBenchMenuDismissal(page: Page): Promise<void> {
  const firstBenchSlot = page.locator('[data-bench-slot-id="bench:01"]');

  await firstBenchSlot.click();
  await page.locator(".tls-preparation-alert-strip").click();
  await expectNoMenu(page, "bench outside click");

  await firstBenchSlot.click();
  await page.locator(".tls-tactical-board-svg").click({ position: { x: 16, y: 16 } });
  await expectNoMenu(page, "bench-to-pitch background click");

  await firstBenchSlot.click();
  await page.keyboard.press("Escape");
  await expectNoMenu(page, "bench Escape key");
}

/** Confirms bench add/remove, candidate exclusions, sorting, and goalkeeper validation. */
async function expectBenchRemoveAssignAndGoalkeeperBlocker(page: Page): Promise<void> {
  const firstBenchSlot = page.locator('[data-bench-slot-id="bench:01"]');

  await firstBenchSlot.click();
  await page.getByRole("button", { name: /Remove from bench/i }).click();
  await expectNoMenu(page, "bench remove action");

  let firstSlotText = (await firstBenchSlot.textContent()) ?? "";
  if (!firstSlotText.includes("+")) {
    throw new Error(`Expected removed bench slot to keep slot but become empty, got ${firstSlotText}.`);
  }

  await firstBenchSlot.click();
  const menu = page.locator(".tls-tactical-board-menu");
  await menu.waitFor({ state: "visible", timeout: 5_000 });
  const candidateRows = menu.locator(".tls-player-candidate-row");
  const candidateRowCount = await candidateRows.count();
  const firstCandidateText = (await candidateRows.first().textContent()) ?? "";
  const firstSuitability = await candidateRows.first().getAttribute("data-suitability");
  const menuText = (await menu.textContent()) ?? "";

  if (candidateRowCount === 0 || firstSuitability === null || !firstCandidateText.includes("%")) {
    throw new Error(
      `Expected bench assignment menu candidate rows with percent and suitability, got rows=${candidateRowCount} suitability=${firstSuitability} text=${firstCandidateText}.`,
    );
  }

  if (menuText.includes("Valentini") || menuText.includes("Sala")) {
    throw new Error(`Expected bench assignment candidates to exclude XI and already-selected bench players, got ${menuText}.`);
  }

  if (!firstCandidateText.includes("Esposito")) {
    throw new Error(`Expected highest ability/form available bench candidate first, got ${firstCandidateText}.`);
  }

  const candidateButtons = menu.locator("button:has(.tls-player-candidate-row)");
  const outfieldReplacementText = (await candidateButtons.nth(1).textContent()) ?? "";
  if (outfieldReplacementText.includes("Esposito")) {
    throw new Error(`Expected second available bench candidate to be an outfield player, got ${outfieldReplacementText}.`);
  }

  await candidateButtons.nth(1).click();
  await visibleText(page, "bench needs a goalkeeper");

  firstSlotText = (await firstBenchSlot.textContent()) ?? "";
  if (firstSlotText.includes("Esposito") || firstSlotText.includes("+")) {
    throw new Error(`Expected non-goalkeeper assignment to fill the bench slot, got ${firstSlotText}.`);
  }

  await page.getByRole("button", { name: "Auto" }).click();
  await expectFilledBenchBoard(page);
}

/** Confirms the menu closes on outside click, pitch click, Escape, and completed actions. */
async function expectMenuDismissal(page: Page): Promise<void> {
  await rightClickSlot(page, "gk");
  await page.locator(".tls-preparation-alert-strip").click();
  await expectNoMenu(page, "outside click");

  await rightClickSlot(page, "gk");
  await page.locator(".tls-tactical-board-svg").click({ position: { x: 16, y: 16 } });
  await expectNoMenu(page, "pitch background click");

  await rightClickSlot(page, "gk");
  await page.keyboard.press("Escape");
  await expectNoMenu(page, "Escape key");

  await rightClickSlot(page, "rm");
  await page.getByRole("button", { name: /Remove from lineup/i }).click();
  await expectNoMenu(page, "completed remove action");
  await page.getByRole("button", { name: "Auto" }).click();
  await expectFilledBoard(page);
}

/** Confirms the goalkeeper remains fixed when dragged. */
async function expectGoalkeeperLocked(page: Page): Promise<void> {
  const before = await slotNorm(page, "gk");
  await dragSlotToNorm(page, "gk", 0.5, 0.15);
  const after = await slotNorm(page, "gk");

  if (Math.abs(after.nx - before.nx) > 0.001 || Math.abs(after.ny - before.ny) > 0.001) {
    throw new Error(`Expected goalkeeper to stay fixed, before=${JSON.stringify(before)} after=${JSON.stringify(after)}.`);
  }
}

/** Confirms a central midfielder cannot be dragged into the attacking third. */
async function expectCenterMidfielderClamp(page: Page): Promise<void> {
  await dragSlotToNorm(page, "cm-right", 0.5, 0.1);
  const after = await slotNorm(page, "cm-right");

  if (after.ny < 0.4) {
    throw new Error(`Expected central midfielder to clamp outside attacking third, got ${JSON.stringify(after)}.`);
  }
}

/** Confirms ED can become AD after being moved forward and updates derived shape. */
async function expectWideRoleChangeUpdatesShape(page: Page): Promise<void> {
  const beforeSuitability = await slotDataAttribute(page, "rm", "suitability");

  await dragSlotToNorm(page, "rm", 0.9, 0.2);
  await rightClickSlot(page, "rm");
  await page.locator(".tls-tactical-board-menu-item").filter({ hasText: "AD" }).first().click();
  await page.locator(".tls-tactical-board-header").getByText("4-3-3", { exact: true }).waitFor({
    state: "visible",
    timeout: 5_000,
  });

  const afterRole = await slotDataAttribute(page, "rm", "role");
  const afterSuitability = await slotDataAttribute(page, "rm", "suitability");

  if (afterRole !== "AD") {
    throw new Error(`Expected moved right midfielder role to become AD, got ${afterRole}.`);
  }

  if (beforeSuitability === afterSuitability) {
    throw new Error(`Expected suitability border to change after role change, still ${afterSuitability}.`);
  }
}

/** Confirms remove keeps the slot and candidate list excludes current XI players. */
async function expectRemoveAndCandidateFiltering(page: Page): Promise<void> {
  await rightClickSlot(page, "rm");
  await page.getByRole("button", { name: /Remove from lineup/i }).click();

  const emptyRole = await page.locator('.tls-tactical-board-empty-slot[data-slot-id="rm"]').getAttribute("data-role");

  if (emptyRole !== "AD") {
    throw new Error(`Expected removed slot to keep AD role, got ${emptyRole}.`);
  }

  await page.locator('.tls-tactical-board-empty-slot[data-slot-id="rm"]').click();
  const menuText = (await page.locator(".tls-tactical-board-menu").textContent()) ?? "";

  if (menuText.includes("Valentini")) {
    throw new Error("Expected empty-slot candidates to exclude players already in the XI.");
  }

  if (!menuText.includes("Rosati")) {
    throw new Error("Expected removed player to become available for assignment.");
  }
}

/** Confirms assignment candidates are ordered by role suitability before lower-priority facts. */
async function expectCandidateOrdering(page: Page): Promise<void> {
  const suitabilityRank: Readonly<Record<string, number>> = {
    natural: 0,
    accomplished: 1,
    competent: 2,
    unconvincing: 3,
    makeshift: 4,
  };
  const suitabilities = await page.locator(".tls-tactical-board-menu .tls-player-candidate-row").evaluateAll((rows) =>
    rows.map((row) => row.getAttribute("data-suitability") ?? ""),
  );

  if (suitabilities.length === 0) {
    throw new Error("Expected assignment candidates to be visible for ordering check.");
  }

  const ranks = suitabilities.map((suitability) => suitabilityRank[suitability] ?? Number.POSITIVE_INFINITY);
  const sortedRanks = [...ranks].sort((left, right) => left - right);

  if (JSON.stringify(ranks) !== JSON.stringify(sortedRanks)) {
    throw new Error(`Expected candidates sorted by suitability, got ${suitabilities.join(",")}.`);
  }

  await page.keyboard.press("Escape");
  await expectNoMenu(page, "candidate ordering cleanup");
}

/** Confirms the fixed goalkeeper can still be replaced through the menu. */
async function expectGoalkeeperReplacementMenu(page: Page): Promise<void> {
  await rightClickSlot(page, "gk");
  const menuText = (await page.locator(".tls-tactical-board-menu").textContent()) ?? "";

  if (!menuText.includes("Esposito") || menuText.includes("Valentini")) {
    throw new Error(`Expected goalkeeper replacement menu to show non-XI keeper candidates only, got ${menuText}.`);
  }
}

/** Confirms three central midfielders and three center backs have enough horizontal spacing. */
async function expectTripleCentralSpacing(page: Page): Promise<void> {
  await page.keyboard.press("Escape");
  await page.locator(".tls-preparation-formation-select select").selectOption("4-3-3");
  await page.getByRole("button", { name: "Auto" }).click();
  await expectFilledBoard(page);
  await expectFilledBenchBoard(page);
  await expectSpread(page, ["cm-left", "cm-center", "cm-right"], "three CC");

  await page.locator(".tls-preparation-formation-select select").selectOption("3-5-2");
  await page.getByRole("button", { name: "Auto" }).click();
  await expectFilledBoard(page);
  await expectFilledBenchBoard(page);
  await expectSpread(page, ["cb-left", "cb-center", "cb-right"], "three DC");
}

/** Confirms explicit helper actions affect both XI and bench without hidden side effects. */
async function expectHelperActionsFillAndClear(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Clear" }).click();
  await expectEmptyBoard(page);
  await expectEmptyBenchBoard(page);

  await page.getByRole("button", { name: "Fill gaps" }).click();
  await expectFilledBoard(page);
  await expectFilledBenchBoard(page);
}

/** Confirms a specific slot line uses enough horizontal spacing on the board. */
async function expectSpread(page: Page, slotIds: readonly string[], label: string): Promise<void> {
  const coordinates = await Promise.all(slotIds.map((slotId) => slotNorm(page, slotId)));
  const xs = coordinates.map((coordinate) => coordinate.nx);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);

  if (maxX - minX < 0.3 || xs.some((x) => x < 0 || x > 1)) {
    throw new Error(`Expected ${label} spacing to avoid cramped slots, got ${JSON.stringify(coordinates)}.`);
  }
}

/** Confirms important controls and board tokens are reachable through keyboard focus. */
async function expectKeyboardReachability(page: Page): Promise<void> {
  await page.locator(".tls-preparation-dashboard").focus();
  const seen = {
    formation: false,
    auto: false,
    boardSlot: false,
    bench: false,
    tactic: false,
    save: false,
  };

  for (let index = 0; index < 120; index += 1) {
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => {
      const activeElement = document.activeElement;

      return {
        formation: activeElement?.matches(".tls-preparation-formation-select select") ?? false,
        auto: activeElement?.textContent?.trim() === "Auto",
        boardSlot: activeElement?.matches("[data-slot-id]") ?? false,
        bench: activeElement?.matches(".tls-tactical-bench-slot") ?? false,
        tactic: activeElement?.matches("input[name='match-preparation-tactic']") ?? false,
        save: activeElement?.matches(".tls-preparation-save button") ?? false,
      };
    });

    seen.formation ||= focused.formation;
    seen.auto ||= focused.auto;
    seen.boardSlot ||= focused.boardSlot;
    seen.bench ||= focused.bench;
    seen.tactic ||= focused.tactic;
    seen.save ||= focused.save;
  }

  if (!seen.formation || !seen.auto || !seen.boardSlot || !seen.bench || !seen.tactic || !seen.save) {
    throw new Error(`Keyboard path missed required controls: ${JSON.stringify(seen)}.`);
  }

  await page.locator('[data-bench-slot-id="bench:01"]').focus();
  await page.keyboard.press("Enter");
  await expectMenuVisible(page);

  let focusedMenuAction = false;
  for (let index = 0; index < 16; index += 1) {
    await page.keyboard.press("Tab");
    focusedMenuAction = await page.evaluate(() => document.activeElement?.closest(".tls-tactical-board-menu") !== null);

    if (focusedMenuAction) {
      break;
    }
  }

  if (!focusedMenuAction) {
    throw new Error("Expected keyboard-opened bench menu to move focus to a menu action.");
  }

  await page.keyboard.press("Escape");
  await expectNoMenu(page, "keyboard-opened bench menu cleanup");
}

/** Drags one slot to a normalized pitch coordinate and checks active-zone visibility. */
async function dragSlotToNorm(page: Page, slotId: string, nx: number, ny: number): Promise<void> {
  const start = await slotCenter(page, slotId);
  const target = await pointForNorm(page, nx, ny);
  const slotSelector = `[data-slot-id="${slotId}"]`;
  const svg = page.locator(".tls-tactical-board-svg");

  await page.locator(slotSelector).first().dispatchEvent("pointerdown", {
    bubbles: true,
    button: 0,
    buttons: 1,
    clientX: start.x,
    clientY: start.y,
    isPrimary: true,
    pointerId: 11,
    pointerType: "mouse",
  });
  await svg.dispatchEvent("pointermove", {
    bubbles: true,
    button: 0,
    buttons: 1,
    clientX: target.x,
    clientY: target.y,
    isPrimary: true,
    pointerId: 11,
    pointerType: "mouse",
  });

  if (slotId !== "gk") {
    await page.locator(".tls-tactical-board-active-zone").waitFor({ state: "attached", timeout: 5_000 });
  }

  await svg.dispatchEvent("pointerup", {
    bubbles: true,
    button: 0,
    buttons: 0,
    clientX: target.x,
    clientY: target.y,
    isPrimary: true,
    pointerId: 11,
    pointerType: "mouse",
  });

  const finalZoneCount = await page.locator(".tls-tactical-board-active-zone").count();
  if (finalZoneCount !== 0) {
    throw new Error(`Expected movement zone to disappear after release, got ${finalZoneCount}.`);
  }
}

/** Opens the context menu for one slot with a right click. */
async function rightClickSlot(page: Page, slotId: string): Promise<void> {
  const center = await slotCenter(page, slotId);

  await page.locator(`[data-slot-id="${slotId}"]`).first().dispatchEvent("contextmenu", {
    bubbles: true,
    button: 2,
    buttons: 2,
    clientX: center.x,
    clientY: center.y,
  });
  await expectMenuVisible(page);
}

/** Dispatches a touch long-press sequence against one slot. */
async function dispatchTouchLongPress(page: Page, slotId: string, shouldMove: boolean): Promise<void> {
  const center = await slotCenter(page, slotId);
  const selector = `[data-slot-id="${slotId}"]`;

  await page.locator(selector).dispatchEvent("pointerdown", {
    bubbles: true,
    button: 0,
    buttons: 1,
    clientX: center.x,
    clientY: center.y,
    isPrimary: true,
    pointerId: 57,
    pointerType: "touch",
  });

  if (shouldMove) {
    await page.locator(selector).dispatchEvent("pointermove", {
      bubbles: true,
      button: 0,
      buttons: 1,
      clientX: center.x + 30,
      clientY: center.y + 30,
      isPrimary: true,
      pointerId: 57,
      pointerType: "touch",
    });
  }

  await page.waitForTimeout(650);
  await page.locator(selector).dispatchEvent("pointerup", {
    bubbles: true,
    button: 0,
    buttons: 0,
    clientX: center.x,
    clientY: center.y,
    isPrimary: true,
    pointerId: 57,
    pointerType: "touch",
  });
}

/** Returns one slot center in viewport pixels. */
async function slotCenter(page: Page, slotId: string): Promise<{ readonly x: number; readonly y: number }> {
  const box = await page
    .locator(
      `[data-slot-id="${slotId}"] .tls-tactical-board-token-face, [data-slot-id="${slotId}"] .tls-tactical-board-empty-slot-ring`,
    )
    .first()
    .boundingBox();

  if (box === null) {
    throw new Error(`Missing tactical-board slot center ${slotId}.`);
  }

  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/** Returns the viewport point for one normalized board coordinate. */
async function pointForNorm(page: Page, nx: number, ny: number): Promise<{ readonly x: number; readonly y: number }> {
  const box = await page.locator(".tls-tactical-board-svg").boundingBox();

  if (box === null) {
    throw new Error("Missing tactical-board SVG.");
  }

  return {
    x: box.x + ((60 + nx * 680) / 800) * box.width,
    y: box.y + ((60 + ny * 1050) / 1170) * box.height,
  };
}

/** Reads one slot's normalized coordinate from the SVG transform. */
async function slotNorm(page: Page, slotId: string): Promise<{ readonly nx: number; readonly ny: number }> {
  const transform = await page.locator(`[data-slot-id="${slotId}"]`).first().getAttribute("transform");
  const match = /translate\(([-\d.]+) ([-\d.]+)\)/.exec(transform ?? "");

  if (match === null) {
    throw new Error(`Could not read transform for ${slotId}: ${transform}`);
  }

  const x = Number(match[1]);
  const y = Number(match[2]);

  return {
    nx: (x - 60) / 680,
    ny: (y - 60) / 1050,
  };
}

/** Reads one `data-*` attribute from the current slot element. */
async function slotDataAttribute(page: Page, slotId: string, attributeName: string): Promise<string | null> {
  return page.locator(`[data-slot-id="${slotId}"]`).first().getAttribute(`data-${attributeName}`);
}

/** Confirms the board context menu is visible. */
async function expectMenuVisible(page: Page): Promise<void> {
  await page.locator(".tls-tactical-board-menu").waitFor({ state: "visible", timeout: 5_000 });
}

/** Confirms no tactical-board menu remains open after a dismissal path. */
async function expectNoMenu(page: Page, reason: string): Promise<void> {
  await page.waitForTimeout(100);
  const menuCount = await page.locator(".tls-tactical-board-menu").count();

  if (menuCount !== 0) {
    throw new Error(`Expected menu to close after ${reason}, got ${menuCount}.`);
  }
}

/** Waits for visible text without requiring an exact text-node match. */
async function visibleText(page: Page, text: string): Promise<void> {
  await page.getByText(text, { exact: false }).first().waitFor({ state: "visible", timeout: 5_000 });
}

/** Polls the Vite dev server until the local app is available. */
async function waitForServer(): Promise<void> {
  const deadline = Date.now() + 15_000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(URL);

      if (response.ok) {
        return;
      }
    } catch {
      // Retry until Vite is ready.
    }

    await new Promise((resolveWait) => {
      setTimeout(resolveWait, 250);
    });
  }

  throw new Error(`Timed out waiting for web app at ${URL}`);
}

await main();
