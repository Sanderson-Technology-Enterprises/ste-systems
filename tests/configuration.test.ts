import assert from "node:assert/strict";
import test from "node:test";

import {
  CONFIGURATION_STORAGE_KEY,
  DEFAULT_CONFIGURATION,
  configurationMarkup,
  parseConfiguration,
  parseStoredConfiguration,
  serializeConfiguration,
  type LabConfiguration,
} from "../app/lib/configuration";

const storedConfiguration: LabConfiguration = {
  layout: "cyberpunk",
  ui: "bauhaus",
  theme: "ocean-steel",
  mode: "light",
};

test("recipe and density selections round-trip through URLs, storage and copied markup", () => {
  const selected = parseConfiguration(
    new URLSearchParams({ recipe: "docs", density: "spacious" }),
  );
  assert.equal(selected.recipe, "docs");
  assert.equal(selected.density, "spacious");
  assert.equal(serializeConfiguration(selected).get("recipe"), "docs");
  assert.equal(serializeConfiguration(selected).get("density"), "spacious");
  assert.equal(
    parseStoredConfiguration(JSON.stringify(selected))?.recipe,
    "docs",
  );
  assert.match(configurationMarkup(selected), /data-ly-recipe="docs"/);
  assert.match(configurationMarkup(selected), /data-ly-density="spacious"/);
  const invalid = parseConfiguration(
    new URLSearchParams({ recipe: "unknown", density: "huge" }),
  );
  assert.equal(invalid.recipe, undefined);
  assert.equal(invalid.density, undefined);
});

test("configuration defaults match the approved ecosystem starting point", () => {
  assert.equal(
    CONFIGURATION_STORAGE_KEY,
    "interface-systems-lab:configuration:v1",
  );
  assert.deepEqual(DEFAULT_CONFIGURATION, {
    layout: "bento",
    ui: "minimal-saas",
    theme: "midnight-gold",
    mode: "dark",
  });
  assert.deepEqual(parseConfiguration(new URLSearchParams()), {
    layout: "bento",
    ui: "minimal-saas",
    theme: "midnight-gold",
    mode: "dark",
  });
});

test("valid URL values override stored values one field at a time", () => {
  const search = new URLSearchParams({
    layout: "mondrian",
    theme: "rose-quartz",
  });

  assert.deepEqual(parseConfiguration(search, storedConfiguration), {
    layout: "mondrian",
    ui: "bauhaus",
    theme: "rose-quartz",
    mode: "light",
  });
});

test("new UI Style Kit 2.3 options are accepted from shared URLs", () => {
  const expandedConfiguration: LabConfiguration = {
    layout: "bento",
    ui: "editorial-luxe",
    theme: "electric-noir",
    mode: "dark",
  };

  assert.deepEqual(
    parseConfiguration(
      new URLSearchParams({
        ui: expandedConfiguration.ui,
        theme: expandedConfiguration.theme,
      }),
    ),
    expandedConfiguration,
  );
});

test("invalid URL values fall back independently to validated storage", () => {
  const cases = [
    ["layout", "unknown-layout"],
    ["ui", "unknown-ui"],
    ["theme", "unknown-theme"],
    ["mode", "unknown-mode"],
  ] as const;

  for (const [key, invalidValue] of cases) {
    const search = new URLSearchParams({
      layout: "bento",
      ui: "minimal-saas",
      theme: "midnight-gold",
      mode: "dark",
      [key]: invalidValue,
    });
    const expected = {
      layout: "bento",
      ui: "minimal-saas",
      theme: "midnight-gold",
      mode: "dark",
      [key]: storedConfiguration[key],
    };

    assert.deepEqual(parseConfiguration(search, storedConfiguration), expected);
  }
});

test("stored configuration parsing recovers safely and keeps valid fields", () => {
  assert.equal(parseStoredConfiguration(null), null);
  assert.equal(parseStoredConfiguration("{not json"), null);
  assert.equal(parseStoredConfiguration('"not an object"'), null);
  assert.equal(parseStoredConfiguration("[]"), null);
  assert.deepEqual(
    parseStoredConfiguration(
      JSON.stringify({
        layout: "split-screen",
        ui: "not-a-preset",
        theme: "arctic-indigo",
        mode: 42,
        ignored: "value",
      }),
    ),
    {
      layout: "split-screen",
      theme: "arctic-indigo",
    },
  );
});

test("invalid stored fields fall back independently to defaults", () => {
  const stored = parseStoredConfiguration(
    JSON.stringify({
      layout: "not-a-layout",
      ui: "retro-glass",
      theme: "not-a-theme",
      mode: "contrast",
    }),
  );

  assert.deepEqual(parseConfiguration(new URLSearchParams(), stored), {
    layout: "bento",
    ui: "retro-glass",
    theme: "midnight-gold",
    mode: "contrast",
  });
});

test("configuration serialization uses stable layout/ui/theme/mode order", () => {
  assert.equal(
    serializeConfiguration(DEFAULT_CONFIGURATION).toString(),
    "layout=bento&ui=minimal-saas&theme=midnight-gold&mode=dark",
  );
});

test("configuration markup matches the documented root contract exactly", () => {
  assert.equal(
    configurationMarkup(DEFAULT_CONFIGURATION),
    `<main
  class="ly-root"
  data-ly-layout="bento"
  data-ui="minimal-saas"
  data-theme="midnight-gold"
  data-mode="dark"
></main>`,
  );
});
