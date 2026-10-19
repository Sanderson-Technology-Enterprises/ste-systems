import reactPackage from "@sanderson-technology-enterprises/ste-usk-react/package.json";
import { ADOPTION_PATHS, ECOSYSTEM_PACKAGES } from "./ecosystem";

/** Stable identifiers also preserve the original CSS-library fragment links. */
export type LibraryGuideId = "layout" | "ui" | "interaction" | "react";

/** Curated documentation content; the CSS ecosystem inventory remains three packages. */
export type LibraryGuide = {
  readonly id: LibraryGuideId;
  readonly name: string;
  readonly packageName: string;
  readonly version: string;
  readonly role: string;
  readonly summary: string;
  readonly install: string;
  readonly imports: string;
  readonly concepts: readonly { api: string; description: string }[];
  readonly links: readonly { label: string; href: string }[];
};

/** Provides trusted, authored HTML for both static previews and their copyable source. */
export type GuideExample = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly html: string;
};

/** Reuses the verified standalone setup for a CSS library instead of duplicating imports. */
function cssSetup(
  id: "layout-only" | "ui-only" | "interactive-only",
  index: number,
) {
  const pkg = ECOSYSTEM_PACKAGES[index];
  const path = ADOPTION_PATHS.find((path) => path.id === id)!;
  return {
    name: pkg.displayName,
    packageName: pkg.name,
    version: pkg.version,
    install: path.snippets.find((snippet) => snippet.format === "npm")!.code,
    imports: path.snippets.find((snippet) => snippet.format === "bundler")!
      .code,
    links: [
      { label: "Full documentation", href: pkg.links.wiki },
      { label: "Repository", href: pkg.links.repository },
      { label: "npm package", href: pkg.links.npm },
    ],
  };
}

/** Four learning paths through structure, visual identity, behavior, and React composition. */
export const LIBRARY_GUIDES: readonly LibraryGuide[] = [
  {
    ...cssSetup("layout-only", 0),
    id: "layout",
    role: "01 / Structure",
    summary:
      "Build responsive grids, readable pages, and application shells. Layout Style CSS handles structure and spacing independently of your visual theme.",
    concepts: [
      {
        api: ".ly-wrapper",
        description:
          "Constrain page width and add responsive gutters. Choose prose for reading or workspace for application screens.",
      },
      {
        api: ".ly-grid · .ly-stack",
        description:
          "Arrange content in a responsive grid or vertical stack. Items reflow according to their size and the available space.",
      },
      {
        api: ".ly-sidebar",
        description:
          'Pair regions using data-ly-sidebar="side" and data-ly-sidebar="content". The regions wrap when space runs out.',
      },
      {
        api: "data-ly-recipe · data-ly-area",
        description:
          "Choose a shell such as docs or app-shell, then assign named header, nav, main, aside, and footer areas.",
      },
      {
        api: "data-ly-density",
        description:
          "Set compact, normal, or spacious on a container to adjust spacing within that region.",
      },
      {
        api: "data-ly-layout",
        description:
          "Select a layout personality on .ly-root. Structure stays independent of component colors and interaction states.",
      },
    ],
  },
  {
    ...cssSetup("ui-only", 1),
    id: "ui",
    role: "02 / Visual identity",
    summary:
      "Style components and native HTML with a consistent theme. Presets define typography, colors, and surface treatments; palettes and display modes let you adjust them.",
    concepts: [
      {
        api: "data-ui",
        description:
          "Choose a preset such as minimal-saas on the containing element. Semantic usk-* classes work across presets.",
      },
      {
        api: "data-theme · data-mode",
        description:
          "Use a shared theme with light, dark, or contrast mode. Omit data-theme to use the preset’s native palette.",
      },
      {
        api: ".usk-card · .usk-badge",
        description:
          "Build surfaces and status labels with semantic component classes; keep layout composition in Layout Style CSS.",
      },
      {
        api: ".usk-field · .usk-input",
        description:
          "Pair visible labels and helper text with native controls. The library styles them; your app owns values and validation.",
      },
      {
        api: ".usk-alert",
        description:
          "Compose an alert title and body, then select its visual variant with data-ui-variant.",
      },
      {
        api: "Native HTML",
        description:
          "Headings, lists, tables, and form elements inherit the active visual scope. Keep their native semantics and accessible labels.",
      },
    ],
  },
  {
    ...cssSetup("interactive-only", 2),
    id: "interaction",
    role: "03 / Behavior",
    summary:
      "Make controls respond consistently to mouse, keyboard, and persistent application state, while keeping their native behavior.",
    concepts: [
      {
        api: ".interactive-surface",
        description:
          "Add consistent interaction styling to a native button or link. Use the standalone preset when installing this library on its own.",
      },
      {
        api: "data-surface-variant",
        description:
          "Choose a semantic surface variant, such as accent or subtle, to communicate emphasis.",
      },
      {
        api: "data-surface-level · .size-*",
        description:
          "Set elevation levels 1–3 and control sizes sm, md, or lg without changing application behavior.",
      },
      {
        api: "aria-pressed · aria-current",
        description:
          "Reflect persistent toggle and navigation state in ARIA. Application code must update the value; CSS presents it.",
      },
      {
        api: "disabled · aria-busy",
        description:
          "Native disabled prevents activation. aria-busy communicates work in progress; your application owns the operation.",
      },
      {
        api: "prefers-reduced-motion",
        description:
          "Motion adapts to the user’s preference. Keep visible focus and understandable state changes available without animation.",
      },
    ],
  },
  {
    id: "react",
    name: "STE USK React",
    packageName: reactPackage.name,
    version: reactPackage.version,
    role: "04 / React composition",
    summary:
      "Bring the three CSS libraries together through accessible React components. Use typed props, events, and local state while the CSS libraries handle structure, appearance, and interaction styling.",
    install: `npm install ${reactPackage.name}@${reactPackage.version} react@19.2.6 react-dom@19.2.6 ${ECOSYSTEM_PACKAGES.map((pkg) => `${pkg.name}@${pkg.version}`).join(" ")}`,
    imports: `// Import once at your application entry point.\nimport "${reactPackage.name}/styles.css";`,
    concepts: [
      {
        api: "InterfaceRoot",
        description:
          "Set preset, theme, mode, and density for a group of components. These settings apply to components nested inside the root.",
      },
      {
        api: "Layout.Grid · Layout.Stack",
        description:
          "Compose responsive structure with React APIs backed by Layout Style CSS.",
      },
      {
        api: "Card.Header · Card.Body",
        description:
          "Build semantic component regions with compound APIs rather than duplicating their DOM structure.",
      },
      {
        api: "Form.Input · Button · Alert",
        description:
          "Use labeled controls, native events, and accessible feedback. React state remains owned by your application.",
      },
      {
        api: "surfaceVariant · surfaceLevel",
        description:
          "Pass interaction preferences through component props. CSS retains ownership of appearance and interaction styling.",
      },
      {
        api: "Compatible peers",
        description: Object.entries(reactPackage.peerDependencies)
          .map(([name, range]) => `${name}: ${range}`)
          .join("; "),
      },
    ],
    links: [],
  },
];

