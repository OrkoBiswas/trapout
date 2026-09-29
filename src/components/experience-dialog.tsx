"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowDownToLine, ArrowUpRight, Check, ChevronDown, Copy, X } from "lucide-react";

export type Panel = "reel" | "courses" | "studio" | "project";

const coursePreviews = [
  {
    title: "Editing with intention",
    description: "Find the story between the cuts.",
    lessons: ["Building a story from raw footage", "Pacing, rhythm, and the invisible cut", "Sound design that gives a scene feeling"],
    number: "01",
  },
  {
    title: "The motion mindset",
    description: "Make every movement mean something.",
    lessons: ["Timing, spacing, and natural movement", "Typography with personality", "Turning a brand idea into a motion system"],
    number: "02",
  },
  {
    title: "Cinematic worldbuilding",
    description: "Create a world people want to get lost in.",
    lessons: ["Moodboards, treatments, and visual direction", "Composition, light, and visual continuity", "Color and finishing for a cohesive film"],
    number: "03",
  },
];

const titles: Record<Panel, string> = {
  reel: "A little outside the ordinary.",
  courses: "Learn to make your mark.",
  studio: "Your vision. In motion.",
  project: "Something good starts here.",
};

const primaryButton = "inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-[#c34036]/50 bg-linear-to-br from-[#8c2c24]/85 to-[#321615]/90 px-6 py-3 text-sm font-medium text-[#f1ede5] shadow-[inset_0_1px_0_rgba(255,220,205,0.12)] backdrop-blur-xl transition hover:border-[#c34036]/80 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c34036]";
const fieldClass = "mt-2 w-full rounded-xl border border-white/15 bg-white/[0.035] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/50 focus:bg-white/[0.06]";

