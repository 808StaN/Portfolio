import { useEffect } from "react";
import Cursor from "../components/Cursor";
import CustomScrollbar from "../components/CustomScrollbar";
import GravityLink from "../components/ui/GravityLink";
import ServicesHeroTrail from "../components/ServicesHeroTrail";

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
  },
  {
    title: "RiftPick",
    description:
      "Rozbudowana platforma fantasy związana z rozgrywkami League of Legends. Użytkownicy mogą tworzyć składy, zbierać karty zawodników, zdobywać punkty i rywalizować w rankingach.",
    href: "https://riftpick.com",
  },
  {
    title: "OpenStudio",
    description:
      "Internetowa aplikacja do tworzenia muzyki, umożliwiająca pracę z melodiami, ścieżkami, efektami oraz innymi elementami projektu muzycznego.",
    href: "https://github.com/808StaN/OpenStudio",
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
            <p className="services-eyebrow">Dawid Stanisz</p>
            <h1 id="services-heading">Nowoczesne strony internetowe dopasowane do Twojego biznesu</h1>
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

        <section className="services-dual-section" aria-label="Usługi i korzyści ze współpracy">
          <div className="services-wrap services-dual-grid">
            <section className="services-dual-panel services-dual-panel--services" aria-labelledby="services-help-heading">
              <header className="services-dual-heading">
                <p className="services-eyebrow">Zakres usług</p>
                <h2 id="services-help-heading">W czym mogę Ci pomóc?</h2>
              </header>
              <div className="services-service-list">
                {services.map((service) => (
                  <article className="services-service-row" key={service.title}>
                    <div>
                      <h3>{service.title}</h3>
                      <p>{service.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="services-dual-panel services-dual-panel--benefits" aria-labelledby="services-benefits-heading">
              <header className="services-dual-heading">
                <p className="services-eyebrow">W ramach współpracy</p>
                <h2 id="services-benefits-heading">Co otrzymujesz?</h2>
              </header>
              <div className="services-benefits-list">
                {benefits.map((benefit) => (
                  <article className="services-service-row" key={benefit.title}>
                    <div>
                      <h3>{benefit.title}</h3>
                      <p>{benefit.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>

        <section className="services-section" aria-labelledby="services-process-heading">
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
            <p className="services-process-summary">Nie musisz znać się na tworzeniu stron. Wystarczy, że opiszesz, czego potrzebujesz - pomogę uporządkować pomysł i dobrać odpowiednie rozwiązanie.</p>
          </div>
        </section>

        <section id="realizacje" className="services-section services-section--surface" aria-labelledby="services-examples-heading">
          <div className="services-wrap">
            <header className="services-section-heading">
              <p className="services-eyebrow">Wybrane projekty</p>
              <h2 id="services-examples-heading">Przykładowe realizacje</h2>
              <p>Poniżej znajdują się wybrane projekty pokazujące różne rodzaje stron i aplikacji internetowych.</p>
            </header>
            <div className="services-examples">
              {examples.map((example, index) => (
                <article className="services-example" key={example.title}>
                  <span className="services-card-index">0{index + 1}</span>
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
                    style={{ marginTop: "auto", alignSelf: "flex-start" }}
                  />
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
              {faq.map((item) => (
                <details className="services-faq" key={item.question}>
                  <summary>{item.question}<span aria-hidden="true">+</span></summary>
                  <p>{item.answer}</p>
                </details>
              ))}
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
