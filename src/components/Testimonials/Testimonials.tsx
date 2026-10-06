import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Testimonials.scss';

gsap.registerPlugin(ScrollTrigger);

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  project?: string;
  avatar?: string;
}

const TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'client-1',
    quote:
      'Nitya turned our complex technical requirements into an exceptionally smooth, fluid digital experience. The attention to motion precision and frontend architecture was world-class.',
    author: 'Client Name',
    role: 'Founder & CEO',
    company: 'Book My Farmhouse',
    project: 'Full-Stack Platform',
  },
  {
    id: 'client-2',
    quote:
      'Working with Nitya was effortless. High design maturity, pixel-perfect fidelity from Figma to code, and animations that truly elevated our brand perception.',
    author: 'Client Name',
    role: 'Creative Director',
    company: 'Skymaharaja',
    project: 'Luxury Web Experience',
  },
];

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Header entrance
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current.children,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: headerRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        );
      }

      // Cards entrance
      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll('.test-card');
        gsap.fromTo(
          cards,
          { opacity: 0, y: 50, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            stagger: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 80%',
              once: true,
            },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section className="test-section" ref={sectionRef} id="testimonials" aria-label="Client Endorsements">
      <div className="test-container">
        
        {/* Section Header */}
        <div className="test-header" ref={headerRef}>
          <div className="test-tag">
            <span className="test-tag-dot" aria-hidden="true" />
            <span className="test-tag-label">ENDORSEMENTS</span>
          </div>
          <h2 className="test-title">
            Trusted by founders <em>&</em> design leaders.
          </h2>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="test-grid" ref={cardsRef}>
          {TESTIMONIALS.map((item) => (
            <div className="test-card" key={item.id}>
              {/* Decorative Accent Glow */}
              <div className="test-card-glow" aria-hidden="true" />

              {/* Quote Mark */}
              <div className="test-quote-mark" aria-hidden="true">
                “
              </div>

              {/* Body Quote */}
              <p className="test-quote-text">
                {item.quote}
              </p>

              {/* Client Info Footer */}
              <div className="test-footer">
                <div className="test-author-info">
                  <span className="test-author-name">{item.author}</span>
                  <span className="test-author-role">
                    {item.role} <em>/</em> {item.company}
                  </span>
                </div>

                {item.project && (
                  <div className="test-badge">
                    <span>{item.project}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
