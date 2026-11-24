# Studio build identity

`npm run build` and `npm run build:pages` write `out/build-identity.json` after Next.js finishes its static export. The record names the site and version, the seven installed framework and design packages, their exact lockfile versions and integrity values, and SHA-256 hashes of their installed package manifests. A missing, unpinned, mismatched, or externally linked package stops the identity step.

The record labels package inspection `observed-unverified-release`. STE Systems does not install the STE SDK or CLI, and this identity is not a fleet release verdict. It marks server runtime evidence `not-applicable` and lists no provider observations. No Core, Payments, or Workforce runtime is declared. The writer reads no environment variables, application data, or provider credentials, and its JSON is suitable for a public static export.

The local Render-style build completed and wrote the record for Next.js 16.4.6, STE USK React 2.4.0, Motion Style CSS 1.1.0, and four public design libraries. The focused identity contract and artifact checks passed. A browser read the exported JSON and the existing studio consultation return at 390 px; the link retained only its approved service context, had no horizontal overflow, and produced no console errors. The hosted build and an admitted D02 fleet comparison remain separate checkpoints.
