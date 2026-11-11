import { expect, test } from "@playwright/test";

test("desktop studio gives the working preview the first screen", async ({
  page,
}) => {
  await page.goto("/lab/?template=business");
  await expect(page.getByText("Saved locally", { exact: true })).toBeVisible();
  await expect(page.locator("h1:visible")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "Website design studio", exact: true }),
  ).toBeVisible();
  const preview = await page
    .locator('iframe[title="Website design preview"]')
    .boundingBox();
  expect(preview!.y).toBeLessThan(320);
  expect(preview!.width).toBeGreaterThan(900);
  expect(preview!.y + preview!.height).toBeLessThanOrEqual(1000);
  await expect(
    page.getByRole("heading", {
      name: "Install one package or the complete stack.",
    }),
  ).not.toBeVisible();
});

test("phone studio shows the sample before scrolling and restores settings focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/lab/?template=business");
  const iframe = page.locator('iframe[title="Website design preview"]');
  await expect(iframe).toBeVisible();
  expect((await iframe.boundingBox())!.y).toBeLessThan(360);
  const opener = page.getByRole("button", {
    name: "Open settings",
    exact: true,
  });
  await opener.click();
  await page.getByRole("button", { name: "Show preview", exact: true }).click();
  await expect(opener).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("business hero pairs its content and artwork before full width services", async ({
  page,
}) => {
  await page.goto("/lab/?template=business");
  const frame = page.frameLocator('iframe[title="Website design preview"]');
  const hero = frame.locator('[data-ly-recipe="split-hero"]');
  await expect(hero).toBeVisible();
  const heading = await hero.getByRole("heading", { level: 1 }).boundingBox();
  const artwork = await hero.locator("aside").boundingBox();
  expect(Math.abs(heading!.y - artwork!.y)).toBeLessThan(140);
  await expect(
    hero.getByRole("heading", { name: "Discover the possibilities" }),
  ).toHaveCount(0);
  const services = frame.getByRole("region", { name: "Our services" });
  await expect(services).toBeVisible();
  expect((await services.boundingBox())!.width).toBeGreaterThan(
    (await hero.boundingBox())!.width * 0.9,
  );
});

test("style discovery opens readable rendered choices and returns focus", async ({
  page,
}) => {
  await page.goto("/lab/?template=business");
  await page
    .getByRole("button", { name: "Style and colors", exact: true })
    .click();
  const browse = page.getByRole("button", {
    name: "Browse all 20 styles",
    exact: true,
  });
  await browse.click();
  const gallery = page.getByRole("dialog", { name: "Choose a visual style" });
  await expect(gallery).toBeVisible();
  await expect(
    gallery
      .getByRole("button", { name: "Close dialog", exact: true })
      .locator("usk-icon")
      .locator("svg"),
  ).toBeVisible();
  await expect(gallery.locator("iframe")).toHaveCount(20);
  expect(
    (await gallery.locator("iframe").first().boundingBox())!.width,
  ).toBeGreaterThan(200);
  await gallery
    .getByRole("button", { name: "Use Art Deco visual style" })
    .click();
  await expect(gallery).not.toBeVisible();
  await expect(page.getByLabel("Visual style", { exact: true })).toHaveValue(
    "art-deco",
  );
  await expect(browse).toBeFocused();
});

test("comparison gives both saved alternatives a visible preview", async ({
  page,
}) => {
  await page.goto("/lab/?template=business");
  await page.getByRole("button", { name: "Compare", exact: true }).click();
  await page
    .getByRole("button", { name: "Save as option A", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Save as option B", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Compare options", exact: true })
    .click();
  for (const option of ["A", "B"]) {
    const frame = page.locator(`iframe[title="Option ${option} preview"]`);
    await expect(frame).toBeInViewport({ ratio: 0.75 });
  }
  await page.getByRole("button", { name: "Use option A", exact: true }).click();
  await expect(page.locator('iframe[title="Option A preview"]')).toHaveCount(0);
  await expect(
    page.locator('iframe[title="Website design preview"]'),
  ).toBeInViewport({ ratio: 0.75 });
});

test("device choices keep their actual viewport when wider than the editor pane", async ({
  page,
}) => {
  await page.goto("/lab/?template=business");
  const preview = page.frameLocator('iframe[title="Website design preview"]');
  for (const [device, width] of [
    ["Desktop", 1280],
    ["Tablet", 768],
    ["Phone", 390],
  ] as const) {
    await page
      .getByRole("button", { name: `${device} preview`, exact: true })
      .click();
    await expect
      .poll(async () => preview.locator("body").evaluate(() => innerWidth))
      .toBe(width);
  }
});

test("legacy reference links open their retained content", async ({ page }) => {
  await page.goto("/lab/#install");
  await expect(
    page.getByRole("heading", {
      name: "Install one package or the complete stack.",
    }),
  ).toBeVisible();
  await page.goto("about:blank");
  await page.goto("/lab/#integrate");
  await expect(
    page.getByText("Package integration proofs", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".studio-reference")).toHaveAttribute("open", "");
  await expect(page.locator("#top")).toHaveCount(1);
  await expect(page.locator("#workbench")).toHaveCount(1);
});
