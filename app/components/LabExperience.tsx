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
  LAYOUT_RECIPES,
  UI_MODES,
  UI_PRESETS,
  UI_THEMES,
  type LayoutPersonality,
  type LayoutRecipe,
  type UiMode,
  type UiPreset,
} from "../data/catalog";
import {
  CONFIGURATION_STORAGE_KEY,
  DEFAULT_CONFIGURATION,
  parseConfiguration,
  parseStoredConfiguration,
  serializeConfiguration,
  formatThemeLabel,
  type LabTheme,
  type LabConfiguration,
} from "../lib/configuration";
import { useConfigurationMotion } from "./useConfigurationMotion";

const configurationKeys = [
  "layout",
  "ui",
  "theme",
  "mode",
  "recipe",
  "density",
] as const;

type LabConfigurationContextValue = {
  configuration: LabConfiguration;
  requestedConfiguration: LabConfiguration;
  announce: (message: string) => void;
  randomizeConfiguration: () => void;
  resetConfiguration: () => void;
  setLayout: (layout: LayoutPersonality) => void;
  setMode: (mode: UiMode) => void;
  setTheme: (theme: LabTheme) => void;
  setUi: (ui: UiPreset) => void;
  setRecipe: (recipe: LayoutRecipe) => void;
  setDensity: (density: NonNullable<LabConfiguration["density"]>) => void;
  configure: (patch: Partial<LabConfiguration>) => void;
  applyPreviewChange: (apply: () => void) => Promise<void>;
  interruptPreviewChange: (commitPending?: boolean) => void;
};

type LabExperienceProps = {
  children: ReactNode;
  stableEditor?: boolean;
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
export function LabExperience({
  children,
  stableEditor = false,
}: LabExperienceProps) {
  const [configuration, setConfiguration] = useState<LabConfiguration>(() => ({
    ...DEFAULT_CONFIGURATION,
  }));
  const [announcement, setAnnouncement] = useState({
    message: "",
    revision: 0,
  });
  const configurationRef = useRef(configuration);
  const [requestedConfiguration, setRequestedConfiguration] =
    useState(configuration);
  const experienceRef = useRef<HTMLDivElement>(null);
  const getMotionShell = useCallback(
    () =>
      experienceRef.current?.querySelector<HTMLElement>(
        "[data-workbench-motion], [data-lab-configuration-motion]",
      ) ?? null,
    [],
  );
  const { transition, interrupt } = useConfigurationMotion(getMotionShell);

  const announce = useCallback((message: string) => {
    setAnnouncement((current) => ({
      message,
      revision: current.revision + 1,
    }));
  }, []);

  const commitConfiguration = useCallback(
    (nextConfiguration: LabConfiguration) => {
      configurationRef.current = nextConfiguration;
      setRequestedConfiguration(nextConfiguration);
      void transition(() => setConfiguration(nextConfiguration));
      persistConfiguration(nextConfiguration);
      replaceConfigurationUrl(nextConfiguration);
    },
    [transition],
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
      setRequestedConfiguration(hydratedConfiguration);
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

  /**
   * Commit one editor action atomically and announce every changed client field.
   * @param patch Configuration fields selected by the current editor action.
   */
  const configure = useCallback(
    (patch: Partial<LabConfiguration>) => {
      commitConfiguration({ ...configurationRef.current, ...patch });
      const messages: string[] = [];
      if (patch.layout !== undefined)
        messages.push(`Layout changed to ${formatCatalogLabel(patch.layout)}.`);
      if (patch.ui !== undefined) {
        const label =
          UI_PRESETS.find((preset) => preset.id === patch.ui)?.label ??
          patch.ui;
        messages.push(`Visual style changed to ${label}.`);
      }
      if (patch.theme !== undefined)
        messages.push(`Palette changed to ${formatThemeLabel(patch.theme)}.`);
      if (patch.mode !== undefined)
        messages.push(
          `Mode changed to ${patch.mode === "contrast" ? "High contrast" : formatCatalogLabel(patch.mode)}.`,
        );
      if (patch.recipe !== undefined)
        messages.push(`Recipe changed to ${formatCatalogLabel(patch.recipe)}.`);
      if (patch.density !== undefined)
        messages.push(`Spacing density changed to ${patch.density}.`);
      if (messages.length > 0) announce(messages.join(" "));
    },
    [announce, commitConfiguration],
  );

  const setLayout = useCallback(
    (layout: LayoutPersonality) => {
      configure({ layout });
    },
    [configure],
  );

  const setUi = useCallback(
    (ui: UiPreset) => {
      configure({ ui });
    },
    [configure],
  );

  const setTheme = useCallback(
    (theme: LabTheme) => {
      configure({ theme });
    },
    [configure],
  );

  const setMode = useCallback(
    (mode: UiMode) => {
      configure({ mode });
    },
    [configure],
  );

  const setRecipe = useCallback(
    (recipe: LayoutRecipe) => {
      configure({ recipe });
    },
    [configure],
  );

  const setDensity = useCallback(
    (density: NonNullable<LabConfiguration["density"]>) => {
      configure({ density });
    },
    [configure],
  );

  const randomizeConfiguration = useCallback(() => {
    const nextConfiguration: LabConfiguration = {
      layout: pickRandom(LAYOUT_PERSONALITIES),
      ui: pickRandom(UI_PRESETS).id,
      theme: pickRandom(UI_THEMES),
      mode: pickRandom(UI_MODES),
      recipe: pickRandom(LAYOUT_RECIPES),
      density: pickRandom(["compact", "normal", "spacious"] as const),
    };
    commitConfiguration(nextConfiguration);
    announce("A randomized interface configuration is ready.");
  }, [announce, commitConfiguration]);

  const resetConfiguration = useCallback(() => {
    const nextConfiguration: LabConfiguration = { ...DEFAULT_CONFIGURATION };
    configurationRef.current = nextConfiguration;
    setRequestedConfiguration(nextConfiguration);
    void transition(() => setConfiguration(nextConfiguration));
    removeStoredConfiguration();
    clearConfigurationUrl();
    announce("Configuration reset to the defaults.");
  }, [announce, transition]);

  const contextValue = useMemo<LabConfigurationContextValue>(
    () => ({
      configuration,
      requestedConfiguration,
      announce,
      randomizeConfiguration,
      resetConfiguration,
      setLayout,
      setMode,
      setTheme,
      setUi,
      setRecipe,
      setDensity,
      configure,
      applyPreviewChange: transition,
      interruptPreviewChange: interrupt,
    }),
    [
      configuration,
      requestedConfiguration,
      announce,
      randomizeConfiguration,
      resetConfiguration,
      setLayout,
      setMode,
      setTheme,
      setUi,
      setRecipe,
      setDensity,
      configure,
      transition,
      interrupt,
    ],
  );

  return (
    <LabConfigurationContext.Provider value={contextValue}>
      <div
        ref={experienceRef}
        className={`experience lab-experience ly-root ly-page${stableEditor ? " lab-editor-experience" : ""}`}
        data-ly-density={
          stableEditor ? "normal" : (configuration.density ?? "normal")
        }
        data-ly-layout={stableEditor ? "minimal-saas" : configuration.layout}
        data-ui={stableEditor ? undefined : configuration.ui}
        data-theme={
          stableEditor || configuration.theme === "native"
            ? undefined
            : configuration.theme
        }
        data-mode={stableEditor ? undefined : configuration.mode}
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
