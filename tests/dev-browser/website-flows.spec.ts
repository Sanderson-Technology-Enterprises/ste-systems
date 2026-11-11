import { expect, test, type Page } from "@playwright/test";
import type { WebsiteTemplateId } from "../../app/data/studio-scenarios";

/** Opens the same validated template link used by homepage starter cards. */
async function openTemplate(page: Page, id: WebsiteTemplateId) {
  await page.goto(`/lab/?template=${id}`);
  const frame = page.frameLocator('iframe[title="Website design preview"]');
  await expect(frame.locator("[data-scenario-root]")).toBeVisible();
  const template = frame.locator(`[data-template="${id}"]`);
  await expect(template).toBeVisible();
  return template;
}

test("newsletter validates a subscription and opens its archive and issue", async ({
  page,
}) => {
  const frame = await openTemplate(page, "newsletter");
  await frame
    .getByRole("button", { name: "Try sample subscription", exact: true })
    .click();
  await expect(frame.getByRole("alert")).toContainText("valid email");
  await frame.getByLabel("Newsletter email").fill("reader@example.com");
  await frame
    .getByRole("button", { name: "Try sample subscription", exact: true })
    .click();
  await expect(frame.getByRole("status")).toContainText(
    "No subscription was created",
  );
  await frame.getByRole("button", { name: "Archive", exact: true }).click();
  await frame
    .getByRole("button", { name: "Read issue 12", exact: true })
    .click();
  await expect(
    frame.getByRole("heading", {
      name: "The value of a slower question",
      exact: true,
    }),
  ).toBeVisible();
});

test("blog filters stories, handles empty results, and opens a complete article", async ({
  page,
}) => {
  const frame = await openTemplate(page, "blog");
  await frame.getByLabel("Search stories").fill("nothing matches");
  await expect(
    frame.getByText("No stories match. Try another search or category."),
  ).toBeVisible();
  await frame.getByLabel("Search stories").fill("");
  await frame.getByLabel("Story category").selectOption("Design");
  await frame
    .getByRole("button", {
      name: "Read Making space for good work",
      exact: true,
    })
    .click();
  await expect(
    frame.getByRole("heading", {
      name: "Making space for good work",
      exact: true,
    }),
  ).toBeVisible();
  await expect(frame.getByText("Written by Alex Morgan")).toBeVisible();
  await expect(
    frame.getByRole("heading", { name: "Related stories" }),
  ).toBeVisible();
});

test("industrial controls and alarms operate only on local simulated equipment", async ({
  page,
}) => {
  const frame = await openTemplate(page, "industrial");
  await expect(
    frame.getByText("Simulated equipment · no hardware connection"),
  ).toBeVisible();
  await frame
    .getByRole("button", { name: "Operator panel", exact: true })
    .click();
  await frame
    .getByRole("button", { name: "Start simulated line", exact: true })
    .click();
  await expect(frame.getByRole("status")).toContainText(
    "Simulated line started",
  );
  await frame.getByLabel("Simulated speed setpoint (%)").fill("101");
  await frame
    .getByRole("button", { name: "Apply simulated setpoint", exact: true })
    .click();
  await expect(frame.getByRole("alert")).toContainText("0 and 100");
  await frame.getByLabel("Simulated speed setpoint (%)").fill("60");
  await frame
    .getByRole("button", { name: "Apply simulated setpoint", exact: true })
    .click();
  await expect(frame.getByRole("status")).toContainText("60%");
  await frame.getByRole("button", { name: "Alarms", exact: true }).click();
  await frame
    .getByRole("button", {
      name: "Acknowledge Filter inspection due",
      exact: true,
    })
    .click();
  await expect(frame.getByRole("status")).toContainText(
    "acknowledged in this simulation",
  );
  await frame.getByLabel("Alarm filter").selectOption("Unacknowledged");
  await expect(frame.getByText("No alarms match this filter.")).toBeVisible();
});

test("inventory searches stock and validates an adjustment with movement history", async ({
  page,
}) => {
  const frame = await openTemplate(page, "inventory");
  await frame.getByLabel("Search inventory").fill("missing stock");
  await expect(frame.getByText("No items match these filters.")).toBeVisible();
  await frame.getByLabel("Search inventory").fill("bearing");
  await frame
    .getByRole("button", { name: "Open Precision bearing", exact: true })
    .click();
  await expect(frame.getByText("A-02 · Bin 04", { exact: true })).toBeVisible();
  await frame
    .getByRole("button", { name: "Adjust sample stock", exact: true })
    .click();
  await frame.getByLabel("Quantity change").fill("-999");
  await frame
    .getByRole("button", { name: "Apply sample adjustment", exact: true })
    .click();
  await expect(frame.getByRole("alert")).toContainText("cannot be negative");
  await frame.getByLabel("Quantity change").fill("5");
  await frame
    .getByRole("button", { name: "Apply sample adjustment", exact: true })
    .click();
  await expect(frame.getByRole("status")).toContainText(
    "Sample stock updated to 13",
  );
  await expect(
    frame.getByRole("table", { name: "Sample stock movements" }),
  ).toContainText("+5");
  await expect(
    frame.getByText(
      "Local demonstration data · no warehouse records are changed",
    ),
  ).toBeVisible();
});

test("storefront updates cart quantity and reviews a sample order", async ({
  page,
}) => {
  const frame = await openTemplate(page, "storefront");
  await frame
    .getByRole("button", { name: "Add Field notebook to cart", exact: true })
    .click();
  await frame
    .getByRole("button", { name: /View cart/ })
    .first()
    .click();
  await frame.getByLabel("Field notebook quantity").fill("2");
  await frame
    .getByRole("button", {
      name: "Update Field notebook quantity",
      exact: true,
    })
    .click();
  await expect(frame.getByText("Total: $36", { exact: true })).toBeVisible();
  await frame
    .getByRole("button", { name: "Try sample checkout", exact: true })
    .click();
  await expect(
    frame.getByRole("dialog", { name: "Sample confirmation" }),
  ).toContainText("No order was placed");
});

test("marketing inquiry validates fields and restores focus after sample confirmation", async ({
  page,
}) => {
  const frame = await openTemplate(page, "business");
  await frame
    .getByRole("button", { name: "Request a quote", exact: true })
    .click();
  await frame
    .getByRole("button", { name: "Try sample inquiry", exact: true })
    .click();
  await expect(frame.getByRole("alert")).toContainText("valid email");
  await frame.getByLabel("Your name").fill("Example Client");
  await frame.getByLabel("Email address").fill("client@example.com");
  await frame
    .getByRole("button", { name: "Try sample inquiry", exact: true })
    .click();
  await expect(
    frame.getByRole("dialog", { name: "Sample confirmation" }),
  ).toContainText("No message has been sent");
  await frame
    .getByRole("button", { name: "Close sample confirmation", exact: true })
    .click();
  await expect(
    frame.getByRole("button", { name: "Try sample inquiry", exact: true }),
  ).toBeFocused();
});
