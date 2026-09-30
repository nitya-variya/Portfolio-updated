import { useRef, useLayoutEffect, useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLenis } from 'lenis/react';
import './Capabilities.scss';

gsap.registerPlugin(ScrollTrigger);

// ── Capabilities / What I Do Expertise Data ──────────────────────────────────
interface ExpertiseItem {
  id: string;
  number: string;
  pillTitle: string;
  cardTag: string;
  title: string;
  desc: string;
  tags: string[];
  image: string;
  subline: string;
}

const EXPERTISE: ExpertiseItem[] = [
  {
    id: 'frontend',
    number: '01',
    pillTitle: 'FRONTEND DEVELOPMENT',
    cardTag: 'EXPERTISE 01 — ARCHITECTURE',
    title: 'Frontend Development & Performance',
    desc: 'Crafting fast, accessible, and scalable web applications with React, Next.js, and TypeScript. Focused on high-performance rendering, clean modular code, and pixel-perfect responsiveness across every screen.',
    tags: ['React', 'Next.js', 'TypeScript', 'Vite', 'Tailwind / SCSS'],
    image: '/assets/photo-1.jpg',
    subline: 'KODAK PORTRA 400 — 01A',
  },
  {
    id: 'motion',
    number: '02',
    pillTitle: 'WEB & MOTION ANIMATION',
    cardTag: 'EXPERTISE 02 — MOTION',
    title: 'Motion & Interactive Experiences',
    desc: 'Transforming static layouts into living digital stories. Crafting custom GSAP timelines, ScrollTrigger choreographies, micro-interactions, and smooth physics-driven motion that elevate user engagement.',
    tags: ['GSAP', 'ScrollTrigger', 'Lenis Scroll', 'Framer Motion', 'SVG Motion'],
    image: '/assets/lumina-mock.jpg',
    subline: 'KODAK PORTRA 400 — 02A',
  },
  {
    id: 'design',
    number: '03',
    pillTitle: 'UI / UX & DESIGN SYSTEMS',
    cardTag: 'EXPERTISE 03 — DESIGN',
    title: 'UI / UX Design & Systems',
    desc: 'Bridging the gap between aesthetic visual direction and engineering. Building scalable Figma design systems, reusable component architectures, design tokens, and clean spatial prototypes.',
    tags: ['Figma', 'Design Systems', 'Design Tokens', 'Spatial UX', 'Prototyping'],
    image: '/assets/nexus-mock.jpg',
    subline: 'KODAK PORTRA 400 — 03A',
  },
  {
    id: 'creative',
    number: '04',
    pillTitle: 'CREATIVE CODING & WEBGL',
    cardTag: 'EXPERTISE 04 — CREATIVE',
    title: 'Creative Coding & 3D Web',
    desc: 'Pushing boundaries at the intersection of design and code. Creating custom WebGL shaders, Three.js canvases, and generative graphics that make brands truly stand out.',
    tags: ['WebGL', 'Three.js', 'GLSL Shaders', 'Creative Code', 'Canvas API'],
    image: '/assets/photo-2.jpg',
    subline: 'KODAK PORTRA 400 — 04A',
  },
];

