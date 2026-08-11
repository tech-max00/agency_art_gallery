"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

const assetPrefix = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const sequences = {
  hero: {
    directory: "/art/hero_all_240_video_frames/video_frames",
    frameCount: 240,
  },
  exhibition: {
    directory: "/art/exhibition_video_151_frames/second_video_frames",
    frameCount: 151,
  },
  artist: {
    directory: "/art/artist_video_151_frames/third_video_frames",
    frameCount: 151,
  },
} as const;

const frameUrl = (directory: string, frame: number) =>
  `${assetPrefix}${directory}/frame${String(frame).padStart(3, "0")}.jpg`;

type CachedFrame = {
  source: CanvasImageSource;
  width: number;
  height: number;
  close?: () => void;
};

type ScrollFramesProps = {
  id?: string;
  className: string;
  directory: string;
  frameCount: number;
  label: string;
  fit?: "cover" | "contain";
  children: ReactNode;
  onReady: () => void;
};

function ScrollFrames({ id, className, directory, frameCount, label, fit = "cover", children, onReady }: ScrollFramesProps) {
  const chapterRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readoutRef = useRef<HTMLElement>(null);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    const chapter = chapterRef.current;
    const canvas = canvasRef.current;
    if (!chapter || !canvas) return;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    const cache = new Map<number, CachedFrame>();
    const pending = new Set<number>();
    const maxCachedFrames = 12;
    let loadingCount = 0;
    let targetFrame = 0;
    let displayedFrame = 0;
    let renderedFrame = -1;
    let nearViewport = false;
    let disposed = false;
    let readySent = false;
    let animationFrame = 0;
    let warmCursor = 0;
    let warmTimer = 0;

    const closeFrame = (frame: CachedFrame | undefined) => frame?.close?.();

    const trimCache = (protectedFrame: number) => {
      while (cache.size > maxCachedFrames) {
        const oldest = cache.keys().next().value as number | undefined;
        if (oldest === undefined) break;
        if (oldest === protectedFrame) {
          const protectedAsset = cache.get(oldest);
          cache.delete(oldest);
          if (protectedAsset) cache.set(oldest, protectedAsset);
          continue;
        }
        closeFrame(cache.get(oldest));
        cache.delete(oldest);
      }
    };

    const sizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const density = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(rect.width * density));
      const height = Math.max(1, Math.round(rect.height * density));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    };

    const drawAsset = (asset: CachedFrame) => {
      sizeCanvas();
      const scale = fit === "contain"
        ? Math.min(canvas.width / asset.width, canvas.height / asset.height)
        : Math.max(canvas.width / asset.width, canvas.height / asset.height);
      const width = asset.width * scale;
      const height = asset.height * scale;
      const x = (canvas.width - width) / 2;
      const y = (canvas.height - height) / 2;
      context.fillStyle = "#050505";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(asset.source, x, y, width, height);
    };

    const drawClosestFrame = (requestedFrame: number) => {
      let closestIndex = -1;
      let closestDistance = Number.POSITIVE_INFINITY;
      for (const index of cache.keys()) {
        const distance = Math.abs(index - requestedFrame);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      }
      if (closestIndex < 0 || closestIndex === renderedFrame) return;
      const asset = cache.get(closestIndex);
      if (!asset) return;
      cache.delete(closestIndex);
      cache.set(closestIndex, asset);
      drawAsset(asset);
      renderedFrame = closestIndex;
      if (readoutRef.current) readoutRef.current.textContent = String(closestIndex + 1).padStart(3, "0");
    };

    const decodeFrame = async (index: number): Promise<CachedFrame> => {
      const response = await fetch(frameUrl(directory, index + 1), { cache: "force-cache" });
      if (!response.ok) throw new Error(`Frame ${index + 1} failed to load`);
      const blob = await response.blob();
      if ("createImageBitmap" in window) {
        const bitmap = await createImageBitmap(blob);
        return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
      }
      const objectUrl = URL.createObjectURL(blob);
      const image = new Image();
      image.decoding = "async";
      image.src = objectUrl;
      await image.decode();
      URL.revokeObjectURL(objectUrl);
      return { source: image, width: image.naturalWidth, height: image.naturalHeight };
    };

    const requestFrame = (index: number) => {
      const safeIndex = Math.max(0, Math.min(frameCount - 1, index));
      if (disposed || cache.has(safeIndex) || pending.has(safeIndex) || loadingCount >= 4) return;
      pending.add(safeIndex);
      loadingCount += 1;
      void decodeFrame(safeIndex)
        .then((asset) => {
          if (disposed) {
            closeFrame(asset);
            return;
          }
          cache.set(safeIndex, asset);
          trimCache(Math.round(displayedFrame));
          if (!readySent) {
            readySent = true;
            onReadyRef.current();
          }
          drawClosestFrame(Math.round(displayedFrame));
        })
        .catch(() => chapter.setAttribute("data-frame-error", String(safeIndex + 1)))
        .finally(() => {
          pending.delete(safeIndex);
          loadingCount -= 1;
        });
    };

    const warmNextFrame = async () => {
      if (disposed || !nearViewport || warmCursor >= frameCount) return;
      const index = warmCursor;
      warmCursor += 1;
      try {
        const response = await fetch(frameUrl(directory, index + 1), { cache: "force-cache" });
        if (response.ok) await response.arrayBuffer();
      } catch {
        // On-demand loading remains authoritative when background warming is unavailable.
      }
      if (!disposed && nearViewport) warmTimer = window.setTimeout(warmNextFrame, 8);
    };

    const updateTarget = () => {
      const rect = chapter.getBoundingClientRect();
      const travel = Math.max(1, rect.height - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / travel));
      chapter.style.setProperty("--frame-progress", progress.toFixed(4));
      targetFrame = progress * (frameCount - 1);
    };

    const tick = () => {
      if (disposed || !nearViewport) {
        animationFrame = 0;
        return;
      }
      updateTarget();
      const difference = targetFrame - displayedFrame;
      displayedFrame = Math.abs(difference) < 0.08
        ? targetFrame
        : displayedFrame + Math.max(-4, Math.min(4, difference * 0.22));
      const nextFrame = Math.round(displayedFrame);
      requestFrame(nextFrame);
      const direction = difference >= 0 ? 1 : -1;
      requestFrame(nextFrame + direction);
      requestFrame(nextFrame + direction * 2);
      requestFrame(nextFrame - direction);
      drawClosestFrame(nextFrame);
      animationFrame = window.requestAnimationFrame(tick);
    };

    const start = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(tick);
      if (!warmTimer) warmTimer = window.setTimeout(warmNextFrame, 300);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        nearViewport = entry.isIntersecting;
        if (nearViewport) {
          updateTarget();
          start();
        } else {
          window.clearTimeout(warmTimer);
          warmTimer = 0;
        }
      },
      { rootMargin: "140% 0px" },
    );

    const handleResize = () => {
      sizeCanvas();
      const asset = cache.get(renderedFrame);
      if (asset) drawAsset(asset);
    };

    requestFrame(0);
    observer.observe(chapter);
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      disposed = true;
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(warmTimer);
      cache.forEach(closeFrame);
      cache.clear();
    };
  }, [directory, fit, frameCount]);

  return (
    <div className={`frame-chapter ${className}`} id={id} ref={chapterRef}>
      <div className="frame-sticky">
        <canvas ref={canvasRef} className="frame-canvas" role="img" aria-label={label} />
        <div className="frame-vignette" aria-hidden="true" />
        {children}
        <div className="frame-counter" aria-hidden="true">
          <span>FRAME</span><b ref={readoutRef}>001</b><i>/</i><span>{String(frameCount).padStart(3, "0")}</span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const [menu, setMenu] = useState(false);
  const readySequences = useRef(new Set<string>());
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const markSequenceReady = useCallback((name: string) => {
    readySequences.current.add(name);
    if (readySequences.current.size === 3) window.setTimeout(() => setLoaded(true), 300);
  }, []);

  useEffect(() => {
    const fallback = window.setTimeout(() => setLoaded(true), 9000);
    return () => window.clearTimeout(fallback);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    let animationFrame = 0;
    let mouseX = 0.5;
    let mouseY = 0.5;
    const resize = () => {
      const density = Math.min(devicePixelRatio, 1.5);
      canvas.width = innerWidth * density;
      canvas.height = innerHeight * density;
      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;
      context.setTransform(density, 0, 0, density, 0, 0);
    };
    const move = (event: PointerEvent) => {
      mouseX = event.clientX / innerWidth;
      mouseY = event.clientY / innerHeight;
    };
    const draw = (time: number) => {
      context.clearRect(0, 0, innerWidth, innerHeight);
      const x = innerWidth * (0.62 + (mouseX - 0.5) * 0.05);
      const y = innerHeight * (0.42 + (mouseY - 0.5) * 0.05);
      const glow = context.createRadialGradient(x, y, 0, x, y, Math.min(innerWidth, innerHeight) * 0.44);
      glow.addColorStop(0, "rgba(246,238,224,.08)");
      glow.addColorStop(1, "rgba(0,0,0,0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, innerWidth, innerHeight);
      context.strokeStyle = "rgba(242,235,220,.026)";
      for (let index = 0; index < 5; index += 1) {
        context.beginPath();
        const radius = 110 + index * 38 + Math.sin(time / 1800 + index) * 8;
        context.ellipse(x, y, radius * 1.3, radius, time / 12000 + index * 0.28, 0, Math.PI * 2);
        context.stroke();
      }
      animationFrame = requestAnimationFrame(draw);
    };
    resize();
    addEventListener("resize", resize);
    addEventListener("pointermove", move);
    animationFrame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animationFrame);
      removeEventListener("resize", resize);
      removeEventListener("pointermove", move);
    };
  }, []);

  return (
    <main className={loaded ? "site loaded" : "site"}>
      <div className="loader" aria-hidden={loaded}>
        <div className="ink-orb"><i /><i /><i /></div>
        <div className="loader-mark"><span>ARC</span><b>/</b><span>FORM</span></div>
        <div className="loader-line"><em /></div>
        <p>LOADING THE FRAME ARCHIVE</p>
      </div>

      <canvas ref={canvasRef} className="ambient" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      <header>
        <a className="brand" href="#top" aria-label="ARC FORM home"><span>ARC</span><i>/</i><span>FORM</span></a>
        <nav className={menu ? "open" : ""}>
          <a href="#exhibitions" onClick={() => setMenu(false)}>Exhibitions</a>
          <a href="#artists" onClick={() => setMenu(false)}>Artists</a>
          <a href="#journal" onClick={() => setMenu(false)}>Journal</a>
          <a href="#visit" onClick={() => setMenu(false)}>Visit</a>
        </nav>
        <button className="menu" onClick={() => setMenu(!menu)} aria-label="Toggle menu" aria-expanded={menu}><i /><i /></button>
      </header>

      <ScrollFrames
        id="top"
        className="hero"
        directory={sequences.hero.directory}
        frameCount={sequences.hero.frameCount}
        label="Black and crystal sculpture moving through the gallery"
        onReady={() => markSequenceReady("hero")}
      >
        <div className="media-shade" />
        <div className="hero-copy">
          <p className="eyebrow">Contemporary Art · Accra / London</p>
          <h1><span>ART</span><span>BEYOND</span><span>THE <em>FRAME.</em></span></h1>
          <div className="hero-bottom">
            <p>ARC / FORM is an independent gallery for radical material, moving image and ideas that refuse containment.</p>
            <a className="circle-link" href="#exhibitions"><span>Explore<br />current show</span><b>↘</b></a>
          </div>
        </div>
        <div className="hero-index"><span>SCROLL FILM</span><b>01—03</b></div>
        <div className="scroll-hint"><i /> SCROLL TO ADVANCE THE FRAMES</div>
      </ScrollFrames>

      <section className="manifesto reveal">
        <div className="section-tag"><span>01</span> / MANIFESTO</div>
        <p>We create encounters between <em>matter</em>, <strong>memory</strong> and the body—exhibitions that unfold in space, sound and time.</p>
        <div className="manifesto-foot"><span>EST. 2018</span><span>5°33′N 0°12′W</span></div>
      </section>

      <section className="shows" id="exhibitions">
        <div className="shows-head">
          <div className="section-tag"><span>02</span> / CURRENT EXHIBITION</div>
          <h2>IN THE<br /><em>GALLERY</em></h2>
          <p>One continuous field.<br />Every frame follows your movement.</p>
        </div>
        <ScrollFrames
          className="exhibition-frames"
          directory={sequences.exhibition.directory}
          frameCount={sequences.exhibition.frameCount}
          label="Veil Unfolding exhibition sculpture animation"
          onReady={() => markSequenceReady("exhibition")}
        >
          <div className="work-meta">
            <span>01 / CURRENT</span>
            <h3>Veil, Unfolding</h3>
            <p>Sora Vale · 2026 · Room II</p>
            <a href="#visit">VIEW EXHIBITION <b>↗</b></a>
          </div>
          <div className="chapter-note">WHITE FABRIC · AIR · LIGHT</div>
        </ScrollFrames>
      </section>

      <section className="moving-quote" aria-label="Gallery statement">
        <div className="marquee"><span>FORM IS NEVER STILL · MATTER REMEMBERS · FORM IS NEVER STILL · MATTER REMEMBERS ·&nbsp;</span><span>FORM IS NEVER STILL · MATTER REMEMBERS · FORM IS NEVER STILL · MATTER REMEMBERS ·&nbsp;</span></div>
      </section>

      <section className="artists" id="artists">
        <div className="section-tag"><span>03</span> / REPRESENTED ARTIST</div>
        <ScrollFrames
          className="artist-frames"
          directory={sequences.artist.directory}
          frameCount={sequences.artist.frameCount}
          label="Artist working with sculpture behind ink and glass"
          fit="contain"
          onReady={() => markSequenceReady("artist")}
        >
          <div className="artist-frame-copy">
            <h2>VOICES<br />IN <em>FORM</em></h2>
            <p>A cross-generational programme of artists interrogating material, place and belonging.</p>
            <span>STUDIO VISIT · ACCRA 2026</span>
          </div>
        </ScrollFrames>
        <div className="artist-list-panel">
          <p>REPRESENTED ARTISTS</p>
          <div className="artist-list" id="artist-list">
            {["Mara Okoye", "Sora Vale", "Léon Agyem", "Inès Marlow", "Kwesi Tano", "Aya Nord"].map((name, index) => <a href="#visit" key={name}><small>0{index + 1}</small><span>{name}</span><b>↗</b></a>)}
          </div>
        </div>
      </section>

      <section className="journal" id="journal">
        <div className="journal-top"><div className="section-tag"><span>04</span> / FIELD NOTES</div><h2>FROM THE<br /><em>ARCHIVE</em></h2></div>
        <div className="notes">
          <article><span>ESSAY · 12 MIN</span><h3>Can a sculpture remember the hands that made it?</h3><p>On touch, trace and the quiet politics of material.</p><a href="mailto:studio@arcform.gallery?subject=The weight of a gesture">READ NOTE ↗</a></article>
          <article className="note-image"><img src={frameUrl(sequences.hero.directory, 120)} alt="Dark sculpture detail from the frame archive" /><span>CONVERSATION · 18 MIN</span><h3>Mara Okoye on building monuments to the unfinished.</h3><a href="mailto:studio@arcform.gallery?subject=Inside the studio">READ NOTE ↗</a></article>
          <article><span>DISPATCH · ACCRA</span><div className="orbital">A/F</div><h3>After the white cube: a gallery porous to the city.</h3><p>Director Ama Serwah introduces our expanded programme.</p><a href="mailto:studio@arcform.gallery?subject=After the white cube">READ NOTE ↗</a></article>
        </div>
      </section>

      <section className="visit" id="visit">
        <div className="visit-backdrop"><img src={frameUrl(sequences.exhibition.directory, 151)} alt="Veil Unfolding exhibition interior" /></div>
        <div className="visit-copy"><div className="section-tag"><span>05</span> / VISIT</div><h2>COME<br /><em>CLOSER.</em></h2><p>18 Independence Avenue<br />Osu, Accra, Ghana</p><div className="hours"><span>Tue—Sat</span><b>10:00—18:00</b><span>Sun</span><b>By appointment</b></div><a className="pill" href="mailto:visit@arcform.gallery">PLAN YOUR VISIT <b>↗</b></a></div>
      </section>

      <footer>
        <div className="footer-brand">ARC<span>/</span>FORM</div>
        <div className="footer-grid"><div><p>New exhibitions, artist stories<br />and private-view invitations.</p><form onSubmit={(event) => event.preventDefault()}><input type="email" placeholder="YOUR EMAIL ADDRESS" aria-label="Email address" /><button>JOIN ↗</button></form></div><div><a href="#top">Instagram</a><a href="#top">Vimeo</a><a href="#top">Artsper</a></div><div><a href="mailto:studio@arcform.gallery">studio@arcform.gallery</a><a href="tel:+233302555019">+233 30 255 5019</a></div></div>
        <div className="legal"><span>© 2026 ARC / FORM GALLERY</span><span>PRIVACY · TERMS · ACCESSIBILITY</span><a href="#top">BACK TO TOP ↑</a></div>
      </footer>
    </main>
  );
}
