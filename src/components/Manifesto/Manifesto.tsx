import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Manifesto.scss';

gsap.registerPlugin(ScrollTrigger);

const WORDS = ['motion', 'interfaces', 'layouts', 'interactions', 'experiences'];

export default function Manifesto() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const cyclingRef = useRef<HTMLSpanElement>(null);
  const cycleInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Cycling word animation
    let idx = 0;
    const el = cyclingRef.current;
    const cycle = () => {
      if (!el) return;
      gsap.to(el, {
        opacity: 0, y: -10, duration: 0.3, ease: 'power2.in', onComplete: () => {
          idx = (idx + 1) % WORDS.length;
          el.textContent = WORDS[idx];
          gsap.fromTo(el, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
        }
      });
    };
    cycleInterval.current = setInterval(cycle, 1800);

    const ctx = gsap.context(() => {
      // Section entrance
      gsap.fromTo(headlineRef.current,
        { opacity: 0, y: 60 },
        {
          opacity: 1, y: 0, duration: 1.2, ease: 'power4.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 78%',
            toggleActions: 'play none none reverse',
          }
        }
      );

      gsap.fromTo(subRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.25,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          }
        }
      );

      // Marquee continuous scroll
      const marqueeEl = marqueeRef.current;
      if (marqueeEl) {
        const track = marqueeEl.querySelector<HTMLDivElement>('.mf-marquee-track');
        if (track) {
          gsap.to(track, {
            xPercent: -50,
            duration: 22,
            ease: 'none',
            repeat: -1,
          });
        }
      }

      // Glow mouse parallax
      const handleMove = (e: MouseEvent) => {
        if (!glowRef.current || !sectionRef.current) return;
        const rect = sectionRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        gsap.to(glowRef.current, {
          left: `${x}%`,
          top: `${y}%`,
          duration: 1.4,
          ease: 'power2.out',
        });
      };
      const section = sectionRef.current;
      section?.addEventListener('mousemove', handleMove);
      return () => section?.removeEventListener('mousemove', handleMove);

    }, sectionRef);

    return () => {
      ctx.revert();
      if (cycleInterval.current) clearInterval(cycleInterval.current);
    };
  }, []);

  const marqueeItems = [
    'UI / UX', '✦', 'React', '✦', 'Motion Design', '✦', 'Frontend', '✦',
    'Next.js', '✦', 'TypeScript', '✦', 'GSAP', '✦', 'Figma', '✦',
    'UI / UX', '✦', 'React', '✦', 'Motion Design', '✦', 'Frontend', '✦',
    'Next.js', '✦', 'TypeScript', '✦', 'GSAP', '✦', 'Figma', '✦',
  ];

  return (
    <section className="mf-section" ref={sectionRef} aria-label="Digital world intro">

      {/* Ambient glow that follows cursor */}
      <div className="mf-glow" ref={glowRef} />

      {/* Grid texture overlay */}
      <div className="mf-grid-overlay" />

      {/* Central content */}
      <div className="mf-center">

        <h2 className="mf-headline" ref={headlineRef}>
          This is where<br />
          I craft <span className="mf-cycling" ref={cyclingRef}>motion</span><br />
          <em>for the web.</em>
        </h2>

        <p className="mf-sub" ref={subRef}>
          A space where code meets craft — turning ideas into
          living, breathing digital experiences that feel as good as they look.
        </p>

        <div className="mf-line-deco">
          <span className="mf-line-left" />
          <span className="mf-orb" />
          <span className="mf-line-right" />
        </div>

      </div>

      {/* Marquee strip */}
      <div className="mf-marquee" ref={marqueeRef} aria-hidden="true">
        <div className="mf-marquee-track">
          {marqueeItems.map((item, i) => (
            <span key={i} className={item === '✦' ? 'mf-marquee-dot' : 'mf-marquee-item'}>
              {item}
            </span>
          ))}
        </div>
      </div>

    </section>
  );
}
