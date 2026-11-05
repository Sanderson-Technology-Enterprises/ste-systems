import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { openWorkbenchGroup, setDockedViewport } from "./workbench-helpers";

test.beforeEach(setDockedViewport);

test("workspace links have comfortable targets and navigate within the preview", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./lab/#workbench");
  await page
    .getByRole("button", { name: "Application workspace", exact: true })
    .click();
  const nav = page.getByRole("navigation", {
    name: "Northstar workspace",
    exact: true,
  });
  for (const link of await nav.getByRole("link").all()) {
    const size = await link.evaluate((e) => ({
      height: e.getBoundingClientRect().height,
      block: parseFloat(getComputedStyle(e).paddingTop),
      inline: parseFloat(getComputedStyle(e).paddingLeft),
    }));
    expect(size.height).toBeGreaterThanOrEqual(44);
    expect(size.block).toBeGreaterThanOrEqual(8);
    expect(size.inline).toBeGreaterThanOrEqual(12);
  }
  const before = await page.evaluate(() => scrollY);
  await nav.getByRole("link", { name: "Activity", exact: true }).click();
  expect(await page.evaluate(() => scrollY)).toBeCloseTo(before, 0);
  const preview = page.getByRole("region", {
    name: "Live preview content",
    exact: true,
  });
  const target = (await page.locator("#workspace-activity").boundingBox())!;
  const host = (await preview.boundingBox())!;
  expect(target.y).toBeGreaterThanOrEqual(host.y);
  expect(target.y).toBeLessThan(host.y + host.height);
  await expect(page.locator("#workspace-activity")).toBeFocused();
  expect(new URL(page.url()).hash).toBe("#workspace-activity");
  await page.goto("./?site-mode=light");
  await expect(page.locator(".home-experience")).toHaveAttribute(
    "data-mode",
    "light",
  );
  const inline = page.locator(".home-observatory > a");
  const padding = await inline.evaluate((e) => ({
    block: parseFloat(getComputedStyle(e).paddingTop),
    inline: parseFloat(getComputedStyle(e).paddingLeft),
    display: getComputedStyle(e).display,
  }));
  expect(padding.block).toBeGreaterThanOrEqual(2);
  expect(padding.inline).toBeGreaterThanOrEqual(3);
  // A direct grid item is blockified by CSS even when its authored display is inline.
  // Check prose flow on the real paragraph link instead of that grid child.
  await expect(page.locator(".hero-service-copy a")).toHaveCSS(
    "display",
    "inline-block",
  );
});

test("workspace anchor text clears borders and retains focus and hover contrast across modes and densities", async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./lab/?theme=native#workbench");
  await page
    .getByRole("button", { name: "Application workspace", exact: true })
    .click();
  const nav = page.getByRole("navigation", {
    name: "Northstar workspace",
    exact: true,
  });
  for (const preset of [
    "minimal-saas",
    "technical-blueprint",
    "editorial-luxe",
    "maximalist",
    "data-terminal",
  ]) {
    await openWorkbenchGroup(page, "Appearance");
    await page.getByLabel("Visual style", { exact: true }).selectOption(preset);
    for (const mode of ["light", "dark", "contrast"]) {
      await page.getByLabel("Display mode", { exact: true }).selectOption(mode);
      await openWorkbenchGroup(page, "Layout");
      for (const density of ["compact", "normal", "spacious"]) {
        await page
          .getByLabel("Spacing density", { exact: true })
          .selectOption(density);
        for (const link of await nav.getByRole("link").all()) {
          const clearance = await link.evaluate((e) => {
            const text = document.createRange();
            text.selectNodeContents(e);
            const r = text.getBoundingClientRect(),
              b = e.getBoundingClientRect();
            return [
              r.top - b.top,
              b.right - r.right,
              b.bottom - r.bottom,
              r.left - b.left,
            ];
          });
          expect(
            Math.min(clearance[0], clearance[2]),
            `${preset}/${mode}/${density} block clearance`,
          ).toBeGreaterThanOrEqual(8);
          expect(
            Math.min(clearance[1], clearance[3]),
            `${preset}/${mode}/${density} inline clearance`,
          ).toBeGreaterThanOrEqual(12);
        }
      }
      const link = nav.getByRole("link", { name: "Activity", exact: true });
      await link.focus();
      expect(
        await link.evaluate((e) =>
          parseFloat(getComputedStyle(e).outlineWidth),
        ),
      ).toBeGreaterThan(0);
      await link.hover();
      await page.evaluate(async () => {
        await Promise.all(
          document
            .getAnimations()
            .filter(
              (a) => a.effect?.getComputedTiming().iterations !== Infinity,
            )
            .map((a) => a.finished.catch(() => undefined)),
        );
      });
      const result = await new AxeBuilder({ page })
        .include('[aria-label="Northstar workspace"]')
        .withRules(["color-contrast"])
        .analyze();
      expect(
        result.violations,
        `${preset}/${mode} focused hover contrast`,
      ).toEqual([]);
      await openWorkbenchGroup(page, "Appearance");
    }
  }
});
