import { expect, test } from "@playwright/test";
import { setDockedViewport } from "./workbench-helpers";

test.beforeEach(setDockedViewport);

test("preview overlays remain visible outside bounded scrolling and restore focus", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./lab/#workbench");
  const host = page.getByRole("region", {
    name: "Live preview content",
    exact: true,
  });
  const help = page.getByRole("button", { name: "Preview help", exact: true });
  await help.scrollIntoViewIfNeeded();
  await help.evaluate((e) => {
    const host = e.closest(".workbench-preview-scroll")!;
    host.scrollTop +=
      e.getBoundingClientRect().top - host.getBoundingClientRect().top - 18;
  });
  await help.hover();
  const tooltip = page.getByRole("tooltip");
  await expect(tooltip).toBeVisible();
  const box = (await tooltip.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(
    await tooltip.evaluate((e) => {
      const r = e.getBoundingClientRect();
      const previous = e.style.pointerEvents;
      e.style.pointerEvents = "auto";
      const visible = e.contains(
        document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
      );
      e.style.pointerEvents = previous;
      return visible;
    }),
  ).toBe(true);
  await page.mouse.move(0, 0);
  await expect(tooltip).not.toBeVisible();
  const trigger = page.getByRole("button", {
    name: "Preview confirmation",
    exact: true,
  });
  await trigger.click();
  const modal = page.getByRole("dialog", { name: "Publish this preview?" });
  await expect(modal).toBeVisible();
  const hostBox = (await host.boundingBox())!;
  const modalBox = (await modal.boundingBox())!;
  expect(modalBox.y).toBeLessThan(hostBox.y + hostBox.height);
  expect(await modal.evaluate((e) => e.matches(":modal"))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(modal).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
