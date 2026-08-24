import Image from "next/image";
import CapabilityBands from "./components/CapabilityBands";
import CountingNumber from "./components/CountingNumber";
import TextReveal from "./components/TextReveal";

const navigation = [
  { label: "home", href: "#top" },
  { label: "about", href: "#about" },
  { label: "skills", href: "#skills" },
  { label: "work", count: "04", href: "#work" },
];

function ArrowUpRight() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 19 19 5M8 5h11v11" />
    </svg>
  );
}

export default function Home() {
  return (
    <main id="top" className="portfolio-shell">
      <a className="skip-link" href="#hero-title">
        Skip to introduction
      </a>

      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Vanshaj home">
          VANSHAJ
        </a>

        <nav className="primary-nav" aria-label="Primary navigation">
          {navigation.map((item, index) => (
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
            {navigation.map((item, index) => (
              <a href={item.href} key={item.label}>
                <span>0{index + 1}</span>
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
            alt="Vanshaj looking upward"
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
          id="contact"
          className="contact-card"
          href="mailto:?subject=Let%27s%20build%20something"
          aria-label="Start a new email to Vanshaj"
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
              I work across the stack with a focus on clear architecture,
              responsive interaction, and software that remains easy to
              extend.
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
        className="work-placeholder"
        aria-label="Selected work"
      />
    </main>
  );
}