/** Static markup is deliberately shared by the rendered CSS examples and code panels. */
export const CSS_GUIDE_EXAMPLES: Readonly<
  Record<"layout" | "ui", readonly GuideExample[]>
> = {
  layout: [
    {
      id: "layout-grid",
      title: "A responsive project grid",
      description:
        "Cards share the available width and wrap as space changes. UI classes style the cards; ly-grid arranges them.",
      html: `<div class="ly-grid ly-gap-4" style="--ly-grid-min: 12rem">
  <article class="usk-card ly-stack ly-gap-3 ly-pad-4">
    <span class="usk-badge">In review</span>
    <h4>Customer portal</h4>
    <p>A welcoming home for project updates and shared files.</p>
    <small>Design team · 3 tasks remaining</small>
  </article>
  <article class="usk-card ly-stack ly-gap-3 ly-pad-4">
    <span class="usk-badge" data-ui-variant="success">Ready</span>
    <h4>Team directory</h4>
    <p>Help everyone find the right person for their next idea.</p>
    <small>People team · Ready for handoff</small>
  </article>
</div>`,
    },
    {
      id: "layout-sidebar",
      title: "A workspace with context",
      description:
        "Named side and content regions share a row when space permits, then reflow for smaller screens.",
      html: `<div class="ly-sidebar ly-gap-4" style="--ly-sidebar-size: 8rem; --ly-sidebar-content-min: 14rem">
  <aside class="usk-panel ly-stack ly-gap-3 ly-pad-4" data-ly-sidebar="side">
    <strong>Workspace</strong>
    <span>Projects · 3</span>
    <span>Team · 8</span>
  </aside>
  <article class="usk-card ly-stack ly-gap-3 ly-pad-4" data-ly-sidebar="content">
    <small>THIS WEEK</small>
    <h4>Customer preview</h4>
    <p>Review the welcome flow and collect feedback before Thursday.</p>
    <span class="usk-badge">Next milestone</span>
  </article>
</div>`,
    },
  ],
  ui: [
    {
      id: "ui-project",
      title: "One visual language, different roles",
      description:
        "A card, native field, badge, and alert share a fixed theme. Edit the sample field to try its native behavior.",
      html: `<div data-ui="minimal-saas" data-theme="midnight-gold" data-mode="dark" class="ly-stack ly-gap-4">
  <article class="usk-card ly-stack ly-gap-4 ly-pad-6">
    <span class="usk-badge" data-ui-variant="success">Ready for review</span>
    <h4>Customer portal</h4>
    <p>Keep your projects, people, and progress together.</p>
    <label class="usk-field">
      <span class="usk-label">Workspace name</span>
      <input class="usk-input" value="Northstar Studio" aria-describedby="guide-workspace-help">
      <span class="usk-help-text" id="guide-workspace-help">Visible to your project team.</span>
    </label>
  </article>
  <aside class="usk-alert" data-ui-variant="success">
    <strong class="usk-alert-title">All set for Thursday</strong>
    <p class="usk-alert-body">The team can review the latest design updates.</p>
  </aside>
</div>`,
    },
  ],
};

/** Copyable starting state; application JavaScript owns the demonstrated toggle. */
export const INTERACTION_GUIDE_HTML = `<div class="ly-cluster ly-gap-3">
  <button class="interactive-surface" data-surface-variant="accent" data-surface-level="2" type="button" aria-pressed="false">Pin project</button>
  <button class="interactive-surface size-sm" type="button" aria-busy="true" disabled>Saving…</button>
  <button class="interactive-surface" type="button" disabled>Unavailable</button>
</div>`;
