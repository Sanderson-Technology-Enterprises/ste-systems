"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { CopyIcon } from "../Icons";

export type AtlasReference = {
  readonly html: string;
  readonly label: string;
};

type AtlasSpecimenProps = {
  readonly children: ReactNode;
  readonly description: string;
  readonly inspectionKey: string;
  readonly references?: readonly AtlasReference[];
  readonly title: string;
};

type InspectedNode = AtlasReference & {
  readonly hasLayoutBox: boolean;
  readonly id: string;
  readonly left: number;
  readonly top: number;
};

type CopyStatus = "idle" | "copied" | "failed";

const markerTargetSize = 44;

function stripLabAttributes(element: Element): void {
  for (const attribute of [...element.attributes]) {
    if (attribute.name.startsWith("data-atlas-")) {
      element.removeAttribute(attribute.name);
    }
  }
  for (const descendant of element.querySelectorAll("*")) {
    for (const attribute of [...descendant.attributes]) {
      if (attribute.name.startsWith("data-atlas-")) {
        descendant.removeAttribute(attribute.name);
      }
    }
  }
}

function serializeConsumerMarkup(element: Element): string {
  const clone = element.cloneNode(true) as Element;
  stripLabAttributes(clone);
  return clone.outerHTML.replace(/></g, ">\n<");
}

function describeNode(element: Element, index: number): string {
  const identity = element.id
    ? `#${element.id}`
    : [...element.classList]
        .slice(0, 2)
        .map((name) => `.${name}`)
        .join("");
  return `<${element.tagName.toLowerCase()}>${identity || ` node ${index + 1}`}`;
}

function fallbackCopy(value: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.readOnly = true;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();

  try {
    return document.execCommand("copy");
  } finally {
    textarea.remove();
  }
}

/**
 * Renders one isolated component specimen with per-element HTML inspection,
 * no-layout reference rows, and an accessible copy disclosure.
 *
 * @param props - Specimen content, labels, and optional reference-only nodes.
 * @returns An inspectable Component Atlas card.
 */
