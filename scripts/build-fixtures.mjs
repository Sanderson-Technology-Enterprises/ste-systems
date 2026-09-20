import {
  copyFile,
  lstat,
  mkdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const modulePath = fileURLToPath(import.meta.url);
const repositoryRoot = path.resolve(path.dirname(modulePath), "..");
const defaultCatalogPath = path.join(
  repositoryRoot,
  "app",
  "data",
  "integration-fixtures.json",
);
const defaultGeneratedRoot = path.join(
  repositoryRoot,
  "public",
  "fixtures",
  "generated",
);

export const EXPECTED_PACKAGE_VERSIONS = Object.freeze({
  "interactive-surface-css": "1.7.0",
  "layout-style-css": "3.2.0",
  "ui-style-kit-css": "2.4.0",
});

export const FIXTURE_ASSETS = Object.freeze({
  "ui-visual": Object.freeze({
    export: "ui-style-kit-css/visual.css",
    target: "assets/ui-style-kit-css/2.4.0/ui-style-kit.visual.css",
  }),
  "ui-theme": Object.freeze({
    export: "ui-style-kit-css/interactive-surface-theme.css",
    target: "assets/ui-style-kit-css/2.4.0/interactive-surface-theme.css",
  }),
  "interaction-core": Object.freeze({
    export: "interactive-surface-css/state-core.css",
    target: "assets/interactive-surface-css/1.7.0/state-core.css",
  }),
  "interaction-standalone": Object.freeze({
    export: "interactive-surface-css/standalone-preset.css",
    target: "assets/interactive-surface-css/1.7.0/standalone-preset.css",
  }),
  "layout-core": Object.freeze({
    export: "layout-style-css",
    target: "assets/layout-style-css/3.2.0/layout-style-css.css",
  }),
});

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function validateAssetTargets(assets) {
  const targets = new Set();
  for (const [key, asset] of Object.entries(assets)) {
    if (
      typeof asset?.export !== "string" ||
      typeof asset?.target !== "string"
    ) {
      throw new Error(`Fixture asset "${key}" has an invalid definition.`);
    }
    const normalizedTarget = path.normalize(asset.target);
    if (
      path.isAbsolute(normalizedTarget) ||
      normalizedTarget === ".." ||
      normalizedTarget.startsWith(`..${path.sep}`)
    ) {
      throw new Error(`Fixture asset "${key}" has an unsafe target.`);
    }
    if (targets.has(normalizedTarget)) {
      throw new Error(`Duplicate fixture asset target: ${asset.target}`);
    }
    targets.add(normalizedTarget);
  }
}

export function validateFixtureCatalog(catalog, assets = FIXTURE_ASSETS) {
  if (!Array.isArray(catalog) || catalog.length === 0) {
    throw new Error("The fixture catalog must be a non-empty array.");
  }
  const ids = new Set();
  for (const fixture of catalog) {
    if (typeof fixture?.id !== "string" || fixture.id.length === 0) {
      throw new Error("Every fixture requires a non-empty id.");
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fixture.id)) {
      throw new Error(`Invalid fixture id: ${fixture.id}`);
    }
    if (ids.has(fixture.id)) {
      throw new Error(`Duplicate fixture id: ${fixture.id}`);
    }
    ids.add(fixture.id);
    for (const field of ["title", "summary"]) {
      if (
        typeof fixture[field] !== "string" ||
        fixture[field].trim().length === 0
      ) {
        throw new Error(
          `Fixture "${fixture.id}" requires a non-empty ${field}.`,
        );
      }
    }
    if (!Array.isArray(fixture.styles) || fixture.styles.length === 0) {
      throw new Error(`Fixture "${fixture.id}" requires at least one style.`);
    }
    for (const key of fixture.styles) {
      if (!Object.hasOwn(assets, key)) {
        throw new Error(
          `Unknown asset key "${key}" in fixture "${fixture.id}".`,
        );
      }
    }
  }
}

async function readInstalledVersions(expectedVersions) {
  const installed = {};
  for (const [packageName, expectedVersion] of Object.entries(
    expectedVersions,
  )) {
    let manifestPath;
    try {
      manifestPath = fileURLToPath(
        import.meta.resolve(`${packageName}/package.json`),
      );
    } catch (error) {
      throw new Error(
        `Unable to resolve package manifest for ${packageName}: ${error.message}`,
      );
    }
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    installed[packageName] = manifest.version;
    if (manifest.version !== expectedVersion) {
      throw new Error(
        `${packageName} version drift: expected ${expectedVersion}, found ${manifest.version}.`,
      );
    }
  }
  return installed;
}

async function resolveAssetSources(assets) {
  const resolved = {};
  for (const [key, asset] of Object.entries(assets)) {
    try {
      resolved[key] = fileURLToPath(import.meta.resolve(asset.export));
    } catch (error) {
      throw new Error(
        `Unable to resolve fixture export "${asset.export}" for asset "${key}": ${error.message}`,
      );
    }
  }
  await assertAssetSourcesExist(resolved);
  return resolved;
}

