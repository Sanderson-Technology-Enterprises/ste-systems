"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import {
  Badge,
  Button,
  Card,
  Form,
  Layout,
  type LayoutAlign,
  type LayoutColumns,
  type LayoutGap,
  type LayoutJustify,
  type LayoutPadding,
  type LayoutFrameRatio,
  type LayoutScrollLimit,
} from "@sanderson-technology-enterprises/ste-usk-react";
import { useConfigurationMotion } from "../useConfigurationMotion";

/** Every primitive published by layout-style-css 3.2.3 has a public React adapter. */
const primitives = {
  page: Layout.Page,
  header: Layout.Header,
  footer: Layout.Footer,
  main: Layout.Main,
  section: Layout.Section,
  surface: Layout.Surface,
  readable: Layout.Readable,
  stack: Layout.Stack,
  cluster: Layout.Cluster,
  center: Layout.Center,
  cover: Layout.Cover,
  switcher: Layout.Switcher,
  sidebar: Layout.Sidebar,
  grid: Layout.Grid,
  mosaic: Layout.Mosaic,
  "action-bar": Layout.ActionBar,
  split: Layout.Split,
  panes: Layout.Panes,
  media: Layout.Media,
  reel: Layout.Reel,
  frame: Layout.Frame,
  scroll: Layout.Scroll,
};

/** Structural choices belong to Layout Style CSS, independent of visual paint. */
export interface PrimitiveConfiguration {
  primitive: keyof typeof primitives;
  gap: LayoutGap;
  padding: LayoutPadding;
  align: LayoutAlign;
  justify: LayoutJustify;
  columns: LayoutColumns | "auto";
  ratio: LayoutFrameRatio;
  scroll: LayoutScrollLimit;
}

/**
 * Expose all installed layout primitives and their common public geometry options.
 * @returns A bounded, animated structural preview with copyable rendered markup.
 */
