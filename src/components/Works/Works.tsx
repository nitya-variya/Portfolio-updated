import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GLCard from './GLCard';
import bookmyfarmhouseImg from '../../assets/Bookmyfarmhouse.png';
import skymaharajaImg from '../../assets/Skymaharaja.png';
import decornathImg from '../../assets/Decornath.png';
import pantrycultureImg from '../../assets/Pantryculture.png';

gsap.registerPlugin(ScrollTrigger);

// ── Data ───────────────────────────────────────────────────────────────────────
const PROJECTS = [
  {
    id: 1,
    num: '01',
    title: 'Book My Farmhouse',
    tags: ['Travel Tech', 'Full-Stack'],
    img: bookmyfarmhouseImg,
    url: 'http://bookmyfarmhouse.com/',
    tall: true,
  },
  {
    id: 2,
    num: '02',
    title: 'Skymaharaja',
    tags: ['Luxury Travel', 'UX'],
    img: skymaharajaImg,
    url: 'https://skymaharaja.com/',
    tall: false,
  },
  {
    id: 3,
    num: '03',
    title: 'Decornath',
    tags: ['Marketplace', 'Commerce'],
    img: decornathImg,
    url: 'https://decornath.com/',
    tall: false,
  },
  {
    id: 4,
    num: '04',
    title: 'Pantry Culture',
    tags: ['E-Commerce', 'Brand Identity'],
    img: pantrycultureImg,
    url: '',
    tall: true,
  },
];

// ── Section ────────────────────────────────────────────────────────────────────
export default function WorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const tagline = taglineRef.current;
    if (!section || !tagline) return;

    const ctx = gsap.context(() => {
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

  const leftProjects  = PROJECTS.filter((_, i) => i % 2 === 0);
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
        <p className="pw_tagline" ref={taglineRef}>
          Things I've shaped into existence.
        </p>
      </header>

      {/* ── Grid ────────────────────────────────────────────────────────────── */}
      <div className="pw_grid" role="list" aria-label="Portfolio projects">
        {/* Left column */}
        <div className="pw_col pw_col--left" role="listitem">
          {leftProjects.map((p, i) => (
            <GLCard
              key={p.id}
              img={p.img}
              num={p.num}
              title={p.title}
              tags={p.tags}
              url={p.url}
              tall={p.tall}
              colIndex={i * 2}
            />
          ))}
        </div>

        {/* Right column (offset downward) */}
        <div className="pw_col pw_col--right" role="listitem">
          {rightProjects.map((p, i) => (
            <GLCard
              key={p.id}
              img={p.img}
              num={p.num}
              title={p.title}
              tags={p.tags}
              url={p.url}
              tall={p.tall}
              colIndex={i * 2 + 1}
            />
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
