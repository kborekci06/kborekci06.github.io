import fs from "node:fs";
import path from "node:path";
import { load as loadYaml } from "js-yaml";
import Script from "next/script";

// The gallery: one tile per design in _data/gallery.yml. Ported from the Jekyll page on 2026-10-16;
// same markup and styles (a run of the minimalist-ui skill), rendered at build time.
type Design = { slug: string; name: string; direction: string; date: string; status: string; url?: string; preview?: string };
type Group = { slug: string; short: string; title: string; summary: string; designs: Design[] };

const SITE = { name: "Kaan Borekci", email: "kaan@borekci.com" };

export const metadata = {
  title: "Experiments",
  description: "Every design built for Kaan Borekci's site, grouped by experiment. Open one to see the full page.",
};

function loadGroups(): Group[] {
  const file = fs.readFileSync(path.join(process.cwd(), "_data", "gallery.yml"), "utf8");
  return (loadYaml(file) as Group[]).filter((g) => g.designs?.length);
}

const css = `
  .gallery { --bg:#F7F6F3; --surface:#FFFFFF; --ink:#111111; --body:#2F3437; --muted:#787774; --line:#EAEAEA;
    --green-bg:#EDF3EC; --green-ink:#346538; --blue-bg:#E1F3FE; --blue-ink:#1F6C9F; --yellow-bg:#FBF3DB; --yellow-ink:#956400;
    --serif:"Newsreader","Instrument Serif",Georgia,serif; --sans:"SF Pro Display","Helvetica Neue",Helvetica,Arial,sans-serif;
    --mono:"JetBrains Mono","SF Mono",Menlo,monospace; --measure:64rem; --ease:cubic-bezier(0.16,1,0.3,1);
    background:var(--bg); font-family:var(--sans); font-size:1.0625rem; line-height:1.6; color:var(--body); -webkit-font-smoothing:antialiased; min-height:100vh; }
  .gallery * { box-sizing:border-box; }
  .gallery a { color:inherit; }
  .gallery a:focus-visible { outline:2px solid var(--ink); outline-offset:4px; }
  .ambient { position:fixed; inset:0; z-index:-1; pointer-events:none; background:radial-gradient(60rem 40rem at 20% -10%, rgba(149,100,0,0.05), transparent 60%); }
  .wrap { width:min(100% - 3rem, var(--measure)); margin-inline:auto; }
  .masthead { padding:7rem 0 5rem; }
  .eyebrow { margin:0 0 1.5rem; font-family:var(--mono); font-size:.75rem; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); }
  .gallery h1 { margin:0; font-family:var(--serif); font-weight:400; font-size:clamp(3rem,7vw,5.5rem); line-height:1.02; letter-spacing:-.03em; color:var(--ink); }
  .lede { max-width:38rem; margin:1.75rem 0 0; font-size:1.25rem; line-height:1.5; color:var(--muted); }
  .lede a, .colophon a { text-decoration-color:var(--line); text-underline-offset:.2em; }
  .group { padding:4rem 0 6rem; border-top:1px solid var(--line); }
  .group__head { display:grid; grid-template-columns:1fr auto; gap:1rem 3rem; align-items:baseline; margin-bottom:2.5rem; }
  .group__head h2 { margin:0; font-family:var(--serif); font-weight:400; font-size:clamp(2rem,4vw,2.75rem); line-height:1.1; letter-spacing:-.02em; color:var(--ink); }
  .group__summary { grid-column:1; max-width:38rem; margin:.75rem 0 0; color:var(--muted); }
  .group__count { grid-column:2; grid-row:1; margin:0; font-family:var(--mono); font-size:.75rem; letter-spacing:.05em; color:var(--muted); }
  .tiles { list-style:none; margin:0; padding:0; display:grid; grid-template-columns:repeat(auto-fill,minmax(18rem,1fr)); gap:1.5rem; }
  @media (min-width:56em) { .tile:first-child { grid-column:span 2; } }
  .tile__link { display:block; height:100%; text-decoration:none; background:var(--surface); border:1px solid var(--line); border-radius:12px; overflow:hidden;
    transition:box-shadow 200ms var(--ease), border-color 200ms var(--ease), transform 200ms var(--ease); }
  .tile__link:hover { border-color:#D9D9D6; box-shadow:0 2px 8px rgba(0,0,0,.04); }
  .tile__link:active { transform:scale(.99); }
  .tile__preview { margin:0; aspect-ratio:1200/750; border-bottom:1px solid var(--line); background:var(--bg); overflow:hidden; }
  .tile__preview img { display:block; width:100%; height:100%; object-fit:cover; object-position:top; }
  .tile__body { padding:1.5rem 1.75rem 1.75rem; }
  .tile__label { margin:0 0 .75rem; font-family:var(--mono); font-size:.75rem; letter-spacing:.05em; color:var(--muted); }
  .tile__name { margin:0; font-family:var(--serif); font-weight:500; font-size:1.75rem; line-height:1.1; letter-spacing:-.02em; color:var(--ink); }
  .tile__direction { margin:.5rem 0 1.25rem; color:var(--muted); }
  .tile__meta { display:flex; align-items:center; gap:.75rem; margin:0; font-family:var(--mono); font-size:.75rem; letter-spacing:.05em; color:var(--muted); }
  .badge { display:inline-block; padding:.2em .7em; border-radius:9999px; font-size:.6875rem; text-transform:uppercase; letter-spacing:.05em; }
  .badge--working { background:var(--green-bg); color:var(--green-ink); }
  .badge--candidate { background:var(--blue-bg); color:var(--blue-ink); }
  .badge--archived { background:var(--yellow-bg); color:var(--yellow-ink); }
  .colophon { padding:3rem 0 5rem; border-top:1px solid var(--line); display:flex; flex-wrap:wrap; gap:.5rem 2.5rem; font-family:var(--mono); font-size:.75rem; letter-spacing:.05em; color:var(--muted); }
  @media (prefers-reduced-motion:no-preference) {
    .js .reveal { opacity:0; transform:translateY(12px); }
    .js .reveal.is-in { opacity:1; transform:none; transition:opacity 600ms var(--ease), transform 600ms var(--ease); transition-delay:calc(var(--i,0) * 80ms); }
  }
`;

