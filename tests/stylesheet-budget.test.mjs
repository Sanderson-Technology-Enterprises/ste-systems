import assert from "node:assert/strict";
import test from "node:test";
import { measureRouteStyles } from "../scripts/measure-route-styles.mjs";

test("production route styles are deduplicated, measured, and within the compressed ceiling", async () => {
  for (const route of [
    "index.html",
    "components/index.html",
    "lab/index.html",
  ]) {
    const report = await measureRouteStyles(route);
    assert.ok(report.stylesheets.length > 0);
    assert.equal(
      report.stylesheets.length,
      new Set(report.stylesheets.map((file) => file.href)).size,
    );
    assert.ok(report.gzipBytes > 0 && report.gzipBytes < report.rawBytes);
    assert.ok(
      report.gzipBytes < 480 * 1024,
      `${route}: ${report.gzipBytes} gzip bytes exceed the ceiling`,
    );
  }
});