export function LayoutExplorer({
  value,
  showControls = true,
  expanded = false,
}: {
  value?: PrimitiveConfiguration;
  showControls?: boolean;
  expanded?: boolean;
}) {
  const initial: PrimitiveConfiguration = {
    primitive: "grid",
    gap: 3,
    padding: 2,
    align: "stretch",
    justify: "start",
    columns: "auto",
    ratio: "16x9",
    scroll: "bounded",
  };
  const [requested, setRequested] = useState(initial);
  const [configuration, setConfiguration] = useState(initial);
  const latest = useRef(initial);
  const shell = useRef<HTMLDivElement>(null);
  const getShell = useCallback(() => shell.current, []);
  const { transition } = useConfigurationMotion(getShell);
  const [markup, setMarkup] = useState("");
  const [notice, setNotice] = useState("");
  const update = (patch: Partial<PrimitiveConfiguration>) => {
    const next = { ...latest.current, ...patch };
    latest.current = next;
    setRequested(next);
    void transition(() => setConfiguration(next));
  };
  const sample = (index: number): ReactNode => (
    <Card key={index} spacing="compact">
      <Card.Body>
        <Badge>Region {index}</Badge>
        <p>Library-owned structure and active preset paint.</p>
      </Card.Body>
    </Card>
  );
  const active = value ?? configuration;
  const { primitive, gap, padding, align, justify } = active;
  const Primitive = primitives[primitive];
  let children: ReactNode = [1, 2, 3].map(sample);
  if (primitive === "sidebar")
    children = (
      <>
        <Layout.SidebarItem position="side">{sample(1)}</Layout.SidebarItem>
        <Layout.SidebarItem position="content">{sample(2)}</Layout.SidebarItem>
      </>
    );
  if (primitive === "cover")
    children = <Layout.CoverCenter>{sample(1)}</Layout.CoverCenter>;
  if (primitive === "frame")
    children = (
      <Layout.Center>
        <Badge>{active.ratio} aspect ratio</Badge>
      </Layout.Center>
    );
  if (primitive === "action-bar")
    children = (
      <>
        <Layout.ActionGroup position="start">
          <Badge>Start actions</Badge>
        </Layout.ActionGroup>
        <Layout.ActionGroup position="end">
          <Badge>End actions</Badge>
        </Layout.ActionGroup>
      </>
    );
  if (primitive === "scroll")
    children = Array.from({ length: 12 }, (_, index) => sample(index + 1));
  if (primitive === "media")
    children = (
      <>
        {sample(1)}
        <Layout.MediaActions>
          <Badge>Actions</Badge>
        </Layout.MediaActions>
      </>
    );
  if (primitive === "mosaic")
    children = [1, 2, 3].map((index) => (
      <Layout.Item key={index} span={index === 1 ? 6 : 3}>
        {sample(index)}
      </Layout.Item>
    ));
  const extra =
    primitive === "grid"
      ? {
          columns: active.columns === "auto" ? undefined : active.columns,
          minColumnWidth: "10rem",
        }
      : primitive === "frame"
        ? { ratio: active.ratio }
        : primitive === "scroll"
          ? { limit: active.scroll, maxBlockSize: "12rem" }
          : {};

  /** Copy library markup while excluding transient controller-owned attributes. */
  async function copyMarkup() {
    const source = shell.current?.querySelector<HTMLElement>(
      "[data-active-primitive]",
    );
    if (!source) return;
    const clone = source.cloneNode(true) as HTMLElement;
    for (const element of [
      clone,
      ...clone.querySelectorAll<HTMLElement>("*"),
    ]) {
      for (const attribute of Array.from(element.attributes))
        if (attribute.name.startsWith("data-ms-"))
          element.removeAttribute(attribute.name);
      element.classList.remove("ms-motion");
      for (const property of ["--ms-duration", "--ms-delay", "--ms-ease"])
        element.style.removeProperty(property);
    }
    const code = clone.outerHTML;
    setMarkup(code);
    try {
      await navigator.clipboard.writeText(code);
      setNotice("Layout markup copied.");
    } catch {
      setNotice("Select the rendered markup below to copy it manually.");
    }
  }
  return (
    <details
      className="ly-stack ly-gap-3"
      data-layout-explorer
      open={expanded || undefined}
    >
      <summary className="interactive-surface" hidden={!showControls}>
        Explore all {Object.keys(primitives).length} layout primitives
      </summary>
      <div className="ly-stack ly-gap-4 ly-pad-4">
        <p>
          Choose a structural primitive, tune its public options, and copy the
          actual rendered markup. Frame and bounded-scroll examples
          intentionally contain their content.
        </p>
        {showControls && (
          <Layout.Grid minColumnWidth="11rem" gap={3}>
            <Form.Select
              className="interactive-surface"
              label="Layout primitive"
              value={requested.primitive}
              onChange={(event) =>
                update({
                  primitive: event.target
                    .value as PrimitiveConfiguration["primitive"],
                })
              }
            >
              {Object.keys(primitives).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Form.Select>
            <Form.Select
              className="interactive-surface"
              label="Primitive gap"
              value={requested.gap}
              onChange={(event) =>
                update({ gap: Number(event.target.value) as LayoutGap })
              }
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Form.Select>
            <Form.Select
              className="interactive-surface"
              label="Primitive padding"
              value={requested.padding}
              onChange={(event) =>
                update({ padding: Number(event.target.value) as LayoutPadding })
              }
            >
              {[0, 2, 4, 6, 8].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Form.Select>
            <Form.Select
              className="interactive-surface"
              label="Primitive alignment"
              value={requested.align}
              onChange={(event) =>
                update({ align: event.target.value as LayoutAlign })
              }
            >
              {["start", "center", "end", "stretch"].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Form.Select>
            <Form.Select
              className="interactive-surface"
              label="Primitive distribution"
              value={requested.justify}
              onChange={(event) =>
                update({ justify: event.target.value as LayoutJustify })
              }
            >
              {["start", "center", "end", "between"].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Form.Select>
            <Form.Select
              className="interactive-surface"
              label="Grid columns"
              value={requested.columns}
              onChange={(event) =>
                update({
                  columns:
                    event.target.value === "auto"
                      ? "auto"
                      : (Number(event.target.value) as LayoutColumns),
                })
              }
            >
              <option value="auto">Auto-fit</option>
              {[1, 2, 3, 4, 6, 12].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Form.Select>
            <Form.Select
              className="interactive-surface"
              label="Frame ratio"
              value={requested.ratio}
              onChange={(event) =>
                update({ ratio: event.target.value as LayoutFrameRatio })
              }
            >
              {["1x1", "3x2", "4x3", "16x9", "21x9"].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Form.Select>
            <Form.Select
              className="interactive-surface"
              label="Scroll limit"
              value={requested.scroll}
              onChange={(event) =>
                update({ scroll: event.target.value as LayoutScrollLimit })
              }
            >
              {["none", "bounded", "viewport"].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Form.Select>
          </Layout.Grid>
        )}
        <Layout.Scroll limit="bounded" maxBlockSize="24rem">
          <div ref={shell} data-primitive-motion>
            <Primitive
              {...extra}
              as="div"
              gap={gap}
              padding={padding}
              align={align}
              justify={justify}
              style={padding === 0 ? { padding: "2px" } : undefined}
              data-active-primitive={primitive}
            >
              {children}
            </Primitive>
          </div>
        </Layout.Scroll>
        <Button variant="secondary" onClick={() => void copyMarkup()}>
          Copy layout markup
        </Button>
        <p role="status" aria-live="polite">
          {notice}
        </p>
        {markup && (
          <Form.TextArea
            className="interactive-surface"
            label="Rendered layout markup"
            value={markup}
            readOnly
            rows={5}
          />
        )}
      </div>
    </details>
  );
}
