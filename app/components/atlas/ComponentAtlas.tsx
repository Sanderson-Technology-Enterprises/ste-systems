"use client";

import {
  createElement,
  useDeferredValue,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { ATLAS_COVERAGE } from "../../data/atlas";
import { AtlasSpecimen, type AtlasReference } from "./AtlasSpecimen";

type AtlasLibrary = "interaction" | "layout" | "ui";
type AtlasLibraryFilter = "all" | AtlasLibrary;

type AtlasItem = {
  readonly description: string;
  readonly id: string;
  readonly keywords: string;
  readonly library: AtlasLibrary;
  readonly references?: readonly AtlasReference[];
  readonly specimen: ReactNode;
  readonly title: string;
};

const libraryLabels: Record<AtlasLibrary, string> = {
  interaction: "Interactive Surface CSS",
  layout: "Layout Style CSS",
  ui: "UI Style Kit CSS",
};

function humanize(value: string): string {
  return value
    .split("-")
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

function chunks<T>(values: readonly T[], size: number): readonly T[][] {
  const result: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    result.push(values.slice(index, index + size));
  }
  return result;
}

function LayoutPrimitive({ name }: { readonly name: string }) {
  const className = `ly-${name}`;

  if (name === "reel") {
    return (
      <div
        aria-label="Scrollable reel specimen"
        className={className}
        tabIndex={0}
      >
        <span className="ly-surface ly-pad-4">One</span>
        <span className="ly-surface ly-pad-4">Two</span>
        <span className="ly-surface ly-pad-4">Three</span>
      </div>
    );
  }
  if (name === "frame") {
    return (
      <div className={`${className} ly-frame-16x9`}>
        <span>16:9 frame</span>
      </div>
    );
  }
  if (name === "grid" || name === "split" || name === "panes") {
    return (
      <div className={`${className} ly-gap-4`}>
        <span className="ly-surface ly-pad-4">Primary</span>
        <span className="ly-surface ly-pad-4">Secondary</span>
      </div>
    );
  }
  if (name === "sidebar" || name === "media") {
    return (
      <div className={`${className} ly-gap-4`}>
        <span className="ly-surface ly-pad-4">Fixed region</span>
        <span className="ly-surface ly-pad-4">Flexible region</span>
      </div>
    );
  }

  const tagByPrimitive: Readonly<Record<string, string>> = {
    footer: "footer",
    header: "header",
    main: "main",
    section: "section",
  };
  return createElement(
    tagByPrimitive[name] ?? "div",
    { className },
    createElement("span", null, `${humanize(name)} primitive`),
  );
}

function LayoutRecipeSpecimen({ name }: { readonly name: string }) {
  return (
    <div className="atlas-recipe-demo" data-ly-recipe={name}>
      <header className="ly-surface ly-pad-4" data-ly-area="header">
        Header
      </header>
      <nav
        aria-label={`${humanize(name)} recipe navigation`}
        className="ly-surface ly-pad-4"
        data-ly-area="sidebar"
      >
        Navigation
      </nav>
      <main className="ly-surface ly-pad-4" data-ly-area="main">
        <strong>{humanize(name)}</strong>
        <p>Responsive primary content</p>
      </main>
      <aside className="ly-surface ly-pad-4" data-ly-area="aside">
        Supporting region
      </aside>
      <footer className="ly-surface ly-pad-4" data-ly-area="footer">
        Footer
      </footer>
    </div>
  );
}

function SemanticUiSpecimen() {
  return (
    <div className="atlas-ui-semantic ly-stack ly-gap-4">
      <div className="usk-toolbar">
        <button className="usk-button" data-ui-variant="primary" type="button">
          Primary action
        </button>
        <button className="usk-icon-button" aria-label="Add item" type="button">
          +
        </button>
        <span className="usk-badge" data-ui-variant="success">
          Stable
        </span>
      </div>
      <article className="usk-card">
        <label className="usk-field">
          <span className="usk-label">Project name</span>
          <input className="usk-input" defaultValue="Atlas" />
          <span className="usk-help-text">Consumer-owned semantic markup.</span>
        </label>
        <label className="usk-field">
          <span className="usk-label">Release channel</span>
          <select className="usk-select" defaultValue="stable">
            <option value="stable">Stable</option>
            <option value="preview">Preview</option>
          </select>
        </label>
        <label className="usk-field">
          <span className="usk-label">Notes</span>
          <textarea className="usk-textarea" defaultValue="Ready for review" />
        </label>
        <label className="usk-check">
          <input className="usk-check-control" defaultChecked type="checkbox" />
          <span>Include documentation</span>
        </label>
        <label className="usk-radio">
          <input
            className="usk-radio-control"
            defaultChecked
            name="atlas-channel"
            type="radio"
          />
          <span>Use stable channel</span>
        </label>
        <label className="usk-switch">
          <input defaultChecked type="checkbox" />
          <span className="usk-switch-track">
            <span className="usk-switch-thumb" />
          </span>
          <span>Animate changes</span>
        </label>
      </article>
      <aside className="usk-alert" data-ui-variant="success">
        <strong className="usk-alert-title">Contract verified</strong>
        <span className="usk-alert-body">
          All semantic selectors are present.
        </span>
      </aside>
      <nav className="usk-nav" aria-label="Semantic selector example">
        <a className="usk-nav-link" href="#atlas-top">
          Overview
        </a>
        <a className="usk-nav-link" href="#atlas-results">
          Results
        </a>
      </nav>
      <div className="usk-table-wrap">
        <table className="usk-table">
          <thead>
            <tr>
              <th>Contract</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Semantic API</td>
              <td>Published</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        className="usk-progress"
        aria-label="Atlas coverage"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={88}
        role="progressbar"
      >
        <span className="usk-progress-bar" style={{ width: "88%" }} />
      </div>
      <span
        className="usk-spinner"
        aria-label="Loading preview"
        role="status"
      />
      <span className="usk-tooltip" role="tooltip">
        Semantic tooltip
      </span>
    </div>
  );
}

function UniversalClassSample({
  prefix,
  suffix,
}: {
  readonly prefix: string;
  readonly suffix: string;
}) {
  const className = `${prefix}-${suffix}`;
  const label = humanize(suffix);

  if (suffix === "copy") {
    return <button aria-label={label} className={className} type="button" />;
  }
  if (suffix.includes("button")) {
    return (
      <button className={className} type="button">
        {label}
      </button>
    );
  }
  if (suffix === "input") {
    return (
      <input aria-label={label} className={className} defaultValue={label} />
    );
  }
  if (suffix === "select") {
    return (
      <select aria-label={label} className={className} defaultValue="sample">
        <option value="sample">{label}</option>
      </select>
    );
  }
  if (suffix === "textarea") {
    return (
      <textarea aria-label={label} className={className} defaultValue={label} />
    );
  }
  if (suffix === "divider") return <hr className={className} />;
  if (suffix.includes("spinner")) {
    return <span aria-label={label} className={className} role="status" />;
  }
  if (suffix.includes("progress-bar")) {
    return <span className={className} style={{ width: "68%" }} />;
  }

  return <div className={className}>{label}</div>;
}

const tableElementNames = new Set([
  "caption",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "tr",
]);

function NativeElementSample({ name }: { readonly name: string }) {
  if (tableElementNames.has(name)) {
    return (
      <table>
        <caption>{name} element context</caption>
        <thead>
          <tr>
            <th>Element</th>
            <th>Coverage</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{name}</td>
            <td>Fully themed</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2}>Native table context</td>
          </tr>
        </tfoot>
      </table>
    );
  }
  if (["ol", "ul", "menu", "li"].includes(name)) {
    return (
      <ul>
        <li>{name} element context</li>
      </ul>
    );
  }
  if (["dl", "dt", "dd"].includes(name)) {
    return (
      <dl>
        <dt>{name}</dt>
        <dd>Definition-list context</dd>
      </dl>
    );
  }
  if (["ruby", "rp", "rt"].includes(name)) {
    return (
      <ruby>
        漢<rp>(</rp>
        <rt>kan</rt>
        <rp>)</rp>
      </ruby>
    );
  }
  if (name === "details" || name === "summary") {
    return (
      <details open>
        <summary>{name} element context</summary>
        <p>Expandable native content.</p>
      </details>
    );
  }
  if (name === "dialog") return <dialog open>Open dialog element</dialog>;
  if (name === "figure" || name === "figcaption") {
    return (
      <figure>
        <div>Figure media</div>
        <figcaption>{name} element context</figcaption>
      </figure>
    );
  }
  if (name === "fieldset" || name === "legend" || name === "form") {
    return (
      <form>
        <fieldset>
          <legend>{name} element context</legend>
          <label>
            Example <input defaultValue="Value" />
          </label>
        </fieldset>
      </form>
    );
  }
  if (name === "input")
    return <input aria-label="Input element" defaultValue="Input element" />;
  if (name === "hr") return <hr />;
  if (name === "select") {
    return (
      <select aria-label="Select element" defaultValue="one">
        <option value="one">Select element</option>
      </select>
    );
  }
  if (name === "textarea")
    return (
      <textarea aria-label="Textarea element" defaultValue="Textarea element" />
    );
  if (name === "progress")
    return (
      <progress max="100" value="70">
        70%
      </progress>
    );
  if (name === "meter")
    return (
      <meter min="0" max="10" value="8">
        8/10
      </meter>
    );
  if (name === "button") return <button type="button">Button element</button>;

  const accessibilityProps: Readonly<Record<string, string>> | null =
    name === "nav" ? { "aria-label": "Native nav element" } : null;
  return createElement(name, accessibilityProps, `${name} element`);
}

