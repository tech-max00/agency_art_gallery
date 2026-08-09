"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CanvasScrollChapter, ChapterData } from "@/components/ui/CanvasScrollChapter";

const assetPrefix = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const chapters: ChapterData[] = [
  {
    id: "top",
    number: "01",
    index: "FILM 001 / 003",
    src: `${assetPrefix}/art/hero-sculpture.mp4`,
    eyebrow: "CONTEMPORARY ART · ACCRA / LONDON",
    title: ["ART", "BEYOND", "THE FRAME."],
    copy: "An independent gallery for radical material, moving image and ideas that refuse containment.",
    notes: [
      { label: "MATTER / 01", title: "The Weight of Silence", detail: "Mara Okoye · Black resin, air, light" },
      { label: "FIELD NOTE / 02", title: "Form is never still.", detail: "The work changes with every body that passes through it." },
      { label: "ARCHIVE / 03", title: "A room can remember.", detail: "Trace, pressure and time become the final material." },
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
      { label: "MATERIAL / 01", title: "A skin of light.", detail: "Silk, projection and suspended graphite · 2026" },
      { label: "DURATION / 02", title: "The image breathes.", detail: "Each fold catches a different measure of time." },
      { label: "ENCOUNTER / 03", title: "Come closer.", detail: "The work completes itself only in your presence." },
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
      { label: "STUDIO / ACCRA", title: "Mara Okoye", detail: "Sculpture · Installation · Moving image" },
      { label: "PRACTICE / 12 YEARS", title: "Memory is a material.", detail: "Every surface holds the evidence of its making." },
      { label: "REPRESENTATION", title: "Six voices. One field.", detail: "Okoye · Vale · Agyem · Marlow · Tano · Nord" },
    ],
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mediaReady, setMediaReady] = useState(0);
  const [entered, setEntered] = useState(false);
  const readyMedia = useRef(new Set<number>());

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

  // Fallback safety timeout for preloader
  useEffect(() => {
    const fallback = window.setTimeout(() => setEntered(true), 3500);
    return () => window.clearTimeout(fallback);
  }, []);

  // Update page progress bar & handle scroll reveals
  useEffect(() => {
    let ticking = false;

    const updatePageProgress = () => {
      const pageTravel = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = window.scrollY / pageTravel;
      document.documentElement.style.setProperty("--page-progress", progress.toFixed(4));
      ticking = false;
    };

    const schedule = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updatePageProgress);
    };

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.target.classList.toggle("is-visible", entry.isIntersecting)),
      { threshold: 0.18 }
    );
    document.querySelectorAll(".reveal").forEach((node) => observer.observe(node));

    window.addEventListener("scroll", schedule, { passive: true });
    updatePageProgress();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
    };
  }, []);

  const loadPercent = Math.round((mediaReady / chapters.length) * 100);

  return (
    <main className={entered ? "site is-entered" : "site"}>
      {/* Loading Overlay */}
      <div className="loader" role="status" aria-live="polite" aria-label="Loading gallery archive">
        <div className="loader-orbit">
          <span />
          <span />
          <span />
        </div>
        <div className="loader-brand">
          ARC <i>/</i> FORM
        </div>
        <div className="loader-status">
          <span>SUIT UP PROTOCOL // PREPARING MOVING ARCHIVE</span>
          <b>{loadPercent}%</b>
        </div>
        <div className="loader-track">
          <i style={{ transform: `scaleX(${mediaReady / chapters.length})` }} />
        </div>
      </div>

      <div className="grain" aria-hidden="true" />

      {/* Header Bar */}
      <header className="site-header">
        <a className="brand" href="#top" aria-label="ARC FORM home">
          <span>ARC</span>
          <i>/</i>
          <span>FORM</span>
        </a>
        <nav className={menuOpen ? "nav is-open" : "nav"} aria-label="Primary navigation">
          <a href="#exhibitions" onClick={() => setMenuOpen(false)}>
            Exhibitions
          </a>
          <a href="#artists" onClick={() => setMenuOpen(false)}>
            Artists
          </a>
          <a href="#archive" onClick={() => setMenuOpen(false)}>
            Archive
          </a>
          <a href="#visit" onClick={() => setMenuOpen(false)}>
            Visit
          </a>
        </nav>
        <a className="header-cta" href="#visit">
          Plan a visit <span>↗</span>
        </a>
        <button
          className="menu-button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
        >
          <span />
          <span />
        </button>
        <div className="page-progress" aria-hidden="true">
          <i />
        </div>
      </header>

      {/* Chapter 1: Canvas Frame Sequence */}
      <CanvasScrollChapter
        chapter={chapters[0]}
        chapterIndex={0}
        totalChapters={chapters.length}
        onReady={markReady}
      />

      {/* Manifesto Section */}
      <section className="manifesto reveal">
        <div className="section-mark">
          <span>01</span> / MANIFESTO
        </div>
        <p>
          We create encounters between <em>matter</em>, memory and the body—exhibitions that unfold in space, sound and{" "}
          <strong>time.</strong>
        </p>
        <div className="manifesto-foot">
          <span>EST. 2018</span>
          <span>ACCRA · LONDON</span>
          <span>5°33′N 0°12′W</span>
        </div>
      </section>

      {/* Chapter 2: Canvas Frame Sequence */}
      <CanvasScrollChapter
        chapter={chapters[1]}
        chapterIndex={1}
        totalChapters={chapters.length}
        onReady={markReady}
      />

      {/* Marquee Interlude */}
      <section className="interlude" aria-label="Gallery statement">
        <div className="marquee">
          <span>FORM IS NEVER STILL · MATTER REMEMBERS · </span>
          <span>FORM IS NEVER STILL · MATTER REMEMBERS · </span>
        </div>
      </section>

      {/* Chapter 3: Canvas Frame Sequence */}
      <CanvasScrollChapter
        chapter={chapters[2]}
        chapterIndex={2}
        totalChapters={chapters.length}
        onReady={markReady}
      />

      {/* Field Notes Archive Section */}
      <section className="archive reveal" id="archive">
        <div className="section-mark">
          <span>04</span> / FIELD NOTES
        </div>
        <div className="archive-heading">
          <h2>
            FROM THE
            <br />
            <em>ARCHIVE.</em>
          </h2>
          <p>Writing, conversations and dispatches from the space between the object and its afterimage.</p>
        </div>
        <div className="archive-list">
          <a href="mailto:studio@arcform.gallery?subject=The weight of a gesture">
            <span>ESSAY · 12 MIN</span>
            <h3>Can a sculpture remember the hands that made it?</h3>
            <b>READ NOTE ↗</b>
          </a>
          <a href="mailto:studio@arcform.gallery?subject=Inside the studio">
            <span>CONVERSATION · 18 MIN</span>
            <h3>Mara Okoye on building monuments to the unfinished.</h3>
            <b>READ NOTE ↗</b>
          </a>
          <a href="mailto:studio@arcform.gallery?subject=After the white cube">
            <span>DISPATCH · ACCRA</span>
            <h3>After the white cube: a gallery porous to the city.</h3>
            <b>READ NOTE ↗</b>
          </a>
        </div>
      </section>

      {/* Visit Section */}
      <section className="visit reveal" id="visit">
        <div className="visit-orbit" aria-hidden="true">
          <span>ARC</span>
          <i>/</i>
          <span>FORM</span>
        </div>
        <div className="section-mark">
          <span>05</span> / VISIT
        </div>
        <h2>
          COME
          <br />
          <em>CLOSER.</em>
        </h2>
        <div className="visit-info">
          <p>
            18 Independence Avenue
            <br />
            Osu, Accra, Ghana
          </p>
          <dl>
            <div>
              <dt>Tue—Sat</dt>
              <dd>10:00—18:00</dd>
            </div>
            <div>
              <dt>Sunday</dt>
              <dd>By appointment</dd>
            </div>
          </dl>
          <a href="mailto:visit@arcform.gallery">
            PLAN YOUR VISIT <span>↗</span>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-wordmark">
          ARC <i>/</i> FORM
        </div>
        <div className="footer-columns">
          <p>
            New exhibitions, artist stories
            <br />
            and private-view invitations.
          </p>
          <div>
            <a href="mailto:studio@arcform.gallery">studio@arcform.gallery</a>
            <a href="tel:+233302555019">+233 30 255 5019</a>
          </div>
          <div>
            <a href="#top">Instagram ↗</a>
            <a href="#top">Vimeo ↗</a>
          </div>
        </div>
        <div className="footer-legal">
          <span>© 2026 ARC / FORM GALLERY</span>
          <span>ACCRA · LONDON</span>
          <a href="#top">BACK TO TOP ↑</a>
        </div>
      </footer>
    </main>
  );
}
