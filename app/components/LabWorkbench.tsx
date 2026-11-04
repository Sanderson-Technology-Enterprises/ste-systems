"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  Button,
  Form,
  InterfaceRoot,
  Layout,
  type LayoutWrapperMeasure,
} from "@sanderson-technology-enterprises/ste-usk-react";
import {
  cancel,
  enter,
  exit,
  stagger,
} from "@sanderson-technology-enterprises/motion-style-css";
import {
  LAYOUT_PERSONALITIES,
  LAYOUT_RECIPES,
  UI_PRESETS,
  UI_THEMES,
  type UiMode,
} from "../data/catalog";
import { SUPPORTED_COMBINATIONS_LABEL } from "../data/atlas";
import {
  configurationMarkup,
  formatThemeLabel,
  serializeConfiguration,
  type LabConfiguration,
} from "../lib/configuration";
import {
  interactionIntensity,
  type HoverIntensity,
} from "../lib/playground-options";
import { resolveMotionSettings } from "../lib/motion-settings";
import type { InspectorGroup } from "../lib/inspector-state";
import { useLabConfiguration } from "./LabExperience";
import { WorkbenchInspector } from "./WorkbenchInspector";
import { MotionShowcase } from "./labs/MotionShowcase";
import {
  LayoutExplorer,
  type PrimitiveConfiguration,
} from "./labs/LayoutExplorer";
import { DEFAULT_PRIMITIVE, PrimitiveControls } from "./labs/PrimitiveControls";
import { CombinedWorkbench } from "./CombinedWorkbench";
import { MotionSettings } from "./MotionSettings";
import { useMotionPreferences } from "./MotionPreferences";
import { CustomThemeEditor, SHARED_COLOR_ROLES } from "./CustomThemeEditor";

/** A preview view changes content, never the selected client configuration. */
type PreviewView = "components" | "application" | "primitives";

/**
 * Present all client configuration factors through one stable editor and preview.
 * Painted preview state comes from LabExperience; editor geometry has separate storage.
 * @returns The unified component, application, and structural workbench.
 */
