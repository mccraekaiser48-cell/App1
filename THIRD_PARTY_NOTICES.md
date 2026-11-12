# Third-party notices

## OASIS_OS

This web app runs the OASIS_OS desktop shell compiled to WebAssembly.

- Source: https://github.com/AndrewAltimit/oasis-os
- Copyright: Andrew Altimit and OASIS_OS contributors
- License: dual-licensed MIT / Unlicense (copies in `licenses/`)
- Version built here: 1.6.0, from `main` (commit in `upstream/.git`)

The Rust sources are in `upstream/`; `pkg/` is the wasm-pack output of
`crates/oasis-backend-wasm` built for `wasm32-unknown-unknown`.

The application shell in `index.html`, `app.css`, `app.js` and `server.mjs` is
original glue and is not part of the upstream project.

## Fonts and assets

The shell uses system fonts only. The desktop's own skins, icons and sounds are
part of OASIS_OS and carry its license.
