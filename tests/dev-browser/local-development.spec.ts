import { expect, test } from "@playwright/test";

test("loopback development host opens the complete design studio", async ({
  page,
}) => {
  await page.goto("/lab/?template=business");
  await expect(page.getByText("Saved locally", { exact: true })).toBeVisible();
  await expect(
    page
      .frameLocator('iframe[title="Website design preview"]')
      .locator("[data-scenario-root]"),
  ).toBeVisible();
});

test("preview download works without secure-context UUID support", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(crypto, "randomUUID", {
      value: undefined,
      configurable: true,
    });
  });
  await page.goto("/lab/?template=business");
  await page
    .getByRole("button", { name: "Review and save", exact: true })
    .click();
  const downloaded = page.waitForEvent("download", { timeout: 30000 });
  await page
    .getByRole("button", { name: "Download preview image", exact: true })
    .click();
  expect((await downloaded).suggestedFilename()).toMatch(
    /^ste-preview-r\d+\.png$/,
  );
});

test("visual links offer manual copying when the LAN clipboard API is unavailable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      configurable: true,
    });
  });
  await page.goto("/lab/?template=business");
  await page
    .getByRole("button", { name: "Review and save", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Copy visual link", exact: true })
    .click();
  await expect(page.getByLabel("Visual link", { exact: true })).toHaveValue(
    /#design=1\./,
  );
  await expect(page.locator(".studio-notice")).toContainText(
    "Visual link ready",
  );
});
