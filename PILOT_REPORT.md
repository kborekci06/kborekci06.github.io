# Pilot D report: Cinematic slab (Phase 1, round 2)

Branch `pilot/d` from `pilot/base`. Home only. Refs: DES-009. Measured 2026-09-26 on a local build served by `python3 -m http.server` (no gzip, no CDN) and driven by headless Chrome over CDP.

## 0. Plan (written before the CSS; section 4 is the as-built motion map)

Tokens, three layers in `_sass/_tokens.scss`:

| Layer | Prefix | Contents |
|---|---|---|
| Primitive | `--p-*` | marble neutrals (`marble-0/100`, `stone-300/500/700`), ink neutrals (`ink-950/900/700/400/200/50`), lapis accent (`lapis-600` on marble, `lapis-300` on ink), pyrite (gradient stop only), SVG grain; plus space 1-10, type steps, durations, easings, geometry |
| Semantic | `--color-*`, `--color-inverse-*` | per theme: surface, text, muted, vein, vein-strong, accent, and an inverse set for slabs. Light: marble base, ink slabs. Dark: ink base, marble slabs (§4 "dark inverts the ratio"). The theme switch rewrites only this layer. |
| Component | `--s-*`, `--glass-*`, `--shadow-2`, `--hero-*` | `slab-base` / `slab-inverse` mixins map the semantic base or inverse set onto `--s-*`; every component reads `--s-*`, so one class flips a section. |

Structure (slab = full-width section):

| # | Section | Light theme / dark theme | Focal element |
|---|---|---|---|
| 1 | Header, laid over the hero, scrolls away | inverse | nav with draw-on accent underline, toggle |
| 2 | Hero, `min-height: 100svh`, diagonal bottom cut | ink / marble | generated canvas vein field, centred name (h1), positioning line, scroll cue |
| 3 | Intro + "Selected work" heading | base with the soft gradient | 54-word paragraph at lead size, vein rule |
| 4 | Flagship 1, Lurie (pinned track) | ink / marble | board photo opens from a cut stone to full frame |
| 5 | Flagship 2, SRAlab (pinned track) | marble / ink | hover-to-play pose loop opens the same way |
| 6 | Story teaser, diagonal top cut | ink / marble | portrait in a cut frame with parallax, accent vein on the cut |
| 7 | Footer | base | email at display size, profiles, resume |

Content sources: hero, intro and teaser from `index.md` front matter (base copy, unchanged); tiles from project front matter (`featured`, `order`, `title`, `org`, `description`, `tags`, `thumbnail`) plus a new optional `tile:` block (`video`, `poster`, `secondary`) documented in `_data/schema/project.yml`. No new copy was written; the only new visible strings are UI labels ("Scroll to explore", "Read the case study", "Play the clip", "BMES 2025 poster (PDF)").

## 1. Build log tail

```
$ bundle exec jekyll build -d <scratchpad>/d/site
Configuration file: .../agent-a213ebe96a945b2de/_config.yml
To use retry middleware with Faraday v2.0+, install `faraday-retry` gem
            Source: .../agent-a213ebe96a945b2de
       Destination: .../scratchpad/d/site
 Incremental build: disabled. Enable with --incremental
      Generating...
       Jekyll Feed: Generating feed for posts
                    done in 0.451 seconds.
 Auto-regeneration: disabled. Use --watch to enable.
```

Only the faraday-retry warning. Ruby Sass note: a raw `url("data:...")` in a custom property fails to parse (twice, two routes); the grain token is a Sass string interpolated whole (`--p-grain: #{$grain-url}`).

## 2. Gates G1-G8

Grep gates run by a script over the 27 files that render Home (`_sass/_site.scss`, `_sass/marble/*` except the retired `_card.scss`, the two layouts, the Home includes, `index.md`). The repo-wide marble-ui greps also hit `_sass/_components.scss`, `_layout.scss`, `_figures.scss`, `_pages.scss`, `_legacy-tokens.scss`, `project-card.html`, `timeline.html` and project pages: all minima-era files that Home does not load (they compile into `assets/main.scss` for the other pages). They are pre-existing and untouched.

