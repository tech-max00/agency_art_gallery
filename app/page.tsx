"use client";

import Lenis from "lenis";
import { useCallback, useEffect, useRef, useState } from "react";

const assetPrefix = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const chapters = [
  {
    id: "top",
    number: "01",
    index: "FILM 001 / 003",
    src: `${assetPrefix}/art/hero-cinematic ink sculpture mate (1).mp4`,
    eyebrow: "CONTEMPORARY ART · ACCRA / LONDON",
    title: ["ART", "BEYOND", "THE FRAME."],
    copy: "An independent gallery for radical material, moving image and ideas that refuse containment.",
    notes: [
      ["MATTER / 01", "The Weight of Silence", "Mara Okoye · Black resin, air, light"],
      ["FIELD NOTE / 02", "Form is never still.", "The work changes with every body that passes through it."],
      ["ARCHIVE / 03", "A room can remember.", "Trace, pressure and time become the final material."],
    ],
  },
  {
    id: "exhibitions",
    number: "02",
    index: "FILM 002 / 003",
    src: `${assetPrefix}/art/exhibition-veil.mp4`,
    eyebrow: "CURRENT EXHIBITION · ROOM II",
    title: ["VEIL,", "UNFOLDING."],
    copy: "Sora Vale draws a moving threshold between concealment and revelation.",
    notes: [
      ["MATERIAL / 01", "A skin of light.", "Silk, projection and suspended graphite · 2026"],
      ["DURATION / 02", "The image breathes.", "Each fold catches a different measure of time."],
      ["ENCOUNTER / 03", "Come closer.", "The work completes itself only in your presence."],
    ],
  },
  {
    id: "artists",
    number: "03",
    index: "FILM 003 / 003",
    src: `${assetPrefix}/art/artist.mp4`,
    eyebrow: "REPRESENTED ARTIST · STUDIO VISIT",
    title: ["VOICES", "IN FORM."],
    copy: "A cross-generational programme of artists interrogating material, place and belonging.",
    notes: [
      ["STUDIO / ACCRA", "Mara Okoye", "Sculpture · Installation · Moving image"],
      ["PRACTICE / 12 YEARS", "Memory is a material.", "Every surface holds the evidence of its making."],
      ["REPRESENTATION", "Six voices. One field.", "Okoye · Vale · Agyem · Marlow · Tano · Nord"],
    ],
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mediaReady, setMediaReady] = useState(0);
  const [entered, setEntered] = useState(false);
  const readyMedia = useRef(new Set<number>());
  const chapterRefs = useRef<(HTMLElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const markReady = useCallback((index: number) => {
    if (readyMedia.current.has(index)) return;
    readyMedia.current.add(index);
    setMediaReady(readyMedia.current.size);
  }, []);

  useEffect(() => {
    if (mediaReady === chapters.length) {
      const timer = window.setTimeout(() => setEntered(true), 500);
      return () => window.clearTimeout(timer);
    }
  }, [mediaReady]);

  useEffect(() => {
    const fallback = window.setTimeout(() => setEntered(true), 6500);
    return () => window.clearTimeout(fallback);
  }, []);

  useEffect(() => {
    const poll = window.setInterval(() => {
      videoRefs.current.forEach((video, index) => {
        if (video && video.readyState >= 1) markReady(index);
      });
      if (readyMedia.current.size === chapters.length) window.clearInterval(poll);
    }, 120);
    return () => window.clearInterval(poll);
  }, [markReady]);

  useEffect(() => {
    let frame = 0;
    let ticking = false;
    const lenis = new Lenis({
      anchors: true,
      autoRaf: false,
      duration: 1.18,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.9,
    });

    const updateChapter = (section: HTMLElement, video: HTMLVideoElement | null) => {
      const rect = section.getBoundingClientRect();
      const travel = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / travel));
      section.style.setProperty("--chapter-progress", progress.toFixed(4));
      const zone = progress < 0.14 ? "intro" : progress < 0.38 ? "one" : progress < 0.62 ? "two" : progress < 0.86 ? "three" : "outro";
      if (section.dataset.zone !== zone) section.dataset.zone = zone;

      const progressNode = section.querySelector<HTMLElement>("[data-progress-value]");
      if (progressNode) progressNode.textContent = `${String(Math.round(progress * 100)).padStart(2, "0")}%`;

      if (video && Number.isFinite(video.duration) && video.duration > 0 && video.readyState >= 1) {
        const target = Math.min(video.duration - 0.04, progress * video.duration);
        if (Math.abs(video.currentTime - target) > 0.035) video.currentTime = target;
      }
    };

    const update = () => {
      const pageTravel = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      document.documentElement.style.setProperty("--page-progress", (window.scrollY / pageTravel).toFixed(4));
      chapterRefs.current.forEach((section, index) => {
        if (section) updateChapter(section, videoRefs.current[index]);
      });
      ticking = false;
    };

    const schedule = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    const raf = (time: number) => {
      lenis.raf(time);
      frame = window.requestAnimationFrame(raf);
    };

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.target.classList.toggle("is-visible", entry.isIntersecting)),
      { threshold: 0.18 },
    );
    document.querySelectorAll(".reveal").forEach((node) => observer.observe(node));

    lenis.on("scroll", schedule);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    frame = window.requestAnimationFrame(raf);
    update();

    return () => {
      observer.disconnect();
      lenis.destroy();
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  const renderedChapters = chapters.map((chapter, index) => (
    <section className={`scroll-chapter chapter-${index + 1}`} id={chapter.id} key={chapter.id} ref={(node) => { chapterRefs.current[index] = node; }} data-zone="intro">
      <div className="chapter-sticky">
        <video ref={(node) => { videoRefs.current[index] = node; }} className="chapter-film" src={chapter.src} preload="auto" muted playsInline aria-label={`${chapter.title.join(" ")} moving artwork`} onLoadedMetadata={() => markReady(index)} onCanPlay={() => markReady(index)} onError={() => markReady(index)} />
        <div className="chapter-vignette" aria-hidden="true" />
        <div className="chapter-grid" aria-hidden="true" />
        <div className="chapter-chrome" aria-hidden="true"><span>ARC / FORM · LIVE ARCHIVE</span><span>{chapter.index}</span></div>
        <div className="chapter-intro">
          <p className="chapter-eyebrow"><i />{chapter.eyebrow}</p>
          <h1>{chapter.title.map((line, lineIndex) => <span key={line} className={lineIndex === chapter.title.length - 1 ? "serif" : ""}>{line}</span>)}</h1>
          <p className="chapter-copy">{chapter.copy}</p>
        </div>
        <div className="chapter-notes">
          {chapter.notes.map(([label, title, detail], noteIndex) => (
            <article className={`chapter-note note-${noteIndex + 1}`} key={label}><span>{label}</span><h2>{title}</h2><p>{detail}</p></article>
          ))}
        </div>
        <div className="chapter-readout" aria-hidden="true"><span>CHAPTER {chapter.number}</span><div><i /></div><b data-progress-value>00%</b><span>SCROLL TO ADVANCE ↓</span></div>
      </div>
    </section>
  ));

  return (
    <main className={entered ? "site is-entered" : "site"}>
      <div className="loader" role="status" aria-live="polite" aria-label="Loading gallery films">
        <div className="loader-orbit"><span /><span /><span /></div>
        <div className="loader-brand">ARC <i>/</i> FORM</div>
        <div className="loader-status"><span>PREPARING THE MOVING ARCHIVE</span><b>{Math.round((mediaReady / chapters.length) * 100)}%</b></div>
        <div className="loader-track"><i style={{ transform: `scaleX(${mediaReady / chapters.length})` }} /></div>
      </div>
      <div className="grain" aria-hidden="true" />
      <header className="site-header">
        <a className="brand" href="#top" aria-label="ARC FORM home"><span>ARC</span><i>/</i><span>FORM</span></a>
        <nav className={menuOpen ? "nav is-open" : "nav"} aria-label="Primary navigation">
          <a href="#exhibitions" onClick={() => setMenuOpen(false)}>Exhibitions</a><a href="#artists" onClick={() => setMenuOpen(false)}>Artists</a><a href="#archive" onClick={() => setMenuOpen(false)}>Archive</a><a href="#visit" onClick={() => setMenuOpen(false)}>Visit</a>
        </nav>
        <a className="header-cta" href="#visit">Plan a visit <span>↗</span></a>
        <button className="menu-button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-label="Toggle navigation"><span /><span /></button>
        <div className="page-progress" aria-hidden="true"><i /></div>
      </header>

      {renderedChapters[0]}
      <section className="manifesto reveal">
        <div className="section-mark"><span>01</span> / MANIFESTO</div>
        <p>We create encounters between <em>matter</em>, memory and the body—exhibitions that unfold in space, sound and <strong>time.</strong></p>
        <div className="manifesto-foot"><span>EST. 2018</span><span>ACCRA · LONDON</span><span>5°33′N 0°12′W</span></div>
      </section>
      {renderedChapters[1]}
      <section className="interlude" aria-label="Gallery statement"><div className="marquee"><span>FORM IS NEVER STILL · MATTER REMEMBERS · </span><span>FORM IS NEVER STILL · MATTER REMEMBERS · </span></div></section>
      {renderedChapters[2]}

      <section className="archive reveal" id="archive">
        <div className="section-mark"><span>04</span> / FIELD NOTES</div>
        <div className="archive-heading"><h2>FROM THE<br /><em>ARCHIVE.</em></h2><p>Writing, conversations and dispatches from the space between the object and its afterimage.</p></div>
        <div className="archive-list">
          <a href="mailto:studio@arcform.gallery?subject=The weight of a gesture"><span>ESSAY · 12 MIN</span><h3>Can a sculpture remember the hands that made it?</h3><b>READ NOTE ↗</b></a>
          <a href="mailto:studio@arcform.gallery?subject=Inside the studio"><span>CONVERSATION · 18 MIN</span><h3>Mara Okoye on building monuments to the unfinished.</h3><b>READ NOTE ↗</b></a>
          <a href="mailto:studio@arcform.gallery?subject=After the white cube"><span>DISPATCH · ACCRA</span><h3>After the white cube: a gallery porous to the city.</h3><b>READ NOTE ↗</b></a>
        </div>
      </section>

      <section className="visit reveal" id="visit">
        <div className="visit-orbit" aria-hidden="true"><span>ARC</span><i>/</i><span>FORM</span></div>
        <div className="section-mark"><span>05</span> / VISIT</div><h2>COME<br /><em>CLOSER.</em></h2>
        <div className="visit-info"><p>18 Independence Avenue<br />Osu, Accra, Ghana</p><dl><div><dt>Tue—Sat</dt><dd>10:00—18:00</dd></div><div><dt>Sunday</dt><dd>By appointment</dd></div></dl><a href="mailto:visit@arcform.gallery">PLAN YOUR VISIT <span>↗</span></a></div>
      </section>

      <footer>
        <div className="footer-wordmark">ARC <i>/</i> FORM</div>
        <div className="footer-columns"><p>New exhibitions, artist stories<br />and private-view invitations.</p><div><a href="mailto:studio@arcform.gallery">studio@arcform.gallery</a><a href="tel:+233302555019">+233 30 255 5019</a></div><div><a href="#top">Instagram ↗</a><a href="#top">Vimeo ↗</a></div></div>
        <div className="footer-legal"><span>© 2026 ARC / FORM GALLERY</span><span>ACCRA · LONDON</span><a href="#top">BACK TO TOP ↑</a></div>
      </footer>
    </main>
  );
}