function saveBrief(brief: string) {
  const url = URL.createObjectURL(new Blob([brief], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "trapout-project-brief.txt";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function ProjectForm() {
  const [brief, setBrief] = useState("");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  function submitBrief(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const nextBrief = [
      "TRAPOUT — PROJECT BRIEF",
      "",
      `Name: ${String(data.get("name") ?? "").trim()}`,
      `Email: ${String(data.get("email") ?? "").trim()}`,
      `Project type: ${String(data.get("type") ?? "")}`,
      "",
      "The idea:",
      String(data.get("message") ?? "").trim(),
    ].join("\n");
    setBrief(nextBrief);
    setCopyStatus("idle");
    saveBrief(nextBrief);
  }

  async function copyBrief() {
    try {
      await navigator.clipboard.writeText(brief);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  return (
    <>
      <p className="mb-7 max-w-lg text-sm leading-6 text-white/55">Tell us what you have in mind. Create a project brief to save locally and share when you’re ready.</p>
      <form onSubmit={submitBrief} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-xs text-white/70">Your name
            <input className={fieldClass} name="name" autoComplete="name" placeholder="Alex Morgan" required maxLength={120} pattern=".*\S.*" />
          </label>
          <label className="block text-xs text-white/70">Email address
            <input className={fieldClass} name="email" type="email" autoComplete="email" placeholder="alex@yourstudio.com" required maxLength={254} />
          </label>
        </div>
        <label className="block text-xs text-white/70">What are we making?
          <select name="type" className={`${fieldClass} scheme-dark`} defaultValue="" required>
            <option value="" disabled>Select a project type</option>
            <option>Video production</option>
            <option>Motion design</option>
            <option>Brand film</option>
            <option>A little of everything</option>
          </select>
        </label>
        <label className="block text-xs text-white/70">The idea
          <textarea className={`${fieldClass} min-h-28 resize-y`} name="message" rows={4} placeholder="The vision, the audience, the deadline. Start anywhere." required minLength={10} maxLength={5000} />
        </label>
        <div className="flex flex-wrap items-center gap-4 pt-1">
          <button type="submit" className={primaryButton}>Save project brief <ArrowDownToLine size={16} aria-hidden="true" /></button>
          <span className="text-xs leading-5 text-white/40">A text file, saved to your device.<br />Your details are not sent anywhere.</span>
        </div>
      </form>
      {brief && (
        <div className="mt-6 rounded-2xl border border-white/15 bg-white/[0.035] p-5">
          <p className="text-sm text-white/80" role="status">Download started. Your brief stays on this device.</p>
          <div className="mt-3 flex flex-wrap gap-5">
            <button type="button" onClick={() => saveBrief(brief)} className="inline-flex items-center gap-2 text-xs text-white/60 transition hover:text-white"><ArrowDownToLine size={14} aria-hidden="true" />Download again</button>
            <button type="button" onClick={copyBrief} className="inline-flex items-center gap-2 text-xs text-white/60 transition hover:text-white">{copyStatus === "copied" ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}{copyStatus === "copied" ? "Copied to clipboard" : "Copy brief"}</button>
          </div>
          {copyStatus === "error" && <p className="mt-3 text-xs text-white/60" role="status">Clipboard access is unavailable. Use the downloaded text file.</p>}
        </div>
      )}
    </>
  );
}

export function ExperienceDialog({ panel, onClose }: { panel: Panel | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const [showProject, setShowProject] = useState(false);
  const activePanel = panel === "studio" && showProject ? "project" : panel;

  useEffect(() => {
    if (showProject && panel === "studio") headingRef.current?.focus({ preventScroll: true });
  }, [showProject, panel]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (panel && !dialog.open) {
      returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
    } else if (!panel && dialog.open) {
      dialog.close();
    }
  }, [panel]);

  useEffect(() => {
    if (!panel) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [panel]);

  function closeDialog() {
    dialogRef.current?.close();
  }

  function handleClose() {
    setShowProject(false);
    onClose();
    returnFocusRef.current?.focus({ preventScroll: true });
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="experience-dialog-title"
      onClose={handleClose}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog();
      }}
      className="fixed inset-0 m-auto max-h-[min(90dvh,900px)] w-[calc(100%_-_2rem)] max-w-3xl overflow-y-auto overscroll-contain rounded-[28px] border border-white/15 bg-[#080e11]/95 p-0 text-white shadow-[0_30px_120px_rgba(0,0,0,0.7)] backdrop-blur-3xl backdrop:bg-black/70 backdrop:backdrop-blur-md"
    >
      <div className="relative px-6 py-8 sm:p-10">
        <button type="button" onClick={closeDialog} aria-label="Close dialog" className="absolute right-5 top-5 flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"><X size={18} aria-hidden="true" /></button>
        <p className="mb-5 pr-12 text-[10px] font-medium uppercase tracking-[0.24em] text-[#c34036]/80">Trapout / {activePanel === "reel" ? "The film" : activePanel === "courses" ? "The classroom" : activePanel === "project" ? "The next chapter" : "The studio"}</p>
        <h2 ref={headingRef} tabIndex={-1} id="experience-dialog-title" className="mb-6 max-w-xl pr-8 text-[40px] font-normal leading-[1.1] tracking-normal sm:text-[52px]">{activePanel ? titles[activePanel] : "Welcome to Trapout."}</h2>

        {activePanel === "reel" && (
          <>
            <video className="max-h-[58dvh] w-full rounded-2xl bg-black object-contain" src="/media/trapout-reel.mp4" poster="/media/hero-poster.jpg" controls autoPlay muted loop playsInline preload="metadata" aria-label="Trapout cinematic showreel" />
            <div className="mt-5 flex items-center justify-between gap-4 text-[11px] text-white/45"><span>An exploration in light, form, and motion.</span><span className="shrink-0 uppercase tracking-[0.18em]">Sound optional</span></div>
          </>
        )}

        {activePanel === "courses" && (
          <>
            <p className="mb-7 max-w-lg text-sm leading-6 text-white/55">A new space for curious editors, motion designers, and visual storytellers. Take a look at what’s coming.</p>
            <div className="space-y-3">
              {coursePreviews.map((course) => (
                <details key={course.number} className="group rounded-2xl border border-white/10 bg-white/[0.025] open:bg-white/[0.045]">
                  <summary className="flex cursor-pointer list-none items-center gap-4 p-5 [&::-webkit-details-marker]:hidden">
                    <span className="self-start pt-1 text-[10px] text-white/30">{course.number}</span>
                    <span className="flex-1"><span className="mb-2 block text-[9px] uppercase tracking-[0.18em] text-white/40">Coming soon</span><span className="jolly-lodger-regular block text-[28px] leading-tight tracking-normal">{course.title}</span><span className="mt-1 block text-xs leading-5 text-white/45">{course.description}</span></span>
                    <ChevronDown size={17} aria-hidden="true" className="shrink-0 text-white/40 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="border-t border-white/[0.07] px-5 py-5 sm:pl-12"><p className="mb-3 text-[10px] uppercase tracking-[0.15em] text-white/35">Curriculum preview</p><ul className="space-y-2 text-sm leading-6 text-white/65">{course.lessons.map((lesson) => <li key={lesson} className="flex gap-3"><span className="text-white/25" aria-hidden="true">↗</span>{lesson}</li>)}</ul></div>
                </details>
              ))}
            </div>
            <p className="mt-5 text-xs leading-5 text-white/35">Courses are in development. Enrollment is not open yet.</p>
          </>
        )}

        {activePanel === "studio" && (
          <>
            <p className="mb-8 max-w-lg text-sm leading-6 text-white/55">We turn a spark of an idea into something you can’t scroll past. From the first frame to the final feeling.</p>
            <div className="mb-8 divide-y divide-white/10 border-y border-white/10">
              {[
                ["01", "Video production", "Concept, direction, editing, and a finishing touch that makes every frame count."],
                ["02", "Motion design", "Expressive animation, title sequences, and visual identities built to move."],
                ["03", "Brand films", "A clear story, a distinct point of view, and a film that feels unmistakably yours."],
              ].map(([number, title, description]) => <div key={number} className="grid grid-cols-[24px_1fr] gap-4 py-6 sm:grid-cols-[24px_160px_1fr]"><span className="pt-1 text-[10px] text-white/30">{number}</span><h3 className="text-2xl font-normal leading-tight tracking-normal">{title}</h3><p className="col-start-2 text-sm leading-6 text-white/45 sm:col-start-auto">{description}</p></div>)}
            </div>
            <button type="button" onClick={() => setShowProject(true)} className={primaryButton}>Let’s make something <ArrowUpRight size={17} aria-hidden="true" /></button>
          </>
        )}

        {activePanel === "project" && <ProjectForm />}
      </div>
    </dialog>
  );
}
