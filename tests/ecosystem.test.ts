import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import uiManifest from "ui-style-kit-css/manifest.json";

import {
  ADOPTION_PATHS,
  BUNDLER_IMPORTS,
  CDN_LINKS,
  CDN_MARKUP,
  ECOSYSTEM_PACKAGES,
  NPM_INSTALL,
  UI_STYLE_KIT_INSTALL_SPEC,
  UI_STYLE_KIT_THEME_COMMIT,
} from "../app/data/ecosystem";
import {
  UI_SEMANTIC_CLASS_BY_SUFFIX,
  UI_SEMANTIC_COMPONENT_API,
} from "../app/data/catalog";
import {
  absoluteSiteAsset,
  buildVerificationMetadata,
  SITE,
  withBasePath,
} from "../app/lib/site";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));

function collectSourceFiles(roots: readonly string[]): string[] {
  const extensions = new Set([".css", ".js", ".mjs", ".ts", ".tsx"]);
  const files: string[] = [];

  const visit = (candidate: string) => {
    for (const entry of readdirSync(candidate, { withFileTypes: true })) {
      const entryPath = path.join(candidate, entry.name);
      if (entry.isDirectory()) {
        visit(entryPath);
      } else if (entry.isFile() && extensions.has(path.extname(entry.name))) {
        files.push(entryPath);
      }
    }
  };

  roots.forEach(visit);
  return files;
}

test("authored runtime sources do not use removed Layout v2 selectors", () => {
  const sourceFiles = collectSourceFiles([
    path.join(repositoryRoot, "app"),
    path.join(repositoryRoot, "scripts"),
  ]);
  const removed =
    /\bly-(?:grid--auto|panes--[23]|(?:md|lg)-[a-z0-9-]+|order-[a-z0-9-]+|pad-(?:1|3|5|7|9)|(?:px|py)-(?:4|6|8)|bleed)\b/u;

  for (const file of sourceFiles) {
    assert.doesNotMatch(
      readFileSync(file, "utf8"),
      removed,
      `${path.relative(repositoryRoot, file)} uses a removed Layout v2 selector`,
    );
  }
});

async function readShippingSources(directory: URL): Promise<string[]> {
  const sources: string[] = [];
  const supportedExtensions =
    /\.(?:json|md|mjs|ts|tsx|txt|webmanifest|xml|ya?ml)$/;

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === "generated") continue;
    const entryUrl = new URL(
      `${encodeURIComponent(entry.name)}${entry.isDirectory() ? "/" : ""}`,
      directory,
    );

    if (entry.isDirectory()) {
      sources.push(...(await readShippingSources(entryUrl)));
    } else if (supportedExtensions.test(entry.name)) {
      sources.push(await readFile(entryUrl, "utf8"));
    }
  }

  return sources;
}

const expectedNames = [
  "layout-style-css",
  "ui-style-kit-css",
  "interactive-surface-css",
];

