/**
 * RockSequence – Apple-style scroll-driven image sequence section.
 *
 * Background Marquee:
 *  - Large, low-opacity editorial text ("CRAFT — PROCESS — INTENTION") scrolling continuously in the background
 *  - Gives luxury depth behind the stone animation
 *
 * Text system:
 *  - Personal copy in 3 phases with clip-path line wipe (translateY from overflow:hidden mask)
 *  - Staggered per-line timing, zero React state, all via direct DOM mutation in onUpdate
 *
 * Performance:
 *  - Canvas redraws only when frame index changes (zero wasted draws)
 *  - Direct el.style mutations for text updates
 */
import { useRef, useLayoutEffect, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useImageSequence, TOTAL_FRAMES } from '../../hooks/useImageSequence';
import './RockSequence.scss';

gsap.registerPlugin(ScrollTrigger);

// ── Editorial copy ────────────────────────────────────────────────────────────
const TEXT_PANELS = [
  {
    id: 'begin',
    label: 'Raw.',
    lines: [
      "I don't start with polish.",
      "I start with an honest problem.",
    ],
    enterAt: 0.0,
    exitAt: 0.34,
  },
  {
    id: 'middle',
    label: 'Refined.',
    lines: [
      "Then I shape it —",
      "obsessively, quietly,",
      "until it feels inevitable.",
    ],
    enterAt: 0.34,
    exitAt: 0.68,
  },
  {
    id: 'end',
    label: 'Done.',
    lines: [
      "The result speaks",
      "without explanation.",
    ],
    enterAt: 0.68,
    exitAt: 1.0,
  },
] as const;

