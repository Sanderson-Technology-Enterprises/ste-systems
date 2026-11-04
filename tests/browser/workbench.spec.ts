import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { openWorkbenchGroup, setDockedViewport } from "./workbench-helpers";

test.beforeEach(setDockedViewport);

test("clipboard denial leaves the effective configuration available for manual copying", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async () => {
          throw new DOMException("Clipboard denied", "NotAllowedError");
        },
      },
      configurable: true,
    });
  });
  await page.goto("./lab/?ui=editorial-luxe&mode=light#workbench");
  await page.setViewportSize({ width: 390, height: 844 });
  await openWorkbenchGroup(page, "Export");
  await page
    .getByRole("button", { name: "Copy configuration JSON", exact: true })
    .click();
  const manual = page.getByLabel("Configuration export", { exact: true });
  const config = JSON.parse(await manual.inputValue());
  expect(config.configuration.ui).toBe("editorial-luxe");
  expect(config.configuration.recipe).toBe("card-grid");
  expect(config.configuration.density).toBe("normal");
  await expect(page.locator("[data-motion-status]")).toContainText(
    "copy it manually",
  );
  await expect(manual).toBeEditable({ editable: false });
});

test("vertical workflow stages stay content-sized in the dense component board", async ({
  page,
}) => {
  await page.goto("./lab/#workbench");
  const stages = page.getByRole("list", {
    name: "Release stages",
    exact: true,
  });
  await expect(stages).toBeVisible();
  for (const width of [1920, 1440, 390]) {
    await page.setViewportSize({ width, height: 1080 });
    for (const row of await stages.getByRole("listitem").all()) {
      expect(
        (await row.boundingBox())!.height,
        `stage height at ${width}px`,
      ).toBeLessThan(120);
      expect(
        await row.evaluate((e) => e.scrollWidth <= e.clientWidth + 1),
      ).toBe(true);
    }
  }
});

test("blocked storage preserves usable controls and touch resizing can exceed the former cap", async ({
  page,
  context,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Storage unavailable", "SecurityError");
      },
    });
  });
  await page.goto("./lab/?ui=cyberpunk&mode=light#workbench");
  const preview = page.locator("[data-workbench-preview]");
  const divider = page.getByRole("separator", {
    name: "Resize settings panel",
  });
  await expect(divider).toHaveAttribute("aria-valuenow", "320");
  await expect(preview).toHaveAttribute("data-ui", "cyberpunk");
  const session = await context.newCDPSession(page);
  await session.send("Emulation.setTouchEmulationEnabled", { enabled: true });
  const box = (await divider.boundingBox())!;
  const point = { x: box.x + box.width / 2, y: box.y + 30 };
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [point],
  });
  await session.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ ...point, x: point.x + 200 }],
  });
  await session.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect(divider).toHaveAttribute("aria-valuenow", "520");
  await divider.focus();
  await divider.press("End");
  expect(Number(await divider.getAttribute("aria-valuenow"))).toBeGreaterThan(
    520,
  );
  expect((await preview.boundingBox())!.width).toBeGreaterThanOrEqual(360);
  await divider.press("Home");
  await expect(page.locator("[data-inspector-panel]")).toBeHidden();
  await page.getByRole("button", { name: "Layout", exact: true }).click();
  await expect(page.locator("[data-inspector-panel] h2")).toHaveText("Layout");
  await page.getByLabel("Recipe", { exact: true }).selectOption("docs");
  expect(new URL(page.url()).searchParams.get("recipe")).toBe("docs");
  await expect(preview.locator("[data-ms-phase]")).toHaveCount(0);
  await session.detach();
});

test("site navigation stays pinned while the inspector and preview scroll", async ({
  page,
}) => {
  await page.goto("./lab/#workbench");
  await page
    .locator("[data-workbench-preview] [data-motion-item]")
    .last()
    .scrollIntoViewIfNeeded();
  const header = (await page.locator(".site-header").boundingBox())!;
  expect(header.y).toBeGreaterThanOrEqual(0);
  expect(header.y).toBeLessThan(8);
});

