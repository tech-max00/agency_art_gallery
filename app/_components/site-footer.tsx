import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer" data-scroll-scene>
      <div className="footer-kicker"><span>Independent gallery</span><span>Accra · London</span><span>Est. 2018</span></div>
      <Link href="/contact" className="footer-title">LET&apos;S MAKE<br /><em>CONTACT.</em><b>↗</b></Link>
      <div className="footer-grid">
        <div><p>Exhibitions, artist stories and private-view invitations.</p><form action="/contact"><input type="email" name="email" placeholder="YOUR EMAIL ADDRESS" aria-label="Email address" /><button type="submit">JOIN ↗</button></form></div>
        <div><a href="#">Instagram</a><a href="#">Vimeo</a><a href="#">Artsper</a></div>
        <div><a href="mailto:studio@arcform.gallery">studio@arcform.gallery</a><a href="tel:+233302555019">+233 30 255 5019</a></div>
      </div>
      <div className="legal"><span>© 2026 ARC / FORM GALLERY</span><span>PRIVACY · TERMS · ACCESSIBILITY</span><Link href="/">HOME ↑</Link></div>
    </footer>
  );
}
