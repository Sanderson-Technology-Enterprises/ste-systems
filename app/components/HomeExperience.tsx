"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  InterfaceRoot,
  type InterfaceMode,
} from "@sanderson-technology-enterprises/ste-usk-react";
import { DEFAULT_CONFIGURATION } from "../lib/configuration";

/**
 * Keep the homepage interactive while previewing its supported color modes.
 * The site-mode query is separate from legacy Lab configuration URLs and storage.
 * @param props Server-rendered homepage content.
 * @returns The public interface root with the requested site presentation.
 */
export function HomeExperience({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<InterfaceMode>(DEFAULT_CONFIGURATION.mode);
  useEffect(() => {
    const update = () => {
      const requested = new URLSearchParams(location.search).get("site-mode");
      setMode(
        requested === "light" || requested === "contrast"
          ? requested
          : DEFAULT_CONFIGURATION.mode,
      );
    };
    const frame = requestAnimationFrame(update);
    addEventListener("popstate", update);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("popstate", update);
    };
  }, []);
  return (
    <InterfaceRoot
      className="experience home-experience ly-page"
      density="spacious"
      layout={DEFAULT_CONFIGURATION.layout}
      preset={DEFAULT_CONFIGURATION.ui}
      theme={DEFAULT_CONFIGURATION.theme}
      mode={mode}
    >
      {children}
    </InterfaceRoot>
  );
}
