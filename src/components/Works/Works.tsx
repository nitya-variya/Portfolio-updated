import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ── Data ──────────────────────────────────────────────────────────────────────
const PROJECTS = [
  {
    id: 1,
    num: '01',
    title: 'Book My Farmhouse',
    role: 'Luxury Rental & Booking',
    tags: ['Travel Tech', 'Full-Stack'],
    year: '2024',
    img: 'assets/bookmyfarmhouse-mock.png',
    url: 'http://bookmyfarmhouse.com/',
    tall: true,
  },
  {
    id: 2,
    num: '02',
    title: 'Skymaharaja',
    role: 'Elite Private Jet Booking',
    tags: ['Luxury Travel', 'UX'],
    year: '2025',
    img: 'assets/skymaharaja-mock.png',
    url: 'https://skymaharaja.com/',
    tall: false,
  },
  {
    id: 3,
    num: '03',
    title: 'Decornath',
    role: 'Home Improvement Marketplace',
    tags: ['Marketplace', 'Commerce'],
    year: '2025',
    img: 'assets/decornath-mock.png',
    url: 'https://decornath.com/',
    tall: false,
  },
  {
    id: 4,
    num: '04',
    title: 'Vino Zero',
    role: 'Campaign Media',
    tags: ['Brand Identity', 'Motion'],
    year: '2024',
    img: 'assets/vino-mock.jpg',
    url: '',
    tall: true,
  },
];

// ── Project Card ──────────────────────────────────────────────────────────────
interface ProjectCardProps {
  project: (typeof PROJECTS)[0];
  colIndex: number;
}

function ProjectCard({ project, colIndex }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const card = cardRef.current;
    const img = imgRef.current;
    const curtain = curtainRef.current;
    const meta = metaRef.current;
    if (!card || !img || !curtain || !meta) return;

    const ctx = gsap.context(() => {
      // ── Card entrance (slide up + fade) ────────────────────────────────────
      gsap.set(card, { y: 70, opacity: 0 });
      gsap.to(card, {
        y: 0,
        opacity: 1,
        duration: 1.1,
        ease: 'power3.out',
        delay: colIndex * 0.12,
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          once: true,
        },
      });

      // ── Curtain image reveal ────────────────────────────────────────────────
      gsap.set(curtain, { scaleY: 1, transformOrigin: 'top center' });
      gsap.to(curtain, {
        scaleY: 0,
        duration: 1.5,
        ease: 'power4.inOut',
        delay: colIndex * 0.1 + 0.15,
        scrollTrigger: {
          trigger: card,
          start: 'top 80%',
          once: true,
        },
      });

      // ── Image parallax (subtle upward drift on scroll) ─────────────────────
      gsap.fromTo(
        img,
        { y: 30 },
        {
          y: -25,
          ease: 'none',
          scrollTrigger: {
            trigger: card,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.8,
          },
        }
      );

      // ── Meta fade in (slightly after card) ─────────────────────────────────
      gsap.fromTo(
        meta,
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power2.out',
          delay: colIndex * 0.1 + 0.35,
          scrollTrigger: {
            trigger: card,
            start: 'top 82%',
            once: true,
          },
        }
      );
    }, card);

    return () => ctx.revert();
  }, [colIndex]);

  return (
    <div
      className={`pw_card${project.tall ? ' pw_card--tall' : ''}`}
      ref={cardRef}
      id={`project-${project.id}`}
    >
      <a
        href={project.url || `#project-${project.id}`}
        target={project.url ? '_blank' : undefined}
        rel={project.url ? 'noopener noreferrer' : undefined}
        className="pw_card_link"
        aria-label={`View ${project.title}`}
      >
        {/* Image */}
        <div className="pw_img_wrap">
          {/* Curtain overlay for reveal */}
          <div className="pw_curtain" ref={curtainRef} aria-hidden="true" />
          <img
            ref={imgRef}
            src={project.img}
            alt={project.title}
            className="pw_img"
            loading="lazy"
          />
          {/* Hover overlay */}
          <div className="pw_img_hover" aria-hidden="true">
            <span className="pw_open_tag">↗ Open Case</span>
          </div>
        </div>

        {/* Meta row */}
        <div className="pw_card_meta" ref={metaRef}>
          <div className="pw_meta_left">
            <span className="pw_num">{project.num}</span>
            <div className="pw_meta_body">
              <h3 className="pw_title">{project.title}</h3>
              <div className="pw_tags">
                {project.tags.map((tag) => (
                  <span key={tag} className="pw_tag">{tag}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="pw_meta_right">
            <span className="pw_year">{project.year}</span>
            <span className="pw_role">{project.role}</span>
          </div>
        </div>
      </a>
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────
export default function WorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const tagline = taglineRef.current;
    if (!section || !tagline) return;

    const ctx = gsap.context(() => {
      // Tagline entrance
      gsap.fromTo(
        tagline,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 72%',
            once: true,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const leftProjects = PROJECTS.filter((_, i) => i % 2 === 0);
  const rightProjects = PROJECTS.filter((_, i) => i % 2 !== 0);

  return (
    <section
      className="pw_section"
      ref={sectionRef}
      id="work"
      aria-label="Selected Works — Imprints"
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="pw_header">
        {/* Big gradient tagline — centered */}
        <p className="pw_tagline" ref={taglineRef}>
          Things I've shaped into existence.
        </p>
      </header>

      {/* ── Grid ────────────────────────────────────────────────────────────── */}
      <div className="pw_grid" role="list" aria-label="Portfolio projects">
        {/* Left column */}
        <div className="pw_col pw_col--left" role="listitem">
          {leftProjects.map((p, i) => (
            <ProjectCard key={p.id} project={p} colIndex={i * 2} />
          ))}
        </div>

        {/* Right column (offset downward) */}
        <div className="pw_col pw_col--right" role="listitem">
          {rightProjects.map((p, i) => (
            <ProjectCard key={p.id} project={p} colIndex={i * 2 + 1} />
          ))}
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="pw_footer">
        <div className="pw_footer_inner">
          <p className="pw_footer_label">What's forming next</p>
          <p className="pw_footer_copy">
            Have a vision?<br />
            <em>Let's make it impossible to ignore.</em>
          </p>
          <a
            href="#contact"
            className="pw_footer_cta"
            id="works-contact-cta"
            aria-label="Begin the conversation"
          >
            <span className="pw_cta_text">Begin the conversation</span>
            <svg
              className="pw_cta_arrow"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1 13L13 1M13 1H4M13 1V10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </footer>
    </section>
  );
}
