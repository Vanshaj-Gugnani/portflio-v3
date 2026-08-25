"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

const SECTION_HASHES = [
  "#top",
  "#about",
  "#skills",
  "#work",
  "#contact",
] as const;

type SectionHash = (typeof SECTION_HASHES)[number];

function isSectionHash(hash: string): hash is SectionHash {
  return SECTION_HASHES.includes(hash as SectionHash);
}

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
    const sections = SECTION_HASHES.flatMap((hash) => {
      const section = document.querySelector<HTMLElement>(hash);

      return section ? [{ hash, section }] : [];
    });
    const navigationLinks = Array.from(
      document.querySelectorAll<HTMLAnchorElement>(
        '.primary-nav a[href^="#"], .menu-panel a[href^="#"]',
      ),
    );

    let activeHash: SectionHash = "#top";
    let frame = 0;
    let isNavigating = false;
    let mounted = true;
    let scrollTween: gsap.core.Tween | null = null;

    const updateNavigation = (hash: SectionHash) => {
      activeHash = hash;

      navigationLinks.forEach((link) => {
        if (link.getAttribute("href") === hash) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    const findActiveSection = () => {
      // A section becomes current after its top enters the upper third of the
      // viewport. This remains stable while the work reel is pinned because
      // its ScrollTrigger spacer stays inside #work.
      const activationLine = window.innerHeight * 0.34;
      let nextHash = sections[0]?.hash ?? "#top";

      for (const { hash, section } of sections) {
        if (section.getBoundingClientRect().top > activationLine) break;
        nextHash = hash;
      }

      return nextHash;
    };

    const syncActiveSection = () => {
      frame = 0;

      // A clicked anchor owns the URL until its tween settles. Without this,
      // the scrollspy would briefly write every crossed section into the URL.
      if (isNavigating) return;

      const nextHash = findActiveSection();

      if (nextHash === activeHash && window.location.hash === nextHash) return;

      updateNavigation(nextHash);
      window.history.replaceState(window.history.state, "", nextHash);
    };

    const scheduleSectionSync = () => {
      if (!mounted || frame) return;
      frame = window.requestAnimationFrame(syncActiveSection);
    };

    const initialHash = isSectionHash(window.location.hash)
      ? window.location.hash
      : findActiveSection();

    updateNavigation(initialHash);

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

      scrollTween?.kill();
      isNavigating = true;

      // Following an anchor normally moves focus too. Keep that, or keyboard
      // users land at the new scroll position with focus still on the link.
      const settle = () => {
        scrollTween = null;

        if (window.location.hash !== hash) {
          window.history.pushState(window.history.state, "", hash);
        }

        if (isSectionHash(hash)) {
          updateNavigation(hash);
        } else {
          updateNavigation(findActiveSection());
        }

        isNavigating = false;
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
        target.addEventListener(
          "blur",
          () => target.removeAttribute("tabindex"),
          { once: true },
        );
      };

      const handleInterrupted = () => {
        if (!isNavigating) return;

        scrollTween = null;
        isNavigating = false;
        scheduleSectionSync();
      };

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduced) {
        target.scrollIntoView();
        settle();

        return;
      }

      scrollTween = gsap.to(window, {
        duration: 0.9,
        ease: "power2.inOut",
        // Resolved by the plugin when the tween starts, so a pinned section
        // that has since been measured reports its real offset.
        scrollTo: {
          y: hash,
          autoKill: true,
          onAutoKill: handleInterrupted,
        },
        onComplete: settle,
        onInterrupt: handleInterrupted,
      });
    };

    document.addEventListener("click", handleClick);
    window.addEventListener("scroll", scheduleSectionSync, { passive: true });
    window.addEventListener("resize", scheduleSectionSync);

    return () => {
      mounted = false;
      document.removeEventListener("click", handleClick);
      window.removeEventListener("scroll", scheduleSectionSync);
      window.removeEventListener("resize", scheduleSectionSync);
      window.cancelAnimationFrame(frame);
      scrollTween?.kill();
    };
  }, []);

  return null;
}
