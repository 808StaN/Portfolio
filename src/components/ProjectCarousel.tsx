import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getProjectImages, type Project } from "../data/projects";

gsap.registerPlugin(ScrollTrigger);

const CELL_COUNT = 4;
const ANGLE_STEP = 360 / CELL_COUNT;

type ProjectCarouselProps = {
  project: Project;
};

export default function ProjectCarousel({ project }: ProjectCarouselProps) {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const carousel = carouselRef.current;
    if (!scene || !carousel) return;

    const section = scene.closest<HTMLElement>("[data-section-tilt]");
    if (!section) return;

    const cells = carousel.querySelectorAll<HTMLElement>(".carousel__cell");
    cells.forEach((cell, i) => {
      const angle = i * ANGLE_STEP;
      cell.style.transform = `rotateY(${angle}deg) translateZ(var(--carousel-radius))`;
    });

    // "Ostatni projekt" = ten, po którym następuje sekcja spoza grupy projektów
    // (OtakuVersus → About). Wtedy pin trwa dłużej (300%): 200% na rotację zdjęć,
    // a ostatnie 100% to "postój" karuzeli, podczas którego SectionTiltDirector
    // wynurza kolejną sekcję (About) jako standardowy tilt nad przypiętą karuzelą.
    const allTilt = Array.from(
      document.querySelectorAll<HTMLElement>("[data-section-tilt]"),
    );
    const nextSection = allTilt[allTilt.indexOf(section) + 1] ?? null;
    const isLastProject =
      !!nextSection && nextSection.dataset.sectionGroup !== "projects";

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          id: `carousel-${project.id}`,
          trigger: section,
          start: "top top",
          end: isLastProject ? "+=300%" : "+=200%",
          scrub: true,
          pin: true,
          pinSpacing: true,
        },
      });

      tl.fromTo(
        carousel,
        { rotationY: 0, rotationZ: 3, rotationX: 3 },
        {
          rotationY: -270,
          rotationZ: -3,
          rotationX: -3,
          ease: "sine.inOut",
          duration: 2,
        },
      );

      // Pusty ogon: rotacja kończy się na 200%, a karuzela trzyma pin przez
      // ostatnie 100%, gdy About się wynurza.
      if (isLastProject) {
        tl.to({}, { duration: 1 });
      }
    }, scene);

    return () => ctx.revert();
  }, []);

  const images = getProjectImages(project);
  const carouselImages =
    images.length < CELL_COUNT
      ? [...images, ...images.slice(0, CELL_COUNT - images.length)]
      : images.slice(0, CELL_COUNT);

  return (
    <div className="scene" ref={sceneRef}>
      <div className="carousel" ref={carouselRef}>
        {carouselImages.map((image, i) => (
          <div className="carousel__cell" key={`${project.id}-cell-${i}`}>
            <div
              className="card"
              style={{ "--img": `url(${image.srcOriginal})` } as React.CSSProperties}
            >
              <div className="card__face card__face--front" />
              <div className="card__face card__face--back" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
