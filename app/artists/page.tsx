import Link from "next/link";
import { MotionArtwork } from "../_components/motion-artwork";
import { PageHero } from "../_components/page-hero";
import { artists, works } from "../_data/gallery";

export const metadata = {
  title: "Artists — ARC / FORM",
  description: "Meet the artists represented by ARC / FORM.",
};

export default function ArtistsPage() {
  return (
    <main>
      <PageHero index="02" eyebrow="ARTISTS" title="VOICES IN" italic="FORM." copy="A cross-generational programme interrogating material, place and belonging." video={works[2].video} image={works[2].image} />

      <section className="artist-directory paper-section" data-scroll-scene>
        <div className="directory-aside"><div className="section-tag"><span>01</span> / DIRECTORY</div><p>Six practices. Many geographies. One commitment to making form carry consequence.</p></div>
        <div className="directory-list">
          {artists.map(([no, name, field]) => <Link href={`/contact?artist=${encodeURIComponent(name)}`} key={name}><small>{no}</small><h2>{name}</h2><em>{field}</em><b>↗</b></Link>)}
        </div>
      </section>

      <section className="studio-feature dark-section" data-scroll-scene>
        <MotionArtwork src={works[0].video} poster={works[0].image} />
        <div className="studio-copy"><div className="section-tag"><span>02</span> / STUDIO VISIT</div><h2>MARA<br /><em>OKOYE</em></h2><p>“The unfinished object keeps its future open. That openness is where the viewer enters.”</p><Link href="/journal">READ THE CONVERSATION ↗</Link></div>
      </section>

      <section className="representation paper-section" data-scroll-scene>
        <span>ARTIST REPRESENTATION</span><h2>Building a practice<br />with <em>care and time.</em></h2><p>ARC / FORM works closely with artists across exhibitions, commissions, publications and institutional placements.</p><Link className="pill dark-pill" href="/contact">CONTACT THE GALLERY <b>↗</b></Link>
      </section>
    </main>
  );
}
