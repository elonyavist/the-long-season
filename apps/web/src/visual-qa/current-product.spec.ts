/// <reference types="node" />

import { spawn, type ChildProcess } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { expect, test, type Browser, type Locator, type Page } from "playwright/test";

const CURRENT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(CURRENT_DIR, "../../../..");
const QA_OUTPUT_DIR = "/tmp/the-long-season-phase76";
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
    await expect(page.locator(".tls-app-shell-screen-transition")).toHaveAttribute(
      "data-screen-key",
      /^dashboard:/,
    );
    const dashboardSidebarBounds = await page.locator(".tls-app-shell-sidebar").boundingBox();
    expect(dashboardSidebarBounds).not.toBeNull();
    await capture(page, "02-dashboard-attention-desktop");

    const saveMenuButton = page.getByRole("button", { name: "Save", exact: true });
    await saveMenuButton.click();
    const saveDialog = page.getByRole("dialog", { name: "Save", exact: true });
    await expect(saveDialog).toBeVisible();
    await capture(page, "02a-save-dialog-desktop");
    await page.keyboard.press("Escape");
    await expect(saveDialog).toBeHidden();
    await expect(saveMenuButton).toBeFocused();

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
    await expect(page.locator(".tls-app-shell-screen-transition")).toHaveAttribute(
      "data-screen-key",
      /^inbox:/,
    );
    expect(await page.locator(".tls-app-shell-sidebar").boundingBox()).toEqual(dashboardSidebarBounds);
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
    await assertFullWidthPreMatch(page, "desktop Matchday");
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
    await assertFullWidthPreMatch(page, "wide Matchday");
    await capture(page, "19b-pre-match-wide");

    await page.getByRole("button", { name: "Start match", exact: true }).click();
    await expect.poll(() => liveMatchPhase(page)).toMatchObject({ phase: "first_half" });
    await expect(page.locator("[data-motion-checkpoint='first_half']")).toBeVisible();
    await expect(page.locator("[data-motion-checkpoint='first_half']"))
      .toHaveAttribute("data-motion-active", "true");
    await capture(page, "19c-first-half-wide");
    await advanceClockUntilPlaybackStage(page, "closing", "real");
    await capture(page, "19d-half-time-wide");

    await page.getByRole("button", { name: "Start second half", exact: true }).click();
    await expect(page.locator("[data-motion-checkpoint='second_half']")).toBeVisible();
    await capture(page, "19e-second-half-wide");
    await advanceClockUntilPlaybackStage(page, "closing", "real");
    await expect(page.getByRole("button", { name: "Continue", exact: true })).toBeVisible();
    await assertNoPageOverflow(page, "wide Full time");
    await capture(page, "19f-full-time-wide");
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

test("reduced motion keeps command feedback static and equally informative", async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await resetCareerStorage(page);
    await page.getByRole("button", { name: "New career", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Dashboard", exact: true })).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(async () => {
          const modulePath = "/src/stores/career-ui-store.ts";
          const { useCareerUiStore } = await import(/* @vite-ignore */ modulePath);
          return useCareerUiStore.getState().commandActivity?.commandId ?? null;
        }),
      )
      .toBeNull();
    await setPendingCommand(page, true);

    const primaryAction = page.locator(".tls-dashboard-primary-action");
    const spinner = primaryAction.locator(".tls-command-activity-spinner");
    await expect(primaryAction).toHaveAttribute("data-state", "pending");
    await expect(primaryAction).toBeDisabled();
    await expect(spinner).toHaveAttribute("data-visible", "true");

    const restingTransform = await spinner.evaluate((element) => getComputedStyle(element).transform);
    await page.waitForTimeout(250);
    expect(await spinner.evaluate((element) => getComputedStyle(element).transform)).toBe(restingTransform);
    await capture(page, "13a-dashboard-semantic-pending-reduced-motion");
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

test("desktop Squad keeps one dense vertical roster and an accessible full-screen profile", async ({ browser }) => {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await resetCareerStorage(desktop);
    await desktop.getByRole("button", { name: "New career", exact: true }).click();
    await desktop.getByRole("button", { name: "Squad", exact: true }).click();

    await expect(desktop.getByRole("heading", { level: 1, name: "Squad", exact: true })).toBeVisible();
    await expectMainFocus(desktop);
    await expect(desktop.locator(".tls-squad-table tbody tr")).toHaveCount(22);
    await expect(desktop.locator(".tls-squad-table-frame")).toHaveCSS("overflow-x", "hidden");
    await assertNoPageOverflow(desktop, "desktop Squad");
    await capture(desktop, "69-squad-desktop");

    await desktop.evaluate(async () => {
      const modulePath = "/src/stores/career-ui-store.ts";
      const { useCareerUiStore } = await import(/* @vite-ignore */ modulePath);
      useCareerUiStore.getState().applySelectionAction("auto");
    });
    const availablePlayer = desktop.locator(".tls-squad-table tbody tr[data-status='available']").first();
    const availablePlayerName = (await availablePlayer.locator(".tls-squad-player-name").innerText()).trim();
    const availablePlayerSurname = availablePlayerName.split(/\s+/).at(-1) ?? availablePlayerName;
    await availablePlayer.getByRole("button", { name: "Field", exact: true }).click();
    const lineupChoice = desktop.getByRole("dialog", { name: "Choose XI position", exact: true });
    await expect(lineupChoice).toBeVisible();
    await expect(lineupChoice.locator(".tls-squad-choice-option")).toHaveCount(11);
    await capture(desktop, "69d-squad-explicit-lineup-choice-desktop");
    await lineupChoice.locator(".tls-squad-choice-option").first().click();
    await expect(lineupChoice).toBeHidden();

    await desktop.getByRole("button", { name: "Tactics", exact: true }).click();
    await expect(desktop.getByRole("heading", { level: 1, name: "Tactics", exact: true })).toBeVisible();
    await expect(desktop.locator(".tls-tactical-board-token")).toHaveCount(11);
    await expect(desktop.locator(".tls-tactical-board-token", { hasText: availablePlayerSurname })).toHaveCount(1);
    await assertNoPageOverflow(desktop, "desktop Tactics after Squad replacement");
    await capture(desktop, "69e-tactics-shared-plan-desktop");
    await desktop.getByRole("button", { name: "Squad", exact: true }).click();

    const firstPlayer = desktop.locator(".tls-squad-table tbody tr").first();
    await firstPlayer.focus();
    await desktop.keyboard.press("Enter");
    const profile = desktop.getByRole("dialog", { name: /.+/ });
    await expect(profile).toBeVisible();
    await expect(desktop.getByRole("button", { name: "Close player profile", exact: true })).toBeFocused();
    await expect(profile.getByText("Annual wage", { exact: true }).first()).toBeVisible();
    await expect(profile.getByText("Monthly wage", { exact: true })).toHaveCount(0);
    await expect(profile.locator(".tls-player-attribute-groups > section")).toHaveCount(4);
    await expect(profile.locator(".tls-contract-workspace")).toBeVisible();
    await profile.getByRole("button", { name: "Open renewal talks", exact: true }).click();
    await expect(profile.getByRole("textbox", { name: /^Annual wage/ })).toBeVisible();
    await expect(profile.getByText("This offer fits the current budget.", { exact: true })).toBeVisible();
    await assertNoPageOverflow(desktop, "desktop player profile renewal");
    await captureViewport(desktop, "69a-player-profile-desktop");
    await desktop.keyboard.press("Escape");
    await expect(profile).toBeHidden();
    await expect(firstPlayer).toBeFocused();
  } finally {
    await desktop.close();
  }
});