export function LabWorkbench() {
  const {
    configuration,
    requestedConfiguration,
    configure,
    applyPreviewChange,
    interruptPreviewChange,
    resetConfiguration,
    randomizeConfiguration,
  } = useLabConfiguration();
  const { settings } = useMotionPreferences();
  const [view, setView] = useState<PreviewView>("components");
  const [wrapper, setWrapper] = useState<LayoutWrapperMeasure>("full");
  const [intensity, setIntensity] = useState<HoverIntensity>("balanced");
  const [level, setLevel] = useState<"mixed" | 1 | 2 | 3>("mixed");
  const [primitive, setPrimitive] = useState<PrimitiveConfiguration>({
    ...DEFAULT_PRIMITIVE,
  });
  const [target, setTarget] = useState("workspace");
  const [status, setStatus] = useState(
    "Ready. Configuration changes apply immediately.",
  );
  const [copy, setCopy] = useState("");
  const [customThemes, setCustomThemes] = useState<
    Record<string, Record<string, string>>
  >({});
  const root = useRef<HTMLDivElement>(null);
  const shell = useRef<HTMLDivElement>(null);
  const previewScroll = useRef<HTMLElement>(null);
  const playButton = useRef<HTMLButtonElement>(null);
  const generation = useRef({ request: 0 });
  const getRoot = useCallback(() => root.current, []);
  const scope = `${configuration.ui}:${configuration.theme}:${configuration.mode}`;
  const editorConfiguration = requestedConfiguration;
  // Exports must describe the effective preview even when legacy URLs omit defaults.
  const exportedConfiguration = {
    ...configuration,
    recipe: configuration.recipe ?? "card-grid",
    density: configuration.density ?? "normal",
  };

  /** Clear controller ownership without discarding sample data or selected settings. */
  function stop(reveal = true, commitPending = true) {
    interruptPreviewChange(commitPending);
    generation.current.request++;
    if (!shell.current) return;
    for (const item of [
      shell.current,
      ...shell.current.querySelectorAll<HTMLElement>("[data-motion-item]"),
    ]) {
      cancel(item);
      if (reveal) item.removeAttribute("data-ms-exited");
    }
  }
  useEffect(() => {
    const owned = shell.current;
    const operation = generation.current;
    return () => {
      operation.request++;
      if (owned) {
        cancel(owned);
        owned
          .querySelectorAll<HTMLElement>("[data-motion-item]")
          .forEach(cancel);
      }
    };
  }, []);

  /** Run manual motion only on the visible view's dedicated lifecycle shells. */
  async function play(phase: "in" | "out" | "stagger") {
    const replacing =
      shell.current?.hasAttribute("data-ms-phase") ||
      Boolean(
        shell.current?.querySelector("[data-motion-item][data-ms-phase]"),
      );
    stop();
    const element = shell.current;
    if (!element) return;
    if (!settings.enabled) {
      setStatus("Motion is off. Enable motion to play an effect.");
      return;
    }
    const request = ++generation.current.request;
    // Drain a cancelled CSS phase before attaching a same-name controller listener.
    // Otherwise the browser can deliver its queued animationcancel to the new owner.
    if (replacing)
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
    if (request !== generation.current.request || !element.isConnected) return;
    const effects = resolveMotionSettings(settings);
    const options = phase === "out" ? effects.out : effects.in;
    const items = [
      ...element.querySelectorAll<HTMLElement>(
        ".workbench-view:not([hidden]) [data-motion-item]",
      ),
    ];
    const selected =
      target === "featured" && view === "components"
        ? (element.querySelector<HTMLElement>("[data-motion-featured]") ??
          element)
        : element;
    if (phase === "out") playButton.current?.focus();
    setStatus("Playing motion.");
    try {
      const result =
        (phase === "stagger" || target === "panels") && items.length
          ? await stagger(items, {
              ...options,
              phase: phase === "out" ? "out" : "in",
              interval: effects.interval,
            })
          : await (phase === "out" ? exit : enter)(selected, options);
      if (request === generation.current.request)
        setStatus(
          `${phase === "out" ? "Exit" : phase === "stagger" ? "Choreography" : "Entrance"}: ${Array.isArray(result) ? [...new Set(result.map((item) => item.status))].join(", ") : result.status}.`,
        );
    } catch {
      if (request === generation.current.request) {
        stop();
        setStatus(
          "The effect could not complete. The preview remains available.",
        );
      }
    }
  }

  /** Merge atomic appearance edits through the provider's single transition owner. */
  function update(patch: Partial<LabConfiguration>) {
    stop(true, false);
    configure(patch);
  }
  async function copyText(text: string) {
    setCopy(text);
    try {
      await navigator.clipboard.writeText(text);
      setStatus("Copied. Share this configuration with your developer.");
    } catch {
      setStatus(
        "Clipboard unavailable. Select the export below to copy it manually.",
      );
    }
  }
  const paletteStyle =
    configuration.theme === "native"
      ? Object.fromEntries(
          SHARED_COLOR_ROLES.map((role) => [`--usk-${role}-rgb`, "initial"]),
        )
      : {};
  const previewStyle = {
    ...paletteStyle,
    ...customThemes[scope],
    ...interactionIntensity(intensity),
  } as CSSProperties;

  const controls = (group: InspectorGroup) => (
    <div className="inspector-controls">
      <section
        className="inspector-group ly-stack ly-gap-4"
        hidden={group !== "Appearance"}
        aria-label="Appearance controls"
      >
        <p>Style the preview while these editing controls stay consistent.</p>
        <Form.Select
          label="Visual style"
          value={editorConfiguration.ui}
          onChange={(event) =>
            update({ ui: event.target.value as LabConfiguration["ui"] })
          }
        >
          {UI_PRESETS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </Form.Select>
        <Form.Select
          label="Color scheme"
          value={editorConfiguration.theme}
          onChange={(event) =>
            update({ theme: event.target.value as LabConfiguration["theme"] })
          }
        >
          <option value="native">Preset default</option>
          {UI_THEMES.map((theme) => (
            <option key={theme} value={theme}>
              {formatThemeLabel(theme)}
            </option>
          ))}
        </Form.Select>
        <Form.Select
          label="Display mode"
          value={editorConfiguration.mode}
          onChange={(event) => update({ mode: event.target.value as UiMode })}
        >
          {["light", "dark", "contrast"].map((mode) => (
            <option key={mode} value={mode}>
              {mode === "contrast" ? "High contrast" : mode}
            </option>
          ))}
        </Form.Select>
        <Button
          variant="secondary"
          onClick={() => {
            stop();
            randomizeConfiguration();
          }}
        >
          Randomize configuration
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            stop();
            resetConfiguration();
          }}
        >
          Reset configuration
        </Button>
      </section>
      <section
        className="inspector-group ly-stack ly-gap-4"
        hidden={group !== "Layout"}
        aria-label="Layout controls"
      >
        <Form.Select
          label="Layout personality"
          value={editorConfiguration.layout}
          onChange={(event) =>
            update({ layout: event.target.value as LabConfiguration["layout"] })
          }
        >
          {LAYOUT_PERSONALITIES.map((item) => (
            <option key={item} value={item}>
              {item.replaceAll("-", " ")}
            </option>
          ))}
        </Form.Select>
        <Form.Select
          label="Recipe"
          value={editorConfiguration.recipe ?? "card-grid"}
          onChange={(event) =>
            update({ recipe: event.target.value as LabConfiguration["recipe"] })
          }
        >
          {LAYOUT_RECIPES.map((item) => (
            <option key={item} value={item}>
              {item.replaceAll("-", " ")}
            </option>
          ))}
        </Form.Select>
        <Form.Select
          label="Spacing density"
          value={editorConfiguration.density ?? "normal"}
          onChange={(event) =>
            update({
              density: event.target.value as LabConfiguration["density"],
            })
          }
        >
          {["compact", "normal", "spacious"].map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Form.Select>
        <Form.Select
          label="Wrapper size"
          value={wrapper}
          onChange={(event) => {
            stop();
            void applyPreviewChange(() =>
              setWrapper(event.target.value as LayoutWrapperMeasure),
            );
          }}
        >
          {[
            "compact",
            "prose",
            "content",
            "workspace",
            "wide",
            "full",
            "breakout",
          ].map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Form.Select>
        <Button
          variant="secondary"
          onClick={() => {
            stop();
            setView("primitives");
          }}
        >
          Explore layout primitives
        </Button>
        <PrimitiveControls
          value={primitive}
          onChange={(next) => {
            stop();
            void applyPreviewChange(() => setPrimitive(next));
          }}
        />
      </section>
      <section
        className="inspector-group ly-stack ly-gap-4"
        hidden={group !== "Interaction"}
        aria-label="Interaction controls"
      >
        <Form.Select
          label="Hover intensity"
          value={intensity}
          onChange={(event) =>
            setIntensity(event.target.value as HoverIntensity)
          }
        >
          {["none", "subtle", "balanced", "strong"].map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Form.Select>
        <Form.Select
          label="Surface elevation"
          value={level}
          onChange={(event) =>
            setLevel(
              event.target.value === "mixed"
                ? "mixed"
                : (Number(event.target.value) as 1 | 2 | 3),
            )
          }
        >
          <option value="mixed">Compare all three levels</option>
          {[1, 2, 3].map((item) => (
            <option key={item} value={item}>
              Level {item}
            </option>
          ))}
        </Form.Select>
        <p>
          Try success, error, and attention reflexes in the Feedback panel.
          Hover and focus controls to compare movement and depth.
        </p>
      </section>
      <section
        className="inspector-group ly-stack ly-gap-4"
        hidden={group !== "Motion"}
        aria-label="Motion controls"
      >
        <MotionSettings expanded />
        <Form.Select
          label="Motion target"
          value={target}
          onChange={(event) => {
            stop();
            setTarget(event.target.value);
          }}
        >
          <option value="workspace">Complete preview</option>
          <option value="panels" disabled={view !== "components"}>
            All component panels
          </option>
          <option value="featured" disabled={view !== "components"}>
            Featured card
          </option>
        </Form.Select>
        <Button ref={playButton} onClick={() => void play("in")}>
          Play entrance
        </Button>
        <Button variant="secondary" onClick={() => void play("out")}>
          Play exit
        </Button>
        <Button variant="secondary" onClick={() => void play("stagger")}>
          Play stagger
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            stop(false);
            setStatus("Motion cancelled.");
          }}
        >
          Cancel motion
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            stop();
            setStatus("Preview reset.");
          }}
        >
          Reset preview
        </Button>
      </section>
      <section
        className="inspector-group ly-stack ly-gap-4"
        hidden={group !== "Export"}
        aria-label="Export controls"
      >
        <CustomThemeEditor
          preset={configuration.ui}
          theme={configuration.theme}
          mode={configuration.mode}
          getRoot={getRoot}
          onApply={(variables) => {
            stop();
            void applyPreviewChange(() =>
              setCustomThemes((current) => ({
                ...current,
                [scope]: variables,
              })),
            );
          }}
        />
        <Button
          variant="secondary"
          onClick={() =>
            void copyText(
              JSON.stringify(
                {
                  configuration: exportedConfiguration,
                  wrapper,
                  intensity,
                  level,
                  primitive,
                  primitiveStyle:
                    primitive.padding === 0 ? { padding: "2px" } : {},
                  spacingPolicy: {
                    wrapperPaddingMin: "2px",
                    controlPaddingMin: "2px 3px",
                  },
                  motion: settings,
                  variables: customThemes[scope] ?? {},
                },
                null,
                2,
              ),
            )
          }
        >
          Copy configuration JSON
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            const url = new URL(location.href);
            url.search = serializeConfiguration(
              exportedConfiguration,
            ).toString();
            url.hash = "workbench";
            void copyText(url.href);
          }}
        >
          Copy configuration link
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            void copyText(configurationMarkup(exportedConfiguration))
          }
        >
          Copy root markup
        </Button>
        <p>
          Links include layout, style, palette, mode, recipe, and density. JSON
          also includes custom variables and the additional preview settings.
        </p>
        {copy && (
          <Form.TextArea
            label="Configuration export"
            readOnly
            value={copy}
            rows={8}
          />
        )}
      </section>
    </div>
  );

  return (
    <section
      id="workbench"
      className="unified-workbench"
      data-workbench
      aria-label="Client configuration workbench"
    >
      <WorkbenchInspector controls={controls}>
        <InterfaceRoot
          preset="minimal-saas"
          theme="midnight-gold"
          mode="dark"
          data-editor-chrome
          className="workbench-toolbar"
        >
          <h2 className="ly-visually-hidden">Live preview</h2>
          <div
            role="group"
            aria-label="Preview content"
            className="workbench-view-buttons"
          >
            {(
              [
                ["components", "Component showcase"],
                ["application", "Application workspace"],
                ["primitives", "Layout primitives"],
              ] as const
            ).map(([key, label]) => (
              <Button
                key={key}
                variant={view === key ? "primary" : "ghost"}
                aria-pressed={view === key}
                onClick={() => {
                  stop();
                  if (view !== key) previewScroll.current?.scrollTo(0, 0);
                  setView(key);
                  setTarget("workspace");
                }}
              >
                {label}
              </Button>
            ))}
          </div>
          <p>
            All {SUPPORTED_COMBINATIONS_LABEL} counted combinations · Live
            preview
          </p>
        </InterfaceRoot>
        <InterfaceRoot
          ref={root}
          preset={configuration.ui}
          theme={
            configuration.theme === "native" ? undefined : configuration.theme
          }
          mode={configuration.mode}
          layout={configuration.layout}
          density={configuration.density ?? "normal"}
          style={previewStyle}
          className="motion-browser workbench-preview"
          data-motion-browser
          data-workbench-preview
        >
          <div className="motion-browser-chrome ly-cluster ly-justify-between ly-gap-3 ly-pad-4">
            <span>preview.ste / {configuration.ui}</span>
            <span>Interactive sample · local data</span>
          </div>
          <Layout.Scroll
            ref={previewScroll}
            limit="none"
            role="region"
            aria-label="Live preview content"
            tabIndex={0}
            className="workbench-preview-scroll"
          >
            <div
              ref={shell}
              data-workbench-motion
              data-motion-preview="workbench"
              className="workbench-preview-content"
            >
              <Layout.Wrapper measure={wrapper}>
                <div className="workbench-view" hidden={view !== "components"}>
                  <MotionShowcase
                    embedded={false}
                    recipe={configuration.recipe ?? "card-grid"}
                    levelOverride={level === "mixed" ? undefined : level}
                  />
                </div>
                <div className="workbench-view" hidden={view !== "application"}>
                  <CombinedWorkbench embedded />
                </div>
                <div className="workbench-view" hidden={view !== "primitives"}>
                  <LayoutExplorer
                    value={primitive}
                    showControls={false}
                    expanded
                  />
                </div>
              </Layout.Wrapper>
            </div>
          </Layout.Scroll>
        </InterfaceRoot>
        <InterfaceRoot
          preset="minimal-saas"
          theme="midnight-gold"
          mode="dark"
          data-editor-chrome
          className="workbench-status"
        >
          <p role="status" aria-live="polite" data-motion-status>
            {status}
          </p>
        </InterfaceRoot>
      </WorkbenchInspector>
    </section>
  );
}
