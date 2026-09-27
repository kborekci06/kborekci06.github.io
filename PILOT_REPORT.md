# Intro concept report: Facets

Branch `intro/facets` from `design` (26cfb21). Home intro slab only. Refs: CON-050.

## 1. Plan (written before the build)

### Concept in five lines
1. Three fitted glass panels, one per pillar (label and one line), cut with the tile frames' chamfers, the tiles' wide lower cut on the last one, and an inlay hairline.
2. As the intro enters they sit apart, tilted and offset, with the page backlight dim behind them.
3. Scrolling slides them together into one panel; the three per-panel inlays fade and one inlay around the joined panel draws on, with the seams kept as inlay hairlines.
4. The joined panel's lower band then fills with the tagline, the blurb and the "More about my story" link, and the backlight comes up behind the glass.
5. Settled, it reads as one fitted stone panel with three facets: the combination of the pillars is the section.

### Triad (assigned)
| id | label | line |
|---|---|---|
| mechanics | Mechanics | Solids, fluids, and dynamics, trained through biomedical and mechanical engineering. |
| computation | Computation | Firmware, computer vision, and physics-informed models of human motion. |
| care | Care | Built with clinicians, caregivers, and patients, for quality of life. |

Tagline: "Forged through mechanics, computation, and care." Wording is placeholder (owner rewrites with story-craft).

### Motion map
Timeline: `.facets` names a block view timeline `--facets`; every range below is on it. Fallback: `.facets` carries `data-reveal`, so `home.js` §2 adds `.is-in` and the apart state transitions to the settled state. JS off, reduced motion, or focus inside the panel: settled state, static.

| Element | Trigger (range) | Effect | Technique | Reduced motion |
|---|---|---|---|---|
| Panels (`.facet`, glass + text) | entry 0% to cover 34% | apart (outer two offset sideways and tilted, middle dropped) to fitted | `transform`, scroll-driven | fitted, static |
| Panel glass (`.facet::before`) | cover 22% to cover 34% | inner chamfers close so the panels butt flush | `clip-path` | flush |
| Per-panel inlays (`.facet::after`) | cover 24% to cover 34% | visible to gone | `opacity` | hidden |
| Joined inlay (`.facets__inlay`) | cover 28% to cover 40% | draws on left to right | `clip-path` wipe | drawn |
| Seams (`.facet__body::before`, `.facets__tagline::before`) | cover 30% to cover 40% | draw on along their length | `transform` scale | drawn |
| Backlight (`.facets::before`) | entry 40% to cover 40% | dim and small to full | `opacity`, `transform` | full |
| Tagline, blurb, link | cover 32% to cover 46%, staggered | rise in | `opacity`, `transform` | visible |
| Sheen (`.facets__sheen`) | hover or focus inside the panel | one pass of light across the joined panel | `translate` transition | none |
| Fallback (`html.no-sda`) | `.is-in` from IntersectionObserver | the same apart to settled change as one timed transition | `transition` | not applied |

## 2. Second triad (proposal)
| id | label | line |
|---|---|---|
| physics | Physics | Mechanics and physiology as first principles, before any model. |
| code | Code | From RP2040 firmware to physics-informed models of infant motion. |
| legacy | Legacy | A fourth-generation family business, and a medtech company to bring into it. |

Tagline: "Forged through physics, code, and legacy." Why: it is the owner's own "Forged through x, y, and legacy" line, with legacy carrying the family business and the what's-next plan that the assigned triad leaves to the Story page.

## 3. Gates (build `bundle exec jekyll build -d <scratchpad>/site`, served on :8447, headless Chrome on :9447)
- Build: succeeds; only the known `faraday-retry` notice.
- Tokens: no hex, `rgb()` or `hsl()` in `_intro.scss`, `_motion.scss` or the include; new values are `--intro-*` tokens in `_tokens.scss`; the only raw lengths are `0px` corner arguments.
- `!important`: none. `style=`: none.
- JS off (scripts disabled before load, no `html.js`): settled panel, facet `transform: none`, blurb opacity 1, per-facet rings hidden.
- Reduced motion: same computed state; no animation on any facet.
- No scroll-jack: no JS added; native scrolling; motion is `animation-timeline` only.
- Horizontal overflow: `scrollWidth == innerWidth` at 390, 768 and 1440 at every captured position. At 768 the apart care facet first pushed the page 23px wide (the body's `overflow-x: clip` propagates to the viewport as `hidden`); fixed with `overflow-x: clip` on `.intro`.
- Keyboard: focusing the link while the facets are apart shows the settled panel (`:focus-within` drops the scrub) with the focus ring visible.
- Each load confirmed as this build: URL `localhost:8447` and the `#intro-title` text read back before every capture.

## 4. Contrast on composited pixels (settled; min over 1440, 768, 390; background read from a second render with the ink hidden)
| Theme | Element | Ink | Min ratio |
|---|---|---|---|
| dark | pillar label | cream-50 | 14.0 |
| dark | pillar line | tan-200 | 7.62 |
| dark | tagline | cream-50 | 11.36 |
| dark | blurb | cream-50 | 13.0 |
| dark | link text | cream-50 | 10.89 |
| dark | inlay ring | honey-400 | 3.72 |
| dark | seams | honey-400 | 3.56 |
| light | pillar label | umber-950 | 16.0 |
| light | pillar line | umber-700 | 5.23 |
| light | tagline | umber-950 | 15.07 |
| light | blurb | umber-950 | 15.66 |
| light | link text | umber-950 | 16.38 |
| light | inlay ring | burnt-700 | 5.91 |
| light | seams | burnt-700 | 5.99 |

## 5. Screenshots (`pilot-shots/intro/`, WebP)
`intro-{dark,light}-{1440,390}-{entering,mid,settled,hover,focus}.webp` (20) and `intro-dark-{1440,390}-{reduce,jsoff}.webp` (4). Positions on the panel's view timeline: entering cover 12 %, mid cover 26 %, settled cover 47 %.

## 6. Not verified
- The IntersectionObserver fallback (`html.no-sda`): Chrome supports scroll-driven animation, so the fallback path was checked by reading the code only.
- Safari and Firefox rendering (subgrid, `polygon(evenodd, ...)` clip rings, `backdrop-filter` on a clipped pseudo-element).
- `/story/` does not exist yet; the link 404s until the Story page ships.
- Hover sheen on touch devices (it is a hover affordance; focus triggers it too).

## 7. What I would change next
1. Tune the ranges on a real phone: the stacked panel is nearly a viewport tall, so the join ends with the first facet near the top edge.
2. Let the faint glass joints under the joint band go (they show as soft vertical bands at 1440) or turn them into an intended lamination.
3. Tie the panel backlight to the stone's travelling backlight instead of a fixed halo.
4. Give each facet a small lit vein that runs into the seam as it joins, so the join reads as light meeting, not only lines drawing.
5. Try a stronger apart state at 1440 (more spread, a little rotation on the middle facet) and compare.
6. Measure contrast of the link text mid-sheen; the sheen passes over text for about 0.5 s.
7. Remove the now unused `intro` front matter in `index.md` and the `intro=` include parameter in `_layouts/home.html` (outside this brief's scope).
8. Run the fallback in a browser without scroll-driven animation (Firefox stable) and fix what it shows.
9. Rewrite the copy with story-craft; the lines are placeholders.
10. Decide with the owner whether the tagline sits above the pillars (reading order) or below them (the join story, current).
