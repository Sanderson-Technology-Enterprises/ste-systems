import { expect, test } from "@playwright/test";

test("structured recipes stack before their main region becomes narrower than its reading minimum", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./lab/#workbench");
  await page
    .getByRole("button", { name: "Application workspace", exact: true })
    .click();
  await page.getByRole("button", { name: "Layout", exact: true }).click();
  await page.getByLabel("Recipe", { exact: true }).selectOption("list-detail");
  const workspace = page.locator(".client-workspace");
  const measure = () =>
    workspace.evaluate((root) => {
      const style = getComputedStyle(root);
      const available =
        root.clientWidth -
        parseFloat(style.paddingLeft) -
        parseFloat(style.paddingRight);
      const main = root.querySelector(".workbench-main")!;
      return {
        width: main.getBoundingClientRect().width,
        required: Math.min(
          28 * parseFloat(getComputedStyle(document.documentElement).fontSize),
          available,
        ),
        overflow: root.scrollWidth > root.clientWidth + 1,
      };
    });
  const narrow = await measure();
  expect(narrow.width).toBeGreaterThanOrEqual(narrow.required - 1);
  expect(narrow.overflow).toBe(false);
  await expect(workspace).toHaveAttribute("data-ly-responsive", "manual");
  await page.setViewportSize({ width: 1920, height: 1080 });
  await expect(workspace).toHaveAttribute("data-ly-responsive", "auto");
  expect((await measure()).overflow).toBe(false);
});

test("application card recipes render readable content cards instead of five stretched shell columns", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./lab/#workbench");
  await page
    .getByRole("button", { name: "Application workspace", exact: true })
    .click();
  const workspace = page.locator(".client-workspace");
  const cards = workspace.locator("[data-workspace-card]");
  await expect(cards).toHaveCount(5);
  const available = (await workspace
    .locator("[data-workspace-cards]")
    .boundingBox())!.width;
  for (const card of await cards.all())
    expect((await card.boundingBox())!.width).toBeGreaterThanOrEqual(
      Math.min(352, available) - 1,
    );
  const width = (await workspace.boundingBox())!.width;
  expect(
    (await workspace.locator(":scope > header").boundingBox())!.width,
  ).toBeGreaterThan(width * 0.9);
  expect(
    (await workspace.locator(":scope > footer").boundingBox())!.height,
  ).toBeLessThan(150);
  await workspace
    .getByRole("button", { name: "Save project to shortlist", exact: true })
    .click();
  await page.getByRole("button", { name: "Layout", exact: true }).click();
  await page.getByLabel("Recipe", { exact: true }).selectOption("gallery");
  await expect(
    workspace.getByRole("button", {
      name: "Remove project from shortlist",
      exact: true,
    }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(cards).toHaveCount(5);
});
