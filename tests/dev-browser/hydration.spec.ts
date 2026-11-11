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
    page.getByRole("heading", { name: /Plan the look and feel/ }),
  ).toBeVisible();
  const identityLayer = page.getByRole("button", { name: /Identity/ });
  await identityLayer.click();
  await expect(identityLayer).toHaveAttribute("aria-pressed", "true");
  await expect(
    page
      .locator("#home-observatory-detail")
      .getByRole("heading", { name: "UI Style Kit CSS" }),
  ).toBeVisible();

  await page.goto("/lab/?template=business");
  await expect(
    page.getByRole("heading", {
      name: "Website design studio",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Style and colors" }).click();
  const mode = page.getByRole("combobox", {
    name: "Display mode",
    exact: true,
  });
  await mode.selectOption("contrast");
  await expect(mode).toHaveValue("contrast");
  await expect(
    page
      .frameLocator("iframe.studio-preview-frame")
      .locator("[data-scenario-root]"),
  ).toHaveAttribute("data-mode", "contrast");

  await page.goto("/components/");
  await page.getByRole("tab", { name: "STE USK React", exact: true }).click();
  await expect(
    page.getByRole("tabpanel").getByLabel("Project name"),
  ).toBeVisible();

  expect(hydrationDiagnostics).toEqual([]);
  expect(pageErrors).toEqual([]);
});
