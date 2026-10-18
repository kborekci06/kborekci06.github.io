# Honey

The Dust particle field in honey gold and brown, with a dark face (default) and a light face behind a toggle. Same six chapters, copy, shapes, scroll mechanics, tiers and fallbacks as Dust; only the chapter 1 title, the metadata, the colours and the toggle differ.

- Date: 2026-10-18
- Lineage: Dust (`app/experiments/field/dust/`, DES-032). Both source files were copied verbatim and then changed only where the palette and the toggle needed it. The `.dust__*` class names and the `DustField` export are kept so the diff against Dust stays small; the page is route-scoped.
- Route: `/experiments/field/honey/`. Files: `page.tsx` (server: chapters, copy, styles, toggle button, pre-hydration face script), `honey-client.tsx` (client: canvas, scroll mapping, shaders, palette, toggle wiring).
- Issue: DES-036.

## Palette

| Face | Ground | Mid | Ink (dense particles) |
|---|---|---|---|
| Dark (default) | `#15100A` deep brown | `#7A4A14` brown | `#E2A93B` honey gold |
| Light | `#F4EBD8` creme | `#C98A2A` honey gold | `#4A2E0F` dark brown |

Page tokens (text, scrim, dots):

| Face | `--ground` | `--ink` | `--muted` | `--scrim` | `--dot` |
|---|---|---|---|---|---|
| Dark | `#15100A` | `#F3E7CF` | `#C9B391` | `#15100A` at 74% | `--ink` at 55% |
| Light | `#F4EBD8` | `#2B1B08` | `#5E4224` | `#F4EBD8` at 80% | `--ink` at 55% |

## Mechanism delta from Dust

1. Offscreen pass is palette-free: cleared to black, points drawn additively at grey level 0.94. 0.94 is Dust's `luma(ink) / (1 - luma(ground))`, so the coverage signal has the same response as Dust's.
2. Post pass: `sig = luma(src)` (ground is black), then Dust's contrast 1.6, gamma 0.72, smoothstep, rotated Bayer 4x4 + 10% hash, 1.55 CSS px cells and 5 levels, all unchanged. Coverage maps through a three-stop ramp: ground at 0, mid at 0.5, ink at 1. The 8 Hz ground grain mixes toward the mid tone. No gamma change was needed on either face.
3. `TUNING.palettes = { dark, light }`; the renderer sets ground, mid and ink as uniforms on every draw, so a toggle does not rebuild anything.
4. The client reads the face from `data-theme` on the `.dust` root with a MutationObserver and marks the frame dirty, so the reduced-motion and idle paths redraw exactly one frame per toggle.
5. Toggle: one `<button class="dust__theme">` top right, styled like `.dust__back`. Its text shows the face it switches to ("Light" on dark, "Dark" on light) by CSS on `data-theme`, so the label is right before hydration; the client keeps `aria-label` ("Switch to light face" / "Switch to dark face") in step. A click sets `data-theme` and writes `localStorage["honey-theme"]` (try/catch). Hidden under `<noscript>`.
6. No flash: an inline script, the first child of `.dust`, reads `localStorage["honey-theme"]` and sets `data-theme="light"` on its parent while the HTML parses; the server renders `data-theme="dark"`, which stays on any error or when unset. `suppressHydrationWarning` on `.dust`. The OS colour-scheme preference is never read.
7. `.dust` and `.dust__scene` backgrounds follow `--ground`, so the no-WebGL and JS-off fallbacks show the right ground on both faces.

## Verified (2026-10-18, M5 Max, Chrome via chrome-devtools MCP, ANGLE Metal)

- `npm run build` passes with no warnings; `npx tsc --noEmit` passes. Honey client chunk 24.6 KB raw / 9.8 KB gzip.
- Screenshots: 1440x900 DPR 2 at all six chapter centres (dark), shapes 1, 3, 6 (light); 390x844 DPR 3 device emulation (constrained tier) for shapes 1, 2, 4, 6 (dark) and shape 1 (light).
- Contrast (WCAG, from the hex values above; worst case = scrim over the densest particle colour): dark face ink 15.44:1 over ground, 9.18:1 worst case; muted 9.31:1 / 5.54:1; inactive dot 5.27:1, active dot 15.44:1. Light face ink 14.03:1 / 9.79:1; muted 7.77:1 / 5.42:1; inactive dot 3.61:1, active dot 14.03:1.
- Frame cost (`bench(60)`, three runs each, GPU included) at 1440x900 DPR 2 (2160x1350 backing, full tier): orb dark 0.48 to 1.19 ms, light 0.71 to 1.23 ms; skeleton dark 0.54 to 1.54 ms, light 0.62 to 1.47 ms; strata dark 0.54 to 1.06 ms, light 0.59 to 1.05 ms. All under 2.0 ms.
- Toggle: `data-theme` flips, `localStorage["honey-theme"]` holds the new face, `aria-label` and visible text follow. Reload with "light" stored: `.dust` is inserted with `dark` and the script sets `light` 1 ms later, before any copy element exists and before first paint (64 ms); no hydration warning in the console.
- Reduced motion (emulated): 1 draw at load, 0 over 2 s idle, +1 per toggle (twice), +1 per chapter change, 0 idle after each.
- No WebGL (`getContext("webgl")` stubbed to return null via an init script): `data-fallback` set, `data-ready` absent, all six copies `position: relative`, opacity 1, visible; ground `#F4EBD8` on light and `#15100A` on dark, screenshots of both.

## Not verified

- No-WebGL with Chrome's `--disable-3d-apis` flag (the CLI run was blocked in this session; the stub exercises the same `getContext` null path).
- JS-off rendering (only the served `<noscript>` style was inspected), context loss and restore, a software renderer, real phones.
