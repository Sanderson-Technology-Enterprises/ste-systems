"use client";

import uiManifest from "ui-style-kit-css/manifest.json";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import {
  getUiPrefix,
  getUiSemanticClass,
  type UiPreset,
} from "../../data/catalog";
import { NativeDialogDemo } from "../NativeDialogDemo";
import { useLabConfiguration } from "../LabExperience";

const richChoicePresets = new Set<UiPreset>([
  "minimal-saas",
  "bento",
  "maximalist",
  "bauhaus",
  "tactile",
  "neumorphism",
  "retrofuturism",
]);

/** Presets that publish the shared empty-state and metric recipe. */
const metricExtraPresets = new Set<UiPreset>([
  "minimal-saas",
  "editorial-luxe",
  "organic-modern",
  "industrial-utility",
  "technical-blueprint",
  "art-deco",
  "clay",
  "data-terminal",
  "paper-editorial",
  "neo-noir",
]);

const nativeTokenNames = [
  "--usk-native-control-min-block-size",
  "--usk-native-control-padding-block",
  "--usk-native-control-padding-inline",
  "--usk-native-subcontrol-padding-block",
  "--usk-native-subcontrol-padding-inline",
  "--usk-native-border-width",
  "--usk-native-field-gap",
  "--usk-native-panel-padding",
  "--usk-native-range-track-size",
  "--usk-native-range-track-background",
  "--usk-native-range-track-radius",
  "--usk-native-range-progress-background",
  "--usk-native-range-thumb-size",
  "--usk-native-range-thumb-background",
  "--usk-native-range-thumb-border",
  "--usk-native-range-thumb-radius",
  "--usk-native-file-button-background",
  "--usk-native-file-button-border",
  "--usk-native-file-button-radius",
  "--usk-native-file-button-shadow",
  "--usk-native-indicator",
] as const;

const nativeInputs = [
  { type: "text", label: "Text", value: "Semantic interface" },
  { type: "search", label: "Search", value: "native controls" },
  { type: "email", label: "Email", value: "lab@example.com" },
  { type: "url", label: "URL", value: "https://example.com" },
  { type: "tel", label: "Telephone", value: "+1 312 555 0142" },
  { type: "password", label: "Password", value: "layered-system" },
  { type: "number", label: "Number", value: "42" },
  { type: "date", label: "Date", value: "2026-07-21" },
  { type: "time", label: "Time", value: "14:30" },
  {
    type: "datetime-local",
    label: "Date and time",
    value: "2026-07-21T14:30",
  },
  { type: "month", label: "Month", value: "2026-07" },
  { type: "week", label: "Week", value: "2026-W30" },
  { type: "color", label: "Color", value: "#d4af37" },
  { type: "file", label: "File", value: "" },
  { type: "range", label: "Range", value: "68" },
] as const;

type NativeInputType = (typeof nativeInputs)[number]["type"];

const nativePartByInput: Partial<Record<NativeInputType, string>> = {
  search: "search-cancel-button",
  number: "number-spinner",
  date: "calendar-picker-indicator",
  time: "calendar-picker-indicator",
  "datetime-local": "calendar-picker-indicator",
  month: "calendar-picker-indicator",
  week: "calendar-picker-indicator",
  color: "color-swatch",
  file: "file-selector-button",
  range: "range-track range-thumb",
};

function uiClass(prefix: string, suffix: string) {
  return `${prefix}-${suffix}`;
}

