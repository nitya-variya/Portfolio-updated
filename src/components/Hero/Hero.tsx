import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { useLenis } from "lenis/react";
import { useHeroAnimation } from "../../hooks/useHeroAnimation";
import video from "./Hero_video.mp4";

// ── Data ───────────────────────────────────────────────────────
const NAV_LEFT = [
  { label: "Journey", href: "#about" },
  { label: "Craft", href: "#work" },
];

const NAV_RIGHT = [
  { label: "Work", href: "#journal" },
  { label: "Connect", href: "#contact" },
];

const SOCIAL = [
  { label: "Email", href: "mailto:nityavariya045@gmail.com" },
  { label: "In", href: "https://www.linkedin.com/in/nitya-web-designer/" },
];

const VIDEO_SRC = video;

// Preloader logo display size (px).
// Centering CSS uses half this value (80px = 160 / 2).
const PRELOADER_LOGO_SIZE = 160;

// ── Hero Component ─────────────────────────────────────────────
export default function Hero() {
  const {
    heroRef,
    videoRef,
    headerRef,
    subtitleRef,
    nameRef,
    floatRef,
    triggerHeroReveal,
  } = useHeroAnimation();

  // ── Preloader overlay refs ─────────────────────────────────────
  const loaderBgRef = useRef<HTMLDivElement>(null);
  const counterValRef = useRef<HTMLSpanElement>(null);
  const counterWrapRef = useRef<HTMLDivElement>(null);

  // Logo refs
  // logoWrapRef    → centered animated SVG in fs_loader_bg (becomes the header logo)
  // logoSpacerRef  → empty div in header nav that reserves the slot & gives us the FLIP target rect
  const logoWrapRef = useRef<HTMLDivElement>(null);
  const logoSpacerRef = useRef<HTMLDivElement>(null);

  // SVG inner element refs
  const leftRectRef = useRef<SVGRectElement>(null);
  const middleRectRef = useRef<SVGRectElement>(null);
  const rightRectRef = useRef<SVGRectElement>(null);
  const squareRef = useRef<SVGPathElement>(null);

  // Get lenis instance for scroll locking
  const lenis = useLenis();

  // ── Mobile nav menu ────────────────────────────────────────────
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => {
      const next = !prev;
      if (next) {
        lenis?.stop();
        document.body.style.overflow = "hidden";
      } else {
        lenis?.start();
        document.body.style.overflow = "";
      }
      return next;
    });
  }, [lenis]);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
    lenis?.start();
    document.body.style.overflow = "";
  }, [lenis]);

  // ── GSAP SVG-Logo-Reveal + FLIP Preloader ─────────────────────
  useLayoutEffect(() => {
    const loaderBg = loaderBgRef.current;
    const counterVal = counterValRef.current;
    const counterWrap = counterWrapRef.current;
    const logoWrap = logoWrapRef.current;   // animated SVG — flies to header & stays
    const logoSpacer = logoSpacerRef.current;
    const leftRect = leftRectRef.current;
    const middleRect = middleRectRef.current;
    const rightRect = rightRectRef.current;
    const square = squareRef.current;

    if (
      !loaderBg || !counterVal || !counterWrap || !logoWrap || !logoSpacer ||
      !leftRect || !middleRect || !rightRect || !square
    ) return;

    // ── 0. Put header in its final layout position ─────────────────
    // Lock scrolling while the preloader is active (native + lenis)
    document.body.style.overflow = "hidden";
    lenis?.stop();

    if (headerRef.current) {
      gsap.set(headerRef.current, { autoAlpha: 1, y: 0 });
    }
    gsap.set([".hero__nav-link", ".hero__wordmark", ".hero__social-link", ".hero__social:not(.mobile-menu-btn)"], { opacity: 0 });

    // ── 1. Measure the FLIP destination ────────────────────────────
    const spacerRect = logoSpacer.getBoundingClientRect();
    const targetCX = spacerRect.left + spacerRect.width / 2;
    const targetCY = spacerRect.top + spacerRect.height / 2;
    const flipX = targetCX - window.innerWidth / 2;
    const flipY = targetCY - window.innerHeight / 2;
    const flipScale = spacerRect.width / PRELOADER_LOGO_SIZE;

    // ── 2. Init SVG mask rects to zero state ───────────────────────
    gsap.set(leftRect, { attr: { y: 71.4, height: 0 } });
    gsap.set(middleRect, { attr: { y: 28.6, height: 0 } });
    gsap.set(rightRect, { attr: { y: 71.4, height: 0 } });
    gsap.set(square, { opacity: 0, scale: 0.6, transformOrigin: "center center" });
    gsap.set(logoWrap, { x: 0, y: 0, scale: 1, transformOrigin: "center center" });

    // ── 3. Timing constants ────────────────────────────────────────
    const REVEAL = 0.32;
    const SQUARE = 0.22;
    const TOTAL = REVEAL * 3 + SQUARE;

    // ── 4. Build master timeline ───────────────────────────────────
    const tl = gsap.timeline({
      onComplete: () => {
        // ── FLIP / RELEASE ─────────────────────────────────────────
        gsap.to(counterWrap, { opacity: 0, duration: 0.3, ease: "power2.out" });

        gsap.to(logoWrap, {
          x: flipX,
          y: flipY,
          scale: flipScale,
          duration: 0.95,
          ease: "power3.inOut",
        });

        gsap.to(loaderBg, {
          opacity: 0,
          duration: 0.7,
          ease: "power2.inOut",
          onComplete: () => {
            loaderBg.style.display = "none";
            document.body.style.overflow = "";
            lenis?.start();
            triggerHeroReveal();
          },
        });

        gsap.to([".hero__nav-link", ".hero__wordmark", ".hero__social-link", ".hero__social:not(.mobile-menu-btn)"], {
          opacity: 1,
          pointerEvents: "auto",
          duration: 0.6,
          stagger: 0.06,
          delay: 0.35,
          ease: "power2.out",
        });
      },
    });

    // ── Counter ────────────────────────────────────────────────────
    const counter = { val: 0 };
    tl.to(counter, {
      val: 100,
      duration: TOTAL,
      ease: "power1.inOut",
      onUpdate: () => {
        counterVal.textContent = String(Math.round(counter.val));
      },
    }, 0);

    // ── Reveal Animations ──────────────────────────────────────────
    tl.fromTo(leftRect, { attr: { y: 71.4, height: 0 } }, { attr: { y: 28.6, height: 42.8 }, duration: REVEAL, ease: "power4.out" }, 0);
    tl.fromTo(middleRect, { attr: { height: 0 } }, { attr: { height: 42.8 }, duration: REVEAL, ease: "power4.out" }, REVEAL);
    tl.fromTo(rightRect, { attr: { y: 71.4, height: 0 } }, { attr: { y: 28.6, height: 42.8 }, duration: REVEAL, ease: "power4.out" }, REVEAL * 2);

    tl.to(square, { opacity: 1, scale: 1.15, duration: SQUARE * 0.7, ease: "cubic-bezier(0.22,1,0.36,1)" }, REVEAL * 3);
    tl.to(square, { scale: 1, duration: SQUARE * 0.3, ease: "power2.out" }, REVEAL * 3 + SQUARE * 0.7);

    return () => {
      tl.kill();
      document.body.style.overflow = "";
      lenis?.start();
    };
  }, [lenis]); // Re-run if lenis instance becomes available

  // ── Mouse-parallax light on hero name ─────────────────────────
  useEffect(() => {
    const isDesktop = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!isDesktop) return;

    const el = nameRef.current;
    if (!el) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const tick = () => {
      const ease = 0.07;
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;
      const r = el.getBoundingClientRect();
      gsap.set(el, {
        "--light-x": `${currentX - r.left}px`,
        "--light-y": `${currentY - r.top}px`,
      });
    };
    gsap.ticker.add(tick);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      gsap.ticker.remove(tick);
    };
  }, [nameRef]);

  // ── Header scroll background for mobile ───────────────────────
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const handleScroll = () => {
      if (window.scrollY > 60) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headerRef]);

  return (
    <section
      ref={heroRef}
      className="hero"
      id="hero"
      aria-label="Hero — Crafting Digital Worlds With Purpose"
    >
      {/* ── PRELOADER ─────────────────────────────────────────────── */}
      <div className="fs_loader_bg" ref={loaderBgRef}>
        {/* Invisible spacer matching the logo size so the CSS flex gap pushes the counter down perfectly */}
        <div style={{ height: "160px", flexShrink: 0 }} aria-hidden="true" />
        <div className="fs_loader_counter" ref={counterWrapRef}>
          <span className="fs_count_val" ref={counterValRef}>0</span>
          <span className="fs_count_sym">%</span>
        </div>
      </div>

      <div className="fs_logo_center_wrap" ref={logoWrapRef}>
        <svg
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          className="fs_actual_logo"
          aria-label="Nitya Variya logo"
        >
          <defs>
            <mask id="nv-leftMask">
              <rect ref={leftRectRef} x="17.9" y="71.4" width="24" height="0" fill="#fff" />
            </mask>
            <mask id="nv-middleMask">
              <rect ref={middleRectRef} x="41.46" y="28.6" width="11" height="0" fill="#fff" />
            </mask>
            <mask id="nv-rightMask">
              <rect ref={rightRectRef} x="52.16" y="71.4" width="24" height="0" fill="#fff" />
            </mask>
          </defs>

          <path mask="url(#nv-leftMask)" fill="#fff" d="M29.8572 71.4001H17.9277L29.5316 28.6001H41.4677L29.8572 71.4001Z" />
          <path mask="url(#nv-middleMask)" fill="#fff" d="M52.1668 28.6001H41.4668V71.4001H52.1668V28.6001Z" />
          <path mask="url(#nv-rightMask)" fill="#fff" d="M64.0976 71.4001H52.168L63.7786 28.6001H75.708L64.0976 71.4001Z" />

          <path
            ref={squareRef}
            fill="#C96121"
            opacity="0"
            d="M82.0723 64.98L82.063 71.3035H82.0723L75.6523 71.4V64.98H82.0723Z"
          />
        </svg>
      </div>

      {/* ── Mobile Nav Overlay ─────────────────────────────────── */}
      <div
        className={`mobile-nav-overlay${mobileMenuOpen ? " is-open" : ""}`}
        aria-hidden={!mobileMenuOpen}
        role="dialog"
        aria-label="Mobile navigation"
        id="mobile-nav"
      >
        {[...NAV_LEFT, ...NAV_RIGHT].map((link) => (
          <a
            key={link.label}
            href={link.href}
            onClick={closeMobileMenu}
          >
            {link.label}
          </a>
        ))}
        {SOCIAL.map((link) => (
          <a
            key={link.label}
            href={link.href}
            onClick={closeMobileMenu}
            style={{ fontSize: "clamp(1rem, 5vw, 1.4rem)", opacity: 0.45, letterSpacing: "0.08em" }}
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* ── Background Video ──────────────────────────────────── */}
      <div ref={videoRef} className="hero__video-container">
        <video
          className="hero__video"
          autoPlay muted loop playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
      </div>

      {/* ── Cinematic Overlay ─────────────────────────────────── */}
      <div className="hero__overlay" aria-hidden="true" />

      {/* ── Top Header ────────────────────────────────────────── */}
      <header ref={headerRef} className="hero__header">
        <span className="hero__wordmark">Nitya Variya</span>

        <nav className="hero__nav" aria-label="Primary navigation">
          {NAV_LEFT.map((link) => (
            <a key={link.label} href={link.href} className="hero__nav-link">
              {link.label}
            </a>
          ))}

          <div className="hero__nav-logo" ref={logoSpacerRef} aria-hidden="true" />

          {NAV_RIGHT.map((link) => (
            <a key={link.label} href={link.href} className="hero__nav-link">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hero__social">
          {SOCIAL.map((link) => (
            <a key={link.label} href={link.href} className="hero__social-link">
              {link.label}
            </a>
          ))}
        </div>

        {/* Mobile hamburger button */}
        <button
          className={`mobile-menu-btn${mobileMenuOpen ? " is-open" : ""}`}
          onClick={toggleMobileMenu}
          aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav"
          style={{ opacity: 1 }}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {/* ── Bottom: Headline + Subheadline ────────────────────── */}
      <div className="hero__bottom">
        <div className="hero__name-row">
          <h1 ref={nameRef} className="hero__name hero-name">
            <span ref={floatRef} className="hero-name__float">
              <span className="hero__headline">
                <span className="hero__headline-line">The View Changes.</span>
                <span className="hero__headline-line">The Quality Doesn't.</span>
              </span>
            </span>
          </h1>
        </div>

        {/* ── Subheadline ────────────────────────────────────── */}
        <div ref={subtitleRef} className="hero__designation">
          <span className="hero__designation-dash" />
          <span className="hero__designation-text">
            Frontend developer crafting motion-driven interfaces — new industries, new problems, same standard of craft.
          </span>
          <span className="hero__designation-dash" />
        </div>
      </div>
    </section>
  );
}
