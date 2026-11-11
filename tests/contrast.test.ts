import assert from "node:assert/strict";
import test from "node:test";
import { contrastRatio, describeContrast } from "../app/lib/contrast";
test("contrast uses linearized sRGB rather than comparing raw color channels", () => {
  assert.equal(contrastRatio([0, 0, 0], [255, 255, 255]), 21);
  assert.ok(
    Math.abs(contrastRatio([119, 119, 119], [255, 255, 255]) - 4.478) < 0.01,
  );
});
test("contrast readout distinguishes passing, failing and unverified pairs", () => {
  assert.match(
    describeContrast({
      label: "Heading",
      state: "normal",
      ratio: 7,
      required: 4.5,
    }),
    /Pass.*7.00:1/,
  );
  assert.match(
    describeContrast({
      label: "Link",
      state: "focus",
      ratio: 2.5,
      required: 4.5,
    }),
    /Needs attention.*2.50:1/,
  );
  assert.match(
    describeContrast({
      label: "Texture",
      state: "normal",
      ratio: null,
      required: 4.5,
    }),
    /Unverified/,
  );
});
