import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { GlowCard } from "@/components/ui/spotlight-card";
import {
  featuredProjects,
  getProjectImages,
  type Project,
  type ProjectImage,
} from "../data/projects";
import SectionShaderBackground from "./SectionShaderBackground";

const easeOut = [0.16, 1, 0.3, 1] as const;
const PROJECT_IMAGE_SIZES = "(max-width: 768px) calc(100vw - 32px), (max-width: 1200px) 70vw, 1100px";

function slashTitle(title: string) {
  return title.split(" ").join(" / ");
}

type SlideDir = 1 | -1;
type ImageTransition = {
  from: number;
  to: number;
  dir: SlideDir;
};

function ProjectArrow({ direction }: { direction: "left" | "right" }) {
  const rotation = direction === "left" ? "" : "rotate(180deg)";

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
  const [activeImageIndexes, setActiveImageIndexes] = useState<
    Record<string, number>
  >({});
  const [repoDescriptions, setRepoDescriptions] = useState<Record<string, string>>(
    {},
  );
  const [imageTransitions, setImageTransitions] = useState<
    Record<string, ImageTransition | undefined>
  >({});
  const [warmedProjectIds, setWarmedProjectIds] = useState<Set<string>>(
    () => new Set(),
  );
  const imageTransitionTimersRef = useRef<Record<string, number | undefined>>({});
  const queuedImagesRef = useRef<Record<string, number | undefined>>({});
  const revealRef = useRef<HTMLDivElement>(null);
  const inView = useInView(revealRef, { once: true, margin: "-80px" });

  const warmProject = (projectId: string) => {
    setWarmedProjectIds((current) => {
      if (current.has(projectId)) return current;
      const next = new Set(current);
      next.add(projectId);
      return next;
    });
  };

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
      Object.values(imageTransitionTimersRef.current).forEach((timer) => {
        if (timer) window.clearTimeout(timer);
      });
      imageTransitionTimersRef.current = {};
      queuedImagesRef.current = {};
    };
  }, []);

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-project-id]"),
    );
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const projectId = (entry.target as HTMLElement).dataset.projectId;
          if (projectId) warmProject(projectId);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "700px 0px" },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const getActiveImageIndex = (project: Project) => {
    const images = getProjectImages(project);
    const requestedIndex = activeImageIndexes[project.id] ?? 0;
    return Math.max(0, Math.min(images.length - 1, requestedIndex));
  };

  const getProjectDescription = (project: Project) =>
    repoDescriptions[project.id] ??
    (project.link?.includes("github.com")
      ? project.description
      : project.longDescription);

  const runImageTransition = (project: Project, from: number, to: number) => {
    const dir: SlideDir = to > from ? 1 : -1;

    setImageTransitions((current) => ({
      ...current,
      [project.id]: { from, to, dir },
    }));
    setActiveImageIndexes((current) => ({ ...current, [project.id]: to }));

    imageTransitionTimersRef.current[project.id] = window.setTimeout(() => {
      setImageTransitions((current) => ({
        ...current,
        [project.id]: undefined,
      }));
      imageTransitionTimersRef.current[project.id] = undefined;

      const queued = queuedImagesRef.current[project.id];
      queuedImagesRef.current[project.id] = undefined;
      if (queued !== undefined && queued !== to) {
        runImageTransition(project, to, queued);
      }
    }, 520);
  };

  const goToImage = (project: Project, idx: number) => {
    warmProject(project.id);
    const images = getProjectImages(project);
    const currentIndex = getActiveImageIndex(project);
    const clamped = Math.max(0, Math.min(images.length - 1, idx));
    const activeTransition = imageTransitions[project.id];

    if (clamped === currentIndex && !activeTransition) return;
    if (activeTransition) {
      queuedImagesRef.current[project.id] = clamped;
      return;
    }

    runImageTransition(project, currentIndex, clamped);
  };

  const renderGalleryImage = (image: ProjectImage, alt: string, eager: boolean) => (
    <img
      src={image.src1100}
      srcSet={`${image.src1100} 1100w, ${image.srcOriginal} 1920w`}
      sizes={PROJECT_IMAGE_SIZES}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
    />
  );

  const getGalleryLayerClass = (
    imageIndex: number,
    activeImageIndex: number,
    imageTransition?: ImageTransition,
  ) => {
    const classes = ["projects-visual-item", "projects-visual-layer"];

    if (!imageTransition) {
      classes.push(imageIndex === activeImageIndex ? "projects-visual-active" : "projects-visual-idle");
      return classes.join(" ");
    }

    if (imageIndex === imageTransition.from) {
      classes.push(
        imageTransition.dir === 1 ? "projects-slide-out-left" : "projects-slide-out-right",
      );
    } else if (imageIndex === imageTransition.to) {
      classes.push(
        imageTransition.dir === 1 ? "projects-slide-in-right" : "projects-slide-in-left",
      );
    } else {
      classes.push("projects-visual-idle");
    }

    return classes.join(" ");
  };

  const renderGallery = (project: Project) => {
    const images = getProjectImages(project);
    const activeImageIndex = getActiveImageIndex(project);
    const imageTransition = imageTransitions[project.id];
    const altBase = `${project.title} preview`;
    const warmed = warmedProjectIds.has(project.id) || Boolean(imageTransition);
    const visibleImages = warmed
      ? images.map((image, imageIndex) => ({ image, imageIndex }))
      : [{ image: images[activeImageIndex] ?? project.image, imageIndex: activeImageIndex }];

    return (
      <>
        {visibleImages.map(({ image, imageIndex }) => (
          <article
            key={`${project.id}-image-${imageIndex}`}
            className={getGalleryLayerClass(imageIndex, activeImageIndex, imageTransition)}
          >
            {renderGalleryImage(image, `${altBase} ${imageIndex + 1}`, warmed)}
          </article>
        ))}
      </>
    );
  };

  return (
    <section id="work" className="projects-monopo relative">
      <div className="projects-list" ref={revealRef}>
        {featuredProjects.map((project, index) => {
          const images = getProjectImages(project);
          const activeImageIndex = getActiveImageIndex(project);
          const activeTransition = imageTransitions[project.id];
          const isFirstImage = activeImageIndex === 0;
          const isLastImage = activeImageIndex >= images.length - 1;
          const hasMultipleImages = images.length > 1;
          const reversed = index % 2 === 1;

          return (
            <article
              key={project.id}
              className="section-tilt-section projects-project-section relative"
              data-section-tilt
              data-section-color={project.color}
              data-project-id={project.id}
            >
              <div className="section-tilt-panel projects-project-panel">
                <div className="section-shader-layer" aria-hidden="true">
                  <SectionShaderBackground color={project.color} />
                </div>

                <div className="section-tilt-container section-inner projects-inner projects-project-inner relative z-10">
                  <div className="projects-header">
                    <motion.h2
                      className="section-title text-white/90 max-w-[13ch]"
                      style={{ fontSize: "clamp(1.95rem, 3.7vw, 3.95rem)" }}
                      initial={{ opacity: 0, y: 30 }}
                      animate={inView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.8, delay: 0.1, ease: easeOut }}
                    >
                      Things I have
                      <br />
                      <span style={{ color: "rgba(255,255,255,0.58)" }}>
                        built and shipped
                      </span>
                    </motion.h2>
                  </div>

                  <div className={`projects-layout ${reversed ? "is-reversed" : ""}`}>
                    <motion.div
                      className="projects-meta"
                      initial={{ opacity: 0, y: 24 }}
                      animate={inView ? { opacity: 1, y: 0 } : {}}
                      transition={{
                        duration: 0.8,
                        delay: 0.22,
                        ease: easeOut,
                      }}
                    >
                      <h2 className="projects-title">{slashTitle(project.title)}</h2>
                      <p className="projects-category">{project.category}</p>
                      <p className="projects-description">
                        {getProjectDescription(project)}
                      </p>
                      <div className="projects-tagline">
                        {project.tags.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                      {project.link ? (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="projects-repo-btn"
                        >
                          {project.linkLabel ?? "View repository"}
                        </a>
                      ) : null}
                    </motion.div>

                    <motion.div
                      className="projects-visual-wrap"
                      initial={{ opacity: 0, y: 32 }}
                      animate={inView ? { opacity: 1, y: 0 } : {}}
                      transition={{
                        duration: 0.85,
                        delay: 0.28,
                        ease: easeOut,
                      }}
                    >
                      <GlowCard
                        customSize
                        glowColor={project.glowColor}
                        className="projects-visual-border"
                      >
                        <div className="projects-visual-scroll">
                          <div className="projects-visual-stack">
                            {renderGallery(project)}
                          </div>
                        </div>
                      </GlowCard>

                      <div className="projects-image-controls">
                        <div
                          className="projects-image-nav"
                          aria-label={`${project.title} gallery navigation`}
                        >
                          <button
                            type="button"
                            className="projects-image-control-btn"
                            onClick={() => goToImage(project, activeImageIndex - 1)}
                            disabled={
                              !hasMultipleImages || isFirstImage || !!activeTransition
                            }
                            aria-label={`Previous ${project.title} image`}
                          >
                            <ProjectArrow direction="left" />
                          </button>
                          <button
                            type="button"
                            className="projects-image-control-btn"
                            onClick={() => goToImage(project, activeImageIndex + 1)}
                            disabled={
                              !hasMultipleImages || isLastImage || !!activeTransition
                            }
                            aria-label={`Next ${project.title} image`}
                        >
                          <ProjectArrow direction="right" />
                        </button>
                      </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