test("narrow Squad and player profile reflow without horizontal scrolling", async ({ browser }) => {
  const narrow = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    await narrow.emulateMedia({ reducedMotion: "reduce" });
    await resetCareerStorage(narrow);
    await narrow.getByRole("button", { name: "New career", exact: true }).click();
    await narrow.getByRole("combobox", { name: "Career navigation", exact: true }).selectOption("squad");
    await expect(narrow.getByRole("heading", { level: 1, name: "Squad", exact: true })).toBeVisible();
    await assertNoPageOverflow(narrow, "narrow Squad");
    await capture(narrow, "69b-squad-narrow");

    const firstPlayer = narrow.locator(".tls-squad-table tbody tr").first();
    await firstPlayer.focus();
    await narrow.keyboard.press("Enter");
    const profile = narrow.getByRole("dialog", { name: /.+/ });
    await expect(profile).toBeVisible();
    await expect(profile.locator(".tls-contract-workspace")).toBeVisible();
    await assertNoPageOverflow(narrow, "narrow player profile");
    await captureViewport(narrow, "69f-player-profile-narrow");

    await narrow.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    await assertNoPageOverflow(narrow, "narrow player profile at 200% text");
    await expect(profile).toHaveCSS("overflow-x", "hidden");
    expect(await profile.locator(".tls-player-profile-shell").evaluate((element) => {
      const shellBounds = element.getBoundingClientRect();
      return [...element.querySelectorAll<HTMLElement>("*")]
        .filter((child) => {
          const bounds = child.getBoundingClientRect();
          return bounds.left < shellBounds.left - 1 || bounds.right > shellBounds.right + 1;
        })
        .map((child) => child.className || child.tagName);
    })).toEqual([]);
    await narrow.evaluate(() => {
      document.documentElement.style.fontSize = "";
    });
    await narrow.keyboard.press("Escape");
    await expect(profile).toBeHidden();

    await narrow.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    await assertNoPageOverflow(narrow, "narrow Squad at 200% text");
    await capture(narrow, "69c-squad-text-zoom-narrow");
  } finally {
    await narrow.close();
  }
});

test("desktop Market presents window, budget, targets, and a public inspection profile", async ({ browser }) => {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await resetCareerStorage(desktop);
    await desktop.getByRole("button", { name: "New career", exact: true }).click();
    await desktop.getByRole("button", { name: "Market", exact: true }).click();

    await expect(desktop.getByRole("heading", { level: 1, name: "Market", exact: true })).toBeVisible();
    await expectMainFocus(desktop);
    await expect(desktop.locator(".tls-market-window")).toBeVisible();
    await expect(desktop.locator(".tls-market-finance-strip")).toBeVisible();
    await expect(desktop.locator(".tls-market-table-frame")).toHaveCSS("overflow-x", "hidden");
    const targetRows = desktop.locator(".tls-market-table tbody tr");
    await expect(targetRows.first()).toBeVisible();
    await assertNoPageOverflow(desktop, "desktop Market");
    await capture(desktop, "79a-market-desktop");

    const firstTarget = targetRows.first();
    await firstTarget.focus();
    await desktop.keyboard.press("Enter");
    const profile = desktop.getByRole("dialog", { name: /.+/ });
    await expect(profile).toBeVisible();
    await expect(desktop.locator(".tls-market-player-summary")).toBeVisible();
    await expect(desktop.locator(".tls-market-eligibility-detail")).toBeVisible();
    await assertNoPageOverflow(desktop, "desktop Market player profile");
    await captureViewport(desktop, "79b-market-player-profile-desktop");
    await desktop.keyboard.press("Escape");
    await expect(profile).toBeHidden();
    await expect(firstTarget).toBeFocused();
  } finally {
    await desktop.close();
  }
});

test("narrow Market reflows filters and the target table without horizontal scrolling", async ({ browser }) => {
  const narrow = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    await narrow.emulateMedia({ reducedMotion: "reduce" });
    await resetCareerStorage(narrow);
    await narrow.getByRole("button", { name: "New career", exact: true }).click();
    await narrow.getByRole("combobox", { name: "Career navigation", exact: true }).selectOption("market");
    await expect(narrow.getByRole("heading", { level: 1, name: "Market", exact: true })).toBeVisible();
    await assertNoPageOverflow(narrow, "narrow Market");
    await capture(narrow, "79c-market-narrow");

    const firstTarget = narrow.locator(".tls-market-table tbody tr").first();
    await firstTarget.focus();
    await narrow.keyboard.press("Enter");
    const profile = narrow.getByRole("dialog", { name: /.+/ });
    await expect(profile).toBeVisible();
    await assertNoPageOverflow(narrow, "narrow Market player profile");
    await narrow.keyboard.press("Escape");
    await expect(profile).toBeHidden();
  } finally {
    await narrow.close();
  }
});