| Gate | Result | Evidence |
|---|---|---|
| G1 build | pass | log above |
| G2 tokens only | pass | raw colours outside `_tokens.scss`: none; `!important`: none; `style=` in sources: none; `style=` in built Home: none; justify/hyphens: none |
| G3 no marble bitmaps | pass | `url()` in Home Sass other than fonts/SVG: none (grain is SVG `feTurbulence`). Bitmaps on Home: board photo, pose-loop poster, portrait. Hero and veins are canvas/SVG. |
| G4 JS-off readable | pass | compiled CSS: no `opacity: 0` rule outside `.js`-prefixed selectors or keyframes. JS disabled (CDP `setScriptExecutionDisabled`), both themes: 43 text/media elements, 0 invisible; video falls back to native controls (`pilot-shots/d/nojs-*.webp`) |
| G5 reduced motion | pass | one `no-preference` block holds every animation, one `reduce` block states the static result. Emulated reduce, both themes: 17 animated elements checked, 0 hidden or displaced, 0 running animations, pin collapsed (stage `position: static`, track = 100svh), video paused, one static vein frame |
| G6 no scroll-jacking | pass | `grep -rnE 'wheel\|preventDefault\|lenis\|locomotive' assets/js`: none. No scroll listeners; the canvas reads `scrollY` inside its rAF loop only. `scroll-behavior: smooth` (native CSS, no-preference only) for the cue anchor |
| G7 JS <= 100 KB gz, deferred | pass | `home.js` 9,479 B raw / 3,609 B gz, `defer`; inline theme-init 157 B gz (head, pre-paint); inline theme-toggle 377 B gz (end of body, pre-existing). Total 4.1 KB gz. No library. |
| G8 motion present | pass | every section has a scroll entrance; two pinned, scrubbed tiles; hover transforms on tiles, buttons, nav (section 4). Verified in headless Chrome, below |

Motion verification (CDP, 1440, light), tile 2 scrubbed through its pin:

```
pin progress 0.05 {"stageTop":0,"frameClip":"polygon(6.5% 4.9%, 93.5% 4.9% ...","copyOpacity":"0"}
pin progress 0.3  {"stageTop":0,"frameClip":"polygon(1.9% 1.4%, 98.1% 1.4% ...","copyOpacity":"0.80"}
pin progress 0.6  {"stageTop":0,"frameClip":"polygon(0% 0%, 100% 0%, 100% 86%, 92% 100% ...","copyOpacity":"1"}
pin progress 0.95 {"stageTop":0, ... "copyOpacity":"1"}
hovered           {"frameTranslate":"0px -4px","videoScale":"1.03","videoPaused":false,"time":1.42}
unhovered         {"frameTranslate":"none","videoPaused":true}
```

Scroll smoothness: scripted scroll at 24 px per frame through the whole page at 1440: 256 frames, 0 over 34 ms, max 17 ms, mean 16.6 ms, 0 long tasks.

