# Client readability and clickable controls

The application wraps prose between words. It avoids automatic hyphenation and letter-level wrapping in the editor, previews, guides, and portals. Brand text keeps its intrinsic word width; the diagram caption no longer has a slot narrower than “combinations.”

At very narrow widths, a whole word remains reachable through horizontal scrolling. The document no longer clips it. Installation commands and technical snippets retain their formatting and scroll within their own boxes.

Footer package identifiers also scroll within their own region. Successful template selections use a live direction announcement without adding a banner above the preview, and concise mobile action labels retain descriptive accessible names. The preview stays visible near the top on desktop and phone.

Action icons use the installed icon element's public `--usk-icon-size` hook at `1.5em`, producing 24 px icons beside 16 px labels. Explicit large illustration sizes remain authoritative. Removed site-level dimensions previously capped package icons at `1.1em`.

Icon family and treatment now belong to **Style and colors**. Their saved document fields are unchanged. Reset appearance restores the icon defaults while retaining motion settings.

## Shared action boundaries

App-owned native links, buttons, disclosures, form controls, and activation labels opt into `interactive-surface`. Public Link, Tabs.Tab, SegmentedControl.Item, and Form control call sites pass the same class through their documented `className` prop. Public Button and the existing shared controls retain their package-owned interaction hooks. The authored HTML guide sample and generated integration fixtures opt in at their source too.

Interactive Surface CSS supplies pointer cursors, hover/press feedback, focus rings, disabled behavior, and reduced-motion handling. No DOM observer, post-hydration class injection, new interaction library, or duplicate stylesheet is used.

The native CSS inventories remain native examples driven by the installed public manifest and preset classes. The broader ownership audit includes those examples and the guide pages. Exact retained guide/navigation composition declarations are reviewed in `docs/lab-workbench-audit.json`; this adoption preserves their existing geometry and wrapper paint. The only direct UI Style Kit import is its manifest metadata; the application entry still imports each shared stylesheet once.

## Local verification

Focused checks in `tests/dev-browser/client-tweaks.spec.ts` cover whole-word brand/diagram rendering at 280–1440 px, icon dimensions in the editor and preview, saved selector placement and scoped resets, reachable preview text, and local command scrolling.

`tests/dev-browser/clickable-affordances.spec.ts` checks shared action classes across the homepage, studio, interactive guides, and static reference; it also proves pointer, hover feedback, keyboard focus, and disclosure activation. The focused fixture action check verifies the generated examples use the same class.

Formatting, lint, types, generated JSDoc, ownership review, and static-export verification are local checks. No full test suite, remote CI, commit, publication, or deployment is implied.