export function AtlasSpecimen({
  children,
  description,
  inspectionKey,
  references = [],
  title,
}: AtlasSpecimenProps) {
  const codePanelId = useId();
  const copyTooltipId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [nodes, setNodes] = useState<readonly InspectedNode[]>([]);
  const [selected, setSelected] = useState<AtlasReference | null>(null);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");

  const measureNodes = useCallback(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage || !isVisible) return;

    const stageRect = stage.getBoundingClientRect();
    const elements = [root, ...root.querySelectorAll("*")].filter(
      (element) => !element.closest("[data-atlas-chrome]"),
    );
    const occupiedMarkers: Array<{ left: number; top: number }> = [];
    const nextNodes = elements.map((element, index) => {
      const rect = element.getBoundingClientRect();
      const hasLayoutBox =
        element.getClientRects().length > 0 &&
        (rect.width > 0 || rect.height > 0);
      const id = `${inspectionKey}-${index + 1}`;
      element.setAttribute("data-atlas-node", id);
      const baseLeft = Math.max(0, rect.left - stageRect.left - 14);
      const baseTop = Math.max(0, rect.top - stageRect.top - 14);
      let left = baseLeft;
      if (hasLayoutBox) {
        /** Reserve the full touch target, not just an approximate anchor cell. */
        let collision = occupiedMarkers.find(
          (marker) =>
            left < marker.left + markerTargetSize &&
            left + markerTargetSize > marker.left &&
            baseTop < marker.top + markerTargetSize &&
            baseTop + markerTargetSize > marker.top,
        );
        while (collision) {
          left = collision.left + markerTargetSize;
          collision = occupiedMarkers.find(
            (marker) =>
              left < marker.left + markerTargetSize &&
              left + markerTargetSize > marker.left &&
              baseTop < marker.top + markerTargetSize &&
              baseTop + markerTargetSize > marker.top,
          );
        }
        occupiedMarkers.push({ left, top: baseTop });
      }

      return {
        hasLayoutBox,
        html: serializeConsumerMarkup(element),
        id,
        label: describeNode(element, index),
        left,
        top: baseTop,
      };
    });

    setNodes(nextNodes);
  }, [inspectionKey, isVisible]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry?.isIntersecting ?? false),
      { rootMargin: "240px 0px", threshold: 0.01 },
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    measureNodes();
    const resizeObserver = new ResizeObserver(measureNodes);
    const root = rootRef.current;
    const stage = stageRef.current;
    if (stage) {
      resizeObserver.observe(stage);
      stage.addEventListener("scroll", measureNodes);
    }
    window.addEventListener("resize", measureNodes);

    return () => {
      resizeObserver.disconnect();
      stage?.removeEventListener("scroll", measureNodes);
      window.removeEventListener("resize", measureNodes);
      for (const element of root?.querySelectorAll("[data-atlas-node]") ?? []) {
        element.removeAttribute("data-atlas-node");
      }
    };
  }, [inspectionKey, isVisible, measureNodes]);

  useEffect(
    () => () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    },
    [],
  );

  const selectCode = (reference: AtlasReference) => {
    setSelected((current) =>
      current?.label === reference.label && current.html === reference.html
        ? null
        : reference,
    );
    setCopyStatus("idle");
  };

  const copySelectedCode = async () => {
    if (!selected) return;
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(selected.html);
      } else if (!fallbackCopy(selected.html)) {
        throw new Error("The fallback clipboard command was rejected.");
      }
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }

    resetTimerRef.current = setTimeout(() => setCopyStatus("idle"), 2400);
  };

  const noLayoutNodes = nodes.filter(({ hasLayoutBox }) => !hasLayoutBox);

  return (
    <article className="atlas-specimen" data-atlas-specimen={inspectionKey}>
      <header className="atlas-specimen-heading ly-stack ly-gap-2">
        <h3>{title}</h3>
        <p>{description}</p>
      </header>

      <div
        aria-label={`${title} specimen canvas`}
        className="atlas-stage"
        ref={stageRef}
        tabIndex={0}
      >
        <div className="atlas-specimen-root" ref={rootRef}>
          {children}
        </div>
        {isVisible
          ? nodes
              .filter(({ hasLayoutBox }) => hasLayoutBox)
              .map((node) => (
                <button
                  aria-controls={codePanelId}
                  aria-expanded={selected?.label === node.label}
                  aria-label={`View HTML for ${node.label}`}
                  className="atlas-code-marker"
                  data-atlas-chrome
                  key={node.id}
                  onClick={() => selectCode(node)}
                  style={{ left: node.left, top: node.top }}
                  title={`View HTML for ${node.label}`}
                  type="button"
                >
                  <span aria-hidden="true">&lt;/&gt;</span>
                </button>
              ))
          : null}
      </div>

      {noLayoutNodes.length > 0 || references.length > 0 ? (
        <div className="atlas-dom-outline" data-atlas-chrome>
          <p className="atlas-outline-label">DOM outline and reference nodes</p>
          <ul>
            {[...noLayoutNodes, ...references].map((reference, index) => (
              <li key={`${reference.label}-${index}`}>
                <code>{reference.label}</code>
                <button
                  aria-controls={codePanelId}
                  aria-expanded={selected?.label === reference.label}
                  aria-label={`View HTML for ${reference.label}`}
                  onClick={() => selectCode(reference)}
                  title={`View HTML for ${reference.label}`}
                  type="button"
                >
                  <span aria-hidden="true">&lt;/&gt;</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div
        className="atlas-code-disclosure"
        data-atlas-chrome
        hidden={!selected}
        id={codePanelId}
      >
        {selected ? (
          <>
            <div className="atlas-code-toolbar">
              <span>{selected.label}</span>
              <span className="atlas-copy-wrapper">
                <button
                  aria-describedby={copyTooltipId}
                  aria-label={
                    copyStatus === "copied" ? "HTML copied" : "Copy HTML"
                  }
                  className="atlas-copy-button"
                  data-copy-status={copyStatus}
                  onClick={copySelectedCode}
                  type="button"
                >
                  <CopyIcon />
                </button>
                <span
                  className="atlas-copy-tooltip"
                  id={copyTooltipId}
                  role="tooltip"
                >
                  {copyStatus === "copied" ? "Copied" : "Copy HTML"}
                </span>
              </span>
            </div>
            <pre tabIndex={0}>
              <code>{selected.html}</code>
            </pre>
            <p className="ly-visually-hidden" aria-live="polite">
              {copyStatus === "copied"
                ? "HTML copied to the clipboard."
                : copyStatus === "failed"
                  ? "Clipboard access failed. Select the visible HTML and copy it manually."
                  : ""}
            </p>
          </>
        ) : null}
      </div>
    </article>
  );
}
