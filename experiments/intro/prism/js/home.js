// Home runtime, loaded with defer (index.md front matter: scripts). Motion map: PILOT_REPORT.md §0.3.
// 1. Strata field: banded onyx generated once (beds on a meandering contour, laminae, cracks) and cached; a backlight
//    sweeps across on load, then drifts and follows the scroll; only translucent beds pick it up. Static under reduced motion.
// 2. Reveal fallback: IntersectionObserver classes where CSS scroll-driven animations are unsupported.
// 3. Tile video: hover/focus-to-play on hover devices, in-view autoplay on touch, a play/pause button everywhere.
// 4. Signal bubble: redraws the Liquid-rendered traces each frame from their data attributes; rest -> active on tile hover/focus.
// 5. Intro prism: measures the act-1 gem, its facet outlines and the act-2 routes (the scrub itself is CSS).
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

  // ---- 1. Strata field (banded onyx) ----
  // Imitates the real stone first: one meandering master contour (broad wave, lobes, faint crenulation, a tilt) and a
  // stack of beds that follow it - wide dark beds, translucent cream and amber beds, clusters of thin laminae - each
  // bed pinching and swelling along its run, with fine sub-layers inside thick beds and a few short cross cracks.
  // The strata are generated once per size and cached, tall enough to cover the whole page at the parallax rate, on a
  // page-fixed canvas behind every slab (the slabs are glass). The motion is light, not stone: a backlight sweeps across
  // on load, then drifts slowly and travels with the viewport; only the translucent beds pick it up. Tokens (--stone-*)
  // come from the theme, so the light theme shows the honey face and the dark theme the night face.
  var SEED = 7;
  var STEP = 5; // px between contour samples
  var SWEEP_MS = 2600; // load: the backlight crosses the slab once
  var DRIFT = { rx: 0.16, ry: 0.1, period: 26000 }; // then it wanders on a slow ellipse (fractions of w, h; ms)
  var LIGHT = { x: 0.7, y: 0.32, r: 0.55, alpha: 0.6 }; // rest position and radius (fractions of w), strength

  function smooth(u) {
    u = clamp(u, 0, 1);
    return u * u * (3 - 2 * u);
  }

  // 1-D value noise with cosine interpolation, seeded; f(x) in [-1, 1].
  function noise(seed, period) {
    var r = mulberry32(seed), g = [], i;
    for (i = 0; i < 400; i++) g.push(r() * 2 - 1);
    return function (x) {
      var u = x / period + 200, k = Math.floor(u), f = u - k, t = (1 - Math.cos(f * Math.PI)) / 2;
      return g[(k % 400 + 400) % 400] * (1 - t) + g[((k + 1) % 400 + 400) % 400] * t;
    };
  }

  function stoneField(canvas) {
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var w = 0, h = 0, H = 0, dpr = 1, col = {}, beds = [], xs = [], N = 0, base = null, PARALLAX = 0.18;
    var stone = null, mask = null, lightLayer = null; // cached layers: the slab, the translucent-bed mask, scratch for the light
    var start = 0, raf = 0, visible = true;

    function readColors() {
      var cs = getComputedStyle(root);
      var get = function (n) { return cs.getPropertyValue(n).trim(); };
      col = {
        dark: [get("--stone-a"), get("--stone-a-core"), get("--stone-a-rim")], // family a: the ground beds
        cream: [get("--stone-b"), get("--stone-b-core"), get("--stone-b-rim")], // family b: translucent beds
        amber: [get("--stone-c"), get("--stone-c-core"), get("--stone-c-rim")], // family c: translucent, darker
        light: get("--stone-light"), lightA: parseFloat(get("--stone-light-alpha")) || 0.6,
        crack: get("--stone-crack"), vignette: get("--stone-vignette"), vignetteA: parseFloat(get("--stone-vignette-alpha")) || 0.6,
        surface: get("--stone-scrim")
      };
      PARALLAX = parseFloat(get("--stone-parallax")) || 0.18;
    }

    // Master contour and the bed stack. Bed boundaries accumulate, so beds never cross; each bed's thickness swells
    // along x and its lower edge carries its own faint crenulation.
    function generate() {
      var R = mulberry32(SEED), o1 = noise(SEED + 1, 620), o2 = noise(SEED + 2, 170), o3 = noise(SEED + 3, 46), o4 = noise(SEED + 4, 14);
      var tilt = -0.22, sc = clamp(w / 1440, 0.55, 1), prev = "dark", y = -h * 0.55, k = 0, t, th, q, lt, lth, j, acc, b, i;
      base = function (x) { return tilt * (x - w / 2) + (o1(x) * 110 + o2(x) * 44 + o3(x) * 5 + o4(x) * 1.2) * sc; };
      function pick(pv) { var r = R(); if (pv === "dark") return r < 0.55 ? "cream" : "amber"; if (pv === "cream") return r < 0.6 ? "dark" : "amber"; return r < 0.65 ? "dark" : "cream"; }
      function thick(tp) { var r = R(); if (tp === "dark") return r < 0.35 ? 14 + r * 40 : 40 + r * r * 230; if (tp === "cream") return 8 + r * r * 90; return 5 + r * r * 40; }
      function bed(tp, tk, hair) { return { type: tp, t: tk * sc, y0: y, cren: noise(SEED + 100 + k, 38), swell: noise(SEED + 300 + k, 420), sub: Math.floor(R() * 4) + 1, seed: SEED + 500 + k, hair: !!hair }; }
      beds = [];
      while (y < H + h * 0.3) {
        t = pick(prev); th = thick(t);
        beds.push(bed(t, th)); y += th * sc; prev = t; k++;
        if (th < 30 && R() < 0.5) { // a cluster of thin laminae after a thin bed
          for (q = 0; q < 2 + Math.floor(R() * 4); q++) { lt = q % 2 ? "dark" : (R() < 0.5 ? "cream" : "amber"); lth = 2 + R() * 9; beds.push(bed(lt, lth)); y += lth * sc; k++; }
        }
        if (R() < 0.6) { beds.push(bed(t === "dark" ? "cream" : "dark", 1.5 + R() * 3, true)); y += 3 * sc; k++; }
      }
      N = Math.ceil(w / STEP) + 3; xs = [];
      for (j = 0; j < N; j++) xs.push(-STEP + j * STEP);
      // Slide the whole stack so the copy sits on dark stone: score each vertical offset by how much of the copy
      // zone (an ellipse around the name and positioning line) lands in dark beds, and take the best.
      var best = 0, bestScore = -1, off, score, px, py, yy, bi, cum, cx = w / 2, cy = h * 0.5, ex = Math.min(w * 0.34, 520), ey = h * 0.16;
      for (off = -h; off <= h; off += 12) {
        score = 0;
        for (px = -1; px <= 1; px += 0.25) for (py = -1; py <= 1; py += 0.5) {
          if (px * px + py * py > 1) continue;
          yy = cy + py * ey - base(cx + px * ex) - off - beds[0].y0; cum = 0;
          for (bi = 0; bi < beds.length; bi++) { cum += beds[bi].t; if (cum >= yy) { score += beds[bi].type === "dark" && !beds[bi].hair ? 1 : (beds[bi].type === "amber" ? 0.2 : 0); break; } }
        }
        if (score > bestScore) { bestScore = score; best = off; }
      }
      acc = xs.map(function (x) { return base(x) + beds[0].y0 + best; });
      for (i = 0; i < beds.length; i++) {
        b = beds[i]; b.top = acc.slice();
        b.bot = acc.map(function (v, jj) { return v + b.t * (1 + (b.t > 40 ? 0.55 : 0.3) * b.swell(xs[jj])) + (b.hair ? 0 : b.cren(xs[jj]) * Math.min(4, b.t * 0.2)); });
        acc = b.bot;
      }
    }

    function path(c, a, bb) { var j; c.beginPath(); for (j = 0; j < N; j++) c.lineTo(xs[j], a[j]); for (j = N - 1; j >= 0; j--) c.lineTo(xs[j], bb[j]); c.closePath(); }
    function line(c, a) { var j; c.beginPath(); for (j = 0; j < N; j++) c.lineTo(xs[j], a[j]); c.stroke(); }
    function mix(a, bb, u) { return a.map(function (v, j) { return v + (bb[j] - v) * u; }); }

    function layer(tall) { var c = document.createElement("canvas"); c.width = canvas.width; c.height = Math.round((tall ? H : h) * dpr); var x = c.getContext("2d"); x.setTransform(dpr, 0, 0, dpr, 0, 0); return [c, x]; }

    // The slab: every bed as ground, a lighter translucent core, darker rims, sub-laminae; then cross cracks. Once.
    function renderStone() {
      var L = layer(true), c = L[1], i, b, cc, r, s, u, cr, x, y, j, slope, a, len, d, st;
      c.fillStyle = col.dark[0]; c.fillRect(0, 0, w, H);
      c.lineJoin = "round"; c.lineCap = "round";
      for (i = 0; i < beds.length; i++) {
        b = beds[i]; cc = col[b.type];
        c.globalAlpha = 1; c.fillStyle = cc[0]; path(c, b.top, b.bot); c.fill();
        if (b.hair) { c.globalAlpha = 0.7; c.strokeStyle = cc[1]; c.lineWidth = 1; line(c, mix(b.top, b.bot, 0.5)); continue; }
        c.globalAlpha = 0.72; c.fillStyle = cc[1]; path(c, mix(b.top, b.bot, 0.28), mix(b.top, b.bot, 0.72)); c.fill();
        c.globalAlpha = 0.5; c.strokeStyle = cc[2]; c.lineWidth = 1.2; line(c, b.top); line(c, b.bot);
        if (b.t > 20) {
          r = mulberry32(b.seed);
          for (s = 0; s < b.sub + Math.floor(b.t / 30); s++) { u = 0.08 + r() * 0.84; c.globalAlpha = 0.16 + r() * 0.22; c.strokeStyle = r() < 0.5 ? cc[2] : cc[1]; c.lineWidth = 0.6 + r() * 0.8; line(c, mix(b.top, b.bot, u)); }
        }
      }
      cr = mulberry32(SEED + 9);
      for (i = 0; i < 9; i++) { // short bright fractures roughly normal to the bedding
        x = cr() * w; j = Math.floor((x + STEP) / STEP); y = beds[Math.floor(cr() * beds.length)].top[j];
        if (y < 0 || y > H) continue;
        slope = (base(x + 6) - base(x - 6)) / 12; a = Math.atan(slope) + Math.PI / 2 * (cr() < 0.5 ? 1 : -1) + (cr() - 0.5) * 0.5; len = 30 + cr() * 110;
        c.beginPath(); c.moveTo(x, y); d = 0;
        while (d < len) { st = 6 + cr() * 8; x += Math.cos(a + (cr() - 0.5) * 0.5) * st; y += Math.sin(a + (cr() - 0.5) * 0.5) * st; d += st; c.lineTo(x, y); }
        c.globalAlpha = 0.55; c.strokeStyle = col.crack; c.lineWidth = 0.9; c.stroke(); c.globalAlpha = 0.18; c.lineWidth = 3; c.stroke();
      }
      stone = L[0];
      // Mask of the translucent beds: what the backlight can pass through.
      L = layer(true); c = L[1]; c.fillStyle = "#fff";
      for (i = 0; i < beds.length; i++) { b = beds[i]; if (b.type === "dark" || b.hair) continue; c.globalAlpha = b.type === "cream" ? 1 : 0.7; path(c, b.top, b.bot); c.fill(); }
      mask = L[0];
      lightLayer = layer();
    }

    function resize() {
      var box = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, Math.round(box.width));
      h = Math.max(1, Math.round(box.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      H = h + Math.ceil(Math.max(0, document.documentElement.scrollHeight - h) * PARALLAX); // stone tall enough for the whole scroll
      generate();
      readColors();
      stone = null;
      paint(performance.now());
    }

    // Backlight position: a sweep across the slab on load, then a slow ellipse around the rest point, plus the scroll.
    function lightAt(t, sy) {
      var u = clamp((t - start) / SWEEP_MS, 0, 1), e = smooth(u), ph = (t - start - SWEEP_MS) / DRIFT.period * 6.283;
      var lx = u < 1 ? -0.3 + (LIGHT.x + 0.3) * e : LIGHT.x + Math.sin(ph) * DRIFT.rx;
      var ly = u < 1 ? LIGHT.y + (1 - e) * 0.25 : LIGHT.y + Math.cos(ph * 0.7) * DRIFT.ry;
      return { x: lx * w, y: ly * h, a: col.lightA * (u < 1 ? 0.75 + 0.25 * e : 1) };
    }

    function paint(t) {
      var still = reduce.matches, sy = window.scrollY, oy = -Math.min(sy * PARALLAX, H - h), L, c, g, vg, rx;
      if (!col.surface) return;
      if (!stone) renderStone();
      L = still ? { x: LIGHT.x * w, y: LIGHT.y * h, a: col.lightA } : lightAt(t, sy);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = 1;
      ctx.drawImage(stone, 0, oy, w, H);
      // Light through the translucent beds: mask x radial glow, added on top; then a vignette away from the light.
      c = lightLayer[1];
      c.globalCompositeOperation = "source-over"; c.globalAlpha = 1; c.clearRect(0, 0, w, h);
      c.drawImage(mask, 0, oy, w, H);
      g = c.createRadialGradient(L.x, L.y, 0, L.x, L.y, w * LIGHT.r);
      g.addColorStop(0, rgba(col.light, 1)); g.addColorStop(0.5, rgba(col.light, 0.45)); g.addColorStop(1, rgba(col.light, 0));
      c.globalCompositeOperation = "source-in"; c.fillStyle = g; c.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = L.a; ctx.drawImage(lightLayer[0], 0, 0, w, h);
      ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
      vg = ctx.createRadialGradient(L.x, L.y, w * 0.15, L.x, L.y, w * 0.95);
      vg.addColorStop(0, rgba(col.vignette, 0)); vg.addColorStop(1, rgba(col.vignette, col.vignetteA));
      ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h);
      // Elliptical scrim behind the hero copy (page-fixed: it scrolls away with the hero) so the name keeps its contrast.
      if (sy > h) return;
      ctx.save();
      ctx.translate(w / 2, h * 0.5 - sy);
      ctx.scale(1, 0.62);
      rx = Math.max(w * 0.4, Math.min(w * 0.75, 340));
      g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
      g.addColorStop(0, rgba(col.surface, 0.97)); g.addColorStop(0.55, rgba(col.surface, 0.86)); g.addColorStop(1, rgba(col.surface, 0));
      ctx.fillStyle = g; ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
      ctx.restore();
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
      stone = null;
      paint(performance.now());
    }

    new ResizeObserver(resize).observe(canvas);
    document.addEventListener("visibilitychange", run);
    // Reduced motion: no loop; the stone still follows the scroll (a scroll-linked position, not an animation).
    window.addEventListener("scroll", function () { if (reduce.matches) paint(performance.now()); }, { passive: true });
    reduce.addEventListener("change", function () { repaint(); run(); });
    new MutationObserver(repaint).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
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
    document.querySelectorAll("[data-reveal], .tile").forEach(function (el) { io.observe(el); });
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

  // ---- 4. Signal bubble (_partials/signal-bubble.html; shapes: _data/experiments/intro/prism/signal-shapes.yml) ----
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

  // ---- 5. Intro prism (_partials/home-intro.html; motion: _motion.scss) ----
  // The markup is the settled layout (act 2). Act 1 is a gem: the face a regular pointy-top hexagon (half-height b) at
  // its centre, three joints leaving the face 120 degrees apart (up from its top vertex; down-left and down-right from
  // its lower side vertices, 30 degrees below horizontal), cutting the gem into Hardware (left), Software (right) and
  // People (below). Every piece keeps its settled box, so act 1 is an offset (--a1-x/-y, from offset*, which ignore
  // transforms) plus a sector outline on each facet's glass layer (--g-*), which reaches past the cell far enough to hold
  // both outlines (8 vertices each, so they interpolate). Act-2 routes keep the face clear: People runs right under
  // Software and waits; the face dips (as deep as Hardware needs to pass below the header), slides into its column at
  // that depth and only then rises; Hardware rises in its own column, crosses above the face, and drops once the face
  // has landed; Software goes straight. Only while pinned; JS failure = settled.
  function prism(el) {
    var face = el.querySelector(".intro-portrait");
    var stones = el.querySelectorAll(".facet");
    var gem = el.querySelector(".gem");
    var pinned = window.matchMedia("(min-width: 75em) and (min-height: 46em)"); // $bp-intro-wide, $bp-intro-tall
    if (!face || stones.length !== 3 || !gem || !("ResizeObserver" in window)) return;
    var ring = gem.querySelector(".gem__ring"), joints = gem.querySelectorAll(".gem__joint");
    var T30 = Math.tan(Math.PI / 6), H3 = Math.sqrt(3) / 2;
    function px(name) {
      var v = getComputedStyle(el).getPropertyValue(name).trim();
      return parseFloat(v) * (/rem$/.test(v) ? parseFloat(getComputedStyle(root).fontSize) : 1);
    }
    function box(n) {
      var x = 0, y = 0, m = n;
      for (; m && m !== el; m = m.offsetParent) { x += m.offsetLeft; y += m.offsetTop; }
      return { x: x, y: y, w: n.offsetWidth, h: n.offsetHeight };
    }
    function set(n, name, v) { n.style.setProperty(name, v); }
    function off(n, names, q, b) { set(n, names[0], Math.round(q[0] - b.x) + "px"); set(n, names[1], Math.round(q[1] - b.y) + "px"); }
    function unit(x, y) { var l = Math.hypot(x, y) || 1; return [x / l, y / l]; }
    function same(p, q) { return Math.abs(p[0] - q[0]) < 0.01 && Math.abs(p[1] - q[1]) < 0.01; }
    // Polygon (clockwise, y down) offset inward by d: each vertex moves along the sum of the normals of its nearest
    // distinct neighbours' edges (miter), so doubled vertices stay doubled.
    function inset(pts, d) {
      var n = pts.length;
      return pts.map(function (p, i) {
        var j = i, k = i;
        do { j = (j + n - 1) % n; } while (j !== i && same(pts[j], p));
        do { k = (k + 1) % n; } while (k !== i && same(pts[k], p));
        var u = unit(p[0] - pts[j][0], p[1] - pts[j][1]), w = unit(pts[k][0] - p[0], pts[k][1] - p[1]);
        var n1 = [-u[1], u[0]], n2 = [-w[1], w[0]], f = d / (1 + n1[0] * n2[0] + n1[1] * n2[1]);
        return [p[0] + (n1[0] + n2[0]) * f, p[1] + (n1[1] + n2[1]) * f];
      });
    }
    function list(pts) {
      return pts.map(function (p) { return p[0].toFixed(1) + "px " + p[1].toFixed(1) + "px"; }).join(", ");
    }
    function outline(pts, v) {
      return "polygon(evenodd, " + list(pts.concat([pts[0]])) + ", " + list(v.concat([v[0]])) + ")";
    }
    function measure() {
      if (!pinned.matches) return;
      var W = el.offsetWidth, H = el.offsetHeight, f = box(face);
      var c = [box(stones[0]), box(stones[1]), box(stones[2])], w = c[0].w, h = c[0].h;
      var g = px("--intro-gem-gap"), m = g / 2, p = px("--intro-pad"), ins = px("--intro-inset"), v = px("--vein-width");
      var ch = px("--intro-chamfer"), M = ins + m;
      var fh = Math.min(f.h, Math.max(px("--intro-gem-face-min"), Math.min(px("--intro-gem-face-max"), window.innerHeight - px("--intro-gem-room"))));
      var b = fh / 2, a = b * H3;
      // Gem in local coordinates (origin at the face centre). Text boxes first, then the outline that holds them.
      var A = a + g + w, yr = b / 2 + T30 * (A - a);
      var hx = -a - g - w, hy = b / 2 + T30 * (g + p) - m + p - h; // Hardware: content m above the down-left joint
      var sx = a + g, sy = hy;
      var qx = -c[2].w / 2, qy = b + m - p;                        // People: content m below the face's bottom vertex
      var cb = qy + h - p, xc = c[2].w / 2 - p;
      var yB = Math.max(cb + M, (cb + M - yr * xc / A) / (1 - xc / A));
      var yT = -b - px("--intro-gem-ray"), ct = hy + p;
      var yU = Math.min(yT + (yB - yr), yT + (ct - M - yT) * A / (A - p));
      var gx = W / 2, gy = H / 2 - (yT + yB) / 2;
      function F(q) { return [gx + q[0], gy + q[1]]; }
      var OT = [0, yT], OUR = [A, yU], OLR = [A, yr], OB = [0, yB], OLL = [-A, yr], OUL = [-A, yU];
      var PT = [0, -b], PUR = [a, -b / 2], PLR = [a, b / 2], PB = [0, b], PLL = [-a, b / 2], PUL = [-a, -b / 2];
      var sectors = [
        [OUL, OT, PT, PUL, PLL, OLL, OLL, OUL],
        [OT, OUR, OUR, OLR, OLR, PLR, PUR, PT],
        [PLL, PB, PLR, OLR, OB, OB, OLL, OLL]
      ];
      var places = [F([hx, hy]), F([sx, sy]), F([qx, qy])];
      // Face: hexagon window centred on the gem's centre; dips so Hardware can pass above it below the header.
      var top0 = el.offsetTop, ymin = px("--header-height") + m - top0;
      var need = ymin + h + m - (gy - b), room = window.innerHeight - top0 - m - (gy + b);
      var dip = Math.max(m, Math.min(need, room));
      var fa = [gx - f.w / 2, gy - b];
      set(el, "--a1-b", b.toFixed(1) + "px");
      off(face, ["--a1-x", "--a1-y"], fa, f);
      off(face, ["--a2-x1", "--a2-y1"], [fa[0], fa[1] + dip], f);
      off(face, ["--a2-x2", "--a2-y2"], [f.x, fa[1] + dip], f);
      var up = gy - b + dip - m - h;
      off(stones[0], ["--a2-x1", "--a2-y1"], [places[0][0], up], c[0]);
      off(stones[0], ["--a2-x2", "--a2-y2"], [c[0].x, up], c[0]);
      off(stones[2], ["--a2-x1", "--a2-y1"], [c[2].x, places[2][1]], c[2]);
      stones.forEach(function (s, i) {
        var cw = c[i].w, cht = c[i].h, q = places[i], tr = i === 2 ? ch : 0;
        off(s, ["--a1-x", "--a1-y"], q, c[i]);
        var sec = sectors[i].map(function (pt) { var P = F(pt); return [P[0] - q[0], P[1] - q[1]]; });
        var fit = [[0, 0], [cw - tr, 0], [cw, tr], [cw, cht], [cw, cht], [0, cht], [0, cht], [0, 0]];
        var all = sec.concat(fit);
        var l = -Math.min.apply(null, all.map(function (e) { return e[0]; }));
        var t = -Math.min.apply(null, all.map(function (e) { return e[1]; }));
        var r = Math.max.apply(null, all.map(function (e) { return e[0]; })) - cw;
        var bo = Math.max.apply(null, all.map(function (e) { return e[1]; })) - cht;
        function shift(pts) { return pts.map(function (e) { return [e[0] + l, e[1] + t]; }); }
        var S = shift(sec), R = shift(fit);
        set(s, "--g-t", t.toFixed(1) + "px"); set(s, "--g-r", r.toFixed(1) + "px");
        set(s, "--g-b", bo.toFixed(1) + "px"); set(s, "--g-l", l.toFixed(1) + "px");
        set(s, "--g-o", (l + cw / 2).toFixed(1) + "px " + (t + cht / 2).toFixed(1) + "px");
        set(s, "--g-a1", "polygon(" + list(S) + ")");
        set(s, "--g-fit", "polygon(" + list(R) + ")");
        set(s, "--g-a1-ring", outline(S, inset(S, v)));
        set(s, "--g-fit-ring", outline(R, inset(R, v)));
      });
      gem.setAttribute("viewBox", "0 0 " + W + " " + H);
      ring.setAttribute("points", inset([OT, OUR, OLR, OB, OLL, OUL].map(F), ins).map(function (e) { return e[0].toFixed(1) + "," + e[1].toFixed(1); }).join(" "));
      [[PT, OT], [PLL, OLL], [PLR, OLR]].forEach(function (seg, i) {
        var s0 = F(seg[0]), s1 = F(seg[1]), j = joints[i];
        j.setAttribute("x1", s0[0].toFixed(1)); j.setAttribute("y1", s0[1].toFixed(1));
        j.setAttribute("x2", s1[0].toFixed(1)); j.setAttribute("y2", s1[1].toFixed(1));
        set(j, "--o", s0[0].toFixed(1) + "px " + s0[1].toFixed(1) + "px");
      });
    }
    new ResizeObserver(measure).observe(el);
    pinned.addEventListener("change", measure);
    window.addEventListener("resize", measure); // the face height and the stage offset follow the viewport height
  }

  var field = document.querySelector("[data-stone-field]");
  if (field) stoneField(field);
  revealFallback();
  document.querySelectorAll(".tile").forEach(tileVideo);
  document.querySelectorAll("[data-signal-bubble]").forEach(signalBubble);
  document.querySelectorAll("[data-prism]").forEach(prism);
})();
