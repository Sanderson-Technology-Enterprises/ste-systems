import { expect, test } from "@playwright/test";

import { setDockedViewport } from "./workbench-helpers";

test.beforeEach(setDockedViewport);

/** Capture the real lifecycle controller rather than inferring motion from attributes. */
async function recordMotion(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    document.documentElement.dataset.configurationPhases = "";
    document.addEventListener(
      "ms:start",
      (event) => {
        if (
          !(event.target as Element).matches(
            "[data-workbench-motion], [data-motion-preview]",
          )
        )
          return;
        document.documentElement.dataset.configurationPhases += `${(event as CustomEvent).detail.phase},`;
      },
      true,
    );
  });
}

test("main Lab configuration is immediate by default and leaves the editor stable", async ({
  page,
}) => {
  await page.goto("./lab/#workbench");
  await recordMotion(page);
  await page
    .getByLabel("Visual style", { exact: true })
    .selectOption("editorial-luxe");
  await page.getByLabel("Display mode", { exact: true }).selectOption("light");
  await expect(page.locator("[data-workbench-preview]")).toHaveAttribute(
    "data-ui",
    "editorial-luxe",
  );
  await expect(page.locator("[data-workbench-preview]")).toHaveAttribute(
    "data-mode",
    "light",
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-configuration-phases",
    "",
  );
  await expect(page.locator("[data-editor-chrome]").first()).toHaveAttribute(
    "data-mode",
    "dark",
  );
});

test("fixed configuration motion remains opt-in and rapid requests keep the latest choice", async ({
  page,
}) => {
  await page.goto("./lab/#motion");
  const bench = page.locator("[data-workbench]");
  for (const [label, value] of [
    ["Motion preset", "slide"],
    ["Exit preset", "curtain"],
    ["Motion direction", "right"],
    ["Motion easing", "linear"],
  ])
    await bench.getByLabel(label, { exact: true }).selectOption(value);
  for (const name of ["duration", "delay"]) {
    const control = bench.getByLabel(`Random ${name}`, { exact: true });
    await control.focus();
    await control.press("Space");
  }
  const duration = bench.getByLabel("Duration (ms)", { exact: true });
  await duration.focus();
  await duration.press("Home");
  for (let index = 0; index < 3; index++) await duration.press("ArrowRight");
  await expect(duration).toHaveValue("350");
  const optIn = bench.getByRole("switch", {
    name: "Animate configuration changes",
    exact: true,
  });
  await optIn.focus();
  await optIn.press("Space");
  await recordMotion(page);
  await bench.getByRole("button", { name: "Appearance", exact: true }).click();
  await bench
    .getByLabel("Visual style", { exact: true })
    .selectOption("cyberpunk");
  await expect(bench.locator("[data-workbench-motion]")).toHaveAttribute(
    "data-ms-phase",
    "out",
  );
  await bench.getByLabel("Display mode", { exact: true }).selectOption("light");
  await expect(bench.locator("[data-workbench-preview]")).toHaveAttribute(
    "data-ui",
    "cyberpunk",
  );
  await expect(bench.locator("[data-workbench-preview]")).toHaveAttribute(
    "data-mode",
    "light",
  );
  await expect(bench.locator("[data-workbench-motion]")).toHaveAttribute(
    "data-configuration-motion-state",
    "idle",
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-configuration-phases",
    /out,.*in,/,
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await recordMotion(page);
  await bench.getByLabel("Visual style", { exact: true }).selectOption("bento");
  await expect(page.locator("html")).toHaveAttribute(
    "data-configuration-phases",
    "",
  );
});

test("embedded guide shares the new opt-in policy and retains randomized motion controls", async ({
  page,
}) => {
  await page.goto("./components/#atlas-motion");
  const guide = page.locator("#motion-guide-preview");
  await guide.locator("[data-motion-settings] summary").click();
  const optIn = guide.getByRole("switch", {
    name: "Animate configuration changes",
    exact: true,
  });
  await expect(optIn).not.toBeChecked();
  for (const name of ["duration", "delay", "stagger interval"])
    await expect(
      guide.getByRole("checkbox", { name: `Random ${name}`, exact: true }),
    ).toBeChecked();
  await recordMotion(page);
  await guide
    .getByLabel("Preview style", { exact: true })
    .selectOption("data-terminal");
  await expect(page.locator("html")).toHaveAttribute(
    "data-configuration-phases",
    "",
  );
  await optIn.focus();
  await optIn.press("Space");
  await guide
    .getByLabel("Preview palette", { exact: true })
    .selectOption("ocean-steel");
  await expect(guide.locator("[data-motion-preview]")).toHaveAttribute(
    "data-configuration-motion-state",
    "idle",
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-configuration-phases",
    "out,in,",
  );
});
