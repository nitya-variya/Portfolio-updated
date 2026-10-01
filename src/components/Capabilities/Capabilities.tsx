import { useRef, useLayoutEffect, useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLenis } from 'lenis/react';
import './Capabilities.scss';

gsap.registerPlugin(ScrollTrigger);

// ── Capabilities Data ────────────────────────────────────────────────────────
interface CapabilityItem {
  id: string;
  pillTitle: string;
  cardTitle: string;
  subtitle: string;
  desc: string;
  image: string;
}

const CAPABILITIES: CapabilityItem[] = [
  {
    id: 'frontend',
    pillTitle: 'FRONTEND ARCHITECTURE',
    cardTitle: 'FRONTEND ARCHITECTURE',
    subtitle: 'High performance & scalable web applications.',
    desc: 'Crafting fast, accessible, and scalable web apps with React, Next.js, and TypeScript. Focused on high-performance rendering, clean modular code, and pixel-perfect responsiveness across every screen.',
    image: '/assets/photo-1.jpg',
  },
  {
    id: 'motion',
    pillTitle: 'WEB & MOTION ANIMATION',
    cardTitle: 'WEB & MOTION ANIMATION',
    subtitle: 'Transforming layouts into living digital stories.',
    desc: 'Bringing static interfaces to life with bespoke GSAP timelines, ScrollTrigger choreographies, micro-interactions, and physics-driven smooth motion that elevate user engagement.',
    image: '/assets/lumina-mock.jpg',
  },
  {
    id: 'design',
    pillTitle: 'UI / UX & DESIGN SYSTEMS',
    cardTitle: 'UI / UX & DESIGN SYSTEMS',
    subtitle: 'Bridging aesthetic design and engineering.',
    desc: 'Building scalable Figma design systems, reusable component architectures, design tokens, and clean spatial prototypes that bridge the gap between design and development.',
    image: '/assets/nexus-mock.jpg',
  },
  {
    id: 'creative',
    pillTitle: 'CREATIVE CODING & 3D',
    cardTitle: 'CREATIVE CODING & 3D',
    subtitle: 'Pushing boundaries with WebGL and shaders.',
    desc: 'Creating interactive 3D web canvases, custom GLSL shaders, and generative visuals that make digital brands truly memorable.',
    image: '/assets/photo-2.jpg',
  },
];

export default function Capabilities() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const activeIndexRef = useRef(0);
  const lenis = useLenis();

  // Keep activeIndexRef synced to prevent stale closures
  activeIndexRef.current = activeIndex;

  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth <= 900);
  }, []);

  useEffect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, [checkMobile]);

  // ── ScrollTrigger Pinning & Ultra-Smooth Step Detection ────────────────────
  useLayoutEffect(() => {
    if (isMobile) return;
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        id: 'capabilities-pin',
        trigger: section,
        start: 'top top',
        end: `+=${CAPABILITIES.length * 150}vh`,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        scrub: 0.5,
        onUpdate: (self) => {
          const total = CAPABILITIES.length;
          // Calculate step with soft thresholds to prevent rapid jitter
          const progress = self.progress;
          let idx = Math.floor(progress * total);
          if (idx >= total) idx = total - 1;
          if (idx < 0) idx = 0;

          if (idx !== activeIndexRef.current) {
            setActiveIndex(idx);
          }
        },
      });
    }, section);

    return () => ctx.revert();
  }, [isMobile]);

  // ── Direct Click Handler with Smooth Eased Scroll ─────────────────────────
  const handleItemClick = (index: number) => {
    setActiveIndex(index);
    if (!isMobile) {
      const st = ScrollTrigger.getById('capabilities-pin');
      if (st) {
        const total = st.end - st.start;
        const targetScroll = st.start + ((index + 0.1) / CAPABILITIES.length) * total;
        if (lenis) {
          lenis.scrollTo(targetScroll, {
            duration: 1.0,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        } else {
          window.scrollTo({ top: targetScroll, behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <section
      ref={sectionRef}
      className="cap-section"
      id="capabilities"
      aria-label="What I Do"
    >
      {/* ── Viewport Container ── */}
      <div ref={stickyRef} className={`cap-sticky${isMobile ? ' cap-sticky--mobile' : ''}`}>
        <div className="cap-layout">

          {/* ─── LEFT COLUMN: Accordion & Pills ─── */}
          <div className="cap-left">
            <div className="cap-accordion">
              {CAPABILITIES.map((item, i) => {
                const isActive = i === activeIndex;
                return (
                  <div
                    key={item.id}
                    className={`cap-item${isActive ? ' cap-item--active' : ''}`}
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
                    {/* Header Row (Always Present for Fluid Transition) */}
                    <div className="cap-item-header">
                      <h3 className="cap-item-title">
                        {isActive ? item.cardTitle : item.pillTitle}
                      </h3>
                      <div className="cap-pill-icon" aria-hidden="true">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M6 1.5V10.5M1.5 6H10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>

                    {/* Smooth Collapsible Body via CSS Grid Transition */}
                    <div className="cap-card-body">
                      <div className="cap-card-body-inner">
                        <p className="cap-card-subtitle">{item.subtitle}</p>
                        <p className="cap-card-desc">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── RIGHT COLUMN: Prominent Image Showcase ─── */}
          <div className="cap-right">
            <div className="cap-image-wrapper">
              
              {/* Close Button on Top-Right */}
              <button className="cap-image-close-btn" type="button" aria-label="Close preview">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 2L10 10M10 2L2 10" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>

              {/* Stacked Images with Silky Smooth Crossfade & Parallax Zoom */}
              <div className="cap-image-frame">
                {CAPABILITIES.map((item, idx) => {
                  const isImageActive = idx === activeIndex;
                  return (
                    <div
                      key={item.id}
                      className={`cap-image-slide${isImageActive ? ' cap-image-slide--active' : ''}`}
                    >
                      <img
                        src={item.image}
                        alt={item.cardTitle}
                        className="cap-img"
                        loading={idx === 0 ? 'eager' : 'lazy'}
                      />
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

        </div>

        {/* ── Big Gradient Watermark Title Pinned to Bottom Left ── */}
        <div className="cap-bottom-title" aria-hidden="true">
          <span className="cap-bottom-title-text">WHAT I DO</span>
        </div>
      </div>
    </section>
  );
}
