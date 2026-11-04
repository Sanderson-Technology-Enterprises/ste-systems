import { expect, test } from "@playwright/test";

test("desktop workbench aligns borderless rail and inspector with independent scroll hosts", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./lab/#workbench");
  const frame = page.locator(".workbench-split");
  const header = await page
    .locator(".site-header")
    .evaluate((e) => e.parentElement!.getBoundingClientRect().height);
  await expect
    .poll(() =>
      frame.evaluate(
        (e) =>
          parseFloat(
            getComputedStyle(e).getPropertyValue("--workbench-header-height"),
          ) || 0,
      ),
    )
    .toBe(header);
  const bounds = (await frame.boundingBox())!;
  expect(bounds.height).toBeCloseTo(1000 - header - 32, 0);
  const rail = page.locator(".inspector-rail");
  const panel = page.locator(".inspector-panel-root");
  const divider = page.getByRole("separator", {
    name: "Resize settings panel",
  });
  const r = (await rail.boundingBox())!;
  for (const element of [panel, divider]) {
    const box = (await element.boundingBox())!;
    expect(box.y).toBeCloseTo(r.y, 0);
    expect(box.height).toBeCloseTo(r.height, 0);
  }
  await expect(rail).toHaveCSS("border-top-width", "0px");
  await expect(panel).toHaveCSS("border-top-width", "1px");
  await expect(page.locator(".inspector-panel")).toHaveCSS(
    "border-top-width",
    "0px",
  );
  const preview = page.getByRole("region", {
    name: "Live preview content",
    exact: true,
  });
  const before = await page.evaluate(() => scrollY);
  const toolbar = (await page
    .locator(".workbench-toolbar[data-editor-chrome]")
    .boundingBox())!.y;
  await preview.evaluate((e) => {
    e.scrollTop = 400;
  });
  expect(await preview.evaluate((e) => e.scrollTop)).toBeGreaterThan(0);
  expect(await page.evaluate(() => scrollY)).toBeCloseTo(before, 0);
  expect(
    (await page
      .locator(".workbench-toolbar[data-editor-chrome]")
      .boundingBox())!.y,
  ).toBeCloseTo(toolbar, 0);
  await page.getByRole("button", { name: "Motion", exact: true }).click();
  const controls = page.getByRole("region", {
    name: "Motion settings",
    exact: true,
  });
  await controls.evaluate((e) => {
    e.scrollTop = e.scrollHeight;
  });
  expect(await controls.evaluate((e) => e.scrollTop)).toBeGreaterThan(0);
  expect(await preview.evaluate((e) => e.scrollTop)).toBe(400);
});
