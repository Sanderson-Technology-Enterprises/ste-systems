import { test, expect } from "@playwright/test";

test("motion Lab plays real frames, preserves controls, and honors reduced motion", async ({
  page,
}) => {
  await page.goto("./lab/#motion");
  const lab = page.locator("#motion");
  await expect(
    lab.getByRole("heading", {
      name: "Motion with a clear beginning and end.",
    }),
  ).toBeVisible();
  await expect(lab.getByLabel("Motion preset").locator("option")).toHaveCount(
    10,
  );
  await lab.getByLabel("Motion preset").selectOption("slide");
  await lab.getByLabel("Motion direction").selectOption("right");
  await lab.getByRole("button", { name: "Play entrance", exact: true }).click();
  const shell = lab.locator("[data-motion-preview]");
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
  await lab.getByRole("button", { name: "Play exit", exact: true }).click();
  await expect(shell).toHaveAttribute("data-ms-exited", "true");
  await expect(
    lab.getByRole("button", { name: "Play entrance", exact: true }),
  ).toBeFocused();
  await lab.getByRole("button", { name: "Reset preview", exact: true }).click();
  await expect(shell).not.toHaveAttribute("data-ms-exited", "true");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await lab.getByRole("button", { name: "Play entrance", exact: true }).click();
  await expect(lab.getByRole("status")).toContainText("skipped");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  );
  expect(overflow).toBe(false);
});

test("motion surfaces retain three distinct depths and all presets remain playable", async ({
  page,
}) => {
  await page.goto("./lab/#motion");
  const lab = page.locator("#motion");
  const shadows = await lab
    .locator("[data-motion-item] .interactive-surface")
    .evaluateAll((elements) =>
      elements.map((element) => getComputedStyle(element).boxShadow),
    );
  expect(shadows).toHaveLength(3);
  expect(new Set(shadows).size).toBe(3);
  for (const preset of [
    "form",
    "slide",
    "swirl",
    "slam",
    "origami",
    "portal",
    "curtain",
    "elastic",
    "cascade",
    "flip",
  ]) {
    await lab.getByLabel("Motion preset").selectOption(preset);
    await lab
      .getByRole("button", { name: "Play entrance", exact: true })
      .click();
    await expect(lab.locator("[data-motion-preview]")).toHaveAttribute(
      "data-ms-preset",
      preset,
    );
    expect(
      await lab
        .locator("[data-motion-preview]")
        .evaluate((element) => element.getAnimations().length),
    ).toBeGreaterThan(0);
    await expect(lab.getByRole("status")).toContainText("finished");
  }
  await lab.getByRole("button", { name: "Play stagger", exact: true }).click();
  await expect(lab.locator("[data-motion-item]").last()).toHaveAttribute(
    "data-ms-phase",
    "in",
  );
  await lab.getByRole("button", { name: "Cancel motion", exact: true }).click();
  await expect(lab.getByRole("status")).toContainText("cancelled");
  await page.goto("./components/#atlas-motion");
  await expect(
    page.getByRole("tab", { name: "Motion Style CSS", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page
    .getByRole("button", { name: "Play entrance", exact: true })
    .click();
  await expect(
    page.locator("#motion-guide-preview").getByRole("status"),
  ).toContainText("finished");
  await page
    .locator("#motion-guide-preview")
    .screenshot({ path: "output/motion-guide-desktop.png" });
});

test("embedded motion guide keeps a clear heading hierarchy and compact specimen", async ({
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
  await expect(preview.getByRole("heading", { level: 4 })).toHaveCount(3);
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
