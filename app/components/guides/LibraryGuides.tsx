"use client";

import { useSyncExternalStore, useState } from "react";
import { Tabs } from "@sanderson-technology-enterprises/ste-usk-react";
import {
  CSS_GUIDE_EXAMPLES,
  INTERACTION_GUIDE_HTML,
  LIBRARY_GUIDES,
  type LibraryGuideId,
} from "../../data/library-guides";
import { GuideCode } from "./GuideCode";
import { ReactProjectExample } from "./ReactProjectExample";

/** Subscribes to both browser history and in-page fragment navigation. */
function subscribeToFragment(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener("popstate", onChange);
  };
}

/** Resolves known fragments without treating arbitrary URL text as a guide identifier. */
function selectedGuide(): LibraryGuideId {
  return (
    LIBRARY_GUIDES.find(
      (guide) => window.location.hash === `#atlas-${guide.id}`,
    )?.id ?? "layout"
  );
}

/** Keeps toggle state in the application while CSS presents the native ARIA state. */
function InteractionExample() {
  const [pinned, setPinned] = useState(false);
  return (
    <>
      <div
        className="ly-cluster ly-gap-3"
        data-guide-preview="interaction-states"
      >
        <button
          className="interactive-surface"
          data-surface-variant="accent"
          data-surface-level="2"
          type="button"
          aria-pressed={pinned}
          onClick={() => setPinned(!pinned)}
        >
          Pin project
        </button>
        <button
          className="interactive-surface size-sm"
          type="button"
          aria-busy="true"
          disabled
        >
          Saving…
        </button>
        <button className="interactive-surface" type="button" disabled>
          Unavailable
        </button>
      </div>
      <p className="guide-example-note" role="status">
        {pinned ? "Project pinned in this preview." : "Project is not pinned."}
      </p>
    </>
  );
}