Other checklist items:
- Theme toggle: light (OS) -> click -> `data-theme="dark"`, `localStorage.theme="dark"`, body `rgb(12,12,14)`; persists on reload; theme-init precedes the `<style>` so no flash by construction; no stored choice + OS dark -> dark. Flash not filmed.
- Keyboard: 14 tab stops in order (skip link, 4 nav, toggle, cue, 2 per tile, story, email, profiles); every one `:focus-visible` with a 2 px ring in the slab accent. Bug found and fixed: tabbing into a tile scrolled the button in before the scrub revealed it (opacity 0); focused blocks now drop their entrance (`fix(a11y)` commit). Evidence `focus-*-1440-tab8/12.webp`.
- Landmarks: header, nav, main, footer; one h1; order h1 > h2 (Selected work) > h3 x2 > h2 (Story).
- No horizontal scroll at 390/768/1440; no tap target under 44 px (after raising the footer email's padding); every `<img>` has width and height.
- Longest title ("Diaphragm pacing data platform") 2 lines at 1440; 3 lines at 768 (rule is 1440). Both tile media share 3:2.

## 3. Contrast, measured on composited pixels

Method: for each element, read its computed colour, hide its glyphs, screenshot its box at its real scroll state (hero veins, gradient, glass over media all included), then compute WCAG ratio against every pixel. "Worst" = 2nd-percentile pixel (drops antialiased vein edges), "Median" = typical.

| Theme | Pair | Text | Background worst / median | Worst | Median |
|---|---|---|---|---|---|
| light | hero name over veins | #f3f3f1 | #2e2e32 / #0e0e10 | 12.17 | 17.36 |
| light | hero positioning (muted) | #bcbcc3 | #1a1a1c / #0d0d0f | 9.20 | 10.28 |
| light | scroll cue (muted) | #bcbcc3 | #1b1a1a / #0e0e10 | 9.20 | 10.21 |
| light | nav link over veins | #f3f3f1 | #333338 / #111113 | 11.31 | 16.98 |
| light | intro text on gradient | #0c0c0e | #f2f2f1 / #fafaf9 | 17.45 | 18.71 |
| light | tile 1 org / blurb (muted) | #bcbcc3 | #131315 / #111113 | 9.83 | 9.99 |
| light | tile 1 tags on glass over photo | #f3f3f1 | #62605f / #363637 | 5.63 | 10.86 |
| light | tile 2 blurb (muted) | #55554f | #f9f9f8 / #fafaf9 | 7.12 | 7.18 |
| light | tile 2 tags on glass over video | #0c0c0e | #d5d5d5 / #f6f7f5 | 13.31 | 18.19 |
| light | solid button | #fbfbfa | #0c0c0e | 18.87 | 18.87 |
| light | teaser text (muted) | #bcbcc3 | #131315 / #111113 | 9.83 | 9.99 |
| light | footer links (accent) | #2b44c4 | #f9f9f8 / #fafaf9 | 7.31 | 7.37 |
| light | footer email | #0c0c0e | #f4f5f7 / #f7f8f8 | 17.91 | 18.37 |
| dark | hero name over veins | #0c0c0e | #d8d8d8 / #fafafa | 13.71 | 18.72 |
| dark | hero positioning (muted) | #55554f | #ededec / #fbfbfa | 6.41 | 7.25 |
| dark | scroll cue (muted) | #55554f | #f1f1f1 / #fafafa | 6.64 | 7.19 |
| dark | nav link over veins | #0c0c0e | #d4d4d2 / #fafaf9 | 13.17 | 18.71 |
| dark | intro text | #f3f3f1 | #19191b / #121214 | 15.80 | 16.84 |
| dark | tile 1 org / blurb (muted) | #55554f | #f9f9f8 / #fafaf9 | 7.12 | 7.18 |
| dark | tile 1 tags on glass over photo | #0c0c0e | #d0d0ce / #fafaf9 | 12.65 | 18.71 |
| dark | tile 2 blurb (muted) | #bcbcc3 | #131315 / #111113 | 9.83 | 9.99 |
| dark | tile 2 tags on glass over video | #f3f3f1 | #4c4a49 / #28282a | 7.93 | 13.24 |
| dark | solid button | #0c0c0e | #f3f3f1 | 17.59 | 17.59 |
| dark | teaser text (muted) | #55554f | #f9f9f8 / #fafaf9 | 7.12 | 7.18 |
| dark | footer links (accent) | #9eb0ff | #141415 / #111113 | 8.86 | 9.08 |
| dark | footer email | #f3f3f1 | #161719 / #131315 | 16.15 | 16.70 |

UI and focus (token pairs, flat surfaces): focus ring lapis-600 on marble 7.44, lapis-300 on ink 9.41; structural veins stone-500 on marble 4.95, ink-400 on ink 5.78; line-button borders use the same structural vein tokens (>= 3:1). Every body pair >= 4.5:1; lowest is the glass tag rail over the bright board photo in light (5.63, below the 7:1 target).

## 4. Motion map (as built)

Techniques: CSS = scroll-driven (`view()` / `scroll()` / named `view-timeline`); IO = IntersectionObserver class fallback (`html.no-sda`, set by `home.js` when `CSS.supports('(animation-timeline: view()) and (animation-range: entry)')` is false); JS = `home.js`. No library. All CSS motion sits in `_sass/marble/_motion.scss` inside `(prefers-reduced-motion: no-preference)`.

| Element | Trigger | Effect (properties) | Technique | Duration / easing | Reduced motion |
|---|---|---|---|---|---|
| Hero vein field | load | veins draw on by length, then drift | JS canvas 2D, seeded, rAF paused off-screen / hidden tab | 1.8 s, cubic ease-out; drift continuous | one static frame, no loop |
| Hero vein field | scroll | three depth layers at 0.12 / 0.28 / 0.5 x scroll | JS canvas (reads `scrollY` in rAF; no listener) | scroll-linked | static |
| Hero field wrapper | scroll 0 -> 100svh | `transform` translateY 18 % + scale 1.08, `opacity` 0.35 | CSS `scroll(root)` | scrubbed | none |
| Hero copy | scroll 0 -> 70svh | `opacity` 0, `transform` -12vh | CSS `scroll(root)` | scrubbed | none |
| Hero name | load | focus pull: `filter` blur 0.3em -> 0, `transform` rise + scale 1.04 (opacity stays 1 for LCP) | CSS keyframes, `.js` | `--dur-slow` 900 ms, `--ease-out` | static |
| Hero positioning | load | `opacity`, `transform` rise, 240 ms delay | CSS keyframes, `.js` | 900 ms, `--ease-out` | static |
| Scroll cue | loop | accent segment runs down the vein (`background-position`) | CSS keyframes | `--dur-loop` 2.4 s, `--ease-in-out` | static |
| Intro vein | view | `transform: scaleX` 0 -> 1 | CSS `view()` entry 0 % -> cover 45 % | scrubbed | drawn |
| Intro text, work heading, teaser copy, footer email (`[data-reveal]`) | view | `opacity`, `transform` rise | CSS `view()` entry 0-90 %; IO fallback | scrubbed; fallback 900 ms | visible |
| Flagship stage | scroll | pin: stage `position: sticky` for 120svh of a 220svh track | CSS sticky + named `view-timeline: --tile` | n/a | no pin (track collapses) |
| Flagship frame | pinned scrub | `clip-path` polygon from a small cut stone to the full cut frame, `transform` scale 0.94 -> 1 | CSS `--tile`, entry 45 % -> contain 40 %; IO fallback fade/rise | scrubbed | full frame |
| Flagship media | pinned scrub | `transform` scale 1.22 -> 1 | CSS `--tile`, entry 45 % -> contain 55 % | scrubbed | static |
| Flagship copy (org, title, blurb, actions) | pinned scrub | `opacity`, `transform` rise, staggered 5 % ranges | CSS `--tile`, contain 5-45 %; IO fallback with 80 ms stagger | scrubbed | visible |
| Flagship tag rail (glass) | pinned scrub | `clip-path` wipe | CSS `--tile`, contain 30-55 % | scrubbed | visible |
| Tile frame / media | hover, focus-within | `translate` -4 px, media `scale` 1.03 | CSS transition | 600 / 900 ms, `--ease-out` | none |
| Tile video | hover (hover devices) / in view >= 60 % (touch) / button | play, pause | JS + IO | n/a | never autoplays; button still plays |
| Buttons, toggle | hover, focus | `transform` -4 px | CSS transition | `--dur-fast` 240 ms | none |
| Nav links | hover, focus, current | accent line `transform: scaleX` 0 -> 1 over a resting hairline underline | CSS transition | 240 ms | static |
| Story cut vein | view | `clip-path` wipe along the diagonal | CSS named `view-timeline: --teaser`, entry 5-60 % | scrubbed | drawn |
| Story portrait frame | view | `clip-path` cut rises, `transform` rise | CSS `--teaser` entry 20-90 %; IO fallback | scrubbed | static |
| Story portrait image | view | parallax `transform` translateY ±8 % inside an oversized frame | CSS `--teaser` cover 0-100 % | scrubbed | static, not oversized |
| Any block holding keyboard focus | focus | entrance dropped, shown at rest | CSS `:focus-within` | n/a | n/a |

Library decision: GSAP was allowed for the pin; not used. CSS sticky + a named `view-timeline` on a tall track pins and scrubs natively (Chrome/Edge 115+, Safari 26). §4 allows a library only where CSS cannot pin or scrub. Firefox (no scroll timelines) gets no pin and the IO reveal; the fallback path was not rendered in Firefox (see section 9).

## 5. Weights

| Item | Bytes |
|---|---|
| HTML (inline CSS, JSON-LD) | 34,669 raw / 8,404 gzip |
| Fonts: Archivo 700 wdth 100-125, Plex Sans 400, Plex Sans 500 | 20,208 + 17,056 + 17,868 = 55,132 |
| `home.js` | 9,479 raw / 3,609 gzip |
| Above the fold transferred (1440, local, uncompressed HTML) | 101,115 B (~0.1 MB; budget 2 MB) |
| Whole Home on load at 390 (adds lazy 3:2 board image 38 KB) | 145,946 B |
| Pose loop video (loads on hover / in view only, `preload="none"`) | 1,100,436 B, 0.89 Mb/s, 9.9 s, no audio |

JS gz total on Home: 4.1 KB (3,609 + 157 + 377).

## 6. Web Vitals

CDP emulation: Lighthouse "Slow 4G" profile (150 ms RTT, 1.6 Mb/s down, 750 kb/s up), CPU 4x, cache disabled, light theme; LCP/CLS from `PerformanceObserver`, INP proxy = max event duration over two real mouse clicks on the theme toggle. Lighthouse CLI is not installed. Local server without gzip or CDN, so TTFB is optimistic and HTML bytes pessimistic.

| Viewport | LCP | LCP element | CLS | INP (proxy) |
|---|---|---|---|---|
| 1440 x 900 | 484 ms | `h1.hero__name` (text) | 0.013 | 32 ms |
| 390 x 844 | 436 ms | `h1.hero__name` (text) | 0 | 40 ms |

## 7. Screenshots (`pilot-shots/d/`, WebP)

- `home-{light,dark}-{390,768,1440}-{top,pin1,pin2,story,bottom}.webp`: 30 viewport captures. `pin1`/`pin2` = 60 % through each tile's pin (mid-scroll, after the pin has resolved). 390 uses CDP device emulation (`mobile: true`), which reflows correctly; the iframe probe was not needed.
- `reduced-{light,dark}-1440-{top,pin1,story}.webp`: reduced motion emulated.
- `nojs-{light,dark}-1440-full.webp`: full page with JavaScript disabled (half scale).
- `focus-{light,dark}-1440-tab{2,8,12}.webp`: keyboard focus on nav, tile 1 action, story action.
- Round 1 files at the top of `pilot-shots/` belong to pilot C and are untouched.

## 8. What I would change next

1. Tune the vein field with Kaan: density, the ratio of thick main veins to hairlines, and whether the accent veins should be lapis only.
2. Decide whether the hero stays ink in dark theme; the literal §4 inversion makes it a bright marble slab, which may read as a flash to dark-mode users.
3. Replace the annotated board diagram with a clean device photo (CONTEXT §4 request 1); the labels compete with the tile copy.
4. Raise the light-theme glass tag rail over the board photo from 5.6:1 toward 7:1 (more opaque glass token or a darker scrim edge).
5. Render and fix the Firefox IO fallback path (not rendered here), and Safari 26's scroll timelines.
6. Measure with Lighthouse on the deployed GitHub Pages build (gzip, CDN) instead of CDP emulation on a local server.
7. Add a favicon (Home requests `/favicon.ico` and gets a 404).
8. Subset a subscript-two glyph into Plex Sans or render CO₂ with `<sub>`; the ₂ currently falls back to a system face.
9. Retire `_sass/marble/_card.scss`, `flagship-card.html` and the Schibsted/Source Serif files once a direction is picked (left in place: no deletions during the pilot).
10. Update `ISSUE_LOG.md` and `FILE_MAP.md` (Claude-only, outside the worktree) once the coordinator picks a direction.

## 9. Not verified

- Firefox (IO fallback) and Safari rendering; only headless Chrome was used.
- Theme flash on reload observed visually (checked by script order only).
- Real-device touch autoplay of the tile video (only `(hover: hover)` desktop path was exercised).
- Lighthouse-grade vitals on the deployed site.

## 10. Design decisions (<= 20 lines)

- Direction: D, cinematic slab. A dark full-viewport hero with a generated vein field, then light and dark slabs alternating: intro (light), Lurie (dark), SRAlab (light), Story (dark), footer (light). Dark theme inverts every slab by swapping tokens.
- Type: Archivo 700 with the width axis kept (100-125 %): the name is set at 125 % width, 9 rem at 1440, like a cut inscription. IBM Plex Sans 400/500 carries the text in an engineering register. Three weights, 55 KB, self-subset.
- Accent: lapis (#2b44c4 on marble, #9eb0ff on ink), like a lapis inlay in marble. Pyrite gold appears only as the far gradient stop on the few accent veins in the hero.
- Marble as style: crisp diagonal cuts (hero bottom edge, story top edge, cut-corner media frames, a cut-stone clip-path that opens into each frame), high-contrast ink/marble slabs, SVG grain, a soft lapis-tinted radial gradient on light slabs (the live site's soft background, kept), and glass tag rails over media. No stone imagery anywhere.
- Motion: CSS first. Scroll-driven `view()`/`scroll()` for every entrance, the hero recede and the portrait parallax. The flagship pin and scrub use CSS sticky plus a named view-timeline, so no library. An IntersectionObserver fallback covers browsers without scroll timelines. The only JS motion is the canvas field (draw-on, drift, depth parallax) and the video control.
- Kept from the live site: the hover-to-play video tile (re-encoded to §6), the portrait (moved to the Story slab with parallax, larger and cut-framed), the soft gradient background.
- Engineering: 4.1 KB of JS gzip, text LCP under 0.5 s in emulation, zero CLS on mobile. JS off, reduced motion and keyboard paths all render every piece of content.
