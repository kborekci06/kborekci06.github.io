// Home runtime, loaded with defer (index.md front matter: scripts). Motion map: PILOT_REPORT.md §0.3.
// 1. Vein field: a generated canvas behind the hero name (draw-on at load, slow drift, depth parallax on scroll).
// 2. Reveal fallback: IntersectionObserver classes where CSS scroll-driven animations are unsupported.
// 3. Tile video: hover/focus-to-play on hover devices, in-view autoplay on touch, a play/pause button everywhere.
// Never touches wheel/touch events or the scroll position: native scrolling only.
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

  // ---- 1. Vein field ----
  var SEED = 1906;
  var DRAW_MS = 1800;
  var DEPTH = [
    { width: 0.5, alpha: 0.4, parallax: 0.12, amp: 2 }, // far
    { width: 1, alpha: 0.55, parallax: 0.28, amp: 3.5 }, // mid
    { width: 2.4, alpha: 0.8, parallax: 0.5, amp: 5 } // near
  ];

  function veinField(canvas) {
    var host = canvas.closest(".slab");
    var ctx = canvas.getContext("2d");
    if (!host || !ctx) return;
    var w = 0, h = 0, dpr = 1, veins = [], col = {}, accentFill = null;
    var start = 0, raf = 0, visible = true;

    function readColors() {
      var cs = getComputedStyle(host);
      var get = function (n) { return cs.getPropertyValue(n).trim(); };
      col = { strong: get("--s-text"), mid: get("--s-vein-strong"), far: get("--s-vein"), surface: get("--s-surface"),
        accent: get("--s-accent"), accentTo: get("--hero-vein-accent-to") };
      accentFill = ctx.createLinearGradient(0, 0, w, h);
      accentFill.addColorStop(0, col.accent);
      accentFill.addColorStop(1, col.accentTo);
    }

    // One vein: a jagged polyline running diagonally, with rare sharp kinks that relax back to the base angle.
    function makeVein(r, x, y, base, len, depth, accent, list) {
      var pts = [x, y], theta = base, step, i;
      for (i = 0; i < len; i++) {
        theta += (r() - 0.5) * 0.3 + (base - theta) * 0.12;
        if (r() < 0.09) theta += (r() < 0.5 ? -1 : 1) * (0.5 + r() * 0.6);
        step = 16 + r() * 26;
        x += Math.cos(theta) * step;
        y += Math.sin(theta) * step;
        pts.push(x, y);
        if (list.length < 60 && r() < 0.035) {
          makeVein(r, x, y, base + (r() < 0.5 ? -0.8 : 0.8), Math.floor(len * 0.3), depth, false, list);
        }
      }
      list.push({ pts: pts, depth: depth, accent: accent, delay: r() * 0.35 + depth * 0.08, phase: r() * 6.28, speed: 0.6 + r() * 0.8 });
    }

    function generate() {
      var r = mulberry32(SEED), list = [], count = Math.round(clamp(w / 55, 14, 28)), i, depth, onLeft;
      var reach = Math.ceil(Math.hypot(w, h) / 28);
      for (i = 0; i < count; i++) {
        depth = i % 3;
        onLeft = r() < 0.6;
        makeVein(r, onLeft ? -40 : r() * w, onLeft ? r() * h * 1.1 - h * 0.2 : -40,
          0.28 + (r() - 0.5) * 0.7, reach, depth, i % 8 === 5, list);
      }
      veins = list;
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

    function stroke(v, k, t, drift, oy) {
      var p = v.pts, i, d;
      ctx.beginPath();
      for (i = 0; i < k; i++) {
        d = drift ? Math.sin(t * 0.0004 * v.speed + i * 0.4 + v.phase) * DEPTH[v.depth].amp : 0;
        ctx.lineTo(p[2 * i] + d * 0.4, p[2 * i + 1] + d + oy);
      }
      ctx.stroke();
    }

    function paint(t) {
      var still = reduce.matches;
      var prog = still ? 1 : clamp((t - start) / DRAW_MS, 0, 1);
      var eased = 1 - Math.pow(1 - prog, 3);
      var sy = still ? 0 : window.scrollY;
      var i, v, n, k, d, oy;
      if (!col.surface) return; // not sized yet: the first ResizeObserver callback reads tokens and paints
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.lineJoin = "miter";
      ctx.lineCap = "butt";
      for (i = 0; i < veins.length; i++) {
        v = veins[i];
        d = DEPTH[v.depth];
        n = v.pts.length / 2;
        k = Math.floor(n * clamp(eased * 1.4 - v.delay, 0, 1));
        if (k < 2) continue;
        oy = -sy * d.parallax;
        if (v.accent) {
          ctx.strokeStyle = accentFill;
          ctx.globalAlpha = 0.18;
          ctx.lineWidth = d.width * 6; // glow pass
          stroke(v, k, t, !still, oy);
          ctx.globalAlpha = 0.95;
          ctx.lineWidth = d.width * 1.2;
        } else {
          ctx.strokeStyle = v.depth === 2 ? col.strong : v.depth === 1 ? col.mid : col.far;
          ctx.globalAlpha = d.alpha * (v.depth === 2 ? 0.6 : 1);
          ctx.lineWidth = d.width;
        }
        stroke(v, k, t, !still, oy);
      }
      // Elliptical scrim behind the centred copy: keeps the name and positioning line at full contrast over the veins.
      ctx.save();
      ctx.translate(w / 2, h * 0.5);
      ctx.scale(1, 0.7);
      var rx = Math.max(w * 0.42, 220);
      var g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
      g.addColorStop(0, rgba(col.surface, 0.9));
      g.addColorStop(0.6, rgba(col.surface, 0.6));
      g.addColorStop(1, rgba(col.surface, 0));
      ctx.globalAlpha = 1;
      ctx.fillStyle = g;
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

  var field = document.querySelector("[data-vein-field]");
  if (field) veinField(field);
  revealFallback();
  document.querySelectorAll(".tile").forEach(tileVideo);
})();
