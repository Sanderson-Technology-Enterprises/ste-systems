import assert from "node:assert/strict";
import { stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import test from "node:test";

test("responsive brand lockups preserve transparency within display-size budgets", async () => {
  for (const width of [64, 128, 256, 384]) {
    const file = new URL(
      `../public/ste-systems-logo-${width}.webp`,
      import.meta.url,
    );
    const metadata = await sharp(fileURLToPath(file)).metadata();
    assert.equal(metadata.width, width);
    assert.equal(metadata.height, width * 0.75);
    assert.equal(metadata.hasAlpha, true);
    assert.ok((await stat(file)).size < (width <= 128 ? 8_000 : 40_000));
  }
});
