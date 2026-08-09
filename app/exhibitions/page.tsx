import Link from "next/link";
import { MotionArtwork } from "../_components/motion-artwork";
import { PageHero } from "../_components/page-hero";
import { works } from "../_data/gallery";

export const metadata = {
  title: "Exhibitions — ARC / FORM",
  description: "Current and forthcoming exhibitions at ARC / FORM gallery.",
};

export default function ExhibitionsPage() {
  return (
    <main>
      <PageHero index="01" eyebrow="EXHIBITIONS" title="CURRENT" italic="POSITIONS." copy="Three rooms become one continuous field of sculpture, moving image and sound." video={works[1].video} image={works[1].image} />

      <section className="exhibition-rail scroll-chapter" data-scroll-scene data-scroll-pinned>
        <div className="exhibition-rail-sticky">
          <div className="rail-intro"><span>NOW SHOWING</span><p>Scroll forward to move through the rooms. Reverse to return.</p></div>
          <div className="rail-track">
            {works.map((work) => (
              <article className="rail-card" id={work.slug} key={work.slug}>
                <MotionArtwork src={work.video} poster={work.image} />
                <div className="rail-card-copy"><small>{work.no} / 03 · {work.year}</small><h2>{work.title}</h2><p>{work.artist}<br />{work.medium}</p><Link href="/contact">ENQUIRE ↗</Link></div>
              </article>
            ))}
          </div>
          <div className="rail-progress"><i /><span>01</span><span>03</span></div>
        </div>
      </section>

      <section className="programme paper-section" data-scroll-scene>
        <div className="section-tag"><span>02</span> / PROGRAMME</div>
        <div className="programme-list">
          {works.map((work) => <article key={work.title}><small>{work.no}</small><h3>{work.title}</h3><p>{work.artist}</p><span>{work.note}</span><b>OPEN NOW</b></article>)}
        </div>
      </section>

      <section className="exhibition-cta dark-section" data-scroll-scene>
        <p>PRIVATE VIEWS · CURATORIAL TOURS · SCHOOL VISITS</p>
        <h2>Experience the work<br /><em>in the room.</em></h2>
        <Link className="pill" href="/visit">PLAN YOUR VISIT <b>↗</b></Link>
      </section>
    </main>
  );
}
