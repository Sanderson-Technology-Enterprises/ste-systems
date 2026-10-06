import { expect, test } from "@playwright/test";

test("every rendered specimen node exposes clean consumer markup", async ({
  page,
}) => {
  /** Keeps the copy contract deterministic when Chromium projects run in parallel. */
  await page.addInitScript(() => {
    const clipboardState = window as Window & { __atlasCopiedHtml?: string };
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        readText: async () => clipboardState.__atlasCopiedHtml ?? "",
        writeText: async (value: string) => {
          clipboardState.__atlasCopiedHtml = value;
        },
      },
    });
  });
  await page.goto("./components/");

  const specimen = page.locator("[data-atlas-specimen]").first();
  await specimen.scrollIntoViewIfNeeded();
  const codeControls = specimen.getByRole("button", {
    name: /^View HTML for /,
  });
  await expect(codeControls.first()).toBeVisible();

  /** Marker centers must remain independently clickable when nested nodes cluster. */
  const obstructedMarkers = await codeControls.evaluateAll((markers) =>
    markers.slice(0, 2).flatMap((marker) => {
      const bounds = marker.getBoundingClientRect();
      const topmost = document.elementFromPoint(
        bounds.left + bounds.width / 2,
        bounds.top + bounds.height / 2,
      );
      return topmost === marker || marker.contains(topmost)
        ? []
        : [marker.getAttribute("aria-label")];
    }),
  );
  expect(obstructedMarkers).toEqual([]);

  await expect
    .poll(
      async () =>
        (await codeControls.count()) -
        (await specimen.locator("[data-atlas-node]").count()),
    )
    .toBe(0);
  expect(await codeControls.count()).toBeGreaterThan(0);

  await codeControls.first().click();
  const disclosure = specimen.locator(".atlas-code-disclosure");
  const code = disclosure.locator("pre code");
  await expect(disclosure).toBeVisible();
  await expect(code).not.toContainText("data-atlas-");

  const copyButton = disclosure.locator(".atlas-copy-button");
  const tooltip = disclosure.getByRole("tooltip");
  await expect(tooltip).toHaveCSS("opacity", "0");
  await copyButton.focus();
  await expect(tooltip).toHaveCSS("opacity", "1");
  await copyButton.click();
  await expect(copyButton).toHaveAccessibleName("HTML copied");
  await expect(
    disclosure.getByText("HTML copied to the clipboard."),
  ).toBeAttached();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & { __atlasCopiedHtml?: string })
            .__atlasCopiedHtml ?? "",
      ),
    )
    .toContain("ly-wrapper");
});

test("atlas search, library filters, and preset prefixes update the results", async ({
  page,
}) => {
  await page.goto("./components/");

  await page.getByRole("button", { name: "Interactive Surface CSS" }).click();
  await expect(page.locator("#atlas-interaction")).toBeVisible();
  await expect(page.locator("#atlas-layout, #atlas-ui")).toHaveCount(0);

  await page
    .getByRole("searchbox", { name: "Search components and contracts" })
    .fill("aria-pressed");
  await expect(page.locator("[data-atlas-specimen]")).toHaveCount(1);
  await expect(page.locator("[data-atlas-specimen]")).toContainText(
    "State and preference matrix",
  );

  await page.getByRole("button", { name: "All libraries" }).click();
  await page
    .getByRole("searchbox", { name: "Search components and contracts" })
    .fill("visual classes 1");
  await page.getByLabel("UI preset").selectOption("cyberpunk");
  const visualClasses = page.locator("[data-atlas-specimen]").first();
  await visualClasses.scrollIntoViewIfNeeded();
  await expect(visualClasses.locator(".cyber-alert").first()).toBeVisible();
});

test("atlas stays collision-free on a narrow mobile viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 430, height: 932 });
  await page.goto("./components/");

  const geometry = await page.locator(".component-atlas").evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth);

  const specimen = page.locator("[data-atlas-specimen]").first();
  await specimen.scrollIntoViewIfNeeded();
  const marker = specimen.locator(".atlas-code-marker").first();
  await expect(marker).toBeVisible();
  const markerBox = await marker.boundingBox();
  expect(markerBox?.width).toBeGreaterThanOrEqual(44);
  expect(markerBox?.height).toBeGreaterThanOrEqual(44);
});
