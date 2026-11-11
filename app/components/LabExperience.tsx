"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  UI_PRESETS,
  LAYOUT_PERSONALITIES,
  UI_THEMES,
  UI_MODES,
  LAYOUT_RECIPES,
  type LayoutPersonality,
  type LayoutRecipe,
  type UiMode,
  type UiPreset,
} from "../data/catalog";
import {
  formatThemeLabel,
  type LabTheme,
  type LabConfiguration,
} from "../lib/configuration";
import { createDesignPlan } from "../lib/design-plan";
import { DesignPlanProvider, useDesignPlan } from "./DesignPlanProvider";

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

/** Bridges the established lab API to the sole durable client design document. */
function LabAdapter({ children, stableEditor = false }: LabExperienceProps) {
  const { plan, updateDesign, announce } = useDesignPlan();
  const configuration = plan.design.configuration;
  const configure = (patch: Partial<LabConfiguration>) => {
    updateDesign({ configuration: { ...configuration, ...patch } });
    announce(
      "Design updated. " +
        (patch.ui
          ? UI_PRESETS.find((p) => p.id === patch.ui)?.label
          : patch.theme
            ? formatThemeLabel(patch.theme)
            : ""),
    );
  };
  const pick = <T,>(values: readonly T[]) =>
    values[Math.floor(Math.random() * values.length)];
  const value: LabConfigurationContextValue = {
    configuration,
    requestedConfiguration: configuration,
    announce,
    configure,
    setLayout: (layout) => configure({ layout }),
    setUi: (ui) => configure({ ui }),
    setTheme: (theme) => configure({ theme }),
    setMode: (mode) => configure({ mode }),
    setRecipe: (recipe) => configure({ recipe }),
    setDensity: (density) => configure({ density }),
    randomizeConfiguration: () =>
      configure({
        layout: pick(LAYOUT_PERSONALITIES),
        ui: pick(UI_PRESETS).id,
        theme: pick(UI_THEMES),
        mode: pick(UI_MODES),
        recipe: pick(LAYOUT_RECIPES),
        density: pick(["compact", "normal", "spacious"] as const),
      }),
    resetConfiguration: () =>
      configure(createDesignPlan().design.configuration),
    applyPreviewChange: async (apply) => {
      apply();
    },
    interruptPreviewChange: () => {},
  };
  return (
    <LabConfigurationContext.Provider value={value}>
      <div
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
      </div>
    </LabConfigurationContext.Provider>
  );
}

/** Supplies canonical plan ownership while preserving existing lab consumers. */
export function LabExperience(props: LabExperienceProps) {
  return (
    <DesignPlanProvider>
      <LabAdapter {...props} />
    </DesignPlanProvider>
  );
}

/** Reads the compatibility API backed by the current DesignPlan. */
export function useLabConfiguration(): LabConfigurationContextValue {
  const context = useContext(LabConfigurationContext);
  if (!context)
    throw new Error("useLabConfiguration must be used within LabExperience.");
  return context;
}
