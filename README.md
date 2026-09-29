# Trapout

A cinematic, responsive landing page for a video and motion studio with a creative academy. Built with Next.js App Router, React, TypeScript, Tailwind CSS, and GSAP.

## Run locally

```sh
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000).

```sh
npm run lint
npm run typecheck
npm run build
npm start
```

## The experience

- An editorial hero frames the centered film with an oversized Jolly Lodger headline, warm ember accents, numbered navigation, a circular film launcher, and a full-width academy call to action.
- GSAP entrance animation and atmospheric rain, drifting mist, and slow cloud illumination, with scoped cleanup and reduced-motion support.
- A single fixed, muted dark-clouds video fills the viewport behind the entire page using `object-fit: cover`, with native looping and a poster fallback. Transparent sections keep the clouds visible while scrolling; different screen proportions crop the edges without stretching the footage.
- The looping Aghori video sits above the clouds inside the hero only. A transparent bottom gradient mask blends the hero footage into the fixed clouds beneath it; the hero video scrolls away with its section.
- A centered, cinematic doorway entrance streams the site's video, image, and audio assets and waits for its fonts before opening. GSAP reveals the figure and title, opens the doorway shutters, then times the "Take me in" white flash with the hero reveal. Visitors turn on both sound tracks before entering.
- A floating icon dock keeps independent music and voice controls available across the page, with a button to restart the voice from the beginning and another to turn both tracks off or back on. Music loops; the voice plays once. Both tracks fade smoothly when started, paused, or stopped, and the voice sits slightly above the quieter music bed in the mix.
- The skills section presents "No hype. Just skills that move you forward." with plain Jolly Lodger text carried left to right in four seamless, brisk wind currents. All labels share the same font, size, and color without boxes or borders. It includes a movement pause control and a static skill list for reduced-motion preferences.
- Mobile navigation and native modal dialogs with keyboard support, focus restoration, and background scroll locking.
- Academy curriculum previews, studio service details, and a project brief builder that downloads or copies a text file locally.

The universal background is `public/media/clouds-background.mp4`, a fast-start copy of the supplied Moving Dark Clouds video with its audio removed. Its fallback still is `public/media/clouds-poster.jpg`. The original source is preserved.

The original `aghori.mp4` is served as `public/media/aghori.mp4` for the hero overlay. Watch film uses `public/media/trapout-reel.mp4` with `public/media/hero-poster.jpg` as its poster. Automatic playback pauses for reduced motion, hidden tabs, and open dialogs. The motion control pauses both background videos and the storm effects; reduced-motion preferences disable the decorative weather.

## Customize

- `src/components/trapout-hero.tsx`: hero copy, navigation, CTA labels, and GSAP animation.
- `src/components/entrance-screen.tsx` and its CSS: media-loading progress, sound handoff, and portal reveal.
- `src/components/trapout-hero.css`: hero composition, video positioning, navigation, controls, and responsive layout.
- `src/app/globals.css`: shared styles, cloud background, skills section, and reduced-motion preferences.
- `src/components/experience-dialog.tsx`: sample curriculum content, studio services, and the brief builder.
- `src/components/storm-environment.tsx` and its CSS: rain, mist, and cloud illumination.
- `src/components/skills-storm.tsx`: skill labels, left-to-right loops, floating movement, and motion controls.
- `src/app/layout.tsx`: page metadata and fonts.

Course titles and curricula are preview content marked as coming soon. Checkout, enrollment, email delivery, and a CMS are not connected. The brief form saves to the visitor's device and does not submit personal information to a server.

Implementation references: [Next.js](https://nextjs.org/docs/app/getting-started), [Tailwind CSS](https://tailwindcss.com/docs/installation/framework-guides/nextjs), and [GSAP matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()).
