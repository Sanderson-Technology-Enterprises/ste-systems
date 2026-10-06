"use client";

import { Button } from "@sanderson-technology-enterprises/ste-usk-react";
import { useEffect, useRef, useState } from "react";

import { SettingsIcon } from "./Icons";
import { LabControls } from "./LabControls";

const LAB_CONFIGURATION_PANEL_ID = "lab-configuration-panel";

/**
 * Presents the Lab configuration console as a compact header disclosure.
 *
 * @returns The icon trigger and its bounded configuration panel.
 */
export function LabConfigurationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const closeFromOutside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !menuRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    const closeFromEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      setIsOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", closeFromOutside);
    document.addEventListener("keydown", closeFromEscape);
    return () => {
      document.removeEventListener("pointerdown", closeFromOutside);
      document.removeEventListener("keydown", closeFromEscape);
    };
  }, [isOpen]);

  const triggerLabel = `${isOpen ? "Close" : "Open"} lab configuration`;

  return (
    <div className="lab-configuration-menu" ref={menuRef}>
      <Button
        ref={triggerRef}
        className="lab-configuration-toggle"
        iconOnly={<SettingsIcon />}
        surfaceLevel={2}
        surfaceVariant="accent"
        type="button"
        aria-controls={LAB_CONFIGURATION_PANEL_ID}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={triggerLabel}
        onClick={() => setIsOpen((currentState) => !currentState)}
      />

      <div
        className="lab-configuration-panel"
        data-ly-density="compact"
        id={LAB_CONFIGURATION_PANEL_ID}
        hidden={!isOpen}
      >
        <LabControls />
      </div>
    </div>
  );
}
