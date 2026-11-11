"use client";

import {
  Form,
  Layout,
  Slider,
} from "@sanderson-technology-enterprises/ste-usk-react";
import {
  presets,
  type Direction,
  type Preset,
} from "@sanderson-technology-enterprises/motion-style-css";
import {
  MOTION_EASINGS,
  type MotionSettings as Settings,
} from "../lib/motion-settings";
import { useMotionPreferences } from "./MotionPreferences";

/**
 * Expose random/fixed settings for every supported motion timing slider.
 * @returns A disclosure containing shared automatic transition preferences.
 */
export function MotionSettings({ expanded = false }: { expanded?: boolean }) {
  const { settings, setSettings } = useMotionPreferences();
  const update = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setSettings((current) => ({ ...current, [key]: value }));
  return (
    <details
      className="ly-stack ly-gap-3"
      data-motion-settings
      open={expanded || undefined}
    >
      <summary className="interactive-surface">
        Motion settings · {settings.enabled ? "on" : "off"}
      </summary>
      <div className="ly-stack ly-gap-4 ly-pad-4">
        <Form.Toggle
          className="interactive-surface"
          label="Enable motion"
          checked={settings.enabled}
          onChange={(event) => update("enabled", event.target.checked)}
        />
        <Form.Toggle
          className="interactive-surface"
          label="Animate configuration changes"
          checked={settings.animateConfigurationChanges}
          onChange={(event) =>
            update("animateConfigurationChanges", event.target.checked)
          }
        />
        <p>
          Random discovery resolves into fixed values when saved in a design
          plan. Reduced motion always takes priority.
        </p>
        <Layout.Grid minColumnWidth="11rem" gap={3}>
          <Form.Select
            className="interactive-surface"
            label="Motion preset"
            value={settings.entrance}
            onChange={(event) =>
              update("entrance", event.target.value as Preset | "random")
            }
          >
            <option value="random">Random entrance</option>
            {presets.map((preset) => (
              <option key={preset} value={preset}>
                {preset}
              </option>
            ))}
          </Form.Select>
          <Form.Select
            className="interactive-surface"
            label="Exit preset"
            value={settings.exit}
            onChange={(event) =>
              update("exit", event.target.value as Preset | "random")
            }
          >
            <option value="random">Random exit</option>
            {presets.map((preset) => (
              <option key={preset} value={preset}>
                {preset}
              </option>
            ))}
          </Form.Select>
          <Form.Select
            className="interactive-surface"
            label="Motion direction"
            value={settings.direction}
            onChange={(event) =>
              update("direction", event.target.value as Direction | "random")
            }
          >
            <option value="random">Random direction</option>
            {["left", "right", "up", "down"].map((direction) => (
              <option key={direction} value={direction}>
                {direction}
              </option>
            ))}
          </Form.Select>
          <Form.Select
            className="interactive-surface"
            label="Motion easing"
            value={settings.easing}
            onChange={(event) => update("easing", event.target.value)}
          >
            <option value="random">Random easing</option>
            {MOTION_EASINGS.map((easing) => (
              <option key={easing} value={easing}>
                {easing}
              </option>
            ))}
          </Form.Select>
        </Layout.Grid>
        <Layout.Grid minColumnWidth="12rem" gap={3}>
          {(
            [
              {
                key: "duration",
                label: "Duration",
                min: 200,
                max: 1200,
                step: 50,
                fallback: 500,
              },
              {
                key: "delay",
                label: "Delay",
                min: 0,
                max: 300,
                step: 25,
                fallback: 0,
              },
              {
                key: "interval",
                label: "Stagger interval",
                min: 0,
                max: 200,
                step: 10,
                fallback: 70,
              },
            ] as const
          ).map(({ key, label, min, max, step, fallback }) => (
            <div key={key} className="ly-stack ly-gap-2">
              <Form.Checkbox
                className="interactive-surface"
                label={`Random ${label.toLowerCase()}`}
                checked={settings[key] === "random"}
                onChange={(event) =>
                  update(key, event.target.checked ? "random" : fallback)
                }
              />
              <Slider
                label={`${label} (ms)`}
                min={min}
                max={max}
                step={step}
                value={settings[key] === "random" ? fallback : settings[key]}
                disabled={settings[key] === "random"}
                showValue={settings[key] !== "random"}
                onChange={(event) => update(key, Number(event.target.value))}
              />
            </div>
          ))}
        </Layout.Grid>
      </div>
    </details>
  );
}
