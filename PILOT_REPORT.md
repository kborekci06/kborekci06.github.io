# Stone variant report: Onyx (honey / amber banded onyx)

Branch `stone/onyx` from `design` (5d6a403). Home only. Refs: DES-002.

## 1. Stone study (written before the tokens)

References (scratchpad only, never in the repo): three front-lit honey onyx slab close-ups (Efesus Stone "honey 1-3"), two backlit honey onyx bar tops (GPI Design, Constantinos bar, overview and detail), one backlit bookmatched onyx lobby wall (GPI Design, Tower Oaks). Two quartzite photos returned by the search were discarded as not onyx.

1. Ground: front-lit, the stone is a cream-to-honey field (sampled #ccc6bd to #bca487); backlit, the same stone turns amber to deep orange (#dfb95e to #f9e099) and everything unlit around it falls to near-black umber (#0f0603 to #241b1a).
2. Banding, not cracks: layers run as soft, wide, roughly parallel waves across the slab, 5 to 20 % of its width, with no sharp kinks and almost no branching.
3. Band edges carry fine concentric hairlines (sampled caramel to rust, #a98472 to #9f8877) that follow the band's curve, like growth rings; that is the only "crisp" line in the stone.
4. Backlit, the thick bands read as luminous gradients: the light is brightest mid-band and falls off softly to the edges; rust speckle drifts along the band direction.
5. Bookmatched walls repeat the band pattern mirrored at panel joints; the joint itself is a thin dark seam.
6. Polished edges are rounded (bullnose on the bar), not chamfered to a point; the edge catches a thin bright highlight.
7. Palette taken: cream #fdf9f1 and honey cream #f4e9d6 (light face), caramel #dcc39c / #8f6134 (decorative / structural band), umber #150d08 / #21150c (unlit ground), umber band #4e3219, amber #a8773f (structural band on umber), honey #f0b35a (accent on umber), burnt caramel #7c3b0e (accent on cream), glow #ffc868 (luminous highlight, gradient and glow only).
8. Veins become bands: the jagged polyline field is replaced by families of smooth offset waves, a few wide soft luminous ribbons plus hairline contours along their edges, drawn with additive blending on the dark hero so overlaps glow like light through stone.
9. Geometry follows the polished stone: rounded "bullnose" corners on two opposite corners of each frame (bookmatched mirror on alternate tiles), an arched niche for the portrait, a thin highlight rim on frames and glass.
10. Glass follows the backlight: amber-smoked glass on umber and honey-milk glass on cream, a honey rim, and a warm inner glow, always over a band layer or media so the blur has something to catch.

## 2. Palette (primitive layer, `_sass/_tokens.scss`)

| Token | Value | Role |
|---|---|---|
| `--p-onyx-cream-0` | #fdf9f1 | light surface (polished light face) |
| `--p-onyx-cream-100` | #f4e9d6 | light surface-2 (honey cream) |
| `--p-onyx-caramel-300` | #dcc39c | decorative band on cream |
| `--p-onyx-caramel-500` | #8f6134 | structural band on cream (5.09:1) |
| `--p-onyx-umber-700` | #6a4a2e | muted text on cream (7.6:1) |
| `--p-onyx-umber-950` | #150d08 | dark surface; text on cream |
| `--p-onyx-umber-900` | #21150c | dark surface-2 |
| `--p-onyx-umber-600` | #4e3219 | decorative band on umber |
| `--p-onyx-amber-500` | #a8773f | structural band on umber (4.92:1) |
| `--p-onyx-tan-200` | #cdb08a | muted text on umber (9.3:1) |
| `--p-onyx-cream-50` | #fbf1e1 | text on umber |
| `--p-onyx-burnt-700` | #7c3b0e | accent on cream (8.0:1) |
| `--p-onyx-honey-400` | #f0b35a | accent on umber (10.3:1) |
| `--p-onyx-glow-300` | #ffc868 | luminous highlight: gradient stops, glows, additive canvas bands only |

| Semantic | Light theme | Dark theme |
|---|---|---|
| surface / surface-2 | cream-0 / cream-100 | umber-950 / umber-900 |
| text / muted | umber-950 / umber-700 | cream-50 / tan-200 |
| vein / vein-strong | caramel-300 / caramel-500 | umber-600 / amber-500 |
| accent | burnt-700 | honey-400 |
| inverse slab (surface, text, muted, accent) | umber-950, cream-50, tan-200, honey-400 | cream-0, umber-950, umber-700, burnt-700 |
| glass on cream | cream-0 70 % (strong 84 %), rim glow in cream, inner glow glow-300 22 % | same values, used on inverse slabs |
| glass on umber | umber-950 62 % (strong 80 %), rim honey-400 30 %, inner glow glow-300 12 % | same values, used on base slabs |
| night (hero, header; both themes) | umber-950, cream-50, tan-200, honey-400; header glass umber-950 88 % | same |

## 3. What changed and why

Geometry
- Tile frames: the diagonal cut corner became a bullnose on two opposite corners (`--radius-bullnose`, clamp 1.5-3.5 rem), mirrored on alternate tiles like a bookmatched pair (`--frame-shape`). Polished onyx edges are rounded (study 6).
- Story portrait: an arched niche (semicircle top, square base) with a warm halo behind it; one wrapper `div.teaser__niche` added.
- Controls and chips are pills (`--radius-control: 999px`); glass panels use a 1 rem radius. Slab cuts (hero bottom, Story top) stay diagonal.
- Signal bubble is a 22 rem instrument panel: one full-width trace per row, 4 rem plots, row dividers, glowing trace. From 1024 px it floats over the frame's upper outer corner, diagonal to the tag rail (in the old lower-corner position the larger panel covered the third tag); below 1024 px it sits in flow.

Texture
- Hero: a canvas band field replaces the vein polylines (onyx bands, not cracks): smooth two-sine wave families, lit ribbons drawn additively in an accent-to-glow gradient with a four-pass falloff, unlit umber bands, growth-ring hairlines along band edges. A CSS backlight halo (`.hero__glow`) sits behind the name, the glyphs carry a warm text-shadow glow, the diagonal cut has a lit SVG edge.
- Band layer (`.slab--bands::after`, `--s-bands`): concentric elliptical rings (a soft band plus hairline contours) on both tiles, the Story slab and the footer, so every glass panel has stone behind it to blur.
- Glass: honey rim, 1 px top highlight and a warm inner glow in every context; frames and the arch carry a thin honey rim (`--rim`).
- Intro rule and footer rule run caramel to the burnt accent (a lit band edge).

Dynamics
- Load: backlight switches on (opacity + scale, 1.8 s), the lit edge wipes along the cut, bands draw on left to right (2.2 s) then flow slowly; name focus-pull kept.
- Scroll: band layer drifts against the scroll (translateY ±6 %, `view()`); hero bands keep three parallax depths; frames open from a cabochon (`inset(12% 16% round 50%)`) to the bullnosed slab across the pin; the arch rises from its base keeping its shape.
- Hover / focus: a polished sheen crosses the frame once (900 ms); frame lifts 4 px, bubble 8 px, traces speed up (kept).
- Reduced motion: all static; sheen transition removed.

## 4. Motion map (as built)

| Element | Trigger | Effect | Technique | Duration / easing | Reduced motion |
|---|---|---|---|---|---|
| Hero band field | load, continuous | draw-on L to R, then slow wave flow | JS canvas, seeded, rAF paused off-screen | 2.2 s cubic out | one static frame |
| Hero band field | scroll | parallax depths 0.10 / 0.24 / 0.42 | JS canvas (scrollY read in rAF) | scroll-linked | static |
| Hero field wrapper, hero copy | scroll | recede; copy fades and lifts | CSS `scroll(root)` | scrubbed | none |
| Hero backlight | load | opacity 0 -> 1, scale 0.7 -> 1 | CSS keyframes, `.js` | 1.8 s `--ease-out` | shown |
| Hero lit edge | load | clip-path wipe along the cut | CSS keyframes, `.js` | 1.8 s `--ease-in-out`, 480 ms delay | shown |
| Hero name / positioning | load | focus pull / rise | CSS keyframes, `.js` | 900 ms | static |
| Band layer (tiles, Story, footer) | view | translateY 6 % -> -6 % | CSS `view()` | scrubbed | static |
| Intro rule | view | scaleX draw-on | CSS `view()` | scrubbed | drawn |
| Flagship stage | scroll | pin 120svh of 220svh | CSS sticky + view-timeline | n/a | no pin |
| Flagship frame | pinned scrub | clip-path cabochon -> bullnose, scale 0.94 -> 1 | CSS `--tile` | scrubbed | full frame |
| Flagship media, copy, tags, bubble | pinned scrub | settle, staggered rise, wipe, rise | CSS `--tile` | scrubbed | visible |
| Frame sheen | hover, focus-within | translate -100 % -> 100 % | CSS transition | 900 ms `--ease-in-out` | none |
| Frame, bubble, media | hover, focus-within | lift 4 / 8 px, scale 1.03 | CSS transition | 600-900 ms | none |
| Signal traces | hover, focus | rest -> active | JS rAF | 250 ms constant | static rest trace |
| Story arch, portrait | view | arch rises from base; parallax ±8 % | CSS `--teaser` | scrubbed | static |
| Buttons, toggle, nav | hover, focus | lift; accent underline | CSS transition | 240 ms | none |

## 5. Gates

| Gate | Result | Evidence |
|---|---|---|
| G1 build | pass | only the faraday-retry line; done in 0.495 s |
| G2 tokens only | pass | 23 Home files: raw colours outside `_tokens.scss` 0, `!important` 0, `style=` in sources 0 and in built Home 0, justify/hyphens 0 |
| G3 no stone bitmaps | pass | `url()` in Home Sass other than fonts/SVG: 0; bands are canvas and CSS gradients; reference photos stayed in the scratchpad |
| G4 JS off | pass | light and dark: `html.js` absent, 0 hidden text/media elements under main; hero keeps umber, backlight and lit edge |
| G5 reduced motion | pass | both themes: 0 running animations, 0 hidden elements, stage static, frame at rest, canvas identical 800 ms apart |
| G6 no scroll-jacking | pass | `wheel|preventDefault|lenis|locomotive` in assets/js: none |
| G7 JS | pass | `home.js` 13,208 B raw / 4,912 B gz, defer; inline theme-init 146 B gz, toggle 370 B gz; total 5,428 B gz; no library |
| G8 motion | pass | probes below |

```
pin 0.05  stageTop 0  clip inset(4.39% 5.85% round 400.65px 365.12px)  copy 0.24  bands +39.3px
pin 0.30  stageTop 0  clip inset(0.85% 1.13% round 122.76px 70.72px)   copy 1     bands +15.7px
pin 0.60  stageTop 0  clip inset(0% round 56px 0px)                      copy 1     bands -12.6px
pin 0.95  stageTop 0  clip inset(0% round 56px 0px)                      copy 1     bands -45.6px
story     arch clip inset(0% 0px 0px round 208px 208px 0px 0px), portrait +10.4px
hover     (4 runs) sheen -100% -> 100%, frame 0 -4px, bubble 0 -8px, bubble active
```

Toggle: OS light, no stored choice -> click -> `data-theme="dark"`, stored, persists on reload. Horizontal overflow 0 px at 390, 768, 1440. Scripted scroll at 20 px/frame: 121 frames, max 17 ms, 0 over 34 ms (covers the first ~2,400 px only).

## 6. Contrast on composited pixels

Glyphs (and text-shadow) hidden, element box captured at its real scroll state, WCAG ratio of the text colour against every pixel; worst = minimum pixel after a 3 px rim. Pills are cropped to their straight body (their round ends show the slab or photo behind). The intro at 390 drops rows under the fixed header; meta chips at 390 are measured after the pin releases. Worst of 1440 and 390 per theme. Need 3.0 for text >= 24 px and UI strokes, else 4.5.

| Pair | Light: text, worst / median | Dark: text, worst / median | Need |
|---|---|---|---|
| hero-name | #fbf1e1, 3.56 / 14.79 | #fbf1e1, 3.56 / 14.79 | 3.0 |
| hero-positioning | #cdb08a, 4.67 / 6.41 | #cdb08a, 4.67 / 6.41 | 4.5 |
| hero-cue | #cdb08a, 8.30 / 8.63 | #cdb08a, 8.30 / 8.63 | 4.5 |
| nav-over-hero | #fbf1e1, 16.68 / 16.99 | #fbf1e1, 16.68 / 16.99 | 4.5 |
| intro-text | #150d08, 15.20 / 17.69 | #fbf1e1, 14.04 / 15.98 | 3.0 |
| nav-over-intro | #fbf1e1, 12.39 / 12.76 | #fbf1e1, 16.33 / 16.77 | 4.5 |
| t1-org | #cdb08a, 8.66 / 8.95 | #6a4a2e, 7.15 / 7.53 | 4.5 |
| t1-title | #fbf1e1, 12.37 / 16.52 | #150d08, 13.48 / 18.14 | 3.0 |
| t1-blurb | #cdb08a, 6.00 / 8.85 | #6a4a2e, 5.05 / 7.42 | 4.5 |
| t1-tag (glass over photo) | #fbf1e1, 5.67 / 6.94 | #150d08, 16.97 / 17.64 | 4.5 |
| t1-meta-dt | #cdb08a, 8.35 / 8.52 | #6a4a2e, 7.25 / 7.35 | 4.5 |
| t1-meta-dd | #fbf1e1, 13.92 / 15.83 | #150d08, 16.02 / 17.71 | 4.5 |
| t1-bubble-label | #fbf1e1, 16.73 / 17.07 | #150d08, 18.17 / 18.32 | 4.5 |
| t1-bubble-caption | #cdb08a, 5.38 / 6.76 | #6a4a2e, 6.35 / 6.72 | 4.5 |
| t1-trace (UI) | #f0b35a, 5.91 / 6.97 | #7c3b0e, 7.23 / 8.03 | 3.0 |
| nav-over-tile1 | #fbf1e1, 13.49 / 15.14 | #fbf1e1, 12.24 / 12.74 | 4.5 |
| t1-btn-solid | #150d08, 17.02 / 17.17 | #fdf9f1, 18.30 / 18.30 | 4.5 |
| t1-btn-line | #fbf1e1, 13.54 / 15.79 | #150d08, 15.75 / 17.44 | 4.5 |
| t2-org | #6a4a2e, 7.47 / 7.53 | #cdb08a, 8.66 / 8.95 | 4.5 |
| t2-blurb | #6a4a2e, 5.65 / 7.53 | #cdb08a, 6.85 / 8.95 | 4.5 |
| t2-tag (glass over video) | #150d08, 16.36 / 17.04 | #fbf1e1, 6.14 / 7.31 | 4.5 |
| t2-meta-dt | #6a4a2e, 7.37 / 7.42 | #cdb08a, 8.44 / 8.63 | 4.5 |
| t2-btn-line | #150d08, 16.44 / 18.02 | #fbf1e1, 14.26 / 16.32 | 4.5 |
| story-title | #fbf1e1, 15.97 / 16.52 | #150d08, 17.98 / 18.14 | 3.0 |
| story-text | #cdb08a, 5.91 / 8.72 | #6a4a2e, 5.05 / 7.28 | 4.5 |
| story-btn | #150d08, 17.17 / 17.17 | #fdf9f1, 18.30 / 18.30 | 4.5 |
| footer-name | #6a4a2e, 5.92 / 7.11 | #cdb08a, 6.19 / 7.82 | 4.5 |
| footer-email | #150d08, 16.87 / 17.28 | #fbf1e1, 13.92 / 14.73 | 3.0 |
| footer-link | #7c3b0e, 7.64 / 7.77 | #f0b35a, 9.01 / 9.43 | 4.5 |

Lowest 4.5-class worst pixel: 4.67:1 (hero positioning line at 390, over the backlight). Token pairs: structural bands caramel-500 on cream 5.09, amber-500 on umber 4.92; focus ring = slab accent, burnt-700 on cream 8.03, honey-400 on umber 10.34.

## 7. Screenshots (`pilot-shots/onyx/`, WebP, 24 files)

- `hero-{light,dark}-{1440,390}`, `tile1-rest-{light,dark}-{1440,390}`, `tile1-hover-{light,dark}-{1440,390}` (CDP mouse over the frame), `story-{light,dark}-{1440,390}`, `footer-{light,dark}-{1440,390}`
- `reduced-hero-{light,dark}-1440`, `reduced-tile1-{light,dark}-1440`
- 390 uses CDP device emulation (`mobile: true`), which reflows; no iframe probe needed.

## 8. What I would change next

1. Tune the hero bands with Kaan: number of lit ribbons, the bright core line (can read as a stripe), flow speed.
2. Try a slow backlight "breath" (opacity of `.hero__glow` over 8-10 s) and judge it.
3. The night header over cream slabs reads as a brown-gray bar; test a honey-tinted header glass there.
4. Decide whether the intro stays the one quiet cream slab or also gets the band layer.
5. Light-theme tag chips over the white board photo hold 5.67:1; a denser amber glass would lift them toward 7:1.
6. Replace the annotated board diagram with a clean device photo; sheen and rim show best on a photograph.
7. On phones the bullnose radius is small; test the arch or a larger radius there.
8. Render Firefox (IO fallback) and Safari.
9. Measure Web Vitals on the deployed build.
10. Retire `_sass/marble/_card.scss` once a stone is chosen.

## 9. Not verified

- Web Vitals (LCP, CLS, INP) for this variant.
- Firefox and Safari.
- Keyboard pass not re-captured (focus rule unchanged; ring contrast computed on tokens only).
- 768 px renders beyond the overflow check.
- Theme flash on reload observed visually (script order unchanged from `design`).
- Scroll smoothness beyond the first ~2,400 px.
