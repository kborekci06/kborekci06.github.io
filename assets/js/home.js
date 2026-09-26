// Home runtime, loaded with defer (index.md front matter: scripts). Motion map: PILOT_REPORT.md §0.3.
// 1. Band field: generated honey-onyx bands behind the hero name (draw-on at load, slow flow, depth parallax on scroll),
//    with a sparse three-order branch tree growing out of each band after the draw-on (cached per branch once grown).
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
  // Branches: a sparse recursive tree grows out of each band (PILOT_REPORT.md §1). Per order (0 primary, 1, 2):
  // thinner, dimmer, shorter; each tip fades to zero. Indexed by order.
  var BR = {
    width: [4, 2.2, 1.2], // core width at the root, px at 1200 px wide
    bright: [1, 0.6, 0.35], // alpha factor
    grow: [600, 450, 350], // ms to grow, after the bands have drawn on
    tilt: [0.00006, 0.00012, 0.0002], // rad of drift per px of scroll: finer orders move further (depth per order)
    sway: [0.015, 0.03, 0.05] // rad amplitude of the slow sway with the band flow
  };
  var SEG = 10; // samples per branch
  var STAGGER = 600; // ms spread of primary starts

  // 2x3 affine matrices [a, b, c, d, e, f]: x' = a x + c y + e, y' = b x + d y + f.
  function mul(m, n) {
    return [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3],
      m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]];
  }

  function place(x, y, a) {
    var c = Math.cos(a), s = Math.sin(a);
    return [c, s, -s, c, x, y];
  }

  function veinField(canvas) {
    var host = canvas.closest(".slab");
    var ctx = canvas.getContext("2d");
    if (!host || !ctx) return;
    var w = 0, h = 0, dpr = 1, fams = [], col = {}, lit = null, branches = [];
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
      branches.forEach(function (b) { b.sprite = null; }); // colours changed: re-bake on next paint
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
          offs: offs, ribbon: (40 + r() * 90) * clamp(w / 1200, 0.5, 1), delay: r() * 0.3,
          lit: i % 2 === (w > 900 ? 0 : 1) // phones: light the bands above and below the copy, not the one behind it
        });
      }
      fams = list;
      branches = [];
      var rb = mulberry32(SEED + 11), sc = clamp(w / 1200, 0.55, 1), rx = Math.max(w * 0.4, Math.min(w * 0.75, 340));
      // A root must sit on screen and outside the copy scrim, or its tree would grow where nobody sees it.
      function seen(f, x) {
        var y = f.y0 + x * f.tilt + f.a1 * Math.sin(x * f.f1 + f.p1) + f.a2 * Math.sin(x * f.f2 + f.p2), dx = (x - w / 2) / rx, dy = (y - h / 2) / (rx * 0.62);
        return y > h * 0.06 && y < h * 0.94 && dx * dx + dy * dy > 0.8;
      }
      fams.forEach(function (f) {
        var n = f.lit ? (w > 900 ? 4 : 2) : 1, k, side, dir, turn, x, tries;
        for (k = 0; k < n; k++) {
          side = rb() < 0.5 ? -1 : 1; // leaves above or below the band
          dir = rb() < 0.75 ? 1 : -1; // mostly with the band's direction
          turn = side * dir * (0.35 + rb() * 0.3); // shallow departure, 20-37 degrees
          for (tries = 0, x = -1; tries < 6 && (x < 0 || !seen(f, x)); tries++) x = w * (0.06 + (k + 0.1 + rb() * 0.8) / n * 0.88);
          if (!seen(f, x)) continue;
          grow({ fam: f, x: x, off: side * (f.ribbon * 0.5 + f.offs[0]), base: (dir > 0 ? 0 : Math.PI) + turn },
            null, 0, (150 + rb() * 110) * sc, turn, STAGGER * rb(), rb, sc);
        }
      });
    }

    // One branch in its own frame (root at 0,0, heading +x): one slow bend back toward its parent plus a small wobble.
    // Children fork off at 35-75 % of its length; parents are pushed before children, so one pass resolves transforms.
    function grow(root, parent, lvl, len, turn, start, r, sc) {
      var bend = -turn * 0.8, pts = [0, 0], hd = [0], x = 0, y = 0, hh = 0, wob = r() * 6.28, i, b, kids, c, s, ct;
      for (i = 1; i <= SEG; i++) {
        hh += bend / SEG + 0.07 * Math.sin(i * 1.1 + wob);
        x += Math.cos(hh) * len / SEG;
        y += Math.sin(hh) * len / SEG;
        pts.push(x, y);
        hd.push(hh);
      }
      b = { root: root, parent: parent, lvl: lvl, pts: pts, hd: hd, w: BR.width[lvl] * Math.max(sc, 0.7), a: BR.bright[lvl],
        start: start, rot: parent ? parent.b.hd[parent.i] + turn : root.base, out: turn < 0 ? -1 : 1, ph: r() * 6.28, lit: root.fam.lit, sprite: null };
      branches.push(b);
      if (lvl >= 2) return;
      kids = lvl === 0 ? (b.lit ? 2 : 1) : (b.lit ? (r() < 0.35 ? 2 : 1) : 0);
      for (c = 0; c < kids; c++) {
        s = Math.round(SEG * (0.35 + r() * 0.4));
        ct = (c ? -1 : 1) * b.out * (0.35 + r() * 0.25); // first child away from the band, second back toward it
        grow(root, { b: b, i: s }, lvl + 1, len * (0.5 + r() * 0.2), ct, start + BR.grow[lvl] * s / SEG, r, sc);
      }
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

    // Tapered branch outline up to fraction frac of its length, filled with a root-to-tip fade. Lit bands: a wide amber
    // halo plus a glow core, additive; unlit bands: one structural-band core.
    function paintBranch(c, b, frac) {
      var P = b.pts, n = frac * SEG, top = Math.min(Math.ceil(n), SEG), L = [], R = [], passes, p, i, q, px, py, wd, g;
      if (n <= 0) return;
      passes = b.lit ? [[4, 0.18, col.accent], [1, 0.8, col.accentTo]] : [[1, 0.5, col.mid]];
      c.globalCompositeOperation = b.lit ? "lighter" : "source-over";
      for (p = 0; p < passes.length; p++) {
        L.length = R.length = 0;
        for (i = 0; i <= top; i++) {
          px = P[2 * i];
          py = P[2 * i + 1];
          if (i > n) { // growing tip: stop part-way along the last segment
            q = n - (i - 1);
            px = P[2 * i - 2] + (px - P[2 * i - 2]) * q;
            py = P[2 * i - 1] + (py - P[2 * i - 1]) * q;
          }
          wd = b.w * passes[p][0] * 0.5 * (1 - 0.8 * i / SEG) * (i >= n && frac < 1 ? 0.2 : 1);
          L.push(px - Math.sin(b.hd[i]) * wd, py + Math.cos(b.hd[i]) * wd);
          R.unshift(px + Math.sin(b.hd[i]) * wd, py - Math.cos(b.hd[i]) * wd);
        }
        g = c.createLinearGradient(0, 0, P[2 * SEG], P[2 * SEG + 1]);
        g.addColorStop(0, rgba(passes[p][2], passes[p][1] * b.a));
        g.addColorStop(0.5, rgba(passes[p][2], passes[p][1] * b.a * 0.55));
        g.addColorStop(1, rgba(passes[p][2], 0));
        c.fillStyle = g;
        c.beginPath();
        c.moveTo(L[0], L[1]);
        for (i = 2; i < L.length; i += 2) c.lineTo(L[i], L[i + 1]);
        for (i = 0; i < R.length; i += 2) c.lineTo(R[i], R[i + 1]);
        c.closePath();
        c.fill();
      }
      c.globalCompositeOperation = "source-over";
    }

    // Cached layer: a fully grown branch is painted once into its own small canvas and blitted with its transform.
    function bake(b) {
      var P = b.pts, pad = b.w * 2 + 2, x0 = 0, y0 = 0, x1 = 0, y1 = 0, i, cv, c;
      for (i = 0; i < P.length; i += 2) {
        x0 = Math.min(x0, P[i]); x1 = Math.max(x1, P[i]);
        y0 = Math.min(y0, P[i + 1]); y1 = Math.max(y1, P[i + 1]);
      }
      x0 -= pad; y0 -= pad;
      cv = document.createElement("canvas");
      cv.width = Math.ceil((x1 + pad - x0) * dpr);
      cv.height = Math.ceil((y1 + pad - y0) * dpr);
      c = cv.getContext("2d");
      c.setTransform(dpr, 0, 0, dpr, -x0 * dpr, -y0 * dpr);
      paintBranch(c, b, 1);
      b.sprite = { cv: cv, x: x0, y: y0, w: cv.width / dpr, h: cv.height / dpr };
    }

    // Branches ride their band: the primary's root follows the band's centre line, flow phase, slope and parallax;
    // each order adds its own sway and scroll drift, composed down the tree so children stay attached.
    function drawBranches(t, tt, sy, still) {
      var i, b, f, ph, x, y, sl, dyn, m, g;
      ctx.globalAlpha = 1;
      for (i = 0; i < branches.length; i++) {
        b = branches[i];
        f = b.root.fam;
        g = still ? 1 : clamp((t - start - DRAW_MS - b.start) / BR.grow[b.lvl], 0, 1);
        dyn = b.out * BR.tilt[b.lvl] * sy + BR.sway[b.lvl] * Math.sin(tt * DEPTH[f.depth].speed * 2.5 + b.ph);
        if (b.parent) {
          m = b.parent.b.m;
          x = b.parent.b.pts[2 * b.parent.i];
          y = b.parent.b.pts[2 * b.parent.i + 1];
          b.m = mul(m, place(x, y, b.rot + dyn));
        } else {
          ph = tt * DEPTH[f.depth].speed;
          x = b.root.x;
          y = f.y0 + x * f.tilt + f.a1 * Math.sin(x * f.f1 + f.p1 + ph) + f.a2 * Math.sin(x * f.f2 + f.p2 - ph * 1.7);
          sl = f.tilt + f.a1 * f.f1 * Math.cos(x * f.f1 + f.p1 + ph) + f.a2 * f.f2 * Math.cos(x * f.f2 + f.p2 - ph * 1.7);
          b.m = place(x, y + b.root.off - sy * DEPTH[f.depth].parallax, Math.atan(sl) + b.rot + dyn);
        }
        if (g <= 0) continue;
        m = b.m;
        ctx.setTransform(m[0] * dpr, m[1] * dpr, m[2] * dpr, m[3] * dpr, m[4] * dpr, m[5] * dpr);
        if (g < 1) {
          paintBranch(ctx, b, 1 - (1 - g) * (1 - g));
          continue;
        }
        if (!b.sprite) bake(b);
        ctx.globalCompositeOperation = b.lit ? "lighter" : "source-over";
        ctx.drawImage(b.sprite.cv, b.sprite.x, b.sprite.y, b.sprite.w, b.sprite.h);
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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
      drawBranches(t, tt, sy, still);
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
