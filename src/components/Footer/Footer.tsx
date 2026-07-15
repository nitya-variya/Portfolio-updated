import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import jQuery from 'jquery';
import mountainImg from '../../assets/Mountain.png';
import flowerImg from '../../assets/Flower.png';

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  useEffect(() => {
    const mountainEl = jQuery('.parallax-footer__mountains').get(0);
    const flowerEl = jQuery('.parallax-footer__flowers').get(0);

    if (mountainEl) {
      gsap.fromTo(
        mountainEl,
        { y: 0 },
        {
          y: -100,
          ease: 'none',
          scrollTrigger: {
            trigger: '.parallax-footer',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          },
        }
      );
    }

    if (flowerEl) {
      gsap.fromTo(
        flowerEl,
        { y: -50 },
        {
          y: 50,
          ease: 'none',
          scrollTrigger: {
            trigger: '.parallax-footer',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.8,
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <footer className="parallax-footer" id="footer" aria-label="Site footer">

      {/* ── Layer 3: Distant Mountains (z-index 2) ─────────────────── */}
      <div
        className="parallax-footer__mountains"
        style={{ backgroundImage: `url(${mountainImg})` }}
        aria-hidden="true"
      />

      {/* ── Layer 4: Massive Typography (z-index 3) ────────────────── */}
      {/* <div className="parallax-footer__headline" aria-hidden="true">
        THE FINAL PIXEL.
      </div> */}

      {/* ── Layer 5: Foreground Flowers (z-index 4) ────────────────── */}
      <div
        className="parallax-footer__flowers"
        style={{ backgroundImage: `url(${flowerImg})` }}
        aria-hidden="true"
      />

      {/* ── Layer 2: Telemetry HUD (z-index 10) ────────────────────── */}
      <div className="parallax-footer__hud" aria-label="HUD telemetry overlay">

        {/* Left — Narrative Hook */}
        <div className="parallax-footer__hud-left">
          <span className="hud-viewport-label">[ VIEWPORT: END ]</span>
          <p className="hud-narrative">
            No relative measures.<br />Absolute precision.
          </p>
        </div>

        {/* Right — Grid */}
        <div className="parallax-footer__hud-right" aria-label="Contact and network grid">
          <div className="hud-grid-col">
            <span className="hud-grid-col__header">LOCAL_SYS</span>
            <span className="hud-grid-col__value">Surat, IN</span>
            <span className="hud-grid-col__value">IST (+5:30)</span>
          </div>
          <div className="hud-grid-col">
            <span className="hud-grid-col__header">TRANSMIT</span>
            <a
              href="mailto:hello@nitya.dev"
              className="hud-grid-col__link"
              aria-label="Send email"
            >
              hello@nitya.dev
            </a>
          </div>
          <div className="hud-grid-col">
            <span className="hud-grid-col__header">NETWORK</span>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hud-grid-col__link"
              aria-label="LinkedIn profile"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hud-grid-col__link"
              aria-label="GitHub profile"
            >
              GitHub
            </a>
          </div>
        </div>

      </div>

    </footer>
  );
}
