import type { Metadata } from "next";
import * as motion from "motion/react-client";
import { ArrowRight, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { BoundarySeam, MotionShell } from "./boundary-client";

// Boundary: a full portfolio built as a run of the taste-skill (direction "the pinned poster", seed 2122943730).
// Idea: the boundary he works at becomes the gap in his own name. KAAN stays top-left, BOREKCI bottom-right,
// and everything he has built passes between the two halves. Copy and facts: plan.md and CONTEXT.md.
export const metadata: Metadata = {
  title: "Boundary",
  description: "Kaan Borekci builds the first working version where hardware, software and people meet.",
};

const EMAIL = "kaan@borekci.com";
const MAILTO = `mailto:${EMAIL}?subject=${encodeURIComponent("Hello from your portfolio")}&body=${encodeURIComponent("Hi Kaan,\n\n")}`;
const ease = [0.22, 1, 0.36, 1] as const;
const rise = (i = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.05, margin: "0px 0px -8% 0px" },
  transition: { duration: 0.8, ease, delay: i * 0.08 },
});

// The pinned run: six pictures of his own artefacts, one ratio, each with its flat ground sampled from the picture.
const run = [
  { src: "/assets/img/portrait/kaan-borekci-720.webp", w: 720, h: 900, ground: "#1f3a2a", alt: "Kaan Borekci on a tree-lined campus path, in a light blue shirt", caption: "Chicago." },
  { src: "/assets/img/boundary/board.webp", w: 1000, h: 1077, ground: "#17422a", alt: "The front of the custom data-logger board: CO₂ sensor, start and stop buttons, LEDs and the microSD reader, labelled", caption: "The board I designed for children with CCHS." },
  { src: "/assets/img/boundary/infant.webp", w: 1152, h: 1192, ground: "#2d3d33", alt: "An infant lying on its back with pose-estimation keypoints and a skeleton drawn over the video frame", caption: "Infant motion, read from ordinary video." },
  { src: "/assets/img/found/salome-marble-quarry.webp", w: 1400, h: 1378, ground: "#2b4538", alt: "A polished block of green and red brecciated marble from a Turkish quarry, close up", caption: "Stone. The family's material for four generations." },
];

// Work: four full panels, one midline row. The first panel holds the live thing.
const work = [
  { years: "2024–26", title: "Diaphragm pacing data platform", fact: "Lurie Children’s Hospital, provisional patent", media: "seam" as const },
  { years: "2024–26", title: "Infant motion pipeline", fact: "Shirley Ryan AbilityLab, pose estimation", media: "video" as const, src: "/assets/video/infant-pose-pipeline/pose-loop.mp4", poster: "/assets/video/infant-pose-pipeline/pose-loop-poster.webp", alt: "An infant on its back, pose keypoints and skeleton tracking its movement" },
  { years: "2026", title: "Lung airflow, three particle sizes", fact: "Ansys Fluent, ME 378", media: "video" as const, src: "/assets/video/boundary/cfd-lung.mp4", poster: "/assets/img/boundary/cfd-poster.webp", alt: "Particles travelling down a branching airway model" },
  { years: "2026", title: "Robotic manipulation", fact: "ME 449, open-chain control", media: "image" as const, src: "/assets/img/boundary/robot.webp", w: 650, h: 852, alt: "A six-axis robot arm in simulation with its end-effector frame drawn" },
];

