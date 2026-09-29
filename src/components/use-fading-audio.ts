"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const FADE_IN_MS = 1200;
const FADE_OUT_MS = 1000;

export function useFadingAudio(targetVolume: number, autoStart = true) {
  const ref = useRef<HTMLAudioElement>(null);
  const frame = useRef<number | null>(null);
  const wanted = useRef(false);
  const request = useRef(0);
  const [active, setActive] = useState(false);

  const cancelFade = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
  }, []);

  const fadeTo = useCallback((volume: number, duration: number, onDone?: () => void) => {
    const audio = ref.current;
    if (!audio) return;
    cancelFade();
    const from = audio.volume;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = progress * progress * (3 - 2 * progress);
      audio.volume = from + (volume - from) * eased;
      if (progress < 1) frame.current = requestAnimationFrame(tick);
      else {
        frame.current = null;
        onDone?.();
      }
    };
    frame.current = requestAnimationFrame(tick);
  }, [cancelFade]);

  const play = useCallback(async (fromStart = false) => {
    const audio = ref.current;
    if (!audio) return false;
    const currentRequest = ++request.current;
    wanted.current = true;
    setActive(true);
    cancelFade();
    if (fromStart || audio.ended) audio.currentTime = 0;
    if (audio.paused) {
      audio.volume = 0;
      try {
        await audio.play();
      } catch {
        if (request.current === currentRequest) {
          wanted.current = false;
          setActive(false);
        }
        return false;
      }
    }
    if (request.current === currentRequest && wanted.current) fadeTo(targetVolume, FADE_IN_MS);
    return true;
  }, [cancelFade, fadeTo, targetVolume]);

  const pause = useCallback(() => {
    const audio = ref.current;
    if (!audio) return;
    ++request.current;
    wanted.current = false;
    setActive(false);
    if (audio.paused) {
      cancelFade();
      audio.volume = 0;
      return;
    }
    fadeTo(0, FADE_OUT_MS, () => {
      if (!wanted.current) audio.pause();
    });
  }, [cancelFade, fadeTo]);

  const toggle = useCallback(() => {
    if (wanted.current) pause();
    else void play();
  }, [pause, play]);

  const restart = useCallback(() => {
    const audio = ref.current;
    if (!audio) return;
    if (audio.paused || !wanted.current) {
      void play(true);
      return;
    }
    fadeTo(0, 350, () => {
      if (!wanted.current) return;
      audio.currentTime = 0;
      fadeTo(targetVolume, 900);
    });
  }, [fadeTo, play, targetVolume]);

  const onEnded = useCallback(() => {
    ++request.current;
    wanted.current = false;
    setActive(false);
    cancelFade();
    const audio = ref.current;
    if (audio) {
      audio.volume = 0;
      audio.currentTime = 0;
    }
  }, [cancelFade]);

  const stopOnUnmount = useCallback((audio: HTMLAudioElement) => {
    ++request.current;
    cancelFade();
    audio.pause();
    wanted.current = false;
  }, [cancelFade]);

  useEffect(() => {
    const audio = ref.current;
    if (!audio) return;
    audio.volume = 0;
    if (autoStart) void play();
    return () => stopOnUnmount(audio);
  }, [autoStart, play, stopOnUnmount]);

  const isWanted = useCallback(() => wanted.current, []);
  return { ref, active, play, pause, toggle, restart, onEnded, isWanted };
}
