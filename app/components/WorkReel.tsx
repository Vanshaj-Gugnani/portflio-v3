"use client";

import { useRef, useState, type CSSProperties } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ArrowUpRight from "./ArrowUpRight";
import { projects } from "../data/projects";

gsap.registerPlugin(useGSAP, SplitText, ScrollTrigger);

const REEL_QUERY =
  "(min-width: 901px) and (prefers-reduced-motion: no-preference)";

const VIDEO_MIME: Record<string, string> = {
  webm: "video/webm",
  mp4: "video/mp4",
  mov: "video/mp4",
  ogv: "video/ogg",
};

// The reel carries both WebM and MP4 captures, so the source type has to be
// derived. An unknown extension yields undefined, which drops the attribute and
// lets the browser sniff. A wrong type would make it skip the source outright.
function mimeFor(src: string) {
  return VIDEO_MIME[src.split(".").pop()?.toLowerCase() ?? ""];
}

/**
 * Playback speed for the captures. They were recorded at 4x to keep the files
 * small, which reads as frantic in the reel; half speed brings them closer to
 * real time. Both rates have to be set: a browser resets `playbackRate` to
 * `defaultPlaybackRate` when the media loads, so setting only the current rate
 * is silently undone the moment the file arrives.
 */
const PLAYBACK_RATE = 0.5;

function setRate(video: HTMLVideoElement) {
  video.defaultPlaybackRate = PLAYBACK_RATE;
  video.playbackRate = PLAYBACK_RATE;
}

/**
 * Scroll, as a fraction of viewport height, needed to advance one project.
 * The reel steps at the half-way point, so 0.6 means roughly 30vh of scroll
 * commits the next project. Lower feels lighter and quicker to page through.
 */
const STEP_VH = 0.6;