// Timeline: nine beats, each with its artefact. The sticky picture follows the chosen row.
const beats = [
  { name: "Shunt flow monitor, Rogers Lab", year: "2019", text: "Wireless sensing of cerebrospinal-fluid flow. Co-author, npj Digital Medicine, 2020.", src: "/assets/img/boundary/shunt.webp", alt: "A soft, flexible flow sensor worn on the side of a neck, and held between gloved fingers" },
  { name: "Skin-flap viability monitor", year: "2020", text: "Interned remotely from Turkey during COVID. Learned Python to analyse the data.", src: "/assets/img/boundary/skin-flap.webp", alt: "Three tissue cross-sections, congested, baseline and ischemic, above two measurement plots" },
  { name: "Tech transfer, INVO", year: "2022", text: "Market research and due diligence on faculty inventions. Where the business side entered.", src: "/assets/img/found/northwestern-library.webp", alt: "Northwestern University’s student union and library seen across the lawn" },
  { name: "Mirkin Lab, nanotechnology", year: "2023", text: "DNA-conjugated crystal engineering. Learned I do not want a wet lab.", src: "/assets/img/boundary/crystals.webp", alt: "An electron micrograph of faceted crystals beside a rendering of DNA-coated nanoparticles in a lattice" },
  { name: "First PCB, live video streaming", year: "2024", text: "EE 326. Skills from one quarter saved the capstone the next.", src: "/assets/img/boundary/pcb-layout.webp", alt: "A 50 by 50 millimetre circuit-board layout with red and blue traces around a microcontroller" },
  { name: "Infant motion, SRAlab", year: "2024–", text: "Dropped into computer vision with no background. Became the technical lead.", src: "/assets/img/boundary/infant.webp", alt: "An infant with pose-estimation keypoints drawn over the video frame" },
  { name: "CCHS wearable, Lurie", year: "2024–", text: "Firmware, a custom board, IRB-approved data collection, BMES 2025 poster.", src: "/assets/img/boundary/board.webp", alt: "The custom data-logger board, labelled" },
  { name: "M.S. mechanical, computational mechanics", year: "2025–26", text: "CFD, failure analysis, physics-informed ML. The mechanics reshaped the research.", src: "/assets/img/boundary/cfd-poster.webp", alt: "A branching airway model with particle tracks" },
  { name: "Forward Deployed AI Engineer", year: "2026–", text: "AI inside companies, at the boundary between a model and an organisation. Forge Deployment.", src: "/assets/img/portrait/kaan-borekci-720.webp", alt: "Kaan Borekci on a campus path" },
];

const legacy = [
  { src: "/assets/img/found/salome-marble-quarry.webp", w: 1400, h: 1378, alt: "A polished block of green brecciated marble, close up", name: "Classic Stone", role: "Natural stone, supplied and cut", text: "The family quarries, cuts and ships stone. I grew up around slabs, saws and the people who move them." },
  { src: "/assets/img/found/ankara-city.webp", w: 1600, h: 1067, alt: "The red roofs of Ankara’s old town with the modern city rising behind", name: "Ankara", role: "The Midi Hotel, construction, real estate", text: "Hospitality, construction and real estate, held by Borekci Inc. Four generations of thinking in decades." },
  { src: "/assets/img/portrait/kaan-borekci-720.webp", w: 720, h: 900, alt: "Kaan Borekci on a campus path", name: "Kaan", role: "Fourth generation", text: "The family taught me to think in decades. I chose engineering to build what comes next: medical technology, AI and robotics that improve quality of life." },
];

const credits = [
  { title: "Salome Marble (Supren Marble), quarry block", by: "James St. John", lic: "CC BY 2.0", url: "https://commons.wikimedia.org/w/index.php?curid=84515536" },
  { title: "Ankara city, Turkey", by: "Omer Unlu", lic: "CC BY 2.0", url: "https://commons.wikimedia.org/w/index.php?curid=69458847" },
  { title: "Student Union and University Library, Northwestern", by: "Amerique", lic: "CC BY 3.0", url: "https://commons.wikimedia.org/w/index.php?curid=7419080" },
  { title: "Texas State Capitol, Austin", by: "Stuart Seeger", lic: "CC BY 2.0", url: "https://commons.wikimedia.org/w/index.php?curid=10873949" },
];

