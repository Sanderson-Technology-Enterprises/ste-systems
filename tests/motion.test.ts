import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { ECOSYSTEM_PACKAGES, ADOPTION_PATHS } from "../app/data/ecosystem";
import { LIBRARY_GUIDES } from "../app/data/library-guides";

test("motion is the fourth CSS layer with standalone and full-stack adoption", () => {
  const motion = ECOSYSTEM_PACKAGES.find(
    (pkg) => pkg.name === "@sanderson-technology-enterprises/motion-style-css",
  );
  assert.ok(motion);
  assert.equal(motion.version, "1.0.0");
  assert.equal(motion.links.demo, "https://stesystems.com/lab/#motion");
  assert.ok(ADOPTION_PATHS.find((path) => path.id === "motion-only"));
  assert.equal(
    ADOPTION_PATHS.find((path) => path.id === "all-motion")?.packages.length,
    4,
  );
  assert.deepEqual(
    LIBRARY_GUIDES.map((guide) => guide.id),
    ["layout", "ui", "interaction", "motion", "react"],
  );
});

test("site entry imports each lifecycle stylesheet once", () => {
  const entry = readFileSync("app/layout.tsx", "utf8");
  assert.equal(
    entry.split(
      'import "@sanderson-technology-enterprises/motion-style-css/styles.css"',
    ).length - 1,
    1,
  );
  assert.equal(
    entry.split(
      'import "@sanderson-technology-enterprises/ste-usk-react/styles.css"',
    ).length - 1,
    1,
  );
});
