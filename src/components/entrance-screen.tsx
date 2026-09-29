"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, RotateCcw, Volume2 } from "lucide-react";
import gsap from "gsap";

type Phase = "loading" | "ready" | "armed" | "flash" | "revealed" | "error";

const assets = [
  { src: "/media/clouds-background.mp4", bytes: 699760 },
  { src: "/media/aghori.mp4", bytes: 8862578 },
  { src: "/media/clouds-poster.jpg", bytes: 19389 },
  { src: "/media/hero-poster.jpg", bytes: 222185 },
  { src: "/media/background-music.mp3", bytes: 1998147 },
  { src: "/media/evil-talk.mp3", bytes: 1417647 },
];
const totalBytes = assets.reduce((sum, asset) => sum + asset.bytes, 0);

async function loadAsset(src: string, signal: AbortSignal, onBytes: (count: number) => void) {
  const response = await fetch(src, { signal });
  if (!response.ok) throw new Error(`Unable to load ${src}`);
  if (!response.body) {
    onBytes((await response.arrayBuffer()).byteLength);
    return;
  }
  const reader = response.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onBytes(value.byteLength);
  }
}

export function EntranceScreen({
  onEnableSound,
  onReveal,
  onEntered,
}: {
  onEnableSound: () => Promise<boolean>;
  onReveal: () => void;
  onEntered: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [progress, setProgress] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [soundError, setSoundError] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const exitTimeline = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const context = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro
        .from(".entrance-door", { autoAlpha: 0, scale: 0.9, duration: 1.3, ease: "power2.out" })
        .from(".entrance-door-image", { scale: 1.18, opacity: 0, duration: 1.6, ease: "power2.out" }, 0.2)
        .from(".entrance-kicker, .entrance-title span, .entrance-copy p", { autoAlpha: 0, y: 28, filter: "blur(8px)", duration: 0.9, stagger: 0.14 }, 0.6)
        .from(".entrance-progress-block", { autoAlpha: 0, y: 14, duration: 0.7 }, 1)
        .from(".entrance-top, .entrance-edge-label", { autoAlpha: 0, duration: 0.8, stagger: 0.1 }, 0.2);
    }, screen);
    return () => {
      exitTimeline.current?.kill();
      context.revert();
    };
  }, []);

  useEffect(() => {
    if ((phase === "ready" || phase === "armed" || phase === "error") && button.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo(button.current, { autoAlpha: 0, y: 18, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: "back.out(1.5)" });
    }
  }, [phase]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const started = performance.now();
    let loadedBytes = 0;
    let readyTimer: number | undefined;
    const onBytes = (count: number) => {
      loadedBytes += count;
      setProgress(Math.min(95, Math.floor((loadedBytes / totalBytes) * 95)));
    };
    void Promise.all([
      ...assets.map((asset) => loadAsset(asset.src, controller.signal, onBytes)),
      document.fonts.ready,
    ]).then(() => {
      const remaining = Math.max(0, 1600 - (performance.now() - started));
      readyTimer = window.setTimeout(() => {
        if (controller.signal.aborted) return;
        setProgress(100);
        setPhase("ready");
      }, remaining);
    }).catch(() => {
      if (!controller.signal.aborted) setPhase("error");
    });
    return () => {
      controller.abort();
      if (readyTimer !== undefined) window.clearTimeout(readyTimer);
    };
  }, [attempt]);

  useEffect(() => {
    if (phase === "ready" || phase === "armed" || phase === "error") button.current?.focus({ preventScroll: true });
  }, [phase]);

  async function enableSound() {
    setSoundError(false);
    const started = await onEnableSound();
    if (started) setPhase("armed");
    else setSoundError(true);
  }

  function enter() {
    if (phase !== "armed") return;
    setPhase("flash");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onReveal();
      onEntered();
      return;
    }
    exitTimeline.current = gsap.timeline({ onComplete: onEntered })
      .to(".entrance-door-image", { scale: 1.16, duration: 0.55, ease: "power2.in", overwrite: "auto" }, 0)
      .to(".entrance-stage, .entrance-top, .entrance-edge-label", { scale: 1.035, autoAlpha: 0, filter: "blur(7px)", duration: 0.48, ease: "power3.in" }, 0.08)
      .to(".entrance-white-flash", { autoAlpha: 1, duration: 0.3, ease: "power2.in" }, 0.28)
      .call(() => { onReveal(); setPhase("revealed"); }, undefined, 0.64)
      .to(".entrance-white-flash", { autoAlpha: 0, duration: 0.82, ease: "power2.out" }, 0.68);
  }

  return (
    <div ref={screen} className={`entrance-screen entrance-screen--${phase}`} role="dialog" aria-modal="true" aria-labelledby="entrance-title">
      <div className="entrance-backdrop" aria-hidden="true" />
      <div className="entrance-mist entrance-mist--one" aria-hidden="true" />
      <div className="entrance-mist entrance-mist--two" aria-hidden="true" />
      <div className="entrance-noise" aria-hidden="true" />

      <div className="entrance-top">
        <span className="entrance-brand">trapout<span>.</span></span>
        <span className="entrance-coordinate">AN INVITATION FROM THE UNKNOWN <i /> 001</span>
      </div>

      <span className="entrance-edge-label entrance-edge-label--left" aria-hidden="true">TRAPOUT EXPERIENCE / 001</span>
      <span className="entrance-edge-label entrance-edge-label--right" aria-hidden="true">THE OTHER SIDE IS OPEN</span>
      <div className="entrance-stage">
        <span className="entrance-stage-index">I. THE SUMMONING</span>
        <div className="entrance-door" aria-hidden="true">
          <div className="entrance-door-image" />
        </div>
        <div className="entrance-copy">
          <span className="entrance-kicker"><i /> LISTEN CLOSELY <i /></span>
          <h2 id="entrance-title" className="entrance-title"><span>THE DARK</span><span>IS ALIVE.</span></h2>
          <p>Something is waiting to be let in.</p>
        </div>

      <div className="entrance-bottom">
        <div className="entrance-progress-block">
          <div className="entrance-progress-meta">
            <span aria-live="polite">{phase === "error" ? "THE SIGNAL WAS LOST" : phase === "loading" ? "SUMMONING THE EXPERIENCE" : "THE DOOR IS OPEN"}</span>
            <span>{String(progress).padStart(2, "0")}%</span>
          </div>
          <div className="entrance-progress-track" role="progressbar" aria-label="Loading site media and fonts" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
            <span style={{ width: `${progress}%` }} />
          </div>
          <p>{phase === "error" ? "The signal faltered. Try again." : phase === "loading" ? "Every frame. Every whisper. Almost here." : soundError ? "Sound was blocked. Tap once more." : "Best experienced with sound."}</p>
        </div>
        <div className="entrance-button-slot">
          {phase !== "loading" && phase !== "flash" && phase !== "revealed" && (
            <button
              ref={button}
              className={`entrance-button ${phase === "armed" ? "entrance-button--enter" : ""}`}
              type="button"
              onClick={phase === "error" ? () => { setProgress(0); setPhase("loading"); setAttempt((value) => value + 1); } : phase === "ready" ? enableSound : enter}
            >
              <span>{phase === "error" ? "TRY AGAIN" : phase === "ready" ? "TURN ON THE SOUND" : "TAKE ME IN"}</span>
              <span className="entrance-button-icon">{phase === "error" ? <RotateCcw size={19} aria-hidden="true" /> : phase === "ready" ? <Volume2 size={20} aria-hidden="true" /> : <ArrowUpRight size={21} aria-hidden="true" />}</span>
            </button>
          )}
        </div>
      </div>
      </div>
      <div className="entrance-white-flash" aria-hidden="true" />
    </div>
  );
}
