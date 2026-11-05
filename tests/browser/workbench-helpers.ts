import { expect, type Page } from "@playwright/test";

/** Start docked-editor contract cases consistently in every browser project.
 * Responsive cases explicitly resize through the Drawer and short-window paths. */
export async function setDockedViewport({ page }: { page: Page }) {
  await page.setViewportSize({ width: 1440, height: 1000 });
}

/** Open one editor group through the real desktop rail or mobile drawer. */
export async function openWorkbenchGroup(page: Page, group: string) {
  const mobile = page.getByRole("button", {
    name: "Open settings",
    exact: true,
  });
  if (await mobile.isVisible()) {
    const drawer = page.getByRole("dialog", { name: "Workbench settings" });
    if (!(await drawer.isVisible())) await mobile.click();
    await drawer.getByRole("button", { name: group, exact: true }).click();
  } else {
    const button = page
      .locator(".inspector-rail")
      .getByRole("button", { name: group, exact: true });
    if ((await button.getAttribute("aria-pressed")) !== "true")
      await button.click();
  }
}

/** Open the retained developer examples without creating another configuration menu. */
export async function showAdvancedExamples(
  page: Page,
  title = "Advanced library examples",
) {
  const summary = page
    .locator(".advanced-lab-examples > summary")
    .filter({ hasText: title });
  const details = summary.locator("..");
  if (!((await details.getAttribute("open")) !== null)) await summary.click();
  await expect(details).toHaveAttribute("open", "");
  await expect(details.locator("[data-advanced-configuration]")).toBeVisible();
}
