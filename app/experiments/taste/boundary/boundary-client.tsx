"use client";

// The two things this page cannot do on the server: a reduced-motion provider for the Motion entrances,
// and the live thing, "drag the boundary": a thumb-draggable seam between the hardware and the software of one device.
import { useId, useState } from "react";
import { MotionConfig } from "motion/react";
import { ArrowsOutLineHorizontal } from "@phosphor-icons/react";

export function MotionShell({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

type Side = { src: string; alt: string; title: string; text: string };

export function BoundarySeam({ left, right }: { left: Side; right: Side }) {
  const [x, setX] = useState(50);
  const id = useId();
  const side = x < 50 ? right : left; // the larger half is the one you are "on"
  return (
    <figure className="seam" style={{ ["--x" as string]: `${x}%` }}>
      <div className="seam__stage">
        <img className="seam__img" src={right.src} alt={right.alt} width={1200} height={1284} loading="lazy" />
        <img className="seam__img seam__img--top" src={left.src} alt={left.alt} width={1000} height={1077} loading="lazy" />
        <label className="seam__handle" htmlFor={id}>
          <ArrowsOutLineHorizontal size={28} weight="bold" aria-hidden="true" />
          <span className="visually-hidden">Drag the boundary between hardware and software</span>
        </label>
        <input
          id={id}
          className="seam__range"
          type="range"
          min={0}
          max={100}
          value={x}
          onChange={(e) => setX(Number(e.target.value))}
          aria-label="Boundary between hardware and software, 0 is all software, 100 is all hardware"
        />
      </div>
      <figcaption className="seam__caption">
        <strong>{side.title}</strong> {side.text}
      </figcaption>
    </figure>
  );
}
