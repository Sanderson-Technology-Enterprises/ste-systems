"use client";

import {
  Icon,
  type IconName,
} from "@sanderson-technology-enterprises/ste-usk-react";
import { withBasePath } from "../lib/site";

type LegacyIconProps = { className?: string };
const assetBase = withBasePath("/vendor/ui-style-kit-icons/");

/** Retains established call sites while rendering accessible published artwork. */
function DecorativeIcon({
  name,
  className,
}: LegacyIconProps & { name: IconName }) {
  /** The icon element sets its own loading and accessibility attributes before hydration. */
  return (
    <Icon
      name={name}
      className={className}
      assetBase={assetBase}
      suppressHydrationWarning
    />
  );
}

/** Published arrow artwork for forward navigation. */
export function ArrowRightIcon(props: LegacyIconProps) {
  return <DecorativeIcon name="arrow-right" {...props} />;
}
/** Published external-link artwork for off-site navigation. */
export function ExternalLinkIcon(props: LegacyIconProps) {
  return <DecorativeIcon name="external-link" {...props} />;
}
/** Published menu artwork for navigation disclosure. */
export function MenuIcon(props: LegacyIconProps) {
  return <DecorativeIcon name="menu" {...props} />;
}
/** Published settings artwork for configuration controls. */
export function SettingsIcon(props: LegacyIconProps) {
  return <DecorativeIcon name="settings" {...props} />;
}
/** Published copy artwork for export controls. */
export function CopyIcon(props: LegacyIconProps) {
  return <DecorativeIcon name="copy" {...props} />;
}
/** Published sparkle artwork for discovery actions. */
export function SparkIcon(props: LegacyIconProps) {
  return <DecorativeIcon name="sparkles" {...props} />;
}
