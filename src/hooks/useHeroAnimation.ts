import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ── Types ────────────────────────────────────────────────────────
export interface UseHeroAnimationReturn {
  heroRef:      React.RefObject<HTMLElement | null>;
  videoRef:     React.RefObject<HTMLDivElement | null>;
  headerRef:    React.RefObject<HTMLElement | null>;
  roleLabelRef: React.RefObject<HTMLDivElement | null>;
  showcaseRef:  React.RefObject<HTMLDivElement | null>;
  subtitleRef:  React.RefObject<HTMLDivElement | null>;
  nameRef:      React.RefObject<HTMLHeadingElement | null>;
  floatRef:     React.RefObject<HTMLSpanElement | null>;
}

// ── Hook ─────────────────────────────────────────────────────────
export function useHeroAnimation(): UseHeroAnimationReturn {
  const heroRef      = useRef<HTMLElement | null>(null);
  const videoRef     = useRef<HTMLDivElement | null>(null);
  const headerRef    = useRef<HTMLElement | null>(null);
  const roleLabelRef = useRef<HTMLDivElement | null>(null);
  const showcaseRef  = useRef<HTMLDivElement | null>(null);
  const subtitleRef  = useRef<HTMLDivElement | null>(null);
  const nameRef      = useRef<HTMLHeadingElement | null>(null);
  const floatRef     = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── Intro Timeline ───────────────────────────────────────
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        delay: 0.3,
      });

      // 1. Video fade-in
      if (videoRef.current) {
        tl.to(videoRef.current, {
          opacity: 1,
          duration: 2,
          ease: 'power2.inOut',
        });
      }

      // 2. Header slides down
      if (headerRef.current) {
        tl.to(
          headerRef.current,
          {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: 'power3.out',
          },
          '-=1.4'
        );
      }

      // 3. Name reveal with cinematic zoom, fade, blur removal, and soft glow
      if (nameRef.current) {
        tl.fromTo(
          nameRef.current,
          {
            opacity: 0,
            scale: 0.95,
            filter: 'blur(20px)',
            y: 30,
            textShadow: '0 0 0px rgba(201, 97, 33, 0)'
          },
          {
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            y: 0,
            textShadow: '0 0 30px rgba(201, 97, 33, 0.25), 0 0 60px rgba(201, 97, 33, 0.1)',
            duration: 1.2,
            ease: 'power4.out',
            onComplete: () => {
              if (floatRef.current) {
                gsap.to(floatRef.current, {
                  y: -3,
                  duration: 3.5,
                  ease: 'sine.inOut',
                  yoyo: true,
                  repeat: -1,
                });
              }
            }
          },
          '-=0.7'
        );
      }

      // 4. Showcase card scales up
      if (showcaseRef.current) {
        tl.to(
          showcaseRef.current,
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 1.1,
            ease: 'power3.out',
          },
          '-=1.1'
        );
      }

      // 5. Role label fades in from left
      if (roleLabelRef.current) {
        tl.to(
          roleLabelRef.current,
          {
            opacity: 1,
            x: 0,
            duration: 1,
            ease: 'power3.out',
          },
          '-=0.9'
        );
      }

      // 6. Subtitle fades up
      if (subtitleRef.current) {
        tl.to(
          subtitleRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
          },
          '-=0.7'
        );
      }

      // ── Scroll-triggered parallax & fade ─────────────────────
      if (heroRef.current) {
        const bottomEl = heroRef.current.querySelector('.hero__bottom');
        const roleLabelEl = heroRef.current.querySelector('.hero__role-label');

        if (bottomEl) {
          gsap.to(bottomEl, {
            y: -80,
            opacity: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: heroRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: 0.8,
            },
          });
        }

        if (roleLabelEl) {
          gsap.to(roleLabelEl, {
            y: -40,
            opacity: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: heroRef.current,
              start: '5% top',
              end: '50% top',
              scrub: 0.8,
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
    roleLabelRef,
    showcaseRef,
    subtitleRef,
    nameRef,
    floatRef,
  };
}
