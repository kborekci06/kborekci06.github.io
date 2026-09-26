# Phase 1 pilot report: Builder C (accessibility and performance-led)

Branch `pilot/c`. Scope: Home only, light and dark, plus the two content schemas. Excluded from the published site via `_config.yml` `exclude`.

Tooling note: the Chrome DevTools MCP tools were not exposed to this session. All rendered evidence below comes from headless Chrome 1xx driven over the raw Chrome DevTools Protocol (Node script: device emulation, `Emulation.setEmulatedMedia`, `Accessibility.getFullAXTree`, `PerformanceObserver`, `Network.*`), against the built site served by `python3 -m http.server 4103`. 390px was rendered with DevTools device emulation (`mobile: true`), not the iframe probe. Lighthouse was not run.

## 1. Build log (tail)

`bundle exec jekyll build --destination /tmp/pilot-c-site` from the worktree:

```text
To use retry middleware with Faraday v2.0+, install `faraday-retry` gem
            Source: /Users/kaanborekci/Desktop/kborekci06.github.io/.claude/worktrees/agent-a33af761931623ca8
       Destination: /tmp/pilot-c-site
 Incremental build: disabled. Enable with --incremental
      Generating...
       Jekyll Feed: Generating feed for posts
                    done in 0.288 seconds.
 Auto-regeneration: disabled. Use --watch to enable.
```

Only the known `faraday-retry` warning. Old minima pages still build and render with `assets/main.css` (the new layout is `base.html`, see §7).

## 2. marble-ui detection greps

Scoped to the files this pilot added (`_sass/_site.scss`, `_sass/marble/`, `_layouts/`, and the 14 new includes):

```text
D2 hex/rgb outside _tokens.scss : (no output)
!important                      : (no output)
style=                          : (no output; index.md included)
D6 justify / hyphens            : (no output)
CSS @import url()               : (no output)
minima classes in built Home    : 0 (page-content, wrapper, post-title)
```

Repo-wide D2 still hits pre-existing minima-era partials the pilot page does not load: `_components.scss` 19, `_figures.scss` 9, `_layout.scss` 5, `_legacy-tokens.scss` 5.

Weights: `font-weight` in new SCSS resolves to 400 (text) and 600 (display) only. Loaded: Schibsted Grotesk 600 (static file) and Source Serif 4 variable `wght` 400-600 (one file). Two weights used, three available, cap is four. No faux bold possible.

## 3. Contrast (every semantic pair, both themes; marble-ui formula)

| Theme | Pair | Foreground | Background | Ratio | Minimum | Pass |
|---|---|---|---|---|---|---|
| light | body text | #1b1b1a | #fcfcfa | 16.78:1 | 4.5 | yes |
| light | muted/meta text | #4a4a46 | #fcfcfa | 8.67:1 | 4.5 | yes |
| light | link text + focus ring | #1d5b4c | #fcfcfa | 7.71:1 | 4.5 | yes |
| light | meaningful vein (section rule, toggle border) | #74746e | #fcfcfa | 4.58:1 | 3.0 | yes |
| light | decorative vein | #c8c8c2 | #fcfcfa | 1.64:1 | none | n/a |
| light | skip link text on inverse | #fcfcfa | #1b1b1a | 16.78:1 | 4.5 | yes |
| dark | body text | #ededea | #121211 | 15.98:1 | 4.5 | yes |
| dark | muted/meta text | #b5b5af | #121211 | 9.10:1 | 4.5 | yes |
| dark | link text + focus ring | #8ccfb8 | #121211 | 10.47:1 | 4.5 | yes |
| dark | meaningful vein (section rule, toggle border) | #85857f | #121211 | 5.05:1 | 3.0 | yes |
| dark | decorative vein | #3a3a37 | #121211 | 1.64:1 | none | n/a |
| dark | skip link text on inverse | #121211 | #ededea | 15.98:1 | 4.5 | yes |

Every text pair clears AAA (7:1). Muted text sits above the marble-ui 4.5-6 band by choice: meta labels stay AAA.

## 4. Page weight and Core Web Vitals (measured)

Requests on a cold load of `/`, identical at 390, 768 and 1440 (DPR 1). Bytes are on-the-wire from the local server, which does not compress; GitHub Pages gzips HTML (measured `gzip -c`: 17,128 B to 5,153 B).

