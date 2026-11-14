"use client";

import { useSyncExternalStore } from "react";
import {
  InterfaceRoot,
  Layout,
  Link,
} from "@sanderson-technology-enterprises/ste-usk-react";
import { consultationReturn } from "../../lib/consultation-bridge";

/** Observes browser history while keeping the server-rendered studio deterministic. */
function subscribe(callback: () => void) {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

/**
 * Connects a saved preference to its originating inquiry without sharing private URL data.
 * The stable editor theme owns link paint independently of the selected preview appearance.
 * @returns A themed consultation return, or nothing for an ordinary studio visit.
 */
export function ConsultationBridge() {
  const destination = useSyncExternalStore(
    subscribe,
    () => consultationReturn(window.location.search),
    () => null,
  );
  if (!destination) return null;
  return (
    <InterfaceRoot preset="minimal-saas" theme="native" mode="dark">
      <Layout.Stack as="aside" gap={2} aria-label="Your consultation">
        <Link className="interactive-surface" href={destination}>
          Return to your consultation at Customized Platforms
        </Link>
        <p>
          Download your design file in Review and save, then open it with your
          inquiry to include its summary. Keep the complete file for the
          meeting.
        </p>
      </Layout.Stack>
    </InterfaceRoot>
  );
}