// ── Easing helpers ────────────────────────────────────────────────────────────
function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// ── Canvas drawing ────────────────────────────────────────────────────────────
// Enhanced scale (1.35x) logic — centered, prominent rock presentation.
function drawFrame(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number
) {
  const imgAR    = img.naturalWidth / img.naturalHeight;
  const canvasAR = w / h;
  const SCALE    = 1.35; // Enlarge rock by 35% for maximum impact

  let drawW: number, drawH: number;

  if (imgAR > canvasAR) {
    drawW = w * SCALE;
    drawH = (w / imgAR) * SCALE;
  } else {
    drawH = h * SCALE;
    drawW = (h * imgAR) * SCALE;
  }

  const offsetX = (w - drawW) / 2;
  const offsetY = (h - drawH) / 2;

  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function RockSequence() {
  const sectionRef  = useRef<HTMLElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const marqueeRef  = useRef<HTMLDivElement>(null);

  // Panel containers — opacity controlled by JS
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  // lineRefs[panelIndex][lineIndex] → <span> that wipes up from overflow:hidden
  const lineRefs = useRef<(HTMLSpanElement | null)[][]>(
    Array.from({ length: TEXT_PANELS.length }, () => [])
  );

  const { imagesRef, isReady } = useImageSequence();
  const lastFrameRef = useRef<number>(-1);

  // ── DPR-aware canvas resize ───────────────────────────────────────────────
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w   = window.innerWidth;
    const h   = window.innerHeight;
    canvas.width        = w * dpr;
    canvas.height       = h * dpr;
    canvas.style.width  = `${w}px`;
    canvas.style.height = `${h}px`;
    lastFrameRef.current = -1; // force redraw at new size
  }, []);

  // ── Main effect ───────────────────────────────────────────────────────────
  useLayoutEffect(() => {
    if (!isReady) return;

    const section = sectionRef.current;
    const canvas  = canvasRef.current;
    if (!section || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    resizeCanvas();

    const images       = imagesRef.current;
    const lastFrameIdx = TOTAL_FRAMES - 1;

    // Apply DPR scale once — drawImage coordinates stay in CSS pixels
    const applyDPR = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    applyDPR();

    // Draw frame 0 immediately — no blank flash on mount
    lastFrameRef.current = 0;
    drawFrame(ctx, images[0], window.innerWidth, window.innerHeight);

    // ── Initial DOM states ────────────────────────────────────────────────────
    panelRefs.current.forEach((el, i) => {
      if (!el) return;
      el.style.opacity = i === 0 ? '1' : '0';
    });

    lineRefs.current.forEach(panelLines => {
      panelLines.forEach(el => {
        if (el) el.style.transform = 'translateY(105%)';
      });
    });

    const proxy = { frame: 0 };

    const gsapCtx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 0.8,
          start: 'top top',
          end: '+=300%',
          anticipatePin: 1,

          onUpdate: (self) => {
            const p = self.progress; // 0 → 1

            // ── Canvas: advance image sequence ──────────────────────────────
            const newFrameIdx = Math.max(0, Math.min(lastFrameIdx, Math.round(p * lastFrameIdx)));
            if (newFrameIdx !== lastFrameRef.current && images[newFrameIdx]?.complete) {
              lastFrameRef.current = newFrameIdx;
              drawFrame(ctx, images[newFrameIdx], window.innerWidth, window.innerHeight);
            }

            // ── Scroll-driven directional marquee offset ──────────────────────
            // Adds smooth scroll-directional offset on top of default infinite loop
            // Scroll DOWN (0 → 1): accelerates Right-to-Left (-px offset)
            // Scroll UP   (1 → 0): reverses Left-to-Right (+px offset)
            if (marqueeRef.current) {
              const xOffset = (p * -450).toFixed(2);
              marqueeRef.current.style.transform = `translate3d(${xOffset}px, 0, 0)`;
            }

            // ── Text panels ──────────────────────────────────────────────────
            TEXT_PANELS.forEach((panel, i) => {
              const panelEl    = panelRefs.current[i];
              const panelLines = lineRefs.current[i];
              if (!panelEl) return;

              const { enterAt, exitAt } = panel;
              const isFirst = i === 0;
              const isLast  = i === TEXT_PANELS.length - 1;

              let panelOpacity = 0;
              if (p >= enterAt && p < exitAt) {
                const CROSS   = 0.04;
                const fadeIn  = isFirst ? 1 : Math.min(1, (p - enterAt) / CROSS);
                const fadeOut = isLast  ? 1 : Math.min(1, (exitAt  - p) / CROSS);
                panelOpacity  = Math.min(fadeIn, fadeOut);
              }
              panelEl.style.opacity = panelOpacity.toFixed(4);

              // Per-line wipe reveal
              const REVEAL_FRAC  = 0.22;
              const STAGGER_FRAC = 0.10;
              const panelWindow  = exitAt - enterAt;
              const relP         = (p - enterAt) / panelWindow;

              panelLines?.forEach((el, li) => {
                if (!el) return;
                if (p < enterAt) {
                  el.style.transform = 'translateY(105%)';
                  return;
                }
                const lineStart = li * STAGGER_FRAC;
                const lineP     = Math.max(0, Math.min(1, (relP - lineStart) / REVEAL_FRAC));
                const eased     = easeInOut(lineP);
                el.style.transform = `translateY(${((1 - eased) * 105).toFixed(2)}%)`;
              });
            });
          },
        },
      });

      tl.to(proxy, { frame: lastFrameIdx, ease: 'none', duration: 1 });
    }, section);

    // ── Resize ───────────────────────────────────────────────────────────────
    const handleResize = () => {
      resizeCanvas();
      applyDPR();
      const fi = Math.max(0, Math.min(lastFrameIdx, lastFrameRef.current));
      if (images[fi]?.complete) {
        drawFrame(ctx, images[fi], window.innerWidth, window.innerHeight);
      }
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      gsapCtx.revert();
    };
  }, [isReady, imagesRef, resizeCanvas]);

  return (
    <section
      ref={sectionRef}
      className="rs_section"
      id="rock-sequence"
      aria-label="Project philosophy — stone animation"
    >
      {/* Background Marquee — low opacity luxury depth text */}
      <div className="rs_marquee_wrapper" aria-hidden="true">
        <div ref={marqueeRef} className="rs_marquee_track">
          <div className="rs_marquee_content">
            CRAFT &nbsp;—&nbsp; PROCESS &nbsp;—&nbsp; INTENTION &nbsp;—&nbsp; CRAFT &nbsp;—&nbsp; PROCESS &nbsp;—&nbsp; INTENTION &nbsp;—&nbsp;
          </div>
          <div className="rs_marquee_content">
            CRAFT &nbsp;—&nbsp; PROCESS &nbsp;—&nbsp; INTENTION &nbsp;—&nbsp; CRAFT &nbsp;—&nbsp; PROCESS &nbsp;—&nbsp; INTENTION &nbsp;—&nbsp;
          </div>
        </div>
      </div>

      {/* 2D Canvas — the only rendering surface */}
      <canvas ref={canvasRef} className="rs_canvas" aria-hidden="true" />

      {/* Loading state */}
      {!isReady && (
        <div className="rs_loader" aria-live="polite" aria-label="Loading animation">
          <div className="rs_loader__bar">
            <div className="rs_loader__fill" />
          </div>
        </div>
      )}

      {/* Editorial text panels */}
      <div className="rs_text_stage" aria-hidden="true">
        {TEXT_PANELS.map((panel, i) => (
          <div
            key={panel.id}
            ref={(el) => (panelRefs.current[i] = el)}
            className="rs_panel"
          >
            <span className="rs_panel__label">{panel.label}</span>

            <div className="rs_lines">
              {panel.lines.map((line, li) => (
                <div key={li} className="rs_line_wrap">
                  <span
                    ref={(el) => (lineRefs.current[i][li] = el)}
                    className="rs_line_inner"
                  >
                    {line}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
