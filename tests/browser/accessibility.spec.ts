import AxeBuilder from "@axe-core/playwright";
import { expect, test, type TestInfo } from "@playwright/test";

type AxeResults = Awaited<ReturnType<AxeBuilder["analyze"]>>;

async function expectNoAxeViolations(
  results: AxeResults,
  testInfo: TestInfo,
  attachmentName: string,
) {
  await testInfo.attach(attachmentName, {
    body: JSON.stringify(results.violations, null, 2),
    contentType: "application/json",
  });
  expect(results.violations).toEqual([]);
}

test.beforeEach(async ({ page }) => {
  await page.goto("./lab/");
});

test("axe finds no violations on the focused homepage", async ({
  page,
}, testInfo) => {
  await page.goto("./");
  const results = await new AxeBuilder({ page }).analyze();
  await expectNoAxeViolations(results, testInfo, "axe-homepage.json");
});

test(
  "axe finds no violations across the complete default experience",
  { tag: "@cross-engine" },
  async ({ page }, testInfo) => {
    await page.getByRole("button", { name: "Open lab sections" }).click();
    await page
      .locator(
        "#ui-native details, #interactions details, #integrate details, #install details",
      )
      .evaluateAll((details) => {
        for (const detail of details)
          (detail as HTMLDetailsElement).open = true;
      });
    await expect(
      page.locator('[data-specimen="ui-paint-signature"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-interaction-state="aria-pressed"]'),
    ).toBeVisible();
    await expect(page.locator("#integrate")).toBeVisible();
    await expect(page.locator("#install")).toBeVisible();
    await expect(page.locator("#libraries")).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    await expectNoAxeViolations(
      results,
      testInfo,
      "axe-default-experience.json",
    );
  },
);

test(
  "axe finds no violations in extreme configuration and modal states",
  {
    tag: "@cross-engine",
  },
  async ({ page }, testInfo) => {
    await page.goto(
      "./lab/?layout=split-screen&ui=maximalist&theme=cyber-lime&mode=contrast",
    );
    await page
      .locator("#ui-native details, #interactions details")
      .evaluateAll((details) => {
        for (const detail of details)
          (detail as HTMLDetailsElement).open = true;
      });
    await page.getByRole("button", { name: "Validate native field" }).click();
    const selectedRadio = page
      .getByRole("radiogroup", { name: "Persistent collision state" })
      .getByRole("radio", { name: "Selected" });
    /** Activate native controls from the keyboard so sticky chrome cannot intercept them. */
    await selectedRadio.scrollIntoViewIfNeeded();
    await selectedRadio.focus();
    await selectedRadio.press("Space");
    await expect(selectedRadio).toBeChecked();
    const busyCheckbox = page.getByRole("checkbox", { name: "Busy" });
    /** Exercise the second native control through the same keyboard path. */
    await busyCheckbox.scrollIntoViewIfNeeded();
    await busyCheckbox.focus();
    await busyCheckbox.press("Space");
    await expect(busyCheckbox).toBeChecked();

    const extremeResults = await new AxeBuilder({ page })
      .include("#ui-native")
      .include("#interactions")
      .analyze();
    await expectNoAxeViolations(
      extremeResults,
      testInfo,
      "axe-extreme-labs.json",
    );

    await page.getByRole("button", { name: "Open native dialog" }).click();
    const dialog = page.getByRole("dialog", { name: "Native dialog specimen" });
    await expect(dialog).toBeVisible();
    const dialogResults = await new AxeBuilder({ page })
      .include("dialog[open]")
      .analyze();
    await expectNoAxeViolations(
      dialogResults,
      testInfo,
      "axe-native-dialog.json",
    );
  },
);

test("axe finds no violations in the component atlas", async ({
  page,
}, testInfo) => {
  await page.goto("./components/");
  await expect(page.locator("[data-atlas-specimen]").first()).toBeVisible();

  /**
   * The atlas intentionally renders multiple nested `<main>` specimens to
   * demonstrate the package's real element contract outside document context.
   */
  const results = await new AxeBuilder({ page })
    .disableRules([
      "landmark-main-is-top-level",
      "landmark-no-duplicate-main",
      "landmark-unique",
    ])
    .analyze();
  await expectNoAxeViolations(results, testInfo, "axe-component-atlas.json");
});
