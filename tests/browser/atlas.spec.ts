import { expect, test } from "@playwright/test";

const guideNames = [
  "Layout Style CSS",
  "UI Style Kit CSS",
  "Interactive Surface CSS",
  "STE USK React",
];

/** Exercises the four-guide contract and base-path-aware handoff to the Lab. */
test("component guides expose four tabs and two full Lab links", async ({
  page,
}) => {
  await page.goto("./components/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Components & library guides",
  );
  await expect(page.getByRole("tab")).toHaveCount(4);
  await expect(
    page.getByRole("tab", { name: guideNames[0], exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toHaveCount(1);
  await expect(page.getByRole("searchbox")).toHaveCount(0);
  const links = page.getByRole("link", { name: "View full Lab", exact: true });
  await expect(links).toHaveCount(2);
  const expected = new URL("../lab/", page.url()).pathname;
  for (const link of await links.all())
    await expect(link).toHaveAttribute("href", expected);
  await links.first().click();
  await expect(page).toHaveURL(new RegExp(`${expected}$`));
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Configure the system",
  );
});

/** Keeps fragment links and keyboard selection aligned with accessible panels. */
test("guide fragments and keyboard navigation select the correct panel", async ({
  page,
}) => {
  await page.goto("./components/#atlas-react");
  const reactTab = page.getByRole("tab", {
    name: "STE USK React",
    exact: true,
  });
  await expect(reactTab).toHaveAttribute("aria-selected", "true");
  await reactTab.focus();
  await reactTab.press("Home");
  await expect(
    page.getByRole("tab", { name: "Layout Style CSS", exact: true }),
  ).toBeFocused();
  await expect(page).toHaveURL(/#atlas-layout$/);
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "UI Style Kit CSS", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toHaveCount(1);
  await page.evaluate(() => {
    window.location.hash = "atlas-interaction";
  });
  await expect(
    page.getByRole("tab", { name: "Interactive Surface CSS", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.evaluate(() => {
    window.location.hash = "atlas-react";
  });
  await expect(reactTab).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByRole("tabpanel").getByLabel("Project name"),
  ).toBeVisible();
});

/** Verifies useful React and CSS interactions without external writes. */
test("guide examples update local state and show honest feedback", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("./components/#atlas-interaction");
  const pin = page.getByRole("button", { name: "Pin project", exact: true });
  await expect(pin).toHaveAttribute("aria-pressed", "false");
  await pin.click();
  await expect(pin).toHaveAttribute("aria-pressed", "true");
  await pin.click();
  await expect(pin).toHaveAttribute("aria-pressed", "false");
  await expect(
    page.getByRole("button", { name: "Unavailable", exact: true }),
  ).toBeDisabled();
  await page.getByRole("tab", { name: "STE USK React", exact: true }).click();
  const panel = page.getByRole("tabpanel");
  await panel.getByLabel("Project name").fill("Team directory");
  await panel
    .getByRole("button", { name: "Save preview", exact: true })
    .click();
  await expect(
    panel.locator(".guide-preview").getByRole("status"),
  ).toContainText("Team directory");
  await expect(
    panel.locator(".guide-preview").getByRole("status"),
  ).toContainText("No data was sent");
  await panel.getByLabel("Project name").fill(" ");
  await expect(
    panel.getByRole("button", { name: "Save preview", exact: true }),
  ).toBeDisabled();
  await expect(panel.locator(".guide-preview").getByRole("status")).toHaveCount(
    0,
  );
  expect(errors).toEqual([]);
});

/** Checks copy output against visible source, including the actual React example module. */
test("guide code copies HTML and JSX and explains clipboard failures", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const state = window as Window & { copied?: string; rejectCopy?: boolean };
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          if (state.rejectCopy) throw new Error("Denied");
          state.copied = value;
        },
      },
    });
  });
  await page.goto("./components/");
  let snippet = page.locator('[data-guide-code="layout-grid"]');
  await snippet.getByRole("button", { name: "Copy HTML" }).click();
  await expect(snippet.getByRole("status")).toHaveText("Copied.");
  expect(
    await page.evaluate(() => (window as Window & { copied?: string }).copied),
  ).toBe(await snippet.locator("code").textContent());
  const expectedHtml = await page
    .locator('[data-guide-preview="layout-grid"]')
    .innerHTML();
  expect(expectedHtml.replace(/\s+/g, " ").trim()).toBe(
    (await snippet.locator("code").innerText()).replace(/\s+/g, " ").trim(),
  );
  await page.getByRole("tab", { name: "STE USK React", exact: true }).click();
  snippet = page.locator('[data-guide-code="react-project"]');
  await snippet.getByRole("button", { name: "Copy JSX" }).click();
  const jsx = await page.evaluate(
    () => (window as Window & { copied?: string }).copied,
  );
  expect(jsx).toContain('import { useState } from "react"');
  expect(jsx).toContain("<InterfaceRoot");
  expect(jsx).toContain("<Form.Input");
  await page.evaluate(() => {
    (window as Window & { rejectCopy?: boolean }).rejectCopy = true;
  });
  await snippet.getByRole("button", { name: "Copy JSX" }).click();
  await expect(snippet.getByRole("status")).toContainText(
    "Select the code and copy it manually",
  );
});

/** Measures the actual columns and touch targets rather than relying on screenshots alone. */
test("four guides reflow without overlap across responsive widths", async ({
  page,
}) => {
  await page.goto("./components/");
  for (const width of [360, 390, 768, 959, 961, 1280, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const name of guideNames) {
      const tab = page.getByRole("tab", { name, exact: true });
      await tab.click();
      const panel = page.getByRole("tabpanel");
      const bounds = await panel.evaluate((element) => {
        const docs = element
          .querySelector(".guide-documentation")!
          .getBoundingClientRect();
        const examples = element
          .querySelector(".guide-examples")!
          .getBoundingClientRect();
        return {
          page: document.documentElement.scrollWidth,
          viewport: document.documentElement.clientWidth,
          docs: {
            left: docs.left,
            right: docs.right,
            top: docs.top,
            bottom: docs.bottom,
          },
          examples: {
            left: examples.left,
            right: examples.right,
            top: examples.top,
            bottom: examples.bottom,
          },
        };
      });
      expect(bounds.page, `${name} at ${width}px`).toBeLessThanOrEqual(
        bounds.viewport,
      );
      if (width >= 961)
        expect(bounds.docs.right).toBeLessThanOrEqual(bounds.examples.left);
      else expect(bounds.docs.bottom).toBeLessThanOrEqual(bounds.examples.top);
      expect((await tab.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
  }
});
