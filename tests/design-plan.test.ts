import assert from "node:assert/strict";
import test from "node:test";
import {
  createDesignPlan,
  fixMotionSettings,
  migrateLegacyPlan,
  parseDesignPlan,
  saveAlternative,
  serializeDesignPlan,
  selectAlternative,
} from "../app/lib/design-plan";
import { DEFAULT_MOTION_SETTINGS } from "../app/lib/motion-settings";

test("new plans work on HTTP LAN origins without randomUUID", () => {
  const randomUUID = crypto.randomUUID;
  Object.defineProperty(crypto, "randomUUID", {
    value: undefined,
    configurable: true,
  });
  try {
    assert.match(
      createDesignPlan().id,
      /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/,
    );
  } finally {
    Object.defineProperty(crypto, "randomUUID", {
      value: randomUUID,
      configurable: true,
    });
  }
});

test("complete design choices and both palette scopes survive a portable round trip", () => {
  const plan = createDesignPlan();
  plan.title = "Client consultation";
  plan.project.name = "Northstar";
  plan.design.wrapper = "wide";
  plan.design.intensity = "strong";
  plan.design.motion.entrance = "blueprint";
  plan.design.iconPack = "art-deco";
  for (const mode of ["light", "dark"] as const) {
    plan.design.palettes[`minimal-saas:native:${mode}`] = {
      name: `${mode} brand`,
      variables: {
        "--saas-primary-rgb": mode === "light" ? "36 91 150" : "80 160 220",
      },
    };
  }
  assert.deepEqual(parseDesignPlan(serializeDesignPlan(plan)).plan, plan);
});

test("legacy six-field configurations disclose missing choices and unsupported files are rejected", () => {
  const legacy = migrateLegacyPlan({
    configuration: {
      layout: "bento",
      ui: "bento",
      theme: "native",
      mode: "dark",
      recipe: "card-grid",
      density: "normal",
    },
  });
  assert.equal(legacy.plan.design.configuration.ui, "bento");
  assert.match(legacy.warnings.join(" "), /session-only colors/);
  assert.throws(
    () => parseDesignPlan({ ...createDesignPlan(), schemaVersion: 99 }),
    /unsupported document/,
  );
  assert.throws(
    () =>
      parseDesignPlan({
        ...createDesignPlan(),
        design: { ...createDesignPlan().design, wrapper: "unknown" },
      }),
    /Content width/,
  );
});

test("saved alternatives are independent and choosing one copies its direction", () => {
  const original = createDesignPlan();
  const a = saveAlternative(original, "A", "Clean");
  const changed = {
    ...a,
    design: {
      ...a.design,
      configuration: { ...a.design.configuration, ui: "art-deco" as const },
    },
  };
  const b = saveAlternative(changed, "B", "Bold");
  assert.equal(b.alternatives.A?.design.configuration.ui, "minimal-saas");
  assert.equal(b.alternatives.B?.design.configuration.ui, "art-deco");
  const selected = selectAlternative(b, "A");
  assert.equal(selected.design.configuration.ui, "minimal-saas");
  assert.equal(selected.alternatives.B?.design.configuration.ui, "art-deco");
});

test("legacy random motion choices become fixed document values", () => {
  const fixed = fixMotionSettings({ ...DEFAULT_MOTION_SETTINGS }, () => 0);
  assert.notEqual(fixed.entrance, "random");
  assert.notEqual(fixed.exit, "random");
  assert.notEqual(fixed.duration, "random");
  assert.notEqual(fixed.easing, "random");
  const plan = createDesignPlan();
  plan.design.motion = fixed;
  assert.deepEqual(parseDesignPlan(plan).plan.design.motion, fixed);
});

test("palette imports accept published material roles and reject unknown tokens", () => {
  const plan = createDesignPlan();
  plan.design.palettes["tactile:native:light"] = {
    name: "Material",
    variables: { "--tactile-material-shadow-rgb": "1 2 3" },
  };
  assert.deepEqual(
    parseDesignPlan(plan).plan.design.palettes["tactile:native:light"],
    plan.design.palettes["tactile:native:light"],
  );
  plan.design.palettes["tactile:native:light"].variables[
    "--tactile-unknown-rgb"
  ] = "1 2 3";
  assert.throws(() => parseDesignPlan(plan), /Invalid public RGB color/);
});
