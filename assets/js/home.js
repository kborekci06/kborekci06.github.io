// Home runtime, loaded with defer (index.md front matter: scripts). Motion map: PILOT_REPORT.md §0.3.
// 1. Band field: generated honey-onyx bands behind the hero name (draw-on at load, slow flow, depth parallax on scroll).
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
  // Onyx bands, not cracks: each family is a smooth wave with offset copies. One wide ribbon per family is lit from
  // behind (additive, accent -> glow gradient, three passes for a soft falloff); hairline contours follow its edges.
  var SEED = 1906;
  var DRAW_MS = 2200;
  var STEP = 24; // px between wave samples
  var DEPTH = [
    { parallax: 0.1, speed: 0.00005 }, // far
    { parallax: 0.24, speed: 0.00008 }, // mid
    { parallax: 0.42, speed: 0.00011 } // near
  ];
  var GLOW = [[1.4, 0.06], [0.8, 0.1], [0.35, 0.18], [0.08, 0.35]]; // ribbon passes: width factor, alpha

  function veinField(canvas) {
    var host = canvas.closest(".slab");
    var ctx = canvas.getContext("2d");
    if (!host || !ctx) return;
    var w = 0, h = 0, dpr = 1, fams = [], col = {}, lit = null;
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

    // One family: base line through (0, y0) with a gentle tilt, two summed sines; contours at cumulative offsets.
    function generate() {
      var r = mulberry32(SEED), list = [], n = w > 900 ? 5 : 4, s = Math.min(h, w * 0.7), i, j, off, offs;
      for (i = 0; i < n; i++) {
        offs = [];
        off = 0;
        for (j = 0; j < 4; j++) {
          off += 3 + r() * 11; // growth-ring spacing outward from the ribbon edge
          offs.push(off);
        }
        list.push({
          y0: h * (-0.15 + (i + r() * 0.6) / n * 1.3), tilt: -0.18 - r() * 0.2, depth: i % 3,
          a1: s * (0.06 + r() * 0.08), f1: (0.35 + r() * 0.5) / w * 6.28, p1: r() * 6.28,
          a2: s * (0.01 + r() * 0.015), f2: (1.2 + r() * 1.2) / w * 6.28, p2: r() * 6.28,
          offs: offs, ribbon: (40 + r() * 90) * clamp(w / 1200, 0.5, 1), delay: r() * 0.3, lit: i % 2 === 0
        });
      }
      fams = list;
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

    // Stroke one contour of family f at offset o, across the first fraction reach of the width.
    function contour(f, o, reach, t, oy) {
      var x, y, end = w * reach + STEP, ph = t * DEPTH[f.depth].speed;
      ctx.beginPath();
      for (x = -STEP; x <= end; x += STEP) {
        y = f.y0 + x * f.tilt + f.a1 * Math.sin(x * f.f1 + f.p1 + ph) + f.a2 * Math.sin(x * f.f2 + f.p2 - ph * 1.7) + o + oy;
        if (x === -STEP) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    function paint(t) {
      var still = reduce.matches;
      var prog = still ? 1 : clamp((t - start) / DRAW_MS, 0, 1);
      var eased = 1 - Math.pow(1 - prog, 3);
      var sy = still ? 0 : window.scrollY;
      var tt = still ? 0 : t;
      var i, j, k, f, reach, oy, g;
      if (!col.surface) return; // not sized yet: the first ResizeObserver callback reads tokens and paints
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      for (i = 0; i < fams.length; i++) {
        f = fams[i];
        reach = clamp(eased * 1.3 - f.delay, 0, 1);
        if (reach <= 0) continue;
        oy = -sy * DEPTH[f.depth].parallax;
        // Lit ribbon: additive light through the stone.
        if (f.lit) {
          ctx.globalCompositeOperation = "lighter";
          ctx.strokeStyle = lit;
          for (g = 0; g < GLOW.length; g++) {
            ctx.globalAlpha = GLOW[g][1] * (f.depth === 2 ? 1.2 : 1);
            ctx.lineWidth = f.ribbon * GLOW[g][0];
            contour(f, 0, reach, tt, oy);
          }
          ctx.globalCompositeOperation = "source-over";
        } else {
          ctx.strokeStyle = col.far;
          ctx.globalAlpha = 0.35;
          ctx.lineWidth = f.ribbon * 0.6;
          contour(f, 0, reach, tt, oy);
        }
        // Hairline contours: growth rings along the band edges.
        for (j = 0; j < 7; j++) { // four rings below the ribbon (j 0-3), three above (j 4-6)
          k = j % 4;
          ctx.strokeStyle = k === 0 ? (f.lit ? col.accent : col.mid) : k % 2 ? col.mid : col.far;
          ctx.globalAlpha = k === 0 ? 0.6 : 0.7;
          ctx.lineWidth = k === 0 ? 1.2 : 0.8;
          contour(f, (j > 3 ? -1 : 1) * (f.ribbon * 0.5 + f.offs[k]), reach, tt, oy);
        }
      }
      // Elliptical scrim behind the centred copy: quiets the bands so the name and positioning line keep full contrast;
      // the warm backlight on top of it is CSS (.hero__glow).
      ctx.save();
      ctx.translate(w / 2, h * 0.5);
      ctx.scale(1, 0.62);
      var rx = Math.max(w * 0.4, Math.min(w * 0.62, 320));
      var sc = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
      sc.addColorStop(0, rgba(col.surface, 0.88));
      sc.addColorStop(0.6, rgba(col.surface, 0.55));
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
