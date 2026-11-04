"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Form,
  Layout,
} from "@sanderson-technology-enterprises/ste-usk-react";
import { getUiPrefix, type UiPreset } from "../data/catalog";
import {
  buildThemeExport,
  colorToHex,
  hexToChannels,
} from "../lib/playground-options";

/** Shared theme roles published by the installed UI Style Kit theme contract. */
export const SHARED_COLOR_ROLES =
  "bg surface surface-strong surface-soft text text-muted border primary primary-hover primary-text secondary secondary-hover secondary-text accent accent-text success success-text warning warning-text danger danger-text link focus".split(
    " ",
  );

/** Inputs needed to edit and export the actual active preview palette. */
interface CustomThemeEditorProps {
  preset: UiPreset;
  theme: string;
  mode: string;
  getRoot: () => HTMLElement | null;
  onApply: (variables: Record<string, string>) => void;
}

/**
 * Read concrete, public RGB roles from the selected named or native scheme.
 * Native material roles are discovered from the active preset's computed tokens.
 * @param root Scoped preview whose paint is being edited.
 * @param preset Installed UI Style Kit preset identifier.
 * @param theme Named theme or the native-scheme sentinel.
 * @returns Hexadecimal drafts keyed by the correct owning CSS variable.
 */
function readPalette(
  root: HTMLElement,
  preset: UiPreset,
  theme: string,
): Record<string, string> {
  const styles = getComputedStyle(root);
  const prefix = theme === "native" ? getUiPrefix(preset) : "usk";
  const names = new Set(
    SHARED_COLOR_ROLES.map((role) => `--${prefix}-${role}-rgb`),
  );
  if (theme === "native")
    for (const name of Array.from(styles)) {
      if (
        name.startsWith(`--${prefix}-`) &&
        name.endsWith("-rgb") &&
        !name.includes("-fallback-")
      )
        names.add(name);
    }
  const colors: Record<string, string> = {};
  for (const name of names) {
    try {
      colors[name] = colorToHex(styles.getPropertyValue(name));
    } catch {
      /* Non-color material expressions are not editable RGB roles. */
    }
  }
  return colors;
}

/**
 * Edit every active palette role and copy a client-ready variable object or CSS.
 * @param props Current palette scope and the preview's apply boundary.
 * @returns A local color editor with native pickers, hex fields, and copy fallback.
 */
export function CustomThemeEditor({
  preset,
  theme,
  mode,
  getRoot,
  onApply,
}: CustomThemeEditorProps) {
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [name, setName] = useState("Client theme");
  const [format, setFormat] = useState<"json" | "css">("json");
  const [notice, setNotice] = useState({ text: "", revision: 0 });
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const root = getRoot();
      if (root) setDraft(readPalette(root, preset, theme));
    });
    return () => cancelAnimationFrame(frame);
  }, [getRoot, preset, theme, mode]);
  const exported = useMemo(() => {
    try {
      if (!Object.keys(draft).length) return null;
      const variables = Object.fromEntries(
        Object.entries(draft).map(([key, value]) => [
          key,
          hexToChannels(value),
        ]),
      );
      return {
        ...buildThemeExport({ name, preset, theme, mode, variables }),
        variables,
      };
    } catch {
      return null;
    }
  }, [draft, name, preset, theme, mode]);
  const announce = (text: string) =>
    setNotice((current) => ({ text, revision: current.revision + 1 }));
  const copy = async (format: "json" | "css") => {
    if (!exported) return;
    setFormat(format);
    try {
      await navigator.clipboard.writeText(exported[format]);
      announce(
        format === "json" ? "Theme variables copied." : "Theme CSS copied.",
      );
    } catch {
      announce(
        "Clipboard unavailable. Select the theme export below to copy it manually.",
      );
    }
  };
  const prefix = theme === "native" ? getUiPrefix(preset) : "usk";
  return (
    <details className="ly-stack ly-gap-3" data-custom-theme-editor>
      <summary>Custom colors & client theme export</summary>
      <div className="ly-stack ly-gap-4 ly-pad-4">
        <p>
          Edit the active palette, apply it to the preview, then copy its
          variables to share your custom theme. Changes stay in this browser
          session.
        </p>
        <Form.Input
          label="Custom theme name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Layout.Grid minColumnWidth="12rem" gap={3}>
          {Object.entries(draft).map(([token, value]) => {
            const role = token.slice(prefix.length + 3, -4);
            const label = role
              .replaceAll("-", " ")
              .replace(/^./, (char) => char.toUpperCase());
            const valid = /^#[a-f\d]{6}$/i.test(value);
            return (
              <div key={token} className="ly-stack ly-gap-2">
                <Form.Input
                  label={`${label} color`}
                  type="color"
                  value={valid ? value : "#000000"}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      [token]: event.target.value,
                    }))
                  }
                />
                <Form.Input
                  label={`${label} hex`}
                  value={value}
                  maxLength={7}
                  error={
                    valid
                      ? undefined
                      : "Use # followed by six hexadecimal digits."
                  }
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      [token]: event.target.value,
                    }))
                  }
                />
                <code>{token}</code>
              </div>
            );
          })}
        </Layout.Grid>
        <Layout.Cluster gap={3}>
          <Button
            disabled={!exported}
            onClick={() => {
              if (exported) {
                onApply(exported.variables);
                announce("Custom colors applied to the preview.");
              }
            }}
          >
            Apply custom colors
          </Button>
          <Button
            variant="secondary"
            disabled={!exported}
            onClick={() => void copy("json")}
          >
            Copy variables JSON
          </Button>
          <Button
            variant="secondary"
            disabled={!exported}
            onClick={() => void copy("css")}
          >
            Copy theme CSS
          </Button>
        </Layout.Cluster>
        <p role="status" aria-live="polite">
          <span key={notice.revision}>{notice.text}</span>
        </p>
        <Form.TextArea
          label="Custom theme variables"
          value={
            exported?.[format] ?? "Enter valid colors to create an export."
          }
          readOnly
          rows={8}
        />
        <p>
          Add the exported CSS after your library styles and apply{" "}
          <code>client-custom-theme</code> to the same themed root. Named-theme
          exports use shared roles; native exports retain the selected preset’s
          material roles.
        </p>
      </div>
    </details>
  );
}
