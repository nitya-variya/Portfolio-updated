import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import aboutBg from '../../assets/About_bg_updated_3.jpeg';

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return undefined;

    const ctx = gsap.context(() => {
      // 1. Background Image Parallax
      gsap.to('.fs_bg_image', {
        yPercent: 12,
        scale: 1.06,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });

      // 2. Staggered reveal for UI elements
      gsap.fromTo(
        '.fs_reveal',
        { autoAlpha: 0, y: 40, filter: 'blur(16px)' },
        {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1.2,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            once: true,
          },
        }
      );

      // 3. Reveal for Quote Block
      gsap.fromTo(
        '.fs_quote_block',
        { autoAlpha: 0, y: 50, filter: 'blur(20px)' },
        {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1.3,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.fs_quote_block',
            start: 'top 80%',
            once: true,
          },
        }
      );

      // 4. Numbers counter tick animation
      const stats = gsap.utils.toArray<HTMLElement>('.fs_stat_num');
      stats.forEach((stat) => {
        const targetVal = stat.innerText;
        const numVal = parseInt(targetVal, 10);
        if (!isNaN(numVal)) {
          gsap.fromTo(
            stat,
            { innerText: 0 },
            {
              innerText: numVal,
              duration: 2,
              ease: 'power2.out',
              snap: { innerText: 1 },
              scrollTrigger: {
                trigger: stat,
                start: 'top 85%',
                once: true,
              },
              onUpdate: function () {
                stat.innerText = Math.floor(Number(this.targets()[0].innerText)) + '+';
              },
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // 3D Card tilt effect on badge block
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = badgeRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(card, {
      rotateY: x * 0.08,
      rotateX: -y * 0.08,
      duration: 0.4,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    const card = badgeRef.current;
    if (!card) return;
    gsap.to(card, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.6,
      ease: 'power2.out',
    });
  };

  return (
    <section
      className="fs_trionn_master"
      ref={sectionRef}
      id="about"
      aria-label="About - Nitya Variya"
    >
      <div className="fs_bg_image_wrapper" aria-hidden="true">
        <img
          src={aboutBg}
          alt=""
          className="fs_bg_image"
          draggable="false"
        />
        <div className="fs_bg_overlay" />
      </div>

      <div className="fs_ui_layer">
        {/* Intro Header */}
        <div className="fs_intro_block fs_reveal">
          <span className="fs_intro_eyebrow">About</span>
          <h2 className="fs_intro_name">Nitya Variya</h2>
          <p className="fs_intro_role">Frontend Developer &amp; Creative Coder</p>
        </div>

        {/* Interactive Badge Card with 3D Tilt */}
        <div
          className="fs_badge_block fs_reveal"
          ref={badgeRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="fs_badge_icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="fs_badge_svg">
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="fs_badge_text">
            CRAFTING IMMERSIVE<br />
            DIGITAL EXPERIENCES<br />
            FOR GLOBAL BRANDS.
          </p>
          <div className="fs_badge_divider" aria-hidden="true" />
          <ul className="fs_badge_stats" aria-label="Portfolio statistics">
            <li><span className="fs_stat_num">2+</span><span className="fs_stat_label">Years Exp.</span></li>
            <li><span className="fs_stat_num">15+</span><span className="fs_stat_label">Projects</span></li>
          </ul>
        </div>

        {/* Lower Note */}
        <div className="fs_lower_note fs_reveal">
          <span className="fs_note_mark" aria-hidden="true">in</span>
          <p>
            Building memorable interfaces for product teams, founders,
            and brands that care about the smallest details.
          </p>
        </div>

        {/* Restored Editorial Quote Block */}
        <div className="fs_quote_block">
          <span className="fs_quote_eyebrow">Philosophy</span>
          <h3 className="fs_massive_quote">
            BRIDGING HIGH-END <em>DESIGN INTENT</em> WITH UNCOMPROMISING ARCHITECTURE.
          </h3>
          <div className="fs_quote_meta">
            <p className="fs_quote_subtext">
              Specialized in high-performance WebGL &amp; GSAP experiences,
              design systems, and clean front-end code bases.
            </p>
            <a href="#contact" className="fs_quote_cta">
              <span>Start A Conversation</span>
              <svg className="fs_cta_arrow" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 13L13 1M13 1H4M13 1V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
