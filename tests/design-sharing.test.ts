import assert from "node:assert/strict";
import test from "node:test";
import { randomBytes } from "node:crypto";
import { createDesignPlan } from "../app/lib/design-plan";
import { encodeVisualLink, decodeVisualLink } from "../app/lib/design-sharing";

test("compressed visual links reproduce the rendering without project details or notes", async () => {
  const plan = createDesignPlan();
  plan.project.name = "Private customer";
  plan.notes.rationale = "Private consultation notes";
  plan.design.wrapper = "wide";
  plan.design.motion.entrance = "transmission";
  const link = await encodeVisualLink(
    plan,
    "https://example.test/ste-systems/lab/?ui=old",
  );
  const restored = await decodeVisualLink(new URL(link).hash);
  assert.deepEqual(restored.design, plan.design);
  assert.deepEqual(restored.preview, plan.preview);
  assert.equal(restored.project.name, "");
  assert.equal(restored.notes.rationale, "");
  assert.equal(new URL(link).search, "");
});

test("oversized visual links reject and leave the source plan usable", async () => {
  const plan = createDesignPlan();
  for (const ui of [
    "minimal-saas",
    "bento",
    "art-deco",
    "bauhaus",
    "clay",
    "tactile",
    "cyberpunk",
    "neo-noir",
  ] as const) {
    for (const theme of [
      "native",
      "midnight-gold",
      "ocean-steel",
      "forest-moss",
      "sunset-ember",
      "royal-plum",
    ] as const) {
      for (const mode of ["light", "dark"] as const)
        plan.design.palettes[`${ui}:${theme}:${mode}`] = {
          name: randomBytes(90).toString("hex"),
          variables: {},
        };
    }
  }
  await assert.rejects(
    encodeVisualLink(plan, "https://example.test/lab/"),
    /too large for a link/,
  );
  assert.equal(plan.project.name, "");
});
