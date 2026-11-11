import assert from "node:assert/strict";
import test from "node:test";
import { WEBSITE_TEMPLATES } from "../app/data/studio-scenarios";
import { applyWebsiteTemplate } from "../app/lib/website-templates";
import {
  createDesignPlan,
  parseDesignPlan,
  serializeDesignPlan,
} from "../app/lib/design-plan";
import { encodeVisualLink, decodeVisualLink } from "../app/lib/design-sharing";

test("six website starters expose distinct screens and supported structural defaults", () => {
  assert.deepEqual(
    WEBSITE_TEMPLATES.map((item) => item.id),
    ["business", "storefront", "newsletter", "blog", "industrial", "inventory"],
  );
  for (const template of WEBSITE_TEMPLATES) {
    assert.ok(
      template.description && template.icon && template.starter.headline,
    );
    assert.ok(template.screens.length >= 2);
    assert.deepEqual(template.thumbnail, { width: 960, height: 640 });
  }
});

test("template selection replaces structure without altering client styling or private context", () => {
  const before = createDesignPlan();
  before.project.name = "Northstar";
  before.notes.requests = "Private consultation note";
  before.design.configuration.ui = "art-deco";
  before.design.configuration.density = "spacious";
  before.design.motion.entrance = "blueprint";
  before.design.iconPack = "bauhaus";
  before.design.palettes["art-deco:native:dark"] = {
    name: "Brand",
    variables: { "--deco-primary-rgb": "36 91 150" },
  };
  before.alternatives.A = {
    name: "Favorite",
    design: structuredClone(before.design),
  };
  const frozen = structuredClone(before);
  const next = applyWebsiteTemplate(before, "inventory");
  assert.deepEqual(before, frozen);
  assert.equal(next.preview.scenario, "inventory");
  assert.equal(next.preview.screen, "items");
  assert.equal(next.design.configuration.recipe, "app-shell");
  assert.equal(next.design.wrapper, "workspace");
  assert.equal(next.design.configuration.ui, "art-deco");
  assert.equal(next.design.configuration.density, "spacious");
  assert.deepEqual(next.design.motion, before.design.motion);
  assert.deepEqual(next.design.palettes, before.design.palettes);
  assert.equal(next.design.iconPack, "bauhaus");
  assert.deepEqual(next.project, before.project);
  assert.deepEqual(next.notes, before.notes);
  assert.deepEqual(next.alternatives, before.alternatives);
  assert.throws(
    () => applyWebsiteTemplate(before, "unknown"),
    /Unknown website type/,
  );
});

test("renderer one documents migrate without changing their selected scenario or design", () => {
  const original = createDesignPlan();
  original.preview = { scenario: "portal", screen: "detail", device: "phone" };
  const result = parseDesignPlan({ ...original, rendererVersion: 1 });
  assert.equal(result.plan.rendererVersion, 2);
  assert.equal(result.plan.schemaVersion, 1);
  assert.deepEqual(result.plan.design, original.design);
  assert.deepEqual(result.plan.preview, original.preview);
  assert.match(result.warnings.join(" "), /renderer 1.*renderer 2/i);
  assert.throws(
    () => parseDesignPlan({ ...original, rendererVersion: 99 }),
    /unsupported/,
  );
});

test("each starter survives files and visual links without leaking private notes", async () => {
  for (const template of WEBSITE_TEMPLATES) {
    const plan = applyWebsiteTemplate(createDesignPlan(), template.id, {
      fresh: true,
    });
    plan.notes.requests = "Private request";
    assert.equal(plan.project.headline, template.starter.headline);
    assert.deepEqual(parseDesignPlan(serializeDesignPlan(plan)).plan, plan);
    const link = await encodeVisualLink(plan, "https://example.com/lab/");
    const restored = await decodeVisualLink(new URL(link).hash);
    assert.deepEqual(restored.preview, plan.preview);
    assert.deepEqual(restored.design, plan.design);
    assert.equal(restored.notes.requests, "");
  }
});
