// Home runtime, loaded with defer (index.md front matter: scripts). Motion map: PILOT_REPORT.md §0.3.
// 1. Strata field: banded onyx generated once (beds on a meandering contour, laminae, cracks) and cached; a backlight
//    sweeps across on load, then drifts and follows the scroll; only translucent beds pick it up. Static under reduced motion.
// 2. Reveal fallback: IntersectionObserver classes where CSS scroll-driven animations are unsupported.
// 3. Tile video: hover/focus-to-play on hover devices, in-view autoplay on touch, a play/pause button everywhere.
// 4. Signal bubble: redraws the Liquid-rendered traces each frame from their data attributes; rest -> active on tile hover/focus.
// 5. Intro shard: measures the act-1 stone (portrait scale, courses on the seam, vein) and the settled indents.
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

  // ---- 4. Signal bubble (_partials/signal-bubble.html; shapes: _data/experiments/intro/shard/signal-shapes.yml) ----
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

  // ---- 5. Intro shard (_partials/home-intro.html; motion: _motion.scss) ----
  // The markup is the settled layout (act 2). Settled (lg): the seam leans `lean` over the portrait's height H, so each
  // panel block is indented by the seam's x at its own bottom (--a2-lean for the Hardware cell, --indent-t, --indent-j).
  // Act 1 (pinned only): one stone. The portrait is scaled by s = (3h + 2g) / H (h: the row height, g: the joint) and
  // the three courses stack level beside it, each left edge cut on the seam (+ g). Each course's text starts --intro-pad
  // right of the cut's lowest point (so the text column steps down the seam, as the settled indents do) and the right
  // edges sit on one line R, the rightmost box edge. Every piece keeps its settled box, so act 1 is an offset
  // (--a1-x/-y, offset* ignores transforms) plus the portrait's --a1-s; the course outlines (act 1 and settled, lit
  // edges inset one vein) are px polygons on a glass extended --a1-ext left and --a1-ext-r right of the box. Also written:
  // the act-2 waypoints (--a2-x1/-y1): Software and People at their column and act-1 height; Hardware at the settled
  // seam's line, raised to its act-1 height, so it then slides down the seam into its cell; and the vein (--vein-x/-y/-rot,
  // along the seam through the point at --intro-vein-at). JS failure: offsets 0 = the settled layout.
  function shard(el) {
    var face = el.querySelector(".intro-portrait");
    var stones = el.querySelectorAll(".facet");
    var vein = el.querySelector(".facets__vein");
    var tag = el.querySelector(".facets__tagline"), joint = el.querySelector(".facets__joint");
    if (!face || stones.length !== 3 || !vein || !tag || !joint || !("ResizeObserver" in window)) return;
    var wide = window.matchMedia("(min-width: 64em)");
    var pin = window.matchMedia("(min-width: 75em) and (min-height: 46em)");
    var OUT = ["--a1-cut", "--a1-edge", "--fit", "--fit-edge", "--a1-ext", "--a1-ext-r"];
    function px(name) {
      var v = getComputedStyle(el).getPropertyValue(name).trim();
      return parseFloat(v) * (/rem$/.test(v) ? parseFloat(getComputedStyle(document.documentElement).fontSize) : 1);
    }
    function box(n) {
      var x = 0, y = 0, m = n;
      for (; m && m !== el; m = m.offsetParent) { x += m.offsetLeft; y += m.offsetTop; }
      return { x: x, y: y, w: n.offsetWidth, h: n.offsetHeight };
    }
    function set(n, name, v) { n.style.setProperty(name, v.toFixed(1) + "px"); }
    function pt(p) { return p[0].toFixed(1) + "px " + p[1].toFixed(1) + "px"; }
    function poly(p) { return "polygon(" + p.map(pt).join(", ") + ")"; }
    function inset(p, d) { // convex, clockwise (y down), repeated vertices allowed: each vertex moved in on its miter
      var u = [], map = [];
      p.forEach(function (q, i) {
        var l = u[u.length - 1];
        if (!l || Math.abs(l[0] - q[0]) + Math.abs(l[1] - q[1]) > 0.01) u.push(q);
        map[i] = u.length - 1;
      });
      if (Math.abs(u[0][0] - u[u.length - 1][0]) + Math.abs(u[0][1] - u[u.length - 1][1]) <= 0.01) {
        u.pop();
        map = map.map(function (k) { return k === u.length ? 0 : k; });
      }
      var n = u.length;
      function nrm(a, b) { var dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy); return [-dy / l, dx / l]; }
      var q = u.map(function (c, i) {
        var n1 = nrm(u[(i + n - 1) % n], c), n2 = nrm(c, u[(i + 1) % n]), k = d / (1 + n1[0] * n2[0] + n1[1] * n2[1]);
        return [c[0] + (n1[0] + n2[0]) * k, c[1] + (n1[1] + n2[1]) * k];
      });
      return map.map(function (k) { return q[k]; });
    }
    function edge(p, d) { var i = inset(p, d); return "polygon(evenodd, " + p.concat([p[0]], i, [i[0]]).map(pt).join(", ") + ")"; }
    function indents(lean) {
      var f = box(face), t = box(tag), j = box(joint), h = box(stones[0]).h;
      set(el, "--a2-lean", lean * h / f.h);
      set(el, "--indent-t", lean * (t.y + t.h - f.y) / f.h);
      set(el, "--indent-j", lean * Math.min(1, (j.y + j.h - px("--intro-pad") - f.y) / f.h));
    }
    function measure() {
      var lean = wide.matches ? px("--intro-lean") : 0;
      indents(lean); indents(lean); // the indents change the wrap; the second pass reads the result
      var f = box(face), b = [box(stones[0]), box(stones[1]), box(stones[2])];
      var g = px("--intro-shard-gap"), v = px("--vein-width"), pad = px("--intro-pad");
      var c = px("--intro-chamfer"), cw = px("--intro-cut-wide"), lean0 = lean * b[0].h / f.h;
      var h = Math.max(b[0].h, b[1].h, b[2].h), s = (3 * h + 2 * g) / f.h, t = lean / f.h, ph = s * f.h;
      function cut(y) { return s * (f.w - lean) + t * y + g; } // the courses' left edge, composite frame
      var R = 0, left = b.map(function (q, i) { // box left: the text starts pad right of the cut's lowest point
        var l = cut(i * (h + g) + q.h) + pad - parseFloat(getComputedStyle(stones[i].firstElementChild).paddingLeft);
        R = Math.max(R, l + q.w);
        return l;
      });
      var ox = (el.offsetWidth - R) / 2, oy = (el.offsetHeight - ph) / 2;
      set(face, "--a1-x", ox + s * f.w / 2 - f.x - f.w / 2); set(face, "--a1-y", oy + ph / 2 - f.y - f.h / 2);
      face.style.setProperty("--a1-s", s.toFixed(4));
      var yv = px("--intro-vein-at") * ph;
      set(vein, "--vein-x", ox + cut(yv) - g / 2); set(vein, "--vein-y", oy + yv);
      vein.style.setProperty("--vein-rot", (Math.atan2(ph, s * lean) * 180 / Math.PI).toFixed(3) + "deg");
      b.forEach(function (q, i) {
        var n = stones[i], y0 = i * (h + g), bl = left[i], ext = Math.max(0, Math.ceil(bl - cut(y0)) + 1);
        var X = function (x) { return x - bl + ext; }, a = X(cut(y0)), z = X(cut(y0 + q.h)), r = X(R), e = ext;
        var a1 = i === 0 ? [[a, 0], [r - c, 0], [r, c], [r, q.h], [r, q.h], [z, q.h], [z, q.h], [a, 0]]
          : i === 1 ? [[a, 0], [r, 0], [r, 0], [r, q.h], [r, q.h], [z, q.h], [z, q.h], [a, 0]]
            : [[a, 0], [r, 0], [r, 0], [r, q.h - cw], [r - cw, q.h], [z, q.h], [z, q.h], [a, 0]];
        var fit = i === 0 ? [[e, 0], [e + q.w, 0], [e + q.w, 0], [e + q.w, q.h], [e + q.w, q.h], [e + lean0, q.h], [e + lean0, q.h], [e, 0]]
          : i === 1 ? [[e, 0], [e + q.w, 0], [e + q.w, 0], [e + q.w, q.h], [e + q.w, q.h], [e, q.h], [e, q.h], [e, 0]]
            : [[e, 0], [e + q.w - c, 0], [e + q.w, c], [e + q.w, q.h], [e + q.w, q.h], [e, q.h], [e, q.h], [e, 0]];
        set(n, "--a1-x", ox + bl - q.x); set(n, "--a1-y", oy + y0 - q.y);
        set(n, "--a2-x1", i === 0 ? t * (oy + y0 - q.y) : 0); set(n, "--a2-y1", oy + y0 - q.y);
        if (pin.matches) {
          set(n, "--a1-ext", ext); set(n, "--a1-ext-r", Math.ceil(R - bl - q.w) + 1);
          n.style.setProperty("--a1-cut", poly(a1)); n.style.setProperty("--a1-edge", edge(a1, v));
          n.style.setProperty("--fit", poly(fit)); n.style.setProperty("--fit-edge", edge(fit, v));
        } else OUT.forEach(function (k) { n.style.removeProperty(k); });
      });
      el.dataset.a1 = [ox, oy, R, ph].map(Math.round).join(" ");
    }
    new ResizeObserver(measure).observe(el);
    pin.addEventListener("change", measure);
  }

  var field = document.querySelector("[data-stone-field]");
  if (field) stoneField(field);
  revealFallback();
  document.querySelectorAll(".tile").forEach(tileVideo);
  document.querySelectorAll("[data-signal-bubble]").forEach(signalBubble);
  document.querySelectorAll("[data-shard]").forEach(shard);
})();
