export type ResourceLink = "repository" | "wiki" | "npm" | "demo";

export type EcosystemPackage = {
  name:
    | "layout-style-css"
    | "ui-style-kit-css"
    | "interactive-surface-css"
    | "@sanderson-technology-enterprises/motion-style-css";
  displayName: string;
  version: string;
  layer: string;
  summary: string;
  attribute: string;
  recommendedEntryPoint: string;
  fixture: "layout-only" | "ui-only" | "interactive-only" | "motion-only";
  links: Record<ResourceLink, string>;
};

/** Exact registry version used by installation examples and package contracts. */
export const UI_STYLE_KIT_INSTALL_SPEC = "2.7.1";

/** Version-pinned jsDelivr root for the published UI Style Kit package. */
const UI_STYLE_KIT_CDN_ROOT = `https://cdn.jsdelivr.net/npm/ui-style-kit-css@${UI_STYLE_KIT_INSTALL_SPEC}`;

export const ECOSYSTEM_PACKAGES: readonly EcosystemPackage[] = [
  {
    name: "layout-style-css",
    displayName: "Layout Style CSS",
    version: "3.2.3",
    layer: "Structure",
    summary:
      "Responsive page layouts, content wrappers, grids, and panes with interchangeable layout presets.",
    attribute: 'data-ly-layout="bento"',
    recommendedEntryPoint: "layout-style-css",
    fixture: "layout-only",
    links: {
      repository: "https://github.com/Foscat/Layout-Style-CSS",
      wiki: "https://github.com/Foscat/Layout-Style-CSS/wiki",
      npm: "https://www.npmjs.com/package/layout-style-css",
      demo: "https://foscat.github.io/Layout-Style-CSS/",
    },
  },
  {
    name: "ui-style-kit-css",
    displayName: "UI Style Kit CSS",
    version: UI_STYLE_KIT_INSTALL_SPEC,
    layer: "Identity",
    summary:
      "Component themes, color palettes, typography, and native HTML styling with light, dark, and high-contrast modes.",
    attribute: 'data-ui="minimal-saas"',
    recommendedEntryPoint: "ui-style-kit-css/visual.css",
    fixture: "ui-only",
    links: {
      repository: "https://github.com/Foscat/ui-style-kit-css",
      wiki: "https://github.com/Foscat/ui-style-kit-css/wiki",
      npm: "https://www.npmjs.com/package/ui-style-kit-css",
      demo: "https://foscat.github.io/ui-style-kit-css/",
    },
  },
  {
    name: "interactive-surface-css",
    displayName: "Interactive Surface CSS",
    version: "1.7.3",
    layer: "Behavior",
    summary:
      "Consistent hover, focus-visible, active, pressed, and disabled states.",
    attribute: 'class="interactive-surface"',
    recommendedEntryPoint: "interactive-surface-css/standalone-preset.css",
    fixture: "interactive-only",
    links: {
      repository: "https://github.com/Foscat/Interactive-Surface-CSS",
      wiki: "https://github.com/Foscat/Interactive-Surface-CSS/wiki",
      npm: "https://www.npmjs.com/package/interactive-surface-css",
      demo: "https://foscat.github.io/Interactive-Surface-CSS/",
    },
  },
  {
    name: "@sanderson-technology-enterprises/motion-style-css",
    displayName: "Motion Style CSS",
    version: "1.0.0",
    layer: "Motion",
    summary:
      "The newest addition to the STE web development system: paired entrances, exits, and choreography on dedicated shells, with reduced-motion support.",
    attribute: 'data-ms-preset="cascade"',
    recommendedEntryPoint:
      "@sanderson-technology-enterprises/motion-style-css/styles.css",
    fixture: "motion-only",
    links: {
      repository:
        "https://github.com/Sanderson-Technology-Enterprises/motion-style-css",
      wiki: "https://github.com/Sanderson-Technology-Enterprises/motion-style-css/blob/main/docs/INTEGRATION.md",
      npm: "https://www.npmjs.com/package/@sanderson-technology-enterprises/motion-style-css",
      demo: "https://stesystems.com/lab/#motion",
    },
  },
] as const;

export const NPM_INSTALL = `npm install ui-style-kit-css@${UI_STYLE_KIT_INSTALL_SPEC} layout-style-css@3.2.3 interactive-surface-css@1.7.3`;

export const BUNDLER_IMPORTS = [
  'import "ui-style-kit-css/visual.css";',
  'import "ui-style-kit-css/interactive-surface-theme.css";',
  'import "interactive-surface-css/state-core.css";',
  'import "layout-style-css";',
] as const;

type CdnAsset = {
  readonly packageName: EcosystemPackage["name"];
  readonly kind: "module" | "style";
  readonly href: string;
};

