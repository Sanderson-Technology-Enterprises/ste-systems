import assert from "node:assert/strict";
import test from "node:test";
import { CSS_GUIDE_EXAMPLES, LIBRARY_GUIDES } from "../app/data/library-guides";
import { ECOSYSTEM_PACKAGES } from "../app/data/ecosystem";

import {
  ATLAS_COVERAGE,
  LAYOUT_DENSITIES,
  SUPPORTED_COMBINATIONS,
  SUPPORTED_COMBINATIONS_LABEL,
} from "../app/data/atlas";

test("atlas coverage mirrors every published library contract", () => {
  assert.deepEqual(
    {
      areas: ATLAS_COVERAGE.layout.areas.length,
      personalities: ATLAS_COVERAGE.layout.personalities.length,
      primitives: ATLAS_COVERAGE.layout.primitives.length,
      recipes: ATLAS_COVERAGE.layout.recipes.length,
      wrappers: ATLAS_COVERAGE.layout.wrappers.length,
    },
    { areas: 11, personalities: 20, primitives: 22, recipes: 7, wrappers: 7 },
  );
  assert.deepEqual(
    {
      nativeFullyThemed: ATLAS_COVERAGE.ui.nativeElements.fullyThemed.length,
      nativeNonRendered: ATLAS_COVERAGE.ui.nativeElements.nonRendered.length,
      nativePlatformOwned:
        ATLAS_COVERAGE.ui.nativeElements.platformOwned.length,
      nativeProgressive:
        ATLAS_COVERAGE.ui.nativeElements.progressivelyEnhanced.length,
      semantic: ATLAS_COVERAGE.ui.semanticSelectors.length,
      universal: ATLAS_COVERAGE.ui.universalVisualSuffixes.length,
    },
    {
      nativeFullyThemed: 83,
      nativeNonRendered: 12,
      nativePlatformOwned: 6,
      nativeProgressive: 20,
      semantic: 75,
      universal: 153,
    },
  );
  assert.deepEqual(
    {
      dataHooks: ATLAS_COVERAGE.interaction.dataHooks.length,
      levels: ATLAS_COVERAGE.interaction.levels.length,
      stable: ATLAS_COVERAGE.interaction.stableSelectors.length,
      states: ATLAS_COVERAGE.interaction.stateClasses.length,
      variants: ATLAS_COVERAGE.interaction.variants.length,
    },
    { dataHooks: 4, levels: 3, stable: 13, states: 3, variants: 6 },
  );
});

test("five guides preserve the four-package CSS inventory and documented examples", () => {
  assert.equal(ECOSYSTEM_PACKAGES.length, 4);
  assert.deepEqual(
    LIBRARY_GUIDES.map((guide) => guide.id),
    ["layout", "ui", "interaction", "motion", "react"],
  );
  assert.equal(
    LIBRARY_GUIDES[4].packageName,
    "@sanderson-technology-enterprises/ste-usk-react",
  );
  assert.equal(LIBRARY_GUIDES[4].version, "2.3.0");
  assert.match(CSS_GUIDE_EXAMPLES.ui[0].html, /class="usk-card /);
  assert.match(CSS_GUIDE_EXAMPLES.layout[0].html, /class="ly-grid /);
  for (const guide of LIBRARY_GUIDES) {
    assert.ok(guide.install.includes(guide.packageName));
    if (guide.id === "react") continue;
    assert.ok(guide.links.some((link) => link.label === "Full documentation"));
    assert.ok(guide.links.some((link) => link.label === "npm package"));
  }
});

test("React remains documented without outbound resource links", () => {
  const guide = LIBRARY_GUIDES.find((item) => item.id === "react")!;
  assert.deepEqual(guide.links, []);
  assert.ok(guide.summary.includes("React"));
  assert.ok(guide.concepts.length > 0);
});

test("possibility count includes densities and native color schemes", () => {
  const sharedThemePairings = 20 * 25;
  const nativeThemePairings = 20;

  assert.deepEqual(LAYOUT_DENSITIES, ["compact", "normal", "spacious"]);
  assert.equal(
    SUPPORTED_COMBINATIONS,
    20 * 7 * 3 * (sharedThemePairings + nativeThemePairings),
  );
  assert.equal(SUPPORTED_COMBINATIONS, 218_400);
  assert.equal(SUPPORTED_COMBINATIONS_LABEL, "218,400");
  assert.equal("modes" in ATLAS_COVERAGE.ui, false);
});