function ProgressiveElementSample({ name }: { readonly name: string }) {
  if (name === "area" || name === "map") {
    return (
      <map name="atlas-map">
        <area alt="Atlas area" coords="0,0,20,20" href="#atlas-top" />
      </map>
    );
  }
  if (["col", "colgroup"].includes(name)) {
    return (
      <table>
        <colgroup>
          <col />
        </colgroup>
        <tbody>
          <tr>
            <td>{name} context</td>
          </tr>
        </tbody>
      </table>
    );
  }
  if (name === "audio") return <audio controls aria-label="Audio controls" />;
  if (name === "video") return <video controls aria-label="Video controls" />;
  if (name === "canvas")
    return (
      <canvas height={40} width={120}>
        Canvas
      </canvas>
    );
  if (name === "iframe") {
    return (
      <iframe
        srcDoc="<!doctype html><title>Atlas frame</title><p>Frame</p>"
        title="Atlas frame"
      />
    );
  }
  if (name === "img") {
    return createElement("img", {
      alt: "Abstract atlas placeholder",
      height: 48,
      src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='48'%3E%3Crect width='96' height='48' rx='8' fill='%2339d3c6'/%3E%3C/svg%3E",
      width: 96,
    });
  }
  if (name === "picture") {
    return (
      <picture>
        {createElement("img", {
          alt: "Picture element placeholder",
          height: 48,
          src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='48'%3E%3Crect width='96' height='48' rx='8' fill='%23ffca66'/%3E%3C/svg%3E",
          width: 96,
        })}
      </picture>
    );
  }
  if (name === "svg") {
    return (
      <svg
        aria-label="SVG element"
        height="48"
        role="img"
        viewBox="0 0 96 48"
        width="96"
      >
        <circle cx="24" cy="24" fill="currentColor" r="16" />
        <path d="M48 12h36v24H48z" fill="none" stroke="currentColor" />
      </svg>
    );
  }
  if (name === "br")
    return (
      <span>
        Line
        <br />
        break
      </span>
    );
  if (name === "wbr")
    return (
      <span>
        Opportunity
        <wbr />
        break
      </span>
    );
  if (name === "option" || name === "optgroup") {
    return (
      <select aria-label={`${name} element context`} defaultValue="one">
        <optgroup label="Context">
          <option value="one">{name} element</option>
        </optgroup>
      </select>
    );
  }
  if (name === "object") return <object aria-label="Object element" />;
  if (name === "embed") return <embed aria-label="Embedded element" />;

  return createElement(name, null, `${name} element`);
}