export default function Gallery() {
  const groups = loadGroups();
  return (
    <div className="gallery">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500&family=JetBrains+Mono:wght@400&display=swap" />
      <style>{css}</style>
      <Script id="js-flag" strategy="beforeInteractive">{`document.documentElement.classList.add("js")`}</Script>
      <div className="ambient" aria-hidden="true" />
      <header className="wrap masthead reveal">
        <p className="eyebrow">{SITE.name} · Site designs</p>
        <h1>Experiments</h1>
        <p className="lede">
          {metadata.description} Each one is its own source folder under{" "}
          <a href="https://github.com/kborekci06/kborekci06.github.io/tree/main/experiments">experiments/</a>.
        </p>
      </header>
      <main className="wrap">
        {groups.map((group) => (
          <section className="group" aria-labelledby={`group-${group.slug}`} key={group.slug}>
            <div className="group__head reveal">
              <h2 id={`group-${group.slug}`}>{group.title}</h2>
              <p className="group__count">{group.designs.length} {group.designs.length === 1 ? "design" : "designs"}</p>
              <p className="group__summary">{group.summary}</p>
            </div>
            <ul className="tiles">
              {group.designs.map((d, i) => {
                const folder = `/experiments/${group.slug}/${d.slug}/`;
                return (
                  <li className="tile reveal" style={{ ["--i" as string]: i }} key={d.slug}>
                    <a className="tile__link" href={d.url ?? folder}>
                      <figure className="tile__preview">
                        <img src={d.preview ?? `${folder}preview.webp`} width={1200} height={750} alt={`Screenshot of the ${d.name} design`} loading="lazy" />
                      </figure>
                      <div className="tile__body">
                        <p className="tile__label">{group.short}{i + 1}</p>
                        <h3 className="tile__name">{d.name}</h3>
                        <p className="tile__direction">{d.direction}</p>
                        <p className="tile__meta"><span className={`badge badge--${d.status}`}>{d.status}</span><span>{String(d.date)}</span></p>
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </main>
      <footer className="wrap colophon">
        <span>Previous site: <a href="https://kborekci06.github.io/">kborekci06.github.io</a></span>
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
      </footer>
      <Script id="reveal" strategy="afterInteractive">{`
        (function () {
          var items = document.querySelectorAll(".reveal");
          if (!("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("is-in"); }); return; }
          var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
          }, { rootMargin: "0px 0px -10% 0px" });
          items.forEach(function (el) { io.observe(el); });
        })();
      `}</Script>
    </div>
  );
}
