import { ContactForm } from "../_components/contact-form";
import { MotionArtwork } from "../_components/motion-artwork";
import { works } from "../_data/gallery";

export const metadata = {
  title: "Contact — ARC / FORM",
  description: "Contact ARC / FORM gallery for artwork, visit and press enquiries.",
};

export default function ContactPage() {
  return (
    <main className="contact-page">
      <section className="contact-intro" data-scroll-scene>
        <MotionArtwork src={works[0].video} poster={works[0].image} />
        <div className="contact-intro-copy"><div className="section-tag"><span>05</span> / CONTACT</div><h1>START A<br /><em>CONVERSATION.</em></h1><p>Artwork, visits, collaborations or press—we would be glad to hear from you.</p></div>
      </section>
      <section className="contact-body paper-section" data-scroll-scene>
        <div className="contact-details"><span>GENERAL</span><a href="mailto:studio@arcform.gallery">studio@arcform.gallery</a><span>TELEPHONE</span><a href="tel:+233302555019">+233 30 255 5019</a><span>ADDRESS</span><p>18 Independence Avenue<br />Osu, Accra, Ghana</p></div>
        <ContactForm />
      </section>
    </main>
  );
}
