"use client";

import { useEffect } from "react";

type Scene = {
  element: HTMLElement;
  top: number;
  height: number;
  current: number;
  active: boolean;
  pinned: boolean;
};

const clamp = (value: number) => Math.max(0, Math.min(1, value));

export function ScrollMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-scroll-scene]"));
    const scenes: Scene[] = elements.map((element) => ({
      element,
      top: 0,
      height: 1,
      current: -1,
      active: false,
      pinned: element.hasAttribute("data-scroll-pinned"),
    }));

    let viewport = window.innerHeight;
    let scrollY = window.scrollY;
    let frame = 0;
    let lastTime = performance.now();
    let settling = false;

    const measure = () => {
      viewport = window.innerHeight;
      const pageY = window.scrollY;
      for (const scene of scenes) {
        const rect = scene.element.getBoundingClientRect();
        scene.top = rect.top + pageY;
        scene.height = Math.max(1, rect.height);
      }
    };

    const targetFor = (scene: Scene) => {
      if (scene.pinned) {
        return clamp((scrollY - scene.top) / Math.max(1, scene.height - viewport));
      }
      return clamp((scrollY + viewport - scene.top) / (scene.height + viewport));
    };

    const render = (now: number) => {
      const dt = Math.min(48, now - lastTime);
      lastTime = now;
      let needsFrame = false;

      for (const scene of scenes) {
        if (!scene.active) continue;
        const target = targetFor(scene);
        const difference = target - scene.current;
        const response = Math.abs(difference) > 0.12 ? 0.72 : 1 - Math.exp(-dt / 34);
        const next = scene.current < 0 || Math.abs(difference) < 0.001
          ? target
          : scene.current + difference * response;

        if (Math.abs(next - scene.current) > 0.0005) {
          scene.current = next;
          scene.element.style.setProperty("--progress", next.toFixed(4));
        }
        if (Math.abs(target - next) > 0.001) needsFrame = true;
      }

      if (needsFrame || settling) {
        settling = false;
        frame = requestAnimationFrame(render);
      } else {
        frame = 0;
      }
    };

    const requestRender = () => {
      scrollY = window.scrollY;
      settling = true;
      if (!frame) {
        lastTime = performance.now();
        frame = requestAnimationFrame(render);
      }
    };

    const sceneObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const scene = scenes.find((item) => item.element === entry.target);
          if (!scene) continue;
          scene.active = entry.isIntersecting;
          scene.element.classList.toggle("motion-active", entry.isIntersecting);
          if (entry.isIntersecting) scene.current = -1;
        }
        requestRender();
      },
      { rootMargin: "12% 0px 12% 0px" },
    );

    const videoObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) void video.play().catch(() => undefined);
          else video.pause();
        }
      },
      { rootMargin: "8% 0px", threshold: 0.01 },
    );

    for (const scene of scenes) sceneObserver.observe(scene.element);
    document.querySelectorAll<HTMLVideoElement>("video.motion-art").forEach((video) => videoObserver.observe(video));

    const onResize = () => {
      measure();
      requestRender();
    };

    measure();
    window.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("load", onResize, { once: true });
    requestRender();

    return () => {
      cancelAnimationFrame(frame);
      sceneObserver.disconnect();
      videoObserver.disconnect();
      window.removeEventListener("scroll", requestRender);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onResize);
    };
  }, []);

  return null;
}
