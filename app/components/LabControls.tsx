"use client";

import { useEffect, useRef, useState } from "react";

import {
  getUiPrefix,
  LAYOUT_PERSONALITIES,
  UI_MODES,
  UI_PRESETS,
  UI_THEMES,
  type UiMode,
} from "../data/catalog";
import {
  configurationMarkup,
  serializeConfiguration,
  formatThemeLabel,
  isLabTheme,
} from "../lib/configuration";
import { CopyIcon, ExternalLinkIcon, SparkIcon } from "./Icons";
import { useLabConfiguration } from "./LabExperience";

const modeLabels: Record<UiMode, string> = {
  light: "Light",
  dark: "Dark",
  contrast: "High contrast",
};

function formatCatalogLabel(value: string): string {
  return value
    .split("-")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function LabControls() {
  const {
    configuration,
    announce,
    randomizeConfiguration,
    resetConfiguration,
    setLayout,
    setMode,
    setTheme,
    setUi,
  } = useLabConfiguration();
  const prefix = getUiPrefix(configuration.ui);
  const [copyLabel, setCopyLabel] = useState("Copy configuration");
  const [shareLabel, setShareLabel] = useState("Share configuration");
  const [fallbackText, setFallbackText] = useState<string | null>(null);
  const copyTimeoutRef = useRef<number | null>(null);
  const shareTimeoutRef = useRef<number | null>(null);
  const fallbackRef = useRef<HTMLTextAreaElement | null>(null);
  const markup = configurationMarkup(configuration);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
      if (shareTimeoutRef.current !== null) {
        window.clearTimeout(shareTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (fallbackText === null) return;
    fallbackRef.current?.focus();
    fallbackRef.current?.select();
  }, [fallbackText]);

  const scheduleCopyLabelReset = () => {
    if (copyTimeoutRef.current !== null) {
      window.clearTimeout(copyTimeoutRef.current);
    }
    copyTimeoutRef.current = window.setTimeout(() => {
      setCopyLabel("Copy configuration");
      copyTimeoutRef.current = null;
    }, 1_800);
  };

  const scheduleShareLabelReset = () => {
    if (shareTimeoutRef.current !== null) {
      window.clearTimeout(shareTimeoutRef.current);
    }
    shareTimeoutRef.current = window.setTimeout(() => {
      setShareLabel("Share configuration");
      shareTimeoutRef.current = null;
    }, 1_800);
  };

  const copyConfiguration = async () => {
    try {
      await navigator.clipboard.writeText(markup);
      setFallbackText(null);
      setCopyLabel("Copied");
      announce("Configuration markup copied to the clipboard.");
      scheduleCopyLabelReset();
    } catch {
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = null;
      }
      setCopyLabel("Select markup");
      setFallbackText(markup);
      announce(
        "Clipboard access failed. Select the configuration markup to copy it manually.",
      );
    }
  };

  const shareConfiguration = async () => {
    const url = new URL(window.location.href);
    url.search = serializeConfiguration(configuration).toString();
    url.hash = "";
    const shareUrl = url.toString();

    try {
      await navigator.clipboard.writeText(shareUrl);
      setFallbackText(null);
      setShareLabel("Link copied");
      announce("Share link copied to the clipboard.");
      scheduleShareLabelReset();
    } catch {
      if (shareTimeoutRef.current !== null) {
        window.clearTimeout(shareTimeoutRef.current);
        shareTimeoutRef.current = null;
      }
      setShareLabel("Select link");
      setFallbackText(shareUrl);
      announce(
        "Clipboard access failed. Select the share link to copy it manually.",
      );
    }
  };

  return (
    <aside
      className={`configuration-console ${prefix}-panel ly-surface ly-pad-4`}
      aria-label="Configuration console"
    >
      <form
        className="control-deck ly-grid ly-grid--fixed ly-gap-4"
        aria-label="Interface configuration"
        onSubmit={(event) => event.preventDefault()}
      >
        <label>
          <span>01 / Layout</span>
          <select
            value={configuration.layout}
            onChange={(event) => {
              const layout = LAYOUT_PERSONALITIES.find(
                (value) => value === event.target.value,
              );
              if (layout !== undefined) setLayout(layout);
            }}
          >
            {LAYOUT_PERSONALITIES.map((layout) => (
              <option value={layout} key={layout}>
                {formatCatalogLabel(layout)}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>02 / Visual style</span>
          <select
            value={configuration.ui}
            onChange={(event) => {
              const preset = UI_PRESETS.find(
                ({ id }) => id === event.target.value,
              );
              if (preset !== undefined) setUi(preset.id);
            }}
          >
            {UI_PRESETS.map((preset) => (
              <option value={preset.id} key={preset.id}>
                {preset.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>03 / Palette</span>
          <select
            value={configuration.theme}
            onChange={(event) => {
              const theme = event.target.value;
              if (isLabTheme(theme)) setTheme(theme);
            }}
          >
            <option value="native">Preset default</option>
            {UI_THEMES.map((theme) => (
              <option value={theme} key={theme}>
                {formatCatalogLabel(theme)}
              </option>
            ))}
          </select>
        </label>

        <fieldset>
          <legend>04 / Mode</legend>
          <div className="mode-options">
            {UI_MODES.map((mode) => (
              <label key={mode}>
                <input
                  type="radio"
                  name="mode"
                  value={mode}
                  checked={configuration.mode === mode}
                  onChange={(event) => {
                    const selectedMode = UI_MODES.find(
                      (value) => value === event.target.value,
                    );
                    if (selectedMode !== undefined) setMode(selectedMode);
                  }}
                />
                <span>{modeLabels[mode]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="control-actions ly-cluster ly-gap-2 ly-span-full ly-items-stretch">
          <button
            className="interactive-surface site-action"
            data-surface-variant="primary"
            data-surface-level="2"
            type="button"
            aria-label="Randomize configuration"
            onClick={randomizeConfiguration}
          >
            <SparkIcon />
            Randomize
          </button>
          <button
            className="interactive-surface site-action"
            data-surface-variant="subtle"
            data-surface-level="1"
            type="button"
            aria-label="Reset configuration"
            onClick={resetConfiguration}
          >
            Reset
          </button>
          <button
            className="interactive-surface site-action"
            data-surface-variant="subtle"
            data-surface-level="1"
            type="button"
            aria-label="Copy configuration"
            onClick={copyConfiguration}
          >
            <CopyIcon />
            <span>{copyLabel}</span>
          </button>
          <button
            className="interactive-surface site-action"
            data-surface-variant="subtle"
            data-surface-level="1"
            type="button"
            aria-label="Share configuration"
            onClick={shareConfiguration}
          >
            <ExternalLinkIcon />
            <span>{shareLabel}</span>
          </button>
        </div>
      </form>

      <div className="active-config" aria-label="Active configuration">
        <span>
          <b>Layout</b>
          {formatCatalogLabel(configuration.layout)}
        </span>
        <span>
          <b>Style</b>
          {UI_PRESETS.find(({ id }) => id === configuration.ui)?.label}
        </span>
        <span>
          <b>Palette</b>
          {formatThemeLabel(configuration.theme)}
        </span>
        <span>
          <b>Mode</b>
          {modeLabels[configuration.mode]}
        </span>
        <span className="live-status">Applied live</span>
      </div>

      <div className={`code-strip ${prefix}-surface ly-surface ly-pad-4`}>
        <div>
          <small>One shared contract. The palette override is optional.</small>
          <code tabIndex={0}>{markup}</code>
        </div>
      </div>

      {fallbackText !== null ? (
        <label>
          <span>Configuration text for manual copy</span>
          <textarea
            ref={fallbackRef}
            aria-label="Configuration text for manual copy"
            readOnly
            rows={7}
            spellCheck={false}
            value={fallbackText}
          />
        </label>
      ) : null}
    </aside>
  );
}
