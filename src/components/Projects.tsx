import { CSSProperties, useEffect, useRef, useState } from "react";
import { projects } from "../data/projects";

const PULSE_DURATION_MS = 1500;
const PULSE_PEAK_SCALE = 1.15;
const PULSE_SETTLE_SCALE = 1.045;
const PULSE_MIN_INCREMENT = 0.02;
const PULSE_MAX_SCALE = 1.22;

function slashTitle(title: string) {
  return title.split(" ").join(" / ");
}

function readCurrentScale(el: HTMLElement) {
  const transform = window.getComputedStyle(el).transform;
  if (!transform || transform === "none") return 1;
  try {
    const matrix = new DOMMatrixReadOnly(transform);
    return Math.hypot(matrix.a, matrix.b) || 1;
  } catch {
    return 1;
  }
}

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const targetProgressRef = useRef(0);
  const displayedProgressRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const driftKickRef = useRef(0);
  const pulseAnimRef = useRef<Animation | null>(null);
  const wheelAccumRef = useRef(0);
  const lastPulseAtRef = useRef(0);

  const steps = Math.max(1, projects.length - 1);
  const active = projects[activeIndex];

  const triggerPulse = () => {
    const el = visualRef.current;
    if (!el) return;

    const startScale = readCurrentScale(el);
    const peakScale = Math.min(
      PULSE_MAX_SCALE,
      Math.max(PULSE_PEAK_SCALE, startScale + PULSE_MIN_INCREMENT),
    );
    const settleScale = Math.max(
      PULSE_SETTLE_SCALE,
      Math.min(peakScale - 0.01, (startScale + peakScale) / 2),
    );

    if (pulseAnimRef.current) pulseAnimRef.current.cancel();
    pulseAnimRef.current = el.animate(
      [
        { transform: `translateY(36px) scale(${startScale})` },
        {
          transform: `translateY(36px) scale(${peakScale})`,
          offset: 0.4,
        },
        {
          transform: `translateY(36px) scale(${settleScale})`,
          offset: 0.74,
        },
        { transform: "translateY(36px) scale(1)" },
      ],
      {
        duration: PULSE_DURATION_MS,
        easing: "cubic-bezier(0.22, 0.72, 0.2, 1)",
        fill: "none",
      },
    );
  };

  useEffect(() => {
    const onScroll = () => {
      const section = sectionRef.current;
      const stage = stageRef.current;
      if (!section || !stage) return;

      const sectionRect = section.getBoundingClientRect();
      const sectionTopDoc = window.scrollY + sectionRect.top;
      const stagePaddingTop =
        Number.parseFloat(window.getComputedStyle(stage).paddingTop || "0") ||
        0;
      const startY = sectionTopDoc + stagePaddingTop;
      const endY = sectionTopDoc + section.offsetHeight - window.innerHeight;
      const totalScrollable = Math.max(1, endY - startY);
      const scrolled = Math.min(
        Math.max(window.scrollY - startY, 0),
        totalScrollable,
      );
      const normalized = scrolled / totalScrollable;
      const rawIndexProgress = normalized * steps;

      targetProgressRef.current = rawIndexProgress;
      setActiveIndex((prev) => {
        const next = Math.max(
          0,
          Math.min(projects.length - 1, Math.floor(rawIndexProgress + 0.5)),
        );
        return prev === next ? prev : next;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [steps]);

  useEffect(() => {
    const tick = () => {
      const target = targetProgressRef.current;
      const delta = target - displayedProgressRef.current;
      const kick = driftKickRef.current;
      displayedProgressRef.current += delta * 0.1 + kick;
      driftKickRef.current *= 0.9;
      if (Math.abs(delta) < 0.0008 && Math.abs(driftKickRef.current) < 0.0008) {
        displayedProgressRef.current = target;
      }
      displayedProgressRef.current = Math.max(
        0,
        Math.min(steps, displayedProgressRef.current),
      );

      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(0, -${displayedProgressRef.current * 100}%, 0)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = (idx: number) => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;
    const clamped = Math.max(0, Math.min(projects.length - 1, idx));

    const sectionRect = section.getBoundingClientRect();
    const sectionTopDoc = window.scrollY + sectionRect.top;
    const stagePaddingTop =
      Number.parseFloat(window.getComputedStyle(stage).paddingTop || "0") || 0;
    const startY = sectionTopDoc + stagePaddingTop;
    const endY = sectionTopDoc + section.offsetHeight - window.innerHeight;
    const totalScrollable = Math.max(1, endY - startY);
    const targetScroll = startY + (clamped / steps) * totalScrollable;
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 10) return;

      const rect = section.getBoundingClientRect();
      const inWorkViewport =
        rect.top <= window.innerHeight * 0.25 &&
        rect.bottom >= window.innerHeight * 0.75;
      if (!inWorkViewport) return;

      const direction = e.deltaY > 0 ? 1 : -1;
      driftKickRef.current += direction * 0.014;
      driftKickRef.current = Math.max(
        -0.03,
        Math.min(0.03, driftKickRef.current),
      );

      // Trigger one pulse per wheel "step", not per raw wheel event packet.
      wheelAccumRef.current += Math.abs(e.deltaY);
      const now = performance.now();
      const stepThreshold = 44;
      if (
        wheelAccumRef.current >= stepThreshold &&
        now - lastPulseAtRef.current > 120
      ) {
        wheelAccumRef.current = 0;
        lastPulseAtRef.current = now;
        triggerPulse();
      }
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <section
      id="work"
      ref={sectionRef}
      className="section-shell projects-monopo relative"
      style={{ ["--projects-steps" as any]: steps } as CSSProperties}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(120% 92% at 50% 60%, ${active.accent}2e 0%, rgba(10,16,38,0.2) 45%, transparent 75%)`,
        }}
      />

      <div className="section-inner projects-inner relative z-10">
        <div ref={stageRef} className="projects-stage">
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
              {projects.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => goTo(idx)}
                  aria-label={`Go to ${p.title}`}
                  className={`projects-rail-dot ${idx === activeIndex ? "is-active" : ""}`}
                />
              ))}
            </div>

            <div className="projects-meta">
              <h2 className="projects-title">{slashTitle(active.title)}</h2>
              <p className="projects-category">{active.category}</p>
              <div className="projects-tagline">
                {active.tags.slice(0, 3).map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>

            <div className="projects-visual-wrap">
              <div
                ref={visualRef}
                className="projects-visual-scroll"
                style={{ transform: "translateY(36px)" }}
              >
                <div
                  ref={trackRef}
                  className="projects-visual-track"
                  style={{ transform: "translate3d(0, 0, 0)" }}
                >
                  {projects.map((project) => (
                    <article key={project.id} className="projects-visual-item">
                      <img
                        src={project.image}
                        alt={`${project.title} preview`}
                        loading="lazy"
                      />
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="projects-bottom">
            <div className="projects-counter">
              {String(activeIndex + 1).padStart(2, "0")} /{" "}
              {String(projects.length).padStart(2, "0")}
            </div>
            <a
              href="https://github.com/808StaN?tab=repositories"
              target="_blank"
              rel="noopener noreferrer"
              className="projects-discover-btn"
            >
              Discover all projects -&gt;
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
