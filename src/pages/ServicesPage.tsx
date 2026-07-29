import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Cursor from "../components/Cursor";
import CustomScrollbar from "../components/CustomScrollbar";
import GravityLink from "../components/ui/GravityLink";
import ServicesHeroTrail from "../components/ServicesHeroTrail";
import slodkoSlonyImage from "../assets/projects/SlodkoSlony.png?w=1400&format=webp&quality=90";
import riftPickImage from "../assets/projects/RiftPick.jpg?w=1400&format=webp&quality=90";
import openStudioImage from "../assets/projects/OpenStudio.jpg?w=1400&format=webp&quality=90";
import otakuVersusImage from "../assets/projects/OtakuVersus.jpg?w=1400&format=webp&quality=90";

const email = "dstanisz.dev@gmail.com";
const emailHref = `mailto:${email}?subject=Zapytanie%20o%20projekt`;

const services = [
  {
    title: "Strony firmowe i wizytówki",
    description:
      "Przejrzyste strony prezentujące firmę, ofertę, dane kontaktowe oraz najważniejsze informacje dla klientów. Dobre rozwiązanie dla firm, usługodawców, freelancerów i lokalnych biznesów.",
  },
  {
    title: "Landing page'e i strony ofertowe",
    description:
      "Strony skupione na konkretnej usłudze, produkcie lub kampanii. Ich zadaniem jest przedstawienie oferty i zachęcenie użytkownika do kontaktu, zakupu lub wykonania innej określonej czynności.",
  },
  {
    title: "Sklepy internetowe",
    description:
      "Sklepy umożliwiające prezentację produktów, składanie zamówień oraz wygodne zarządzanie ofertą. Zakres projektu jest dopasowywany do liczby produktów i potrzeb sprzedawcy.",
  },
  {
    title: "Aplikacje webowe",
    description:
      "Indywidualne aplikacje internetowe, takie jak panele użytkownika, systemy rezerwacji, platformy z kontami użytkowników, formularze wieloetapowe lub inne rozwiązania dopasowane do konkretnego pomysłu.",
  },
  {
    title: "Modernizacja istniejących stron",
    description:
      "Odświeżenie wyglądu, poprawa działania, uporządkowanie treści lub rozbudowa strony o nowe podstrony i funkcje.",
  },
  {
    title: "Dodatkowe funkcjonalności",
    description:
      "Mogę dodać między innymi formularz kontaktowy, mapę, system rezerwacji, galerię, sekcję aktualności, integracje z mediami społecznościowymi lub inne elementy potrzebne w danym projekcie.",
  },
];

const benefits = [
  {
    title: "Stronę dopasowaną do Twojej oferty",
    description:
      "Projekt powstaje na podstawie potrzeb konkretnej firmy lub pomysłu, zamiast być przypadkowym zestawem gotowych elementów.",
  },
  {
    title: "Wygodne korzystanie na telefonie i komputerze",
    description: "Strona będzie czytelna i łatwa w obsłudze na różnych urządzeniach.",
  },
  {
    title: "Przejrzystą prezentację usług lub produktów",
    description:
      "Treści i podstrony zostaną uporządkowane w sposób ułatwiający klientom znalezienie najważniejszych informacji.",
  },
  {
    title: "Pomoc przy uruchomieniu strony",
    description:
      "Mogę pomóc w wyborze domeny, hostingu oraz publikacji gotowej strony w internecie.",
  },
  {
    title: "Możliwość dalszej rozbudowy",
    description: "Stronę można później rozwijać o kolejne podstrony, funkcje lub integracje.",
  },
  {
    title: "Jasno ustalony zakres prac",
    description:
      "Przed rozpoczęciem projektu ustalamy jego zakres, koszt oraz najważniejsze etapy współpracy.",
  },
];

const process = [
  {
    title: "Opisujesz swój pomysł",
    description:
      "W wiadomości przedstawiasz rodzaj strony, najważniejsze funkcje oraz materiały, które już posiadasz.",
  },
  {
    title: "Ustalamy zakres projektu",
    description:
      "Rozmawiamy o potrzebach, zawartości strony, terminie oraz orientacyjnym budżecie.",
  },
  {
    title: "Otrzymujesz wycenę",
    description: "Na podstawie ustalonego zakresu przygotowuję indywidualną wycenę projektu.",
  },
  {
    title: "Powstaje strona",
    description: "W trakcie realizacji możesz śledzić postęp prac i przekazywać uwagi.",
  },
  {
    title: "Uruchamiamy gotowy projekt",
    description:
      "Po zaakceptowaniu strony pomagam w jej publikacji oraz konfiguracji domeny.",
  },
];

