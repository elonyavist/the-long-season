/// <reference types="node" />

import { spawn, type ChildProcess } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { expect, test, type Browser, type Locator, type Page } from "playwright/test";

const CURRENT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(CURRENT_DIR, "../../../..");
const QA_OUTPUT_DIR = "/tmp/the-long-season-phase73b/step-10";
const PORT = 5197;
const URL = `http://127.0.0.1:${PORT}/`;
let server: ChildProcess;

test.describe.configure({ mode: "serial" });
test.setTimeout(120_000);

test.beforeAll(async () => {
  await mkdir(QA_OUTPUT_DIR, { recursive: true });
  server = spawn(
    "pnpm",
    ["--filter", "@game/web", "exec", "vite", "--host", "127.0.0.1", "--port", String(PORT)],
    { cwd: REPO_ROOT, stdio: "pipe" },
  );
  await waitForServer();
});

test.afterAll(() => {
  server.kill("SIGTERM");
});

test("app entry communicates football identity and every shared lifecycle state", async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await resetCareerStorage(page);
    await assertViewportCentered(page, ".tls-app-entry-panel");
    await expect(page.locator(".tls-app-entry-football-mark i")).toHaveCount(11);
    await expect(page.locator(".tls-app-entry-state[data-state='empty']")).toBeVisible();
    await assertNoPageOverflow(page, "desktop App Entry empty state");
    await capture(page, "00-app-entry-empty-desktop");

    await page.evaluate(async () => {
      const modulePath = "/src/stores/career-ui-store.ts";
      const { useCareerUiStore } = await import(/* @vite-ignore */ modulePath);
      useCareerUiStore.getState().beginSaveDiscovery();
    });
    await expect(page.locator(".tls-app-entry-state[data-state='loading']")).toBeVisible();
    await capture(page, "00a-app-entry-loading-desktop");

    await page.evaluate(async () => {
      const modulePath = "/src/stores/career-ui-store.ts";
      const { useCareerUiStore } = await import(/* @vite-ignore */ modulePath);
      const store = useCareerUiStore.getState();
      store.receiveAvailableSaves([]);
      store.failCareerStorage({ code: "storage_unavailable" }, "app_entry");
    });
    const recovery = page.locator(".tls-storage-recovery[data-state='recovery']");
    await expect(recovery).toBeVisible();
    await expect(recovery).toBeFocused();
    await capture(page, "00b-app-entry-recovery-desktop");

    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    await assertNoPageOverflow(page, "desktop App Entry recovery at 200% text");
    await capture(page, "00c-app-entry-recovery-text-zoom");
  } finally {
    await page.close();
  }
});

test("desktop journey owns screen focus and preserves same-screen interaction focus", async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await resetCareerStorage(page);
    await capture(page, "01-app-entry-desktop");

    await page.getByRole("button", { name: "New career", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Dashboard", exact: true })).toBeVisible();
    await expectMainFocus(page);
    await assertNoPageOverflow(page, "desktop Dashboard");
    await assertNoTechnicalDashboardCopy(page, "desktop attention Dashboard");
    await capture(page, "02-dashboard-attention-desktop");

    await page.locator("body").click({ position: { x: 2, y: 2 } });
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to current task", exact: true });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press("Enter");
    await expectMainFocus(page);

    await page.getByRole("button", { name: "Inbox", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Inbox", exact: true })).toBeVisible();
    await expectMainFocus(page);
    await capture(page, "03-inbox-desktop");

    const sameScreenFilter = page.getByRole("button", { name: "To handle", exact: true });
    await sameScreenFilter.click();
    await expect(sameScreenFilter).toBeFocused();
    await expect(page.locator("#tls-career-main h1").first()).not.toBeFocused();

    await page.getByRole("button", { name: "Prepare match", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Match preparation", exact: true })).toBeVisible();
    await expectMainFocus(page);
    await capture(page, "04-preparation-desktop");

    const preparationAction = page.getByRole("button", { name: "Auto", exact: true });
    await preparationAction.focus();
    await expect(preparationAction).toBeFocused();
    await page.locator(".tls-tactical-board-empty-slot").first().click();
    await expect(page.locator(".tls-tactical-board-menu")).toBeVisible();
    await page.getByRole("heading", { name: "Tactical board", exact: true }).click();
    await expect(page.locator(".tls-tactical-board-menu")).toHaveCount(0);
    await expect(page.locator("#tls-career-main h1").first()).not.toBeFocused();

    await prepareMatch(page, true);
    await expect(page.getByText("Pre-match", { exact: true }).first()).toBeVisible();
    await expectMainFocus(page);
    await assertNoPageOverflow(page, "desktop Matchday");
    await capture(page, "05-matchday-desktop");
  } finally {
    await page.close();
  }
});

test("wide journey keeps every current football decision surface coherent", async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  try {
    await resetCareerStorage(page);
    await capture(page, "17-app-entry-wide");

    await page.getByRole("button", { name: "New career", exact: true }).click();
    await assertNoPageOverflow(page, "wide Dashboard");
    await capture(page, "18-dashboard-wide");

    await page.getByRole("button", { name: "Inbox", exact: true }).click();
    await assertNoPageOverflow(page, "wide Inbox");
    await capture(page, "19-inbox-wide");

    await page.getByRole("button", { name: "Prepare match", exact: true }).click();
    await page.getByRole("button", { name: "Auto", exact: true }).click();
    await assertNoPageOverflow(page, "wide Preparation");
    await capture(page, "19a-preparation-wide");

    await page.getByRole("tab", { name: "Tactic", exact: true }).click();
    await page.getByRole("radio", { name: /^Balanced / }).check();
    await page.getByRole("button", { name: "Confirm and go to match", exact: true }).click();
    await capture(page, "19b-pre-match-wide");

    await page.clock.install();
    await page.getByRole("button", { name: "Start match", exact: true }).click();
    await expect(page.locator("[data-playback-stage='opening']")).toBeVisible();
    await capture(page, "19c-first-half-wide");
    await advanceClockUntilPlaybackStage(page, "closing");
    await page.clock.runFor(500);
    await capture(page, "19d-half-time-wide");

    await page.getByRole("button", { name: "Start second half", exact: true }).click();
    await expect(page.locator("[data-playback-stage='opening']")).toBeVisible();
    await capture(page, "19e-second-half-wide");
    await advanceClockUntilPlaybackStage(page, "closing");
    await page.clock.runFor(500);
    await expect(page.getByRole("button", { name: "Return to dashboard", exact: true })).toBeVisible();
    await assertNoPageOverflow(page, "wide Full time");
    await capture(page, "19f-full-time-wide");
    await page.clock.resume();
  } finally {
    await page.close();
  }
});

test("semantic states pass contrast and remain visibly distinct without tactical changes", async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await resetCareerStorage(page);
    await page.getByRole("button", { name: "New career", exact: true }).click();

    const blocker = page.locator(".tls-dashboard-priority[data-task-state='attention'] .tls-dashboard-readiness li").first();
    await expect(blocker).toBeVisible();
    expect(await foregroundContrast(blocker, ".tls-dashboard-priority")).toBeGreaterThanOrEqual(4.5);

    const disabledFutureNavigation = page.locator(".tls-app-shell-nav-item[data-status='disabled']").first();
    await expect(disabledFutureNavigation).toHaveJSProperty("tagName", "SPAN");
    const disabledStyle = await disabledFutureNavigation.evaluate((element) => {
      const style = getComputedStyle(element);
      return { background: style.backgroundColor, boxShadow: style.boxShadow, border: style.borderTopColor };
    });
    expect(disabledStyle.background).toBe("rgba(0, 0, 0, 0)");
    expect(disabledStyle.boxShadow).toBe("none");
    expect(disabledStyle.border).toBe("rgba(0, 0, 0, 0)");

    const primaryAction = page.locator(".tls-dashboard-primary-action");
    await primaryAction.hover();
    await capture(page, "12-dashboard-semantic-hover-focus");
    await page.locator("#tls-career-main h1").focus();
    await page.keyboard.press("Tab");
    await expect(primaryAction).toBeFocused();
    expect(await primaryAction.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe("none");

    await setPendingCommand(page, true);
    await expect(primaryAction).toHaveAttribute("data-state", "pending");
    await expect(primaryAction).toBeDisabled();
    await capture(page, "13-dashboard-semantic-pending");
    await setPendingCommand(page, false);

    await page.evaluate(async () => {
      const modulePath = "/src/stores/career-ui-store.ts";
      const { useCareerUiStore } = await import(/* @vite-ignore */ modulePath);
      useCareerUiStore.getState().failCareerStorage({ code: "save_unwritable" }, "current_career");
    });
    const recovery = page.locator(".tls-storage-recovery[data-state='recovery']");
    await expect(recovery).toBeVisible();
    await expect(recovery).toBeFocused();
    await capture(page, "14-dashboard-semantic-recovery");
  } finally {
    await page.close();
  }
});

test("desktop dashboard keeps one decision hierarchy across every valid operational state", async ({ browser }) => {
  await captureDashboardStates(browser, { width: 1440, height: 900 }, "desktop");
});

test("narrow dashboard keeps one decision hierarchy across every valid operational state", async ({ browser }) => {
  await captureDashboardStates(browser, { width: 390, height: 844 }, "narrow");
});

test("desktop Posta owns one dense decision workspace across current message states", async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await resetCareerStorage(page);
    await page.getByRole("button", { name: "New career", exact: true }).click();
    await page.getByRole("button", { name: "Inbox", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Inbox", exact: true })).toBeVisible();
    await expect(page.locator(".tls-app-shell-posta")).toHaveCount(0);
    await expect(page.locator(".tls-app-shell-right-rail")).toHaveCount(0);
    await expect(page.locator(".tls-inbox-list-pane")).toBeVisible();
    await expect(page.locator(".tls-inbox-detail-pane")).toBeVisible();
    await expect(page.locator(".tls-inbox-message-detail[data-level='blocking']")).toBeVisible();
    await expect(page.locator(".tls-inbox-detail-action .tls-menu-button-primary")).toHaveCount(1);
    await capture(page, "30-inbox-blocking-desktop");

    await setCurrentPostaScenario(page, "important");
    await expect(page.locator(".tls-inbox-message-detail[data-level='important']")).toBeVisible();
    await expect(page.locator(".tls-inbox-message-detail[data-status-key$='.read']")).toBeVisible();
    await capture(page, "31-inbox-important-read-desktop");

    await setCurrentPostaScenario(page, "informational");
    await expect(page.locator(".tls-inbox-message-detail[data-level='informational']")).toBeVisible();
    await expect(page.locator(".tls-inbox-detail-action .tls-menu-button-primary")).toHaveCount(0);
    await capture(page, "32-inbox-informational-desktop");

    await setCurrentPostaScenario(page, "resolved");
    await expect(page.locator(".tls-inbox-message-detail[data-status-key$='.resolved']")).toBeVisible();
    await expect(page.locator(".tls-inbox-detail-action .tls-menu-button-primary")).toHaveCount(0);
    await capture(page, "33-inbox-resolved-desktop");

    await page.getByRole("button", { name: "Unread", exact: true }).click();
    await expect(page.getByText("No messages match this filter.", { exact: true })).toBeVisible();
    await capture(page, "34-inbox-empty-filter-desktop");

    await page.getByRole("button", { name: "All", exact: true }).click();
    await setPendingCommand(page, true);
    await expect(page.locator(".tls-inbox-screen")).toHaveAttribute("data-state", "pending");
    await expect(page.getByRole("button", { name: "All", exact: true })).toBeDisabled();
    await capture(page, "35-inbox-loading-desktop");
    await setPendingCommand(page, false);

    await page.evaluate(async () => {
      const modulePath = "/src/stores/career-ui-store.ts";
      const { useCareerUiStore } = await import(/* @vite-ignore */ modulePath);
      useCareerUiStore.getState().failCareerStorage({ code: "save_unwritable" }, "current_career");
    });
    await expect(page.locator(".tls-storage-recovery[data-state='recovery']")).toBeVisible();
    await capture(page, "36-inbox-recovery-desktop");
    await assertNoPageOverflow(page, "desktop Posta state sequence");
  } finally {
    await page.close();
  }
});

test("narrow Posta starts from the list and restores focus after detail", async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    await resetCareerStorage(page);
    await page.getByRole("button", { name: "New career", exact: true }).click();
    await page.getByRole("combobox", { name: "Career navigation", exact: true }).selectOption("inbox");
    await expect(page.locator(".tls-inbox-list-pane")).toBeVisible();
    await expect(page.locator(".tls-inbox-detail-pane")).toBeHidden();
    await expect(page.locator(".tls-app-shell-posta")).toHaveCount(0);
    await capture(page, "37-inbox-list-narrow");

    const selectedMessage = page.locator(".tls-inbox-message-row[aria-current='true']");
    await selectedMessage.click();
    const detailTitle = page.locator("[data-inbox-detail-title]");
    await expect(detailTitle).toBeVisible();
    await expect(detailTitle).toBeFocused();
    await capture(page, "38-inbox-detail-narrow");

    await page.getByRole("button", { name: "Back to messages", exact: true }).click();
    await expect(page.locator(".tls-inbox-list-pane")).toBeVisible();
    await expect(selectedMessage).toBeFocused();

    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    await expect(page.locator(".tls-inbox-list-pane")).toBeVisible();
    await assertNoPageOverflow(page, "narrow Posta at 200% text");
    await capture(page, "39-inbox-list-text-zoom-narrow");
  } finally {
    await page.close();
  }
});