test("manual playback interrupts a pending configuration swap without losing the requested appearance", async ({
  page,
}) => {
  await page.goto("./lab/#motion");
  const bench = page.locator("[data-workbench]");
  await expect(bench.getByLabel("Exit preset", { exact: true })).toBeVisible();
  for (const name of ["duration", "delay"]) {
    const box = bench.getByLabel(`Random ${name}`, { exact: true });
    await box.focus();
    await box.press("Space");
  }
  const duration = bench.getByLabel("Duration (ms)", { exact: true });
  await duration.focus();
  await duration.press("End");
  await expect(duration).toHaveValue("1200");
  await bench
    .getByLabel("Exit preset", { exact: true })
    .selectOption("curtain");
  await bench
    .getByLabel("Motion direction", { exact: true })
    .selectOption("right");
  const optIn = bench.getByRole("switch", {
    name: "Animate configuration changes",
    exact: true,
  });
  await optIn.focus();
  await optIn.press("Space");
  await bench.getByRole("button", { name: "Appearance", exact: true }).click();
  await bench
    .getByLabel("Visual style", { exact: true })
    .selectOption("cyberpunk");
  await bench.getByRole("button", { name: "Motion", exact: true }).click();
  await bench.getByRole("button", { name: "Play exit", exact: true }).click();
  await expect(bench.locator("[data-motion-status]")).toContainText(
    "Exit: finished",
  );
  await expect(bench.locator("[data-workbench-preview]")).toHaveAttribute(
    "data-ui",
    "cyberpunk",
  );
  await expect(bench.locator("[data-workbench-motion]")).toHaveAttribute(
    "data-ms-exited",
    "true",
  );
});

test("one workbench applies selections immediately and preserves state across views", async ({
  page,
}) => {
  await page.goto("./lab/#workbench");
  const bench = page.locator("[data-workbench]");
  await expect(bench).toBeVisible();
  await expect(page.locator("#lab-configuration-panel")).toHaveCount(0);
  await bench
    .getByLabel("Visual style", { exact: true })
    .selectOption("editorial-luxe");
  await expect(bench.locator("[data-workbench-preview]")).toHaveAttribute(
    "data-ui",
    "editorial-luxe",
  );
  await expect(
    bench.locator("[data-workbench-preview] [data-ms-phase]"),
  ).toHaveCount(0);
  await expect(page.locator("[data-editor-chrome]").first()).toHaveAttribute(
    "data-ui",
    "minimal-saas",
  );
  await bench.getByLabel("Project name", { exact: true }).fill("Client sample");
  await bench
    .getByRole("button", { name: "Application workspace", exact: true })
    .click();
  await expect(bench.locator(".client-workspace")).toBeVisible();
  await bench
    .getByRole("button", { name: "Component showcase", exact: true })
    .click();
  await expect(bench.getByLabel("Project name", { exact: true })).toHaveValue(
    "Client sample",
  );
  await bench.getByRole("button", { name: "Motion", exact: true }).click();
  await expect(
    bench.getByRole("switch", {
      name: "Animate configuration changes",
      exact: true,
    }),
  ).not.toBeChecked();
  await bench.getByRole("button", { name: "Layout", exact: true }).click();
  await bench.getByLabel("Recipe", { exact: true }).selectOption("docs");
  expect(new URL(page.url()).searchParams.get("recipe")).toBe("docs");
});

test("legacy anchors open the matching inspector and advanced examples share its configuration", async ({
  page,
}) => {
  await page.goto(
    "./lab/?layout=editorial&ui=cyberpunk&theme=native&mode=light&recipe=docs&density=spacious#layouts",
  );
  await expect(page.locator("[data-inspector-panel] h2")).toHaveText("Layout");
  await expect(page.locator("[data-workbench-preview]")).toHaveAttribute(
    "data-ui",
    "cyberpunk",
  );
  await expect(page.locator("[data-workbench-preview]")).toHaveAttribute(
    "data-mode",
    "light",
  );
  await page
    .locator(".advanced-lab-examples")
    .first()
    .locator(":scope > summary")
    .click();
  await expect(
    page.locator("[data-advanced-configuration]").first(),
  ).toHaveAttribute("data-ui", "cyberpunk");
  await page.goto("./lab/#integrate");
  await expect(page.locator("#integrate")).toBeVisible();
});

