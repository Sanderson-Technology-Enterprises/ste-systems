import type { Metadata } from "next";
import { StudioPreviewClient } from "../components/studio/StudioPreviewClient";

export const metadata: Metadata = {
  title: "Design preview",
  robots: { index: false, follow: false },
};

/** Exports a same-origin rendering surface that needs no server or client account. */
export default function StudioPreview() {
  return <StudioPreviewClient />;
}