function buildAtlasItems(prefix: string): readonly AtlasItem[] {
  const items: AtlasItem[] = [];

  for (const wrapper of ATLAS_COVERAGE.layout.wrappers) {
    items.push({
      description: `The ${wrapper} wrapper constrains content with published responsive gutters.`,
      id: `layout-wrapper-${wrapper}`,
      keywords: `layout wrapper ${wrapper}`,
      library: "layout",
      specimen: (
        <div className={`ly-wrapper ly-wrapper--${wrapper} atlas-layout-demo`}>
          <span>{humanize(wrapper)} wrapper</span>
        </div>
      ),
      title: `${humanize(wrapper)} wrapper`,
    });
  }

  for (const primitive of ATLAS_COVERAGE.layout.primitives) {
    items.push({
      description: `The ly-${primitive} composition primitive owns reusable structure.`,
      id: `layout-primitive-${primitive}`,
      keywords: `layout primitive ly-${primitive} ${primitive}`,
      library: "layout",
      specimen: <LayoutPrimitive name={primitive} />,
      title: `${humanize(primitive)} primitive`,
    });
  }

  for (const recipe of ATLAS_COVERAGE.layout.recipes) {
    items.push({
      description: `The ${recipe} recipe maps semantic areas across container thresholds.`,
      id: `layout-recipe-${recipe}`,
      keywords: `layout recipe data-ly-recipe ${recipe}`,
      library: "layout",
      specimen: <LayoutRecipeSpecimen name={recipe} />,
      title: `${humanize(recipe)} recipe`,
    });
  }

  items.push({
    description:
      "Every published data-ly-area value in one structural reference.",
    id: "layout-areas",
    keywords: `layout areas ${ATLAS_COVERAGE.layout.areas.join(" ")}`,
    library: "layout",
    specimen: (
      <div className="atlas-area-grid" data-ly-recipe="app-shell">
        {ATLAS_COVERAGE.layout.areas.map((area) => (
          <div className="ly-surface ly-pad-4" data-ly-area={area} key={area}>
            {area}
          </div>
        ))}
      </div>
    ),
    title: "Recipe areas",
  });

  for (const personality of ATLAS_COVERAGE.layout.personalities) {
    items.push({
      description: `The ${personality} personality adjusts structural rhythm without owning component paint.`,
      id: `layout-personality-${personality}`,
      keywords: `layout personality data-ly-layout ${personality}`,
      library: "layout",
      specimen: (
        <div
          className="ly-root ly-surface ly-pad-6 ly-stack ly-gap-4"
          data-ly-layout={personality}
        >
          <strong>{humanize(personality)}</strong>
          <div className="ly-grid ly-gap-4">
            <span className="ly-surface ly-pad-4">A</span>
            <span className="ly-surface ly-pad-4">B</span>
          </div>
        </div>
      ),
      title: `${humanize(personality)} personality`,
    });
  }

  items.push({
    description: `A core specimen from the ${ATLAS_COVERAGE.ui.semanticSelectors.length} published usk-* semantic selectors.`,
    id: "ui-semantic-api",
    keywords: `ui semantic ${ATLAS_COVERAGE.ui.semanticSelectors.map(({ selector }) => selector).join(" ")}`,
    library: "ui",
    specimen: <SemanticUiSpecimen />,
    title: "Semantic component API",
  });

  chunks(ATLAS_COVERAGE.ui.universalVisualSuffixes, 12).forEach(
    (suffixes, index) => {
      items.push({
        description: `Universal preset-prefixed visual selectors ${index * 12 + 1}–${index * 12 + suffixes.length}.`,
        id: `ui-universal-${index + 1}`,
        keywords: `ui universal classes ${suffixes.join(" ")}`,
        library: "ui",
        specimen: (
          <div className="atlas-class-grid">
            {suffixes.map((suffix) => (
              <UniversalClassSample
                key={suffix}
                prefix={prefix}
                suffix={suffix}
              />
            ))}
          </div>
        ),
        title: `Universal visual classes ${index + 1}`,
      });
    },
  );

  for (const preset of ATLAS_COVERAGE.ui.presets) {
    const extras = ATLAS_COVERAGE.ui.presetExtras[preset.id] ?? [];
    items.push({
      description:
        extras.length > 0
          ? `Every ${preset.label} preset-only class, alongside its universal visual contract.`
          : `${preset.label} relies entirely on the universal visual contract.`,
      id: `ui-preset-${preset.id}`,
      keywords: `ui preset ${preset.id} ${preset.label} ${extras.join(" ")}`,
      library: "ui",
      specimen: (
        <div
          className={`${preset.prefix}-surface atlas-preset-demo ly-stack ly-gap-4 ly-pad-6`}
          data-ui={preset.id}
        >
          <strong className={`${preset.prefix}-heading`}>{preset.label}</strong>
          {extras.length > 0 ? (
            extras.map((extra) => (
              <div className={`${preset.prefix}-${extra}`} key={extra}>
                {humanize(extra)}
              </div>
            ))
          ) : (
            <p className={`${preset.prefix}-text-muted`}>
              No preset-only selectors
            </p>
          )}
        </div>
      ),
      title: `${preset.label} extras`,
    });
  }

  const documentContext = new Set(["body", "html"]);
  items.push({
    description:
      "Every fully themed native HTML element from the 2.3 manifest.",
    id: "ui-native-fully-themed",
    keywords: `ui native fully themed ${ATLAS_COVERAGE.ui.nativeElements.fullyThemed.join(" ")}`,
    library: "ui",
    references: [...documentContext].map((name) => ({
      html:
        name === "html"
          ? '<html data-ui="minimal-saas" data-theme="midnight-gold" data-mode="dark">…</html>'
          : "<body>…</body>",
      label: `<${name}> document context`,
    })),
    specimen: (
      <div className="atlas-native-grid">
        {ATLAS_COVERAGE.ui.nativeElements.fullyThemed
          .filter((name) => !documentContext.has(name))
          .map((name) => (
            <div className="atlas-native-cell" key={name}>
              <code>&lt;{name}&gt;</code>
              <NativeElementSample name={name} />
            </div>
          ))}
      </div>
    ),
    title: "Fully themed native elements",
  });

  const progressiveReferences = new Set(["selectedcontent"]);
  items.push({
    description:
      "Native elements that retain platform behavior while receiving progressive styling.",
    id: "ui-native-progressive",
    keywords: `ui native progressive ${ATLAS_COVERAGE.ui.nativeElements.progressivelyEnhanced.join(" ")}`,
    library: "ui",
    references: [...progressiveReferences].map((name) => ({
      html: `<select><button><selectedcontent></selectedcontent></button><option>Choice</option></select>`,
      label: `<${name}> context fixture`,
    })),
    specimen: (
      <div className="atlas-native-grid">
        {ATLAS_COVERAGE.ui.nativeElements.progressivelyEnhanced
          .filter((name) => !progressiveReferences.has(name))
          .map((name) => (
            <div className="atlas-native-cell" key={name}>
              <code>&lt;{name}&gt;</code>
              <ProgressiveElementSample name={name} />
            </div>
          ))}
      </div>
    ),
    title: "Progressively enhanced native elements",
  });

  items.push({
    description:
      "Platform-owned interfaces are documented without pretending CSS owns their internal DOM.",
    id: "ui-native-platform",
    keywords: `ui native platform owned ${ATLAS_COVERAGE.ui.nativeElements.platformOwned.join(" ")}`,
    library: "ui",
    references: ATLAS_COVERAGE.ui.nativeElements.platformOwned.map((name) => ({
      html: `<!-- ${name} is rendered by the user agent -->`,
      label: name,
    })),
    specimen: <p>Use each code control to inspect the ownership boundary.</p>,
    title: "Platform-owned native interfaces",
  });

  items.push({
    description:
      "Non-rendered document elements remain visible as exact reference snippets.",
    id: "ui-native-non-rendered",
    keywords: `ui native non rendered ${ATLAS_COVERAGE.ui.nativeElements.nonRendered.join(" ")}`,
    library: "ui",
    references: ATLAS_COVERAGE.ui.nativeElements.nonRendered.map((name) => ({
      html: `<${name}></${name}>`,
      label: `<${name}>`,
    })),
    specimen: <p>Reference-only nodes do not create a visible layout box.</p>,
    title: "Non-rendered document elements",
  });

  for (const [group, parts] of Object.entries(ATLAS_COVERAGE.ui.nativeParts)) {
    items.push({
      description: `${humanize(group)} native parts and platform boundaries from the published manifest.`,
      id: `ui-native-parts-${group}`,
      keywords: `ui native parts ${group} ${parts.join(" ")}`,
      library: "ui",
      references: parts.map((part) => ({
        html: `/* ${part} native part */`,
        label: part,
      })),
      specimen: (
        <p>
          {parts.length} published {humanize(group).toLowerCase()} parts.
        </p>
      ),
      title: `${humanize(group)} native parts`,
    });
  }

  items.push({
    description:
      "All 13 stable selectors, including sizes, variants, and icon-role utilities.",
    id: "interaction-stable-selectors",
    keywords: `interaction stable ${ATLAS_COVERAGE.interaction.stableSelectors.join(" ")}`,
    library: "interaction",
    specimen: (
      <div className="atlas-interaction-grid">
        {ATLAS_COVERAGE.interaction.stableSelectors.map((selector) => (
          <button
            className={`interactive-surface ${selector.slice(1)}`}
            key={selector}
            type="button"
          >
            {selector}
          </button>
        ))}
      </div>
    ),
    title: "Stable interaction selectors",
  });

  items.push({
    description:
      "Persistent state classes with their corresponding accessible state.",
    id: "interaction-state-classes",
    keywords: `interaction state ${ATLAS_COVERAGE.interaction.stateClasses.join(" ")}`,
    library: "interaction",
    specimen: (
      <div className="atlas-interaction-grid">
        <button className="interactive-surface is-active" type="button">
          .is-active
        </button>
        <button
          aria-busy="true"
          className="interactive-surface is-loading"
          type="button"
        >
          .is-loading
        </button>
        <button
          aria-disabled="true"
          className="interactive-surface is-disabled"
          type="button"
        >
          .is-disabled
        </button>
      </div>
    ),
    title: "State classes",
  });

  items.push({
    description:
      "The three public data-hook families and every supported value.",
    id: "interaction-data-hooks",
    keywords: `interaction data hooks ${ATLAS_COVERAGE.interaction.dataHooks.flatMap(({ name, selectors }) => [name, ...selectors]).join(" ")}`,
    library: "interaction",
    specimen: (
      <div className="atlas-interaction-grid">
        {ATLAS_COVERAGE.interaction.dataHooks.flatMap(({ name, selectors }) =>
          selectors.map((selector) => {
            const value = selector.match(/='([^']+)'/)?.[1] ?? "";
            return (
              <button
                className="interactive-surface"
                key={`${name}-${value}`}
                type="button"
                {...{
                  [name]: value,
                  ...(name === "data-surface-variant"
                    ? { "data-surface-level": "2" }
                    : {}),
                }}
              >
                {name}={value}
              </button>
            );
          }),
        )}
      </div>
    ),
    title: "Data-hook families",
  });

  items.push({
    description:
      "Variants, elevation levels, sizes, and ARIA-driven persistent states.",
    id: "interaction-state-matrix",
    keywords: `interaction variants levels sizes aria ${ATLAS_COVERAGE.interaction.variants.join(" ")} ${ATLAS_COVERAGE.interaction.levels.join(" ")} ${ATLAS_COVERAGE.interaction.sizes.join(" ")} ${ATLAS_COVERAGE.interaction.ariaHooks.join(" ")}`,
    library: "interaction",
    specimen: (
      <div className="atlas-interaction-grid">
        {ATLAS_COVERAGE.interaction.variants.map((variant) => (
          <button
            className="interactive-surface"
            data-surface-level="2"
            data-surface-variant={variant}
            key={variant}
            type="button"
          >
            {variant}
          </button>
        ))}
        {ATLAS_COVERAGE.interaction.levels.map((level) => (
          <button
            className="interactive-surface"
            data-surface-level={level}
            key={`level-${level}`}
            type="button"
          >
            Level {level}
          </button>
        ))}
        {ATLAS_COVERAGE.interaction.sizes.map((size) => (
          <button
            className={`interactive-surface size-${size}`}
            key={`size-${size}`}
            type="button"
          >
            Size {size}
          </button>
        ))}
        <button
          aria-pressed="true"
          className="interactive-surface"
          type="button"
        >
          Pressed
        </button>
        <button
          aria-current="page"
          className="interactive-surface"
          type="button"
        >
          Current
        </button>
        <div aria-label="Selection state" role="listbox">
          <div
            aria-selected="true"
            className="interactive-surface"
            role="option"
            tabIndex={0}
          >
            Selected
          </div>
        </div>
        <button aria-busy="true" className="interactive-surface" type="button">
          Busy
        </button>
        <button
          aria-disabled="true"
          className="interactive-surface"
          type="button"
        >
          ARIA disabled
        </button>
      </div>
    ),
    title: "State and preference matrix",
  });

  return items;
}