const examples = [
  {
    title: "Słodko Słony",
    description:
      "Projekt strony internetowej prezentującej ofertę lokalu, menu, najważniejsze informacje oraz dane kontaktowe. Strona została przygotowana jako propozycja demonstracyjna.",
    href: "https://slodko-slony.vercel.app/",
    image: slodkoSlonyImage,
    imageAlt: "Strona główna restauracji Słodko Słony",
    status: "Projekt demonstracyjny",
  },
  {
    title: "RiftPick",
    description:
      "Rozbudowana platforma fantasy związana z rozgrywkami League of Legends. Użytkownicy mogą tworzyć składy, zbierać karty zawodników, zdobywać punkty i rywalizować w rankingach.",
    href: "https://riftpick.com",
    image: riftPickImage,
    imageAlt: "Strona główna aplikacji fantasy RiftPick",
    status: "Dostępny online",
  },
  {
    title: "OpenStudio",
    description:
      "Internetowa aplikacja do tworzenia muzyki, umożliwiająca pracę z melodiami, ścieżkami, efektami oraz innymi elementami projektu muzycznego.",
    href: "https://github.com/808StaN/OpenStudio",
    image: openStudioImage,
    imageAlt: "Interfejs aplikacji do tworzenia muzyki OpenStudio",
    status: "Aplikacja webowa",
  },
  {
    title: "OtakuVersus",
    description:
      "Aplikacja webowa w stylistyce mangi, w której gracze rozpoznają anime na podstawie kadrów, zdobywają punkty i rywalizują w trybie jednoosobowym lub wieloosobowym.",
    href: "https://github.com/808StaN/OtakuVersus",
    image: otakuVersusImage,
    imageAlt: "Ekran aplikacji do rozpoznawania anime OtakuVersus",
    status: "Aplikacja webowa",
  },
];

const faq = [
  {
    question: "Ile kosztuje stworzenie strony?",
    answer:
      "Cena zależy od liczby podstron, zakresu projektu oraz potrzebnych funkcjonalności. Po krótkiej rozmowie i ustaleniu szczegółów przygotowuję indywidualną wycenę.",
  },
  {
    question: "Ile trwa realizacja?",
    answer:
      "Termin zależy od wielkości projektu, dostępności materiałów oraz zakresu funkcji. Prosta strona firmowa powstanie szybciej niż sklep lub rozbudowana aplikacja.",
  },
  {
    question: "Czy muszę posiadać własną domenę i hosting?",
    answer: "Nie. Mogę pomóc w ich wyborze, zakupie oraz konfiguracji.",
  },
  {
    question: "Czy przygotowujesz również treści na stronę?",
    answer:
      "Mogę pomóc w uporządkowaniu dostarczonych materiałów, przygotowaniu struktury podstron oraz dopracowaniu podstawowych tekstów. Zakres ustalamy przed rozpoczęciem projektu.",
  },
  {
    question: "Czy strona będzie działała na telefonach?",
    answer: "Tak. Projekty są przygotowywane z myślą o użytkownikach komputerów, tabletów i telefonów.",
  },
  {
    question: "Czy mogę później rozbudować stronę?",
    answer: "Tak. Stronę można rozbudować o nowe podstrony, funkcje, formularze lub integracje.",
  },
  {
    question: "Czy zajmujesz się istniejącymi stronami?",
    answer:
      "Tak. Mogę pomóc w modernizacji, rozbudowie lub poprawie istniejącej strony. Możliwość wykonania zmian zależy od jej obecnej budowy i zakresu potrzebnych prac.",
  },
];

