# Client studio repair — November 10, 2026

The reported local failure was reproduced in a browser before changing the application. The supplied refinement brief and visual audit are the product requirements for this repair.

## Causes and corrections

| Observed failure                                                              | Responsible boundary                                                                                                                                  | Correction                                                                                                                                                                   |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Alternate local URLs remained on “Opening design plan…”                       | Next.js 16 blocks development runtime requests from hosts absent from `allowedDevOrigins`. The server explicitly logged the blocked loopback request. | Allow loopback and this machine's actual IPv4 interface addresses, preserving Next's development origin restriction.                                                         |
| HTTP LAN browsers could not create a plan or request an image                 | `crypto.randomUUID()` requires a secure context; both document creation and frame request correlation assumed it existed.                             | Generate document UUIDs with `getRandomValues` when needed; correlate frame requests with a frame-local sequence.                                                            |
| Copying a valid visual link reported an internal JavaScript error on LAN URLs | Clipboard availability was treated as a prerequisite for creating the link.                                                                           | Retain the generated link and clearly offer manual copying when clipboard access is unavailable.                                                                             |
| The preview began near the bottom of the phone screen                         | Two introductions, a separate 168 px activity rail, and a tall workbench were composed without checking their combined geometry.                      | Use one compact studio heading, horizontal labeled desktop navigation, a resizable control panel, and the existing mobile drawer. Keep developer references in a disclosure. |
| Half the business preview appeared empty beside its headline                  | The entire business page, including services and testimonial, occupied the content slot of a vertically centered split hero.                          | Limit the hero to its heading, introduction, action, and companion panel. Render the services and testimonial afterward at page width.                                       |
| “Desktop” did not actually render at 1280 px                                  | Inherited iframe maximum width and padding constrained the frame's browsing context.                                                                  | Give the application-owned viewport no maximum width or internal padding. Its scrollport contains fixed device widths.                                                       |
| Style examples were too small and clipped                                     | Twenty rendered thumbnails were placed inside the narrow inspector, and inherited iframe sizing reduced their already scaled width.                   | Present all styles in the public full-size Modal, with consistent 480 px specimens displayed at 240 px. Configure the Modal's icon asset context.                            |
| Using an alternative left the comparison obscuring the active design          | Comparison visibility remained enabled after restoring the selected snapshot.                                                                         | Return to the live preview when using an option. Saved alternatives remain independent.                                                                                      |

## Why the earlier checks missed these failures

The previous development hydration runner started Next with `127.0.0.1` as its own hostname. That does not reproduce opening a default `localhost` server through a different host. Browser acceptance also checked the phone width without checking a desktop viewport wider than its pane. Functional assertions covered control outcomes but did not assert the combined first-screen geometry or inspect the gallery's readable size.

The repair adds focused development checks for these boundaries. Browser screenshots and manual inspection were performed with Gnomie Browser Commander after its profile became available. The initial fallback used installed local Chrome through Playwright.

## Verification record

The final export gate also caught the compact title being hidden behind client hydration; it now renders before the loading gate, preserving one static H1. The readable brief was expanded to include visitor action, spacing, effects, icons, custom colors, and compatibility alongside the frozen image and appendix.

The following focused checks passed during implementation, one at a time:

- Loopback startup on the default development server.
- UUID generation without `randomUUID` and image download with that API unavailable.
- Manual visual-link copying without the Clipboard API.
- Desktop and phone first-screen geometry, mobile drawer focus restoration, and document containment.
- Business hero composition and page-width services.
- Readable rendered gallery choices, its close icon, selection, and focus restoration.
- Visible A/B comparison and returning to the selected live design.
- Actual 1280, 768, and 390 px frame browsing contexts.
- Inspector resizing and legacy editor preference migration.

Gnomie inspected the default studio, phone layout, comparison, gallery, and actual LAN URL. That LAN session reported no browser console errors or warnings after the fixes. Local lint and type checking passed. Final export and handoff checks are recorded in the completion evidence for this repair.

Final production checks passed for root and GitHub Pages builds, export structure and assets, portable import/reload, all four sample flows, independent alternatives, frozen printable handoff, fullscreen focus, all 17 motion effects, three elevation levels, reduced motion, cancellation, and deterministic fixtures. The expanded brief assertions passed with the same frozen revision.

These are local results. This repair does not establish new remote CI, publication, or deployment results.
