import type { Metadata } from "next";
import { DustField } from "./stardust-client";

// Stardust: Dust (DES-032) recoloured as star dust over a galaxy (DES-037). Same chapters, copy, shapes and mechanics.
// Proof of concept: placeholder copy only. The client owns the canvas, the scroll mapping and data-active on the chapters.
export const metadata: Metadata = {
  title: "Stardust",
  description: "A cloud of star dust that settles into six formations over a galaxy as you scroll.",
};

const chapters = [
  { shape: "orb", label: "Orb", line: "Shape 1 of 6. A hollow shell, each particle on its own orbit." },
  { shape: "breath", label: "Breath", line: "Shape 2 of 6. A waveform that rises, holds, falls and rests." },
  { shape: "board", label: "Board", line: "Shape 3 of 6. A lattice of pads joined by straight traces." },
  { shape: "skeleton", label: "Skeleton", line: "Shape 4 of 6. Fifteen points and the lines between them, walking." },
  { shape: "airway", label: "Airway", line: "Shape 5 of 6. One stream that splits, and splits again." },
  { shape: "strata", label: "Strata", line: "Shape 6 of 6. Layers laid down one over another." },
];

const css = `
  .dust { --ground:#070812; --ink:#E6E9F5; --muted:#A9B1C8; --scrim:rgba(7,8,18,.8); --rule:rgba(230,233,245,.28); --dot:rgba(230,233,245,.55);
    --space:linear-gradient(160deg,transparent 30%,rgba(120,92,210,.09) 46%,rgba(70,160,170,.07) 58%,transparent 72%),radial-gradient(ellipse 60% 45% at 62% 40%,rgba(200,110,140,.05),transparent 70%),var(--ground);
    --mono:ui-monospace,"SF Mono",Menlo,monospace; --gutter:clamp(16px,4vw,48px);
    background:var(--space); color:var(--ink); font-family:var(--font-archivo),"Helvetica Neue",Arial,sans-serif; -webkit-font-smoothing:antialiased; }
  .dust a { color:inherit; }
  .dust a:focus-visible { outline:2px solid var(--ink); outline-offset:4px; border-radius:2px; }
  .dust__scene { position:fixed; inset:0; z-index:0; contain:strict; background:var(--space); }
  .dust__scene canvas { position:absolute; top:0; left:0; display:block; width:100%; height:100%; transition:opacity .2s linear; }
  .dust__back { position:fixed; z-index:3; top:var(--gutter); left:var(--gutter); display:inline-flex; gap:.5em; align-items:center; padding:.5rem .75rem .5rem 0;
    font-family:var(--mono); font-size:.75rem; letter-spacing:.08em; text-transform:uppercase; text-decoration:none; color:var(--muted); }
  .dust__back:hover { color:var(--ink); }
  .dust__dots { position:fixed; z-index:3; right:calc(var(--gutter) - 10px); top:50%; transform:translateY(-50%); display:flex; flex-direction:column; }
  .dust__dots a { display:grid; place-items:center; width:28px; height:28px; }
  .dust__dots a::before { content:""; width:6px; height:6px; border-radius:50%; background:var(--dot); transition:background .3s, transform .3s; }
  .dust__dots a[aria-current]::before { background:var(--ink); transform:scale(1.35); }
  .dust__chapter { position:relative; z-index:1; min-height:200svh; }
  .dust__copy { position:fixed; inset:0; z-index:2; display:flex; align-items:flex-end; padding:var(--gutter);
    padding-bottom:max(var(--gutter), env(safe-area-inset-bottom)); pointer-events:none;
    opacity:0; visibility:hidden; transition:opacity .5s ease, visibility 0s linear .5s; }
  .dust__chapter[data-active] .dust__copy { opacity:1; visibility:visible; transition:opacity .8s ease .2s, visibility 0s; }
  .dust__panel { pointer-events:auto; max-width:26rem; padding:1rem 1.25rem 1.1rem; background:var(--scrim); border-left:1px solid var(--rule); }
  .dust__count { margin:0 0 .5rem; font-family:var(--mono); font-size:.75rem; letter-spacing:.08em; color:var(--muted); }
  .dust__title { margin:0; font-weight:500; font-size:clamp(1.75rem,3.2vw,2.5rem); line-height:1.05; letter-spacing:-.02em; font-stretch:112%; }
  .dust__line { margin:.6rem 0 0; font-size:1rem; line-height:1.5; color:var(--muted); }
  @media (max-width:699.98px) { .dust__chapter { min-height:160svh; } .dust__panel { max-width:none; } }
  @media (prefers-reduced-motion:reduce) {
    .dust__copy, .dust__chapter[data-active] .dust__copy { transition:opacity .2s linear, visibility 0s; }
  }
  /* Before the client marks the page ready, only the first chapter's copy shows: no flash of six stacked panels. */
  .dust:not([data-ready]) .dust__chapter:first-of-type .dust__copy { opacity:1; visibility:visible; }
  /* No WebGL (data-fallback, set by the client) or no JS (noscript below): the copy stays in flow, every chapter readable over the CSS space ground. */
  .dust[data-fallback] .dust__copy { position:relative; inset:auto; min-height:100svh; opacity:1; visibility:visible; }
`;

export default function Stardust() {
  return (
    <div className="dust">
      <style>{css}</style>
      <noscript><style>{`.dust .dust__copy{position:relative;inset:auto;min-height:100svh;opacity:1;visibility:visible}`}</style></noscript>
      <DustField />
      <a className="dust__back" href="/"><span aria-hidden="true">&larr;</span> Experiments</a>
      <nav className="dust__dots" aria-label="Shapes">
        {chapters.map((c, i) => (
          <a key={c.shape} href={`#${c.shape}`} data-dot={i} aria-label={`Shape ${i + 1}, ${c.label}`} />
        ))}
      </nav>
      <main>
        {chapters.map((c, i) => {
          const Title = i === 0 ? "h1" : "h2";
          return (
            <section className="dust__chapter" id={c.shape} data-chapter="" data-shape={c.shape} key={c.shape}>
              <div className="dust__copy">
                <div className="dust__panel">
                  <p className="dust__count">{String(i + 1).padStart(2, "0")} / {String(chapters.length).padStart(2, "0")}</p>
                  <Title className="dust__title">{i === 0 ? "Stardust" : c.label}</Title>
                  <p className="dust__line">{i === 0 ? `${c.label}. ${c.line} Scroll to move the cloud.` : c.line}</p>
                </div>
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
