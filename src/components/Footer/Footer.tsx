import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import './Footer.scss';

gsap.registerPlugin(ScrollTrigger);

// ── Data ──────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: 'Journey', href: '#about' },
  { label: 'Craft', href: '#work' },
  { label: 'Work', href: '#journal' },
  { label: 'Connect', href: '#contact' },
];

const SOCIAL_LINKS = [
  { label: 'Instagram', href: '#' },
  { label: 'LinkedIn', href: '#' },
  { label: 'X / Twitter', href: '#' },
  { label: 'Dribbble', href: '#' },
];

const LEGAL_LINKS = [
  { label: 'Privacy', href: '#' },
  { label: 'Terms', href: '#' },
];

const SIGNATURE = 'NITYA VARIYA';

// ── Footer Component ──────────────────────────────────────────
export default function Footer() {
  const footerRef = useRef<HTMLElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const fillRef = useRef<HTMLHeadingElement | null>(null);
  const [localTime, setLocalTime] = useState('');

  // ── Live clock ────────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      setLocalTime(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }),
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── ScrollTrigger: outline → fill reveal ──────────────────
  useGSAP(
    () => {
      if (!fillRef.current) return;

      gsap.fromTo(
        fillRef.current,
        { clipPath: 'inset(100% 0 0 0)' },
        {
          clipPath: 'inset(0% 0 0 0)',
          ease: 'none',
          scrollTrigger: {
            trigger: '.footer__signature',
            start: 'top 95%',
            end: 'bottom 95%',
            scrub: 0.6,
          },
        },
      );
    },
    { scope: footerRef },
  );

  // ── Magnetic hover on grid links ──────────────────────────
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const isDesktop = window.matchMedia(
      '(hover: hover) and (pointer: fine)',
    ).matches;
    if (!isDesktop) return;

    const links = grid.querySelectorAll<HTMLElement>('.footer__link');

    const onMove = (e: Event) => {
      const me = e as MouseEvent;
      const el = me.currentTarget as HTMLElement;
      const rect = el.getBoundingClientRect();
      
      // Subtract active GSAP transforms to avoid feedback loops as the element moves
      const currentX = gsap.getProperty(el, 'x') as number || 0;
      const currentY = gsap.getProperty(el, 'y') as number || 0;
      
      const x = me.clientX - (rect.left - currentX) - rect.width / 2;
      const y = me.clientY - (rect.top - currentY) - rect.height / 2;

      gsap.to(el, {
        x: x * 0.35,
        y: y * 0.4,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const onLeave = (e: Event) => {
      gsap.to(e.currentTarget as HTMLElement, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: 'elastic.out(1, 0.3)',
      });
    };

    links.forEach((link) => {
      link.addEventListener('mousemove', onMove, { passive: true });
      link.addEventListener('mouseleave', onLeave);
    });

    return () => {
      links.forEach((link) => {
        link.removeEventListener('mousemove', onMove);
        link.removeEventListener('mouseleave', onLeave);
        gsap.killTweensOf(link);
      });
    };
  }, []);

  // ── Timezone label ────────────────────────────────────────
  const tzCity =
    Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop()?.replace(/_/g, ' ') ?? '';

  // ── Render ────────────────────────────────────────────────
  return (
    <footer ref={footerRef} className="footer" id="footer">
      {/* ── Top Grid ──────────────────────────────────────── */}
      <div ref={gridRef} className="footer__grid">
        {/* Navigation */}
        <div className="footer__col">
          <span className="footer__col-label">Navigation</span>
          <ul className="footer__col-list">
            {NAV_LINKS.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="footer__link">{l.label}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Socials */}
        <div className="footer__col">
          <span className="footer__col-label">Connect</span>
          <ul className="footer__col-list">
            {SOCIAL_LINKS.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="footer__link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Local Time */}
        <div className="footer__col">
          <span className="footer__col-label">Local Time</span>
          <div className="footer__time">
            <span className="footer__time-value">{localTime}</span>
            <span className="footer__time-zone">{tzCity}</span>
          </div>
        </div>

        {/* Legal */}
        <div className="footer__col">
          <span className="footer__col-label">Legal</span>
          <ul className="footer__col-list">
            {LEGAL_LINKS.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="footer__link">{l.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Massive Signature ─────────────────────────────── */}
      <div className="footer__signature">
        <div className="footer__name-wrapper">
          {/* Outline — always visible */}
          <span
            className="footer__name footer__name--outline"
            aria-hidden="true"
          >
            {SIGNATURE}
          </span>

          {/* Fill — revealed bottom→top by ScrollTrigger */}
          <h2
            ref={fillRef}
            className="footer__name footer__name--fill"
          >
            {SIGNATURE}
          </h2>
        </div>
      </div>

      {/* ── Bottom Bar ────────────────────────────────────── */}
      <div className="footer__bar">
        <span>© {new Date().getFullYear()} Nitya Variya</span>
        <span>All rights reserved</span>
      </div>
    </footer>
  );
}
