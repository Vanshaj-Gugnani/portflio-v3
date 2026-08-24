"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, SplitText, ScrollTrigger);

type TextRevealProps = {
  children: ReactNode;
  animateOnScroll?: boolean;
  blockColor?: string;
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
};

export default function TextReveal({
  children,
  animateOnScroll = true,
  blockColor = "var(--accent)",
  className,
  delay = 0,
  duration = 0.75,
  stagger = 0.15,
}: TextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      const target = container?.firstElementChild;

      if (!(target instanceof HTMLElement)) return;

      const motionPreference = gsap.matchMedia();

      motionPreference.add("(prefers-reduced-motion: no-preference)", () => {
        const split = SplitText.create(target, {
          type: "lines",
          linesClass: "text-reveal-line",
          lineThreshold: 0.1,
          tag: "span",
        });

        const lines = split.lines as HTMLElement[];
        const blocks = lines.map((line) => {
          const wrapper = document.createElement("span");
          const block = document.createElement("span");
          const parent = line.parentNode;

          wrapper.className = "text-reveal-line-wrapper";
          block.className = "text-reveal-block";
          block.style.backgroundColor = blockColor;
          block.setAttribute("aria-hidden", "true");

          parent?.insertBefore(wrapper, line);
          wrapper.append(line, block);

          return block;
        });

        gsap.set(lines, { opacity: 0 });
        gsap.set(blocks, {
          scaleX: 0,
          transformOrigin: "left center",
        });

        const timeline = gsap.timeline({ paused: animateOnScroll, delay });

        lines.forEach((line, index) => {
          const block = blocks[index];
          const lineStart = index * stagger;

          timeline
            .to(
              block,
              { scaleX: 1, duration, ease: "power4.inOut" },
              lineStart,
            )
            .set(line, { opacity: 1 }, lineStart + duration)
            .set(
              block,
              { transformOrigin: "right center" },
              lineStart + duration,
            )
            .to(
              block,
              { scaleX: 0, duration, ease: "power4.inOut" },
              lineStart + duration,
            );
        });

        const trigger = animateOnScroll
          ? ScrollTrigger.create({
              trigger: target,
              start: "top 88%",
              once: true,
              onEnter: () => timeline.play(),
            })
          : null;

        return () => {
          trigger?.kill();
          timeline.kill();
          split.revert();
        };
      });

      return () => motionPreference.revert();
    },
    {
      scope: containerRef,
      dependencies: [animateOnScroll, blockColor, delay, duration, stagger],
      revertOnUpdate: true,
    },
  );

  return (
    <div
      className={`text-reveal-root${className ? ` ${className}` : ""}`}
      ref={containerRef}
    >
      {children}
    </div>
  );
}
