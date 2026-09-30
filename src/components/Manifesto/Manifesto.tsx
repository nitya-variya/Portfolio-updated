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
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Split text into word tokens
  const words = useMemo(() => {
    return text.trim().split(/\s+/);
  }, [text]);

  // Pre-calculate accent flags for fast frame-by-frame lookup
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

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prefersReducedMotion = mediaQuery.matches;

    // If reduced motion is requested, render final state immediately
    if (prefersReducedMotion) {
      wordRefs.current.forEach((el, i) => {
        if (!el) return;
        const isAccent = accentFlags[i];
        el.style.opacity = '1';
        el.style.filter = 'blur(0px) brightness(1)';
        el.style.transform = 'translateY(0px) scale(1)';
        el.style.textShadow = 'none';
        el.style.fontWeight = isAccent ? '640' : '560';
        el.style.fontVariationSettings = isAccent
          ? `'wght' 640, 'opsz' 80`
          : `'wght' 560, 'opsz' 80`;
        if (isAccent) {
          el.style.color = '#E07A38';
        }
      });
      return;
    }

    const totalWords = words.length;
    // Transition band width (~4% of progress for smooth stagger overlap)
    const band = 0.04;
    const denominator = Math.max(1, totalWords - 1);
    // Complete all words by 88% of the scroll window so the last words finish well before leaving view
    const maxActiveProg = 0.88;

    // Initial state: dim (~12%), thin weight (~300), ~6px blur, 10px down
    wordRefs.current.forEach((el, i) => {
      if (!el) return;
      el.style.opacity = '0.12';
      el.style.filter = 'blur(6px) brightness(1)';
      el.style.transform = 'translateY(10px) scale(1)';
      el.style.textShadow = 'none';
      el.style.fontWeight = '300';
      el.style.fontVariationSettings = `'wght' 300, 'opsz' 20`;
      if (accentFlags[i]) {
        el.style.color = '#F5F1E8';
      }
    });

    let targetProgress = 0;
    let currentProgress = 0;

    const renderWords = (prog: number) => {
      for (let i = 0; i < totalWords; i++) {
        const el = wordRefs.current[i];
        if (!el) continue;

        const isAccent = accentFlags[i];

        // Staggered threshold mapped so even the final word finishes by maxActiveProg
        const start = (i / denominator) * (maxActiveProg - band);
        const end = start + band;

        let localProgress = 0;
        if (prog <= start) {
          localProgress = 0;
        } else if (prog >= end) {
          localProgress = 1;
        } else {
          localProgress = (prog - start) / band;
        }

        // 1. Reveal transitions (0 -> 1)
        const opacity = 0.12 + 0.88 * localProgress;
        const blur = (1 - localProgress) * 6;
        const translateY = (1 - localProgress) * 10;
        const targetWght = isAccent ? 640 : 560;
        const wght = 300 + (targetWght - 300) * localProgress;
        const opsz = 20 + (80 - 20) * localProgress;

        // 2. Spark Effect: Sine curve peaking at midpoint (localProgress = 0.5)
        const spark = Math.sin(localProgress * Math.PI);
        const brightness = 1 + spark * (isAccent ? 0.45 : 0.3);
        const scale = 1 + spark * (isAccent ? 0.055 : 0.038);

        // Warm amber text-shadow glow during the spark flash
        let textShadow = 'none';
        if (spark > 0.02) {
          if (isAccent) {
            textShadow = `0 0 ${spark * 22}px rgba(224, 122, 56, ${spark * 0.95}), 0 0 ${
              spark * 44
            }px rgba(201, 97, 33, ${spark * 0.6}), 0 0 ${spark * 8}px rgba(255, 245, 230, ${
              spark * 0.85
            })`;
          } else {
            textShadow = `0 0 ${spark * 14}px rgba(201, 97, 33, ${spark * 0.7}), 0 0 ${
              spark * 28
            }px rgba(201, 97, 33, ${spark * 0.35})`;
          }
        }

        // Apply styles directly to avoid React state overhead
        el.style.opacity = opacity.toFixed(3);
        el.style.filter = `blur(${blur.toFixed(2)}px) brightness(${brightness.toFixed(3)})`;
        el.style.transform = `translateY(${translateY.toFixed(2)}px) scale(${scale.toFixed(4)})`;
        el.style.textShadow = textShadow;
        el.style.fontWeight = `${Math.round(wght)}`;
        el.style.fontVariationSettings = `'wght' ${Math.round(wght)}, 'opsz' ${Math.round(opsz)}`;

        if (isAccent) {
          if (localProgress >= 0.95) {
            el.style.color = '#E07A38';
          } else if (localProgress > 0) {
            el.style.color = `rgba(${Math.round(245 - 20 * localProgress)}, ${Math.round(
              241 - 119 * localProgress
            )}, ${Math.round(232 - 176 * localProgress)}, 1)`;
          } else {
            el.style.color = '#F5F1E8';
          }
        }
      }
    };

    const ctx = gsap.context(() => {
      // ScrollTrigger: start as section enters lower screen (top 75%), finish while section is comfortably centered (center 45%)
      ScrollTrigger.create({
        trigger: section,
        start: 'top 75%',
        end: 'center 45%',
        scrub: true,
        onUpdate: (self) => {
          targetProgress = self.progress;
        },
      });

      // Lerp smoothed animation ticker (responsive factor ~0.18 for smooth & timely reveal)
      const tick = () => {
        const diff = targetProgress - currentProgress;
        if (Math.abs(diff) > 0.0001) {
          currentProgress += diff * 0.18;
          renderWords(currentProgress);
        } else if (currentProgress !== targetProgress) {
          currentProgress = targetProgress;
          renderWords(currentProgress);
        }
      };

      gsap.ticker.add(tick);

      return () => {
        gsap.ticker.remove(tick);
      };
    }, section);

    return () => {
      ctx.revert();
    };
  }, [words, accentFlags]);

  return (
    <section
      className="manifesto-section"
      ref={sectionRef}
      id="manifesto"
      aria-label="Manifesto"
    >
      <div className="manifesto-container" ref={containerRef}>
        <p className="manifesto-text">
          {words.map((word, i) => (
            <span
              key={`${word}-${i}`}
              ref={(el) => {
                wordRefs.current[i] = el;
              }}
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
