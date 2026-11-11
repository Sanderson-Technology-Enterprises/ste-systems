"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  DEFAULT_MOTION_SETTINGS,
  type MotionSettings,
} from "../lib/motion-settings";

/** One session's explicitly selected overrides shared across the Lab and guides. */
const MotionContext = createContext<{
  settings: MotionSettings;
  setSettings: Dispatch<SetStateAction<MotionSettings>>;
} | null>(null);

/**
 * Keep motion choices above route-specific configuration and showcase controls.
 * @param props Route content rendered beneath the shared preferences context.
 * @returns A provider with randomized, enabled defaults and session-local overrides.
 */
export function MotionPreferences({
  children,
  value: controlled,
  onChange,
}: {
  children: ReactNode;
  value?: MotionSettings;
  onChange?: (settings: MotionSettings) => void;
}) {
  const [localSettings, setLocalSettings] = useState<MotionSettings>({
    ...DEFAULT_MOTION_SETTINGS,
  });
  const settings = controlled ?? localSettings;
  const value = useMemo(
    () => ({
      settings,
      setSettings: (change: SetStateAction<MotionSettings>) => {
        const next = typeof change === "function" ? change(settings) : change;
        if (onChange) onChange(next);
        else setLocalSettings(next);
      },
    }),
    [settings, onChange],
  );
  return (
    <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
  );
}

/**
 * Read and update the session's motion settings from a supported control surface.
 * @returns Shared settings and their React state updater.
 * @throws When used outside the application-level motion provider.
 */
export function useMotionPreferences() {
  const value = useContext(MotionContext);
  if (!value)
    throw new Error("Motion preferences require the application provider.");
  return value;
}
