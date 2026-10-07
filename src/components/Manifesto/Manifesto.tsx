import { useLayoutEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Manifesto.scss';

gsap.registerPlugin(ScrollTrigger);

export interface ManifestoProps {
  text?: string;
  accentWords?: string[];
}

const DEFAULT_TEXT =
  "I build interfaces for problems nobody's shaped into code yet. Five years into this, I stopped treating frontend as decoration and started treating it as infrastructure: the layer where an idea either earns trust in three seconds, or loses it.";

const DEFAULT_ACCENTS = ["infrastructure:", "trust"];

const cleanToken = (w: string) => w.toLowerCase().replace(/[^a-z0-9:]/g, '');

export default function Manifesto({
  text = DEFAULT_TEXT,
  accentWords = DEFAULT_ACCENTS,
}: ManifestoProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const wordRefs   = useRef<(HTMLSpanElement | null)[]>([]);

  const words = useMemo(() => text.trim().split(/\s+/), [text]);

  const accentFlags = useMemo(() => {
    const cleanAccents = accentWords.map(cleanToken);
    return words.map((w) => {
      const cw = cleanToken(w);
      return cleanAccents.some(
        (a) => cw === a || cw.startsWith(a) || (a.length > 3 && cw.includes(a))
      );
    });
  }, [words, accentWords]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const totalWords = words.length;

    // ── Set every word to grey + blurred on mount ────────────────────────────
    wordRefs.current.forEach((el, i) => {
      if (!el) return;
      el.style.color  = accentFlags[i]
        ? 'rgba(150, 75, 20, 0.45)'    // dull muted orange
        : 'rgba(255, 255, 255, 0.18)'; // dull grey
      el.style.filter = 'blur(5px)';
    });

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      wordRefs.current.forEach((el, i) => {
        if (!el) return;
        el.style.color  = accentFlags[i] ? '#C96121' : '#F5F1E8';
        el.style.filter = 'blur(0px)';
      });
      return;
    }

    // ── Single linear cursor sweeps word-by-word ─────────────────────────────
    // Each word gets a 1-unit wide transition window in "cursor space"
    const applyProgress = (progress: number) => {
      // cursor moves from 0 → totalWords as progress goes 0 → 1
      const cursor = progress * totalWords;

      for (let i = 0; i < totalWords; i++) {
        const el = wordRefs.current[i];
        if (!el) continue;

        // t: 0 = fully grey+blurred, 1 = fully white+sharp
        const t = Math.max(0, Math.min(1, cursor - i));

        // ── Blur: 5px → 0px ─────────────────────────────────────────────────
        el.style.filter = `blur(${(5 * (1 - t)).toFixed(2)}px)`;

        // ── Colour ───────────────────────────────────────────────────────────
        if (accentFlags[i]) {
          // Dull muted orange → vivid brand orange #C96121
          const r = Math.round(150 + (201 - 150) * t);
          const g = Math.round( 75 + ( 97 -  75) * t);
          const b = Math.round( 20 + ( 33 -  20) * t);
          const a = (0.45 + 0.55 * t).toFixed(2);
          el.style.color = `rgba(${r},${g},${b},${a})`;
        } else {
          // Grey → warm white #F5F1E8
          const r = Math.round(255 + (245 - 255) * t);
          const g = Math.round(255 + (241 - 255) * t);
          const b = Math.round(255 + (232 - 255) * t);
          const a = (0.18 + 0.82 * t).toFixed(3);
          el.style.color = `rgba(${r},${g},${b},${a})`;
        }
      }
    };

    applyProgress(0);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        // Start when section enters viewport
        start: 'top 85%',
        // Animation fully done when the section's bottom hits viewport bottom
        end: 'bottom bottom',
        scrub: 1.5,
        onUpdate: (self) => {
          applyProgress(self.progress);
        },
      });
    }, section);

    return () => ctx.revert();
  }, [words, accentFlags]);

  return (
    <section
      className="manifesto-section"
      ref={sectionRef}
      id="manifesto"
      aria-label="Manifesto"
    >
      <div className="manifesto-container">
        <p className="manifesto-text">
          {words.map((word, i) => (
            <span
              key={`${word}-${i}`}
              ref={(el) => { wordRefs.current[i] = el; }}
              className={`manifesto-word${accentFlags[i] ? ' manifesto-word--accent' : ''}`}
            >
              {word}
              {i < words.length - 1 ? ' ' : ''}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