export default function ServicesPage() {
  const [openFaqs, setOpenFaqs] = useState<string[]>([]);
  const servicesSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const previousTitle = document.title;
    const previousLanguage = document.documentElement.lang;
    const description = document.querySelector('meta[name="description"]');
    const previousDescription = description?.getAttribute("content");

    document.title = "Tworzenie stron internetowych, sklepów i aplikacji webowych | Dawid Stanisz";
    document.documentElement.lang = "pl";
    description?.setAttribute(
      "content",
      "Tworzenie stron firmowych, wizytówek, sklepów internetowych i aplikacji webowych. Indywidualna wycena, pomoc przy domenie, hostingu i uruchomieniu strony.",
    );

    return () => {
      document.title = previousTitle;
      document.documentElement.lang = previousLanguage;
      if (previousDescription) description?.setAttribute("content", previousDescription);
    };
  }, []);

  useEffect(() => {
    const section = servicesSectionRef.current;
    if (!section) return;

    let frame = 0;
    const updateGradient = () => {
      frame = 0;
      const { top } = section.getBoundingClientRect();
      const navbarHeight = document.querySelector(".services-nav")?.getBoundingClientRect().height ?? 0;
      const progress = Math.min(Math.max((window.innerHeight - top) / (window.innerHeight - navbarHeight), 0), 1);
      section.style.setProperty("--services-hero-gradient-opacity", `${1 - progress}`);
    };
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateGradient);
    };

    updateGradient();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="services-page">
      <Cursor />
      <CustomScrollbar />
      <header className="services-nav">
        <nav className="services-wrap services-nav-inner" aria-label="Nawigacja strony usług">
          <a className="services-nav-name" href="#uslugi">Dawid Stanisz</a>
          <div className="services-nav-links">
            <a href="#uslugi">Usługi</a>
            <a href="#realizacje">Realizacje</a>
            <a href="#kontakt">Kontakt</a>
          </div>
          <a className="services-nav-portfolio services-nav-email" href={`mailto:${email}`}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 6.75A1.75 1.75 0 0 1 5.75 5h12.5A1.75 1.75 0 0 1 20 6.75v10.5A1.75 1.75 0 0 1 18.25 19H5.75A1.75 1.75 0 0 1 4 17.25V6.75Zm1.5.3v.17l6.5 4.56 6.5-4.56v-.17a.25.25 0 0 0-.25-.25H5.75a.25.25 0 0 0-.25.25Zm13 1.99-6.07 4.25a.75.75 0 0 1-.86 0L5.5 9.04v8.2c0 .14.11.25.25.25h12.5a.25.25 0 0 0 .25-.25v-8.2Z" fill="currentColor" />
            </svg>
            {email}
          </a>
        </nav>
      </header>
      <main>
        <section id="uslugi" className="services-hero" aria-labelledby="services-heading">
          <ServicesHeroTrail />
          <div className="services-wrap services-hero-content">
            <h1 id="services-heading">
              <span>Nowoczesne</span>
              <span>strony internetowe</span>
              <span>dopasowane do</span>
              <span>Twojego biznesu</span>
            </h1>
            <p className="services-hero-copy">
              Tworzę strony firmowe, sklepy internetowe oraz aplikacje webowe dostosowane do potrzeb klienta. Pomagam przejść przez cały proces - od ustalenia pomysłu i zakresu projektu aż po uruchomienie gotowej strony w internecie.
            </p>
            <div className="services-actions">
              <GravityLink
                href="#kontakt"
                text="Zapytaj o bezpłatną wycenę"
                icon="arrow-down"
                sizing={{ paddingX: 24, paddingY: 14, fontSize: 14 }}
              />
              <GravityLink
                href="#realizacje"
                text="Zobacz realizacje"
                variant="primary"
                icon="arrow-down"
                sizing={{ paddingX: 24, paddingY: 14, fontSize: 14 }}
              />
            </div>
            <p className="services-note">Pierwsza konsultacja oraz wersja demonstracyjna projektu są bezpłatne.</p>
          </div>
        </section>

        <section ref={servicesSectionRef} className="services-section services-offerings-section services-offerings-section--services" aria-labelledby="services-help-heading">
          <div className="services-wrap">
            <header className="services-section-heading">
              <p className="services-eyebrow">Zakres usług</p>
              <h2 id="services-help-heading">W czym mogę Ci pomóc?</h2>
            </header>
            <div className="services-offerings-grid">
              {services.map((service) => (
                <article className="services-offering-card" key={service.title}>
                  <div className="services-offering-card-head">
                    <span className="services-offering-dot" aria-hidden="true" />
                    <h3>{service.title}</h3>
                  </div>
                  <p>{service.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="services-section services-offerings-section services-offerings-section--benefits" aria-labelledby="services-benefits-heading">
          <div className="services-wrap">
            <header className="services-section-heading">
              <p className="services-eyebrow">W ramach współpracy</p>
              <h2 id="services-benefits-heading">Co otrzymujesz?</h2>
            </header>
            <div className="services-offerings-grid">
              {benefits.map((benefit) => (
                <article className="services-offering-card" key={benefit.title}>
                  <div className="services-offering-card-head">
                    <span className="services-offering-dot" aria-hidden="true" />
                    <h3>{benefit.title}</h3>
                  </div>
                  <p>{benefit.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="services-section services-process-section" aria-labelledby="services-process-heading">
          <div className="services-wrap">
            <header className="services-section-heading">
              <p className="services-eyebrow">Prosty proces</p>
              <h2 id="services-process-heading">Jak wygląda współpraca?</h2>
            </header>
            <ol className="services-process">
              {process.map((step, index) => (
                <li key={step.title}>
                  <span>{index + 1}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="realizacje" className="services-section services-examples-section" aria-labelledby="services-examples-heading">
          <div className="services-wrap">
            <header className="services-section-heading">
              <p className="services-eyebrow">Wybrane projekty</p>
              <h2 id="services-examples-heading">Przykładowe realizacje</h2>
              <p>Poniżej znajdują się wybrane projekty pokazujące różne rodzaje stron i aplikacji internetowych.</p>
            </header>
            <div className="services-examples">
              {examples.map((example) => (
                <article className="services-project" key={example.title}>
                  <a
                    className="services-project-window"
                    href={example.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Otwórz projekt ${example.title}`}
                  >
                    <div className="services-project-image">
                      <img src={example.image} alt={example.imageAlt} loading="lazy" />
                    </div>
                  </a>
                  <div className="services-project-content">
                    <p className="services-project-status">{example.status}</p>
                    <h3>{example.title}</h3>
                    <p>{example.description}</p>
                    <GravityLink
                      href={example.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      text="Zobacz projekt"
                      variant="project"
                      icon="arrow-up-right"
                      sizing={{ paddingX: 17, paddingY: 10, fontSize: 12.5 }}
                      style={{ marginTop: 12 }}
                    />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="services-section" aria-labelledby="services-faq-heading">
          <div className="services-wrap services-faq-layout">
            <header className="services-section-heading">
              <p className="services-eyebrow">Przed rozpoczęciem</p>
              <h2 id="services-faq-heading">Najczęstsze pytania</h2>
            </header>
            <div className="services-faq-list">
              {faq.map((item, index) => {
                const isOpen = openFaqs.includes(item.question);

                return (
                  <article className="services-faq" key={item.question}>
                    <button
                      className="services-faq-toggle"
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${index}`}
                      onClick={() => {
                        setOpenFaqs((current) => (
                          current.includes(item.question)
                            ? current.filter((question) => question !== item.question)
                            : [...current, item.question]
                        ));
                      }}
                    >
                      {item.question}<span aria-hidden="true">+</span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={`faq-answer-${index}`}
                          className="services-faq-answer"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <p>{item.answer}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="kontakt" className="services-contact" aria-labelledby="services-contact-heading">
          <div className="services-wrap services-contact-content">
            <p className="services-eyebrow">Kontakt</p>
            <h2 id="services-contact-heading">Porozmawiajmy o Twoim projekcie</h2>
            <p>
              Opisz krótko, jakiej strony potrzebujesz, jaki jest jej cel oraz jakie funkcje powinna posiadać. Na tej podstawie będę mógł zaproponować dalsze kroki i przygotować wstępną wycenę.
            </p>
            <a className="services-email" href={emailHref}>{email}</a>
            <p className="services-contact-note">Wysłanie wiadomości nie zobowiązuje do rozpoczęcia współpracy. Pierwszy kontakt i wstępna wycena są bezpłatne.</p>
          </div>
        </section>

        <section className="services-final-cta" aria-labelledby="services-cta-heading">
          <div className="services-wrap services-final-cta-content">
            <div>
              <p className="services-eyebrow">Następny krok</p>
              <h2 id="services-cta-heading">Masz pomysł na stronę?</h2>
              <p>Napisz, czego potrzebujesz. Pomogę Ci określić zakres projektu i dobrać rozwiązanie dopasowane do Twojego celu oraz budżetu.</p>
            </div>
            <GravityLink
              href={emailHref}
              text="Poproś o wycenę"
              icon="arrow-up-right"
              sizing={{ paddingX: 24, paddingY: 14, fontSize: 14 }}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