test("workbench remains accessible and contained across styles and screen sizes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./lab/#workbench");
  const bench = page.locator("[data-workbench]");
  for (const style of [
    "minimal-saas",
    "data-terminal",
    "editorial-luxe",
    "maximalist",
    "technical-blueprint",
  ]) {
    await page.setViewportSize({ width: 1440, height: 1100 });
    await bench.getByLabel("Visual style", { exact: true }).selectOption(style);
    for (const mode of ["light", "dark", "contrast"]) {
      await bench
        .getByLabel("Display mode", { exact: true })
        .selectOption(mode);
      // Inspect settled palette paint, excluding the specimen's intentional infinite loader.
      await bench.locator("[data-workbench-preview]").evaluate(async (root) => {
        await Promise.all(
          root
            .getAnimations({ subtree: true })
            .filter(
              (animation) =>
                animation.effect?.getTiming().iterations !== Infinity,
            )
            .map((animation) => animation.finished.catch(() => {})),
        );
      });
      const result = await new AxeBuilder({ page })
        .include("[data-workbench]")
        .analyze();
      expect(
        result.violations.map(({ id, nodes }) => ({
          id,
          targets: nodes.map(({ target }) => target),
        })),
        `${style}/${mode}`,
      ).toEqual([]);
      for (const width of [320, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `${style}/${mode}/${width}`,
        ).toBe(true);
      }
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await bench.screenshot({
    path: "output/workbench-mobile.png",
    style: ".site-header,nextjs-portal {visibility:hidden;}",
  });
});

test("configuration motion is optional while manual and overlay motion retain real phases", async ({
  page,
}) => {
  await page.goto("./lab/#motion");
  const bench = page.locator("[data-workbench]");
  const shell = bench.locator("[data-workbench-motion]");
  await bench
    .getByLabel("Motion preset", { exact: true })
    .selectOption("slide");
  await bench
    .getByLabel("Exit preset", { exact: true })
    .selectOption("curtain");
  for (const name of ["duration", "delay"]) {
    const control = bench.getByLabel(`Random ${name}`, { exact: true });
    await control.focus();
    await control.press("Space");
  }
  await bench
    .getByRole("button", { name: "Play entrance", exact: true })
    .click();
  await expect(shell).toHaveAttribute("data-ms-phase", "in");
  const frames = await shell.evaluate(async (element) => {
    const values = [];
    for (let index = 0; index < 4; index++) {
      await new Promise(requestAnimationFrame);
      values.push(getComputedStyle(element).transform);
    }
    return values;
  });
  expect(new Set(frames).size).toBeGreaterThan(1);
  await bench
    .getByRole("button", { name: "Reset preview", exact: true })
    .click();
  const optIn = bench.getByRole("switch", {
    name: "Animate configuration changes",
    exact: true,
  });
  await optIn.focus();
  await optIn.press("Space");
  await bench.getByRole("button", { name: "Appearance", exact: true }).click();
  await bench
    .getByLabel("Visual style", { exact: true })
    .selectOption("maximalist");
  await expect(shell).toHaveAttribute("data-configuration-motion-state", "out");
  await bench.getByLabel("Display mode", { exact: true }).selectOption("light");
  await expect(bench.locator("[data-workbench-preview]")).toHaveAttribute(
    "data-mode",
    "light",
  );
  await expect(bench.locator("[data-workbench-preview]")).toHaveAttribute(
    "data-ui",
    "maximalist",
  );
  await expect(shell).toHaveAttribute(
    "data-configuration-motion-state",
    "idle",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await bench
    .getByLabel("Visual style", { exact: true })
    .selectOption("minimal-saas");
  await expect(shell).not.toHaveAttribute("data-ms-phase");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await bench
    .getByRole("button", { name: "Preview confirmation", exact: true })
    .click();
  const modal = page.getByRole("dialog", { name: "Publish this preview?" });
  await expect(modal).toHaveAttribute("data-ms-phase", "in");
  await modal
    .getByRole("button", { name: "Keep editing", exact: true })
    .click();
  await expect(modal).toHaveAttribute("data-ms-phase", "out");
  await expect(modal).not.toBeVisible();
  await expect(
    bench.getByRole("button", { name: "Preview confirmation", exact: true }),
  ).toBeFocused();
});

test("one inspector exposes every catalog factor and exports the actual custom theme", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./lab/#workbench");
  const bench = page.locator("[data-workbench]");
  await expect(
    bench.getByLabel("Visual style", { exact: true }).locator("option"),
  ).toHaveCount(20);
  await expect(
    bench.getByLabel("Color scheme", { exact: true }).locator("option"),
  ).toHaveCount(26);
  await bench.getByRole("button", { name: "Layout", exact: true }).click();
  for (const [label, count] of [
    ["Layout personality", 20],
    ["Recipe", 7],
    ["Spacing density", 3],
    ["Wrapper size", 7],
    ["Layout primitive", 22],
  ] as const)
    await expect(
      bench.getByLabel(label, { exact: true }).locator("option"),
    ).toHaveCount(count);
  await bench
    .getByRole("button", { name: "Explore layout primitives", exact: true })
    .click();
  const options = await bench
    .getByLabel("Layout primitive", { exact: true })
    .locator("option")
    .evaluateAll((elements) =>
      elements.map((element) => (element as HTMLOptionElement).value),
    );
  for (const option of options) {
    await bench
      .getByLabel("Layout primitive", { exact: true })
      .selectOption(option);
    await expect(bench.locator("[data-active-primitive]")).toHaveAttribute(
      "data-active-primitive",
      option,
    );
  }
  await bench
    .getByLabel("Primitive padding", { exact: true })
    .selectOption("0");
  await bench
    .getByRole("button", { name: "Copy layout markup", exact: true })
    .click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "padding: 2px",
  );
  await bench
    .getByRole("button", { name: "Component showcase", exact: true })
    .click();
  await bench.getByRole("button", { name: "Export", exact: true }).click();
  await bench.locator("[data-custom-theme-editor] summary").click();
  await bench.getByLabel("Primary hex", { exact: true }).fill("#123456");
  await bench
    .getByRole("button", { name: "Apply custom colors", exact: true })
    .click();
  await expect
    .poll(() =>
      bench
        .locator("[data-workbench-preview]")
        .evaluate((element) =>
          getComputedStyle(element)
            .getPropertyValue("--usk-primary-rgb")
            .trim(),
        ),
    )
    .toBe("18 52 86");
  await bench
    .getByRole("button", { name: "Copy configuration JSON", exact: true })
    .click();
  const exported = JSON.parse(
    await page.evaluate(() => navigator.clipboard.readText()),
  );
  expect(exported.variables["--usk-primary-rgb"]).toBe("18 52 86");
  expect(exported.configuration.recipe).toBe("card-grid");
  expect(exported.configuration.density).toBe("normal");
  expect(exported.primitiveStyle.padding).toBe("2px");
  expect(exported.motion.animateConfigurationChanges).toBe(false);
  expect(exported).not.toHaveProperty("inspector");
});

