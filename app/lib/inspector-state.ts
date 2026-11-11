/** Inspector groups share one preview instead of owning independent configurations. */
export const INSPECTOR_GROUPS = [
  "Preview",
  "Style and colors",
  "Page layout",
  "Effects",
  "Compare",
  "Review and save",
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
  group: "Preview",
};

/**
 * Reserve the divider and a usable preview beside the inspector.
 * @param availableWidth Actual workbench content width in CSS pixels.
 * @returns Maximum expanded inspector width; narrow screens use a drawer instead.
 */
export function inspectorMaximum(availableWidth: number): number {
  return Math.max(240, availableWidth - 8 - 360);
}

/**
 * Apply split-view snapping while keeping the expanded panel's content readable.
 * @param candidate Raw pointer-requested inspector width, excluding the divider.
 * @param wasOpen Current snap state; a half-minimum threshold prevents jitter.
 * @param availableWidth Workbench width before subtracting its divider and preview.
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
    if (value && typeof value === "object") {
      const legacyGroups: Record<string, InspectorGroup> = {
        Appearance: "Style and colors",
        Layout: "Page layout",
        Interaction: "Effects",
        Motion: "Effects",
        Export: "Review and save",
      };
      value.group = legacyGroups[value.group] ?? value.group;
    }
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
