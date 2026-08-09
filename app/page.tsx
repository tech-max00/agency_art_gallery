import Link from "next/link";
import { EntryLoader } from "./_components/entry-loader";
import { MotionArtwork } from "./_components/motion-artwork";
import { artists, notes, works } from "./_data/gallery";

export default function Home() {
  return (
    <main>
      <EntryLoader />
      <section className="home-hero scroll-chapter" data-scroll-scene data-scroll-pinned>
        <div className="home-hero-sticky">
          <MotionArtwork src={works[0].video} poster={works[0].image} className="home-hero-media" priority />
          <div className="home-hero-shade" />
          <div className="home-hero-copy">
            <p className="eyebrow">Contemporary Art · Accra / London</p>
            <h1><span>ART</span><span>BEYOND</span><span>THE <em>FRAME.</em></span></h1>
            <div className="hero-bottom">
              <p>ARC / FORM is an independent gallery for radical material, moving image and ideas that refuse containment.</p>
              <Link className="circle-link" href="/exhibitions"><span>Explore<br />current show</span><b>↘</b></Link>
            </div>
          </div>
          <div className="hero-index"><span>NOW SHOWING</span><b>01—03</b></div>
          <div className="scene-progress"><b>01</b><i /><span>IMMERSIVE INK STUDY</span></div>
        </div>
      </section>

      <section className="manifesto paper-section" data-scroll-scene>
        <div className="section-tag"><span>01</span> / MANIFESTO</div>
        <p>We create encounters between <em>matter</em>, <strong>memory</strong> and the body—exhibitions that unfold in space, sound and time.</p>
        <div className="manifesto-foot"><span>EST. 2018</span><span>5°33′N 0°12′W</span></div>
      </section>

      <section className="home-exhibitions dark-section" data-scroll-scene>
        <div className="section-heading"><div className="section-tag"><span>02</span> / CURRENT EXHIBITIONS</div><h2>IN THE<br /><em>GALLERY</em></h2><Link href="/exhibitions">VIEW ALL EXHIBITIONS ↗</Link></div>
        <div className="home-work-rail">
          {works.map((work) => (
            <Link href={`/exhibitions#${work.slug}`} className="home-work" key={work.slug}>
              <MotionArtwork src={work.video} poster={work.image} />
              <div className="home-work-meta"><small>{work.no} / 03</small><h3>{work.title}</h3><p>{work.artist} · {work.year}</p></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="film-section" data-scroll-scene>
        <div className="marquee"><span>FORM IS NEVER STILL · MATTER REMEMBERS · FORM IS NEVER STILL ·&nbsp;</span></div>
        <div className="film-card">
          <MotionArtwork src={works[1].video} poster={works[1].image} />
          <div className="film-caption"><span>ARC / FORM FILMS Nº 08</span><h2>Inside the studio<br />with Sora Vale</h2><Link href="/journal">WATCH THE FILM ↗</Link></div>
        </div>
      </section>

      <section className="home-artists paper-section" data-scroll-scene>
        <div className="section-heading"><div className="section-tag"><span>03</span> / REPRESENTED ARTISTS</div><h2>VOICES<br />IN <em>FORM</em></h2><Link href="/artists">VIEW ALL ARTISTS ↗</Link></div>
        <div className="artist-preview">
          <MotionArtwork src={works[2].video} poster={works[2].image} />
          <div className="artist-preview-list">{artists.slice(0, 4).map(([no, name, field]) => <Link href="/artists" key={name}><small>{no}</small><span>{name}</span><em>{field}</em><b>↗</b></Link>)}</div>
        </div>
      </section>

      <section className="home-journal dark-section" data-scroll-scene>
        <div className="section-heading"><div className="section-tag"><span>04</span> / FIELD NOTES</div><h2>FROM THE<br /><em>ARCHIVE</em></h2><Link href="/journal">ENTER THE JOURNAL ↗</Link></div>
        <div className="note-preview">{notes.map((note, index) => <Link href="/journal" key={note.title}><small>{note.type}</small><h3>{note.title}</h3><p>{note.copy}</p><span>{note.date} · READ ↗</span><b>0{index + 1}</b></Link>)}</div>
      </section>

      <section className="home-visit" data-scroll-scene>
        <MotionArtwork src={works[1].video} poster={works[1].image} className="home-visit-media" />
        <div className="home-visit-copy"><div className="section-tag"><span>05</span> / VISIT</div><h2>COME<br /><em>CLOSER.</em></h2><p>18 Independence Avenue<br />Osu, Accra, Ghana</p><Link className="pill" href="/visit">PLAN YOUR VISIT <b>↗</b></Link></div>
      </section>
    </main>
  );
}
