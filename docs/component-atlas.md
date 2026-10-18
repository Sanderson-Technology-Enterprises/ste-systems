# Components and library guides

The `/components/` route contains four curated mini-guides: Layout Style CSS,
UI Style Kit CSS, Interactive Surface CSS, and STE USK React. The existing
three-package CSS inventory and Lab remain separate from this documentation view.

`app/data/library-guides.ts` defines the four guides, setup instructions,
essential API tables, resources, and authored HTML examples. CSS setup reuses the
existing ecosystem adoption data. React metadata comes from the installed package.
The component guide links to the full `/lab/` using the existing base-path helper.

The default tab is Layout. Existing `#atlas-layout`, `#atlas-ui`, and
`#atlas-interaction` fragments remain supported; `#atlas-react` selects the React
guide. Tab changes replace the fragment without a page reload. Browser fragment
and history changes synchronize the selected panel. Invalid fragments default to
Layout. Appearance stays fixed; configuration belongs in the Lab.

Static CSS previews and their HTML code panels share authored markup. The
interaction snippet describes the initial native-control state; application
JavaScript owns the toggle. The React code panel reads the actual
`ReactProjectExample.tsx` module at build time, including imports and local state.
Import the package stylesheet once at the application entry, as shown separately
in the setup instructions. The React form is a local demonstration and sends no
data. Clipboard failures keep selectable code visible with a manual-copy message.

STE USK React supplies tabs, controls, and the composed React example. Direct CSS
examples intentionally retain native HTML to document standalone consumption.
On desktop, documentation and examples occupy separate columns. Narrow screens
stack those regions and keep the horizontal tab strip and code blocks scrollable.

Focused browser coverage is in `tests/browser/atlas.spec.ts`; accessibility checks
exercise all four panels without the former gallery's landmark exclusions.
Run individual tests with `--grep`. Finish with scoped formatting, lint, type and
build checks, then verify root and Pages-base-path navigation.

No jsdoc2md generation command is configured in this repository. Component source
comments remain JSDoc compatible. The public URL is preserved even though the
previous exhaustive gallery and per-node inspector have been removed.
