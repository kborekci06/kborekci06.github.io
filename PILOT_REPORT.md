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
| Panels (`.facet`, glass + text) | entry 0% to cover 42% | apart (outer two offset sideways and tilted, middle dropped) to fitted | `transform`, scroll-driven | fitted, static |
| Per-panel inlays (`.facet::after`) | cover 30% to cover 42% | visible to gone | `opacity` | hidden |
| Joined inlay (`.facets__inlay`) | cover 34% to cover 50% | draws on left to right | `clip-path` wipe | drawn |
| Seams (`.facet__body::before`, `.facets__tagline::before`) | cover 36% to cover 50% | draw on along their length | `transform` scale | drawn |
| Backlight (`.facets::before`) | entry 40% to cover 50% | dim and small to full | `opacity`, `transform` | full |
| Tagline, blurb, link | cover 40% to cover 56%, staggered | rise in | `opacity`, `transform` | visible |
| Sheen (`.facets__sheen`) | hover or focus inside the panel | one pass of light across the joined panel | `translate` transition | none |
| Fallback (`html.no-sda`) | `.is-in` from IntersectionObserver | the same apart to settled change as one timed transition | `transition` | not applied |
