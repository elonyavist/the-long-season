/// <reference types="node" />

import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";
import type { Browser, Page } from "playwright";

const CURRENT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(CURRENT_DIR, "../../../..");
const QA_OUTPUT_DIR = "/tmp/the-long-season-phase54";
const PORT = 5178;
const URL = `http://127.0.0.1:${PORT}/`;

/**
 * Runs Phase 54 browser QA for the completed tactical workspace.
 *
 * The script exercises the manager journey end-to-end: open the career, route
 * to preparation from dashboard and Inbox/Posta, change formation, manually
 * pick XI and substitutes, choose a tactic, save, return to dashboard, and
 * Continue to the next attention stop. Screenshots are written outside the
 * repository for visual inspection.
 */
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
      await inspectDashboardPath(browser);
      await inspectInboxPath(browser);
    } finally {
      await browser.close();
    }
  } finally {
    server.kill("SIGTERM");
  }

  console.log(`Phase 54 tactics workspace QA screenshots written to ${QA_OUTPUT_DIR}`);
}

/** Verifies the desktop dashboard-to-preparation-to-Continue path. */
async function inspectDashboardPath(browser: Browser): Promise<void> {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });

  try {
    await page.goto(URL);
    await page.getByRole("button", { name: "New career" }).click();
    await visibleText(page, "missing saved lineup");
    await visibleText(page, "missing saved tactic");
    await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/dashboard-before-preparation-desktop.png` });

    await page.getByRole("button", { name: "Prepare match" }).click();
    await expectWorkspace(page, "desktop");
    await expectPitchSlotNoOverlap(page);
    await expectPitchSlotsInsidePitch(page);
    await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/workspace-formation-4-4-2.png` });

    for (const formationId of ["4-2-3-1", "3-5-2", "3-6-1", "5-3-2", "4-3-3"]) {
      await changeFormation(page, formationId);
      await expectPitchSlotNoOverlap(page);
      await expectPitchSlotsInsidePitch(page);
      await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/workspace-formation-${formationId}.png` });
    }
    await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/workspace-formation-desktop.png` });

    await completePreparation(page);
    await expectKeyboardPath(page);
    await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/workspace-ready-desktop.png` });

    await page.getByRole("button", { name: "Save preparation" }).click();
    await visibleText(page, "Preparation saved");
    await page.locator(".tls-preparation-dashboard").click();
    await visibleText(page, "Preparation complete");
    await page.getByRole("button", { name: "Continue" }).click();
    await visibleText(page, "Matchday reached");
    await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/dashboard-matchday-desktop.png` });
  } finally {
    await page.close();
  }
}

/** Verifies the narrow Inbox/Posta-to-preparation path and stacked layout. */
async function inspectInboxPath(browser: Browser): Promise<void> {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  try {
    await page.goto(URL);
    await page.getByRole("button", { name: "New career" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await visibleText(page, "Match preparation required");
    await page
      .getByRole("complementary", { name: "Inbox" })
      .getByRole("button", { name: "Prepare match" })
      .click();
    await expectWorkspace(page, "narrow");
    await changeFormation(page, "3-5-2");
    await page.screenshot({ fullPage: true, path: `${QA_OUTPUT_DIR}/workspace-narrow.png` });
  } finally {
    await page.close();
  }
}

/** Confirms workspace controls, layout, table behavior, and overflow. */
async function expectWorkspace(page: Page, viewportName: string): Promise<void> {
  await visibleText(page, "Preparation incomplete");
  await page.locator(".tls-preparation-formation-select select").waitFor({ state: "visible", timeout: 5_000 });
  await page.locator(".tls-preparation-pitch").waitFor({ state: "visible", timeout: 5_000 });
  await expectSvgPitchBackground(page);
  await page.locator(".tls-preparation-bench").waitFor({ state: "visible", timeout: 5_000 });
  await page.locator(".tls-preparation-squad-table").waitFor({ state: "visible", timeout: 5_000 });
  await page.locator(".tls-preparation-tactic").waitFor({ state: "visible", timeout: 5_000 });
  await expectNoHorizontalOverflow(page, viewportName);

  const lineupSelectCount = await page.locator(".tls-preparation-slot select").count();
  const benchSelectCount = await page.locator(".tls-preparation-bench-slot select").count();

  if (lineupSelectCount !== 11) {
    throw new Error(`Expected 11 lineup selects, got ${lineupSelectCount}.`);
  }

  if (benchSelectCount !== 8) {
    throw new Error(`Expected 8 bench selects, got ${benchSelectCount}.`);
  }

  const tableGeometry = await page.locator(".tls-preparation-squad-table-wrap").evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
    overflowY: getComputedStyle(element).overflowY,
  }));

  if (tableGeometry.overflowY !== "auto" || tableGeometry.clientHeight >= tableGeometry.scrollHeight) {
    throw new Error(`Expected fixed-height scrollable squad table, got ${JSON.stringify(tableGeometry)}.`);
  }
}

