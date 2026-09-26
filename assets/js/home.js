// Home runtime, loaded with defer (index.md front matter: scripts). Motion map: PILOT_REPORT.md §0.3.
// 1. Band field: generated honey-onyx bands behind the hero name (draw-on at load, slow flow, depth parallax on scroll);
//    each band is a stream that sheds side streams as it crosses the screen, drawn live every frame; gold veins (cracks
//    filled with light, with branches and dust) cut across the bands, drawn on after them and cached once complete.
// 2. Reveal fallback: IntersectionObserver classes where CSS scroll-driven animations are unsupported.
// 3. Tile video: hover/focus-to-play on hover devices, in-view autoplay on touch, a play/pause button everywhere.
// 4. Signal bubble: redraws the Liquid-rendered traces each frame from their data attributes; rest -> active on tile hover/focus.
// Native scrolling only: no scroll-input listeners, no cancelled events, no scroll position writes.
(function () {
  "use strict";

  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var hasSDA = window.CSS && CSS.supports("(animation-timeline: view()) and (animation-range: entry)");

  // Deterministic PRNG so the field is composed once, not reshuffled per visit.
  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Tokens arrive as #rrggbb; canvas gradients need an explicit alpha on the same hue (not "transparent", which is black).
  function rgba(hex, a) {
    var n = parseInt(hex.replace("#", ""), 16);
    return "rgba(" + (n >> 16) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
  }

  function clamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }

  // ---- 1. Band field (honey onyx) ----
  // Onyx bands, not cracks: each family is a smooth wave. It crosses the screen as a stream that divides at a few fork
  // points into narrower streams (a braided river seen from above). Lit streams glow additively (accent -> glow gradient,
  // four passes for a soft falloff); unlit ones are umber; hairline growth rings follow every stream's edges.
  var SEED = 1906;
  var DRAW_MS = 2200;
  var STEP = 24; // px between wave samples
  var TAPER = 6; // samples over which a drawing-on front narrows to a point
  var DEPTH = [
    { parallax: 0.1, speed: 0.00005 }, // far
    { parallax: 0.24, speed: 0.00008 }, // mid
    { parallax: 0.42, speed: 0.00011 } // near
  ];
  var GLOW = [[1.4, 0.06], [0.8, 0.1], [0.35, 0.18], [0.08, 0.35]]; // ribbon passes: width factor, alpha
  // Forks (PILOT_REPORT.md §3): where a stream divides, both children start on the parent's centre line at the parent's
  // width, share its tangent, then turn apart, narrow to their share and keep going to the edge (or rejoin: a braid).
  var FORK = {
    unlit: [0, 1, 1, 2], // side streams per unlit trunk, drawn at random
    litForks: [2, 3], // side streams per lit trunk, each leaving the main stream at its own point
    angle: [14, 38], // degrees a side stream turns away from the main stream (up or down, picked per fork)
    spread: [0.25, 0.45], // a side stream's separation saturates at this fraction of the height, so it fans out then runs on
    share: [0.66, 0.76], // width share the main stream keeps at each fork; the side stream takes the rest
    rings: [4, 1, 1], // growth rings per side on the trunk and on each child (fewer lines downstream)
    lag: 0.1 // the side stream's draw-on front trails the main one's by this fraction of the width: the fork opens
  };

  // Gold veins (the second system in real onyx: cracks filled with light that cut across the wave bands). Jagged
  // polylines with side branches that taper out, a bright core with a warm glow, and gold dust along them. They are
  // fixed in the stone: no flow, only depth parallax; drawn on after the bands, then cached to an offscreen layer.
  var VEIN = {
    count: [2, 1], // main veins at >= 900px, below
    heading: [0.55, 1.05], // radians below the +x axis: veins cut down across the bands
    step: [10, 26], // px per jag
    wobble: 0.24, // heading noise per jag (mean-reverting)
    branches: [3, 6], // side branches per main vein
    turn: [0.5, 1.2], // radians a branch turns off its parent (either side)
    length: [0.16, 0.42], // branch length as a fraction of the parent's
    dust: 0.11, // gold specks per px of vein
    delay: 0.55, // veins start drawing when the band draw-on reaches this
    ms: 1700 // draw-on time of a main vein; branches follow their spawn point
  };

  function smooth(u) {
    u = clamp(u, 0, 1);
    return u * u * (3 - 2 * u);
  }

  function veinField(canvas) {
    var host = canvas.closest(".slab");
    var ctx = canvas.getContext("2d");
    if (!host || !ctx) return;
    var w = 0, h = 0, dpr = 1, fams = [], col = {}, lit = null, N = 0, yb = null;
    var veins = [], dust = [], vcache = null;
    var start = 0, raf = 0, visible = true;

    function readColors() {
      var cs = getComputedStyle(host);
      var get = function (n) { return cs.getPropertyValue(n).trim(); };
      col = { strong: get("--s-text"), mid: get("--s-vein-strong"), far: get("--s-vein"), surface: get("--s-surface"),
        accent: get("--s-accent"), accentTo: get("--hero-vein-accent-to") };
      lit = ctx.createLinearGradient(0, h, w, 0);
      lit.addColorStop(0, col.accent);
      lit.addColorStop(0.55, col.accentTo);
      lit.addColorStop(1, col.accent);
    }

    // One family: base line through (0, y0) with a gentle tilt, two summed sines; growth rings at cumulative offsets.
    // Families are spaced by where they cross mid-screen; the ones far from the copy are lit, the ones behind it unlit.
    function generate() {
      var r = mulberry32(SEED), list = [], n = w > 900 ? 6 : 5, s = Math.min(h, w * 0.7), i, j, off, offs, tilt, ym;
      N = Math.ceil((w + 2 * STEP) / STEP) + 1; // sample grid x_j = -STEP + j * STEP, past both edges
      yb = new Float32Array(N);
      for (i = 0; i < n; i++) {
        offs = [];
        off = 0;
        for (j = 0; j < 4; j++) {
          off += 3 + r() * 11; // growth-ring spacing outward from the ribbon edge
          offs.push(off);
        }
        tilt = -0.3 + r() * 0.48; // main streams rise, fall or run level: no shared direction
        ym = h * (-0.05 + (i + 0.2 + r() * 0.6) / n * 1.1);
        list.push({
          y0: ym - tilt * w / 2, tilt: tilt, depth: i % 3,
          a1: s * (0.06 + r() * 0.08), f1: (0.35 + r() * 0.5) / w * 6.28, p1: r() * 6.28,
          a2: s * (0.01 + r() * 0.015), f2: (1.2 + r() * 1.2) / w * 6.28, p2: r() * 6.28,
          offs: offs, ribbon: (40 + r() * 90) * clamp(w / 1200, 0.5, 1), delay: r() * 0.3,
          lit: Math.abs(ym / h - 0.5) > 0.15 // lit above and below the copy, never behind it (phones and desktop)
        });
      }
      fams = list;
      generateVeins();
      var rf = mulberry32(SEED + 11);
      // Side streams leave the main stream at separate points along its run (a river shedding creeks), each turning
      // up or down on its own; about half of them shed one creek of their own further on.
      fams.forEach(function (f) {
        var main = { off: new Float32Array(N), wf: new Float32Array(N).fill(1), j0: 0, j1: N - 1, xs: -STEP, lag: 0, lvl: 0 };
        var forks = f.lit ? FORK.litForks[0] + Math.floor(rf() * (FORK.litForks[1] - FORK.litForks[0] + 1)) : FORK.unlit[Math.floor(rf() * 4)];
        var x = w * (0.04 + rf() * 0.1), gap = w * 0.62 / Math.max(forks, 1), kids, k;
        f.streams = [main];
        for (k = 0; k < forks; k++) {
          kids = fork(f, main, snap(x + rf() * gap * 0.6), 1, rf);
          if (kids[0] === main) break;
          main = kids[0];
          if (rf() < 0.5) fork(f, kids[1], snap(kids[1].xs + w * (0.12 + rf() * 0.2)), 2, rf);
          x += gap;
        }
      });
    }

    // One vein: a jagged walk from a start point along a heading, with mean-reverting noise, until it leaves the canvas
    // (mains) or runs out its length (branches). Each point carries its cumulative length; branches taper to nothing.
    function walk(r, x, y, th0, maxLen, wd, lvl) {
      var pts = [[x, y, 0]], th = th0, len = 0, st, ang;
      var cx = w / 2, cy = h / 2, rx = Math.max(w * 0.4, Math.min(w * 0.75, 340)) * 0.9, ry = rx * 0.62, dx, dy, dn, away;
      while (len < maxLen && x > -40 && x < w + 40 && y > -40 && y < h + 40) {
        st = VEIN.step[0] + r() * (VEIN.step[1] - VEIN.step[0]);
        th += (r() - 0.5) * 2 * VEIN.wobble + (th0 - th) * 0.35;
        dx = (x - cx) / rx; dy = (y - cy) / ry; dn = Math.sqrt(dx * dx + dy * dy);
        if (dn < 1.35) { // inside the copy's keep-out ellipse: blend the heading toward the outward normal, harder the deeper in
          away = Math.atan2(dy * ry, dx * rx);
          th += (((away - th) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI; // wrapped difference
          th -= (((away - th) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI; // (restore; use blend below)
          var dif = (((away - th) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
          th += dif * Math.min(1, (1.35 - dn) * 1.6);
        }
        x += Math.cos(th) * st;
        y += Math.sin(th) * st;
        len += st;
        pts.push([x, y, len]);
      }
      return { pts: pts, len: len, wd: wd, lvl: lvl, at: 0, kids: [] };
    }

    function generateVeins() {
      var r = mulberry32(SEED + 23), n = VEIN.count[w > 900 ? 0 : 1], i, k, v, b, c, ang, p, q, m, dir;
      veins = [];
      dust = [];
      vcache = null;
      for (i = 0; i < n; i++) {
        // Start on the top edge (or the left edge for the second), heading down and across; keep clear of the copy's centre.
        ang = VEIN.heading[0] + r() * (VEIN.heading[1] - VEIN.heading[0]);
        v = i % 2 === 0 ? walk(r, w * (0.05 + r() * 0.35), -20, ang, 1e9, 1.8, 0) : walk(r, -20, h * (0.35 + r() * 0.5), ang * 0.6, 1e9, 1.6, 0);
        m = VEIN.branches[0] + Math.floor(r() * (VEIN.branches[1] - VEIN.branches[0] + 1));
        for (k = 0; k < m; k++) {
          p = v.pts[Math.floor(v.pts.length * (0.12 + r() * 0.76))];
          dir = r() < 0.5 ? -1 : 1;
          b = walk(r, p[0], p[1], ang + dir * (VEIN.turn[0] + r() * (VEIN.turn[1] - VEIN.turn[0])), v.len * (VEIN.length[0] + r() * (VEIN.length[1] - VEIN.length[0])), v.wd * 0.55, 1);
          b.at = p[2];
          v.kids.push(b);
          if (r() < 0.5 && b.pts.length > 4) { // one finer branch off the branch
            q = b.pts[Math.floor(b.pts.length * (0.3 + r() * 0.5))];
            c = walk(r, q[0], q[1], ang + dir * (r() - 0.2) * 1.4, b.len * 0.5, b.wd * 0.55, 2);
            c.at = q[2];
            b.kids.push(c);
          }
        }
        veins.push(v);
      }
      // Gold dust: specks scattered a few px either side of every vein, denser near the mains.
      veins.forEach(function (vn) { sprinkle(r, vn); });
      function sprinkle(rr, vn) {
        var j, t, a, d, pa, pb, u;
        for (j = 1; j < vn.pts.length; j++) {
          pa = vn.pts[j - 1]; pb = vn.pts[j];
          for (t = 0; t < (pb[2] - pa[2]) * VEIN.dust * (vn.lvl ? 0.5 : 1); t++) {
            u = rr(); a = rr() * 6.28; d = 3 + rr() * rr() * 16;
            dust.push([pa[0] + (pb[0] - pa[0]) * u + Math.cos(a) * d, pa[1] + (pb[1] - pa[1]) * u + Math.sin(a) * d, 0.4 + rr() * 0.9, 0.25 + rr() * 0.6, pa[2] + (pb[2] - pa[2]) * u, vn]);
          }
        }
        vn.kids.forEach(function (kd) { sprinkle(rr, kd); });
      }
    }

    // Stroke one vein up to length front (px along it); the last 30% of a branch tapers, so cracks die out, not stop.
    function strokeVein(c, vn, front, width, alpha, style) {
      var j, p, q, f0, pts = vn.pts, lim = Math.min(front, vn.len), taper = vn.lvl ? 0.3 : 0.12;
      if (lim <= 0 || pts.length < 2) return;
      c.strokeStyle = style;
      c.lineJoin = "round";
      c.lineCap = "round";
      for (j = 1; j < pts.length && pts[j - 1][2] < lim; j++) {
        p = pts[j - 1]; q = pts[j];
        f0 = 1 - Math.max(0, (q[2] / vn.len - (1 - taper)) / taper); // taper factor along the tail
        c.globalAlpha = alpha * (0.35 + 0.65 * f0);
        c.lineWidth = Math.max(0.4, width * vn.wd * (0.5 + 0.5 * f0));
        c.beginPath();
        c.moveTo(p[0], p[1]);
        if (q[2] > lim) { // partial last segment while drawing on
          var u = (lim - p[2]) / (q[2] - p[2]);
          c.lineTo(p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u);
        } else c.lineTo(q[0], q[1]);
        c.stroke();
      }
    }

    // Draw every vein (and its branches, once the front has passed their spawn point) at draw-on progress u in 0..1.
    function drawVeins(c, u) {
      var passes = [[7, 0.06, col.accent], [2.6, 0.24, col.accentTo], [0.9, 0.85, col.accentTo]];
      var i;
      c.globalCompositeOperation = "lighter";
      passes.forEach(function (ps) { veins.forEach(function (vn) { veinTree(c, vn, u * vn.len * 1.35, ps[0], ps[1], ps[2]); }); });
      c.globalCompositeOperation = "source-over";
      c.fillStyle = col.accentTo;
      for (i = 0; i < dust.length; i++) {
        if (dust[i][4] > u * dust[i][5].len * 1.35) continue;
        c.globalAlpha = dust[i][3];
        c.beginPath();
        c.arc(dust[i][0], dust[i][1], dust[i][2], 0, 6.28);
        c.fill();
      }
      c.globalAlpha = 1;
    }

    function veinTree(c, vn, front, width, alpha, style) {
      strokeVein(c, vn, front, width, alpha, style);
      vn.kids.forEach(function (kd) { if (front > kd.at) veinTree(c, kd, (front - kd.at) * 1.2, width, alpha, style); });
    }

    // Veins are static in the stone: after the draw-on, render them once to an offscreen layer and reuse it each frame.
    function paintVeins(prog, sy) {
      var u = clamp((prog - VEIN.delay) / (1 - VEIN.delay), 0, 1), oy = -sy * DEPTH[2].parallax * 1.3;
      if (u <= 0) return;
      if (u >= 1) {
        if (!vcache) {
          vcache = document.createElement("canvas");
          vcache.width = canvas.width;
          vcache.height = canvas.height;
          var vc = vcache.getContext("2d");
          vc.setTransform(dpr, 0, 0, dpr, 0, 0);
          drawVeins(vc, 1);
        }
        ctx.globalAlpha = 1;
        ctx.drawImage(vcache, 0, oy, w, h);
        return;
      }
      ctx.save();
      ctx.translate(0, oy);
      drawVeins(ctx, u);
      ctx.restore();
    }

    function snap(x) {
      return Math.round((x + STEP) / STEP);
    }

    // Divide stream p at grid index js into two children. O(x) is the separation of their centre lines: zero with zero
    // slope at the fork (shared tangent), then "apart" (keeps diverging at the fork angle), "parallel" (turns, then runs
    // alongside) or, on second-level forks only, "rejoin" (opens and closes again: a braid). Each child narrows from the
    // parent's width to its share as it separates (and widens back on a rejoin), so the pair always sums to the parent.
    function fork(f, p, js, lvl, r) {
      if (js >= p.j1 - 4) return [p, p];
      var th = Math.tan((FORK.angle[0] + r() * (FORK.angle[1] - FORK.angle[0])) * Math.PI / 180);
      var k = FORK.share[0] + r() * (FORK.share[1] - FORK.share[0]), side = r() < 0.5 ? -1 : 1;
      var mode = lvl > 1 && r() < 0.3 ? "rejoin" : r() < 0.75 ? "apart" : "parallel";
      var sep = Math.max(f.ribbon * p.wf[js], 24), len = mode === "apart" ? w * 0.12 : 1.5 * sep / th;
      var cap = h * (FORK.spread[0] + r() * (FORK.spread[1] - FORK.spread[0])); // where an "apart" pair stops widening
      var hold = r() * w * 0.15, kids = [mk(k, side * (1 - k)), mk(1 - k, -side * k)], j, d, O, g, c, q;
      // The wider child carries on from the parent at full width and narrows to its share; the narrower one grows out of
      // the parent's centre line from zero width to its share. Widths always sum to the parent's, nothing doubles at the
      // fork, and both glow as brightly per pixel as the parent: total light scales with width.
      function mk(sh, dir) {
        return { off: new Float32Array(N), wf: new Float32Array(N), g: new Float32Array(N), jt: N - 1, j0: js, j1: N - 1,
          xs: -STEP + js * STEP, lag: (sh >= 0.5 ? 0 : FORK.lag) + p.lag, sh: sh, dir: dir, mode: mode, lvl: lvl };
      }
      for (j = js; j < N; j++) {
        d = (j - js) * STEP;
        if (mode === "apart") {
          O = th * (d < len ? d * d / (2 * len) : d - len / 2);
          O = cap * Math.tanh(O / cap); // same tangent at the fork, then the separation saturates so the pair fans out and runs on
          g = smooth(d / len);
        } else if (mode === "parallel") {
          O = sep * smooth(d / len);
          g = O / sep;
        } else {
          O = sep * (smooth(d / len) - smooth((d - len - hold) / len));
          g = O / sep;
        }
        for (q = 0; q < 2; q++) {
          c = kids[q];
          c.off[j] = p.off[j] + c.dir * O;
          c.wf[j] = p.wf[j] * (c.sh >= 0.5 ? 1 - (1 - c.sh) * g : c.sh * g);
          c.g[j] = g;
          if (g >= 0.98 && c.jt === N - 1) c.jt = j;
        }
      }
      p.j1 = js;
      f.streams.push(kids[0], kids[1]);
      return kids;
    }

    function resize() {
      var box = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, Math.round(box.width));
      h = Math.max(1, Math.round(box.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      generate();
      readColors();
      paint(performance.now());
    }

    // Trunk centre line of family f at time t (flow phase) and scroll offset oy, sampled on the grid into yb.
    function trunk(f, t, oy) {
      var j, x, ph = t * DEPTH[f.depth].speed;
      for (j = 0; j < N; j++) {
        x = -STEP + j * STEP;
        yb[j] = f.y0 + x * f.tilt + f.a1 * Math.sin(x * f.f1 + f.p1 + ph) + f.a2 * Math.sin(x * f.f2 + f.p2 - ph * 1.7) + oy;
      }
    }

    // A stream's ribbon as a filled band of half-width hw * wf (vertical offsets, like the rings), grid indices j0..j1.
    // While a stream is still drawing on, its last TAPER samples narrow to a point, so the front is soft, not a cut.
    function band(st, j0, j1, hw) {
      var j, e = j1 < st.j1 ? j1 : Infinity, q;
      ctx.beginPath();
      for (j = j0; j <= j1; j++) {
        q = hw * st.wf[j] * Math.min(1, (e - j) / TAPER);
        ctx.lineTo(-STEP + j * STEP, yb[j] + st.off[j] - q);
      }
      for (j = j1; j >= j0; j--) {
        q = hw * st.wf[j] * Math.min(1, (e - j) / TAPER);
        ctx.lineTo(-STEP + j * STEP, yb[j] + st.off[j] + q);
      }
      ctx.closePath();
      ctx.fill();
    }

    // One growth ring at o outside the stream's edge (sign picks the side).
    // A child keeps its parent's outer rings only through the fork: they close onto its first ring (o -> offs[0] as the child
    // separates) and stop once they coincide with it, so no ring ends in open space.
    function ring(f, st, j0, j1, sign, o, merge) {
      var j;
      ctx.beginPath();
      for (j = j0; j <= j1; j++) ctx.lineTo(-STEP + j * STEP, yb[j] + st.off[j] + sign * (f.ribbon * 0.5 * st.wf[j] + (merge ? o + (f.offs[0] - o) * st.g[j] : o)));
      ctx.stroke();
    }

    function paint(t) {
      var still = reduce.matches;
      var prog = still ? 1 : clamp((t - start) / DRAW_MS, 0, 1);
      var eased = 1 - Math.pow(1 - prog, 3);
      var sy = still ? 0 : window.scrollY;
      var tt = still ? 0 : t;
      var i, j, k, n, f, st, reach, front, j1, g, merge;
      if (!col.surface) return; // not sized yet: the first ResizeObserver callback reads tokens and paints
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      for (i = 0; i < fams.length; i++) {
        f = fams[i];
        reach = eased * 1.5 - f.delay; // > 1 leaves time for trailing children (delay <= 0.3, trail <= 0.2)
        if (reach <= 0) continue;
        trunk(f, tt, -sy * DEPTH[f.depth].parallax);
        for (n = 0; n < f.streams.length; n++) {
          st = f.streams[n];
          // Draw-on front for this stream; a child starts drawing when its front passes the fork.
          front = -STEP + (w + 2 * STEP) * clamp(reach - st.lag, 0, 1);
          j1 = Math.min(st.j1, Math.floor((front + STEP) / STEP));
          if (j1 <= st.j0) continue;
          // Lit ribbon: additive light through the stone.
          if (f.lit) {
            ctx.globalCompositeOperation = "lighter";
            ctx.fillStyle = lit;
            for (g = 0; g < GLOW.length; g++) {
              ctx.globalAlpha = GLOW[g][1] * (f.depth === 2 ? 1.2 : 1);
              band(st, st.j0, j1, f.ribbon * GLOW[g][0] / 2);
            }
            ctx.globalCompositeOperation = "source-over";
          } else {
            ctx.fillStyle = col.far;
            ctx.globalAlpha = 0.35;
            band(st, st.j0, j1, f.ribbon * 0.3);
          }
          // Hairline growth rings along the stream's edges.
          // Rings: the main stream keeps its rings through a fork (extra ones close onto its first ring); a side stream's
          // rings begin only once it has separated (st.jt), so no bundle of lines starts at the fork point.
          var rj0 = st.lvl && st.sh < 0.5 ? Math.max(st.j0, st.jt) : st.j0;
          for (j = 0; j < 8; j++) { // rings below the ribbon (j 0-3), above (j 4-7); fewer on children
            k = j % 4;
            if (j === 7 || (k >= FORK.rings[Math.min(st.lvl, 2)] && (!st.lvl || st.sh < 0.5 || k >= FORK.rings[Math.min(st.lvl, 2) - 1]))) continue;
            if (rj0 >= j1) continue;
            ctx.strokeStyle = k === 0 ? (f.lit ? col.accent : col.mid) : k % 2 ? col.mid : col.far;
            ctx.globalAlpha = k === 0 ? 0.6 : 0.7;
            ctx.lineWidth = k === 0 ? 1.2 : 0.8;
            merge = k >= FORK.rings[Math.min(st.lvl, 2)];
            ring(f, st, rj0, merge ? Math.min(j1, st.jt) : j1, j > 3 ? -1 : 1, f.offs[k], merge);
          }
        }
      }
      paintVeins(still ? 1 : prog, sy);
      // Elliptical scrim behind the centred copy: quiets the bands so the name and positioning line keep full contrast;
      // the warm backlight on top of it is CSS (.hero__glow).
      ctx.save();
      ctx.translate(w / 2, h * 0.5);
      ctx.scale(1, 0.62);
      var rx = Math.max(w * 0.4, Math.min(w * 0.75, 340));
      var sc = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
      sc.addColorStop(0, rgba(col.surface, 0.94));
      sc.addColorStop(0.6, rgba(col.surface, 0.72));
      sc.addColorStop(1, rgba(col.surface, 0));
      ctx.globalAlpha = 1;
      ctx.fillStyle = sc;
      ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    function loop(t) {
      paint(t);
      raf = visible && !document.hidden && !reduce.matches ? requestAnimationFrame(loop) : 0;
    }

    function run() {
      if (!raf && visible && !document.hidden && !reduce.matches) raf = requestAnimationFrame(loop);
    }

    function repaint() {
      readColors();
      vcache = null;
      paint(performance.now());
    }

    new ResizeObserver(resize).observe(canvas);
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      run();
    }).observe(host);
    document.addEventListener("visibilitychange", run);
    reduce.addEventListener("change", function () { repaint(); run(); });
    // Theme swaps tokens only; re-read them from the slab when data-theme or the OS preference changes.
    new MutationObserver(repaint).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", repaint);
    start = performance.now();
    run();
  }

  // ---- 2. Reveal fallback (no CSS scroll-driven animations) ----
  function revealFallback() {
    if (hasSDA || !("IntersectionObserver" in window)) return;
    root.classList.add("no-sda");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -12% 0px" });
    document.querySelectorAll("[data-reveal], .tile, .teaser").forEach(function (el) { io.observe(el); });
  }

  // ---- 3. Tile video ----
  function tileVideo(tile) {
    var v = tile.querySelector(".tile__video");
    if (!v) return;
    var btn = tile.querySelector(".tile__play");
    var media = tile.querySelector(".tile__media");
    var chosen = null; // an explicit button choice overrides hover and in-view automation
    v.removeAttribute("controls");
    function set(on) {
      if (on) v.play().catch(function () {});
      else v.pause();
    }
    function sync() {
      if (btn) btn.textContent = v.paused ? "Play the clip" : "Pause the clip";
    }
    v.addEventListener("play", sync);
    v.addEventListener("pause", sync);
    if (btn) {
      btn.hidden = false;
      btn.addEventListener("click", function () {
        chosen = v.paused;
        set(chosen);
      });
    }
    if (reduce.matches) return; // reduced motion: no autoplay, no hover play; the button still works
    if (window.matchMedia("(hover: hover)").matches) {
      media.addEventListener("pointerenter", function () { if (chosen === null) set(true); });
      media.addEventListener("pointerleave", function () { if (chosen === null) set(false); });
    } else {
      new IntersectionObserver(function (entries) {
        if (chosen === null) set(entries[0].isIntersecting);
      }, { threshold: 0.6 }).observe(v);
    }
  }

  // ---- 4. Signal bubble (_includes/signal-bubble.html; shapes: _data/signal-shapes.yml) ----
  // Same geometry as the Liquid path: one period of points repeated freq x window times across 400 units,
  // scaled around origin by amp, y = 50 - 40 * value. Phase is integrated so a change of freq never jumps.
  function signalBubble(box) {
    var win = parseFloat(box.getAttribute("data-window"));
    var tile = box.closest(".tile") || box;
    var tau = parseFloat(getComputedStyle(box).getPropertyValue("--signal-ease")) || 250;
    var active = false, raf = 0, visible = false, last = 0;
    var traces = [].map.call(box.querySelectorAll("[data-points]"), function (el) {
      var pair = function (n) { return el.getAttribute(n).split(",").map(parseFloat); };
      var rest = pair("data-rest");
      return { el: el, pts: JSON.parse(el.getAttribute("data-points")), o: parseFloat(el.getAttribute("data-origin")),
        rest: rest, act: pair("data-active"), f: rest[0], a: rest[1], ph: 0 };
    });

    function draw(s) {
      var cyc = s.f * win, fr = s.ph % 1, d = "", k, i, p, x;
      for (k = -1; k <= Math.ceil(cyc) + 1; k++) {
        for (i = 0; i < s.pts.length; i++) {
          p = s.pts[i];
          x = (k + p[0] - fr) / cyc * 400;
          d += (d ? "L" : "M") + x.toFixed(1) + "," + (50 - 40 * (s.o + (p[1] - s.o) * s.a)).toFixed(1);
        }
      }
      s.el.setAttribute("d", d);
    }

    function frame(t) {
      var dt = last ? Math.min(t - last, 100) : 0, mix = 1 - Math.exp(-dt / tau);
      last = t;
      traces.forEach(function (s) {
        var g = active ? s.act : s.rest;
        s.f += (g[0] - s.f) * mix;
        s.a += (g[1] - s.a) * mix;
        s.ph += s.f * dt / 1000;
        draw(s);
      });
      raf = visible && !document.hidden && !reduce.matches ? requestAnimationFrame(frame) : 0;
      if (!raf) last = 0;
    }

    function run() {
      if (!raf && visible && !document.hidden && !reduce.matches) raf = requestAnimationFrame(frame);
    }

    function set(on) {
      active = on;
      box.classList.toggle("is-active", on);
    }

    tile.addEventListener("pointerenter", function () { set(true); });
    tile.addEventListener("pointerleave", function () { set(tile.contains(document.activeElement)); });
    tile.addEventListener("focusin", function () { set(true); });
    tile.addEventListener("focusout", function (e) { if (!tile.contains(e.relatedTarget)) set(tile.matches(":hover")); });
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      run();
    }).observe(box);
    document.addEventListener("visibilitychange", run);
    reduce.addEventListener("change", run);
  }

  var field = document.querySelector("[data-vein-field]");
  if (field) veinField(field);
  revealFallback();
  document.querySelectorAll(".tile").forEach(tileVideo);
  document.querySelectorAll("[data-signal-bubble]").forEach(signalBubble);
})();
