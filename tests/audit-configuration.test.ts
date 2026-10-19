import assert from "node:assert/strict";
import test from "node:test";
import {
  configurationMarkup,
  parseConfiguration,
  parseStoredConfiguration,
  serializeConfiguration,
} from "../app/lib/configuration";

test("native palettes survive URL and storage round trips without emitting a theme attribute", () => {
  const native = parseConfiguration(
    new URLSearchParams("theme=native&ui=bauhaus"),
  );
  assert.equal(native.theme, "native");
  assert.equal(native.ui, "bauhaus");
  assert.equal(
    parseStoredConfiguration(JSON.stringify(native))?.theme,
    "native",
  );
  assert.deepEqual(parseConfiguration(serializeConfiguration(native)), native);
  assert.doesNotMatch(configurationMarkup(native), /data-theme/);
  assert.match(configurationMarkup(native), /data-ui="bauhaus"/);
  assert.equal(
    parseConfiguration(new URLSearchParams("theme=native"), {
      theme: "ocean-steel",
    }).theme,
    "native",
  );
});