/** Confirms the tactical board uses the imported SVG field instead of duplicate CSS markings. */
async function expectSvgPitchBackground(page: Page): Promise<void> {
  const pitchBackground = await page.locator(".tls-preparation-pitch").evaluate((element) => {
    const styles = getComputedStyle(element);

    return {
      pitchAsset: element.getAttribute("data-pitch-asset"),
      backgroundImage: styles.backgroundImage,
      pitchCustomProperty: styles.getPropertyValue("--tls-pitch-background-image"),
      markingCount: document.querySelectorAll(".tls-preparation-pitch-markings").length,
    };
  });

  if (pitchBackground.pitchAsset !== "campo-calcio.svg") {
    throw new Error(`Expected SVG pitch background, got ${JSON.stringify(pitchBackground)}.`);
  }

  if (pitchBackground.backgroundImage === "none") {
    throw new Error(`Expected rendered pitch background image, got ${JSON.stringify(pitchBackground)}.`);
  }

  if (pitchBackground.markingCount !== 0) {
    throw new Error(`Expected no CSS pitch markings, got ${JSON.stringify(pitchBackground)}.`);
  }
}

/** Changes formation and confirms the pitch slot set reacts. */
async function changeFormation(page: Page, formationId: string): Promise<void> {
  const formationSelect = page.locator(".tls-preparation-formation-select select");

  await formationSelect.selectOption(formationId);

  const selectedFormationId = await formationSelect.evaluate((element) => (element as HTMLSelectElement).value);

  if (selectedFormationId !== formationId) {
    throw new Error(`Expected formation ${formationId}, got ${selectedFormationId}.`);
  }
}

/** Selects a complete manual XI, bench, and tactic without auto-fill. */
async function completePreparation(page: Page): Promise<void> {
  const lineupSelects = page.locator(".tls-preparation-slot select");
  const benchSelects = page.locator(".tls-preparation-bench-slot select");

  for (let index = 0; index < 11; index += 1) {
    await lineupSelects.nth(index).selectOption(`player:demo-${String(index + 1).padStart(2, "0")}`);
  }

  for (let index = 0; index < 8; index += 1) {
    await benchSelects.nth(index).selectOption(`player:demo-${String(index + 12).padStart(2, "0")}`);
  }

  await page.getByLabel("Balanced").check();
  await visibleText(page, "Ready to save");
}

