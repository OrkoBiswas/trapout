"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const skillLanes = [
  ["Freelancing", "Outreach", "Video Editing", "Business Setup", "Team Management"],
  ["Entrepreneurship", "Sales", "Community Excess", "Physical Workshop", "Motion Design"],
  ["Storytelling", "Personal Branding", "Client Acquisition", "Content Strategy"],
  ["Creative Direction", "Portfolio Building", "Pricing", "Negotiation"],
];

const featuredSkills = new Set(["Video Editing", "Motion Design", "Creative Direction"]);
const emberSkills = new Set(["Video Editing", "Motion Design"]);
const laneDurations = [13, 10.5, 14, 11.5];

export function SkillsStorm() {
  const root = useRef<HTMLElement>(null);
  const animations = useRef<gsap.core.Tween[]>([]);

  useEffect(() => {
    const section = root.current;
    if (!section) return;

    let inView = false;
    const sync = () => {
      const shouldPause = !inView || document.hidden;
      animations.current.forEach((animation) => animation.paused(shouldPause));
    };

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    }, { threshold: 0 });
    observer.observe(section);
    document.addEventListener("visibilitychange", sync);

    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const tweens: gsap.core.Tween[] = [];
      const lanes = section.querySelectorAll<HTMLElement>(".skill-wind-lane");

      lanes.forEach((lane, laneIndex) => {
        const track = lane.querySelector<HTMLElement>(".skill-wind-track");
        if (!track) return;

        // Each track has two identical groups, so a half-width loop is seamless
        // at every viewport width without recalculating pixel measurements.
        const trackLoop = gsap.fromTo(track, { xPercent: 0 }, {
          xPercent: -50,
          duration: laneDurations[laneIndex],
          repeat: -1,
          ease: "none",
          paused: true,
        });
        tweens.push(trackLoop);
        tweens.push(gsap.to(trackLoop, {
          timeScale: 1.5,
          duration: 0.75,
          repeat: -1,
          repeatDelay: 5 + laneIndex * 0.65,
          yoyo: true,
          ease: "sine.inOut",
          delay: laneIndex * 0.8,
          paused: true,
        }));

        skillLanes[laneIndex].forEach((_, skillIndex) => {
          const copies = lane.querySelectorAll<HTMLElement>(`[data-skill-index="${skillIndex}"] .skill-label-float`);
          const amplitude = 5 + ((laneIndex + skillIndex) % 3) * 2;
          const tilt = (skillIndex % 2 === 0 ? 1 : -1) * (0.55 + laneIndex * 0.12);
          const depthDrift = gsap.fromTo(copies, {
            y: -amplitude,
            rotation: -tilt,
            filter: `blur(${3 + (skillIndex % 3)}px)`,
            opacity: 0.42,
            scale: 0.94,
          }, {
            y: amplitude,
            rotation: tilt,
            filter: "blur(0px)",
            opacity: 1,
            scale: 1,
            duration: 2.4 + ((laneIndex * 3 + skillIndex) % 4) * 0.35,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            paused: true,
          });
          // Corresponding copies share a phase to preserve the loop boundary.
          depthDrift.progress(((skillIndex * 3 + laneIndex) % 7) / 7);
          tweens.push(depthDrift);
        });
      });

      animations.current = tweens;
      sync();

      return () => {
        animations.current = [];
      };
    }, section);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      media.revert();
    };
  }, []);

  return (
    <section ref={root} id="possibilities" className="skills-storm-section" aria-labelledby="skills-storm-title">
      <div className="skills-storm-intro page-gutter">
        <h2 id="skills-storm-title">
          <span className="skills-heading-lead">No hype.</span>
          <span className="skills-heading-main">Just skills that move you forward.</span>
        </h2>
        <p className="skills-storm-subtitle"><em>Learn what matters. Build what’s next.</em></p>
      </div>

      <div className="skill-storm-field" aria-hidden="true">
        {skillLanes.map((skills, laneIndex) => (
          <div className="skill-wind-lane" data-lane={laneIndex + 1} key={laneIndex}>
            <div className="skill-wind-track">
              {[0, 1].map((copy) => (
                <div className="skill-wind-group" key={copy}>
                  {skills.map((skill, skillIndex) => (
                    <span className="skill-label" data-skill-index={skillIndex} key={skill}>
                      <span className={`skill-label-float${featuredSkills.has(skill) ? " skill-label-float--featured" : ""}${emberSkills.has(skill) ? " skill-label-float--ember" : ""}`}>{skill}</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="skill-storm-focus" />
      </div>

      <ul className="skills-static-list" aria-label="Skills and experiences">
        {skillLanes.flat().map((skill) => <li key={skill}>{skill}</li>)}
      </ul>

    </section>
  );
}
