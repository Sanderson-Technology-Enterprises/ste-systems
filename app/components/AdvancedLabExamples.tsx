"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { InterfaceRoot } from "@sanderson-technology-enterprises/ste-usk-react";
import { useLabConfiguration } from "./LabExperience";

/**
 * Defer detailed developer specimens until requested, using the same client state.
 * These roots are siblings of the stable editor rather than descendants of its preset.
 * @param props Disclosure title, optional legacy fragment, and existing examples.
 * @returns A progressively disclosed, independently painted configuration specimen.
 */
export function AdvancedLabExamples({
  title,
  anchor,
  children,
}: {
  title: string;
  anchor?: string;
  children: ReactNode;
}) {
  const { configuration } = useLabConfiguration();
  const [open, setOpen] = useState(false);
  const disclosure = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const followAnchor = () => {
      if (anchor && location.hash === `#${anchor}`) setOpen(true);
    };
    const frame = requestAnimationFrame(followAnchor);
    addEventListener("hashchange", followAnchor);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("hashchange", followAnchor);
    };
  }, [anchor]);
  useEffect(() => {
    if (!open || !anchor || location.hash !== `#${anchor}`) return;
    const frame = requestAnimationFrame(() =>
      disclosure.current?.scrollIntoView({ block: "start" }),
    );
    return () => cancelAnimationFrame(frame);
  }, [anchor, open]);
  return (
    <details
      ref={disclosure}
      className="advanced-lab-examples ly-wrapper"
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary>{title}</summary>
      {open && (
        <InterfaceRoot
          preset={configuration.ui}
          theme={
            configuration.theme === "native" ? undefined : configuration.theme
          }
          mode={configuration.mode}
          layout={configuration.layout}
          density={configuration.density ?? "normal"}
          data-advanced-configuration
        >
          {children}
        </InterfaceRoot>
      )}
    </details>
  );
}