export const CDN_LINKS = [
  {
    packageName: "ui-style-kit-css",
    kind: "style",
    href: `${UI_STYLE_KIT_CDN_ROOT}/dist/ui-style-kit.visual.min.css`,
  },
  {
    packageName: "ui-style-kit-css",
    kind: "style",
    href: `${UI_STYLE_KIT_CDN_ROOT}/styles/interactive-surface-theme.css`,
  },
  {
    packageName: "interactive-surface-css",
    kind: "style",
    href: "https://cdn.jsdelivr.net/npm/interactive-surface-css@1.7.3/state-core.css",
  },
  {
    packageName: "layout-style-css",
    kind: "style",
    href: "https://cdn.jsdelivr.net/npm/layout-style-css@3.2.3/dist/layout-style-css.min.css",
  },
] as const satisfies readonly CdnAsset[];

function cdnMarkup(assets: readonly CdnAsset[]): string {
  return assets
    .map((asset) =>
      asset.kind === "style"
        ? `<link rel="stylesheet" href="${asset.href}">`
        : `<script type="module" src="${asset.href}"></script>`,
    )
    .join("\n");
}

export const CDN_MARKUP = cdnMarkup(CDN_LINKS);

export type AdoptionPathId =
  | "layout-only"
  | "ui-only"
  | "interactive-only"
  | "layout-ui"
  | "layout-interactive"
  | "ui-interactive"
  | "all-canonical"
  | "motion-only"
  | "all-motion";

export type AdoptionScope = "one" | "pair" | "all";
export type AdoptionFormat = "npm" | "bundler" | "cdn";

export type AdoptionSnippet = {
  id: string;
  format: AdoptionFormat;
  label: string;
  title: string;
  code: string;
};

export type AdoptionPath = {
  id: AdoptionPathId;
  scope: AdoptionScope;
  title: string;
  summary: string;
  packages: readonly EcosystemPackage["name"][];
  deprecated: boolean;
  snippets: readonly AdoptionSnippet[];
};

const uiVisualCdn = CDN_LINKS[0];
const uiThemeCdn = CDN_LINKS[1];
const interactionCoreCdn = CDN_LINKS[2];
const layoutCdn = CDN_LINKS[3];
const interactionStandaloneCdn: CdnAsset = {
  packageName: "interactive-surface-css",
  kind: "style",
  href: "https://cdn.jsdelivr.net/npm/interactive-surface-css@1.7.3/standalone-preset.css",
};

function adoptionSnippets(
  id: AdoptionPathId,
  npm: string,
  bundler: readonly string[],
  cdn: readonly CdnAsset[],
  npmTitle: string,
): readonly AdoptionSnippet[] {
  return [
    {
      id: `${id}-npm`,
      format: "npm",
      label: "npm",
      title: npmTitle,
      code: npm,
    },
    {
      id: `${id}-bundler`,
      format: "bundler",
      label: "Imports",
      title: "Import the stylesheets",
      code: bundler.join("\n"),
    },
    {
      id: `${id}-cdn`,
      format: "cdn",
      label: "CDN",
      title: "Load exact versions from a CDN",
      code: cdnMarkup(cdn),
    },
  ];
}

const motionStyle: CdnAsset = {
  packageName: "@sanderson-technology-enterprises/motion-style-css",
  kind: "style",
  href: "https://cdn.jsdelivr.net/npm/@sanderson-technology-enterprises/motion-style-css@1.0.0/src/motion.css",
};
const motionController: CdnAsset = {
  packageName: "@sanderson-technology-enterprises/motion-style-css",
  kind: "module",
  href: "https://cdn.jsdelivr.net/npm/@sanderson-technology-enterprises/motion-style-css@1.0.0/src/index.js",
};
const motionImports = [
  'import "@sanderson-technology-enterprises/motion-style-css/styles.css";',
  'import { enter, exit, cancel, stagger } from "@sanderson-technology-enterprises/motion-style-css";',
  "// Call enter(shell) after mount; cancel(shell) during cleanup.",
] as const;

