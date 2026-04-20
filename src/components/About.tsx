import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const easeOut = [0.16, 1, 0.3, 1] as const;

const certificates = [
  {
    title: 'Front-End Engineer Career Path',
    issuer: 'Codecademy',
    href: 'https://www.codecademy.com/profiles/DawidStanisz/certificates/2682884a0719474f96407efe432fdd87',
  },
  {
    title: 'Full-Stack Engineer Career Path',
    issuer: 'Codecademy',
    href: 'https://www.codecademy.com/profiles/DawidStanisz/certificates/ffd0f42cce1a44e9a0108b365047a0a6',
  },
  {
    title: 'Build Web Apps with ASP.NET Skill Path',
    issuer: 'Codecademy',
    href: 'https://www.codecademy.com/profiles/DawidStanisz/certificates/5ec9a3897d4c940011f50142',
  },
];

export default function About() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="about" className="section-shell relative overflow-hidden">
      <div
        className="absolute pointer-events-none"
        style={{
          left: '-18%',
          top: '18%',
          width: '58%',
          height: '58%',
          background: 'radial-gradient(circle, rgba(79,142,247,0.07) 0%, transparent 72%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="section-inner relative" ref={ref}>
        <motion.div
          className="flex items-center gap-3 mb-14"
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: easeOut }}
        >
          <span className="section-label">About</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] gap-12 lg:gap-16">
          <div>
            <motion.h2
              className="section-title text-white/90 max-w-[20ch]"
              style={{ fontSize: 'clamp(1.95rem, 3.5vw, 3.7rem)', marginBottom: 'clamp(1.75rem, 3.2vw, 2.6rem)' }}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1, ease: easeOut }}
            >
              Building products
              <br />
              <span style={{ color: 'rgba(255,255,255,0.56)' }}>with frontend precision and backend reliability.</span>
            </motion.h2>

            <motion.div
              className="space-y-4 max-w-[66ch] mb-7"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2, ease: easeOut }}
            >
              <p className="text-sm md:text-base leading-[1.75]" style={{ color: 'rgba(255,255,255,0.56)', fontFamily: 'var(--font-sans)' }}>
                Hi, I&apos;m Dawid, a full-stack developer based in Poland, specializing in React and Node.js.
              </p>
              <p className="text-sm md:text-base leading-[1.75]" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-sans)' }}>
                I mainly build web applications and websites with React, focusing on performance, clean architecture,
                and practical backend integration using Node.js. Alongside that, I develop smaller JavaScript
                projects, including browser extensions, simple tools, and occasional game modifications. I&apos;ve also
                worked a bit with C#, building desktop applications.
              </p>
              <p className="text-sm md:text-base leading-[1.75]" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-sans)' }}>
                I&apos;m currently studying at WSIiZ in Rzeszów while actively developing my skills through projects
                like OpenStudio and OtakuVersus, combining strong frontend execution with real-world backend logic.
              </p>
              <p className="text-sm md:text-base leading-[1.75]" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'var(--font-sans)' }}>
                I&apos;m open to relocation and looking for opportunities where I can grow as a developer and build
                meaningful products.
              </p>
            </motion.div>

            <motion.a
              href="/Dawid_Stanisz_CV.pdf"
              download
              className="projects-repo-btn about-cv-btn"
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.28, ease: easeOut }}
            >
              Download CV
            </motion.a>
          </div>

          <div className="flex flex-col gap-8">
            <motion.div
              className="project-card about-certs-shell"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.25, ease: easeOut }}
            >
              <p className="about-certs-label">Certificates</p>
              <div className="about-certs-list">
                {certificates.map((certificate, i) => (
                  <motion.article
                    key={certificate.title}
                    className="about-cert-item"
                    initial={{ opacity: 0, x: 20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.65, delay: 0.35 + i * 0.1, ease: easeOut }}
                  >
                    <div className="about-cert-copy">
                      <h3 className="about-cert-title">
                        {certificate.title}
                      </h3>
                      <p className="about-cert-issuer">{certificate.issuer}</p>
                    </div>
                    <a
                      href={certificate.href}
                      target="_blank"
                      rel="noreferrer"
                      className="projects-repo-btn about-cert-link"
                    >
                      View certificate
                    </a>
                  </motion.article>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
