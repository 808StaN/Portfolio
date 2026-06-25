import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getProjectImages, type Project } from "../data/projects";

gsap.registerPlugin(ScrollTrigger);

const CELL_COUNT = 4;
const RADIUS = 500;

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

    const cells = carousel.querySelectorAll<HTMLElement>(".carousel__cell");
    const cards = carousel.querySelectorAll<HTMLElement>(".card");
    const angleStep = 360 / cells.length;

    cells.forEach((cell, i) => {
      const angle = i * angleStep;
      cell.style.transform = `rotateY(${angle}deg) translateZ(${RADIUS}px)`;
    });

    const ctx = gsap.context(() => {
      gsap.fromTo(
        carousel,
        { rotationY: 0, rotationZ: 3, rotationX: 3 },
        {
          rotationY: -180,
          rotationZ: -3,
          rotationX: -3,
          ease: "sine.inOut",
          scrollTrigger: {
            trigger: scene,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );

      gsap.fromTo(
        cards,
        { rotationZ: 10 },
        {
          rotationZ: -10,
          ease: "none",
          scrollTrigger: {
            trigger: scene,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
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
      <h2 className="scene__title">
        <span>{project.title}</span>
      </h2>
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