export async function assertAssetSourcesExist(sources) {
  for (const [key, source] of Object.entries(sources)) {
    try {
      const status = await lstat(source);
      if (!status.isFile()) {
        throw new Error("resolved path is not a regular file");
      }
    } catch (error) {
      throw new Error(
        `Fixture source "${key}" is not a regular file: ${source}. ${error.message}`,
      );
    }
  }
}

export async function assertSafeGeneratedPath(
  root = repositoryRoot,
  output = defaultGeneratedRoot,
) {
  const resolvedRoot = path.resolve(root);
  const resolvedOutput = path.resolve(output);
  const expectedRelative = path.join("public", "fixtures", "generated");
  const relative = path.relative(resolvedRoot, resolvedOutput);
  if (relative !== expectedRelative) {
    throw new Error(
      `Fixture output must resolve exactly to ${expectedRelative}; received ${relative || "."}.`,
    );
  }

  let component = resolvedRoot;
  for (const segment of ["public", "fixtures", "generated"]) {
    component = path.join(component, segment);
    try {
      const status = await lstat(component);
      if (status.isSymbolicLink()) {
        throw new Error(
          `Fixture output contains symbolic-link path component: ${segment}.`,
        );
      }
      if (!status.isDirectory()) {
        throw new Error(
          `Fixture output path component is not a directory: ${segment}.`,
        );
      }
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
  return resolvedOutput;
}

function fixtureMarkup(fixture, assets) {
  const stylesheetMarkup = fixture.styles
    .map(
      (key) =>
        `    <link rel="stylesheet" href="./${escapeHtml(
          assets[key].target.split(path.sep).join("/"),
        )}">`,
    )
    .join("\n");
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex,nofollow">
    <title>${escapeHtml(fixture.title)} | STE Systems integration proof</title>
${stylesheetMarkup}
  </head>
  <body
    class="ly-root"
    data-ly-layout="bento"
    data-ui="minimal-saas"
    data-theme="midnight-gold"
    data-mode="dark"
    data-fixture-id="${escapeHtml(fixture.id)}"
    data-fixture-root
  >
    <main class="ly-wrapper ly-section ly-stack ly-gap-6">
      <header class="ly-stack ly-gap-2">
        <p>Isolated package proof</p>
        <h1>${escapeHtml(fixture.title)}</h1>
        <p>${escapeHtml(fixture.summary)}</p>
      </header>
      <section class="ly-grid" data-proof-layout aria-label="Layout proof">
        <article class="ui-card ly-stack ly-gap-4" data-proof-paint>
          <h2 class="saas-heading">Shared semantic specimen</h2>
          <label class="ui-field" for="fixture-field">
            <span class="ui-label">Project name</span>
            <input class="ui-input" id="fixture-field" type="text" placeholder="Interface system">
          </label>
          <button class="ui-button" type="button" data-ui-variant="primary" data-proof-ui-control>
            UI-owned control
          </button>
        </article>
        <article class="ly-stack ly-gap-4">
          <h2>Interaction mechanics</h2>
          <div class="ly-cluster ly-gap-4">
            <button
              class="interactive-surface"
              type="button"
              data-surface-variant="primary"
              data-surface-level="2"
              data-proof-interaction
            >
              Interaction proof
            </button>
            <button
              class="interactive-surface"
              type="button"
              data-surface-variant="accent"
              data-surface-level="2"
              data-proof-pressed
              aria-pressed="true"
            >
              Pressed state
            </button>
          </div>
        </article>
      </section>
    </main>
  </body>
</html>
`;
}

export async function buildFixtures(options = {}) {
  const assets = options.assets ?? FIXTURE_ASSETS;
  const expectedVersions =
    options.expectedVersions ?? EXPECTED_PACKAGE_VERSIONS;
  const catalog =
    options.catalog ?? JSON.parse(await readFile(defaultCatalogPath, "utf8"));

  validateAssetTargets(assets);
  validateFixtureCatalog(catalog, assets);
  await readInstalledVersions(expectedVersions);
  const sourcePaths = await resolveAssetSources(assets);
  const generatedRoot = await assertSafeGeneratedPath();

  await rm(generatedRoot, { force: true, recursive: true });
  await mkdir(generatedRoot, { recursive: true });

  for (const [key, asset] of Object.entries(assets)) {
    const targetPath = path.join(generatedRoot, asset.target);
    await mkdir(path.dirname(targetPath), { recursive: true });
    await copyFile(sourcePaths[key], targetPath);
  }
  for (const fixture of catalog) {
    await writeFile(
      path.join(generatedRoot, `${fixture.id}.html`),
      fixtureMarkup(fixture, assets),
      "utf8",
    );
  }

  return { fixtureCount: catalog.length, generatedRoot };
}

if (process.argv[1] && path.resolve(process.argv[1]) === modulePath) {
  const result = await buildFixtures();
  console.log(
    `Generated ${result.fixtureCount} isolated integration fixtures.`,
  );
}
