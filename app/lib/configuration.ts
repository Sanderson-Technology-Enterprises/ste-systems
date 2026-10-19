import {
  LAYOUT_PERSONALITIES,
  UI_MODES,
  UI_PRESETS,
  UI_THEMES,
  type LayoutPersonality,
  type UiMode,
  type UiPreset,
  type UiTheme,
} from "../data/catalog";

/** The native sentinel selects a preset palette without changing the package theme inventory. */
export type LabTheme = UiTheme | "native";

/** Returns the user-facing name of the optional palette override. */
export function formatThemeLabel(theme: LabTheme): string {
  return theme === "native"
    ? "Preset default"
    : theme
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

export type LabConfiguration = {
  layout: LayoutPersonality;
  ui: UiPreset;
  theme: LabTheme;
  mode: UiMode;
};

export const CONFIGURATION_STORAGE_KEY =
  "interface-systems-lab:configuration:v1";

export const DEFAULT_CONFIGURATION: Readonly<LabConfiguration> = Object.freeze({
  layout: "bento",
  ui: "minimal-saas",
  theme: "midnight-gold",
  mode: "dark",
});

type StoredConfiguration = Partial<LabConfiguration>;

function isLayoutPersonality(value: unknown): value is LayoutPersonality {
  return (
    typeof value === "string" &&
    LAYOUT_PERSONALITIES.some((personality) => personality === value)
  );
}

function isUiPreset(value: unknown): value is UiPreset {
  return (
    typeof value === "string" &&
    UI_PRESETS.some((preset) => preset.id === value)
  );
}

/** Accepts the native sentinel or a named theme from the installed package catalog. */
export function isLabTheme(value: unknown): value is LabTheme {
  return (
    value === "native" ||
    (typeof value === "string" && UI_THEMES.some((theme) => theme === value))
  );
}

function isUiMode(value: unknown): value is UiMode {
  return typeof value === "string" && UI_MODES.some((mode) => mode === value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function resolveValue<T>(
  queryValue: string | null,
  storedValue: unknown,
  fallback: T,
  isValid: (value: unknown) => value is T,
): T {
  if (isValid(queryValue)) return queryValue;
  if (isValid(storedValue)) return storedValue;
  return fallback;
}

export function parseStoredConfiguration(
  value: string | null,
): StoredConfiguration | null {
  if (value === null) return null;

  try {
    const parsed: unknown = JSON.parse(value);
    if (!isRecord(parsed)) return null;

    // Persisted browser data is untrusted, so every field re-enters through
    // its published catalog before it can become application state.
    const configuration: StoredConfiguration = {};
    if (isLayoutPersonality(parsed.layout)) {
      configuration.layout = parsed.layout;
    }
    if (isUiPreset(parsed.ui)) configuration.ui = parsed.ui;
    if (isLabTheme(parsed.theme)) configuration.theme = parsed.theme;
    if (isUiMode(parsed.mode)) configuration.mode = parsed.mode;
    return configuration;
  } catch {
    return null;
  }
}

export function parseConfiguration(
  search: URLSearchParams,
  stored: StoredConfiguration | null = null,
): LabConfiguration {
  return {
    layout: resolveValue(
      search.get("layout"),
      stored?.layout,
      DEFAULT_CONFIGURATION.layout,
      isLayoutPersonality,
    ),
    ui: resolveValue(
      search.get("ui"),
      stored?.ui,
      DEFAULT_CONFIGURATION.ui,
      isUiPreset,
    ),
    theme: resolveValue(
      search.get("theme"),
      stored?.theme,
      DEFAULT_CONFIGURATION.theme,
      isLabTheme,
    ),
    mode: resolveValue(
      search.get("mode"),
      stored?.mode,
      DEFAULT_CONFIGURATION.mode,
      isUiMode,
    ),
  };
}

export function serializeConfiguration(
  configuration: LabConfiguration,
): URLSearchParams {
  const search = new URLSearchParams();
  search.set("layout", configuration.layout);
  search.set("ui", configuration.ui);
  search.set("theme", configuration.theme);
  search.set("mode", configuration.mode);
  return search;
}

/** Emits the selected library attributes, omitting the optional native-palette override. */
export function configurationMarkup(configuration: LabConfiguration): string {
  return `<main
  class="ly-root"
  data-ly-layout="${configuration.layout}"
  data-ui="${configuration.ui}"${configuration.theme === "native" ? "" : `\n  data-theme="${configuration.theme}"`}
  data-mode="${configuration.mode}"
></main>`;
}
