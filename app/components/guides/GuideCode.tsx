"use client";

import { useState } from "react";
import { Button } from "@sanderson-technology-enterprises/ste-usk-react";

/** Presents authored source with an accessible copy result and a manual fallback. */
export function GuideCode({
  code,
  language,
  id,
}: {
  readonly code: string;
  readonly language: "HTML" | "JSX" | "JavaScript" | "Shell";
  readonly id: string;
}) {
  const [status, setStatus] = useState("");
  /** Copy failures leave selectable source in place rather than claiming success. */
  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setStatus("Copied.");
    } catch {
      setStatus("Clipboard unavailable. Select the code and copy it manually.");
    }
  }
  return (
    <div className="guide-code" data-guide-code={id}>
      <div className="guide-code-toolbar">
        <span>{language}</span>
        <Button variant="ghost" onClick={copyCode}>
          Copy {language}
        </Button>
      </div>
      <pre tabIndex={0} aria-label={`${language} source`}>
        <code>{code}</code>
      </pre>
      <p role="status">{status}</p>
    </div>
  );
}
