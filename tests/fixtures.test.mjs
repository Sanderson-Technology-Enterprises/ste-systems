import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  buildFixtures,
  EXPECTED_PACKAGE_VERSIONS,
  FIXTURE_ASSETS,
  validateFixtureCatalog,
} from "../scripts/build-fixtures.mjs";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const catalogPath = path.join(
  repositoryRoot,
  "app",
  "data",
  "integration-fixtures.json",
);

async function readCatalog() {
  return JSON.parse(await readFile(catalogPath, "utf8"));
}

async function collectGeneratedFiles(root, relativeDirectory = "") {
  const directory = path.join(root, relativeDirectory);
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = path.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectGeneratedFiles(root, relativePath)));
    } else if (entry.isFile()) {
      files.push(relativePath);
    }
  }

  return files;
}

test("fixture ownership contains only the three pinned CSS libraries", () => {
  assert.deepEqual(EXPECTED_PACKAGE_VERSIONS, {
    "interactive-surface-css": "1.7.0",
    "layout-style-css": "3.2.0",
    "ui-style-kit-css": "2.4.1",
  });
  assert.deepEqual(Object.keys(FIXTURE_ASSETS).sort(), [
    "interaction-core",
    "interaction-standalone",
    "layout-core",
    "ui-theme",
    "ui-visual",
  ]);
});

test("fixture catalog covers singles, pairs, and the complete stack", async () => {
  const catalog = await readCatalog();

  validateFixtureCatalog(catalog);
  assert.deepEqual(
    catalog.map(({ id }) => id),
    [
      "layout-only",
      "ui-only",
      "interactive-only",
      "layout-ui",
      "layout-interactive",
      "ui-interactive",
      "all-canonical",
    ],
  );
  assert.deepEqual(
    catalog.reduce((counts, fixture) => {
      counts[fixture.group] = (counts[fixture.group] ?? 0) + 1;
      return counts;
    }, {}),
    { all: 1, one: 3, pair: 3 },
  );

  const declaredPackages = new Set(catalog.flatMap(({ packages }) => packages));
  assert.deepEqual([...declaredPackages].sort(), [
    "interactive-surface-css",
    "layout-style-css",
    "ui-style-kit-css",
  ]);
});

test("fixture validation rejects unsafe or incomplete catalog entries", () => {
  assert.throws(() => validateFixtureCatalog([]), /non-empty array/);
  assert.throws(
    () =>
      validateFixtureCatalog([
        {
          id: "Unsafe Fixture",
          title: "Unsafe fixture",
          summary: "Invalid identifier proof.",
          styles: ["layout-core"],
        },
      ]),
    /Invalid fixture id/,
  );
  assert.throws(
    () =>
      validateFixtureCatalog([
        {
          id: "unknown-style",
          title: "Unknown style",
          summary: "Unknown asset proof.",
          styles: ["missing-style"],
        },
      ]),
    /Unknown asset key/,
  );
});

test("fixture build emits deterministic local-only integration proofs", async () => {
  const firstBuild = await buildFixtures();
  const firstFiles = (
    await collectGeneratedFiles(firstBuild.generatedRoot)
  ).sort();
  const firstContents = await Promise.all(
    firstFiles.map(async (relativePath) => {
      const candidate = path.join(firstBuild.generatedRoot, relativePath);
      return [relativePath, await readFile(candidate)];
    }),
  );

  const secondBuild = await buildFixtures();
  const secondFiles = (
    await collectGeneratedFiles(secondBuild.generatedRoot)
  ).sort();

  assert.equal(firstBuild.fixtureCount, 7);
  assert.deepEqual(secondFiles, firstFiles);

  for (const [relativePath, firstContent] of firstContents) {
    if (firstContent === null) continue;
    assert.deepEqual(
      await readFile(path.join(secondBuild.generatedRoot, relativePath)),
      firstContent,
      relativePath,
    );
  }

  for (const fixtureId of [
    "layout-only",
    "ui-only",
    "interactive-only",
    "layout-ui",
    "layout-interactive",
    "ui-interactive",
    "all-canonical",
  ]) {
    const html = await readFile(
      path.join(secondBuild.generatedRoot, `${fixtureId}.html`),
      "utf8",
    );
    assert.match(html, new RegExp(`data-fixture-id="${fixtureId}"`));
    assert.match(html, /data-fixture-root/);
    assert.match(html, /data-proof-layout/);
    assert.match(html, /data-proof-ui-control/);
    assert.match(html, /data-proof-interaction/);
    assert.doesNotMatch(html, /https?:\/\//);
    assert.doesNotMatch(html, /<script/);
  }
});
