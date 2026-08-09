export function MotionArtwork({
  src,
  poster,
  className = "",
  priority = false,
}: {
  src: string;
  poster: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`motion-frame ${className}`}>
      <video
        className="motion-art"
        autoPlay
        muted
        loop
        playsInline
        preload={priority ? "auto" : "metadata"}
        poster={poster}
        aria-hidden="true"
      >
        <source src={src} type="video/mp4" />
      </video>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="motion-fallback" src={poster} alt="" aria-hidden="true" />
    </div>
  );
}
