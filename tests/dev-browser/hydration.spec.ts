import { expect, test } from "@playwright/test";

test("Turbopack development hydrates the interactive routes cleanly", async ({
  page,
}) => {
  const hydrationDiagnostics: string[] = [];
  const pageErrors: string[] = [];

  page.on("console", (message) => {
    if (
      (message.type() === "error" || message.type() === "warning") &&
      /hydration|hydrated|server rendered html/i.test(message.text())
    ) {
      hydrationDiagnostics.push(message.text());
    }
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Design every layer/ }),
  ).toBeVisible();
  const identityLayer = page.getByRole("button", { name: /Identity/ });
  await identityLayer.click();
  await expect(identityLayer).toHaveAttribute("aria-pressed", "true");
  await expect(
    page
      .locator("#home-observatory-detail")
      .getByRole("heading", { name: "UI Style Kit CSS" }),
  ).toBeVisible();

  await page.goto("/lab/");
  await expect(
    page.getByRole("heading", {
      name: "Configure the system. Inspect every layer.",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open lab configuration" }).click();
  const contrastMode = page.getByRole("radio", { name: "High contrast" });
  await contrastMode.check();
  await expect(contrastMode).toBeChecked();
  await expect(page.locator('[data-mode="contrast"]').first()).toBeVisible();

  await page.goto("/components/");
  const search = page.getByRole("searchbox", {
    name: "Search components and contracts",
  });
  await expect(search).toBeVisible();
  await search.fill("button");
  await expect(page.locator("[data-atlas-specimen]").first()).toBeVisible();

  expect(hydrationDiagnostics).toEqual([]);
  expect(pageErrors).toEqual([]);
});