test("preparation drafts stay explicit across stay, discard, save, and reload", async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await resetCareerStorage(page);
    await page.getByRole("button", { name: "New career", exact: true }).click();
    await page.getByRole("button", { name: "Prepare match", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Match preparation", exact: true })).toBeVisible();
    await expect(page.locator(".tls-preparation-draft-state")).toHaveCount(0);
    await expect(page.locator(".tls-preparation-alert-strip")).toHaveCount(1);
    await capture(page, "40-preparation-empty-desktop");

    await page.getByRole("button", { name: "Auto", exact: true }).click();
    await expect(page.locator(".tls-preparation-draft-state[data-state='unsaved']")).toBeVisible();
    await expect(page.getByRole("button", { name: "Confirm and go to match", exact: true })).toBeDisabled();
    expect(await dispatchBeforeUnload(page)).toBe(true);
    await capture(page, "41-preparation-partial-dirty-desktop");

    const partialFingerprint = await currentPreparationFingerprint(page);
    await page.locator(".tls-preparation-dashboard").click();
    const partialDialog = page.locator(".tls-unsaved-dialog");
    await expect(partialDialog.getByRole("heading", { name: "Leave team preparation?", exact: true })).toBeVisible();
    await expect(partialDialog.getByRole("button", { name: "Stay", exact: true })).toBeFocused();
    await expect(partialDialog.getByRole("button", { name: "Discard changes", exact: true })).toBeVisible();
    await expect(partialDialog.getByRole("button", { name: "Save and continue", exact: true })).toHaveCount(0);
    await capture(page, "42-preparation-partial-dialog-desktop");
    await partialDialog.getByRole("button", { name: "Stay", exact: true }).click();
    expect(await currentPreparationFingerprint(page)).toBe(partialFingerprint);

    await page.locator(".tls-preparation-dashboard").click();
    await partialDialog.getByRole("button", { name: "Discard changes", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Dashboard", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Prepare match", exact: true }).click();
    await expect(page.locator(".tls-preparation-draft-state")).toHaveCount(0);
    await expect(page.locator(".tls-tactical-board-token")).toHaveCount(0);

    await page.getByRole("button", { name: "Auto", exact: true }).click();
    await page.getByRole("tab", { name: "Tactic", exact: true }).click();
    await page.getByRole("radio", { name: /^Balanced / }).check();
    await expect(page.getByRole("button", { name: "Confirm and go to match", exact: true })).toBeEnabled();
    await expect(page.locator(".tls-preparation-alert-strip[data-state='success']")).toBeVisible();
    await capture(page, "43-preparation-complete-dirty-desktop");

    const displacedGoalkeeper = await replaceBenchGoalkeeper(page);
    await expect(page.getByText("bench needs a goalkeeper", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Confirm and go to match", exact: true })).toBeDisabled();
    await capture(page, "44-preparation-invalid-desktop");
    await restoreBenchGoalkeeper(page, displacedGoalkeeper);
    await expect(page.getByRole("button", { name: "Confirm and go to match", exact: true })).toBeEnabled();

    await setPendingCommand(page, true);
    await expect(page.locator(".tls-preparation-panel")).toHaveAttribute("data-state", "pending");
    await capture(page, "45-preparation-pending-desktop");
    await setPendingCommand(page, false);

    await page.getByRole("button", { name: "Inbox", exact: true }).click();
    const completeDialog = page.locator(".tls-unsaved-dialog");
    await expect(completeDialog.getByRole("button", { name: "Save and continue", exact: true })).toBeVisible();
    await capture(page, "46-preparation-complete-dialog-desktop");
    await completeDialog.getByRole("button", { name: "Save and continue", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Inbox", exact: true })).toBeVisible();

    await page.reload({ waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Continue career", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Dashboard", exact: true })).toBeVisible();
    await openPreparationRoute(page);
    await expect(page.getByRole("heading", { name: "Match preparation", exact: true })).toBeVisible();
    await expect(page.locator(".tls-preparation-draft-state")).toHaveCount(0);
    await expect(page.locator(".tls-tactical-board-token")).toHaveCount(11);
    await expect(page.getByRole("button", { name: "Confirm and go to match", exact: true })).toBeEnabled();
    expect(await dispatchBeforeUnload(page)).toBe(false);
    await capture(page, "47-preparation-saved-reloaded-desktop");
    await page.evaluate(async () => {
      const modulePath = "/src/stores/career-ui-store.ts";
      const { useCareerUiStore } = await import(/* @vite-ignore */ modulePath);
      useCareerUiStore.getState().failCareerStorage({ code: "save_unwritable" }, "current_career");
    });
    await expect(page.locator(".tls-storage-recovery[data-state='recovery']")).toBeVisible();
    await capture(page, "48-preparation-error-desktop");
    await assertNoPageOverflow(page, "saved preparation desktop");
  } finally {
    await page.close();
  }
});

test("narrow preparation keeps validation, board, and dirty dialog usable", async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    await resetCareerStorage(page);
    await page.getByRole("button", { name: "New career", exact: true }).click();
    await page.getByRole("button", { name: "Prepare match", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Match preparation", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Auto", exact: true }).click();
    await expect(page.locator(".tls-preparation-draft-state")).toBeVisible();
    await assertNoPageOverflow(page, "partial preparation narrow");
    await capture(page, "49-preparation-partial-narrow");

    await page.locator(".tls-preparation-dashboard").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await assertNoPageOverflow(page, "preparation dialog narrow");
    await capture(page, "50-preparation-dialog-narrow");
    await page.getByRole("button", { name: "Stay", exact: true }).click();

    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    await expect(page.locator(".tls-preparation-decision-bar")).toBeVisible();
    await assertNoPageOverflow(page, "preparation narrow at 200% text");
    await capture(page, "51-preparation-text-zoom-narrow");
  } finally {
    await page.close();
  }
});

test("approved tactical-board interactions remain intact inside the current preparation route", async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await resetCareerStorage(page);
    await page.getByRole("button", { name: "New career", exact: true }).click();
    await page.getByRole("button", { name: "Prepare match", exact: true }).click();
    await page.getByRole("button", { name: "Auto", exact: true }).click();
    await expect(page.locator(".tls-tactical-board-token")).toHaveCount(11);
    await expect(page.locator(".tls-tactical-bench-slot[data-status='valid']")).toHaveCount(8);
    expect(await selectedPreparationIds(page)).toMatchObject({ total: 19, unique: 19 });

    await rightClickTacticalSlot(page, "gk");
    await page.keyboard.press("Escape");
    await expect(page.locator(".tls-tactical-board-menu")).toHaveCount(0);
    await rightClickTacticalSlot(page, "gk");
    await page.getByRole("heading", { name: "Tactical board", exact: true }).click();
    await expect(page.locator(".tls-tactical-board-menu")).toHaveCount(0);

    const goalkeeperBefore = await tacticalSlotNorm(page, "gk");
    await dragTacticalSlotToNorm(page, "gk", 0.5, 0.15);
    expect(await tacticalSlotNorm(page, "gk")).toEqual(goalkeeperBefore);

    await dragTacticalSlotToNorm(page, "cm-right", 0.5, 0.1);
    expect((await tacticalSlotNorm(page, "cm-right")).ny).toBeGreaterThanOrEqual(0.4);

    const previousSuitability = await page.locator("[data-slot-id='rm']").first().getAttribute("data-suitability");
    await dragTacticalSlotToNorm(page, "rm", 0.9, 0.2);
    await rightClickTacticalSlot(page, "rm");
    await page.locator(".tls-tactical-board-menu-item").filter({ hasText: "AD" }).first().click();
    await expect(page.locator("[data-slot-id='rm'][data-role='AD']")).toHaveCount(1);
    await expect(page.locator(".tls-tactical-board-header").getByText("4-3-3", { exact: true })).toBeVisible();
    expect(await page.locator("[data-slot-id='rm']").first().getAttribute("data-suitability")).not.toBe(previousSuitability);

    await rightClickTacticalSlot(page, "rm");
    await page.getByRole("button", { name: /Remove from lineup/i }).click();
    await page.locator(".tls-tactical-board-empty-slot[data-slot-id='rm']").click();
    const suitabilityOrder = await page.locator(".tls-player-candidate-row").evaluateAll((rows) =>
      rows.map((row) => row.getAttribute("data-suitability") ?? ""),
    );
    expect(suitabilityOrder.length).toBeGreaterThan(0);
    expect(suitabilityOrder.map(tacticalSuitabilityRank)).toEqual(
      [...suitabilityOrder].map(tacticalSuitabilityRank).sort((left, right) => left - right),
    );
    await page.keyboard.press("Escape");

    const firstBenchSlot = page.locator("[data-bench-slot-id='bench:01']");
    await firstBenchSlot.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(".tls-tactical-board-menu")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator(".tls-tactical-board-menu")).toHaveCount(0);
    await capture(page, "52-tactical-board-interactions-desktop");
  } finally {
    await page.close();
  }
});

