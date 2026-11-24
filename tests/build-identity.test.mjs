/**
 * @module tests/build-identity
 * Verify that the static studio artifact reports only installed packages.
 */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

import { writeStudioBuildIdentity } from "../scripts/record-build-identity.mjs";

test("records the installed studio identity without server runtime or private values", async () => {
  const output = join(tmpdir(), `ste-systems-build-${randomUUID()}.json`);
  const oldToken = process.env.TEST_PRIVATE_TOKEN;
  process.env.TEST_PRIVATE_TOKEN = "private-test-token-do-not-publish";
  try {
    const identity = await writeStudioBuildIdentity({
      root: resolve("."),
      output,
    });
    assert.deepEqual(JSON.parse(await readFile(output, "utf8")), identity);
    assert.equal(identity.consumerId, "ste-systems");
    assert.equal(identity.buildTarget, "static-studio");
    assert.equal(identity.packageInspection, "observed-unverified-release");
    assert.deepEqual(identity.runtimeEvidence, {
      mode: "not-applicable",
      status: "not-applicable",
    });
    assert.deepEqual(identity.providerEvidence, []);
    const packages = new Map(
      identity.packages.map((entry) => [entry.name, entry]),
    );
    assert.equal(packages.get("next").installedVersion, "16.4.6");
    assert.equal(
      packages.get("@sanderson-technology-enterprises/ste-usk-react")
        .installedVersion,
      "2.4.0",
    );
    assert.match(
      packages.get("ui-style-kit-css").packageSha256,
      /^[a-f0-9]{64}$/u,
    );
    for (const name of [
      "@sanderson-technology-enterprises/core",
      "@sanderson-technology-enterprises/payments",
      "@sanderson-technology-enterprises/workforce",
    ]) {
      assert.equal(packages.has(name), false);
    }
    assert.ok(
      !JSON.stringify(identity).includes("private-test-token-do-not-publish"),
    );
  } finally {
    await unlink(output).catch(() => {});
    if (oldToken === undefined) delete process.env.TEST_PRIVATE_TOKEN;
    else process.env.TEST_PRIVATE_TOKEN = oldToken;
  }
});

test("publishes the studio identity with the static export", async () => {
  const identity = JSON.parse(
    await readFile(resolve("out", "build-identity.json"), "utf8"),
  );
  assert.equal(identity.consumerId, "ste-systems");
  assert.equal(identity.buildTarget, "static-studio");
  assert.equal(identity.runtimeEvidence.status, "not-applicable");
});
