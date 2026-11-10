import { test, expect } from "@playwright/test";

test("motion Lab plays real frames, preserves controls, and honors reduced motion", async ({
  page,
}) => {
  await page.goto("./lab/#motion");
  await expect(page.getByRole("button", { name: "Effects" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByText(/Advanced animation/).click();
  await expect(
    page.getByLabel("Entrance effect").locator("option"),
  ).toHaveCount(17);
  await page.getByLabel("Entrance effect").selectOption("slide");
  await page.getByLabel("Direction").selectOption("right");
  await page.getByLabel("Duration (ms)").fill("1200");
  await page.getByRole("button", { name: "in", exact: true }).click();
  const shell = page
    .frameLocator("iframe.studio-preview-frame")
    .locator("[data-preview-motion]");
  await expect(shell).toHaveAttribute("data-ms-phase", "in");
  const frames = await shell.evaluate(async (element) => {
    const samples: string[] = [];
    for (let i = 0; i < 4; i++) {
      await new Promise(requestAnimationFrame);
      samples.push(getComputedStyle(element).transform);
    }
    return samples;
  });
  expect(new Set(frames).size).toBeGreaterThan(1);
  await page.getByRole("button", { name: "out", exact: true }).click();
  await expect(shell).toHaveAttribute("data-ms-exited", "true");
  await expect(
    page.getByRole("button", { name: "Fullscreen preview" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "restore", exact: true }).click();
  await expect(shell).not.toHaveAttribute("data-ms-exited", "true");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "in", exact: true }).click();
  await expect(page.locator(".studio-notice")).toContainText("skipped");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  );
  expect(overflow).toBe(false);
});

test("motion surfaces retain three distinct depths and all presets remain playable", async ({
  page,
}) => {
  await page.goto("./lab/#motion");
  await page.getByText(/Advanced animation/).click();
  const frame = page.frameLocator("iframe.studio-preview-frame");
  const shadows = await frame
    .locator("[data-motion-item] .usk-card")
    .evaluateAll((elements) =>
      elements.map((element) => getComputedStyle(element).boxShadow),
    );
  expect(shadows.length).toBeGreaterThanOrEqual(3);
  expect(new Set(shadows).size).toBe(3);
  await page.getByLabel("Duration (ms)").fill("120");
  const presets = await page
    .getByLabel("Entrance effect")
    .locator("option")
    .evaluateAll((options) =>
      options.map((option) => (option as HTMLOptionElement).value),
    );
  expect(presets).toHaveLength(17);
  for (const preset of presets) {
    await page.getByLabel("Entrance effect").selectOption(preset);
    await page.getByRole("button", { name: "in", exact: true }).click();
    await expect(frame.locator("[data-preview-motion]")).toHaveAttribute(
      "data-ms-preset",
      preset,
    );
    await expect(page.locator(".studio-notice")).toContainText("finished");
  }
  await page.getByRole("button", { name: "stagger", exact: true }).click();
  await expect(page.locator(".studio-notice")).toContainText("finished");
  await page.getByRole("button", { name: "cancel", exact: true }).click();
  await expect(page.locator(".studio-notice")).toContainText("cancelled");
  await page.goto("./components/#atlas-motion");
  await expect(
    page.getByRole("tab", { name: "Motion Style CSS", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page
    .getByRole("button", { name: "Play entrance", exact: true })
    .click();
  await expect(
    page.locator("#motion-guide-preview [data-motion-status]"),
  ).toContainText("finished");
  await page
    .locator("#motion-guide-preview")
    .screenshot({ path: "output/motion-guide-desktop.png" });
});

test("embedded motion guide keeps a clear heading hierarchy and complete specimen", async ({
  page,
}) => {
  await page.goto("./components/#atlas-motion");
  const preview = page.locator("#motion-guide-preview");
  await expect(
    preview.getByRole("heading", {
      level: 3,
      name: "Motion with a clear beginning and end.",
    }),
  ).toBeVisible();
  await expect(preview.getByRole("heading", { level: 4 })).toHaveCount(6);
  await preview.screenshot({ path: "output/motion-guide-compact.png" });
});

test("full four-library fixture is rendered and runs its local motion controller", async ({
  page,
}) => {
  await page.goto("./lab/#integrate");
  const frameElement = page.locator('[data-integration-fixture="all-motion"]');
  await expect(frameElement).toHaveCount(1);
  await frameElement.scrollIntoViewIfNeeded();
  const frame = page.frameLocator('[data-integration-fixture="all-motion"]');
  await frame
    .getByRole("button", { name: "Replay motion", exact: true })
    .click();
  await expect(frame.locator("[data-proof-motion]")).toHaveAttribute(
    "data-ms-phase",
    "in",
  );
  expect(
    await frame
      .locator("[data-proof-motion]")
      .evaluate((element) => element.getAnimations().length),
  ).toBeGreaterThan(0);
  await expect(
    page.locator('[data-integration-fixture="all-canonical"]'),
  ).toHaveCount(1);
});
