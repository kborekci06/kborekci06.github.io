# Intro variant F: Prism

Ported 2026-10-16 from branch `intro/prism` (tip of 2026-09-27) into the per-experiment contract: `_partials/`, `scss/`, `js/` and `_data/experiments/intro/prism/` are this design's only sources; `/assets` media and the `_config.yml` author block are shared. The branch keeps the full build report and iteration history.

## Concept

1. Act 1, the gem: the portrait is a pointy-top hexagon at the centre of one flat hexagonal gem; three lit joints leave the face at exactly 120 degrees (up from its top vertex, down-left and down-right from its lower side vertices) and cut the gem into three glass facets: Hardware left, Software right, People below. It reads as a prism seen corner-on, with the face at the corner where its three faces meet.
2. Each facet is lit from a different angle (a faint accent gradient per face), so the three read as faces of one cut stone, not three cards; one outer ring runs round the gem, and every facet carries its own cut-edge hairline.
3. Act 2, the unfold: the joints and the ring go out; the facets swing out around the face like a fan closing to its right (Hardware arcs over the top clockwise, People swings out under Software and up the right side, Software steps in), each glass turning a few degrees as it swings and re-cutting vertex by vertex from its sector to its row cell. Text never rotates: only the glass turns; the text only translates.
4. The portrait dips, slides left and squares: its hexagon re-cuts into the fitted panel (top vertex opens into the top edge, bottom vertex into the bottom edge, 8 vertices to 8).
5. Settled = B's layout (portrait left as a fitted panel, pillar row right, the Forged panel with tagline, blurb and link cut down under the row). JS off and reduced motion show exactly this. Alternative considered: a triangular cluster (facets on alternate hexagon edges); rejected because its corner pieces cannot hold a pillar line upright.