const css = `
html { background:#133621; }
.b { --bg:#133621; --surface:#1a4429; --ink:#f4d96c; --muted:#b3a55e; --accent:#f4d96c; --accent-ink:#133621;
  --step-small:0.9375rem; --step-body:clamp(1.0625rem,1rem + 0.25vw,1.1875rem);
  --step-lead:clamp(1.25rem,1.1rem + 0.7vw,1.625rem); --step-head:clamp(2rem,1.2rem + 2.3vw,3rem); --step-display:clamp(84px,16vw,250px);
  --gutter:clamp(16px,2.2vw,32px); --ease-out:cubic-bezier(0.22,1,0.36,1); --t-press:140ms; --t-hover:180ms;
  background:var(--bg); color:var(--ink); font-size:var(--step-body); line-height:1.5; -webkit-font-smoothing:antialiased; overflow-x:clip; }
.b * { box-sizing:border-box; }
.b a { color:inherit; }
.b .btn { color:var(--accent-ink); }
.b :focus-visible { outline:3px solid var(--ink); outline-offset:4px; }
.b img, .b video { display:block; max-width:100%; }
.visually-hidden { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; }
.display { font-weight:800; font-stretch:62%; text-transform:uppercase; letter-spacing:-0.01em; line-height:0.86; margin:0; }
.wrap { padding-inline:var(--gutter); }
.btn { display:inline-flex; align-items:center; gap:.5em; background:var(--accent); color:var(--accent-ink); font-weight:500; font-size:var(--step-body);
  padding:0.9em 1.3em; text-decoration:none; border:0; transition:transform var(--t-press) var(--ease-out), background-color var(--t-hover) ease; }
.btn:active { transform:scale(0.97); }
.link { text-decoration:underline; text-decoration-color:transparent; text-underline-offset:.2em; text-decoration-thickness:.07em; transition:text-decoration-color var(--t-hover) ease; }
@media (hover:hover) and (pointer:fine) { .btn:hover { background:#fff0b0; } .link:hover { text-decoration-color:currentColor; } }

/* Nav: a plain bar, wordmark, four links, one action */
.nav { position:absolute; inset:0 0 auto 0; z-index:30; display:flex; align-items:center; justify-content:space-between; gap:var(--gutter); padding:20px var(--gutter); font-size:var(--step-small); font-weight:500; }
.nav ul { display:flex; gap:clamp(14px,2vw,28px); list-style:none; margin:0; padding:0; }
.nav .btn { padding:.55em 1em; font-size:var(--step-small); }
@media (max-width:800px) { .nav ul { display:none; } }

/* Hero: the name split to two corners stays; the run passes between the halves */
.hero { position:relative; }
.hero__pin { position:sticky; top:0; height:100svh; z-index:20; pointer-events:none; }
.hero__pin > * { pointer-events:auto; }
.hero__kaan { position:absolute; left:var(--gutter); top:clamp(72px,9vh,112px); font-size:var(--step-display); }
.hero__borekci { position:absolute; right:var(--gutter); bottom:clamp(20px,4vh,48px); font-size:var(--step-display); text-align:right; }
.hero__lead { position:absolute; left:var(--gutter); bottom:clamp(20px,4vh,48px); max-width:26ch; font-weight:500; font-size:var(--step-body); margin:0; }
.hero__lead .btn { margin-top:18px; }
.hero__lead--m { display:none; }
.hero__cta--m { display:none; }
.run { list-style:none; margin:0; padding:0; margin-top:-100svh; position:relative; z-index:10; }
.run li { height:84svh; display:grid; place-items:center; background:var(--ground); }
.run li:first-child { height:100svh; }
.run figure { margin:0; width:min(50vw,640px,56svh); }
.run li:first-child figure { width:min(50vw,640px,66svh); }
.run img { width:100%; height:auto; aspect-ratio:4/5; object-fit:cover; }
.run figcaption { margin-top:12px; font-size:var(--step-body); color:var(--ink); }
@media (max-width:800px) {
  .hero__kaan { top:72px; font-size:clamp(84px,24vw,140px); }
  .hero__borekci { font-size:clamp(64px,19vw,140px); bottom:auto; top:calc(72px + 1.1em); right:auto; left:var(--gutter); text-align:left; }
  .hero__cta--m { display:inline-flex; position:absolute; right:16px; bottom:16px; }
  .hero__lead { max-width:calc(100% - 2 * var(--gutter)); bottom:20px; }
  .run li { height:auto; padding:8svh 16px 32px; display:block; }
  .run li:first-child { height:auto; padding-top:38svh; }
  .run figure { width:min(100%, 40svh); margin:0 auto; }
  .run img { aspect-ratio:2/3; }
  .hero__lead--d { display:none; }
  .hero__lead--m { display:block; position:static; margin:28px auto 0; max-width:34ch; font-weight:500; }
}

/* Work: full panels, one midline row, each sliding over the last */
.work { position:relative; }
.panel { position:relative; height:100svh; overflow:hidden; background:var(--surface); }
.panel__media, .panel__media img, .panel__media video { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
.panel__media img, .panel__media video { transform:none; }
.panel__row { position:absolute; left:0; right:0; top:50%; transform:translateY(-50%); height:90px; display:grid; grid-template-columns:1fr auto 1fr; grid-template-areas:"year title fact"; align-items:center; padding-inline:var(--gutter); background:rgba(19,54,33,0.86); }
.panel__row .display { grid-area:title; } .panel__year { grid-area:year; } .panel__fact { grid-area:fact; }
.panel__row .display { font-stretch:62%; font-size:var(--step-head); line-height:1; }
.panel__year { font-size:var(--step-small); } .panel__fact { font-size:var(--step-small); text-align:right; }
.panel--seam .panel__row { top:auto; bottom:0; transform:none; }
@media (max-width:800px) {
  .panel { height:82svh; }
  .panel__row { top:auto; bottom:20px; transform:none; height:auto; grid-template-columns:1fr 1fr; grid-template-areas:"title title" "year fact"; padding-block:12px; row-gap:6px; }
  .panel__row .display { font-size:var(--step-head); }
  .panel__year, .panel__fact { font-size:var(--step-small); }
}

/* The live thing */
.seam { margin:0; position:absolute; inset:0; }
.seam__stage { position:absolute; inset:0; }
.seam__img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
.seam__img--top { clip-path:inset(0 calc(100% - var(--x)) 0 0); }
.seam__range { position:absolute; inset:0; width:100%; height:100%; margin:0; opacity:0; cursor:ew-resize; touch-action:pan-y; }
.seam__handle { position:absolute; top:50%; left:var(--x); transform:translate(-50%,-50%); width:64px; height:64px; display:grid; place-items:center; background:var(--accent); color:var(--accent-ink); z-index:2; pointer-events:none; }
.seam__caption { position:absolute; left:var(--gutter); right:var(--gutter); top:clamp(80px,12vh,120px); z-index:2; max-width:36ch; font-size:var(--step-body); background:rgba(19,54,33,0.86); padding:12px 16px; }
@media (max-width:800px) { .seam__caption { top:80px; } }

/* Timeline: sticky photograph, active list (radio-driven, no script) */
.tl { display:grid; grid-template-columns:5fr 1fr 5fr; grid-template-rows:auto 1fr; gap:0 var(--gutter); padding:clamp(120px,16vh,220px) var(--gutter); align-items:start; }
.tl__pic { grid-column:1; grid-row:1 / span 2; position:sticky; top:12vh; aspect-ratio:4/5; }
.tl__title { grid-column:3; grid-row:1; margin:0 0 48px; }
.tl__pic img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:0; transition:opacity 300ms ease; }
.tl__list { grid-column:3; grid-row:2; }
.tl h2 { font-size:var(--step-head); }
.tl__row { display:grid; grid-template-columns:1fr auto; column-gap:16px; align-items:baseline; min-height:58px; padding-block:10px; cursor:pointer; }
.tl__row input { position:absolute; opacity:0; width:1px; height:1px; }
.tl__name { font-size:var(--step-lead); font-weight:500; color:var(--muted); transition:color var(--t-hover) ease; }
.tl__year { font-size:var(--step-small); color:var(--muted); font-variant-numeric:tabular-nums; }
.tl__text { grid-column:1 / -1; display:grid; grid-template-rows:0fr; transition:grid-template-rows 320ms var(--ease-out); }
.tl__text > p { overflow:hidden; margin:0; max-width:34ch; font-size:var(--step-body); }
.tl__row:has(input:checked) .tl__name, .tl__row:has(input:checked) .tl__year, .tl__row:hover .tl__name { color:var(--ink); }
.tl__row:has(input:checked) .tl__text { grid-template-rows:1fr; }
.tl__row:has(input:checked) .tl__text > p { padding-top:8px; }
.tl__row:has(input:focus-visible) { outline:3px solid var(--ink); outline-offset:4px; }
${beats.map((_, i) => `.tl:has(#beat-${i}:checked) .tl__pic img:nth-child(${i + 1}) { opacity:1; }`).join("\n")}
@media (max-width:800px) {
  .tl { grid-template-columns:1fr; grid-template-rows:auto auto auto; padding-inline:var(--gutter); padding-top:72px; }
  .tl__title { grid-column:1; grid-row:1; margin:0 0 24px; }
  .tl__pic { grid-column:1; grid-row:2; position:sticky; top:0; aspect-ratio:4/3; height:38svh; margin-inline:calc(-1 * var(--gutter)); z-index:5; }
  .tl__list { grid-column:1; grid-row:3; padding-top:32px; }
  .tl__row { min-height:56px; }
}

/* Legacy: pinned title, pictures pass */
.leg { position:relative; padding-bottom:24svh; background:var(--surface); }
.leg__pin { position:sticky; top:0; height:100svh; z-index:20; display:grid; place-items:center; pointer-events:none; text-align:center; }
.leg__pin .display { font-size:var(--step-display); }
.leg__items { list-style:none; margin:-100svh 0 0; padding:0; position:relative; z-index:10; }
.leg__items li { width:min(30vw,440px); margin-top:36svh; }
.leg__items li:nth-child(odd) { margin-left:var(--gutter); }
.leg__items li:nth-child(even) { margin-left:auto; margin-right:var(--gutter); }
.leg__items li:first-child { margin-top:0; padding-top:70svh; }
.leg__items img { width:100%; height:auto; aspect-ratio:4/5; object-fit:cover; }
.leg__name { margin:14px 0 0; font-size:var(--step-body); font-weight:500; }
.leg__role { margin:2px 0 8px; font-size:var(--step-small); color:var(--muted); }
.leg__text { margin:0; max-width:30ch; font-size:var(--step-body); }
.leg__close { padding:12svh var(--gutter) 0; }
.leg__close p { font-size:var(--step-lead); line-height:1.3; max-width:36ch; margin:0 0 28px; font-weight:500; }
@media (max-width:800px) {
  .leg__pin { position:static; align-items:start; padding:16px var(--gutter) 0; height:auto; min-height:0; text-align:left; justify-items:start; }
  .leg__pin .display { font-size:var(--step-display); }
  .leg__items { margin-top:0; }
  .leg__items li, .leg__items li:nth-child(odd), .leg__items li:nth-child(even) { width:72%; margin:48px 0 0; }
  .leg__items li:nth-child(odd) { margin-left:var(--gutter); } .leg__items li:nth-child(even) { margin-left:auto; margin-right:var(--gutter); }
  .leg__items li:first-child { padding-top:24px; }
  .leg { padding-bottom:20svh; }
}

/* Contact: a visit card on a photograph */
.contact { position:relative; min-height:100svh; }
.contact__pic { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center 70%; }
.contact__card { position:sticky; top:60px; margin:60px 0 0 var(--gutter); width:380px; max-width:calc(100% - 2 * var(--gutter)); background:var(--bg); padding:32px; display:grid; gap:14px; }
.contact__card h2 { font-weight:400; font-size:var(--step-lead); margin:0; }
.contact__card p { margin:0; }
.contact__card .btn { justify-content:center; height:52px; margin-top:8px; }
.contact__links { display:flex; flex-wrap:wrap; gap:6px 18px; }
@media (max-width:800px) { .contact { min-height:0; } .contact__pic { position:relative; height:70svh; } .contact__card { position:relative; top:auto; width:auto; margin:-80px var(--gutter) 0; } .contact__card .btn { height:56px; } }

/* Footer: a single quiet line */
.foot { padding:30svh var(--gutter) 30px; display:grid; gap:40px; }
.foot__credits { font-size:var(--step-body); max-width:70ch; margin:0; }
.foot__line { display:grid; grid-template-columns:1fr auto 1fr; align-items:baseline; gap:24px; font-size:var(--step-small); }
.foot__line ul { display:flex; gap:24px; list-style:none; margin:0; padding:0; justify-content:center; }
.foot__line .right { text-align:right; color:var(--muted); }
@media (max-width:800px) { .foot { padding-top:20svh; } .foot__line { grid-template-columns:1fr; gap:8px; } .foot__line ul { justify-content:start; flex-wrap:wrap; } .foot__line .right { text-align:left; } }
`;

export default function BoundaryPage() {
  return (
    <MotionShell>
      <div className="b">
        <style>{css}</style>
        <noscript><style>{`.b [style*="opacity"] { opacity:1 !important; transform:none !important; }`}</style></noscript>

        <nav className="nav" aria-label="Primary">
          <a className="link" href="#top">Kaan Borekci</a>
          <ul>
            <li><a className="link" href="#work">Work</a></li>
            <li><a className="link" href="#timeline">Timeline</a></li>
            <li><a className="link" href="#legacy">Legacy</a></li>
            <li><a className="link" href="/">Designs</a></li>
          </ul>
          <a className="link" href="#contact">Contact</a>
        </nav>

        <header className="hero" id="top">
          <div className="hero__pin" aria-hidden="false">
            <h1 className="visually-hidden">Kaan Borekci</h1>
            <motion.p className="display hero__kaan" aria-hidden="true" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, ease }}>Kaan</motion.p>
            <motion.p className="display hero__borekci" aria-hidden="true" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, ease, delay: 0.12 }}>Borekci</motion.p>
            <motion.div className="hero__lead hero__lead--d" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.3 }}>
              <p style={{ margin: 0 }}>I build the first working version where hardware, software and people meet. Now I do it as a Forward Deployed AI Engineer at Forge Deployment.</p>
              <a className="btn" href={MAILTO}>Write to me <ArrowRight size={18} weight="bold" aria-hidden="true" /></a>
            </motion.div>
            <a className="btn hero__cta--m" href={MAILTO}>Write to me <ArrowRight size={18} weight="bold" aria-hidden="true" /></a>
          </div>
          <ul className="run">
            {run.map((p, i) => (
              <li key={p.src + i} style={{ ["--ground" as string]: p.ground }}>
                <motion.figure initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.05 }} transition={{ duration: 0.9, ease }}>
                  <img src={p.src} width={p.w} height={p.h} alt={p.alt} loading={i === 0 ? "eager" : "lazy"} fetchPriority={i === 0 ? "high" : "auto"} />
                  <figcaption>{p.caption}</figcaption>
                </motion.figure>
                {i === 0 && (
                  <div className="hero__lead hero__lead--m">
                    <p style={{ margin: 0 }}>I build the first working version where hardware, software and people meet. Now I do it as a Forward Deployed AI Engineer at Forge Deployment.</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </header>

        <section className="work" id="work" aria-label="Work">
          {work.map((w) => (
            <article className={`panel${w.media === "seam" ? " panel--seam" : ""}`} key={w.title}>
              {w.media === "seam" && (
                <BoundarySeam
                  left={{ src: "/assets/img/boundary/board.webp", alt: "The front of the custom data-logger board, labelled", title: "Hardware.", text: "A through-hole board I laid out in Eagle around an RP2040: CO₂ over UART, an IMU over I²C, a microSD card over SPI." }}
                  right={{ src: "/assets/img/boundary/signals.webp", alt: "Seven stacked traces of recorded CO₂, acceleration and angular velocity against time across a treadmill protocol", title: "Software.", text: "The firmware that time-stamps every sample, and the recorded traces from an IRB-approved session on a treadmill." }}
                />
              )}
              {w.media === "video" && (
                <div className="panel__media">
                  <video src={w.src} poster={w.poster} muted loop playsInline autoPlay preload="none" aria-label={w.alt} />
                </div>
              )}
              {w.media === "image" && (
                <div className="panel__media">
                  <img src={w.src} width={w.w} height={w.h} alt={w.alt} loading="lazy" />
                </div>
              )}
              <div className="panel__row">
                <h2 className="display">{w.title}</h2>
                <span className="panel__year">{w.years}</span>
                <span className="panel__fact">{w.fact}</span>
              </div>
            </article>
          ))}
        </section>

        <section className="tl" id="timeline" aria-labelledby="timeline-title">
          <div className="tl__pic" aria-hidden="true">
            {beats.map((b) => <img key={b.name} src={b.src} alt="" width={800} height={1000} loading="lazy" />)}
          </div>
          <motion.h2 id="timeline-title" className="display tl__title" {...rise(0)}>From 2019 to now</motion.h2>
          <div className="tl__list">
            <div role="radiogroup" aria-label="Timeline, pick a beat">
              {beats.map((b, i) => (
                <motion.label className="tl__row" key={b.name} htmlFor={`beat-${i}`} {...rise(i)}>
                  <input type="radio" name="beat" id={`beat-${i}`} defaultChecked={i === 6} />
                  <span className="tl__name">{b.name}</span>
                  <span className="tl__year">{b.year}</span>
                  <span className="tl__text"><p>{b.text}</p></span>
                </motion.label>
              ))}
            </div>
          </div>
        </section>

        <section className="leg" id="legacy" aria-labelledby="legacy-title">
          <div className="leg__pin">
            <h2 id="legacy-title" className="display">Fourth<br />generation</h2>
          </div>
          <ul className="leg__items">
            {legacy.map((l, i) => (
              <li key={l.name}>
                <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.05 }} transition={{ duration: 0.9, ease, delay: i * 0.06 }}>
                  <img src={l.src} width={l.w} height={l.h} alt={l.alt} loading="lazy" />
                  <p className="leg__name">{l.name}</p>
                  <p className="leg__role">{l.role}</p>
                  <p className="leg__text">{l.text}</p>
                </motion.div>
              </li>
            ))}
          </ul>
          <motion.div className="leg__close" {...rise(0)}>
            <p>Admitted to Kellogg, MBA deferred to build first. Then: find, join or acquire a company and bring it into the family business, ideally medical technology.</p>
            <a className="btn" href="/">See the other designs for this site <ArrowRight size={18} weight="bold" aria-hidden="true" /></a>
          </motion.div>
        </section>

        <section className="contact" id="contact" aria-labelledby="contact-title">
          <img className="contact__pic" src="/assets/img/found/texas-capitol-austin.webp" width={1600} height={1065} alt="The Texas State Capitol in Austin at dusk, its dome against a streaked sky" loading="lazy" />
          <motion.div className="contact__card" {...rise(0)}>
            <h2 id="contact-title">Write to me</h2>
            <p><a className="link" href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
            <p>Austin, Texas</p>
            <p className="contact__links">
              <a className="link" href="https://www.linkedin.com/in/kborekci">LinkedIn</a>
              <a className="link" href="https://github.com/kborekci06">GitHub</a>
              <a className="link" href="/assets/KAAN-BOREKCI-RESUME.pdf" download>Resume (PDF, 73 KB)</a>
            </p>
            <a className="btn" href={MAILTO}><EnvelopeSimple size={20} weight="bold" aria-hidden="true" /> Send an email</a>
          </motion.div>
        </section>

        <footer className="foot">
          <p className="foot__credits">
            Pictures of the family’s world and of the two cities are from the open collections:{" "}
            {credits.map((c, i) => (
              <span key={c.url}>
                <a className="link" href={c.url}>{c.title}</a> by {c.by}, {c.lic}{i < credits.length - 1 ? "; " : "."}
              </span>
            ))}{" "}
            Everything else is my own work, or footage I licensed.
          </p>
          <div className="foot__line">
            <span>Kaan Borekci, engineer</span>
            <ul>
              <li><a className="link" href="#work">Work</a></li>
              <li><a className="link" href="#timeline">Timeline</a></li>
              <li><a className="link" href="#legacy">Legacy</a></li>
              <li><a className="link" href="#contact">Contact</a></li>
              <li><a className="link" href="/">Designs</a></li>
            </ul>
            <span className="right">2026</span>
          </div>
        </footer>
      </div>
    </MotionShell>
  );
}
