import { useEffect, useRef, useState } from "react";
import { GlowCard } from "@/components/ui/spotlight-card";
import { featuredProjects, getProjectImages } from "../data/projects";

function slashTitle(title: string) {
  return title.split(" ").join(" / ");
}

type SlideDir = 1 | -1;

function ProjectArrow({
  direction,
}: {
  direction: "up" | "down" | "left" | "right";
}) {
  const rotation =
    direction === "left"
      ? ""
      : direction === "right"
        ? "rotate(180deg)"
        : direction === "up"
          ? "rotate(90deg)"
          : "rotate(-90deg)";

  return (
    <svg
      className="projects-arrow-svg"
      width="20"
      height="20"
      viewBox="0 0 18 16"
      fill="none"
      aria-hidden="true"
      style={{ transform: rotation }}
    >
      <polyline points="10.5 3.5 5.5 8 10.5 12.5" />
    </svg>
  );
}

export default function Projects() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [repoDescriptions, setRepoDescriptions] = useState<Record<string, string>>(
    {},
  );
  const [transition, setTransition] = useState<{
    from: number;
    to: number;
    dir: SlideDir;
  } | null>(null);
  const [imageTransition, setImageTransition] = useState<{
    from: number;
    to: number;
    dir: SlideDir;
  } | null>(null);
  const transitionTimerRef = useRef<number | null>(null);
  const imageTransitionTimerRef = useRef<number | null>(null);
  const queuedTargetRef = useRef<number | null>(null);
  const queuedImageRef = useRef<number | null>(null);

  const active = featuredProjects[activeIndex];
  const activeImages = getProjectImages(active);
  const currentImage = activeImages[activeImageIndex] ?? active.image;
  const activeDescription =
    repoDescriptions[active.id] ??
    (active.link?.includes("github.com") ? active.description : active.longDescription);

  const isFirstProject = activeIndex === 0;
  const isLastProject = activeIndex === featuredProjects.length - 1;
  const isFirstImage = activeImageIndex === 0;
  const isLastImage = activeImageIndex >= activeImages.length - 1;
  const hasMultipleImages = activeImages.length > 1;

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
        featuredProjects.map(async (project) => {
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
      if (imageTransitionTimerRef.current) {
        window.clearTimeout(imageTransitionTimerRef.current);
      }
      queuedTargetRef.current = null;
      queuedImageRef.current = null;
    };
  }, []);

  useEffect(() => {
    setActiveImageIndex(0);
    setImageTransition(null);
    queuedImageRef.current = null;
  }, [activeIndex]);

  useEffect(() => {
    if (activeImageIndex > activeImages.length - 1) {
      setActiveImageIndex(Math.max(0, activeImages.length - 1));
    }
  }, [activeImageIndex, activeImages.length]);

  const runTransition = (from: number, to: number) => {
    const dir: SlideDir = to > from ? 1 : -1;
    setImageTransition(null);
    queuedImageRef.current = null;
    setTransition({ from, to, dir });
    setActiveIndex(to);
    setActiveImageIndex(0);
    transitionTimerRef.current = window.setTimeout(() => {
      setTransition(null);
      transitionTimerRef.current = null;
      const queued = queuedTargetRef.current;
      queuedTargetRef.current = null;
      if (queued !== null && queued !== to) {
        runTransition(to, queued);
      }
    }, 520);
  };

  const runImageTransition = (from: number, to: number) => {
    const dir: SlideDir = to > from ? 1 : -1;
    setImageTransition({ from, to, dir });
    setActiveImageIndex(to);
    imageTransitionTimerRef.current = window.setTimeout(() => {
      setImageTransition(null);
      imageTransitionTimerRef.current = null;
      const queued = queuedImageRef.current;
      queuedImageRef.current = null;
      if (queued !== null && queued !== to) {
        runImageTransition(to, queued);
      }
    }, 520);
  };

  const goTo = (idx: number) => {
    const clamped = Math.max(0, Math.min(featuredProjects.length - 1, idx));
    if (clamped === activeIndex && !transition) return;
    if (transition) {
      queuedTargetRef.current = clamped;
      return;
    }
    runTransition(activeIndex, clamped);
  };

  const goToImage = (idx: number) => {
    const clamped = Math.max(0, Math.min(activeImages.length - 1, idx));
    if (clamped === activeImageIndex && !imageTransition) return;
    if (imageTransition) {
      queuedImageRef.current = clamped;
      return;
    }
    if (transition) return;
    runImageTransition(activeImageIndex, clamped);
  };

  const renderGalleryImage = (src: string, alt: string) => (
    <img src={src} alt={alt} loading="lazy" />
  );

  const renderGallery = () => {
    const altBase = `${active.title} preview`;

    if (transition) {
      const fromProject = featuredProjects[transition.from];
      const toProject = featuredProjects[transition.to];
      const fromImage = getProjectImages(fromProject)[0] ?? fromProject.image;
      const toImage = getProjectImages(toProject)[0] ?? toProject.image;

      return (
        <>
          <article
            key={`out-${transition.from}-${transition.to}-${transition.dir}`}
            className={`projects-visual-item projects-visual-layer ${transition.dir === 1 ? "projects-slide-out-left" : "projects-slide-out-right"}`}
          >
            {renderGalleryImage(fromImage, `${fromProject.title} preview`)}
          </article>
          <article
            key={`in-${transition.from}-${transition.to}-${transition.dir}`}
            className={`projects-visual-item projects-visual-layer ${transition.dir === 1 ? "projects-slide-in-right" : "projects-slide-in-left"}`}
          >
            {renderGalleryImage(toImage, `${toProject.title} preview`)}
          </article>
        </>
      );
    }

    if (imageTransition) {
      const fromSrc = activeImages[imageTransition.from] ?? currentImage;
      const toSrc = activeImages[imageTransition.to] ?? currentImage;

      return (
        <>
          <article
            key={`img-out-${imageTransition.from}-${imageTransition.to}-${imageTransition.dir}`}
            className={`projects-visual-item projects-visual-layer ${imageTransition.dir === 1 ? "projects-slide-out-up" : "projects-slide-out-down"}`}
          >
            {renderGalleryImage(fromSrc, altBase)}
          </article>
          <article
            key={`img-in-${imageTransition.from}-${imageTransition.to}-${imageTransition.dir}`}
            className={`projects-visual-item projects-visual-layer ${imageTransition.dir === 1 ? "projects-slide-in-up" : "projects-slide-in-down"}`}
          >
            {renderGalleryImage(toSrc, altBase)}
          </article>
        </>
      );
    }

    return (
      <article className="projects-visual-item projects-visual-layer">
        {renderGalleryImage(currentImage, altBase)}
      </article>
    );
  };

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
              <span className="section-label">{featuredProjects.length} projects</span>
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
              {featuredProjects.map((project, idx) => (
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
                  {active.linkLabel ?? "View repository"}
                </a>
              ) : null}
            </div>

            <div className="projects-visual-wrap">
              <GlowCard
                customSize
                glowColor="projects"
                className="projects-visual-border"
              >
                <div className="projects-visual-scroll">
                  <div className="projects-visual-stack">{renderGallery()}</div>
                </div>
              </GlowCard>

              <div className="projects-image-controls">
                <div className="projects-image-nav" aria-label="Gallery navigation">
                  <button
                    type="button"
                    className="projects-image-control-btn"
                    onClick={() => goToImage(activeImageIndex - 1)}
                    disabled={!hasMultipleImages || isFirstImage || !!transition}
                    aria-label="Previous image"
                  >
                    <ProjectArrow direction="up" />
                  </button>

                  <div className="projects-image-nav-row">
                    <button
                      type="button"
                      className="projects-image-control-btn"
                      onClick={() => goTo(activeIndex - 1)}
                      disabled={isFirstProject || !!imageTransition}
                      aria-label="Previous project"
                    >
                      <ProjectArrow direction="left" />
                    </button>
                    <button
                      type="button"
                      className="projects-image-control-btn"
                      onClick={() => goToImage(activeImageIndex + 1)}
                      disabled={!hasMultipleImages || isLastImage || !!transition}
                      aria-label="Next image"
                    >
                      <ProjectArrow direction="down" />
                    </button>
                    <button
                      type="button"
                      className="projects-image-control-btn"
                      onClick={() => goTo(activeIndex + 1)}
                      disabled={isLastProject || !!imageTransition}
                      aria-label="Next project"
                    >
                      <ProjectArrow direction="right" />
                    </button>
                  </div>
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
