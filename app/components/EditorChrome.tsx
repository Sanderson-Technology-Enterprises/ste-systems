"use client";

/**
 * Keep the third-party client-context barrel behind an explicit Next.js boundary.
 * Server-rendered route content can pass through without becoming client-owned.
 * @module EditorChrome
 */
export { InterfaceRoot as EditorChrome } from "@sanderson-technology-enterprises/ste-usk-react";
