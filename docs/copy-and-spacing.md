# Site copy and spacing

Visitor-facing copy should explain what a library does before introducing its
implementation terms. Preserve package names, CSS attributes, API identifiers,
version ranges, and copyable examples. Describe sample workspaces as examples,
not evidence of a deployed client application.

STE USK React is used for parts of this website. STE-Core and STE-SDK are private
parts of the wider client application toolkit; their descriptions do not imply
that this site runs on them. Public service links point to Customized Platforms
and Sanderson Technology Enterprises LLC.

## Spacing ownership

Layout Style CSS owns page gutters and spacing. The shared React stylesheet is
still imported once in `app/layout.tsx`. Use `ly-pad-4` on the site-authored
guide examples, installation articles, integration cards, and company/status
panels. These native articles inherit a border from UI Style Kit CSS; the native
2px padding floor alone does not provide a comfortable text inset.

Keep the existing page wrappers. Do not compensate for panel padding by adding
global margins, changing theme styles, or suppressing document overflow. Code
examples may scroll horizontally inside their own bounded containers.

The responsive site navigation stays in a disclosure through 84rem. Its
JavaScript resize query and CSS breakpoint must change together. Above that
width, the brand has a 20rem maximum width so the legal name can wrap without
compressing navigation labels. The Lab and guide navigation retain their
existing disclosure presentation at every width.

## Focused verification

`tests/browser/copy-spacing.spec.ts` checks page gutters and editorial panel
padding from 320px to 1920px and checks the 404 recovery message. Existing guide
and route tests cover tab reflow and responsive layout. Run individual cases;
this review does not require the full browser suite.

The repository has no jsdoc2md generator configured. Maintain JSDoc-compatible
comments and this scoped documentation alongside the implementation.
