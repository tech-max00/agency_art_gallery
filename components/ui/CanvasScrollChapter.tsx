"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface ChapterNote {
  label: string;
  title: string;
  detail: string;
}

export interface ChapterData {
  id: string;
  number: string;
  index: string;
  src: string;
  eyebrow: string;
  title: string[];
  copy: string;
  notes: ChapterNote[];
}

interface CanvasScrollChapterProps {
  chapter: ChapterData;
  chapterIndex: number;
  totalChapters: number;
  onProgress?: (index: number, progress: number) => void;
  onReady?: (index: number) => void;
}

export function CanvasScrollChapter({
  chapter,
  chapterIndex,
  totalChapters,
  onProgress,
  onReady,
}: CanvasScrollChapterProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const progressTextRef = useRef<HTMLElement>(null);
  const progressBarRef = useRef<HTMLElement>(null);

  const [activeZone, setActiveZone] = useState<"intro" | "one" | "two" | "three" | "outro">("intro");
  const frameCacheRef = useRef<HTMLImageElement[]>([]);
  const isPredecodedRef = useRef(false);
  const tickingRef = useRef(false);
  const currentProgressRef = useRef(0);

  const FRAME_COUNT = 90; // 90 keyframes per chapter

  // Pre-decode video frames into offscreen canvas image cache
  const predecodeFrames = useCallback(() => {
    const video = videoRef.current;
    if (!video || isPredecodedRef.current) return;
    if (video.readyState < 2) return;

    const duration = video.duration || 4;
    const offCanvas = document.createElement("canvas");
    offCanvas.width = video.videoWidth || 1280;
    offCanvas.height = video.videoHeight || 720;
    const offCtx = offCanvas.getContext("2d");
    if (!offCtx) return;

    const frames: HTMLImageElement[] = [];
    let captured = 0;

    const captureNext = (idx: number) => {
      if (idx >= FRAME_COUNT) {
        frameCacheRef.current = frames;
        isPredecodedRef.current = true;
        onReady?.(chapterIndex);
        return;
      }

      const targetTime = (idx / (FRAME_COUNT - 1)) * duration;
      video.currentTime = targetTime;

      const handleSeeked = () => {
        video.removeEventListener("seeked", handleSeeked);
        offCtx.drawImage(video, 0, 0, offCanvas.width, offCanvas.height);
        const img = new Image();
        img.src = offCanvas.toDataURL("image/jpeg", 0.82);
        img.onload = () => {
          captured++;
          if (captured === FRAME_COUNT) {
            frameCacheRef.current = frames;
            isPredecodedRef.current = true;
            onReady?.(chapterIndex);
          }
        };
        frames[idx] = img;
        captureNext(idx + 1);
      };

      video.addEventListener("seeked", handleSeeked, { once: true });
    };

    captureNext(0);
  }, [chapterIndex, onReady]);

  // Fallback mark ready if video loaded metadata
  const handleVideoLoaded = useCallback(() => {
    if (onReady && !isPredecodedRef.current) {
      onReady(chapterIndex);
    }
  }, [chapterIndex, onReady]);

  // Canvas draw function with DPI scaling & cover-fit + mobile zoom
  const drawFrame = useCallback((progress: number) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cw = window.innerWidth;
    const ch = window.innerHeight;

    if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
      canvas.style.width = cw + "px";
      canvas.style.height = ch + "px";
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, cw, ch);

    let source: HTMLImageElement | HTMLVideoElement | null = null;
    const cached = frameCacheRef.current;
    if (cached.length === FRAME_COUNT && isPredecodedRef.current) {
      const idx = Math.min(FRAME_COUNT - 1, Math.floor(progress * FRAME_COUNT));
      source = cached[idx] || null;
    }

    if (!source && video && video.readyState >= 2) {
      const duration = video.duration || 4;
      const targetTime = progress * duration;
      if (Math.abs(video.currentTime - targetTime) > 0.08) {
        video.currentTime = targetTime;
      }
      source = video;
    }

    if (source) {
      const naturalW = (source as HTMLImageElement).naturalWidth || (source as HTMLVideoElement).videoWidth || 1920;
      const naturalH = (source as HTMLImageElement).naturalHeight || (source as HTMLVideoElement).videoHeight || 1080;
      const imgRatio = naturalW / naturalH;
      const canvasRatio = cw / ch;

      let drawW: number;
      let drawH: number;

      if (cw > 768) {
        if (canvasRatio > imgRatio) {
          drawW = cw;
          drawH = cw / imgRatio;
        } else {
          drawH = ch;
          drawW = ch * imgRatio;
        }
      } else {
        // Mobile cover fit + 1.3x zoom
        if (canvasRatio > imgRatio) {
          drawW = cw * 1.3;
          drawH = (cw / imgRatio) * 1.3;
        } else {
          drawH = ch * 1.3;
          drawW = ch * imgRatio * 1.3;
        }
      }

      const drawX = (cw - drawW) / 2;
      const drawY = (ch - drawH) / 2;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(source, drawX, drawY, drawW, drawH);
    }

    ctx.restore();
  }, []);

  // Update on scroll RAF loop
  const updateScroll = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const travel = Math.max(1, section.offsetHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, -rect.top / travel));
    currentProgressRef.current = progress;

    drawFrame(progress);
    onProgress?.(chapterIndex, progress);

    // Direct DOM updates for high-frequency elements
    if (introRef.current) {
      const opacity = Math.max(0, 1 - progress / 0.12);
      introRef.current.style.opacity = String(opacity);
      introRef.current.style.transform = `translateY(${-progress * 60}px)`;
    }

    if (progressTextRef.current) {
      progressTextRef.current.textContent = `${String(Math.round(progress * 100)).padStart(2, "0")}%`;
    }

    if (progressBarRef.current) {
      progressBarRef.current.style.transform = `scaleX(${progress})`;
    }

    // Determine discrete note card zones
    let nextZone: "intro" | "one" | "two" | "three" | "outro" = "intro";
    if (progress < 0.14) {
      nextZone = "intro";
    } else if (progress < 0.38) {
      nextZone = "one";
    } else if (progress < 0.62) {
      nextZone = "two";
    } else if (progress < 0.86) {
      nextZone = "three";
    } else {
      nextZone = "outro";
    }

    setActiveZone((prev) => (prev === nextZone ? prev : nextZone));
  }, [chapterIndex, drawFrame, onProgress]);

  const scheduleUpdate = useCallback(() => {
    if (tickingRef.current) return;
    tickingRef.current = true;
    requestAnimationFrame(() => {
      updateScroll();
      tickingRef.current = false;
    });
  }, [updateScroll]);

  useEffect(() => {
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });
    scheduleUpdate();

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [scheduleUpdate]);

  return (
    <section
      ref={sectionRef}
      className={`scroll-chapter scroll-animation chapter-${chapterIndex + 1}`}
      id={chapter.id}
      data-zone={activeZone}
    >
      {/* Hidden video element used for frame extraction/rendering */}
      <video
        ref={videoRef}
        src={chapter.src}
        preload="auto"
        muted
        playsInline
        className="hidden"
        onLoadedMetadata={handleVideoLoaded}
        onCanPlay={handleVideoLoaded}
      />

      <div
        className="chapter-sticky sticky top-0 h-[100dvh] w-full overflow-hidden bg-[#080808]"
        style={{ willChange: "transform", transform: "translateZ(0)" }}
      >
        {/* Canvas Display */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ willChange: "contents", transform: "translateZ(0)" }}
        />

        {/* Radial Vignette & Gradient Overlays */}
        <div className="chapter-vignette pointer-events-none absolute inset-0 z-10" />

        {/* Stark / ARC / FORM HUD Corner Brackets */}
        <div className="hud-corner hud-top-left pointer-events-none absolute left-6 top-24 z-20 text-[#a33b3f] md:left-10 md:top-28">
          <svg width="24" height="24" viewBox="0 0 26 26" fill="none">
            <path d="M 2 26 L 2 2 L 26 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
          </svg>
        </div>
        <div className="hud-corner hud-top-right pointer-events-none absolute right-6 top-24 z-20 text-[#a33b3f] md:right-10 md:top-28">
          <svg width="24" height="24" viewBox="0 0 26 26" fill="none">
            <path d="M 6 2 L 26 2 L 26 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
          </svg>
        </div>
        <div className="hud-corner hud-bottom-left pointer-events-none absolute bottom-14 left-6 z-20 text-[#a33b3f] md:bottom-16 md:left-10">
          <svg width="24" height="24" viewBox="0 0 26 26" fill="none">
            <path d="M 2 6 L 2 26 L 26 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
          </svg>
        </div>
        <div className="hud-corner hud-bottom-right pointer-events-none absolute bottom-14 right-6 z-20 text-[#a33b3f] md:bottom-16 md:right-10">
          <svg width="24" height="24" viewBox="0 0 26 26" fill="none">
            <path d="M 6 26 L 26 26 L 26 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
          </svg>
        </div>

        {/* HUD Chrome Bar Header */}
        <div className="chapter-chrome pointer-events-none absolute top-24 left-[4.2vw] right-[4.2vw] z-20 flex justify-between font-mono text-[10px] uppercase tracking-[0.28em] text-[#e9e4da]/70">
          <span className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#79272a] shadow-[0_0_8px_#b9464a]" />
            ARC / FORM · LIVE ARCHIVE
          </span>
          <span>{chapter.index}</span>
        </div>

        {/* Chapter Main Intro Text */}
        <div
          ref={introRef}
          className="chapter-intro pointer-events-none absolute left-[4vw] top-[20%] z-20 w-[min(760px,70vw)] transition-opacity duration-150 ease-out"
        >
          <p className="chapter-eyebrow flex items-center gap-3 text-xs tracking-[0.28em] text-[#d7d0c4]">
            <i className="h-1.5 w-1.5 rounded-full bg-[#79272a] shadow-[0_0_12px_#b9464a]" />
            {chapter.eyebrow}
          </p>
          <h1 className="mt-3 font-sans text-5xl font-bold uppercase leading-[0.88] tracking-tighter text-[#e9e4da] md:text-7xl lg:text-8xl">
            {chapter.title.map((line, idx) => (
              <span key={line} className={idx === chapter.title.length - 1 ? "serif italic font-normal text-[#d7d0c4]" : "block"}>
                {line}
              </span>
            ))}
          </h1>
          <p className="chapter-copy mt-6 max-w-[420px] font-serif text-base leading-relaxed text-[#e9e4da]/80">
            {chapter.copy}
          </p>
        </div>

        {/* Annotation & Field Note Cards with Zone Visibility */}
        <div className="chapter-notes pointer-events-none absolute inset-0 z-20">
          {chapter.notes.map(({ label, title, detail }, noteIdx) => {
            const isVisible =
              (noteIdx === 0 && activeZone === "one") ||
              (noteIdx === 1 && activeZone === "two") ||
              (noteIdx === 2 && activeZone === "three");

            return (
              <article
                key={label}
                className={`chapter-note note-${noteIdx + 1} card-surface pointer-events-auto absolute p-6 transition-all duration-400 ease-out ${
                  isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-6 opacity-0 scale-95"
                }`}
              >
                <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-[#79272a]">{label}</span>
                <h2 className="mt-2 font-serif text-2xl font-normal leading-snug text-[#e9e4da]">{title}</h2>
                <p className="mt-2 text-xs uppercase tracking-wider text-[#938d84]">{detail}</p>
              </article>
            );
          })}
        </div>

        {/* Readout Telemetry Footer Bar */}
        <div className="chapter-readout pointer-events-none absolute bottom-[4vh] left-[4vw] right-[4vw] z-20 grid grid-cols-[auto_1fr_auto_auto] items-center gap-5 font-mono text-[10px] uppercase tracking-[0.25em] text-[#e9e4da]/60">
          <span>CHAPTER {chapter.number}</span>
          <div className="h-px w-full overflow-hidden bg-white/15">
            <i
              ref={progressBarRef}
              className="block h-full w-full origin-left bg-[#79272a] transition-transform duration-75 ease-out"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
          <b ref={progressTextRef} className="min-w-[32px] font-normal text-[#e9e4da]">
            00%
          </b>
          <span className="hidden md:inline">SCROLL TO ADVANCE ↓</span>
        </div>
      </div>
    </section>
  );
}
