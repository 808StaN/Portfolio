import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { sectionColors } from '../constants/sectionColors';
import ProjectTitleStretch from './ProjectTitleStretch';
import GravityLink from './ui/GravityLink';

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
];

export default function About() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="about" className="section-tilt-section section-shell relative overflow-hidden" data-section-tilt data-section-color={sectionColors.about}>
      <div className="section-tilt-panel" style={{ background: sectionColors.about }}>
        <div className="section-tilt-container section-inner relative" ref={ref}>
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] gap-12 lg:gap-16">
          <div>
            <ProjectTitleStretch title="About Me" projectId="about" />

            <motion.div
              className="about-intro space-y-4 max-w-[66ch] mb-7"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2, ease: easeOut }}
            >
              <p className="text-sm md:text-base leading-[1.75]" style={{ color: 'rgba(255,255,255,0.56)', fontFamily: 'var(--font-sans)' }}>
                Hi, I&apos;m Dawid, a full-stack developer based in Poland, specializing in React, Next.js, and Node.js.
              </p>
              <p className="text-sm md:text-base leading-[1.75]" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-sans)' }}>
                I tend to build things I&apos;m genuinely passionate about. That&apos;s led me to ship products across
                different domains - a live fantasy esports platform (RiftPick), a browser-based music production tool
                (OpenStudio), and a real-time quiz game (OtakuVersus). I focus on performance, clean architecture, and
                practical backend integration across every project.
              </p>
              <p className="text-sm md:text-base leading-[1.75]" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-sans)' }}>
                I&apos;m currently studying at WSIiZ in Rzeszów while actively developing my skills through my projects,
                combining strong frontend execution with real-world backend logic.
              </p>
              <p className="text-sm md:text-base leading-[1.75]" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'var(--font-sans)' }}>
                I&apos;m open to relocation and looking for opportunities where I can grow as a developer and build meaningful products.
              </p>
            </motion.div>

            <motion.div
              className="about-cv-btn"
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.28, ease: easeOut }}
            >
              <GravityLink
                href="/Dawid_Stanisz_CV.pdf"
                download
                text="Download CV"
                variant="secondary"
                icon="arrow-up-right"
                sizing={{ paddingX: 18, paddingY: 10, fontSize: 12.5 }}
              />
            </motion.div>
          </div>

          <div className="flex flex-col gap-8">
            <motion.div
              className="about-certs-shell"
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
                    <GravityLink
                      href={certificate.href}
                      target="_blank"
                      rel="noreferrer"
                      text="View certificate"
                      variant="project"
                      icon="arrow-up-right"
                      sizing={{ paddingX: 14, paddingY: 8, fontSize: 11.5 }}
                    />
                  </motion.article>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
