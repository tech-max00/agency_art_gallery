"use client";

import { useEffect, useRef, useState } from "react";

const works = [
  { no: "01", title: "The Weight of Silence", artist: "Mara Okoye", year: "2026", image: "/art/hero-ink-sculpture.png" },
  { no: "02", title: "Veil, Unfolding", artist: "Sora Vale", year: "2025", image: "/art/exhibition-veil.png" },
  { no: "03", title: "Memory Is a Material", artist: "Léon Agyem", year: "2026", image: "/art/artist-portrait.png" },
];

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const [menu, setMenu] = useState(false);
  const [activeWork, setActiveWork] = useState(0);
  const [sound, setSound] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoaded(true), 2100);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let mouseX = 0.5;
    let mouseY = 0.5;
    const resize = () => {
      const dpr = Math.min(devicePixelRatio, 2);
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const move = (e: PointerEvent) => { mouseX = e.clientX / innerWidth; mouseY = e.clientY / innerHeight; };
    const draw = (t: number) => {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      const x = innerWidth * (0.62 + (mouseX - 0.5) * 0.05);
      const y = innerHeight * (0.42 + (mouseY - 0.5) * 0.05);
      const glow = ctx.createRadialGradient(x, y, 0, x, y, Math.min(innerWidth, innerHeight) * 0.44);
      glow.addColorStop(0, "rgba(246,238,224,.085)");
      glow.addColorStop(.45, "rgba(120,32,32,.028)");
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, innerWidth, innerHeight);
      ctx.strokeStyle = "rgba(242,235,220,.028)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const r = 110 + i * 38 + Math.sin(t / 1800 + i) * 8;
        ctx.ellipse(x, y, r * 1.3, r, t / 12000 + i * .28, 0, Math.PI * 2);
        ctx.stroke();
      }
      raf = requestAnimationFrame(draw);
    };
    resize(); addEventListener("resize", resize); addEventListener("pointermove", move); raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", resize); removeEventListener("pointermove", move); };
  }, []);

  return (
    <main className={loaded ? "site loaded" : "site"}>
      <div className="loader" aria-hidden={loaded}>
        <div className="ink-orb"><i /><i /><i /></div>
        <div className="loader-mark"><span>ARC</span><b>/</b><span>FORM</span></div>
        <div className="loader-line"><em /></div>
        <p>ENTERING THE ARCHIVE</p>
      </div>

      <canvas ref={canvasRef} className="ambient" aria-hidden="true" />
      <div className="grain" />

      <header>
        <a className="brand" href="#top" aria-label="ARC FORM home"><span>ARC</span><i>/</i><span>FORM</span></a>
        <nav className={menu ? "open" : ""}>
          <a href="#exhibitions" onClick={() => setMenu(false)}>Exhibitions</a>
          <a href="#artists" onClick={() => setMenu(false)}>Artists</a>
          <a href="#journal" onClick={() => setMenu(false)}>Journal</a>
          <a href="#visit" onClick={() => setMenu(false)}>Visit</a>
        </nav>
        <div className="header-tools">
          <button className="sound" onClick={() => setSound(!sound)} aria-label="Toggle ambient sound"><span className={sound ? "playing" : ""} /><span /><span /></button>
          <button className="menu" onClick={() => setMenu(!menu)} aria-label="Toggle menu"><i /><i /></button>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-media"><img src="/art/hero-ink-sculpture.png" alt="Black liquid sculpture in a dark gallery" /><div className="media-shade" /></div>
        <div className="hero-copy">
          <p className="eyebrow">Contemporary Art · Accra / London</p>
          <h1><span>ART</span><span>BEYOND</span><span>THE <em>FRAME.</em></span></h1>
          <div className="hero-bottom">
            <p>ARC / FORM is an independent gallery for radical material, moving image and ideas that refuse containment.</p>
            <a className="circle-link" href="#exhibitions"><span>Explore<br />current show</span><b>↘</b></a>
          </div>
        </div>
        <div className="hero-index"><span>NOW SHOWING</span><b>01—03</b></div>
        <div className="scroll-hint"><i /> SCROLL TO ENTER</div>
      </section>

      <section className="manifesto reveal">
        <div className="section-tag"><span>01</span> / MANIFESTO</div>
        <p>We create encounters between <em>matter</em>, <strong>memory</strong> and the body—exhibitions that unfold in space, sound and time.</p>
        <div className="manifesto-foot"><span>EST. 2018</span><span>5°33′N 0°12′W</span></div>
      </section>

      <section className="shows" id="exhibitions">
        <div className="shows-head"><div className="section-tag"><span>02</span> / CURRENT EXHIBITIONS</div><h2>IN THE<br /><em>GALLERY</em></h2><p>Three rooms. Three propositions.<br />One continuous field.</p></div>
        <div className="work-stage">
          <div className="work-image" key={activeWork}><img src={works[activeWork].image} alt={works[activeWork].title} /><div className="lens" /></div>
          <div className="work-meta"><span>{works[activeWork].no} / 03</span><h3>{works[activeWork].title}</h3><p>{works[activeWork].artist} · {works[activeWork].year}</p><a href="#visit">VIEW EXHIBITION <b>↗</b></a></div>
          <div className="work-controls"><button onClick={() => setActiveWork((activeWork + 2) % 3)} aria-label="Previous artwork">←</button><div>{works.map((_, i) => <button key={i} onClick={() => setActiveWork(i)} className={i === activeWork ? "active" : ""} aria-label={`Artwork ${i + 1}`} />)}</div><button onClick={() => setActiveWork((activeWork + 1) % 3)} aria-label="Next artwork">→</button></div>
        </div>
      </section>

      <section className="moving-quote">
        <div className="marquee"><span>FORM IS NEVER STILL · MATTER REMEMBERS · FORM IS NEVER STILL · MATTER REMEMBERS ·&nbsp;</span><span>FORM IS NEVER STILL · MATTER REMEMBERS · FORM IS NEVER STILL · MATTER REMEMBERS ·&nbsp;</span></div>
        <div className="film"><img src="/art/exhibition-veil.png" alt="Draped sculptural form" /><button aria-label="Play exhibition film"><i>▶</i><span>PLAY FILM<br /><small>02:46</small></span></button><div className="film-caption"><span>ARC / FORM FILMS Nº 08</span><p>Inside the studio with<br />Sora Vale</p></div></div>
      </section>

      <section className="artists" id="artists">
        <div className="section-tag"><span>03</span> / REPRESENTED ARTISTS</div>
        <div className="artist-grid">
          <div className="artist-intro"><h2>VOICES<br />IN <em>FORM</em></h2><p>A cross-generational programme of artists interrogating material, place and belonging.</p><a href="#artist-list">VIEW ALL ARTISTS ↗</a></div>
          <div className="portrait"><img src="/art/artist-portrait.png" alt="Artist silhouette behind smoked glass" /><span>STUDIO VISIT · ACCRA 2026</span></div>
          <div className="artist-list" id="artist-list">
            {["Mara Okoye", "Sora Vale", "Léon Agyem", "Inès Marlow", "Kwesi Tano", "Aya Nord"].map((name, i) => <a href="#visit" key={name}><small>0{i + 1}</small><span>{name}</span><b>↗</b></a>)}
          </div>
        </div>
      </section>

      <section className="journal" id="journal">
        <div className="journal-top"><div className="section-tag"><span>04</span> / FIELD NOTES</div><h2>FROM THE<br /><em>ARCHIVE</em></h2></div>
        <div className="notes">
          <article><span>ESSAY · 12 MIN</span><h3>Can a sculpture remember the hands that made it?</h3><p>On touch, trace and the quiet politics of material.</p><a href="#">READ NOTE ↗</a></article>
          <article className="note-image"><img src="/art/hero-ink-sculpture.png" alt="Dark ink sculpture detail" /><span>CONVERSATION · 18 MIN</span><h3>Mara Okoye on building monuments to the unfinished.</h3><a href="#">READ NOTE ↗</a></article>
          <article><span>DISPATCH · ACCRA</span><div className="orbital">A/F</div><h3>After the white cube: a gallery porous to the city.</h3><p>Director Ama Serwah introduces our expanded programme.</p><a href="#">READ NOTE ↗</a></article>
        </div>
      </section>

      <section className="visit" id="visit">
        <div className="visit-backdrop"><img src="/art/exhibition-veil.png" alt="Gallery interior" /></div>
        <div className="visit-copy"><div className="section-tag"><span>05</span> / VISIT</div><h2>COME<br /><em>CLOSER.</em></h2><p>18 Independence Avenue<br />Osu, Accra, Ghana</p><div className="hours"><span>Tue—Sat</span><b>10:00—18:00</b><span>Sun</span><b>By appointment</b></div><a className="pill" href="mailto:visit@arcform.gallery">PLAN YOUR VISIT <b>↗</b></a></div>
      </section>

      <footer>
        <div className="footer-brand">ARC<span>/</span>FORM</div>
        <div className="footer-grid"><div><p>New exhibitions, artist stories<br />and private-view invitations.</p><form onSubmit={(e) => e.preventDefault()}><input type="email" placeholder="YOUR EMAIL ADDRESS" aria-label="Email address" /><button>JOIN ↗</button></form></div><div><a href="#">Instagram</a><a href="#">Vimeo</a><a href="#">Artsper</a></div><div><a href="mailto:studio@arcform.gallery">studio@arcform.gallery</a><a href="tel:+233302555019">+233 30 255 5019</a></div></div>
        <div className="legal"><span>© 2026 ARC / FORM GALLERY</span><span>PRIVACY · TERMS · ACCESSIBILITY</span><a href="#top">BACK TO TOP ↑</a></div>
      </footer>
    </main>
  );
}
