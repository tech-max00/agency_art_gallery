import Link from "next/link";
import { MotionArtwork } from "../_components/motion-artwork";
import { PageHero } from "../_components/page-hero";
import { notes, works } from "../_data/gallery";

export const metadata = {
  title: "Journal — ARC / FORM",
  description: "Essays, conversations and dispatches from ARC / FORM.",
};

export default function JournalPage() {
  return (
    <main>
      <PageHero index="03" eyebrow="JOURNAL" title="FIELD" italic="NOTES." copy="Essays, studio conversations and dispatches from a gallery in motion." video={works[0].video} image={works[0].image} />

      <section className="journal-lead paper-section" data-scroll-scene>
        <div className="journal-lead-media"><MotionArtwork src={works[0].video} poster={works[0].image} /></div>
        <article><small>FEATURED · CONVERSATION · 18 MIN</small><h2>Mara Okoye on building monuments to the unfinished.</h2><p>A studio conversation about doubt, scale and the work of returning.</p><Link href="#archive">READ THE STORY ↗</Link></article>
      </section>

      <section className="journal-archive dark-section" id="archive" data-scroll-scene>
        <div className="section-heading"><div className="section-tag"><span>02</span> / ARCHIVE</div><h2>READ, WATCH,<br /><em>LISTEN.</em></h2></div>
        <div className="archive-grid">
          {[...notes, ...notes].map((note, index) => <article key={`${note.title}-${index}`}><small>{note.type}</small>{index === 1 || index === 4 ? <MotionArtwork src={works[(index + 1) % works.length].video} poster={works[(index + 1) % works.length].image} /> : <div className="archive-number">0{index + 1}</div>}<h3>{note.title}</h3><p>{note.copy}</p><span>{note.date} · READ ↗</span></article>)}
        </div>
      </section>
    </main>
  );
}