export default function Capabilities() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const filmTrackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isFirstRender = useRef(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const lenis = useLenis();

  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth <= 860);
  }, []);

  useEffect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, [checkMobile]);

  // ── ScrollTrigger Pinning & Step Progress ─────────────────────────────────
  useLayoutEffect(() => {
    if (isMobile) return;
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        id: 'capabilities-pin',
        trigger: section,
        start: 'top top',
        end: `+=${EXPERTISE.length * 90}vh`,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        scrub: 0.25,
        onUpdate: (self) => {
          const raw = self.progress * EXPERTISE.length;
          const idx = Math.min(Math.floor(raw), EXPERTISE.length - 1);
          setActiveIndex(idx);
        },
      });
    }, section);

    return () => ctx.revert();
  }, [isMobile]);

  // ── Film Strip Roll Transition ───────────────────────────────────────────
  useEffect(() => {
    if (!filmTrackRef.current) return;
    const targetY = -activeIndex * 100;
    gsap.to(filmTrackRef.current, {
      yPercent: targetY,
      duration: 0.75,
      ease: 'power3.out',
      overwrite: 'auto',
    });
  }, [activeIndex]);

  // ── High-Performance Accordion Animation Engine ───────────────────────────
  useEffect(() => {
    const isInitial = isFirstRender.current;
    isFirstRender.current = false;

    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const isActive = i === activeIndex;
      const bodyEl = el.querySelector<HTMLElement>('.why-card__body');
      const innerEl = el.querySelector<HTMLElement>('.why-card__body-inner');
      const iconEl = el.querySelector<HTMLElement>('.why-pill-icon');

      if (!bodyEl || !innerEl) return;

      // Kill any running tweens to prevent competing animations
      gsap.killTweensOf([el, bodyEl, iconEl]);

      if (isActive) {
        // Measure target natural content height
        const targetHeight = innerEl.offsetHeight || 140;

        if (isInitial && i === 0) {
          // Instant mount state without flash
          gsap.set(el, {
            backgroundColor: 'rgba(245, 241, 232, 0.12)',
            borderColor: 'rgba(201, 97, 33, 0.5)',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.5), 0 0 30px rgba(201, 97, 33, 0.08)',
          });
          if (iconEl) gsap.set(iconEl, { rotate: 45, backgroundColor: '#C96121', color: '#FFFFFF' });
          gsap.set(bodyEl, { height: 'auto', opacity: 1, y: 0 });
        } else {
          // Smooth expanding transition
          gsap.to(el, {
            backgroundColor: 'rgba(245, 241, 232, 0.12)',
            borderColor: 'rgba(201, 97, 33, 0.5)',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.5), 0 0 30px rgba(201, 97, 33, 0.08)',
            duration: 0.45,
            ease: 'power2.out',
            overwrite: 'auto',
          });

          if (iconEl) {
            gsap.to(iconEl, {
              rotate: 45,
              backgroundColor: '#C96121',
              color: '#FFFFFF',
              duration: 0.4,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          }

          gsap.fromTo(
            bodyEl,
            { height: bodyEl.offsetHeight || 0, opacity: Math.max(parseFloat(getComputedStyle(bodyEl).opacity) || 0, 0.1), y: 4 },
            {
              height: targetHeight,
              opacity: 1,
              y: 0,
              duration: 0.48,
              ease: 'power3.out',
              overwrite: 'auto',
              onComplete: () => {
                if (i === activeIndex) {
                  gsap.set(bodyEl, { height: 'auto' });
                }
              },
            }
          );
        }
      } else {
        if (isInitial) {
          gsap.set(el, {
            backgroundColor: 'rgba(245, 241, 232, 0.06)',
            borderColor: 'rgba(245, 241, 232, 0.09)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
          });
          if (iconEl) gsap.set(iconEl, { rotate: 0, backgroundColor: 'rgba(245, 241, 232, 0.1)', color: '#F5F1E8' });
          gsap.set(bodyEl, { height: 0, opacity: 0, y: -4 });
        } else {
          // Smooth collapsing transition
          gsap.to(el, {
            backgroundColor: 'rgba(245, 241, 232, 0.06)',
            borderColor: 'rgba(245, 241, 232, 0.09)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
            duration: 0.35,
            ease: 'power2.inOut',
            overwrite: 'auto',
          });

          if (iconEl) {
            gsap.to(iconEl, {
              rotate: 0,
              backgroundColor: 'rgba(245, 241, 232, 0.1)',
              color: '#F5F1E8',
              duration: 0.35,
              ease: 'power2.inOut',
              overwrite: 'auto',
            });
          }

          // If height was 'auto', explicitly lock to offsetHeight before animating to 0
          const currentH = bodyEl.offsetHeight;
          gsap.fromTo(
            bodyEl,
            { height: currentH },
            {
              height: 0,
              opacity: 0,
              y: -4,
              duration: 0.38,
              ease: 'power3.inOut',
              overwrite: 'auto',
            }
          );
        }
      }
    });
  }, [activeIndex]);

  // ── Direct Click Selection with Smooth Navigation ─────────────────────────
  const handleItemClick = (index: number) => {
    setActiveIndex(index);
    if (!isMobile) {
      const st = ScrollTrigger.getById('capabilities-pin');
      if (st) {
        const total = st.end - st.start;
        const targetScroll = st.start + (index / EXPERTISE.length) * total + 20;
        if (lenis) {
          lenis.scrollTo(targetScroll, { duration: 1.2 });
        } else {
          window.scrollTo({ top: targetScroll, behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <section
      ref={sectionRef}
      className="why-section"
      id="capabilities"
      aria-label="What I Do — Expertise"
    >
      {/* ── Viewport Container ── */}
      <div ref={stickyRef} className={`why-sticky${isMobile ? ' why-sticky--mobile' : ''}`}>
        {/* ── Main 2-Column Split ── */}
        <div className="why-layout">

          {/* ─── LEFT COLUMN: Accordion Cards ─── */}
          <div className="why-left">
            <div className="why-accordion">
              {EXPERTISE.map((item, i) => {
                const isActive = i === activeIndex;
                return (
                  <div
                    key={item.id}
                    ref={(el) => { cardRefs.current[i] = el; }}
                    className={`why-card${isActive ? ' why-card--active' : ''}`}
                    onClick={() => handleItemClick(i)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleItemClick(i);
                      }
                    }}
                    aria-expanded={isActive}
                  >
                    {/* Header Row: Always visible */}
                    <div className="why-card__header">
                      <div className="why-card__header-left">
                        {isActive && (
                          <span className="why-card__active-tag">{item.cardTag}</span>
                        )}
                        <h3 className={`why-card__pill-title${isActive ? ' why-card__pill-title--active' : ''}`}>
                          {item.pillTitle}
                        </h3>
                      </div>
                      <div className="why-pill-icon" aria-hidden="true">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>

                    {/* Collapsible Content with Inner Container for Pure Smooth Height */}
                    <div className="why-card__body">
                      <div className="why-card__body-inner">
                        <p className="why-card__desc">{item.desc}</p>
                        <div className="why-card__tags">
                          {item.tags.map((t) => (
                            <span key={t} className="why-card__tag-pill">{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── RIGHT COLUMN: 35mm Film Strip Showcase ─── */}
          <div className="why-right">
            <div className="why-filmstrip-wrap">

              {/* Handwritten Script Title floating naturally above top-left with zero clipping */}
              <div className="why-handwritten-title" aria-hidden="true">
                <span>What</span>
                <em>I Do</em>
              </div>

              {/* 35mm Filmstrip Container */}
              <div className="why-filmstrip-container">

                {/* Close / Preview button top-right (matching reference 'X') */}
                <div className="why-film-btn" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 2L12 12M12 2L2 12" stroke="#F5F1E8" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>

                {/* 35mm Film Sprocket Left Border */}
                <div className="why-sprocket why-sprocket--left" aria-hidden="true">
                  {Array.from({ length: 12 }).map((_, idx) => (
                    <div key={idx} className="why-sprocket__hole" />
                  ))}
                  <span className="why-sprocket__meta">FILM 135 · ISO 400</span>
                </div>

                {/* Center Photo Film Frame Viewport */}
                <div className="why-film-viewport">
                  <div ref={filmTrackRef} className="why-film-track">
                    {EXPERTISE.map((item, idx) => (
                      <div key={item.id} className="why-film-frame">
                        <div className="why-film-frame__inner">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="why-film-img"
                            loading={idx === 0 ? 'eager' : 'lazy'}
                          />
                          {/* Film grain / vignette overlay */}
                          <div className="why-film-vignette" />
                          
                          {/* Frame caption footer */}
                          <div className="why-film-caption">
                            <span className="why-film-caption__frame">{item.subline}</span>
                            <span className="why-film-caption__title">{item.title}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 35mm Film Sprocket Right Border */}
                <div className="why-sprocket why-sprocket--right" aria-hidden="true">
                  {Array.from({ length: 12 }).map((_, idx) => (
                    <div key={idx} className="why-sprocket__hole" />
                  ))}
                  <span className="why-sprocket__meta">36 EXP · {EXPERTISE[activeIndex]?.number}</span>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