test("registry exposes every package and resource in ecosystem order", () => {
  assert.deepEqual(
    ECOSYSTEM_PACKAGES.map(({ name }) => name),
    expectedNames,
  );
  assert.deepEqual(
    ECOSYSTEM_PACKAGES.map(({ version }) => version),
    ["3.2.0", "2.4.0", "1.7.0"],
  );
  assert.equal(ECOSYSTEM_PACKAGES[0]?.version, "3.2.0");
  assert.equal(ECOSYSTEM_PACKAGES[2]?.version, "1.7.0");
  assert.equal(
    ECOSYSTEM_PACKAGES.find(({ name }) => name === "layout-style-css")
      ?.attribute,
    'data-ly-layout="bento"',
  );

  for (const pkg of ECOSYSTEM_PACKAGES) {
    assert.deepEqual(Object.keys(pkg.links), [
      "repository",
      "wiki",
      "npm",
      "demo",
    ]);
    for (const url of Object.values(pkg.links)) {
      assert.match(url, /^https:\/\//);
    }
  }
});

test("the pinned UI manifest publishes the stable semantic component contract", () => {
  const selectors = Object.values(
    UI_SEMANTIC_COMPONENT_API.selectorsByRole,
  ).flat();

  assert.equal((uiManifest as { readonly version: string }).version, "2.4.0");
  assert.equal(selectors.length, 29);
  assert.deepEqual(
    selectors.map(({ selector }) => selector),
    [
      ".ui-button",
      ".ui-icon-button",
      ".ui-card",
      ".ui-field",
      ".ui-label",
      ".ui-help-text",
      ".ui-input",
      ".ui-select",
      ".ui-textarea",
      ".ui-check",
      ".ui-check-control",
      ".ui-radio",
      ".ui-radio-control",
      ".ui-switch",
      ".ui-switch-track",
      ".ui-switch-thumb",
      ".ui-badge",
      ".ui-alert",
      ".ui-alert-title",
      ".ui-alert-body",
      ".ui-nav",
      ".ui-nav-link",
      ".ui-table",
      ".ui-table-wrap",
      ".ui-progress",
      ".ui-progress-bar",
      ".ui-toolbar",
      ".ui-spinner",
      ".ui-tooltip",
    ],
  );
  assert.equal(
    UI_SEMANTIC_COMPONENT_API.variantAttribute.name,
    "data-ui-variant",
  );
  assert.deepEqual(
    UI_SEMANTIC_COMPONENT_API.variantAttribute.valuesBySelector,
    {
      ".ui-button": ["primary", "secondary", "warning", "danger", "ghost"],
      ".ui-badge": ["primary", "secondary", "success", "warning", "danger"],
      ".ui-alert": ["success", "warning", "danger"],
    },
  );
  assert.equal(UI_SEMANTIC_CLASS_BY_SUFFIX.card, "ui-card");
  assert.equal(UI_SEMANTIC_CLASS_BY_SUFFIX.button, "ui-button");
});

test("installation examples pin approved versions and cascade order", () => {
  const uiStyleKitCdnRoot = `https://cdn.jsdelivr.net/gh/Foscat/ui-style-kit-css@${UI_STYLE_KIT_THEME_COMMIT}`;

  assert.equal(
    NPM_INSTALL,
    `npm install ui-style-kit-css@${UI_STYLE_KIT_INSTALL_SPEC} layout-style-css@3.2.0 interactive-surface-css@1.7.0`,
  );
  assert.deepEqual(BUNDLER_IMPORTS, [
    'import "ui-style-kit-css/visual.css";',
    'import "ui-style-kit-css/interactive-surface-theme.css";',
    'import "interactive-surface-css/state-core.css";',
    'import "layout-style-css";',
  ]);
  assert.deepEqual(CDN_LINKS, [
    {
      packageName: "ui-style-kit-css",
      kind: "style",
      href: `${uiStyleKitCdnRoot}/dist/ui-style-kit.visual.min.css`,
    },
    {
      packageName: "ui-style-kit-css",
      kind: "style",
      href: `${uiStyleKitCdnRoot}/styles/interactive-surface-theme.css`,
    },
    {
      packageName: "interactive-surface-css",
      kind: "style",
      href: "https://cdn.jsdelivr.net/npm/interactive-surface-css@1.7.0/state-core.css",
    },
    {
      packageName: "layout-style-css",
      kind: "style",
      href: "https://cdn.jsdelivr.net/npm/layout-style-css@3.2.0/dist/layout-style-css.min.css",
    },
  ]);
  assert.equal(
    CDN_MARKUP,
    [
      `<link rel="stylesheet" href="${uiStyleKitCdnRoot}/dist/ui-style-kit.visual.min.css">`,
      `<link rel="stylesheet" href="${uiStyleKitCdnRoot}/styles/interactive-surface-theme.css">`,
      '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/interactive-surface-css@1.7.0/state-core.css">',
      '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/layout-style-css@3.2.0/dist/layout-style-css.min.css">',
    ].join("\n"),
  );
});

test("adoption paths cover every standalone, pair, and complete-stack fixture", () => {
  assert.deepEqual(
    ADOPTION_PATHS.map(({ id }) => id),
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
  assert.equal(
    (ADOPTION_PATHS as readonly { id: string }[]).some(
      ({ id }) => id === "all-legacy",
    ),
    false,
  );
  assert.deepEqual(
    ADOPTION_PATHS.reduce<Record<string, number>>((counts, path) => {
      counts[path.scope] = (counts[path.scope] ?? 0) + 1;
      return counts;
    }, {}),
    { one: 3, pair: 3, all: 1 },
  );

  const uiStyleKitCdnRoot = `https://cdn.jsdelivr.net/gh/Foscat/ui-style-kit-css@${UI_STYLE_KIT_THEME_COMMIT}`;
  const uiVisualCdn = `<link rel="stylesheet" href="${uiStyleKitCdnRoot}/dist/ui-style-kit.visual.min.css">`;
  const uiThemeCdn = `<link rel="stylesheet" href="${uiStyleKitCdnRoot}/styles/interactive-surface-theme.css">`;
  const interactionCoreCdn =
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/interactive-surface-css@1.7.0/state-core.css">';
  const interactionStandaloneCdn =
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/interactive-surface-css@1.7.0/standalone-preset.css">';
  const layoutCdn =
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/layout-style-css@3.2.0/dist/layout-style-css.min.css">';
  const expectedMatrix = {
    "layout-only": {
      packages: ["layout-style-css"],
      snippets: [
        "npm install layout-style-css@3.2.0",
        'import "layout-style-css";',
        layoutCdn,
      ],
    },
    "ui-only": {
      packages: ["ui-style-kit-css"],
      snippets: [
        `npm install ui-style-kit-css@${UI_STYLE_KIT_INSTALL_SPEC}`,
        'import "ui-style-kit-css/visual.css";',
        uiVisualCdn,
      ],
    },
    "interactive-only": {
      packages: ["interactive-surface-css"],
      snippets: [
        "npm install interactive-surface-css@1.7.0",
        'import "interactive-surface-css/standalone-preset.css";',
        interactionStandaloneCdn,
      ],
    },
    "layout-ui": {
      packages: ["layout-style-css", "ui-style-kit-css"],
      snippets: [
        `npm install layout-style-css@3.2.0 ui-style-kit-css@${UI_STYLE_KIT_INSTALL_SPEC}`,
        [
          'import "ui-style-kit-css/visual.css";',
          'import "layout-style-css";',
        ].join("\n"),
        [uiVisualCdn, layoutCdn].join("\n"),
      ],
    },
    "layout-interactive": {
      packages: ["layout-style-css", "interactive-surface-css"],
      snippets: [
        "npm install layout-style-css@3.2.0 interactive-surface-css@1.7.0",
        [
          'import "interactive-surface-css/standalone-preset.css";',
          'import "layout-style-css";',
        ].join("\n"),
        [interactionStandaloneCdn, layoutCdn].join("\n"),
      ],
    },
    "ui-interactive": {
      packages: ["ui-style-kit-css", "interactive-surface-css"],
      snippets: [
        `npm install ui-style-kit-css@${UI_STYLE_KIT_INSTALL_SPEC} interactive-surface-css@1.7.0`,
        [
          'import "ui-style-kit-css/visual.css";',
          'import "ui-style-kit-css/interactive-surface-theme.css";',
          'import "interactive-surface-css/state-core.css";',
        ].join("\n"),
        [uiVisualCdn, uiThemeCdn, interactionCoreCdn].join("\n"),
      ],
    },
    "all-canonical": {
      packages: [
        "layout-style-css",
        "ui-style-kit-css",
        "interactive-surface-css",
      ],
      snippets: [NPM_INSTALL, BUNDLER_IMPORTS.join("\n"), CDN_MARKUP],
    },
  } as const;

  for (const path of ADOPTION_PATHS) {
    const expected = expectedMatrix[path.id];
    assert.deepEqual(path.packages, expected.packages, path.id);
    assert.deepEqual(
      path.snippets.map(({ format }) => format),
      ["npm", "bundler", "cdn"],
      path.id,
    );
    assert.deepEqual(
      path.snippets.map(({ code }) => code),
      expected.snippets,
      path.id,
    );
    for (const snippet of path.snippets) {
      assert.doesNotMatch(snippet.code, /\blatest\b/i, path.id);
    }
    for (const packageName of path.packages) {
      const packageVersion = ECOSYSTEM_PACKAGES.find(
        (candidate) => candidate.name === packageName,
      )?.version;
      assert.ok(packageVersion, packageName);
      const installSpec =
        packageName === "ui-style-kit-css"
          ? UI_STYLE_KIT_INSTALL_SPEC
          : packageVersion;
      assert.ok(
        path.snippets[0].code.includes(`${packageName}@${installSpec}`),
        packageName,
      );
    }
  }
});

test("canonical adoption preserves each package's ownership boundary", () => {
  const canonical = ADOPTION_PATHS.find(({ id }) => id === "all-canonical");
  assert.ok(canonical);

  assert.equal(canonical.deprecated, false);
  assert.equal(canonical.snippets[0].title, "Install all three");
  assert.equal(canonical.snippets[1].code, BUNDLER_IMPORTS.join("\n"));
  assert.equal(canonical.snippets[2].code, CDN_MARKUP);

  const supersededImports =
    /with-bridge|interactive-surface\.css|integrations\/ui-style-kit|legacy\.css|data-layout/;
  for (const path of ADOPTION_PATHS) {
    assert.doesNotMatch(
      path.snippets.map(({ code }) => code).join("\n"),
      supersededImports,
      path.id,
    );
  }
});

test("package directory exposes independent entrypoints and fixture anchors", () => {
  assert.deepEqual(
    ECOSYSTEM_PACKAGES.map(({ name, recommendedEntryPoint, fixture }) => ({
      fixture,
      name,
      recommendedEntryPoint,
    })),
    [
      {
        fixture: "layout-only",
        name: "layout-style-css",
        recommendedEntryPoint: "layout-style-css",
      },
      {
        fixture: "ui-only",
        name: "ui-style-kit-css",
        recommendedEntryPoint: "ui-style-kit-css/visual.css",
      },
      {
        fixture: "interactive-only",
        name: "interactive-surface-css",
        recommendedEntryPoint: "interactive-surface-css/standalone-preset.css",
      },
    ],
  );
});

test("site consumes the CSS libraries as local dependencies", async () => {
  const [manifestSource, layoutSource] = await Promise.all([
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);
  const manifest = JSON.parse(manifestSource) as {
    dependencies: Record<string, string>;
    scripts: Record<string, string>;
  };

  assert.equal(manifest.dependencies["layout-style-css"], "3.2.0");
  assert.equal(
    manifest.dependencies["ui-style-kit-css"],
    UI_STYLE_KIT_INSTALL_SPEC,
  );
  assert.equal(manifest.dependencies["interactive-surface-css"], "1.7.0");
  assert.match(
    layoutSource,
    /import "ui-style-kit-css\/visual\.css";[\s\S]*import "ui-style-kit-css\/interactive-surface-theme\.css";[\s\S]*import "interactive-surface-css\/state-core\.css";[\s\S]*import "layout-style-css";/,
  );
  assert.doesNotMatch(
    layoutSource,
    /with-bridge|interactive-surface-css\/interactive-surface\.css|layout-style-css\/bridge\.css/,
  );
  assert.doesNotMatch(layoutSource, /CDN_LINKS\.map/);
  assert.match(manifest.scripts.quality, /npm run test:browser/);
});

test("local README guidance documents the global CSS entry points", async () => {
  const [readme, layoutSource] = await Promise.all([
    readFile(new URL("../README.md", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(
    readme,
    /Global CSS entry\s+points load from `app\/layout\.tsx`/,
  );
  assert.equal(ECOSYSTEM_PACKAGES.length, 3);
  assert.doesNotMatch(layoutSource, /custom-element runtime/);
});

test("page runtime emits only canonical Layout v3 attributes", async () => {
  const [homeSource, labSource, experienceSource, configurationSource] =
    await Promise.all([
      readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/lab/page.tsx", import.meta.url), "utf8"),
      readFile(
        new URL("../app/components/LabExperience.tsx", import.meta.url),
        "utf8",
      ),
      readFile(new URL("../app/lib/configuration.ts", import.meta.url), "utf8"),
    ]);
  const runtimeSource = `${homeSource}\n${labSource}\n${experienceSource}\n${configurationSource}`;

  assert.equal(
    runtimeSource.match(/\bdata-layout\b/g)?.length ?? 0,
    0,
    "the configuration runtime must not emit the deprecated data-layout attribute",
  );
  assert.doesNotMatch(homeSource, /<LabExperience>/);
  assert.match(labSource, /<LabExperience>/);
  assert.match(experienceSource, /data-ly-layout=\{configuration\.layout\}/);
  assert.match(
    configurationSource,
    /data-ly-layout="\$\{configuration\.layout\}"/,
  );
});

test("Layout 3.2 contexts replace application-owned spacing workarounds", async () => {
  const [
    homeSource,
    labPageSource,
    experienceSource,
    workbenchSource,
    layoutLabSource,
    shellStyles,
    responsiveStyles,
  ] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/lab/page.tsx", import.meta.url), "utf8"),
    readFile(
      new URL("../app/components/LabExperience.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../app/components/CombinedWorkbench.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../app/components/labs/LayoutLab.tsx", import.meta.url),
      "utf8",
    ),
    readFile(new URL("../app/styles/shell.css", import.meta.url), "utf8"),
    readFile(new URL("../app/styles/responsive.css", import.meta.url), "utf8"),
  ]);

  assert.match(homeSource, /data-ly-density="spacious"/);
  assert.match(experienceSource, /data-ly-density="normal"/);
  assert.match(
    labPageSource,
    /configuration-shell ly-wrapper ly-wrapper--workspace/,
  );
  assert.match(labPageSource, /data-ly-density="compact"/);
  assert.match(workbenchSource, /ly-wrapper ly-wrapper--workspace/);
  assert.match(workbenchSource, /data-ly-density="compact"/);
  assert.match(layoutLabSource, /"workspace"/);
  assert.match(layoutLabSource, /ly-scroll ly-scroll--bounded/);
  assert.match(layoutLabSource, /length: 10/);
  assert.doesNotMatch(shellStyles, /\.hero\s*\{[^}]*padding-block:/);
  assert.doesNotMatch(responsiveStyles, /--ly-cluster-gap/);
});

test("install guide tracks restartable copy timers and cleans them on unmount", async () => {
  const installGuideSource = await readFile(
    new URL("../app/components/InstallGuide.tsx", import.meta.url),
    "utf8",
  );

  assert.match(
    installGuideSource,
    /useRef<Map<SnippetId, number>>\(new Map\(\)\)/,
  );
  assert.match(
    installGuideSource,
    /copyTimeoutsRef\.current\.get\(id\)[\s\S]*window\.clearTimeout\(existingTimeout\)/,
  );
  assert.match(
    installGuideSource,
    /const copyTimeouts = copyTimeoutsRef\.current;[\s\S]*return \(\) => \{[\s\S]*copyTimeouts\.values\(\)[\s\S]*window\.clearTimeout\(timeoutId\)[\s\S]*copyTimeouts\.clear\(\)/,
  );
});

test("not-found primary action declares its documented surface level", async () => {
  const notFoundSource = await readFile(
    new URL("../app/not-found.tsx", import.meta.url),
    "utf8",
  );

  assert.match(
    notFoundSource,
    /data-surface-variant="primary"\s+data-surface-level="2"/,
  );
});

test("package manifest and repository omit the obsolete authoring stack", async () => {
  const manifestSource = await readFile(
    new URL("../package.json", import.meta.url),
    "utf8",
  );
  const manifest = JSON.parse(manifestSource) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const declaredDependencies = {
    ...manifest.dependencies,
    ...manifest.devDependencies,
  };

  assert.equal(declaredDependencies.tailwindcss, undefined);
  assert.equal(declaredDependencies["@tailwindcss/postcss"], undefined);
  assert.equal(declaredDependencies.postcss, undefined);
  await assert.rejects(access(new URL("../.npmrc", import.meta.url)), {
    code: "ENOENT",
  });
  await assert.rejects(
    access(new URL("../postcss.config.mjs", import.meta.url)),
    { code: "ENOENT" },
  );
  assert.doesNotMatch(manifestSource, /legacy-peer-deps/);
});

test("quality runs every source, fixture, export, and browser gate", async () => {
  const manifestSource = await readFile(
    new URL("../package.json", import.meta.url),
    "utf8",
  );
  const manifest = JSON.parse(manifestSource) as {
    scripts: Record<string, string>;
  };

  const requiredCommands = [
    "npm run format:check",
    "npm run lint",
    "npm run typecheck",
    "npm run test:unit",
    "npm run test:fixtures",
    "npm run test:dev-hydration",
    "npm run build:pages",
    "npm run test:export",
    "npm run test:browser",
  ];
  let previousCommandIndex = -1;
  for (const command of requiredCommands) {
    const commandIndex = manifest.scripts.quality.indexOf(
      command,
      previousCommandIndex + 1,
    );
    assert.ok(commandIndex > previousCommandIndex, command);
    previousCommandIndex = commandIndex;
  }
});

test("Pages workflow verifies the complete artifact before non-PR deployment", async () => {
  const workflow = await readFile(
    new URL("../.github/workflows/deploy-pages.yml", import.meta.url),
    "utf8",
  );

  assert.match(workflow, /^\s*run: npm ci\s*$/m);
  assert.doesNotMatch(workflow, /legacy-peer-deps/);
  assert.match(workflow, /^\s*run: npm run fixtures:build\s*$/m);
  assert.match(
    workflow,
    /^\s*run: npx playwright install --with-deps chromium firefox webkit\s*$/m,
  );
  assert.match(workflow, /^\s*path: out\s*$/m);
  assert.match(
    workflow,
    /- name: Upload verified Pages artifact\s+if: github\.event_name != 'pull_request' && github\.ref == 'refs\/heads\/main'[\s\S]*?path: out/,
  );
  assert.match(
    workflow,
    /deploy:\s+name: Deploy GitHub Pages\s+if: github\.event_name != 'pull_request' && github\.ref == 'refs\/heads\/main'\s+needs: verify/,
  );
  assert.match(
    workflow,
    /concurrency:\s+group: \$\{\{ github\.event_name == 'pull_request' && format\('verify-pr-\{0\}', github\.event\.pull_request\.number\) \|\| 'pages' \}\}\s+cancel-in-progress: true/,
  );
  const mainDeploymentGuard =
    "if: github.event_name != 'pull_request' && github.ref == 'refs/heads/main'";
  assert.equal(workflow.split(mainDeploymentGuard).length - 1, 2);
  const verifyTimeout = Number(
    workflow.match(/verify:[\s\S]*?timeout-minutes:\s*(\d+)/)?.[1],
  );
  assert.ok(verifyTimeout >= 30, `verify timeout was ${verifyTimeout}`);

  const fixtureStep = workflow.indexOf("run: npm run fixtures:build");
  const browserStep = workflow.indexOf(
    "run: npx playwright install --with-deps chromium firefox webkit",
  );
  const qualityStep = workflow.indexOf("run: npm run quality");
  assert.ok(fixtureStep >= 0);
  assert.ok(browserStep > fixtureStep);
  assert.ok(qualityStep > browserStep);
});

test("Playwright keeps exhaustive Chromium and tagged cross-engine projects", async () => {
  const config = (await import("../playwright.config")).default;
  const projects = config.projects ?? [];
  const byName = new Map(projects.map((project) => [project.name, project]));
  assert.equal(projects.length, 4);

  for (const project of [
    "desktop-chromium",
    "mobile-chromium",
    "desktop-firefox",
    "desktop-webkit",
  ]) {
    assert.ok(byName.has(project), project);
  }
  for (const project of ["desktop-chromium", "mobile-chromium"]) {
    assert.equal(byName.get(project)?.grep, undefined, `${project} grep`);
  }
  for (const project of projects) {
    assert.equal(project.grepInvert, undefined, `${project.name} grepInvert`);
  }
  for (const [project, browser] of [
    ["desktop-chromium", "chromium"],
    ["mobile-chromium", "chromium"],
    ["desktop-firefox", "firefox"],
    ["desktop-webkit", "webkit"],
  ] as const) {
    assert.equal(byName.get(project)?.use?.defaultBrowserType, browser);
  }
  for (const project of ["desktop-firefox", "desktop-webkit"]) {
    assert.equal(String(byName.get(project)?.grep), "/@cross-engine/");
  }
});

test("catalog exposes every released ecosystem option", async () => {
  const {
    INTERACTION_LEVELS,
    INTERACTION_VARIANTS,
    LAYOUT_PERSONALITIES,
    LAYOUT_RECIPES,
    UI_MODES,
    UI_PRESETS,
    UI_THEMES,
    getUiPrefix,
  } = await import("../app/data/catalog");

  assert.deepEqual(LAYOUT_PERSONALITIES, [
    "minimal-saas",
    "bauhaus",
    "tactile",
    "cyberpunk",
    "f-pattern",
    "brutalism",
    "neumorphism",
    "y2k",
    "retro-glass",
    "z-pattern",
    "retrofuturism",
    "mondrian",
    "synthwave",
    "bento",
    "maximalist",
    "split-screen",
    "technical-blueprint",
    "data-terminal",
    "industrial-hmi",
    "editorial",
  ]);
  assert.deepEqual(LAYOUT_RECIPES, [
    "app-shell",
    "dashboard",
    "docs",
    "list-detail",
    "split-hero",
    "gallery",
    "card-grid",
  ]);
  assert.deepEqual(UI_PRESETS, [
    { id: "minimal-saas", label: "Minimal SaaS", prefix: "saas" },
    { id: "bento", label: "Bento UI", prefix: "bento" },
    { id: "maximalist", label: "Maximalist / Playful", prefix: "max" },
    { id: "bauhaus", label: "Bauhaus / Swiss Modern", prefix: "bau" },
    { id: "tactile", label: "Skeuomorphic / Tactile", prefix: "tactile" },
    { id: "neumorphism", label: "Neumorphism", prefix: "neo" },
    { id: "retrofuturism", label: "Retrofuturism", prefix: "retro" },
    { id: "brutalism", label: "Brutalism", prefix: "brutal" },
    { id: "cyberpunk", label: "Cyberpunk", prefix: "cyber" },
    { id: "y2k", label: "Y2K", prefix: "y2k" },
    { id: "retro-glass", label: "Retro Glass", prefix: "rg" },
    { id: "editorial-luxe", label: "Editorial Lux", prefix: "luxe" },
    { id: "organic-modern", label: "Organic Modern", prefix: "organic" },
    {
      id: "industrial-utility",
      label: "Industrial Utility",
      prefix: "utility",
    },
    {
      id: "technical-blueprint",
      label: "Technical Blueprint",
      prefix: "blueprint",
    },
    { id: "art-deco", label: "Art Deco", prefix: "deco" },
    { id: "clay", label: "Clay", prefix: "clay" },
    { id: "data-terminal", label: "Data Terminal", prefix: "terminal" },
    { id: "paper-editorial", label: "Paper Editorial", prefix: "paper" },
    { id: "neo-noir", label: "Neo-Noir", prefix: "noir" },
  ]);
  assert.deepEqual(UI_THEMES, [
    "midnight-gold",
    "ocean-steel",
    "forest-moss",
    "sunset-ember",
    "royal-plum",
    "graphite-cyan",
    "desert-sage",
    "rose-quartz",
    "cyber-lime",
    "arctic-indigo",
    "chrome-navy",
    "recycled-emerald",
    "industrial-orange",
    "performance-red",
    "heritage-brass",
    "service-blue-red",
    "newsprint-crimson",
    "foundry-amber",
    "soft-orchid",
    "electric-noir",
    "signal-yellow",
    "botanical-green",
    "cobalt-electric",
    "stone-graphite",
    "walnut-clay",
  ]);
  assert.deepEqual(UI_MODES, ["light", "dark", "contrast"]);
  assert.deepEqual(INTERACTION_VARIANTS, [
    "primary",
    "secondary",
    "accent",
    "subtle",
    "warning",
    "danger",
  ]);
  assert.deepEqual(INTERACTION_LEVELS, [1, 2, 3]);
  assert.equal(getUiPrefix("minimal-saas"), "saas");
  assert.equal(getUiPrefix("retro-glass"), "rg");
  assert.equal(getUiPrefix("neo-noir"), "noir");
  assert.throws(
    () => getUiPrefix("unknown" as never),
    /Unknown UI preset: unknown/,
  );
});

test("UI catalog values are derived from the published manifest", async () => {
  const [{ UI_MODES, UI_PRESETS, UI_THEMES }, manifestSource] =
    await Promise.all([
      import("../app/data/catalog"),
      readFile(
        new URL(
          "../node_modules/ui-style-kit-css/manifest.json",
          import.meta.url,
        ),
        "utf8",
      ),
    ]);
  const manifest = JSON.parse(manifestSource) as {
    presets: Array<{ id: string; label: string; prefix: string }>;
    themes: string[];
    modes: string[];
  };

  assert.deepEqual(
    UI_PRESETS,
    manifest.presets.map(({ id, label, prefix }) => ({ id, label, prefix })),
  );
  assert.deepEqual(UI_THEMES, manifest.themes);
  assert.deepEqual(UI_MODES, manifest.modes);
});

test("documented package versions match the pinned CDN URLs", () => {
  for (const pkg of ECOSYSTEM_PACKAGES) {
    const cdn = CDN_LINKS.filter(({ packageName }) => packageName === pkg.name);

    assert.notEqual(cdn.length, 0);
    for (const { href } of cdn) {
      const expectedPin =
        pkg.name === "ui-style-kit-css"
          ? `${pkg.name}@${UI_STYLE_KIT_THEME_COMMIT}`
          : `${pkg.name}@${pkg.version}`;
      assert.ok(href.includes(expectedPin), pkg.name);
    }
  }
});

test("site identity targets the transferred organization", () => {
  const site = SITE as unknown as {
    basePath: string;
    brandLogo: string;
    brandLogoPath: string;
    origin: string;
    owner: {
      description: string;
      github: string;
      image: string;
      legalName: string;
      logo: string;
      name: string;
      organizationId: string;
      slogan: string;
      title: string;
      url: string;
    };
    repository: string;
    socialImage: string;
    socialImageAlt: string;
    url: string;
  };

  assert.equal(site.basePath, "");
  assert.equal(site.origin, "https://stesystems.com");
  assert.equal(site.url, "https://stesystems.com/");
  assert.equal(
    site.repository,
    "https://github.com/Sanderson-Technology-Enterprises/ste-systems",
  );
  assert.equal(
    site.socialImage,
    "https://stesystems.com/ste-systems-social-preview.png",
  );
  assert.equal(
    site.socialImageAlt,
    "STE Systems social preview with the text \u201c3 libraries, 1 interface, and 218,400 possibilities\u201d over layout, identity, and interaction.",
  );
  assert.equal(site.brandLogoPath, "ste-systems-logo.png");
  assert.equal(site.brandLogo, "https://stesystems.com/ste-systems-logo.png");
  const requiredOwnerIdentity = {
    name: "Sanderson Technology Enterprises",
    legalName: "Sanderson Technology Enterprises LLC",
    title: "Sanderson Technology Enterprises | Strategic Platform Development",
    slogan: "Strategic Platform Development",
    url: "https://sandersontechnologyenterprises.com/",
    github: "https://github.com/Sanderson-Technology-Enterprises",
    organizationId: "https://sandersontechnologyenterprises.com/#organization",
    logo: "https://sandersontechnologyenterprises.com/assets/icon-512.png",
    image:
      "https://sandersontechnologyenterprises.com/assets/social-preview.png",
    description:
      "Software studio building creator-owned web platforms, private content systems, admin dashboards, and operational workflows for specialized businesses.",
  } as const;
  for (const [key, value] of Object.entries(requiredOwnerIdentity)) {
    assert.equal(site.owner[key as keyof typeof site.owner], value, key);
  }
});

test("asset helpers distinguish explicit Pages paths from canonical URLs", () => {
  assert.equal(withBasePath("/favicon.ico", ""), "/favicon.ico");
  assert.equal(withBasePath("/favicon.ico", "   "), "/favicon.ico");
  assert.equal(
    withBasePath("favicon.ico", "/ste-systems"),
    "/ste-systems/favicon.ico",
  );
  assert.equal(withBasePath("/", "/ste-systems/"), "/ste-systems/");
  assert.equal(
    absoluteSiteAsset("/favicon.ico"),
    "https://stesystems.com/favicon.ico",
  );

  const mutableEnvironment = process.env as Record<string, string | undefined>;
  const originalNodeEnvironment = mutableEnvironment.NODE_ENV;
  const originalPagesBasePath = mutableEnvironment.PAGES_BASE_PATH;
  try {
    mutableEnvironment.NODE_ENV = "production";
    delete mutableEnvironment.PAGES_BASE_PATH;
    assert.equal(withBasePath("/favicon.ico"), "/favicon.ico");
  } finally {
    if (originalNodeEnvironment === undefined)
      delete mutableEnvironment.NODE_ENV;
    else mutableEnvironment.NODE_ENV = originalNodeEnvironment;
    if (originalPagesBasePath === undefined)
      delete mutableEnvironment.PAGES_BASE_PATH;
    else mutableEnvironment.PAGES_BASE_PATH = originalPagesBasePath;
  }
});

test("verification metadata includes only trimmed non-empty values", () => {
  assert.equal(buildVerificationMetadata({}), undefined);
  assert.equal(
    buildVerificationMetadata({
      BING_SITE_VERIFICATION: "  ",
      GOOGLE_SITE_VERIFICATION: "\t",
    }),
    undefined,
  );
  assert.deepEqual(
    buildVerificationMetadata({ GOOGLE_SITE_VERIFICATION: " google-token " }),
    { google: "google-token" },
  );
  assert.deepEqual(
    buildVerificationMetadata({ BING_SITE_VERIFICATION: " bing-token " }),
    { other: { "msvalidate.01": "bing-token" } },
  );
  assert.deepEqual(
    buildVerificationMetadata({
      BING_SITE_VERIFICATION: "bing-token",
      GOOGLE_SITE_VERIFICATION: "google-token",
    }),
    {
      google: "google-token",
      other: { "msvalidate.01": "bing-token" },
    },
  );
});

test("active shipping surfaces omit superseded lab identities", async () => {
  const sources = (
    await Promise.all(
      ["../app/", "../scripts/", "../.github/", "../public/"].map(
        (relativePath) =>
          readShippingSources(new URL(relativePath, import.meta.url)),
      ),
    )
  ).flat();
  sources.push(
    await readFile(new URL("../README.md", import.meta.url), "utf8"),
  );
  const shippingSource = sources.join("\n");
  const staleSite = shippingSource.match(
    /https:\/\/foscat\.github\.io\/interface-systems-lab\/?/i,
  );
  const staleRepository = shippingSource.match(
    /https:\/\/github\.com\/Foscat\/interface-systems-lab\/?/i,
  );
  const staleTransferredSite = shippingSource.match(
    /https:\/\/sanderson-technology-enterprises\.github\.io\/interface-systems-lab\/?/i,
  );
  const staleTransferredRepository = shippingSource.match(
    /https:\/\/github\.com\/Sanderson-Technology-Enterprises\/interface-systems-lab\/?/i,
  );

  assert.equal(
    staleSite?.[0] ?? null,
    null,
    `stale lab site: ${staleSite?.[0]}`,
  );
  assert.equal(
    staleRepository?.[0] ?? null,
    null,
    `stale lab repository: ${staleRepository?.[0]}`,
  );
  assert.equal(
    staleTransferredSite?.[0] ?? null,
    null,
    `stale transferred site: ${staleTransferredSite?.[0]}`,
  );
  assert.equal(
    staleTransferredRepository?.[0] ?? null,
    null,
    `stale transferred repository: ${staleTransferredRepository?.[0]}`,
  );
});

test("search verification examples remain empty and server-owned", async () => {
  const exampleUrl = new URL("../.env.example", import.meta.url);
  let example = "";
  try {
    example = await readFile(exampleUrl, "utf8");
  } catch {
    assert.fail(".env.example must document optional verification variables");
  }
  const layoutSource = await readFile(
    new URL("../app/layout.tsx", import.meta.url),
    "utf8",
  );
  const declarations = Object.fromEntries(
    example
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => line.split("=", 2)),
  );

  assert.deepEqual(declarations, {
    GOOGLE_SITE_VERIFICATION: "",
    BING_SITE_VERIFICATION: "",
  });
  assert.match(layoutSource, /buildVerificationMetadata\(process\.env\)/);
  assert.doesNotMatch(layoutSource, /NEXT_PUBLIC_.*SITE_VERIFICATION/);
});

test("metadata routes opt into static generation for the exported site", async () => {
  const routes = await Promise.all(
    ["robots.ts", "sitemap.ts", "manifest.ts"].map((fileName) =>
      readFile(new URL(`../app/${fileName}`, import.meta.url), "utf8"),
    ),
  );

  for (const route of routes) {
    assert.match(route, /export const dynamic = "force-static";/);
  }
});

test("page components expose approved observatory and resource landmarks", async () => {
  const [
    homePage,
    labPage,
    observatory,
    installGuide,
    directory,
    layoutLab,
    siteHeader,
    siteFooter,
  ] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/lab/page.tsx", import.meta.url), "utf8"),
    readFile(
      new URL("../app/components/InterfaceObservatory.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../app/components/InstallGuide.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../app/components/LibraryDirectory.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../app/components/labs/LayoutLab.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../app/components/SiteHeader.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../app/components/SiteFooter.tsx", import.meta.url),
      "utf8",
    ),
  ]);

  assert.match(observatory, /Interface Observatory/);
  assert.doesNotMatch(observatory, /signal-bars/);
  assert.match(installGuide, /Install one package or the complete stack/);
  assert.match(directory, /Package resources/);
  assert.match(layoutLab, /Test responsive layout recipes/);
  assert.match(layoutLab, /data-ly-recipe="dashboard"/);
  assert.doesNotMatch(homePage, /<LabExperience>/);
  assert.match(homePage, /<FeatureShowcase/);
  assert.match(labPage, /<LabExperience>/);
  assert.doesNotMatch(homePage, /^"use client";/);
  assert.match(siteHeader, /brand-logo/);
  assert.match(siteHeader, /SITE\.productLine/);
  assert.match(siteHeader, /SITE\.brandLogoPath/);
  assert.match(siteFooter, /SITE\.brandLogoPath/);
  assert.doesNotMatch(observatory, />\s*Inspect\s*</);
});

test("Task 3 sources omit dormant local hooks and keep FeatureShowcase static", async () => {
  const [page, siteFooter, layoutLab, featureShowcase] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(
      new URL("../app/components/SiteFooter.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../app/components/labs/LayoutLab.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../app/components/FeatureShowcase.tsx", import.meta.url),
      "utf8",
    ),
  ]);

  const taskSources = [page, siteFooter, layoutLab].join("\n");
  const staticClassTokens = Array.from(
    taskSources.matchAll(/className="([^"]*)"/g),
    (match) => match[1]?.split(/\s+/) ?? [],
  ).flat();
  for (const className of [
    "capability-runway",
    "capability-preview",
    "company-conversion",
    "footer-actions",
    "layout-lab",
    "recipe-container",
    "wrapper-inventory",
  ]) {
    assert.equal(
      staticClassTokens.includes(className),
      false,
      `${className} should not survive as an unused local hook`,
    );
  }

  assert.doesNotMatch(featureShowcase, /^"use client";/);
  assert.doesNotMatch(
    featureShowcase,
    /getUiPrefix|useLabConfiguration|LabExperience/,
  );
  assert.doesNotMatch(featureShowcase, /ly-wrapper--xl/);
  assert.match(featureShowcase, /interactive-surface site-action/);
});

test("local CSS owns the observatory without retaining the audio meter", async () => {
  const [observatoryCss, responsiveCss, globalCss] = await Promise.all([
    readFile(new URL("../app/styles/observatory.css", import.meta.url), "utf8"),
    readFile(new URL("../app/styles/responsive.css", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(observatoryCss, /\.observatory-stage/);
  assert.match(observatoryCss, /@keyframes orbit/);
  assert.doesNotMatch(observatoryCss, /\.signal-bars/);
  assert.match(responsiveCss, /prefers-reduced-motion/);
  assert.doesNotMatch(globalCss, /observatory/);
});
