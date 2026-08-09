"use client";

import { useEffect, useState } from "react";
import { MotionArtwork } from "./motion-artwork";

export function EntryLoader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("arc-form-entered")) return;
    const revealFrame = window.requestAnimationFrame(() => setVisible(true));
    const timer = window.setTimeout(() => {
      sessionStorage.setItem("arc-form-entered", "true");
      setVisible(false);
    }, 1500);
    return () => {
      window.cancelAnimationFrame(revealFrame);
      window.clearTimeout(timer);
    };
  }, []);

  if (!visible) return null;
  return (
    <div className="entry-loader" aria-hidden="true">
      <MotionArtwork src="/video/hero-ink-motion.mp4" poster="/art/hero-ink-sculpture.png" className="loader-film" priority />
      <div className="loader-mark"><span>ARC</span><i>/</i><span>FORM</span></div>
      <div className="loader-progress"><i /></div>
      <p>ENTERING THE ARCHIVE</p>
    </div>
  );
}