| Request | Bytes | Priority | Above the fold at 390x844 |
|---|---|---|---|
| `/` (HTML with 9.4 KB inlined CSS and 0.9 KB JS) | 17,128 | VeryHigh | yes |
| `schibsted-grotesk-600-latin.woff2` (preloaded) | 25,465 | High | yes |
| `source-serif-4-var-latin.woff2` (preloaded) | 51,113 | High | yes |
| `portrait/kaan-borekci-400.webp` (fetchpriority=high) | 15,773 | High | partly |
| `diaphragm-control/card-600.webp` (lazy) | 38,163 | Low | no (fetched by Chrome's lazy-load distance margin) |
| `infant-pose-pipeline/card-600.webp` (lazy) | 6,470 | Low | no |
| `/favicon.ico` (404, no favicon exists) | 520 | High | n/a |
| **Total transferred** | **154,632** | | Above the fold: 109,479 B (HTML uncompressed) |

Budget: 2 MB above the fold (CLAUDE.md §6). Used: 0.11 MB (5.5%); whole page 0.15 MB. Render-blocking requests: 0 (CSS inlined, no external script). JS: 0.9 KB inline, toggle only.

Lab LCP / CLS, headless Chrome, localhost, cold cache, median of 3 (range under 60 ms):

| Viewport | Profile | LCP | LCP element | FCP | CLS |
|---|---|---|---|---|---|
| 390x844 | 150 ms RTT, 1.6 Mbps, 4x CPU | 356 ms | `p.hero__intro` (text) | 356 ms | 0.0175 |
| 768x1024 | same | 688 ms | portrait `img` | 360 ms | 0.0168 |
| 1440x900 | same | 368 ms | `h1.hero__name` (text) | 368 ms | 0.0053 |
| all three | unthrottled | 40-52 ms | same | same | 0.0000 |

Reading: localhost removes real TTFB, so these are lower bounds, not field values; no CrUX exists for an unpublished page. CLS comes from the serif fallback (Georgia) swapping to Source Serif 4 when the fonts arrive after first paint under throttling; it disappears when fonts are cached or fast. It is inside "good" (0.1) but not zero. The fix is a metric-matched fallback `@font-face` (`size-adjust`, `ascent-override`), listed in §6.

## 5. Screenshots (`pilot-shots/`)

`home-{light,dark}-{390,768,1440}.png` (full page) and `focus-card-{light,dark}-1440.png` (keyboard focus on the first card). Measured on each render: no horizontal scroll at any width (`scrollWidth == clientWidth`); hero name on one line at all three widths; card titles 1 line at 390 and 1440, "Diaphragm pacing data platform" 2 lines at 768.

Accessibility findings (rendered, CDP):
- Landmarks: banner, navigation "Primary", main, three named regions (hero, Selected work, Story), contentinfo. One `h1`; `h1 > h2 > h3` without skips. `lang="en"`, title, viewport without zoom lock.
- Skip link is the first Tab stop and becomes visible (top 8px). `main` receives focus.
- Keyboard: Tab order matches visual order; all 13 interactive elements show a 2px accent ring in both themes (card links draw it on the stretched `::after`, so the ring outlines the whole card).
- Targets at 390: every link and button is 44px tall or more, except the two card title links (28px text line), whose hit area is the full card through the stretched link.
- Images: 3 of 3 have `width`, `height`, `alt`; 0 lazy images in the initial viewport; the portrait is the only eager image.
- Reduced motion: link transitions 150 ms by default, 0 s under `prefers-reduced-motion: reduce`; no autoplay media on Home.
- Theme: OS dark with no stored choice renders dark with no `data-theme` and `aria-pressed="true"`; a click stores `light` and flips the state; after reload with OS still dark, first paint is already light (`first-paint` observer read the light surface), so no flash.
- Known nit: Chrome exposes CSS-uppercased text in accessible names ("HOME", "DARK THEME"). Harmless for VoiceOver; see §6.

## 6. What I would change next

1. Add a metric-matched Georgia fallback for Source Serif 4 to take throttled CLS from 0.017 to about 0.
2. Add a favicon (SVG, tokens cannot reach it, so one hex exception documented) to remove the 404 request.
3. Run Lighthouse accessibility and SEO audits once DevTools MCP is available, and a VoiceOver pass.
4. Rename `base.html` to `default.html` in the same commit that retires minima (`theme: minima` out).
5. Replace the diaphragm thumbnail: it is a labelled figure; a clean device photo would read as marble, not as a poster.
6. Retire `_data/projects/<slug>/tags.yml` in favour of front matter `tags`, after fixing the overclaims it still carries on the old page.
7. Add `og:image` per page (FUN-008) from `thumbnail`, and a sitemap.
8. Point the Work nav item at `/work/` when DES-013 lands; build Story from `_data/story.yml`.
9. Serve the nav labels as sentence-case text with CSS uppercase only if screen-reader testing shows spelling-out.
10. Consider an AVIF source in `responsive-image.html` only if portrait bytes ever dominate; today they are 16 KB.

## 7. Design decisions (why)

- Bold element: the name, set in Schibsted Grotesk 600 at `clamp(3rem, 14vw, 12rem)` with -0.035em tracking, on one line, cut underneath by one full-width hairline. Everything else is quiet: one accent, flat surfaces, no shadows.
- Type: Schibsted Grotesk 600 (display) over Source Serif 4 400 (text), marble-ui pairing 1. Grotesk for structure, serif for reading. Sentence case throughout; all-caps only for nav, eyebrows and meta keys.
- Scale: ratio 1.25 from an 18px body (14 / 18 / 22.5 / 28 / 35); display step separate. Body line height 1.6, display 1.1, measure 65ch.
- Spacing: 4px base, `--space-1..9`; section rhythm uses only 48/64/96px.
- Marble: near-white `#fcfcfa` / near-black `#121211` surfaces; hairline veins at two strengths (decorative 1.64:1 under the header and around media; meaningful 4.6-5:1 on section heads and under the name); radius 0; images framed by a 1px vein.
- Accent: one verde green (`#1d5b4c` light, `#8ccfb8` dark), used for links and the focus ring only.
- Theme: tokens swap under `:root[data-theme]` and `prefers-color-scheme`; components never branch. A 1-line head script applies a stored choice before paint.
- Performance: CSS compiled by Jekyll and inlined (9.4 KB), fonts self-hosted and preloaded (76 KB, Latin subset), images WebP with `srcset`, intrinsic sizes, one `fetchpriority=high`.
- Structure: `base.html` + `home.html`; one include per component; Home copy in `index.md` front matter, cards from project front matter (`featured`, `order`). `base.html` is not named `default.html` because minima's `page` layout chains into `default`, and taking that name would restyle every old page during the pilot.
- Not done in this worktree: `ISSUE_LOG.md` and `FILE_MAP.md` updates (Claude-only files outside the worktree; the task forbids writing there).
