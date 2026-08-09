import { MotionArtwork } from "./motion-artwork";

export function PageHero({
  index,
  eyebrow,
  title,
  italic,
  copy,
  video,
  image,
}: {
  index: string;
  eyebrow: string;
  title: string;
  italic: string;
  copy: string;
  video: string;
  image: string;
}) {
  return (
    <section className="page-hero" data-scroll-scene>
      <MotionArtwork src={video} poster={image} className="page-hero-media" priority />
      <div className="page-hero-shade" />
      <div className="page-hero-copy">
        <div className="section-tag"><span>{index}</span> / {eyebrow}</div>
        <h1>{title}<br /><em>{italic}</em></h1>
        <p>{copy}</p>
      </div>
      <div className="page-scroll">SCROLL TO EXPLORE <i /></div>
    </section>
  );
}
