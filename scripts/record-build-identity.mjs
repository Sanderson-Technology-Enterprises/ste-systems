/**
 * @module scripts/record-build-identity
 * @description Record installed package identity for the exported STE Systems studio.
 * This static receipt does not assert a server runtime or an admitted release.
 */
import { createHash } from "node:crypto";
import { readFile, realpath, writeFile } from "node:fs/promises";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const DESIGN_PACKAGES = new Set([
  "interactive-surface-css",
  "layout-style-css",
  "ui-style-kit-css",
  "ui-style-kit-icons",
]);

/**
 * @description Select the framework and declared design packages used by the studio export.
 * @param {object} manifest Application package manifest.
 * @returns {string[]} Stable package names for this build identity.
 */
function selectedPackages(manifest) {
  return Object.keys({ ...manifest.dependencies, ...manifest.devDependencies })
    .filter(
      (name) =>
        name === "next" ||
        name.startsWith("@sanderson-technology-enterprises/") ||
        DESIGN_PACKAGES.has(name),
    )
    .sort();
}

/**
 * @description Require an installed package path to remain inside its node_modules directory.
 * @param {string} parent Resolved parent directory.
 * @param {string} child Resolved package or manifest path.
 * @returns {boolean} Whether the child remains within the parent.
 */
function inside(parent, child) {
  const path = relative(parent, child);
  return (
    path !== "" &&
    path !== ".." &&
    !path.startsWith(`..${sep}`) &&
    !isAbsolute(path)
  );
}

/**
 * @description Hash the installed manifest bytes without importing package code.
 * @param {string} path Resolved package manifest path.
 * @returns {Promise<string>} Lowercase SHA-256 digest.
 */
async function sha256(path) {
  return createHash("sha256")
    .update(await readFile(path))
    .digest("hex");
}

/**
 * @description Inspect build-installed package identities for the static studio.
 * @param {object} [options] Checkout and observation time.
 * @param {string} [options.root] Studio checkout after dependency installation.
 * @param {string} [options.observedAt] Build observation time in UTC.
 * @returns {Promise<object>} Public identity with no runtime or provider claim.
 */
export async function collectStudioBuildIdentity({
  root = ROOT,
  observedAt = new Date().toISOString(),
} = {}) {
  if (!Number.isFinite(Date.parse(observedAt)))
    throw Error("Invalid build observation time.");
  const checkout = await realpath(resolve(root));
  const nodeModules = await realpath(join(checkout, "node_modules"));
  const manifest = JSON.parse(
    await readFile(join(checkout, "package.json"), "utf8"),
  );
  const lock = JSON.parse(
    await readFile(join(checkout, "package-lock.json"), "utf8"),
  );
  if (
    manifest.name !== "ste-systems" ||
    lock.packages?.[""]?.name !== manifest.name ||
    lock.packages[""].version !== manifest.version
  )
    throw Error("The selected studio build root is invalid.");

  const declared = { ...manifest.dependencies, ...manifest.devDependencies };
  const packages = [];
  for (const name of selectedPackages(manifest)) {
    const requestedVersion = declared[name];
    const locked = lock.packages[`node_modules/${name}`];
    if (
      typeof requestedVersion !== "string" ||
      !/^\d+\.\d+\.\d+$/u.test(requestedVersion) ||
      locked?.version !== requestedVersion ||
      typeof locked.integrity !== "string" ||
      !locked.integrity.startsWith("sha512-")
    )
      throw Error(
        `The ${name} studio dependency is not pinned in the lockfile.`,
      );
    const packageRoot = await realpath(join(nodeModules, name));
    if (!inside(nodeModules, packageRoot))
      throw Error(`The ${name} studio dependency is outside node_modules.`);
    const packagePath = await realpath(join(packageRoot, "package.json"));
    if (!inside(packageRoot, packagePath))
      throw Error(`The ${name} manifest leaves its installed package.`);
    const installed = JSON.parse(await readFile(packagePath, "utf8"));
    if (installed.name !== name || installed.version !== locked.version)
      throw Error(`The installed ${name} identity differs from the lockfile.`);
    packages.push({
      name,
      requestedVersion,
      lockVersion: locked.version,
      installedVersion: installed.version,
      lockIntegrity: locked.integrity,
      packageSha256: await sha256(packagePath),
    });
  }
  if (packages.length === 0)
    throw Error("No installed studio packages were inspected.");
  return {
    schemaVersion: 1,
    consumerId: manifest.name,
    siteVersion: manifest.version,
    buildTarget: "static-studio",
    observedAt,
    packageInspection: "observed-unverified-release",
    packages,
    runtimeEvidence: { mode: "not-applicable", status: "not-applicable" },
    providerEvidence: [],
  };
}

/**
 * @description Write the identity beside the finished Next.js static export.
 * @param {object} [options] Checkout and output file.
 * @param {string} [options.root] Studio checkout.
 * @param {string} [options.output] Generated JSON destination.
 * @returns {Promise<object>} The identity written to the static artifact.
 */
export async function writeStudioBuildIdentity({ root = ROOT, output } = {}) {
  const checkout = await realpath(resolve(root));
  const identity = await collectStudioBuildIdentity({ root: checkout });
  await writeFile(
    output ?? join(checkout, "out", "build-identity.json"),
    `${JSON.stringify(identity, null, 2)}\n`,
    "utf8",
  );
  return identity;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    await writeStudioBuildIdentity();
    console.log("Installed studio build identity recorded.");
  } catch {
    console.error("Studio build identity could not verify installed packages.");
    process.exitCode = 1;
  }
}