/** Confirms important controls are reachable through keyboard tab order. */
async function expectKeyboardPath(page: Page): Promise<void> {
  await page.locator(".tls-preparation-dashboard").focus();
  const seen = {
    formation: false,
    auto: false,
    fillGaps: false,
    clear: false,
    lineup: false,
    bench: false,
    tactic: false,
    save: false,
  };

  for (let index = 0; index < 90; index += 1) {
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => {
      const activeElement = document.activeElement;

      return {
        formation: activeElement?.matches(".tls-preparation-formation-select select") ?? false,
        auto: activeElement?.textContent?.trim() === "Auto",
        fillGaps: activeElement?.textContent?.trim() === "Fill gaps",
        clear: activeElement?.textContent?.trim() === "Clear",
        lineup: activeElement?.matches(".tls-preparation-slot select") ?? false,
        bench: activeElement?.matches(".tls-preparation-bench-slot select") ?? false,
        tactic: activeElement?.matches("input[name='match-preparation-tactic']") ?? false,
        save: activeElement?.matches(".tls-preparation-save button") ?? false,
      };
    });

    seen.formation ||= focused.formation;
    seen.auto ||= focused.auto;
    seen.fillGaps ||= focused.fillGaps;
    seen.clear ||= focused.clear;
    seen.lineup ||= focused.lineup;
    seen.bench ||= focused.bench;
    seen.tactic ||= focused.tactic;
    seen.save ||= focused.save;
  }

  if (!seen.formation || !seen.auto || !seen.fillGaps || !seen.clear || !seen.lineup || !seen.bench || !seen.tactic || !seen.save) {
    throw new Error(`Keyboard path missed required controls: ${JSON.stringify(seen)}.`);
  }
}

/** Checks visible desktop pitch slot rectangles do not overlap each other. */
async function expectPitchSlotNoOverlap(page: Page): Promise<void> {
  const rectangles = await page.locator(".tls-preparation-slot").evaluateAll((elements) =>
    elements.map((element) => {
      const rect = element.getBoundingClientRect();

      return {
        slot: element.getAttribute("data-slot") ?? "",
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
      };
    }),
  );

  for (let leftIndex = 0; leftIndex < rectangles.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < rectangles.length; rightIndex += 1) {
      const left = rectangles[leftIndex];
      const right = rectangles[rightIndex];

      if (left === undefined || right === undefined) {
        throw new Error("Unexpected missing pitch slot rectangle during overlap QA.");
      }

      const overlaps =
        left.left < right.right - 1 &&
        left.right > right.left + 1 &&
        left.top < right.bottom - 1 &&
        left.bottom > right.top + 1;

      if (overlaps) {
        throw new Error(`Pitch slots overlap: ${left.slot} and ${right.slot}.`);
      }
    }
  }
}

/** Checks every visible slot stays inside the tactical pitch border. */
async function expectPitchSlotsInsidePitch(page: Page): Promise<void> {
  const geometry = await page.evaluate(() => {
    const pitch = document.querySelector(".tls-preparation-pitch");
    const slots = [...document.querySelectorAll(".tls-preparation-slot")];

    if (pitch === null) {
      return null;
    }

    const pitchRect = pitch.getBoundingClientRect();

    return {
      pitch: {
        left: pitchRect.left,
        right: pitchRect.right,
        top: pitchRect.top,
        bottom: pitchRect.bottom,
      },
      slots: slots.map((slot) => {
        const rect = slot.getBoundingClientRect();

        return {
          slot: slot.getAttribute("data-slot") ?? "",
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
        };
      }),
    };
  });

  if (geometry === null) {
    throw new Error("Missing tactical pitch during inside-pitch QA.");
  }

  for (const slot of geometry.slots) {
    const outside =
      slot.left < geometry.pitch.left - 1 ||
      slot.right > geometry.pitch.right + 1 ||
      slot.top < geometry.pitch.top - 1 ||
      slot.bottom > geometry.pitch.bottom + 1;

    if (outside) {
      throw new Error(`Pitch slot outside board: ${JSON.stringify({ slot, pitch: geometry.pitch })}.`);
    }
  }
}

/** Guards against viewport-breaking horizontal overflow. */
async function expectNoHorizontalOverflow(page: Page, viewportName: string): Promise<void> {
  const geometry = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));

  if (geometry.scrollWidth > geometry.viewportWidth + 1) {
    throw new Error(`${viewportName} viewport has horizontal overflow: ${JSON.stringify(geometry)}.`);
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
