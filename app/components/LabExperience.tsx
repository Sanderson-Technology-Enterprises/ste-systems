"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

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
import {
  CONFIGURATION_STORAGE_KEY,
  DEFAULT_CONFIGURATION,
  parseConfiguration,
  parseStoredConfiguration,
  serializeConfiguration,
  type LabConfiguration,
} from "../lib/configuration";

const configurationKeys = ["layout", "ui", "theme", "mode"] as const;

type LabConfigurationContextValue = {
  configuration: LabConfiguration;
  announce: (message: string) => void;
  randomizeConfiguration: () => void;
  resetConfiguration: () => void;
  setLayout: (layout: LayoutPersonality) => void;
  setMode: (mode: UiMode) => void;
  setTheme: (theme: UiTheme) => void;
  setUi: (ui: UiPreset) => void;
};

type LabExperienceProps = {
  children: ReactNode;
};

const LabConfigurationContext =
  createContext<LabConfigurationContextValue | null>(null);

function formatCatalogLabel(value: string): string {
  return value
    .split("-")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function pickRandom<T>(values: readonly T[]): T {
  const selection = values[Math.floor(Math.random() * values.length)];
  if (selection === undefined) {
    throw new Error("Cannot randomize an empty configuration catalog.");
  }
  return selection;
}

function persistConfiguration(configuration: LabConfiguration): void {
  try {
    window.localStorage.setItem(
      CONFIGURATION_STORAGE_KEY,
      JSON.stringify(configuration),
    );
  } catch {
    // URL state remains usable when storage is disabled or over quota.
  }
}

function removeStoredConfiguration(): void {
  try {
    window.localStorage.removeItem(CONFIGURATION_STORAGE_KEY);
  } catch {
    // Reset still updates in-memory and URL state when storage is unavailable.
  }
}

function replaceConfigurationUrl(configuration: LabConfiguration): void {
  const url = new URL(window.location.href);
  url.search = serializeConfiguration(configuration).toString();
  window.history.replaceState(window.history.state, "", url);
}

function clearConfigurationUrl(): void {
  const url = new URL(window.location.href);
  for (const key of configurationKeys) url.searchParams.delete(key);
  window.history.replaceState(window.history.state, "", url);
}

function sameConfiguration(
  left: LabConfiguration,
  right: LabConfiguration,
): boolean {
  return configurationKeys.every((key) => left[key] === right[key]);
}

/**
 * Provides the configurable Lab state and the normal-density Layout Style CSS
 * root shared by every laboratory section.
 *
 * @param props Component properties.
 * @param props.children Laboratory sections rendered inside the shared root.
 * @returns The configured STE Systems Lab experience.
 */
export function LabExperience({ children }: LabExperienceProps) {
  const [configuration, setConfiguration] = useState<LabConfiguration>(() => ({
    ...DEFAULT_CONFIGURATION,
  }));
  const [announcement, setAnnouncement] = useState({
    message: "",
    revision: 0,
  });
  const configurationRef = useRef(configuration);

  const announce = useCallback((message: string) => {
    setAnnouncement((current) => ({
      message,
      revision: current.revision + 1,
    }));
  }, []);

  const commitConfiguration = useCallback(
    (nextConfiguration: LabConfiguration) => {
      configurationRef.current = nextConfiguration;
      setConfiguration(nextConfiguration);
      persistConfiguration(nextConfiguration);
      replaceConfigurationUrl(nextConfiguration);
    },
    [],
  );

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    let storedValue: string | null = null;

    try {
      storedValue = window.localStorage.getItem(CONFIGURATION_STORAGE_KEY);
    } catch {
      // Storage reads can fail in privacy modes; URL/default state remains safe.
    }

    const storedConfiguration = parseStoredConfiguration(storedValue);
    const hydratedConfiguration = parseConfiguration(
      search,
      storedConfiguration,
    );
    const hasConfigurationQuery = configurationKeys.some((key) =>
      search.has(key),
    );
    const hasValidQuery = configurationKeys.some(
      (key) => search.get(key) === hydratedConfiguration[key],
    );
    const hasValidStorage =
      storedConfiguration !== null &&
      Object.keys(storedConfiguration).length > 0;

    if (!sameConfiguration(configurationRef.current, hydratedConfiguration)) {
      setConfiguration(hydratedConfiguration);
    }
    configurationRef.current = hydratedConfiguration;

    if (hasValidQuery || hasValidStorage) {
      persistConfiguration(hydratedConfiguration);
      if (hasConfigurationQuery) {
        replaceConfigurationUrl(hydratedConfiguration);
      }
      return;
    }

    if (storedValue !== null) removeStoredConfiguration();
    if (hasConfigurationQuery) clearConfigurationUrl();
  }, []);

  const setLayout = useCallback(
    (layout: LayoutPersonality) => {
      commitConfiguration({ ...configurationRef.current, layout });
      announce(`Layout changed to ${formatCatalogLabel(layout)}.`);
    },
    [announce, commitConfiguration],
  );

  const setUi = useCallback(
    (ui: UiPreset) => {
      commitConfiguration({ ...configurationRef.current, ui });
      const label = UI_PRESETS.find((preset) => preset.id === ui)?.label ?? ui;
      announce(`Visual style changed to ${label}.`);
    },
    [announce, commitConfiguration],
  );

  const setTheme = useCallback(
    (theme: UiTheme) => {
      commitConfiguration({ ...configurationRef.current, theme });
      announce(`Palette changed to ${formatCatalogLabel(theme)}.`);
    },
    [announce, commitConfiguration],
  );

  const setMode = useCallback(
    (mode: UiMode) => {
      commitConfiguration({ ...configurationRef.current, mode });
      const label =
        mode === "contrast" ? "High contrast" : formatCatalogLabel(mode);
      announce(`Mode changed to ${label}.`);
    },
    [announce, commitConfiguration],
  );

  const randomizeConfiguration = useCallback(() => {
    const nextConfiguration: LabConfiguration = {
      layout: pickRandom(LAYOUT_PERSONALITIES),
      ui: pickRandom(UI_PRESETS).id,
      theme: pickRandom(UI_THEMES),
      mode: pickRandom(UI_MODES),
    };
    commitConfiguration(nextConfiguration);
    announce("A randomized interface configuration is ready.");
  }, [announce, commitConfiguration]);

  const resetConfiguration = useCallback(() => {
    const nextConfiguration: LabConfiguration = { ...DEFAULT_CONFIGURATION };
    configurationRef.current = nextConfiguration;
    setConfiguration(nextConfiguration);
    removeStoredConfiguration();
    clearConfigurationUrl();
    announce("Configuration reset to the defaults.");
  }, [announce]);

  const contextValue = useMemo<LabConfigurationContextValue>(
    () => ({
      configuration,
      announce,
      randomizeConfiguration,
      resetConfiguration,
      setLayout,
      setMode,
      setTheme,
      setUi,
    }),
    [
      configuration,
      announce,
      randomizeConfiguration,
      resetConfiguration,
      setLayout,
      setMode,
      setTheme,
      setUi,
    ],
  );

  return (
    <LabConfigurationContext.Provider value={contextValue}>
      <div
        className="experience ly-root ly-page"
        data-ly-density="normal"
        data-ly-layout={configuration.layout}
        data-ui={configuration.ui}
        data-theme={configuration.theme}
        data-mode={configuration.mode}
      >
        {children}
        <p
          className="configuration-status ly-visually-hidden"
          aria-live="polite"
          aria-atomic="true"
        >
          <span key={announcement.revision}>{announcement.message}</span>
        </p>
      </div>
    </LabConfigurationContext.Provider>
  );
}

export function useLabConfiguration(): LabConfigurationContextValue {
  const context = useContext(LabConfigurationContext);
  if (context === null) {
    throw new Error("useLabConfiguration must be used within LabExperience.");
  }
  return context;
}
