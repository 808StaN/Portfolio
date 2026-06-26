import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProjectCarousel from "./ProjectCarousel";
import ProjectTitleStretch from "./ProjectTitleStretch";
import GravityLink from "./ui/GravityLink";
import {
  featuredProjects,
  type Project,
} from "../data/projects";

const easeOut = [0.16, 1, 0.3, 1] as const;

function slashTitle(title: string) {
  return title.split(" ").join(" / ");
}

export default function Projects() {
  const [repoDescriptions, setRepoDescriptions] = useState<Record<string, string>>(
    {},
  );
  const revealRef = useRef<HTMLDivElement>(null);
  const inView = useInView(revealRef, { once: true, margin: "-80px" });

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
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    // Podmiana fontu (Syne) zmienia metryki tytułów — przelicz triggery raz, gdy
    // font jest gotowy. Jeden globalny refresh zamiast pomiaru per-tytuł.
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  const getProjectDescription = (project: Project) =>
    repoDescriptions[project.id] ??
    (project.link?.includes("github.com")
      ? project.description
      : project.longDescription);

  return (
    <section id="work" className="projects-monopo relative">
      <div className="projects-list" ref={revealRef}>
        {featuredProjects.map((project, index) => {
          const reversed = index % 2 === 1;

          return (
            <article
              key={project.id}
              className="section-tilt-section projects-project-section relative"
              data-section-tilt
              data-section-group="projects"
              data-section-color={project.color}
              data-project-id={project.id}
            >
              <div className="section-tilt-panel projects-project-panel" style={{ background: project.color }}>
                <div className="section-tilt-container section-inner projects-inner projects-project-inner relative z-10">
                  <div className={`projects-layout ${reversed ? "is-reversed" : ""}`}>
                    <motion.div
                      className={`projects-meta${reversed ? " is-edge-right" : ""}`}
                      initial={{ opacity: 0, y: 24 }}
                      animate={inView ? { opacity: 1, y: 0 } : {}}
                      transition={{
                        duration: 0.8,
                        delay: 0.22,
                        ease: easeOut,
                      }}
                    >
                      <ProjectTitleStretch
                        title={slashTitle(project.title)}
                        projectId={project.id}
                        edgeAlign={reversed ? "right" : "left"}
                      />
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
                        <GravityLink
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          text={project.linkLabel ?? "View repository"}
                          variant="project"
                          icon="arrow-up-right"
                          sizing={{ paddingX: 17, paddingY: 10, fontSize: 12.5 }}
                          style={{ marginTop: 16 }}
                        />
                      ) : null}
                    </motion.div>

                    <motion.div
                      className="projects-carousel-wrap"
                      initial={{ opacity: 0, y: 32 }}
                      animate={inView ? { opacity: 1, y: 0 } : {}}
                      transition={{
                        duration: 0.85,
                        delay: 0.28,
                        ease: easeOut,
                      }}
                    >
                      <ProjectCarousel project={project} />
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
