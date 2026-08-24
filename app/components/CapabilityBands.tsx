"use client";

import { useState, type PointerEvent } from "react";

const capabilities = [
  {
    id: "frontend",
    title: "Frontend",
    summary: "React / Next.js / React Native",
    tools: [
      "JavaScript / TypeScript",
      "React / Next.js",
      "React Native",
      "Redux",
      "Tailwind CSS",
      "Material UI",
      "Framer Motion",
      "Angular",
      "HTML5 / CSS3",
      "UX / Accessibility",
    ],
  },
  {
    id: "backend",
    title: "Backend",
    summary: "Node.js / .NET / Spring Boot",
    tools: [
      "Node.js / Express.js",
      "NestJS",
      ".NET / ASP.NET",
      "Java / Spring Boot",
      "C / C++ / C#",
      "Golang",
      "Groovy",
      "PHP",
      "REST APIs / GraphQL",
      "WebSockets",
      "Auth / OAuth",
      "Postman",
    ],
  },
  {
    id: "data-ai",
    title: "Data + AI",
    summary: "PostgreSQL / Python / ML",
    tools: [
      "Python",
      "SQL",
      "PostgreSQL",
      "MongoDB",
      "Redis",
      "DynamoDB",
      "Firebase",
      "Prisma / Sequelize",
      "Pandas / NumPy",
      "Data Pipelines",
      "Basic ML",
    ],
  },
  {
    id: "cloud-delivery",
    title: "Cloud + Delivery",
    summary: "AWS / Kubernetes / CI/CD",
    tools: [
      "AWS · EC2 / S3 / Lambda / RDS",
      "Azure",
      "GCP",
      "Docker",
      "Kubernetes",
      "CI/CD",
      "Infrastructure as Code",
      "Jenkins",
      "GitHub Actions",
      "Git",
      "Agile",
      "Jest / Cypress",
      "Microsoft 365",
    ],
  },
] as const;

export default function CapabilityBands() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const handlePointerEnter = (
    event: PointerEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.pointerType === "mouse") {
      setActiveIndex(index);
    }
  };

  return (
    <div
      className="capability-bands"
      data-active={activeIndex ?? "none"}
    >
      {capabilities.map((capability, index) => {
        const isActive = activeIndex === index;
        const triggerId = `capability-${capability.id}-trigger`;
        const panelId = `capability-${capability.id}-panel`;

        return (
          <article
            className={`capability-band${isActive ? " is-active" : ""}`}
            key={capability.id}
          >
            <h3 className="capability-heading">
              <button
                id={triggerId}
                className="capability-trigger"
                type="button"
                aria-controls={panelId}
                aria-expanded={isActive}
                onClick={() =>
                  setActiveIndex((current) =>
                    current === index ? null : index,
                  )
                }
                onFocus={() => setActiveIndex(index)}
                onPointerEnter={(event) => handlePointerEnter(event, index)}
              >
                <span className="capability-title">{capability.title}</span>
                <span className="capability-summary">{capability.summary}</span>
                <span className="capability-marker" aria-hidden="true">
                  +
                </span>
              </button>
            </h3>

            <div
              id={panelId}
              className="capability-panel"
              role="region"
              aria-hidden={!isActive}
              aria-labelledby={triggerId}
            >
              <div className="capability-panel-clip">
                <div className="capability-details">
                  <div className="capability-toolset">
                    <span>Selected stack</span>
                    <ul aria-label={`${capability.title} tools`}>
                      {capability.tools.map((tool) => (
                        <li key={tool}>{tool}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
