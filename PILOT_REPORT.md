# Stone variant report: Amber (Onyx bands with fractal branches, Emperador fitted panels)

Branch `stone/amber` from `stone/onyx` (6dbff5e). Home only. Refs: DES-002.

## 1. Onyx branching study (written before the band code)

References (scratchpad only, never in the repo): two backlit honey onyx slabs (Backlitslab "Honey Onyx Backlit Slab" 1 and 2, front and backlit views), one close-up of a backlit onyx foyer wall (Flickr, greg-janine-bell 52584343129), one front-lit honey onyx close-up (Efesus Stone "honey 1"), one backlit bar front (Dedalo Stone, green onyx, used for branch geometry only).

1. Hierarchy is clear: one or two dominant bands or trunk veins carry most of the light; everything else is subordinate to them.
2. Branches leave a trunk at shallow angles (roughly 15-40 degrees), rarely perpendicular, and bend gently back toward the trunk's direction.
3. Each branch splits once or twice; children are visibly thinner (about half) and shorter, and a third order is hairline and brief.
4. Brightness falls with order: in the backlit slab the trunk veins glow near-white, first-order branches are amber-bright, second-order ones barely lift off the ground.
5. Branch tips fade into the ground; they do not terminate on another vein (the T-junction lattice is breccia, i.e. the Alpi look, not onyx).
6. Spacing is generous: branches from neighbouring trunks rarely meet; large calm fields sit between them (the crowded crack web in slab 1's lower half is the one area that reads busy, and is the thing to avoid).
7. Branches carry the colour of their trunk, slightly warmer and dimmer; backlit, the halo around a branch is wider than its core.
8. Curvature is continuous: no straight segments, small wobble superimposed on one slow bend.
9. Depth: finer branches sit visually "behind" the trunk (softer, more diffuse), which supports a slightly different drift per order.
10. Taken into the build: a sparse recursive tree per band (3 orders, width x0.55, length x0.5-0.7, brightness 1 / 0.6 / 0.35), shallow departure angles, one slow bend plus wobble, alpha fading to zero at every tip, additive amber halo wider than the core. From the Alpi code: technique only (seeded recursion, per-level width/alpha falloff, per-level delay), not its lattice density.

## 2. What was ported from where

| Element | Source | Change on this branch |
|---|---|---|
| Palette, fonts, hero copy scrim, backlight, lit cut edge, header, footer band layer, signal data, content | Onyx (kept) | none |
| Band field (lit ribbons, growth-ring contours, draw-on, flow, three parallax depths) | Onyx (kept) | phones light the bands above and below the copy (odd families) instead of the one behind it |
| Branch trees on every band | new; recursion and per-order falloff technique from the Alpi worktree, not its lattice | `assets/js/home.js` §1 |
| Tile frame: chamfered polygon, one wide lower-outer cut, mirrored on even tiles from md | Emperador `_tile.scss` | Onyx bullnose, cabochon keyframe and `--frame-shape` removed |
| Inlay hairline (SVG polygon inset from the chamfers, non-scaling stroke) | Emperador `flagship-tile.html`, `.inlay` in `_layout.scss` | retinted: stroke = slab accent (honey-400 on umber, burnt-700 on cream), glow = `--inlay-glow` (glow-300 55 %, the role Emperador's gold-100 played) |
| Frame opening during the pin (`frame-open`, `frame-open-mirror`), inlay drawing on after it | Emperador `_motion.scss` | Onyx's hover sheen kept on top |
| Tag chips as a rail on the frame's top edge; near-sharp tag and meta chips | Emperador | `--radius-control` and `--radius-glass` 999px / 1rem -> 0.125rem (buttons and the toggle follow) |
| Fitted signal panel: rim + inner hairline inset `--space-1`, traces side by side, caption under a vein rule, floats over the wide cut from lg | Emperador `_signal.scss` | keeps Onyx's amber glass, honey rim, inner glow and glowing traces; `--bubble-width` 25rem from lg |
| Portrait: fitted panel (square top, wide lower cut) with the same inlay, rising out of the slab cut | Emperador `story-teaser.html`, `_teaser.scss` | arched niche, halo, `div.teaser__niche`, `--arch`, `--niche-glow`, `--rim` removed |
| Not ported | Emperador `polished-edge.html` | Onyx's lit SVG edge on the hero and Story cuts already plays that role |

Fix found while verifying: `wipe-in` had only a `from` inset, so the clip flipped at 50 % of its range instead of wiping (tags, inlay, Story edge; the same on Onyx and Emperador). Both ends are now insets (commit 03b8888).

## 3. Band and branch parameters (`assets/js/home.js`)

Bands (unchanged from Onyx): 5 families above 900 px width, 4 below; lit families alternate (even above 900 px, odd below); draw-on 2.2 s; parallax 0.10 / 0.24 / 0.42 per depth.

| Parameter | Order 0 (primary) | Order 1 | Order 2 |
|---|---|---|---|
| Count | 4 per lit band above 900 px, 2 below; 1 per unlit band | 2 per lit primary (one outward, one back toward the band); 1 per unlit primary | 1 per order-1 branch on lit bands, 2 with p = 0.35; none on unlit |
| Length | 150-260 px x scale (scale = w/1200, clamped 0.55-1) | 0.5-0.7 x parent | 0.5-0.7 x parent |
| Core width at root | 4 px x max(scale, 0.7) | 2.2 px x same | 1.2 px x same |
| Brightness factor | 1 | 0.6 | 0.35 |
| Departure angle | 20-37 deg from the band tangent, 75 % along the band direction | 20-34 deg from the parent heading | same |
| Grow time | 600 ms | 450 ms | 350 ms |
| Scroll drift (rad per px) | 0.00006 | 0.00012 | 0.0002 |
| Flow sway amplitude | 0.015 rad | 0.03 rad | 0.05 rad |

- Shape: 10 samples per branch; one slow bend back toward the parent (0.8 x the departure angle) plus a 0.07 rad wobble; the outline tapers to 20 % width at the tip and the fill fades root to tip (alpha 1 -> 0.55 at mid -> 0); a growing tip tapers to a point.
- Light: lit bands draw an amber halo (4 x width, honey-400, alpha 0.18) and a glow core (glow-300, alpha 0.8), both additive; unlit bands one amber-500 core at alpha 0.5.
- Placement: roots sit on the band's lit edge hairline (ribbon/2 + first ring offset); a root is rejected if it is off screen or inside the copy scrim ellipse (6 tries), so no tree grows behind the name. Counts after culling: 47 branches at 1440, 28 at 390.
- Timing: bands draw on first; primaries start 0-600 ms after the draw-on ends; each child starts when its parent reaches the fork. Growth spans about 2 s (2.2 s to 4.2 s after load).
- Motion: the primary root follows its band's centre line, flow phase, slope and parallax; each order adds its own sway and scroll drift, composed down the tree with 2x3 matrices, so children stay attached while finer orders move further (a per-order translation would have detached them at the forks).
- Cache: a fully grown branch is baked once into its own small canvas and blitted with its transform (one drawImage per branch); sprites are rebuilt only on resize or a theme/token change. Reduced motion: every branch drawn fully grown in one static frame.

## 4. Gates

| Gate | Result | Evidence |
|---|---|---|
| G1 build | pass | jekyll build: only the faraday-retry line; done in 0.528 s |
| G2 tokens only | pass | Home files (`_sass/marble/*`, `_tokens.scss`, Home includes and layout, `home.js`): raw colours outside `_tokens.scss` 0, `!important` 0, `style=` 0 (built Home 0), justify/hyphens 0. Repo-wide hits (38 / 12 / 14 / 5) are all in legacy non-Home files (`_sass/_layout.scss`, `_components.scss`, `_figures.scss`, `_legacy-tokens.scss`, `_pages.scss`, project pages), unchanged from Onyx |
| G3 no stone bitmaps | pass | only `url()` in Sass is the SVG grain; bands and branches are canvas; reference photos stayed in the scratchpad |
| G4 JS off | pass | light and dark: `html.js` absent, 0 hidden elements under main and footer |
| G5 reduced motion | pass | both themes: 0 running animations, 0 hidden elements, stage static, frame at its resting polygon, canvas byte-identical 800 ms apart |
| G6 no scroll-jacking | pass | wheel / preventDefault / lenis / locomotive in assets/js: none |
| G7 JS | pass | `home.js` 21,721 B raw / 7,773 B gz (Onyx 4,912), defer; inline theme-init 146 B gz and toggle 370 B gz unchanged; total 8,289 B gz; no library |
| G8 motion | pass | probes below |

```
pin 0.05  stageTop 0  frame polygon(7.8% 4.4%, 92.2% 4.4%, ... 85.9% 95.6% ...)  inlay wiping  copy 0.04  tags hidden
pin 0.30  stageTop 0  frame polygon(3.1% 0.8%, ... 90.0% 99.2% ...)             inlay nearly drawn  copy 0.97  tags wiping
pin 0.60  stageTop 0  frame polygon(2% 0%, 98% 0%, 100% 3%, 100% 86.5%, 91% 100%, 2% 100%, 0% 97%, 0% 3%)  inlay, tags drawn
pin 0.95  stageTop 0  frame at rest
story     mid-entry polygon(0 17.3%, 100% 10.2%, 100% 88%, 84% 100%, 0 100%) -> rest polygon(0 0, 100% 0, 100% 88%, 84% 100%, 0 100%)
hover     sheen -100% -> 100%, frame 0 -> -4px, bubble 0 -> -8px, bubble active
```

Frame trace (rAF intervals, headless Chrome, 1440): scripted scroll at 20 px/frame over the whole page after the branches have grown: 309 frames, max 16.8 ms, 0 over 34 ms. Load choreography (draw-on + branch growth, 5 s, no scroll): 300 frames, max 16.8 ms, 0 over 34 ms at 1440 and at 390. Horizontal overflow 0 px at 390, 768, 1440. Toggle: OS light, no stored choice -> click -> `data-theme="dark"`, stored, persists on reload.

## 5. Contrast on composited pixels

Method: glyphs hidden (colour, text-shadow and decoration transparent); capture of the text's ink box (a Range over its contents; the whole box for buttons and chips; the plot box with trace and grid hidden for the trace) at its real scroll state; WCAG ratio of the text colour against every pixel after a 3 px rim trim. Hero pairs at scroll 0 after the branches have grown; tiles at pin 0.6 or later (scrolled further when the element sits below the fold at 390). Worst of 1440 and 390 per theme. Need 3.0 for text >= 24 px and UI strokes, else 4.5.

| Pair | Light: text, worst / median | Dark: text, worst / median | Need |
|---|---|---|---|
| hero-name | #fbf1e1, 6.15 / 14.69 | #fbf1e1, 6.15 / 14.69 | 3.0 |
| hero-positioning | #cdb08a, 5.30 / 6.41 | #cdb08a, 5.30 / 6.41 | 4.5 |
| hero-cue | #cdb08a, 8.30 / 8.64 | #cdb08a, 8.30 / 8.64 | 4.5 |
| nav-over-hero | #fbf1e1, 16.99 / 16.99 | #fbf1e1, 16.99 / 16.99 | 4.5 |
| intro-text | #150d08, 16.83 / 17.66 | #fbf1e1, 13.70 / 15.85 | 3.0 |
| nav-over-intro | #fbf1e1, 17.06 / 17.06 | #fbf1e1, 17.05 / 17.06 | 4.5 |
| t1-org | #cdb08a, 8.66 / 8.95 | #6a4a2e, 7.40 / 7.53 | 4.5 |
| t1-title | #fbf1e1, 15.97 / 16.52 | #150d08, 17.98 / 18.14 | 3.0 |
| t1-blurb | #cdb08a, 5.95 / 8.95 | #6a4a2e, 5.04 / 7.53 | 4.5 |
| t1-tag (glass over photo) | #fbf1e1, 5.67 / 7.13 | #150d08, 16.66 / 17.34 | 4.5 |
| t1-meta-dt | #cdb08a, 8.41 / 8.63 | #6a4a2e, 7.31 / 7.42 | 4.5 |
| t1-meta-dd | #fbf1e1, 15.57 / 16.03 | #150d08, 17.61 / 17.87 | 4.5 |
| t1-bubble-label | #fbf1e1, 13.01 / 13.98 | #150d08, 15.17 / 15.23 | 4.5 |
| t1-bubble-caption | #cdb08a, 9.11 / 9.25 | #6a4a2e, 7.55 / 7.61 | 4.5 |
| t1-trace (UI) | #f0b35a, 5.98 / 6.07 | #7c3b0e, 7.68 / 7.90 | 3.0 |
| nav-over-tile1 | #fbf1e1, 17.14 / 17.14 | #fbf1e1, 12.74 / 12.74 | 4.5 |
| t1-btn-solid | #150d08, 16.87 / 17.17 | #fdf9f1, 18.30 / 18.30 | 4.5 |
| t1-btn-line | #fbf1e1, 13.49 / 16.03 | #150d08, 15.77 / 17.73 | 4.5 |
| t2-org | #6a4a2e, 7.47 / 7.53 | #cdb08a, 8.71 / 8.95 | 4.5 |
| t2-title | #150d08, 17.98 / 18.14 | #fbf1e1, 15.97 / 16.52 | 3.0 |
| t2-blurb | #6a4a2e, 7.47 / 7.53 | #cdb08a, 8.66 / 8.95 | 4.5 |
| t2-tag (glass over video) | #150d08, 15.95 / 16.96 | #fbf1e1, 6.06 / 7.45 | 4.5 |
| t2-meta-dt | #6a4a2e, 7.31 / 7.42 | #cdb08a, 8.46 / 8.63 | 4.5 |
| t2-btn-line | #150d08, 17.32 / 17.89 | #fbf1e1, 14.51 / 16.17 | 4.5 |
| story-title | #fbf1e1, 15.93 / 16.52 | #150d08, 17.82 / 18.14 | 3.0 |
| story-text | #cdb08a, 5.89 / 8.73 | #6a4a2e, 4.98 / 7.28 | 4.5 |
| story-btn | #150d08, 17.17 / 17.17 | #fdf9f1, 18.30 / 18.30 | 4.5 |
| footer-name | #6a4a2e, 5.92 / 6.88 | #cdb08a, 6.22 / 7.48 | 4.5 |
| footer-email | #150d08, 16.98 / 17.28 | #fbf1e1, 13.92 / 14.73 | 3.0 |
| footer-link | #7c3b0e, 7.64 / 7.77 | #f0b35a, 9.10 / 9.43 | 4.5 |

No pair fails. Lowest 4.5-class worst pixel: 4.98:1 (Story text, dark theme). Hero positioning line: 5.30 at 1440 and 5.51 at 390 (Onyx: 4.67 at 390); at 390 the lit band no longer runs behind the copy and no branch root is allowed inside the scrim. Large-text rows are not directly comparable with Onyx's table: this run measures the ink box, Onyx the element box.

## 6. Screenshots (`pilot-shots/amber/`, WebP, 25 files)

- `hero-rest-{light,dark}-{1440,390}`: 2.4 s after load, bands drawn, first primaries starting to grow.
- `hero-branched-{light,dark}-{1440,390}`: 5.2 s after load, all branches grown.
- `tile1-rest-{light,dark}-{1440,390}` (pin 0.6), `tile1-hover-{light,dark}-{1440,390}` (CDP mouse over the frame, 1.3 s).
- `story-{light,dark}-{1440,390}`, `footer-{light,dark}-{1440,390}`, `reduced-tile1-light-1440` (reduced motion emulated).
- Headless Chrome on port 9471 over CDP, served from `_site` on 127.0.0.1:4731; every load checked that the served `home.js` contains the branch code. 390 uses device emulation (mobile), which reflows.

## 7. What I would change next

1. Tune branch density with Kaan: primaries per lit band (4 now), second-grandchild probability (0.35), lengths.
2. A few primaries read as short straight strokes near the root; a stronger first bend or a longer first segment would soften them.
3. Branches grow once at load; test a slow light pulse travelling out along one tree every 10-15 s.
4. Carry one or two branch strokes into the CSS band layer on the tile, Story and footer slabs so the motif continues below the hero.
5. The signal panel covers the frame's wide cut at 1440; test pulling it further outside the frame.
6. Light-theme tag chips over the white board photo hold 5.67:1; a denser amber glass would lift them toward 7:1.
7. Buttons and the toggle lost their pills with the radius change; confirm Kaan wants the cut-stone corner there too.
8. Replace the annotated board diagram with a clean device photo; inlay and sheen read best on a photograph.
9. Render Firefox (IO fallback) and Safari; measure Web Vitals on the deployed build.
10. Retire `_sass/marble/_card.scss` and the legacy Sass once a stone is chosen.

## 8. Not verified

- Web Vitals (LCP, CLS, INP) for this variant.
- Firefox and Safari.
- Keyboard focus pass not re-captured (focus rule unchanged; ring contrast computed on tokens in the Onyx report).
- 768 px renders beyond the overflow check.
- Theme flash on reload observed visually (script order unchanged).
- Frame timing on a real device or under CPU throttling; the traces above are headless Chrome on this Mac.