test("tactical-board long press opens deliberately and cancels after touch movement", async ({ browser }) => {
  const openPage = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  try {
    await resetCareerStorage(openPage);
    await openPage.getByRole("button", { name: "New career", exact: true }).click();
    await openPage.getByRole("button", { name: "Prepare match", exact: true }).click();
    await openPage.getByRole("button", { name: "Auto", exact: true }).click();
    await dispatchTacticalLongPress(openPage, "gk", false);
    await expect(openPage.locator(".tls-tactical-board-menu")).toBeVisible();
    await capture(openPage, "53-tactical-board-long-press-narrow");
  } finally {
    await openPage.close();
  }

  const cancelPage = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  try {
    await resetCareerStorage(cancelPage);
    await cancelPage.getByRole("button", { name: "New career", exact: true }).click();
    await cancelPage.getByRole("button", { name: "Prepare match", exact: true }).click();
    await cancelPage.getByRole("button", { name: "Auto", exact: true }).click();
    await dispatchTacticalLongPress(cancelPage, "gk", true);
    await expect(cancelPage.locator(".tls-tactical-board-menu")).toHaveCount(0);
  } finally {
    await cancelPage.close();
  }
});

test("narrow task stays in the first useful viewport at zoom and reduced motion", async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    await resetCareerStorage(page);
    await capture(page, "06-app-entry-narrow");

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.getByRole("button", { name: "New career", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Dashboard", exact: true })).toBeVisible();
    await expectMainFocus(page);
    await assertTaskInFirstViewport(page, "narrow Dashboard");
    await assertNoPageOverflow(page, "narrow Dashboard");
    await assertNoTechnicalDashboardCopy(page, "narrow attention Dashboard");
    await capture(page, "07-dashboard-attention-narrow");

    const navigation = page.getByRole("combobox", { name: "Career navigation", exact: true });
    await expect(navigation).toBeVisible();
    await navigation.selectOption("inbox");
    await expect(page.getByRole("heading", { level: 1, name: "Inbox", exact: true })).toBeVisible();
    await expectMainFocus(page);
    await assertTaskInFirstViewport(page, "narrow Inbox");
    await capture(page, "08-inbox-narrow");

    await page.locator(".tls-inbox-message-row[aria-current='true']").click();
    await expect(page.locator("[data-inbox-detail-title]")).toBeFocused();
    await page.getByRole("button", { name: "Prepare match", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Match preparation", exact: true })).toBeVisible();
    await expectMainFocus(page);
    await assertTaskInFirstViewport(page, "narrow Preparation");
    await capture(page, "09-preparation-narrow");

    await prepareMatch(page);
    await expect(page.getByText("Pre-match", { exact: true }).first()).toBeVisible();
    await expectMainFocus(page);
    await assertTaskInFirstViewport(page, "narrow Matchday");
    await capture(page, "10-matchday-narrow");

    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    await assertNoPageOverflow(page, "narrow Matchday at 200% text");
    await expect(page.getByRole("combobox", { name: "Career navigation", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Start match", exact: true })).toBeVisible();
    await capture(page, "11-matchday-text-zoom-narrow");
  } finally {
    await page.close();
  }
});

test("one explicit start command presents the first half and stops at the canonical checkpoint", async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await resetCareerStorage(page);
    await page.getByRole("button", { name: "New career", exact: true }).click();
    await page.getByRole("button", { name: "Prepare match", exact: true }).click();
    await prepareMatch(page);
    await expect(page.getByRole("button", { name: "Start match", exact: true })).toBeVisible();
    await capture(page, "60-matchday-pre-match");

    await setMatchdayCommandActivity(page, "pending");
    await expect(page.locator(".tls-matchday-panel")).toHaveAttribute("aria-busy", "true");
    await capture(page, "61-matchday-start-pending");
    await setMatchdayCommandActivity(page, "failed");
    await capture(page, "62-matchday-start-failure");
    await setMatchdayCommandActivity(page, "clear");

    await page.clock.install();
    await page.getByRole("button", { name: "Start match", exact: true }).click();
    await expect(page.locator("[data-playback-stage='opening']")).toBeVisible();
    await capture(page, "63-first-half-opening");
    await advanceClockUntilPlaybackStage(page, "event");
    await capture(page, "64-first-half-event");
    await advanceClockUntilPlaybackStage(page, "closing");
    await capture(page, "65-first-half-closing");
    await page.clock.runFor(500);

    await expect(page.getByRole("button", { name: "Start second half", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Play to half-time", exact: true })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "First-half review", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Decision signals", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Half-time board", exact: true })).toBeVisible();
    await expect(page.getByText("Current shape", { exact: true })).toHaveCount(1);
    await expect(page.getByText("0/5 changes", { exact: true })).toHaveCount(1);
    await expect(page.getByText("Half-time score", { exact: true })).toHaveCount(0);
    await expect.poll(() => activeMatchCheckpoint(page)).toMatchObject({ phase: "half_time" });
    await assertNoPageOverflow(page, "desktop half-time checkpoint");
    await assertHalfTimeInteractiveTargets(page);
    await capture(page, "66-half-time-arrival");

    await setHalfTimeEventLight(page);
    await expect(page.getByText("No major events yet.", { exact: true })).toBeVisible();
    await assertNoPageOverflow(page, "desktop event-light half-time checkpoint");
    await capture(page, "66b-half-time-event-light");

    await page.clock.resume();
    page.once("dialog", (dialog) => dialog.accept());
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.getByTestId("app-entry-screen")).toBeVisible();
    await page.getByRole("button", { name: "Continue career", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Dashboard", exact: true })).toBeVisible();
    await expect.poll(() => durableMatchFacts(page)).toEqual({ activeCheckpoint: false, playedFixtures: 0 });
  } finally {
    await page.close();
  }
});

test("reduced motion reaches the same half-time decision without interpolated clicks", async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    await resetCareerStorage(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.getByRole("button", { name: "New career", exact: true }).click();
    await page.getByRole("button", { name: "Prepare match", exact: true }).click();
    await prepareMatch(page);
    await page.getByRole("button", { name: "Start match", exact: true }).click();

    await expect(page.getByRole("button", { name: "Start second half", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Play to half-time", exact: true })).toHaveCount(0);
    await expect.poll(() => activeMatchCheckpoint(page)).toMatchObject({ phase: "half_time" });
    await assertNoPageOverflow(page, "reduced-motion half-time checkpoint");
    await assertHalfTimeInteractiveTargets(page);
    await capture(page, "67-half-time-reduced-motion-narrow");

    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    await assertNoPageOverflow(page, "reduced-motion half-time checkpoint at 200% text");
    await capture(page, "67b-half-time-text-zoom-narrow");
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "";
    });

    await page.getByRole("button", { name: "Start second half", exact: true }).click();
    await expect(page.getByRole("button", { name: "Return to dashboard", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Play to full time", exact: true })).toHaveCount(0);
    await expect.poll(() => durableMatchFacts(page)).toEqual({ activeCheckpoint: false, playedFixtures: 1 });
    await assertFullTimeFootballReview(page, "reduced-motion full-time review");
    await assertNoPageOverflow(page, "reduced-motion full-time review");
    await capture(page, "68-full-time-reduced-motion-narrow");

    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    await assertFullTimeFootballReview(page, "reduced-motion full-time review at 200% text");
    await assertNoPageOverflow(page, "reduced-motion full-time review at 200% text");
    await capture(page, "68b-full-time-text-zoom-narrow");
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "";
    });
  } finally {
    await page.close();
  }
});

test("one half-time confirmation presents the second half and arrives at full time once", async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await resetCareerStorage(page);
    await page.getByRole("button", { name: "New career", exact: true }).click();
    await page.getByRole("button", { name: "Prepare match", exact: true }).click();
    await prepareMatch(page);
    await page.clock.install();
    await page.getByRole("button", { name: "Start match", exact: true }).click();
    await advanceClockUntilPlaybackStage(page, "closing");
    await page.clock.runFor(500);
    await expect(page.getByRole("button", { name: "Start second half", exact: true })).toBeVisible();

    await setMatchdayCommandActivity(page, "pending", "play_second_half");
    await capture(page, "69-second-half-start-pending");
    await setMatchdayCommandActivity(page, "failed", "play_second_half");
    await capture(page, "70-second-half-start-failure");
    await setMatchdayCommandActivity(page, "clear", "play_second_half");

    await page.getByRole("button", { name: "Start second half", exact: true }).click();
    await expect(page.locator("[data-playback-stage='opening']")).toBeVisible();
    await expect(page.getByRole("button", { name: "Play to full time", exact: true })).toHaveCount(0);
    await capture(page, "71-second-half-opening");
    await advanceClockUntilPlaybackStage(page, "event");
    await capture(page, "72-second-half-event");
    await advanceClockUntilPlaybackStage(page, "closing");
    await capture(page, "73-second-half-closing");
    await page.clock.runFor(500);

    await expect(page.getByRole("button", { name: "Return to dashboard", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Play to full time", exact: true })).toHaveCount(0);
    await expect.poll(() => durableMatchFacts(page)).toEqual({ activeCheckpoint: false, playedFixtures: 1 });
    await assertFullTimeFootballReview(page, "desktop full-time review");
    await assertNoPageOverflow(page, "desktop full-time review");
    await capture(page, "74-full-time-event-rich");

    await setFullTimeVisualScenario(page, "loss");
    await expect(page.getByText("Defeat", { exact: true })).toBeVisible();
    await assertFullTimeFootballReview(page, "desktop full-time loss review");
    await capture(page, "74a-full-time-loss");

    await setFullTimeVisualScenario(page, "win");
    await expect(page.getByText("Win", { exact: true })).toBeVisible();
    await assertFullTimeFootballReview(page, "desktop full-time win review");
    await capture(page, "74b-full-time-win");

    await setFullTimeVisualScenario(page, "draw");
    await expect(page.getByText("Draw", { exact: true })).toBeVisible();
    await assertFullTimeFootballReview(page, "desktop full-time draw review");
    await capture(page, "74c-full-time-draw");

    await setFullTimeVisualScenario(page, "event-light");
    await expect(page.getByText("No goals, penalties, cards, injuries, or substitutions.", { exact: true })).toBeVisible();
    await assertFullTimeFootballReview(page, "desktop event-light full-time review");
    await capture(page, "74d-full-time-event-light");

    await page.clock.resume();
    page.once("dialog", (dialog) => dialog.accept());
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.getByTestId("app-entry-screen")).toBeVisible();
    await page.getByRole("button", { name: "Continue career", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Dashboard", exact: true })).toBeVisible();
    await expect.poll(() => durableMatchFacts(page)).toEqual({ activeCheckpoint: false, playedFixtures: 0 });
  } finally {
    await page.close();
  }
});

test("the second fixture returns to preparation and starts without a false storage failure", async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await resetCareerStorage(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.getByRole("button", { name: "New career", exact: true }).click();
    await page.getByRole("button", { name: "Prepare match", exact: true }).click();
    await prepareMatch(page);
    await page.getByRole("button", { name: "Start match", exact: true }).click();
    await expect(page.getByRole("button", { name: "Start second half", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Start second half", exact: true }).click();
    await expect(page.getByRole("button", { name: "Return to dashboard", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Return to dashboard", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Dashboard", exact: true })).toBeVisible();

    await page.locator(".tls-dashboard-primary-action").click();
    await expect(page.getByRole("heading", { level: 1, name: "Inbox", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Prepare match", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Prepare match", exact: true }).click();

    await expect(page.getByRole("heading", { level: 1, name: "Match preparation", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Confirm and go to match", exact: true })).toBeEnabled();
    await expect.poll(() => page.evaluate(async () => {
      const modulePath = "/src/stores/career-ui-store.ts";
      const { useCareerUiStore } = await import(/* @vite-ignore */ modulePath);
      const draft = useCareerUiStore.getState().matchPreparationState;
      return {
        isSaved: draft?.isSaved,
        selectedPlayers: Object.keys(draft?.selectedPlayerIdsBySlot ?? {}).length,
      };
    })).toEqual({ isSaved: false, selectedPlayers: 11 });
    await capture(page, "68c-second-fixture-preparation");

    await page.getByRole("button", { name: "Confirm and go to match", exact: true }).click();
    await page.getByRole("button", { name: "Start match", exact: true }).click();
    await expect(page.getByRole("button", { name: "Start second half", exact: true })).toBeVisible();
    await expect(page.locator(".tls-storage-recovery[data-state='recovery']")).toHaveCount(0);
    await expect.poll(() => activeMatchCheckpoint(page)).toMatchObject({ phase: "half_time" });
  } finally {
    await page.close();
  }
});

/** Reads the currently selected XI and bench identities without changing the draft. */
async function selectedPreparationIds(page: Page): Promise<Readonly<{ total: number; unique: number }>> {
  return page.evaluate(async () => {
    const modulePath = "/src/stores/career-ui-store.ts";
    const { useCareerUiStore } = await import(/* @vite-ignore */ modulePath);
    const draft = useCareerUiStore.getState().matchPreparationState;
    if (draft === undefined) throw new Error("Expected an active preparation draft.");
    const ids = [
      ...Object.values(draft.selectedPlayerIdsBySlot),
      ...Object.values(draft.selectedBenchPlayerIdsBySlot),
    ].filter((playerId): playerId is string => typeof playerId === "string");

    return { total: ids.length, unique: new Set(ids).size };
  });
}

/** Maps the five current role-fit levels to their intended candidate order. */
function tacticalSuitabilityRank(suitability: string): number {
  const ranks: Readonly<Record<string, number>> = {
    natural: 0,
    accomplished: 1,
    competent: 2,
    unconvincing: 3,
    makeshift: 4,
  };
  return ranks[suitability] ?? Number.POSITIVE_INFINITY;
}

/** Opens one assigned or empty tactical slot through the desktop context action. */
async function rightClickTacticalSlot(page: Page, slotId: string): Promise<void> {
  const center = await tacticalSlotCenter(page, slotId);
  await page.locator(`[data-slot-id="${slotId}"]`).first().dispatchEvent("contextmenu", {
    bubbles: true,
    button: 2,
    buttons: 2,
    clientX: center.x,
    clientY: center.y,
  });
  await expect(page.locator(".tls-tactical-board-menu")).toBeVisible();
}

/** Drags one slot using normalized pitch coordinates and verifies transient-zone cleanup. */
async function dragTacticalSlotToNorm(page: Page, slotId: string, nx: number, ny: number): Promise<void> {
  const start = await tacticalSlotCenter(page, slotId);
  const target = await tacticalPointForNorm(page, nx, ny);
  const svg = page.locator(".tls-tactical-board-svg");

  await page.locator(`[data-slot-id="${slotId}"]`).first().dispatchEvent("pointerdown", {
    bubbles: true,
    button: 0,
    buttons: 1,
    clientX: start.x,
    clientY: start.y,
    isPrimary: true,
    pointerId: 73,
    pointerType: "mouse",
  });
  await svg.dispatchEvent("pointermove", {
    bubbles: true,
    button: 0,
    buttons: 1,
    clientX: target.x,
    clientY: target.y,
    isPrimary: true,
    pointerId: 73,
    pointerType: "mouse",
  });
  if (slotId !== "gk") {
    await expect(page.locator(".tls-tactical-board-active-zone")).toBeAttached();
  }
  await svg.dispatchEvent("pointerup", {
    bubbles: true,
    button: 0,
    buttons: 0,
    clientX: target.x,
    clientY: target.y,
    isPrimary: true,
    pointerId: 73,
    pointerType: "mouse",
  });
  await expect(page.locator(".tls-tactical-board-active-zone")).toHaveCount(0);
}

/** Dispatches the current touch long-press gesture, optionally exceeding its cancellation threshold. */
async function dispatchTacticalLongPress(page: Page, slotId: string, shouldMove: boolean): Promise<void> {
  const center = await tacticalSlotCenter(page, slotId);
  const slot = page.locator(`[data-slot-id="${slotId}"]`).first();
  await slot.dispatchEvent("pointerdown", {
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
    await slot.dispatchEvent("pointermove", {
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
  await slot.dispatchEvent("pointerup", {
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

/** Returns one tactical slot center in viewport pixels. */
async function tacticalSlotCenter(page: Page, slotId: string): Promise<Readonly<{ x: number; y: number }>> {
  const box = await page.locator(
    `[data-slot-id="${slotId}"] .tls-tactical-board-token-face, `
      + `[data-slot-id="${slotId}"] .tls-tactical-board-empty-slot-ring`,
  ).first().boundingBox();
  if (box === null) throw new Error(`Missing tactical slot ${slotId}.`);
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/** Projects one normalized pitch coordinate into the current SVG viewport. */
async function tacticalPointForNorm(page: Page, nx: number, ny: number): Promise<Readonly<{ x: number; y: number }>> {
  const box = await page.locator(".tls-tactical-board-svg").boundingBox();
  if (box === null) throw new Error("Missing tactical-board SVG.");
  return {
    x: box.x + ((60 + nx * 680) / 800) * box.width,
    y: box.y + ((60 + ny * 1050) / 1170) * box.height,
  };
}

/** Reads one tactical slot's normalized position from its SVG transform. */
async function tacticalSlotNorm(page: Page, slotId: string): Promise<Readonly<{ nx: number; ny: number }>> {
  const transform = await page.locator(`[data-slot-id="${slotId}"]`).first().getAttribute("transform");
  const match = /translate\(([-\d.]+) ([-\d.]+)\)/.exec(transform ?? "");
  if (match === null) throw new Error(`Could not read tactical slot ${slotId}: ${transform}`);
  return { nx: (Number(match[1]) - 60) / 680, ny: (Number(match[2]) - 60) / 1050 };
}

/** Deletes real OPFS careers through the production persistence adapter. */
async function resetCareerStorage(page: Page): Promise<void> {
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    const modulePath = "/src/infrastructure/persistence/create-web-career-storage.ts";
    const { createWebCareerStorage } = await import(/* @vite-ignore */ modulePath);
    const handle = await createWebCareerStorage();
    for (const save of await handle.storage.listCareers()) await handle.storage.deleteCareer(save.saveId);
    await handle.close();
  });
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.getByTestId("app-entry-screen")).toBeVisible();
  await expect(page.getByRole("button", { name: "New career", exact: true })).toBeEnabled();
}

/** Completes the existing deterministic preparation path without bypassing UI commands. */
async function prepareMatch(page: Page, inspectSemanticStates = false): Promise<void> {
  await page.getByRole("button", { name: "Auto", exact: true }).click();
  await page.getByRole("tab", { name: "Tactic", exact: true }).click();
  await page.getByRole("radio", { name: /^Balanced / }).check();
  if (inspectSemanticStates) {
    await expect(page.locator(".tls-preparation-alert-strip")).toHaveAttribute("data-state", "success");
    await capture(page, "15-preparation-semantic-success");
    await page.getByRole("button", { name: "Main menu", exact: true }).click();
    const dialog = page.locator(".tls-unsaved-dialog[data-state='decision']");
    await expect(dialog).toBeVisible();
    await capture(page, "16-unsaved-career-warning-dialog");
    await dialog.getByRole("button", { name: "Stay", exact: true }).click();
  }
  await page.getByRole("button", { name: "Confirm and go to match", exact: true }).click();
}

/** Replaces the selected bench goalkeeper through the public store command. */
async function replaceBenchGoalkeeper(
  page: Page,
): Promise<Readonly<{ slotKey: string; playerId: string }>> {
  return page.evaluate(async () => {
    const modulePath = "/src/stores/career-ui-store.ts";
    const { useCareerUiStore } = await import(/* @vite-ignore */ modulePath);
    const store = useCareerUiStore.getState();
    const career = store.activeCareerState;
    const draft = store.matchPreparationState;
    if (career === undefined || draft === undefined) throw new Error("Expected active preparation");
    const players = career.gameState.players as Record<string, { primaryRole?: string }>;
    const bench = draft.selectedBenchPlayerIdsBySlot as Record<string, string>;
    const lineup = draft.selectedPlayerIdsBySlot as Record<string, string>;
    const goalkeeperEntry = Object.entries(bench)
      .find(([, playerId]) => players[playerId]?.primaryRole === "goalkeeper");
    if (goalkeeperEntry === undefined) throw new Error("Expected selected bench goalkeeper");
    const selectedPlayerIds = new Set([
      ...Object.values(lineup),
      ...Object.values(bench),
    ]);
    const clubPlayerIds = career.gameState.clubs[career.selectedClubId]?.playerIds as readonly string[] | undefined;
    const replacementId = clubPlayerIds?.find((playerId: string) => (
      !selectedPlayerIds.has(playerId)
      && players[playerId]?.primaryRole !== "goalkeeper"
    ));
    if (replacementId === undefined) throw new Error("Expected available outfield replacement");
    store.selectBenchPlayer(goalkeeperEntry[0], replacementId);
    return { slotKey: goalkeeperEntry[0], playerId: goalkeeperEntry[1] };
  });
}

/** Restores the displaced goalkeeper through the same public store command. */
async function restoreBenchGoalkeeper(
  page: Page,
  goalkeeper: Readonly<{ slotKey: string; playerId: string }>,
): Promise<void> {
  await page.evaluate(async ({ slotKey, playerId }) => {
    const modulePath = "/src/stores/career-ui-store.ts";
    const { useCareerUiStore } = await import(/* @vite-ignore */ modulePath);
    useCareerUiStore.getState().selectBenchPlayer(slotKey, playerId);
  }, goalkeeper);
}

/** Dispatches a cancellable unload event and reports whether dirty protection handled it. */
async function dispatchBeforeUnload(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const event = new Event("beforeunload", { cancelable: true });
    return !window.dispatchEvent(event);
  });
}

/** Reads only durable preparation facts to prove Stay preserves the exact draft. */
async function currentPreparationFingerprint(page: Page): Promise<string> {
  return page.evaluate(async () => {
    const modulePath = "/src/stores/career-ui-store.ts";
    const { useCareerUiStore } = await import(/* @vite-ignore */ modulePath);
    const draft = useCareerUiStore.getState().matchPreparationState;
    if (draft === undefined) throw new Error("Expected preparation draft");
    return JSON.stringify({
      formationId: draft.selectedFormationId,
      slots: draft.tacticalBoardDraft.slots.map((slot: {
        slotId: string;
        nx: number;
        ny: number;
        role: string;
        playerId?: string | null;
      }) => ({
        slotId: slot.slotId,
        nx: slot.nx,
        ny: slot.ny,
        role: slot.role,
        playerId: slot.playerId,
      })),
      bench: draft.selectedBenchPlayerIdsBySlot,
      tactic: draft.selectedTacticProfileId,
    });
  });
}

/** Opens the existing preparation route without fabricating gameplay data. */
async function openPreparationRoute(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const modulePath = "/src/stores/career-ui-store.ts";
    const { useCareerUiStore } = await import(/* @vite-ignore */ modulePath);
    useCareerUiStore.getState().openMatchPreparation();
  });
}

/** Drives the observable command lock without bypassing any career mutation. */
async function setPendingCommand(page: Page, pending: boolean): Promise<void> {
  await page.evaluate(async (shouldBePending) => {
    const modulePath = "/src/stores/career-ui-store.ts";
    const { useCareerUiStore } = await import(/* @vite-ignore */ modulePath);
    const store = useCareerUiStore.getState();
    if (shouldBePending) store.beginCareerCommand("continue_career", "career.command.advancingCareer");
    else store.completeCareerCommand("continue_career");
  }, pending);
}

/** Drives Start-match command feedback without mutating match facts. */
async function setMatchdayCommandActivity(
  page: Page,
  status: "pending" | "failed" | "clear",
  commandId: "play_first_half" | "play_second_half" = "play_first_half",
): Promise<void> {
  await page.evaluate(async ({ nextStatus, nextCommandId }) => {
    const modulePath = "/src/stores/career-ui-store.ts";
    const { useCareerUiStore } = await import(/* @vite-ignore */ modulePath);
    const store = useCareerUiStore.getState();
    const labelKey = nextCommandId === "play_first_half"
      ? "career.command.playingFirstHalf"
      : "career.command.playingSecondHalf";
    if (nextStatus === "pending") {
      store.beginCareerCommand(nextCommandId, labelKey);
      return;
    }
    if (nextStatus === "failed") {
      store.failCareerCommand(nextCommandId, "unknown");
      return;
    }
    store.completeCareerCommand(nextCommandId);
  }, { nextStatus: status, nextCommandId: commandId });
}

/** Advances the installed Playwright clock until the requested playback stage appears. */
async function advanceClockUntilPlaybackStage(
  page: Page,
  stage: "event" | "closing",
): Promise<void> {
  for (let elapsed = 0; elapsed <= 3_000; elapsed += 50) {
    if (await page.locator(`[data-playback-stage='${stage}']`).count() > 0) return;
    await page.clock.runFor(50);
  }
  throw new Error(`Matchday playback did not reach ${stage}`);
}

/** Reads the in-memory checkpoint through the public UI store. */
async function activeMatchCheckpoint(page: Page): Promise<Readonly<{ phase?: string }>> {
  return page.evaluate(async () => {
    const modulePath = "/src/stores/career-ui-store.ts";
    const { useCareerUiStore } = await import(/* @vite-ignore */ modulePath);
    const checkpoint = useCareerUiStore.getState().activeCareerState?.activeMatchCheckpoint;
    return checkpoint === undefined ? {} : { phase: checkpoint.phase };
  });
}

/** Reprojects the durable half-time checkpoint as an event-light UI fixture. */
async function setHalfTimeEventLight(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const modulePath = "/src/stores/career-ui-store.ts";
    const { useCareerUiStore } = await import(/* @vite-ignore */ modulePath);
    const matchdayState = useCareerUiStore.getState().matchdayState;
    const stagedProgress = matchdayState?.stagedProgress;
    if (matchdayState === undefined || stagedProgress === undefined) {
      throw new Error("Expected an active staged match");
    }

    useCareerUiStore.setState({
      matchdayState: {
        ...matchdayState,
        stagedProgress: {
          ...stagedProgress,
          snapshot: {
            ...stagedProgress.snapshot,
            events: [],
            score: { home: 0, away: 0 },
          },
        },
      },
    });
  });
}

/** Reprojects one committed report for deterministic full-time visual variants only. */
async function setFullTimeVisualScenario(
  page: Page,
  scenario: "win" | "draw" | "loss" | "event-light",
): Promise<void> {
  await page.evaluate(async (nextScenario) => {
    const modulePath = "/src/stores/career-ui-store.ts";
    const { useCareerUiStore } = await import(/* @vite-ignore */ modulePath);
    const matchdayState = useCareerUiStore.getState().matchdayState;
    const playedResult = matchdayState?.playedResult;
    if (matchdayState === undefined || playedResult === undefined) {
      throw new Error("Expected a committed match review");
    }

    const selectedClubIsHome = playedResult.fixtureAfter.homeClubId
      === playedResult.careerState.selectedClubId;
    const homeWins = nextScenario === "win" ? selectedClubIsHome : !selectedClubIsHome;
    const score = nextScenario === "event-light"
      ? { home: 0, away: 0 }
      : nextScenario === "draw"
        ? { home: 1, away: 1 }
        : homeWins
          ? { home: 1, away: 0 }
          : { home: 0, away: 1 };
    const report = {
      ...playedResult.report,
      score,
      ...(nextScenario === "event-light" ? { events: [] } : {}),
    };

    useCareerUiStore.setState({
      matchdayState: {
        ...matchdayState,
        playedResult: {
          ...playedResult,
          report,
          ...(nextScenario === "event-light"
            ? { conditionChanges: [], playerStateConsequences: [] }
            : {}),
        },
      },
    });
  }, scenario);
}

/** Reads durable-baseline match facts after a real browser refresh. */
async function durableMatchFacts(
  page: Page,
): Promise<Readonly<{ activeCheckpoint: boolean; playedFixtures: number }>> {
  return page.evaluate(async () => {
    const modulePath = "/src/stores/career-ui-store.ts";
    const { useCareerUiStore } = await import(/* @vite-ignore */ modulePath);
    const career = useCareerUiStore.getState().activeCareerState;
    if (career === undefined) throw new Error("Expected loaded career");
    const fixtures = career.gameState.fixtures as Record<string, { result?: { played?: boolean } }>;
    return {
      activeCheckpoint: career.activeMatchCheckpoint !== undefined,
      playedFixtures: Object.values(fixtures)
        .filter((fixture) => fixture?.result?.played === true).length,
    };
  });
}

/** Reprojects the current durable message through valid presentation states. */
async function setCurrentPostaScenario(
  page: Page,
  scenario: "important" | "informational" | "resolved",
): Promise<void> {
  await page.evaluate(async (nextScenario) => {
    const modulePath = "/src/stores/career-ui-store.ts";
    const { useCareerUiStore } = await import(/* @vite-ignore */ modulePath);
    const store = useCareerUiStore.getState();
    const career = store.activeCareerState;
    const source = career?.currentSeasonInbox?.[0];
    if (career === undefined || source === undefined) throw new Error("Expected current Posta message");
    const resolved = nextScenario === "resolved";
    const informational = nextScenario === "informational";
    const message = {
      ...source,
      level: informational ? "informational" : "important",
      lifecycle: { read: true, acknowledged: true, resolved },
      blockerKeys: informational || resolved ? [] : source.blockerKeys,
      actionIds: informational || resolved ? [] : source.actionIds,
    };
    useCareerUiStore.setState({
      activeCareerState: { ...career, currentSeasonInbox: [message] },
      inboxFilter: "all",
      selectedInboxMessageId: String(message.id),
    });
  }, scenario);
}

/** Captures the six Dashboard states against one real career journey. */
async function captureDashboardStates(
  browser: Browser,
  viewport: Readonly<{ width: number; height: number }>,
  suffix: string,
): Promise<void> {
  const page = await browser.newPage({ viewport });
  try {
    await resetCareerStorage(page);
    await page.getByRole("button", { name: "New career", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Dashboard", exact: true })).toBeVisible();
    await expect(page.locator(".tls-dashboard-priority")).toHaveAttribute("data-task-state", "attention");
    await assertDashboardPrimaryCommand(page, "Prepare match");
    await expect(page.getByRole("heading", { level: 2, name: "League table", exact: true })).toBeVisible();
    await expect(page.getByText("Available after the first completed match.", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "League results", exact: true })).toBeVisible();
    await expect(page.getByText("Available after the first completed round.", { exact: true })).toBeVisible();
    await assertNoTechnicalDashboardCopy(page, `${suffix} attention Dashboard`);
    await capture(page, `20-dashboard-attention-${suffix}`);

    await clearDashboardAttention(page);
    await expect(page.locator(".tls-dashboard-priority")).toHaveAttribute("data-task-state", "unprepared");
    await assertDashboardPrimaryCommand(page, "Prepare match");
    await assertNoTechnicalDashboardCopy(page, `${suffix} unprepared Dashboard`);
    await capture(page, `21-dashboard-unprepared-${suffix}`);

    await page.getByRole("button", { name: "Prepare match", exact: true }).click();
    await prepareMatch(page);
    await openDashboardWithoutAttention(page);
    await expect(page.locator(".tls-dashboard-priority")).toHaveAttribute("data-task-state", "ready");
    await assertDashboardPrimaryCommand(page, "Go to match");
    await assertNoTechnicalDashboardCopy(page, `${suffix} ready Dashboard`);
    await capture(page, `22-dashboard-ready-${suffix}`);

    await page.getByRole("button", { name: "Go to match", exact: true }).click();
    await page.getByRole("button", { name: "Start match", exact: true }).click();
    await expect(page.getByRole("button", { name: "Start second half", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Start second half", exact: true }).click();
    await expect(page.getByRole("button", { name: "Return to dashboard", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Return to dashboard", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Dashboard", exact: true })).toBeVisible();
    await clearDashboardAttention(page);
    await expect(page.locator(".tls-dashboard-priority")).toHaveAttribute("data-task-state", "post_match");
    await assertDashboardPrimaryCommand(page, "Continue");
    await expect(page.locator(".tls-dashboard-table tbody tr")).toHaveCount(5);
    await expect(page.locator(".tls-dashboard-table tbody tr[data-selected='true']")).toHaveCount(1);
    await expect(page.locator(".tls-dashboard-league-results-list li")).toHaveCount(1);
    await expect(page.locator(".tls-dashboard-league-results-list li[data-selected='true']")).toHaveCount(1);
    await expect(page.locator(".tls-dashboard-league-results-list li").first()).toContainText(/\d+-\d+/);
    await assertNoTechnicalDashboardCopy(page, `${suffix} post-match Dashboard`);
    await capture(page, `23-dashboard-post-match-${suffix}`);

    await setPendingCommand(page, true);
    await expect(page.locator(".tls-dashboard-panel")).toHaveAttribute("data-state", "pending");
    await expect(page.locator(".tls-dashboard-primary-action")).toBeDisabled();
    await capture(page, `24-dashboard-loading-${suffix}`);
    await setPendingCommand(page, false);

    await page.evaluate(async () => {
      const modulePath = "/src/stores/career-ui-store.ts";
      const { useCareerUiStore } = await import(/* @vite-ignore */ modulePath);
      useCareerUiStore.getState().failCareerStorage({ code: "save_unwritable" }, "current_career");
    });
    await expect(page.locator(".tls-storage-recovery[data-state='recovery']")).toBeVisible();
    await capture(page, `25-dashboard-recovery-${suffix}`);
    await assertNoPageOverflow(page, `${suffix} Dashboard state sequence`);
  } finally {
    await page.close();
  }
}

/** Clears only the transient attention result, preserving all real career facts. */
async function clearDashboardAttention(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const modulePath = "/src/stores/career-ui-store.ts";
    const { useCareerUiStore } = await import(/* @vite-ignore */ modulePath);
    useCareerUiStore.setState({ continueResult: undefined });
  });
}

/** Returns to the real Dashboard while exposing its prepared-state hierarchy. */
async function openDashboardWithoutAttention(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const modulePath = "/src/stores/career-ui-store.ts";
    const { useCareerUiStore } = await import(/* @vite-ignore */ modulePath);
    useCareerUiStore.getState().openDashboard();
    useCareerUiStore.setState({ continueResult: undefined });
  });
  await expect(page.getByRole("heading", { level: 1, name: "Dashboard", exact: true })).toBeVisible();
}

/** Verifies the priority block owns exactly one dominant command. */
async function assertDashboardPrimaryCommand(page: Page, name: string): Promise<void> {
  const actions = page.locator("#tls-career-main .tls-menu-button-primary");
  await expect(actions).toHaveCount(1);
  await expect(actions).toHaveAccessibleName(name);
}

/** Rejects backend identifiers and fallback vocabulary from valid Dashboard copy. */
async function assertNoTechnicalDashboardCopy(page: Page, checkpoint: string): Promise<void> {
  const copy = await page.locator("#tls-career-main").innerText();
  expect(copy, `${checkpoint} leaks a technical identifier`).not.toMatch(/(?:fixture|season|save):/i);
  expect(copy, `${checkpoint} renders a backend fallback word`).not.toMatch(/\b(?:unknown|none|missing)\b/i);
}

/** Measures the real rendered foreground against its owning semantic surface. */
async function foregroundContrast(
  locator: Locator,
  backgroundOwnerSelector: string,
): Promise<number> {
  return locator.evaluate((element, ownerSelector) => {
    const owner = element.closest(ownerSelector);
    if (owner === null) throw new Error(`Missing contrast owner ${ownerSelector}`);

    const rgb = (value: string): readonly [number, number, number] => {
      const values = value.match(/[\d.]+/g)?.slice(0, 3).map(Number);
      if (values === undefined || values.length !== 3) throw new Error(`Unsupported color ${value}`);
      return [values[0] ?? 0, values[1] ?? 0, values[2] ?? 0];
    };
    const luminance = ([red, green, blue]: readonly [number, number, number]): number => {
      const channel = (value: number): number => {
        const normalized = value / 255;
        return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
      };
      return (0.2126 * channel(red)) + (0.7152 * channel(green)) + (0.0722 * channel(blue));
    };
    const foreground = luminance(rgb(getComputedStyle(element).color));
    const background = luminance(rgb(getComputedStyle(owner).backgroundColor));
    const light = Math.max(foreground, background);
    const dark = Math.min(foreground, background);
    return (light + 0.05) / (dark + 0.05);
  }, backgroundOwnerSelector);
}

/** Verifies the shared top-level focus owner landed on the current main region. */
async function expectMainFocus(page: Page): Promise<void> {
  await expect.poll(() => page.evaluate(() => {
    const active = document.activeElement;
    return active?.tagName === "H1" && active.closest("main")?.id === "tls-career-main";
  })).toBe(true);
}

/** Guards the page-level horizontal-flow contract at the named checkpoint. */
async function assertNoPageOverflow(page: Page, checkpoint: string): Promise<void> {
  const overflow = await page.evaluate(() => {
    const clientWidth = document.documentElement.clientWidth;
    const offenders = Array.from(document.querySelectorAll<HTMLElement>("body *"))
      .map((element) => {
        const bounds = element.getBoundingClientRect();
        return {
          element: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}${Array.from(element.classList).map((className) => `.${className}`).join("")}`,
          left: Math.round(bounds.left),
          right: Math.round(bounds.right),
          width: Math.round(bounds.width),
        };
      })
      .filter(({ left, right }) => left < -1 || right > clientWidth + 1)
      .sort((left, right) => right.right - left.right)
      .slice(0, 8);

    return {
      clientWidth,
      offenders,
      scrollWidth: document.documentElement.scrollWidth,
    };
  });
  expect(
    overflow.scrollWidth,
    `${checkpoint} has horizontal page overflow: ${JSON.stringify(overflow.offenders)}`,
  ).toBeLessThanOrEqual(overflow.clientWidth + 1);
}

/** Guards the start screen's deliberate full-viewport centering. */
async function assertViewportCentered(page: Page, selector: string): Promise<void> {
  const viewport = page.viewportSize();
  const box = await page.locator(selector).boundingBox();
  expect(viewport).not.toBeNull();
  expect(box).not.toBeNull();
  if (viewport === null || box === null) return;

  expect(Math.abs(box.x + box.width / 2 - viewport.width / 2)).toBeLessThanOrEqual(1);
  expect(Math.abs(box.y + box.height / 2 - viewport.height / 2)).toBeLessThanOrEqual(1);
}

/** Guards effective pointer targets in the half-time decision workspace. */
async function assertHalfTimeInteractiveTargets(page: Page): Promise<void> {
  const undersizedTargets = await page.locator(".tls-match-centre-half-time-decision button, .tls-match-centre-half-time-decision select")
    .evaluateAll((elements) => elements
      .filter((element) => {
        const style = getComputedStyle(element);
        return style.display !== "none" && style.visibility !== "hidden";
      })
      .map((element) => {
        const bounds = element.getBoundingClientRect();
        return {
          height: Math.round(bounds.height),
          label: element.getAttribute("aria-label") ?? element.textContent?.trim() ?? element.tagName,
          width: Math.round(bounds.width),
        };
      })
      .filter(({ height, width }) => height < 24 || width < 24));

  expect(undersizedTargets, "Half-time contains pointer targets smaller than 24px").toEqual([]);
}

/** Guards the football-first full-time hierarchy and its single exit command. */
async function assertFullTimeFootballReview(page: Page, checkpoint: string): Promise<void> {
  const review = page.locator(".tls-match-centre-full-time");
  const story = review.locator(".tls-match-centre-full-time-story");
  const ratings = review.locator(".tls-match-centre-full-time-ratings");
  const consequences = review.locator(".tls-match-centre-consequences");

  await expect(review).toBeVisible();
  await expect(story).toBeVisible();
  await expect(ratings).toBeVisible();
  expect(await ratings.locator(".tls-match-centre-rating-row").count()).toBeGreaterThan(0);
  await expect(review.locator(".tls-matchday-table")).toHaveCount(0);
  await expect(page.locator(".tls-app-shell-right-rail")).toBeHidden();
  await expect(page.getByRole("button", { name: "Return to dashboard", exact: true })).toHaveCount(1);

  const copy = (await review.textContent())?.toLowerCase() ?? "";
  expect(copy, `${checkpoint} exposes a technical fallback`).not.toMatch(/\b(?:fixture:|unknown|none)\b|next action/);

  const storyBox = await story.boundingBox();
  const ratingsBox = await ratings.boundingBox();
  expect(storyBox, `${checkpoint} story has no layout box`).not.toBeNull();
  expect(ratingsBox, `${checkpoint} ratings have no layout box`).not.toBeNull();
  expect(ratingsBox!.y, `${checkpoint} ratings must follow the tabellino`).toBeGreaterThan(storyBox!.y);

  if (await consequences.count() > 0) {
    const consequenceBox = await consequences.boundingBox();
    expect(consequenceBox, `${checkpoint} consequences have no layout box`).not.toBeNull();
    expect(consequenceBox!.y, `${checkpoint} consequences must follow ratings`).toBeGreaterThan(ratingsBox!.y);
  }
}

/** Ensures the active football task begins within the first narrow viewport. */
async function assertTaskInFirstViewport(page: Page, checkpoint: string): Promise<void> {
  const top = await page.locator("#tls-career-main").evaluate((element) => element.getBoundingClientRect().top);
  expect(top, `${checkpoint} begins below the first useful viewport`).toBeLessThan(844);
}

/** Captures one deterministic phase screenshot outside the repository. */
async function capture(page: Page, name: string): Promise<void> {
  await page.screenshot({ fullPage: true, path: resolve(QA_OUTPUT_DIR, `${name}.png`) });
}

async function waitForServer(): Promise<void> {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(URL);
      if (response.ok) return;
    } catch {
      // Vite is still starting.
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 200));
  }
  throw new Error(`Timed out waiting for ${URL}`);
}
