import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { sectionColors } from '../constants/sectionColors';
import ProjectTitleStretch from './ProjectTitleStretch';
import GravityLink from './ui/GravityLink';
import SectionBandsBackground from './SectionBandsBackground';

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
        <SectionBandsBackground palette="about" />
        <div className="section-tilt-container section-inner relative" ref={ref}>
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] gap-12 lg:gap-16">
          <div>
            <ProjectTitleStretch title="About Me" projectId="about" />

            <motion.div
              className="about-intro flex flex-col gap-4 max-w-[66ch] mb-7"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.35, ease: easeOut }}
            >
              <p className="text-sm md:text-base leading-[1.75]" style={{ color: 'rgba(255,255,255,0.56)', fontFamily: 'var(--font-sans)' }}>
                Hi, I&apos;m Dawid, a web developer based in Poland. I&apos;m especially interested in frontend development,
                particularly interface design and animation.
              </p>
              <p className="text-sm md:text-base leading-[1.75]" style={{ color: 'rgba(255,255,255,0.56)', fontFamily: 'var(--font-sans)' }}>
                I build my web applications mainly with React, Next.js, and TypeScript, working on everything from
                the interface and interactions to the backend logic.
              </p>
              <p className="text-sm md:text-base leading-[1.75]" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-sans)' }}>
                I&apos;m currently studying at WSIiZ in Rzeszów and looking for a developer role where I can build on my
                skills and learn from other developers. I&apos;m open to relocation.
              </p>
            </motion.div>

            <motion.div
              className="about-cv-btn"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.35, ease: easeOut }}
            >
              <GravityLink
                href="https://ziianpdcwxtnkuojaxtp.supabase.co/storage/v1/object/public/Portfolio/Dawid_Stanisz_CV.pdf"
                download
                text="Download CV"
                variant="secondary"
                icon="download"
                sizing={{ paddingX: 18, paddingY: 10, fontSize: 12.5 }}
              />
            </motion.div>
          </div>

          <div className="flex flex-col gap-8">
            <motion.div
              className="about-certs-shell"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.35, ease: easeOut }}
            >
              <p className="about-certs-label">Certificates</p>
              <div className="about-certs-list">
                {certificates.map(certificate => (
                  <article
                    key={certificate.title}
                    className="about-cert-item"
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
                  </article>
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
