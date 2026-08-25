import Image from "next/image";
import ArrowUpRight from "./components/ArrowUpRight";
import CapabilityBands from "./components/CapabilityBands";
import ContactForm from "./components/ContactForm";
import SmoothAnchors from "./components/SmoothAnchors";
import CountingNumber from "./components/CountingNumber";
import TextReveal from "./components/TextReveal";
import WorkReel from "./components/WorkReel";
import { projects } from "./data/projects";
import { contact, mailtoHref } from "./data/contact";
import { PORTRAIT } from "./lib/site";

const navigation = [
  { label: "home", href: "#top" },
  { label: "about", href: "#about" },
  { label: "skills", href: "#skills" },
  {
    label: "work",
    count: String(projects.length).padStart(2, "0"),
    href: "#work",
  },
  { label: "contact", href: "#contact" },
];

const primaryNavigation = navigation.filter(
  (item) => item.href !== "#contact",
);

export default function Home() {
  const mailto = mailtoHref(contact.email);
  const socials = contact.socials.filter((social) => social.href);

  return (
    <main id="top" className="portfolio-shell">
      <SmoothAnchors />

      <a className="skip-link" href="#hero-title">
        Skip to introduction
      </a>

      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Vanshaj home">
          VANSHAJ
        </a>

        <nav className="primary-nav" aria-label="Primary navigation">
          {primaryNavigation.map((item, index) => (
            <a
              href={item.href}
              key={item.label}
              aria-current={index === 0 ? "page" : undefined}
            >
              {item.label}
              {item.count ? <sup>({item.count})</sup> : null}
            </a>
          ))}
        </nav>

        <details className="menu-drawer">
          <summary aria-label="Open navigation menu">
            <span />
            <span />
          </summary>
          <nav className="menu-panel" aria-label="Menu navigation">
            {navigation.map((item) => (
              <a href={item.href} key={item.label}>
                {item.label}
              </a>
            ))}
          </nav>
        </details>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="technical-grid" aria-hidden="true">
          <span className="cross cross-a" />
          <span className="cross cross-b" />
          <span className="cross cross-c" />
          <span className="cross cross-d" />
          <span className="cross cross-e" />
          <span className="cross cross-f" />
        </div>

        <div className="accent-cells" aria-hidden="true">
          <span className="accent-cell accent-cell-a" />
          <span className="accent-cell accent-cell-b" />
        </div>

        <p className="ghost-type" aria-hidden="true">
          VANSHAJ
        </p>

        <div className="portrait-wrap">
          <Image
            className="portrait"
            src="/Images/vanshaj_v3.png"
            alt={PORTRAIT.alt}
            width={2664}
            height={2664}
            sizes="(max-width: 720px) 118vw, (max-width: 1200px) 82vw, 1040px"
            priority
          />
        </div>

        <div className="intro-copy">
          <TextReveal
            animateOnScroll={false}
            blockColor="var(--accent)"
            delay={0.55}
            duration={0.55}
            stagger={0.1}
          >
            <p>
              I build fast, thoughtful digital products that people{" "}
              <span className="intro-accent">enjoy using.</span>
            </p>
          </TextReveal>
        </div>

        <div className="name-lockup">
          <span>FULL STACK DEVELOPER</span>
          <TextReveal
            animateOnScroll={false}
            blockColor="var(--paper)"
            className="hero-title-reveal"
            delay={0.35}
          >
            <h1 id="hero-title">VANSHAJ</h1>
          </TextReveal>
        </div>

        <a
          className="contact-card"
          href="#contact"
          aria-label="Go to the contact form"
        >
          <span className="contact-action">
            Let&apos;s build something
            <span className="arrow-box">
              <ArrowUpRight />
            </span>
          </span>
        </a>

      </section>

      <section
        id="about"
        className="about-section"
        aria-labelledby="about-title"
      >
        <div className="about-frame">
          <div className="about-statement">
            <TextReveal>
              <h2 id="about-title">
                I build <span className="about-accent">complete web products</span>,
                from resilient interfaces to the systems behind them.
              </h2>
            </TextReveal>
            <p>
              I&apos;m Vanshaj Gugnani, a full stack developer working with
              founders and teams in Toronto and across Canada. I focus on clear
              architecture, responsive interaction, and software that stays
              easy to extend.
            </p>
          </div>

          <ul className="about-capabilities" aria-label="Core capabilities">
            <li>
              <h3>Frontend architecture</h3>
              <p>
                Responsive interfaces, reusable component systems, accessible
                interactions, and deliberate performance.
              </p>
            </li>
            <li>
              <h3>Backend systems</h3>
              <p>
                Application logic, APIs, data flow, and integrations designed
                around clear boundaries.
              </p>
            </li>
            <li>
              <h3>Performance and accessibility</h3>
              <p>
                Fast loading, stable layouts, keyboard support, and
                reduced-motion behavior treated as core engineering work.
              </p>
            </li>
          </ul>
        </div>

        <ul className="about-metrics" aria-label="Experience metrics">
          <li aria-label="5 plus years of experience">
            <p className="about-metric-value" aria-hidden="true">
              <CountingNumber value={5} suffix="+" />
            </p>
            <p className="about-metric-label" aria-hidden="true">
              Years of experience
            </p>
          </li>
          <li aria-label="20 plus projects completed">
            <p className="about-metric-value" aria-hidden="true">
              <CountingNumber value={20} suffix="+" delay={0.08} />
            </p>
            <p className="about-metric-label" aria-hidden="true">
              Projects completed
            </p>
          </li>
          <li aria-label="10 plus AI-powered solutions">
            <p className="about-metric-value" aria-hidden="true">
              <CountingNumber value={10} suffix="+" delay={0.16} />
            </p>
            <p className="about-metric-label" aria-hidden="true">
              AI-powered solutions
            </p>
          </li>
          <li aria-label="99.9 percent application uptime">
            <p className="about-metric-value" aria-hidden="true">
              <CountingNumber
                value={99.9}
                decimalPlaces={1}
                suffix="%"
                delay={0.24}
              />
            </p>
            <p className="about-metric-label" aria-hidden="true">
              Application uptime
            </p>
          </li>
        </ul>
      </section>

      <section
        id="skills"
        className="skills-section"
        aria-labelledby="skills-title"
      >
        <div className="skills-intro">
          <TextReveal>
            <h2 id="skills-title">
              I work across the{" "}
              <span className="skills-accent">whole system.</span>
            </h2>
          </TextReveal>
        </div>

        <CapabilityBands />
      </section>

      <section
        id="work"
        className="work-section"
        aria-labelledby="work-title"
      >
        <div className="work-intro">
          <TextReveal>
            <h2 id="work-title">
              Projects I took{" "}
              <span className="work-accent">start to finish.</span>
            </h2>
          </TextReveal>
        </div>

        <WorkReel />
      </section>

      <section
        id="contact"
        className="contact-section"
        aria-labelledby="contact-title"
      >
        <div className="contact-intro">
          <TextReveal>
            <h2 id="contact-title">
              Tell me what you&apos;re{" "}
              <span className="contact-accent">working on.</span>
            </h2>
          </TextReveal>
        </div>

        <ContactForm email={contact.email} mailto={mailto} />
      </section>

      <footer className="site-footer">
        <div className="footer-main">
          {mailto ? (
            <a className="footer-email" href={mailto}>
              {contact.email}
              <ArrowUpRight />
            </a>
          ) : null}

          {socials.length > 0 ? (
            <nav className="footer-social" aria-label="Elsewhere">
              {socials.map((social) => (
                <a
                  href={social.href}
                  key={social.label}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  {social.label}
                </a>
              ))}
            </nav>
          ) : null}
        </div>

        <p className="footer-wordmark" aria-hidden="true">
          VANSHAJ
        </p>
      </footer>
    </main>
  );
}
