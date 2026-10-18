# Dust

A full-viewport, scroll-driven particle field: one WebGL1 `POINTS` mesh whose particles settle into six analytic formations as the page scrolls. Proof of concept with placeholder copy only.

- Date: 2026-10-17
- Lineage: `features/byotone-particle-field` (analysis of byotone.com), original implementation. No code from the reference site.
- Route: `/experiments/field/dust/`. Files: `page.tsx` (server: chapters, copy, styles), `dust-client.tsx` (client: canvas, scroll mapping, shaders, all tuning in `TUNING` and `POSES`).
- Issue: DES-032.

## Mechanism

1. Scroll: every animation frame reads `scrollY`; probe = `scrollY + innerHeight/2`; progress = `i + (probe - c_i)/(c_{i+1} - c_i)` over the chapter centres (measured on resize only), clamped to [0, 5]. Native scroll, no snapping, no loop.
2. Dead band 0.30: the shape index holds for the first and last 30% of travel between centres and morphs (smoothstep) across the middle 40%.
3. Spring: critically damped, time constant 1.4 s (2.4 s between orb and breath), step clamped to 1.25 shapes so a jump still passes through neighbours.
4. Vertex shader: per-particle identity (cell + four stable randoms from an LCG), staggered blend between `sampleShape(from)` and `sampleShape(to)`, mid-morph wander `4b(1-b) * drift`.
5. Post pass: points render additively into an offscreen target, then a fullscreen triangle quantises them to two colours with a rotated ordered dither (Bayer 4x4 + 10% hash, 1.55 CSS px cells, 5 levels) and an 8 Hz stepped grain on the ground.

## Shapes

| # | Shape | Function |
|---|---|---|
| 1 | orb | Thin shell, radius 1.6; each particle on its own tilted loop; a fifth fall in from outside and flicker; rim-weighted by a view-angle term. |
| 2 | breath | Exhaled-CO2-like trace (baseline, fast rise, sloping plateau, fast fall), scrolling left; half the particles on the steep edges; faint echo behind. Width follows the aspect (4.2 to 8 units). |
| 3 | board | 10 x 7 pad lattice with jitter, a central block, 14 orthogonal traces with a pulse running along each, sparse haze; tilted 20 degrees. |
| 4 | skeleton | 15 keypoints walking in place (sinusoidal hip, knee, shoulder, elbow angles); particles along 14 segments plus a head ring, clustered at joints. |
| 5 | airway | Trunk, two, four branches; particles stream down continuously (core fast, wall slow); terminal branches open into a plume. |
| 6 | strata | 12 wavy laminae with an anticline and a small fault; bands drift sideways in alternating directions, gaps travel with them. |

Camera: fov 54 deg with the aspect fit `t = max(min(0.92, 1.4/aspect), 0.62/aspect)`; per-shape distance fitted to fill 70% of the height or 86% of the width (strata may overflow the width); portrait viewports lift the formation by 8% of the visible height to clear the copy.

## Tiers and robustness

- Constrained if `(pointer: coarse)`, width < 700, `hardwareConcurrency <= 4` or `deviceMemory <= 4`: 25,000 particles, DPR cap 1.25, render ratio 0.85, 30 fps. Full: 60,000, DPR cap 1.5, ratio 1.0, uncapped.
- Canvas sized from the wrapper by ResizeObserver; on coarse pointers, height-only changes under 120 px (URL bar) are ignored.
- Context lost: stop, `data-fallback` set; restored: rebuild. No WebGL: `data-ready` is never set, `data-fallback` puts the copy back into the page flow over the plain ground. JS off: a `<noscript>` style does the same. Before the client runs, only the first chapter's copy is visible, so there is no flash of six stacked panels.
- Renders only while on screen and the tab is visible; delta clamped to 50 ms.
- Reduced motion: no spring, no idle motion, one frame per settled shape, 0.4 s opacity cross-fade between shapes.
- Dev only (`next dev`): `?at=<index>` pins the shape index (e.g. `?at=2.5`); `window.__dust` exposes `frameMs`, `cpuMs`, `draws` and `bench(n)` (n frames forced to completion by a 1 px readback).

## Verified (2026-10-17, M5 Max, headless Chrome 155 on ANGLE Metal)

- `npm run build` passes with no warnings; the Dust chunk is 23.5 KB raw / 9.4 KB gzip.
- Screenshots at 1440x900 for all six centres and mid-morphs at 0.5 and 3.5; 390x844 at DPR 3 (device emulation, full 1170x2532 capture, not clipped) for orb, breath, skeleton, strata.
- Frame cost (`bench`, GPU included): 1.29 ms at 1440x900 DPR 2 (2160x1350 backing), 1.10 ms at DPR 1, 0.84 ms constrained at 390x844. rAF interval 16.7 ms (vsync).
- Scroll: target holds at 1 at 20% of travel, 1.5 at the midpoint, spring settles on 5 after a long jump.
- Reduced motion (emulated): one draw at load, none while idle, one per chapter change, canvas opacity 0 then 1.
- Fix pass (2026-10-17, after an independent review): no-WebGL rendering checked with headless Chrome `--disable-3d-apis` (copy in flow, dots visible); first paint checked with virtual time (only chapter 1 copy); the noscript style confirmed in the served HTML. 30 fps accumulator has a 1 ms epsilon; inactive dots raised to 55% ink for the 3:1 non-text minimum.
- Owner checks: 2026-10-17 on his own phone, judged right; 2026-10-18 on desktop, "looks great as well". Not measured on a low-end Android. Not verified: a software renderer, context loss and restore, JS-off rendering (the flag crashes headless Chrome here; verified by the served HTML only).
