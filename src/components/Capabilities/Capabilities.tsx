import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Capabilities.scss';

gsap.registerPlugin(ScrollTrigger);

// ── Data ───────────────────────────────────────────────────────────────────
const CAPS = [
  {
    num: '001',
    title: 'Frontend Development',
    tagline: 'Precision-built for the browser.',
    desc: 'React, Next.js, and TypeScript — crafting fast, accessible, pixel-perfect interfaces with clean, scalable architecture.',
  },
  {
    num: '002',
    title: 'Web Animation',
    tagline: 'Motion that earns attention.',
    desc: 'GSAP-powered micro-interactions, scroll sequences, and SVG animations that turn static layouts into living experiences.',
  },
  {
    num: '003',
    title: 'UI Design',
    tagline: 'Systems that scale beautifully.',
    desc: 'Figma design systems, spatial prototypes, and design tokens — from wireframe concept to a polished component library.',
  },
  {
    num: '004',
    title: 'CMS Expertise',
    tagline: 'Full control, zero friction.',
    desc: 'Custom Webflow, Shopify, and headless CMS builds that give clients real ownership over their content.',
  },
] as const;

// ── SVG Icons ──────────────────────────────────────────────────────────────

/** Icon 1 — Frontend: clean </> code brackets */
function FrontendIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="cap-icon-svg" aria-hidden="true">
      {/* Left bracket < */}
      <path className="cap-draw" d="M 30 22 L 16 40 L 30 58"
        stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
      {/* Slash / */}
      <line className="cap-draw" x1="46" y1="20" x2="34" y2="60"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Right bracket > */}
      <path className="cap-draw" d="M 50 22 L 64 40 L 50 58"
        stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Icon 2 — Web Animation: 3 concentric rings + orbiting dot */
function AnimationIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="cap-icon-svg" aria-hidden="true">
      {/* Inner ring */}
      <circle className="cap-draw" cx="40" cy="40" r="7"
        stroke="currentColor" strokeWidth="1.5" />
      {/* Middle ring */}
      <circle className="cap-draw" cx="40" cy="40" r="18"
        stroke="currentColor" strokeWidth="1" strokeOpacity="0.55" />
      {/* Outer ring */}
      <circle className="cap-draw" cx="40" cy="40" r="29"
        stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
      {/* Orbiting dot — GSAP rotates this group around SVG center */}
      <g className="cap-orbit-g">
        <circle cx="69" cy="40" r="2.5" fill="currentColor" />
      </g>
    </svg>
  );
}

/** Icon 3 — UI Design: wireframe layout (header + sidebar + content blocks) */
function UIDesignIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="cap-icon-svg" aria-hidden="true">
      {/* Top header bar */}
      <path className="cap-draw" d="M 8 11 L 72 11 L 72 24 L 8 24 Z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Left sidebar column */}
      <path className="cap-draw" d="M 8 30 L 30 30 L 30 69 L 8 69 Z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Right — top content block */}
      <path className="cap-draw" d="M 36 30 L 72 30 L 72 47 L 36 47 Z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Right — bottom content block */}
      <path className="cap-draw" d="M 36 53 L 72 53 L 72 69 L 36 69 Z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/** Icon 4 — CMS: isometric stacked layers showing content depth */
function CMSIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="cap-icon-svg" aria-hidden="true">
      {/* Top layer */}
      <path className="cap-draw" d="M 6 14 L 60 14 L 60 28 L 6 28 Z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Side-face connectors: top → middle */}
      <line className="cap-draw" x1="6" y1="28" x2="12" y2="34"
        stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" strokeLinecap="round" />
      <line className="cap-draw" x1="60" y1="28" x2="66" y2="34"
        stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" strokeLinecap="round" />
      {/* Middle layer */}
      <path className="cap-draw" d="M 12 34 L 66 34 L 66 48 L 12 48 Z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Side-face connectors: middle → bottom */}
      <line className="cap-draw" x1="12" y1="48" x2="18" y2="54"
        stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" strokeLinecap="round" />
      <line className="cap-draw" x1="66" y1="48" x2="72" y2="54"
        stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" strokeLinecap="round" />
      {/* Bottom layer */}
      <path className="cap-draw" d="M 18 54 L 72 54 L 72 68 L 18 68 Z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

const ICONS = [FrontendIcon, AnimationIcon, UIDesignIcon, CMSIcon];

// ── Component ──────────────────────────────────────────────────────────────
export default function Capabilities() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {

      // 1 — Set up strokeDash for every drawable SVG element
      const drawables = Array.from(
        section.querySelectorAll<SVGGeometryElement>('.cap-draw')
      );
      drawables.forEach((el) => {
        const len = el.getTotalLength?.() ?? 200;
        gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
      });

      // 2 — Section header fade-up
      gsap.fromTo('.cap-hdr',
        { opacity: 0, y: 28 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: {
            trigger: section, start: 'top 82%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // 3 — Cards stagger up
      gsap.fromTo('.cap-card',
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 0.85, ease: 'power3.out', stagger: 0.12,
          scrollTrigger: {
            trigger: section, start: 'top 72%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // 4 — SVG paths draw in (staggered globally — ~4 paths per icon)
      gsap.to(drawables, {
        strokeDashoffset: 0,
        duration: 1.0,
        ease: 'power2.out',
        stagger: 0.07,
        scrollTrigger: {
          trigger: section, start: 'top 66%',
          toggleActions: 'play none none reverse',
        },
      });

      // 5 — Continuous orbit for the Animation icon dot
      gsap.to('.cap-orbit-g', {
        rotation: 360,
        svgOrigin: '40 40',   // GSAP SVG-space pivot = ring center
        duration: 4,
        ease: 'none',
        repeat: -1,
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="cap-section" ref={sectionRef} id="capabilities" aria-label="Capabilities">

      {/* ── Header ── */}
      <div className="cap-hdr">
        <span className="cap-hdr__label">What I do</span>
        <span className="cap-hdr__count">01 — 04</span>
      </div>

      {/* ── 4-column card grid ── */}
      <div className="cap-grid">
        {CAPS.map((cap, i) => {
          const Icon = ICONS[i];
          return (
            <article key={cap.num} className="cap-card">
              <span className="cap-card__num">{cap.num}</span>
              <div className="cap-icon-wrap">
                <Icon />
              </div>
              <div className="cap-card__body">
                <h3 className="cap-card__title">{cap.title}</h3>
                <p className="cap-card__tagline">{cap.tagline}</p>
                <p className="cap-card__desc">{cap.desc}</p>
              </div>
            </article>
          );
        })}
      </div>

    </section>
  );
}
