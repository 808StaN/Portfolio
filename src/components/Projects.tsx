import { useEffect, useRef, useState } from "react";
import { projects } from "../data/projects";

function slashTitle(title: string) {
  return title.split(" ").join(" / ");
}

export default function Projects() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [repoDescriptions, setRepoDescriptions] = useState<Record<string, string>>(
    {},
  );
  const [transition, setTransition] = useState<{
    from: number;
    to: number;
    dir: 1 | -1;
  } | null>(null);
  const transitionTimerRef = useRef<number | null>(null);

  const active = projects[activeIndex];
  const activeDescription = repoDescriptions[active.id] ?? active.description;

  useEffect(() => {
    const controller = new AbortController();

    const readRepoPath = (url?: string) => {
      if (!url) return null;
      const match = url.match(/github\.com\/([^/]+)\/([^/#?]+)/i);
      if (!match) return null;
      return `${match[1]}/${match[2]}`;
    };

    const loadDescriptions = async () => {
      const entries = await Promise.all(
        projects.map(async (project) => {
          const repoPath = readRepoPath(project.link);
          if (!repoPath) return [project.id, ""] as const;
          try {
            const response = await fetch(`https://api.github.com/repos/${repoPath}`, {
              signal: controller.signal,
            });
            if (!response.ok) return [project.id, ""] as const;
            const data = (await response.json()) as { description?: string };
            return [project.id, (data.description || "").trim()] as const;
          } catch {
            return [project.id, ""] as const;
          }
        }),
      );

      if (controller.signal.aborted) return;

      const next: Record<string, string> = {};
      for (const [id, description] of entries) {
        if (description) next[id] = description;
      }
      setRepoDescriptions(next);
    };

    loadDescriptions();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        window.clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  const goTo = (idx: number) => {
    const clamped = Math.max(0, Math.min(projects.length - 1, idx));
    if (clamped === activeIndex) return;
    if (transition) return;
    const dir: 1 | -1 = clamped > activeIndex ? 1 : -1;
    setTransition({ from: activeIndex, to: clamped, dir });
    setActiveIndex(clamped);
    transitionTimerRef.current = window.setTimeout(() => {
      setTransition(null);
      transitionTimerRef.current = null;
    }, 520);
  };

  const isFirst = activeIndex === 0;
  const isLast = activeIndex === projects.length - 1;

  return (
    <section id="work" className="section-shell projects-monopo relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(120% 92% at 50% 60%, ${active.accent}2e 0%, rgba(10,16,38,0.2) 45%, transparent 75%)`,
        }}
      />

      <div className="section-inner projects-inner relative z-10">
        <div className="projects-stage">
          <div className="projects-header">
            <div className="flex items-center gap-3 mb-5">
              <span className="section-label">Selected Work</span>
              <div
                className="flex-1 h-px"
                style={{ background: "rgba(255,255,255,0.07)" }}
              />
              <span className="section-label">{projects.length} projects</span>
            </div>

            <h2
              className="section-title text-white/90 max-w-[13ch]"
              style={{ fontSize: "clamp(1.95rem, 3.7vw, 3.95rem)" }}
            >
              Things I have
              <br />
              <span style={{ color: "rgba(255,255,255,0.58)" }}>
                built and shipped.
              </span>
            </h2>
          </div>

          <div className="projects-layout">
            <div className="projects-rail">
              {projects.map((project, idx) => (
                <button
                  key={project.id}
                  onClick={() => goTo(idx)}
                  aria-label={`Go to ${project.title}`}
                  className={`projects-rail-dot ${idx === activeIndex ? "is-active" : ""}`}
                />
              ))}
            </div>

            <div className="projects-meta">
              <h2 className="projects-title">{slashTitle(active.title)}</h2>
              <p className="projects-category">{active.category}</p>
              <p className="projects-description">{activeDescription}</p>
              <div className="projects-tagline">
                {active.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              {active.link ? (
                <a
                  href={active.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="projects-repo-btn"
                >
                  View repository
                </a>
              ) : null}
            </div>

            <div className="projects-visual-wrap">
              <div className="projects-visual-scroll">
                <div className="projects-visual-stack">
                  {transition ? (
                    <>
                      <article
                        className={`projects-visual-item projects-visual-layer ${transition.dir === 1 ? "projects-slide-out-left" : "projects-slide-out-right"}`}
                      >
                        <img
                          src={projects[transition.from].image}
                          alt={`${projects[transition.from].title} preview`}
                          loading="lazy"
                        />
                      </article>
                      <article
                        className={`projects-visual-item projects-visual-layer ${transition.dir === 1 ? "projects-slide-in-right" : "projects-slide-in-left"}`}
                      >
                        <img
                          src={projects[transition.to].image}
                          alt={`${projects[transition.to].title} preview`}
                          loading="lazy"
                        />
                      </article>
                    </>
                  ) : (
                    <article className="projects-visual-item projects-visual-layer">
                      <img
                        src={active.image}
                        alt={`${active.title} preview`}
                        loading="lazy"
                      />
                    </article>
                  )}
                </div>
              </div>

              <div className="projects-image-controls">
                <div className="projects-image-step-controls">
                  <button
                    type="button"
                    className="projects-image-control-btn"
                    onClick={() => goTo(activeIndex - 1)}
                    disabled={isFirst || !!transition}
                    aria-label="Previous project"
                  >
                    <svg
                      className="projects-arrow-svg"
                      width="20"
                      height="20"
                      viewBox="0 0 18 16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <polyline points="10.5 3.5 5.5 8 10.5 12.5" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="projects-image-control-btn"
                    onClick={() => goTo(activeIndex + 1)}
                    disabled={isLast || !!transition}
                    aria-label="Next project"
                  >
                    <svg
                      className="projects-arrow-svg"
                      width="20"
                      height="20"
                      viewBox="0 0 14 16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <polyline points="5.5 3.5 10.5 8 5.5 12.5" />
                    </svg>
                  </button>
                </div>

                <a
                  href="https://github.com/808StaN?tab=repositories"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="projects-discover-btn projects-discover-inline"
                >
                  Discover all my projects
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
