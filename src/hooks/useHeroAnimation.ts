import { useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface UseHeroAnimationReturn {
  heroRef: React.RefObject<HTMLElement | null>;
  videoRef: React.RefObject<HTMLDivElement | null>;
  headerRef: React.RefObject<HTMLElement | null>;
  subtitleRef: React.RefObject<HTMLDivElement | null>;
  nameRef: React.RefObject<HTMLHeadingElement | null>;
  floatRef: React.RefObject<HTMLSpanElement | null>;
  /** Call this after the preloader finishes to trigger hero reveal animations */
  triggerHeroReveal: () => void;
}

export function useHeroAnimation(): UseHeroAnimationReturn {
  const heroRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const subtitleRef = useRef<HTMLDivElement | null>(null);
  const nameRef = useRef<HTMLHeadingElement | null>(null);
  const floatRef = useRef<HTMLSpanElement | null>(null);

  /**
   * Deferred hero reveal — called by Hero.tsx once the preloader
   * logo has returned to its native position and the dark overlay
   * has faded out.
   */
  const triggerHeroReveal = useCallback(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: {
          ease: 'power3.out',
          force3D: true,
        },
      });

      // Reveal the background video
      if (videoRef.current) {
        gsap.set(videoRef.current, { willChange: 'opacity' });
        tl.to(videoRef.current, {
          autoAlpha: 1,
          duration: 1.6,
          ease: 'power2.inOut',
          onComplete: () => {
            gsap.set(videoRef.current, { willChange: 'auto' });
          },
        });
      }

      // Reveal the header (it's already visible via the loader,
      // but autoAlpha handles the initial CSS hidden state)
      // Header is already visible & positioned by the preloader's gsap.set,
      // so we don't re-animate it here — doing so would cause a y-jump.

      // Reveal hero name
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

      // Reveal subtitle
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

      // Scroll-scrub bottom section
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
              scrub: true,
            },
          });
        }
      }
    }, heroRef);

    // Return a cleanup function (not strictly needed here since it's one-shot,
    // but good practice)
    return () => ctx.revert();
  }, []);

  return {
    heroRef,
    videoRef,
    headerRef,
    subtitleRef,
    nameRef,
    floatRef,
    triggerHeroReveal,
  };
}
