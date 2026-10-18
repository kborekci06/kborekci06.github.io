# Stardust

Dust with a colour treatment and nothing else changed: the same six chapters, copy, shapes, scroll mapping, spring, tiers and fallbacks; the formations are star dust over a galaxy. Dark only, no theme toggle. Proof of concept with placeholder copy only.

- Date: 2026-10-18
- Lineage: Dust (`app/experiments/field/dust/`, DES-032). `page.tsx` and `stardust-client.tsx` started as verbatim copies; the `.dust__*` class names, the `DustField` export and the dev probe `window.__dust` are kept so the diff stays minimal.
- Route: `/experiments/field/stardust/`. Issue: DES-037.
- Differences from Dust: the chapter 1 h1 ("Stardust"), the metadata title and description, the CSS tokens and fallback ground in `page.tsx`; `TUNING.colors`, `TUNING.post` (two keys), `TUNING.stars`, `TUNING.band`, the vertex colour and the post shader in the client. The unused `uColor` uniform was removed.

## Palette

| Role | Value | Weight |
|---|---|---|
| Ground (FBO clear, post base, `--ground`) | `#070812` (7, 8, 18) | |
| Ink (grain, stars, low-coverage tint) | (214, 226, 255) | |
| White-blue | (214, 226, 255) | 0.50 |
| Pale gold | (255, 220, 150) | 0.20 |
| Dusty rose | (236, 160, 178) | 0.12 |
| Teal | (110, 214, 206) | 0.10 |
| Rust | (222, 116, 76) | 0.08 |
| Band violet / teal / rose | (120, 92, 210) / (70, 160, 170) / (200, 110, 140) | rose at most 25% |

CSS tokens: `--ink #E6E9F5`, `--muted #A9B1C8`, `--scrim rgba(7,8,18,.8)` (Dust: .74), `--rule rgba(230,233,245,.28)`, `--dot rgba(230,233,245,.55)`, `--space` (two CSS gradients over `--ground`, the no-WebGL and JS-off ground).

## Mechanism delta

1. Per-particle hue: `palette(hash(aRandom.x * 37 + aRandom.w * 113))`, a cumulative-weight lookup baked into the vertex shader from `TUNING.colors.palette` by `glsl()`. The hash of two stable randoms decorrelates the hue from the shapes' own use of each component (e.g. the orb's latitude is `aRandom.x`), so a particle keeps its hue in every shape. `vColor = hue * (0.55 + 0.45 * energy)`; the point fragment shader is unchanged.
2. Hue through the dither: coverage `cov` is computed from luma exactly as in Dust. The output is `mix(ground, tint, cov)` with `tint = clamp(add * 0.82 / luma(add))`, `add = max(src - ground, 0)`: the summed source colour rescaled to luma 0.82, so chroma comes from the particles and brightness from the quantised coverage. Below a summed luma of 0.02 the 8-bit hue is noise, so the tint fades to ink (`tintFloor`).
3. Ground, in the post pass, static: Dust's 8 Hz grain, plus
   - stars: one candidate per 42 x 42 CSS px cell, 70% lit (one star per ~2520 CSS px²), two classes (15% of stars at 0.5 ink, the rest at 0.16), pinpoint (smoothstep 0.3 to 0.75 CSS px), hashed in CSS-pixel space;
   - Milky Way band: a diagonal band through the viewport centre (slope -0.42 in GL coordinates, top-left to bottom-right, clear of the bottom-left copy panel at desktop aspect), width 0.2 viewport heights modulated by three octaves of value noise built from `hash2`, colour violet to teal along the band with up to 25% rose in the densest noise, amplitude 0.09. Peak luma added: 0.038 (violet) to 0.050 (teal), 4 to 6% of ink luma 0.884 (cap was ~12%).
   Band and stars are added to `ground` before the final mix, so the formation covers them.

## Verified (2026-10-18, M5 Max, Chrome 155 on ANGLE Metal; headless CLI and the chrome-devtools MCP)

- `npx tsc --noEmit` passes; `npm run build` (Jekyll then Next 16.4.2) passes with no warnings or errors in the log; `/experiments/field/stardust` prerenders as static.
- Screenshots at 1440x900 (DPR 1, dev, `?at=`) for all six centres and mid-morphs 0.5 and 3.5; 390x844 DPR 3 (device emulation, mobile and touch, production build, real scroll, constrained tier, 488x1055 backing) for orb, breath, skeleton, strata. In headless virtual time the copy panel lags the pinned shape (shows chapter 1); Dust's route shows the same in the same harness.
- Hues: pixel classification of the 1440 captures (lit pixels with max channel >= 110, hue nearest the palette, saturation < 0.25 counted as white-blue) at the shape centres: white-blue 76 to 85%, teal 8 to 20%, gold 3 to 6%, rust 1 to 5%, rose 1 to 3%. Gold, teal, rose and white-blue are visible by eye in a 4x crop of the orb rim; dither cells read as stepped, coloured cells at 4x. Mid-morph 0.5 is 95% white-blue (diffuse cloud, low coverage falls back to ink).
- Contrast (WCAG, computed from the final values): panel ink / muted on the scrim over the plain ground 16.47 / 9.32; over the band peak plus grain (worst ground (35, 29, 49)) 16.01 / 9.06; over a bright star 12.83 / 7.26; over a full-ink formation 10.27 / 5.81. Dots (55% ink): 5.35 on the ground, 5.01 on the band peak.
- Frame cost (`bench(60)`, 1440x900 DPR 2, 2160x1350 backing, six consecutive runs): Stardust 1.98, 0.81, 0.58, 0.55, 0.55, 0.55 ms; Dust in the same session 1.40, 1.03, 0.58, 0.45, 0.40, 0.39 ms. Steady-state cost of the band and stars about 0.15 ms; the first (warm-up) run stays under 2.5 ms.
- Reduced motion (emulated): one draw at load, none over 1.5 s idle, one per chapter change (three changes, one draw each).
- No WebGL (`getContext("webgl")` forced to null by an init script, the same code path as an unsupported browser; also headless `--disable-3d-apis`, whose DOM dump shows `data-fallback`): all six copy blocks `position: relative`, opacity 1, readable over the CSS space ground (chapter 1 and chapter 4 captured).
- Tile `assets/img/gallery/stardust.webp`: 1200x750, 54,796 bytes, from a 1440x900 capture of the settled orb on the production build.

## Not verified

- Low-end Android or a software renderer; context loss and restore; JS-off rendering (the noscript style is unchanged from Dust; not re-checked in a browser).
- Hue legibility on a real phone screen at arm's length; the constrained tier was checked only in emulation.
