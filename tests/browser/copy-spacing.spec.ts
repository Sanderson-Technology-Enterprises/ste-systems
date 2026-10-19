import { expect, test } from "@playwright/test";

/** Reserves room for the full company name and every navigation label at the menu boundary. */
test("navigation switches before its labels lose their padding", async ({
  page,
}) => {
  await page.goto("./");
  const toggle = page.getByRole("button", { name: "Open menu", exact: true });
  for (const width of [1025, 1248, 1344, 1345, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    if (width <= 1344) await expect(toggle).toBeVisible();
    else {
      await expect(toggle).toBeHidden();
      const overflowing = await page
        .locator(".navigation-link")
        .evaluateAll((links) =>
          links
            .filter((link) => link.scrollWidth > link.clientWidth + 1)
            .map((link) => link.textContent),
        );
      expect(overflowing, `navigation at ${width}px`).toEqual([]);
      const brand = await page.locator(".brand").evaluate((element) => {
        const logo = element
          .querySelector(".brand-logo")!
          .getBoundingClientRect();
        const copy = element
          .querySelector(".brand-copy")!
          .getBoundingClientRect();
        return { logoRight: logo.right, copyLeft: copy.left };
      });
      expect(
        brand.logoRight,
        "logo stays beside the company name",
      ).toBeLessThanOrEqual(brand.copyLeft);
    }
  }
});

/** Checks document gutters and bordered editorial panels without constraining demo geometry. */
test("site copy has readable gutters and panel padding", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of ["./", "./components/", "./lab/", "./health/"]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    for (const width of [320, 390, 768, 960, 961, 1024, 1025, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      const measurements = await page.evaluate(() => {
        const panels = [
          ...document.querySelectorAll<HTMLElement>(
            ".conversion-path, .guide-example, .integration-card, .adoption-path",
          ),
        ].filter((element) => element.checkVisibility());
        const headings = [
          ...document.querySelectorAll<HTMLElement>(
            "main h1, main .section-heading, main .guide-panel-heading",
          ),
        ].filter((element) => element.checkVisibility());
        return {
          overflow: document.documentElement.scrollWidth - innerWidth,
          gutters: headings.map((element) => {
            const rect = element.getBoundingClientRect();
            return Math.min(rect.left, innerWidth - rect.right);
          }),
          panels: panels.map((element) => {
            const style = getComputedStyle(element);
            return {
              name: element.className,
              inset: Math.min(
                parseFloat(style.paddingLeft),
                parseFloat(style.paddingRight),
              ),
            };
          }),
        };
      });
      expect(
        measurements.overflow,
        `${route} at ${width}px`,
      ).toBeLessThanOrEqual(1);
      for (const gutter of measurements.gutters)
        expect(gutter).toBeGreaterThanOrEqual(16);
      for (const panel of measurements.panels) {
        expect(
          panel.inset,
          `${route} ${panel.name} at ${width}px`,
        ).toBeGreaterThanOrEqual(16);
      }
    }
  }
});

/** Keeps the recovery message consistent with the homepage destination. */
test("missing page copy clearly describes its recovery link", async ({
  page,
}) => {
  await page.goto("./missing-copy-review/");
  await expect(
    page.getByRole("heading", { name: "Page not found." }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Return to the homepage to explore the libraries, guides, and interactive Lab.",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Return to STE Systems" }),
  ).toHaveAttribute("href", /\/$/);
});
