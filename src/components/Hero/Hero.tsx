import { useEffect } from "react";
import gsap from "gsap";
import { useHeroAnimation } from "../../hooks/useHeroAnimation";
import video from "./Hero_video.mp4";
import logoSvg from "../../assets/logo.svg";
import "./Hero.scss";

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
  { label: "Email", href: "mailto:hello@nitya.dev" },
  { label: "In", href: "#" },
  { label: "X", href: "#" },
];

const VIDEO_SRC = video;

// ── Hero Component ─────────────────────────────────────────────
export default function Hero() {
  const {
    heroRef,
    videoRef,
    headerRef,
    subtitleRef,
    nameRef,
    floatRef,
  } = useHeroAnimation();

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

      // ✅ FIX: Convert viewport coords → element-relative coords
      const rect = el.getBoundingClientRect();
      const relX = currentX - rect.left;
      const relY = currentY - rect.top;

      gsap.set(el, {
        "--light-x": `${relX}px`,
        "--light-y": `${relY}px`,
      });
    };

    gsap.ticker.add(tick);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      gsap.ticker.remove(tick);
    };
  }, [nameRef]);

  return (
    <section
      ref={heroRef}
      className="hero"
      id="hero"
      aria-label="Hero — Crafting Digital Worlds With Purpose"
    >
      {/* ── Background Video ──────────────────────────────────── */}
      <div ref={videoRef} className="hero__video-container">
        <video
          className="hero__video"
          autoPlay
          muted
          loop
          playsInline
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
            <a
              key={link.label}
              href={link.href}
              className="hero__nav-link"
            >
              {link.label}
            </a>
          ))}

          <div className="hero__nav-logo">
            <img src={logoSvg} alt="Nitya Variya logo" />
          </div>

          {NAV_RIGHT.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hero__nav-link"
            >
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
      </header>

      {/* ── Bottom: Headline + Subheadline ────────────────────── */}
      <div className="hero__bottom">
        <div className="hero__name-row">
          <h1
            ref={nameRef}
            className="hero__name hero-name"
          >
            <span ref={floatRef} className="hero-name__float">
              <span className="hero__headline">
                <span className="hero__headline-line">Exploring New</span>
                <span className="hero__headline-line">
                  Realms Through <em>Code</em>
                </span>
              </span>
            </span>
          </h1>
        </div>

        {/* ── Subheadline ──────────────────────────────────────── */}
        <div ref={subtitleRef} className="hero__designation">
          <span className="hero__designation-dash" />
          <span className="hero__designation-text">
            Helping ambitious brands transform ideas into digital experiences
            that people remember.
          </span>
          <span className="hero__designation-dash" />
        </div>
      </div>
    </section>
  );
}