test("a submitted transfer offer stays pending, tracks exposure, and withdraws cleanly", async ({ browser }) => {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await resetCareerStorage(desktop);
    await desktop.getByRole("button", { name: "New career", exact: true }).click();
    await desktop.getByRole("button", { name: "Market", exact: true }).click();
    await expect(desktop.getByRole("heading", { level: 1, name: "Market", exact: true })).toBeVisible();

    const transferBudgetBefore = await desktop.locator(".tls-market-window").locator("xpath=following-sibling::div[1]").locator("strong").innerText();

    const firstOpenTarget = desktop.locator(".tls-market-table tbody tr").first();
    await firstOpenTarget.getByRole("button", { name: /Open .+ market profile/ }).click();
    const profile = desktop.getByRole("dialog", { name: /.+/ });
    await expect(profile).toBeVisible();

    const feeInput = profile.locator(".tls-market-composer input");
    await expect(feeInput).toBeVisible();
    await feeInput.fill("1500000");
    await expect(profile.locator(".tls-contract-finance-ok")).toBeVisible();
    await profile.getByRole("button", { name: "Submit offer", exact: true }).click();

    await expect(profile.getByText("Offer submitted. Expect a reply within three game days.", { exact: true })).toBeVisible();
    await expect(profile.getByText("Waiting for the selling club's reply.", { exact: true })).toBeVisible();
    await assertNoPageOverflow(desktop, "desktop Market pending offer");
    await captureViewport(desktop, "79d-market-pending-offer-desktop");

    await expect(desktop.getByText("€1,500,000", { exact: true })).toBeVisible();
    await expect(desktop.getByText("1 open talks", { exact: true })).toBeVisible();
    await expect(desktop.getByText(transferBudgetBefore, { exact: true })).toBeVisible();

    await profile.getByRole("button", { name: "Withdraw", exact: true }).click();
    await expect(profile.getByText("Talks withdrawn.", { exact: true })).toBeVisible();
    await expect(desktop.getByText("0 open talks", { exact: true })).toBeVisible();
    await expect(profile.locator(".tls-market-composer input")).toBeVisible();
  } finally {
    await desktop.close();
  }
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
    await expect(page.locator(".tls-inbox-workspace")).toHaveAttribute("data-motion-view", "list");
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
    await expect(page.locator(".tls-inbox-workspace")).toHaveAttribute("data-motion-view", "detail");
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
    await page.getByRole("button", { name: "Dashboard", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Dashboard", exact: true })).toBeVisible();
    expect(await currentPreparationFingerprint(page)).toBe(partialFingerprint);
    await page.getByRole("button", { name: "Tactics", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Tactics", exact: true })).toBeVisible();
    expect(await currentPreparationFingerprint(page)).toBe(partialFingerprint);
    await page.getByRole("button", { name: "Main menu", exact: true }).click();
    const partialDialog = page.locator(".tls-unsaved-dialog");
    await expect(partialDialog.getByRole("heading", { name: "Leave team preparation?", exact: true })).toBeVisible();
    await expect(partialDialog).toHaveAttribute("data-motion-state", "open");
    await expect(partialDialog.getByRole("button", { name: "Stay", exact: true })).toBeFocused();
    await expect(partialDialog.getByRole("button", { name: "Discard changes", exact: true })).toBeVisible();
    await expect(partialDialog.getByRole("button", { name: "Save and continue", exact: true })).toHaveCount(0);
    await capture(page, "42-preparation-partial-dialog-desktop");
    await partialDialog.getByRole("button", { name: "Stay", exact: true }).click();
    expect(await currentPreparationFingerprint(page)).toBe(partialFingerprint);

    await page.getByRole("button", { name: "Main menu", exact: true }).click();
    await partialDialog.getByRole("button", { name: "Discard changes", exact: true }).click();
    await expect(page.getByRole("button", { name: "Continue career", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Continue career", exact: true }).click();
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

    await page.getByRole("button", { name: "Main menu", exact: true }).click();
    const completeDialog = page.locator(".tls-unsaved-dialog");
    await expect(completeDialog.getByRole("button", { name: "Save and continue", exact: true })).toBeVisible();
    await capture(page, "46-preparation-complete-dialog-desktop");
    await completeDialog.getByRole("button", { name: "Save and continue", exact: true }).click();
    await expect(page.getByRole("button", { name: "Continue career", exact: true })).toBeVisible();

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

    await page.getByRole("button", { name: "Main menu", exact: true }).click();
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
    await assertTacticalMotionOwnership(page, "prepared lineup");
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

    await dragTacticalSlotToNorm(page, "cm-right", 0.5, 0.32);
    await expect(page.locator(".tls-tactical-board-adaptation")).toBeVisible();
    await expect(page.locator(".tls-tactical-board-adaptation-role").filter({ hasText: "TRQ" })).toHaveCount(1);
    await assertTacticalPopoverPlacement(page, 0.5, 0.32);
    await capture(page, "52a-role-adaptation-popover-desktop");
    await page.getByRole("button", { name: "Apply changes", exact: true }).click();
    await expect(page.locator("[data-slot-id='cm-right'][data-role='TRQ']")).toHaveCount(1);
    await rightClickTacticalSlot(page, "cm-right");
    await expect(page.locator("[data-role-option='TRQ']")).toHaveCount(1);
    await expect(page.locator("[data-role-option='ATT']")).toHaveCount(0);
    await page.keyboard.press("Escape");

    const starterBeforeSwap = await page.locator("[data-slot-id='cm-left'] .tls-tactical-board-token-name")
      .textContent();
    const substituteBeforeSwap = await page.locator("[data-bench-slot-id='bench:01'] .tls-tactical-bench-player-name")
      .textContent();
    await dragTacticalSlotToBench(page, "cm-left", "bench:01");
    await expect(page.locator("[data-slot-id='cm-left'] .tls-tactical-board-token-name"))
      .toHaveText(substituteBeforeSwap ?? "");
    await expect(page.locator("[data-bench-slot-id='bench:01'] .tls-tactical-bench-player-name"))
      .toHaveText(starterBeforeSwap ?? "");
    await dragBenchSlotToTacticalSlot(page, "bench:01", "cm-left");
    await expect(page.locator("[data-slot-id='cm-left'] .tls-tactical-board-token-name"))
      .toHaveText(starterBeforeSwap ?? "");
    await expect(page.locator("[data-bench-slot-id='bench:01'] .tls-tactical-bench-player-name"))
      .toHaveText(substituteBeforeSwap ?? "");

    const previousSuitability = await page.locator("[data-slot-id='rm']").first().getAttribute("data-suitability");
    await dragTacticalSlotToNorm(page, "rm", 0.9, 0.2);
    await expect(page.locator(".tls-tactical-board-adaptation-role").filter({ hasText: "AD" })).toHaveCount(1);
    await page.getByRole("button", { name: "Apply changes", exact: true }).click();
    await expect(page.locator("[data-slot-id='rm'][data-role='AD']")).toHaveCount(1);
    await expect(page.locator(".tls-tactical-board-header").getByText("4-3-3", { exact: true })).toBeVisible();
    await assertTacticalMotionOwnership(page, "role-adjusted lineup");
    expect(await page.locator("[data-slot-id='rm']").first().getAttribute("data-suitability")).not.toBe(previousSuitability);

    await rightClickTacticalSlot(page, "rm");
    await page.getByRole("button", { name: /Remove from lineup/i }).click();
    await page.locator(".tls-tactical-board-empty-slot[data-slot-id='rm']").click();
    const assignmentMenuGeometry = await page.locator(".tls-tactical-board-menu-popover").evaluate((popover) => ({
      clientWidth: popover.clientWidth,
      scrollWidth: popover.scrollWidth,
      fieldWidth: popover.parentElement?.clientWidth ?? 0,
    }));
    expect(assignmentMenuGeometry.scrollWidth).toBeLessThanOrEqual(assignmentMenuGeometry.clientWidth + 1);
    expect(assignmentMenuGeometry.clientWidth).toBeLessThanOrEqual(351);
    expect(assignmentMenuGeometry.clientWidth).toBeGreaterThanOrEqual(
      Math.min(350, assignmentMenuGeometry.fieldWidth - 16) - 1,
    );
    const suitabilityOrder = await page.locator(".tls-player-candidate-row").evaluateAll((rows) =>
      rows.map((row) => row.getAttribute("data-suitability") ?? ""),
    );
    expect(suitabilityOrder.length).toBeGreaterThan(0);
    expect(suitabilityOrder.map(tacticalSuitabilityRank)).toEqual(
      [...suitabilityOrder].map(tacticalSuitabilityRank).sort((left, right) => left - right),
    );
    await capture(page, "52b-tactical-board-player-selector-desktop");
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
  const page = await browser.newPage({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
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
    await assertFullWidthPreMatch(page, "narrow Matchday");
    await capture(page, "10-matchday-narrow");

    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    await assertNoPageOverflow(page, "narrow Matchday at 200% text");
    await expect(page.getByRole("combobox", { name: "Career navigation", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Start match", exact: true })).toBeVisible();
    await capture(page, "11-matchday-text-zoom-narrow");

    await page.evaluate(() => {
      document.documentElement.style.fontSize = "";
    });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.clock.install();
    await page.getByRole("button", { name: "Start match", exact: true }).tap();
    await expect(page.locator("[data-motion-checkpoint='first_half']")).toBeVisible();
    await page.locator(".tls-matchday-playback-toggle").tap();
    await page.getByRole("button", { name: "Playback speed 2x", exact: true }).tap();
    await assertMatchdayInteractiveTargets(page, "narrow paused first-half playback");
    await assertNoPageOverflow(page, "narrow paused first-half playback");
    await capture(page, "11a-first-half-paused-narrow");

    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    await assertMatchdayInteractiveTargets(page, "narrow paused first-half playback at 200% text");
    await assertNoPageOverflow(page, "narrow paused first-half playback at 200% text");
    await capture(page, "11b-first-half-paused-text-zoom-narrow");
  } finally {
    await page.close();
  }
});

test("one explicit start command presents the first half and stops at the canonical checkpoint", async ({ browser }) => {
  const page = await browser.newPage({
    hasTouch: true,
    viewport: { width: 1440, height: 900 },
  });
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
    await expect(page.locator("[data-motion-checkpoint='first_half']")).toBeVisible();
    const playbackControls = page.getByRole("region", { name: "Playback controls", exact: true });
    await expect(playbackControls).toBeVisible();
    await expect(page.getByRole("button", { name: "Playback speed 1x", exact: true })).toHaveAttribute("aria-pressed", "true");
    const liveCommentary = page.locator(".tls-match-broadcast-live-line");
    await expect(liveCommentary).toHaveCount(1);
    await expect(liveCommentary).toHaveAttribute("role", "status");
    await expect(liveCommentary).toHaveAttribute("aria-live", "polite");
    await expect(liveCommentary).toHaveAttribute("aria-atomic", "true");
    await expect(liveCommentary).toHaveAttribute("data-commentary-priority", "transition");
    await expect(liveCommentary).toHaveAttribute("data-motion-commentary-key", /.+/);
    await expect(liveCommentary).toHaveAttribute("data-motion-category", "transition");
    await expect(page.locator(".tls-matchday-score [data-score-motion]")).toHaveCount(2);
    await expect(page.locator(".tls-matchday-score [data-score-changed='true']")).toHaveCount(0);
    const matchClock = page.locator(".tls-matchday-clock");
    await expect(matchClock).toBeVisible();
    await expect(matchClock).toHaveAttribute("data-clock-running", "true");
    await expect(matchClock.locator("[data-motion-clock-minute]")).toHaveText(/\d+'/);
    await expect(page.locator(".tls-matchday-score-status")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Pause", exact: true })).toHaveCount(1);
    const clockHierarchy = await page.evaluate(() => {
      const clock = document.querySelector<HTMLElement>(".tls-matchday-clock");
      const score = document.querySelector<HTMLElement>(".tls-matchday-score");
      return {
        clock: clock === null ? 0 : Number.parseFloat(getComputedStyle(clock).fontSize),
        score: score === null ? 0 : Number.parseFloat(getComputedStyle(score).fontSize),
      };
    });
    expect(clockHierarchy.clock).toBeGreaterThanOrEqual(clockHierarchy.score * 0.65);
    expect(clockHierarchy.clock).toBeLessThan(clockHierarchy.score);
    await expect(playbackControls.locator("[data-motion-control]")).toHaveCount(4);
    await expect(page.locator(".tls-match-centre-live-feed, .tls-match-centre-live-phase")).toHaveCount(0);
    await assertMatchdayInteractiveTargets(page, "first-half playback");
    const openingPageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    await capture(page, "63-first-half-opening");

    await playbackControls.getByRole("button", { name: "Pause", exact: true }).tap();
    await expect(playbackControls).toHaveAttribute("data-paused", "true");
    await expect(matchClock).toHaveAttribute("data-clock-running", "false");
    const pausedCommentaryKey = await liveCommentary.getAttribute("data-motion-commentary-key");
    await page.clock.runFor(5_000);
    await expect(liveCommentary).toHaveAttribute("data-motion-commentary-key", pausedCommentaryKey ?? "");
    await capture(page, "63a-first-half-paused");

    await playbackControls.getByRole("button", { name: "Resume", exact: true }).click();
    await expect(matchClock).toHaveAttribute("data-clock-running", "true");
    await page.getByRole("button", { name: "Playback speed 2x", exact: true }).click();
    await expect(playbackControls).toHaveAttribute("data-speed", "2x");
    await capture(page, "63b-first-half-speed-2x");

    // Speed controls belong only to live playback. Prove every option before
    // advancing the fake clock far enough to reach the half-time checkpoint.
    await page.getByRole("button", { name: "Playback speed 4x", exact: true }).click();
    await expect(playbackControls).toHaveAttribute("data-speed", "4x");
    await capture(page, "64b-first-half-speed-4x");

    let sawDetailMoment = false;
    let sawGoalMoment = false;
    for (let elapsed = 0; elapsed <= 60_000; elapsed += 50) {
      if (await page.locator("[data-motion-checkpoint='half_time']").count() > 0) break;
      const priority = await liveCommentary.getAttribute("data-commentary-priority");
      if ((priority === "detail" || priority === "secondary") && !sawDetailMoment) {
        sawDetailMoment = true;
        await expect(liveCommentary).toHaveCount(1);
        await expect(liveCommentary).toHaveAttribute("data-motion-category", "transition");
        await expect(page.locator(".tls-matchday-score [data-score-changed='true']")).toHaveCount(0);
        expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(openingPageHeight);
        await capture(page, "64c-first-half-detail-moment");
        await playbackControls.getByRole("button", { name: "Pause", exact: true }).click();
        const pausedKey = await liveCommentary.getAttribute("data-motion-commentary-key");
        await page.clock.runFor(2_000);
        await expect(liveCommentary).toHaveAttribute("data-motion-commentary-key", pausedKey ?? "");
        await playbackControls.getByRole("button", { name: "Resume", exact: true }).click();
      }
      const commentaryPriority = await liveCommentary.getAttribute("data-commentary-priority");
      if (commentaryPriority === "goal") {
        sawGoalMoment = true;
        break;
      }
      await page.clock.runFor(50);
    }
    if (sawGoalMoment) {
      await expect(liveCommentary).toHaveAttribute("data-commentary-priority", "goal");
      await expect(liveCommentary).toHaveAttribute("data-motion-category", "narrative");
      await expect(liveCommentary).toContainText("Goal");
      expect(await page.locator(".tls-matchday-score [data-score-changed='true']").count()).toBeGreaterThan(0);
      const currentGoalEventId = await liveCommentary.getAttribute("data-event-id");
      expect(currentGoalEventId).not.toBeNull();
      await expect(page.locator(`[data-motion-incident="${currentGoalEventId}"]`))
        .toHaveAttribute("data-motion-category", "narrative");
      expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(openingPageHeight);
      await capture(page, "64-first-half-goal-hold");
      await playbackControls.getByRole("button", { name: "Pause", exact: true }).click();
      const pausedGoalKey = await liveCommentary.getAttribute("data-motion-commentary-key");
      await page.clock.runFor(5_000);
      await expect(liveCommentary).toHaveAttribute("data-motion-commentary-key", pausedGoalKey ?? "");
      await capture(page, "64a-first-half-goal-paused");
      await playbackControls.getByRole("button", { name: "Resume", exact: true }).click();
    }

    if (!sawDetailMoment) {
      for (let elapsed = 0; elapsed <= 60_000; elapsed += 50) {
        if (await page.locator("[data-motion-checkpoint='half_time']").count() > 0) break;
        const priority = await liveCommentary.getAttribute("data-commentary-priority");
        if (priority === "detail" || priority === "secondary") {
          sawDetailMoment = true;
          await expect(liveCommentary).toHaveAttribute("data-motion-category", "transition");
          await expect(page.locator(".tls-matchday-score [data-score-changed='true']")).toHaveCount(0);
          expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(openingPageHeight);
          await capture(page, "64c-first-half-detail-moment");
          await playbackControls.getByRole("button", { name: "Pause", exact: true }).click();
          const pausedKey = await liveCommentary.getAttribute("data-motion-commentary-key");
          await page.clock.runFor(2_000);
          await expect(liveCommentary).toHaveAttribute("data-motion-commentary-key", pausedKey ?? "");
          await playbackControls.getByRole("button", { name: "Resume", exact: true }).click();
          break;
        }
        await page.clock.runFor(50);
      }
    }
    expect(sawDetailMoment).toBe(true);
    await advanceClockUntilPlaybackStage(page, "closing");
    await capture(page, "65-first-half-closing");

    await expect(page.getByRole("button", { name: "Start second half", exact: true })).toBeVisible();
    await expect(page.locator("[data-motion-checkpoint='half_time']"))
      .toHaveAttribute("data-motion-active", "true");
    await expect(page.locator("[data-motion-checkpoint-panel='half_time']"))
      .toHaveAttribute("data-motion-active", "true");
    await expect(playbackControls).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Play to half-time", exact: true })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "First-half review", exact: true })).toHaveCount(0);
    const halfTimeTabs = page.getByRole("tablist", { name: "Half-time views", exact: true });
    await expect(halfTimeTabs).toBeVisible();
    await expect(halfTimeTabs.getByRole("tab")).toHaveCount(4);
    await expect(halfTimeTabs.getByRole("tab", { name: "Summary", exact: true })).toHaveAttribute("aria-selected", "true");
    await expect(halfTimeTabs.getByRole("tab", { name: "Tactics", exact: true })).toBeEnabled();
    await expect(page.getByRole("heading", { name: "Decision signals", exact: true })).toHaveCount(0);
    await expect(page.getByText("0/5 changes", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Half-time board", exact: true })).toHaveCount(0);
    await expect(page.getByText("Half-time score", { exact: true })).toHaveCount(0);
    await expect.poll(() => liveMatchPhase(page)).toMatchObject({ phase: "half_time" });
    await expectMainFocus(page);
    await assertSkipLinkRestingOffCanvas(page, "desktop half-time checkpoint");
    await assertMatchdayTabsContained(page, halfTimeTabs, "desktop half-time checkpoint");
    await assertNoPageOverflow(page, "desktop half-time checkpoint");
    await assertCompactTabellino(
      page,
      "desktop half-time checkpoint",
      await page.locator(".tls-match-tabellino").count() > 0,
    );
    await assertHalfTimeInteractiveTargets(page);
    await capture(page, "66-half-time-arrival");

    await halfTimeTabs.getByRole("tab", { name: "Tactics", exact: true }).click();
    const liveStarterBeforeSwap = await page.locator("[data-slot-id='st-left'] .tls-tactical-board-token-name")
      .textContent();
    const liveSubstituteBeforeSwap = await page.locator("[data-bench-slot-id='bench:01'] .tls-tactical-bench-player-name")
      .textContent();
    await dragTacticalSlotToBench(page, "st-left", "bench:01");
    await expect(page.locator("[data-slot-id='st-left'] .tls-tactical-board-token-name"))
      .toHaveText(liveSubstituteBeforeSwap ?? "");
    await expect(page.locator("[data-bench-slot-id='bench:01'] .tls-tactical-bench-player-name"))
      .toHaveText(liveStarterBeforeSwap ?? "");
    await halfTimeTabs.getByRole("tab", { name: "Summary", exact: true }).click();

    await setHalfTimeEventLight(page);
    await expect(page.locator(".tls-match-tabellino")).toHaveCount(0);
    await assertNoPageOverflow(page, "desktop event-light half-time checkpoint");
    await capture(page, "66b-half-time-event-light");

    await page.clock.resume();
    page.once("dialog", (dialog) => dialog.accept());
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.getByTestId("app-entry-screen")).toBeVisible();
    await page.getByRole("button", { name: "Continue career", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Dashboard", exact: true })).toBeVisible();
    await expect.poll(() => durableMatchFacts(page)).toEqual({ playedFixtures: 0 });
  } finally {
    await page.close();
  }
});

test("reduced motion reaches the same half-time decision without interpolated clicks", async ({ browser }) => {
  const page = await browser.newPage({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  try {
    await resetCareerStorage(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.getByRole("button", { name: "New career", exact: true }).click();
    await page.getByRole("button", { name: "Prepare match", exact: true }).click();
    await prepareMatch(page);
    await page.clock.install();
    await page.getByRole("button", { name: "Start match", exact: true }).click();

    await advanceClockUntilPlaybackStage(page, "closing");
    await expect(page.getByRole("button", { name: "Start second half", exact: true })).toBeVisible();
    await expect(page.locator("[data-motion-checkpoint='half_time']"))
      .toHaveAttribute("data-motion-active", "false");
    await expect(page.locator("[data-motion-checkpoint-panel='half_time']"))
      .toHaveAttribute("data-motion-active", "false");
    await expect(page.getByRole("button", { name: "Play to half-time", exact: true })).toHaveCount(0);
    await expect.poll(() => liveMatchPhase(page)).toMatchObject({ phase: "half_time" });
    await expectMainFocus(page);
    await assertSkipLinkRestingOffCanvas(page, "reduced-motion half-time checkpoint");
    await assertNoPageOverflow(page, "reduced-motion half-time checkpoint");
    await assertHalfTimeInteractiveTargets(page);
    await capture(page, "67-half-time-reduced-motion-narrow");

    const halfTimeTabs = page.getByRole("tablist", { name: "Half-time views", exact: true });
    await assertMatchdayTabsContained(page, halfTimeTabs, "reduced-motion half-time checkpoint");
    const halfTimeSummaryTab = halfTimeTabs.getByRole("tab", { name: "Summary", exact: true });
    const halfTimeTacticsTab = halfTimeTabs.getByRole("tab", { name: "Tactics", exact: true });
    const halfTimeSelectedTeamTab = halfTimeTabs.getByRole("tab", { name: "Your team", exact: true });
    const halfTimeOpponentTab = halfTimeTabs.getByRole("tab", { name: "Opponent", exact: true });
    await halfTimeSummaryTab.focus();
    await page.keyboard.press("ArrowRight");
    await expect(halfTimeTacticsTab).toBeFocused();
    await expect(halfTimeTacticsTab).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("[data-motion-tab-panel='tactics']"))
      .toHaveAttribute("data-motion-active", "false");
    await expect(page.getByRole("heading", { name: "Half-time board", exact: true })).toBeVisible();
    await assertTacticalMotionOwnership(page, "half-time tactics");
    const formationSelect = page.locator(".tls-matchday-tactical-toolbar select");
    await expect(formationSelect).toHaveValue("4-4-2");
    const rightMidfielderBefore = await tacticalSlotNorm(page, "rm");
    await dragTacticalSlotToNorm(
      page,
      "rm",
      Math.max(0, rightMidfielderBefore.nx - 0.02),
      rightMidfielderBefore.ny,
    );
    const rightMidfielderAfter = await tacticalSlotNorm(page, "rm");
    expect(rightMidfielderAfter.nx).not.toBe(rightMidfielderBefore.nx);
    await assertNoPageOverflow(page, "reduced-motion half-time tactics tab");
    await capture(page, "67a-half-time-tactics-narrow");

    await page.keyboard.press("ArrowRight");
    await expect(halfTimeSelectedTeamTab).toBeFocused();
    await expect(halfTimeSelectedTeamTab).toHaveAttribute("aria-selected", "true");
    await expect.poll(() => page.locator(".tls-match-team-ratings .tls-match-centre-rating-row").count()).toBeGreaterThan(0);
    await assertNoPageOverflow(page, "reduced-motion half-time selected-team tab");
    await capture(page, "67aa-half-time-selected-team-narrow");

    await page.keyboard.press("ArrowRight");
    await expect(halfTimeOpponentTab).toBeFocused();
    await expect(halfTimeOpponentTab).toHaveAttribute("aria-selected", "true");
    await expect.poll(() => page.locator(".tls-match-team-ratings .tls-match-centre-rating-row").count()).toBeGreaterThan(0);
    await assertNoPageOverflow(page, "reduced-motion half-time opponent tab");
    await capture(page, "67ab-half-time-opponent-narrow");

    await halfTimeSummaryTab.tap();
    await halfTimeTacticsTab.tap();
    await expect(formationSelect).toHaveValue("4-4-2");

    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    await assertNoPageOverflow(page, "reduced-motion half-time checkpoint at 200% text");
    await assertMatchdayTabsContained(page, halfTimeTabs, "reduced-motion half-time checkpoint at 200% text");
    if (await page.locator(".tls-match-tabellino").count() > 0) {
      await assertTabellinoFactsNotClipped(page, "reduced-motion half-time checkpoint at 200% text");
    }
    await capture(page, "67b-half-time-text-zoom-narrow");
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "";
    });
    await page.getByRole("button", { name: "Start second half", exact: true }).click();
    await advanceClockUntilPlaybackStage(page, "closing");
    await expect(page.getByRole("button", { name: "Continue", exact: true })).toBeVisible();
    await expect(page.locator("[data-motion-checkpoint='full_time']"))
      .toHaveAttribute("data-motion-active", "false");
    await expect(page.locator("[data-motion-checkpoint-panel='full_time']"))
      .toHaveAttribute("data-motion-active", "false");
    await expect(page.getByRole("button", { name: "Play to full time", exact: true })).toHaveCount(0);
    await expect.poll(() => durableMatchFacts(page)).toEqual({ playedFixtures: 0 });
    await expectMainFocus(page);
    await assertSkipLinkRestingOffCanvas(page, "reduced-motion full-time review");
    await assertFullTimeFootballReview(page, "reduced-motion full-time review");
    await assertCompactTabellino(
      page,
      "reduced-motion full-time review",
      await page.locator(".tls-match-tabellino").count() > 0,
    );
    await assertNoPageOverflow(page, "reduced-motion full-time review");
    await capture(page, "68-full-time-reduced-motion-narrow");

    const fullTimeTabs = page.getByRole("tablist", { name: "Full-time review views", exact: true });
    await assertMatchdayTabsContained(page, fullTimeTabs, "reduced-motion full-time review");
    const summaryTab = fullTimeTabs.getByRole("tab", { name: "Summary", exact: true });
    const selectedTeamTab = fullTimeTabs.getByRole("tab", { name: "Your team", exact: true });
    const opponentTab = fullTimeTabs.getByRole("tab", { name: "Opponent", exact: true });
    await expect(summaryTab).toHaveAttribute("aria-selected", "true");
    await summaryTab.focus();
    await page.keyboard.press("ArrowRight");
    await expect(selectedTeamTab).toBeFocused();
    await expect(selectedTeamTab).toHaveAttribute("aria-selected", "true");
    await assertNoPageOverflow(page, "reduced-motion selected-team full-time review");
    await capture(page, "68a-full-time-selected-team-narrow");

    await page.keyboard.press("ArrowRight");
    await expect(opponentTab).toBeFocused();
    await expect(opponentTab).toHaveAttribute("aria-selected", "true");
    await assertNoPageOverflow(page, "reduced-motion opponent full-time review");
    await capture(page, "68aa-full-time-opponent-narrow");

    await page.keyboard.press("Home");
    await expect(summaryTab).toBeFocused();
    await expect(summaryTab).toHaveAttribute("aria-selected", "true");

    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    await assertFullTimeFootballReview(page, "reduced-motion full-time review at 200% text");
    await assertNoPageOverflow(page, "reduced-motion full-time review at 200% text");
    await assertMatchdayTabsContained(page, fullTimeTabs, "reduced-motion full-time review at 200% text");
    if (await page.locator(".tls-match-tabellino").count() > 0) {
      await assertTabellinoFactsNotClipped(page, "reduced-motion full-time review at 200% text");
    }
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
    await expect(page.getByRole("button", { name: "Start second half", exact: true })).toBeVisible();

    await setMatchdayCommandActivity(page, "pending", "play_second_half");
    await capture(page, "69-second-half-start-pending");
    await setMatchdayCommandActivity(page, "failed", "play_second_half");
    await capture(page, "70-second-half-start-failure");
    await setMatchdayCommandActivity(page, "clear", "play_second_half");

    await page.getByRole("button", { name: "Start second half", exact: true }).click();
    await expect(page.locator("[data-motion-checkpoint='second_half']")).toBeVisible();
    await expect(page.locator("[data-motion-checkpoint='second_half']"))
      .toHaveAttribute("data-motion-active", "true");
    await expect(page.locator(".tls-match-broadcast-live-line")).toHaveCount(1);
    await expect(page.locator(".tls-match-broadcast-live-line"))
      .toHaveAttribute("data-motion-commentary-key", /.+/);
    await expect(page.getByRole("button", { name: "Play to full time", exact: true })).toHaveCount(0);
    await capture(page, "71-second-half-opening");
    await advanceClockUntilPlaybackStage(page, "event");
    await capture(page, "72-second-half-event");
    await advanceClockUntilPlaybackStage(page, "closing");
    await capture(page, "73-second-half-closing");

    await expect(page.getByRole("button", { name: "Continue", exact: true })).toBeVisible();
    await expect(page.locator("[data-motion-checkpoint='full_time']"))
      .toHaveAttribute("data-motion-active", "true");
    await expect(page.locator("[data-motion-checkpoint-panel='full_time']"))
      .toHaveAttribute("data-motion-active", "true");
    await expect(page.getByRole("button", { name: "Play to full time", exact: true })).toHaveCount(0);
    await expect.poll(() => durableMatchFacts(page)).toEqual({ playedFixtures: 0 });
    await assertFullTimeFootballReview(page, "desktop full-time review");
    await assertCompactTabellino(page, "desktop full-time review", true);
    await assertNoPageOverflow(page, "desktop full-time review");
    await capture(page, "74-full-time-event-rich");

    await selectFullTimeReviewTab(page, "Opponent");
    await expect(page.locator("[data-motion-tab-panel='opponent']"))
      .toHaveAttribute("data-motion-active", "true");
    await assertNoPageOverflow(page, "desktop opponent full-time review");
    await capture(page, "74e-full-time-opponent");

    await selectFullTimeReviewTab(page, "Your team");
    await assertNoPageOverflow(page, "desktop selected-team full-time review");
    await capture(page, "74f-full-time-selected-team");

    await page.clock.resume();
    page.once("dialog", (dialog) => dialog.accept());
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.getByTestId("app-entry-screen")).toBeVisible();
    await page.getByRole("button", { name: "Continue career", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Dashboard", exact: true })).toBeVisible();
    await expect.poll(() => durableMatchFacts(page)).toEqual({ playedFixtures: 0 });
  } finally {
    await page.close();
  }
});

test("the second fixture returns to preparation and starts without a false storage failure", async ({ browser }) => {
  test.setTimeout(180_000);
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await resetCareerStorage(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.getByRole("button", { name: "New career", exact: true }).click();
    await page.getByRole("button", { name: "Prepare match", exact: true }).click();
    await prepareMatch(page);
    await page.getByRole("button", { name: "Start match", exact: true }).click();
    await expect(page.locator("[data-motion-checkpoint]"))
      .toHaveAttribute("data-motion-checkpoint", "first_half");
    await advanceClockUntilPlaybackStage(page, "closing", "real");
    await expect(page.getByRole("button", { name: "Start second half", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Start second half", exact: true }).click();
    await expect(page.locator("[data-motion-checkpoint]"))
      .toHaveAttribute("data-motion-checkpoint", "second_half");
    await advanceClockUntilPlaybackStage(page, "closing", "real");
    await expect(page.getByRole("button", { name: "Continue", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Dashboard", exact: true })).toBeVisible();

    await page.locator(".tls-dashboard-primary-action").click();
    await expect(page.getByRole("heading", { level: 1, name: "Inbox", exact: true })).toBeVisible();
    await acknowledgeDueAttentionUntilMatchday(page);
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
    await expect(page.locator("[data-motion-checkpoint]"))
      .toHaveAttribute("data-motion-checkpoint", "first_half");
    await advanceClockUntilPlaybackStage(page, "closing", "real");
    await expect(page.getByRole("button", { name: "Start second half", exact: true })).toBeVisible();
    await expect(page.locator(".tls-storage-recovery[data-state='recovery']")).toHaveCount(0);
    await expect.poll(() => liveMatchPhase(page)).toMatchObject({ phase: "half_time" });
  } finally {
    await page.close();
  }
});

/** Confirms that tactical continuity belongs to the fixed XI and bench slots only. */
async function assertTacticalMotionOwnership(page: Page, context: string): Promise<void> {
  const pitchSlots = page.locator(".tls-tactical-board-svg [data-motion-slot-key]");
  const benchSlots = page.locator(".tls-tactical-bench-board [data-motion-slot-key]");

  await expect(pitchSlots, `${context}: animated pitch slots`).toHaveCount(11);
  await expect(benchSlots, `${context}: animated bench slots`).toHaveCount(8);
  await expect(page.locator(".tls-tactical-board-svg"), `${context}: formation key`)
    .toHaveAttribute("data-formation-motion-key", /.+/);

  const motionSlotKeys = await page.locator("[data-motion-slot-key]").evaluateAll((slots) => (
    slots.map((slot) => slot.getAttribute("data-motion-slot-key"))
  ));
  expect(new Set(motionSlotKeys).size, `${context}: unique animation owners`).toBe(19);
}

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
    await expect(page.locator(".tls-tactical-board-role-destinations")).toBeAttached();
    expect(await page.locator(".tls-tactical-board-role-destination").count()).toBeGreaterThan(0);
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
  await expect(page.locator(".tls-tactical-board-role-destinations")).toHaveCount(0);
}

/** Drags one starter across the SVG boundary onto a fixed bench slot. */
async function dragTacticalSlotToBench(page: Page, slotId: string, benchSlotId: string): Promise<void> {
  await page.locator(".tls-tactical-workspace-grid").scrollIntoViewIfNeeded();
  const start = await tacticalSlotCenter(page, slotId);
  const targetBox = await page.locator(`[data-bench-slot-id="${benchSlotId}"]`).boundingBox();
  if (targetBox === null) throw new Error(`Missing tactical bench slot ${benchSlotId}.`);

  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(
    targetBox.x + targetBox.width / 2,
    targetBox.y + targetBox.height / 2,
    { steps: 8 },
  );
  await expect(page.locator(".tls-tactical-drag-preview")).toBeVisible();
  await page.mouse.up();
  await expect(page.locator(".tls-tactical-drag-preview")).toHaveCount(0);
}

/** Drags one available substitute onto a lineup slot in the shared tactical workspace. */
async function dragBenchSlotToTacticalSlot(page: Page, benchSlotId: string, slotId: string): Promise<void> {
  await page.locator(".tls-tactical-workspace-grid").scrollIntoViewIfNeeded();
  const startBox = await page.locator(`[data-bench-slot-id="${benchSlotId}"]`).boundingBox();
  if (startBox === null) throw new Error(`Missing tactical bench slot ${benchSlotId}.`);
  const target = await tacticalSlotCenter(page, slotId);

  await page.mouse.move(startBox.x + startBox.width / 2, startBox.y + startBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(target.x, target.y, { steps: 8 });
  await expect(page.locator(".tls-tactical-drag-preview")).toBeVisible();
  await page.mouse.up();
  await expect(page.locator(".tls-tactical-drag-preview")).toHaveCount(0);
}

/** Verifies a role-adaptation panel remains readable, in bounds, and close to its normalized anchor. */
async function assertTacticalPopoverPlacement(page: Page, anchorNx: number, anchorNy: number): Promise<void> {
  const fieldBox = await page.locator(".tls-tactical-board-field").boundingBox();
  const popoverBox = await page.locator(".tls-tactical-board-menu-popover").boundingBox();
  if (fieldBox === null || popoverBox === null) throw new Error("Missing tactical popover geometry.");

  expect(popoverBox.width).toBeGreaterThan(240);
  expect(popoverBox.x).toBeGreaterThanOrEqual(fieldBox.x - 1);
  expect(popoverBox.y).toBeGreaterThanOrEqual(fieldBox.y - 1);
  expect(popoverBox.x + popoverBox.width).toBeLessThanOrEqual(fieldBox.x + fieldBox.width + 1);
  expect(popoverBox.y + popoverBox.height).toBeLessThanOrEqual(fieldBox.y + fieldBox.height + 1);

  const anchorX = fieldBox.x + fieldBox.width * anchorNx;
  const anchorY = fieldBox.y + fieldBox.height * anchorNy;
  const horizontalDistance = distanceFromRange(anchorX, popoverBox.x, popoverBox.x + popoverBox.width);
  const verticalDistance = distanceFromRange(anchorY, popoverBox.y, popoverBox.y + popoverBox.height);
  expect(Math.hypot(horizontalDistance, verticalDistance)).toBeLessThanOrEqual(48);
}

function distanceFromRange(value: number, minimum: number, maximum: number): number {
  if (value < minimum) return minimum - value;
  if (value > maximum) return value - maximum;
  return 0;
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

/**
 * Follows the real Continue contract when post-match consequences precede the
 * next matchday message. Opening important facts acknowledges them, then the
 * shell command advances to the next canonical attention boundary.
 */
async function acknowledgeDueAttentionUntilMatchday(page: Page): Promise<void> {
  const prepareMatch = page.getByRole("button", { name: "Prepare match", exact: true });

  for (let handled = 0; handled < 8; handled += 1) {
    if (await prepareMatch.isVisible()) return;

    const continueCareer = page.getByRole("button", { name: "Continue", exact: true });
    await expect(continueCareer).toBeEnabled();
    await continueCareer.click();
    await expect(page.getByRole("heading", { level: 1, name: "Inbox", exact: true })).toBeVisible();
  }

  throw new Error("Expected Continue to reach the next matchday decision");
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

/** Runs the canonical minute loop at 4x until the next checkpoint or event. */
async function advanceClockUntilPlaybackStage(
  page: Page,
  stage: "event" | "closing",
  clock: "controlled" | "real" = "controlled",
): Promise<void> {
  const activePhase = await page.locator("[data-motion-checkpoint]").getAttribute("data-motion-checkpoint");
  if (stage === "closing" && (activePhase === "half_time" || activePhase === "full_time")) return;
  const targetPhase = activePhase === "first_half" ? "half_time" : "full_time";
  const initialCommentaryKey = await page.locator(".tls-match-broadcast-live-line")
    .getAttribute("data-motion-commentary-key");

  const openingDecisionAction = page.locator(
    ".tls-matchday-primary-action[data-action-id='resolve_incident'], "
    + ".tls-matchday-primary-action[data-action-id='resume_match']",
  );
  if (await openingDecisionAction.count() > 0 && await openingDecisionAction.first().isVisible()) {
    await openingDecisionAction.first().click();
  }
  const openingPlaybackResume = page.locator(".tls-matchday-playback-controls")
    .getByRole("button", { name: "Resume", exact: true });
  if (await openingPlaybackResume.count() > 0 && await openingPlaybackResume.isVisible()) {
    await openingPlaybackResume.click();
  }

  const speedFour = page.getByRole("button", { name: "Playback speed 4x", exact: true });
  await expect(speedFour).toBeVisible();
  if (await speedFour.getAttribute("aria-pressed") !== "true") {
    await speedFour.click();
  }
  await expect(speedFour).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".tls-matchday-playback-controls"))
    .toHaveAttribute("data-speed", "4x");

  const deadline = Date.now() + 30_000;
  const checkpoint = page.locator("[data-motion-checkpoint]");
  const commentary = page.locator(".tls-match-broadcast-live-line");
  for (let tick = 0; tick < 400 && Date.now() <= deadline; tick += 1) {
    const decisionAction = page.locator(
      ".tls-matchday-primary-action[data-action-id='resolve_incident'], "
      + ".tls-matchday-primary-action[data-action-id='resume_match']",
    );
    if (await decisionAction.count() > 0 && await decisionAction.first().isVisible()) {
      await decisionAction.first().click();
    }
    const playbackResume = page.locator(".tls-matchday-playback-controls")
      .getByRole("button", { name: "Resume", exact: true });
    if (await playbackResume.count() > 0 && await playbackResume.isVisible()) {
      await playbackResume.click();
    }
    const phase = await checkpoint.evaluateAll((elements) => (
      elements[0]?.getAttribute("data-motion-checkpoint") ?? null
    ));
    if (stage === "closing" && phase === targetPhase) return;
    if (stage === "event" && await commentary.count() > 0) {
      const commentaryEventId = await commentary.getAttribute("data-event-id");
      const commentaryKey = await commentary.getAttribute("data-motion-commentary-key");
      if (commentaryEventId !== null && commentaryKey !== initialCommentaryKey) return;
    }
    if (clock === "controlled") await page.clock.runFor(250);
    // Yield long enough for React to publish the completed minute and arm the next one.
    await page.waitForTimeout(50);
  }
  const diagnostic = await page.evaluate(async () => {
    const modulePath = "/src/stores/career-ui-store.ts";
    const { useCareerUiStore } = await import(/* @vite-ignore */ modulePath);
    const state = useCareerUiStore.getState();
    return {
      command: state.commandActivity,
      phase: state.matchdayState?.liveProgress?.snapshot.phase,
      minute: state.matchdayState?.liveProgress?.snapshot.currentMinute,
      runState: state.matchdayState?.liveProgress?.snapshot.runState,
      pendingDecision: state.matchdayState?.liveProgress?.pendingDecision,
      screen: state.screen,
      storageFailure: state.storageFailure,
      controls: document.querySelectorAll(".tls-matchday-playback-controls").length,
      checkpoints: document.querySelectorAll("[data-motion-checkpoint]").length,
      primaryAction: document.querySelector<HTMLElement>(".tls-matchday-primary-action")?.dataset.actionId,
      bodyText: document.body.innerText.slice(0, 500),
      speed: document.querySelector<HTMLElement>(".tls-matchday-playback-controls")?.dataset.speed,
    };
  });
  throw new Error(`Progressive Matchday did not reach ${stage}: ${JSON.stringify(diagnostic)}`);
}

/** Reads the current memory-only live phase through the public UI store. */
async function liveMatchPhase(page: Page): Promise<Readonly<{ phase?: string }>> {
  return page.evaluate(async () => {
    const modulePath = "/src/stores/career-ui-store.ts";
    const { useCareerUiStore } = await import(/* @vite-ignore */ modulePath);
    const phase = useCareerUiStore.getState().matchdayState?.liveProgress?.snapshot.phase;
    return phase === undefined ? {} : { phase };
  });
}

/** Reprojects the in-memory half-time snapshot as an event-light UI fixture. */
async function setHalfTimeEventLight(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const modulePath = "/src/stores/career-ui-store.ts";
    const { useCareerUiStore } = await import(/* @vite-ignore */ modulePath);
    const matchdayState = useCareerUiStore.getState().matchdayState;
    const liveProgress = matchdayState?.liveProgress;
    if (matchdayState === undefined || liveProgress === undefined) {
      throw new Error("Expected an active progressive match");
    }

    useCareerUiStore.setState({
      matchdayState: {
        ...matchdayState,
        liveProgress: {
          ...liveProgress,
          snapshot: {
            ...liveProgress.snapshot,
            events: [],
            score: { home: 0, away: 0 },
          },
        },
      },
    });
  });
}

/** Reads durable-baseline match facts after a real browser refresh. */
async function durableMatchFacts(
  page: Page,
): Promise<Readonly<{ playedFixtures: number }>> {
  return page.evaluate(async () => {
    const modulePath = "/src/stores/career-ui-store.ts";
    const { useCareerUiStore } = await import(/* @vite-ignore */ modulePath);
    const career = useCareerUiStore.getState().activeCareerState;
    if (career === undefined) throw new Error("Expected loaded career");
    const fixtures = career.gameState.fixtures as Record<string, { result?: { played?: boolean } }>;
    return {
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
    await expect(page.locator(".tls-dashboard-priority")).toHaveAttribute("data-motion-key", /^attention:/);
    await expect(page.locator("[data-motion-key]")).toHaveCount(3);
    await expect(page.getByRole("heading", { level: 2, name: "League table", exact: true })).toBeVisible();
    await expect(page.getByText("Available after the first completed match.", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "League results", exact: true })).toBeVisible();
    await expect(page.getByText("Available after the first completed league match.", { exact: true })).toBeVisible();
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
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.getByRole("button", { name: "Start match", exact: true }).click();
    await expect(page.locator("[data-motion-checkpoint]"))
      .toHaveAttribute("data-motion-checkpoint", "first_half");
    await advanceClockUntilPlaybackStage(page, "closing", "real");
    await expect(page.getByRole("button", { name: "Start second half", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Start second half", exact: true }).click();
    await expect(page.locator("[data-motion-checkpoint]"))
      .toHaveAttribute("data-motion-checkpoint", "second_half");
    await advanceClockUntilPlaybackStage(page, "closing", "real");
    await expect(page.getByRole("button", { name: "Continue", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Dashboard", exact: true }))
      .toBeVisible();
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

/** Keeps the keyboard-only skip command off canvas until the user requests it. */
async function assertSkipLinkRestingOffCanvas(page: Page, checkpoint: string): Promise<void> {
  const skipLink = page.getByRole("link", { name: "Skip to current task", exact: true });
  await expect(skipLink).not.toBeFocused();
  const box = await skipLink.boundingBox();
  expect(box, `${checkpoint} skip link has no layout box`).not.toBeNull();
  if (box === null) return;
  expect(
    box.y + box.height,
    `${checkpoint} leaves the resting skip link visible`,
  ).toBeLessThanOrEqual(1);
}

/** Proves every phase tab reflows inside its list without clipping its label. */
async function assertMatchdayTabsContained(
  page: Page,
  tabList: Locator,
  checkpoint: string,
): Promise<void> {
  const layout = await tabList.evaluate((element) => {
    const listBounds = element.getBoundingClientRect();
    const tabs = Array.from(element.querySelectorAll<HTMLElement>("[role='tab']")).map((tab) => {
      const bounds = tab.getBoundingClientRect();
      return {
        bottom: bounds.bottom,
        clientHeight: tab.clientHeight,
        clientWidth: tab.clientWidth,
        label: tab.textContent?.trim() ?? "",
        left: bounds.left,
        right: bounds.right,
        scrollHeight: tab.scrollHeight,
        scrollWidth: tab.scrollWidth,
        top: bounds.top,
      };
    });
    return {
      clientWidth: element.clientWidth,
      listBounds: {
        bottom: listBounds.bottom,
        left: listBounds.left,
        right: listBounds.right,
        top: listBounds.top,
      },
      scrollWidth: element.scrollWidth,
      tabs,
    };
  });

  expect(layout.scrollWidth, `${checkpoint} tab list overflows horizontally`)
    .toBeLessThanOrEqual(layout.clientWidth + 1);
  const clipped = layout.tabs.filter((tab) => (
    tab.left < layout.listBounds.left - 1
    || tab.right > layout.listBounds.right + 1
    || tab.top < layout.listBounds.top - 1
    || tab.bottom > layout.listBounds.bottom + 1
    || tab.scrollWidth > tab.clientWidth + 1
    || tab.scrollHeight > tab.clientHeight + 1
  ));
  expect(clipped, `${checkpoint} contains clipped tabs`).toEqual([]);
}

/** Guards Matchday playback and primary commands against undersized targets. */
async function assertMatchdayInteractiveTargets(page: Page, checkpoint: string): Promise<void> {
  const undersized = await page.locator(
    ".tls-matchday-playback-controls button, .tls-matchday-primary-action",
  ).evaluateAll((elements) => elements
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

  expect(undersized, `${checkpoint} contains targets smaller than 24px`).toEqual([]);
}

/** Rejects visually truncated event facts in the narrow, reflowed tabellino. */
async function assertTabellinoFactsNotClipped(page: Page, checkpoint: string): Promise<void> {
  const clipped = await page.locator(
    ".tls-match-tabellino-incident-copy strong, .tls-match-tabellino-incident-copy small",
  ).evaluateAll((elements) => elements
    .filter((element) => getComputedStyle(element).display !== "none")
    .map((element) => ({
      clientHeight: element.clientHeight,
      clientWidth: element.clientWidth,
      copy: element.textContent?.trim() ?? "",
      scrollHeight: element.scrollHeight,
      scrollWidth: element.scrollWidth,
    }))
    .filter((element) => (
      element.scrollWidth > element.clientWidth + 1
      || element.scrollHeight > element.clientHeight + 1
    )));

  expect(clipped, `${checkpoint} clips tabellino facts`).toEqual([]);
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
  const tabs = review.getByRole("tablist", { name: "Full-time review views", exact: true });
  const activePanel = review.getByRole("tabpanel");

  await expect(review).toBeVisible();
  await expect(tabs).toBeVisible();
  await expect(tabs.getByRole("tab")).toHaveCount(3);
  await expect(tabs.getByRole("tab", { name: "Summary", exact: true })).toBeEnabled();
  await expect(tabs.getByRole("tab", { name: "Your team", exact: true })).toBeEnabled();
  await expect(tabs.getByRole("tab", { name: "Opponent", exact: true })).toBeEnabled();
  await expect(activePanel).toBeVisible();
  await expect(review.getByRole("tabpanel")).toHaveCount(1);
  await expect(review.locator(".tls-matchday-table")).toHaveCount(0);
  await expect(page.locator(".tls-app-shell-right-rail")).toBeHidden();
  await expect(page.getByRole("button", { name: "Continue", exact: true })).toHaveCount(1);

  const copy = (await review.textContent())?.toLowerCase() ?? "";
  expect(copy, `${checkpoint} exposes a technical fallback`).not.toMatch(/\b(?:fixture:|unknown)\b|next action/);

  const reviewBox = await review.boundingBox();
  expect(reviewBox, `${checkpoint} review has no layout box`).not.toBeNull();

  const tabellino = page.locator(".tls-match-tabellino");
  if (await tabellino.count() > 0) {
    const tabellinoBox = await tabellino.boundingBox();
    expect(tabellinoBox, `${checkpoint} tabellino has no layout box`).not.toBeNull();
    expect(reviewBox!.y, `${checkpoint} review must follow the tabellino`).toBeGreaterThan(tabellinoBox!.y);
  }
}

/** Opens one final-review tab and validates its single focused panel. */
async function selectFullTimeReviewTab(
  page: Page,
  tabName: "Summary" | "Your team" | "Opponent",
): Promise<void> {
  const review = page.locator(".tls-match-centre-full-time");
  const tab = review.getByRole("tab", { name: tabName, exact: true });
  await tab.click();
  await expect(tab).toHaveAttribute("aria-selected", "true");

  if (tabName !== "Summary") {
    const ratings = review.locator(".tls-match-team-ratings");
    await expect(ratings).toBeVisible();
    expect(await ratings.locator(".tls-match-centre-rating-row").count()).toBeGreaterThan(0);
    return;
  }

  await expect(review.locator(".tls-match-statistics")).toBeVisible();
}

/** Guards the single bounded match record shared by live and review states. */
async function assertCompactTabellino(
  page: Page,
  checkpoint: string,
  expected: boolean,
): Promise<void> {
  const tabellino = page.locator(".tls-match-tabellino");
  await expect(tabellino).toHaveCount(expected ? 1 : 0);
  if (!expected) return;

  await expect(tabellino).toBeVisible();
  expect(await tabellino.locator(".tls-match-tabellino-incident").count()).toBeGreaterThan(0);
  const overflow = await tabellino.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  expect(
    overflow.scrollWidth,
    `${checkpoint} tabellino has horizontal overflow`,
  ).toBeLessThanOrEqual(overflow.clientWidth + 1);
}

/** Ensures the active football task begins within the first narrow viewport. */
async function assertTaskInFirstViewport(page: Page, checkpoint: string): Promise<void> {
  const top = await page.locator("#tls-career-main").evaluate((element) => element.getBoundingClientRect().top);
  expect(top, `${checkpoint} begins below the first useful viewport`).toBeLessThan(844);
}

/** Proves pre-match owns the shell outlet without repeating fixture metadata. */
async function assertFullWidthPreMatch(page: Page, checkpoint: string): Promise<void> {
  const main = page.locator("#tls-career-main");
  await expect(main).toHaveAttribute("data-content-layout", "full-width");
  await expect(page.locator(".tls-match-centre-pre-match")).toHaveCount(0);
  await expect(page.getByText("Ready to play", { exact: true })).toHaveCount(0);

  const geometry = await page.locator(".tls-app-shell").evaluate((shell) => {
    const mainElement = shell.querySelector<HTMLElement>("#tls-career-main");
    if (mainElement === null) throw new Error("Expected Matchday main outlet");
    const shellBox = shell.getBoundingClientRect();
    const mainBox = mainElement.getBoundingClientRect();
    const shellStyle = getComputedStyle(shell);
    return {
      actualRight: mainBox.right,
      expectedRight: shellBox.right - Number.parseFloat(shellStyle.paddingRight),
      mainWidth: mainBox.width,
    };
  });

  expect(geometry.mainWidth, `${checkpoint} main outlet collapsed`).toBeGreaterThan(0);
  expect(
    Math.abs(geometry.actualRight - geometry.expectedRight),
    `${checkpoint} leaves an unexplained column after Matchday`,
  ).toBeLessThanOrEqual(1);
}

/** Captures one deterministic phase screenshot outside the repository. */
async function capture(page: Page, name: string): Promise<void> {
  await page.screenshot({ fullPage: true, path: resolve(QA_OUTPUT_DIR, `${name}.png`) });
}

/** Captures fixed dialogs as the user sees them instead of compositing underlying page scroll. */
async function captureViewport(page: Page, name: string): Promise<void> {
  await page.screenshot({ fullPage: false, path: resolve(QA_OUTPUT_DIR, `${name}.png`) });
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
