import { useRef, useEffect } from 'react';
import { CAPABILITY_ANIMATIONS, type AnimationHandle } from './svgAnimations';
import './Capabilities.scss';

// ── Capabilities Data ────────────────────────────────────────────────────────
const CAPABILITIES = [
  {
    id: 'frontend',
    cardTitle: 'FRONTEND ARCHITECTURE',
    subtitle: 'High performance & scalable web applications.',
    desc: 'Crafting fast, accessible, and scalable web apps with React, Next.js, and TypeScript. Focused on high-performance rendering, clean modular code, and pixel-perfect responsiveness.',
  },
  {
    id: 'motion',
    cardTitle: 'WEB & MOTION ANIMATION',
    subtitle: 'Transforming layouts into living digital stories.',
    desc: 'Bringing static interfaces to life with bespoke GSAP timelines, ScrollTrigger choreographies, micro-interactions, and physics-driven smooth motion.',
  },
  {
    id: 'design',
    cardTitle: 'UI / UX & DESIGN SYSTEMS',
    subtitle: 'Bridging aesthetic design and engineering.',
    desc: 'Building scalable Figma design systems, reusable component architectures, design tokens, and clean spatial prototypes that bridge design and development.',
  },
  {
    id: 'creative',
    cardTitle: 'CREATIVE CODING & 3D',
    subtitle: 'Pushing boundaries with WebGL and shaders.',
    desc: 'Creating interactive 3D web canvases, custom GLSL shaders, and generative visuals that make digital brands truly memorable.',
  },
];

export default function Capabilities() {
  const frameRefs = useRef<(HTMLDivElement | null)[]>(Array(CAPABILITIES.length).fill(null));
  const animHandlesRef = useRef<(AnimationHandle | null)[]>(Array(CAPABILITIES.length).fill(null));

  // Mount all 4 SVG animations once on mount
  useEffect(() => {
    const tokens = CAPABILITIES.map(() => ({ cancelled: false }));

    CAPABILITIES.forEach((_, i) => {
      const host = frameRefs.current[i];
      if (!host) return;

      (async () => {
        const factory = CAPABILITY_ANIMATIONS[i];
        if (!factory || tokens[i].cancelled) return;
        animHandlesRef.current[i] = factory(host);
      })();
    });

    return () => {
      tokens.forEach((t) => { t.cancelled = true; });
      animHandlesRef.current.forEach((h) => { if (h) h.destroy(); });
      animHandlesRef.current = Array(CAPABILITIES.length).fill(null);
    };
  }, []);

  return (
    <section className="cap-section" id="capabilities" aria-label="What I Do">
      {/* ── Header ── */}
      <div className="cap-header">
        <p className="cap-eyebrow">04 disciplines &nbsp;·&nbsp; Practice index</p>
        <h2 className="cap-heading">What I Do</h2>
      </div>

      {/* ── 4-Card Grid ── */}
      <div className="cap-grid">
        {CAPABILITIES.map((item, i) => (
          <div key={item.id} className="cap-card">
            {/* Orange accent bar */}
            <div className="cap-card-accent-bar" aria-hidden="true" />

            {/* SVG Animation */}
            <div
              className="cap-card-visual"
              ref={(el) => { frameRefs.current[i] = el; }}
              aria-hidden="true"
            />

            {/* Text */}
            <div className="cap-card-body">
              <span className="cap-card-num">0{i + 1}</span>
              <h3 className="cap-card-title">{item.cardTitle}</h3>
              <p className="cap-card-subtitle">{item.subtitle}</p>
              <p className="cap-card-desc">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
