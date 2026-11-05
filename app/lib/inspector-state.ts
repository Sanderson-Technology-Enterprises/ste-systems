/** Inspector groups share one preview instead of owning independent configurations. */
export const INSPECTOR_GROUPS = [
  "Appearance",
  "Layout",
  "Interaction",
  "Motion",
  "Export",
] as const;
export type InspectorGroup = (typeof INSPECTOR_GROUPS)[number];

/** Persistent editor preferences are deliberately separate from client theme exports. */
export interface InspectorPreferences {
  width: number;
  open: boolean;
  group: InspectorGroup;
}

export const INSPECTOR_STORAGE_KEY = "ste-systems:inspector:v1";
export const DEFAULT_INSPECTOR: Readonly<InspectorPreferences> = {
  width: 320,
  open: true,
  group: "Appearance",
};

/**
 * Reserve the activity rail, divider, and a usable preview when sizing the inspector.
 * @param availableWidth Actual workbench content width in CSS pixels.
 * @returns Maximum expanded inspector width; narrow screens use a drawer instead.
 */
export function inspectorMaximum(availableWidth: number): number {
  return Math.max(240, availableWidth - 48 - 8 - 360);
}

/**
 * Apply split-view snapping while keeping the expanded panel's content readable.
 * @param candidate Raw pointer-requested inspector width, excluding rail and divider.
 * @param wasOpen Current snap state; a half-minimum threshold prevents jitter.
 * @param availableWidth Workbench width before subtracting its rail and preview.
 * @returns Transient visibility and width; remembered width is committed separately.
 */
export function resizeInspector(
  candidate: number,
  wasOpen: boolean,
  availableWidth: number,
) {
  const open = wasOpen ? candidate >= 120 : candidate > 120;
  return {
    open,
    width: open
      ? Math.min(inspectorMaximum(availableWidth), Math.max(240, candidate))
      : 0,
  };
}

/**
 * Restore only valid editor preferences; malformed or unavailable storage is harmless.
 * @param stored JSON previously saved for this browser's inspector.
 * @returns A complete preference object without mutating shared defaults.
 */
export function parseInspectorPreferences(
  stored: string | null,
): InspectorPreferences {
  try {
    const value = JSON.parse(stored ?? "null");
    if (
      !value ||
      !Number.isFinite(value.width) ||
      value.width < 240 ||
      value.width > 10000 ||
      typeof value.open !== "boolean" ||
      !INSPECTOR_GROUPS.includes(value.group)
    )
      return { ...DEFAULT_INSPECTOR };
    return { width: value.width, open: value.open, group: value.group };
  } catch {
    return { ...DEFAULT_INSPECTOR };
  }
}
