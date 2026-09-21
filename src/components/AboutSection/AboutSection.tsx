import { useRef, useLayoutEffect } from 'react';
import './AboutSection.scss';
import aboutBg from '../../assets/About_bg_updated_3.webp';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function AboutSection() {
  const masterRef = useRef<HTMLElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const bgImageRef = useRef<HTMLImageElement>(null);
  const darkOverlayRef = useRef<HTMLDivElement>(null);
  const bioContentRef = useRef<HTMLDivElement>(null);
  const wordBuildRef = useRef<HTMLSpanElement>(null);
  const wordBeyondRef = useRef<HTMLSpanElement>(null);
  const wordLimitsRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (!masterRef.current) return;

    let ctx: gsap.Context | null = null;

    const setupAnimation = () => {
      ctx?.revert();

      // Hard-set all elements to their starting state
      gsap.set(imageWrapperRef.current, { width: '30vw', height: '90vh' });
      gsap.set(darkOverlayRef.current, { opacity: 0 });
      gsap.set(bgImageRef.current, { y: '0%' });
      gsap.set(bioContentRef.current, { y: '0px' });

      // Words start hidden, GSAP reveals them on enter
      gsap.set(wordBuildRef.current, { opacity: 0, x: -50 });
      gsap.set(wordBeyondRef.current, { opacity: 0, y: 20 });
      gsap.set(wordLimitsRef.current, { opacity: 0, x: 50 });

      ctx = gsap.context(() => {

        // Word reveal timeline — plays on enter, not scrubbed
        const wordTl = gsap.timeline({ paused: true });
        wordTl
          .to(wordBuildRef.current, { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out' }, 0)
          .to(wordBeyondRef.current, { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' }, 0.12)
          .to(wordLimitsRef.current, { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out' }, 0.22);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: masterRef.current,
            start: 'top top',
            end: '+=350%',
            pin: true,
            scrub: 1,
            // Lower priority ensures RockSequence pin spacer is settled first
            refreshPriority: -1,
            anticipatePin: 1,
            invalidateOnRefresh: true,

            onEnter: () => {
              // Reset words then play reveal
              gsap.set(wordBuildRef.current, { opacity: 0, x: -50 });
              gsap.set(wordBeyondRef.current, { opacity: 0, y: 20 });
              gsap.set(wordLimitsRef.current, { opacity: 0, x: 50 });
              gsap.killTweensOf([wordBuildRef.current, wordBeyondRef.current, wordLimitsRef.current]);
              wordTl.restart();
            },

            onLeaveBack: () => wordTl.reverse(),

            onUpdate: (self) => {
              const p = self.progress;
              if (p <= 0) return;

              // Snap word reveal to completion if user scrolls mid-animation
              if (wordTl.isActive()) {
                wordTl.pause();
                gsap.set(wordBuildRef.current, { x: 0 });
                gsap.set(wordBeyondRef.current, { y: 0 });
                gsap.set(wordLimitsRef.current, { x: 0 });
              }

              // Fade words out over first 30% of scroll
              const op = Math.max(0, 1 - p / 0.3);
              gsap.set(wordBuildRef.current, { opacity: op });
              gsap.set(wordBeyondRef.current, { opacity: op });
              gsap.set(wordLimitsRef.current, { opacity: op });
            },
          },
        });

        // Image expands from portrait to fullscreen
        tl.fromTo(imageWrapperRef.current,
          { width: '30vw', height: '80vh' },
          { width: '100vw', height: '100vh', duration: 0.9, ease: 'back.out(1.4)' },
          0
        );

        // Dark overlay fades in
        tl.fromTo(darkOverlayRef.current,
          { opacity: 0 },
          { opacity: 0.85, duration: 0.2 },
          0.35
        );

        // Image parallax drifts up (130% CSS height gives room)
        tl.fromTo(bgImageRef.current,
          { y: '0%' },
          { y: '-20%', duration: 0.7, ease: 'none' },
          0.3
        );

        // Bio text scrolls up over fullscreen image
        tl.fromTo(bioContentRef.current,
          { y: '0px' },
          { y: '-150vh', duration: 0.7, ease: 'none' },
          0.3
        );

      }, masterRef);
    };

    // Wait for RockSequence pin spacer to exist before measuring positions
    const onRockReady = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setupAnimation();
          ScrollTrigger.refresh();
        });
      });
    };

    // Fallback if event fires before listener is registered
    const fallbackId = setTimeout(() => {
      if (!ctx) {
        setupAnimation();
        ScrollTrigger.refresh();
      }
    }, 600);

    window.addEventListener('rock-sequence-ready', onRockReady, { once: true });

    return () => {
      clearTimeout(fallbackId);
      window.removeEventListener('rock-sequence-ready', onRockReady);
      ctx?.revert();
    };
  }, []);

  return (
    <>
      <section className="fs_about_master" ref={masterRef}>

        <div className="fs_image_wrapper" ref={imageWrapperRef}>
          <img
            src={aboutBg}
            alt="Nitya Variya"
            className="fs_bg_img"
            ref={bgImageRef}
          />
          <div className="fs_dark_overlay" ref={darkOverlayRef} />
        </div>

        {/* Craft | Code | Character headline */}
        <div className="fs_headline">
          <span className="fs_headline_word" ref={wordBuildRef}>Build</span>
          <span className="fs_headline_word fs_headline_word--center" ref={wordBeyondRef}>Beyond</span>
          <span className="fs_headline_word" ref={wordLimitsRef}>Limits</span>
        </div>

        <div className="fs_bio_content" ref={bioContentRef}>
          <div className="fs_bio_block">
            <span className="fs_bio_label">WHO AM I.</span>
            <p>Based in India, I help founders and designers bring premium layouts to life in the browser. Zero design details lost, zero layout compromises.</p>
          </div>
          <div className="fs_bio_block">
            <span className="fs_bio_label">WHAT DRIVES ME.</span>
            <p>Websites should feel like high-end editorial print. Precise typography, clean borders, and micro-motion that brings layouts to life.</p>
          </div>
        </div>

      </section>
    </>
  );
}