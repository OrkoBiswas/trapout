"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import gsap from "gsap";
import "./storm-environment.css";

const rainStreaks = Array.from({ length: 44 }, (_, index) => ({
  "--rain-left": `${((index * 29) % 127) - 12}%`,
  "--rain-height": `${42 + ((index * 17) % 74)}px`,
  "--rain-duration": `${1.05 + ((index * 7) % 11) / 10}s`,
  "--rain-delay": `${-((index * 13) % 31) / 10}s`,
  "--rain-opacity": 0.12 + ((index * 11) % 17) / 100,
})) as CSSProperties[];

export function StormEnvironment({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const lightning = useRef<gsap.core.Timeline | null>(null);
  const activeRef = useRef(active);

  useEffect(() => {
    activeRef.current = active;
    lightning.current?.paused(!active);
  }, [active]);

  useEffect(() => {
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const timeline = gsap.timeline({
        repeat: -1,
        repeatDelay: 3,
        paused: !activeRef.current,
      });

      // Broad, slow cloud illumination stays behind the image and typography.
      timeline
        .to(".storm-lightning--far", { opacity: 0.18, duration: 0.65, ease: "sine.inOut" }, 8.4)
        .to(".storm-lightning--far", { opacity: 0, duration: 1.8, ease: "sine.out" })
        .to(".storm-lightning--near", { opacity: 0.14, duration: 0.85, ease: "sine.inOut" }, 21.2)
        .to(".storm-lightning--near", { opacity: 0, duration: 2.1, ease: "sine.out" });

      lightning.current = timeline;
      return () => {
        lightning.current = null;
      };
    }, root);

    return () => media.revert();
  }, []);

  return (
    <div ref={root} className="storm-environment" data-active={active} aria-hidden="true">
      <div className="storm-lightning storm-lightning--far" />
      <div className="storm-lightning storm-lightning--near" />
      <div className="storm-mist storm-mist--distant" />
      <div className="storm-mist storm-mist--foreground" />
      <div className="storm-rain">
        {rainStreaks.map((style, index) => <i className="storm-rain-streak" key={index} style={style} />)}
      </div>
    </div>
  );
}
