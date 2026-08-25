"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

/**
 * Smooth in-page navigation, done in GSAP rather than with CSS
 * `scroll-behavior: smooth`.
 *
 * The CSS property cannot coexist with ScrollTrigger: when the reel's snap
 * writes a scroll position, the browser animates towards it while ScrollTrigger
 * keeps reading the still-moving position, and the two fight. It shows up at the
 * end of the pinned reel as the page stepping back up and then down again.
 * ScrollToPlugin drives the same tween through GSAP's ticker, so the snap and
 * the anchor scroll share one source of truth.
 */
export default function SmoothAnchors() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      // Leave modified clicks alone: they open tabs and windows.
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const link = (event.target as Element | null)?.closest?.('a[href^="#"]');

      if (!(link instanceof HTMLAnchorElement)) return;

      const hash = link.getAttribute("href");

      if (!hash || hash.length < 2) return;

      const target = document.querySelector(hash);

      if (!(target instanceof HTMLElement)) return;

      event.preventDefault();

      // Following an anchor normally moves focus too. Keep that, or keyboard
      // users land at the new scroll position with focus still on the link.
      const settle = () => {
        window.history.pushState(null, "", hash);
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
        target.addEventListener(
          "blur",
          () => target.removeAttribute("tabindex"),
          { once: true },
        );
      };

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduced) {
        target.scrollIntoView();
        settle();

        return;
      }

      gsap.to(window, {
        duration: 0.9,
        ease: "power2.inOut",
        // Resolved by the plugin when the tween starts, so a pinned section
        // that has since been measured reports its real offset.
        scrollTo: { y: hash, autoKill: true },
        onComplete: settle,
      });
    };

    document.addEventListener("click", handleClick);

    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
