import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import jQuery from 'jquery';
import './AssemblyStory.scss';

gsap.registerPlugin(ScrollTrigger);

export default function AssemblyStory() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // ── Master ScrollTrigger timeline scrubbed to section scroll ────
    const masterTL = gsap.timeline({
      scrollTrigger: {
        trigger: '.assembly-story-section',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
      },
    });

    // ════════════════════════════════════════════════════════════════
    // Phase 1 → Phase 2  (Architecture → Kinetic)  — Scroll 0% to 50%
    // ════════════════════════════════════════════════════════════════

    // Card border: dashed #333 → solid #1A1A1A
    masterTL.to(
      '.abstract-ui-card',
      {
        borderStyle: 'solid',
        borderColor: '#1A1A1A',
        backgroundColor: '#0A0A0A',
        ease: 'none',
        duration: 0.5,
      },
      0
    );

    // Header: dashed wireframe → solid filled block
    masterTL.to(
      '.ui-header',
      {
        borderStyle: 'solid',
        borderColor: 'transparent',
        backgroundColor: '#151515',
        ease: 'none',
        duration: 0.5,
      },
      0
    );

    // Grid items: scale up, fill, full opacity
    masterTL.to(
      '.ui-item',
      {
        borderStyle: 'solid',
        borderColor: 'transparent',
        backgroundColor: '#151515',
        opacity: 1,
        scale: 1,
        ease: 'none',
        duration: 0.5,
      },
      0
    );

    // Hero mask slides up to fill the hero block
    masterTL.to(
      '.hero-mask',
      {
        y: '0%',
        ease: 'none',
        duration: 0.5,
      },
      0
    );

    // Hero image border solidifies
    masterTL.to(
      '.ui-hero-image',
      {
        borderStyle: 'solid',
        borderColor: 'transparent',
        ease: 'none',
        duration: 0.5,
      },
      0
    );

    // ════════════════════════════════════════════════════════════════
    // Phase 2 → Phase 3  (Kinetic → Performance / Golden)  — Scroll 50% to 100%
    // ════════════════════════════════════════════════════════════════

    // Card golden glow
    masterTL.to(
      '.abstract-ui-card',
      {
        boxShadow: '0px 20px 40px rgba(163, 101, 42, 0.1)',
        ease: 'none',
        duration: 0.5,
      },
      0.5
    );

    // Hero image background fill + gradient mask
    masterTL.to(
      '.ui-hero-image',
      {
        backgroundColor: '#1A1A1A',
        ease: 'none',
        duration: 0.5,
      },
      0.5
    );

    masterTL.to(
      '.hero-mask',
      {
        background: 'linear-gradient(135deg, #1A1A1A, #A3652A)',
        ease: 'none',
        duration: 0.5,
      },
      0.5
    );

    // Golden sweep across the card
    masterTL.to(
      '.ui-golden-sweep',
      {
        left: '200%',
        ease: 'none',
        duration: 0.5,
      },
      0.5
    );

    // ── Pillar fade-in ScrollTriggers ────────────────────────────────
    jQuery('.assembly-story-section .story-pillar').each(function (this: HTMLElement) {
      const element = this;
      gsap.fromTo(
        element,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 80%',
          },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (
          st.trigger &&
          (jQuery(st.trigger).hasClass('assembly-story-section') ||
            jQuery(st.trigger).closest('.assembly-story-section').length > 0)
        ) {
          st.kill();
        }
      });
    };
  }, []);

  return (
    <section className="assembly-story-section" ref={sectionRef}>
      <div className="assembly-container">
        <div className="card-sticky-wrapper">
          <div className="abstract-ui-card">
            <div className="ui-header"></div>
            <div className="ui-hero-image">
              <div className="hero-mask"></div>
            </div>
            <div className="ui-grid">
              <div className="ui-item"></div>
              <div className="ui-item"></div>
              <div className="ui-item"></div>
            </div>
            <div className="ui-golden-sweep"></div>
          </div>
        </div>
        <div className="story-scroll-content">
          <div className="story-pillar">
            <span className="pillar-number">01</span>
            <h3 className="pillar-title">Architectural Foundation</h3>
            <p className="pillar-text">
              I don't just build websites; I structure scalable digital environments. Every line of
              code is written with intention, ensuring your platform is as robust under the hood as
              it is beautiful on the surface.
            </p>
          </div>

          <div className="story-pillar">
            <span className="pillar-number">02</span>
            <h3 className="pillar-title">Kinetic Interactions</h3>
            <p className="pillar-text">
              Static web pages are dead. I engineer fluid, physics-based micro-interactions and
              GSAP animations that make the browser feel like a high-end native application.
            </p>
          </div>

          <div className="story-pillar">
            <span className="pillar-number">03</span>
            <h3 className="pillar-title">Zero-Compromise Performance</h3>
            <p className="pillar-text">
              Premium aesthetics mean nothing if the site lags. I obsess over the technical
              details—optimizing assets, refining rendering paths, and ensuring a flawless 60fps
              experience across all devices.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
