import { motion } from 'framer-motion';
import gsap from 'gsap';
import { useHeroAnimation } from '../../hooks/useHeroAnimation';
import video from './Hero_video.mp4';
import logoSvg from '../../assets/logo.svg';
import './Hero.scss';

// ── Data ───────────────────────────────────────────────────────
const NAV_LEFT = [
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#work' },
];

const NAV_RIGHT = [
  { label: 'Journal', href: '#journal' },
  { label: 'Contact', href: '#contact' },
];

const SOCIAL = [
  { label: 'Email', href: 'mailto:hello@nitya.dev' },
  { label: 'In', href: '#' },
  { label: 'X', href: '#' },
];

const VIDEO_SRC = video;

// ── Hero Component ─────────────────────────────────────────────
export default function Hero() {
  const {
    heroRef,
    videoRef,
    headerRef,
    roleLabelRef,
    subtitleRef,
    nameRef,
    floatRef,
  } = useHeroAnimation();

  // Gentle hover transitions for scale and glowing shadow
  const handleMouseEnter = () => {
    if (nameRef.current) {
      gsap.to(nameRef.current, {
        scale: 1.02,
        textShadow: '0 0 45px rgba(201, 97, 33, 0.45), 0 0 90px rgba(201, 97, 33, 0.20)',
        duration: 0.6,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }
  };

  const handleMouseLeave = () => {
    if (nameRef.current) {
      gsap.to(nameRef.current, {
        scale: 1.0,
        textShadow: '0 0 30px rgba(201, 97, 33, 0.25), 0 0 60px rgba(201, 97, 33, 0.10)',
        duration: 0.6,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }
  };

  return (
    <section
      ref={heroRef}
      className="hero"
      id="hero"
      aria-label="Hero — Nitya Variya, Freelance Design Director"
    >
      {/* ── Background Video ──────────────────────────────────── */}
      <div ref={videoRef} className="hero__video-container">
        <video
          className="hero__video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
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
            <motion.a
              key={link.label}
              href={link.href}
              className="hero__nav-link"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              {link.label}
            </motion.a>
          ))}

          <div className="hero__nav-logo">
            <img src={logoSvg} alt="Nitya Variya logo" />
          </div>

          {NAV_RIGHT.map((link) => (
            <motion.a
              key={link.label}
              href={link.href}
              className="hero__nav-link"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              {link.label}
            </motion.a>
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

      {/* ── Role Label ────────────────────────────────────────── */}
      <div ref={roleLabelRef} className="hero__role-label">
        <span>Brand & Web</span>
        <span>Design Specialist</span>
      </div>

      {/* ── Bottom: Name + Showcase ───────────────────────────── */}
      <div className="hero__bottom">
        <div className="hero__name-row">
          <h1
            ref={nameRef}
            className="hero__name hero-name"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <span ref={floatRef} className="hero-name__float">
              <span className="hero__name-first">
                <span className="hero__name-inner">
                  NITYA
                </span>
              </span>

              <span className="hero__name-last">
                <span className="hero__name-inner">
                  VARIYA
                </span>
              </span>
            </span>
          </h1>
        </div>

        {/* ── Designation ─────────────────────────────────────── */}
        <div ref={subtitleRef} className="hero__designation">
          <span className="hero__designation-dash" />
          <span className="hero__designation-text">
            Designing Digital Experiences That Drive Business Growth
          </span>
          <span className="hero__designation-dash" />
        </div>
      </div>
    </section>
  );
}
