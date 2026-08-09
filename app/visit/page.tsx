import Link from "next/link";
import { MotionArtwork } from "../_components/motion-artwork";
import { PageHero } from "../_components/page-hero";
import { works } from "../_data/gallery";

export const metadata = {
  title: "Visit — ARC / FORM",
  description: "Plan your visit to ARC / FORM in Osu, Accra.",
};

export default function VisitPage() {
  return (
    <main>
      <PageHero index="04" eyebrow="VISIT" title="COME" italic="CLOSER." copy="A quiet space for urgent work in the heart of Osu, Accra." video={works[1].video} image={works[1].image} />

      <section className="visit-details paper-section" data-scroll-scene>
        <div className="visit-address"><div className="section-tag"><span>01</span> / FIND US</div><h2>18 Independence Avenue<br />Osu, Accra, Ghana</h2><a href="https://maps.google.com/?q=Osu+Accra+Ghana" target="_blank" rel="noreferrer">OPEN IN MAPS ↗</a></div>
        <div className="visit-hours"><div><span>Tuesday—Saturday</span><b>10:00—18:00</b></div><div><span>Sunday</span><b>By appointment</b></div><div><span>Monday</span><b>Closed</b></div><p>Last admission is 30 minutes before closing. Entry to all exhibitions is free.</p></div>
      </section>

      <section className="visit-experience dark-section" data-scroll-scene>
        <MotionArtwork src={works[2].video} poster={works[2].image} />
        <div className="visit-experience-copy"><small>ACCESS · ARRIVAL · TOURS</small><h2>A gallery for<br /><em>every body.</em></h2><p>The main entrance and galleries are step-free. Seating is available throughout. Large-print exhibition guides and quiet visits can be arranged in advance.</p><Link className="pill" href="/contact">ARRANGE YOUR VISIT <b>↗</b></Link></div>
      </section>

      <section className="travel-grid paper-section" data-scroll-scene>
        <article><small>01</small><h3>By car</h3><p>Limited street parking is available on Independence Avenue.</p></article>
        <article><small>02</small><h3>Public transport</h3><p>Five minutes on foot from the Oxford Street transport corridor.</p></article>
        <article><small>03</small><h3>Groups</h3><p>Curatorial and school tours are available Tuesday to Friday.</p></article>
      </section>
    </main>
  );
}
