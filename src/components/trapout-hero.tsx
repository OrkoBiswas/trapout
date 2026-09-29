"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, AudioLines, Menu, Music2, Play, RotateCcw, Volume2, VolumeX, X } from "lucide-react";
import gsap from "gsap";
import { ExperienceDialog, type Panel } from "./experience-dialog";
import { StormEnvironment } from "./storm-environment";
import { SkillsStorm } from "./skills-storm";
import { useFadingAudio } from "./use-fading-audio";
import { EntranceScreen } from "./entrance-screen";

function TrapoutMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 38 38" fill="none" aria-hidden="true" className={className}>
      <path d="M7 7h29l-4.4 8H22l-8 18H5l8-18H3z" fill="currentColor" />
      <path d="m27 20 8-4-6 17h-9z" fill="currentColor" opacity=".56" />
    </svg>
  );
}

export function TrapoutHero() {
  const root = useRef<HTMLDivElement>(null);
  const backgroundVideo = useRef<HTMLVideoElement>(null);
  const heroVideo = useRef<HTMLVideoElement>(null);
  const {
    ref: backgroundMusic,
    active: musicPlaying,
    play: playMusic,
    pause: pauseMusic,
    toggle: toggleMusic,
    isWanted: musicWanted,
  } = useFadingAudio(0.22, false);
  const {
    ref: voiceMusic,
    active: voicePlaying,
    play: playVoice,
    pause: pauseVoice,
    toggle: toggleVoice,
    restart: restartVoice,
    onEnded: onVoiceEnded,
    isWanted: voiceWanted,
  } = useFadingAudio(0.42, false);
  const menuToggle = useRef<HTMLButtonElement>(null);
  const [entered, setEntered] = useState(false);
  const [entranceComplete, setEntranceComplete] = useState(false);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const anyAudioPlaying = musicPlaying || voicePlaying;

  useEffect(() => {
    if (!entered) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      timeline
        .from(".site-header, .audio-dock", { autoAlpha: 0, duration: 0.4 })
        .from(".hero-eyebrow, .hero-edition", { autoAlpha: 0, duration: 0.35 }, 0.05)
        .from(".headline-invocation", { autoAlpha: 0, duration: 0.4 }, 0.08)
        .from(".headline-main", { autoAlpha: 0, duration: 0.45 }, 0.12)
        .from(".hero-copy, .hero-film-note", { autoAlpha: 0, duration: 0.35, stagger: 0.04 }, 0.18)
        .from(".hero-bottom, .hero-colophon", { autoAlpha: 0, duration: 0.35, stagger: 0.04 }, 0.22)
        .from(".site-media, .hero-media", { autoAlpha: 0, duration: 0.45, ease: "power2.out" }, 0);
    }, root);

    return () => media.revert();
  }, [entered]);

  useEffect(() => {
    const videos = [backgroundVideo.current, heroVideo.current].filter(
      (element): element is HTMLVideoElement => element !== null,
    );
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPlayback = () => {
      const shouldPause = motionPreference.matches || document.hidden;
      videos.forEach((current) => {
        if (shouldPause) current.pause();
        else void current.play().catch(() => {});
      });
    };
    syncPlayback();
    motionPreference.addEventListener("change", syncPlayback);
    document.addEventListener("visibilitychange", syncPlayback);
    return () => {
      motionPreference.removeEventListener("change", syncPlayback);
      document.removeEventListener("visibilitychange", syncPlayback);
    };
  }, []);

  const openPanel = (next: Panel) => {
    if (menuOpen) menuToggle.current?.focus();
    setMenuOpen(false);
    setPanel(next);
  };

  const toggleAllAudio = () => {
    if (musicWanted() || voiceWanted()) {
      pauseMusic();
      pauseVoice();
    } else {
      void playMusic();
      void playVoice();
    }
  };

  const enableEntranceSound = async () => {
    const [musicStarted, voiceStarted] = await Promise.all([playMusic(), playVoice()]);
    if (musicStarted && voiceStarted) return true;
    pauseMusic();
    pauseVoice();
    return false;
  };

  return (
    <div ref={root} className="trapout-site">
      <a href="#main-content" className="skip-link" inert={!entered}>Skip to content</a>
      <audio ref={backgroundMusic} src="/media/background-music.mp3" loop preload="auto" />
      <audio ref={voiceMusic} src="/media/evil-talk.mp3" preload="auto" onEnded={onVoiceEnded} />

      <div className="site-background" aria-hidden="true">
        <div className="site-media">
          <video
            ref={backgroundVideo}
            className="site-video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/media/clouds-poster.jpg"
          >
            <source src="/media/clouds-background.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="site-shade" />
        <div className="site-ember" />
        <div className="site-grain" />
        <StormEnvironment active />
      </div>

      <section className="hero" aria-label="Trapout creative studio" inert={!entered} aria-hidden={!entered}>
        <div className="hero-media" aria-hidden="true">
          <video
            ref={heroVideo}
            className="hero-video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/media/hero-poster.jpg"
          >
            <source src="/media/aghori.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="hero-viewfinder" aria-hidden="true"><span /><span /><span /><span /></div>
        <header className="site-header page-gutter">
          <Link href="/" className="wordmark" aria-label="Trapout home">
            <TrapoutMark className="brand-symbol" />
            <span>trapout<span className="wordmark-period">.</span></span>
          </Link>

          <nav className="desktop-nav" aria-label="Main navigation">
            <button onClick={() => openPanel("reel")}><span className="nav-number" aria-hidden="true">01</span> Films</button>
            <button onClick={() => openPanel("courses")}><span className="nav-number" aria-hidden="true">02</span> Academy <span className="nav-dot" /></button>
            <button onClick={() => openPanel("studio")}><span className="nav-number" aria-hidden="true">03</span> Studio</button>
          </nav>

          <button className="header-cta" onClick={() => openPanel("project")}>Let’s make something <span><ArrowUpRight size={17} /></span></button>
          <button ref={menuToggle} className="mobile-menu-toggle glass" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {menuOpen && (
            <nav id="mobile-navigation" className="mobile-nav glass" aria-label="Mobile navigation">
              <button onClick={() => openPanel("reel")}>Films <ArrowUpRight size={18} /></button>
              <button onClick={() => openPanel("courses")}>Academy <ArrowUpRight size={18} /></button>
              <button onClick={() => openPanel("studio")}>Studio <ArrowUpRight size={18} /></button>
              <button onClick={() => openPanel("project")}>Let’s talk <ArrowUpRight size={18} /></button>
            </nav>
          )}
        </header>

        <main id="main-content" className="hero-main page-gutter">
          <p className="hero-eyebrow"><span className="status-light" />Independent minds. Extraordinary worlds.</p>
          <p className="hero-edition">Creative studio & academy<span>Films / Motion / Imagination</span></p>

          <div className="hero-content">
            <h1 className="hero-headline" aria-label="Summon the unseen.">
              <span className="headline-invocation" aria-hidden="true">Summon<br /><span className="headline-the">the</span></span>
              <span className="headline-main" aria-hidden="true">
                UNSEEN<span className="headline-period">.</span>
              </span>
            </h1>
            <p className="hero-copy">For the ideas that won’t sit still.<br />And the people who bring them to life.</p>
          </div>

          <aside className="hero-film-note" aria-label="Featured film">
            <span className="film-note-kicker"><span />A TRAPOUT ORIGINAL</span>
            <button className="showreel-button" onClick={() => openPanel("reel")} aria-label="Watch film">
              <span className="play-orbit" aria-hidden="true"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="56" /></svg><Play size={23} fill="currentColor" strokeWidth={1} /></span>
              <span className="showreel-label">Step into the unseen <ArrowUpRight size={15} aria-hidden="true" /></span>
            </button>
            <p>Some things are better<br /><em>felt than explained.</em></p>
          </aside>
        </main>

        <div className="hero-bottom page-gutter">
          <div className="academy-intro"><span className="academy-index" aria-hidden="true">↗</span><div><span className="academy-kicker">THE NEXT CHAPTER IS YOURS</span><p>Don’t just watch. <span>Create.</span></p></div></div>
          <button className="primary-button" onClick={() => openPanel("courses")}>Enter the academy <span><ArrowUpRight size={20} aria-hidden="true" /></span></button>
        </div>
        <div className="hero-colophon page-gutter">
          <a className="explore-link" href="#possibilities"><ArrowDown size={14} aria-hidden="true" /><span>SCROLL TO DISCOVER</span></a>
          <span className="hero-disciplines">FILMMAKING <i /> MOTION DESIGN <i /> CREATIVE EDUCATION</span>
        </div>
      </section>

      <div inert={!entered} aria-hidden={!entered}><SkillsStorm /></div>
      <div className="footer-shell page-gutter" inert={!entered} aria-hidden={!entered}>
        <footer className="site-footer"><Link href="/" className="footer-logo">trapout.</Link><span>Stay curious. Make a little noise.</span><span>© {new Date().getFullYear()} Trapout</span></footer>
      </div>

      <ExperienceDialog panel={panel} onClose={() => setPanel(null)} />
      <div className="audio-dock" role="group" aria-label="Background audio controls" inert={!entered} aria-hidden={!entered}>
        <button className="audio-dock-button" type="button" onClick={toggleMusic} aria-label={musicPlaying ? "Pause background music" : "Play background music"} aria-pressed={musicPlaying} data-tip="MUSIC">
          <Music2 size={18} strokeWidth={1.7} aria-hidden="true" />
        </button>
        <button className="audio-dock-button" type="button" onClick={toggleVoice} aria-label={voicePlaying ? "Pause voice track" : "Play voice track"} aria-pressed={voicePlaying} data-tip="VOICE">
          <AudioLines size={18} strokeWidth={1.7} aria-hidden="true" />
        </button>
        <button className="audio-dock-button" type="button" onClick={restartVoice} aria-label="Restart voice track from beginning" data-tip="REPLAY VOICE">
          <RotateCcw size={18} strokeWidth={1.7} aria-hidden="true" />
        </button>
        <button className="audio-dock-button audio-dock-master" type="button" onClick={toggleAllAudio} aria-label={anyAudioPlaying ? "Turn off all audio" : "Play both audio tracks"} data-tip={anyAudioPlaying ? "ALL OFF" : "PLAY BOTH"}>
          {anyAudioPlaying ? <VolumeX size={18} strokeWidth={1.7} aria-hidden="true" /> : <Volume2 size={18} strokeWidth={1.7} aria-hidden="true" />}
        </button>
      </div>
      {!entranceComplete && <EntranceScreen onEnableSound={enableEntranceSound} onReveal={() => setEntered(true)} onEntered={() => setEntranceComplete(true)} />}
    </div>
  );
}
