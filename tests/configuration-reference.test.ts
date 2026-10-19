import assert from "node:assert/strict";
import test from "node:test";
import layout from "layout-style-css/manifest.json";
import ui from "ui-style-kit-css/manifest.json";
import {
  COMBINATION_FACTORS,
  LAYOUT_DENSITIES,
  SUPPORTED_COMBINATIONS,
} from "../app/data/atlas";

test("public count factors reproduce the manifest inventory without counting display modes", () => {
  assert.deepEqual(COMBINATION_FACTORS, {
    layouts: layout.personalities.length,
    recipes: layout.recipes.length,
    densities: LAYOUT_DENSITIES.length,
    presets: ui.presets.length,
    sharedThemes: ui.themes.length,
    nativeSchemesPerPreset: 1,
  });
  const {
    layouts,
    recipes,
    densities,
    presets,
    sharedThemes,
    nativeSchemesPerPreset,
  } = COMBINATION_FACTORS;
  assert.equal(
    SUPPORTED_COMBINATIONS,
    layouts *
      recipes *
      densities *
      presets *
      (sharedThemes + nativeSchemesPerPreset),
  );
  assert.equal("modes" in COMBINATION_FACTORS, false);
  assert.ok(
    SUPPORTED_COMBINATIONS > layouts * recipes * presets * sharedThemes,
  );
});