function titleCase(value: string) {
  // Manifest keys mix camelCase and kebab-case, so normalize both before presentation.
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

type VisualInventoryProps = {
  prefix: string;
  preset: UiPreset;
};

/**
 * Renders a representative preset-only recipe from the active manifest entry.
 *
 * @param props Active visual inventory configuration.
 * @returns A representative recipe for the selected preset.
 */
function PresetExtraRecipe({ prefix, preset }: VisualInventoryProps) {
  const c = (suffix: string) => uiClass(prefix, suffix);

  if (metricExtraPresets.has(preset)) {
    return (
      <div className="preset-extra-grid">
        <div className={c("empty-state")} data-ui-extra="empty-state">
          <strong>Nothing waiting for review</strong>
          <span>The empty-state helper owns the calm product moment.</span>
        </div>
        <article className={c("metric")} data-ui-extra="metric">
          <span className={c("metric-label")} data-ui-extra="metric-label">
            Coverage
          </span>
          <strong className={c("metric-value")} data-ui-extra="metric-value">
            100%
          </strong>
        </article>
      </div>
    );
  }

  switch (preset) {
    case "bento":
      return (
        <div className={c("grid-feature")} data-ui-extra="grid-feature">
          <article className={`${c("tile")} ${c("stat")}`} data-ui-extra="stat">
            <span className={c("stat-label")} data-ui-extra="stat-label">
              Recipes
            </span>
            <strong className={c("stat-value")} data-ui-extra="stat-value">
              07
            </strong>
          </article>
          <article className={c("tile")} data-ui-extra="tile">
            Base tile
          </article>
          <article
            className={`${c("tile")} ${c("tile-lg")}`}
            data-ui-extra="tile-lg"
          >
            Large capability tile
          </article>
          <article
            className={`${c("tile")} ${c("tile-md")}`}
            data-ui-extra="tile-md"
          >
            Medium tile
          </article>
          <article
            className={`${c("tile")} ${c("tile-sm")}`}
            data-ui-extra="tile-sm"
          >
            Small tile
          </article>
        </div>
      );
    case "maximalist":
      return (
        <article className={c("callout")} data-ui-extra="callout">
          <span className={c("sticker")} data-ui-extra="sticker">
            Ship expressive UI
          </span>
          <button
            className={`${c("button")} ${c("wiggle")}`}
            data-ui-extra="wiggle"
            type="button"
          >
            Hover the wiggle action
          </button>
        </article>
      );
    case "bauhaus":
      return (
        <div className="preset-extra-grid">
          <span className={c("block")} data-ui-extra="block">
            01
          </span>
          <article
            className={`${c("card")} ${c("composition")}`}
            data-ui-extra="composition"
          >
            Geometric composition
          </article>
          <p className={c("rail")} data-ui-extra="rail">
            A strong rail organizes editorial emphasis.
          </p>
        </div>
      );
    case "tactile":
      return (
        <div className="preset-extra-grid">
          <article
            className={`${c("card")} ${c("bevel")}`}
            data-ui-extra="bevel"
          >
            Beveled control deck
          </article>
          <span
            className={c("knob")}
            data-ui-extra="knob"
            role="img"
            aria-label="Tactile knob"
          />
          <button
            className={`${c("button")} ${c("pressed")}`}
            data-ui-extra="pressed"
            type="button"
            aria-pressed="true"
          >
            Latched tactile action
          </button>
        </div>
      );
    case "brutalism":
      return (
        <button
          className={`${c("button")} ${c("pressed")}`}
          data-ui-extra="pressed"
          type="button"
          aria-pressed="true"
        >
          Brutalist pressed action
        </button>
      );
    case "cyberpunk":
      return (
        <pre className={c("console")} data-ui-extra="console">
          <code>system.identity = &quot;cyberpunk&quot;;</code>
        </pre>
      );
    case "y2k":
      return (
        <article className={c("bubble")} data-ui-extra="bubble">
          Glossy Y2K message bubble
        </article>
      );
    case "retro-glass":
      return (
        <article className={c("console")} data-ui-extra="console">
          <strong>Retro glass console</strong>
          <p>Layered translucency stays owned by the active preset.</p>
        </article>
      );
    case "neumorphism":
    case "retrofuturism":
      return <p>This preset intentionally publishes no preset-only extras.</p>;
  }
}

function VisualInventory({ prefix, preset }: VisualInventoryProps) {
  const c = (suffix: string) => uiClass(prefix, suffix);
  // Semantic classes keep component markup stable across preset switches;
  // `c()` is reserved for advanced and preset-only visual capabilities.
  const s = getUiSemanticClass;
  const hasRichChoiceRecipe = richChoicePresets.has(preset);
  const extras = uiManifest.classApi.presetExtras[preset];
  const progressStyle = {
    [`--${prefix}-progress-value`]: "68%",
  } as CSSProperties;

  return (
    <div className="ui-inventory ly-stack ly-gap-8">
      <section
        className="ly-stack ly-gap-4"
        data-ui-category="typography"
        data-specimen="ui-typography"
        aria-labelledby="ui-typography-title"
      >
        <p className={c("kicker")} data-ui-suffix="kicker">
          Active preset typography
        </p>
        <h3
          className={c("title")}
          data-ui-suffix="title"
          id="ui-typography-title"
        >
          Identity without structural lock-in
        </h3>
        <h4 className={c("heading")} data-ui-suffix="heading">
          Semantic roles stay readable
        </h4>
        <p className={c("subtitle")} data-ui-suffix="subtitle">
          The selected preset supplies font character, hierarchy, and color.
        </p>
        <p data-typography-baseline>
          A plain paragraph establishes the surrounding document baseline.
        </p>
        <p className={c("copy")} data-ui-suffix="copy">
          Body copy uses the preset&apos;s published reading treatment.
        </p>
        <div className="semantic-text-roles">
          {[
            ["text-primary", "Primary"],
            ["text-secondary", "Secondary"],
            ["text-accent", "Accent"],
            ["text-success", "Success"],
            ["text-warning", "Warning"],
            ["text-danger", "Danger"],
            ["text-muted", "Muted"],
          ].map(([suffix, label]) => (
            <span className={c(suffix)} data-ui-suffix={suffix} key={suffix}>
              {label}
            </span>
          ))}
        </div>
      </section>

      <section
        className="ui-surface-grid"
        data-ui-category="surfaces"
        data-specimen="ui-surfaces"
        aria-label="Semantic and advanced surfaces"
      >
        <article
          className={`${s("card")} ui-paint-signature ly-stack ly-gap-2`}
          data-specimen="ui-paint-signature"
          data-ui-suffix="card"
        >
          <strong>Card</strong>
          <span>Computed paint signature for preset, theme, and mode.</span>
        </article>
        <article
          className={`${c("panel")} ly-stack ly-gap-2`}
          data-ui-suffix="panel"
        >
          <strong>Panel</strong>
          <span>Longer-running workspace content.</span>
        </article>
        <div
          className={`${c("surface")} ui-surface-sample`}
          data-ui-suffix="surface"
        >
          Surface
        </div>
        <div
          className={`${c("surface")} ${c("surface-sm")} ui-surface-sample`}
          data-ui-suffix="surface-sm"
        >
          Small surface
        </div>
        <div
          className={`${c("surface")} ${c("surface-lg")} ui-surface-sample`}
          data-ui-suffix="surface-lg"
        >
          Large surface
        </div>
        <div className={c("well")} data-ui-suffix="well">
          Well
        </div>
        <div className={c("inset")} data-ui-suffix="inset">
          Inset
        </div>
        <article
          className={`${s("card")} ${c("hover-lift")}`}
          data-ui-suffix="hover-lift"
        >
          Preset hover lift
        </article>
        <article
          className={`${c("card-feature")} ly-stack ly-gap-2`}
          data-ui-suffix="card-feature"
        >
          <p className={c("eyebrow")} data-ui-suffix="eyebrow">
            Featured system
          </p>
          <div className={c("card-media")} data-ui-suffix="card-media">
            <span className={c("media-scrim")} data-ui-suffix="media-scrim">
              Media treatment
            </span>
          </div>
          <span
            aria-hidden="true"
            className={c("card-accent-edge")}
            data-ui-suffix="card-accent-edge"
          />
          <strong>Feature card composition</strong>
        </article>
        <article
          className={`${c("card-service")} ly-stack ly-gap-2`}
          data-ui-suffix="card-service"
        >
          <span className={c("icon-medallion")} data-ui-suffix="icon-medallion">
            UI
          </span>
          <strong>Service card composition</strong>
        </article>
        <div className={c("feature-strip")} data-ui-suffix="feature-strip">
          <span className={c("feature-item")} data-ui-suffix="feature-item">
            Stable semantic feature
          </span>
        </div>
        <aside className={c("callout-bar")} data-ui-suffix="callout-bar">
          Advanced visual helpers remain owned by the active preset.
        </aside>
      </section>

      <details>
        <summary>View buttons and component states</summary>
        <section
          className="ui-button-board"
          data-ui-category="buttons"
          data-specimen="ui-buttons"
          aria-label="Semantic buttons"
        >
          <button className={s("button")} data-ui-suffix="button" type="button">
            Base
          </button>
          <button
            className={s("button")}
            data-ui-suffix="button-primary"
            data-ui-variant="primary"
            type="button"
          >
            Primary
          </button>
          <button
            className={s("button")}
            data-ui-suffix="button-secondary"
            data-ui-variant="secondary"
            type="button"
          >
            Secondary
          </button>
          <button
            className={s("button")}
            data-ui-suffix="button-warning"
            data-ui-variant="warning"
            type="button"
          >
            Warning
          </button>
          <button
            className={s("button")}
            data-ui-suffix="button-danger"
            data-ui-variant="danger"
            type="button"
          >
            Danger
          </button>
          <button
            className={s("button")}
            data-ui-suffix="button-ghost"
            data-ui-variant="ghost"
            type="button"
          >
            Ghost
          </button>
          <button
            className={`${c("button")} ${c("button-cut")}`}
            data-ui-suffix="button-cut"
            type="button"
          >
            Cut-corner action
          </button>
          <button
            className={`${c("button")} ${c("button-outline-heavy")}`}
            data-ui-suffix="button-outline-heavy"
            type="button"
          >
            Heavy outline action
          </button>
          <button
            className={s("icon-button")}
            data-ui-suffix="icon-button"
            type="button"
            aria-label="Add specimen"
          >
            +
          </button>
          <button className={s("button")} type="button">
            Copy token
          </button>
          <button
            className={`${s("button")} ${c("disabled")}`}
            data-ui-suffix="disabled"
            type="button"
            disabled
          >
            Disabled
          </button>
          <div className="ui-pill-row">
            <button
              className={c("button-pill")}
              data-ui-suffix="button-pill"
              type="button"
            >
              Run visual system review
            </button>
          </div>
        </section>
      </details>

      <details>
        <summary>View alerts, status, and badges</summary>
        <div className="ly-stack ly-gap-6">
          <section
            className="feedback-grid"
            data-ui-category="feedback"
            data-specimen="ui-feedback"
            aria-label="Semantic alerts"
          >
            <article className={s("alert")} data-ui-suffix="alert">
              <strong className={s("alert-title")} data-ui-suffix="alert-title">
                Informational status
              </strong>
              <p className={s("alert-body")} data-ui-suffix="alert-body">
                The same semantic structure accepts every active preset.
              </p>
            </article>
            <article
              className={s("alert")}
              data-ui-suffix="alert-success"
              data-ui-variant="success"
            >
              <strong>Success</strong>
              <span>All interface layers agree.</span>
            </article>
            <article
              className={s("alert")}
              data-ui-suffix="alert-warning"
              data-ui-variant="warning"
            >
              <strong>Warning</strong>
              <span>Review platform-owned behavior.</span>
            </article>
            <article
              className={s("alert")}
              data-ui-suffix="alert-danger"
              data-ui-variant="danger"
            >
              <strong>Danger</strong>
              <span>Invalid state needs correction.</span>
            </article>
          </section>

          <section
            className="badge-board"
            data-ui-category="badges"
            data-specimen="ui-badges"
            aria-label="Semantic badges"
          >
            {[
              ["badge", "Base", undefined],
              ["badge-primary", "Primary", "primary"],
              ["badge-secondary", "Secondary", "secondary"],
              ["badge-success", "Success", "success"],
              ["badge-warning", "Warning", "warning"],
              ["badge-danger", "Danger", "danger"],
            ].map(([suffix, label, variant]) => (
              <span
                className={s("badge")}
                data-ui-suffix={suffix}
                data-ui-variant={variant}
                key={suffix}
              >
                {label}
              </span>
            ))}
            <span className={c("badge-seal")} data-ui-suffix="badge-seal">
              Verified seal
            </span>
          </section>
        </div>
      </details>

      <details>
        <summary>View form recipes and native-first choices</summary>
        <div className="ly-stack ly-gap-6">
          <section
            className="ui-field-grid"
            data-ui-category="fields"
            data-specimen="ui-fields"
            aria-label="Semantic fields"
          >
            <label className={s("field")} data-ui-suffix="field">
              <span className={s("label")} data-ui-suffix="label">
                Project name
              </span>
              <input
                className={s("input")}
                data-ui-suffix="input"
                defaultValue="STE Systems"
              />
              <span className={s("help-text")} data-ui-suffix="help-text">
                Semantic fields keep their markup while the selected preset
                paints them.
              </span>
            </label>
            <label className={s("field")}>
              <span className={s("label")}>Review lane</span>
              <select
                className={s("select")}
                data-ui-suffix="select"
                defaultValue="qa"
              >
                <option value="design">Design</option>
                <option value="qa">Quality assurance</option>
              </select>
            </label>
            <label className={s("field")}>
              <span className={s("label")}>Notes</span>
              <textarea
                className={s("textarea")}
                data-ui-suffix="textarea"
                defaultValue="Native semantics, preset paint, and library-owned states."
              />
            </label>
          </section>

          <section
            className="choice-recipe"
            data-ui-category="choices"
            data-specimen="ui-choices"
            aria-label="Choice recipe"
          >
            {hasRichChoiceRecipe ? (
              <>
                <p>
                  This preset publishes an optional custom-choice visual recipe;
                  the fully visible native controls below remain the functional
                  cross-preset baseline.
                </p>
                <label className={s("check")} data-ui-suffix="check">
                  <input type="checkbox" defaultChecked />
                  <span
                    className={s("check-control")}
                    data-ui-suffix="check-control"
                    aria-hidden="true"
                  />
                  Include audit notes
                </label>
                <label className={s("radio")} data-ui-suffix="radio">
                  <input
                    type="radio"
                    name="prefixed-review-lane"
                    defaultChecked
                  />
                  <span
                    className={s("radio-control")}
                    data-ui-suffix="radio-control"
                    aria-hidden="true"
                  />
                  Release review
                </label>
              </>
            ) : (
              <p>
                This lean preset intentionally relies on the themed native
                checkbox and radio controls demonstrated below.
              </p>
            )}
          </section>

          <section
            className="switch-recipe"
            data-ui-category="switch"
            data-specimen="ui-switch"
            aria-label="Switch recipe"
          >
            {hasRichChoiceRecipe ? (
              <label className={s("switch")} data-ui-suffix="switch">
                <input type="checkbox" role="switch" defaultChecked />
                <span
                  className={s("switch-track")}
                  data-ui-suffix="switch-track"
                  aria-hidden="true"
                >
                  <span
                    className={s("switch-thumb")}
                    data-ui-suffix="switch-thumb"
                  />
                </span>
                Announce changes
              </label>
            ) : (
              <p>Use the native switch-like checkbox for this preset.</p>
            )}
          </section>
        </div>
      </details>

      <details>
        <summary>View progress, loading, and tooltips</summary>
        <div className="ly-stack ly-gap-8">
          <section
            className="ly-stack ly-gap-4"
            data-ui-category="progress"
            data-specimen="ui-progress"
            aria-label="Custom progress"
          >
            <div
              className={s("progress")}
              data-ui-suffix="progress"
              role="progressbar"
              aria-label="Visual review progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={68}
              style={progressStyle}
            >
              <span
                className={s("progress-bar")}
                data-ui-suffix="progress-bar"
              />
            </div>
          </section>

          <section
            className="spinner-board"
            data-ui-category="spinner"
            data-specimen="ui-spinners"
            aria-label="Loading indicators"
          >
            <span
              className={s("spinner")}
              data-ui-suffix="spinner"
              role="status"
              aria-label="Loading"
            />
            <span
              className={`${s("spinner")} ${c("spinner-sm")}`}
              data-ui-suffix="spinner-sm"
              role="status"
              aria-label="Loading small"
            />
            <span
              className={`${s("spinner")} ${c("spinner-lg")}`}
              data-ui-suffix="spinner-lg"
              role="status"
              aria-label="Loading large"
            />
            <span
              className={`${c("loading-spinner")} ${c("spinner-sm")}`}
              data-ui-suffix="loading-spinner"
              role="status"
              aria-label="Loading alternate"
            />
          </section>

          <section
            className="tooltip-scroll"
            data-ui-category="tooltips"
            data-specimen="ui-tooltips"
            aria-label="Tooltip positions"
          >
            <div className="tooltip-board">
              <span
                className="tooltip-anchor"
                data-ui-tooltip-anchor
                data-tooltip-position="top"
              >
                <button
                  className={s("button")}
                  type="button"
                  aria-describedby="ui-tooltip-top"
                >
                  Top
                </button>
                <span
                  className={`${s("tooltip")} ${c("tooltip-top")}`}
                  data-ui-suffix="tooltip-top"
                  id="ui-tooltip-top"
                  role="tooltip"
                >
                  Above the anchor
                  <span
                    className={c("tooltip-arrow")}
                    data-ui-suffix="tooltip-arrow"
                    aria-hidden="true"
                  />
                </span>
              </span>
              <span
                className="tooltip-anchor"
                data-ui-tooltip-anchor
                data-tooltip-position="right"
              >
                <button
                  className={s("button")}
                  type="button"
                  aria-describedby="ui-tooltip-right"
                >
                  Right
                </button>
                <span
                  className={`${s("tooltip")} ${c("tooltip-right")}`}
                  data-ui-suffix="tooltip-right"
                  id="ui-tooltip-right"
                  role="tooltip"
                >
                  Beside the anchor
                  <span className={c("tooltip-arrow")} aria-hidden="true" />
                </span>
              </span>
              <span
                className="tooltip-anchor"
                data-ui-tooltip-anchor
                data-tooltip-position="bottom"
              >
                <button
                  className={s("button")}
                  type="button"
                  aria-describedby="ui-tooltip-bottom"
                >
                  Bottom
                </button>
                <span
                  className={`${s("tooltip")} ${c("tooltip-bottom")}`}
                  data-ui-suffix="tooltip-bottom"
                  id="ui-tooltip-bottom"
                  role="tooltip"
                >
                  Below the anchor
                  <span className={c("tooltip-arrow")} aria-hidden="true" />
                </span>
              </span>
              <span
                className="tooltip-anchor"
                data-ui-tooltip-anchor
                data-tooltip-position="left"
              >
                <button
                  className={s("button")}
                  type="button"
                  aria-describedby="ui-tooltip-left"
                >
                  Left
                </button>
                <span
                  className={`${s("tooltip")} ${c("tooltip-left")}`}
                  data-ui-suffix="tooltip-left"
                  id="ui-tooltip-left"
                  role="tooltip"
                >
                  Before the anchor
                  <span className={c("tooltip-arrow")} aria-hidden="true" />
                </span>
              </span>
            </div>
            <span
              className={s("tooltip")}
              data-ui-suffix="tooltip"
              role="tooltip"
            >
              Static tooltip surface
            </span>
          </section>
        </div>
      </details>

      <details>
        <summary>View navigation, toolbar, and table</summary>
        <section
          className="ui-data-board ly-stack ly-gap-6"
          data-ui-category="data"
          data-specimen="ui-data"
          aria-label="Navigation and data components"
        >
          <nav
            className={s("nav")}
            data-ui-suffix="nav"
            aria-label="UI specimen navigation"
          >
            <a
              className={s("nav-link")}
              data-ui-suffix="nav-link"
              href="#ui-native"
              aria-current="page"
            >
              Components
            </a>
            <a className={s("nav-link")} href="#interactions">
              States
            </a>
          </nav>
          <div
            className={s("toolbar")}
            data-ui-suffix="toolbar"
            role="toolbar"
            aria-label="Specimen toolbar"
          >
            <strong>Review queue</strong>
            <button className={s("button")} type="button">
              Filter
            </button>
          </div>
          <div className={s("table-wrap")} data-ui-suffix="table-wrap">
            <table className={s("table")} data-ui-suffix="table">
              <caption>Ownership by layer</caption>
              <thead>
                <tr>
                  <th scope="col">Layer</th>
                  <th scope="col">Owner</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Paint</td>
                  <td>UI Style Kit</td>
                </tr>
                <tr>
                  <td>Mechanics</td>
                  <td>Interactive Surface</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </details>

      <details>
        <summary>View shape, state, and accessibility helpers</summary>
        <section
          className="helper-board"
          data-ui-category="helpers"
          data-specimen="ui-helpers"
          aria-label="Visual helper classes"
        >
          <span className={c("bg-primary")} data-ui-suffix="bg-primary">
            Primary background
          </span>
          <span className={c("bg-secondary")} data-ui-suffix="bg-secondary">
            Secondary background
          </span>
          <span className={c("border")} data-ui-suffix="border">
            Border
          </span>
          <span className={c("rounded")} data-ui-suffix="rounded">
            Rounded
          </span>
          <span className={c("rounded-lg")} data-ui-suffix="rounded-lg">
            Rounded large
          </span>
          <span className={c("rounded-xl")} data-ui-suffix="rounded-xl">
            Rounded extra large
          </span>
          <span className={c("pill")} data-ui-suffix="pill">
            Pill
          </span>
          <hr className={c("divider")} data-ui-suffix="divider" />
          <a
            className={c("skip-link")}
            data-ui-suffix="skip-link"
            href="#ui-native-title"
          >
            Skip to UI laboratory heading
          </a>
          <span className={c("sr-only")} data-ui-suffix="sr-only">
            Screen-reader-only helper
          </span>
          <span
            className={c("visually-hidden")}
            data-ui-suffix="visually-hidden"
          >
            Visually hidden helper
          </span>
        </section>
      </details>

      <details>
        <summary>View current preset extras</summary>
        <section
          className="preset-extra-board ly-stack ly-gap-4"
          data-ui-category="preset-extra"
          data-specimen="ui-preset-extras"
          aria-label={`${titleCase(preset)} preset extras`}
        >
          <p>
            Extras come directly from the published manifest and render only for
            the active preset.
          </p>
          <PresetExtraRecipe prefix={prefix} preset={preset} />
          <p>
            Manifest extras exposed here:{" "}
            {extras.length > 0 ? extras.join(", ") : "none"}.
          </p>
        </section>
      </details>
    </div>
  );
}

function NativeSupportDisclosure() {
  return (
    <details className="native-support-details">
      <summary>View native support and public tokens</summary>
      <section
        className="native-support-disclosure ly-stack ly-gap-6"
        data-ui-category="native-support"
        data-specimen="native-support"
        aria-label="Native support contract"
      >
        <p>
          The hybrid-native policy paints safe boxes and exposed subparts while
          leaving inaccessible browser and operating-system popups untouched.
        </p>
        <div className="native-support-grid">
          {Object.entries(uiManifest.nativeElements).map(([kind, elements]) => (
            <section className="ly-stack ly-gap-2" key={kind}>
              <h4>{titleCase(kind)}</h4>
              <p>{elements.join(", ")}</p>
            </section>
          ))}
        </div>
        <div className="native-support-grid">
          {Object.entries(uiManifest.nativeParts).map(([kind, parts]) => (
            <section className="ly-stack ly-gap-2" key={kind}>
              <h4>{titleCase(kind)} parts</h4>
              <p>{parts.join(", ")}</p>
            </section>
          ))}
        </div>
        <section
          className="ly-stack ly-gap-2"
          aria-labelledby="native-token-title"
        >
          <h4 id="native-token-title">Public native tokens</h4>
          <div className="native-token-list">
            {nativeTokenNames.map((token) => (
              <code key={token}>{token}</code>
            ))}
          </div>
        </section>
      </section>
    </details>
  );
}

function NativeInventory() {
  const indeterminateRef = useRef<HTMLInputElement>(null);
  const [rangeValue, setRangeValue] = useState(68);

  useEffect(() => {
    const checkbox = indeterminateRef.current;
    if (checkbox === null) return;

    checkbox.indeterminate = true;
    return () => {
      checkbox.indeterminate = false;
    };
  }, []);

  return (
    <div className="native-inventory ly-stack ly-gap-8">
      <section
        className="ly-stack ly-gap-4"
        aria-labelledby="native-inputs-title"
      >
        <div className="specimen-heading ly-stack ly-gap-2">
          <h4 id="native-inputs-title">Input type atlas</h4>
          <p>
            Every control below is classless. The active root configuration
            supplies native paint while the browser retains semantics.
          </p>
        </div>
        <div className="native-input-grid">
          {nativeInputs.map(({ label, type, value }) => {
            const inputId = `native-${type}`;
            const nativePart = nativePartByInput[type];
            return (
              <label className="native-control" htmlFor={inputId} key={type}>
                <span>{label}</span>
                {type === "file" ? (
                  <input
                    id={inputId}
                    type="file"
                    data-native-type={type}
                    data-native-part={nativePart}
                  />
                ) : type === "range" ? (
                  <input
                    id={inputId}
                    type="range"
                    min="0"
                    max="100"
                    value={rangeValue}
                    data-native-type={type}
                    data-native-part={nativePart}
                    onChange={(event) =>
                      setRangeValue(Number(event.currentTarget.value))
                    }
                  />
                ) : (
                  <input
                    id={inputId}
                    type={type}
                    defaultValue={value}
                    data-native-type={type}
                    data-native-part={nativePart}
                  />
                )}
              </label>
            );
          })}
        </div>
        <p>
          Range value: <output htmlFor="native-range">{rangeValue}</output>
        </p>

        <section
          className="ly-stack ly-gap-4"
          aria-labelledby="native-file-states-title"
        >
          <h5 id="native-file-states-title">File selector states</h5>
          <div className="native-input-grid">
            {/* Real controls let the browser expose focus, hover, and active pseudo-classes. */}
            {(["enabled", "focus", "hover", "active", "disabled"] as const).map(
              (state) => {
                const inputId = `native-file-${state}`;
                return (
                  <label
                    className="native-control"
                    htmlFor={inputId}
                    key={state}
                  >
                    <span>{titleCase(state)}</span>
                    <input
                      id={inputId}
                      type="file"
                      data-native-file-state={state}
                      data-native-part="file-selector-button"
                      disabled={state === "disabled"}
                    />
                  </label>
                );
              },
            )}
          </div>
        </section>
      </section>

      <details>
        <summary>View select, datalist, textarea, and popups</summary>
        <div className="native-input-grid">
          <label className="native-control" htmlFor="native-select">
            <span>Grouped select</span>
            <select
              id="native-select"
              defaultValue="qa"
              data-native-part="select-indicator"
            >
              <optgroup label="Delivery">
                <option value="design">Design review</option>
                <option value="qa">Quality assurance</option>
              </optgroup>
              <optgroup label="Operations">
                <option value="release">Release</option>
              </optgroup>
            </select>
            <small>
              The select popup remains platform-owned; the closed control and
              supported picker indicator inherit the active preset.
            </small>
          </label>

          <label className="native-control" htmlFor="native-datalist-input">
            <span>Datalist</span>
            <input
              id="native-datalist-input"
              list="native-capability-list"
              defaultValue="Native controls"
            />
            <datalist id="native-capability-list">
              <option value="Native controls" />
              <option value="Interaction states" />
              <option value="Layout recipes" />
            </datalist>
            <small>
              The input is themed; its datalist popup remains platform-owned and
              is not replaced with a less-accessible imitation.
            </small>
          </label>

          <label className="native-control" htmlFor="native-textarea">
            <span>Textarea and placeholder</span>
            <textarea
              id="native-textarea"
              placeholder="Describe a cross-engine observation"
              data-native-part="placeholder"
            />
          </label>
        </div>
        <p>
          Color, date/time, and file chooser dialogs also remain platform-owned;
          only their exposed host boxes and supported indicators are painted.
        </p>
      </details>

      <details>
        <summary>
          View checkbox, radio, switch, and indeterminate states
        </summary>
        <form>
          <fieldset className="native-choice-grid">
            <legend>Native choice controls</legend>
            <label>
              <input
                type="checkbox"
                defaultChecked
                data-native-part="accent-color"
              />
              Checkbox
            </label>
            <label>
              <input type="radio" name="native-lane" defaultChecked />
              Design lane
            </label>
            <label>
              <input type="radio" name="native-lane" />
              Engineering lane
            </label>
            <label>
              <input type="checkbox" role="switch" defaultChecked />
              Switch-like checkbox
            </label>
            <label>
              <input
                ref={indeterminateRef}
                type="checkbox"
                data-native-state="indeterminate"
              />
              Indeterminate selection
            </label>
          </fieldset>
        </form>
      </details>

      <details>
        <summary>View native validation and control states</summary>
        <form
          className="native-state-grid"
          onSubmit={(event) => event.preventDefault()}
        >
          <label className="native-control" htmlFor="native-readonly">
            <span>Read only</span>
            <input
              id="native-readonly"
              defaultValue="Published contract"
              readOnly
              data-native-state="readonly"
            />
          </label>
          <label className="native-control" htmlFor="native-required">
            <span>Required and complete</span>
            <input
              id="native-required"
              defaultValue="Approved"
              required
              data-native-state="required"
            />
          </label>
          <label className="native-control" htmlFor="native-valid">
            <span>Valid class API</span>
            <input
              id="native-valid"
              className="is-valid"
              defaultValue="Valid value"
              data-native-state="valid"
            />
          </label>
          <label className="native-control" htmlFor="native-aria-invalid">
            <span>ARIA invalid</span>
            <input
              id="native-aria-invalid"
              defaultValue="Needs correction"
              aria-invalid="true"
              aria-describedby="native-invalid-help"
              data-native-state="aria-invalid"
            />
            <small id="native-invalid-help">
              Use a published package version.
            </small>
          </label>
          <label className="native-control" htmlFor="native-class-invalid">
            <span>Invalid class API</span>
            <input
              id="native-class-invalid"
              className="is-invalid"
              defaultValue="Unknown release"
              data-native-state="is-invalid"
            />
          </label>
          <label className="native-control" htmlFor="native-user-invalid">
            <span>User-invalid after validation</span>
            <input
              id="native-user-invalid"
              required
              aria-describedby="native-user-invalid-help"
              data-native-state="user-invalid"
            />
            <small id="native-user-invalid-help">
              Untouched required controls do not receive danger paint.
            </small>
          </label>
          <label className="native-control" htmlFor="native-disabled">
            <span>Disabled</span>
            <input
              id="native-disabled"
              defaultValue="Unavailable"
              disabled
              data-native-state="disabled"
            />
          </label>
          <button type="button" data-native-state="active">
            Hold to inspect native active paint
          </button>
          <button type="submit">Validate native field</button>
        </form>
      </details>

      <details>
        <summary>View progress, meter, output, details, and scrollbars</summary>
        <div className="native-semantic-grid">
          <label className="native-control">
            <span>Determinate progress</span>
            <progress
              value="68"
              max="100"
              data-native-part="progress-track progress-value"
            >
              68%
            </progress>
          </label>
          <label className="native-control">
            <span>Indeterminate progress</span>
            <progress data-native-part="progress-track">Loading</progress>
          </label>
          <label className="native-control">
            <span>Optimum meter</span>
            <meter min={0} max={100} low={35} high={75} optimum={90} value={92}>
              92
            </meter>
          </label>
          <label className="native-control">
            <span>Suboptimal meter</span>
            <meter min={0} max={100} low={35} high={75} optimum={90} value={58}>
              58
            </meter>
          </label>
          <label className="native-control">
            <span>Low meter</span>
            <meter min={0} max={100} low={35} high={75} optimum={90} value={18}>
              18
            </meter>
          </label>
          <details>
            <summary data-native-part="summary-marker">
              Native summary marker
            </summary>
            <p>
              Details stay keyboard-operable without custom disclosure code.
            </p>
          </details>
          <ul>
            <li data-native-part="list-marker">Native list marker</li>
            <li>Theme-aware semantic list content</li>
          </ul>
          <p data-native-part="selection">
            Select this sentence to inspect the active native selection paint.
          </p>
          <div
            className="native-scroll-sample"
            data-native-part="scrollbar"
            tabIndex={0}
            aria-label="Scrollable native-part sample"
          >
            <p>
              Supported Chromium/WebKit scrollbars inherit track and thumb
              tokens. Firefox keeps its platform scrollbar paint because the
              release does not claim a <code>scrollbar-color</code> contract.
            </p>
            <p>
              Range progress and meter distinctions also vary by engine; track,
              thumb, and value styling applies only where the engine exposes a
              safe pseudo-element.
            </p>
          </div>
        </div>
      </details>

      <details>
        <summary>Open a real modal dialog</summary>
        <NativeDialogDemo />
      </details>
    </div>
  );
}

export function UiNativeLab() {
  const { configuration } = useLabConfiguration();
  const prefix = getUiPrefix(configuration.ui);

  return (
    <section
      className="section-band ly-section"
      id="ui-native"
      aria-labelledby="ui-native-title"
    >
      <div className="ly-wrapper">
        <div className="section-heading ly-split ly-gap-6 ly-items-end">
          <div className="ly-stack ly-gap-2">
            <p className="section-label">Identity</p>
            <h2 id="ui-native-title">
              Test visual styles and native controls.
            </h2>
          </div>
          <p>
            Every visual class is constructed from the active manifest prefix.
            Themes, modes, components, and native controls change without
            loading inactive preset classes into the specimen DOM.
          </p>
        </div>

        <VisualInventory prefix={prefix} preset={configuration.ui} />

        <section
          className="native-laboratory ly-stack ly-gap-6"
          aria-labelledby="native-laboratory-title"
        >
          <div className="section-heading ly-split ly-gap-6 ly-items-end">
            <div className="ly-stack ly-gap-2">
              <p className="section-label">Hybrid native coverage</p>
              <h3 id="native-laboratory-title">
                Native laboratory: platform semantics, exposed paint
              </h3>
            </div>
            <p>
              Safe boxes and supported subparts inherit the active identity;
              inaccessible pickers, popups, and operating-system surfaces stay
              platform-owned.
            </p>
          </div>

          <NativeInventory />
          <NativeSupportDisclosure />
        </section>
      </div>
    </section>
  );
}
