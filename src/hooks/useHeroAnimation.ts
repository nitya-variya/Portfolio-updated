import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ── Types ────────────────────────────────────────────────────────
export interface UseHeroAnimationReturn {
  heroRef:      React.RefObject<HTMLElement | null>;
  videoRef:     React.RefObject<HTMLDivElement | null>;
  headerRef:    React.RefObject<HTMLElement | null>;
  subtitleRef:  React.RefObject<HTMLDivElement | null>;
  nameRef:      React.RefObject<HTMLHeadingElement | null>;
  floatRef:     React.RefObject<HTMLSpanElement | null>;
}

// ── Hook ─────────────────────────────────────────────────────────
export function useHeroAnimation(): UseHeroAnimationReturn {
  const heroRef      = useRef<HTMLElement | null>(null);
  const videoRef     = useRef<HTMLDivElement | null>(null);
  const headerRef    = useRef<HTMLElement | null>(null);
  const subtitleRef  = useRef<HTMLDivElement | null>(null);
  const nameRef      = useRef<HTMLHeadingElement | null>(null);
  const floatRef     = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── Intro Timeline ───────────────────────────────────────
      const tl = gsap.timeline({
        defaults: {
          ease: 'power3.out',
          force3D: true,          // GPU-accelerate all transforms
        },
        delay: 0.2,
      });

      // 1. Video fade-in — use autoAlpha for GPU-composited visibility
      if (videoRef.current) {
        gsap.set(videoRef.current, { willChange: 'opacity' });
        tl.to(videoRef.current, {
          autoAlpha: 1,
          duration: 1.6,
          ease: 'power2.inOut',
          onComplete: () => {
            // Clean up will-change after animation completes
            gsap.set(videoRef.current, { willChange: 'auto' });
          },
        });
      }

      // 2. Header slides down — autoAlpha for smooth compositing
      if (headerRef.current) {
        tl.to(
          headerRef.current,
          {
            y: 0,
            autoAlpha: 1,
            duration: 1,
            ease: 'power3.out',
          },
          '-=1.2'
        );
      }

      // 3. Headline reveal — NO filter:blur animation (major perf killer)
      //    Use only GPU-friendly: transform, opacity
      if (nameRef.current) {
        tl.fromTo(
          nameRef.current,
          {
            autoAlpha: 0,
            scale: 0.96,
            y: 25,
          },
          {
            autoAlpha: 1,
            scale: 1,
            y: 0,
            duration: 1.2,
            ease: 'power4.out',
            clearProps: 'will-change',
            onComplete: () => {
              // Start the gentle float after reveal completes
              if (floatRef.current) {
                gsap.to(floatRef.current, {
                  y: -3,
                  duration: 3.5,
                  ease: 'sine.inOut',
                  yoyo: true,
                  repeat: -1,
                  force3D: true,
                });
              }
            },
          },
          '-=0.6'
        );
      }

      // 4. Subtitle fades up
      if (subtitleRef.current) {
        tl.to(
          subtitleRef.current,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
          },
          '-=0.6'
        );
      }

      // ── Scroll-triggered parallax & fade ─────────────────────
      if (heroRef.current) {
        const bottomEl = heroRef.current.querySelector('.hero__bottom');

        if (bottomEl) {
          gsap.to(bottomEl, {
            y: -60,
            autoAlpha: 0,
            ease: 'none',
            force3D: true,
            scrollTrigger: {
              trigger: heroRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: true,       // true = native requestAnimationFrame, smoother than scrub: 0.8
            },
          });
        }
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return {
    heroRef,
    videoRef,
    headerRef,
    subtitleRef,
    nameRef,
    floatRef,
  };
}