/**
 * Renders the searchable, configurable atlas for every published contract in
 * the three CSS libraries.
 *
 * @returns The client-side Component Atlas experience.
 */
export function ComponentAtlas() {
  const [query, setQuery] = useState("");
  const [libraryFilter, setLibraryFilter] = useState<AtlasLibraryFilter>("all");
  const [presetId, setPresetId] = useState("minimal-saas");
  const [theme, setTheme] = useState("midnight-gold");
  const [mode, setMode] = useState("dark");
  const deferredQuery = useDeferredValue(query);
  const selectedPreset =
    ATLAS_COVERAGE.ui.presets.find(({ id }) => id === presetId) ??
    ATLAS_COVERAGE.ui.presets[0];
  const allItems = useMemo(
    () => buildAtlasItems(selectedPreset.prefix),
    [selectedPreset.prefix],
  );
  const filteredItems = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    return allItems.filter(
      ({ keywords, library, title }) =>
        (libraryFilter === "all" || library === libraryFilter) &&
        (!normalizedQuery ||
          `${title} ${keywords}`.toLowerCase().includes(normalizedQuery)),
    );
  }, [allItems, deferredQuery, libraryFilter]);
  const isStale = query !== deferredQuery;

  return (
    <div
      className="component-atlas"
      data-mode={mode}
      data-theme={theme}
      data-ui={selectedPreset.id}
    >
      <section
        className="atlas-control-deck ly-stack ly-gap-6"
        aria-label="Atlas controls"
      >
        <label className="atlas-search usk-field">
          <span className="usk-label">Search components and contracts</span>
          <input
            className="usk-input"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try button, sidebar, native, or aria-pressed"
            type="search"
            value={query}
          />
        </label>

        <div
          className="atlas-filter-row"
          role="group"
          aria-label="Filter by library"
        >
          {(["all", "layout", "ui", "interaction"] as const).map((filter) => (
            <button
              aria-pressed={libraryFilter === filter}
              className="interactive-surface site-action"
              data-surface-level="2"
              data-surface-variant={
                libraryFilter === filter ? "accent" : "subtle"
              }
              key={filter}
              onClick={() => setLibraryFilter(filter)}
              type="button"
            >
              {filter === "all" ? "All libraries" : libraryLabels[filter]}
            </button>
          ))}
        </div>

        <div className="atlas-configuration-grid">
          <label className="usk-field">
            <span className="usk-label">UI preset</span>
            <select
              className="usk-select"
              onChange={(event) => setPresetId(event.target.value)}
              value={selectedPreset.id}
            >
              {ATLAS_COVERAGE.ui.presets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </label>
          <label className="usk-field">
            <span className="usk-label">Theme</span>
            <select
              className="usk-select"
              onChange={(event) => setTheme(event.target.value)}
              value={theme}
            >
              {ATLAS_COVERAGE.ui.themes.map((themeName) => (
                <option key={themeName} value={themeName}>
                  {humanize(themeName)}
                </option>
              ))}
            </select>
          </label>
          <label className="usk-field">
            <span className="usk-label">Built-in mode</span>
            <select
              className="usk-select"
              onChange={(event) => setMode(event.target.value)}
              value={mode}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="contrast">High contrast</option>
            </select>
          </label>
        </div>
      </section>

      <div className="atlas-result-summary" aria-live="polite">
        <strong>{filteredItems.length}</strong> specimen groups shown
        {isStale ? <span> · Updating results…</span> : null}
      </div>

      <div className="atlas-results" data-stale={isStale} id="atlas-results">
        {(["layout", "ui", "interaction"] as const).map((library) => {
          const libraryItems = filteredItems.filter(
            (item) => item.library === library,
          );
          if (libraryItems.length === 0) return null;

          return (
            <section
              aria-labelledby={`atlas-${library}-title`}
              className="atlas-library-section ly-stack ly-gap-6"
              id={`atlas-${library}`}
              key={library}
            >
              <header className="atlas-library-heading">
                <p className="section-label">{libraryLabels[library]}</p>
                <h2 id={`atlas-${library}-title`}>
                  {library === "layout"
                    ? "Structure, recipes, and responsive personalities"
                    : library === "ui"
                      ? "Semantic components, visual classes, and native HTML"
                      : "States, variants, levels, and accessibility hooks"}
                </h2>
              </header>
              <div className="atlas-specimen-grid">
                {libraryItems.map((item) => (
                  <AtlasSpecimen
                    description={item.description}
                    inspectionKey={`${item.id}-${selectedPreset.prefix}-${theme}-${mode}`}
                    key={item.id}
                    references={item.references}
                    title={item.title}
                  >
                    {item.specimen}
                  </AtlasSpecimen>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
