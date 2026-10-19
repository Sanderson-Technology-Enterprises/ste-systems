"use client";

import { useEffect, useRef, useState } from "react";

import { getUiPrefix } from "../data/catalog";
import {
  ADOPTION_PATHS,
  type AdoptionPath,
  type AdoptionScope,
} from "../data/ecosystem";
import { CopyIcon } from "./Icons";
import { useLabConfiguration } from "./LabExperience";

type SnippetId = (typeof ADOPTION_PATHS)[number]["snippets"][number]["id"];

type AdoptionCardProps = {
  path: AdoptionPath;
  prefix: string;
  copyLabels: Partial<Record<SnippetId, string>>;
  onCopy: (
    id: SnippetId,
    pathTitle: string,
    snippetTitle: string,
    code: string,
  ) => void;
};

/** Presents one installation option with readable insets inside its native article border. */
function AdoptionCard({ path, prefix, copyLabels, onCopy }: AdoptionCardProps) {
  return (
    <article
      className="adoption-path ly-stack ly-gap-4 ly-pad-4"
      data-adoption-path={path.id}
    >
      <header className="ly-stack ly-gap-2">
        <div className="ly-cluster ly-gap-2">
          <p className="section-label">
            {path.deprecated ? "Deprecated compatibility" : "Adoption path"}
          </p>
          <code>{path.packages.join(" + ")}</code>
        </div>
        <h3>{path.title}</h3>
        <p className="muted-copy">{path.summary}</p>
      </header>

      <ol className="install-steps ly-stack ly-gap-0">
        {path.snippets.map((snippet, index) => {
          const copyLabel = copyLabels[snippet.id] ?? "Copy";

          return (
            <li
              key={snippet.id}
              className="install-step ly-grid ly-gap-6 site-pad-block-6"
            >
              <header className="ly-cluster ly-gap-4 ly-items-start">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div className="ly-stack ly-gap-2">
                  <small className="eyebrow">{snippet.label}</small>
                  <h4>{snippet.title}</h4>
                </div>
              </header>
              <div
                className={`snippet-shell ${prefix}-surface ly-surface ly-pad-4 ly-stack ly-gap-4`}
              >
                <pre tabIndex={0}>
                  <code>{snippet.code}</code>
                </pre>
                <button
                  className="copy-button interactive-surface site-action"
                  data-surface-variant="subtle"
                  data-surface-level="1"
                  type="button"
                  aria-label={`${copyLabel} ${snippet.title} code for ${path.title}`}
                  onClick={() =>
                    onCopy(snippet.id, path.title, snippet.title, snippet.code)
                  }
                >
                  <CopyIcon />
                  <span>{copyLabel}</span>
                </button>
              </div>
            </li>
          );
        })}
      </ol>
    </article>
  );
}

function AdoptionGroup({
  label,
  scope,
  paths,
  prefix,
  copyLabels,
  onCopy,
}: {
  label: string;
  scope: Exclude<AdoptionScope, "all">;
  paths: readonly AdoptionPath[];
  prefix: string;
  copyLabels: Partial<Record<SnippetId, string>>;
  onCopy: AdoptionCardProps["onCopy"];
}) {
  return (
    <details className="adoption-disclosure" data-adoption-group={scope}>
      <summary>{label}</summary>
      <div className="adoption-grid ly-grid ly-gap-6">
        {paths.map((path) => (
          <AdoptionCard
            copyLabels={copyLabels}
            key={path.id}
            onCopy={onCopy}
            path={path}
            prefix={prefix}
          />
        ))}
      </div>
    </details>
  );
}

/** Presents version-pinned installation options and accessible clipboard feedback. */
export function InstallGuide() {
  const { announce, configuration } = useLabConfiguration();
  const prefix = getUiPrefix(configuration.ui);
  const [copyLabels, setCopyLabels] = useState<
    Partial<Record<SnippetId, string>>
  >({});
  const copyTimeoutsRef = useRef<Map<SnippetId, number>>(new Map());

  useEffect(() => {
    const copyTimeouts = copyTimeoutsRef.current;
    return () => {
      for (const timeoutId of copyTimeouts.values()) {
        window.clearTimeout(timeoutId);
      }
      copyTimeouts.clear();
    };
  }, []);

  const clearCopyTimeout = (id: SnippetId) => {
    const existingTimeout = copyTimeoutsRef.current.get(id);
    if (existingTimeout === undefined) return;

    window.clearTimeout(existingTimeout);
    copyTimeoutsRef.current.delete(id);
  };

  const scheduleCopyLabelReset = (id: SnippetId) => {
    // Each snippet owns its transient label timer so an older copy action
    // cannot overwrite newer feedback for the same snippet.
    clearCopyTimeout(id);
    const timeoutId = window.setTimeout(() => {
      setCopyLabels((current) => ({ ...current, [id]: "Copy" }));
      copyTimeoutsRef.current.delete(id);
    }, 1_800);
    copyTimeoutsRef.current.set(id, timeoutId);
  };

  const copySnippet = async (
    id: SnippetId,
    pathTitle: string,
    snippetTitle: string,
    code: string,
  ) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyLabels((current) => ({ ...current, [id]: "Copied" }));
      announce(
        `${snippetTitle} code for ${pathTitle} copied to the clipboard.`,
      );
      scheduleCopyLabelReset(id);
    } catch {
      clearCopyTimeout(id);
      setCopyLabels((current) => ({
        ...current,
        [id]: "Retry copy",
      }));
      announce(
        `Clipboard access failed. Copy the visible ${snippetTitle} code for ${pathTitle} manually.`,
      );
    }
  };

  const canonical = ADOPTION_PATHS.find((path) => path.id === "all-canonical");
  if (canonical === undefined) {
    throw new Error("The canonical three-library adoption path is missing.");
  }

  const pathsFor = (scope: AdoptionScope) =>
    ADOPTION_PATHS.filter((path) => path.scope === scope);

  return (
    <section
      className="section-band ly-section"
      id="install"
      aria-labelledby="install-title"
    >
      <div className="ly-wrapper ly-stack ly-gap-8">
        <div className="section-heading ly-split ly-gap-6 ly-items-end">
          <div>
            <p className="section-label">Install</p>
            <h2 id="install-title">
              Install one package or the complete stack.
            </h2>
          </div>
          <p>
            Each option uses exact package versions and includes npm, bundler,
            and CDN instructions. Choose the libraries your application needs.
          </p>
        </div>

        <div data-adoption-group="all">
          <AdoptionCard
            copyLabels={copyLabels}
            onCopy={copySnippet}
            path={canonical}
            prefix={prefix}
          />
        </div>

        <div className="adoption-disclosures ly-stack ly-gap-4">
          <AdoptionGroup
            copyLabels={copyLabels}
            label="View single-package options"
            onCopy={copySnippet}
            paths={pathsFor("one")}
            prefix={prefix}
            scope="one"
          />
          <AdoptionGroup
            copyLabels={copyLabels}
            label="View two-package options"
            onCopy={copySnippet}
            paths={pathsFor("pair")}
            prefix={prefix}
            scope="pair"
          />
        </div>
      </div>
    </section>
  );
}
