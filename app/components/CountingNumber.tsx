"use client";

import { memo, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type CountingNumberProps = {
  value: number;
  decimalPlaces?: number;
  suffix?: string;
  delay?: number;
  duration?: number;
};

function formatValue(value: number, decimalPlaces: number, suffix: string) {
  const number =
    decimalPlaces > 0
      ? value.toFixed(decimalPlaces)
      : Math.round(value).toString();

  return `${number}${suffix}`;
}

const CountingNumber = memo(function CountingNumber({
  value,
  decimalPlaces = 0,
  suffix = "",
  delay = 0,
  duration = 1.8,
}: CountingNumberProps) {
  const numberRef = useRef<HTMLSpanElement>(null);
  const finalText = formatValue(value, decimalPlaces, suffix);

  useGSAP(
    () => {
      const element = numberRef.current;

      if (!element) return;

      const motionPreference = gsap.matchMedia();

      motionPreference.add("(prefers-reduced-motion: no-preference)", () => {
        const progress = { value: 0 };

        element.textContent = formatValue(0, decimalPlaces, suffix);

        const tween = gsap.to(progress, {
          value,
          duration,
          delay,
          ease: "power3.out",
          paused: true,
          onUpdate: () => {
            element.textContent = formatValue(
              progress.value,
              decimalPlaces,
              suffix,
            );
          },
          onComplete: () => {
            element.textContent = finalText;
          },
        });

        const trigger = ScrollTrigger.create({
          trigger: element,
          start: "top 92%",
          once: true,
          onEnter: () => tween.play(),
        });

        return () => {
          trigger.kill();
          tween.kill();
          element.textContent = finalText;
        };
      });

      return () => motionPreference.revert();
    },
    {
      scope: numberRef,
      dependencies: [decimalPlaces, delay, duration, finalText, suffix, value],
      revertOnUpdate: true,
    },
  );

  return <span ref={numberRef}>{finalText}</span>;
});

export default CountingNumber;
