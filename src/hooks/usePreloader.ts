import { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';

// ── Types ───────────────────────────────────────────────────────
interface UsePreloaderOptions {
  /** Fired after logo lands in header + overlay dissolves */
  onComplete: () => void;
  headerRef: React.RefObject<HTMLElement | null>;
}

export function usePreloader({ onComplete, headerRef }: UsePreloaderOptions) {
  const loaderRef  = useRef<HTMLDivElement  | null>(null);
  const counterRef = useRef<HTMLSpanElement | null>(null);

  // Stable ref — prevents stale closure inside nested GSAP callbacks
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    const loader  = loaderRef.current;
    const counter = counterRef.current;
    const header  = headerRef.current;
    if (!loader || !counter || !header) return;

    // ── Locate the real header logo wrapper ──────────────────────
    const logoWrap = header.querySelector<HTMLElement>('.hero__nav-logo');
    if (!logoWrap) return;

    // Everything in the header EXCEPT the logo wrapper
    const hideEls = [
      ...Array.from(header.querySelectorAll<HTMLElement>('.hero__wordmark')),
      ...Array.from(header.querySelectorAll<HTMLElement>('.hero__nav-link')),
      ...Array.from(header.querySelectorAll<HTMLElement>('.hero__social')),
    ];

    // ── 1. Capture natural rect BEFORE any transform ─────────────
    //    (header is fully visible at natural position — no CSS opacity/transform)
    const wrapRect = logoWrap.getBoundingClientRect();

    // ── 2. Pull logo out of hero stacking context via position:fixed ──
    //    Pinned at its exact current viewport position so nothing jumps.
    gsap.set(logoWrap, {
      position:        'fixed',
      top:             wrapRect.top,
      left:            wrapRect.left,
      width:           wrapRect.width,
      height:          wrapRect.height,
      margin:          0,
      zIndex:          10000,    // above fs_loader_master (9999) in ROOT stacking context
      transformOrigin: 'center center',
    });

    // ── 3. Scale it up + translate to viewport center ─────────────
    const BIG_PX    = 300;                                // desired preloader size (px)
    const bigScale  = BIG_PX / wrapRect.width;            // e.g. 300/50 = 6
    const cx = (window.innerWidth  / 2) - (wrapRect.left + wrapRect.width  / 2);
    const cy = (window.innerHeight / 2) - (wrapRect.top  + wrapRect.height / 2);

    gsap.set(logoWrap, { scale: bigScale, x: cx, y: cy });

    // ── 4. Hide other header items ────────────────────────────────
    gsap.set(hideEls, { autoAlpha: 0 });

    // ── 5. Position counter below the big logo (absolute in overlay) ──
    //    Big logo bottom = vh/2 + BIG_PX/2; add 28px gap
    const counterEl    = counter.parentElement!;
    const counterTopPx = Math.round(window.innerHeight / 2 + BIG_PX / 2 + 28);
    gsap.set(counterEl, {
      position:   'absolute',
      top:        counterTopPx,
      left:       '50%',
      xPercent:   -50,
      textAlign:  'center',
    });

    // ── Build master timeline ─────────────────────────────────────
    const counterProxy = { val: 0 };
    const masterTl = gsap.timeline();

    // Phase 1 — Counter 0 → 100 (2.5 s)
    masterTl.to(counterProxy, {
      val: 100,
      duration: 2.5,
      ease: 'power1.inOut',
      onUpdate() {
        if (counter) counter.textContent = String(Math.round(counterProxy.val));
      },
    });

    // Phase 2 — Fade counter out (0.3 s)
    masterTl.to(counterEl, { autoAlpha: 0, duration: 0.3, ease: 'power2.in' }, '+=0.05');

    // Phase 3 — Logo slides from center back to its natural header spot ──
    //   scale: 1, x: 0, y: 0  →  returns to top/left set above (== natural rect)
    masterTl.to(logoWrap, {
      scale:    1,
      x:        0,
      y:        0,
      duration: 1.1,
      ease:     'power3.inOut',
      force3D:  true,
      onComplete() {
        // ── Logo is now at its natural viewport coordinates.
        //    clearProps removes position:fixed — element snaps back to
        //    flex layout at the same visual position. Frame-perfect.
        gsap.set(logoWrap, { clearProps: 'all' });

        // Dissolve dark overlay
        gsap.to(loader, {
          autoAlpha: 0,
          duration:  0.45,
          ease:      'power2.inOut',
          onComplete() { gsap.set(loader, { display: 'none' }); },
        });

        // Fade in wordmark + nav-links + social with a stagger
        gsap.to(hideEls, {
          autoAlpha: 1,
          duration:  0.55,
          stagger:   0.07,
          ease:      'power2.out',
        });

        // Kick off hero content timeline (video, headline, subtitle)
        onCompleteRef.current();
      },
    }, '-=0.1');

    return () => { masterTl.kill(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setLoaderRef  = useCallback((el: HTMLDivElement  | null) => { loaderRef.current  = el; }, []);
  const setCounterRef = useCallback((el: HTMLSpanElement | null) => { counterRef.current = el; }, []);

  return { setLoaderRef, setCounterRef };
}
