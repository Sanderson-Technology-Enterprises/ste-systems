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
  const [status, setStatus] = useState({ message: "", revision: 0 });
  /** Replace the announcement node so repeated results remain observable to assistive technology. */
  function announce(message: string) {
    setStatus((current) => ({ message, revision: current.revision + 1 }));
  }
  /** Copy failures leave selectable source in place rather than claiming success. */
  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      announce("Copied.");
    } catch {
      announce("Clipboard unavailable. Select the code and copy it manually.");
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
      <p role="status" aria-atomic="true">
        {status.message && <span key={status.revision}>{status.message}</span>}
      </p>
    </div>
  );
}
