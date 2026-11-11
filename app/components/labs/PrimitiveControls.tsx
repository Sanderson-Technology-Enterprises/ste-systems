"use client";
import { Form, Layout } from "@sanderson-technology-enterprises/ste-usk-react";
import type { PrimitiveConfiguration } from "./LayoutExplorer";

/** A complete starting point for the shared structural preview. */
export const DEFAULT_PRIMITIVE: PrimitiveConfiguration = {
  primitive: "grid",
  gap: 3,
  padding: 2,
  align: "stretch",
  justify: "start",
  columns: "auto",
  ratio: "16x9",
  scroll: "bounded",
};

/**
 * Expose verified primitive geometry outside the styled preview so controls stay stable.
 * @param props Current structural settings and an atomic configuration callback.
 * @returns Library form controls covering all installed structural primitives.
 */
export function PrimitiveControls({
  value,
  onChange,
}: {
  value: PrimitiveConfiguration;
  onChange: (next: PrimitiveConfiguration) => void;
}) {
  const fields = [
    [
      "primitive",
      "Layout primitive",
      [
        "page",
        "header",
        "footer",
        "main",
        "section",
        "surface",
        "readable",
        "stack",
        "cluster",
        "center",
        "cover",
        "switcher",
        "sidebar",
        "grid",
        "mosaic",
        "action-bar",
        "split",
        "panes",
        "media",
        "reel",
        "frame",
        "scroll",
      ],
    ],
    ["gap", "Primitive gap", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]],
    ["padding", "Primitive padding", [0, 2, 4, 6, 8]],
    ["align", "Primitive alignment", ["start", "center", "end", "stretch"]],
    [
      "justify",
      "Primitive distribution",
      ["start", "center", "end", "between"],
    ],
    ["columns", "Grid columns", ["auto", 1, 2, 3, 4, 6, 12]],
    ["ratio", "Frame ratio", ["1x1", "3x2", "4x3", "16x9", "21x9"]],
    ["scroll", "Scroll limit", ["none", "bounded", "viewport"]],
  ] as const;
  return (
    <Layout.Stack gap={3}>
      {fields.map(([key, label, options]) => (
        <Form.Select
          className="interactive-surface"
          key={key}
          label={label}
          value={value[key]}
          onChange={(event) => {
            const selected = event.target.value;
            onChange({
              ...value,
              [key]:
                key === "gap" ||
                key === "padding" ||
                (key === "columns" && selected !== "auto")
                  ? Number(selected)
                  : selected,
            });
          }}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Form.Select>
      ))}
      <p>
        Zero padding retains the 2px content safety minimum in the preview and
        copied markup.
      </p>
    </Layout.Stack>
  );
}