export default function WorkReel() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const triggerRef = useRef<ScrollTrigger | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const total = projects.length;

  useGSAP(
    () => {
      const track = trackRef.current;

      if (!track) return;

      const panels = panelRefs.current.filter(
        (panel): panel is HTMLElement => panel !== null,
      );

      const visible = new Set<number>();

      // play() is refused when the element has no data yet, and the rejection
      // is silent. Retry once it reports it can play, if the panel is still up.
      const requestPlay = (video: HTMLVideoElement, index: number) => {
        setRate(video);
        video.play().catch(() => {
          video.addEventListener(
            "canplay",
            () => {
              if (visible.has(index)) {
                // The load that produced this event is exactly what resets the
                // rate, so it is applied again rather than trusted from before.
                setRate(video);
                video.play().catch(() => {
                  // Low-power mode refuses outright. The poster stays.
                });
              }
            },
            { once: true },
          );
        });
      };

      // Playback and the active-panel state both key off visibility, so the
      // same observer serves the pinned reel and the stacked mobile layout.
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const index = panels.indexOf(entry.target as HTMLElement);

            if (index === -1) return;

            const video = videoRefs.current[index];

            if (entry.isIntersecting) {
              visible.add(index);
              setActiveIndex(index);
              if (video) requestPlay(video, index);
            } else {
              visible.delete(index);
              video?.pause();
            }
          });
        },
        { threshold: 0.55 },
      );

      panels.forEach((panel) => observer.observe(panel));

      const motionPreference = gsap.matchMedia();

      motionPreference.add(REEL_QUERY, () => {
        const reel = sectionRef.current;
        const mediaEls = panels.map((panel) =>
          panel.querySelector<HTMLElement>(".work-media-inner"),
        );
        const panelReveals = panels.map((panel) => {
          const targets = Array.from(
            panel.querySelectorAll<HTMLElement>(".work-reveal-text"),
          );
          const linkIcons = Array.from(
            panel.querySelectorAll<SVGElement>(".work-link svg"),
          );
          const splits: SplitText[] = [];
          const lines: HTMLElement[] = [];
          const blocks: HTMLElement[] = [];
          const phases: Array<"head" | "body" | "stack"> = [];
          const phaseIndexes: number[] = [];
          let headLineIndex = 0;
          let stackLineIndex = 0;
          let maxBodyLines = 0;

          targets.forEach((target) => {
            const phase = target.closest(".work-stack")
              ? "stack"
              : target.matches(
                    ".work-brief > .work-reveal-text, .work-link-label",
                  )
                ? "body"
                : "head";
            const split = SplitText.create(target, {
              type: "lines",
              linesClass: "text-reveal-line",
              lineThreshold: 0.1,
              tag: "span",
            });

            splits.push(split);

            (split.lines as HTMLElement[]).forEach((line, localLineIndex) => {
              const wrapper = document.createElement("span");
              const block = document.createElement("span");
              const parent = line.parentNode;

              wrapper.className = "text-reveal-line-wrapper";
              block.className = "text-reveal-block";
              block.style.backgroundColor = "var(--accent)";
              block.setAttribute("aria-hidden", "true");

              parent?.insertBefore(wrapper, line);
              wrapper.append(line, block);
              lines.push(line);
              blocks.push(block);
              phases.push(phase);

              if (phase === "head") {
                phaseIndexes.push(headLineIndex);
                headLineIndex += 1;
              } else if (phase === "stack") {
                phaseIndexes.push(stackLineIndex);
                stackLineIndex += 1;
              } else {
                phaseIndexes.push(localLineIndex);
                maxBodyLines = Math.max(maxBodyLines, localLineIndex + 1);
              }
            });
          });

          const bodyStart = headLineIndex * 0.06;
          const stackStart =
            bodyStart + Math.max(1, maxBodyLines) * 0.06 + 0.08;
          const starts = phases.map((phase, index) => {
            if (phase === "head") return phaseIndexes[index] * 0.06;
            if (phase === "body") {
              return bodyStart + phaseIndexes[index] * 0.06;
            }

            return stackStart + phaseIndexes[index] * 0.045;
          });

          return {
            blocks,
            bodyStart,
            linkIcons,
            lines,
            splits,
            starts,
            timeline: null as gsap.core.Timeline | null,
          };
        });

        // Scroll is an accumulator here, not a position. The track is never
        // tied to scroll offset, so a project is always fully centred: the
        // reel steps from one to the next and never rests part-way between.
        const steps = Math.max(1, panels.length - 1);
        const runway = () => Math.round(window.innerHeight * STEP_VH) * steps;
        const panelWidth = () => reel?.clientWidth ?? 0;

        let current = 0;

        // Overscale once so the arrival drift never exposes a media edge.
        gsap.set(mediaEls.filter(Boolean), { scale: 1.06 });

        // The first project is already present when the reel enters view. Every
        // later panel starts hidden and is painted in by the accent sweep when
        // its scroll step becomes authoritative.
        panelReveals.forEach(({ blocks, lines, linkIcons }, index) => {
          gsap.set(lines, { opacity: index === 0 ? 1 : 0 });
          gsap.set(linkIcons, { opacity: index === 0 ? 1 : 0 });
          gsap.set(blocks, {
            scaleX: 0,
            transformOrigin: "left center",
          });
        });

        const revealPanelText = (index: number) => {
          const reveal = panelReveals[index];

          if (!reveal || reveal.lines.length === 0) return;

          reveal.timeline?.kill();
          gsap.set(reveal.lines, { opacity: 0 });
          gsap.set(reveal.linkIcons, { opacity: 0 });
          gsap.set(reveal.blocks, {
            scaleX: 0,
            transformOrigin: "left center",
          });

          const duration = 0.42;
          // Let the horizontal media transition do its work first. Starting
          // the wipe near the end keeps the copy visually anchored instead of
          // letting the orange blocks ride in from the side with the track.
          const timeline = gsap.timeline({ delay: 0.42 });

          reveal.lines.forEach((line, lineIndex) => {
            const block = reveal.blocks[lineIndex];
            const lineStart = reveal.starts[lineIndex];

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

          timeline.to(
            reveal.linkIcons,
            { opacity: 1, duration: 0.18, ease: "power2.out" },
            reveal.bodyStart + duration,
          );

          reveal.timeline = timeline;
        };

        // The rule under the titles is drawn on the reel rather than inside a
        // panel, so it stays put while the track slides. Only its height has to
        // come from here: it is the head's bottom edge, which no stylesheet can
        // state without restating the panel padding, the title's line box and
        // the head's padding. offsetTop is layout-based, so the head's own
        // reveal transform does not skew it.
        const placeRule = () => {
          const head = panels[0]?.querySelector<HTMLElement>(".work-panel-head");

          if (!reel || !head) return;

          reel.style.setProperty(
            "--work-rule-y",
            `${head.offsetTop + head.offsetHeight}px`,
          );
        };

        placeRule();

        const goTo = (index: number) => {
          if (index === current) return;

          const direction = index > current ? 1 : -1;
          const outgoingReveal = panelReveals[current];

          outgoingReveal?.timeline?.kill();
          if (outgoingReveal) {
            gsap.set(outgoingReveal.lines, { opacity: 0 });
            gsap.set(outgoingReveal.linkIcons, { opacity: 0 });
            gsap.set(outgoingReveal.blocks, { scaleX: 0 });
          }

          current = index;

          // The step is authoritative for which project is showing. The
          // observer alone is not enough: land on the page bottom without
          // scrolling through the reel (a refresh restores scroll position)
          // and the last panel never crosses the visibility threshold, so the
          // counter would sit on 01 while the track shows the last project.
          setActiveIndex(index);

          gsap.to(track, {
            x: -index * panelWidth(),
            duration: 0.62,
            ease: "power3.out",
            overwrite: true,
          });

          // The incoming capture settles in behind its frame, so the step
          // reads as the project arriving rather than a slide changing.
          const incoming = mediaEls[index];

          if (incoming) {
            gsap.fromTo(
              incoming,
              { xPercent: direction * 5 },
              {
                xPercent: 0,
                duration: 0.85,
                ease: "power3.out",
                overwrite: true,
              },
            );
          }

          revealPanelText(index);
        };

        const trigger = ScrollTrigger.create({
          trigger: reel,
          start: "top top",
          end: () => `+=${runway()}`,
          pin: true,
          invalidateOnRefresh: true,
          // Without snap a viewer can rest a pixel either side of a step
          // boundary, where the smallest nudge flips the reel back and forth.
          snap:
            panels.length > 1
              ? {
                  snapTo: 1 / steps,
                  duration: { min: 0.15, max: 0.4 },
                  delay: 0.04,
                  ease: "power2.inOut",
                }
              : undefined,
          onUpdate: (self) => {
            // Round, so the step lands once the viewer is half way through a
            // step's worth of scroll. That is the "enough scroll" threshold.
            goTo(Math.round(self.progress * steps));
          },
          onRefresh: () => {
            gsap.set(track, { x: -current * panelWidth() });
            // Fires on resize, when every clamped value behind the head's
            // height may have changed.
            placeRule();
          },
        });

        triggerRef.current = trigger;

        return () => {
          trigger.kill();
          triggerRef.current = null;
          reel?.style.removeProperty("--work-rule-y");
          panelReveals.forEach(({ linkIcons, splits, timeline }) => {
            timeline?.kill();
            gsap.set(linkIcons, { clearProps: "opacity" });
            [...splits].reverse().forEach((split) => split.revert());
          });
          gsap.set(track, { clearProps: "x" });
          gsap.set(mediaEls.filter(Boolean), { clearProps: "transform" });
        };
      });

      return () => {
        observer.disconnect();
        motionPreference.revert();
      };
    },
    { scope: sectionRef },
  );

  // Keyboard users can reach links inside off-screen panels while the reel is
  // pinned. Bring the focused panel into view instead of leaving focus blind.
  const handleFocus = (index: number) => {
    const trigger = triggerRef.current;

    if (!trigger) return;

    const ratio = total > 1 ? index / (total - 1) : 0;
    const target = trigger.start + (trigger.end - trigger.start) * ratio;

    if (Math.abs(window.scrollY - target) < 8) return;

    window.scrollTo({ top: target, behavior: "smooth" });
  };

  return (
    <div className="work-reel" ref={sectionRef}>
      <div className="technical-grid work-grid" aria-hidden="true">
        <span className="cross cross-a" />
        <span className="cross cross-c" />
      </div>

      <div className="work-track" ref={trackRef}>
        {projects.map((project, index) => {
          const isActive = index === activeIndex;
          const hasVideo = Boolean(project.video);
          const hasFoot =
            Boolean(project.blurb) ||
            project.stack.length > 0 ||
            project.links.length > 0;

          return (
            <article
              aria-labelledby={`${project.id}-title`}
              className={`work-panel${isActive ? " is-active" : ""}`}
              key={project.id}
              onFocusCapture={() => handleFocus(index)}
              ref={(node) => {
                panelRefs.current[index] = node;
              }}
            >
              <header className="work-panel-head">
                <h3
                  className="work-title work-reveal-text"
                  id={`${project.id}-title`}
                >
                  {project.title}
                </h3>
                {project.year ? (
                  <p className="work-year work-reveal-text">{project.year}</p>
                ) : null}
              </header>

              <div className="work-media-slot">
                <div
                  className="work-media"
                  data-empty={!hasVideo}
                  style={
                    project.aspect
                      ? ({ "--work-aspect": project.aspect } as CSSProperties)
                      : undefined
                  }
                >
                  {hasVideo ? (
                    <video
                      className="work-media-inner"
                      loop
                      muted
                      playsInline
                      preload="metadata"
                      poster={project.poster ?? undefined}
                      ref={(node) => {
                        videoRefs.current[index] = node;

                        if (node) setRate(node);
                      }}
                    >
                      <source
                        src={project.video ?? ""}
                        type={
                          project.video ? mimeFor(project.video) : undefined
                        }
                      />
                      Your browser cannot play this recording. Open the live
                      site link below to see the project.
                    </video>
                  ) : (
                    <p className="work-media-empty">Capture in progress</p>
                  )}
                </div>
              </div>

              {hasFoot ? (
                <footer className="work-panel-foot">
                  <div className="work-brief">
                    {project.blurb ? (
                      <p className="work-reveal-text">{project.blurb}</p>
                    ) : null}
                    {project.stack.length > 0 ? (
                      <ul
                        className="work-stack"
                        aria-label={`${project.title} stack`}
                      >
                        {project.stack.map((tool, toolIndex) => (
                          <li key={tool}>
                            <span className="work-reveal-text">
                              {toolIndex > 0 ? (
                                <span
                                  aria-hidden="true"
                                  className="work-stack-divider"
                                >
                                  /
                                </span>
                              ) : null}
                              {tool}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>

                  {project.links.length > 0 ? (
                    <nav
                      className="work-links"
                      aria-label={`${project.title} links`}
                    >
                      {project.links.map((link) => (
                        <a
                          className="work-link"
                          href={link.href}
                          key={link.href}
                          rel="noreferrer noopener"
                          target="_blank"
                        >
                          <span className="work-link-label work-reveal-text">
                            {link.label}
                          </span>
                          <ArrowUpRight />
                        </a>
                      ))}
                    </nav>
                  ) : null}
                </footer>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
