import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import jQuery from 'jquery';
import './Manifesto.scss';

gsap.registerPlugin(ScrollTrigger);

export default function Manifesto() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const textEl = textRef.current;
    if (!textEl) return;

    // ── jQuery Word Wrapping Logic (Ignoring Inline Icons) ──────────
    const container = jQuery(textEl);
    const contents = container.contents();
    const wrappedNodes: (string | HTMLElement)[] = [];

    contents.each(function () {
      if (this.nodeType === Node.TEXT_NODE) {
        // Text node: split words and wrap them
        const textVal = this.textContent || '';
        const words = textVal.split(/(\s+)/); // Preserve whitespace
        words.forEach((word) => {
          if (word.trim() === '') {
            wrappedNodes.push(word);
          } else {
            const span = document.createElement('span');
            span.className = 'scrub-word';
            span.textContent = word;
            wrappedNodes.push(span);
          }
        });
      } else if (this.nodeType === Node.ELEMENT_NODE) {
        const $el = jQuery(this);
        // Span or other element (e.g. hover-target)
        const textVal = $el.text();
        const words = textVal.split(/(\s+)/);
        words.forEach((word) => {
          if (word.trim() === '') {
            wrappedNodes.push(word);
          } else {
            const span = document.createElement('span');
            span.className = `scrub-word ${$el.attr('class') || ''}`;
            span.textContent = word;
            wrappedNodes.push(span);
          }
        });
      }
    });

    // Replace original content with wrapped structure
    container.empty();
    wrappedNodes.forEach((node) => {
      if (typeof node === 'string') {
        container.append(document.createTextNode(node));
      } else {
        container.append(node);
      }
    });


    // ── GSAP ScrollTrigger Sequence (Pinning & Gradient Reveal) ──────
    gsap.to('.scrub-word', {
      scrollTrigger: {
        trigger: '.manifesto-section',
        start: 'top top',
        end: '+=1000px',
        scrub: 1,
        pin: true,
      },
      keyframes: [
        { color: '#FFFFFF', textShadow: '0px 0px 24px rgba(247, 180, 118, 1)', duration: 0.2, ease: 'power2.out' },
        { color: '#FFFFFF', textShadow: '0px 0px 0px rgba(255, 255, 255, 0)', duration: 0.8, ease: 'power2.inOut' }
      ],
      stagger: 0.1
    });


  }, []);

  return (
    <section
      ref={containerRef}
      className="manifesto-section"
      aria-label="Kinetic manifesto section"
    >
      <div className="manifesto-section__content">
        <p ref={textRef} className="manifesto-text">
          Engineering the front-end. Backing massive ambitions with uncompromising execution. I am
          Nitya. For three years, I have built highly
          interactive realms through pure technical execution. Whether orchestrating complex web
          interfaces or structuring custom digital architecture, my confidence is built on control.
          Premium quality. Zero compromise. Absolute precision.
        </p>
      </div>
    </section>
  );
}
