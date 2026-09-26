// Home runtime, loaded with defer (index.md front matter: scripts). Motion map: PILOT_REPORT.md §0.3.
// 1. Band field: generated honey-onyx bands behind the hero name (draw-on at load, slow flow, depth parallax on scroll);
//    each band is a stream that divides as it crosses the screen (forks, braids), drawn live every frame.
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
    unlit: [0, 1, 1, 2], // split points per unlit trunk, drawn at random; lit trunks always split twice
    angle: [5, 15], // degrees between the two children once turned
    share: [0.55, 0.65], // width share of the wider child; the narrower takes the rest
    rings: [4, 1, 1], // growth rings per side on the trunk and on each child (fewer lines downstream)
    lag: 0.1 // the narrower child's draw-on front trails the wider one's by this fraction of the width: the fork opens
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
        tilt = -0.18 - r() * 0.2;
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
      var rf = mulberry32(SEED + 11);
      fams.forEach(function (f) {
        var trunk = { off: new Float32Array(N), wf: new Float32Array(N).fill(1), j0: 0, j1: N - 1, xs: -STEP, lag: 0, lvl: 0 };
        var kids, forks = f.lit ? 2 : FORK.unlit[Math.floor(rf() * 4)];
        f.streams = [trunk];
        if (!forks) return;
        kids = fork(f, trunk, snap(w * (0.1 + rf() * 0.25)), 1, rf);
        if (forks > 1) fork(f, kids[rf() < 0.6 ? 0 : 1], snap(kids[0].xs + w * (0.25 + rf() * 0.25)), 2, rf);
      });
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
      var mode = lvl > 1 && r() < 0.4 ? "rejoin" : r() < 0.5 ? "apart" : "parallel";
      var sep = Math.max(f.ribbon * p.wf[js], 24), len = mode === "apart" ? w * 0.25 : 1.5 * sep / th;
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
          for (j = 0; j < 8; j++) { // rings below the ribbon (j 0-3), above (j 4-7); fewer on children
            k = j % 4;
            if (j === 7 || (k >= FORK.rings[st.lvl] && (!st.lvl || k >= FORK.rings[st.lvl - 1]))) continue;
            ctx.strokeStyle = k === 0 ? (f.lit ? col.accent : col.mid) : k % 2 ? col.mid : col.far;
            ctx.globalAlpha = k === 0 ? 0.6 : 0.7;
            ctx.lineWidth = k === 0 ? 1.2 : 0.8;
            merge = k >= FORK.rings[st.lvl];
            ring(f, st, st.j0, merge ? Math.min(j1, st.jt) : j1, j > 3 ? -1 : 1, f.offs[k], merge);
          }
        }
      }
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