test("inspector divider resizes, snaps closed, restores and preserves desktop preferences", async ({
  page,
}) => {
  await page.goto("./lab/#workbench");
  const panel = page.locator("[data-inspector-panel]");
  const divider = page.getByRole("separator", {
    name: "Resize settings panel",
  });
  const resize = async (delta: number) => {
    const box = (await divider.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + 30);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + delta, box.y + 30, {
      steps: 12,
    });
    await page.mouse.up();
  };
  await expect(divider).toHaveAttribute("aria-valuenow", "320");
  expect(
    (await page.locator(".inspector-panel-root").boundingBox())!.width,
  ).toBeCloseTo(320, 0);
  await resize(80);
  await expect(divider).toHaveAttribute("aria-valuenow", "400");
  expect(
    (await page.locator(".inspector-panel-root").boundingBox())!.width,
  ).toBeCloseTo(400, 0);
  await resize(-300);
  await expect(panel).toBeHidden();
  await page
    .getByRole("button", { name: "Expand settings panel", exact: true })
    .click();
  await expect(divider).toHaveAttribute("aria-valuenow", "400");
  await page.reload();
  await expect(divider).toHaveAttribute("aria-valuenow", "400");
  await divider.focus();
  await divider.press("ArrowLeft");
  await expect(divider).toHaveAttribute("aria-valuenow", "384");
  const box = (await divider.boundingBox())!;
  await page.mouse.move(box.x + 4, box.y + 30);
  await page.mouse.down();
  await page.mouse.move(box.x + 70, box.y + 30);
  await page.keyboard.press("Escape");
  await page.mouse.up();
  await expect(divider).toHaveAttribute("aria-valuenow", "384");
  await page
    .getByRole("button", { name: "Collapse settings panel", exact: true })
    .click();
  await resize(150);
  await expect(panel).toBeVisible();
  await expect(divider).toHaveAttribute("aria-valuenow", "240");
  await divider.dblclick();
  await expect(divider).toHaveAttribute("aria-valuenow", "320");
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole("button", { name: "Open settings", exact: true })
    .click();
  const drawer = page.getByRole("dialog", { name: "Workbench settings" });
  await expect(drawer).toBeVisible();
  await drawer.getByRole("button", { name: "Layout", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await page.setViewportSize({ width: 1440, height: 1100 });
  await expect(divider).toHaveAttribute("aria-valuenow", "320");
  await page.locator("[data-workbench]").screenshot({
    path: "output/workbench-desktop.png",
    style: ".site-header,nextjs-portal {visibility:hidden;}",
  });
});