export const ADOPTION_PATHS = [
  {
    id: "motion-only",
    scope: "one",
    title: "Motion Style CSS",
    deprecated: false,
    summary:
      "Add lifecycle effects to a dedicated shell without adopting other CSS libraries.",
    packages: ["@sanderson-technology-enterprises/motion-style-css"],
    snippets: adoptionSnippets(
      "motion-only",
      "npm install @sanderson-technology-enterprises/motion-style-css@1.0.0",
      motionImports,
      [motionStyle, motionController],
      "Install Motion Style CSS",
    ),
  },
  {
    id: "all-motion",
    scope: "all",
    title: "Four CSS layers with lifecycle motion",
    deprecated: false,
    summary:
      "Compose structure, appearance, and interaction with optional lifecycle motion on separate shells.",
    packages: [
      "layout-style-css",
      "ui-style-kit-css",
      "interactive-surface-css",
      "@sanderson-technology-enterprises/motion-style-css",
    ],
    snippets: adoptionSnippets(
      "all-motion",
      `${NPM_INSTALL} @sanderson-technology-enterprises/motion-style-css@1.0.0`,
      [...BUNDLER_IMPORTS, ...motionImports],
      [...CDN_LINKS, motionStyle, motionController],
      "Install all four CSS libraries",
    ),
  },
  {
    id: "layout-only",
    scope: "one",
    title: "Layout Style CSS",
    summary:
      "Add responsive layouts while keeping your existing component appearance and interaction styling.",
    packages: ["layout-style-css"],
    deprecated: false,
    snippets: adoptionSnippets(
      "layout-only",
      "npm install layout-style-css@3.2.3",
      ['import "layout-style-css";'],
      [layoutCdn],
      "Install Layout Style CSS",
    ),
  },
  {
    id: "ui-only",
    scope: "one",
    title: "UI Style Kit CSS",
    summary:
      "Add themes and styling for components and native controls. No layout library is required.",
    packages: ["ui-style-kit-css"],
    deprecated: false,
    snippets: adoptionSnippets(
      "ui-only",
      `npm install ui-style-kit-css@${UI_STYLE_KIT_INSTALL_SPEC}`,
      ['import "ui-style-kit-css/visual.css";'],
      [uiVisualCdn],
      "Install UI Style Kit CSS",
    ),
  },
  {
    id: "interactive-only",
    scope: "one",
    title: "Interactive Surface CSS",
    summary:
      "Style hover, focus, pressed, and disabled states with the package’s neutral standalone preset.",
    packages: ["interactive-surface-css"],
    deprecated: false,
    snippets: adoptionSnippets(
      "interactive-only",
      "npm install interactive-surface-css@1.7.3",
      ['import "interactive-surface-css/standalone-preset.css";'],
      [interactionStandaloneCdn],
      "Install Interactive Surface CSS",
    ),
  },
  {
    id: "layout-ui",
    scope: "pair",
    title: "Layout plus UI",
    summary:
      "Combine structural recipes with visual identity while retaining existing interaction behavior.",
    packages: ["layout-style-css", "ui-style-kit-css"],
    deprecated: false,
    snippets: adoptionSnippets(
      "layout-ui",
      `npm install layout-style-css@3.2.3 ui-style-kit-css@${UI_STYLE_KIT_INSTALL_SPEC}`,
      ['import "ui-style-kit-css/visual.css";', 'import "layout-style-css";'],
      [uiVisualCdn, layoutCdn],
      "Install Layout and UI",
    ),
  },
  {
    id: "layout-interactive",
    scope: "pair",
    title: "Layout plus interaction",
    summary:
      "Combine responsive geometry with standalone interaction surfaces and states.",
    packages: ["layout-style-css", "interactive-surface-css"],
    deprecated: false,
    snippets: adoptionSnippets(
      "layout-interactive",
      "npm install layout-style-css@3.2.3 interactive-surface-css@1.7.3",
      [
        'import "interactive-surface-css/standalone-preset.css";',
        'import "layout-style-css";',
      ],
      [interactionStandaloneCdn, layoutCdn],
      "Install Layout and Interaction",
    ),
  },
  {
    id: "ui-interactive",
    scope: "pair",
    title: "UI plus interaction",
    summary:
      "Combine UI themes with interaction styling while keeping your existing layout system.",
    packages: ["ui-style-kit-css", "interactive-surface-css"],
    deprecated: false,
    snippets: adoptionSnippets(
      "ui-interactive",
      `npm install ui-style-kit-css@${UI_STYLE_KIT_INSTALL_SPEC} interactive-surface-css@1.7.3`,
      [
        'import "ui-style-kit-css/visual.css";',
        'import "ui-style-kit-css/interactive-surface-theme.css";',
        'import "interactive-surface-css/state-core.css";',
      ],
      [uiVisualCdn, uiThemeCdn, interactionCoreCdn],
      "Install UI and Interaction",
    ),
  },
  {
    id: "all-canonical",
    scope: "all",
    title: "The canonical three-library stack",
    summary:
      "Install the three CSS libraries used together in this Lab: layout, visual styling, and interaction states.",
    packages: [
      "layout-style-css",
      "ui-style-kit-css",
      "interactive-surface-css",
    ],
    deprecated: false,
    snippets: adoptionSnippets(
      "all-canonical",
      NPM_INSTALL,
      BUNDLER_IMPORTS,
      CDN_LINKS,
      "Install all three",
    ),
  },
] as const satisfies readonly AdoptionPath[];