/** Renders four focused learning paths while retaining the original library fragment URLs. */
export function LibraryGuides({
  reactSource,
}: {
  readonly reactSource: string;
}) {
  const activeGuide = useSyncExternalStore(
    subscribeToFragment,
    selectedGuide,
    () => "layout" as const,
  );
  /** Replaces the fragment without reloading or moving keyboard focus away from the tabs. */
  function selectGuide(value: string) {
    if (!LIBRARY_GUIDES.some((guide) => guide.id === value)) return;
    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${window.location.search}#atlas-${value}`,
    );
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }
  return (
    <Tabs
      value={activeGuide}
      onValueChange={selectGuide}
      className="library-guides"
    >
      <Tabs.List label="Library guides" className="guide-tabs-list">
        {LIBRARY_GUIDES.map((guide) => (
          <Tabs.Tab key={guide.id} value={guide.id}>
            {guide.name}
          </Tabs.Tab>
        ))}
      </Tabs.List>
      {LIBRARY_GUIDES.map((guide) => (
        <Tabs.Panel key={guide.id} value={guide.id}>
          <section
            id={`atlas-${guide.id}`}
            className="guide-panel"
            aria-labelledby={`guide-title-${guide.id}`}
          >
            <header className="guide-panel-heading">
              <p className="section-label">{guide.role}</p>
              <div className="guide-title-row">
                <h2 id={`guide-title-${guide.id}`}>{guide.name}</h2>
                <span className="usk-badge">v{guide.version}</span>
              </div>
              <p>{guide.summary}</p>
            </header>
            <div className="guide-columns">
              <div className="guide-documentation ly-stack ly-gap-6">
                <section className="ly-stack ly-gap-3">
                  <h3>Start here</h3>
                  <p>
                    Install the package, then load its stylesheet at your
                    application entry point.
                  </p>
                  <GuideCode
                    id={`${guide.id}-install`}
                    code={guide.install}
                    language="Shell"
                  />
                  <GuideCode
                    id={`${guide.id}-imports`}
                    code={guide.imports}
                    language="JavaScript"
                  />
                </section>
                <section className="ly-stack ly-gap-3">
                  <h3>Essential API</h3>
                  <table className="guide-reference">
                    <caption className="ly-visually-hidden">
                      {guide.name} essentials
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">Use</th>
                        <th scope="col">What it does</th>
                      </tr>
                    </thead>
                    <tbody>
                      {guide.concepts.map((concept) => (
                        <tr key={concept.api}>
                          <th scope="row">
                            <code>{concept.api}</code>
                          </th>
                          <td>{concept.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
                {guide.id === "react" ? (
                  <aside className="guide-callout ly-stack ly-gap-3">
                    <h3>Used on this website</h3>
                    <p>
                      This site imports the React package stylesheet once at its
                      app entry point. Its Lab configuration button and these
                      guide tabs use package components alongside existing
                      semantic HTML.
                    </p>
                    <p>
                      STE USK React is part of the wider toolkit built for
                      client applications. STE-Core and STE-SDK provide private
                      application foundations and developer tooling alongside
                      the interface libraries.
                    </p>
                    <p>
                      React supplies component APIs and accessible behavior.
                      Layout Style CSS owns structure, UI Style Kit CSS owns
                      appearance, and Interactive Surface CSS owns interaction
                      styling.
                    </p>
                    <p>
                      Keep an existing supported React installation. For a new
                      app, install matching React and React DOM versions; the
                      peer ranges above describe package compatibility.
                    </p>
                  </aside>
                ) : (
                  <p className="guide-example-note">
                    Use this library on its own, or combine it with the other
                    layers. These previews include supporting layout and theme
                    classes to keep their content readable.
                  </p>
                )}
                {guide.links.length > 0 && (
                  <nav
                    className="guide-resource-links ly-cluster ly-gap-3"
                    aria-label={`${guide.name} resources`}
                  >
                    {guide.links.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        {link.label}
                        <span className="ly-visually-hidden">
                          {" "}
                          (opens in a new tab)
                        </span>
                        <span aria-hidden="true"> ↗</span>
                      </a>
                    ))}
                  </nav>
                )}
              </div>
              <div className="guide-examples ly-stack ly-gap-6">
                <p className="section-label">See it in context</p>
                {guide.id === "layout" || guide.id === "ui" ? (
                  CSS_GUIDE_EXAMPLES[guide.id].map((example) => (
                    <article
                      className="guide-example ly-stack ly-gap-4 ly-pad-4"
                      key={example.id}
                    >
                      <header>
                        <h3>{example.title}</h3>
                        <p>{example.description}</p>
                      </header>
                      <div
                        className="guide-preview"
                        data-guide-preview={example.id}
                        dangerouslySetInnerHTML={{ __html: example.html }}
                      />
                      <GuideCode
                        id={example.id}
                        language="HTML"
                        code={example.html}
                      />
                    </article>
                  ))
                ) : guide.id === "interaction" ? (
                  <article className="guide-example ly-stack ly-gap-4 ly-pad-4">
                    <header>
                      <h3>States that explain themselves</h3>
                      <p>
                        Hover or focus the controls, then pin the project.
                        Loading and unavailable examples are deliberately
                        disabled.
                      </p>
                    </header>
                    <div className="guide-preview">
                      <InteractionExample />
                    </div>
                    <GuideCode
                      id="interaction-states"
                      language="HTML"
                      code={INTERACTION_GUIDE_HTML}
                    />
                    <p>
                      The snippet shows the initial state. Your application
                      updates aria-pressed when the toggle is activated; CSS
                      alone does not change application state.
                    </p>
                  </article>
                ) : (
                  <article className="guide-example ly-stack ly-gap-4 ly-pad-4">
                    <header>
                      <h3>A working React composition</h3>
                      <p>
                        Edit the project name and save the preview. This example
                        uses local React state and sends no data.
                      </p>
                    </header>
                    <div className="guide-preview">
                      <ReactProjectExample />
                    </div>
                    <GuideCode
                      id="react-project"
                      language="JSX"
                      code={reactSource}
                    />
                  </article>
                )}
              </div>
            </div>
          </section>
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}
