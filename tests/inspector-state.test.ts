import assert from "node:assert/strict";
import test from "node:test";
import {
  resizeInspector,
  inspectorMaximum,
  parseInspectorPreferences,
} from "../app/lib/inspector-state";

test("inspector resizing preserves readable widths and snaps in both directions", () => {
  assert.equal(inspectorMaximum(1200), 832);
  assert.deepEqual(resizeInspector(300, true, 1200), {
    open: true,
    width: 300,
  });
  assert.deepEqual(resizeInspector(180, true, 1200), {
    open: true,
    width: 240,
  });
  assert.deepEqual(resizeInspector(119, true, 1200), { open: false, width: 0 });
  assert.deepEqual(resizeInspector(119, false, 1200), {
    open: false,
    width: 0,
  });
  assert.deepEqual(resizeInspector(121, false, 1200), {
    open: true,
    width: 240,
  });
  assert.deepEqual(resizeInspector(1000, true, 1200), {
    open: true,
    width: 832,
  });
});

test("inspector preferences recover safely without accepting invalid stored state", () => {
  assert.deepEqual(parseInspectorPreferences(null), {
    width: 320,
    open: true,
    group: "Preview",
  });
  assert.deepEqual(
    parseInspectorPreferences("broken"),
    parseInspectorPreferences(null),
  );
  assert.deepEqual(
    parseInspectorPreferences(
      JSON.stringify({ width: 540, open: false, group: "Motion" }),
    ),
    { width: 540, open: false, group: "Effects" },
  );
  assert.deepEqual(
    parseInspectorPreferences(
      JSON.stringify({ width: -1, open: "yes", group: "Invalid" }),
    ),
    parseInspectorPreferences(null),
  );
});
